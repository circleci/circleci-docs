---
layout: classic-docs
title: "Executor タイプを選択する"
short-title: "Executor タイプを選択する"
description: "Docker、Machine、および macOS Executor タイプの概要"
categories:
  - containerization
order: 10
version:
  - Cloud
  - Server v2.x
---

[building-docker-images]: {{ site.baseurl }}/ja/2.0/building-docker-images/

以下のセクションに沿って、利用可能な Executor タイプ (`docker`、`machine`、`windows`、`macos`) について説明します。

* 目次
{:toc}

## 概要
○
{:.no_toc}

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境のいずれかでジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

['.circleci/config.yml']({{ site.baseurl }}/ja/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。  *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 たとえば以下のように、ジョブごとに Executor タイプとイメージを指定できます。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはオペレーティング システムの全体ではないので、通常はソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブは、Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (10.0.0 など) を使用します。

## Docker の使用
○ <sup>(1)</sup>

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。 設定ファイルで最初にリストされているイメージがプライマリ コンテナ イメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、「[Docker の概要](https://docs.docker.com/engine/docker-overview/)」を確認してください。

Docker は、アプリケーションに必要なものだけをビルドすることで、パフォーマンスを向上させます。 Docker イメージは、すべてのステップが実行されるプライマリ コンテナを生成する [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで指定してください。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

この例で、すべてのステップは、`build` ジョブの下に最初にリストされているイメージによって作成されるコンテナで実行されます。 スムーズに移行できるように、CircleCI は一般的な言語用のコンビニエンス イメージを Docker Hub で提供しています。 名前とタグの一覧は、「[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」で確認できます。 Docker をインストールし、Git を含む Docker イメージが必要な場合は、公式の [Docker イメージ](https://hub.docker.com/_/docker/)である `docker:stable-git` の使用を検討してください。

### Docker イメージのベスト プラクティス
{: #docker-image-best-practices }
{:.no_toc}

- If you encounter problems with rate limits imposed by your registry provider, using [authenticated docker pulls]({{ site.baseurl }}/2.0/private-images/) may grant higher limits.

- CircleCI has partnered with Docker to ensure that our users can continue to access Docker Hub without rate limits. As of November 1st 2020, with few exceptions, you should not be impacted by any rate limits when pulling images from Docker Hub through CircleCI. However, these rate limits may go into effect for CircleCI users in the future. That’s why we’re encouraging you and your team to [add Docker Hub authentication]({{ site.baseurl }}/2.0/private-images/) to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。  CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- 実行中に追加ツールがインストールされるために実行時間が長くなる場合は、「[カスタム ビルドの Docker イメージの使用]({{ site.baseurl }}/ja/2.0/custom-images/)」を参照してカスタム イメージを作成し、ジョブの要件に応じてコンテナに事前ロードされるツールを含めることをお勧めします。

- When you use [AWS ECR]({{ site.baseurl }}/2.0/private-images/#aws-ecr) images, it is best practice to use `us-east-1` region. Our job execution infrastructure is in `us-east-1` region, so having your image on the same region reduces the image download time.

- In the event that your pipelines are failing despite there being little to no changes in your project, you may need to investigate upstream issues with docker images being used.

`machine` Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#machine)を `true` に設定します。

### Docker Hub でパブリック コンビニエンス イメージを使用する
Docker Executor の詳細については、「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」を参照してください。
ジョブには、複数のイメージを指定できます。 たとえば、テストやその他の必要なサービスでデータベースを使用する必要がある場合は、複数のイメージを指定します。 **複数のイメージを指定して構成されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます。 また、公開されるポートはすべて、[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)から `localhost` で利用できます。</p>

```yaml
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: buildpack-deps:trusty
    # Secondary container image on common network.
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

#### Docker イメージのビルド
<sup>(1)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。
{:.no_toc}
  - `name:tag`
    - `circleci/node:7.10-jessie-browsers`
  - `name@digest`
    - `redis@sha256:34057dd7e135ca41...`

#### Public images on Docker Hub
メモ: Docker コンテナを実行するためには docker Executor を使用できますが、現在 CircleCI で新しい Docker イメージをビルドするには `machine` Executor の使用のみがサポートされています。
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

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker Registry 上のほぼすべてのパブリック イメージがサポートされます。 プライベートのイメージまたはレジストリを操作する場合は、[プライベート イメージの使用に関するドキュメント]({{ site.baseurl }}/ja/2.0/private-images)を参照してください。

### Docker Hub でパブリック イメージを使用する
**メモ:** オンプレミス版の CircleCI Server では `image` キーは必須ではありませんが (上の例を参照)、使用する場合は `image: default` に設定する必要があります。

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

### パブリックの Docker Registry を使用する
{: #docker-benefits-and-limitations }
Docker には、イメージ キャッシュ機能が組み込まれており、\[リモート Docker\]\[building-docker-images\] を介して Docker イメージをビルド、実行、およびパブリッシュできます。 アプリケーションの要件も併せて検討してください。 以下の事項に当てはまるアプリケーションには、Docker が最適です。

- Your application is self-sufficient
- Your application requires additional services to be tested
- アプリケーションが Docker イメージとして配布される (\[リモート Docker\]\[building-docker-images\] の使用が必要)
- `docker-compose` を使用する (\[リモート Docker\]\[building-docker-images\] の使用が必要)

Docker を選択すると、実行できるのは Docker コンテナ内から利用可能な機能 (\[リモート Docker\]\[building-docker-images\] の機能を含む) に制限されます。 たとえば、ネットワークへの低レベル アクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

Linux 上でのソフトウェアのビルドに、コンテナの環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合にはどのような違いが現れるのでしょうか。

| Capability                                                                            | `docker`           | `machine` |
| ------------------------------------------------------------------------------------- | ------------------ | --------- |
| 起動時間                                                                                  | 即時                 | 30 ～ 60 秒 |
| クリーン環境                                                                                | Yes                | Yes       |
| カスタム イメージ                                                                             | ○ <sup>(2)</sup>   | No        |
| Build Docker images                                                                   | Yes <sup>(2)</sup> | Yes       |
| ジョブ環境の完全な制御                                                                           | No                 | Yes       |
| 完全なルート アクセス                                                                           | No                 | Yes       |
| 複数データベースの実行                                                                           | Yes <sup>(3)</sup> | Yes       |
| 同じソフトウェアの複数バージョンの実行                                                                   | No                 | Yes       |
| [レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)                            | Yes                | Yes       |
| 特権コンテナの実行                                                                             | No                 | Yes       |
| Docker Compose とボリュームの使用                                                              | No                 | Yes       |
| [構成可能なリソース (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | Yes                | Yes       |
{: class="table table-striped"}

<sup>(1)</sup> See \[Using Custom Docker Images\]\[custom-images\].

Docker イメージは、Docker Hub でイメージ名とバージョン タグを使用するか、レジストリ内のイメージへの URL を使用して、以下の 3 つの方法で指定できます。

<sup>(2)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

For more information on `machine`, see the next section below.


### Available Docker resource classes
{{ site.baseurl }}/ja/2.0/configuration-reference/#resource_class

The [`resource_class`]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) key allows you to configure CPU and RAM resources for each job. In Docker, the following resources classes are available:

| クラス                    | vCPU | RAM    |
| ---------------------- | ---- | ------ |
| small                  | 2 基  | 2GB    |
| medium (デフォルト)         | 4 基  | 4GB    |
| medium+                | 3    | 6GB    |
| large                  | 4    | 7.5 GB |
| ×                      | 8    | 16GB   |
| 2xlarge<sup>(2)</sup>  | 15   | 32GB   |
| 2xlarge+<sup>(2)</sup> | 20   | 40GB   |
{: class="table table-striped"}

<sup>(2)</sup> Requires using \[Remote Docker\]\[building-docker-images\].

Where example usage looks like the following:

```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # デフォルトは false
```

## Machine の使用
○

`machine` オプションは、以下のような仕様を持つ専用のエフェメラル VM でジョブを実行します。

{% include snippets/machine-resource-table.md %}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフル アクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、(ネットワーク インターフェイスのリッスンなどの目的で) ネットワーク スタックへのフル アクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。 To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/2.0/docker-to-machine) document.

`machine` Executor を使用すると、Docker プロセスにもフル アクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

**メモ:** 将来の料金改定で `machine` の使用に追加料金が必要になる可能性があります。

{{ site.baseurl }}/ja/2.0/configuration-reference/

{:.tab.machineblock.Cloud}
```yaml
jobs:
  build:
    macos:
      xcode: 11.3.0

    steps:
      # コマンドは、インストールされている Xcode 11.3 を
      # 使用して、macOS コンテナ内で実行されます

      - run: xcodebuild -version
```

You can view the list of available images [here]({{ site.baseurl }}/2.0/configuration-reference/#available-machine-images).

以下の例では、デフォルトの machine イメージを使用し、[Docker レイヤー キャッシュ (DLC)]({{ site.baseurl }}/ja/2.0/docker-layer-caching) を有効化しています。 DLC は、ジョブまたはワークフロー中に Docker イメージをビルドする場合に便利な機能です。 **Note:** Check our [pricing page](https://circleci.com/pricing/) to see which plans include the use of Docker Layer Caching.

{:.tab.machineblock.Server}
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

**Note:** The `image` key is not supported on private installations of CircleCI. See the [VM Service documentation]({{ site.baseurl }}/2.0/vm-service) for more information.

## macOS の使用
{: #using-macos }

_クラウド版 CircleCI で利用可能です。_

`macos` Executor を使用すると、VM 上の macOS 環境でジョブを実行できます。 また、使用する Xcode のバージョンも指定できます。 Xcode の特定のバージョンを実行する VM のバージョン番号と技術仕様に関する一覧については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

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

## Windows Executor の使用
{: #using-the-windows-executor }

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。
* アプリケーションが自己完結型である
* アプリケーションの追加サービスをテストする必要がある

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
  build:
    machine: true # デフォルトのイメージを使用します
```

クラウド版の例では、Windows Executor のセットアップに Windows Orb を使用することで、構成を簡素化しています。 詳細については、[Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。

CircleCI Server を使用している場合、Windows ジョブに使用しているイメージに関する詳細情報については、システム管理者にお問い合わせください。 Windows イメージはシステム管理者によって構成され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。

## 複数の Docker イメージの使用
○

CircleCI Cloud has execution environments with Nvidia GPUs for specialized workloads. The hardware is Nvidia Tesla T4 Tensor Core GPU, and our GPU executors come in both Linux and Windows VMs.

{:.tab.gpublock.Linux}
```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01    # 推奨 Linux イメージ - Ubuntu 16.04、docker 18.09.3、docker-compose 1.23.1 が含まれます
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

## Docker のメリットと制限事項
○

[Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/)
