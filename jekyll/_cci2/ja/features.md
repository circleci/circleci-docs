---
layout: classic-docs
title: "コア機能"
short-title: "コア機能"
description: "CircleCI 2.0 コア機能の入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

ここでは、CircleCI の機能について、開発者向け機能とオペレーター向け機能に分けて概要を説明します。

## Developer features

CircleCI が提供する機能のうち、開発者の方に関係する人気の機能を紹介します。

### SSH into builds

多くの場合、問題を解決するには、[ジョブへの SSH 接続]({{ site.baseurl }}/2.0/ssh-access-jobs/)を行い、ログ ファイル、実行中のプロセス、ディレクトリ パスなどを調べることが最善の方法です。 CircleCI 2.0 では、すべてのジョブに SSH を介してアクセスするオプションが用意されています。

Note: When CircleCI runs your pipeline, the [`run` ](https://circleci.com/docs/2.0/configuration-reference/#run) command executes shell commands in a *non-interactive* shell. When SSH-ing into a build, you are using an *interactive* shell (see the section on [Invocation](https://linux.die.net/man/1/bash) in the bash manual for more information). An interactive bash shell loads a series of startup files (such as `~/.bash_profile`), which may or may not change the outcome of SSH debugging process.

### 並列処理

If your project has a large number of tests, it will need more time to run them on one machine. To reduce this time, you can [run tests in parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) by spreading them across multiple machines. This requires specifying a parallelism level.

Use either the CircleCI CLI to split test files or use environment variables to configure each parallel machine individually.

### Resource class

It is possible to configure CPU and RAM resources for each job, allowing for efficient use of your resources. The [resource class]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) will need to be specified in the `.circleci/config.yml` file. If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used.

### キャッシュ

Another popular feature is [caching]({{ site.baseurl }}/2.0/caching/). Caching is one of the most effective ways to make jobs faster on CircleCI by reusing the data from expensive fetch operations from previous jobs.

### ワークフロー

CircleCI [Workflows]({{ site.baseurl }}/2.0/workflows/) are a great feature that can increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.

## Operator features

These are the most frequently asked about features CircleCI offers that Operators are interested in.

### モニタリング

System Administrators are able to gather [metrics for monitoring]({{ site.baseurl }}/2.0/monitoring/) their CircleCI installation for various environment variables including installed Nomad Clients and Docker metrics.

### Nomad cluster

CircleCI uses Nomad as the primary job scheduler in CircleCI 2.0. Refer to the [basic introduction to Nomad]({{ site.baseurl }}/2.0/nomad/) for understanding how to operate the Nomad Cluster in your CircleCI 2.0 installation.

### API

The [CircleCI API]({{ site.baseurl }}/api/) is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI.

### Basic troubleshooting

There are some [initial troubleshooting]({{ site.baseurl }}/2.0/troubleshooting/) steps to take if you are having problems with your CircleCI installation on your private server.

If your issue is not addressed in the above article, generate a [support bundle](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/) for your installation and open a support ticket.

### インサイト

The [Insights page]({{ site.baseurl }}/2.0/insights/) in the CircleCI UI is a dashboard showing the health of all repositories you are following including median build time, median queue time, last build time, success rate, and parallelism.