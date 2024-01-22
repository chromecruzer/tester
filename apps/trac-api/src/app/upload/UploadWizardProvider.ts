import multer from 'multer';
import path from "path";
import {StatusCodes} from "http-status-codes";
import createHttpError = require("http-errors");
import {DateTime} from "luxon";
import _ from "lodash";
import {
  AuditRecord, Comparisons,
  InputToSqlMapping,
  uploadHeaders,
  UploadSupportedFileTypes
} from "@trac/datatypes";
import {LoadXlsxData, NotificationsServer, PostgresClient, tryCatch} from "@trac/postgresql";
import UploadManager from "../datastore/UploadManager";

import util from "util";
import {UploadAnalysisA} from "./UploadAnalysisA";
import {UploadTransformerA} from "./UploadTransformerA";
import {UploadCommitA} from "./UploadCommitA";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export type UploadResultsType = ((Comparisons | AuditRecord) | null);
const tokenHeader = uploadHeaders.tokenHeader;
const xlsxFilter = (req, file, callback) => {
  if (path.extname(file.originalname) === '.xlsx' || path.extname(file.originalname) === '.csv') {
    console.log(`checking xlsx file ${dump(file)}`);
    callback(null, true);
    return;
  }
  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `${file.originalname} is not a spreadsheet file ${path.extname(file.originalname)}`));
}

export class UploadWizardProvider {
  protected uploader;
  protected fileLoader: LoadXlsxData;


  constructor(public uploadManager: UploadManager, protected type: UploadSupportedFileTypes,
              protected transformer: UploadTransformerA, protected committer: UploadCommitA,
              protected dataAnalysis: UploadAnalysisA,
              protected ns = null as (NotificationsServer | null)) {
    this.uploader = multer({
      storage: multer.diskStorage({
        destination: this.fileDestination.bind(this),
        filename: this.fileName.bind(this),
      }),
      fileFilter: xlsxFilter
    });
    this.fileLoader = new LoadXlsxData(ns);
  }

  upload(postgresClient: PostgresClient, mapping: InputToSqlMapping[] = null) {
    return tryCatch(async (req, res, next) => {
      // console.log(`request with file ${dump(req)}`);
      const uploadedFile = req.file;
      const user = req.body[uploadHeaders.userField];
      if (this.ns) {
        this.ns.started(['iolUpload']);
      }
      // console.log(`uploaded file ${uploadedFile} with form ${dump(req.body)}`);
      const token = await this.uploadManager.addSession(uploadedFile.path,
        user, this.type, req.body);
      console.log(` token ${token} file path ${uploadedFile.path} type ${this.type}`)
      let uploadedData;
      if (mapping) {
        await this.fileLoader.readWithMap(uploadedFile.path, mapping);
        uploadedData = this.fileLoader.bulkData;
      } else {
        await this.fileLoader.scanForLotNumbers(uploadedFile.path);
        uploadedData = this.fileLoader.lotNumbers;
      }
      // console.log(`file contents ${this.fileLoader.bulkData}`);
      const client = await postgresClient.getClient();
      await this.transformer.transform(uploadedData,
        client, token, req.body);
      const analytics = await this.dataAnalysis.comparisons(token);
      await postgresClient.release(client);
      if (this.ns) {
        this.ns.completed(['iolUpload']);
      }
      res.setHeader(tokenHeader, token);
      res.json(analytics);
    })
  }

  protected fileDestination(req, file, callback) {// need the unused parameters for multer
    const dest = path.join(this.uploadManager.uploadPath, this.type);
    // console.log(`destination path is ${dest}`);
    callback(null, dest)
  }

  protected fileName(req, file, callback) {// need the unused parameters for multer
    const name = `${this.type}_${DateTime.now().toFormat('yyyy_MM_dd_hh_mm_ss')}.${_.endsWith(file.originalname,
      '.csv') ? 'csv' : 'xlsx'}`;
    // console.log(`destination filename is ${name} ${dump(file)}`);
    callback(null, name);
  }

  configuredMiddleware() {
    return this.uploader.single(uploadHeaders.fileField);
  }

  comparisons() {
    return tryCatch(async (req, res, next) => {
      const token = req.header(tokenHeader);
      // console.log(`token ${token} from ${dump(req.headers)}`)
      const result = _.isString(token) ? await this.dataAnalysis.comparisons(token) : null;
      if (result) {
        res.setHeader(tokenHeader, token);
        res.json(result);
      } else {
        const error = new Error(`need a session in the header ${uploadHeaders.tokenHeader} for token ${token}`);
        const httpError = createHttpError(400, error);
        next(httpError);
      }
    })
  }

  commit(postgresClient: PostgresClient) {
    // console.log('setting up commit');
    return tryCatch(async (req, res, next) => {
      const token = req.header(tokenHeader);
      // console.log(`commit started ${token}`);
      const client = await postgresClient.getClient();
      await this.committer.commit(token, client);
      // console.log('data committed');
      await postgresClient.release(client);
      // console.log('release client')
      await this.uploadManager.archiveSession(token)
        .catch(err => console.error(`archiver error ${dump(err)}`));
      // console.log('setting status to ok');
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }

  cancel() {
    return tryCatch(async (req, res) => {
      const token = req.header(tokenHeader);
      await this.uploadManager.removeSession(token, true);
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }
}
