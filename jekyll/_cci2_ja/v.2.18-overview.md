---
layout: classic-docs
title: "CircleCI Server v2.18 の新機能"
short-title: "CircleCI Server v2.18 の新機能"
description: "CircleCI Server v2.18 の入門ガイド"
categories:
  - getting-started
order: 1
---

CircleCI Server v2.18 の機能強化や不具合修正についてまとめます。 パッチ リリースを含むすべての変更の一覧は、[変更履歴](https://circleci.com/ja/server/changelog)でご確認ください。 お使いの CircleCI Server を v2.17.x から v2.18 に**アップグレード**する手順については、[アップグレード ガイド](https://circleci.com/ja/docs/2.0/updating-server/#section=server-administration)をご覧ください。

## アップグレードの要件

<div class="alert alert-warning" role="alert">
<b>警告:</b> 任意の時点で組織の名前を変更していた場合は、アップグレード プロセスを開始する前に、<a href="https://circleci.com/ja/docs/2.0/updating-server/#org-rename-script">スクリプト</a>を実行する<b>必要があります</b>。
</div>

## 注意事項とベスト プラクティス

* Services マシンには最低 32 GB の RAM が必要になりました。
* Redis の構成を一部変更しました。 Redis を外部処理化している場合は、構成を更新する必要があります。 担当のカスタマー サクセス マネージャーまでお問い合わせください。
* 対応する Postgres バージョンを変更したため、postgreSQL v9.5.16 以降が必要です。 PostgreSQL を外部処理化している場合は、バージョン 2.17.x のうちに更新してから、2.18 にアップグレードしてください。

## バージョン 2.18 の新機能

* コンテキストにセキュリティ グループを追加することで、実行時に環境変数の使用を制約できるようになりました。 セキュリティ グループは、GitHub チームまたは LDAP グループとして定義されます。 コンテキストにセキュリティ グループを追加すると、そのセキュリティ グループのメンバーである CircleCI ユーザーのみが、コンテキストの環境変数にアクセスまたは環境変数を使用できます。 詳細については、[コンテキストの制約に関するガイド](https://circleci.com/ja/docs/2.0/contexts/#コンテキストの制約)をご覧ください。
* AWS の外部でストレージ ドライバーを実行しているお客様は、ビルド アーティファクトを検索する際のルーティング時間が改善されます。
* CircleCI からの出力を取得するメトリクスをカスタマイズできるようになりました。 手順とオプションについては、[カスタム メトリクスに関するガイド](https://circleci.com/ja/docs/2.0/monitoring/#カスタム-メトリクス)をご覧ください。 以下は、カスタム メトリクスを有効にしている場合にデフォルトで含まれるメトリクスの一覧です。

<br>

| メトリクス名                                           | 説明                                              |
| ------------------------------------------------ | ----------------------------------------------- |
| `circle.backend.action.upload-artifact-error`    | アーティファクトのアップロードに失敗した回数                          |
| `circle.build-queue.runnable.builds`             | システムを移動するビルドのうち実行可能と見なされるものの数                   |
| `circle.dispatcher.find-containers-failed`       | 1.0 のビルドの数                                      |
| `circle.github.api_call`                         | CircleCI が GitHub に対して実行している API 呼び出しの回数        |
| `circle.http.request`                            | CircleCi のリクエストへの応答コード                          |
| `circle.nomad.client_agent.*`                    | Nomad クライアントのメトリクス                              |
| `circle.nomad.server_agent.*`                    | 存在する Nomad サーバーの数                               |
| `circle.run-queue.latency`                       | 実行可能なビルドが待機している時間                               |
| `circle.state.container-builder-ratio`           | Builder ごとのコンテナの数 (1.0 のみ)                      |
| `circle.state.lxc-available`                     | 利用可能なコンテナの数 (1.0 のみ)                            |
| `circle.state.lxc-reserved`                      | 予約/使用中のコンテナの数 (1.0 のみ)                          |
| `circleci.cron-service.messaging.handle-message` | `cron-service` によって処理される RabbitMQ メッセージのタイミングと数 |
| `circleci.grpc-response`                         | grpc システムが呼び出すシステムの待機時間                         |


<!-- * You can now customize your resource class sizes in Server! This means you can change your default resource class as well as define new ones! For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#resource-classes)

* Server installations can now have a new machine type enabled for the Large resource class.  For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#enable-the-large-resource-class-for-machine-executor) -->

<br>

* You can now provide individual AMIs for both Remote Docker and machine executor jobs. Previously we provided the option for a single custom AMI to be used across both, but with v2.18, this expanded customization gives you greater control over versioning and dependencies to meet your individual CICD needs. See [our VM Service guide](https://circleci.com/docs/2.0/vm-service/#section=server-administration)  for more information.

## バージョン 2.18 での修正点

* Additional fixes around contexts and org renames.
* Fixed an issue where occasionally volumes would fail to attach to spun up Remote Docker/`machine` instances.
* Fixed an issue where the CircleCI integration could not be installed on JIRA instances with the jira.com subdomain.
* Fixed an issue where the Workflows page would still point to an old repo after renaming an organization.
* Fixed an issue where the Workflows UI would fail to refresh data automatically.
* Improved context loading times in cases when they could cause timeouts in the UI.
* Fixed an issue where contexts would cause builds to return CIRCLE_BUG .
