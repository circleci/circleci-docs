---
layout: classic-docs
title: “Build a Project”
short-title: “Build a Project”
description: “First project build on CircleCI 2.0"
categories: [getting-started]
order: 4
---

This document describes how to configure your project to run on CircleCI 2.0. 

## Prerequisites

- Complete the steps in the [Join Beta & Sign Up]({{ site.baseurl }}/2.0/first-steps/) document. 
- Install Docker, see [the Docker store](https://store.docker.com/search?offering=community&type=edition) for a free download  compatible with your operating system. 
- Download a build image for your language, see [the CircleCI repo on hub.docker.com](https://hub.docker.com/u/circleci/).

## Steps

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository. 

2. Create a `config.yml` file in the `.circleci` directory with the following lines, replacing *project root directory* with your project directory and *language:version* with your programming language and version number.

```
version: 2
jobs:
  build:
    working_directory: ~/<project root directory>
    docker:
      - image: <language>:<version>
      - environment:
          <VARIABLE_NAME>: <value>
    steps:
      - checkout
      - run: echo "hello world"
```

The image defines the execution environment for your build. The steps check out the code in the project directory and run the `echo` command.

3. Commit and push the changes.

4. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to your project.

CircleCI checks out your code, prints "Hello World", and posts a green build! If the build fails, you are notified in email of the failure with a log of the failing command, exit code, and output.


