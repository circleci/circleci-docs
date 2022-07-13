---
layout: classic-docs
title: "Docker 実行環境の使用"
description: "Docker 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

[custom-images]: {{ site.baseurl }}/custom-images/ [building-docker-images]: {{ site.baseurl }}/building-docker-images/ [server-gpu]: {{ site.baseurl }}/gpu/

**プレフィックスが「 circleci/ 」のレガシーイメージは、 2021 年 12 月 31 日に[サポートが終了](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)**しています。 ビルドを高速化するには、[次世代の CircleCI イメージ](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/)を使ってプロジェクトをアップグレードしてください。
{: class="alert alert-warning"}

You can use the Docker execution environment to run your [jobs]({{site.baseurl}}/jobs-steps/) in Docker containers. The Docker execution environment is accessed using the [Docker executor]({{site.baseurl}}/configuration-reference/#docker). Docker を使ってアプリケーションに必要なものだけをビルドすることにより、パフォーマンスが向上します。

Specify a Docker image in your [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file to spin up a container. ジョブのステップはすべてこのコンテナで実行されます。

```yaml
jobs:
  my-job:
    docker:
      - image: cimg/node:lts
```

コンテナは指定した Docker イメージのインスタンスです。 ジョブの設定ファイル内で最初にリストしたイメージが_プライマリ_コンテナイメージとなり、すべてのステップがこのイメージ上で実行されます。 _セカンダリ_ コンテナも、データベースなどのサービスを実行するために指定することもできます。 Docker を初めて使用するときには、[Docker の概要](https://docs.docker.com/engine/docker-overview/)についてのドキュメントを確認してください。

CircleCI では、一般的な言語用にすぐに使えるイメージを Docker Hub で提供しています。 イメージ名やタグの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/images)を参照してください。

**注**: Docker をインストールした Git を含む Docker イメージが必要な場合は、`cimg/base:current` をご使用ください。

## Docker イメージを指定する
{: #specifying-docker-images }

Docker イメージは以下の方法で指定することができます。

- イメージ名や Docker Hub 上のバージョンタグ
- レジストリのイメージへの URL を使用

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker レジストリ上のほぼすべてのパブリックイメージがサポートされます。 If you want to work with private images/registries, please refer to [Using Docker Authenticated Pulls]({{ site.baseurl }}/private-images/).

下記の例により、様々なソースからパブリックイメージを使用する方法を紹介します。

### Docker Hub 上のパブリック CircleCI イメージ
{: #public-convenience-images-on-docker-hub }

  - `name:tag`
    - `cimg/node:14.17-browsers`
  - `name@digest`
    - `cimg/node@sha256:aa6d08a04d13dd8a...`

### Docker Hub 上のパブリックイメージ
{: #public-images-on-docker-hub }

  - `name:tag`
    - `alpine:3.13`
  - `name@digest`
    - `alpine@sha256:e15947432b813e8f...`

### Docker レジストリ上のパブリックイメージ
{: #public-docker-registries }

  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

## 使用可能な Docker リソース クラス
{: #available-docker-resource-classes }

The [`resource_class`]({{ site.baseurl }}/configuration-reference/#resource_class) key allows you to configure CPU and RAM resources for each job. Docker では、次のリソース クラスを使用できます。

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

**注**: `2xlarge` と `2xlarge+` はサポートチームのレビューが必要です。 ご利用の際は、[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)してください。

`resource_class` キーを使ってリソースクラスを以下のように指定します。

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:current
    resource_class: xlarge
    steps:
    #  ...  other config
```

## Docker のメリットと制限事項
{: #docker-benefits-and-limitations }

Docker にはもともとイメージのキャッシュ機能があり、\[リモート Docker\]\[building-docker-images\] を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うと良いでしょう。

- 自己完結型のアプリケーションである.
- テストのために他のサービスが必要なアプリケーションである.
- アプリケーションが Docker イメージとして配布される ([リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) の使用が必要)。
- `docker-compose` を使用したい ([リモート Docker]({{ site.baseurl }}/ja/2.0/building-docker-images/) の使用が必要)。

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります (CircleCI における \[リモート Docker\]\[building-docker-images\] の機能も同様です)。 たとえば、ネットワークへの低レベルアクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

コンテナ環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合では、下表のような違いがあります。

| 機能                                                                                | `docker`          | `machine` |
| --------------------------------------------------------------------------------- | ----------------- | --------- |
| 起動時間                                                                              | 即時                | 30 ～ 60 秒 |
| クリーン環境                                                                            | はい                | はい        |
| カスタム イメージ                                                                         | はい <sup>(1)</sup> | いいえ       |
| Docker イメージのビルド                                                                   | はい <sup>(2)</sup> | はい        |
| ジョブ環境の完全な制御                                                                       | いいえ               | はい        |
| 完全なルート アクセス                                                                       | いいえ               | はい        |
| 複数データベースの実行                                                                       | はい <sup>(3)</sup> | はい        |
| 同じソフトウェアの複数バージョンの実行                                                               | いいえ               | はい        |
| [Docker レイヤーキャッシュ]({{ site.baseurl }}/docker-layer-caching/)                      | はい                | はい        |
| 特権コンテナの実行                                                                         | いいえ               | はい        |
| Docker Compose とボリュームの使用                                                          | いいえ               | はい        |
| [構成可能なリソース (CPU/RAM)]({{ site.baseurl }}/configuration-reference/#resource_class) | はい                | はい        |
{: class="table table-striped"}

<sup>(1)</sup> \[カスタム Docker イメージの使用\]\[custom-images\] を参照してください。

<sup>(2)</sup> \[リモート Docker\]\[building-docker-images\] を使用する必要があります。

<sup>(3)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`machine` の詳細については、次のセクションを参照してください。

## Docker イメージのベストプラクティス
{: #docker-image-best-practices }

- If you encounter problems with rate limits imposed by your registry provider, using [authenticated docker pulls]({{ site.baseurl }}/private-images/) may grant higher limits.

- CircleCI は Docker と連携して、ユーザーの皆さまが今後もレート制限なしで Docker Hub にアクセスできるようにしています。 2020 年 11 月 1 日時点では、いくつかの例外を除き、CircleCI を通じて Docker Hub からイメージをプルする際に、レート制限の影響を受けることはありません。 ただし、今後 CircleCI ユーザーにもレート制限が適用される可能性があります。 We encourage you to [add Docker Hub authentication]({{ site.baseurl }}/private-images/) to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.

- `config.yml` のなかでは、イメージのバージョンを示す `latest` や `1` といった、いずれ変わる可能性の高いタグはできるだけ使わないでください。 例で示している通り、`redis:3.2.7` や `redis@sha256:95f0c9434f37db0a4f...` のように正確にバージョンとハッシュ値を使うのが適切です。 指し示すものが変わりやすいタグは、ジョブの実行環境において予想できない結果になる場合があります。  そういった変化しやすいタグがそのイメージの最新版を指し示すかどうかについて、CircleCI は検知できません。 `alpine:latest` と指定すると、1 カ月前の古いキャッシュを取得することもありえます。

- 実行中に追加ツールをインストールするために実行時間が長くなる場合は、これらのツールが事前にインストールされているカスタムビルドイメージの作成および使用をお勧めします。 See the [Using Custom-Built Docker Images]({{site.baseurl}}/custom-images/) page for more information.

- When you use [AWS ECR]({{ site.baseurl }}/private-images/#aws-ecr) images, it is best practice to use `us-east-1` region. CircleCI のジョブ実行インフラストラクチャは `us-east-1` リージョンにあるので、同じリージョンにイメージを配置すると、イメージのダウンロードにかかる時間が短縮されます。

- プロジェクトをほとんどあるいはまったく変更していないのにパイプラインが失敗した場合は、Docker イメージが使用されているアップストリームで問題が生じていないか確認してみることをお勧めします。

More details on the Docker executor are available in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/) document.

## 複数の Docker イメージを使用する
{: #using-multiple-docker-images }

ジョブのなかでは複数のイメージを指定することが可能です。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合に、複数イメージの指定が役に立ちます。 All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/glossary/#primary-container).

**複数のイメージを指定して設定されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。

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

## RAM ディスク
{: #ram-disks }

RAM ディスクは `/mnt/ramdisk` に配置され、`/dev/shm` を使用する場合と同様に[一時ファイル用ファイルシステム](https://ja.wikipedia.org/wiki/Tmpfs)として利用できます。 使用する `resource_class` でプロジェクトのコンテンツすべて (Git からチェックアウトされたすべてのファイル、依存関係、生成されたアセットなど) をまかなえるだけのメモリを確保できている場合、RAM ディスクを使用することでビルドを高速化できます。

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

## Docker イメージのキャッシュ
{: #caching-docker-images }

ここでは、Docker 実行環境のスピンアップに使用する Docker イメージのキャッシュについて説明します。 It does not apply to [Docker layer caching]({{site.baseurl}}/docker-layer-caching), which is a feature used to speed up building new Docker images in your projects.
{: class="alert alert-info" }


Docker コンテナのスピンアップからジョブの実行までに要する時間は、複数の要因により変わることがあります。要因としては、イメージのサイズのほか、レイヤーの一部または全部が基盤となる Docker ホストマシンに既にキャッシュされているかどうかも影響します。

CircleCI イメージなどのより広く利用されているイメージほど、多くのレイヤーがキャッシュでヒットする可能性が高くなります。 よく使われる CircleCI イメージの多くで、同じ基本イメージが使用されています。 各イメージ間で大部分の基本レイヤーが同じなため、キャッシュがヒットする確率が高くなっています。

環境のスピンアップは新しいジョブごとに必要です (新規ジョブが同じワークフロー内にある場合でも、ジョブの再実行や 2 回目以降の実行の場合でも)。 CircleCI ではセキュリティ上の理由から、コンテナを再利用することはありません。 ジョブが終了すると、コンテナは破棄されます。 たとえ同じワークフロー内にある場合でも、ジョブが同じ Docker ホストマシンで実行される保証はありません。　 これは、キャッシュステータスが異なる可能性があることを意味します。

いかなる場合でも、キャッシュのヒットは保証されるものではなく、ヒットすればラッキーな景品のようなものと言えるでしょう。 そのため、すべてのジョブでキャッシュがまったくヒットしないケースも想定しておいてください。

つまり、キャッシュのヒット率は設定や構成で制御することはできません。[CircleCI イメージ](https://circleci.com/developer/ja/images)など、広く利用されているイメージを選択すれば、"環境のスピンアップ" ステップでレイヤーがキャッシュでヒットする可能性が高まるでしょう。

## 次のステップ
{: #next-steps }

Find out more about using [Convenience Images]({{site.baseurl}}/circleci-images) with the Docker executor.
