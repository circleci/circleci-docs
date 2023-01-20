---
layout: classic-docs
title: コンセプト
short-title: コンセプト
description: CircleCI  のコンセプト
categories:
  - はじめよう
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

## 概要
{: #introduction }

ここでは CircleCI における CI/CD パイプラインの管理方法を理解するための基本的なコンセプトを説明します。

## 同時実行
{: #concurrency }

CircleCI では、*同時実行*とは複数のコンテナを使用して、複数のビルドを同時に実行することを指します。 To keep the system stable for all CircleCI customers, we implement different soft concurrency limits on each of the [resource classes](/docs/configuration-reference/#resource_class) for different executors. ジョブがキュー入る場合は、この制限に達している可能性が考えられます。 年間プランのお客様は、追加料金なくこの制限の拡大を依頼することができます。

See the [Concurrency](/docs/concurrency/) page for more information.

## 設定ファイル
{: #configuration }

CircleCI では *Configuration as Code* の理念を掲げています。 CI/CD プロセス全体が `config.yml` という 1 つのファイルを通じてオーケストレーションされます。 The `config.yml` file is located in a folder called `.circleci` at the root of your project that defines the entire pipeline.

Example of a directory setup using CircleCI:

```shell
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

CircleCI の設定はお客様のプロジェクトの様々なニーズに合わせて変更できます。 下記の用語は粒度と依存度の順に並べられており、最も一般的な CircleCI プロジェクトのコンポーネントを表しています。

- **[パイプライン](#pipelines)**: 設定全体を表します  (Server v2.x では利用できません)。
- **[ワークフロー](#workflows)**: 複数の _ジョブ_ のオーケストレーションを行います。
- **[ジョブ](#jobs)**: コマンドを実行する一連の _ステップ_ を実行します。
- **[ステップ](#steps)**: 依存関係のインストールやテストの実行などのコマンドやプロジェクトに必要な作業のシェルスクリプトを実行します。

The following illustration uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various configuration elements:

![設定要素]({{site.baseurl}}/assets/img/docs/config-elements.png)

CircleCI configurations use YAML. See the [Writing YAML](/docs/writing-yaml) page for basic guidance. For a full overview of what is possible in a configuration file, see the [Configuration reference](/docs/configuration-reference) page.

## コンテキスト
{: #contexts }

コンテキストは、環境変数を保護し、プロジェクト間で共有するためのメカニズムを提供します。 環境変数は、名前と値のペアとして定義され、実行時に挿入されます。 After a context has been created, you can use the `context` key in the workflows section of a project's `.circleci/config.yml` file to give any job(s) access to the environment variables associated with the context.

{:.tab.contextsimage.Cloud}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![コンテキストの概要]({{site.baseurl}}/assets/img/docs/contexts_server.png)

See the [Using contexts]({{site.baseurl}}/contexts/) page for more information.

## データの永続化
{: #data-persistence }

データの永続化により、ジョブ間でデータを動かし、ビルドを高速化することができます。 There are three main methods for persisting data in CircleCI: artifacts, caches, and workspaces.

![ワークフローの図]({{site.baseurl}}/assets/img/docs/workspaces.png)

Note the following distinctions between artifacts, caches and workspaces:

| タイプ      | ライフタイム   | 使用                                                          | 例                                                                                                                                              |
| -------- | -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月      | アーティファクトを長期間保存する。                                           | Available in the Artifacts tab of the **Job** page under the `tmp/circle-artifacts.<hash>/container` or similar directory.               |
| キャッシュ    | 数か月      | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存する。                | `save_cache` ジョブ ステップで、追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定します。 `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
| ワークスペース  | ワークフローの間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチする。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                          |
{: class="table table-striped"}

See [Persisting data in workflows: When to use caching, artifacts, and workspaces guide](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces) for additional conceptual information about using artifacts, caches, and workspaces.

### アーティファクト
{: #artifacts }

アーティファクトにはワークフローが完了した後もデータが維持され、ビルド プロセス出力の長期ストレージとして使用できます。

{:.tab.workspace.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
#...
    steps:
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace for use in downstream job. Must be an absolute path,
      # or relative path from working_directory. This is a directory on the container which is
      # taken to be the root directory of the workspace.
          root: workspace
            # Must be relative path from root
          paths:
            - echo-output

  build2:
#...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
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
      # into the workspace for use in downstream job. Must be an absolute path,
      # or relative path from working_directory. This is a directory on the container which is
      # taken to be the root directory of the workspace.
          root: workspace
            # Must be relative path from root
          paths:
            - echo-output

  build2:
#...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
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
      # into the workspace for use in downstream job. Must be an absolute path,
      # or relative path from working_directory. これは、ワークスペースの
      # ルート ディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
            # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  build2:
#...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
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

See the [Storing build artifacts](/docs/artifacts) page for more information.

### キャッシュ
{: #caches }

キャッシュは、依存関係、ソースコードなどを 1つのファイルとして、または複数のファイルが入ったディレクトリとしてオブジェクトストレージに格納します。 ビルドを高速化するために、各ジョブには、以前のジョブからの依存関係をキャッシュするための特別な手順が含まれている場合があります。

If you need to clear your cache, refer to the [Caching dependencies](/docs/caching/#clearing-cache) page for more information.

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

For more information see the [Caching dependencies](/docs/caching) and [Caching strategies](/docs/caching-strategy) pages.

### ワークスペース
{: #workspaces }

ワークスペースは、ワークフロー対応のストレージメカニズムです。 ワークスペースには、ダウンストリームジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 ワークフロー1 つ 1 つは、それぞれに一時的なワークスペースが関連付けられています。  ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。

See the [Using workspaces](/docs/workspaces) page for more information.

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

Docker layer caching (DLC) caches the individual layers of Docker images built during your CircleCI jobs. 変更されていないレイヤーは、毎回イメージを再ビルドするのではなく、後続の実行において使用されます。

In the `.circle/config.yml` snippet below, the `build_elixir` job builds an image using the `ubuntu-2004:202104-01` Dockerfile. `machine` executor キーの下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI が各 Docker イメージレイヤーを確実に保存するようになります。

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

See the [Docker layer caching](/docs/docker-layer-caching) page for more information.


## ダイナミックコンフィグ
{: #dynamic-configuration }

各プロジェクトの設定を手動で作成する代わりに、特定のパイプラインパラメーターまたはファイルパスに基づいて、この設定を動的に生成することができます。 これは、チームがモノレポ（単一のリポジトリ）で作業している場合に特に役立ちます。 ダイナミックコンフィグを使うと、プロジェクトの*特定の*部分からビルドをトリガーできます。毎回すべてを再ビルドする必要はありません。

See the [Dynamic configuration](/docs/dynamic-config) page for more information.

## 実行環境
{: #execution-environments }

Each separate job defined within your configuration runs in a unique execution environment, known as executors. An executor can be a Docker container, or a virtual machine running Linux, Windows, or macOS. In some of these instances, you can set up an environment using GPU, or Arm. CircleCI also provides a machine-based and container-based self-hosted runner solution.

![Illustration of a CircleCI job]( {{site.baseurl}}/assets/img/docs/executor_types.png)

An _image_ is a packaged system that includes instructions for creating a running container or virtual machine, and you can define an image for each executor. CircleCI provides a range of images for use with the Docker executor, called _convenience images_ (details in the [images](#images) section).

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

The primary container is defined by the first image listed in `.circleci/config.yml` file. ここでコマンドが実行されます。 Docker Executor は、Docker イメージを使用してコンテナを起動します。 Machine Executor は完全な Ubuntu 仮想マシンイメージをスピンアップします。 さらにイメージを追加して、セカンダリ / サービスコンテナをスピンアップできます。

Docker Executor を使って Docker コマンドを実行する際のセキュリティを強化するために、`setup_remote_docker` キーを使用して、これらのコマンドを実行する別の Docker コンテナをスピンアップできます。 For more information see the [Running Docker commands](/docs/building-docker-images/#accessing-the-remote-docker-environment) page.

macOS is not available on installations of CircleCI server v2.x.
{: class="alert alert-info"}

For more information, see the [Execution environments overview](/docs/executor-intro) page.

## イメージ
{: #images }

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 The primary container is defined by the first image listed in a `.circleci/config.yml` file. ここで、Docker または Machine Executor を使用してジョブのコマンドが実行されます。

**Docker Executor** は、Docker イメージを使用してコンテナをスピンアップします。 CircleCI maintains [convenience images](/docs/circleci-images) for popular languages on Docker Hub.

**Machine Executor** は完全な Ubuntu 仮想マシンイメージをスピンアップします。これにより、OS リソースへのフルアクセスやジョブ環境の完全な制御が可能になります。 For more information, see the [Using machine](/docs/configuration-reference#machine) page.

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

 See the [Images](/docs/circleci-images) page for more information.

## ジョブ
{: #jobs }

Jobs are the building blocks of your configuration. また、必要に応じてコマンド / スクリプトを実行する[ステップ](#steps)の集まりです。 各ジョブでは、`docker`、`machine`、`windows`、`macos` のいずれかの Executor を宣言する必要があります。 For `docker` you must [specify an image](/docs/executor-intro#docker) to use for the primary container. For `macos` you must specify an [Xcode version](/docs/executor-intro#macos). For `windows` you must use the [Windows orb](/docs/executor-intro#windows).

![Illustration of a CircleCI job]({{site.baseurl}}/assets/img/docs/job.png)

See the [Jobs and steps](/docs/jobs-steps) page for more information.

## Orb
{: #orbs }

Orb は、再利用可能なコードスニペットです。Orb を使用すると、繰り返しのプロセスを自動化でき、手早くプロジェクトをセットアップできます。サードパーティ製ツールとの連携も容易になります。

[設定](#configuration)セクションの図は、Orb を使用して Java 設定を簡素化する例です。 下記の図では、[Maven Orb](https://circleci.com/developer/orbs/orb/circleci/maven) を使って簡易化された設定を紹介しています。 ここでは Orb は、Maven でステップを実行し共通のジョブを実行できるデフォルトの Exexcutor を設定しています (`maven/test` ) 。

<!-- Turn this into a config snippet -->
![Configuration using Maven orb]({{site.baseurl}}/assets/img/docs/config-elements-orbs.png)

See [Using orbs](/docs/orb-concepts) for details on how to use orbs in your configuration and an introduction to orb design. Visit the [Orbs registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your configuration.

## 並列実行
{: #parallelism }

プロジェクトに含まれるテストの数が多いほど、テストを 1 台のマシンで実行するのに時間がかかるようになります。  _並列実行_ により、指定した数の別々の Executor にテストを分散することができます。

Test suites are conventionally defined at the [job](/docs/jobs-steps#sample-configuration-with-concurrent-jobs) level in your `.circleci/config.yml` file. `parallelism` キーにより、ジョブのステップを実行するためにセットアップする独立した Executor の数を指定します。

To run a job's steps in parallel, set the `parallelism` key to a value greater than `1`.

```yaml
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

![Executor types with parallelism]({{site.baseurl}}/assets/img/docs/executor_types_plus_parallelism.png)

See [Running tests in parallel](/docs/parallelism-faster-jobs) page for more information.

## パイプライン
{: #pipelines }

CircleCI パイプラインとは、プロジェクトで作業をトリガする際に実行する一連のプロセスすべてを指します。 パイプラインには、ジョブを管理するワークフローが含まれます。 これらは全てプロジェクトの[設定ファイル](#configuration)で定義されます。 **Pipelines are not available on CircleCI server v2.x.**

パイプラインとは、設定と対話するための手法です。

{% include snippets/ja/pipelines-benefits.adoc %}

See the [Pipelines overview](/docs/pipelines) page for more information.

## Projects
{: #projects }

A CircleCI project shares the name of the associated code repository in your VCS. CircleCI アプリのサイドバーから **Projects** を選択し、プロジェクトダッシュボードに入力します。 On the dashboard, you can set up and follow the projects you have access to. There are two options:

* VCS で所有者になっているプロジェクトを _セットアップ_ する.
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications](/docs/notifications/) for the project's status.

![Project dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

See the [Projects overview](/docs/projects) page for more information.

## リソースクラス
{: #resource-class}

リソースクラスは、ジョブで利用可能なコンピューティングリソースを制御できる設定オプションです。 When you specify an execution environment for a job, a default resource class value for the environment will be set _unless_ you define the resource class in your configuration. デフォルト値にするよりもリソースクラスを指定することをお勧めします。

下記の例では Docker 実行環境でリソースクラスを定義する方法を紹介します。

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:current
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    # resource class declaration
    resource_class: large
```

すべての実行環境の例は、下記ページでご確認いただけます。

* [Docker 実行環境の使用](/docs/using-docker)
* [Linux VM 実行環境の使用](/docs/using-linuxvm)
* [macOS 実行環境の使用](/docs/using-macos)
* [Windows 実行環境の使用](/docs/using-windows)
* [GPU 実行環境の使用](/docs/using-gpu)
* [Arm 実行環境の使用](/docs/using-arm)

Pricing and plans information for the various resource classes can be found on the [Resource classes](https://circleci.com/product/features/resource-classes/) product page.

The `resource_class` key is also used to configure a [self-hosted runner instance](/docs/runner-concepts#namespaces-and-resource-classes).

## 手順
{: #steps }

 Steps are a collection of the executable commands required to complete your job. For example, the [`checkout`](/docs/configuration-reference#checkout) step (which is a built-in step available across all CircleCI projects) checks out the source code for a job over SSH. 次に、`run` ステップで、デフォルトで非ログインシェルを使用して、`make test` コマンドなどのカスタムコマンドを実行します。 Commands can also be defined [outside the job declaration](/docs/configuration-reference#commands-requires-version-21), making them reusable across your configuration.

```yaml
version: 2.1

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

```
See the [Jobs and steps](/docs/jobs-steps) page for more information.

## ユーザー種別
{: #user-types }

CircleCI has various user types with permissions inherited from VCS accounts.

* *組織の管理者*とは、 VCS から継承された権限レベルのことです。
  * GitHub: **オーナー** であり、CircleCI 上の少なくとも 1 つのプロジェクトビルドをフォローしています。
  * Bitbucket: **管理者**であり、CircleCI の少なくとも 1 つのプロジェクトのビルドをフォローしています。
  * GitLab: **Admin** and following at least one project building on CircleCI.
* The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project.
* *ユーザー*とは、組織内の個々のユーザーを指します。
* CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 Users must be added to an org in the VCS to view or follow associated CircleCI projects. ユーザーは、環境変数に保存されているプロジェクトデータを表示することはできません。

## ワークフロー機能
{: #workflows }

ワークフローは、ジョブをオーケストレーションします。 ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、同時実行、順次実行、スケジュール実行、あるいは承認ジョブを使用した手動ゲートによる実行が可能です。

{:.tab.workflows.Cloud}
![Workflows illustration cloud](/docs/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_3}
![Workflows illustration server 3](/docs/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_2}
![Workflows illustration server 2](/docs/assets/img/docs/workflow_detail.png)

The following configuration example shows a workflow called `build_and_test` in which the job `build1` runs and then jobs `build2` and `build3` run concurrently:

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

See the [Using workflows](/docs/workflows) page for more information.

## 関連項目
{: #see-also }

- [Your First Green Build](/docs/getting-started) guides you step-by-step through setting up a working pipeline.
