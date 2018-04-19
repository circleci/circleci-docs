---
layout: classic-docs
title: Skipping and Cancelling Builds
short-title: Skipping and Cancelling Builds
description: How to Prevent CircleCI From Automatically Building
categories: [configuring-jobs]
order: 100
---

_[Basics]({{ site.baseurl }}/2.0/basics/) > Skipping a Build_

This document describes how to
skip or cancel builds in the following sections.

* TOC
{:toc}

## Skipping a Build

By default,
CircleCI automatically builds a project
whenever you push changes to a version control system (VCS).
You can override this behavior
by adding a `[ci skip]` or `[skip ci]` tag
anywhere in a commit's title or description.
This not only skips the marked commit,
but also **all other commits** in the push.

If you later decide to build a skipped commit,
you can override any skip tags
by rerunning the build.
If you are using workflows,
go to the Workflows page of the CircleCI application
and rerun the entire Workflow or rerun it from failed jobs.
Otherwise, click one of the Rebuild options on the {% comment %} TODO: Job {% endcomment %}Build page of the CircleCI application.

**Note:**
This feature is not supported for fork PRs.

### Example Commit Title

```bash
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to a VCS,
this commit will not be built on CircleCI
because of the `[ci skip]` in the commit title.

### Example Commit Description

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

When pushed to a VCS,
this commit will not be built on CircleCI
because of the `[ci skip]` in the commit description.

**Note:**
If you push multiple commits at once,
a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.

## Auto Cancelling a Redundant Build

If you are frequently pushing changes to a branch,
you increase the chances of builds queueing.
This means
you might have to wait for an older version of a branch
to finish building before the most recent version builds.

To save time,
you can configure CircleCI
to automatically cancel any queued or running builds
when a newer build is triggered on that same branch.

**Note:**
Your project's default branch will never auto cancel builds.
This feature only applies to non-workflow builds
and builds triggered by pushes to GitHub.

### Steps

1. In the CircleCI application,
go to your project's settings
by clicking the gear icon next to your project.

2. In the **Build Settings** section,
click on **Advanced Settings**.

3. In the **Auto-cancel redundant builds** section,
click the **On** button.
