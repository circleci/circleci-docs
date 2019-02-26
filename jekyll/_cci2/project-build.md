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

A CircleCI project shares the name of the associated code repository and is visible on the Projects page of the CircleCI app. Projects are added by using the Add Project button.

## Add Projects Page

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*Following* a project enables a user to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project [build status]({{ site.baseurl }}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects.  Users may not view project data that is stored in environment variables.

If you do not see your project and it is not currently building on CircleCI, check your Organization in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## Viewing Builds

Your build appears on the Jobs page of the CircleCI app when a new commit is pushed to your repository. If you do not see your jobs building on the Jobs page when you push config changes, check the Workflows tab of the CircleCI app to find out how to update your config to enable builds.

![Workflows]({{ site.baseurl }}/assets/img/docs/approval_job.png)

## See Also

[Settings]({{ site.baseurl }}/2.0/settings)
