

## Submitting Pull Requests

If you want to submit a pull request to update the docs, you'll need to [make a fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of this repo and follow the steps described in the [Local Development with Docker](https://github.com/circleci/circleci-docs/blob/master/docs/local-development.md#1-local-development-with-docker-recommended) section. After you are finished with your changes, please follow our [Contributing Guide](CONTRIBUTING.md) to submit a pull request.

Please note at this time, for maintenance and security reasons, we cannot accept any articles or examples that require the use of third party tools, such as third party orbs.

## First Run

To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
git clone --recurse-submodules https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
JEKYLL serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to keep things efficient.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

## Editing Docs Locally

Currently all CircleCI docs are located in `circleci-docs/jekyll/_cci2`.

1. Create a branch and switch to it:

    `git checkout -b <branch-name>`

2. Add or modify Asciidoc and Markdown files in these directories according to our [style guide](https://circleci.com/docs/style/style-guide-overview).

3. When you're happy with your changes, commit them with a message summarizing what you did:

    `git commit -am "commit message"`

4. Push your branch up:

    `git push origin <branch-name>`

## Adding New Articles

New articles can be added to the [jekyll/_cci2](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2) directory in this repo.

When you make a new article, you'll need to add [**front matter**](https://jekyllrb.com/docs/frontmatter/). This contains metadata about the article you're writing and is required so everything works on our site.

Front matter for our docs will look something like:

```
---
layout: classic-docs
title: "Your Doc Title"
description: "Short description of what is included on the page"
---
```

`layout` and `title` are the only required variables. `layout` describes visual settings shared across our docs. `title` will appear at the top of your article and appear in hyphenated form for the URL.

The remaining variables (`categories`, `short-title`, and `order`) are deprecated and no longer used in documentation. Navigation links to each article are manually added to category landing pages. If you're having trouble deciding where to put an article, a CircleCI docs lead can help.

### Headings & Tables of Contents

Jekyll will automatically convert your article's title into a level one heading (#), so we recommend using level two (##), level three (###) and level four (####) headings when structuring your article.

## Docker Tag List for CircleCI Convenience Images

The Docker tag list for convenience images, located in ./jekyll/_cci2/circleci-images.md, is dynamically updated during a CircleCI build.
There's usually no need to touch this.
If you'd like to see an updated list generated locally however, you can do so by running `./scripts/pull-docker-image-tags.sh` from the root of this repo.
Note that you'll need the command-line tool [jq](https://stedolan.github.io/jq/) installed.



## Updating `browserlist-stats.json`

We use `browserslist-ga-export` to generate a browserslist custom usage data file based on Google Analytics data. In order to do this, you must provide a CSV export of a Google Analytics custom report:

- In Google Analytics, create a custom report as explained [here](https://github.com/browserslist/browserslist-ga-export#2-create-custom-report). Make sure you choose one year as the desired date range.
- Export the custom report as a CSV like explained [here](https://github.com/browserslist/browserslist-ga-export#3-export-custom-report-csv-files).
- Locally, install [`browserlist-ga-export`](https://github.com/browserslist/browserslist-ga-export#browserslist-ga-export)
- Run `browserslist-ga-export --reportPath YOUR_CSV_LOCATION.csv` at the root of the project. You should see this message when it is done: `browserslist-ga-export: browserslist-stats.json has been updated.`
- run `npx browserslist` to confirm the new `browserlist-stats.json` is still valid.
