import {docxTemplateFn, htmlTemplateFn, tryCatch} from "@trac/postgresql";
import {StatusCodes} from "http-status-codes";
import multer from "multer";
import path from "path";
import {getDataFields, initialEmailSettings, uploadHeaders} from "@trac/datatypes";
import util from "util";
import fs from "fs-extra";
import mammoth from "mammoth";
import _ from "lodash";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});


const docxFilter = (req, file, callback) => {
  if (path.extname(file.originalname) === '.docx') {
    console.log(`checking docx file ${dump(file)}`);
    callback(null, true);
    return;
  }
  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `
  ${file.originalname} is not a word file ${path.extname(file.originalname)}`));
}

export default class ChangeSettings {
  private uploader;
  constructor(private apiConfig, private settings) {
    this.uploader = multer({
      storage: multer.diskStorage({
        destination: this.fileDestination.bind(this),
        filename: this.fileName.bind(this),
      }),
      fileFilter: docxFilter
    });
  }

  public upload(createEmail) {
  return tryCatch(async (req, res, next) => {
    const templateType = req.body[getDataFields.emailTemplateType];
    console.log(`replacing template for ${templateType} setting up...`);
    await this.setupTemplate(templateType);
    console.log(`setup finished reloading template...`);
    await createEmail.loadTemplate(templateType);
    console.log('returning status')
    res.status(StatusCodes.OK);
    res.send('OK');
  });
  }
  public changeEmailSettings () {
    return tryCatch(async (req, res, next) => {
      console.log(`changing settings to ${dump(req.body)} with ${this.settings}`)
      await this.settings.setEmailSetting(req.body[getDataFields.settings]);
      res.status(StatusCodes.OK);
      res.send('OK');
    });
  }
  public getEmailSetting () {
    return tryCatch(async (req, res, next) => {
      const emailSettings = await this.settings.getEmailSetting();
      if(!_.has(emailSettings, 'server')) {
        emailSettings.server = initialEmailSettings.server; // For servers that need to be upgraded
      }
      console.log(`retrieved email settings ${dump(emailSettings)}`)
      res.json(emailSettings);
    })
  }
  protected fileDestination(req, file, callback) {// need the unused parameters for multer
    const dest = this.apiConfig.templatesPath;
    // console.log(`destination path is ${dest} from ${dump(this.apiConfig)}`);
    console.log(`destination path is ${dest}`);
    callback(null, dest)
  }

  protected fileName(req, file, callback) {// need the unused parameters for multer
    const templateType = req.body[getDataFields.emailTemplateType];
    const name = templateType === 'Missing' ? 'missingTemplate.docx' : 'expiredTemplate.docx';
    console.log(`destination filename is ${name} ${dump(file)}`);
    callback(null, name);
  }

  configuredMiddleware() {
    return this.uploader.single(uploadHeaders.fileField);
  }
  private async setupTemplate(templateType) {
    const filename = docxTemplateFn(this.apiConfig, templateType);
    console.log(`template file to be converted ${filename}`)
    const html = await mammoth.convertToHtml({path:filename})
      .then(result => {
        console.log(`converted to html ${dump(result)}`)
        if (result.messages) {
          console.warn(`mammoth messages: ${dump(result.messages)}`);
        }
        return result.value;
      })
      .catch(err => {
        console.error(`conversion failed because ${dump(err)}`);
        return null;
      });
    if(html) {
      await fs.outputFile(htmlTemplateFn(this.apiConfig, templateType), html);
    }
  }
}
