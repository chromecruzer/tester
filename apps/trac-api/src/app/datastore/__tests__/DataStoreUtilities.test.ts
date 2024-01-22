import DataStoreUtilities from "../DataStoreUtilities";

describe('DataStoreUtilities', () => {
  let mockFs, dsu;
  beforeEach(() => {
    mockFs = {
      ensureDir: jest.fn().mockReturnValue(Promise.resolve()),
      ensureFile: jest.fn().mockReturnValue(Promise.resolve(true)),
      remove: jest.fn().mockReturnValue(Promise.resolve()),
      writeJson: jest.fn().mockReturnValue(Promise.resolve()),
      readJson: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    dsu = new DataStoreUtilities();
    dsu.fs = mockFs;
  });
  describe('retrieve', () => {
    it('should call readJson with the file path', () => {
      const expected = 'thisIsAFilePath'
      dsu.retrieve(expected);
      expect(mockFs.readJson).toBeCalledWith(expected);
    });
    it('should reject with an error when readJson fails', () => {
      const testCall = () => dsu.retrieve('whoCares');
      mockFs.readJson.mockImplementation(() => Promise.reject(new Error('This did not work')));
      expect(testCall).rejects.toMatchSnapshot();
    });
  });
  describe('store', () => {
    it('should call writeJson with the file path and content', () => {
      const expected = ['thisIsAFilePath', {content: 'this is content'}];
      dsu.store(...expected);
      expect(mockFs.writeJson).toBeCalledWith(...expected, {"flag": "w", "spaces": 4});
    });
    it('should reject with an error when writeJson fails', () => {
      const testCall = () => dsu.store('whoCares', {none:'no content'});
      mockFs.writeJson.mockImplementation(() => Promise.reject(new Error('This did not work')));
      expect(testCall).rejects.toMatchSnapshot();
    });
  });
  describe('check', () => {
    it('should return false if file is absent', () => {
      const expected = 'thisIsAFilePath'
      mockFs.ensureFile.mockReturnValue(Promise.reject(false));
      return dsu.check(expected).then(actual => {
        expect(mockFs.ensureFile).toBeCalledWith(expected);
        expect(actual).toBeFalsy();
      });
    });
    it('should return true if the file is present', () => {
      const expected = 'thisIsAFilePath'
      return dsu.check(expected).then(actual => {
        expect(mockFs.ensureFile).toBeCalledWith(expected);
        expect(actual).toBeTruthy();
      });
    });
  });
  describe('remove', () => {
    it('should call remove with the file path', () => {
      const expected = 'thisIsAFilePath'
      dsu.remove(expected);
      expect(mockFs.remove).toBeCalledWith(expected);
    });
    it('should reject with an error when remove fails', () => {
      const testCall = () => dsu.remove('whoCares');
      mockFs.remove.mockImplementation(() => Promise.reject(new Error('This did not work')));
      expect(testCall).rejects.toMatchSnapshot();
    });
  });
  describe('mkdir', () => {
    it('should call ensureDir with the file path', () => {
      const expected = 'thisIsADirPath'
      dsu.mkdir(expected);
      expect(mockFs.ensureDir).toBeCalledWith(expected);
    });
    it('should reject with an error when ensureDir fails', () => {
      const testCall = () => dsu.mkdir('whoCares');
      mockFs.ensureDir.mockImplementation(() => Promise.reject(new Error('This did not work')));
      expect(testCall).rejects.toMatchSnapshot();
    });
  });
});
