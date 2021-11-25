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
          this.trackYesOrNoButton('yes');
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
          this.trackYesOrNoButton('no');
          this.constructFeedbackForm();
        }
      },
    });
    return noBtn;
  }

  trackYesOrNoButton(yesOrNoString) {
    // actions we track are: "docs-snippet-helpful-no"  and "docs-snippet-helpful-yes"
    window.AnalyticsClient.trackAction(
      `docs-snippet-helpful-${yesOrNoString}`,
      {
        originatingSnippet: this.snippetElement.textContent,
        wasHelpful: yesOrNoString,
        timeOfButtonClick: Date.now(),
      },
    );
  }

  trackFormSubmission(formContent) {
    window.AnalyticsClient.trackAction(`docs-snippet-helpful-form-submission`, {
      originatingSnippet: this.snippetElement.textContent,
      feedback: formContent,
      // for diffing this against the time that the trackYesOrNoButton was clicked
      // as well as possible the time the copy code button was clicked (TODO add that)
      timeOfFormSubmission: Date.now(),
    });
  }

  // We create somedom elements that constitut a feedbackform each element here
  // needs to have a uuid so that we can pull the value out of the dom once the
  // user has submitted the feedback.
  constructFeedbackForm() {
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
        onClick: () => {
          this.trackFormSubmission(textForm.value);
          this.wasThisHelpfulContainer.innerHTML =
            '<div>Thank you for your feedback!</div>';
        },
      });

      container.appendChild(prompt);
      container.appendChild(textForm);
      container.appendChild(sendButton);

      this.wasThisHelpfulContainer.appendChild(container);
      this.currentState = 'hasOpenedFeedbackForm';
    }
  }
}

/**
 * init queries the dom for all snipppets
 * TODO: when that snippet's COPY CODE button is clicked...
 *
 * */
function init() {
  // add event listeners to all code snippets on page

  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_docs_snippet_feedback_experiment_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '.hljs',
  }).then((variation) => {
    if (variation === 'treatment') {
      const snippets = document.querySelectorAll('code.hljs');
      [...snippets].forEach((snippetBlock) => {
        snippetBlock.addEventListener(
          'click',
          (pointerEvent) => {
            let snippetElement = pointerEvent.target;
            new SnippetFeedback(snippetElement);
          },
          { once: true },
        );
      });
    }
  });
}

$(() => {
  init();
});
