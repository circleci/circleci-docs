import { highlightURLHash, addHighlightClassIfInUrl } from './highlightURLHash';

window.$ = require('src-api/source/javascripts/lib/_jquery.js');

document.body.innerHTML = '<div id="overallSuccesRate-definition"></div>';

describe('highlightURLHash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('highlightURLHash', () => {
    beforeEach(() => {
      jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => {
        $('.highlight').removeClass('highlight');
        addHighlightClassIfInUrl()
      });
    });

    it('When window.location search is `highlight` then class highlight not added to hash id element', () => {
      const location = {
        ...window.location,
        search: '',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });

      highlightURLHash();
      var element = document.querySelector(window.location.hash);
      expect(element.classList[0]).not.toEqual('highlight');
    });

    it('When window.location search is `highlight` then class highlight added to hash id element', () => {
      let location = {
        ...window.location,
        search: '?highlight',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });
      highlightURLHash();
      var element = document.querySelector(window.location.hash);
      expect(element.classList[0]).toEqual('highlight');
    });

    it('When hash changes `addEventListener` is called', () => {
      let location = {
        ...window.location,
        search: '?highlight',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });

      highlightURLHash();

      window.location.hash = '#apple-definition';
      expect(window.addEventListener).toBeCalledWith(
        'hashchange',
        expect.any(Function),
        false,
      );
    });
  });
});
