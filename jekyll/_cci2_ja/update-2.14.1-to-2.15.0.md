---
layout: classic-docs
title: "外部 MongoDB 使用時の MongoDB のアップグレード"
category:
  - administration
order: 12
description: "外部 MongoDB の使用時に MongoDB を 3.2 から 3.6 にアップグレードする方法"
---

CircleCI インストール環境で外部 MongoDB を実行している場合、CircleCI v2.15.0 で使用するには、複数の MongoDB アップグレードが推奨されます。カスタム HA 設定に対する推奨アップグレードについては、CircleCI ソリューションエンジニアがサポートします (Platinum サポート契約が必要です)。 まずは[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)してください。

<!---

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
--->