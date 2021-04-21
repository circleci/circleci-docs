---
layout: classic-docs
title: "CircleCI Server v2.18 の新機能"
short-title: "CircleCI Server v2.18 の新機能"
description: "CircleCI Server v2.18 の入門ガイド"
categories:
  - getting-started
order: 1
---

CircleCI Server v2.18 の機能強化や不具合修正についてまとめます。 パッチ リリースを含むすべての変更の一覧は、[変更履歴](https://circleci.com/ja/server/changelog)でご確認ください。 For a step by step guide to **upgrading** your CircleCI Server installation from v2.17.x to v2.18, see our [upgrade guide]({{ site.baseurl }}/2.0/updating-server/).

## Requirements for upgrading
{: #requirements-for-upgrading }

<div class="alert alert-warning" role="alert">
<b>警告:</b> 任意の時点で組織の名前を変更していた場合は、アップグレード プロセスを開始する前に、<a href="https://circleci.com/ja/docs/2.0/updating-server/#org-rename-script">スクリプト</a>を実行する<b>必要があります</b>。
</div>

## Notes and best practices
{: #notes-and-best-practices }

* Services マシンには最低 32 GB の RAM が必要になりました。
* Redis の構成を一部変更しました。 Redis を外部処理化している場合は、構成を更新する必要があります。 担当のカスタマー サクセス マネージャーまでお問い合わせください。
* 対応する Postgres バージョンを変更したため、postgreSQL v9.5.16 以降が必要です。 PostgreSQL を外部処理化している場合は、バージョン 2.17.x のうちに更新してから、2.18 にアップグレードしてください。

## What's new in release 2.18.3
{: #whats-new-in-release-2183 }

* You can now generate a Windows-based image to make available for running using the `machine` executor. See the VM Service guide for [instructions on building the image and making it available]({{ site.baseurl }}/2.0/vm-service/#creating-a-windows-ami). For details of using the Windows executor, see our [Executors and Images overview]({{ site.baseurl }}/2.0/executor-intro/#windows).

## What's new in release 2.18
{: #whats-new-in-release-218 }

* It is now possible to restrict environment variables at run time by adding security groups to contexts. Security groups are defined as GitHub teams or LDAP groups. After a security group is added to a context, only CircleCI users who are members of that security group may access or use the environment variables of the context. For more information see our [guide to restricting a context]({{ site.baseurl }}/2.0/contexts/#restricting-a-context).
* Customers running storage drivers external to AWS will see improved routing times when searching for build Artifacts.
* You can now customize the metrics that get output from CircleCI. For steps and options, see our [Custom Metrics guide]({{ site.baseurl }}/2.0/monitoring/#custom-metrics). Below is a short list of metrics that are included by default when enabling Custom Metrics:

<br>

| メトリクス名                                           | 説明                                                     |
| ------------------------------------------------ | ------------------------------------------------------ |
| `circle.backend.action.upload-artifact-error`    | アーティファクトのアップロードに失敗した回数                                 |
| `circle.build-queue.runnable.builds`             | システムを移動するビルドのうち実行可能と見なされるものの数                          |
| `circle.dispatcher.find-containers-failed`       | 1.0 のビルドの数                                             |
| `circle.github.api_call`                         | Tracks how many api calls CircleCI is making to GitHub |
| `circle.http.request`                            | CircleCi のリクエストへの応答コード                                 |
| `circle.nomad.client_agent.*`                    | Nomad クライアントのメトリクス                                     |
| `circle.nomad.server_agent.*`                    | 存在する Nomad サーバーの数                                      |
| `circle.run-queue.latency`                       | 実行可能なビルドが待機している時間                                      |
| `circle.state.container-builder-ratio`           | Builder ごとのコンテナの数 (1.0 のみ)                             |
| `circle.state.lxc-available`                     | 利用可能なコンテナの数 (1.0 のみ)                                   |
| `circle.state.lxc-reserved`                      | 予約/使用中のコンテナの数 (1.0 のみ)                                 |
| `circleci.cron-service.messaging.handle-message` | `cron-service` によって処理される RabbitMQ メッセージのタイミングと数        |
| `circleci.grpc-response`                         | grpc システムが呼び出すシステムの待機時間                                |


<!-- * You can now customize your resource class sizes in Server! This means you can change your default resource class as well as define new ones! For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#resource-classes)

* Server installations can now have a new machine type enabled for the Large resource class.  For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#enable-the-large-resource-class-for-machine-executor) -->

<br>

* You can now provide individual AMIs for both Remote Docker and machine executor jobs. Previously we provided the option for a single custom AMI to be used across both, but with v2.18, this expanded customization gives you greater control over versioning and dependencies to meet your individual CICD needs. See [the VM Service guide]({{ site.baseurl }}/2.0/vm-service/) for more information.

## Fixed in release 2.18
{: #fixed-in-release-218 }

* Additional fixes around contexts and org renames.
* Fixed an issue where occasionally volumes would fail to attach to spun up Remote Docker/`machine` instances.
* Fixed an issue where the CircleCI integration could not be installed on JIRA instances with the jira.com subdomain.
* Fixed an issue where the Workflows page would still point to an old repo after renaming an organization.
* Fixed an issue where the Workflows UI would fail to refresh data automatically.
* Improved context loading times in cases when they could cause timeouts in the UI.
* Fixed an issue where contexts would cause builds to return CIRCLE_BUG .
