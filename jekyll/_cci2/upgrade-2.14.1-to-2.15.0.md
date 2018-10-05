---
layout: classic-docs
title: "Upgrading MongoDB when using externalized MongoDB"
category: [administration]
order: 12
description: "How to upgrading MongoDB from 3.2 to 3.6 when using externalized MongoDB"
---

This document provides links to instructions for upgrading MongoDB to v3.6. If you are running an external MongoDB with your CircleCI installation, this MongoDB upgrade is required for use with CircleCI v2.15.0.

* TOC
{:toc}


## Prerequisite

- You must be running CircleCI v2.15.0 in order to upgrade MongoDB.

## Goals

Upgrade from MongoDB 3.2 to 3.4 and set the Feature Compatibility Version to `3.4`. Upgrade MongoDB to 3.6.

## Upgrade to 3.4

Follow the upgrade procedures outlined by MongoDb [documentation](https://docs.mongodb.com/v3.4/release-notes/3.4/#upgrade-procedures) for your setup (e.g. Replica Set, Sharded Cluster).

Once complete you may run the following admin command (new in 3.4):

```db.adminCommand({setFeatureCompatibilityVersion: "3.4"})```

This will change the compatibility version to 3.4 which will continue to be used once you upgrade to 3.6. More information can be found [here](https://docs.mongodb.com/manual/reference/command/setFeatureCompatibilityVersion/#setfeaturecompatibilityversion).

You can verify it is set properly to `3.4` by running:

```db.adminCommand({getParameter: 1, featureCompatibilityVersion: 1})```

## Upgrade to 3.6

Follow the upgrade procedures outlined by MongoDb [documentation](https://docs.mongodb.com/v3.6/release-notes/3.6/#upgrade-procedures) for your setup (e.g. Replica Set, Sharded Cluster).

You can again verify it is set properly to `3.4` by running:

```db.adminCommand({getParameter: 1, featureCompatibilityVersion: 1})```
