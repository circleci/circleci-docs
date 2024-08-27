---
layout: classic-docs
title: Skip or cancel jobs and workflows
description: This document describes the options available to you for controlling when work is automatically carried out on your project, by skipping jobs or auto-cancelling workflows.
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

This document describes how to skip or cancel work when triggering pipelines. There are a couple of ways to do this:

* The jobs within a pipeline can be skipped on commit.
* Workflows can be cancelled using the auto-cancel feature.

Both methods are described below.

## Skip a pipeline
{: #skip-jobs }

By default, CircleCI automatically triggers a pipeline whenever you push changes to your project. You can override this behavior by adding one of the following tags within the first 250 characters of the body or title of the **latest commit** you pushed:

* `[ci skip]`
* `[skip ci]`

Adding one of these tags skips pipeline execution for all the commits included in the push.

## The skip pipeline process

When you include `[ci skip]` or `[skip ci]` in the first 250 characters of the body or title of a commit, CircleCI uses this infomation to decide to skip the pipeline trigger.

The way the pipeline is displayed in the CircleCI web app will be different depending on your VCS integration, as follows:

If your project is integrated with CircleCI using the xref:github-apps-integration#[GitHub App] a skipped pipeline will not show on the pipelines page.

### Scope
{: #scope }

A few points to note regarding the scope of the `ci skip` feature:

* The pipeline and workflows will still exist for these commits but no jobs will be run.
* If you push multiple commits at once, and the latest commit includes a `[ci skip]` or `[skip ci]` tag, it will skip the pipeline execution for all commits in that push.
* This feature is not supported for fork PRs. Scheduled workflows will run even if you push a commit with `[ci skip]` message. Changing the config file is the way to upgrade the current schedule.

### Example commit title
{: #example-commit-title }

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

## Auto-cancel redundant workflows
{: #auto-cancel}

If you are frequently pushing changes to a branch, you increase the chances of queueing. This means you might have to wait for an older pipeline to complete before the most recent version starts.

To save time, you can configure CircleCI to automatically cancel any non-terminated workflows when a newer pipeline is triggered on that same branch.

### Scope
{: #scope }

A few points to note regarding the use of the auto-cancel feature:

* Your project's default branch (usually `main`) will never auto-cancel workflows.
* Auto-cancel affect pipelines triggered by pushes to a VCS or via the API.
* Only workflows that are triggered when the feature is enabled will be auto-cancelled.

### Enable auto-cancel
{: #enable-auto-cancel }

It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches.
{: class="alert alert-warning"}

1. In the CircleCI application, go to your **Project Settings**.

2. Click on **Advanced Settings**.

3. Toggle the switch to enable the **Auto-cancel redundant workflows** option.

Projects which have auto-cancel enabled will have pipelines and workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:

* Scheduled workflows
* Re-run workflows
