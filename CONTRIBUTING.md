Thank you for your interest in contributing to the CircleCI documentation.

**As of March 2017, we are currently focusing on creating new documentation for CircleCI 2.0. Documentation for 1.0 will continue to be improved, but will go into maintenance mode in the coming months. If you're considering contributing a completely new article, we encourage you to contribute to the 2.0 documentation found at <https://circleci.com/docs/2.0/> or in this repo in `/jekyll/_cci2/`.**

# Contributing to CircleCI Docs

There are a couple of ways to contribute to our documentation. For suggestions and feedback, please [open an issue](#open-an-issue). For edits or new articles, please [submit a pull request](#submit-a-pull-request).

## Open an Issue

If a doc is unclear or incorrect, you can open an issue by clicking **Open an issue about this page**, located at the bottom of each article. In the issue's text, please let us know what needs fixing or suggest changes.

## Submit a Pull Request

**Pull Requests for clarifications, technical accuracy, spelling fixes, and grammar improvements, are always welcome.**

For minor changes like typos, you can click **Suggest an edit to this page**, located at the bottom of each article. This will take you to the source file on GitHub, where you can submit a pull request for your change through the UI.

For larger edits or new articles, [fork this repository](https://github.com/circleci/circleci-docs#fork-destination-box), clone the fork to your local machine, then follow the [README](README.md) to set up your local environment.

Come back here when you're ready to start editing!

### Editing Docs Locally

All docs live in folders named after the version of CircleCI. The only two you need to worry about are `jekyll_cci1` and `jekyll/_cci2`, for CircleCI Classic and CircleCI 2.0, respectively.

1. Create a branch and switch to it:

    `git checkout -b <branch-name>`

2. Add or modify the Markdown files in these directories according to the [style guide](#style-guide) below. Rebuild the site when you want to check your work with:

    `./jctl rebuild`

For more detailed instructions on using `jctl`, see [Jekyll Controller Commands](#jekyll-controller-commands).

3. When you're happy with your changes, commit them with a message summarizing what you did:

    `git commit -a -m "commit message"

4. Push your branch up:

    `git push origin <branch-name>`

### Submitting a Pull Request

Create a pull request from your fork by following [GitHub's guide](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

## How To Add a Table of Contents

If your article has many sections, you can add a Table of Contents like this:

```
* TOC
{:toc}
```

The `* TOC` line will not display. Heading levels specified in the article will be rendered as an unordered list.

To exclude a heading from the TOC do this:

```
# Not in the TOC
{:.no_toc}
```

---

## How To Write 2.0 Docs

New articles for CircleCI can be added to the [jekyll/_cci2](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2) directory in this repo.

### Front Matter

The front matter should look like:

```
---
layout: classic-docs
title: "Your Doc Title"
short-title: "Short Title"
categories: [category-slug]
order: 10
---
```

The list of categories can be found in [categories.yml](https://github.com/circleci/circleci-docs/blob/master/jekyll/_data/categories.yml).

`order` specifies the menu order. You may need to adjust other doc menu orders to get your doc to show in the correct place within its section. (Best practice is to use multiples of 10 - then it's easy to put a new doc between two others).

### Bootstrap

The docs site includes Bootstrap 3 JS and CSS so you can take advantage of Bootstrap alert boxes and the like.

### Terminology

#### 'Jobs' not 'Builds'

In 2.0, we refer to 1.0 “builds” as “jobs” because each job in 2.0 runs in a separate container.
