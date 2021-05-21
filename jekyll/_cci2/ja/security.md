---
layout: classic-docs
title: "セキュリティ機能"
category:
  - administration
order: 5
description: "CircleCI のセキュリティ機能"
---

CircleCI に組み込まれているセキュリティ機能と、関連するインテグレーションの概要について説明します。

* TOC
{:toc}

## 概要
{: #overview }
Security is our top priority at CircleCI, we are proactive and we act on security issues immediately. Report security issues to <security@circleci.com> with an encrypted message using our security team's GPG key (ID: 0x4013DDA7, fingerprint: 3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7).

## 暗号化
{: #encryption }
CircleCI uses HTTPS or SSH for all networking in and out of our service including from the browser to our services application, from the services application to your builder fleet, from our builder fleet to your source control system, and all other points of communication. In short, none of your code or data travels to or from CircleCI without being encrypted unless you have code in your builds that does so at your discretion. Operators may also choose to go around our SSL configuration or not use TLS for communicating with underlying systems.

The nature of CircleCI is that our software has access to your code and whatever data that code interacts with. All jobs on CircleCI run in a sandbox (specifically, a Docker container or an ephemeral VM) that stands alone from all other builds and is not accessible from the Internet or from your own network. The build agent pulls code via git over SSH. Your particular test suite or job configurations may call out to external services or integration points within your network, and the response from such calls will be pulled into your jobs and used by your code at your discretion. After a job is complete, the container that ran the job is destroyed and rebuilt. All environment variables are encrypted using [Hashicorp Vault](https://www.vaultproject.io/). Environment variables are encrypted using AES256-GCM96 and are unavailable to CircleCI employees.

## サンドボックス化
{: #sandboxing }
With CircleCI you control the resources allocated to run the builds of your code. This will be done through instances of our builder boxes that set up the containers in which your builds will run. By their nature, build containers will pull down source code and run whatever test and deployment scripts are part of the code base or your configuration. The containers are sandboxed, each created and destroyed for one build only (or one slice of a parallel build), and they are not available from outside themselves. The CircleCI service provides the ability to SSH directly to a particular build container. When doing this a user will have complete access to any files or processes being run inside that build container, so provide access to CircleCI only to those also trusted with your source code.

## インテグレーション
{: #integrations }
A few different external services and technology integration points touch CircleCI. The following list enumerates those integration points.

- **Web Sockets** We use [Pusher](https://pusher.com/) client libraries for WebSocket communication between the server and the browser, though for installs we use an internal server called slanger, so Pusher servers have no access to your instance of CircleCI nor your source control system. こうしたしくみによって、たとえば、ビルド リストが動的に更新されたり、ビルドの出力が発生と同時に 1 行ずつ表示されたりします。 ビルド ステータスとビルド出力の行は、WebSocket サーバーを経由して送信されます (SSL なしで実行するように CircleCI を構成しない限り、SSL 上で同じ証明書を使用して行われます)。したがって、転送時には暗号化されます。

- **Replicated** For private installations of CircleCI Server, [Replicated](http://www.replicated.com/) is used to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI. CircleCI Servｅｒ インスタンスは、更新の有無を確認するために、Replicated サーバーと通信してライセンス キー情報やバージョン情報を送信します。 Replicated がユーザーのデータや他のシステムにアクセスすることはありません。また、CircleCI がユーザーのデータを Replicated に送信することもありません。

- **Source Control Systems** To use CircleCI you will set up a direct connection with your instance of GitHub Enterprise, GitHub.com, or other source control system. CircleCI のセットアップ時に、プライベート リポジトリのチェックアウトをシステムに許可します。 この権限は、GitHub アプリケーションの設定ページで、リポジトリの管理者ページから CircleCI のデプロイ キーとサービス フックを削除して、いつでも取り消すことができます。 CircleCI ではプロジェクトを選択してビルドできますが、GitHub の権限モデルは極端なものであるため、CircleCI にはすべてのリポジトリへのアクセスが許可されるか、一切許可されないかのどちらかになります。 CircleCI インスタンスは、Git リポジトリでホスティングされているすべての項目にアクセスでき、コードのプッシュやユーザーの追加など、さまざまなイベントの Web フックを作成します。これが CircleCI にコール バックして、1 つ以上の Git コマンドをトリガーすることで、コードが Builder フリートにプル ダウンされます。

- **Dependency and Source Caches** Most CircleCI customers use S3 or equivalent cloud-based storage inside their private cloud infrastructure (Amazon VPC, etc) to store their dependency and source caches. これらのストレージ サーバーは、このようなサービス上に格納されるすべての項目の標準的なセキュリティ パラメーターの対象となります。つまり、ほとんどの場合、ユーザーは外部からのアクセスを阻止できます。

- **Artifacts** To help prevent other builds from accessing your browser local storage when viewing artifacts, HTML and XHTML pages are hosted on their own project-specific subdomain of `*.circle-artifacts.com`. Non-HTML artifacts will usually be (`302 FOUND`) redirected to an S3 URL to allow for the highest download speed. Because these artifact types are hosted on a single S3 domain, artifacts may access your browser local storage on HTML and XHTML pages, and so you should avoid entering sensitive data into your browser for these URLs.

- **iOS Builds** If you are paying to run iOS builds on CircleCI hardware your source code will be downloaded to a build box on our macOS fleet where it will be compiled and any tests will be run. 自身で制御するプライマリ ビルド コンテナと同様に、CircleCI で実行される iOS ビルドも、アクセスできないようにサンドボックス化されます。

- **Docker** If you are using Docker images, refer to the public Docker [seccomp (security computing mode) profile](https://github.com/docker/engine/blob/e76380b67bcdeb289af66ec5d6412ea85063fc04/profiles/seccomp/default.json) for the Docker engine. CircleCI は、Docker のデフォルトの `seccomp` プロファイルに以下のように付加します。

{% raw %}
```
[
  {
    "comment": "ユーザー名前空間の作成を許可",
    "names": [
      "clone",
      "setns",
      "unshare"
    ],
    "action": "SCMP_ACT_ALLOW",
    "args": [],
    "includes": {},
    "excludes": {}
  }
]
```
{% endraw %}

## Audit logs
{: #audit-logs }
CircleCI Server customers can access the audit log feature from the UI. Cloud customers can [contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request an Audit log. **Note:** only organization admin users can make an audit log request.

CircleCI logs important events in the system for audit and forensic analysis purposes. Audit logs are separarate from system logs that track performance and network metrics.

Complete Audit logs may be downloaded from the Audit Log page within the Admin section of the application as a CSV file.  Audit log fields with nested data contain JSON blobs.

**Note:** In some situations, the internal machinery may generate duplicate events in the audit logs. The `id` field of the downloaded logs is unique per event and can be used to identify duplicate entries.

### Audit log events
{: #audit-log-events }
{:.no_toc}

<!-- TODO: automate this from event-cataloger -->
Following are the system events that are logged. See `action` in the Field section below for the definition and format.

- context.create
- context.delete
- context.env_var.delete
- context.env_var.store
- project.env_var.create
- project.env_var.delete
- project.settings.update
- project.ssh_key.create
- project.ssh_key.delete
- user.create
- user.logged_in
- user.logged_out
- workflow.job.approve
- workflow.job.finish
- workflow.job.scheduled
- workflow.job.start


### Audit log fields
{: #audit-log-fields }
{:.no_toc}

- **action:** The action taken that created the event. ドット区切りの小文字 ASCII ワードの形式が使用され、最初に影響を受けたエンティティと最後に実行されたアクションが含まれます。 エンティティは、たとえば `workflow.job.start` のようにネストされる場合があります。
- **actor:** The actor who performed this event. ほとんどの場合は CircleCI ユーザーです。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **target:** The entity instance acted upon for this event, for example, a project, an org, an account, or a build. このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **payload:** A JSON blob of action-specific information. payload のスキーマは、同じ `action` と `version` を持つすべてのイベントで一貫していると想定されます。
- **occurred_at:** When the event occurred in UTC expressed in ISO-8601 format with up to nine digits of fractional precision, for example '2017-12-21T13:50:54.474Z'.
- **metadata:** A set of key/value pairs that can be attached to any event. キーと値はすべて文字列です。 これを使用すると、特定の種類のイベントに情報を追加できます。
- **id:** A UUID that uniquely identifies this event. イベントのコンシューマーが、重複するデリバリーを識別できるようにします。
- **version:** Version of the event schema. 現在、値は必ず「1」になります。 今後のバージョンでは、スキーマの変更に合わせてこの値も変更になる可能性があります。
- **scope:** If the target is owned by an Account in the CircleCI domain model, the account field should be filled in with the Account name and ID. このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **success:** A flag to indicate if the action was successful.
- **request:** If this event was triggered by an external request this data will be populated and may be used to connect events that originate from the same external request. The format is a JSON blob containing `id` (the unique ID assigned to this request by CircleCI).

## Checklist to using CircleCI securely as a customer
{: #checklist-to-using-circleci-securely-as-a-customer }

If you are getting started with CircleCI there are some things you can ask your team to consider for security best practices as _users_ of CircleCI:

- ビルドが必要とするシークレット (プライベート キー、環境変数) の数を最小限に抑え、定期的にシークレットを入れ替えます。
  - 組織のシークレットを定期的に (チーム メンバーが変わるときは特に) 入れ替えることが重要です。
  - シークレットを定期的に入れ替えることで、シークレットの有効期限が設けられ、キーが漏洩した場合の潜在的なリスクを軽減できます。
  - Ensure the secrets you _do_ use are of limited scope - with only enough permissions for the purposes of your build. AWS 上での IAM 権限や GitHub の [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) 機能など、CircleCI の外部で使用する他のプラットフォームのロールおよび権限システムについては、慎重に判断していただくようお願いします。
- ユーザーが何らかのツールを誤用することで、シークレットが偶然に stdout に出力され、ログに記録されてしまう可能性があります。 以下の場合には注意してください。
  - すべての環境変数を stdout に出力する `env` または `printenv` を実行する場合
  - `echo` を使用し、コード ベースまたはシェル内のシークレットを出力する場合
  - プログラムやデバッグ ツールがエラー時にシークレットを出力する場合
- VCS プロバイダーから付与された組織の権限を確認したうえで、[最小権限の原則](https://ja.wikipedia.org/wiki/最小権限の原則)に従うよう努めます (組織に属している場合)。
- チーム間では制約付きコンテキストを使用し、環境変数は一部のセキュリティ グループでのみ共有します。 詳細については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts/#コンテキストの制限)をお読みください。
- SSH キーへのアクセス権を持つ人間は、必ず組織による監査の対象とします。
- VCS で 2 要素認証 (2FA) を必ず使用します ([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa)、[Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html))。 ユーザーの GitHub または Bitbucket アカウントが漏れると、悪意のあるアクターによってコードがプッシュされたり、秘密が盗まれたりする危険性があります。
- パブリックのオープンソース プロジェクトでは、環境変数を共有するかどうかを明記します。 On CircleCI, you can change a project's settings to control whether your environment variables can pass on to _forked versions of your repo_. This is **not enabled** by default. この設定とオープンソースのセキュリティの詳細については、[オープンソース プロジェクトのドキュメント]({{site.baseurl}}/2.0/oss/#セキュリティ)を参照してください。


## See also
{: #see-also }
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
