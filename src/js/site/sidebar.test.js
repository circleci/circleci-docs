import '../../../jest/global';
import * as sidebar from './sidebar';

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
      let queriedTocItems = document.createDocumentFragment();
      let queriedHeadings = document.createDocumentFragment();

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          switch (selector) {
            case '.toc-entry a':
              queriedTocItems.appendChild(tocItem);
              return queriedTocItems.childNodes;
            case 'h2, h3, h4, h5, h6':
              queriedHeadings.appendChild(h2);
              return queriedHeadings.childNodes;
          }
        });
    });

    it('Calls observe', () => {
      // because InteractionObserver is a class on the window we need to actually
      // spy on the prototype of the method.
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      sidebar.highlightTocOnScroll();
      expect(spy).toHaveBeenCalled();
    });

    it('Does not call observe if there are no titles.', () => {
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      let tocItem = document.createElement('a');
      let queriedTocItems = document.createDocumentFragment();
      let queriedHeadings = document.createDocumentFragment();

      // we override the jest query selector here because
      // we need to mock the case where there are not titles.
      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          switch (selector) {
            case '.toc-entry a':
              queriedTocItems.appendChild(tocItem);
              return queriedTocItems.childNodes;
            case 'h2, h3, h4, h5, h6':
              return queriedHeadings.childNodes;
          }
        });

      sidebar.highlightTocOnScroll();
      expect(spy).not.toHaveBeenCalled();
    });

    it("A document with one h2 is in the TOC and is 'active'", () => {
      sidebar.highlightTocOnScroll();
      expect([...tocItem.classList]).toEqual(
        expect.arrayContaining(['active']),
      );
    });

    it('Does not add an active class to TOC item when a ignored headline is encountered', () => {
      let h2 = document.createElement('h2');
      h2.classList.add('help-improve-header');
      let queriedTocItems = document.createDocumentFragment();
      let queriedHeadings = document.createDocumentFragment();

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          switch (selector) {
            case '.toc-entry a':
              queriedTocItems.appendChild(tocItem);
              return queriedTocItems.childNodes;
            case 'h2, h3, h4, h5, h6':
              queriedHeadings.appendChild(h2);
              return queriedHeadings.childNodes;
          }
        });

      sidebar.highlightTocOnScroll();

      expect([...tocItem.classList]).toEqual(
        expect.not.arrayContaining(['active']),
      );
    });
  });
});
