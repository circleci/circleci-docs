---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI 2.0 のコンセプト"
categories:
  - getting-started
order: 1
---


CircleCI プロジェクトは、関連付けられているコードリポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

* 目次 
{:toc}

## プロジェクトの追加ページ

![ヘッダー]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

ユーザーは、プロジェクトを*フォロー*することで、プロジェクトの[ビルドステータス]({{ site.baseurl }}/ja/2.0/status/)に関する[メール通知]({{ site.baseurl }}/ja/2.0/notifications/)を受け取り、プロジェクトを自分の CircleCI ダッシュボードに追加できます。

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクトデータを表示することはできません。

## ステップ

ステップとは、ジョブを実行するために行う必要があるアクションのことです。 ステップは通常、実行可能なコマンドの集まりです。 たとえば以下の例では、`checkout` ステップが SSH コマンドでジョブのソースコードをチェックアウトします。 次に、`run` ステップが、デフォルトで非ログインシェルを使用して、`make test` コマンドを実行します。

```yaml
#...
    steps:
      - checkout # ソースコードをチェックアウトする特別なステップ
      - run: # コマンドを実行する run ステップ。以下を参照してください。
      # circleci.com/docs/ja/2.0/configuration-reference/#run
          name: テストを実行
          command: make test # 実行可能なコマンド。デフォルトでは、
          # /bin/bash -eo pipefail オプションを使用して
          # 非ログインシェルで実行されます。
#...          
```

## イメージ

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 The Primary Container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed for jobs using the Docker or machine executor. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for a comparison table and considerations.

```yaml
 version: 2
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/2.0/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: buildpack-deps:trusty

       - image: postgres:9.4.1 # Specifies the database image
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/2.0/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: root
...
   build2:
     machine: # Docker 17.06.1-ce および docker-compose 1.14.0 と
     # 共に Ubuntu バージョン 14.04 イメージを使用する
     # マシンイメージを指定します。新しいイメージのリリースについては、
     # CircleCI Discuss の「Announcements」をフォローしてください。
       image: circleci/classic:201708-01
...       
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 9.0
       xcode: "9.0"       
 ...          
 ```


## Jobs

Jobs are a collection of steps and each job must declare an executor that is either `docker`, `machine`, `windows` or `macos`. machine にイメージが指定されていない場合は、デフォルトイメージが使用されます。Docker と macOS では、イメージも宣言する必要があります。

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

### Cache
{:.no_toc}

A cache stores a file or directory of files such as dependencies or source code in object storage.
ビルドを高速化するために、以前のジョブに含まれる依存関係をキャッシュする特別なステップを各ジョブに追加できます。

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
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          ```

{% endraw %}

## ワークフロー

ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、並列実行、順次実行、スケジュールに基づいて実行、あるいは承認ジョブを使用して手動ゲートで実行することができます。

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/workflow_detail.png)

{% raw %}
```yaml
version: 2
jobs:
  build1:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: テストを実行
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
...                          
workflows:
  version: 2
  build_and_test: # ワークフロー名
    jobs:
      - build1
      - build2:
        requires:
           - build1 # build1 ジョブが正常に完了するのを待ってから開始します。
           # この他の例については、circleci.com/docs/ja/2.0/workflows/ を参照してください。
      - build3:
        requires:
           - build1 # build1 ジョブが正常に完了するのを待ってから、時間を節約するために
           # build2 と build 3 の並列実行を開始します。
```
{% endraw %}

### ワークスペースとアーティファクト
{:.no_toc}

Workspaces は、ワークフロー対応のストレージメカニズムです。 ワークスペースには、ダウンストリームジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 アーティファクトにはワークフローが完了した後もデータが維持され、ビルドプロセス出力の長期ストレージとして使用できます。

各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用されます。

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

{% raw %}
```yaml
version: 2
jobs:
  build1:
...   
    steps:    

      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace  for use in downstream job. このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルートディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
            # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  build2:
...
    steps:

      - attach_workspace:
        # Must be absolute path or relative path from working_directory
          at: /tmp/workspace
  build3:
...
    steps:
      - store_artifacts: # 詳細については、circleci.com/docs/ja/2.0/artifacts/ を参照してください。
          path: /tmp/artifact-1
          destination: artifact-file
...
```        
{% endraw %}

Artifacts、Workspaces、Caches にはそれぞれ下記のような違いがあります。

| Type       | Lifetime             | Use                                                                                     | Example                                                                                                                                                                                                                |
| ---------- | -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifacts  | Months               | Preserve long-term artifacts.                                                           | Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container` or similar directory.                                                                                       |
| Workspaces | Duration of workflow | Attach the workspace in a downstream container with the `attach_workspace:` step.       | The `attach_workspace` copies and re-creates the entire workspace content when it runs.                                                                                                                                |
| Caches     | Months               | Store non-vital data that may help the job run faster, for example npm or Gem packages. | The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision). `restore_cache` と 適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

Workspace、Caches、Artifacts に関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (Workflows でデータを保持するには：Caches、Artifacts、Workspace 活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## 関連項目
{:.no_toc}

`jobs` と `steps` のキーとオプションの使用方法については、「[Orb、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/ja/2.0/jobs-steps/)」を参照してください。