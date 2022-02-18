import '../../../jest/global';
import { SnippetFeedback } from './snippetFeedback';

describe('Snippet Feedback class', () => {
  let codeSnippetContainer;

  beforeEach(() => {
    jest.clearAllMocks();
    window.AnalyticsClient = {
      trackAction: jest.fn(),
    };

    // simulate a code block container in the docs with the "highlight" class.
    codeSnippetContainer = document.createElement('div');
    codeSnippetContainer.classList.add('highlight');
    // attach the "code block to the div."
    codeSnippetContainer.appendChild(document.createElement('pre'));
  });

  test('Constructing a snippetFeedback class appends a was-this-helpful dom element to the original container', () => {
    expect(codeSnippetContainer.children.length).toBe(1);
    new SnippetFeedback(codeSnippetContainer);
    expect(codeSnippetContainer.children.length).toBe(2);
    expect([...codeSnippetContainer.children[1].classList]).toStrictEqual([
      'was-this-helpful',
    ]);
  });

  test("The 'was this helpful' element contains required elements (text, yes, /, no).", () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    expect(sf.wasThisHelpfulContainer.children.length).toBe(4);
    expect(sf.wasThisHelpfulContainer.children[0].textContent).toBe(
      'Was this code helpful?',
    );
    expect(sf.wasThisHelpfulContainer.children[1].textContent).toBe('Yes');
    expect(sf.wasThisHelpfulContainer.children[2].textContent).toBe(' /');
    expect(sf.wasThisHelpfulContainer.children[3].textContent).toBe('No');
    //
  });

  test('Yes and No Buttons trigger trackAction onClick.', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    let yesBtn = sf.wasThisHelpfulContainer.children[1];
    yesBtn.click();
    let noBtn = sf.wasThisHelpfulContainer.children[3];
    noBtn.click();
    expect(window.AnalyticsClient.trackAction).toHaveBeenCalledTimes(2);
  });

  test('Feedback form does not exist until yes or no are clicked.', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    expect(sf.feedbackForm).toBe(null);
    let yesBtn = sf.wasThisHelpfulContainer.children[1];
    yesBtn.click();
    expect(sf.feedbackForm).not.toBe(null);
  });

  test('Clicking `yes` appends the form to the container', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    let yesBtn = sf.wasThisHelpfulContainer.children[1];
    expect(sf.wasThisHelpfulContainer.children.length).toBe(4);
    yesBtn.click();
    expect(sf.wasThisHelpfulContainer.children.length).toBe(5);
  });

  test('Clicking `no` appends the form to the container', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    let noBtn = sf.wasThisHelpfulContainer.children[3];
    expect(sf.wasThisHelpfulContainer.children.length).toBe(4);
    noBtn.click();
    expect(sf.wasThisHelpfulContainer.children.length).toBe(5);
  });

  test('_renderCharCount contains the proper innerHTML', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    sf.currCharCount = 10;
    sf._renderCharCount();
    // correct whitespace is required here, sadly:
    expect(sf.currCharCountElement.innerHTML).toBe(`
        <div class="charCountRow">
          <span>10 / 240</span>
        </div>`);
  });

  test('_renderCharCount limits charCount if it exceed set limit.', () => {
    let sf = new SnippetFeedback(codeSnippetContainer);
    sf.currCharCount = 1000;
    sf._renderCharCount();
    // correct whitespace is required here, sadly:
    expect(sf.currCharCountElement.innerHTML).toBe(`
        <div class="charCountRow">
          <span>240 / 240</span>
        </div>`);
  });
});
