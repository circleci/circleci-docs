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
  - Server v3.x
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
  <strong>プレフィックスが「 circleci/ 」のレガシーイメージは、 2021 年 12 月 31 日に<a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">廃止</a></strong>されます。 ビルドを高速化するには、<a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/"> 次世代の CircleCI イメージ </a>を使ってプロジェクトをアップグレードしてください。
</div>

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境でジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

[.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。 *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 以下に例を示します。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[プレビルドされた CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはフルオペレーティングシステムではないため、多くの場合ソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブには、[利用可能なマシンイメージのリスト]({{site.baseurl}}/2.0/configuration-reference/#available-machine-images)に記載されている Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (12.5.1 など) を使用します。

## Docker を使用する
{: #using-docker }

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。設定ファイルで最初にリストされているイメージがプライマリコンテナイメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、[Docker の概要](https://docs.docker.com/engine/docker-overview/)についてのドキュメントを確認してください。

Docker は、アプリケーションに必要なものだけをビルドすることで、パフォーマンスを向上させます。 Docker イメージは、すべてのステップが実行されるプライマリコンテナを生成する [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルで指定します。

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:lts
```

この例では、すべてのステップは、`build` ジョブの下に最初にリストされているイメージによって作成されるコンテナで実行されます。

スムーズに移行できるように、CircleCI は一般的な言語用の CircleCI イメージを Docker Hub で提供しています。 名前とタグの一覧は、「[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」で確認できます。 If you need a Docker image that installs Docker and has Git, consider using `cimg/base:current`.

### Docker イメージのベストプラクティス
{: #docker-image-best-practices }
{:.no_toc}

- レジストリ プロバイダーのレート制限によって問題が発生した場合は、[認証済みの Docker プルを使用する]({{ site.baseurl }}/2.0/private-images/)ことで解決できる可能性があります。

- CircleCI は Docker と連携して、ユーザーの皆さまが今後もレート制限なしで Docker Hub にアクセスできるようにしています。 2020 年 11 月 1 日時点では、いくつかの例外を除き、CircleCI を通じて Docker Hub からイメージをプルする際に、レート制限の影響を受けることはありません。 ただし、今後 CircleCI ユーザーにもレート制限が適用される可能性があります。 We encourage you to [add Docker Hub authentication]({{ site.baseurl }}/2.0/private-images/) to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。  CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- If you experience increases in your run times due to installing additional tools during execution, consider creating and using a custom-built image that comes with those tools pre-installed. See the [Using Custom-Built Docker Images]({{site.baseurl}}/2.0/custom-images/) page for more information.

- [AWS ECR]({{ site.baseurl }}/2.0/private-images/#aws-ecr) イメージを使用する場合は、`us-east-1` リージョンを使用することをお勧めします。 CircleCI のジョブ実行インフラストラクチャは `us-east-1` リージョンにあるので、同じリージョンにイメージを配置すると、イメージのダウンロードにかかる時間が短縮されます。

- In the event that your pipelines are failing despite there being little to no changes in your project, you may need to investigate upstream issues with the Docker images being used.

More details on the Docker executor are available in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

### 複数の Docker イメージを使用する
{: #using-multiple-docker-images }

ジョブのなかでは複数のイメージを指定することが可能です。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合に、複数イメージの指定が役に立ちます。 **複数のイメージを指定して設定されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。 全てのコンテナが共通ネットワーク上で実行され、開放されるポートはいずれも[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)の`ローカルホスト`上で利用できます。

```yaml
jobs:
  build:
    docker:
    # すべてのステップが実行されるプライマリ コンテナ イメージ
     - image: cimg/base:current
    # Secondary container image on common network.
     - image: cimg/mariadb:10.6
       command: [mongod, --smallfiles]

    steps:
      # command will execute in an Ubuntu-based container
      # and can access MariaDB on localhost
      - run: sleep 5 && nc -vz localhost 3306
```
Docker images may be specified in a few ways:

- By the image name and version tag on Docker Hub, or
- By using the URL to an image in a registry.

The following examples show how you can use public images from various sources:

#### CircleCI's public convenience images on Docker Hub
{: #public-convenience-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `cimg/node:14.17-browsers`
  - `name@digest`
    - `cimg/node@sha256:aa6d08a04d13dd8a...`

#### Docker Hub 上のパブリック イメージ
{: #public-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `alpine:3.13`
  - `name@digest`
    - `alpine@sha256:e15947432b813e8f...`

#### Public images on Docker registries
{: #public-docker-registries }
{:.no_toc}

  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and other Docker registries are supported by default when you specify the `docker:` key in your `config.yml` file. プライベートのイメージまたはレジストリを操作する場合は、[Docker の認証付きプルの使用]({{ site.baseurl }}/2.0/private-images/)」を参照してください。

### RAM ディスク
{: #ram-disks }

RAM ディスクは `/mnt/ramdisk` に配置され、`/dev/shm` を使用する場合と同様に[一時ファイルの格納パラダイム](https://ja.wikipedia.org/wiki/Tmpfs)を利用できます。 使用する `resource_class` でプロジェクトのコンテンツすべて (Git からチェックアウトされたすべてのファイル、依存関係、生成されたアセットなど) をまかなえるだけのメモリを確保できている場合、RAM ディスクを使用することでビルドを高速化できます。

RAM ディスクの最もシンプルな使用方法は、ジョブの `working_directory` を `/mnt/ramdisk` に設定することです。

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

Docker にはもともとイメージのキャッシュ機能があり、\[リモート Docker\]\[building-docker-images\] を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うと良いでしょう。

- 自己完結型のアプリケーションである.
- テストのために他のサービスが必要なアプリケーションである.
- Your application is distributed as a Docker image (requires using \[Remote Docker\]\[building-docker-images\]).
- `docker-compose` を使用する (\[リモート Docker\]\[building-docker-images\] の使用が必要).

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります (CircleCI における \[リモート Docker\]\[building-docker-images\] の機能も同様です)。 For instance, if you require low-level access to the network or need to mount external volumes, consider using `machine`.

コンテナ環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合では、下表のような違いがあります。

| 機能                                                                                    | `docker`         | `machine` |
| ------------------------------------------------------------------------------------- | ---------------- | --------- |
| 起動時間                                                                                  | 即時               | 30 ～ 60 秒 |
| クリーン環境                                                                                | はい               | はい        |
| カスタム イメージ                                                                             | ○ <sup>(1)</sup> | いいえ       |
| Docker イメージのビルド                                                                       | ○ <sup>(2)</sup> | はい        |
| ジョブ環境の完全な制御                                                                           | いいえ              | はい        |
| 完全なルート アクセス                                                                           | いいえ              | はい        |
| 複数データベースの実行                                                                           | ○<sup>(3)</sup>  | はい        |
| 同じソフトウェアの複数バージョンの実行                                                                   | いいえ              | はい        |
| [Docker レイヤーキャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)                      | はい               | はい        |
| 特権コンテナの実行                                                                             | いいえ              | はい        |
| Docker Compose とボリュームの使用                                                              | いいえ              | はい        |
| [構成可能なリソース (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | はい               | はい        |
{: class="table table-striped"}

<sup>(1)</sup> \[カスタム Docker イメージの使用\]\[custom-images\] を参照してください。

<sup>(2)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。

<sup>(3)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`machine` の詳細については、次のセクションを参照してください。

### Caching Docker images
{: #caching-docker-images }

This section discusses caching the Docker images used to spin up a Docker execution environment. It does not apply to [Docker layer caching]({{site.baseurl}}/2.0/docker-layer-caching), which is a feature used to speed up building new Docker images in your projects.
{: class="alert alert-info" }


The time it takes to spin up a Docker container to run a job can vary based on several different factors, such as the size of the image and if some, or all, of the layers are already cached on the underlying Docker host machine.

If you are using a more popular image, such as CircleCI convenience images, then cache hits are more likely for a larger number of layers. Most of the popular CircleCI images use the same base image. The majority of the base layers are the same between images, so you have a greater chance of having a cache hit.

The environment has to spin up for every new job, regardless of whether it is in the same workflow or if it is a re-run/subsequent run. (CircleCI never reuses containers, for security reasons.) Once the job is finished, the container is destroyed. There is no guarantee that jobs, even in the same workflow, will run on the same Docker host machine. This implies that the cache status may differ.

In all cases, cache hits are not guaranteed, but are a bonus convenience when available. With this in mind, a worst-case scenario of a full image pull should be accounted for in all jobs.

In summary, the availability of caching is not something that can be controlled via settings or configuration, but by choosing a popular image, such as [CircleCI convenience images](https://circleci.com/developer/images), you will have more chances of hitting cached layers in the "Spin Up Environment" step.

### 使用可能な Docker リソース クラス
{: #available-docker-resource-classes }

[`resource_class`]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) キーを使用すると、ジョブごとに CPU と RAM のリソース量を設定できます。 Docker では、次のリソース クラスを使用できます。

| クラス      | vCPU | RAM   |
| -------- | ---- | ----- |
| small    | 1    | 2 GB  |
| medium   | 2    | 4 GB  |
| medium+  | 3    | 6 GB  |
| large    | 4    | 8 GB  |
| xlarge   | 8    | 16 GB |
| 2xlarge  | 16   | 32GB  |
| 2xlarge+ | 20   | 40 GB |
{: class="table table-striped"}

たとえば次のように設定します。

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:current
    resource_class: xlarge
    steps:
    #  ...  other config
```

## マシンの使用
{: #using-machine }
Ubuntu 14.04 and 16.04 machine images [are deprecated and will be removed permanently May 31, 2022](https://circleci.com/blog/ubuntu-14-16-image-deprecation/). These images will be temporarily unavailable March 29 and April 26, 2022. Migrate from [14.04]({{ site.baseurl }}/2.0/images/linux-vm/14.04-to-20.04-migration/) or [16.04]({{ site.baseurl }}/2.0/images/linux-vm/16.04-to-20.04-migration/).
{: class="alert alert-warning"}

`machine` オプションは、以下のような仕様を持つ専用のエフェメラル VM でジョブを実行します。

{% include snippets/ja/machine-resource-table.md %}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフル アクセスでき、ユーザーはジョブ環境を完全に制御できます。 This control can be useful in situations where you need full access to the network stack; for example, to listen on a network interface, or to modify the system with `sysctl` commands. プロジェクトで使用する Executor を Docker から `machine` に移行する方法については、[Docker Executor から Machine Executor への移行]({{ site.baseurl }}/2.0/docker-to-machine)」を参照してください。

`machine` Executor を使用すると、Docker プロセスにもフル アクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

Machine Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/2.0/configuration-reference/#machine)を設定します。

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine: true
```

使用可能なイメージの一覧は[こちら]({{ site.baseurl }}/2.0/configuration-reference/#available-machine-images)で確認できます。

The following example uses an image and enables [Docker layer caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or workflow.

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

The IP range `192.168.53.0/24` is reserved by CircleCI for internal use on the machine executor. この範囲はジョブ内でご使用にならないでください。

## macOS を使用する
{: #using-macos }

`macos` Executor を使うと VM 上に macOS 環境を構築し、そのなかでジョブを実行できるようになります。 In macOS, the following resources classes are available:

| クラス                                | vCPU         | RAM   |
| ---------------------------------- | ------------ | ----- |
| medium                             | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2              | 4 @ 3.2 GHz  | 8 GB  |
| large                              | 8 @ 2.7 GHz  | 16 GB |
| macos.x86.metal.gen1<sup>(1)</sup> | 12 @ 3.2 GHz | 32GB  |
{: class="table table-striped"}

このとき、どのバージョンの Xcode を使うか指定することもできます。 Xcode の特定のバージョンを実行する VM のバージョン番号と技術仕様に関する一覧については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # コマンドは、インストールされている Xcode 11.3 を
      # 使用して、macOS コンテナ内で実行されます
      - run: xcodebuild -version
```

<sup>(1)</sup> _このリソースは、最低 24 時間のリースが必要です。 このリソースクラスの詳細は、[macOS の専有ホスト]({{ site.baseurl }}/2.0/dedicated-hosts-macos)を参照して下さい。</p>

## Windows Executor を使用する
{: #using-the-windows-executor }

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。
* クラウド版 CircleCI のバージョン 2.1 の設定ファイル
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

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
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Cloud users will notice the Windows orb is used to set up the Windows executor to simplify the configuration. 詳細については、[Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。

CircleCI server users should contact their system administrator for specific information about the image used for Windows jobs. Windows イメージはシステム管理者によって構成され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。

## GPU を使用する
{: #using-gpus }

クラウド版 CircleCI には、特別なワークロード用に Nvidia GPU を備えた実行環境が用意されています。 ハードウェアは Nvidia Tesla T4 Tensor Core GPU であり、Linux VM と Windows VM の Executor で使用できます。

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

CircleCI Server では、VM サービスを設定することで GPU 対応の Machine Executor を使用できます。 \[CircleCI Server での GPU Executor の実行方法に関するドキュメント\]\[server-gpu\].を参照してください。

## 関連項目
{: #see-also }

[設定に関するリファレンス]({{ site.baseurl }}/2.0/configuration-reference/)
