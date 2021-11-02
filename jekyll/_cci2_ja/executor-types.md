---
layout: classic-docs
title: "Executor タイプの選び方"
short-title: "Executor タイプの選び方"
description: "Docker や Machine などの Executor についての概要"
categories:
  - コンテナ化
order: 10
version:
  - Cloud
  - Server v2.x
---

[custom-images]: {{ site.baseurl }}/ja/2.0/custom-images/ [building-docker-images]: {{ site.baseurl }}/ja/2.0/building-docker-images/ [server-gpu]: {{ site.baseurl }}/ja/2.0/gpu/

以下のセクションに沿って、利用可能な Executor タイプ (`docker`、`machine`、`macos`、`windows`) について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

<div class="alert alert-warning" role="alert">
  <strong>プレフィックスが「 circleci / 」のレガシーイメージは、 2021 年 12 月 31 日に<a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">廃止</a></strong>されます。 ビルドを高速化するには、<a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/"> 次世代の CircleCI イメージ </a>を使ってプロジェクトをアップグレードしてください。
</div>

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境でジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

[".circleci/config.yml"]({{ site.baseurl }}/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。  *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 たとえば以下のように、ジョブごとに Executor タイプとイメージを指定できます。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[CircleCI イメージ]({{ site.baseurl }}/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはオペレーティング システムの全体ではないので、通常はソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブには、Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (10.0.0 など) を使用します。

## Docker を使用する
{: #using-docker }

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。 設定ファイルで最初にリストされているイメージがプライマリ コンテナ イメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、[Docker の概要](https://docs.docker.com/engine/docker-overview/)についてのドキュメントを確認してください。

Docker は、アプリケーションに必要なものだけをビルドすることで、パフォーマンスを向上させます。 Docker イメージは、すべてのステップが実行されるプライマリ コンテナを生成する [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルで指定します。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

この例で、すべてのステップは、`build` ジョブの下に最初にリストされているイメージによって作成されるコンテナで実行されます。 スムーズに移行できるように、CircleCI は一般的な言語用のコンビニエンス イメージを Docker Hub で提供しています。 名前とタグの一覧については、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。 Docker がインストールされ Git が含まれている Docker イメージが必要な場合は、公式の [Docker イメージ](https://hub.docker.com/_/docker/)である `docker:stable-git` の使用をお勧めします。

### Docker イメージのベスト プラクティス
{: #docker-image-best-practices }
{:.no_toc}

- レジストリ プロバイダーのレート制限によって問題が発生した場合は、[認証済みの Docker プルを使用する]({{ site.baseurl }}/2.0/private-images/)ことで解決できる可能性があります。

- CircleCI は Docker と連携して、ユーザーの皆さまが今後もレート制限なしで Docker Hub にアクセスできるようにしています。 2020 年 11 月 1 日時点では、いくつかの例外を除き、CircleCI を通じて Docker Hub からイメージをプルする際に、レート制限の影響を受けることはありません。 ただし、今後 CircleCI ユーザーにもレート制限が適用される可能性があります。 そのため、将来的にレート制限の影響を受けることのないよう、お使いの CircleCI 設定ファイルに [Docker Hub 認証を追加する]({{ site.baseurl }}/2.0/private-images/)と共に、必要に応じてご利用中の Docker Hub プランのアップグレードを検討することをお勧めします。

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。  CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- 実行中に追加ツールがインストールされるために実行時間が長くなる場合は、「[カスタム ビルドの Docker イメージの使用]({{ site.baseurl }}/2.0/custom-images/)」を参照してカスタム イメージを作成し、ジョブの要件に応じてコンテナに事前ロードされるツールを含めることをお勧めします。

- [AWS ECR]({{ site.baseurl }}/2.0/private-images/#aws-ecr) イメージを使用する場合は、`us-east-1` リージョンを使用することをお勧めします。 CircleCI のジョブ実行インフラストラクチャは `us-east-1` リージョンにあるので、同じリージョンにイメージを配置すると、イメージのダウンロードにかかる時間が短縮されます。

- プロジェクトをほとんどあるいはまったく変更していないのにパイプラインが失敗した場合は、Docker イメージが使用されているアップストリームで問題が生じていないか確認してみることをお勧めします。

Docker Executor の詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。

### 複数の Docker イメージを使用する
{: #using-multiple-docker-images }
ジョブには、複数のイメージを指定できます。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合には、複数イメージの指定が役に立ちます。 **複数のイメージを指定して構成されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。 すべてのコンテナは共通ネットワーク内で動作します。 また、公開されるポートはすべて、[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)から `localhost` で利用できます。

```yaml
jobs:
  build:
    docker:
    # すべてのステップが実行されるプライマリ コンテナ イメージ
     - image: buildpack-deps:trusty
    # 共通ネットワーク上のセカンダリ コンテナ イメージ
     - image: mongo:2.6.8-jessie
       command: [mongod, --smallfiles]

    working_directory: ~/

    steps:
      # コマンドは、信頼できるコンテナ内で実行され、
      # ローカルホスト上で mongo にアクセスできます
      - run: sleep 5 && nc -vz localhost 27017
```
Docker Images may be specified in three ways, by the image name and version tag on Docker Hub or by using the URL to an image in a registry:

#### Public convenience images on Docker Hub
{: #public-convenience-images-on-docker-hub }
{:.no_toc}
  - `name:tag`
    - `circleci/node:14.17-buster-browsers`
  - `name@digest`
    - `redis@sha256:34057dd7e135ca41...`

#### Docker Hub 上のパブリック イメージ
{: #public-images-on-docker-hub }
{:.no_toc}
  - `name:tag`
    - `alpine:3.4`
  - `name@digest`
    - `redis@sha256:54057dd7e125ca41...`

#### Public Docker registries
{: #public-docker-registries }
{:.no_toc}
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and Docker Registry are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Using Docker Authenticated Pulls]({{ site.baseurl }}/2.0/private-images/).

### RAM ディスク
{: #ram-disks }

A RAM disk is available at `/mnt/ramdisk` that offers a [temporary file storage paradigm](https://en.wikipedia.org/wiki/Tmpfs), similar to using `/dev/shm`. Using the RAM disk can help speed up your build, provided that the `resource_class` you are using has enough memory to fit the entire contents   of your project (all files checked out from git, dependencies, assets generated etc).

The simplest way to use this RAM disk is to configure the `working_directory` of a job to be `/mnt/ramdisk`:

```yaml
jobs:
  build:
    docker:
     - image: alpine

    working_directory: /mnt/ramdisk

    steps:
      - run: |
          echo '#!/bin/sh' > run.sh
          echo 'echo Hello world!' >> run.sh
          chmod +x run.sh
      - run: ./run.sh
```

### Docker のメリットと制限事項
{: #docker-benefits-and-limitations }
Docker also has built-in image caching and enables you to build, run, and publish Docker images via \[Remote Docker\]\[building-docker-images\]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:

- アプリケーションが自己完結型である
- アプリケーションの追加サービスをテストする必要がある
- Docker イメージとして開発しているアプリケーションである (\[リモート Docker\]\[building-docker-images\] の使用が必要)
- `docker-compose` を使用する (\[リモート Docker\]\[building-docker-images\] の使用が必要)

Choosing Docker limits your runs to what is possible from within a Docker container (including our \[Remote Docker\]\[building-docker-images\] feature). For instance, if you require low-level access to the network or need to mount external volumes consider using `machine`.

There are tradeoffs to using a `docker` image versus an Ubuntu-based `machine` image as the environment for the container, as follows:

| Capability                                                                                         | `docker`           | `machine` |
| -------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| Start time                                                                                         | Instant            | 30-60 sec |
| Clean environment                                                                                  | Yes                | Yes       |
| Custom images                                                                                      | Yes <sup>(1)</sup> | No        |
| Build Docker images                                                                                | Yes <sup>(2)</sup> | Yes       |
| Full control over job environment                                                                  | No                 | Yes       |
| Full root access                                                                                   | No                 | Yes       |
| Run multiple databases                                                                             | Yes <sup>(3)</sup> | Yes       |
| Run multiple versions of the same software                                                         | No                 | Yes       |
| [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/)                               | Yes                | Yes       |
| Run privileged containers                                                                          | No                 | Yes       |
| Use docker compose with volumes                                                                    | No                 | Yes       |
| [Configurable resources (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | Yes                | Yes       |
{: class="table table-striped"}

<sup>(1)</sup> See \[Using Custom Docker Images\]\[custom-images\].

<sup>(2)</sup> Requires using \[Remote Docker\]\[building-docker-images\].

<sup>(3)</sup> While you can run multiple databases with Docker, all images (primary and secondary) share the underlying resource limits. Performance in this regard will be dictated by the compute capacities of your container plan.

For more information on `machine`, see the next section below.


### 使用可能な Docker リソース クラス
{: #available-docker-resource-classes }

The [`resource_class`]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) key allows you to configure CPU and RAM resources for each job. In Docker, the following resources classes are available:

| Class                  | vCPUs | RAM  |
| ---------------------- | ----- | ---- |
| small                  | 1     | 2GB  |
| medium                 | 2     | 4GB  |
| medium+                | 3     | 6GB  |
| large                  | 4     | 8GB  |
| xlarge                 | 8     | 16GB |
| 2xlarge<sup>(2)</sup>  | 16    | 32GB |
| 2xlarge+<sup>(2)</sup> | 20    | 40GB |
{: class="table table-striped"}

<sup>(2)</sup> Requires using \[Remote Docker\]\[building-docker-images\].

Where example usage looks like the following:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    resource_class: xlarge
    steps:
    #  ...  other config
```

## Machine の使用
{: #using-machine }

The `machine` option runs your jobs in a dedicated, ephemeral VM that has the following specifications:

{% include snippets/machine-resource-table.md %}

Using the `machine` executor gives your application full access to OS resources and provides you with full control over the job environment. This control can be useful in situations where you need full access to the network stack, for example to listen on a network interface, or to modify the system with `sysctl` commands. To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/2.0/docker-to-machine) document.

Using the `machine` executor also means that you get full access to the Docker process. This allows you to run privileged Docker containers and build new Docker images.

**Note**: Using `machine` may require additional fees in a future pricing update.

To use the machine executor, set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) in `.circleci/config.yml`:

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-1604:202007-01
```

You can view the list of available images [here]({{ site.baseurl }}/2.0/configuration-reference/#available-machine-images).

The following example uses an image and enables [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or Workflow. **Note:** Check our [pricing page](https://circleci.com/pricing/) to see which plans include the use of Docker Layer Caching.

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine:
      docker_layer_caching: true    # デフォルトは false
```

**Note:** The `image` key is not supported on private installations of CircleCI. See the [VM Service documentation]({{ site.baseurl }}/2.0/vm-service) for more information.

The IP range `192.168.53.0/24` is reserved by CircleCI for the internal use on machine executor. This range should not be used in your jobs.

## macOS を使用する
{: #using-macos }

_Available on CircleCI Cloud - not currently available on self-hosted installations_

Using the `macos` executor allows you to run your job in a macOS environment on a VM. You can also specify which version of Xcode should be used. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list of version numbers and information about technical specifications for the VMs running each particular version of Xcode.

```yaml
jobs:
  build:
    macos:
      xcode: 11.3.0

    steps:
      # コマンドは、Xcode 11.3 がインストール済みの
      # macOS コンテナ内で実行されます
      - run: xcodebuild -version
```

## Windows Executor を使用する
{: #using-the-windows-executor }

Using the `windows` executor allows you to run your job in a Windows environment. The following is an example configuration that will run a simple Windows job. The syntax for using the Windows executor in your config differs depending on whether you are using:
* クラウド版 CircleCI のバージョン 2.1 の設定ファイル
* Self-hosted installation of CircleCI Server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI Server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@2.2.0 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

jobs:
  build: # ジョブの名前
    executor: win/default # Executor タイプ

    steps:
      # Windows 仮想マシン環境で実行するコマンド
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # ジョブの名前
    machine:
      image: windows-default # Windows マシン イメージ
    resource_class: windows.medium
    steps:
      # Windows 仮想マシン環境で実行するコマンド
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Cloud users will notice the Windows Orb is used to set up the Windows executor to simplify the configuration. See [the Windows orb details page](https://circleci.com/developer/orbs/orb/circleci/windows) for more details.

CircleCI Server users should contact their system administrator for specific information about the image used for Windows jobs. The Windows image is configured by the system administrator, and in the CircleCI config is always available as the `windows-default` image name.

## GPU を使用する
{: #using-gpus }

CircleCI Cloud has execution environments with Nvidia GPUs for specialized workloads. The hardware is Nvidia Tesla T4 Tensor Core GPU, and our GPU executors come in both Linux and Windows VMs.

{:.tab.gpublock.Linux}
```yaml
version: 2.1

jobs:
  build:
    machine:
      resource_class: gpu.nvidia.small
      image: ubuntu-1604-cuda-10.1:201909-23
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows}
```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

Customers using CircleCI server can configure their VM service to use GPU-enabled machine executors. See \[Running GPU Executors in Server\]\[server-gpu\].

## 関連項目
{: #see-also }

[Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/)
