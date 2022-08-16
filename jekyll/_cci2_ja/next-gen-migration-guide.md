---
layout: classic-docs
title: "次世代   CircleCI イメージへの移行"
short-title: "次世代 CircleCI イメージへの移行"
description: "従来のイメージから次世代イメージへの移行ガイド"
order: 30
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

* 目次
{:toc}


## 概要
{: #overview }

2020 年より、CircleCI では CircleCI イメージの次世代版の展開を開始しました。 これらのイメージは、[CircleCI 2.0 ](https://circleci.com/ja/blog/say-hello-to-circleci-2-0/)の発表時にリリースされた従来の CircleCI イメージに代わるものです。 次世代版は CI/CD 環境に合わせてゼロから設計されており、 従来よりもスピードと効率、そしてなによりも信頼性が大きく向上しています。 次世代 CircleCI イメージの特徴について詳しくは、[こちらのブログ記事](https://circleci.com/ja/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/)をご覧ください。 従来イメージが今後廃止されることに伴い、ここでは新しいイメージへの移行プロセスについて説明します。

従来のイメージから次世代版に移行するには、名前空間を変更する必要があります。 イメージの Docker 名前空間について、従来のものはすべて `circleci` でしたが、次世代イメージでは `cimg` に変わります。 たとえば、従来の Ruby および Python のイメージを次世代版に移行するには、それぞれ次のように変更します。

```diff
- circleci/ruby:2.7.4
+ cimg/ruby:2.7.4
```

```diff
- circleci/python:3.8.4
+ cimg/python:3.8.4
```

## 変更点
{: #changes }

### イメージの廃止
{: #deprecated-images }

既存のイメージについて、今後いくつかの変更が行われる予定です。 以下のイメージは廃止され、次世代イメージへの置き換えは行われません。

* `buildpack-deps`
* `JRuby`
* `DynamoDB`

`buildpack-deps` イメージを現在使用している場合は、新しい CircleCI ベース イメージ `cimg/base` に移行することをお勧めします。 他の 2 つのイメージについては、ベース イメージにソフトウェアをご自身でインストールするか、サードパーティのイメージを使用してください。

また、以下のイメージの名称が変更されます。

* Go イメージ: `golang` から `go` に変更

従来版と次世代版のイメージの変更点は下表のとおりです。

| 従来版のイメージ                | 次世代版のイメージ |
| ----------------------- | --------- |
| circleci/buildpack-deps | cimg/base |
| circleci/jruby          | 対応イメージなし  |
| circleci/dynamodb       | 対応イメージなし  |
| circleci/golang         | cimg/go   |
{: class="table table-striped"}

### ブラウザー テスト
{: #browser-testing }

従来のイメージでは、ブラウザー テストを行う場合、利用可能なバリアント タグが 4 種類存在していました。 たとえば、Python v3.7.0 イメージでブラウザー テストを行う場合、circleci/python:3.7.0-browsers という Docker イメージを使用していたかも知れません。 今後、これら 4 つのタグは、[CircleCI Browser Tools Orb](https://circleci.com/developer/ja/orbs/orb/circleci/browser-tools) との併用を前提とした単一のタグに統合されます。

| Legacy variant tags     | Next-gen variant tags           |
| ----------------------- | ------------------------------- |
| `-browsers`             | `-browsers` + browser orb tools |
| `-browsers-legacy`      |                                 |
| `-node-browsers`        |                                 |
| `-node-browsers-legacy` |                                 |
{: class="table table-striped"}

ブラウザー テスト用の新しいバリアント タグには、Node.js およびブラウザー テスト用の一般的なユーティリティ (Selenium など) が含まれていますが、実際のブラウザーは含まれていません。 タグの統合に伴い、ブラウザーはプリインストールされなくなります。 代わりに、Google Chrome や Firefox などのブラウザー、および Chromedriver や Gecko などのドライバーは、`browsers-tools` Orb でインストールします。 これにより、CircleCI から提供されるツールに縛られることなく、ビルドで必要なブラウザーのバージョンを柔軟に組み合わせることができます。 この Orb の使用例については、[こちら](https://circleci.com/developer/ja/orbs/orb/circleci/browser-tools#usage-install_browsers)を参照してください。

ベース OS の Ubuntu への統一

従来のイメージでは、バリアント タグによってベース オペレーティング システム (OS) が異なっていました。 たとえば、Debian と Ubuntu のバージョンのイメージがある一方、別のイメージでは異なるベース OS が提供されていました。 こうした状態を解消するため、  次世代の CircleCI イメージはすべて、Ubuntu の最新 LTS リリースがベース OS となります。

ベース イメージでは、少なくとも 2 つ以上の LTS リリースと、EOL 前の標準リリースがサポートされます。


## トラブルシューティング
{: #troubleshooting }

次世代イメージへの移行では、ソフトウェア関連の問題が発生することがあります。 よくある問題を以下に示します。
* 使用していたライブラリのバージョンが変わる
* apt パッケージがプリインストールされなくなる。 この場合は、次のコマンドでパッケージをインストールしてください。

```shell
sudo apt-get update && sudo apt-get install -y <the-package>
```

各イメージには、構築元となる GitHub リポジトリが用意されており、 [こちら](https://github.com/CircleCI-Public?q=cimg-&type=&language=&sort=)から参照可能です。 これらのリポジトリでは、各イメージの詳細や構成内容を確認できるほか、GitHub 上で Issue の報告やプルリクエストの投稿を行えます。 イメージに関して、特に移行に関する問題がある場合は、GitHub 上で Issue をオープンし、問題を報告してください。 [サポート チケットを作成する](https://support.circleci.com/hc/ja-jp/requests/new)、または [CircleCI Discuss](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034) に投稿していただくことも可能です。
