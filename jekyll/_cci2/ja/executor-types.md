---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Choosing an Executor Type"
description: "Overviews of the docker, machine, and executor types"
categories:
  - containerization
order: 10
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

This document describes the `docker`, `machine`, and `macos` environments in the following sections:

- TOC {:toc}

## Overview

{:.no_toc}

CircleCI は下記 3 種類の実行環境のいずれかでジョブを実行できます。

- Docker イメージ（`docker`）
- Linux 仮想環境（VM）イメージ（`machine`）
- macOS 仮想環境（VM)イメージ（`macos`）

Linux 環境のイメージでビルドする場合、`docker` と `machine` のどちらを使うかで下記のようなメリット・デメリットがあります。

Virtual Environment | `docker` | `machine` \---\---\----|\---\---\----|\---\---\---- Start time | Instant | 30-60 sec Clean environment | Yes | Yes Custom images | Yes | No Build Docker images | Yes <sup>(1)</sup> | Yes Full control over job environment | No | Yes Full root access | No | Yes Run multiple databases | No | Yes Run multiple versions of the same software | No | Yes Layer caching | Yes | Yes Run privileged containers | No | Yes Use docker compose with volumes | No | Yes [Configurable resources (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | Yes | No {: class="table table-striped"}

<sup>(1)</sup> Requires using \[Remote Docker\]\[building-docker-images\].

It is also possible to use the `macos` executor type with `xcode`, see the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) to get started.

## docker を使用する

The `docker` key defines Docker as the underlying technology to run your jobs using Docker Containers. Containers are an instance of the Docker Image you specify and the first image listed in your configuration is the primary container image in which all steps run. If you are new to Docker, see the [Docker Overview documentation](https://docs.docker.com/engine/docker-overview/) for concepts.

Docker increases performance by building only what is required for your application. 各ステップを実行するプライマリコンテナ生成用の [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) で Docker イメージを指定してください。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

In this example, all steps run in the container created by the first image listed under the `build` job. To make the transition easy, CircleCI maintains convenience images on Docker Hub for popular languages. See [Using Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) for the complete list of names and tags. If you need a Docker image that installs Docker and has Git, consider using `docker:stable-git`, which is an offical [Docker image](https://hub.docker.com/_/docker/).

### Docker イメージ活用のヒント

{:.no_toc}

- `config.yml` のなかでは、イメージのバージョンを示す `latest` や `1` といった、いずれ変わる可能性の高いタグはできるだけ使わないでください。 例で示している通り、`redis:3.2.7` や `redis@sha256:95f0c9434f37db0a4f...` のように正確にバージョンとハッシュ値を使うのが適切です。 指し示すものが変わりやすいタグは、ジョブの実行環境において予想できない結果になる場合があります。 そういった変化しやすいタグがそのイメージの最新版を指し示すかどうかについて、CircleCI は検知できません。 `alpine:latest` と指定すると、1カ月前の古いキャッシュを取得することもありえます。

- 実行時にツール類をインストールしたことでビルドに時間がかかったように感じるなら、[カスタム Docker イメージのビルド]({{ site.baseurl }}/2.0/custom-images/)ページを参考にしてください。ジョブに必要なツールをコンテナにプリロードするカスタムイメージの作成方法を説明しています。

Docker Executor のより詳細な解説は [CircleCI の設定]({{ site.baseurl }}/2.0/configuration-reference/)をご覧ください。

## Using Machine

`machine` を指定すると、下記のようなマシンスペックの一時 VM 環境を使ってジョブを実行します。

CPU数 | プロセッサ名 | メモリ | HDD \-----|\---\---\---\---\---\---\---\---\---|\---\---\---\--- 2 | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB {: class="table table-striped"}

<0>machine</0> Executor を使うと、OS のリソースにフルアクセスできるアプリケーションを開発でき、ジョブ環境全体の制御も可能にします。 これは、例えば `ping` やカーネルの変更に用いる `sysctl` コマンドを使うような場面で有用です。

`machine` Executor はさらに、Ruby や PHP といったプログラミング言語の追加パッケージのダウンロードなしに、Docker イメージをビルドできるようにします。

**※**`machine` を使ったプロジェクトは CircleCI の将来的なアップデートで別途追加料金が必要になる可能性があります。

マシン Executor を使うには、下記の通り `.circleci/config.yml` 内で [`machine` キー]({{ site.baseurl }}/2.0/configuration-reference/#machine)を `true` にします。

```yaml
version: 2
jobs:
  build:
    machine: true
```

machine Executor のデフォルトイメージは `circleci/classic:latest` となっています。`image` キーではこれ以外のイメージも指定できます。

**※**`image` キーはプライベートサーバー環境にインストールした CircleCI では利用できません。 詳しくは [VM サービス]({{ site.baseurl }}/2.0/vm-service)ページをご覧ください。

```yaml
version: 2
jobs:
  build:
    machine:
      image: circleci/classic:2017-01  # YYYY-MM 形式で指定したバージョンのイメージに固定します
```

利用できる `image` キーは下記の通り 3 種類あります。

- `circleci/classic:latest`：CircleCI におけるデフォルトのイメージです。このイメージに更新がある時は 1 週間前に告知されます。
- `circleci/classic:edge`：最新版のイメージを利用できますが、事前の告知なしに更新されます。
- `circleci/classic:{YYYY-MM}`：指定したバージョンに固定して、意図しないイメージの変更を防ぐことができます。

すべてのイメージには一般的なプログラミング言語やツール類がプリインストールされています。 詳しくは [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) をご覧ください。

下記は、デフォルトのマシンイメージを使用し、ジョブや Workflow で Docker イメージをビルドする際に効果的な [Docker レイヤーキャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching)（DLC）を有効にした例です。 **※**Docker レイヤーキャッシュの利用には追加の料金がかかり、この機能を有効にするためにサポートチケットを使って CircleCI のセールスチームに問い合わせる必要があります。

```yaml
version: 2
jobs:
  build:
    machine:
      docker_layer_caching: true    # default - false
```

## Using macOS

`macos` Executor を使うと VM 上に macOS 環境を構築し、そのなかでジョブを実行できるようになります。 このとき、どのバージョンの Xcode を使うか指定することもできます。 利用可能なバージョンについては、「iOS アプリのテスト方法」内の[サポートしている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions)を参照してください。 各バージョンの Xcode が動作している VM のマシンスペック（CPU、メモリサイズ、HDD容量など）に関する詳細は、同ページの「インストール済みソフト」のリンク先で確認できます。

    jobs:
      build:
        macos:
          xcode: "9.0"
    
        steps:
          # Commands will execute in macOS container
          # with Xcode 9.0 installed
          - run: xcodebuild -version
    

## 複数の Docker イメージを使用する

ジョブのなかでは複数のイメージを指定することが可能です。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合に、複数イメージの指定が役に立ちます。 **複数のイメージを設定しているジョブでは、リストで最初に指定したイメージのコンテナが全てのステップを実行する、ということを覚えておいてください。** 全てのコンテナが共通ネットワーク上で実行され、開放されるポートはいずれも[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)の`ローカルホスト`上で利用できます。

    jobs:
      build:
        docker:
        # Primary container image where all steps run.
         - image: buildpack-deps:trusty
        # Secondary container image on common network. 
         - image: mongo:2.6.8-jessie
           command: [mongod, --smallfiles]
    
        working_directory: ~/
    
        steps:
          # コマンドは信頼されたコンテナ上で実行され
          # ローカルホストの mongo にアクセスできます
          - run: sleep 5 && nc -vz localhost 27017
    

Docker イメージの指定方法は 3 パターンあります。イメージ名を指定する方法、Docker Hub 上のバージョンタグを指定する方法、レジストリにあるイメージの URL を指定する方法です。

### Public Convenience Images on Docker Hub

{:.no_toc} - `name:tag` - `circleci/node:7.10-jessie-browsers` - `name@digest` - `redis@sha256:34057dd7e135ca41...`

### Public Images on Docker Hub

{:.no_toc} - `name:tag` - `alpine:3.4` - `name@digest` - `redis@sha256:54057dd7e125ca41...`

### Public Docker Registries

{:.no_toc} - `image_full_url:tag` - `gcr.io/google-containers/busybox:1.24` - `image_full_url@digest` - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Docker Hub と Docker レジストリにある公開イメージの多くは、`config.yml` 内の `docker:` キーで指定してすぐに利用できます。 独自のプライベートなイメージ・レジストリを動かしたいときは、[プライベートイメージの使い方]({{ site.baseurl }}/2.0/private-images) を参照してください。

## Docker のメリットと制限

Docker にはもともとイメージのキャッシュ機能があり、\[リモート Docker\]\[building-docker-images\] を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うのがベターと言えます。

- 自己完結型のアプリケーションである
- テストのために他のサービスが必要なアプリケーションである
- Docker イメージとして開発しているアプリケーションである（要\[リモート Docker\]\[building-docker-images\]）
- `docker-compose` を使いたい（要\[リモート Docker\]\[building-docker-images\]）

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります（CircleCI における \[リモート Docker\]\[building-docker-images\] の機能も同様です）。 そのため、ネットワークへの低レベルアクセスや外部ストレージのマウントといった機能が必要な場合は、`docker` ではなく `machine` を使うことも検討してください。

## その他の参考資料

[CircleCI の設定]({{ site.baseurl }}/2.0/configuration-reference/)