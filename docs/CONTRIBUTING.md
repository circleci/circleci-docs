Thank you for your interest in contributing to the CircleCI documentation.

# CircleCI Documentation Values

There is never enough time to do everything we want to do so we prioritize issues according to the following four categories, in decreasing importance:

1. Correct: documentation should be accurate.
2. Current: documentation should be up-to-date.
3. Consistent: documentation should not conflict with itself.
4. Clear: documentation should be clear.

These values apply to both new and existing documentation.

# Contributing to CircleCI Docs

We welcome all contributions to CircleCI documentation.
These contributions come in two forms: issues and pull requests.

## Issues

If you spot anything that conflicts with our values, opening a GitHub Issue is a great way to give us specific feedback.

To make an issue, refer to the [GitHub Issues Workflow](https://github.com/circleci/circleci-docs/wiki/GitHub-Issues-Workflow) wiki page.

## Pull Requests

If you feel motivated, you can make documentation changes and submit a pull request.

For minor changes like typos, click "Suggest an edit to this page", located at the bottom of each document.
This will take you to the source file on GitHub, where you can submit a pull request for your changes.

For larger edits or new documents, [you can choose to edit docs locally](#editing-docs-locally).
When you are satisfied with your changes, create a pull request from your branch by following [GitHub's guide](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

Regardless of the size of your change, do read through our [Style Guide](https://circleci.com/docs/style/style-guide-overview).

Please note at this time, for maintenance and security reasons, we cannot accept any articles or examples that require the use of third party tools, such as third party orbs.

### Titles and Descriptions

Pull request titles should be descriptive enough for reviewers to understand *what* is being changed.
Some ways of doing this are better than others:

| Original Pull Request Title | Better Title                                                               |
|-----------------------------|----------------------------------------------------------------------------|
| _Updating file.md_          | _Indicate support for environment variables in context paths_            |
| _Sidebar changes_           | _Move Deployment to its own navigation section for better organization_  |

Every pull request should have a description that explains *why* the change is being made.
The description adds context that is critical for reviewers when giving feedback.

For more tips, see GitHub's blog entry on [how to write the perfect pull request](https://github.com/blog/1943-how-to-write-the-perfect-pull-request).

## Editing Docs Locally

If you want to submit a pull request to update the docs, you will need to [make a fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of this repo and clone it.

Currently all CircleCI docs are located in `circleci-docs/jekyll/_cci2`.

1. Create a branch and switch to it:

    `git checkout -b <branch-name>`

2. Add or modify Asciidoc and Markdown files in these directories according to our [style guide](https://circleci.com/docs/style/style-guide-overview).

3. When you are happy with your changes, commit them with a message summarizing what you did:

    `git commit -am "commit message"`

4. Push your branch up:

    `git push origin <branch-name>`

## Adding New Articles

New articles can be added to the [jekyll/_cci2](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2) directory in this repo.

We are slowly converting all oue content over to the Asciidoc format. So all new pages should be submitted in Asciidoc.

When you make a new article, you will need to add some [**document attributes**](https://docs.asciidoctor.org/asciidoc/latest/attributes/document-attributes/) and [**front matter**](https://jekyllrb.com/docs/frontmatter/). These contains metadata about the article you are writing and are required so everything works on our site.

Document attributes and Front matter for our docs will look something like:

```
---
version:
- Server v4.x
- Admin
---
= Page title
:page-layout: classic-docs
:page-liquid:
:page-description: A short description of the content on the page.
```

`page-layout` and the page title are the only required variables. `page-layout` associates an HTML layout with the page, `classic-docs` is used across our docs. `title` will appear at the top of your article.

## Docker Tag List for CircleCI Convenience Images

The Docker tag list for convenience images, located in ./jekyll/_cci2/circleci-images.md, is dynamically updated during a CircleCI build.
There's usually no need to touch this.
If you would like to see an updated list generated locally however, you can do so by running `./scripts/pull-docker-image-tags.sh` from the root of this repo.
Note that you will need the command-line tool [jq](https://stedolan.github.io/jq/) installed.

## Updating `browserlist-stats.json`

We use `browserslist-ga-export` to generate a browserslist custom usage data file based on Google Analytics data. In order to do this, you must provide a CSV export of a Google Analytics custom report:

- In Google Analytics, create a custom report as explained [here](https://github.com/browserslist/browserslist-ga-export#2-create-custom-report). Make sure you choose one year as the desired date range.
- Export the custom report as a CSV like explained [here](https://github.com/browserslist/browserslist-ga-export#3-export-custom-report-csv-files).
- Locally, install [`browserlist-ga-export`](https://github.com/browserslist/browserslist-ga-export#browserslist-ga-export)
- Run `browserslist-ga-export --reportPath YOUR_CSV_LOCATION.csv` at the root of the project. You should see this message when it is done: `browserslist-ga-export: browserslist-stats.json has been updated.`
- run `npx browserslist` to confirm the new `browserlist-stats.json` is still valid.

