---
layout: classic-docs
title: "CircleCI のビルド済み Docker イメージ"
short-title: "CircleCI のビルド済み Docker イメージ"
description: "CircleCI が提供する Docker イメージの一覧"
categories:
  - containerization
order: 20
---

CircleCI が提供しているビルド済みイメージの概要と、言語別、サービス タイプ別、タグ別のイメージについて、以下のセクションに沿って説明します。

* TOC
{:toc}

## 概要
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 一般に、これらのイメージは正式な Docker イメージの拡張版で、特に CI/CD に便利なツールが含まれます。 すべてのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/search?q=circleci&type=image) から入手できます。 GitHub の `circleci-images` リポジトリには[各 Docker イメージのソース コード](https://github.com/circleci/circleci-images)も用意しています。 これらの [Docker イメージの作成に使用する Dockerfile](https://github.com/circleci-public/circleci-dockerfiles) は `circleci-dockerfiles` リポジトリで確認できます。

_**Note:** CircleCI occasionally makes scheduled changes to images to fix bugs or otherwise improve functionality, and these changes can sometimes cause affect how images work in CircleCI jobs. Please follow the [**convenience-images** tag on Discuss](https://discuss.circleci.com/tags/convenience-images) to be notified in advance of scheduled maintenance._

### 例

ビルド済み CircleCI Docker イメージのデモ アプリケーションでの使用例については、[チュートリアル]({{ site.baseurl }}/2.0/tutorials/)を参照してください。

## ベスト プラクティス

コンビニエンス イメージは、アップストリーム イメージの最新版のビルドに基づいています。したがって、可能な限り最も当てはまるイメージを使用することをお勧めします。 これで、いずれかのアップストリーム イメージによってイメージに意図しない変更が組み込まれることを防ぎ、より決定論的にビルドを行うことができます。

アップストリーム版を基にビルド済みイメージを作成している CircleCI では、`circleci/ruby:2.4-node` と記述した場合、最新版の Ruby 2.4-node コンテナを使うことを意味し、 あるいは `circleci/ruby:latest` としても結果は同じになります。 ベスト プラクティスとして、タグを追加して使用するイメージを指定すれば、ビルド コンテナの状態を固定することができます。

したがって、アップストリームからの想定外の変更を防止するには、アップストリーム版の変更に伴ってそのイメージが変更されないよう、`circleci/ruby:2.4-node` と記述するのではなく、そのコンテナのさらに細かいバージョンを指定するようにタグを書き換えます。

たとえば、決まったバージョンの Debian ベースの OS のみを使用するには、`-jessie` や `-stretch` をコンテナ名の末尾に追記します。 `circleci/ruby:2.3.7-jessie` や `circleci/ruby:2.3-jessie` のように、使用するイメージのバージョンを限定的に指定します。 バージョンは CircleCI のすべての Docker イメージで指定できます。

また、使用するイメージを特定の SHA に至るまで指定することができます。 これにより、変更が加えられるまでの間、特定のイメージをテストすることができます。

使用するイメージを細かく指定するには、以下の 2 つの方法があります。

- タグを使用してイメージのバージョンや OS を指定する
- Docker イメージ ID を使用してバージョンを指定する

**NOTE:** For Node.js variant Docker images (tags that end in `-node`) the LTS release of Node.js is pre-installed. 独自に特定のバージョンの Node.js/NPM を使用する場合は、`.circleci/config.yml` 内の `run` ステップで設定できます。 Ruby イメージと共に特定のバージョンの Node.js をインストールする例については、以下を参照してください。

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.2-jessie-node
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

### バージョンや OS を指定するイメージ タグの使用方法
{:.no_toc}

[イメージ タグ](https://docs.docker.com/engine/reference/commandline/tag/#extended-description)を追加することで、Docker イメージの状態を固定できます。

たとえば、`circleci/golang` の代わりに `circleci/golang:1.8.6-jessie` を使用して、バージョンと OS を指定します。 後者はバージョンと OS を指定しているため、意図しない変更の影響を受けるリスクが抑えられます。

以降に掲載した[言語別の最新イメージ タグ](#言語別の最新イメージ-タグ)の一覧を参照してください。

**Note:** If you do not specify a tag, Docker applies the `latest` tag. `latest` タグは、イメージの最新の安定したリリースを示します。 ただし、このタグは予期せずに変更される可能性があるため、明示的なイメージ タグを追加することをお勧めします。

### 特定のバージョンを指定する Docker イメージ ID の使用方法
{:.no_toc}

すべての Docker イメージは[一意の ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier) を持ちます。 このイメージ ID を使用して、特定のバージョンのイメージを指定できます。

各イメージ ID は、以下のような不変の SHA256 ダイジェストです。

```
sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
```

#### イメージ ID の確認方法
{:.no_toc}

1. CircleCI にアクセスし、そのイメージを使用した過去のビルドを表示します。
2. On the **Test Summary** tab, click the **Spin up environment** step.
3. ログ内でそのイメージの **Digest** を確認します。
4. そこに記載されたイメージ ID を以下のようにイメージ名の末尾に付加します。

```
circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
```

## イメージのタイプ

CircleCI's convenience images fall into two categories: **language** images and **service** images. すべてのイメージは、`circleci` ユーザーをシステム ユーザーとして追加します。

**Note:** The images below are based on the most recently built upstream images for their respective languages. 最新のイメージは変更される可能性が高いため、より限定的なタグを使用することが<a href="#ベスト-プラクティス」>ベスト プラクティス</a>として推奨されます。

### 言語イメージ
{:.no_toc}

言語イメージは、一般的なプログラミング言語に対応するコンビニエンス イメージです。 これらのイメージには、関連する言語と[共通して使用されるツール](#プリインストール-ツール)の両方が含まれます。 言語イメージは、ユーザー設定内の `docker` キーの下に最初にリストされ、実行中は[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ){:target="_blank"}になります。

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

上記以外の言語を使用する場合は、CircleCI が提供する [Dockerfile Wizard](https://github.com/circleci-public/dockerfile-wizard) を使用してカスタム イメージを作成できます。

#### 言語イメージのバリアント
{:.no_toc}

CircleCI は、言語イメージに対していくつかのバリアントを用意しています。 これらのバリアントを使用するには、以下のサフィックスの 1 つをイメージ タグの末尾に追加します。

- `-node`: 多言語対応の Node.js が含まれます。
- `-browsers` includes Chrome, Firefox, OpenJDK v11, and Geckodriver
- `-node-browsers` combines the `-node` and `-browsers` variants

たとえば、`circleci/golang:1.9` イメージにブラウザーを追加する場合は、`circleci/golang:1.9-browsers` イメージを使用します。

### サービス イメージ
{:.no_toc}

サービス イメージは、データベースなどのサービスに対応するコンビニエンス イメージです。 These images should be listed **after** language images so they become secondary service containers.

CircleCI は、以下のサービスに対応するイメージを提供しています。

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### サービス イメージのバリアント
{:.no_toc}

CircleCI は、サービス イメージに対してバリアント 1 つのみ用意しています。 RAM ボリュームを使用してビルドを高速化するには、サービス イメージ タグの末尾に `-ram` サフィックスを追加します。

たとえば、`circleci/postgres:9.5-postgis` イメージで RAM ボリュームを使用する場合は、`circleci/postgres:9.5-postgis-ram` イメージを使用します。

## プリインストール ツール

すべてのコンビニエンス イメージは、`apt-get` と共にインストールされた追加ツールで拡張されています。

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

特定の CircleCI イメージ バリアントにインストールされる特定パッケージの具体的なバージョンは、そのバリアントの基本イメージにインストールされている Linux ディストリビューション/バージョンのパッケージ ディレクトリに含まれるデフォルト バージョンに依存します。 大部分の CircleCI コンビニエンス イメージは、[Debian Jessie](https://packages.debian.org/jessie/) ベースまたは [Stretch](https://packages.debian.org/stretch/) ベースのイメージですが、[Ubuntu](https://packages.ubuntu.com) ベースのイメージを拡張したイメージも提供されています。 CircleCI イメージの各バリアントの詳細については、[circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) リポジトリを参照してください。

以下のパッケージは、`curl` などの方法でインストールされます。

- [Docker クライアント](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)


## Out of Scope

1. If an image isn't listed above, it is not available. As the Convenience Image program is revamped, proposals for new images are not currently being accepted.
1. Old versions of software will not be rebuilt. Once an upstream image stops building the tag for a specific release, say Node.js v8.1.0, then we stop building it too. This means other tools in that image, such as `npm` in this example, will no longer be updated either.
1. We don't support building preview, beta, or release candidate images tags. On occasion they'll be available but these tags tend to cause our build system for Convenience Images to fail. If you need a non-stable release of a language, we suggest installing it via [an orb](https://circleci.com/orbs/) or a custom Docker image instead.


## Latest Image Tags by Language

最新のコンビニエンス イメージを言語別に紹介します。 各イメージの内容の詳細については、[対応する Dockerfile](https://github.com/circleci-public/circleci-dockerfiles) を参照してください。

**Note:** Excluding [language image variants](#language-image-variants) and [the service image variant](#service-image-variant), CircleCI does **not** control which tags are used. これらのタグは、アップストリーム プロジェクトによって選択および維持されます。 特定のタグがイメージ間で同じ意味を持つと断定しないように注意してください。

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{:.no_toc}

**リソース**

- [DockerHub](https://hub.docker.com/r/circleci/{{ image[0] }}) - このイメージがホスティングされる場所。便利な指示書も用意されています。
- [Dockerfiles](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/{{ image[0] }}/images) - このイメージのビルド元の Dockerfile。

**Usage:** Add the following under `docker:` in your config.yml:

`- image: circleci/{{ image[0] }}:[TAG]`

**Recent Tags:** <small>(View all available image tags [here]({{ site.baseurl }}/2.0/docker-image-tags.json){:target="_blank"})</small>

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

メモ: このイメージで使用可能なバリアントは、上記のタグにバリアント タグを追加することで使用できます。 すべてのイメージ タグは[こちら]({{ site.baseurl }}/2.0/docker-image-tags.json){:target="_blank"}で確認できます。

---

{% endfor %}

## See Also
{:.no_toc}

- プライベート リポジトリまたは Amazon ECR にあるイメージの使用をビルドに承認する方法については、「[プライベート イメージの使用]({{ site.baseurl }}/2.0/private-images/)」を参照してください。
- iOS 用の macOS イメージの詳細については、({{ site.baseurl }}/2.0/testing-ios/) を参照してください。
- Docker イメージをビルドする方法については、「[Docker コマンドの実行手順]({{ site.baseurl }}/2.0/building-docker-images/)」を参照してください。
