import { highlightURLHash, addHighlightClassIfInUrl } from './highlightURLHash';

describe('highlightURLHash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('highlightURLHash', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="overallSuccesRate-definition"></div>';
      jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => {
        const highlightElem = document.querySelector('.highlight');
        if (highlightElem) highlightElem.classList.remove('highlight');
        addHighlightClassIfInUrl();
      });
    });

    afterEach(() => {
      document.body.innerHTML = '';
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
