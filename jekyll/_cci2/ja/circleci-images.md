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

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI ではすぐに使える Docker イメージを多数提供しています。 一般に、これらのイメージは正式な Docker イメージの拡張版で、特に CI/CD に便利なツールが含まれます。 すべてのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/search?q=circleci&type=image) から入手できます。 Visit the `circleci-images` GitHub repo for the [source code for the legacy CircleCI Docker images](https://github.com/circleci/circleci-images). Visit the [Developer Hub](https://circleci.com/developer/images/) for links to all the repositories for each next-gen image. Visit the `circleci-dockerfiles` GitHub repo for the [Dockerfiles for the CircleCI Docker images](https://github.com/circleci-public/circleci-dockerfiles).

***メモ:** CircleCI は、バグの修正または機能の強化のために、スケジュールに沿ってイメージに変更を加えることがあり、こうした変更によって CircleCI ジョブ内でのイメージの動作に影響が生じる可能性があります。 メンテナンスのスケジュールは、[Discuss ページに **convenience-images** タグを付けて通知](https://discuss.circleci.com/tags/convenience-images)されますので、定期的にご確認ください。*

### 例

ビルド済み CircleCI Docker イメージのデモ アプリケーションでの使用例については、[チュートリアル]({{ site.baseurl }}/2.0/tutorials/)を参照してください。

## Next-generation Convenience Images

The next-generation convenience images in this section were built from the ground up with CI, efficiency, and determinism in mind. Here are some of the highlights:

**Faster spin-up time** - In Docker terminology, these next-gen images will generally have fewer and smaller layers. Using these new images will lead to faster image downloads when a build starts, and a higher likelihood that the image is already cached on the host.

**Improved reliability and stability** - The current images are rebuilt practically every day with potential changes from upstream that we can't always test fast enough. This leads to frequent breaking changes, which is not the best environment for stable, deterministic builds. Next-gen images will only be rebuilt for security and critical-bugs, leading to more stable and deterministic images.

### CircleCI Base Image

```yaml
image: cimg/base:2020.01
```

This is a brand new Ubuntu-based image designed to install the very bare minimum. All of the next-generation convenience images that we will be releasing in the coming weeks are based on this image.

**When to use it?**

If you need a generic image to run on CircleCI, to use with orbs, or to use as a base for your own custom Docker image, this image is for you.

**Resources**

You can find more config examples for this image on the [Developer Hub](https://circleci.com/developer/images/image/cimg/base), and the source code and documentation on [GitHub](https://github.com/CircleCI-Public/cimg-base).

## Next-gen CircleCI Images

CircleCI is moving to a set of new image repositories that bring better documentation and more determinism. Below is an example image definition for the next-gen Go image.

```yaml
image: cimg/go:1.13
```

This is a direct replacement for the legacy CircleCI Go image (`circleci/golang`). Note, the Docker Hub namespace is `cimg`.

## Best Practices

The next-gen convenience images in the following sections are based on the most recent Ubuntu LTS Docker images and installed with the base libraries for the language or services, so it is best practice to use the most specific image possible. This makes your builds more deterministic by preventing an upstream image from introducing unintended changes to your image.

That is, to prevent unintended changes that come from upstream, instead of using `cimg/ruby:2.4-node` use a more specific version of these containers to ensure the image does not change with upstream changes until you change the tag.

For example, pin down those images to a specific point version, like `cimg/ruby:2.4.10-node`. Specifying the version is possible for any of the CircleCI images.

It is also possible to specify all the way down to the specific SHA of the image you want to use. For example, you can use `cimg/ruby@sha256:e4aa60a0a47363eca3bbbb066620f0a5967370f6469f6831ad52231c87ca9390` instead of `cimg/ruby:2.4.10-node`. Doing so allows you to test specific images for as long as you like before making any changes.

<div class="alert alert-warning" role="alert">
It is not recommended that you use the SHA for extended periods of time. If there's a major bug or security issue what would require a rebuild of the image, your pipeline's dependency on the image could inhibit you from acquiring the update that fixes that bug or patches a security issue.
</div>

There are two ways to make an image more specific:

- Use a tag to pin an image to a version or variant.
- Docker イメージ ID を使用してバージョンを指定する

**NOTE:** For Node.js variant Docker images (tags that end in `-node`) the LTS release of Node.js is pre-installed. If you would like to include your own specific version of Node.js / NPM you can set it up in a series of `run` steps in your `.circleci/config.yml`. Consider the example below, which installs a specific version of Node.js alongside the Ruby image.

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
          name: "Update Node.js and npm"
          command: |
            curl -sSL "https://nodejs.org/dist/v11.10.0/node-v11.10.0-linux-x64.tar.xz" | sudo tar --strip-components=2 -xJ -C /usr/local/bin/ node-v11.10.0-linux-x64/bin/node
            curl https://www.npmjs.com/install.sh | sudo bash
      - run:
          name: Check current version of node
          command: node -v
```

### Using an Image Tag to Pin an Image Version
{:.no_toc}

You can pin aspects of a Docker image by adding an [image tag](https://docs.docker.com/engine/reference/commandline/tag/#extended-description).

For example, instead of `cimg/go:1.14`, specify the version by using `cimg/go:1.14.3`. Because the second image specifies a specific version it is less likely to change unexpectedly.

See below for a list of the [Latest Image Tags by Language](#latest-image-tags-by-language).

**Note:** If you do not specify a tag, Docker applies the `latest` tag. The `latest` tag refers to the most recent stable release of an image. However, since this tag may change unexpectedly, it is best practice to add an explicit image tag. Only legacy images from the `circleci` repository support the `latest` tag. Next-gen images from the `cimg` repository do not support `latest`.

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

    cimg/python@sha256:bdabda041f88d40d194c65f6a9e2a2e69ac5632db8ece657b15269700b0182cf
    

## Image Types

CircleCI's convenience images fall into two categories: **language** images and **service** images. All images add a `circleci` user as a system user.

**Note:** The images below are based on the most recently built upstream images for their respective languages. Because the most recent images are more likely to change, it is [best practice](#best-practices) to use a more specific tag.

### Legacy Language Images
{:.no_toc}

The legacy language images are convenience images for common programming languages. These images include both the relevant language and [commonly-used tools](#pre-installed-tools). A language image should be listed first under the `docker` key in your configuration, making it the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

CircleCI maintains legacy images for the languages below.

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

#### 言語イメージのバリアント
{:.no_toc}

CircleCI maintains several variants for language images. To use these variants, add one of the following suffixes to the end of an image tag.

- `-node`: 多言語対応の Node.js が含まれます。
- `-browsers`: Chrome、Firefox、OpenJDK v11、および GeckoDriver が含まれます。
- `-node-browsers`: `-node` バリアントと `-browsers` バリアントの組み合わせです。

For example, if you want to add browsers to the `circleci/golang:1.9` image, use the `circleci/golang:1.9-browsers` image.

### Next-Gen Language Images
{:.no_toc}

Like the legacy images, the next-gen language images are convenience images for common programming languages. These images include both the same relevant language and [commonly-used tools](#pre-installed-tools). A language image should be listed first under the `docker` key in your configuration, making it the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

CircleCI is developing next-gen images for the languages below.

- Clojure
- [Elixir](https://circleci.com/developer/images/image/cimg/elixir)
- [Go (Golang)](https://circleci.com/developer/images/image/cimg/go)
- [Node.js](https://circleci.com/developer/images/image/cimg/node)
- [OpenJDK (Java)](https://circleci.com/developer/images/image/cimg/openjdk)
- [PHP](https://circleci.com/developer/images/image/cimg/php)
- [Python](https://circleci.com/developer/images/image/cimg/python)
- [Ruby](https://circleci.com/developer/images/image/cimg/ruby)
- [Rust](https://circleci.com/developer/images/image/cimg/rust)

If your language is not listed, feel free to request an image on our [Ideas Board](https://ideas.circleci.com/). First, check to see if that "idea" is already on CircleCI Ideas. If it is, up-vote it. If not, create it and set the category as "images". Finally, go and market your "idea" to friends, co-workers, forums, and other communities in order to help it build traction.

If we see an idea on the board take off, we'll consider building it officially.

#### Next-Gen Language Image Variants
{:.no_toc}

CircleCI maintains several variants for the next-gen language image. For next-gen images be sure to check each image listing for information on each variant. The `-browsers` variant for next-gen images is still in progress. See each image listing on the [Developer Hub](https://circleci.com/developer/images/) for details on which variants it supports.

### Service Images
{:.no_toc}

Service images are convenience images for services like databases. These images should be listed **after** language images so they become secondary service containers.

CircleCI maintains legacy images for the services below.

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### Service Image Variant
{:.no_toc}

CircleCI maintains only one variant for service images. To speed up builds using RAM volume, add the `-ram` suffix to the end of a service image tag.

For example, if you want the `circleci/postgres:9.5-postgis` image to use RAM volume, use the `circleci/postgres:9.5-postgis-ram` image.

### Next-Gen Service Images
{:.no_toc}

Circleci is working on adding next-gen service convenience images. Checkout CircleCI's [Developer Hub](https://circleci.com/developer/images/) for the latest available service images.

## Pre-installed Tools

All convenience images have been extended with additional tools, installed with `apt-get`:

- `bzip2`
- `ca-certificates`
- `curl`
- `git`
- `gnupg`
- `gzip`
- `locales`
- `mercurial` (legacy images only)
- `net-tools`
- `netcat`
- `openssh-client`
- `parallel`
- `sudo`
- `tar`
- `unzip`
- `wget`
- `xvfb` (legacy images only)
- `zip`

The specific version of a particular package that gets installed in a particular CircleCI image variant depends on the default version included in the package directory for the Linux distribution/version installed in that variant's base image. The legacy CircleCI convenience images are [Debian Jessie](https://packages.debian.org/jessie/)- or [Stretch](https://packages.debian.org/stretch/)-based images, however the next-gen images, `cimg`, extend the official [Ubuntu](https://packages.ubuntu.com) image. For details on individual variants of legacy CircleCI images, see the [circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) repository. For details on the next-gen images, see the [Developer Hub](https://circleci.com/developer/images/). Each image is tracked in its own repository.

The following packages are installed via `curl` or other means.

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## Out of Scope

1. 上記一覧に記載のないイメージは利用できません。 コンビニエンス イメージの提供プログラムが刷新されたため、現在のところ新しいイメージについての提案は受け付けていません。
2. 旧バージョンのソフトウェアは再作成されません。 アップストリーム イメージの特定のリリース (Node.js v8.1.0 など) 用のタグが作成されなくなったら、CircleCI でもイメージの作成を終了します。 つまり、そのイメージ (`npm` など) に含まれる他のツールも更新されなくなります。
3. プレビュー、ベータ版、リリース候補を指定するイメージ タグには対応していません。 利用できることもありますが、これらのタグが原因となってコンビニエンス イメージのビルド システムに問題が発生しやすくなります。 特定の言語の非安定版リリースが必要な場合は、[Orbs](https://circleci.com/ja/orbs/) またはカスタム Docker イメージからインストールすることをお勧めします。

## Latest Image Tags by Language

Below is a list of the latest **legacy** convenience images, sorted by language. For details about the contents of each image, refer to the [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles).

<div class="alert alert-warning" role="alert">
For a list of the latest next-gen convenience images and details about the content of each image, visit the <a href="https://circleci.com/developer/">Developer Hub.</a>
</div>

**Note:** Excluding [language image variants](#language-image-variants) and [the service image variant](#service-image-variant), **for legacy images** CircleCI does **not** control which tags are used. These tags are chosen and maintained by upstream projects. Do not assume that a given tag has the same meaning across images!

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

## See Also
{:.no_toc}

- See [Using Docker Authenticated Pulls]({{ site.baseurl }}/2.0/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.
- For information about macOS images for iOS, see ({{ site.baseurl }}/2.0/testing-ios/).
- See [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/) for information about how to build Docker images.