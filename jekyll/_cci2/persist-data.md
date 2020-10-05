---
layout: classic-docs
title: "Persisting Data"
description: "A guide to the various ways to persist data in CircleCI"
version:
- Cloud
- Server v2.x
---

This guide gives an overview of the various ways to persist data within and beyond your CircleCI builds. There are a number of ways to move data into, out of and between jobs, and persist data for future use. Using the right feature for the right task will help speed up your builds and improve repeatability and efficiency.

* TOC
{:toc}

## Caching Strategies

![caching data flow]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

Caching persists data between the same job in different Workflow builds, allowing you to reuse the data from expensive fetch operations from previous jobs. After an initial job run, future instances will run faster as they will not need to redo the work (provided your cache has not been invalidated). A prime example is package dependency managers such as Yarn, Bundler, or Pip. With dependencies restored from a cache, commands like yarn install will only need to download new dependencies, if any, and not redownload everything on every build.

Caches are global within a project. A cache saved on one branch will be used by jobs run on other branches so they should only be used for data that is suitable to share across branches.

**Caches created via the save_cache step are stored for up to 15 days.**

For more information see the [Caching Dependencies]({{site.baseurl}}/2.0/caching/) guide.

## Using Workspaces

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

When a workspace is declared in a job, files and directories can be added to it. Each addition creates a new layer in the workspace filesystem. Downstream jobs can then use this workspace for their own needs or add more layers on top.

Workspaces are not shared between pipeline runs. The only time a workspace can be accessed after the pipeline has run is when a workflow is rerun within the 15 day limit.

**Workspaces are stored for up to 15 days.**

For more information on using workspaces to persist data throughout a workflow, see the [Workflows]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) guide. Also see the [Deep Diving into CircleCI Workspaces](https://circleci.com/blog/deep-diving-into-circleci-workspaces/) blog post.

## Using Artifacts

![artifacts data flow]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Artifacts are used for longer-term storage of the outputs of your pipelines. For example if you have a Java project, your build will most likely produce a `.jar` file of your code. This code will be validated by your tests. If the whole build/test process passes, then the output of the process (the `.jar`) can be stored as an artifact. The `.jar` file is available to download from our artifacts system long after the workflow that created it has finished.

If your project needs to be packaged, say an Android app where the `.apk` file is uploaded to Google Play, you would likely wish to store it as an artifact. Many users take their artifacts and upload them to a company-wide storage location such as Amazon S3 or Artifactory.

**Artifacts are stored for up to 30 days.**

For more information on using artifacts to persist data once a job has completes, see the [Storing Build Artifacts]({{site.baseurl}}/2.0/artifacts/) guide.
