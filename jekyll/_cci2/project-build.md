---
layout: classic-docs
title: "Projects and Builds"
short-title: "Projects and Builds"
description: "Starting point for CircleCI 2.0 projects"
categories: [getting-started]
order: 1
---

This document describes how CircleCI automates builds of your project.

## Overview

After a software repository on GitHub or Bitbucket is authorized and added as a [project]({{ site.baseurl }}/2.0/glossary/#project) to circleci.com, every code change triggers a [build]({{ site.baseurl }}/2.0/build) and automated tests in a clean container or VM configured for your requirements.

## Adding Projects

If you do not see your project and it is not currently building on CircleCI, check your Organization in the top left corner of the CircleCI application.  For example, if the top left shows your user `myUser`, only Github projects belonging to `myUser` will be available under `Add Projects`.  If you want to build the Github project `myOrg/orgProject`, you must select `myOrg` on the application Switch Organization menu.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## Viewing Builds

Your build appear on the Jobs page of the CircleCI app when a new commit is pushed to your repository. If you do not see your jobs building on the Jobs page when you push config changes, check the Workflows tab of the CircleCI app to find out how to update your config to enable builds.

![Workflows]({{ site.baseurl }}/assets/img/docs/approval_job.png)
