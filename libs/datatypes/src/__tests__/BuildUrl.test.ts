import BuildUrl from "../BuildUrl";

describe('BuildUrl', () => {
  describe('build', () => {
    it('should return the prefix if no parameters', () => {
        const builder = new BuildUrl('localhost', '1400');
        const actual = builder.build('subpath');
        expect(actual).toMatchSnapshot();
    });
    it('should return prefix with only host if no port', () => {
      const builder = new BuildUrl('localhost');
      const actual = builder.build('subpath');
      expect(actual).toMatchSnapshot();
    });
    it('should return /path if no host or port', () => {
      const builder = new BuildUrl();
      const actual = builder.build('subpath');
      expect(actual).toMatchSnapshot();
    });
    it('should add path variables in correct order', () => {
      const builder = new BuildUrl();
      const actual = builder.build('subpath', ['path1', 'twopath','threepathpigs']);
      expect(actual).toMatchSnapshot();
    });
    it('should add search parameters correctly', () => {
      const builder = new BuildUrl();
      const actual = builder.build('subpath', [], {key1:'justme', key2:'#pro'});
      expect(actual).toMatchSnapshot();
    });
    it('should add search parameters with array of values correctly', () => {
      const builder = new BuildUrl();
      const actual = builder.build('subpath', [], {array1:['just','me','and','my','boo'], key2:'#pro', array:['tag', 'youre', 'it']});
      expect(actual).toMatchSnapshot();
    });
    it('should adds all parameters correctly', () => {
      const builder = new BuildUrl();
      const actual = builder.build('subpath', ['path1'],{key1:'justme', key2:'#pro'});
      expect(actual).toMatchSnapshot();
    });
  });
});
