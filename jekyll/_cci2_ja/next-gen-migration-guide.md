---
layout: classic-docs
title: "次世代コンビニエンス イメージに移行する"
short-title: "次世代コンビニエンス イメージに移行する"
description: "従来のイメージから次世代イメージへの移行ガイド"
order: 30
version:
  - Cloud
  - Server v2.x
---

* 目次
{:toc}


## 概要
{: #overview }

2020 年より、CircleCI ではコンビニエンス イメージの次世代版の展開を開始しました。 これらのイメージは、[CircleCI 2.0 のローンチ](https://circleci.com/ja/blog/say-hello-to-circleci-2-0/)に合わせリリースされた従来のコンビニエンス イメージに代わるものです。 The next-gen CircleCI convenience images are designed from the ground up for a CI/CD environment. They are designed to be faster, more efficient, and most importantly, more reliable. You can learn more about all of the features [on our blog post](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/). As we begin to deprecate the legacy images, this document provides information on the migration process.

従来のイメージから次世代版に移行するには、名前空間を変更する必要があります。 イメージの Docker 名前空間について、従来のものはすべて `circleci` でしたが、次世代イメージでは `cimg` になるためです。 たとえば、従来の Ruby および Python のイメージを次世代版に移行するには、それぞれ次のように変更します。

circleci/ruby:2.3.0 -> cimg/ruby:2.3.0 circleci/python:3.8.4 -> cimg/python:3.8.4


## 変更点
{: #changes }

### イメージの廃止
{: #deprecated-images }

既存のイメージについて、今後いくつかの変更が行われる予定です。 以下のイメージは廃止され、次世代イメージへの置き換えは行われません。

* `buildpack-deps`
* `JRuby`
* `DynamoDB`

`buildpack-deps` イメージを現在使用している場合は、新しい CircleCI ベース イメージ `cimg/base` に移行することをお勧めします。 他 2 つのイメージについては、ベース イメージにソフトウェアを独自にインストールするか、サードパーティ製のイメージを使用してください。

また、以下のイメージの名称が変更されます。

* Go イメージ: `golang` から `go` に変更

従来版と次世代版のイメージの変更点は下表のとおりです。



| 従来のイメージ                 | 次世代イメージ   |
| ----------------------- | --------- |
| circleci/buildpack-deps | cimg/base |
| circleci/jruby          | 対応イメージなし  |
| circleci/dynamodb       | 対応イメージなし  |
| circleci/golang         | cimg/go   |
{: class="table table-striped"}

### ブラウザー テスト
{: #browser-testing }

従来のイメージでは、ブラウザー テストを行う場合、利用可能なバリアント タグが 4 種類存在していました。 たとえば、Python v3.7.0 イメージでブラウザー テストを行う場合、circleci/python:3.7.0-browsers という Docker イメージを使用していました。 今後、これら 4 つのタグは、[CircleCI Browser Tools Orb](https://circleci.com/developer/orbs/orb/circleci/browser-tools) との併用を前提とした単一のタグに統合されます。

<table>
<tr><th>従来のバリアント タグ</th><th>次世代のバリアント タグ</th></tr>
<tr><td>-browsers</td><td rowspan=4>-browsers + Browser Tools Orb</td></tr>
<tr><td>-browsers-legacy</td></tr>
<tr><td>-node-browsers</td></tr>
<tr><td>-node-browsers-legacy</td></tr>
</table>

ブラウザー テスト用の新しいバリアント タグには、Node.js およびブラウザー テスト用の一般的なユーティリティ (Selenium など) が含まれていますが、実際のブラウザーは含まれていません。 タグの統合に伴い、ブラウザーはプリインストールされなくなります。 Google Chrome や Firefox などのブラウザー、および Chromedriver や Gecko などのドライバーは、`browsers-tools` Orb でインストールします。 これにより、CircleCI から提供されるツールに縛られることなく、ビルドで必要なブラウザーのバージョンを柔軟に組み合わせることができます。 この Orb の使用例については、[こちら](https://circleci.com/developer/ja/orbs/orb/circleci/browser-tools#usage-install_browsers)を参照してください。

ベース OS の Ubuntu への統一

従来のイメージでは、バリアント タグによってベース オペレーティング システム (OS) が異なっていました。 たとえば、Debian と Ubuntu のバージョンのイメージがある一方、別のイメージでは異なるベース OS が提供されていました。 This is no longer the case. こうした状態を解消するため、次世代の CircleCI イメージはすべて、Ubuntu の最新 LTS リリースがベース OS となります。

ベース イメージでは、少なくとも 2 つ以上の LTS リリースと、EOL 前の標準リリースがサポートされます。


## トラブルシューティング
{: #troubleshooting }

次世代イメージへの移行では、ソフトウェア関連の問題が発生することがあります。 よくある問題を以下に示します。
* 使用していたライブラリのバージョンが変わる
* apt パッケージがプリインストールされなくなる。 この場合は、次のコマンドでパッケージをインストールしてください。

```bash
sudo apt-get update && sudo apt-get install -y <the-package>
```

各イメージには、専用の GitHub リポジトリが用意されています。 リポジトリの一覧は[こちら](https://github.com/CircleCI-Public?q=cimg-&type=&language=&sort=)を参照してください。 これらのリポジトリでは、各イメージの詳細や構成内容を確認できるほか、GitHub イシューの作成やプルリクエストの投稿を行えます。 移行の問題をはじめ、イメージに問題が見つかった場合は、GitHub イシューを作成してお問い合わせください。 [サポート チケットを作成するか](https://support.circleci.com/hc/ja-jp/requests/new)、[CircleCI Discuss](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034) に投稿いただくことも可能です。
