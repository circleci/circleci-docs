---
layout: classic-docs
title: "CircleCI のビルド済み Docker イメージ"
short-title: "CircleCI のビルド済み Docker イメージ"
description: "CircleCI が提供する Docker イメージの一覧"
categories:
  - containerization
order: 20
---

ここでは、以下のセクションに沿って、CircleCI が提供しているビルド済みイメージの概要と、言語別、サービスタイプ別、タグ別のイメージについて説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 一般に、これらのイメージは正式な Docker イメージの拡張版で、特に CI/CD にとって便利なツールが含まれます。 All of these pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/search?q=circleci&type=image). GitHub の `circleci-images` リポジトリには[各 Docker イメージのソースコード](https://github.com/circleci/circleci-images)も用意しています。 これらの <a href=」https://github.com/circleci-public/circleci-dockerfiles">Docker イメージの作成に使用する Dockerfile</a> は `circleci-dockerfiles` リポジトリで確認できます。

***メモ：**CircleCI は、バグの修正または機能の強化のために、スケジュールに沿ってイメージに変更を加えることがあり、こうした変更によって CircleCI ジョブ内でのイメージの動作に影響が生じる可能性があります。 メンテナンスのスケジュールは、[Discuss ページに **convenience-images** タグを付けて通知](https://discuss.circleci.com/tags/convenience-images)されますので、定期的にご確認ください。*

### Examples

Refer to the [Tutorials]({{ site.baseurl }}/2.0/tutorials/) for examples of using pre-built CircleCI Docker Images in a demo application.

## ベストプラクティス

Convenience images are based on the most recently built versions of upstream images, so it is best practice to use the most specific image possible. This makes your builds more deterministic by preventing an upstream image from introducing unintended changes to your image.

CircleCI bases pre-built images off of upstream, for example, `circleci/ruby:2.4-node` is based off the most up to date version of the Ruby 2.4-node container. Using `circleci/ruby:2.4-node` is similar to using `:latest`. It is best practice to lock down aspects of your build container by specifying an additional tag to pin down the image in your configuration.

That is, to prevent unintended changes that come from upstream, instead of using `circleci/ruby:2.4-node` use a more specific version of these containers to ensure the image does not change with upstream changes until you change the tag.

For example, add `-jessie` or `-stretch` to the end of each of those containers to ensure you’re only using that version of the Debian base OS. Pin down those images to a specific point version, like `circleci/ruby:2.3.7-jessie`, or specify the OS version with `circleci/ruby:2.3-jessie`. Specifying the version is possible for any of the CircleCI images.

It is also possible to specify all the way down to the specific SHA of the image you want to use. Doing so allows you to test specific images for as long as you like before making any changes.

There are two ways to make an image more specific:

- タグを使用してイメージのバージョンや OS を指定する
- Docker イメージ ID を使用してバージョンを指定する

**NOTE:** For Node.js variant Docker images (tags that end in `-node`) the LTS release of Node.js is pre-installed. If you would like to include your own specific version of Node.js / NPM you can set it up in a series of `run` steps in your `.circleci/config.yml`. Consider the example below, which installs a specific version of Node.js alongside the Ruby image.

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

### Using an Image Tag to Pin an Image Version or OS
{:.no_toc}

You can pin aspects of a Docker image by adding an [image tag](https://docs.docker.com/engine/reference/commandline/tag/#extended-description).

For example, instead of `circleci/golang`, specify the version and OS by using `circleci/golang:1.8.6-jessie`. Because the second image specifies a version and OS, it is less likely to change unexpectedly.

See below for a list of the [Latest Image Tags by Language](#latest-image-tags-by-language).

**Note:** If you do not specify a tag, Docker applies the `latest` tag. The `latest` tag refers to the most recent stable release of an image. However, since this tag may change unexpectedly, it is best practice to add an explicit image tag.

### Using a Docker Image ID to Pin an Image to a Fixed Version
{:.no_toc}

Every Docker image has a [unique ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier). You can use this image ID to pin an image to a fixed version.

Each image ID is an immutable SHA256 digest and looks like this:

    sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

#### イメージ ID の確認方法
{:.no_toc}

1. CircleCI にアクセスし、そのイメージを使用した過去のビルドを表示します。
2. **[Test Summary (テストサマリー)]** タブの **Spin up Environment** ステップをクリックします。
3. ログ内でそのイメージの **Digest** を確認します。
4. そこに記載されたイメージ ID を以下のようにイメージ名の末尾に付加します。

    circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

## イメージのタイプ

CircleCI's convenience images fall into two categories: **language** images and **service** images. All images add a `circleci` user as a system user.

**Note:** The images below are based on the most recently built upstream images for their respective languages. Because the most recent images are more likely to change, it is [best practice](#best-practices) to use a more specific tag.

### Language Images
{:.no_toc}

Language images are convenience images for common programming languages. These images include both the relevant language and [commonly-used tools](#pre-installed-tools). A language image should be listed first under the `docker` key in your configuration, making it the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

CircleCI maintains images for the languages below.

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

If your language is not listed, CircleCI also maintains a [Dockerfile Wizard](https://github.com/circleci-public/dockerfile-wizard) you can use to create a custom image.

#### 言語イメージのバリアント
{:.no_toc}

CircleCI maintains several variants for language images. To use these variants, add one of the following suffixes to the end of an image tag.

- `-node`：多言語対応の Node.js が含まれます。
- `-browsers`：Chrome、Firefox、Java 8、および Geckodriver が含まれます。
- `-browsers-legacy`：Chrome、Firefox、Java 8、および PhantomJS が含まれます。
- `-node-browsers`：`-node` バリアントと `-browsers` バリアントの組み合わせです。
- `-node-browsers-legacy`：`-node` バリアントと `-browsers-legacy` バリアントの組み合わせです。

For example, if you want to add browsers to the `circleci/golang:1.9` image, use the `circleci/golang:1.9-browsers` image.

### Service Images
{:.no_toc}

Service images are convenience images for services like databases. These images should be listed **after** language images so they become secondary service containers.

CircleCI maintains images for the services below.

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### サービスイメージのバリアント
{:.no_toc}

CircleCI maintains only one variant for service images. To speed up builds using RAM volume, add the `-ram` suffix to the end of a service image tag.

For example, if you want the `circleci/postgres:9.5-postgis` image to use RAM volume, use the `circleci/postgres:9.5-postgis-ram` image.

## プリインストールツール

All convenience images have been extended with additional tools, installed with `apt-get`:

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

**メモ：**[言語イメージのバリアント](#language-image-variants)および[サービスイメージのバリアント](#service-image-variant)以外のイメージでどのようなタグが使用されるかを CircleCI は**関知しません**。 これらのタグは、アップストリームプロジェクトによって選択および維持されます。 特定のタグがイメージ間で同じ意味を持つと断定しないように注意してください。

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

- See [Using Private Images]({{ site.baseurl }}/2.0/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.
- For information about macOS images for iOS, see ({{ site.baseurl }}/2.0/testing-ios/). 
- See [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/) for information about how to build Docker images.