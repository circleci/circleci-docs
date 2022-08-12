---
layout: classic-docs
title: "Projects Overview"
description: "Description of projects in CircleCI"
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---


A CircleCI project shares the name of the associated code repository in your [version control system]({{ site.baseurl }}/gh-bb-integration/) (VCS). Select **Projects** in the CircleCI web app sidebar to enter the projects dashboard. From here you can set up and follow the projects you have access to.

On the Projects Dashboard, you can either:
* _Set Up_ any project that you are the owner of in your VCS.
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{site.baseurl }}/notifications/) for the project's status.

For step-by-step guidance, see [Creating a Project in CircleCI]({{site.baseurl}}/create-project/).

## Projects dashboard
{: #projects-dashboard }

![Project Dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

Following a project enables a user to subscribe to [email notifications]({{site.baseurl}}/notifications/) for the project [build status]({{site.baseurl}}/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{site.baseurl}}/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.

### Org switching
{: #org-switching }
If you do not see your project, and it is not currently building on CircleCI, check your **Organization** in the top left corner of the CircleCI web app. For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under **Projects**. If you want to build the GitHub project `your-org/project`, you must switch organizations by selecting `your-org` in the application menu.

![Switch Organization Menu]({{site.baseurl}}/assets/img/docs/org-centric-ui_newui.png)

## Viewing and navigating pipelines
{: #viewing-and-navigating-pipelines }

Your pipeline appears on the **Dashboard** of the CircleCI web app when a new commit is pushed to your repository. You can view workflows or single jobs by expanding the pipeline and clicking in on any workflow or job descriptors.

When viewing a single job in a pipeline, you can use the breadcrumbs at the top of the page to navigate back to a job's respective workflow or pipeline.

![Pipelines Breadcrumbs]({{site.baseurl}}/assets/img/docs/pipeline-breadcrumbs.png)

## Next steps
{: #next-steps }

* Follow our guide to [Creating a Project in CircleCI]({{ site.baseurl }}/create-project/).
* Learn more about CircleCI Pipelines in the [Pipelines Overview]({{ site.baseurl }}/create-project/).
