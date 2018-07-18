---
layout: classic-docs
title: "Projects"
short-title: "Projects"
description: "Description of projects"
categories: [projects]
order: 2
---

A CircleCI project shares the name of the associated code repository and is visible on the Projects page of the CircleCI app. Projects are added by using the Add Project button.

## Add Projects Page

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*Following* a project enables a user to subscribe to [email notifications]({{ site.baseurl }}/2.0/notifications/) for the project [build status]({{ site.baseurl }}/2.0/status/) and adds the project to their CircleCI dashboard.

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A *User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects.  Users may not view project data that is stored in environment variables.
