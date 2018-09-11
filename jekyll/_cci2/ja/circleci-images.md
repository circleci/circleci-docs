---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories:
  - containerization
order: 20
---
This document provides information about pre-built CircleCI images and a listing by language, service type, and tags in the following sections:

- TOC {:toc}

## はじめに

{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 いずれも公式の Docker イメージの拡張版であり、CI/CD ツール上での利用に適したツール類もあらかじめインストールしています。 All of these pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/). GitHub の [`circleci-images`](https://github.com/circleci/circleci-images) リポジトリには各 Docker イメージのソースコードも用意しています。 これら Docker イメージの作成に用いる Dockerfiles については [circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) リポジトリでチェック可能です。

## ビルド済みイメージの活用方法

提供する Docker イメージはアップストリーム（ソースコード）イメージの最新バージョンを元にしており、何かに特化したイメージを使うのにも理想的な環境となっています。 アップストリームイメージの内容がバージョンアップなどで変更されることを防げば、確実性の高いビルドを実現できます。

アップストリーム版を元にビルド済みイメージを作成している CircleCI では、`circleci/ruby:2.4-node` と記述した場合、最新版の Ruby 2.4-node コンテナを使うことを意味し、 あるいは `circleci/ruby:latest` としても結果は同じになります。 このようにタグを用いて使用するイメージを具体的に決めることは、ビルドコンテナの用途を絞るのに役立ちます。

したがって、アップストリーム版の想定外の変更に戸惑わないようにするには、`circleci/ruby:2.4-node` とするのではなく、そのコンテナのさらに細かいバージョン指定を行うようタグを書き換えます。アップストリーム版の変更に合わせてそのイメージが変更することのないようにします。

例えば、決まったバージョンの Debian ベースの OS を使うには、`-jessie` や `-stretch` をコンテナ名の末尾に追記します。 `circleci/ruby:2.3.7-jessie` としたり、`circleci/ruby:2.3-jessie` としたりして、使用するイメージをピンポイントのバージョンに決め打ちします。 バージョン指定は CircleCI の Docker イメージの全てで利用できます。

また、使いたいイメージの SHA ハッシュをそれらのタグの後に指定することも可能です。そうすることで、変更前の特定のイメージでいくらでもテストできるようになります。

使用するイメージを特化させたいときは、下記の通り 2 つの方法があります。

- タグを使ってイメージのバージョンや OS を決め打ちにする
- Docker イメージ ID を使って一定のバージョンにする

### バージョンや OS を決め打ちするイメージタグの使い方

{:.no_toc}

[イメージタグ](https://docs.docker.com/engine/reference/commandline/tag/#extended-description)を利用することで Docker イメージの役割を決めることができます。

例えば `circleci/golang` は、`circleci/golang:1.8.6-jessie` として言語のバージョンと OS を指定するパターンに書き換えられます。 後者のようにバージョンと OS を指定すれば、予期しない挙動になることはまずありません。

[言語別の最新イメージタグ](#latest-image-tags-by-language)は下の方にある一覧でご確認ください。

**※**タグを指定しない場合、Docker は `latest` タグが付与されているものとして扱います。 `latest` タグが参照するのは安定版の最新リリースのイメージです。 ただし、このタグは突然変わることもあるので、バージョンなどが明確になるイメージタグを挿入するのがおすすめです。

### イメージを一定のバージョンにする Docker イメージ ID の使い方

{:.no_toc}

全ての Docker イメージには[ユニーク ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier) が割り当てられており、 一定バージョンのイメージを使う際にはこのイメージ ID を使うことができます。

イメージ ID は固有の SHA-256 メッセージダイジェスト（ハッシュ）で構成されています。例えば次のようなものです。

    sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

#### イメージ ID の調べ方

{:.no_toc}

1. CircleCI にアクセスし、イメージを使った過去のビルドを表示します
2. **Test Summary** タブに表示されるステップのうち、**Spin up Environment** をクリックします
3. ログに **Digest** の項目があることを確認します
4. そこにあるイメージ ID を下記のようにイメージ名の末尾に付加します

    circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

## イメージタイプ

CircleCI が提供する Docker イメージは 2 タイプに分類されます。**言語**イメージと**サービス**イメージです。これらのイメージは、システムユーザーの権限をもつユーザー `circleci` を追加します。

**※**下記で紹介しているイメージは、各言語のアップストリームイメージの最新ビルドを元にしたものです。 これらの最新イメージはアップデートが頻繁にあるため、[タグを追加指定して利用](#best-practices)することをおすすめします。

### 言語イメージ

{:.no_toc}

言語イメージは代表的なプログラミング言語向けに用意したビルド済み Docker イメージです。 よく使われる言語と[インストール済みツール](#pre-installed-tools)の両方を組み合わせたイメージとなっています。 言語イメージを指定するときは、設定ファイル内の `docker` キー配下の最初の行に挿入します。したがって、ビルドの実行中はこれが[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"}になります。

CircleCI では下記の言語イメージを提供しています。

- [Android](#android)
- [Clojure](#clojure)
- [Elixir](#elixir)
- [Go（Golang）](#go-golang)
- [JRuby](#jruby)
- [Node.js](#nodejs)
- [OpenJDK（Java）](#openjdk)
- [PHP](#php)
- [Python](#python)
- [Ruby](#ruby)

使用している言語がこのなかにないときはカスタムイメージを作成することになります。CircleCI が提供する [Dockerfile Wizard](https://github.com/circleci-public/dockerfile-wizard) も活用してください。

#### 言語イメージのバリエーション

{:.no_toc}

CircleCI では言語イメージについていくつかのバリエーションを用意しています。使い方は、下記のいずれかをイメージタグの末尾に付加するだけです。

- `-node`：多言語対応の Node.js を含めます
- `-browsers` includes Chrome, Firefox, Java 8, and Geckodriver
- `-browsers-legacy` includes Chrome, Firefox, Java 8, and PhantomJS
- `-node-browsers`：`-node` と `-browsers` の組み合わせです
- `-node-browsers-legacy` combines the `-node` and `-browsers-legacy` variants

参考までに、`circleci/golang:1.9` に Web ブラウザ をインストールしておきたいときは `circleci/golang:1.9-browsers` とします。

### サービスイメージ

{:.no_toc}

サービスイメージはデータベースをはじめとする処理に向いた Docker イメージです。このイメージ指定を言語イメージの**後**に挿入することで、セカンダリサービスコンテナとして動作します。

CircleCI では下記のサービスイメージを提供しています。

- [buildpack-deps](#buildpack-deps)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)

#### サービスイメージのバリエーション

{:.no_toc}

CircleCI が提供するサービスイメージは、各サービス 1 つのみです。ただし、RAM ディスクを使用してビルドの高速化を図るのに、サービスイメージタグの末尾に `-ram` を付加することができます。

参考までに、`circleci/postgres:9.5-postgis` イメージで RAM ディスクを使うには、`circleci/postgres:9.5-postgis-ram` とします。

## インストール済みツール

提供している Docker イメージは全て追加のツール類で機能拡張しています。

下記のパッケージはイメージごとに `apt-get` でインストールされます。

- [bzip2](https://packages.debian.org/stretch/bzip2)
- [ca-certificates](https://packages.debian.org/stretch/ca-certificates)
- [curl](https://packages.debian.org/stretch/curl)
- [git](https://packages.debian.org/stretch/git)
- [gnupg](https://packages.debian.org/stretch/gnupg)
- [gzip](https://packages.debian.org/stretch/gzip)
- [locales](https://packages.debian.org/stretch/locales)
- [mercurial](https://packages.debian.org/stretch/mercurial)
- [net-tools](https://packages.debian.org/stretch/net-tools)
- [netcat](https://packages.debian.org/stretch/netcat)
- [openssh-client](https://packages.debian.org/stretch/openssh-client)
- [parallel](https://packages.debian.org/stretch/parallel)
- [sudo](https://packages.debian.org/stretch/sudo)
- [tar](https://packages.debian.org/stretch/tar)
- [unzip](https://packages.debian.org/stretch/unzip)
- [wget](https://packages.debian.org/stretch/wget)
- [xvfb](https://packages.debian.org/stretch/xvfb)
- [zip](https://packages.debian.org/stretch/zip)

下記のパッケージは `curl` などでインストールされます。

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## 言語別の最新イメージタグ

下記では言語別にまとめた最新のビルド済み Docker イメージを列挙しています。 それぞれの詳細については [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) でご確認ください。

**※**[言語イメージのバリエーション](#language-image-variants)や[サービスイメージのバリエーション](#service-image-variant)で紹介しているタグのイメージ以外は、CircleCI の管理下にありません。 これらのタグは開発元が手がけるプロジェクトとして作成、メンテナンスされています。 似た名前のタグでも同じような内容のイメージとは限らないことにご注意ください。

{% assign images = site.data.docker-image-tags | sort %} {% for image in images %}

### {{ image[1].name }}

{:.no_toc}

**使い方：**config.yml の `docker:` 配下に次の書式で挿入します

`- image: circleci/{{ image[0] }}:[TAG]`

**利用可能なタグ：** <small>（これ以外のタグも <a href="https://hub.docker.com/r/circleci/{{ image[0] }}/tags/">Docker Hub</a> で見つけられます）</small>

<ul class="list-2cols">
  {% assign tags = image[1].tags | sort %} {% for tag in tags %}
<li>{{ tag }}</li>
{% endfor %}
</ul>

* * *

{% endfor %}

## その他の参考資料

{:.no_toc}

プライベートリポジトリまたは Amazon EC2 Container Registry（ECR）におけるイメージを使ったビルドの手順について知りたいときは、[プライベートイメージの使い方]({{ site.baseurl }}/2.0/private-images/)を参照してください。