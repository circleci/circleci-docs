---
layout: classic-docs
title: "Pipeline Processing"
description: "This document describes CircleCI pipelines, what they encompass, and some features available to use in your pipelines"
categories:
  - settings
order: 1
version:
  - クラウド
  - Server v3.x
---

This document describes how your projects are processed using our pipelines engine and some of the features available to use in your pipelines. パイプラインは クラウド版 および オンプレミス版 CircleCI Server でご利用いただけます。

* 目次
{:toc}

## はじめに
{: #what-are-pipelines }

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines include your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

Pipelines are not available on installations of CircleCI server v2.x.

The following features are available for use in your pipelines:

{% include snippets/pipelines-benefits.adoc %}

## トラブルシューティング
このセクションでは、パイプラインへの移行プロセスについて概説します。

When migrating from a server v2.x to a v3.x installation you will have project configurations made before the introduction of pipelines. Pipelines are automatically enabled for server v3.x installations so all you need to do is change your project configurations (`.circleci/_config.yml`) to `version: 2.1` to access all the features described in the section above.

### 2.0 構成でのパイプライン
{: #pipelines-with-20-configuration }
{:.no_toc}

When using CircleCI cloud or server v3.x the CircleCI pipelines engine is automatically enabled. If, for whatever reason, you continue to use a 2.0 config, CircleCI will inject the `CIRCLE_COMPARE_URL` environment variable into all jobs for backwards compatibility.

This environment variable is generated in a different way compared to the version available in legacy jobs, and is not always available – it is not injected when there is no meaningful previous revision, for example, on the first push of commits to an empty repository, or when a new branch is created/pushed without any additional commits.

## 関連項目
{: #see-also }
{:.no_toc}

詳細については、[ビルドのスキップとキャンセル]({{ site.baseurl }}/ja/2.0/skip-build/#auto-cancelling-a-redundant-build)のページを参照してください。
