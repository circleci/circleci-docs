# Contributing to CircleCI Docs

Thank you for your interest in contributing to the CircleCI documentation.

**Note (March 2017): We are currently focusing on creating new documentation for CircleCI 2.0. Documentation for 1.0
will continue to be improved, but will go into maintenance mode in the coming months. If you're considering contributing
a completely new article, we encourage you to contribute to the 2.0 documentation found online at 
<https://circleci.com/docs/2.0/> or in this repo in `/jekyll/_cci2/`.**

**Pull Requests for clarifications, technical accuracy, spelling fixes, and grammar improvements, are always welcome.**

## Fix or improve an article

For minor changes, you can edit the source Markdown file directly on GitHub. The GitHub UI makes it simple to create a
Pull Request from the edit screen.

The bottom of every article on https://circleci.com/docs/ has a direct link to the source file on GitHub.

For more extensive editing, [fork this repository](https://github.com/circleci/circleci-docs#fork-destination-box),
clone your fork to your local machine, work on your contribution in a branch, and 
[open a Pull Request](https://help.github.com/articles/creating-a-pull-request/) when ready for review.

## Make a suggestion or leave feedback

We welcome your feedback and suggestions. Please [open a GitHub Issue](https://github.com/circleci/circleci-docs/issues) 
on this repository. There you can let us know what needs fixing or suggest content for new documentation.

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
