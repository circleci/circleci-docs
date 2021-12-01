import { insightsTableScroll } from './insightsTableScroll';

window.$ = require('src-api/source/javascripts/lib/_jquery.js');

document.body.innerHTML = '<div id="overallSuccesRate-definition">' + '</div>';

describe('InsightsTableScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('insightsTableScroll', () => {
    beforeEach(() => {
      jest
        .spyOn(window, 'addEventListener')
        .mockImplementationOnce(() => {
          const hashNew = window.location.hash;
          $('.highlight').removeClass('highlight');
          $(hashNew).attr('class', 'highlight');
        });
    });

    it('ishighlighted false add class', () => {
      const location = {
        ...window.location,
        search: '',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });

      insightsTableScroll();
      expect($(window.location.hash)[0].classList[0]).not.toEqual('highlight');
    });

    it('ishighlighted true no added class', () => {
      let location = {
        ...window.location,
        search: '?highlight',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });
      let oldHash = window.location.hash;
      insightsTableScroll();
      expect($(oldHash)[0].classList[0]).toEqual('highlight');
    });

    it('addevent listener called', () => {
      let location = {
        ...window.location,
        search: '?highlight',
        hash: '#overallSuccesRate-definition',
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location,
      });

      insightsTableScroll();

      window.location.hash = '#apple-definition';
      expect(window.addEventListener).toBeCalledWith(
        'hashchange',
        expect.any(Function),
        false,
      );
    });
  });
});
