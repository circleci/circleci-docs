---
layout: classic-docs
title: Using CircleCI with Phabricator
categories: [how-to]
description: Configuring Phabricator to work with CircleCI
last_updated: Apr 4, 2015
sitemap: false
---
This document describes how to set up a GitHub repository that uses Phabricator to notify CircleCI to run a build. For example, after completing this setup, you can push a diff to Phabricator and Arcanist will trigger a push to a GitHub tag and Harbormaster will notify CircleCI to run a build.

[Phabricator](http://phabricator.org) is a collection of open source web applications
that facilitate code review, browsing and auditing source code, tracking bugs and
managing software projects, in addition to other functionality. Using CircleCI with
Phabricator allows you to ensure code quality.

**Note:** the CircleCI integration is available in the Phabricator release *2016 Week 13*
and newer.

## Configuring Phabricator to build diffs on CircleCI

There are a few steps required to run builds for every Phabricator diff that is pushed.

1. Create a CircleCI project for the repo you would like to start building. You can do
so on the **Add Projects** page on the CircleCI dashboard.
1. Create a new API token on CircleCI by going to **Project Settings -> API Permissions**.
1. In Phabricator, create a new build plan in **Harbormaster ->
Manage Build Plans -> Create Build Plan**.
1. Give the build plan a good name, for example "CircleCI", optionally add
the project name.
1. In the newly created build plan, click **Add build step**, choose **Build with CircleCI**
in the _Interacting with External Build Sytems_ section.
1. Add the CircleCI API token you have created as a new credential in the **API Token** section.
1. Create a `circle.yml` file in your repo with the `notify` block shown on the page, and then
click **Create Build Step**.
1. Make sure that your project is configured as an external repository in Diffusion.
1. On the repository page in Diffusion, select **Edit Repository** and add a **staging area**. The URI
should have a format of a Git remote, for example `git@github.com:circleci/frontend.git` or
`https://github.com/circleci/frontend`. Arcanist will push to this remote from your local machine,
so choose the same authentication method you generally use for the project.
1. In **Herald**, create a new rule for **Differential Revisions**. On the next screen, choose the
option to make it a **Global** rule. Then choose the condition you would like to trigger builds on
(or just leave it as *Always*), and then select the **Run build plans** action and enter the plan
you want to run. Click **Save Rule**.

### Testing the configuration

Now everything should be configured to build your Phabricator differential revisions on CircleCI,
to try it out you can create a new commit, and then run `arc diff` to push it to Phabricator.
This should trigger a CircleCI build on a tag that looks like `phabricator/diff/<diff-number>`,
and the build status should be reported back to Phabricator.

## Troubleshooting

These are the issues we have seen either ourselves or with other customers.

* **Test status is not reported back to Phabricator.** Make sure that you have added the
`notify` block to your `circle.yml` and pushed the `circle.yml` to your repo.
* **"Tag not found" error shows up in the CircleCI response.** The tag was not pushed, this might
happen if you configure the staging area after creating a diff. You can create a new diff — that one
should have the updated staging area settings fetched from Phabricator.

