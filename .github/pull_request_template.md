> [!NOTE]
> You may find that there are errors for the `vale/lint` job that are unrelated to your change.
> Vale checks the whole file when a change is made so if there are existing issues on the page they will be flagged.
> You can ignore lint errors outside your changes and the CircleCI docs team will address them for you.
> Vale logs are advisory to help all contributors create content that conforms to our style guide. The `vale/lint` job will not prevent changes from being published.

# Description
What did you change?

# Reasons
Why did you make these changes? What problem does this solve?

# Content checks
Please follow our style when contributing to CircleCI docs. View our [style guide](https://circleci.com/docs/style/style-guide-overview) or check out our [CONTRIBUTING.md](../CONTRIBUTING.md) for more information.

**Preview your changes:**
- [ ] View the Vale linter results, select the `ci/circleci: lint` job at the bottom of your PR. You will be redirected to the `vale/lint` job output in CircleCI.
- [ ] Preview your changes, select the `ci/circleci: build` job at the bottom of your PR and you will be redirected to CircleCI. Select the Artifacts tab and select `index.html` to open a preview version of the docs site built for your latest commit.

Take a moment to check through the following items when submitting your PR (this is just a guide so will not be relevant for all PRs):

**Content structure:**
- [ ] Break up walls of text by adding paragraph breaks.
- [ ] Consider if the content could benefit from more structure, such as lists or tables, to make it easier to consume.
- [ ] Consider whether the content would benefit from more subsections (h2-h6 headings) to make it easier to consume.
- [ ] Include relevant backlinks to other CircleCI docs/pages.

**Formatting:**
- [ ] Keep the title between 20 and 70 characters.
- [ ] Check all headings h1-h6 are in sentence case (only first letter is capitalized).
