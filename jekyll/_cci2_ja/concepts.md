---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI 2.0 のコンセプト"
categories: [getting-started]
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

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 プライマリコンテナは、`.circleci/config.yml` ファイルに最初にリストされているイメージとして定義されます。 ここで、Docker executor を使用してジョブのコマンドが実行されます。

```yaml
version: 2
  jobs:
    build1: # ジョブ名
      docker: # プライマリコンテナイメージを指定します
      # dockerhub にあるビルド済みの CircleCI イメージのリストについては、
      # circleci.com/docs/ja/2.0/circleci-images/ を参照してください。
        - image: buildpack-deps:trusty

        - image: postgres:9.4.1 # 1 つの共通ネットワーク内で実行される
        # セカンダリ・サービスコンテナのデータベースイメージを指定します。
        # 共通ネットワークでは、プライマリコンテナ上に公開されている
        # ポートをローカルホストで利用できます。
         environment: # POSTGRES_USER 認証環境変数を指定します。
          # 環境変数の使用方法については、
          # circleci.com/docs/ja/2.0/env-vars/ を参照してください。
           POSTGRES_USER: root


... build2:
      machine: # Docker 17.06.1-ce および docker-compose 1.14.0 と
      # 共に Ubuntu バージョン 14.04 イメージを使用する
      # マシンイメージを指定します。新しいイメージのリリースについては、
      # CircleCI Discuss の「Announcements」をフォローしてください。 image: circleci/classic:201708-01
...
    build3:
      macos: # Xcode バージョン 9.0 の macOS 仮想マシンを指定します
        xcode: "9.0"
...
```

## ジョブ

ジョブはステップの集まりです。各ジョブでは、`docker`、`machine`、`macos` のいずれかの Executor を宣言する必要があります。 machine にイメージが指定されていない場合は、デフォルトイメージが使用されます。Docker と macOS では、イメージも宣言する必要があります。

![ジョブの図]({{ site.baseurl }}/assets/img/docs/concepts1.png)

### キャッシュ
{:.no_toc}

キャッシュは、依存関係、ソースコードなどを 1つのファイルとして、または複数のファイルが入ったディレクトリとしてオブジェクトストレージに格納します。 ビルドを高速化するために、以前のジョブに含まれる依存関係をキャッシュする特別なステップを各ジョブに追加できます。

{% raw %}

```yaml
version: 2
jobs:
  build1:
    docker: # 各ジョブで Executor (docker、macos、または machine)
    # を指定する必要があります。これらの比較や他の例
    # については、circleci.com/docs/ja/2.0/executor-types/
    # を参照してください。
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # 環境変数のキャッシュキーテンプレートを
      # 使用して、依存関係をキャッシュします。
      # circleci.com/docs/ja/2.0/caching/ を参照してください。
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
      - save_cache: # キャッシュキーで依存関係をキャッシュします。
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
      - persist_to_workspace: # ダウンストリームジョブで使用するために、指定されたパス
      # (workspace/echo-output) をワークスペースに維持します。 このパスは、絶対パスまたは
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
        # 絶対パスまたは working_directory からの相対パスでなければなりません。
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

タイプ | ライフタイム | 用途 | 例
-----------|----------------------|------------------------------------|--------
Artifacts | 数か月 | 長期アーティファクトを保存します。 | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。
Workspaces | ワークフローの期間 | `attach_workspace:` ステップを使用して、ダウンストリームコンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピー・再構築されます。
Caches | 数か月 | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。 | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と 適切な `key` を使用してキャッシュを復元します。
{: class="table table-striped"}

Workspace、Caches、Artifacts に関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (Workflows でデータを保持するには：Caches、Artifacts、Workspaces 活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## 関連項目
{:.no_toc}

`jobs` と `steps` のキーとオプションの使用方法については、「[Orb、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/ja/2.0/jobs-steps/)」を参照してください。
