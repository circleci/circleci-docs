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
  - Server v3.x
  - Server v2.x
---

ここでは CircleCI における CI/CD パイプラインの管理方法を理解するための基本的なコンセプトを説明します。

* 目次
{:toc}

## プロジェクト
{: #projects }

CircleCI のプロジェクトは、お客様の[バージョンコントロールシステム]({{ site.baseurl }}/2.0/gh-bb-integration/) (VCS)内の、関連するコードリポジトリの名前を共有します。 Click **Add Project** in the CircleCI application to enter the Projects dashboard. From here you can set up and follow the projects you have access to.

プロジェクトのダッシュボードで、以下のいずれかを実行します。
* VCS で所有者になっているプロジェクトを_セットアップ_する.
* 組織内のプロジェクトを_フォロー_して、パイプラインにアクセスし、プロジェクトのステータスに関する[メール通知]({{site.baseurl }}/ja/2.0/notifications/)を受け取る

![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

## 設定
{: #configuration }

CircleCI は *Configuration as Code* を貫いています。 継続的インテグレーションとデプロイのプロセス全体が `config.yml` という 1 つのファイルを通じてオーケストレーションされます。 `config.yml` ファイルは、プロジェクトの最上部にある `.circleci` というフォルダーに置かれます。 CircleCI uses the YAML syntax for config. See the [Writing YAML]({{ site.baseurl }}/2.0/writing-yaml/) document for a basic introduction.

```shell
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

`config.yml` は、プロジェクトの全パイプラインを定義する強力な YAML ファイルです。 使用される様々なキーの概要については、[設定ファイルのリファレンス]({{ site.baseurl }}/2.0/configuration-reference/)をご覧ください。

CircleCI の設定はお客様のプロジェクトの様々なニーズに合わせて変更できます。 下記の用語は粒度と依存度の順に並べられており、最も一般的な CircleCI プロジェクトのコンポーネントを表しています。

- **[Pipeline](#pipelines)**: Represents the entirety of your configuration. Available in CircleCI Cloud only.
- **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。
- **[Jobs](#jobs)**: Responsible for running a series of _steps_ that perform commands.
- **[Steps](#steps)**: Run commands (such as installing dependencies or running tests) and shell scripts to do the work required for your project.

The following illustration uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various config elements:

![設定要素]({{ site.baseurl }}/assets/img/docs/config-elements.png)

## ユーザー種別
{: #user-types }

Here are the user types relating to CircleCI projects. Many of them have permissions inherited from VCS accounts

* The *Organization Administrator* is a permission level inherited from your VCS:
  * GitHub: **Owner** and following at least one project building on CircleCI.
  * Bitbucket: **Admin** and following at least one project building on CircleCI.
* *プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。
* *ユーザー*とは、組織内の個々のユーザーです。
* CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl }}/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。


## パイプライン
{: #pipelines }

A CircleCI pipeline is the full set of processes you run when you trigger work on your projects. Pipelines encompass your workflows, which in turn coordinate your jobs. This is all defined in your project [configuration file](#configuration). Pipelines are not available on CircleCI server v2.x.

Pipelines represent methods for interacting with your configuration:

{% include snippets/pipelines-benefits.adoc %}

## ワークフロー
{: #orbs }

Orbs are reusable snippets of code that help automate repeated processes, accelerate project setup, and make it easy to integrate with third-party tools. See [Using Orbs]({{ site.baseurl }}/2.0/orb-concepts/) for details on how to use orbs in your config and an introduction to orb design. [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)では、構成作業の簡素化に役立つ Orb を検索できます。

The illustration above showing an example Java configuration could be simplified using orbs. The following illustration demonstrates a simplified configuration with [the Maven orb](https://circleci.com/developer/orbs/orb/circleci/maven). Here, the orb sets up a default executor that can execute steps with Maven and run a common job (`maven/test`).

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/config-elements-orbs.png)

## ジョブ
{: #jobs }

Jobs are the building blocks of your config. Jobs are collections of [steps](#steps), which run commands/scripts as required. Each job must declare an executor that is either `docker`, `machine`, `windows`, or `macos`. `machine` includes a [default image](https://circleci.com/docs/2.0/executor-intro/#machine) if not specified. For `docker` you must [specify an image](https://circleci.com/docs/2.0/executor-intro/#docker) to use for the primary container. For `macos` you must specify an [Xcode version](https://circleci.com/docs/2.0/executor-intro/#macos). For `windows` you must use the [Windows orb](https://circleci.com/docs/2.0/executor-intro/#windows).

![ジョブの図]( {{ site.baseurl }}/assets/img/docs/job.png)

## 実行環境
{: #execution-environments }

Each separate job defined within your config runs in a unique Execution environment. We call them *executors*. An executor can be a Docker container or a virtual machine running Linux, Windows, or macOS.

![ジョブの図]( {{ site.baseurl }}/assets/img/docs/executor_types.png)

You can define an image for each executor. An image is a packaged system that includes instructions for creating a running container or virtual machine. CircleCI provides a range of images for use with the Docker executor. For more information, see the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) guide.

{:.tab.executors.Cloud}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: buildpack-deps:trusty
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:9.4.1 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/2.0/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: root
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 20.04 image with Docker 19.03.13
   # and docker-compose 1.27.4, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-2004:202010-01
#...
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
     xcode: "12.5.1"
# ...
```

{:.tab.executors.Server}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: buildpack-deps:trusty
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:9.4.1 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/2.0/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: root
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 20.04 image with Docker 19.03.13
   # and docker-compose 1.27.4, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-2004:202010-01
#...
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
     xcode: "12.5.1"
# ...
```

{:.tab.workspace.Server}
```yaml
version: 2.0

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: buildpack-deps:trusty
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:9.4.1 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/2.0/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: root
#...
 build2:
     machine: # Docker 17.06.1-ce および docker-compose 1.14.0 と
     # 共に Ubuntu バージョン 14.04 イメージを使用する
     # マシン イメージを指定します。 新しいイメージのリリースについては、
     # CircleCI Discuss の「Announcements」をフォローしてください。
       image: circleci/classic:201708-01
#...
     image: ubuntu-1604:201903-01
#...
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
     xcode: "12.5.1"
# ...
```

The primary container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed. Docker Executor は、Docker イメージを使用してコンテナを起動します。 Machine Executor は完全な Ubuntu 仮想マシン イメージを起動します。 比較表と考慮事項については、「[Executor タイプの選び方]({{ site.baseurl }}/2.0/executor-types/)」を参照してください。 Further images can be added to spin up secondary/service containers.

For added security when using the Docker executor and running Docker commands, the `setup_remote_docker` key can be used to spin up another Docker container in which to run these commands. For more information see the [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/#accessing-the-remote-docker-environment) guide.

**Note:** macOS is not available on installations of CircleCI server v2.x.

## ステップ
{: #steps }

 Steps are usually a collection of the executable commands required to complete your job. For example, the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step (which is a built-in step available across all CircleCI projects) checks out the source code for a job over SSH. The `run` step allows you to run custom commands, such as executing the command `make test`, using a non-login shell by default. Commands can also be defined [outside the job declaration]({{ site.baseurl }}/2.0/configuration-reference/#commands-requires-version-21), making them reusable across your config.

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
      # circleci.com/docs/2.0/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.
#...
```

## イメージ
{: #images }

An image is a packaged system that includes instructions for creating a running container. The primary container is defined by the first image listed in a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed for jobs, using the Docker or machine executor.

The **Docker executor** spins up a container with a Docker image. CircleCI maintains [convenience images]({{ site.baseurl }}/2.0/circleci-images/) for popular languages on Docker Hub.

The **machine executor** spins up a complete Ubuntu virtual machine image, giving you full access to OS resources and complete control over the job environment. For more information, see the [Using machine]({{ site.baseurl}}/2.0/executor-types/#using-machine) doc.

比較表と考慮事項については、「[Executor タイプを選択する]({{ site.baseurl }}/ja/2.0/executor-types/)」を参照してください。

 ```yaml
 version: 2
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/2.0/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: buildpack-deps:trusty
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

       - image: postgres:9.4.1 # Specifies the database image
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/2.0/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: root
...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 16.04 image
     # follow CircleCI Discuss Announcements
     # for new image releases.
       image: ubuntu-1604:202007-01
...
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
       xcode: "12.5.1"
 ...
 ```

## ワークフローの図
{: #workflows }

ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、並列実行、順次実行、スケジュールに基づいて実行、あるいは承認ジョブを使用して手動ゲートで実行することができます。

{:.tab.workflows.Cloud}
![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_3}
![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_2}
![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

The following config example shows a workflow called `build_and_test` in which the job `build1` runs and then jobs `build2` and `build3` run concurrently:

{:.tab.workflows-example.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...
workflows:
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/2.0/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```
{% endraw %}

{:.tab.cache.Server}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...
workflows:
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/2.0/workflows/ for more examples.
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
    docker: # 各ジョブで Executor (docker、macos、machine)
    # を指定する必要があります。 これらの比較や他の例
    # については、circleci.com/ja/docs/2.0/executor-types/
    # を参照してください。
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # 環境変数のキャッシュ キー テンプレートを
      # 使用して、依存関係をキャッシュします。
      # circleci.com/ja/docs/2.0/caching/ を参照してください。
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # キャッシュされた依存関係を復元します。
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...
workflows:
  version: 2
  build_and_test: # ワークフロー名。
    jobs:
      - build1
      - build2:
          requires:
           - build1 # build1 ジョブが正常に完了するのを待ってから開始します。
           # この他の例については、circleci.com/ja/docs/2.0/workflows/ を参照してください。
      - build3:
          requires:
           - build1 # build1 ジョブが正常に完了するのを待ってから、
           # 時間を節約するために build2 と build 3 の並列実行を開始します。
```
{% endraw %}

## Data Persistence
{: #data-persistence }

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

### キャッシュ

キャッシュは、依存関係、ソースコードなどを 1つのファイルとして、または複数のファイルが入ったディレクトリとしてオブジェクトストレージに格納します。 To speed up the build, each job may contain special steps for caching dependencies from previous jobs.

If you need to [clear your cache](https://circleci.com/docs/2.0/caching/#clearing-cache), refer to the [Caching Dependencies](https://circleci.com/docs/2.0/caching/) page for more information on caching.

{:.tab.cache.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/2.0/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
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
version: 2

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.
      version: 2
jobs:
  build1:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # キャッシュ キーで依存関係をキャッシュします。
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # キャッシュされた依存関係を復元します。
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: テストの実行
          command: make test
  build3:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # キャッシュされた依存関係を復元します。
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: アセットのプリコンパイル
          command: bundle exec rake assets:precompile
#...
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
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/2.0/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: circleci/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```
{% endraw %}

### ワークスペース

ワークスペースは、ワークフロー対応のストレージ メカニズムです。 ワークスペースには、ダウンストリームジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 Workflows 1 つ 1 つは、それぞれに一時的な Workspace が関連付けられています。  ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。

### アーティファクト

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
        # 絶対パスまたは working_directory からの相対パスでなければなりません。
          at: /tmp/workspace
  build3:
#...
    steps:
      - store_artifacts: # See circleci.com/docs/2.0/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```
{% endraw %}

{:.tab.workspace.Server_3}
{% raw %}
```yaml
version: 2
jobs:
  build1:
#...
    steps:

      - persist_to_workspace: # ダウンストリーム ジョブで使用するために、指定されたパス
      # (workspace/echo-output) をワークスペースに維持します。 このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 This is a directory on the container which is
      # taken to be the root directory of the workspace.
          これは、ワークスペースの
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
      - store_artifacts: # 詳細については、circleci.com/ja/docs/2.0/artifacts/ を参照してください。
          path: /tmp/artifact-1
          destination: artifact-file
#...
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
      - store_artifacts: # See circleci.com/docs/2.0/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```
{% endraw %}

Note the following distinctions between artifacts, workspaces, and caches:

| 型        | ライフタイム    | 用途                                                           | 例                                                                                                                                           |
| -------- | --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月       | 長期アーティファクトを保存します。                                            | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。                           |
| ワークスペース  | ワークフローの期間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                       |
| キャッシュ    | 数か月       | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と 適切な `key` を使ってキャッシュを復元する。 |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

## 関連項目
{: #see-also }
{:.no_toc}

`jobs` と `steps` のキーとオプションの使用方法については、「[Orb、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/2.0/jobs-steps/)」を参照してください。
