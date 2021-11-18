import global from '../../../jest/global';
import * as sidebar from './sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('highlightTocOnScroll', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('Calls observe', () => {
      // because InteractionObserver is a class on the window we need to actually
      // spy on the prototype of the method.
      const spy = jest.spyOn(IntersectionObserver.prototype, 'observe');
      let h2 = document.createElement('h2');
      let tocItem = document.createElement('a');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          switch (selector) {
            case '.toc-entry a':
              let queriedTocItems = document.createDocumentFragment();
              queriedTocItems.appendChild(tocItem);
              return queriedTocItems.childNodes;
            case 'h2, h3, h4, h5, h6':
              let queriedHeadings = document.createDocumentFragment();
              queriedHeadings.appendChild(h2);
              return queriedHeadings.childNodes;
          }
        });

      sidebar.highlightTocOnScroll();
      expect(spy).toHaveBeenCalled();
    });

    it("A document with one h2 is in the TOC and is 'active'", () => {
      let h2 = document.createElement('h2');
      let tocItem = document.createElement('a');

      jest
        .spyOn(document, 'querySelectorAll')
        .mockImplementation((selector) => {
          switch (selector) {
            case '.toc-entry a':
              let queriedTocItems = document.createDocumentFragment();
              queriedTocItems.appendChild(tocItem);
              return queriedTocItems.childNodes;
            case 'h2, h3, h4, h5, h6':
              let queriedHeadings = document.createDocumentFragment();
              queriedHeadings.appendChild(h2);
              return queriedHeadings.childNodes;
          }
        });

      sidebar.highlightTocOnScroll();
      let x = [...tocItem.classList];
      expect([...tocItem.classList]).toEqual(
        expect.arrayContaining(['active']),
      );
    });
  });
});
