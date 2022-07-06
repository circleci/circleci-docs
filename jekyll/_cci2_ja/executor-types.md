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
  <strong>プレフィックスが「 circleci/ 」のレガシーイメージは、 2021 年 12 月 31 日に<a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">サポートが終了</a></strong>しています。 ビルドを高速化するには、<a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/"> 次世代の CircleCI イメージ </a>を使ってプロジェクトをアップグレードしてください。
</div>

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境でジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

[.circleci/config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。 *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 以下に例を示します。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[ビルド済みの CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはフルオペレーティングシステムではないため、多くの場合ソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブには、[利用可能なマシンイメージのリスト]({{site.baseurl}}/ja/2.0/configuration-reference/#available-linux-machine-images)に記載されている Ubuntu バージョン (16.04 など) を使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (12.5.1 など) を使用します。

## Docker を使用する
{: #using-docker }

`docker` キーは、Docker コンテナを使用してジョブを実行するための基盤テクノロジーとして Docker を定義します。 コンテナは、ユーザーが指定した Docker イメージのインスタンスです。設定ファイルで最初にリストされているイメージがプライマリコンテナ イメージとなり、そこですべてのステップが実行されます。 Docker を初めて使用するときには、[Docker の概要](https://docs.docker.com/engine/docker-overview/)についてのドキュメントを確認してください。

Docker は、アプリケーションに必要なものだけをビルドすることで、パフォーマンスを向上させます。 Docker イメージは、すべてのステップが実行されるプライマリコンテナを生成する [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで指定します。

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:lts
```

この例では、すべてのステップは、`build` ジョブの下に最初にリストされているイメージによって作成されるコンテナで実行されます。

スムーズに移行できるように、CircleCI は一般的な言語用の CircleCI イメージを Docker Hub で提供しています。 名前とタグの一覧は、「[ビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」で確認できます。 Docker をインストールした Git を含む Docker イメージが必要な場合は、`cimg/base:current` をご使用ください。

### Docker イメージのベストプラクティス
{: #docker-image-best-practices }
{:.no_toc}

- レジストリ プロバイダーのレート制限によって問題が発生した場合は、[認証済みの Docker プルを使用する]({{ site.baseurl }}/ja/2.0/private-images/)ことで解決できる可能性があります。

- CircleCI は Docker と連携して、ユーザーの皆さまが今後もレート制限なしで Docker Hub にアクセスできるようにしています。 2020 年 11 月 1 日時点では、いくつかの例外を除き、CircleCI を通じて Docker Hub からイメージをプルする際に、レート制限の影響を受けることはありません。 ただし、今後 CircleCI ユーザーにもレート制限が適用される可能性があります。 将来的にレート制限の影響を受けることのないよう、お使いの CircleCI 設定ファイルに [Docker Hub 認証を追加する]({{ site.baseurl }}/ja/2.0/private-images/)と共に、必要に応じてご利用の Docker Hub プランのアップグレードを検討することをお勧めします。

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。  CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- 実行中に追加ツールをインストールするために実行時間が長くなる場合は、これらのツールが事前にインストールされているカスタムビルドイメージの作成および使用をお勧めします。 詳細については、[カスタムビルドの Docker イメージの使用]({{site.baseurl}}/ja/2.0/custom-images/)を参照してください。

- [AWS ECR]({{ site.baseurl }}/ja/2.0/private-images/#aws-ecr) イメージを使用する場合は、`us-east-1` リージョンを使用することをお勧めします。 CircleCI のジョブ実行インフラストラクチャは `us-east-1` リージョンにあるので、同じリージョンにイメージを配置すると、イメージのダウンロードにかかる時間が短縮されます。

- プロジェクトをほとんどあるいはまったく変更していないのにパイプラインが失敗した場合は、Docker イメージが使用されているアップストリームで問題が生じていないか確認してみることをお勧めします。

Docker Executor の詳細については、[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)を参照してください。

### 複数の Docker イメージを使用する
{: #using-multiple-docker-images }

ジョブには複数のイメージを指定することが可能です。 たとえば、テストやその他の必要なサービスでデータベースを使用する必要がある場合は、複数のイメージを指定します。 **複数のイメージを指定して設定されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。 全てのコンテナが共通ネットワーク上で実行され、開放されるポートはいずれも[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)の`ローカルホスト`上で利用できます。

```yaml
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: cimg/base:current
    # Secondary container image on common network.
     - image: cimg/mariadb:10.6
       command: [mongod, --smallfiles]

    steps:
      # command will execute in an Ubuntu-based container
      # and can access MariaDB on localhost
      - run: sleep 5 && nc -vz localhost 3306
```
Docker イメージは以下の方法で指定することができます。

- イメージ名や Docker Hub 上のバージョンタグ
- レジストリのイメージへの URL を使用

下記の例により、様々なソースからパブリックイメージを使用する方法を紹介します。

#### Docker Hub 上のパブリック CircleCI イメージ
{: #public-convenience-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `cimg/node:14.17-browsers`
  - `name@digest`
    - `cimg/node@sha256:aa6d08a04d13dd8a...`

#### Docker Hub 上のパブリックイメージ
{: #public-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `alpine:3.13`
  - `name@digest`
    - `alpine@sha256:e15947432b813e8f...`

#### Docker レジストリ上のパブリックイメージ
{: #public-docker-registries }
{:.no_toc}

  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker レジストリ上のほぼすべてのパブリックイメージがサポートされます。 プライベートのイメージまたはレジストリを操作する場合は、[Docker の認証付きプルの使用]({{ site.baseurl }}/ja/2.0/private-images/)」を参照してください。

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

Docker にはもともとイメージのキャッシュ機能があり、[リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うと良いでしょう。

- 自己完結型のアプリケーションである.
- テストのために他のサービスが必要なアプリケーションである.
- アプリケーションが Docker イメージとして配布される ([リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) の使用が必要)。
- `docker-compose` を使用したい ([リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) の使用が必要)。

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります (CircleCI における [リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) の機能も同様です)。 たとえば、ネットワークへの低レベルアクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

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

<sup>(1)</sup> [カスタム Docker イメージの使用]({{ site.baseurl }}/ja/2.0/custom-images/) を参照してください。

<sup>(2)</sup> [リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) を使用する必要があります。

<sup>(3)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`machine` の詳細については、次のセクションを参照してください。

### Docker イメージのキャッシュ
{: #caching-docker-images }

ここでは、Docker 実行環境のスピンアップに使用する Docker イメージのキャッシュについて説明します。 これは、プロジェクトにおける新しい Docker イメージのビルドを高速化するために使用する機能である [Docker レイヤーキャッシュ]({{site.baseurl}}/ja/2.0/docker-layer-caching)には適用されません。
{: class="alert alert-info" }


Docker コンテナのスピンアップからジョブの実行までに要する時間は、複数の要因により変わることがあります。要因としては、イメージのサイズのほか、レイヤーの一部または全部が基盤となる Docker ホストマシンに既にキャッシュされているかどうかも影響します。

CircleCI イメージなどのより広く利用されているイメージほど、多くのレイヤーがキャッシュでヒットする可能性が高くなります。 よく使われる CircleCI イメージの多くで、同じ基本イメージが使用されています。 各イメージ間で大部分の基本レイヤーが同じなため、キャッシュがヒットする確率が高くなっています。

環境のスピンアップは新しいジョブごとに必要です (新規ジョブが同じワークフロー内にある場合でも、ジョブの再実行や 2 回目以降の実行の場合でも)。 CircleCI ではセキュリティ上の理由から、コンテナを再利用することはありません。 ジョブが終了すると、コンテナは破棄されます。 たとえ同じワークフロー内にある場合でも、ジョブが同じ Docker ホストマシンで実行される保証はありません。　 これは、キャッシュステータスが異なる可能性があることを意味します。

いかなる場合でも、キャッシュのヒットは保証されるものではなく、ヒットすればラッキーな景品のようなものと言えるでしょう。 そのため、すべてのジョブでキャッシュがまったくヒットしないケースも想定しておいてください。

つまり、キャッシュのヒット率は設定や構成で制御することはできません。[CircleCI イメージ](https://circleci.com/developer/ja/images)など、広く利用されているイメージを選択すれば、"環境のスピンアップ" ステップでレイヤーがキャッシュでヒットする可能性が高まるでしょう。

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
| 2xlarge  | 16   | 32 GB |
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
Ubuntu 14.04 および 16.04 マシンイメージはすでにサポートが終了し、[2022 年 5 月 31 日に提供を終了します。](https://circleci.com/blog/ubuntu-14-16-image-deprecation/) この 2 つのイメージは、2022 年の 3 月 29 日と 4 月 26 日に、提供を一時的に中断します。  [14.04]({{ site.baseurl }}/ja/2.0/images/linux-vm/14.04-to-20.04-migration/) または [16.04]({{ site.baseurl }}/ja/2.0/images/linux-vm/16.04-to-20.04-migration/)イメージからの移行をお願いいたします。
{: class="alert alert-warning"}

`machine` オプションは、以下のような仕様を持つ専用のエフェメラル VM でジョブを実行します。

{% include snippets/ja/machine-resource-table.md %}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフルアクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、ネットワークインターフェイスのリッスンなどの目的でネットワークスタックへのフル アクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。 プロジェクトで使用する Executor を Docker から `machine` に移行する方法については、[Docker Executor から Machine Executor への移行]({{ site.baseurl }}/ja/2.0/docker-to-machine)を参照してください。

`machine` Executor を使用すると、Docker プロセスにもフル アクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

Machine Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/ja/2.0/configuration-reference/#machine)を設定します。

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

使用可能なイメージの一覧は[こちら]({{ site.baseurl }}/2.0/configuration-reference/#available-linux-machine-images)で確認できます。

以下の例では、イメージを使用して [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching) (DLC) を有効化しています。 DLC は、ジョブまたはワークフロー中に Docker イメージをビルドする場合に便利な機能です。

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

IP アドレスの範囲 `192.168.53.0/24 `は、Machine Executor での社内使用のために CircleCI が予約しています。 この範囲はジョブ内でご使用にならないでください。

## macOS を使用する
{: #using-macos }

`macos` Executor を使うと VM 上に macOS 環境を構築し、そのなかでジョブを実行できるようになります。 macOS では、以下のリソースクラスを使用できます。

| クラス                                | vCPU         | RAM   |
| ---------------------------------- | ------------ | ----- |
| medium                             | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2              | 4 @ 3.2 GHz  | 8 GB  |
| large                              | 8 @ 2.7 GHz  | 16 GB |
| macos.x86.metal.gen1<sup>(1)</sup> | 12 @ 3.2 GHz | 32 GB |
{: class="table table-striped"}

このとき、どのバージョンの Xcode を使うか指定することもできます。 Xcode の特定のバージョンを実行する VM のバージョン番号と技術仕様に関する一覧については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

### macOS VM のストレージ
{: #macos-vm-storage }

macOS VM のストレージ容量は、リソースクラスや使用される Xcode イメージによって異なります。 Xcode イメージのサイズは、プリインストールされているツールによって異なります。

| Xcode のバージョン | クラス                   | 最小ストレージ容量          |
| ------------ | --------------------- | ------------------ |
| 10.3.0       | Medium、Large          | 36GB               |
| 10.3.0       | macos.x86.medium.gen2 | 36GB               |
| 11.*         | Medium、Large          | 23GB               |
| 11.*         | macos.x86.medium.gen2 | 23GB               |
| 12.*         | Medium、Large          | 30GB               |
| 12.*         | macos.x86.medium.gen2 | 30GB<sup>(2)</sup> |
| 13.*         | Medium、Large          | 23GB               |
| 13.*         | macos.x86.medium.gen2 | 89GB               |
{: class="table table-striped"}

<sup>(1)</sup>このリソースは、最低 24 時間のリースが必要です。このリソースクラスの詳細は、[macOS の専有ホスト]({{ site.baseurl }}/ja/2.0/dedicated-hosts-macos)を参照して下さい。

<sup>(2)</sup>例外: Xcode 12.0.1 と 12.5.1 の最小ストレージ容量は 100GB です。

## Windows Executor を使用する
{: #using-the-windows-executor }

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。
* クラウド版 CircleCI のバージョン 2.1 の設定ファイル
* オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。_CircleCI Server v2.18.3_ からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@4.1.1 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

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

クラウド版の例では、Windows Executor のセットアップに Windows Orb を使用することで、設定を簡素化しています。 詳細については、[Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。

CircleCI Server を使用している場合、Windows ジョブに使用しているイメージに関する詳細情報については、システム管理者にお問い合わせください。 Windows イメージはシステム管理者によって設定され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。

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
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

CircleCI Server では、VM サービスを設定することで GPU 対応の Machine Executor を使用できます。 \[CircleCI Server での GPU Executor の実行方法に関するドキュメント\]\[server-gpu\] を参照してください。

## 関連項目
{: #see-also }

[設定リファレンス]({{ site.baseurl }}/2.0/configuration-reference/)
