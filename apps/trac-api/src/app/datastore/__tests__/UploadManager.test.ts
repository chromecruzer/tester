import * as path from "path";
import UploadManager from "../UploadManager";
import * as util from "util";
import {DateTime} from "luxon";

const dump = (obj, depth = null) => util.inspect(obj, {depth: depth, colors: true});

describe('UploadManager', () => {
  let manager, config, mockDsu, rootPath;
  const createMockSession = () => {
    const expected = {token: 'new token', date: DateTime.fromObject({day:10, month: 10, year: 2020})};
    UploadManager.newToken = jest.fn().mockReturnValue(expected.token);
    Date.now = jest.fn().mockReturnValue(expected.date);
    return expected;
  };
  beforeEach(() => {
    config = {root: ['some', 'root', 'directory']};
    rootPath = path.join(...config.root, 'iol_report');
    mockDsu = {
      mkdir: jest.fn().mockReturnValue(Promise.resolve()),
      check: jest.fn().mockReturnValue(Promise.resolve(true)),
      remove: jest.fn().mockReturnValue(Promise.resolve()),
      store: jest.fn().mockReturnValue(Promise.resolve()),
      retrieve: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    manager = new UploadManager(config);
    manager.dsu = mockDsu;
  });
  describe('initialize', () => {
    it('should check that the upload directory exists', () => {
      return manager.initialize().then(() => {
        expect(mockDsu.mkdir).toHaveBeenCalledWith(rootPath);
      });
    });
    it('should remove any sessions that exist', () => {
      const [filepath1, filepath2] = ['file1', 'file2'];
      mockDsu.retrieve.mockReturnValue(Promise.resolve({
        token1: {
          token: 'token1',
          type: 'IolReport',
          user: 'uploadUser',
          uploadName: filepath1,
          created: Date.now(),
        },
        token2: {
          token: 'token2',
          type: 'IolReport',
          user: 'uploadUser',
          uploadName: filepath2,
          created: Date.now(),
        }
      }));
      return manager.initialize().then(() => {
        expect(mockDsu.remove).toHaveBeenCalledWith(filepath1);
        expect(mockDsu.remove).toHaveBeenCalledWith(filepath2);
        expect(mockDsu.store)
          .toHaveBeenCalledWith(path.join(...config.root, 'activeSessions.json'), {});
      });
    });
    it('should handle fs.mkdir errors', () => {
      mockDsu.mkdir.mockReturnValue(Promise.reject("Rejecting mkdir"));
      return expect(manager.initialize()).rejects.toMatchSnapshot();
    });
    it('should handle missing sessions file', () => {
      const expected = ['this', 'is', 'an', 'array'];
      mockDsu.retrieve.mockImplementationOnce(() => Promise.resolve(expected));
      mockDsu.check.mockImplementationOnce(() => Promise.resolve(false));
      mockDsu.check.mockImplementationOnce(() => Promise.resolve(true));
      return manager.initialize()
        .then(() => {
          expect(manager.sessions).toEqual({});
          expect(manager.metadata).toEqual(expected);
        });
    });
    it('should handle missing archive file', () => {
      const expected = {this: 'is', a: 'json', file: '!'};
      mockDsu.retrieve.mockImplementationOnce(() => Promise.resolve(expected));
      mockDsu.check.mockImplementationOnce(() => Promise.resolve(true));
      mockDsu.check.mockImplementationOnce(() => Promise.resolve(false));
      return manager.initialize()
        .then(() => {
          expect(manager.sessions).toEqual(expected);
          expect(manager.metadata).toEqual([]);
        });
    });
  });
  describe('removeSession', () => {
    let originalSessions;
    beforeEach(() => {
       originalSessions = {
        'to-be-removed': {
          token: 'to-be-removed',
          type: 'IolReport',
          uploadName: '/some/uploaded/file',
          user: 'sirbilliesbe',
          created: 'a beautiful date'
        },
        'to-keep': {
          token: 'to-keep',
          type: 'IolReport',
          uploadName: '/some/uploaded/file/2b/archived',
          user: 'sirbilliesbe',
          created: 'a rainy date'
        }
      };
      manager.sessions = {...originalSessions};
    });
    it('should remove a session fron the userSessionsFile', () => {
      return manager.removeSession('to-be-removed')
        .then(() => {
          const actualSessions = mockDsu.store.mock.calls[0][1];
          expect(actualSessions).toHaveProperty('to-keep', originalSessions['to-keep']);
          expect(Object.keys(actualSessions)).not.toContain('to-be-removed');
        });
    });
    it('should should remove the uploaded file of the session when requested', () => {
      return manager.removeSession('to-be-removed', true)
        .then(() => {
          expect(mockDsu.remove).toBeCalledWith(originalSessions['to-be-removed'].uploadName);
        });
    });
    it('should should handle an error from remove', () => {
      mockDsu.remove.mockImplementationOnce(() => Promise.reject(new Error("Rejecting fs.remove")));
      return expect(manager.removeSession('to-be-removed', true)).rejects.toMatchSnapshot();
    });
  });
  describe('addSession', () => {
    it('should add a session from the userSessionsFile', () => {
      const expected = createMockSession();
      const [expectedFile, expectedUser, expectType] = ['/some/file', 'jqpublic', 'IolReport'];
      return manager.addSession(expectedFile, expectedUser, expectType)
        .then(actualToken => {
          expect(actualToken).toEqual(expected.token);
          const actual = mockDsu.store.mock.calls[0][1];
          // console.log(`actual session ${dump(actual)}`);
          expect(actual).toHaveProperty(actualToken);
          expect(actual[actualToken]).toHaveProperty('uploadName', expectedFile);
          expect(actual[actualToken]).toHaveProperty('user', expectedUser);
          expect(actual[actualToken]).toHaveProperty('type', expectType);
          expect(actual[actualToken]).toHaveProperty('created', expected.date.toJSDate());
          expect(actual[actualToken]).toHaveProperty('token', expected.token);
        });
    });
    it('should should handle an error from saveJson', () => {
      mockDsu.store.mockReturnValue(Promise.reject(new Error("Rejecting store")));
      const expected = createMockSession();
      const [expectedFile, expectedUser, expectType] = ['/some/file', 'jqpublic', 'IolReport'];
      return expect(manager.addSession(expectedFile, expectedUser, expectType)).rejects.toMatchSnapshot();
    });
  });
  describe('archiveSession', () => {
    let originalSessions;
    beforeEach(() => {
      originalSessions = {
        'to-be-archived': {
          token: 'to-be-archived',
          type: 'IolReport',
          uploadName: '/some/uploaded/file/2b/archived',
          user: 'sirbilliesbe',
          created: 'a beautiful date'
        },
        'to-keep': {
          token: 'to-keep',
          type: 'IolReport',
          uploadName: '/some/uploaded/file',
          user: 'sirbilliesbe',
          created: 'a rainy date'
        }
      };
      manager.sessions = {...originalSessions};
    });
    it('should transfer a session from user sessions to the archive and add the uuid object', () => {
      const archiveToken = 'to-be-archived';
      return manager.archiveSession(archiveToken)
        .then(() => {
          const writtenSessions = mockDsu.store.mock.calls[0][1];
          const writtenArchives = mockDsu.store.mock.calls[1][1];
          expect(writtenSessions).not.toHaveProperty(archiveToken);
          expect(writtenArchives).toMatchSnapshot();
        });
    });
    it('should should handle an error from remove session', () => {
      mockDsu.store.mockImplementationOnce(() => Promise.reject(new Error("Rejecting store")));
      return expect(manager.archiveSession('to-be-archived')).rejects.toMatchSnapshot();
    });
    it('should should handle an error from saveJson', () => {
      mockDsu.store.mockImplementationOnce(() => Promise.resolve());
      mockDsu.store.mockImplementationOnce(() => Promise.reject(new Error("Rejecting store")));
      return expect(manager.archiveSession('to-be-archived')).rejects.toMatchSnapshot();
    });
  });
});
