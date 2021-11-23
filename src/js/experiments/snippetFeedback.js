class SnippetFeedback {
  constructor(snippetElement) {
    this.snippetElement = snippetElement;
    this.feedbackFormData = {};
    this.codeSnippetContainer = null;
    this.wasThisHelpfulContainer = null;
    // mini state machine indicator
    this.currentState = 'empty'; // empty | hasCopiedCode | clickedYes | clickedNo | hasOpenedFeedbackForm | submittedFeedback

    this.showWasThisHelpfulPrompt();
  }

  /**
   * Construct a "Was this helpful" line, and inject it below the code snippet.
   * Add on click handlers to the yes/no that will update class state, and send
   * off amplitude data as well. */
  showWasThisHelpfulPrompt() {
    this.codeSnippetContainer = this.snippetElement.closest('div.highlight');
    // make sure we can only create the 'was this helpful' text once.
    if (this.currentState === 'empty') {
      this.codeSnippetContainer.appendChild(this.createWasThisHelpfulPrompt());
      this.currentState = 'hasCopiedCode';
    }
  }

  createWasThisHelpfulPrompt() {
    // make elements
    const container = this.makeElement({
      kind: 'div',
      className: 'was-this-helpful',
    });

    const textPrompt = this.makeElement({
      kind: 'span',
      text: 'Was this helpful?',
    });

    const slash = this.makeElement({ kind: 'span', text: ' / ' });
    // put it all together:
    container.appendChild(textPrompt);
    container.appendChild(this.constructNoButton());
    container.appendChild(slash);
    container.appendChild(this.constructYesButton());
    this.wasThisHelpfulContainer = container;
    return container;
  }

  makeElement({ kind, text, className, onClick }) {
    let el = document.createElement(kind);
    if (text) el.textContent = text;
    if (className) el.classList.add(className);
    if (onClick) el.addEventListener('click', onClick, { once: true });

    return el;
  }

  constructYesButton() {
    let yesBtn = this.makeElement({
      kind: 'button',
      text: 'Yes',
      className: 'text-btn',
      onClick: (el) => {
        if (this.currentState === 'hasCopiedCode') {
          this.currentState = 'clickedYes';
          this.constructFeedbackForm();
        }
      },
    });

    return yesBtn;
  }

  constructNoButton() {
    let noBtn = this.makeElement({
      kind: 'button',
      text: 'No',
      className: 'text-btn',
      onClick: (el) => {
        if (this.currentState === 'hasCopiedCode') {
          this.currentState = 'clickedNo';
          this.constructFeedbackForm();
        }
      },
    });
    return noBtn;
  }

  // We create somedom elements that constitut a feedbackform each element here
  // needs to have a uuid so that we can pull the value out of the dom once the
  // user has submitted the feedback.
  constructFeedbackForm() {
    console.log('this current state is ', this.currentState);
    if (
      this.currentState === 'clickedNo' ||
      this.currentState === 'clickedYes'
    ) {
      const container = this.makeElement({ kind: 'div', className: 'form' });
      const prompt = this.makeElement({
        kind: 'div',
        text: 'Any way we can improve?',
      });

      const textForm = this.makeElement({
        kind: 'textarea',
      });

      const sendButton = this.makeElement({
        kind: 'button',
        className: 'text-btn',
        text: 'Send',
        onClick: (e) => {
          console.log(textForm.value);
          this.wasThisHelpfulContainer.innerHTML = "<div>Thank you for your feedback!</div>"
        },
      });

      container.appendChild(prompt);
      container.appendChild(textForm);
      container.appendChild(sendButton);

      this.wasThisHelpfulContainer.appendChild(container);
      this.currentState = 'hasOpenedFeedbackForm';
    }
  }

  /**
   * submitFeedbackForm pulls user feedback out of the dom and sends the content
   * to amplitude
   *
   * */
  submitFeedbackForm() {}
}

// flow
//
// 1. every code snippet copy button gets a click listener
// 1a. on click, we greate a new SnippetFeedback
// 1b. we store the associated snippt in the class,

function init() {
  // add event listeners to all code snippets on page

  const snippets = document.querySelectorAll('code.hljs');
  [...snippets].forEach((snippetBlock) => {
    snippetBlock.addEventListener(
      'click',
      (pointerEvent) => {
        let snippetElement = pointerEvent.target;
        const snippetFeedback = new SnippetFeedback(snippetElement);
      },
      { once: true },
    );
  });
}

$(() => {
  init();
});
