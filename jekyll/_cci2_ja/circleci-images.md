---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---

ここでは、以下のセクションに沿って、CircleCI が提供しているビルド済みイメージの概要と、言語別、サービスタイプ別、タグ別のイメージについて説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 一般に、これらのイメージは正式な Docker イメージの拡張版で、特に CI/CD にとって便利なツールが含まれます。 すべてのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/) から入手できます。 GitHub の `circleci-images` リポジトリには[各 Docker イメージのソースコード](https://github.com/circleci/circleci-images)も用意しています。 これらの [Docker イメージの作成に使用する Dockerfile](https://github.com/circleci-public/circleci-dockerfiles) は `circleci-dockerfiles` リポジトリで確認できます。

***メモ：**CircleCI は、バグの修正または機能の強化のために、スケジュールに沿ってイメージに変更を加えることがあり、こうした変更によって CircleCI ジョブ内でのイメージの動作に影響が生じる可能性があります。 メンテナンスのスケジュールは、[Discuss ページに **convenience-images** タグを付けて通知](https://discuss.circleci.com/tags/convenience-images)されますので、定期的にご確認ください。*

## ベストプラクティス

コンビニエンスイメージは、アップストリームイメージの最新版のビルドに基づいています。したがって、可能な限り最も当てはまるイメージを使用することをお勧めします。 これで、いずれかのアップストリームイメージによってイメージに意図しない変更が組み込まれることを防止し、より決定論的にビルドを行うことができます。

アップストリーム版を基にビルド済みイメージを作成している CircleCI では、`circleci/ruby:2.4-node` と記述した場合、最新版の Ruby 2.4-node コンテナを使うことを意味し、 あるいは `circleci/ruby:latest` としても結果は同じになります。 ベストプラクティスとして、タグを追加して使用するイメージを指定すれば、ビルドコンテナの状態を固定することができます。

したがって、アップストリームからの想定外の変更を防止するには、アップストリーム版の変更に伴ってそのイメージが変更されないよう、`circleci/ruby:2.4-node` と記述するのではなく、そのコンテナのさらに細かいバージョンを指定するようにタグを書き換えます。

たとえば、決まったバージョンの Debian ベースの OS のみを使用するには、`-jessie` や `-stretch` をコンテナ名の末尾に追記します。 `circleci/ruby:2.3.7-jessie` や `circleci/ruby:2.3-jessie` のように、使用するイメージのバージョンを限定的に指定します。 バージョンは CircleCI のすべての Docker イメージで指定できます。

また、使用するイメージを特定の SHA に至るまで指定することができます。 これにより、変更が加えられるまでの間、特定のイメージをテストすることができます。

使用するイメージを細かく指定するには、以下の 2つの方法があります。

- タグを使用してイメージのバージョンや OS を指定する
- Docker イメージ ID を使用してバージョンを指定する

**メモ：**Node.js バリアントの Docker イメージ (`-node` で終わるタグ) に対しては、Node.js の LTS リリースがプリインストールされています。 独自に特定のバージョンの Node.js/NPM を使用する場合は、`.circleci/config.yml` 内の `run` ステップで設定できます。 Ruby イメージと共に特定のバージョンの Node.js をインストールする例については、以下を参照してください。

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.2-jessie-node
    steps:
      - checkout
      - run:
          name: "Node.js と npm を更新"
          command: |
            curl -sSL "https://nodejs.org/dist/v11.10.0/node-v11.10.0-linux-x64.tar.xz" | sudo tar --strip-components=2 -xJ -C /usr/local/bin/ node-v11.10.0-linux-x64/bin/node
            curl https://www.npmjs.com/install.sh | sudo bash
      - run:
          name: 現行バージョンのノードをチェック
          command: node -v
```

### バージョンや OS を指定するイメージタグの使用方法
{:.no_toc}

[イメージタグ](https://docs.docker.com/engine/reference/commandline/tag/#extended-description)を追加することで、Docker イメージの状態を固定できます。

たとえば、`circleci/golang` の代わりに `circleci/golang:1.8.6-jessie` を使用して、バージョンと OS を指定します。 後者はバージョンと OS を指定しているため、意図しない変更の影響を受けるリスクが抑えられます。

以降に掲載した[言語別の最新イメージタグ](#言語別の最新イメージタグ)の一覧を参照してください。

**メモ：**タグが指定されていない場合、Docker は `latest` タグを適用します。 `latest` タグは、イメージの最新の安定したリリースを示します。 ただし、このタグは予期せずに変更される可能性があるため、明示的なイメージタグを追加することをお勧めします。

### 特定のバージョンを指定する Docker イメージ ID の使用方法
{:.no_toc}

すべての Docker イメージは[一意の ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier) を持ちます。 このイメージ ID を使用して、特定のバージョンのイメージを指定できます。

各イメージ ID は、以下のような不変の SHA256 ダイジェストです。

    sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e


#### イメージ ID の確認方法
{:.no_toc}

1. CircleCI にアクセスし、そのイメージを使用した過去のビルドを表示します。
2. **[Test Summary (テストサマリー)]** タブの **Spin up Environment** ステップをクリックします。
3. ログ内でそのイメージの **Digest** を確認します。
4. そこに記載されたイメージ ID を以下のようにイメージ名の末尾に付加します。

    circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e


## イメージのタイプ

CircleCI のコンビニエンスイメージは、**言語**イメージと**サービス**イメージのいずれかのカテゴリに分類されます。 すべてのイメージは、`circleci` ユーザーをシステムユーザーとして追加します。

**メモ：**以下のイメージは、それぞれの言語に対してビルドされた最新のアップストリームイメージに基づいています。 最新のイメージは変更される可能性が高いため、より限定的なタグを使用することが<a href="#best-practices」>ベストプラクティス</a>として推奨されます。

### 言語イメージ
{:.no_toc}

言語イメージは、一般的なプログラミング言語に対応するコンビニエンスイメージです。 これらのイメージには、関連する言語と[共通して使用されるツール](#プリインストールツール)の両方が含まれます。 言語イメージは、ユーザー設定内の `docker` キーの下に最初にリストされ、実行中は[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container){:target="_blank"}になります。

CircleCI は、以下の言語に対応するイメージを提供しています。

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

上記以外の言語を使用する場合は、CircleCI が提供する [Dockerfile Wizard](https://github.com/circleci-public/dockerfile-wizard) を使用してカスタムイメージを作成できます。

#### 言語イメージのバリアント
{:.no_toc}

CircleCI は、言語イメージに対していくつかのバリアントを用意しています。 これらのバリアントを使用するには、以下のサフィックスの 1つをイメージタグの末尾に追加します。

- `-node`：多言語対応の Node.js が含まれます。
- `-browsers`：Chrome、Firefox、Java 8、および Geckodriver が含まれます。
- `-browsers-legacy`：Chrome、Firefox、Java 8、および PhantomJS が含まれます。
- `-node-browsers`：`-node` バリアントと `-browsers` バリアントの組み合わせです。
- `-node-browsers-legacy`：`-node` バリアントと `-browsers-legacy` バリアントの組み合わせです。

たとえば、`circleci/golang:1.9` イメージにブラウザーを追加する場合は、`circleci/golang:1.9-browsers` イメージを使用します。

### サービスイメージ
{:.no_toc}

サービスイメージは、データベースなどのサービスに対応するコンビニエンスイメージです。 これらのイメージは言語イメージの**後に**リストされ、セカンダリサービスコンテナになります。

CircleCI は、以下のサービスに対応するイメージを提供しています。

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### サービスイメージのバリアント
{:.no_toc}

CircleCI は、サービスイメージに対してバリアント 1つのみ用意しています。 RAM ボリュームを使用してビルドを高速化するには、サービスイメージタグの末尾に `-ram` サフィックスを追加します。

たとえば、`circleci/postgres:9.5-postgis` イメージで RAM ボリュームを使用する場合は、`circleci/postgres:9.5-postgis-ram` イメージを使用します。

## プリインストールツール

すべてのコンビニエンスイメージは、追加のツールを使用して拡張されています。

[Android イメージ](https://hub.docker.com/r/circleci/android)以外のすべてのイメージには、以下のパッケージが含まれ、`apt-get` を使用してインストールされます。

- `bzip2`
- `ca-certificates`
- `curl`
- `git`
- `gnupg`
- `gzip`
- `locales`
- `mercurial`
- `net-tools`
- `netcat`
- `openssh-client`
- `parallel`
- `sudo`
- `tar`
- `unzip`
- `wget`
- `xvfb`
- `zip`

特定の CircleCI イメージバリアントにインストールされる特定パッケージの具体的なバージョンは、そのバリアントの基本イメージにインストールされている Linux ディストリビューション/バージョンのパッケージディレクトリに含まれるデフォルトバージョンに依存します。 大部分の CircleCI コンビニエンスイメージは、[Debian Jessie](https://packages.debian.org/jessie/) ベースまたは [Stretch](https://packages.debian.org/stretch/) ベースのイメージですが、[Ubuntu](https://packages.ubuntu.com) ベースのイメージを拡張したイメージも提供されています。 CircleCI イメージの各バリアントの詳細については、[circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) リポジトリを参照してください。

以下のパッケージは、`curl` などの方法でインストールされます。

- [Docker クライアント](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## 言語別の最新イメージタグ

最新のコンビニエンスイメージを言語別に紹介します。 各イメージの内容の詳細については、[対応する Dockerfile](https://github.com/circleci-public/circleci-dockerfiles) を参照してください。

**メモ：**[言語イメージのバリアント](#言語イメージのバリアント)および[サービスイメージのバリアント](#サービスイメージのバリアント)以外のイメージでどのようなタグが使用されるかを CircleCI は**関知しません**。 これらのタグは、アップストリームプロジェクトによって選択および維持されます。 特定のタグがイメージ間で同じ意味を持つと断定しないように注意してください。

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{:.no_toc}

**リソース**

- [DockerHub](https://hub.docker.com/r/circleci/{{ image[0] }}) - このイメージがホスティングされる場所。便利な指示書も用意されています。
- [Dockerfiles](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/{{ image[0] }}/images) - このイメージのビルド元の Dockerfile。

**使用方法：**config.yml の `docker:` に以下の行を追加します。

`- image: circleci/{{ image[0] }}:[TAG]`

**最新のタグ**<small>(すべてのイメージタグは<a href="{{ site.baseurl }}/ja/2.0/docker-image-tags.json">こちら</a>{:target="_blank"})</small>

<ul class="list-3cols">
{% assign tags = image[1].tags | sort | reverse %}
{% assign tagCounter = 1 %}
{% for tag in tags %}
	{% if tagCounter > 99 %}
		{% break %}
	{% endif %}
	{% unless tag contains "-browsers" or tag contains "-node" or tag contains "-ram" %}
	<li>
    {{ tag }}
  </li>
	{% assign tagCounter = tagCounter | plus:1 %}
	{% endunless %}
{% endfor %}
</ul>

メモ：このイメージで使用可能なバリアントは、上記のタグにバリアントタグを追加することで使用できます。 すべてのイメージタグは[こちら]({{ site.baseurl }}/ja/2.0/docker-image-tags.json){:target="_blank"}で確認できます。

* * *

{% endfor %}

## 関連項目
{:.no_toc}

プライベートリポジトリまたは Amazon ECR にあるイメージの使用をビルドに承認する方法については、[プライベートイメージの使用]({{ site.baseurl }}/ja/2.0/private-images/)を参照してください。
