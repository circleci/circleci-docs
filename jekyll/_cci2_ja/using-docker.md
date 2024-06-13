---
layout: classic-docs
title: "Docker 実行環境の使用"
description: "Docker 実行環境で実行するジョブの設定方法を説明します。"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

[custom-images]: {{ site.baseurl }}/ja/custom-images/
[building-docker-images]: {{ site.baseurl }}/ja/building-docker-images/
[server-gpu]: {{ site.baseurl }}/ja/gpu/

**プレフィックスが「 circleci/ 」のレガシーイメージは、 2021 年 12 月 31 日に[サポートが終了](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)**しています。 ビルドを高速化するには、[次世代の CircleCI イメージ](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/)を使ってプロジェクトをアップグレードしてください。
{: class="alert alert-warning"}

Docker 実行環境を使用して Docker コンテナで[ジョブ]({{site.baseurl}}/ja/jobs-steps/)を実行できます。 Docker 実行環境には、[Docker Executor]({{site.baseurl}}/ja/configuration-reference/#docker) を使ってアクセスできます。 Docker を使ってアプリケーションに必要なものだけをビルドすることにより、パフォーマンスが向上します。

コンテナをスピンアップするには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルで Docker イメージを指定します。 ジョブのステップはすべてこのコンテナで実行されます。

{% include snippets/ja/docker-auth.adoc %}

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

`config.yml` ファイルで `docker:` キーを指定すると、デフォルトで Docker Hub と Docker レジストリ上のほぼすべてのパブリックイメージがサポートされます。 プライベートのイメージまたはレジストリを操作する場合は、[Docker の認証付きプルの使用]({{ site.baseurl }}/ja/private-images/)」を参照してください。

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

[`resource_class`]({{ site.baseurl }}/ja/configuration-reference/#resource_class) キーを使用すると、ジョブごとに CPU と RAM のリソース量を設定できます。 Docker では、次のリソース クラスを使用できます。

リソースクラスは `resource_class` キーで指定します：

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

**注**: リソースクラスはご利用のプランによって異なります。利用可能なリソースクラスの詳細については、[料金ページ](https://circleci.com/pricing/)をご覧ください。

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:current
    resource_class: xlarge
    steps:
    #  ...  other config
```

### x86
{: #x86 }

Docker実行環境では、以下のリソース・クラスが x86 アーキテクチャで利用可能です：

{% include snippets/ja/docker-resource-table.md %}

### Arm
{: #arm }

以下のリソース・クラスは、Docker で Arm を使用できます：

**Arm on Docker** 価格情報、およびArmリソースクラスをサポートするCircleCI Docker convenienceイメージのリストについては、[Arm and Docker Discuss post](https://discuss.circleci.com/t/product-launch-arm-docker-preview/48601)をご覧ください。
{: class="alert alert-caution"}

{% include snippets/ja/docker-arm-resource-table.md %}

### リソースの使用状況を見る
{: #view-resource-usage }

{% include snippets/ja/resource-class-view.md %}

## Docker のメリットと制限事項
{: #docker-benefits-and-limitations }

Docker にはもともとイメージのキャッシュ機能があり、[リモート Docker][building-docker-images] を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うと良いでしょう。

- 自己完結型のアプリケーションである.
- テストのために他のサービスが必要なアプリケーションである.
- アプリケーションが Docker イメージとして配布される ([リモート Docker][building-docker-images] の使用が必要)。
- `docker-compose` を使用したい ([リモート Docker][building-docker-images] の使用が必要)。

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります (CircleCI における [リモート Docker][building-docker-images] の機能も同様です)。 たとえば、ネットワークへの低レベルアクセスが必要な場合や、外部ボリュームをマウントする必要がある場合は、`machine` の使用を検討してください。

コンテナ環境として `docker` イメージを使用する場合と、Ubuntu ベースの `machine` イメージを使用する場合では、下表のような違いがあります。

| 機能                                                                                   | `docker`          | `machine` |
| ------------------------------------------------------------------------------------ | ----------------- | --------- |
| 起動時間                                                                                 | 即時                | 30 ～ 60 秒 |
| クリーン環境                                                                               | はい                | はい        |
| カスタム イメージ                                                                            | はい <sup>(1)</sup> | いいえ       |
| Docker イメージのビルド                                                                      | はい <sup>(2)</sup> | はい        |
| ジョブ環境の完全な制御                                                                          | いいえ               | はい        |
| 完全なルート アクセス                                                                          | いいえ               | はい        |
| 複数データベースの実行                                                                          | はい <sup>(3)</sup> | はい        |
| 同じソフトウェアの複数バージョンの実行                                                                  | いいえ               | はい        |
| [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/docker-layer-caching/)                      | はい                | はい        |
| 特権コンテナの実行                                                                            | いいえ               | はい        |
| Docker Compose とボリュームの使用                                                             | いいえ               | はい        |
| [構成可能なリソース (CPU/RAM)]({{ site.baseurl }}/ja/configuration-reference/#resource_class) | はい                | はい        |
{: class="table table-striped"}

<sup>(1)</sup> [カスタム Docker イメージの使用][custom-images] を参照してください。

<sup>(2)</sup> [リモート Docker][building-docker-images] を使用する必要があります。

<sup>(3)</sup> Docker で複数のデータベースを実行することもできますが、その場合、すべてのイメージ (プライマリおよびセカンダリ) の間で、基になるリソース制限が共有されます。 このときのパフォーマンスは、ご契約のコンテナ プランで利用できるコンピューティング能力に左右されます。

`machine` の詳細については、次のセクションを参照してください。

## Docker イメージのベストプラクティス
{: #docker-image-best-practices }

- レジストリ プロバイダーのレート制限によって問題が発生した場合は、[認証済みの Docker プルを使用する]({{ site.baseurl }}/ja/private-images/)ことで解決できる可能性があります。

- CircleCI は Docker と連携して、ユーザーの皆さまが今後もレート制限なしで Docker Hub にアクセスできるようにしています。 2020 年 11 月 1 日時点では、いくつかの例外を除き、CircleCI を通じて Docker Hub からイメージをプルする際に、レート制限の影響を受けることはありません。 ただし、今後 CircleCI ユーザーにもレート制限が適用される可能性があります。 将来的にレート制限の影響を受けることのないよう、お使いの CircleCI 設定ファイルに [Docker Hub 認証を追加する]({{ site.baseurl }}/ja/private-images/)と共に、必要に応じてご利用の Docker Hub プランのアップグレードを検討することをお勧めします。

- `config.yml` のなかでは、イメージのバージョンを示す `latest` や `1` といった、いずれ変わる可能性の高いタグはできるだけ使わないでください。 例で示している通り、`redis:3.2.7` や `redis@sha256:95f0c9434f37db0a4f...` のように正確にバージョンとハッシュ値を使うのが適切です。 指し示すものが変わりやすいタグは、ジョブの実行環境において予想できない結果になる場合があります。  そういった変化しやすいタグがそのイメージの最新版を指し示すかどうかについて、CircleCI は検知できません。 `alpine:latest` と指定すると、1 カ月前の古いキャッシュを取得することもありえます。

- 実行中に追加ツールをインストールするために実行時間が長くなる場合は、これらのツールが事前にインストールされているカスタムビルドイメージの作成および使用をお勧めします。 詳細については、[カスタムビルドの Docker イメージの使用]({{site.baseurl}}/ja/custom-images/)を参照してください。

- [AWS ECR]({{ site.baseurl }}/ja/private-images/#aws-ecr) イメージを使用する場合は、`us-east-1` リージョンを使用することをお勧めします。 CircleCI のジョブ実行インフラストラクチャは `us-east-1` リージョンにあるので、同じリージョンにイメージを配置すると、イメージのダウンロードにかかる時間が短縮されます。

- プロジェクトをほとんどあるいはまったく変更していないのにパイプラインが失敗した場合は、Docker イメージが使用されているアップストリームで問題が生じていないか確認してみることをお勧めします。

Docker Executor の詳細については、[CircleCI を設定する]({{ site.baseurl }}/ja/configuration-reference/)を参照してください。

## 複数の Docker イメージを使用する
{: #using-multiple-docker-images }

ジョブのなかでは複数のイメージを指定することが可能です。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合に、複数イメージの指定が役に立ちます。 全てのコンテナが共通ネットワーク上で実行され、開放されるポートはいずれも[プライマリコンテナ]({{ site.baseurl }}/ja/glossary/#primary-container)の`ローカルホスト`上で利用できます。

**複数のイメージを指定して設定されたジョブでは、最初にリストしたイメージによって作成されるコンテナで、すべてのステップが実行されます**。

```yaml
jobs:
  build:
    docker:
    # すべてのステップが実行されるプライマリ コンテナ イメージ
     - image: cimg/base:current
    # Secondary container image on common network.
     - image: cimg/mariadb:10.6

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

ここでは、Docker 実行環境のスピンアップに使用する Docker イメージのキャッシュについて説明します。 これは、プロジェクトにおける新しい Docker イメージのビルドを高速化するために使用する機能である [Docker レイヤーキャッシュ]({{site.baseurl}}/ja/docker-layer-caching)には適用されません。
{: class="alert alert-info" }


Docker コンテナのスピンアップからジョブの実行までに要する時間は、複数の要因により変わることがあります。要因としては、イメージのサイズのほか、レイヤーの一部または全部が基盤となる Docker ホストマシンに既にキャッシュされているかどうかも影響します。

CircleCI イメージなどのより広く利用されているイメージほど、多くのレイヤーがキャッシュでヒットする可能性が高くなります。 よく使われる CircleCI イメージの多くで、同じ基本イメージが使用されています。 各イメージ間で大部分の基本レイヤーが同じなため、キャッシュがヒットする確率が高くなっています。

環境のスピンアップは新しいジョブごとに必要です (新規ジョブが同じワークフロー内にある場合でも、ジョブの再実行や 2 回目以降の実行の場合でも)。 CircleCI ではセキュリティ上の理由から、コンテナを再利用することはありません。 ジョブが終了すると、コンテナは破棄されます。 たとえ同じワークフロー内にある場合でも、ジョブが同じ Docker ホストマシンで実行される保証はありません。　 これは、キャッシュステータスが異なる可能性があることを意味します。

いかなる場合でも、キャッシュのヒットは保証されるものではなく、ヒットすればラッキーな景品のようなものと言えるでしょう。 そのため、すべてのジョブでキャッシュがまったくヒットしないケースも想定しておいてください。

つまり、キャッシュのヒット率は設定や構成で制御することはできません。[CircleCI イメージ](https://circleci.com/developer/ja/images)など、広く利用されているイメージを選択すれば、"環境のスピンアップ" ステップでレイヤーがキャッシュでヒットする可能性が高まるでしょう。

## 次のステップ
{: #next-steps }

Docker Executor での [CircleCI イメージ]({{site.baseurl}}/ja/circleci-images) の使用に関する詳細をご確認ください。
