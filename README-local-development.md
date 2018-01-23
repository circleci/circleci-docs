There are two ways to work on CircleCI docs locally: with Docker and with Ruby/Bundler.

# 1. Local Development with Docker (recommended)

1. Install Docker for you platform: <https://docs.docker.com/engine/installation/>
2. Clone the CircleCI docs repo: `git clone https://github.com/circleci/circleci-docs.git`
3. `cd` into the directory where you cloned the docs
4. run `docker-compose up`
5. The docs site will now be running on <http://localhost:4000/docs/>

**Note:** If you want to submit a pull request to update the docs, you'll need to [make a fork](https://github.com/circleci/circleci-docs#fork-destination-box) of this repo and clone your version in step 2 above. Then when you push your changes to your fork you can submit a pull request to us.

# 2. Local Development with Ruby and Bundler (alternative to Docker)

If you already have a stable Ruby environment (currently Ruby 2.3.3) and feel comfortable installing dependencies, install Jekyll by following [this guide](https://jekyllrb.com/docs/installation/).

Check out the [Gemfile](Gemfile) for the Ruby version we're currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

We also use a gem called [HTMLProofer](https://github.com/gjtorikian/html-proofer) to test links, images, and HTML. The docs site will need a passing build to be deployed, so use HTMLProofer to test everything before you push changes to GitHub.

You're welcome to use [Bundler](http://bundler.io/) to install these gems.

## First Run

To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
jekyll serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to keep things efficient.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

# Editing Docs Locally

The docs site includes Bootstrap 3 JS and CSS, so you'll have access to all of its [reusable components](https://v4-alpha.getbootstrap.com/components/alerts/).

All docs live in folders named after the version of CircleCI. The only two you need to worry about are `jekyll/_cci1` and `jekyll/_cci2`. These correspond to CircleCI Classic and CircleCI 2.0, respectively.

1. Create a branch and switch to it:

    `git checkout -b <branch-name`

2. Add or modify Markdown files in these directories according to our [style guide](CONTRIBUTING#style-guide).

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
short-title: "Short Title"
categories: [category-slug]
order: 10
---
```

`layout` and `title` are the only required variables. `layout` describes visual settings shared across our docs. `title` will appear at the top of your article and appear in hypenated form for the URL.

The remaining variables (`categories`, `short-title`, and `order`) are deprecated and no longer used in documentation. Navigation links to each article are manually added to category landing pages. If you're having trouble deciding where to put an article, a CircleCI docs lead can help.

### Headings & Tables of Contents

Jekyll will automatically convert your article's title into a level one heading (#), so we recommend using level two (##), level three (###) and level four (####) headings when structuring your article.

If your article has more than three headings after the title, please use a table of contents. To add a table of contents, use the following reference name:

```
* TOC
{:toc}
```

This will create an unordered list for every heading level in your article (the `* TOC` line will not display).

If you want to exclude a heading from a TOC, you can specify that with another reference name:

```
# Not in the TOC
{:.no_toc}
```

# Submitting Pull Requests

After you are finished with your changes, please follow our [Contributing Guide](CONTRIBUTING.md) to submit a pull request.
