---
layout: classic-docs
title: "Building Open Source Projects"
short-title: "Building Open Source Projects"
description: "Best practices for building open source projects"
categories: [getting-started]
order: 1
---

This document provides tips and best practices
for building your open source project on CircleCI in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

To support the open source community,
projects that are public on GitHub or Bitbucket
receive three free build containers,
for a total of four containers.
Multiple build containers allow you
to build a single pull request (PR) faster with parallelism,
or build multiple PRs at once.

These additional containers are automatically enabled,
as long as the project is public and running on Linux.
If you do not want to use the additional containers
or do not want your CircleCI project to be public,
you can change this setting.
In the **Advanced Settings** of your project,
set the **Free and Open Source** option to _Off_.

**Note:**
If you are building an open source project on macOS,
contact billing@circleci.com to enable these additional containers.

## Security

While open source can be a liberating practice,
take care not to liberate sensitive information.

- If your repository is public,
your CircleCI project and its build logs are also public.
Pay attention to the information you choose to print.
- While environment variables set in the CircleCI application are hidden from the public,
these variables will be shared in [forked PRs](#pass-secrets-to-builds-from-forked-pull-requests)
unless explicitly blocked.

## Features and Settings for Open Source Projects

The following features and settings are especially useful for open source projects.

### Private Environment Variables
{:.no_toc}

Many projects require API tokens, SSH keys, or passwords.
Private environment variables allow you
to safely store secrets,
even if your project is public.
For more information,
see the [Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document.

### Only Build Pull Requests
{:.no_toc}

By default, CircleCI builds every commit from every branch.
This behavior may be too aggressive for open source projects,
which often have significantly more commits than private projects.
To change this setting,
go to the **Advanced Settings** of your project
and set the **Only build pull requests** option to _On_.

**Note:**
Even if this option is enabled,
CircleCI will still build all commits from your project's default branch.

### Build Pull Requests From Forked Repositories
{:.no_toc}

Many open source projects accept PRs from forked repositories.
Building these PRs is an effective way
to catch bugs before manually reviewing changes.

By default, CircleCI does not build PRs from forked repositories.
To change this setting,
go to the **Advanced Settings** of your project
and set the **Build forked pull requests** option to _On_.

### Pass Secrets to Builds From Forked Pull Requests
{:.no_toc}

Running an unrestricted build in a parent repository can be dangerous.
Projects often contain sensitive information,
and this information is freely available to anyone
who can push code that triggers a build.

By default, CircleCI does not pass secrets to builds from forked PRs for open source projects
and hides four types of configuration data:

- [Environment variables](#private-environment-variables) set through the application.

- [Deployment keys and user keys]({{ site.baseurl }}/2.0/gh-bb-integration/#deployment-keys-and-user-keys).

- Passphraseless private SSH keys you have [added to CircleCI]({{ site.baseurl }}/2.0/add-ssh-key)
to access arbitrary hosts during a build.

- [AWS permissions]({{ site.baseurl }}/2.0/deployment-integrations/#aws) and configuration files.

**Note:**
Forked PR builds of open source projects that require secrets
will not run successfully on CircleCI until you enable this setting.

If you are comfortable sharing secrets with anyone who forks your project and opens a PR,
you can enable the **Pass secrets to builds from forked pull requests** option.
In the **Advanced Settings** of your project,
set the **Pass secrets to builds from forked pull requests** option to _On_.

## Example Open Source Projects 

Following are a few examples of projects (big and small) that build on CircleCI:

- **React** - Facebook’s JavaScript based React is built with CircleCI (as well as other CI tools). <https://github.com/facebook/react>
- **Calypso** - The next generation webapp powering WordPress.com. <https://github.com/Automattic/wp-calypso>
- **Angular** - Another JavaScript framework built on multiple providers including CircleCI. <https://github.com/angular/angular>
- **fastlane** - A build automatically tool for Android and iOS. <https://github.com/fastlane/fastlane>
- **Atom** - The extensible text editor by GitHub is built with CircleCI (and other CI tools). <https://github.com/atom/atom>
- **Yarn** - The [npm replacement](https://circleci.com/blog/why-are-developers-moving-to-yarn/). <https://github.com/yarnpkg/yarn>
- **Hype** - Spotify’s tool that lets you execute arbitrary JVM code in a distributed environment. <https://github.com/spotify/hype>

## See Also
{:.no_toc}

Refer to the [Examples]({{ site.baseurl }}/2.0/examples/) document for more public and open source project configuration links organized by CircleCI features and by programming language.
