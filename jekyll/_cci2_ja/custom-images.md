---
layout: classic-docs
title: "カスタム ビルドの Docker イメージの使用"
short-title: "カスタム ビルドの Docker イメージの使用"
description: "カスタム Docker イメージを作成する理由とその方法"
categories:
  - コンテナ化
order: 30
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Services VM
---

ここでは、以下のセクションに沿って、CircleCI でカスタム Docker イメージを作成および使用する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }

CircleCI では Docker がサポートされています。 Docker を使用すると、プロジェクトの依存関係を簡単に指定できます。 [CircleCI イメージ]({{ site.baseurl }}/ja/circleci-images/)がニーズを満たさない場合は、ジョブのカスタム Docker イメージを作成することを検討してください。 カスタム Docker イメージには、主に以下の 2 つのメリットがあります。

- **ジョブを迅速に実行可能 --** 必要なツールが 1 つのカスタム イメージにパッケージ化されるため、ジョブごとにツールをインストールする必要がなくなります。

- **すっきりとした設定 --** 長いインストール スクリプトはカスタム イメージに追加されるため、[`config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルのコード行数を減らすことができます。

**注:** デフォルトでは、Docker イメージのビルド時にエントリポイントは維持されません。 詳細については、「[エントリポイントの追加](#エントリポイントの追加)」を参照してください。

## CircleCI Dockerfile Wizard
{: #circleci-dockerfile-wizard }

Dockerをインストールせずにカスタムイメージを生成するための Dockerfile を作成するウィザードをクローンして使用する手順については、CircleCI Publicの [`dockerfile-wizard` GitHubリポジトリ](https://github.com/circleci-public/dockerfile-wizard) を参照してください。

## カスタム イメージの手動作成
{: #creating-a-custom-image-manually }

以下のセクションでは、カスタム イメージを手動で作成する方法について、手順を追って説明します。 [プライマリ コンテナ]({{ site.baseurl }}/ja/glossary/#primary-container)のカスタム イメージが作成されることが多いため、ここではその方法に焦点を当てます。 以下の内容を応用して、コンテナをサポートするためのイメージも作成できます。

### 前提条件
{: #prerequisite }
{:.no_toc}

- [Docker のインストール](https://docs.docker.com/install/)が完了し、動作していること。 詳細については、Docker の[入門ドキュメント](https://docs.docker.com/get-started/)を参照してください。

### `Dockerfile` の作成
{: #creating-a-dockerfile }
{:.no_toc}

カスタム イメージを作成するには、[`Dockerfile` を作成](https://docs.docker.com/get-started/part2/#define-a-container-with-dockerfile)する必要があります。 これは、Docker がイメージの収集に使用するコマンドが格納されたテキスト ドキュメントです。 [この Docker デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-docker/tree/master/.circleci/images/primary)に示されているように、`Dockerfile` はできるだけ `.circleci/images` フォルダーに保存してください。

### 基本イメージの選択と設定
{: #choosing-and-setting-a-base-image }
{:.no_toc}

カスタム イメージを作成する前に、カスタム イメージの拡張元となる別のイメージを選択する必要があります。 [Docker ハブ](https://hub.docker.com/explore/) には、ほぼすべての一般的な言語とフレームワーク用に、正式なビルド済みイメージが用意されています。 特定の言語やフレームワークごとに、多くのイメージ バリアントから選択できます。 これらのバリアントは、[Docker タグ](https://docs.docker.com/engine/reference/commandline/tag/)で指定されます。

例えば、[公式 Alpine イメージ](https://hub.docker.com/_/alpine/)のバージョン3.5を使用したい場合、フルイメージ名は`alpine:3.5`となります。

あなたのDockerfileで、[`FROM` コマンド](https://docs.docker.com/engine/reference/builder/#from)を使ってベースイメージを拡張します。

```Dockerfile
FROM golang:1.8.0
```

### 追加ツールのインストール
{: #installing-additional-tools }
{:.no_toc}

追加ツールをインストールする、または他のコマンドを実行するには、[`RUN` コマンド](https://docs.docker.com/engine/reference/builder/#run)を使用します。

```Dockerfile
RUN apt-get update && apt-get install -y netcat
RUN go get github.com/jstemmer/go-junit-report
```

#### プライマリ コンテナに必要なツール
{: #required-tools-for-primary-containers }
{:.no_toc}

CircleCI でカスタム Docker イメージをプライマリ コンテナとして使用するには、以下のツールをインストールする必要があります。

- Bash（ほとんどの場合、すでにインストールされているか、パッケージマネージャ経由で入手可能です。 )
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [SSH](https://help.ubuntu.com/lts/serverguide/openssh-server.html.en#openssh-installation)
- [Tar](https://www.howtoforge.com/tutorial/linux-tar-command/#installing-tar)
- [gzip](http://www.gzip.org/)
- [CA-certificates](https://packages.debian.org/sid/ca-certificates)

これらのツールがインストールされていないと、一部の CircleCI サービスが動作しません。

**注:** パッケージ マネージャーと共にこれらのツールをインストールしない場合は、`RUN` 命令の代わりに `ADD` 命令を使用する必要があります (以下を参照)。

### 他のファイルとディレクトリの追加
{: #adding-other-files-and-directories }
{:.no_toc}

パッケージ マネージャーに存在しないファイルとディレクトリを追加するには、[`ADD` コマンド](https://docs.docker.com/engine/reference/builder/#add)を使用します。

``` Dockerfile
ADD ./workdir/contacts /usr/bin/contacts
ADD ./db/migrations /migrations
```

### エントリポイントの追加
{: #adding-an-entrypoint }
{:.no_toc}

コンテナを実行可能ファイルとして実行するには、[`ENTRYPOINT` コマンド](https://docs.docker.com/engine/reference/builder/#entrypoint)を使用します。 CircleCI のデフォルトでは、ジョブのプライマリ コンテナのエントリポイントは無視されます。 イメージがプライマリコンテナに使用されている場合でもエントリポイントを保持するには、以下のように [`LABEL` コマンド](https://docs.docker.com/engine/reference/builder/#label)を使用します。

```Dockerfile
LABEL com.circleci.preserve-entrypoint=true

ENTRYPOINT contacts
```

**注:** エントリポイント コマンドは、失敗せずに最後まで実行される必要があります。 失敗した場合、またはビルドの途中で停止した場合は、ビルドも停止します。 ログまたはビルド ステータスにアクセスする必要がある場合は、エントリポイントの代わりにバックグラウンド ステップを使用します。

### イメージのビルド
{: #building-the-image }
{:.no_toc}

`Dockerfile` で必要なツールをすべて指定したら、イメージをビルドできます。

```shell
$ docker build <path-to-dockerfile>
```

`Dockerfile` で指定したすべてのコマンドがどのように実行されるか表示されます。 エラーが発生した場合は、画面に表示されます。 これらは作業を続行する前に修正する必要があります。 ビルドが正常に終了したら、最後に以下のようなメッセージが表示されます。

```
...
Successfully built e32703162dd4
```

`docker build` コマンドの詳細については、[こちら](https://docs.docker.com/engine/reference/commandline/build/)を参照してください。

これで、最初のイメージがビルドされました！ 次に、CircleCI で使用できるように、このイメージを保存する必要があります。

### Docker レジストリへのイメージの保存
{: #storing-images-in-a-docker-registry }
{:.no_toc}

CircleCI でカスタム イメージを使用できるようにするには、イメージをパブリックの [Docker レジストリ](https://docs.docker.com/registry/introduction/) に保存する必要があります。 Docker ハブ では無料でパブリック イメージを無制限に保存できるため、[Docker ハブ](https://hub.docker.com/) にアカウントを作成する方法が最も簡単です。 既に Docker ハブ を使用している場合は、既存のアカウントを使用できます。

**注:** イメージを CircleCI [Docker Executor]({{ site.baseurl }}/ja/using-docker) で使用する場合は、パブリック リポジトリが必要です。 イメージをプライベートのままにする場合は、[認証済みの Docker プルを使用する]({{ site.baseurl }}/ja/private-images/)で手順を参照してください。

この例では Docker ハブ を使用していますが、必要に応じて別のレジストリを使用することも可能です。 使用するレジストリに合わせて変更してください。

### レジストリとイメージの準備
{: #preparing-the-image-for-the-registry }
{:.no_toc}

ご自身のアカウントで Docker ハブにログインし、[リポジトリ追加](https://hub.docker.com/add/repository/)ページで新しいリポジトリを作成します。 リポジトリ名には、 `<project-name>-<container-name>` のようなパターンを使用することをお勧めします（例： `cci-demo-docker-primary`）。

次に、アカウントとリポジトリ名を使用してイメージをリビルドします。

```shell
$ docker build -t circleci/cci-demo-docker-primary:0.0.1 <path-to-dockerfile>
```

この`t`キーは、新しいイメージの名前とタグを指定するキーです。

- `circleci` - Docker ハブでのアカウント
- `cci-demo-docker-primary` - リポジトリ名
- `0.0.1` - イメージのタグ (バージョン)。 `Dockerfile` の内容を変更した場合は、必ずタグを更新してください。 更新しないと予想外の結果を招く可能性があります。

### レジストリへのイメージのプッシュ
{: #pushing-the-image-to-the-registry }
{:.no_toc}

イメージを Docker ハブにプッシュします。

```shell
$ docker login
$ docker push circleci/cci-demo-docker-primary:0.0.1
```

**注:** まず CircleCIでは、`docker login` を使用して Docker ハブ での認証を実行しています。 Docker ハブ以外のレジストリを使用する場合は、関連ドキュメントを参照して、イメージをそのレジストリにプッシュする方法を確認してください。

### CircleCI でのイメージの使用
{: #using-your-image-on-circleci }
{:.no_toc}

イメージが正常にプッシュされたら、以下のように指定することで、イメージを `.circleci/config.yml` で使用できます。

```yml
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/cci-demo-docker-primary:0.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照
```

ご不明な点がありましたら、[コミュニティ フォーラム](https://discuss.circleci.com/)にアクセスしてください。CircleCI または他のユーザーからのサポートを受けることができます。

## Ruby 用のカスタム Dockerfile の例
{: #detailed-custom-dockerfile-example-for-ruby }

このセクションでは、Ruby コンテナをビルドして CircleCI で使用する方法について説明します。 **注:** このセクションでは、Docker ログインをローカルで使用していることを前提としています。

以下の例では、最初に [Ruby 2.1](https://hub.docker.com/_/ruby/) イメージを使用しています。 ただし、ここでは FROM ruby:2.1 を基本イメージとして使用する方法ではなく、コンテナのビルド方法について説明します。 Ruby Docker ハブのページから、[2.1/Dockerfile](https://raw.githubusercontent.com/docker-library/ruby/e32433a12099d96dc5a1b28a011b73af4f17cfff/2.1/Dockerfile10) に移動してください。 また、正しいバージョンをプルするために使用されている環境変数に注目してください。

```dockerfile
FROM buildpack-deps:jessie

# gem ドキュメントのインストールをスキップします。
RUN mkdir -p /usr/local/etc \
    && { \
        echo 'install: --no-document'; \
        echo 'update: --no-document'; \
    } >> /usr/local/etc/gemrc

ENV RUBY_MAJOR 2.1
ENV RUBY_VERSION 2.1.10
ENV RUBY_DOWNLOAD_SHA256 5be9f8d5d29d252cd7f969ab7550e31bbb001feb4a83532301c0dd3b5006e148
ENV RUBYGEMS_VERSION 2.6.10

# Ruby のビルド スクリプトは一部が Ruby で記述されています。
#   最終イメージではビルドしたものだけが使用されるように、後からシステムの Ruby を削除します。
RUN set -ex \
    \
    && buildDeps=' \
        bison \
        libgdbm-dev \
        ruby \
    ' \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps \
    && rm -rf /var/lib/apt/lists/* \
    \
    && wget -O ruby.tar.xz "https://cache.ruby-lang.org/pub/ruby/${RUBY_MAJOR%-rc}/ruby-$RUBY_VERSION.tar.xz" \
    && echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum -c - \
    \
    && mkdir -p /usr/src/ruby \
    && tar -xJf ruby.tar.xz -C /usr/src/ruby --strip-components=1 \
    && rm ruby.tar.xz \
    \
    && cd /usr/src/ruby \
    \
# 以下を非表示にするために "ENABLE_PATH_CHECK" を無効にします。
#   warning: Insecure world writable dir
    && { \
        echo '#define ENABLE_PATH_CHECK 0'; \
        echo; \
        cat file.c; \
    } > file.c.new \
    && mv file.c.new file.c \
    \
    && autoconf \
    && ./configure --disable-install-doc --enable-shared \
    && make -j"$(nproc)" \
    && make install \
    \
    && apt-get purge -y --auto-remove $buildDeps \
    && cd / \
    && rm -r /usr/src/ruby \
    \
    && gem update --system "$RUBYGEMS_VERSION"

ENV BUNDLER_VERSION 1.14.3

RUN gem install bundler --version "$BUNDLER_VERSION"

# グローバルにインストールします。
# すべてのアプリケーションで ".bundle" を作成しません。
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME" \
    BUNDLE_BIN="$GEM_HOME/bin" \
    BUNDLE_SILENCE_ROOT_WARNING=1 \
    BUNDLE_APP_CONFIG="$GEM_HOME"
ENV PATH $BUNDLE_BIN:$PATH
RUN mkdir -p "$GEM_HOME" "$BUNDLE_BIN" \
    && chmod 777 "$GEM_HOME" "$BUNDLE_BIN"

CMD [ "irb" ]
```

これで Ruby 2.1 イメージが作成されます。 次に、node:7.4 Dockerfile を使用してノード モジュール、`awscli`、および PostgreSQL 9.5 をインストールします。

```dockerfile
FROM buildpack-deps:jessie

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# https://github.com/nodejs/node にリストされている gpg キー
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.4.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

CMD [ "node" ]
```

両方の Dockerfile で同じ基本イメージ `buildpack-deps:jessie` が使用されます。 両方のイメージを結合し、Python をインストールして `awscli` を入手できるという大きなメリットがあります。

関連ファイルを削除してから、Docker イメージをコミットし、`apt` を使用してインストールします。 インストールしたファイルはすべて後から削除できますが、`apt-get update` は 2 回以上実行しないでください。 カスタム リポジトリがある場合は、事前に追加されます。

Ruby イメージには Git がプリインストールされているので、再インストールする必要はありません。 最後に、sudo、python2.7、postgresql-9.5 をインストール リストに追加します。 次に、yarn と npm をインストールします。

```dockerfile
FROM buildpack-deps:jessie

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# https://github.com/nodejs/node にリストされている gpg キー
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.4.0
ENV YARN_VERSION 0.18.1

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Postgres 9.5
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main" >> /etc/apt/sources.list \
      && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
      && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 58118E89F3A912897C070ADBF76221572C52609D 514A2AD631A57A16DD0047EC749D6EEC0353B12C 

# gem ドキュメントのインストールをスキップします。
RUN mkdir -p /usr/local/etc \
    && { \
        echo 'install: --no-document'; \
        echo 'update: --no-document'; \
    } >> /usr/local/etc/gemrc

ENV RUBY_MAJOR 2.1
ENV RUBY_VERSION 2.1.10
ENV RUBY_DOWNLOAD_SHA256 5be9f8d5d29d252cd7f969ab7550e31bbb001feb4a83532301c0dd3b5006e148
ENV RUBYGEMS_VERSION 2.6.10

# Ruby のビルド スクリプトは一部が Ruby で記述されています。
#   最終イメージではビルドしたものだけが使用されるように、後からシステムの Ruby を削除します。
RUN set -ex \
    \
    && buildDeps=' \
        bison \
        libgdbm-dev \
        ruby \
    ' \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps python2.7 sudo postgresql-9.5 \
    && rm -rf /var/lib/apt/lists/* \
    \
    && wget -O ruby.tar.xz "https://cache.ruby-lang.org/pub/ruby/${RUBY_MAJOR%-rc}/ruby-$RUBY_VERSION.tar.xz" \
    && echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum -c - \
    \
    && mkdir -p /usr/src/ruby \
    && tar -xJf ruby.tar.xz -C /usr/src/ruby --strip-components=1 \
    && rm ruby.tar.xz \
    \
    && cd /usr/src/ruby \
    \
# 以下を非表示にするために "ENABLE_PATH_CHECK" を無効にします。
#   warning: Insecure world writable dir
    && { \
        echo '#define ENABLE_PATH_CHECK 0'; \
        echo; \
        cat file.c; \
    } > file.c.new \
    && mv file.c.new file.c \
    \
    && autoconf \
    && ./configure --disable-install-doc --enable-shared \
    && make -j"$(nproc)" \
    && make install \
    \
    && apt-get purge -y --auto-remove $buildDeps \
    && cd / \
    && rm -r /usr/src/ruby \
    \
    && gem update --system "$RUBYGEMS_VERSION"

ENV BUNDLER_VERSION 1.14.3

RUN gem install bundler --version "$BUNDLER_VERSION"

RUN npm install -g yarn@0.18.1
ENV PATH "$PATH:/root/.yarn/bin/:/usr/local/bin"

# グローバルにインストールします。
# すべてのアプリケーションで ".bundle" を作成しません。
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME" \
    BUNDLE_BIN="$GEM_HOME/bin" \
    BUNDLE_SILENCE_ROOT_WARNING=1 \
    BUNDLE_APP_CONFIG="$GEM_HOME"
ENV PATH $BUNDLE_BIN:$PATH
RUN mkdir -p "$GEM_HOME" "$BUNDLE_BIN" \
    && chmod 777 "$GEM_HOME" "$BUNDLE_BIN"

CMD [ "irb" ]
```

これをビルドするには、以下のコマンドを実行します。

`docker build -t ruby-node:0.1 .`

コマンドの実行が完了すると、次のようなメッセージが表示されます。

```
Removing intermediate container e75339607356
Successfully built 52b773cf50e2
```

コンパイルが終了したら、Docker 出力から SHA を取り出し、以下のように実行します。

```shell
$ docker run -it 52b773cf50e2 /bin/bash
root@6cd398c7b61d:/# exit
```

次に、以下のように指定してそのホスト名をコミットし、ruby-node を Docker ハブ でのユーザー名に置き換えます。

```shell
docker commit 6cd398c7b61d username/ruby-node:0.1
docker push username/ruby-node:0.1
```

カスタム イメージを使用するには、`.circleci/config.yml` イメージ キーから ruby-node/bar:0.1 を参照します。 これで、プライマリ コンテナによってイメージが実行されます。 gist を使用して Dockerfile をコミットし、Docker ハブからリンクすると、設定が失われることを回避できます。

## Docker イメージのキャッシュ
{: #caching-docker-images }
Docker イメージのキャッシュ方法については、[Docker イメージのキャッシュ]({{site.baseurl}}/ja/using-docker#caching-docker-images)を確認してください。
