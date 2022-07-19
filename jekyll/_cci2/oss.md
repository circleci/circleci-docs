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
{: #overview }
{:.no_toc}

To support the open source community, organizations on Github or Bitbucket will be given free credits every week that can be spent on open source projects. These credits can be spent on Linux resources.

**Notes:**
* If you are building an open source project on macOS, contact billing@circleci.com to enable these additional containers.
* Open-source credit availability and limits will not be visible in the UI.


## Security
{: #security }

While open source can be a liberating practice, take care not to liberate sensitive information.

- If your repository is public, your CircleCI project and its build logs are also public. Pay attention to the information you choose to print.
- Environment variables set in the CircleCI application are hidden from the public, these variables will not be shared in [forked PRs](#pass-secrets-to-builds-from-forked-pull-requests)
unless explicitly enabled.

## Features and settings for open source projects
{: #features-and-settings-for-open-source-projects }

The following features and settings are especially useful for open source projects.

### Private environment variables
{: #private-environment-variables }
{:.no_toc}

Many projects require API tokens, SSH keys, or passwords. Private environment variables allow you to safely store secrets, even if your project is public.

For more information, see the [Environment Variables]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-project) document.

### Only build pull requests
{: #only-build-pull-requests }
{:.no_toc}

By default, CircleCI builds every commit from every branch. This behavior may be too aggressive for open source projects, which often have significantly more commits than private projects.

To change this setting, go to the **Project Settings>Advanced** of your project and set the **Only build pull requests** option to _On_.

**Note:** Even if this option is enabled, CircleCI will still build all commits from your project's default branch and tags

### Build pull requests from forked repositories
{: #build-pull-requests-from-forked-repositories }
{:.no_toc}

Many open source projects accept PRs from forked repositories. Building these PRs is an effective way to catch bugs before manually reviewing changes.

By default, CircleCI does not build PRs from forked repositories. To change this setting, go to the **Project Settings>Advanced** of your project and set the **Build forked pull requests** option to _On_.

**Note:** This feature is not currently supported for BitBucket users.

**Note:** If a user submits a pull request to your repository from a fork, but no pipeline is triggered, then the user most likely is following a project fork on their personal account rather than the project itself of CircleCi, causing the jobs to trigger under the user's personal account and not the organization account. To resolve this issue, have the user unfollow their fork of the project on CircleCI and instead follow the source project. This will trigger their jobs to run under the organization when they submit pull requests.

### Pass secrets to builds from forked pull requests
{: #pass-secrets-to-builds-from-forked-pull-requests }
{:.no_toc}

Running an unrestricted build in a parent repository can be dangerous. Projects often contain sensitive information, and this information is freely available to anyone who can push code that triggers a build.

By default, CircleCI does not pass secrets to builds from forked PRs for open source projects and hides four types of configuration data:

- [Environment variables](#private-environment-variables) set through the application.

- [Deployment keys and user keys]({{ site.baseurl }}/gh-bb-integration/#deployment-keys-and-user-keys).

- Passphraseless private SSH keys you have [added to CircleCI]({{ site.baseurl }}/add-ssh-key)
to access arbitrary hosts during a build.

- [AWS permissions]({{ site.baseurl }}/deployment-examples/#aws) and configuration files.

**Note:**
Forked PR builds of open source projects that require secrets will not run successfully on CircleCI until you enable this setting.

If you are comfortable sharing secrets with anyone who forks your project and opens a PR, you can enable the **Pass secrets to builds from forked pull requests** option. In the **Project Settings>Advanced** of your project, set the **Pass secrets to builds from forked pull requests** option to _On_.

### Caching
{: #caching }

Caches are isolated based on GitHub Repo for PRs. CircleCI uses the GitHub
repository-id of the originator of the fork PR to identify the cache.
- PRs from the same fork repo will share a cache. For example, PRs from the
  main repo share a cache with the main repo branches (in particular the
  `main` branch).
- Two PRs in different fork repos will have different caches. That means
  that a PR from a fork will not share a cache with the main repo `main` branch.
- enabling the [passing of secrets to build from forked pull requests](#pass-secrets-to-builds-from-forked-pull-requests)
  will enable cache sharing between the original repo and all forked builds.

Currently there is no pre-population of caches because this optimization hasn't
made it to the top of the priority list yet.

## Example open source projects
{: #example-open-source-projects }

Following are a few examples of projects (big and small) that build on CircleCI:

- **[React](https://github.com/facebook/react)** - Facebook’s JavaScript based React is built with CircleCI (as well as other CI tools).
- **[React Native](https://github.com/facebook/react-native/)** - Build native mobile apps using JavaScript and React.
- **[Flow](https://github.com/facebook/flow/)** - Adds static typing to JavaScript to improve developer productivity and code quality.
- **[Vue](https://github.com/vuejs/vue)** -  Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.
- **[Storybook](https://github.com/storybookjs/storybook)** - Interactive UI component dev & test: React, React Native, Vue, Angular, Ember.
- **[Electron](https://github.com/electron/electron)** - Build cross-platform desktop apps with JavaScript, HTML, and CSS.
- **[Angular](https://github.com/angular/angular)** - Framework for building browser and desktop web applications.
- **[Apollo](https://github.com/apollographql)** - A community building flexible open source tools for GraphQL.
- **[PyTorch](https://github.com/pytorch/pytorch)** - Data manipulation and Machine Learning platform.
- **[Calypso](https://github.com/Automattic/wp-calypso)** - The next generation webapp powering WordPress.com.
- **[Fastlane](https://github.com/fastlane/fastlane)** - A build automatically tool for Android and iOS.
- **[Yarn](https://github.com/yarnpkg/yarn)** - The [npm replacement](https://circleci.com/blog/why-are-developers-moving-to-yarn/).

## See also
{: #see-also }
{:.no_toc}

Refer to the [Examples]({{ site.baseurl }}/example-configs/) document for more public and open source project configuration links organized by CircleCI features and by programming language.
