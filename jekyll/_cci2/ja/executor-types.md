---
layout: classic-docs
title: "Executor タイプを選択する"
short-title: "Executor タイプを選択する"
description: "Docker、Machine、および macOS Executor タイプの概要"
categories:
  - containerization
order: 10
---

[building-docker-images]: {{ site.baseurl }}/ja/2.0/building-docker-images/

以下のセクションに沿って、利用可能な Executor タイプ (`docker`、`machine`、`windows`、`macos`) について説明します。

* TOC
{:toc}

## 概要
{:.no_toc}

An *executor type* defines the underlying technology or environment in which to run a job. CircleCI では、以下の 4 つの環境のいずれかでジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

['.circleci/config.yml']({{ site.baseurl }}/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 An *image* is a packaged system that has the instructions for creating a running environment.  A *container* or *virtual machine* is the term used for a running instance of an image. たとえば以下のように、ジョブごとに Executor タイプとイメージを指定できます。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはオペレーティング システムの全体ではないので、通常はソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブは、Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (10.0.0 など) を使用します。

Linux 上でのソフトウェアのビルドに、コンテナの環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合にはどのような違いが現れるのでしょうか。下表に比較結果をまとめました。

| 仮想環境                                                                                  | `docker`         | `machine` |
| ------------------------------------------------------------------------------------- | ---------------- | --------- |
| 起動時間                                                                                  | 即時               | 30 ～ 60 秒 |
| クリーン環境                                                                                | ○                | ○         |
| カスタム イメージ                                                                             | ○                | ×         |
| Docker イメージのビルド                                                                       | ○ <sup>(1)</sup> | ○         |
| ジョブ環境の完全な制御                                                                           | ×                | ○         |
| 完全なルート アクセス                                                                           | ×                | ○         |
| 複数データベースの実行                                                                           | ○ <sup>(2)</sup> | ○         |
| 同じソフトウェアの複数バージョンの実行                                                                   | ×                | ○         |
| レイヤー キャッシュ                                                                            | ○                | ○         |
| 特権コンテナの実行                                                                             | ×                | ○         |
| Docker Compose とボリュームの使用                                                              | ×                | ○         |
| [構成可能なリソース (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | ○                | ○         |
{: class="table table-striped"}

<sup>(1)</sup> Requires using \[Remote Docker\]\[building-docker-images\].

<sup>(2)</sup> While you can run multiple databases with Docker, all images (primary and secondary) share the underlying resource limits. このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`xcode` では `macos` Executor タイプも使用できます。手順については、[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)を参照してください。

## Docker の使用

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。設定ファイルで最初にリストされているイメージがプライマリ コンテナ イメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、「[Docker の概要](https://docs.docker.com/engine/docker-overview/)」を確認してください。

Docker は、アプリケーションに必要なものだけをビルドすることで、パフォーマンスを向上させます。 Docker イメージは、すべてのステップが実行されるプライマリ コンテナを生成する [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルで指定してください。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

この例で、すべてのステップは、`build` ジョブの下に最初にリストされているイメージによって作成されるコンテナで実行されます。 スムーズに移行できるように、CircleCI は一般的な言語用のコンビニエンス イメージを Docker Hub で提供しています。 名前とタグの一覧は、「[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」で確認できます。 Docker をインストールし、Git を含む Docker イメージが必要な場合は、公式の [Docker イメージ](https://hub.docker.com/_/docker/)である `docker:stable-git` の使用を検討してください。

### Docker イメージのベスト プラクティス
{:.no_toc}

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。  CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- 実行中に追加ツールがインストールされるために実行時間が長くなる場合は、「[カスタム ビルドの Docker イメージの使用]({{ site.baseurl }}/2.0/custom-images/)」を参照してカスタム イメージを作成し、ジョブの要件に応じてコンテナに事前ロードされるツールを含めることをお勧めします。

Docker Executor の詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。

## Machine の使用

The `machine` option runs your jobs in a dedicated, ephemeral VM that has the following specifications:

| クラス            | vCPU | RAM    |
| -------------- | ---- | ------ |
| medium (デフォルト) | 2 基  | 7.5 GB |
| large          | 4 基  | 15 GB  |
{: class="table table-striped"}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフル アクセスでき、ユーザーはジョブ環境を完全に制御できます。 This control can be useful in situations where you need full access to the network stack, for example to listen on a network interface, or to modify the system with `sysctl` commands.

Using the `machine` executor also means that you get full access to the Docker process. This allows you to run privileged Docker containers and build new Docker images.

NOTE: you can run Docker containers using the docker executor, but the `machine` executor is currently the only supported way to build new Docker images on CircleCI.

**Note**: Using `machine` may require additional fees in a future pricing update.

To use the `machine` executor, set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) to `true` in `.circleci/config.yml`:

{:.tab.machineblock.Cloud}
```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01    # recommended linux image - includes Ubuntu 16.04, docker 18.09.3, docker-compose 1.23.1
```

{:.tab.machineblock.Server}
```yaml
version: 2
jobs:
  build:
    machine: true # uses default image
```

**Note:** The default image for the machine executor is `circleci/classic:latest`.  If you don't specify an image, jobs will run on the default image - which is currently circleci/classic:201710-01 but may change in future.

All images have common language tools preinstalled. Refer to the [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) for more information.

**Note:** The `image` key is not required on self-hosted installations of CircleCI Server (see example above) but if it is used, it should be set to: `image: default`.

The following example uses the default machine image and enables [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or Workflow. **Note:** You must open a support ticket to have a CircleCI Sales representative contact you about enabling this feature on your account for an additional fee.

```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # default - false
```

## macOS の使用

_Available on CircleCI Cloud - not currently available on self-hosted installations_

Using the `macos` executor allows you to run your job in a macOS environment on a VM. You can also specify which version of Xcode should be used. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list of version numbers and information about technical specifications for the VMs running each particular version of Xcode.

```yaml
jobs:
  build:
    macos:
      xcode: 11.3.0

    steps:
      # Commands will execute in macOS container
      # with Xcode 11.3 installed
      - run: xcodebuild -version
```

## Using the Windows Executor

Using the `windows` executor allows you to run your job in a Windows environment. The following is an example configuration that will run a simple Windows job. The syntax for using the Windows executor in your config differs depending on whether you are using:
* CircleCI Cloud – config version 2.1 – you will also need to [enable Pipelines]({{ site.baseurl }}/2.0/build-processing).
* Self-hosted installation of CircleCI Server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI Server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable Orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor: win/default # executor type

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Cloud users will notice the Windows Orb is used to set up the Windows executor to simplify the configuration. See [the Windows orb details page](https://circleci.com/orbs/registry/orb/circleci/windows) for more details.

CircleCI Server users should contact their system administrator for specific information about the image used for Windows jobs. The Windows image is configured by the system administrator, and in the CircleCI config is always available as the `windows-default` image name.

## 複数の Docker イメージの使用
It is possible to specify multiple images for your job. Specify multiple images if, for example, you need to use a database for your tests or for some other required service. **In a multi-image configuration job, all steps are executed in the container created by the first image listed**. All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

```yaml
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
      # command will execute in trusty container
      # and can access mongo on localhost
      - run: sleep 5 && nc -vz localhost 27017
```
Docker Images may be specified in three ways, by the image name and version tag on Docker Hub or by using the URL to an image in a registry:

### Docker Hub でパブリック コンビニエンス イメージを使用する
{:.no_toc}
  - `name:tag`
    - `circleci/node:7.10-jessie-browsers`
  - `name@digest`
    - `redis@sha256:34057dd7e135ca41...`

### Docker Hub でパブリック イメージを使用する
{:.no_toc}
  - `name:tag`
    - `alpine:3.4`
  - `name@digest`
    - `redis@sha256:54057dd7e125ca41...`

### パブリックの Docker Registry を使用する
{:.no_toc}
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and Docker Registry are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Using Private Images]({{ site.baseurl }}/2.0/private-images).

## Docker のメリットと制限事項
Docker also has built-in image caching and enables you to build, run, and publish Docker images via \[Remote Docker\]\[building-docker-images\]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:

- Your application is self-sufficient
- Your application requires additional services to be tested
- Your application is distributed as a Docker Image (requires using \[Remote Docker\]\[building-docker-images\])
- You want to use `docker-compose` (requires using \[Remote Docker\]\[building-docker-images\])

Choosing Docker limits your runs to what is possible from within a Docker container (including our \[Remote Docker\]\[building-docker-images\] feature). For instance, if you require low-level access to the network or need to mount external volumes consider using `machine`.

## 関連項目

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
