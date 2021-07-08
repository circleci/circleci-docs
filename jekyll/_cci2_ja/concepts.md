---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI 2.0 のコンセプト"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

This guide introduces some basic concepts to help you understand how CircleCI manages your CICD pipelines.

* 目次
{:toc}

## プロジェクトの追加ページ
{: #projects }

CircleCI プロジェクトは、関連付けられているコード リポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。 プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

{:.tab.addprojectpage.Cloud}
* [Add Project (プロジェクトの追加)] ページでは、VCS で所有者になっているプロジェクトを*セットアップ*するか、組織内のプロジェクトを*フォロー*することで、パイプラインにアクセスし、プロジェクトのステータスに関する\[メール通知\]({{site.baseurl }}/2.0/notifications/)を受け取ることができます。
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to \[email notifications\]({{ site.baseurl }}/2.0/notifications/) for the project's status.

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

## ステップ
{:.tab.addprojectpage.Server}

CircleCI believes in *configuration as code*. Your entire continuous integration and deployment process is orchestrated through a single file called `config.yml`.  The `config.yml` file is located in a folder called `.circleci` at the root of your project. CircleCI uses the YAML syntax for config, see the [Writing YAML]({{ site.baseurl }}/2.0/writing-yaml/) document for basics.

```bash
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

`config.yml` is a powerful YAML file that defines the entire pipeline for your project. For a full overview of the various keys that are used, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/) page for more information.

Your CircleCI configuration can be adapted to fit many different needs of your project. The following terms, sorted in order of granularity and dependence, describe the components of most common CircleCI projects:

- **[Pipeline](#pipelines)**: Represents the entirety of your configuration. Available in CircleCI Cloud only.
- **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。
- **[Jobs](#jobs)**: Responsible for running a series of _steps_ that perform commands.
- **[Steps](#steps)**: Run commands (such as installing dependencies or running tests) and shell scripts to do the work required for your project.

The following image uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various config elements:

![configuration elements]({{ site.baseurl }}/assets/img/docs/config-elements.png)

## イメージ
{: #user-types }

It is worth taking a minute to define the various user types that relate to CircleCI projects, most of which have permissions inherited from VCS accounts.

* The *Organization Administrator* is a permission level inherited from your VCS:
  * GitHub: **Owner** and following at least one project building on CircleCI
  * Bitbucket: **Admin** and following at least one project building on CircleCI
* *プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。
* *ユーザー*とは、組織内の個々のユーザーです。
* CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示またはフォローするには、ユーザーが \[GitHub または Bitbucket 組織\]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。


## ジョブ
{: #pipelines }

A CircleCI pipeline is the full set of processes you run when you trigger work on your projects. Pipelines encompass your workflows, which in turn coordinate your jobs. This is all defined in your project [configuration file](#configuration). Pipelines are not currently available for CircleCI Server.

Pipelines represent methods for interacting with your configuration:

{% include snippets/pipelines-benefits.adoc %}

## ワークフロー
{: #orbs }

Orbs are reusable snippets of code that help automate repeated processes, speed up project setup, and make it easy to integrate with third-party tools. See [Using Orbs]({{ site.baseurl }}/2.0/using-orbs/) for details about how to use orbs in your config and an introduction to orb design. Visit the [Orbs Registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your config.

The graphic above illustrating an example Java configuration could be simplified using orbs. The following illustration demonstrates a simplified configuration with [the Maven orb](https://circleci.com/developer/orbs/orb/circleci/maven). Here, the orb will setup a default executor that can execute steps with maven and run a common job (`maven/test`).

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/config-elements-orbs.png)

## 関連項目
{: #jobs }

Jobs are the building blocks of your config. Jobs are collections of [steps](#steps), which run commands/scripts as required. 各ジョブでは、`docker`、`machine`、`windows`、`macos` のいずれかの Executor を宣言する必要があります。 指定しなかった場合、`machine` には [デフォルト イメージ](https://circleci.com/ja/docs/2.0/executor-intro/#machine) が含まれます。 `docker` には、プライマリ コンテナで使用する [イメージを指定](https://circleci.com/ja/docs/2.0/executor-intro/#docker) する必要があります。 `macos` には [Xcode バージョン](https://circleci.com/ja/docs/2.0/executor-intro/#macos) を指定する必要があります。 `windows` では、[Windows Orb](https://circleci.com/ja/docs/2.0/executor-intro/#windows) を使用する必要があります。

![job illustration]( {{ site.baseurl }}/assets/img/docs/job.png)

## Executors and images
{: #executors-and-images }

Each separate job defined within your config will run in a unique executor. An executor can be a docker container or a virtual machine running Linux, Windows, or MacOS. Note, macOS is not currently available on self-hosted installations of CircleCI Server.

![job illustration]( {{ site.baseurl }}/assets/img/docs/executor_types.png)

You can define an image for each executor. An image is a packaged system that has the instructions for creating a running container or virtual machine. CircleCI provide a range of images for use with the Docker executor. For more information see the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) guide.

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
     macos: # macOS 仮想マシンと Xcode バージョン 11.3 を指定します。
       xcode: "11.3.0"
# ...
```

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。
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
   macos: # Specifies a macOS virtual machine with Xcode version 11.3
     xcode: "11.3.0"
# ...
```

The Primary Container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for a comparison table and considerations. Subsequent images can be added to spin up Secondary/Service Containers.

When using the docker executor and running docker commands, the `setup_remote_docker` key can be used to spin up another docker container in which to run these commands, for added security. For more information see the [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/#accessing-the-remote-docker-environment) guide.

## Steps
ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

ステップとは、ジョブを実行するために行う必要があるアクションのことです。 ステップは通常、実行可能なコマンドの集まりです。 たとえば以下の例では、`checkout` ステップが SSH コマンドでジョブのソース コードをチェックアウトします。 次に、`run` ステップが、デフォルトで非ログイン シェルを使用して、`make test` コマンドを実行します。 Commands can also be defined [outside the job declaration]({{ site.baseurl }}/2.0/configuration-reference/#commands-requires-version-21), making them reusable across your config.

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

## 例
`jobs` と `steps` のキーとオプションの使用方法については、「[Orb、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/ja/2.0/jobs-steps/)」を参照してください。

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 プライマリ コンテナは、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルに最初にリストされているイメージとして定義されます。 ここで、Docker または Machine Executor を使用してジョブのコマンドが実行されます。 Docker Executor は、Docker イメージを使用してコンテナを起動します。 Machine Executor は完全な Ubuntu 仮想マシン イメージを起動します。 比較表と考慮事項については、「[Executor タイプを選択する]({{ site.baseurl }}/ja/2.0/executor-types/)」を参照してください。

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
     macos: # Specifies a macOS virtual machine with Xcode version 9.0
       xcode: "9.0"
 ...
 ```

## ワークフローの図
ワークフローの図

ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、並列実行、順次実行、スケジュールに基づいて実行、あるいは承認ジョブを使用して手動ゲートで実行することができます。

{:.tab.workflows.Cloud}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

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

{:.tab.workflows-example.Server}
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
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```
{% endraw %}

## ワークスペースとアーティファクト
`attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

A cache stores a file or directory of files such as dependencies or source code in object storage. Each job may contain special steps for caching dependencies from previous jobs to speed up the build.

If there comes a time when you need to [clear your cache](https://circleci.com/docs/2.0/caching/#clearing-cache), refer to the [Caching Dependencies](https://circleci.com/docs/2.0/caching/) page for more information on caching.

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

{:.tab.cache.Server}
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

ワークスペースは、ワークフロー対応のストレージ メカニズムです。 ワークスペースには、ダウンストリーム ジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。

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

{:.tab.workspace.Server}
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

Note the following distinctions between Artifacts, Workspaces, and Caches:

| タイプ      | ライフタイム               | 用途                                                    | Example                                                                                                                                      |
| -------- | -------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月                  | 長期アーティファクトを保存します。                                     | Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container` or similar directory.             |
| ワークスペース  | Duration of workflow | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。 | The `attach_workspace` copies and re-creates the entire workspace content when it runs.                                                      |
| キャッシュ    | 数か月                  | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。         | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

## See also
{: #see-also }
{:.no_toc}

Refer to the [Jobs and Steps]({{ site.baseurl }}/2.0/jobs-steps/) document for a summary of how to use the `jobs` and `steps` keys and options.
