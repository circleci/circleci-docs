# Local Development Instructions

There are two ways to work on CircleCI docs locally: with Docker and with [Ruby](https://www.ruby-lang.org/en/)/[Bundler](https://bundler.io/).

## 1. Local Development with Docker (recommended)

If you are planning on making a pull request, please see the [pull request](https://github.com/circleci/circleci-docs/blob/master/docs/local-development.md#submitting-pull-requests) instructions first.

1. Install Docker for your platform: <https://docs.docker.com/engine/install/>
2. Clone the CircleCI docs repo: `git clone https://github.com/circleci/circleci-docs.git`
3. Start Docker Desktop
4. Add the following line to your `/etc/hosts` file:
   ```bash
   127.0.0.1 ui.circleci.com
   ```
5. Run `yarn install` to fetch dependencies
_(Learn how to install yarn on your machine [here](https://classic.yarnpkg.com/lang/en/docs/install/).)_
6. Run `yarn start` to create needed js assets & build the static site in Docker
_(Warning: This may take up to 10 minutes to build)_
8. The docs site will now be running on <https://ui.circleci.com/docs/>. If the browser displays a HSTS Security Warning, you can safely bypass it as it is an expected outcome of running the Caddy Reverse Proxy in Docker.
9. To gracefully stop the running commands you can CTRL-C.

**Note:** In the event you find yourself needing to cleanup docker/jekyll cache, you can use the `yarn clean` command.

## 2. Local Development with Ruby and Bundler

If you already have a stable Ruby environment (currently Ruby 2.7.4) and feel comfortable installing external dependencies, you can follow these instructions. Check out the [Gemfile](https://github.com/circleci/circleci-docs/blob/master/Gemfile) for the Ruby version we are currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

1. Install Docker for your platform: <https://docs.docker.com/engine/install/>
2. Clone the CircleCI docs repo: `git clone https://github.com/circleci/circleci-docs.git`
3. Start Docker Desktop
4. Add the following line to your `/etc/hosts` file:
   ```bash
   127.0.0.1 ui.circleci.com
   ```
5. Run `bundle install`. You will need to have [Bundler](https://bundler.io/) installed on your local machine.
6. Run `yarn install`. You will need to have [Yarn](https://yarnpkg.com/getting-started) installed on your local machine.
7. Finally, run `yarn dev` to start the site.
8. The docs site will now be running on <https://ui.circleci.com/docs/>. If the browser displays a HSTS Security Warning, you can safely bypass it, as it is an expected outcome of running the Caddy Reverse Proxy in Docker.
9. To gracefully stop the running commands you can CTRL-C.

**Note:** In the event you find yourself needing to cleanup jekyll cache, you can use the `yarn dev-clean` command.

## Submitting Pull Requests

If you want to submit a pull request to update the docs, you'll need to [make a fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of this repo and follow the steps described in the [Local Development with Docker](https://github.com/circleci/circleci-docs/blob/master/docs/local-development.md#1-local-development-with-docker-recommended) section. After you are finished with your changes, please follow our [Contributing Guide](CONTRIBUTING.md) to submit a pull request.

Please note at this time, for maintenance and security reasons, we cannot accept any articles or examples that require the use of third party tools, such as third party orbs.

## Building js assets

Our js assets are compiled by webpack and put into a place where the jekyll build can find them.

Anytime you are working on js be sure to run:

```bash
$ yarn install
$ yarn start
```

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

## Markdownlinter

Prerequisites:

- Installed npm packages at the root of the repository `yarn install`
- Installed gems at the root of the repository `bundle install`

You can lint the markdown using the [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

```bash
.PATH=$(yarn bin):$PATH markdownlint-cli2 jekyll/_cci2/*.md
```

You can also autofix the issues by adding `fix: true` to the configuration file `.markdownlint-cli2.jsonc`.

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

## Updating the API Reference

Our API is handled in two possible places currently:
- [Old version](https://circleci.com/docs/api/v1-reference/) - This currently
  accessible via the CircleCI landing page > Developers Dropdown > "Api"
- [New Version using Slate](https://circleci.com/docs/api/v1/#section=reference) -
  A newer API guide, built with [Slate](https://github.com/lord/slate)

**What is Slate?**

Slate is a tool for generating API documentation. Slate works by having a user
clone or fork its Github Repo, having the user fill in the API spec into a
`index.html.md` file, and then generating the static documentation using Ruby
(via `bundler`).

**How do we use Slate?**

We have cloned slate into our docs repo ("vendored" it) so that the whole
project is available under `circleci-docs/src-api`. Because Slate is not a
library, it is required that we vendor it and use its respective build
steps to create our API documentation.

**Making changes to the documentation**

When it comes time to make changes to our API, start with the following:

- All changes to the API happen in `circleci-docs/src-api/source/` folder.
- Our API documentation is broken up into several documents in the `source/includes` folder. For example, all API requests related to `Projects` are found in the `circleci-docs/src-api/source/includes/_projects.md` file.
- Within the `/source` folder, the `index.html.md` has an `includes` key in the front matter. The includes key gathers the separated files in the `includes` folder and merges them into a single file at build time.
- Because Slate builds the entire API guide into a _single html_ file, we can view the artifact file on CircleCI whenever a build is run.

The following is an example workflow to contribute to a document (from Github, no less):

- Navigate to the file you want to edit (example: [`src-api/source/includes/_projects.md`](https://github.com/circleci/circleci-docs/blob/master/src-api/source/includes/_projects.md))
- Click the `edit` button on GitHub and make your changes.
- Commit your changes and submit a PR.
- Go to the CircleCI web app, find the build for the latest commit for your PR
- Go to the `Artifacts` tab and navigate to `circleci-docs/api/index.html` to view the built file.

**Local Development with Slate**

- If you want to see your changes live before committing them, `cd` into
  `src-api` and run `bundle install` followed by `bundle exec middleman server`.
- You may need a specific version of Ruby for bundler to work (2.3.1).

## Updating `browserlist-stats.json`

We use `browserslist-ga-export` to generate a browserslist custom usage data file based on Google Analytics data. In order to do this, you must provide a CSV export of a Google Analytics custom report:

- In Google Analytics, create a custom report as explained [here](https://github.com/browserslist/browserslist-ga-export#2-create-custom-report). Make sure you choose one year as the desired date range.
- Export the custom report as a CSV like explained [here](https://github.com/browserslist/browserslist-ga-export#3-export-custom-report-csv-files).
- Locally, install [`browserlist-ga-export`](https://github.com/browserslist/browserslist-ga-export#browserslist-ga-export)
- Run `browserslist-ga-export --reportPath YOUR_CSV_LOCATION.csv` at the root of the project. You should see this message when it is done: `browserslist-ga-export: browserslist-stats.json has been updated.`
- run `npx browserslist` to confirm the new `browserlist-stats.json` is still valid.
