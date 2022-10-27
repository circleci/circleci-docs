---
layout: classic-docs
title: "サプライチェーン攻撃への対策"
description: "CircleCI でのサプライチェーン攻撃への対策"
---

## 概要
{: #overview}

モダンなソフトウェア アプリケーションでは、コア機能を提供するうえでは依存関係が欠かせません。 また、ソフトウェアエコシステムでは、ソースコードとバイナリをパブリックリポジトリにパブリッシュするために、CI/CD が不可欠です。 これらが合わさると、悪意ある攻撃者が標準的なセキュリティ対策を回避し、サプライチェーンを直接攻撃するチャンスとなり、多数のアプリケーションや Web サイトが同時にウイルスに感染するという事態になりかねません。

CircleCI は、継続的デリバリープロバイダーとして、こうしたリスクを把握しています。 お客様がソフトウェアのパブリッシュとデプロイに使用する認証情報を保護するために、あらゆる手を尽くしています。 しかし、安全を保証できる CI/CD サービスプロバイダーはおらず、プラットフォームを安全でない状態で使用している可能性もあります。

## パブリッシャーとしてリスクを最小化するには
{: #minimize-risk-as-a-publisher }

ソフトウェアのダウンストリーム ユーザーとパブリッシャーの方向けに、ご自身とユーザーを守るためのヒントをいくつかご紹介します。

### コンテキストの使用
{: #using-contexts }

CircleCI では、認証情報やシークレットを複数の[コンテキスト]({{site.baseurl}}/ja/contexts)に分割して、個々に使用したり、ビルドステップで結合したりすることが可能です。 重要なのは、すべてを org-global コンテキストに格納しないようにすることです。 そうすることで、あるビルドステップでセキュリティエラーが発生しても、漏洩する認証情報はごく一部に抑えられます。 この考え方を、[最小権限の原則](https://en.wikipedia.org/wiki/Principle_of_least_privilege)といいます。 As an example, the step where you download dependencies and execute their build scripts should not have access to your deploy keys because nothing in that step needs them.

Additionally, you can put sensitive contexts used for deploying and signing software into [restricted contexts]({{site.baseurl}}/contexts/#restricting-a-context) that are governed by your VCS groups. These secrets are only then accessible to authorized users. In combination with restricted contexts, you can reduce the likelihood of exposing credentials to malicious code by also using VCS branch protection, which requires a review before merging.

### Minimize risk as a developer
{: #minimize-risk-as-a-developer }

As a developer, a significant portion of your dependencies and tool chain are likely automatically published through continuous delivery. You can mitigate risks by pinning dependencies.

## 依存関係の固定
{: #pinning-dependencies }

Most tools such as Yarn, cargo, and pip support the ability to create and use lock files to pin dependency versions and hashes. Some tools can enforce installation using only packages with versions and hashes specified. This is a baseline defense against bad actors publishing malicious packages with a higher SemVer number, adding malicious distribution types to an existing package version, or overwriting the contents at a given version number.

Pip と pip-tools を使用して Python プロジェクトをインストールするシンプルな方法を、以下に示します。

```shell
$ echo 'flask' > requirements.in
$ pip-compile --generate-hashes requirements.in --output-file requirements.txt
$ pip install --no-deps -r requirements.txt
```

This adds a single top-level dependency called `flask` to an input file, then generates secure hashes for all transitive dependencies and locks their versions. Installation using the `--no-deps` flag ensures that only the dependencies listed in the requirements file are installed and nothing else.

Likewise, a similar example will ensure only exactly the known dependencies are installed when using `yarn`.

```shell
$ yarn add express

# ビルド中
$ yarn install  --frozen-lockfile
```

Many tools for scanning dependency files exist, and many are first-party for a given language or tool chain. On CircleCI, there are orbs available that offer [dependency scanning](https://circleci.com/developer/orbs?query=&category=Security), and cron jobs for periodic scanning to ensure your applications are scanning more often than your pushes.

Using dependency pinning with hashes like this prevents malicious binaries or packages from silently replacing known good versions. It protects against a narrow range of attacks where the upstream repository is compromised. This can protect your workstation and CI builds.

## 関連項目
{: #see-also }
{:.no_toc}

- [セキュリティーに関する推奨事項]({{site.baseurl}}/security-recommendations)