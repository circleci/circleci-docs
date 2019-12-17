---
layout: classic-docs
title: "Projects"
short-title: "Projects"
description: "Description of projects"
categories: [projects]
order: 2
---

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

---

The _Project Administrator_ is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A _User_ is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.
