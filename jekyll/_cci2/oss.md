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

To support the open source community, organizations on Github or Bitbucket will be given 100,000 free credits per week that can be spent on on open source projects. These credits can be spent on Linux-medium resources. Each organization can have a maximum of four concurrent jobs running.

**Note:**
If you are building an open source project on macOS,
contact billing@circleci.com to enable these additional containers.

## Security

While open source can be a liberating practice,
take care not to liberate sensitive information.

- If your repository is public,
your CircleCI project and its build logs are also public.
Pay attention to the information you choose to print.
- Environment variables set in the CircleCI application are hidden from the public,
these variables will not be shared in [forked PRs](#pass-secrets-to-builds-from-forked-pull-requests)
unless explicitly enabled.

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

### Caching

Caches are isolated based on GitHub Repo for PRs. CircleCI uses the GitHub repository-id of the originator of the fork PR to identify the cache.
- PRs from the same fork repo will share a cache (this includes, as previously stated, that PRs in the master repo share a cache with master).
- Two PRs in different Fork Repos will have different caches.

Currently there is no pre-population of caches because this optimization hasn't made it to the top of the priority list yet.

## Example Open Source Projects 

Following are a few examples of projects (big and small) that build on CircleCI:

- **[React](https://github.com/facebook/react)** - Facebook’s JavaScript based React is built with CircleCI (as well as other CI tools). 
- **[React Native](https://github.com/facebook/react-native/)** - Build native mobile apps using JavaScript and React.
- **[Flow](https://github.com/facebook/flow/)** - Adds static typing to JavaScript to improve developer productivity and code quality.
- **[Relay](https://github.com/facebook/relay)** - JavaScript framework for building data-driven React applications. 
- **[Vue](https://github.com/vuejs/vue)** -  Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.
- **[StoryBook](https://github.com/storybooks/storybook)** - Interactive UI component dev & test: React, React Native, Vue, Angular, Ember.
- **[Electron](https://github.com/electron/electron)** - Build cross-platform desktop apps with JavaScript, HTML, and CSS.
- **[Angular](https://github.com/angular/angular)** - Framework for building browser and desktop web applications.
- **[Apollo](https://github.com/apollographql)** - A community building flexible open source tools for GraphQL.
- **[PyTorch](https://github.com/pytorch/pytorch)** - Data manipulation and Machine Learning platform.
- **[Calypso](https://github.com/Automattic/wp-calypso)** - The next generation webapp powering WordPress.com.
- **[Fastlane](https://github.com/fastlane/fastlane)** - A build automatically tool for Android and iOS.
- **[Yarn](https://github.com/yarnpkg/yarn)** - The [npm replacement](https://circleci.com/blog/why-are-developers-moving-to-yarn/).

## See Also
{:.no_toc}

Refer to the [Examples]({{ site.baseurl }}/2.0/example-configs/) document for more public and open source project configuration links organized by CircleCI features and by programming language.
