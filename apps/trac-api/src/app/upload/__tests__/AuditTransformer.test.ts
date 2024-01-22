import AuditTransformer from "../AuditTransformer";
import {ItemMatchStatus} from "@trac/datatypes";
import {DateTime} from "luxon";
import _ from "lodash";

describe('AuditTransformer', () => {
  let clientMock, mockStoreFactory, transformer, trueMatchesAudit, trueMatchesConsignment, misMatchedAudit,
    misMatchedConsignment, missingConsignment, nonmatchedAudit, auditLocation, consignmentLocation;
  const cleanupAuditResultsNow = () => {
    const audit = mockStoreFactory.create.mock.calls[0][1];
    const now = 'the time is now';
    audit.location.received_date = now;
    _.forEach(audit.items, i => {
      i.last_changed_date = now;
    });
    _.forEach(audit.notes, n => {
      n.date_created = now;
    });
    return audit
  };
  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
    };
    mockStoreFactory = {
      create: jest.fn()
    }
    auditLocation = 'audit location';
    consignmentLocation = 'consignment location';
    clientMock.query.mockImplementation(() => Promise.resolve());
    transformer = new AuditTransformer(mockStoreFactory, 'schema name',
      'audit item table name', 'audit table name',
      'consignment schema & table name', new ItemMatchStatus());
    trueMatchesAudit = [
      'true match 1',
      'true match 2',
    ];
    trueMatchesConsignment = [
      {
        uuid: 'consignment uuid 1',
        lot: 'true match 1',
        customer_id: auditLocation,
        description4: 'dynasty',
        description: 'vixen',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
      {
        uuid: 'consignment uuid 2',
        lot: 'true match 2',
        customer_id: auditLocation,
        description4: 'dallas',
        description: 'larry',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
    ];

    misMatchedAudit = [
'missed match 1',
      'missed match 2',
    ];
    misMatchedConsignment = [
      {
        uuid: 'consignment uuid 3',
        lot: 'missed match 1',
        customer_id: consignmentLocation,
        description4: 'dynasty',
        description: 'vixen',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
      {
        uuid: 'consignment uuid 4',
        lot: 'missed match 2',
        customer_id: consignmentLocation,
        description4: 'dallas',
        description: 'larry',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
    ];
    nonmatchedAudit = [
 'no match 1',
      'no match 2',
    ];
    missingConsignment = [
      {
        uuid: 'consignment uuid 5',
        lot: 'missed scan 1',
        customer_id: consignmentLocation,
        description4: 'dynasty',
        description: 'vixen',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
      {
        uuid: 'consignment uuid 6',
        lot: 'missed scan 2',
        customer_id: consignmentLocation,
        description4: 'dallas',
        description: 'larry',
        item: 'i am an item',
        quantity: 1,
        expire_date: DateTime.fromObject({year: 2023, month: 3, day: 15})
      },
    ];
  });
  describe('transform', () => {
    it('should find true matches', () => {
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: trueMatchesConsignment}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      return transformer.transform(trueMatchesAudit, clientMock, 'I am a token', {
        user: 'User', scan_date: '10/23/2022',
        scanner: 'Sales Rep', location_code: auditLocation
      })
        .then(() => {
          expect(clientMock.query.mock.calls).toMatchSnapshot();
          expect(cleanupAuditResultsNow()).toMatchSnapshot();
        });
    });
    it('should find lenses that have been moved', () => {
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: misMatchedConsignment}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      return transformer.transform(misMatchedAudit, clientMock, 'I am a token', {
        user: 'User', scan_date: '10/23/2022',
        scanner: 'Sales Rep', location_code: auditLocation
      })
        .then(() => {
          expect(cleanupAuditResultsNow()).toMatchSnapshot();
        });
    });
    it('should report audit entries that could not be matched', () => {
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      return transformer.transform(nonmatchedAudit, clientMock, 'I am a token', {
        user: 'User', scan_date: '10/23/2022',
        scanner: 'Sales Rep', location_code: auditLocation
      })
        .then(() => {
          expect(cleanupAuditResultsNow()).toMatchSnapshot();
        });
    });
    it('should report audit entries that are missing from the audit scan', () => {
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: []}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: trueMatchesConsignment}));
      clientMock.query.mockImplementationOnce(() => Promise.resolve({rows: missingConsignment}));
      return transformer.transform(trueMatchesAudit, clientMock, 'I am a token', {
        user: 'User', scan_date: '10/23/2022',
        scanner: 'Sales Rep', location_code: auditLocation
      })
        .then(() => {
          expect(cleanupAuditResultsNow()).toMatchSnapshot();
        });
    });
  });
});
