---
layout: classic-docs
title: "How CircleCI handles security"
category:
  - 管理
description: "An overview of security measures taken at CircleCI."
---

This document outlines security initiatives talken by CircleCI.

## 概要
{: #overview }

Proactive security is a top priority at CircleCI, and security issues are acted upon immediately. Report security issues to <security@circleci.com> with an encrypted message using our security team's GPG key:
- **ID:** 0x4013DDA7
- **Fingerprint:** 3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7

## 暗号化
{: #encryption }

CircleCI uses HTTPS or SSH for all networking in and out of our service. This includes from the browser to our services application, from the services application to your builder fleet, from our builder fleet to your source control system, and all other points of communication. したがって、ユーザーのコードやデータが暗号化されずに CircleCI から送受信されることはありません。ただし、自身の判断で暗号化しないコードをビルドに含めることも可能です。 オペレーターは、CircleCI の SSL 構成を回避することも、基盤システムの通信に TLS を使用しないように選択することもできます。

CircleCI's software has access to your code and all data that code interacts with. All jobs on CircleCI run in a sandbox (specifically, a Docker container, or an ephemeral VM) that stands alone from all other builds and is not accessible from the Internet or from your own network. The build agent pulls code via Git over SSH. 特定のテスト スイートまたはジョブ構成は、外部サービスまたはネットワーク内のインテグレーション ポイントに対して呼び出しを行うことができます。そうした呼び出しからの応答は、ジョブにプルされ、ユーザー自身の判断でコードに使用されます。 1 つのジョブが完了すると、ジョブを実行したコンテナは廃棄され、リビルドされます。 All environment variables are encrypted using [HashiCorp Vault](https://www.vaultproject.io/), using AES256-GCM96, and are unavailable to CircleCI employees.

## サンドボックス化
{: #sandboxing }

CircleCI では、コードのビルドを実行するために割り当てられるリソースをご自身で制御することができます。 これは、ビルドが実行されるコンテナをセットアップする Builder boxes のインスタンスを介して行われます。 Build containers pull down source code and run whatever test and deployment scripts are part of the code base or your configuration. これらのコンテナはサンドボックス化されます。つまり、ビルド (または並列ビルドの一部分) ごとに専用のコンテナが 1 つずつ作成され、破棄されます。これらのコンテナは外部から使用することはできません。 CircleCI provides the ability to SSH directly to a particular build container. With the SSH process, user will have complete access to any files or processes being run inside that build container, so provide access to CircleCI _only_ to those also trusted with your source code.

## インテグレーション
{: #integrations }

CircleCI には、関連する外部のサービスやテクノロジーとのインテグレーションポイントがいくつかあります。

- **Web sockets** CircleCI uses [Pusher](https://pusher.com/) client libraries for WebSocket communication between the server and the browser, though for installs an internal server called slanger is used, so Pusher servers have no access to your instance of CircleCI, nor your source control system. This is how CircleCI updates the builds list dynamically, or shows the output of a build line-by-line as it occurs. CircleCI sends build statuses and lines of your build output through the web socket server (which unless you have configured your installation to run without SSL, is done using the same certs over SSL), so it is encrypted in transit.

- **Replicated:** CircleCI Server のプライベート インスタンスでは、[Replicated](http://www.replicated.com/) を使用して、インストール ウィザード、ライセンス キー、システム監査ログ、ソフトウェアの更新など、CircleCI のメンテナンスやシステムに関する作業を管理します。 CircleCI Server インスタンスは、更新の有無を確認するために、Replicated サーバーと通信してライセンス キー情報やバージョン情報を送信します。 Replicated がユーザーのデータや他のシステムにアクセスすることはありません。 また、CircleCI がユーザーのデータを Replicated に送信することもありません。

- **Source control systems** To use CircleCI you will set up a direct connection with your instance of your source control system (GitHub, Bitbucket, GitLab). CircleCI のセットアップ時に、プライベートリポジトリのチェックアウトをシステムに許可します。 You may revoke this permission at any time through your VCS's settings by removing Circle's deploy keys and service hooks from your repositories' admin pages. While CircleCI allows you to selectively build your projects, your VCS's permissions model is "all or nothing" — CircleCI gets permission to access all of a user's repositories or none of them. Your instance of CircleCI will have access to anything hosted in those Git repositories, and will create webhooks for a variety of events (eg: when code is pushed, when a user is added, etc.) that will call back to CircleCI, triggering one or more Git commands that will pull down code to your build fleet.

- **Dependency and source caches** Most CircleCI customers use S3 or equivalent cloud-based storage inside their private cloud infrastructure (Amazon VPC, etc.) to store their dependency and source caches. These storage servers are subject to the normal security parameters of anything stored on such services, meaning in most cases, it is suggested to prevent any outside access.

- **Artifacts** To help prevent other builds from accessing your browser's local storage when viewing artifacts, HTML and XHTML pages are hosted on their own project-specific subdomain of `*.circle-artifacts.com`. HTML 以外のアーティファクトは通常、ダウンロード速度が最大になるよう S3 URL にリダイレクトされ ます (`302 FOUND`)。 Because these artifact types are hosted on a single S3 domain, artifacts may access your browser's local storage on HTML and XHTML pages, and so you should avoid entering sensitive data into your browser for these URLs.

- **iOS builds** If you are paying to run iOS builds on CircleCI hardware, your source code will be downloaded to a build box on a macOS fleet where it will be compiled, and any tests will be run. Similar to CircleCI's primary build containers that you control, the iOS builds that run are sandboxed such that they cannot be accessed.

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