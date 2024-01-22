import UploadAuditAnalysis from "../UploadAuditAnalysis";

describe('UpdateAuditAnalysis', () => {
  let storageMock, auditRecord, analytics;
  beforeEach(() => {
    auditRecord = {
      location: {
        name: 'this is a location record',
        scan_date: new Date('10/10/2021'),
      },
      items: [
        {
          uuid: 'uuid1',
          audit_match: 'True Match',
        },
        {
          uuid: 'uuid2',
          audit_match: 'True Match'
        },
        {
          uuid: 'uuid3',
          audit_match: 'True Match'
        },
        {
          uuid: 'uuid4',
          audit_match: 'True Match'
        },
        {
          uuid: 'uuid5',
          audit_match: 'True Match'
        },
        {
          uuid: 'uuid6',
          audit_match: 'Found In Other Location'
        },
        {
          uuid: 'uuid7',
          audit_match: 'Found In Other Location'
        },
        {
          uuid: 'uuid8',
          audit_match: 'Found In Other Location'
        },
        {
          uuid: 'uuid9',
          audit_match: 'Expired'
        },
        {
          uuid: 'uuid10',
          audit_match: 'Expired'
        },
        {
          uuid: 'uuid11',
          audit_match: 'No Match'
        },
        {
          uuid: 'uuid12',
          audit_match: 'Missing'
        },
        {
          uuid: 'uuid13',
          audit_match: 'Missing'
        },
        {
          uuid: 'uuid14',
          audit_match: 'Missing'
        },
        {
          uuid: 'uuid15',
          audit_match: 'Missing'
        },
      ]
    };
    storageMock = {
      retrieve: jest.fn().mockReturnValue(Promise.resolve(auditRecord)),
    };
    analytics = new UploadAuditAnalysis(storageMock, 'schema name', 'table name')
  });
  describe('details', () => {
    it('should return the correct filtered results', () => {
      return analytics.details('I am a session')
        .then(actual => {
          expect(actual).toMatchSnapshot();
        });
    });
    it('should throw an error if the session is missing', () => {
    storageMock.retrieve.mockReturnValue(Promise.reject(new Error('Made to fail')));
    const fn = () => analytics.details('I am a session');
    expect(fn).rejects.toThrowErrorMatchingSnapshot();
    });
  });
  describe('analytics', () => {
    it('should return the correct analytics', () => {
      return analytics.analytics('I am a session')
        .then(actual => {
          expect(actual).toHaveProperty('matches', 5);
          expect(actual).toHaveProperty('moved', 3);
          expect(actual).toHaveProperty('expired', 2);
          expect(actual).toHaveProperty('nomatches', 1);
          expect(actual).toHaveProperty('missing', 4);
        });

    });
    it('should throw an error if the session is missing', () => {
      storageMock.retrieve.mockReturnValue(Promise.reject(new Error('Made to fail')));
      const fn = () => analytics.details('I am a session');
      expect(fn).rejects.toThrowErrorMatchingSnapshot();

    });
  });
});
