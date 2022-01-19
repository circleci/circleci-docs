---
layout: classic-docs
title: "セキュリティ機能"
category:
  - 管理
order: 5
description: "CircleCI のセキュリティ機能"
---

CircleCI に組み込まれているセキュリティ機能と、関連するインテグレーションの概要について説明します。

* TOC
{:toc}

## 概要
{: #overview }
CircleCI では、セキュリティを最優先事項と考え、セキュリティ問題発生の防止に努めると共に、問題発生時にはすばやい対応を心掛けています。 セキュリティに関する問題が発生した場合には、CircleCI セキュリティ チームの GPG キー (ID：0x4013DDA7、フィンガープリント：3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7) を使用して、<security@circleci.com> まで暗号化メッセージをお送りください。

## 暗号化
{: #encryption }
CircleCI では、CircleCI サービス内外へのすべてのネットワーク通信で HTTPS または SSH を使用します。これには、ブラウザーから Services アプリケーションへの通信、Services アプリケーションから Builder フリートへの通信、Builder フリートからソース管理システムへの通信など、あらゆる通信ポイントが含まれます。 したがって、ユーザーのコードやデータが暗号化されずに CircleCI から送受信されることはありません。ただし、自身の判断で暗号化しないコードをビルドに含めることも可能です。 オペレーターは、CircleCI の SSL 構成を回避することも、基盤システムの通信に TLS を使用しないように選択することもできます。

CircleCI のソフトウェアは性質上、ユーザーのコードやそのコードが操作するあらゆるデータにアクセスできます。 CircleCI 上のすべてのジョブは、他のあらゆるビルドから独立し、インターネットやユーザー自身のネットワークからアクセスできないサンドボックス (具体的には、Docker コンテナまたはエフェメラル VM) 内で実行されます。 ビルド エージェントは、SSH によって Git からコードをプルします。 特定のテスト スイートまたはジョブ構成は、外部サービスまたはネットワーク内のインテグレーション ポイントに対して呼び出しを行うことができます。そうした呼び出しからの応答は、ジョブにプルされ、ユーザー自身の判断でコードに使用されます。 1 つのジョブが完了すると、ジョブを実行したコンテナは廃棄され、リビルドされます。 すべての環境変数は、[HashiCorp の Vault](https://www.vaultproject.io/) を使用して暗号化されます。 環境変数は、AES256-GCM96 を使用して暗号化され、CircleCI の従業員には使用できません。

## サンドボックス化
{: #sandboxing }
CircleCI では、コードのビルドを実行するために割り当てられるリソースをユーザーが制御できます。 これは、ビルドが実行されるコンテナをセットアップする Builder boxes のインスタンスを介して行われます。 ビルド コンテナは性質上、ソース コードをプル ダウンし、コード ベースまたは構成に含まれるあらゆるテスト スクリプトとデプロイ スクリプトを実行します。 これらのコンテナはサンドボックス化されます。つまり、ビルド (または並列ビルドの一部分) ごとに専用のコンテナが 1 つずつ作成され、破棄されます。これらのコンテナは外部から使用することはできません。 CircleCI のサービスでは、特定のビルド コンテナに直接 SSH 接続できる機能が提供されています。 これにより、そのビルド コンテナ内のすべてのファイルまたは実行中のプロセスに完全にアクセスできると共に、ソース コードを任せられるユーザーだけに CircleCI へのアクセスを許可できます。

## インテグレーション
{: #integrations }
CircleCI には、関連する外部のサービスやテクノロジーとのインテグレーション ポイントがいくつかあります。 以下の一覧では、これらのインテグレーション ポイントについて説明します。

- **WebSocket:** CircleCI は、サーバーとブラウザー間の WebSocket 通信に [Pusher](https://pusher.com/) クライアント ライブラリを使用していますが、インストールには slanger という内部サーバーを使用しています。 そのため、Pusher サーバーが CircleCI インスタンスやソース管理システムにアクセスすることはありません。 こうしたしくみによって、たとえば、ビルド リストが動的に更新されたり、ビルドの出力が発生と同時に 1 行ずつ表示されたりします。 ビルド ステータスとビルド出力の行は、WebSocket サーバーを経由して送信されます (SSL なしで実行するように CircleCI を構成しない限り、SSL 上で同じ証明書を使用して行われます)。 したがって、転送時には暗号化されます。

- **Replicated:** CircleCI Server のプライベート インスタンスでは、[Replicated](http://www.replicated.com/) を使用して、インストール ウィザード、ライセンス キー、システム監査ログ、ソフトウェアの更新など、CircleCI のメンテナンスやシステムに関する作業を管理します。 CircleCI Server インスタンスは、更新の有無を確認するために、Replicated サーバーと通信してライセンス キー情報やバージョン情報を送信します。 Replicated がユーザーのデータや他のシステムにアクセスすることはありません。 また、CircleCI がユーザーのデータを Replicated に送信することもありません。

- **ソース管理システム:** CircleCI を使用するには、GitHub Enterprise、GitHub.com などのソース管理システムのインスタンスとの直接接続をセットアップします。 CircleCI のセットアップ時に、プライベート リポジトリのチェックアウトをシステムに許可します。 この権限は、GitHub アプリケーションの設定ページで、リポジトリの管理者ページから CircleCI のデプロイ キーとサービス フックを削除して、いつでも取り消すことができます。 CircleCI ではプロジェクトを選択してビルドできますが、GitHub の権限モデルは極端なものであるため、CircleCI にはすべてのリポジトリへのアクセスが許可されるか、一切許可されないかのどちらかになります。 CircleCI インスタンスは、Git リポジトリでホスティングされているすべての項目にアクセスでき、コードのプッシュやユーザーの追加など、さまざまなイベントの Web フックを作成します。 これが CircleCI にコール バックして、1 つ以上の Git コマンドをトリガーすることで、コードが Builder フリートにプル ダウンされます。

- **依存関係とソースのキャッシュ:** ほとんどの CircleCI ユーザーは、Amazon VPC などのプライベート クラウド インフラストラクチャ内で S3 または同等のクラウドベースのストレージを使用して、依存関係やソースのキャッシュを格納しています。 これらのストレージ サーバーは、このようなサービス上に格納されるすべての項目の標準的なセキュリティ パラメーターの対象となります。 つまり、ほとんどの場合、ユーザーは外部からのアクセスを阻止できます。

- **Artifacts** To help prevent other builds from accessing your browser local storage when viewing artifacts, HTML and XHTML pages are hosted on their own project-specific subdomain of `*.circle-artifacts.com`. Non-HTML artifacts will usually be (`302 FOUND`) redirected to an S3 URL to allow for the highest download speed. Because these artifact types are hosted on a single S3 domain, artifacts may access your browser local storage on HTML and XHTML pages, and so you should avoid entering sensitive data into your browser for these URLs.

- **iOS ビルド:** CircleCI のハードウェア上で iOS ビルドを有料で実行している場合は、macOS フリート上のビルド ボックスにソース コードがダウンロードされ、コンパイルやテストの実行もそこで行われます。 自身で制御するプライマリ ビルド コンテナと同様に、CircleCI で実行される iOS ビルドも、アクセスできないようにサンドボックス化されます。

- **Docker:** Docker イメージを使用している場合は、Docker Engine について、Docker 公式の [seccomp (セキュリティ コンピューティング モード) プロファイル](https://github.com/docker/engine/blob/e76380b67bcdeb289af66ec5d6412ea85063fc04/profiles/seccomp/default.json)を参照してください。 CircleCI は、Docker のデフォルトの `seccomp` プロファイルに以下のように付加します。

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

CircleCI では、監査およびフォレンジック分析の目的で、重要なイベントをログとしてシステムに記録します。 監査ログは、パフォーマンスやネットワークメトリクスを追跡するシステムログとは区別されます。

完全な監査ログは、アプリケーションの管理者セクション内にある [Audit Log (監査ログ)] ページから CSV ファイル形式でダウンロードできます。  ネストされたデータを含む監査ログフィールドには JSON BLOB が含まれます。

**メモ：**内部挙動により、重複するイベントが監査ログに生成される場合があります。 ダウンロードしたログの `id` フィールドはイベントに固有であるため、このフィールドを使用して重複するエントリを特定できます。

### Audit log events
{: #audit-log-events }
{:.no_toc}

<!-- TODO: automate this from event-cataloger -->
ログには以下のシステムイベントが記録されます。 定義と形式については、以下の「監査ログフィールド」セクションの `action` を参照してください。

- context.create
- context.delete
- context.env_var.delete
- context.env_var.store
- project.env_var.create
- project.env_var.delete
- project.settings.update
- project.ssh_key.create
- project.ssh_key.delete
- project.api_token.create
- schedule.create
- schedule.update
- schedule.delete
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

- **action:** 実行され、イベントを生成したアクション。 ドット区切りの小文字 ASCII ワードの形式が使用され、最初に影響を受けたエンティティと最後に実行されたアクションが含まれます。 エンティティは、たとえば `workflow.job.start` のようにネストされる場合があります。
- **actor:** 対象のイベントを実行したアクター。 ほとんどの場合は CircleCI ユーザーです。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **target:** 対象のイベントで影響を受けたエンティティ インスタンス (プロジェクト、組織、アカウント、ビルドなど)。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **payload:** アクション固有の情報の JSON BLOB。 payload のスキーマは、同じ `action` と `version` を持つすべてのイベントで一貫していると想定されます。
- **occurred_at:** イベントが発生した UTC 日時。時刻は、最大 9 桁の小数精度の ISO-8601 形式で表されます (例: '2017-12-21T13:50:54.474Z')。
- **metadata:** 任意のイベントに付加できるキー・値のペアのセット。 キーと値はすべて文字列です。 これを使用すると、特定の種類のイベントに情報を追加できます。
- **id:** 対象のイベントを一意に識別する UUID。 イベントのコンシューマーが、重複するデリバリーを識別できるようにします。
- **version:** イベント スキーマのバージョン。 現在、値は必ず「1」になります。 今後のバージョンでは、スキーマの変更に合わせてこの値も変更になる可能性があります。
- **scope:** ターゲットが CircleCI ドメイン モデル内のアカウントによって所有されている場合、アカウント フィールドにはアカウント名と ID が挿入されます。 このデータは JSON BLOB で、`id` と `type` が必ず含まれ、多くの場合 `name` も含まれます。
- **success:** アクションが成功したかどうかを示すフラグ。
- **request:** 対象のイベントが外部リクエストによってトリガーされた場合に挿入されるデータ。 同じ外部リクエストから発生したイベントどうしを関連付けるために使用できます。 `id` (CircleCI がこのリクエストにより割り当てた一意の ID) を含む JSON BLOB の形式で表示されます。

## 関連項目
{: #see-also }
{:.no_toc}

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)
