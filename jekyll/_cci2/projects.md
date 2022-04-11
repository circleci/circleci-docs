---
layout: classic-docs
title: "Projects"
short-title: "Projects"
description: "Description of projects"
categories: [projects]
order: 2
version:
- Cloud
- Server v3.x
- Server v2.x
---

A CircleCI project shares the name of the associated code repository and is visible on the **Projects** page of the [CircleCI web app](https://app.circleci.com/). Projects are added by using the **Set Up Project** button.

On the **Projects** page, you can either set up any project that you are the owner of on your VCS, or follow any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{site.baseurl}}/2.0/notifications/) for the project's status.

## Projects dashboard
{: #projects-dashboard }

![Project Dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an organization. A *CircleCI user* is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{site.baseurl}}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.
