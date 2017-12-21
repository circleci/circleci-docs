---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories: [getting-started]
order: 4
---

*[Tutorials & Sample Apps]({{ site.baseurl }}/2.0/tutorials/) > Hello World*

This document describes how to configure your project to run on CircleCI 2.0. 

## Prerequisites

- If this will be your very first CircleCI project, complete the steps in the [Sign Up & Try CircleCI]({{ site.baseurl }}/2.0/first-steps/) document.  

## Steps

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository. 

2. Create a `config.yml` file in the `.circleci` directory with the following lines, replacing `<language>:<version TAG>` with your programming language and version number. See the [CircleCI Images doc]({{ site.baseurl }}/2.0/circleci-images/) for a complete list of languages and versions.
    ```
   version: 2
   jobs:
      build:
        docker:
          - image: circleci/<language>:<version TAG>
        steps:
          - checkout
          - run: echo "hello world"
    ```
The first image listed defines the execution environment for your build. The primary container, where your 2.0 build commands run, is created from this image. The steps check out the code in the project directory and run the `echo` command.

3. Commit and push the changes. If you were already using CircleCI 1.0, a build is triggered on 2.0, and a 2.0 icon appears on the Builds page.
    ![First Green Build Screenshot]({{ site.baseurl }}/assets/img/docs/green_build.png)

4. If this is your first project on CircleCI, go to the Projects page, click the Add Projects button and then click the Build Project button next to your project.

**Note:** If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For example, if the top left shows your user `myUser`, only Github projects belonging to `myUser` will be available under `Add Projects`.  If you want to build the Github project `myOrg/orgProject`, you must select `myOrg` on the application Switch Organization menu.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

CircleCI checks out your code, prints "Hello World", and posts a green build to the Builds page adding a green checkmark on your commit in GitHub or Bitbucket! If the job fails, you are notified in email of the failure with a log of the failing command, exit code, and output with a red X on the commit in GitHub or Bitbucket. 

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your org on the Projects page in the CircleCI app, clicking the Add Projects button, and then clicking the button next to the project you want to follow or stop following.

## Next Steps

Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with parallel, sequential, scheduled, and manual approval workflows.


