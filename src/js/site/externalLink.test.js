import { externalLink } from './externalLink';

describe('externalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('externalLink', () => {
    beforeEach(() => {
      document.body.innerHTML = '<main id="main"><a class="externallink" id="externallink" href="https://www.outsidelink.com" target="_blank" rel="noopener noreferrer">word last</a></main>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('if external link found add svg to last word', () => {
        externalLink();
        // const externallinkElm = document.body.querySelector('#externallink');
        // const externallinkElmClass = document.querySelector('.externallink');
        // console.log('externallink ', externallinkElm, document.body.innerHTML, externallinkElmClass)
    });
  });
});
