import util from "util";
import {dateNow, getDataFields} from "@trac/datatypes";
import _ from "lodash";
import {tryCatch} from "@trac/postgresql";
import {StatusCodes} from "http-status-codes";
import ScheduleBatches from "./ScheduleBatches";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export class EmailSender {
  constructor(private emailScheduler: ScheduleBatches) {
    // console.log('test emails created');
  }
  public getMissingEmails() {
    return tryCatch(async(req, res, next) => {
      const results = await this.emailScheduler.getMissingEmailAddresses();
      res.json(results);
    })
  }

  send() {
    return tryCatch(async(req, res, next) => {
      // console.log(`Send email ${dump(req.body)}`);
      const batchOrder = req.body[getDataFields.emailOrder];
      // console.log(`Send called scheduling orders ${dump(batchOrder)}`);
      const emailSettings = await this.emailScheduler.settings.getEmailSetting();
      if(emailSettings.server.disableExpireEmails) {
        if (!_.isEmpty(_.filter(batchOrder.orders, o => o.templateType === 'Expired'))) {
          res.status(StatusCodes.BAD_REQUEST);
          res.send('NOT OK');
          return;
        }
      }
      this.emailScheduler.schedule(batchOrder);
      res.status(StatusCodes.OK);
      res.send('OK');
    })
  }
  draft() {
    return tryCatch(async (req, res, next) => {
      const order = req.body[getDataFields.emailOrder];
      console.log(`draft for order ${dump(order)}`)
      const draft = await this.emailScheduler.getDraft(order);
      res.send(draft);
    });
  }
}
