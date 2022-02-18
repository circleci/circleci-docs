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
  constructor(codeSnippetContainer, snippetIndex) {
    // Dom elements
    this.snippetIndex = snippetIndex + 1; // let's offset 0 based indexes for data analysis.
    this.codeSnippetContainer = codeSnippetContainer;
    this.wasThisHelpfulContainer = null;
    this.feedbackForm = null;
    this.currCharCount = 0;
    this.currCharCountElement = this._makeElement({ kind: 'div' });
    this.formIsValid = false;
    this._renderCharCount();
    // For tracking user's response to be included in the final feedback form.
    this.wasThisHelpful = null;
    this.yesBtnEl = null;
    this.noBtnEl = null;
    this.wasThisHelpfulSelectedEl = null;
    this._renderWasThisHelpfulPrompt();
  }

  static get MAX_CHAR_COUNT() {
    return 240;
  }

  // -- Render functions
  // These are responsible for constructing and attaching new dom elements
  // based on the user's flow in the feedback process.
  //

  /**
   * Construct a "Was this helpful" line, and inject it below the code snippet.
   */
  _renderWasThisHelpfulPrompt() {
    // Create some dom elements:
    const container = this._makeElement({
      kind: 'div',
      className: 'was-this-helpful',
    });
    const textPrompt = this._makeElement({
      kind: 'span',
      className: 'prompt',
      text: 'Was this code helpful?',
    });
    const slash = this._makeElement({ kind: 'span', text: ' /' });
    this.yesBtnEl = this._renderYesNoButton({ text: 'Yes' });
    this.noBtnEl = this._renderYesNoButton({ text: 'No' });
    // append dom nodes.
    container.appendChild(textPrompt);
    container.appendChild(this.yesBtnEl);
    container.appendChild(slash);
    container.appendChild(this.noBtnEl);
    this.wasThisHelpfulContainer = container;
    this.codeSnippetContainer.appendChild(container);
  }

  /**
   * Creates the dom element for the yes/no button in the prompt.
   * */
  _renderYesNoButton({ text }) {
    let yesNoBtn = this._makeElement({
      kind: 'button',
      text,
      className: 'text-btn',
    });

    yesNoBtn.onclick = () => {
      this.wasThisHelpful = text;
      this.wasThisHelpfulSelectedEl = yesNoBtn;
      this.wasThisHelpfulSelectedEl.classList.add('active');
      this._trackYesOrNoButton(text);
      // only pop up the form if it has not yet been created.
      if (this.feedbackForm == null) {
        this._renderFeedbackForm();
      }
    };

    return yesNoBtn;
  }

  /**
   * Renders a feedback form to the user, provided they have clicked
   * on a "yes" or "no" button in the 'was this helpful' prompt.
   * */
  _renderFeedbackForm() {
    this.currCharCount = 0;
    this._renderCharCount();
    if (!this.feedbackForm) {
      // start by constructing our dom elements
      const container = this._makeElement({ kind: 'div', className: 'form' });
      const prompt = this._makeElement({
        kind: 'div',
        className: 'can-we-improve',
        text: 'Any way we can improve?',
      });

      const textForm = this._makeElement({
        kind: 'textarea',
      });
      textForm.placeholder = 'Your feedback...';
      textForm.maxLength = SnippetFeedback.MAX_CHAR_COUNT;

      const bottomRow = this._makeElement({
        kind: 'div',
        className: 'bottom-row',
      });

      const sendButton = this._makeElement({
        kind: 'button',
        className: 'send-btn invalid', // send btn starts invalid as there is no user feedback yet.
        text: 'Send',
        onClick: () => {
          if (this.formIsValid) {
            this._trackFormSubmission(textForm.value);
            this.wasThisHelpfulContainer.innerHTML =
              '<div style="padding-bottom: 2px;">Thank you for your feedback!</div>';
          }
        },
      });

      textForm.addEventListener('input', () => {
        this.currCharCount = textForm.value.length;
        this.formIsValid = this.currCharCount > 0 ? true : false;

        if (this.formIsValid) {
          sendButton.classList.add('valid');
          sendButton.classList.remove('invalid');
        } else {
          sendButton.classList.remove('valid');
          sendButton.classList.add('invalid');
        }

        // every time the user types we need to re-render the dom content manually.
        this._renderCharCount();
      });

      // build the dom nodes.
      container.appendChild(prompt);
      container.appendChild(textForm);
      bottomRow.appendChild(this.currCharCountElement);
      bottomRow.appendChild(sendButton);
      container.appendChild(bottomRow);
      this.feedbackForm = container;
      this.wasThisHelpfulContainer.appendChild(container);

      // Here we setup the document event listeners that handle hiding the form
      // when the user clicks outside of it.
      //
      // Why use a setTimeout with a timer of 0? -> There is a race condition
      // with the adding of the click listeners to the document that immediately
      // close the form when it opens
      //
      // Setting it to 0 runs the inner callback asynchronously but with not
      // delay- adding it to the event queue so that it executes only after the
      // form is opened.
      setTimeout(() => {
        // if the form no longer exists (ie, after hitting submit), remove the click listener
        if (this.feedbackForm === null) {
          removeClickListener();
        }

        const outsideClickListener = (event) => {
          // if the feedback form no longer exists, remove the click listener:

          // if user clicks outside of the form, but on Yes | No...
          if (event.target === this.noBtnEl) {
            this.yesBtnEl.classList.remove('active');
            this.noBtnEl.classList.add('active');
          } else if (event.target === this.yesBtnEl) {
            this.yesBtnEl.classList.add('active');
            this.noBtnEl.classList.remove('active');
            // if the user clicks _anywhere_ else outside of the form
          } else if (
            this.feedbackForm &&
            !this.feedbackForm.contains(event.target)
          ) {
            this.wasThisHelpfulContainer.removeChild(this.feedbackForm);
            this.feedbackForm = null;
            this.wasThisHelpful = null;
            this.yesBtnEl.classList.remove('active');
            this.noBtnEl.classList.remove('active');
            removeClickListener();
          }
        };

        const removeClickListener = () => {
          document.removeEventListener('click', outsideClickListener);
        };

        document.addEventListener('click', outsideClickListener);
      }, 0);
    }
  }

  /**
   * Render the char count and set its result on the respective element.
   * */
  _renderCharCount() {
    let charCount = this.currCharCount;
    let charCountLimited = Math.min(SnippetFeedback.MAX_CHAR_COUNT, charCount);
    charCount > SnippetFeedback.MAX_CHAR_COUNT
      ? SnippetFeedback.MAX_CHAR_COUNT
      : charCount;
    const el = `
        <div class="charCountRow">
          <span>${charCountLimited} / ${SnippetFeedback.MAX_CHAR_COUNT}</span>
        </div>`;
    this.currCharCountElement.innerHTML = el;
  }

  // -- Trackers --
  // These are responsible for sending data based on user input
  // to amplitude.

  /**
   * _trackYesOrNoButton sends a trackAction to amplitude.
   * actions are: "docs-snippet-helpful-no"  and "docs-snippet-helpful-yes"
   * */
  _trackYesOrNoButton(yesOrNoString) {
    window.AnalyticsClient.trackAction('docs-snippet-helpful', {
      originatingSnippetIndex: this.snippetIndex,
      helpful: yesOrNoString,
      location: window.location.pathname,
    });
  }

  /**
   * `_trackFormSubmission` invokes trackAction with a payload of the original
   * snippet, the feedback of the user, and the timeOfFormSubmission.
   * */
  _trackFormSubmission(formContent) {
    window.AnalyticsClient.trackAction(`docs-snippet-helpful-form-submission`, {
      originatingSnippetIndex: this.snippetIndex,
      feedback: formContent,
      location: window.location.pathname,
      wasThisHelpful: this.wasThisHelpful,
    });

    this.feedbackForm = null;
  }

  // -- Helpers --

  /**
   * Construct a dom element, setting classes, text content, class, onclick etc.
   * */
  _makeElement({ kind, text, className, onClick }) {
    let el = document.createElement(kind);
    if (text) el.textContent = text;
    if (className) el.className = className;
    if (onClick) el.addEventListener('click', onClick);

    return el;
  }
}

/**
 * init queries the dom for all snipppets
 * */
function init() {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20931242909/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_docs_snippet_feedback_experiment_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '.code-toolbar',
  }).then((variation) => {
    if (variation === 'treatment') {
      // NOTE: we are only adding the feedback form only when a user clicks the
      // copy-code button ( we don't add a form until the user copies code. )
      // The textarea forms are removed on submit.
      const copyCodeBtns = document.querySelectorAll(
        '.copy-to-clipboard-button',
      );
      for (let i = 0; i < copyCodeBtns.length; i++) {
        copyCodeBtns[i].addEventListener(
          'click',
          (pointerEvent) => {
            let btn = pointerEvent.target;
            new SnippetFeedback(btn.closest('.code-toolbar'), i);
          },
          { once: true },
        );
      }
    }
  });
}

$(() => {
  init();
});
