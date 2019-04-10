---
layout: classic-docs
title: Skip and Cancel Builds
short-title: Skip and Cancel Builds
description: How to Prevent CircleCI From Automatically Building
categories: [configuring-jobs]
order: 100
---

This document describes how to skip or cancel builds in the following sections.

* TOC
{:toc}

## Skipping a Build

By default, CircleCI automatically builds a project whenever you push changes to a version control system (VCS). You can override this behavior by adding a `[ci skip]` or `[skip ci]` tag anywhere in a commit's title or description. This not only skips the marked commit, but also **all other commits** in the push.

If you later decide to build a skipped commit, you can override any skip tags by re-running the build. If you are using workflows, go to the Workflows page of the CircleCI application and rerun the entire Workflow or re-run it from failed jobs. Otherwise, click one of the Rebuild options on the **Job page** of the CircleCI application.

**Note:**
This feature is not supported for fork PRs.

### Example Commit Title
{:.no_toc}

```bash
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` in the commit title.

### Example Commit Description
{:.no_toc}

```bash
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel
Date:   Tue Apr 25 15:56:42 2016 -0800

    A large feature with squashed commits

    Fix bug in feature
    Refactor feature code
    First attempt at feature [ci skip]
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` in the commit description.

**Note:**
If you push multiple commits at once, a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.

## Auto Cancelling a Redundant Build

If you are frequently pushing changes to a branch, you increase the chances of builds queueing. This means you might have to wait for an older version of a branch to finish building before the most recent version builds.

To save time, you can configure CircleCI to automatically cancel any queued or running builds when a newer build is triggered on that same branch.

**Note:**
Your project's default branch will never auto-cancel builds. This feature only applies to non-workflow builds, builds triggered by pushes to GitHub, or workflow builds that use the new pipelines feature.

### Steps to Enable Auto-Cancel for New Builds Triggered by Pushes to GitHub without Workflows
{:.no_toc}

1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Build Settings** section, click on **Advanced Settings**.

3. In the **Enabling Build Processing (preview)** section, click the **On** button.

### Steps to Enable Auto-Cancel for Workflows Triggered by Pushes to GitHub or the API
{:.no_toc}

Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch. 

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches. Auto-cancelling workflows requires enabling the preview feature.

1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Build Settings** section, click on **Advanced Settings**.

3. In the **Enabling Pipelines (preview)** section, click the **On** button.

4. Commit a change to trigger a build and ensure it runs successfully with the new pipelines.

5. In the **Auto-cancel redundant builds** section, click the **On** button.

Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:
- Scheduled workflows and Re-run workflows will not be cancelled.
