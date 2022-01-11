import { init } from './progressbar';

describe('Progress Bar', () => {
  const mockProgressBar = () => {
    document.body.innerHTML = `
        <span>
            <div id="progress-bar-container">
                <div id="progress-bar"></div>
            </div>
            <style>
                #progress-bar-container {
                    height: 2px;
                    position: sticky;
                    width: 100%;
                    box-shadow: 0 -1px 18px 0 #000000BD;
                    z-index: 1029;
                    top: 68px;
                }

                #progress-bar {
                    height: 2px;
                    width: 0%;
                    background: #008647;
                }
            </style>
        </span>
    `;
    return document.getElementById('progress-bar-container');
  };
  it('should set progressBarContainer color white', () => {
    const mockContainer = mockProgressBar();
    expect(window.getComputedStyle(mockContainer).background).toBeFalsy();
    init();
    expect(window.getComputedStyle(mockContainer).background).toEqual('white');
  });

  it('should increase progressBar width as scroll occurs', () => {
    const mockElement = mockProgressBar().children[0];
    expect(window.getComputedStyle(mockElement).background).toEqual(
      'rgb(0, 134, 71)',
    );

    init();

    const oldWidth = window.getComputedStyle(mockElement).width;
    expect(oldWidth).toEqual('0%');

    Object.defineProperty(document.body, 'scrollTop', {
      value: 10,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 300,
      writable: true,
    });
    window.dispatchEvent(new CustomEvent('scroll'));

    expect(window.getComputedStyle(mockElement).width).not.toEqual(oldWidth);
  });
});
