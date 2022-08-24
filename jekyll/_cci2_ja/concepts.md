---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI  のコンセプト"
categories:
  - はじめよう
order: 1
version:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

このガイドでは、CircleCI がお客様の [CI/CD](https://circleci.com/continuous-integration/#what-is-continuous-integration) パイプラインを管理する方法の基本概念について説明します。

* 目次
{:toc}

## 同時実行
{: #concurrency }

CircleCI では、*同時実行*とは複数のコンテナを使用して、複数のビルドを同時に実行することを指します。 CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソースクラス]({{site.baseurl}}/ja/configuration-reference/#resource_class)ごとに同時実行数のソフト制限が設けられています。 ジョブがキュー入る場合は、この制限に達している可能性が考えられます。 年間プランのお客様は、追加料金なくこの制限の拡大を依頼することができます。

[設定ファイルのサンプル]({{site.baseurl}}/ja/sample-config/#concurrent-workflow)に示す方法で並列実行を設定するには[ワークフローのオーケストレーション]({{site.baseurl}}/ja/workflows/)を参照してください。

## 設定
{: #configuration }

CircleCI では *Configuration as Code* の理念を掲げています。 CI/CD プロセス全体が `config.yml` という 1 つのファイルを通じてオーケストレーションされます。 この `config.yml` ファイルは、プロジェクトの最上部にある `.circleci` というフォルダーに置かれます。 CircleCI の設定には YAML 構文が使われます。 詳しくは「[YAML の記述]({{ site.baseurl }}/ja/writing-yaml/)」をご確認ください。

```shell
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

`.circleci/config.yml` は、プロジェクトの全パイプラインを定義する強力な YAML ファイルです。 使用される様々なキーの概要については、[設定ファイルのリファレンス]({{ site.baseurl }}/ja/configuration-reference/)をご覧ください。

CircleCI の設定はお客様のプロジェクトの様々なニーズに合わせて変更できます。 下記の用語は粒度と依存度の順に並べられており、最も一般的な CircleCI プロジェクトのコンポーネントを表しています。

- **[パイプライン](#pipelines)**: 設定全体を表します  (Server v2.x では利用できません)。
- **[ワークフロー](#workflows)**: 複数の _ジョブ_ のオーケストレーションを行います。
- **[ジョブ](#jobs)**: コマンドを実行する一連の _ステップ_ を実行します。
- **[ステップ](#steps)**: 依存関係のインストールやテストの実行などのコマンドやプロジェクトに必要な作業のシェルスクリプトを実行します。

下記では、

Java アプリケーション例を用いてさまざまな設定要素を紹介します。

![設定要素]({{ site.baseurl }}/assets/img/docs/config-elements.png)



## コンテキスト

{: #contexts }

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。 コンテキストを作成したら、`config.yml `ファイルのワークフローセクションで `context` キーを使って、任意のジョブに当該コンテキストに関連付けられた環境変数へのアクセス権を付与することができます。

{:.tab.contextsimage.Cloud}

![コンテキストの概要]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}

![コンテキストの概要]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}

![コンテキストの概要]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

詳細は、[コンテキストの使用]({{ site.baseurl }}/ja/contexts/)を参照して下さい。



## データの永続化

{: #data-persistence }

データの永続化により、ジョブ間でデータを動かし、ビルドを高速化することができます。 データを永続化するには、キャッシュ、ワークスペース、アーティファクトを使った 3 つの方法があります。

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workspaces.png)



### キャッシュ

{: #caches }

キャッシュは、依存関係、ソースコードなどを 1つのファイルとして、または複数のファイルが入ったディレクトリとしてオブジェクトストレージに格納します。 ビルドを高速化するために、各ジョブには、以前のジョブからの依存関係をキャッシュするための特別な手順が含まれている場合があります。

[キャッシュをクリアする]({{site.baseurl}}/ja/caching/#clearing-cache)必要がある場合は、[依存関係のキャッシュ]({{site.baseurl}}/ja/caching/)のページで詳細をご確認ください。

{:.tab.cache.Cloud}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/executor-intro/ for a comparison
    # and more examples.
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```


{% endraw %}

{:.tab.cache.Server_3}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/executor-intro/ for a comparison
    # and more examples.
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```


{% endraw %}

{:.tab.cache.Server_2}



{% raw %}


```yaml
version: 2

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/executor-intro/ for a comparison
    # and more examples.
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```


{% endraw %}



### ワークスペース

{: #workspaces }

ワークスペースは、ワークフロー対応のストレージ メカニズムです。 ワークスペースには、ダウンストリームジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用されます。



### アーティファクト

{: #artifacts }

アーティファクトにはワークフローが完了した後もデータが維持され、ビルドプロセス出力の長期ストレージとして使用できます。

{:.tab.workspace.Cloud}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
#...
    steps:
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace for use in downstream job. このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルートディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
            # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  build2:
#...
    steps:

      - attach_workspace:
        # 絶対パスまたは working_directory からの相対パスでなければなりません。
          at: /tmp/workspace
  build3:
#...
    steps:
      - store_artifacts: # See circleci.com/docs/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```


{% endraw %}

{:.tab.workspace.Server_3}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
#...
    steps:
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace for use in downstream job. このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルートディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
            # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  build2:
#...
    steps:

      - attach_workspace:
        # 絶対パスまたは working_directory からの相対パスでなければなりません。
          at: /tmp/workspace
  build3:
#...
    steps:
      - store_artifacts: # See circleci.com/docs/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```


{% endraw %}

{:.tab.workspace.Server_2}



{% raw %}


```yaml
version: 2
jobs:
  build1:
#...
    steps:
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace for use in downstream job. このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルートディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
            # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  build2:
#...
    steps:

      - attach_workspace:
        # 絶対パスまたは working_directory からの相対パスでなければなりません。
          at: /tmp/workspace
  build3:
#...
    steps:
      - store_artifacts: # See circleci.com/docs/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```


{% endraw %}

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| タイプ      | ライフタイム    | 用途                                                           | 例                                                                                                                                           |
| -------- | --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月       | 長期アーティファクトを保存します。                                            | **Job ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>container`などのディレクトリの下に表示されます。                                     |
| ワークスペース  | ワークフローの期間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                       |
| キャッシュ    | 数か月       | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と 適切な `key` を使ってキャッシュを復元する。 |


{: class="table table-striped"}

ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。



## Docker レイヤー キャッシュ

{: #docker-layer-caching }

Docker Layer Caching  (DLC ) により、 ジョブにおいてビルドされた Docker イメージの個々のレイヤーがキャッシュされます。 変更されていないレイヤーは、毎回イメージを再ビルドするのではなく、後続の実行において使用されます。

下記の `config.yml` スニペットでは、`build_elixir` ジョブで `ubuntu-2004:202104-01` Dockerfile を使ってイメージをビルドしています。 `machine` executor キーの下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI が各 Docker イメージレイヤーを確実に保存するようになります。



```yaml
version: 2.1
jobs:
  build_elixir:
    machine:
      image: ubuntu-2004:202104-01
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: build Elixir image
          command: docker build -t circleci/elixir:example .
```


後続のコミットでは、Dockerfile が変更されていない場合、DLC は ` build Elixir image`のステップでキャッシュから各 Docker イメージレイヤーをプルし、イメージのビルドが著しく高速化します。

詳細は、[Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/docker-layer-caching/)を参照して下さい。




## ダイナミックコンフィグ

{: #dynamic-configuration }

各プロジェクトの設定を手動で作成する代わりに、特定のパイプラインパラメーターまたはファイルパスに基づいて、この設定を動的に生成することができます。 これは、チームがモノレポ（単一のリポジトリ）で作業している場合に特に役立ちます。 ダイナミックコンフィグを使うと、プロジェクトの*特定の*部分からビルドをトリガーできます。毎回すべてを再ビルドする必要はありません。

詳細は、[ダイナミックコンフィグ]({{ site.baseurl }}/ja/dynamic-config/)を参照して下さい。



## 実行環境

{: #execution-environments }

設定内で定義された個々のジョブは、一意の実行環境で実行されます。 CircleCI ではこれらを *Executor* と呼んでいます。 Executor は、Docker コンテナまたは Linux、Windows、または macOS を実行する仮想マシンです。

![ジョブの図]( {{ site.baseurl }}/assets/img/docs/executor_types.png)

Executor ごとにイメージを定義することができます。 イメージは、実行コンテナや仮想マシンを作成するための指示を含むパッケージ化されたシステムです。 CircleCI では、 Docker の Executor で使用するさまざまなイメージを提供しています。これを _CircleCI イメージ_ と呼んでいます。 ビルド済み CircleCI Docker イメージの詳細については、[こちら]({{ site.baseurl }}/ja/circleci-images/)を参照してください。

{:.tab.executors.Cloud}


```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 20.04 image with Docker 20.10.12
   # and docker-compose 1.29.2, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-2004:202201-02
#...
 image: ubuntu-2004:202010-01
#...
```


{:.tab.executors.Server}


```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: true
   # Contact your system administrator for details of the image.
#...
```


{:.tab.executors.Server_2}


```yaml
version: 2

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: true # Specifies a machine image.
   # Contact your system administrator for details of the image.
#...
```


プライマリコンテナは、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルに最初にリストされているイメージによって定義されます。 ここでコマンドが実行されます。 Docker Executor は、Docker イメージを使用してコンテナを起動します。 Machine Executor は完全な Ubuntu 仮想マシン イメージを起動します。 比較表と考慮事項については、[Executor の概要]({{ site.baseurl }}/ja/executor-intro/)を参照してください。 さらにイメージを追加して、セカンダリ / サービスコンテナをスピンアップできます。

Docker Executor を使って Docker コマンドを実行する際のセキュリティを強化するために、`setup_remote_docker` キーを使用して、これらのコマンドを実行する別の Docker コンテナをスピンアップできます。 詳細は、[Docker コマンドの実行]({{ site.baseurl }}/ja/building-docker-images/#accessing-the-remote-docker-environment)ガイドを参照して下さい。

**注:** macOS は CircleCI Server v 2.x. では使用できません。



## イメージ

{: #images }

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 プライマリコンテナは、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルに最初にリストされているイメージによって定義されます。 ここで、Docker または Machine Executor を使用してジョブのコマンドが実行されます。

**Docker Executor** は、Docker イメージを使用してコンテナをスピンアップします。 CircleCI では一般的なプログラミング言語に対応する[CircleCI イメージ]({{ site.baseurl }}/ja/circleci-images/)を Docker Hub 上に用意しています。

**Machine Executor** は完全な Ubuntu 仮想マシンイメージをスピンアップします。これにより、OS リソースへのフルアクセスやジョブ環境の完全な制御が可能になります。 詳細は、[マシンの使用]({{ site.baseurl}}/ja/configuration-reference/#machine)を参照して下さい。

詳細は、[実行環境の概要]({{ site.baseurl }}/ja/executor-intro/)のページを参照してください。



 ```yaml
 version: 2.1
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: cimg/base:2022.04-20.04
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

       - image: postgres:14.2 # Specifies the database image
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: user
...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 20.04 image.
     # The image uses the current tag, which always points to the most recent
     # supported release. If stability and determinism are crucial for your CI
     # pipeline, use a release date tag with your image, e.g. ubuntu-2004:202201-02
       image: ubuntu-2004:current
...
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
       xcode: "12.5.1"
 ...
 ```



## ジョブ

{: #jobs }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行する[ステップ](#steps)の集まりです。 各ジョブでは、`docker`、`machine`、`windows`、`macos` のいずれかの Executor を宣言する必要があります。 `docker` の場合、プライマリコンテナで使うには[イメージを指定する]({{site.baseurl}}/ja/executor-intro/#docker)必要があります。 `macos` の場合、[Xcode のバージョン]({{site.baseurl}}/ja/executor-intro/#macos)を指定する必要があります。 `windows` の場合、[Windows Orb]({{site.baseurl}}/ja/executor-intro/#windows) を指定する必要があります。

![ジョブの図]( {{ site.baseurl }}/assets/img/docs/job.png)


## Orb

{: #orbs }

Orb は、再利用可能なコードスニペットです。Orb を使用すると、繰り返しのプロセスを自動化でき、手早くプロジェクトをセットアップできます。サードパーティ製ツールとの連携も容易になります。 設定ファイルで Orb を使用する方法と Orb 設計の概要については、[Orb のコンセプト]({{ site.baseurl }}/ja/orb-concepts/)を参照してください。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)では、構成作業の簡素化に役立つ Orb を検索できます。

[設定](#configuration)セクションの図は、Orb を使用して Java 設定を簡素化する例です。 下記の図では、[Maven Orb](https://circleci.com/developer/orbs/orb/circleci/maven) を使って簡易化された設定を紹介しています。 ここでは Orb は、Maven でステップを実行し共通のジョブを実行できるデフォルトの Exexcutor を設定しています (`maven/test` ) 。

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/config-elements-orbs.png)


## 並列実行

{: #parallelism }

プロジェクトに含まれるテストの数が多いほど、テストを 1 台のマシンで実行するのに時間がかかるようになります。  _並列実行_ により、指定した数の別々の Executor にテストを分散することができます。

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/jobs-steps/#sample-configuration-with-concurrent-jobs)レベルで定義します。 `parallelism` キーには、ジョブのステップを実行するためにセットアップする独立した Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 1 よりも大きい値を設定します。



```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```


![並列実行]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

詳細は、[テストの並列実行]({{ site.baseurl }}/ja/parallelism-faster-jobs/)を参照して下さい。



## パイプライン

{: #pipelines }

CircleCI パイプラインとは、プロジェクトで作業をトリガする際に実行する一連のプロセスすべてを指します。 パイプラインには、ジョブを管理するワークフローが含まれます。 これらは全てプロジェクトの[設定ファイル](#configuration)で定義されます。 ハイプラインは CircleCI Server v2.x では使用できません。

パイプラインとは、設定と対話するための手法です。

{% include snippets/ja/pipelines-benefits.adoc %}



## プロジェクト

{: #projects }

CircleCI のプロジェクトは、お客様の[バージョンコントロールシステム]({{ site.baseurl }}/ja/gh-bb-integration/) (VCS) 内の、関連するコードリポジトリの名前を共有します。 CircleCI アプリのサイドバーから **Projects** を選択し、プロジェクトダッシュボードに入力します。 ここからアクセス可能なプロジェクトの設定やフォローが可能です。

プロジェクトダッシュボードで、以下のいずれかを実行します。

* VCS で所有者になっているプロジェクトを _セットアップ_ する.
* 組織内のプロジェクトを _フォロー_ して、パイプラインにアクセスし、プロジェクトのステータスに関する[メール通知]({{site.baseurl }}/ja/notifications/)を受け取る

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)



## リソースクラス

{: #resource-class}

リソースクラスは、ジョブで利用可能なコンピューティングリソースを制御できる設定オプションです。 ジョブの実行環境を指定すると、[設定ファイル]({{site.baseurl}}/ja/configuration-reference#resourceclass)でリソースクラスが定義されて _いない場合_ 、その環境にはデフォルトのリソースクラスの値が設定されます。 デフォルト値にするよりもリソースクラスを指定することをお勧めします。

下記の例では Docker 実行環境でリソースクラスを定義する方法を紹介します。



```yaml
jobs:
  build:
    docker:
      - image: cimg/node:current
    resource_class: large
```


すべての実行環境の例は、下記ページでご確認いただけます。

* [Docker 実行環境の使用]({{site.baseurl}}/ja/using-docker)
* [Linux VM 実行環境の使用]({{site.baseurl}}/ja/using-linuxvm)
* [macOS 実行環境の使用]({{site.baseurl}}/ja/using-macos)
* [Windows 実行環境の使用]({{site.baseurl}}/ja/using-windows)
* [GPU 実行環境の使用]({{site.baseurl}}/ja/using-gpu)
* [Arm 実行環境の使用]({{site.baseurl}}/ja/using-arm)

各種リソースクラスの料金とプランに関する情報は[リソースクラス](https://circleci.com/ja/product/features/resource-classes/)製品のページをご覧ください。

`resource_class` キーは、[セルフホストランナーインスタンス]({{site.baseurl}}/ja/runner-concepts#namespaces-and-resource-classes)の設定にも使用されます。



## 手順

{: #steps }

ステップは通常、ジョブを完了するために必要な実行可能コマンドの集まりです。 たとえば以下の例では、[`checkout`]({{ site.baseurl }}/ja/configuration-reference/#checkout) ステップ (すべての CircleCI プロジェクトで使用できるビルトインステップ) が SSH コマンドでジョブのソースコードをチェックアウトします。 次に、`run` ステップで、デフォルトで非ログインシェルを使用して、`make test` コマンドなどのカスタムコマンドを実行します。 コマンドは、 [ジョブ宣言の外部]({{ site.baseurl }}/ja/configuration-reference/#commands-requires-version-21) に定義することもでき、設定全体で再利用することができます。



```yaml
#...
jobs:
  build:
    docker:
      - image: <image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout # Special step to checkout your source code
      - run: # Run step to execute commands, see
      # circleci.com/docs/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.
#...
```




## ユーザー種別

{: #user-types }

ここでは CircleCI プロジェクトに関連するユーザータイプを紹介します。 多くのユーザーは、 VCS アカウントから継承された権限を持っています。

* *組織の管理者*とは、 VCS から継承された権限レベルのことです。 
    * GitHub: **オーナー** であり、CircleCI 上の少なくとも 1 つのプロジェクトビルドをフォローしています。
  * Bitbucket: **管理者**であり、CircleCI の少なくとも 1 つのプロジェクトのビルドをフォローしています。
* *プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーを指します。

* *ユーザー*とは、組織内の個々のユーザーを指します。

* CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl }}/ja/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。



## ワークフロー

{: #workflows }

ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、並列実行、順次実行、スケジュールに基づいて実行、あるいは承認ジョブを使用して手動ゲートで実行することができます。

{:.tab.workflows.Cloud}

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_3}

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_2}

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

下記の設定サンプルでは、`build_and_test` というワークフローを紹介しています。`build1` ジョブを実行し、その後 `build2` ジョブと `build3` ジョブを同時に実行します。

{:.tab.workflows-example.Cloud}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: アセットのプリコンパイル
          command: bundle exec rake assets:precompile
#...
workflows:
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```


{% endraw %}

{:.tab.workflows-example.Server_3}



{% raw %}


```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: アセットのプリコンパイル
          command: bundle exec rake assets:precompile
#...
workflows:
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```


{% endraw %}

{:.tab.workflows-example.Server_2}



{% raw %}


```yaml
version: 2

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: アセットのプリコンパイル
          command: bundle exec rake assets:precompile
#...
workflows:
  version: 2.1
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```


{% endraw %}



## 関連項目

{: #see-also }



{:.no_toc}

[はじめてのビルドの成功（グリーンビルド)]({{ site.baseurl }}/ja/getting-started/) では、動作中のパイプラインを設定する方法を順を追って紹介しています。
