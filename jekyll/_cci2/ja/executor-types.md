---
layout: classic-docs
title: "Executor タイプの選び方"
short-title: "Executor タイプの選び方"
description: "Executor タイプである docker、machine などについての概要"
categories:
  - containerization
order: 10
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

このページでは、 下記の内容に沿って、`docker`、`machine`、`macos` 環境について解説しています。

- 目次 {:toc}

## 概要

{:.no_toc}

CircleCI enables you to run jobs in one of three environments:

- Within Docker images (`docker`)
- Within a Linux virtual machine (VM) image (`machine`)
- Within a macOS VM image (`macos`)

For building on Linux, there are tradeoffs to using `docker` versus `machine`, as follows:

VM 環境 | `docker` | `machine` \---\---\----|\---\---\----|\---\---\---- 起動時間 | インスタントオン | 30〜60 秒 クリーン環境 | ○ | ○ カスタムイメージ | ○ | × Docker イメージのビルド | ○ <sup>(1)</sup> | ○ ジョブ環境全体の制御 | × | ○ root 権限 | × | ○ 複数データベースの利用 | × | ○ 同一ソフトウェアにおける複数バージョンの利用 | × | ○ レイヤーキャッシュ | ○ | ○ 権限付きコンテナの実行 | × | ○ ストレージにおける docker compose の使用 | × | ○ [リソースのカスタマイズ (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | ○ | × {: class="table table-striped"}

<sup>(1)</sup> \[リモート Docker\]\[building-docker-images\] の利用が必須です。

Executor タイプとして `Xcode` とともに `macOS` を使うこともできます。詳しくは [iOS プロジェクトチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)を参照してください。

## Docker を使用する

`docker` キーは、Docker コンテナによってジョブを実行する基礎技術である Docker を定義するものです。 コンテナはユーザーが指定した Docker イメージのインスタンスです。設定ファイル内で最初に指定したイメージは、各ステップを実行するプライマリコンテナとなります。 Docker に初めて触れるということであれば、まずは [Docker Overview documentation](https://docs.docker.com/engine/docker-overview/) で基本を押さえておきましょう。

実行するアプリケーションに必要なものだけをビルドすることでパフォーマンスを高める、といった Docker の使い方が可能です。 Specify a Docker image in your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that will generate the primary container where all steps run:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

この例では、`build` ジョブ後に記述している最初のイメージ指定で作成したコンテナ上ですべてのステップが実行されることになります。 環境に汎用性をもたせるために、CircleCI では一般的なプログラミング言語に対応するビルド済み Docker イメージを Docker Hub 上に用意しています。 それらの名前とタグの一覧は [CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)で確認してください。 Docker 自体や Git を含む Docker イメージがほしいときは、[公式 Docker image](https://hub.docker.com/_/docker/) の `docker:stable-git` を利用するのが近道です。

### Docker イメージ活用のヒント

{:.no_toc}

- `config.yml` のなかでは、イメージのバージョンを示す `latest` や `1` といった、いずれ変わる可能性の高いタグはできるだけ使わないでください。 例で示している通り、`redis:3.2.7` や `redis@sha256:95f0c9434f37db0a4f...` のように正確にバージョンとハッシュ値を使うのが適切です。 指し示すものが変わりやすいタグは、ジョブの実行環境において予想できない結果になる場合があります。 そういった変化しやすいタグがそのイメージの最新版を指し示すかどうかについて、CircleCI は検知できません。 `alpine:latest` と指定すると、1 カ月前の古いキャッシュを取得することもありえます。

- 実行時にツール類をインストールしたことでビルドに時間がかかったように感じるなら、[カスタム Docker イメージのビルド]({{ site.baseurl }}/2.0/custom-images/)ページを参考にしてください。ジョブに必要なツールをコンテナにプリロードするカスタムイメージの作成方法を説明しています。

Docker Executor のより詳細な解説は [CircleCI の設定]({{ site.baseurl }}/2.0/configuration-reference/)をご覧ください。

## Machine を使用する

The `machine` option runs your jobs in a dedicated, ephemeral VM that has the following specifications:

CPU数 | プロセッサ名 | メモリ | HDD \-----|\---\---\---\---\---\---\---\---\---|\---\---\---\--- 2 | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB {: class="table table-striped"}

Using the `machine` executor gives your application full access to OS resources and provides you with full control over the job environment. This control can be useful in situations where you need to use `ping` or modify the system with `sysctl` commands.

Using the `machine` executor also enables you to build a Docker image without downloading additional packages for languages like Ruby and PHP.

**Note**: Using `machine` may require additional fees in a future pricing update.

To use the machine executor, set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) to `true` in `.circleci/config.yml`:

```yaml
version: 2
jobs:
  build:
    machine: true
```

The default image for the machine executor is `circleci/classic:latest`. You can specify other images by using the `image` key.

**Note:** The `image` key is not supported on private installations of CircleCI. See the [VM Service documentation]({{ site.baseurl }}/2.0/vm-service) for more information.

```yaml
version: 2
jobs:
  build:
    machine:
      image: circleci/classic:2017-01  # pins image to specific version using YYYY-MM format
```

The `image` key accepts one of three image types, refer to the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#machine) for additional details about classic versions:

- `circleci/classic:latest`: This is the default image. Changes to this image are announced at least one week in advance.
- `circleci/classic:edge`: This image receives the latest updates. Changes to this image occur frequently.
- `circleci/classic:{YYYY-MM}`: This image is pinned to a specific version to prevent breaking changes.

All images have common language tools preinstalled. Refer to the [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) for more information.

下記は、デフォルトのマシンイメージを使用し、ジョブや Workflow で Docker イメージをビルドする際に効果的な [Docker レイヤーキャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) を有効にした例です。 **※**Docker レイヤーキャッシュの利用には追加の料金がかかります。この機能を有効にするには、サポートチケットを使って CircleCI のセールスチームに問い合わせてください。

```yaml
version: 2
jobs:
  build:
    machine:
      docker_layer_caching: true    # デフォルト：false
```

## macOS を使用する

`macos` Executor を使うと VM 上に macOS 環境を構築し、そのなかでジョブを実行できるようになります。 このとき、どのバージョンの Xcode を使うか指定することもできます。 利用可能なバージョンについては、「iOS アプリのテスト方法」内の[サポートしている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions)を参照してください。 各バージョンの Xcode が動作している VM のマシンスペック (CPU、メモリサイズ、HDD容量など) に関する詳細は、同ページの「インストール済みソフト」のリンク先で確認できます。

    jobs:
      build:
        macos:
          xcode: "9.0"
    
        steps:
          # コマンドは Xcode 9.0 がインストールされた
          #  macOS コンテナで実行されます
          - run: xcodebuild -version
    

## 複数の Docker イメージを使用する

ジョブのなかでは複数のイメージを指定することが可能です。 テストにデータベースを使う必要があったり、それ以外にも何らかのサービスが必要になったりする場合に、複数イメージの指定が役に立ちます。 **複数のイメージを設定しているジョブでは、リストで最初に指定したイメージのコンテナが全てのステップを実行する、ということを覚えておいてください。** 全てのコンテナが共通ネットワーク上で実行され、開放されるポートはいずれも[プライマリコンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)の`ローカルホスト`上で利用できます。

    jobs:
      build:
        docker:
        # 全てのステップを実行するプライマリコンテナ
         - image: buildpack-deps:trusty
        # 共通ネットワーク上で動作するセカンダリコンテナのイメージ 
         - image: mongo:2.6.8-jessie
           command: [mongod, --smallfiles]
    
        working_directory: ~/
    
        steps:
          # コマンドは信頼されたコンテナ上で実行され
          # ローカルホストの mongo にアクセスできます
          - run: sleep 5 && nc -vz localhost 27017
    

Docker イメージの指定方法は 3 パターンあります。イメージ名を指定する方法、Docker Hub 上のバージョンタグを指定する方法、レジストリにあるイメージの URL を指定する方法です。

### Docker Hub の簡易的な公開イメージ

{:.no_toc} - `name:tag` - `circleci/node:7.10-jessie-browsers` - `name@digest` - `redis@sha256:34057dd7e135ca41...`

### Docker Hub の公開イメージ

{:.no_toc} - `name:tag` - `alpine:3.4` - `name@digest` - `redis@sha256:54057dd7e125ca41...`

### 公開 Docker レジストリ

{:.no_toc} - `image_full_url:tag` - `gcr.io/google-containers/busybox:1.24` - `image_full_url@digest` - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Docker Hub と Docker レジストリにある公開イメージの多くは、`config.yml` 内の `docker:` キーで指定してすぐに利用できます。 独自のプライベートなイメージ・レジストリを動かしたいときは、[プライベートイメージの使い方]({{ site.baseurl }}/2.0/private-images)を参照してください。

## Docker のメリットと制限

Docker にはもともとイメージのキャッシュ機能があり、\[リモート Docker\]\[building-docker-images\] を介した Docker イメージのビルド、実行、パブリッシュを可能にしています。 開発しているアプリケーションで Docker を利用する必要があるかどうか、再確認してください。 アプリケーションが下記内容に合致するなら、Docker を使うと良いでしょう。

- 自己完結型のアプリケーションである
- テストのために他のサービスが必要なアプリケーションである
- Docker イメージとして開発しているアプリケーションである (要\[リモート Docker\]\[building-docker-images\])
- `docker-compose` を使いたい（要\[リモート Docker\]\[building-docker-images\]）

Docker を使うと、Docker コンテナのなかで可能な範囲の機能に実行が制限されることになります (CircleCI における \[リモート Docker\]\[building-docker-images\] の機能も同様です)。 そのため、ネットワークへの低レベルアクセスや外部ストレージのマウントといった機能が必要な場合は、`docker` ではなく `machine` を使うことも検討してください。

## 関連情報

[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)