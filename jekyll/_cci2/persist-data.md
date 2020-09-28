---
layout: classic-docs
title: "Persisting Data"
description: "A guide to the various ways to persist data in CircleCI"
version:
- Cloud
- Server v2.x
---

This guide gives an overview of the various ways to persist data within and beyond your CircleCI builds.

* TOC
{:toc}

## Caching Strategies

![caching data flow]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

TODO: add in overview of caching and applicable use cases

For more information on source and library caching, see the [Caching Dependencies]({{site.baseurl}}/2.0/caching/) guide.

## Using Workspaces

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

TODO: add in overview of workspaces and applicable use cases

For more information on using workspaces to persist data throughout a workflow, see the [Workflows]({{site.baseurl}}/2.0/workflows/using-workspaces-to-share-data-among-jobs) guide.

## Using Artifacts

![artifacts data flow]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

TODO: add in overview of artifacts and applicable use cases

For more information on using artifacts to persist data once a job has completes, see the [Storing Build Artifacts]({{site.baseurl}}/2.0/artifacts/) guide.