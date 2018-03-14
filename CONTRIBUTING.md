Thank you for your interest in contributing to the CircleCI documentation.

**As of March 2017, we are currently focusing on creating new documentation for CircleCI 2.0. Documentation for 1.0 will continue to be improved, but will go into maintenance mode in the coming months. If you're considering contributing a completely new article, we encourage you to contribute to the 2.0 documentation found at <https://circleci.com/docs/2.0/> or in this repo in `/jekyll/_cci2/`.**

# CircleCI Documentation Values

There is never enough time to do everything we want to do. That's why we prioritize issues according to the following four categories, in decreasing importance:

1. Correct: documentation should be accurate.
2. Current: documentation should be up-to-date.
3. Consistent: documentation should not conflict with itself.
4. Clear: documentation should be clear.

We use these values when creating new documentation and fixing old documentation.

# Contributing to CircleCI Docs

There are a couple of ways to contribute to our documentation. For suggestions and feedback, please [open an issue](#open-an-issue). For edits or new articles, please [submit a pull request](#submit-a-pull-request).

## Open an Issue

If you spot anything that conflicts with our values, you can open an issue by clicking **Open an issue about this page**, located at the bottom of each article. In the issue's text, please let us know what needs fixing or suggest changes.

## Submit a Pull Request

**Pull Requests for clarifications, technical accuracy, spelling fixes, and grammar improvements, are always welcome.**

For minor changes like typos, you can click **Edit the file in your fork of this project**, located at the right of each article. This will take you to the source file on GitHub, where you can submit a pull request for your change through the UI.

For larger edits or new articles, you'll want to [set up a local environment](README-local-development.md) for editing or adding articles. When you are finished with your changes, create a pull request from your branch by following [GitHub's guide](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

In order to help those watching for new modifications and additions to the documentation, it is suggested that your pull request title be descriptive enough to help those watching the repository get a general idea of what is being changed and why. Adding a description with more information&mdash;if necessary&mdash;is a bonus!

| Original Pull Request Title | Better Title                                                               |
|-----------------------------|----------------------------------------------------------------------------|
| _Updating file.md_          | _Indicate support for environment variables in context paths_            |
| _Sidebar changes_           | _Move Deployment to its own navigation section for better organization_  |

For more tips, see GitHub's blog entry on [how to write the perfect pull request](https://github.com/blog/1943-how-to-write-the-perfect-pull-request).

# Style Guide

We also have a short list of guidelines that take precedence over the general guide above. We don't have a lot of rules, but we do try to be consistent with the ones we have.

## Markdown

To keep the emphasis on prose, use [markdown](http://commonmark.org/help/) over plain HTML.

## Bold and Terms

Reserve bolding for terms that are defined either in our [glossary](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2/glossary.md/) or on an external site.

## Word Preferences

As in any language, there are many ways to say things. This is usually liberating but, in documentation, consistency rules. Below is a list of CircleCI-specific word preferences.

### Referencing CircleCI

When referring to CircleCI as a company or group,
always use "CircleCI".
Never use "we".

### Recommending User Actions

When recommending a user action,
use "consider" instead of "we recommend" or "we suggest".
Never say "please".
