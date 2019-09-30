---
layout: classic-docs
title: "セキュリティ機能"
category:
  - administration
order: 5
description: "CircleCI のセキュリティ機能"
---

ここでは、CircleCI に組み込まれているセキュリティ機能と、関連するインテグレーションの概要について説明します。

- 目次 
{:toc}

## 概要

CircleCI では、セキュリティを最優先事項と考え、セキュリティ問題の防止に努めると共に、問題発生時にはすばやい対応を心掛けています。 セキュリティに関する問題が発生した場合には、CircleCI セキュリティチームの GPG キー (ID：0x4013DDA7、フィンガープリント：3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7) を使用して、<security@circleci.com> まで暗号化メッセージをお送りください。

## 暗号化

CircleCI では、CircleCI サービス内外へのすべてのネットワーク通信で HTTPS または SSH を使用します。これには、ブラウザーから Services アプリケーションへの通信、Services アプリケーションから Builder フリートへの通信、Builder フリートからソース管理システムへの通信など、あらゆる通信ポイントが含まれます。 したがって、ユーザーのコードやデータが暗号化されずに CircleCI から送受信されることはありません。ただし、自身の判断で暗号化しないコードをビルドに含めることも可能です。 オペレーターは、CircleCI の SSL 設定を回避することも、基盤システムの通信に TLS を使用しないように選択することもできます。

The nature of CircleCI is that our software has access to your code and whatever data that code interacts with. All jobs on CircleCI run in a sandbox (specifically, a Docker container or an ephemeral VM) that stands alone from all other builds and is not accessible from the Internet or from your own network. ビルドエージェントは、SSH によって Git からコードをプルします。 Your particular test suite or job configurations may call out to external services or integration points within your network, and the response from such calls will be pulled into your jobs and used by your code at your discretion. After a job is complete, the container that ran the job is destroyed and rebuilt. すべての環境変数は、[HashiCorp の Vault](https://www.vaultproject.io/) を使用して暗号化されます。 Environment variables are encrypted using AES256-GCM96 and are unavailable to CircleCI employees.

## サンドボックス化

CircleCI では、コードのビルドを実行するために割り当てられるリソースをユーザーが制御できます。 これは、ビルドが実行されるコンテナを設定する Builder boxes のインスタンスを介して行われます。 ビルドコンテナは性質上、ソースコードをプルダウンし、コードベースまたは設定に含まれるあらゆるテストスクリプトとデプロイスクリプトを実行します。 これらのコンテナはサンドボックス化されます。つまり、ビルド (または並列ビルドの一部分) ごとに専用のコンテナが 1つずつ作成され、破棄されます。これらのコンテナは外部から使用することはできません。 CircleCI のサービスでは、特定のビルドコンテナに直接 SSH 接続できる機能が提供されています。 これにより、そのビルドコンテナ内のすべてのファイルまたは実行中のプロセスに完全にアクセスできると共に、ソースコードを任せられるユーザーだけに CircleCI へのアクセスを許可できます。

## インテグレーション

CircleCI には、関連する外部のサービスやテクノロジーとのインテグレーションポイントがいくつかあります。 以下の一覧では、これらのインテグレーションポイントについて説明します。

- **WebSocket：**CircleCI は、サーバーとブラウザー間の WebSocket 通信に [Pusher](https://pusher.com/) クライアントライブラリを使用していますが、インストールには slanger という内部サーバーを使用しています。そのため、Pusher サーバーが CircleCI インスタンスやソース管理システムにアクセスすることはありません。 こうした仕組みによって、たとえば、ビルドリストが動的に更新されたり、ビルドの出力が発生と同時に 1行ずつ表示されたりします。 ビルドステータスとビルド出力の行は、WebSocket サーバーを経由して送信されます (SSL なしで実行するように CircleCI を設定しない限り、SSL 上で同じ証明書を使用して行われます)。したがって、転送時には暗号化されます。

- **Replicated** For private installations of CircleCI Server, [Replicated](http://www.replicated.com/) is used to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI. Your instance of CircleCI Server communicates with Replicated servers to send license key information and version information to check for updates. Replicated does not have access to your data or other systems, and CircleCI does not send any of your data to Replicated.

- **ソース管理システム：**CircleCI を使用するには、GitHub Enterprise、GitHub.com などのソース管理システムのインスタンスとの直接接続を設定します。 CircleCI の設定時に、プライベートリポジトリのチェックアウトをシステムに許可します。 この権限は、GitHub アプリケーションの設定ページで、リポジトリの管理者ページから CircleCI のデプロイキーとサービスフックを削除して、いつでも取り消すことができます。 CircleCI ではプロジェクトを選択してビルドできますが、GitHub の権限モデルは極端なものであるため、CircleCI にはすべてのリポジトリへのアクセスが許可されるか、一切許可されないかのどちらかになります。 CircleCI インスタンスは、Git リポジトリでホスティングされているすべての項目にアクセスでき、コードのプッシュやユーザーの追加など、さまざまなイベントの Web フックを作成します。これが CircleCI にコールバックして、1つ以上の Git コマンドをトリガーすることで、コードが Builder フリートにプルダウンされます。

- **依存関係とソースのキャッシュ：**ほとんどの CircleCI ユーザーは、Amazon VPC などのプライベートクラウドインフラストラクチャ内で S3 または同等のクラウドベースのストレージを使用して、依存関係やソースのキャッシュを格納しています。 これらのストレージサーバーは、このようなサービス上に格納されるすべての項目の標準的なセキュリティパラメーターの対象となります。つまり、ほとんどの場合、ユーザーは外部からのアクセスを阻止できます。

- **アーティファクト：**アーティファクトには、S3 などのホスティングされたストレージを使用するのが一般的です。 これらのリソースが、標準的なポリシーに従ってセキュリティ保護されているなら、共に保存されている他のデータと同様、アーティファクトも外部からの侵入に対して安全と言えます。

- **iOS ビルド：**CircleCI のハードウェア上で iOS ビルドを有料で実行している場合は、macOS フリート上のビルドボックスにソースコードがダウンロードされ、コンパイルやテストの実行もそこで行われます。 自身で制御するプライマリビルドコンテナと同様に、CircleCI で実行される iOS ビルドも、アクセスできないようにサンドボックス化されます。

- **Docker** If you are using Docker images, refer to the public Docker [seccomp (security computing mode) profile](https://github.com/docker/engine/blob/e76380b67bcdeb289af66ec5d6412ea85063fc04/profiles/seccomp/default.json) for the Docker engine. CircleCI appends the following to the Docker default `seccomp` profile: 

{% raw %}
[
      {
        "comment": "Allow create user namespaces",
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
{% endraw %}

## 監査ログ

The Audit Log feature is only available for CircleCI installed on your servers or private cloud.

CircleCI logs important events in the system for audit and forensic analysis purposes. Audit logs are separarate from system logs that track performance and network metrics.

Complete Audit logs may be downloaded from the Audit Log page within the Admin section of the application as a CSV file. Audit log fields with nested data contain JSON blobs.

**Note:** In some situations, the internal machinery may generate duplicate events in the audit logs. The `id` field of the downloaded logs is unique per event and can be used to identify duplicate entries.

### 監査ログイベント
{:.no_toc}

<!-- TODO: automate this from event-cataloger --> Following are the system events that are logged. See 

`action` in the Field section below for the definition and format.

- context.create
- context.delete
- context.env_var.delete
- context.env_var.store
- project.env_var.create
- project.env_var.delete
- project.settings.update
- user.create
- user.logged_in
- user.logged_out
- workflow.job.approve
- workflow.job.finish
- workflow.job.scheduled
- workflow.job.start

### 監査ログフィールド
{:.no_toc}

- **action：**実行され、イベントを生成したアクション。 ドット区切りの小文字 ASCII ワードの形式が使用され、最初に影響を受けたエンティティと最後に実行されたアクションが含まれます。 エンティティは、たとえば `workflow.job.start` のようにネストされる場合があります。
- **actor：**対象のイベントを実行したアクター。 ほとんどの場合は CircleCI ユーザーです。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **target：**対象のイベントで影響を受けたエンティティインスタンス (プロジェクト、組織、アカウント、ビルドなど)。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **payload：**アクション固有の情報の JSON BLOB。 payload のスキーマは、同じ `action` と `version` を持つすべてのイベントで一貫していると想定されます。
- **occurred_at：**イベントが発生した UTC 日時。時刻は、最大 9桁の小数精度の ISO-8601 形式で表されます (例：'2017-12-21T13:50:54.474Z')。
- **metadata：**任意のイベントに付加できるキー・値のペアのセット。 キーと値はすべて文字列です。 これを使用すると、特定の種類のイベントに情報を追加できます。
- **id：**対象のイベントを一意に識別する UUID。 イベントのコンシューマーが、重複するデリバリーを識別できるようにします。
- **version：**イベントスキーマのバージョン。 現在、値は必ず「1」になります。 今後のバージョンでは、スキーマの変更に合わせて異なる値になる可能性があります。
- **scope：**ターゲットが CircleCI ドメインモデル内のアカウントによって所有されている場合、アカウントフィールドにはアカウント名と ID が挿入されます。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **success：**アクションが成功したかどうかを示すフラグ。
- **request：**対象のイベントが外部リクエストによってトリガーされた場合に挿入されるデータ。同じ外部リクエストから発生したイベントどうしを関連付けるために使用できます。 `id` (CircleCI がこのリクエストに割り当てたリクエスト ID)、`ip_address` (リクエストされた元の IP アドレスであり、たとえば 127.0.0.1 など IPV4 のドット区切り表記で表される)、および `client_trace_id` (元のリクエストに HTTP ヘッダー「X-Client-Trace-Id」が存在する場合は、対応するクライアント追跡 ID ヘッダー) を含む JSON BLOB の形式で表示されます。

## Checklist To Using CircleCI Securely as a Customer

If you are getting started with CircleCI there are some things you can ask your team to consider for security best practices as *users* of CircleCI:

- Minimise the number of secrets (private keys / environment variables) your build needs and rotate secrets regularly. 
  - It is important to rotate secrets regularly in your organization, especially as team members come and go. 
  - Rotating secrets regularly means your secrets are only active for a certain amount of time, helping to reduce possible risks if keys are compromised.
  - Ensure the secrets you *do* use are of limited scope - with only enough permissions for the purposes of your build. Consider carefully adjudicating the role and permission systems of other platforms you use outside of CircleCI; for example, when using something such as IAM permissions on AWS, or Github's [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) feature. 
- Sometimes user misuse of certain tools might accidentally print secrets to stdout which will land in your logs. Please be aware of: 
  - running `env` or `printenv` which will print all your environment variables to stdout.
  - literally printing secrets in your codebase or in your shell with `echo`.
  - programs or debugging tools that print secrets on error.
- Consult your VCS provider's permissions for your organization (if you are in an organizations) and try to follow the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege). 
- Use Restricted Contexts with teams to share environment variables with a select security group. Read through the [contexts]({{ site.baseurl }}/2.0/contexts/#restricting-a-context) document to learn more.
- Ensure you audit who has access to SSH keys in your organization.
- Ensure that your team is using Two-Factor Authentication (2FA) with your VCS ([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa), [Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html)). If a user's GitHub or Bitbucket account is compromised a nefarious actor could push code or potentially steal secrets.
- If your project is open source and public, please make note of whether or not you want to share your environment variables. On CircleCI, you can change a project's settings to control whether your environment variables can pass on to *forked versions of your repo*. This is **not enabled** by default. You can read more about these settings and open source security in our [Open Source Projects document]({{site.baseurl}}/2.0/oss/#security).

## See Also
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)