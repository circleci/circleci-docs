---
layout: classic-docs
title: Skip or cancel jobs and workflows
description: This document describes the options available to you for controlling when work is automatically carried out on your project, by skipping jobs or auto-cancelling workflows.
order: 100
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes how to skip or cancel work when triggering pipelines. There are a couple of ways to do this. The jobs within a pipeline can be skipped on commit, or workflows can be cancelled using the auto-cancel feature. Both methods are described below.

* TOC
{:toc}

## Skipping jobs in a pipeline
{: #skipping-a-build }

By default, CircleCI automatically triggers a pipeline whenever you push changes to your project. You can override this behavior by adding a `[ci skip]` or `[skip ci]` tag within the first 250 characters of the body or title of the commit. This not only skips the marked commit, but also **all other commits** in the push.

**CircleCI server v2.x**
If you are using CircleCI server v2.x, you can still use the method for skipping workflows described here, even though you are not using the pipelines feature.

### Scope
{: #scope }
{:.no_toc}

A few points to note regarding the scope of the `ci skip` feature:

* The pipeline and workflows will still exist for these commits but no jobs will be run.
* If you push multiple commits at once, a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.
* This feature is not supported for fork PRs. Scheduled workflows will run even if you push a commit with `[ci skip]` message. Changing the config file is the way to upgrade the current schedule.

### Example commit title
{: #example-commit-title }
{:.no_toc}

```shell
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` in the commit title.

### Example commit description
{: #example-commit-description }
{:.no_toc}

```shell
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel
Date:   Tue Apr 25 15:56:42 2016 -0800

    A large feature with squashed commits

    [skip ci] Fix bug in feature
    Refactor feature code
    First attempt at feature
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` or `[skip ci]` in the commit description.

## Auto cancelling
{: #auto-cancelling}

If you are frequently pushing changes to a branch, you increase the chances of queueing. This means you might have to wait for an older pipeline to complete before the most recent version starts.

To save time, you can configure CircleCI to automatically cancel any non-terminated workflows when a newer pipeline is triggered on that same branch.

### Scope
{: #scope }
{:.no_toc}

A few points to note regarding the use of the auto-cancel feature:

* Your project's default branch (usually `main`) will never auto-cancel builds.

### Steps to enable auto-cancel for pipelines triggered by pushes to GitHub or the API
{: #steps-to-enable-auto-cancel-for-pipelines-triggered-by-pushes-to-github-or-the-api }
{:.no_toc}

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches.

1. In the CircleCI application, go to your Project Settings.

2. Click on **Advanced Settings**.

3. In the **Auto-cancel redundant builds** section, enable the feature by switching the toggle switch to the **On** position.

Projects for which auto-cancel is enabled in the Advanced Settings will have pipelines and workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:
- Scheduled workflows and Re-run workflows will not be cancelled.

## Auto cancel for CircleCI server installations
{: #auto-cancel-for-circleci-server-installations }

CircleCI Server does not currently use the pipelines feature, and as a result the Auto Cancel Builds feature only works for builds triggered with the API or by pushes to GitHub for projects that **do not** use workflows.

### Steps to enable auto-cancel for CircleCI server installations
{: #steps-to-enable-auto-cancel-for-circleci-server-installations }
{:.no_toc}

1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Build Settings** section, click on **Advanced Settings**.

3. In the **Auto-cancel redundant builds** section, click the **On** button.
