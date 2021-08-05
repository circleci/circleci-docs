---
layout: classic-docs
title: "CircleCI のビルド済み Docker イメージ"
short-title: "CircleCI のビルド済み Docker イメージ"
description: "CircleCI が提供する Docker イメージの一覧"
categories:
  - containerization
order: 20
version:
  - Cloud
  - Server v2.x
---

CircleCI が提供しているビルド済みイメージの概要と、言語別、サービス タイプ別、タグ別のイメージについて、以下のセクションに沿って説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 一般に、これらのイメージは正式な Docker イメージの拡張版で、特に CI/CD に便利なツールが含まれます。 This document will provide an overview of best practices when using a convenience image. **メモ:** 以下のイメージは、それぞれの言語に対してビルドされた最新のアップストリーム イメージに基づいています。 これらの最新イメージはアップデートが頻繁にあるため、タグを追加指定して利用することを[おすすめ](#best-practices)します。

汎用的なイメージを CircleCI で実行したり、Orbs で使用したり、独自のカスタム Docker イメージのベースとして利用したりする必要がある場合に、このイメージをお使いください。

- タグを使用してイメージのバージョンやバリアントを指定する
- Docker イメージ ID を使用してバージョンを指定する
- ビルド済み CircleCI Docker イメージのデモ アプリケーションでの使用例については、[チュートリアル]({{ site.baseurl }}/2.0/tutorials/)を参照してください。

_**メモ:** CircleCI は、バグの修正または機能の強化のために、スケジュールに沿ってイメージに変更を加えることがあります。 こうした変更によって、CircleCI ジョブ内でのイメージの動作に影響が生じる可能性があります。 メンテナンスのスケジュールは、[Discuss ページで **convenience-images** タグを付けて通知](https://discuss.circleci.com/tags/convenience-images)されますので、定期的にご確認ください。_

### 例
{: #examples }
{:.no_toc}

このイメージの設定ファイルのサンプルは[Developer Hub](https://circleci.com/developer/ja/images/image/cimg/base)、ソース コードとドキュメントは [GitHub](https://github.com/CircleCI-Public/cimg-base) で入手できます。

## 次世代コンビニエンス イメージ
{: #next-generation-convenience-images }

このセクションで紹介する次世代のコンビニエンス イメージは、CI、効率性、確定的動作を念頭に置いてゼロから設計されました。 注目ポイントは次のとおりです。

**スピンアップ時間の短縮** – Docker 的な言い方をすれば、次世代イメージは概してレイヤーがより少なく、より小さくなっています。 これらの新しいイメージを使用すると、ビルド開始時にイメージがすばやくダウンロードされると共に、イメージが既にホストにキャッシュされている可能性が高くなります。

**信頼性と安定性の向上** – 従来のイメージは、アップストリームからの変更によってほぼ毎日再ビルドされるため、テストが十分に行われていない場合があります。 そのため、互換性の損なわれる変更が頻発してしまい、安定した確定的なビルドに最適な環境とは言えなくなっています。 次世代イメージは、セキュリティと致命的なバグについてのみ再ビルドされるため、より安定した確定的なイメージとなります。

### CircleCI ベース イメージ
{: #circleci-base-image }
Using the `base` image in your config looks like the example shown below:

```yaml
  image: cimg/base:2021.04
```

これは必要最低限のものをインストールするように設計された、まったく新しい Ubuntu ベースのイメージです。 今後数週間でリリースする予定の次世代コンビニエンス イメージはすべてこれがベースとなります。

**When to use it?**

If you need a generic image to run on CircleCI, to use with orbs, or to use as a base for your own custom Docker image, this image is for you.

**リソース:**

最新の次世代コンビニエンス イメージの一覧と各イメージの内容の詳細については、[デベロッパー ハブ](https://circleci.com/developer/ja/)を参照してください。

The example below demonstrates how to use the next-gen Go image, which is based off the `base` image above.

```yaml
  image: cimg/go:1.16
```

これは従来の CircleCI Go イメージ (`circleci/golang`) の後継となるものです。 Docker Hub の名前空間は `cimg` であることに留意してください。 以降に掲載した[言語別の最新イメージ タグ](#%E8%A8%80%E8%Aa%9E%E5%88%A5%E3%81%Ae%E6%9C%80%E6%96%B0%E3%82%A4%E3%83%A1%E3%83%Bc%E3%82%B8-%E3%82%Bf%E3%82%B0)の一覧を参照してください。


## 次世代 CircleCI イメージ
{: #best-practices }

以降のセクションで扱う次世代コンビニエンス イメージは、最新の Ubuntu LTS Docker イメージをベースにしており、言語またはサービスのベース ライブラリがインストールされています。 したがって、可能な限り最も当てはまるイメージを使用することをお勧めします。 これで、いずれかのアップストリーム イメージによってイメージに意図しない変更が組み込まれることを防ぎ、より決定論的にビルドを行うことができます。

使用するイメージを細かく指定するには、以下の 2つの方法があります。

たとえば、`cimg/ruby:2.4.10-node` のように、使用するイメージのバージョンを限定的に指定してください。 バージョンは CircleCI のすべての Docker イメージで指定できます。

また、使用するイメージを特定の SHA に至るまで指定することができます。 具体的には、`cimg/ruby:2.4.10-node` ではなく、`cimg/ruby@sha256:e4aa60a0a47363eca3bbbb066620f0a5967370f6469f6831ad52231c87ca9390` のように指定します。 これにより、変更が加えられるまでの間、特定のイメージをテストすることができます。


### バージョンを指定するイメージ タグの使用方法
{: #next-gen-circleci-images }

<div class="alert alert-warning" role="alert">
SHA を長期的に使用することは推奨されません。 イメージの再ビルドを要する重大なバグやセキュリティ上の問題が見つかった場合、イメージにおけるパイプラインの依存関係が原因で、バグ修正やセキュリティ パッチ用の更新を取得できない可能性があります。
</div>

**メモ:** タグが指定されていない場合、Docker は `latest` タグを適用します。 `latest` タグが参照するのは安定版の最新リリースのイメージです。 ただし、このタグは突然変わることもあるので、バージョンなどが明確になるイメージタグを挿入するのがおすすめです。

**メモ:** Node.js バリアントの Docker イメージ (`-node` で終わるタグ) に対しては、Node.js の LTS リリースがプリインストールされています。 独自に特定のバージョンの Node.js/NPM を使用する場合は、`.circleci/config.yml` 内の `run` ステップで設定できます。 Ruby イメージと共に特定のバージョンの Node.js をインストールする例については、以下を参照してください。

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: cimg/ruby:2.7.1-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "Node.js と npm の更新"
          command: |
            curl -sSL "https://nodejs.org/dist/v11.10.0/node-v11.10.0-linux-x64.tar.xz" | sudo tar --strip-components=2 -xJ -C /usr/local/bin/ node-v11.10.0-linux-x64/bin/node
            curl https://www.npmjs.com/install.sh | sudo bash
      - run:
          name: 現行バージョンのノードのチェック
          command: node -v
```

#### イメージ ID の確認方法
{: #finding-an-image-id }
{:.no_toc}

{: #using-a-docker-image-id-to-pin-an-image-to-a-fixed-version }

1. CircleCI にアクセスし、そのイメージを使用した過去のビルドを表示します。
2. **[Steps (ステップ)]** タブの **[Spin up Environment (環境のスピンアップ)]** ステップをクリックします。
3. ログ内でそのイメージの **Digest** を確認します。
4. そこに記載されたイメージ ID を以下のようにイメージ名の末尾に付加します。

```
cimg/python@sha256:bdabda041f88d40d194c65f6a9e2a2e69ac5632db8ece657b15269700b0182cf
```

## ベスト プラクティス
{: #image-types }

CircleCI のコンビニエンス イメージは、**言語**イメージと**サービス** イメージのいずれかのカテゴリに分類されます。 すべてのイメージは、`circleci` ユーザーをシステムユーザーとして追加します。 The sections below will walk through the available next-generation and legacy images.


### 特定のバージョンを指定する Docker イメージ ID の使用方法
{: #next-gen-language-images }
{:.no_toc}

Like the legacy images, the next-gen language images are convenience images for common programming languages. These images include both the same relevant language and [commonly-used tools](#pre-installed-tools). 言語イメージを指定するときは、設定ファイル内の `docker` キー配下の最初の行に挿入します。 したがって、ビルドの実行中はこれが[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"}になります。

CircleCI は、以下の言語に対応する次世代イメージを開発しています。

- [Elixir](https://circleci.com/developer/images/image/cimg/elixir)
- [Go (Golang)](https://circleci.com/developer/images/image/cimg/go)
- [Node.js](https://circleci.com/developer/images/image/cimg/node)
- [OpenJDK (Java)](https://circleci.com/developer/images/image/cimg/openjdk)
- [PHP](https://circleci.com/developer/images/image/cimg/php)
- [Python](https://circleci.com/developer/images/image/cimg/python)
- [Ruby](https://circleci.com/developer/images/image/cimg/ruby)
- [Rust](https://circleci.com/developer/images/image/cimg/rust)

上記以外の言語のイメージが必要な場合は、CircleCI の[アイデア ボード](https://ideas.circleci.com/)にリクエストしてください。 First, check to see if that "idea" is already on CircleCI Ideas. If it is, up-vote it. If not, create it and set the category as "images". Finally, go and market your "idea" to friends, co-workers, forums, and other communities in order to help it build traction.

If we see an idea on the board take off, we'll consider building it officially.

#### 言語イメージのバリアント
{: #next-gen-language-image-variants }
{:.no_toc}

CircleCI は、次世代言語イメージに対していくつかのバリアントを用意しています。 次世代イメージについては、それぞれのバリアントをイメージごとに確認するようにしてください。 次世代イメージの `-browsers` バリアントは現在作成中です。 サポートされているバリアントの詳細については、[Developer Hub](https://circleci.com/developer/ja/images)でイメージの一覧を参照してください。


### 従来の言語イメージ
{: #legacy-language-images }
{:.no_toc}

従来の言語イメージは、一般的なプログラミング言語に対応するコンビニエンス イメージです。 よく使われる言語と[インストール済みツール](#pre-installed-tools)の両方を組み合わせたイメージとなっています。 言語イメージを指定するときは、設定ファイル内の `docker` キー配下の最初の行に挿入します。 したがって、ビルドの実行中はこれが[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"}になります。

CircleCI は、以下の言語に対応する従来のイメージを提供しています。

- [Android](#android)
- [Clojure](#clojure)
- [Elixir](#elixir)
- [Go (Golang)](#go-golang)
- [JRuby](#jruby)
- [Node.js](#nodejs)
- [OpenJDK (Java)](#openjdk)
- [PHP](#php)
- [Python](#python)
- [Ruby](#ruby)
- [Rust](#rust)

#### 次世代言語イメージのバリアント
{: #language-image-variants }
{:.no_toc}

CircleCI は、次世代言語イメージに対していくつかのバリアントを用意しています。 これらのバリアントを使用するには、以下のサフィックスの 1つをイメージタグの末尾に追加します。

- `-node`: 多言語対応の Node.js が含まれます。
- `-browsers`: Chrome、Firefox、OpenJDK v11、および GeckoDriver が含まれます。
- `-node-browsers`: `-node` バリアントと `-browsers` バリアントの組み合わせです。

参考までに、`circleci/golang:1.9` に Web ブラウザ をインストールしておきたいときは `circleci/golang:1.9-browsers` とします。

### 次世代言語イメージ
{: #service-images }
{:.no_toc}

サービスイメージは、データベースなどのサービスに対応するコンビニエンスイメージです。 これらのイメージは言語イメージの**後に**リストし、セカンダリ サービス コンテナとして使用します。

CircleCI は、以下のサービスに対応する従来のイメージを提供しています。

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### サービス イメージのバリアント
{: #service-image-variant }
{:.no_toc}

CircleCI は、サービスイメージに対してバリアント 1つのみ用意しています。 RAM ボリュームを使用してビルドを高速化するには、サービスイメージタグの末尾に `-ram` サフィックスを追加します。

For example, if you want the `circleci/postgres:9.5-postgis` image to use RAM volume, use the `circleci/postgres:9.5-postgis-ram` image.

### サービス イメージ
{: #next-gen-service-images }
{:.no_toc}

CircleCI では、次世代サービス コンビニエンス イメージの拡充に取り組んでいます。 使用可能な最新のサービス イメージについては、CircleCI の[Developer Hub](https://circleci.com/developer/ja/images/)を参照してください。

## イメージのタイプ
{: #pre-installed-tools }

すべてのコンビニエンス イメージは、`apt-get` と共にインストールされた追加ツールで拡張されています。

- `bzip2`
- `ca-certificates`
- `curl`
- `git`
- `gnupg`
- `gzip`
- `locales`
- `mercurial` (従来のイメージのみ)
- `net-tools`
- `netcat`
- `openssh-client`
- `parallel`
- `sudo`
- `tar`
- `unzip`
- `wget`
- `xvfb` (従来のイメージのみ)
- `zip`

ある CircleCI イメージ バリアントにインストールされる特定パッケージの具体的なバージョンは、そのバリアントのベース イメージにインストールされている Linux ディストリビューション/バージョンのパッケージ ディレクトリに含まれるデフォルト バージョンに依存します。 従来の CircleCI コンビニエンス イメージは [Debian Jessie](https://packages.debian.org/jessie/) または [Stretch](https://packages.debian.org/stretch/) をベースにしていますが、次世代イメージ (`cimg`) は公式の [Ubuntu](https://packages.ubuntu.com) イメージを拡張したものです。 従来の CircleCI イメージの各バリアントの詳細については、[circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) リポジトリを参照してください。 次世代イメージの詳細については、[Developer Hub](https://circleci.com/developer/ja/images/)を参照してください。 各イメージの変更履歴は、それぞれのリポジトリに掲載されています。

参考までに、`circleci/postgres:9.5-postgis` イメージで RAM ディスクを使うには、`circleci/postgres:9.5-postgis-ram` とします。

- [Docker クライアント](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)


## プリインストール ツール
{: #out-of-scope }

1. 上記一覧に記載のないイメージは利用できません。 コンビニエンス イメージの提供プログラムが刷新されたため、現在のところ新しいイメージについての提案は受け付けていません。
1. 旧バージョンのソフトウェアは再作成されません。 アップストリーム イメージの特定のリリース (Node.js v8.1.0 など) 用のタグが作成されなくなったら、CircleCI でもイメージの作成を終了します。 つまり、そのイメージ (`npm` など) に含まれる他のツールも更新されなくなります。
1. プレビュー、ベータ版、リリース候補を指定するイメージ タグには対応していません。 利用できることもありますが、これらのタグが原因となってコンビニエンス イメージのビルド システムに問題が発生しやすくなります。 特定の言語の非安定版リリースが必要な場合は、[Orbs](https://circleci.com/ja/orbs/) またはカスタム Docker イメージからインストールすることをお勧めします。


## 対象外のイメージ
{: #latest-image-tags-by-language }

**従来の**コンビニエンス イメージについて、最新のものを言語別に紹介します。 それぞれの詳細については [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) でご確認ください。


<div class="alert alert-warning" role="alert">
It is recommended to use next-generation images when possible.
For a list of the latest next-gen convenience images and
details about the content of each image, visit
the <a href="https://circleci.com/developer/">Developer Hub.</a>
</div>

**注:** CircleCI は、[言語イメージのバリアント](#language-image-variants)および[サービス イメージのバリアント](#service-image-variant)以外の**従来のイメージ**で、どのようなタグが使用されるかを**関知しません**。 これらのタグは開発元が手がけるプロジェクトとして作成、メンテナンスされています。 似た名前のタグでも同じような内容のイメージとは限らないことにご注意ください。

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{: # {{image1name}} }
{:.no_toc}

**Resources:**

- [イメージタグ](https://docs.docker.com/engine/reference/commandline/tag/#extended-description)を利用することで Docker イメージの役割を決めることができます。
- [Dockerfiles](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/{{ image[0] }}/images) - このイメージのビルド元の Dockerfile です。

**使用方法:** config.yml の `docker:` に以下の行を追加します。

`- image: circleci/{{ image[0] }}:[TAG]`

**最新のタグ:** <small>(すべてのイメージ タグは[こちら]({{ site.baseurl }}/2.0/docker-image-tags.json){:target="_blank"})</small>

<ul class="list-3cols">
{% assign tags = image[1].tags | sort | reverse %}
{% assign tagCounter = 1 %}
{% for tag in tags %}
    {% if tagCounter > 99 %}
        {% break %}
    {% endif %}
    {% unless tag contains "-browsers" or tag contains "-node" or tag contains "-ram" %}
    <li>{{ tag }}</li>
    {% assign tagCounter = tagCounter | plus:1 %}
    {% endunless %}
{% endfor %}
</ul>

<br/>
メモ: このイメージで使用可能なバリアントは、上記のタグにバリアント タグを追加することで使用できます。 すべてのイメージ タグは[こちら]({{ site.baseurl }}/2.0/docker-image-tags.json){:target="_blank"}で確認できます。

---

{% endfor %}

## 言語別の最新イメージ タグ
{: #see-also }
{:.no_toc}

- プライベート リポジトリまたは Amazon ECR にあるイメージの使用をビルドに承認する方法については、「[Docker の認証付きプルの使用]({{ site.baseurl }}/2.0/private-images/)」を参照してください。
- iOS 用の macOS イメージの詳細については、({{ site.baseurl }}/2.0/testing-ios/) を参照してください。
- Docker イメージをビルドする方法については、「[Docker コマンドの実行手順]({{ site.baseurl }}/2.0/building-docker-images/)」を参照してください。
