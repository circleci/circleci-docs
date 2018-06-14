---
layout: classic-docs
title: "Building Open Source Projects"
short-title: "Building Open Source Projects"
description: "Best practices for building open source projects"
categories: [getting-started]
order: 1
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Building Open Source Projects*

This document provides tips and best practices for building your open source project with CircleCI 2.0 in the following sections: 

* TOC
{:toc}

In addition to a free plan for open source repos, the CircleCI app includes extra resources and settings specifically for open source projects.

**Note:** Consider the following basics about visibility of configuration details and logs for your project: 

- If your repository is public, your CircleCI project will also be publicly available.
- CircleCI app settings are accessible only by contributors, therefore, environment variables set in the app are hidden from the public. However env-vars are shared in forks unless these are turned off.
- Build-logs are publicly visible, so don't print sensitive information in them.

## Open Source Container Overview

CircleCI offers open-source projects additional free build containers for run their jobs. An open source project being built on CircleCI gets **three additional build containers**, four containers in total. Multiple build containers allow you to  either build multiple pull requests (PRs) at a time, or to build a single PR much faster with CircleCI’s parallelism. 

**Note:** Projects built on Linux (our default platform) will automatically receive the additional containers if they are public projects on GitHub or Bitbucket. If you are building an open source project on macOS and want to take advantage of our offer, contact billing@circleci.com.

## Features and Settings for Open Source

The following features and settings are especially useful for open source projects.

### Public Build Pages

To increase transparency among contributors and collaborators,
you can make the builds of your project public.
In the **Advanced Settings** of your project,
set the **Free and Open Source** option to _On_.

### Only Build Pull Requests

By default, CircleCI builds every commit from every branch.
This behavior may be too aggressive for open source projects,
which often have considerably more commits than private projects.

To change this setting,
go to the **Advanced Settings** of your project
and set the **Only build pull requests** option to _On_.

**Note:**
Even if this option is enabled,
CircleCI will build all commits from your project's default branch.

### Building Pull Requests From Forked Repositories

Many open source projects accept pull requests from forked repositories.
Building these pull requests is an effective way
to catch bugs before manually reviewing changes.

**Advanced Settings -> Only build pull request** - This setting determines that only pull requests (PRs) and the project’s default branch (typically master) will be built. This setting is useful for projects with a lot of commit activity which helps reduce the number of builds that will be run.

## Example Open Source Projects 

Following are a few examples of projects (big and small) that build on CircleCI:

- **React** - Facebook’s JavaScript based React is built with CircleCI (as well as other CI tools). <https://github.com/facebook/react>
- **Calypso** - The next generation webapp powering WordPress.com. <https://github.com/Automattic/wp-calypso>
- **Angular** - Another JavaScript framework built on multiple providers including CircleCI. <https://github.com/angular/angular>
- **fastlane** - A build automatically tool for Android and iOS. <https://github.com/fastlane/fastlane>
- **Atom** - The extensible text editor by GitHub is built with CircleCI (and other CI tools). <https://github.com/atom/atom>
- **Yarn** - The [npm replacement](https://circleci.com/blog/why-are-developers-moving-to-yarn/). <https://github.com/yarnpkg/yarn>
- **Hype** - Spotify’s tool that lets you execute arbitrary JVM code in a distributed environment. <https://github.com/spotify/hype>

Refer to the [Examples]({{ site.baseurl }}/2.0/examples/) document for more public and open source project configuration links organized by CircleCI features and by programming language.
