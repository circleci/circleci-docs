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

## Caching strategies

![caching data flow]({{ site.baseurl}}/assets/img/docs/caching-dependencies-overview.png)

Caching persists data between the same job in different Workflow builds, allowing you to reuse the data from expensive fetch operations from previous jobs. After an initial job run, future instances will run faster as they will not need to redo the work (provided your cache has not been invalidated). A prime example is package dependency managers such as Yarn, Bundler, or Pip. With dependencies restored from a cache, commands like yarn install will only need to download new dependencies, if any, and not redownload everything on every build.

Caches are global within a project. A cache saved on one branch will be used by jobs run on other branches so they should only be used for data that is suitable to share across branches.

**Caches created via the save_cache step are stored for up to 15 days.**

For more information see the [Caching Dependencies]({{site.baseurl}}/2.0/caching/) guide.

## Using workspaces

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

When a workspace is declared in a job, files and directories can be added to it. Each addition creates a new layer in the workspace filesystem. Downstream jobs can then use this workspace for their own needs or add more layers on top.

Workspaces are not shared between pipeline runs. The only time a workspace can be accessed after the pipeline has run is when a workflow is rerun within the 15
day limit.

**Workspaces are stored for up to 15 days.**

For more information on using workspaces to persist data throughout a workflow, see the [Workflows]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) guide. Also see the [Deep Diving into CircleCI Workspaces](https://circleci.com/blog/deep-diving-into-circleci-workspaces/) blog post.

## Using artifacts

![artifacts data flow]( {{ site.baseurl}}/assets/img/docs/Diagram-v3-Artifact.png)

Artifacts are used for longer-term storage of the outputs of your pipelines. For example if you have a Java project, your build will most likely produce a `.jar` file of your code. This code will be validated by your tests. If the whole build/test process passes, then the output of the process (the `.jar`) can be stored as an artifact. The `.jar` file is available to download from our artifacts system long after the workflow that created it has finished.

If your project needs to be packaged, say an Android app where the `.apk` file is uploaded to Google Play, you would likely wish to store it as an artifact. Many users take their artifacts and upload them to a company-wide storage location such as Amazon S3 or Artifactory.

**Artifacts are stored for up to 30 days.**

For more information on using artifacts to persist data once a job has completed, see the [Storing Build Artifacts]({{site.baseurl}}/2.0/artifacts/)
guide.

## Managing network and storage use

### Overview of storage and network transfer

All data persistence operations within a job will accrue network and storage usage, the relevant actions are:

* Uploading and downloading caches
* Uploading and downloading workspaces
* Uploading artifacts
* Uploading test results

Details about your storage and network transfer usage can be viewed on your Plan Settings.

### How to manage your storage and network transfer use

There are several common ways that your configuration can be optimized to ensure you are getting the most out of your storage and network usage.

Before attempting to reduce data usage, you should first consider whether that usage is providing enough value to be kept. In the cases of caches and workspaces this can be quite easy to compare - does the developer/compute time saving from the cache outweigh the cost of the download and upload? Please see below for examples of storage and network optimization opportunities.

### Opportunities to reduce artifact and cache/workspace traffic

#### Check which artifacts are being uploaded

Often we see that the store_artifacts step is being used on a large directory when only a few files are really needed, so a simple action you can take is to check which artifacts are being uploaded and why.

If you are using parallelism in your jobs, it could be that each parallel task is uploading an identical artifact. You can use the CIRCLE_NODE_INDEX environment variable in a run step to change the behaviour of scripts depending on the parallel task run.

#### Caching unused or superfluous dependencies

Depending on what language and package management system you are using, you may be able to leverage tools that clear or “prune” unnecessary dependencies. For example, the node-prune package removes unnecessary files (markdown, typescript files, etc.) from node_modules.

#### Optimizing cache usage

If you notice your cache usage is high and would like to reduce it, try:

* Ensuring that your cache “key” is following [best practices]({{ site.baseurl}}/2.0/caching/#further-notes-on-using-keys-and-templates):

{% raw %}
```sh
     - save_cache:
         key: brew-{{epoch}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

Notice in the above example that best practices are not being followed. `brew-{{ epoch }}` will change every build; causing an upload every time even if the value has not changed. This will eventually cost you money, and never save you any time. Instead pick a cache key like the following:

{% raw %}
```sh
     - save_cache:
         key: brew-{{checksum “Brewfile”}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

Which will only change if the list of requested dependencies has changed. If you find that this is not uploading a new cache often enough, include the version numbers in your dependencies.

* Let your cache be slightly out of date. In contrast to the suggestion above where we ensured that a new cache would be uploaded any time a new dependency was added to your lockfile or version of the dependency changed, use something that tracks it less precisely.

* Prune your cache before you upload it, but make sure you prune whatever generates your cache key as well.

#### Uploading large artifacts

* Artifacts that are text can be compressed at very little cost.
* If you are uploading images/videos of UI tests, filter out and upload only failing tests. Many organizations upload all of the images from their UI tests, many of which will go unused.
* If your pipelines build a binary, uberjar, consider if these are necessary for every commit? You may wish to only upload artifacts on failure / success, or perhaps only on a single branch, using a filter.
* If you must upload a large artifact you can upload them to your own bucket at no cost.
