---
layout: classic-docs
title: "Projects and Pipelines"
short-title: "Projects and Pipelines"
description: "CircleCI 2.0 プロジェクトの入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

This document describes how CircleCI automates your pipelines.

## 概要
{: #overview }

After a software repository on GitHub or Bitbucket is authorized and added as a [project]({{ site.baseurl }}/2.0/glossary/#project) to circleci.com, every code change triggers your project's [pipeline]({{ site.baseurl }}/2.0/concepts/#pipelines). A pipeline represents the entire configuration, including all workflows that are run when you trigger work on your projects that use CircleCI. The entirety of a `.circleci/config.yml` file is executed by a pipeline. Jobs run in clean containers or VMs configured to the requirements set out in your configuration file.

## Adding projects
{: #adding-projects }

A CircleCI project shares the name of the associated code repository in your VCS (GitHub or Bitbucket). Select **Projects** from the CircleCI application sidebar to enter the Projects dashboard, where you can set up and follow any projects you have access to.

On the Projects Dashboard, you can either:
* _Set Up_ any project that you are the owner of in your VCS
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project's status.

## Projects dashboard
{: #projects-dashboard }

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*Following* a project enables a user to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project [build status]({{ site.baseurl }}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects.  Users may not view project data that is stored in environment variables.

### Org switching
{: #org-switching }
If you do not see your project and it is not currently building on CircleCI, check your Organization in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

## Viewing and navigating pipelines
{: #viewing-and-navigating-pipelines }

Your pipeline appears on the Dashboard of the CircleCI app when a new commit is pushed to your repository. You can view workflows or single jobs by expanding the pipeline and clicking in on any workflow or job descriptors.

When viewing a single job in a pipeline, you can use the breadcrumbs at the top of the page to navigate back to a job's respective workflow or pipeline.

![Pipelines Breadcrumbs]({{ site.baseurl }}/assets/img/docs/pipeline-breadcrumbs.png)

## See also
{: #see-also }

[Settings]({{ site.baseurl }}/2.0/settings)
