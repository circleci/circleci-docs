/**
 * The SnippetFeedback class is responsible for dynamically adding a user
 * feedback form whenever a user clicks on the "copy code" button.
 *
 * This class is instantiated for each snippet in a page.
 * Most of the methods are for dynamically adding dom elements for
 * capturing user feedback.
 *
 * */
export class SnippetFeedback {
  constructor(snippetElement) {
    // Dom elements
    this.snippetElement = snippetElement;
    this.codeSnippetContainer = null;
    this.wasThisHelpfulContainer = null;
    this.feedbackForm = null;
    // For tracking user's response to be included in the final feedback form.
    this.wasThisHelpful = null;
    this.renderWasThisHelpfulPrompt();
  }

  // -- Render functions
  // These are responsible for constructing and attaching new dom elements
  // based on the user's flow in the feedback process.
  //

  /**
   * Construct a "Was this helpful" line, and inject it below the code snippet.
   */
  renderWasThisHelpfulPrompt() {
    this.codeSnippetContainer = this.snippetElement.closest('div.highlight');
    // Create some dom elements:
    const container = this.makeElement({
      kind: 'div',
      className: 'was-this-helpful',
    });
    const textPrompt = this.makeElement({
      kind: 'span',
      text: 'Was this helpful?',
    });
    const slash = this.makeElement({ kind: 'span', text: ' / ' });
    const yesButton = this.renderYesNoButton({ text: 'yes' });
    const noButton = this.renderYesNoButton({ text: 'no' });
    // append dom nodes.
    container.appendChild(textPrompt);
    container.appendChild(yesButton);
    container.appendChild(slash);
    container.appendChild(noButton);
    this.wasThisHelpfulContainer = container;
    this.codeSnippetContainer.appendChild(container);
  }

  /**
   * Creates the dom element for the yes/no button in the prompt.
   * */
  renderYesNoButton({ text }) {
    let yesBtn = this.makeElement({
      kind: 'button',
      text,
      className: 'text-btn',
      onClick: () => {
        this.wasThisHelpful = text;
        this.trackYesOrNoButton(text);
        // only pop up the form if it has not yet been created.
        if (this.feedbackForm == null) {
          this.renderFeedbackForm();
        }
      },
    });

    return yesBtn;
  }

  /**
   * Renders a feedback form to the user, provided they have clicked
   * on a "yes" or "no" button in the 'was this helpful' prompt.
   * */
  renderFeedbackForm() {
    if (!this.feedbackForm) {
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
    }
  }

  // -- Trackers --
  // These are responsible for sending data based on user input
  // to amplitude.

  /**
   * trackYesOrNoButton sends a trackAction to aplitude.
   * actions are: "docs-snippet-helpful-no"  and "docs-snippet-helpful-yes"
   * */
  trackYesOrNoButton(yesOrNoString) {
    window.AnalyticsClient.trackAction(
      `docs-snippet-helpful-${yesOrNoString}`,
      {
        originatingSnippet: this.snippetElement.textContent,
        wasHelpful: yesOrNoString,
        timeOfButtonClick: Date.now(),
      },
    );
  }

  /**
   * `trackFormSubmission` invokes trackAction with a payload of the original
   * snippet, the feedback of the user, and the timeOfFormSubmission.
   * */
  trackFormSubmission(formContent) {
    window.AnalyticsClient.trackAction(`docs-snippet-helpful-form-submission`, {
      originatingSnippet: this.snippetElement.textContent,
      feedback: formContent,
      wasThisHelpful: this.wasThisHelpful,
      // for diffing this against the time that the trackYesOrNoButton was clicked
      // as well as possible the time the copy code button was clicked (TODO add that)
      timeOfFormSubmission: Date.now(),
    });
  }

  // -- Helpers --

  /**
   * Construct a dom element, setting classes, text content, class, onclick etc.
   * */
  makeElement({ kind, text, className, onClick }) {
    let el = document.createElement(kind);
    if (text) el.textContent = text;
    if (className) el.classList.add(className);
    if (onClick) el.addEventListener('click', onClick, { once: true });

    return el;
  }
}

/**
 * init queries the dom for all snipppets
 * TODO(blocked): when that snippet's COPY CODE button is clicked... (waiting for graduation of copy code buttons)
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
