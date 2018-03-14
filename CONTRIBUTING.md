Thank you for your interest in contributing to the CircleCI documentation.

**As of March 2017, we are currently focusing on creating new documentation for CircleCI 2.0. Documentation for 1.0 will continue to be improved, but will go into maintenance mode in the coming months. If you're considering contributing a completely new article, we encourage you to contribute to the 2.0 documentation found at <https://circleci.com/docs/2.0/> or in this repo in `/jekyll/_cci2/`.**

# CircleCI Documentation Values

There is never enough time to do everything we want to do.
That's why we prioritize issues according to the following four categories, in decreasing importance:

1. Correct: documentation should be accurate.
2. Current: documentation should be up-to-date.
3. Consistent: documentation should not conflict with itself.
4. Clear: documentation should be clear.

These values apply to both new and existing documentation.

# Contributing to CircleCI Docs

We welcome all contributions to CircleCI documentation.
These contributions come in two forms: issues and pull requests.

## Issues

If you spot anything that conflicts with our values,
open an issue by clicking "Open an issue about this page",
located at the bottom of each document.
In the issue's description, describe the issue you found.
Someone on the documentation team will label the issue
and may ask you for more details.

## Pull Requests

If you feel motivated,
you can make documentation changes
and submit a pull request.

For minor changes like typos,
click "Suggest an edit to this page",
located at the bottom of each document.
This will take you to the source file on GitHub,
where you can submit a pull request for your changes.

For larger edits or new documents,
[set up a local environment](README-local-development.md).
When you are satisfied with your changes,
create a pull request from your branch
by following [GitHub's guide](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

### Titles and Descriptions

Pull request titles should be descriptive enough
for reviewers to understand *what* is being changed.
Some ways of doing this are better than others:

| Original Pull Request Title | Better Title                                                               |
|-----------------------------|----------------------------------------------------------------------------|
| _Updating file.md_          | _Indicate support for environment variables in context paths_            |
| _Sidebar changes_           | _Move Deployment to its own navigation section for better organization_  |

Every pull request should have a description
that explains *why* the change is being made.
The description adds context
that is critical for reviewers when giving feedback.

For more tips, see GitHub's blog entry on [how to write the perfect pull request](https://github.com/blog/1943-how-to-write-the-perfect-pull-request).

# Style Guide

We do not have a lot of rules,
but we do consistently apply them.

## Markdown

To keep the emphasis on prose,
use markdown instead of plain HTML.
Refer to the [Markdown documentation](https://daringfireball.net/projects/markdown/syntax) for more details.

## Links

### Explicit Names

Link text should explicitly name the document or section
to which it is linking.

For example,
if you reference a section called "Adding Environment Variables in the App",
write, "Refer to the 'Adding Environment Variables in the App' section of the Environment Variables document."

### Reference Links

For ease of reviewing,
use **inline** links instead of **reference** links.
Refer to the [Link section](https://daringfireball.net/projects/markdown/syntax#link) of the Markdown documentation for more details.

## Bold and Terms

Reserve bolding for terms that are defined either in our [glossary](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2/glossary.md/) or on an external site.

## Word Preferences

As in any language, there are many ways to say things.
This is usually liberating but, in documentation, consistency rules.
Below is a list of CircleCI-specific word preferences.

### Referencing CircleCI

When referring to CircleCI as a company or group,
always use "CircleCI".
Never use "we".

### Recommending User Actions

When recommending a user action,
use "consider" instead of "we recommend" or "we suggest".
Never say "please".
