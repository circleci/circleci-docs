import '../../../jest/global';
import { highlightTocOnScroll, highlightTocOnScrollOnce } from './sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('highlightTocOnScroll', () => {
    let h2, tocItem;

    beforeEach(() => {
      jest.resetAllMocks();
      h2 = document.createElement('h2');
      tocItem = document.createElement('a');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
            case 'h2, h3, h4, h5, h6':
              items.appendChild(h2);
              break;
          }

          return items.childNodes;
        });
    });

    it('Calls observe', () => {
      // because InteractionObserver is a class on the window we need to actually
      // spy on the prototype of the method.
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      highlightTocOnScroll();
      expect(spy).toHaveBeenCalled();
    });

    it('Does not call observe if there are no titles.', () => {
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      let tocItem = document.createElement('a');

      // we override the jest query selector here because
      // we need to mock the case where there are not titles.
      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
          }
          return items.childNodes;
        });

      highlightTocOnScroll();
      expect(spy).not.toHaveBeenCalled();
    });

    it("A document with one h2 is in the TOC and is 'active'", () => {
      highlightTocOnScroll();
      expect([...tocItem.classList]).toEqual(
        expect.arrayContaining(['active']),
      );
    });

    it('Does not add an active class to TOC item when a ignored headline is encountered', () => {
      let h2 = document.createElement('h2');
      h2.classList.add('help-improve-header');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
            case 'h2, h3, h4, h5, h6':
              items.appendChild(h2);
              break;
          }
          return items.childNodes;
        });

      highlightTocOnScroll();

      expect([...tocItem.classList]).toEqual(
        expect.not.arrayContaining(['active']),
      );
    });
  });

  describe('highlightTocOnScrollOnce', () => {
    let h2, tocItem;

    beforeEach(() => {
      jest.resetAllMocks();
      jest.resetModules();
      h2 = document.createElement('h2');
      tocItem = document.createElement('a');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
            case 'h2, h3, h4, h5, h6':
              items.appendChild(h2);
              break;
          }

          return items.childNodes;
        });
    });

    it('Calls observe', () => {
      const sidebar = require('./sidebar');
      // because InteractionObserver is a class on the window we need to actually
      // spy on the prototype of the method.
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      sidebar.highlightTocOnScrollOnce();
      expect(spy).toHaveBeenCalled();
    });

    it('Does not call observe if there are no titles.', () => {
      const sidebar = require('./sidebar');
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      let tocItem = document.createElement('a');

      // we override the jest query selector here because
      // we need to mock the case where there are not titles.
      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
          }
          return items.childNodes;
        });

      sidebar.highlightTocOnScrollOnce();
      expect(spy).not.toHaveBeenCalled();
    });

    it("A document with one h2 is in the TOC and is 'active'", () => {
      const sidebar = require('./sidebar');
      sidebar.highlightTocOnScrollOnce();
      expect([...tocItem.classList]).toEqual(
        expect.arrayContaining(['active']),
      );
    });

    it('Does not add an active class to TOC item when a ignored headline is encountered', () => {
      const sidebar = require('./sidebar');
      let h2 = document.createElement('h2');
      h2.classList.add('help-improve-header');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          let items = document.createDocumentFragment();
          switch (selector) {
            case '.toc-entry a':
              items.appendChild(tocItem);
              break;
            case 'h2, h3, h4, h5, h6':
              items.appendChild(h2);
              break;
          }
          return items.childNodes;
        });

      sidebar.highlightTocOnScrollOnce();

      expect([...tocItem.classList]).toEqual(
        expect.not.arrayContaining(['active']),
      );
    });
  });

  it('only calls highlightTocOnScroll once when called multiple times', () => {
    const spy = jest.spyOn(document, 'querySelectorAll');

    highlightTocOnScrollOnce();
    expect(spy).toHaveBeenCalledTimes(2);

    highlightTocOnScrollOnce();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
