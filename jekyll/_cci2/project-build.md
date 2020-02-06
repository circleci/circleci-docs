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

On the "Add Projects" page, you can either _Set Up_ any project that you are
the owner of on your VCS, or, _Follow_ any project in your organization to gain
access to its pipelines and to subscribe to [email notifications]({{
site.baseurl }}/2.0/notifications/) for the project's status.

## Add Projects Page

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*Following* a project enables a user to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project [build status]({{ site.baseurl }}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects.  Users may not view project data that is stored in environment variables.

If you do not see your project and it is not currently building on CircleCI, check your Organization in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## Viewing Builds

Your build appears on the [Pipelines page]({{site.baseurl}}/2.0/pipelines) of the CircleCI app when a new commit is pushed to your repository.

You can view workflows or single jobs by clicking in on the workflow or job in
each pipeline.

![Navigating Pipelines]({{ site.baseurl }}/assets/img/docs/navigating_pipelines.png)

When viewing a single job in a pipeline, you can use the breadcrumbs at the top
of the page to navigate back to a job's respective workflow or pipeline.

![Pipelines Breadcrumbs]({{ site.baseurl }}/assets/img/docs/pipeline-breadcrumbs.png)

## See Also

[Settings]({{ site.baseurl }}/2.0/settings)
