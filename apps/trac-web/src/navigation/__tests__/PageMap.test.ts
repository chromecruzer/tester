import PagesMap, {pageMappings} from "../PagesMap";

describe('PagesMap', () => {
  let pagesMap, mockBuildUrl;
  beforeEach(() => {
    mockBuildUrl = {
      build: jest.fn().mockReturnValue('this is a URL')
    };
    pagesMap = new PagesMap(mockBuildUrl);
  });
  describe('page', () => {
    it('should call buildURL with the right path', () => {
      pagesMap.page('Expiration');
      expect(mockBuildUrl.build.mock.calls).toMatchSnapshot();
    });
    it('should call buildURL with the right path parameters', () => {
      pagesMap.page('Details', ['audit-scan', 'SESSION']);
      expect(mockBuildUrl.build.mock.calls).toMatchSnapshot();
    });
    it('should call buildURL with the search parameters', () => {
      pagesMap.page('Search', [], {text: 'spencer', filters: ['customers']});
      expect(mockBuildUrl.build.mock.calls).toMatchSnapshot();
    });
  });
  describe('activePage', () => {
    it('should recognize all of the pages', () => {
      Object.keys(pageMappings).forEach(p => {
        // console.log(`testing url ${pageMappings[p]} for page ${p}`);
        const actual = pagesMap.activePage(pageMappings[p]);
        expect(actual).toEqual(p);
      })
    });
    it('should throw an error when it cannot figure out a URL', () => {
      expect(() => pagesMap.activePage('oopsie/daisy/bicycle')).toThrowErrorMatchingSnapshot();
    });
  });
  describe('activeParent', () => {
    it('should recognize all of the parents', () => {
      const testsCases = {
        'Snapshots': 'Orphan',
        'Search': 'Orphan',
        'Consignment': 'Consignment',
        'Expiration': 'Consignment',
        'Audit': 'Consignment',
        'Upload': 'Audit',
        'Analytics': 'Upload',
        'Details': 'Upload',
        'History': 'Snapshots',
        'Procedures': 'Orphan',
        'Accounts': 'Orphan',
        'Reports': 'Orphan',
        'Settings': 'Orphan'
      }
      Object.keys(PagesMap).forEach(p => {
        // console.log(`testing url ${PagesMap[p]} for page ${p}`);
        const actual = pagesMap.activeParent(PagesMap[p]);
        expect(actual).toEqual(testsCases[p]);
      })
    });
    it('should return orphan when it cannot figure out a URL', () => {
      const actual = pagesMap.activeParent('/oopsie/daisy/bicycle');
      expect(actual).toEqual('Orphan');
    });
  });
});
