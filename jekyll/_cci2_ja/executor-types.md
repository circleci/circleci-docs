---
layout: classic-docs
title: "Executor タイプの選び方"
short-title: "Executor タイプの選び方"
description: "docker や machine などの Executor についての概要"
categories:
  - コンテナ化
order: 10
version:
  - Cloud
  - Server v2.x
---

[custom-images]: {{ site.baseurl }}/2.0/custom-images/ [building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/ [server-gpu]: {{ site.baseurl }}/2.0/gpu/

以下のセクションに沿って、利用可能な Executor タイプ (`docker`、`machine`、`macos`、`windows`) について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境でジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

[".circleci/config.yml"]({{ site.baseurl }}/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。  *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 たとえば以下のように、ジョブごとに Executor タイプとイメージを指定できます。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはオペレーティング システムの全体ではないので、通常はソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブには、Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (10.0.0 など) を使用します。

## Docker を使用する
{: #using-docker }

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。設定ファイルで最初にリストされているイメージがプライマリ コンテナ イメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、[Docker の概要](https://docs.docker.com/engine/docker-overview/)についてのドキュメントを確認してください。

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
ジョブには、複数のイメージを指定できます。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合には、複数イメージの指定が役に立ちます。 **複数のイメージを指定して構成されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。 すべてのコンテナは共通ネットワーク内で動作します。また、公開されるポートはすべて、[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)から `localhost` で利用できます。

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
Docker イメージは、Docker Hub でイメージ名とバージョン タグを使用するか、レジストリ内のイメージへの URL を使用して、以下の 3 つの方法で指定できます。

#### Docker Hub 上のパブリック コンビニエンス イメージ
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

#### パブリック Docker レジストリ
{: #public-docker-registries }
{:.no_toc}
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker レジストリ上のほぼすべてのパブリック イメージがサポートされます。 プライベートのイメージまたはレジストリを操作する場合は、「[Docker の認証付きプルの使用]({{ site.baseurl }}/2.0/private-images/)」を参照してください。

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
Docker にはイメージ キャッシュ機能が組み込まれており、\[リモート Docker\]\[building-docker-images\] を介して Docker イメージをビルド、実行、およびパブリッシュできます。 開発しているアプリケーションの要件も併せて考慮してください。 以下の事項に当てはまるアプリケーションには、Docker が最適です。

- アプリケーションが自己完結型である
- アプリケーションの追加サービスをテストする必要がある
- Docker イメージとして開発しているアプリケーションである (\[リモート Docker\]\[building-docker-images\] の使用が必要)
- `docker-compose` を使用する (\[リモート Docker\]\[building-docker-images\] の使用が必要)

Docker を使う場合、実行できるのは Docker コンテナ内から利用可能な機能 (\[リモート Docker\]\[building-docker-images\] の機能を含む) に制限されます。 ネットワークへの低レベル アクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

コンテナ環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合では、下表のような違いがあります。

| 機能                                                                                      | `docker`        | `machine` |
| --------------------------------------------------------------------------------------- | --------------- | --------- |
| 起動時間                                                                                    | 即時              | 30 ～ 60 秒 |
| クリーン環境                                                                                  | ○               | ○         |
| カスタム イメージ                                                                               | ○<sup>(1)</sup> | ×         |
| Docker イメージのビルド                                                                         | ○<sup>(2)</sup> | ○         |
| ジョブ環境の完全な制御                                                                             | ×               | ○         |
| 完全なルート アクセス                                                                             | ×               | ○         |
| 複数データベースの実行                                                                             | ○<sup>(3)</sup> | ○         |
| 同じソフトウェアの複数バージョンの実行                                                                     | ×               | ○         |
| [Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)                       | ○               | ○         |
| 特権コンテナの実行                                                                               | ×               | ○         |
| Docker Compose とボリュームの使用                                                                | ×               | ○         |
| [リソースのカスタマイズ (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | ○               | ○         |
{: class="table table-striped"}

<sup>(1)</sup> \[Docker イメージの使用\]\[custom-images\]についての記事を参照してください。

<sup>(2)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。

<sup>(3)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`machine` の詳細については、次のセクションを参照してください。


### 使用可能な Docker リソース クラス
{: #available-docker-resource-classes }

[`resource_class`]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) キーを使用すると、ジョブごとに CPU と RAM のリソース量を構成できます。 Docker では、次のリソース クラスを使用できます。

| クラス                    | vCPU | RAM  |
| ---------------------- | ---- | ---- |
| small                  | 1    | 2GB  |
| medium (デフォルト)         | 2    | 4GB  |
| medium+                | 3    | 6GB  |
| large                  | 4    | 8GB  |
| xlarge                 | 8    | 16GB |
| 2xlarge<sup>(2)</sup>  | 16   | 32GB |
| 2xlarge+<sup>(2)</sup> | 20   | 40GB |
{: class="table table-striped"}

<sup>(2)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。

たとえば次のように設定します。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    resource_class: xlarge
    steps:
    #  ...  他の構成
```

## machine を使用する
{: #using-machine }

`machine` オプションは、以下のような仕様を持つ専用のエフェメラル VM でジョブを実行します。

{% include snippets/machine-resource-table.md %}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフル アクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、(ネットワーク インターフェイスのリッスンなどの目的で) ネットワーク スタックへのフル アクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。 プロジェクトで使用する Executor を Docker から `machine` に移行する方法については、「[Docker Executor から machine Executor への移行]({{ site.baseurl }}/2.0/docker-to-machine)」を参照してください。

`machine` Executor を使用すると、Docker プロセスにもフル アクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

**注:** 将来の料金改定で `machine` の使用に追加料金が必要になる可能性があります。

machine Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/2.0/configuration-reference/#machine)を設定します。

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-1604:202007-01
```

使用可能なイメージの一覧は[こちら]({{ site.baseurl }}/2.0/configuration-reference/#available-machine-images)で確認できます。

以下の例では、イメージを使用して [Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) を有効化しています。DLC は、ジョブまたはワークフロー中に Docker イメージをビルドする場合に便利な機能です。 **メモ:** Docker レイヤー キャッシュを使用できるプランについては、CircleCI の[料金プラン ページ](https://circleci.com/ja/pricing/)をご覧ください。

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine:
      docker_layer_caching: true    # デフォルトは false
```

**注:** `image` キーは、プライベート環境の CircleCI ではサポートされていません。 詳細については、[VM サービスに関するドキュメント]({{ site.baseurl }}/2.0/vm-service)を参照してください。

## macOS を使用する
{: #using-macos }

_クラウド版 CircleCI で利用可能です。オンプレミス版では現在サポートされていません。_

`macos` Executor を使用すると、VM 上の macOS 環境でジョブを実行できます。 また、使用する Xcode のバージョンも指定できます。 Xcode の特定のバージョンを実行する VM のバージョン番号と技術仕様に関する一覧については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions)」セクションを参照してください。

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

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。
* クラウド版 CircleCI のバージョン 2.1 の設定ファイル
* オンプレミス版 CircleCI Server のバージョン 2.0 の設定ファイル。これは、_CircleCI Server v2.18.3 からサポートされた_ Windows イメージと `machine` Executor を使用するシナリオが考えられます。

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

クラウド版の例では、Windows Executor のセットアップに Windows Orb を使用することで、構成を簡素化しています。 詳細については、[Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。

CircleCI Server を使用している場合、Windows ジョブに使用しているイメージに関する詳細情報については、システム管理者にお問い合わせください。 Windows イメージはシステム管理者によって構成され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。

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

CircleCI Server では、VM サービスを構成することで GPU 対応の machine Executor を使用できます。 \[CircleCI Server での GPU Executor の実行方法に関するドキュメント\]\[server-gpu\].を参照してください。

## 関連項目
{: #see-also }

[設定ファイル リファレンス]({{ site.baseurl }}/2.0/configuration-reference/)
