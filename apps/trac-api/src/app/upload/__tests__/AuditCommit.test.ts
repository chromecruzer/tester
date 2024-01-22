import {DateTime} from "luxon";
import AuditCommit from "../AuditCommit";

describe('AuditCommit', () => {
  let storageMock, clientMock, auditRecord, committer;
  const now = DateTime.fromObject({year: 2022, month: 6, day: 15}).toJSDate();
  // console.log(`now for testing ${now} ${now}`);
  beforeEach(() => {
    auditRecord = {
      location: {
        location_code: 'I am a location code also known as a customer id or a customer code',
        scan_date: DateTime.fromObject({year: 2022, month: 2, day: 15}).toJSDate(),
        status: 'Open',
        auditor: 'I am the auditor',
        scanner: 'I am the scanner',
      },
      items: [
        {
          lot: 'I am a lot',
          consignment_uuid: 'consignment_uuid1',
          family: 'falcon crest',
          description: 'mister mister',
          item: 'i am an item',
          quantity: 1,
          expire_date: DateTime.fromObject({year: 2023, month: 1, day: 15}).toJSDate(),
          audit_match: 'True Match',
          last_changed_date: now,
        },
        {
          lot: 'I am also a lot',
          consignment_uuid: 'consignment_uuid2',
          consignment_location: 'consignment location',
          family: 'falcon crest',
          description: 'mister mister',
          item: 'i am an item',
          quantity: 1,
          expire_date: DateTime.fromObject({year: 2023, month: 1, day: 15}).toJSDate(),
          audit_match: 'Found In Other Location',
          last_changed_date: now,
        },
        {
          lot: 'I am a lot with no consignment',
          audit_match: 'No Match',
          last_changed_date: now,
        },
        {
          lot: 'I am a lot that is not in the scan',
          consignment_uuid: 'consignment_uuid2',
          family: 'falcon crest',
          description: 'mister mister',
          item: 'i am an item',
          quantity: 1,
          expire_date: DateTime.fromObject({year: 2023, month: 1, day: 15}).toJSDate(),
          audit_match: 'Missing',
          last_changed_date: now,
        },
      ]
    };
    storageMock = {
      retrieve: jest.fn().mockReturnValue(auditRecord)
    };
    clientMock = {
      query: jest.fn()
    }
    committer = new AuditCommit(storageMock, ' schema name', 'audit location table',
      'audit item table', 'audit notes table')
  });
  describe('commit', () => {
    it('should correctly store an audit record', () => {
      clientMock.query.mockReturnValueOnce(Promise.resolve({rows: [{uuid: 'location uuid'}]}));
      clientMock.query.mockReturnValueOnce(Promise.resolve({rows: [
          {
            lot: 'I am a lot',
            uuid: 'uuid1'
          },
          {
            lot: 'I am also a lot',
            uuid: 'uuid2'
          },
          {
            lot: 'I am a lot with no consignment',
            uuid: 'uuid3'
          },
          {
            lot: 'I am a lot that is not in the scan',
            uuid: 'uuid4'
          },
        ]}));
      clientMock.query.mockReturnValueOnce(Promise.resolve());
      committer.commit('I am a token', clientMock)
        .then(() => {
          // console.log('commit resolved')
          expect(clientMock.query.mock.calls).toMatchSnapshot();
        })
    });
  });
});
