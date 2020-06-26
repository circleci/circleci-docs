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

- 目次
{:toc}

## 概要
{:.no_toc}

*Executor タイプ*は、ジョブを実行する基盤テクノロジーまたは環境を定義します。 CircleCI では、以下の 4 つの環境のいずれかでジョブを実行できます。

- Docker イメージ内 (`docker`)
- Linux 仮想マシン (VM) イメージ内 (`machine`)
- macOS VM イメージ内 (`macos`)
- Windows VM イメージ内 (`windows`)

['.circleci/config.yml']({{ site.baseurl }}/2.0/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。 *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 たとえば以下のように、ジョブごとに Executor タイプとイメージを指定できます。

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

<sup>(1)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。

<sup>(2)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

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

- `latest` や `1` のような可変タグを `config.yml file` でイメージのバージョンとして使用することは避けてください。 例に示すように、`redis:3.2.7`、`redis@sha256:95f0c9434f37db0a4f...` といった正確なイメージ バージョンまたはダイジェストを使用することをお勧めします。 可変タグは、多くの場合、ジョブ環境で予期しない変更を引き起こします。 CircleCI は、可変タグがイメージの最新バージョンを返すことを保証できません。 `alpine:latest` と指定しても、実際には 1 か月前の古いキャッシュが取得される場合があります。

- 実行中に追加ツールがインストールされるために実行時間が長くなる場合は、「[カスタム ビルドの Docker イメージの使用]({{ site.baseurl }}/2.0/custom-images/)」を参照してカスタム イメージを作成し、ジョブの要件に応じてコンテナに事前ロードされるツールを含めることをお勧めします。

Docker Executor の詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。

## Machine の使用

`machine` オプションは、以下のような仕様を持つ専用のエフェメラル VM でジョブを実行します。

| クラス            | vCPU | RAM    |
| -------------- | ---- | ------ |
| medium (デフォルト) | 2 基  | 7.5 GB |
| large          | 4 基  | 15 GB  |
{: class="table table-striped"}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフル アクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、(ネットワーク インターフェイスのリッスンなどの目的で) ネットワーク スタックへのフル アクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。

`machine` Executor を使用すると、Docker プロセスにもフル アクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

メモ: Docker コンテナを実行するためには docker Executor を使用できますが、現在 CircleCI で新しい Docker イメージをビルドするには `machine` Executor の使用のみがサポートされています。

**メモ:** 将来の料金改定で `machine` の使用に追加料金が必要になる可能性があります。

`machine` Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/2.0/configuration-reference/#machine)を `true` に設定します。

{:.tab.machineblock.Cloud}
```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01    # 推奨 Linux イメージ - Ubuntu 16.04、docker 18.09.3、docker-compose 1.23.1 が含まれます
```

{:.tab.machineblock.Server}
```yaml
version: 2
jobs:
  build:
    machine: true # デフォルトのイメージを使用します
```

**メモ:** Machine Executor のデフォルトのイメージは、`circleci/classic:latest` です。 イメージを指定しない場合、ジョブはデフォルトのイメージで実行されます。現在は circleci/classic:201710-01 がデフォルトですが、将来的には変更される可能性があります。

すべてのイメージには、共通の言語ツールがプリインストールされています。 詳細については、[VM の仕様スクリプト](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh)を参照してください。

**メモ:** オンプレミス版の CircleCI Server では `image` キーは必須ではありませんが (上の例を参照)、使用する場合は `image: default` に設定する必要があります。

以下の例では、デフォルトの machine イメージを使用し、[Docker レイヤー キャッシュ (DLC)]({{ site.baseurl }}/2.0/docker-layer-caching) を有効化しています。DLC は、ジョブまたはワークフロー中に Docker イメージをビルドする場合に便利な機能です。 **メモ:** お使いのアカウントでこの有料の機能を有効化するには、サポート チケットをオープンしてください。CircleCI 営業担当者から連絡を差し上げます。

```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # デフォルトは false
```

## macOS の使用

*クラウド版 CircleCI で利用可能です。オンプレミス版では現在サポートされていません。*

`macos` Executor を使用すると、VM 上の macOS 環境でジョブを実行できます。 また、使用する Xcode のバージョンも指定できます。 Xcode の特定のバージョンを実行する VM のバージョン番号と技術仕様に関する一覧については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

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

## Windows Executor の使用

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。

- クラウド版の CircleCI でバージョン 2.1 の設定ファイルを使用する場合。[パイプラインの有効化]({{ site.baseurl }}/2.0/build-processing)も必要です。
- オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。これは、*CircleCI Server v2.18.3* からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

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

クラウド版の例では、Windows Executor のセットアップに Windows Orb を使用することで、構成を簡素化しています。 詳細については、[Windows Orb の詳細ページ](https://circleci.com/orbs/registry/orb/circleci/windows)を参照してください。

CircleCI Server を使用している場合、Windows ジョブに使用しているイメージに関する詳細情報については、システム管理者にお問い合わせください。 Windows イメージはシステム管理者によって構成され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。

## 複数の Docker イメージの使用

ジョブには、複数のイメージを指定できます。 たとえば、テストやその他の必要なサービスでデータベースを使用する必要がある場合は、複数のイメージを指定します。 **複数のイメージを指定して構成されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます。** すべてのコンテナは共通ネットワーク内で動作します。また、公開されるポートはすべて、[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)から `localhost` で利用できます。

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

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker Registry 上のほぼすべてのパブリック イメージがサポートされます。 プライベートのイメージまたはレジストリを操作する場合は、[プライベート イメージの使用に関するドキュメント]({{ site.baseurl }}/2.0/private-images)を参照してください。

## Docker のメリットと制限事項

Docker には、イメージ キャッシュ機能が組み込まれており、\[リモート Docker\]\[building-docker-images\] を介して Docker イメージをビルド、実行、およびパブリッシュできます。 アプリケーションの要件も併せて検討してください。 以下の事項に当てはまるアプリケーションには、Docker が最適です。

- アプリケーションが自己完結型である
- アプリケーションの追加サービスをテストする必要がある
- アプリケーションが Docker イメージとして配布される (\[リモート Docker\]\[building-docker-images\] の使用が必要)
- `docker-compose` を使用する (\[リモート Docker\]\[building-docker-images\] の使用が必要)

Docker を選択すると、実行できるのは Docker コンテナ内から利用可能な機能 (\[リモート Docker\]\[building-docker-images\] の機能を含む) に制限されます。 たとえば、ネットワークへの低レベル アクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

## 関連項目

[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)