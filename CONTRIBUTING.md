# Contributing to CircleCI Docs

Thank you for your interest in contributing to the CircleCI documentation.

**Note (February 2017): We are currently focusing on creating new documentation for CircleCI 2.0. Documentation for 1.0
will continue to be improved, but will go into maintenance mode in the coming monnths. If you're considering contributing
a completely new article, we encourage you to wait until the 2.0 documentation is established.**

**Pull Requests for clarifications, technical accuracy, spelling fixes, and grammar improvements, are always welcome.**

## Fix or improve an article

For minor changes you can edit the source Markdown file directly on GitHub. The GitHub UI makes it simple to create a
Pull Request from the edit screen.

The bottom of every article on https://circleci.com/docs/ has a link direct to the source file on GitHub.

For more extensive editing, [fork this repository](https://github.com/circleci/circleci-docs#fork-destination-box),
clone your fork to your local machine, work on your contribution in a branch, and when ready, 
[open a Pull Request](https://help.github.com/articles/creating-a-pull-request/).

## Make a suggestion or leave feedback

We welcome your feedback and suggestions. Please [open a GitHub Issue](https://github.com/circleci/circleci-docs/issues) 
on this repository. There you can let us know what needs fixing or suggest content for new documantation.

---

## How To Write 2.0 Docs

New articles for CircleCI can be added to the [jekyll/_cci2](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2) directory in this repo.

### Frontmatter

The frontmatter should look like:

```
---
layout: classic-docs2
title: "Your Doc Title"
short-title: "Short Title"
categories: [category-slug]
order: 10
---
```

Make sure to use `classic-docs2` layout for 2.0 docs. The list of categories can be found in [categories.yml](https://github.com/circleci/circleci-docs/blob/master/jekyll/_data/categories.yml)

`order` specifies the menu order. You may need to adjust other doc menu orders to get your doc to show in the correct place within its section. (Best practice is to use multiples of 10 - then it's easy to put a new doc between two others).

### Bootstrap

The docs site includes Bootstrap 3 JS and CSS so you can take advantage of Bootstrap alert boxes and the like.

**TODO** show how to do this in markdown - write HTML within a div.

### Terminology

#### 'Jobs' not 'Builds'

In 2.0, we refer to 1.0 “builds” as “jobs”.  This will become more important as workflows are introduced.

#### Pods Are Not a Thing

For a while, we referred to a group of Docker images composed together as a “pod”. We don‘t do that anymore. Now just say “a group of images treated as a single image” or something similar.