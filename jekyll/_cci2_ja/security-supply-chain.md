---
layout: classic-docs
title: "サプライチェーン攻撃への対策"
description: "CircleCI でのサプライチェーン攻撃への対策"
---

## 概要
{: #overview}

モダンなソフトウェア アプリケーションでは、コア機能を提供するうえでは依存関係が欠かせません。 また、ソフトウェア エコシステムでは、ソース コードとバイナリをパブリック リポジトリにパブリッシュするために、CI/CD が不可欠です。 Together, this gives the opportunity for malicious actors to circumvent standard security measures and attack supply chains directly, allowing them to infect many applications and websites simultaneously.

CircleCI をはじめ、継続的デリバリー プロバイダーは、こうしたリスクについて理解しています。 CircleCI では多数のキーを所有しているという自覚のもと、お客様がソフトウェアのパブリッシュとデプロイに使用する認証情報の保護のために、あらゆる手を尽くしています。 それでも CircleCI に限らず、サービスとしての CI/CD プロバイダーが安全性を 100% 保証することは不可能であり、CI/CD プラットフォームはセキュアでない方法で使用される可能性があります。

## パブリッシャーとしてリスクを最小化するには
{: #minimizing-risk-as-a-publisher }

ソフトウェアのダウンストリーム ユーザーとパブリッシャーの方向けに、ご自身とユーザーを守るためのヒントをいくつかご紹介します。

### コンテキストの使用
{: #using-contexts }

CircleCI では、認証情報やシークレットを複数の[コンテキスト]({{site.baseurl}}/2.0/contexts)に分割して、個々に使用したり、ビルド ステップで結合したりすることが可能です。 重要なのは、すべてを org-global コンテキストに格納しないようにすることです。 こうすれば、あるビルド ステップでセキュリティ エラーが発生しても、漏洩する認証情報はごく一部に抑えられます。 この考え方を "[最小権限の原則](https://ja.wikipedia.org/wiki/%E6%9C%80%E5%B0%8F%E6%A8%A9%E9%99%90%E3%81%AE%E5%8E%9F%E5%89%87)" といいます。 たとえば、依存関係をダウンロードしてビルド スクリプトを実行するステップには、デプロイ キーへのアクセスを付与しないようにします。 このステップではデプロイ キーがまったく必要ないためです。

また、ソフトウェアのデプロイと署名に使用する機密コンテキストを、GitHub グループの管理下にある[制限付きコンテキスト]({{site.baseurl}}/2.0/contexts/#restricting-a-context)に配置すれば、 これらのシークレットへのアクセスを承認済みのユーザーのみに限定できます。 These secrets are only then accessible to authorized users. マージ前のレビューを義務付ける GitHub のブランチ保護機能と、この手法を組み合わせることで、認証情報が悪意のあるコードに公開される可能性を軽減できます。

### 開発者としてリスクを最小化するには
{: #minimizing-risk-as-a-developer }

ソフトウェアを使用した開発では、依存関係の大部分、さらにはツール チェーンまでもが、継続的デリバリーを通じて自動的にパブリッシュされる可能性があります。

## 依存関係の固定
{: #pinning-dependencies }

Yarn、Cargo、Pip など多数のツールでは、ロック ファイルを作成して使用することで依存関係のバージョンやハッシュを固定できる機能がサポートされています。 ツールによっては、指定されたバージョンとハッシュのパッケージのみを使用してインストールを実行できます。 これは、新しいセマンティック バージョニング番号で悪意のあるパッケージをパブリッシュしたり、既存のパッケージ バージョンに悪意のあるディストリビューション タイプを追加したり、特定のバージョン番号のコンテンツを上書きする悪意のあるアクターから、身を守るための基本的な防御手段になります。

Pip と pip-tools を使用して Python プロジェクトをインストールするシンプルな方法を、以下に示します。

```sh
$ echo 'flask' > requirements.in
$ pip-compile --generate-hashes requirements.in --output-file requirements.txt
$ pip install --no-deps -r requirements.txt
```

ここでは、トップレベルの単一の依存関係 `flask` を入力ファイルに追加してから、変化しうる依存関係すべてについてセキュアなハッシュを生成し、それらのバージョンをロックしています。 要件ファイル内の依存関係のみがインストールされるように、`--no-deps` フラグを使用してインストールを行っています。

同様に、`yarn` で既知の依存関係のみをインストールする例を、以下に示します。

$ yarn add express

```sh
$ yarn add express

# ビルド中
$ yarn install  --frozen-lockfile
```

依存関係ファイルをスキャンするツールは多数あり、その多くは特定の言語やツール チェーンの開発元によって提供されています。 CircleCI には、[依存関係のスキャン](https://circleci.com/developer/ja/orbs?query=&category=Security)を行う Orb があります。 また、アプリケーションのスキャンの頻度をプッシュの頻度よりも高める定期的なスキャンを行うための cron ジョブも提供しています。

このような、ハッシュによる依存関係の固定を使用すれば、悪意のあるバイナリやパッケージで既知の正常なバージョンがひそかに置き換えられてしまう事態を防げます。 It protects against a narrow range of attacks where the upstream repository is compromised. This can protect your workstation and CI builds.

## まとめ
{: #conclusion }

CI/CD ビルド システムは、デプロイ キーなどのシークレットを使うことで信頼性を高められます。 ただし、これらのシークレットを安全に使用する責任は、プロジェクト管理者にあります。 CircleCI では、シークレットを複数のコンテキストに分割し、複数のビルド ステップを使用するとともに、ワークスペースの永続性を使用してステップ間でアーティファクトを渡すことで、簡単に分離を実現できす。 セキュリティはチーム スポーツです。 細心の注意を払ってビルドを扱うことは、ダウンストリームの開発者やエンドユーザーを保護するのに役立ちます。
