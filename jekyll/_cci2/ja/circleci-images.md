---
layout: classic-docs
title: "CircleCI のビルド済み Docker イメージ"
short-title: "CircleCI のビルド済み Docker イメージ"
description: "CircleCI 提供の Docker イメージ一覧"
categories:
  - containerization
order: 20
---
このページでは、CircleCI が提供しているビルド済みイメージの詳細を解説するとともに、言語ごと、サービス (データベース) ごと、タグごとに探せる Docker イメージを紹介しています。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 These images are typically extensions of official Docker images and include tools especially useful for CI/CD. [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/) には、ここで紹介しているものを含む全ビルド済みイメージがあります。 GitHub の `circleci-images` リポジトリには[各 Docker イメージのソースコード](https://github.com/circleci/circleci-images)も用意しています。 これら [Docker イメージの作成に用いる Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) については `circleci-dockerfiles` リポジトリでチェック可能です。

***Note:** CircleCI occasionally makes scheduled changes to images to fix bugs or otherwise improve functionality, and these changes can sometimes cause affect how images work in CircleCI jobs. Please follow the [**convenience-images** tag on Discuss](https://discuss.circleci.com/tags/convenience-images) to be notified in advance of scheduled maintenance.*

## ビルド済みイメージの活用方法

Convenience images are based on the most recently built versions of upstream images, so it is best practice to use the most specific image possible. This makes your builds more deterministic by preventing an upstream image from introducing unintended changes to your image.

アップストリーム版を元にビルド済みイメージを作成している CircleCI では、`circleci/ruby:2.4-node` と記述した場合、最新版の Ruby 2.4-node コンテナを使うことを意味し、 あるいは `circleci/ruby:latest` としても結果は同じになります。 このようにタグを用いて使用するイメージを具体的に決めることは、ビルドコンテナの用途を絞るのに役立ちます。

したがって、アップストリーム版の想定外の変更に戸惑わないようにするには、`circleci/ruby:2.4-node` とするのではなく、そのコンテナのさらに細かいバージョン指定を行うようタグを書き換えます。アップストリーム版の変更に合わせてそのイメージが変更することのないようにします。

例えば、決まったバージョンの Debian ベースの OS を使うには、`-jessie` や `-stretch` をコンテナ名の末尾に追記します。 `circleci/ruby:2.3.7-jessie` としたり、`circleci/ruby:2.3-jessie` としたりして、使用するイメージをピンポイントのバージョンに決め打ちします。 バージョン指定は CircleCI の Docker イメージの全てで利用できます。

It is also possible to specify all the way down to the specific SHA of the image you want to use. Doing so allows you to test specific images for as long as you like before making any changes.

使用するイメージを特化させたいときは、下記の通り 2 つの方法があります。

- タグを使ってイメージのバージョンや OS を決め打ちにする
- Docker イメージ ID を使って一定のバージョンにする

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
          name: "Update Node.js and npm"
          command: |
            curl -sSL "https://nodejs.org/dist/v11.10.0/node-v11.10.0-linux-x64.tar.xz" | sudo tar --strip-components=2 -xJ -C /usr/local/bin/ node-v11.10.0-linux-x64/bin/node
            curl https://www.npmjs.com/install.sh | sudo bash
      - run:
          name: Check current version of node
          command: node -v
```

### バージョンや OS を決め打ちするイメージタグの使い方
{:.no_toc}

You can pin aspects of a Docker image by adding an [image tag](https://docs.docker.com/engine/reference/commandline/tag/#extended-description).

For example, instead of `circleci/golang`, specify the version and OS by using `circleci/golang:1.8.6-jessie`. Because the second image specifies a version and OS, it is less likely to change unexpectedly.

See below for a list of the [Latest Image Tags by Language](#latest-image-tags-by-language).

**Note:** If you do not specify a tag, Docker applies the `latest` tag. The `latest` tag refers to the most recent stable release of an image. However, since this tag may change unexpectedly, it is best practice to add an explicit image tag.

### イメージを一定のバージョンにする Docker イメージ ID の使い方
{:.no_toc}

Every Docker image has a [unique ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier). You can use this image ID to pin an image to a fixed version.

Each image ID is an immutable SHA256 digest and looks like this:

    sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

#### イメージ ID の調べ方
{:.no_toc}

1. CircleCI にアクセスし、イメージを使った過去のビルドを表示します。
2. **Test Summary** タブに表示されるステップのうち、**Spin up Environment** をクリックします。
3. ログに **Digest** の項目があることを確認します。
4. そこにあるイメージ ID を下記のようにイメージ名の末尾に付加します。

    circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
    

## イメージタイプ

CircleCI's convenience images fall into two categories: **language** images and **service** images. All images add a `circleci` user as a system user.

**Note:** The images below are based on the most recently built upstream images for their respective languages. Because the most recent images are more likely to change, it is [best practice](#best-practices) to use a more specific tag.

### 言語イメージ
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

#### 言語イメージのバリエーション
{:.no_toc}

CircleCI maintains several variants for language images. To use these variants, add one of the following suffixes to the end of an image tag.

- `-node`：多言語対応の Node.js を含めます
- `-browsers` includes Chrome, Firefox, Java 8, and Geckodriver
- `-browsers-legacy` includes Chrome, Firefox, Java 8, and PhantomJS
- `-node-browsers`：`-node` と `-browsers` の組み合わせです
- `-node-browsers-legacy` combines the `-node` and `-browsers-legacy` variants

For example, if you want to add browsers to the `circleci/golang:1.9` image, use the `circleci/golang:1.9-browsers` image.

### サービスイメージ
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

#### サービスイメージのバリエーション
{:.no_toc}

CircleCI maintains only one variant for service images. To speed up builds using RAM volume, add the `-ram` suffix to the end of a service image tag.

For example, if you want the `circleci/postgres:9.5-postgis` image to use RAM volume, use the `circleci/postgres:9.5-postgis-ram` image.

## インストール済みツール

All convenience images have been extended with additional tools.

With the exception of [Android images](https://hub.docker.com/r/circleci/android), all images include the following packages, installed via `apt-get`:

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

The specific version of a particular package that gets installed in a particular CircleCI image variant depends on the default version included in the package directory for the Linux distribution/version installed in that variant's base image. Most CircleCI convenience images are [Debian Jessie](https://packages.debian.org/jessie/)- or [Stretch](https://packages.debian.org/stretch/)-based images, however some extend [Ubuntu](https://packages.ubuntu.com)-based images. For details on individual variants of CircleCI images, see the [circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) repository.

The following packages are installed via `curl` or other means.

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## 言語別の最新イメージタグ

Below is a list of the latest convenience images, sorted by language. For details about the contents of each image, refer to the [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles).

**Note:** Excluding [language image variants](#language-image-variants) and [the service image variant](#service-image-variant), CircleCI does **not** control which tags are used. These tags are chosen and maintained by upstream projects. Do not assume that a given tag has the same meaning across images!

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{:.no_toc}

**Resources:**

- [DockerHub](https://hub.docker.com/r/circleci/{{ image[0] }}) - where this image is hosted as well as some useful instructions.
- [Dockerfiles](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/{{ image[0] }}/images) - the Dockerfiles this image was built from.

**Usage:** Add the following under `docker:` in your config.yml:

`- image: circleci/{{ image[0] }}:[TAG]`

**Recent Tags:** <small>(View all available image tags <a href="{{ site.baseurl }}/2.0/docker-image-tags.json">here</a>{:target="_blank"})</small>

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

Note: Any variants available for this image can be used by appending the variant tag to the tags above. View all available image tags [here]({{ site.baseurl }}/2.0/docker-image-tags.json){:target="_blank"}.

* * *

{% endfor %}

## 関連情報
{:.no_toc}

See [Using Private Images]({{ site.baseurl }}/2.0/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.