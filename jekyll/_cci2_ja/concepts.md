---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI 2.0 のコンセプト"
categories:
  - getting-started
order: 1
---


CircleCI プロジェクトは、関連付けられているコード リポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

* 目次 
{:toc}

CircleCI プロジェクトは、関連付けられているコード リポジトリの名前を共有し、CircleCI アプリケーションの [Projects (プロジェクト)] ページに表示されます。プロジェクトは、[Add Project (プロジェクトの追加)] ボタンを使用して追加します。

[Add Project (プロジェクトの追加)] ページでは、VCS で所有者になっているプロジェクトを*セットアップ*するか、組織内のプロジェクトを*フォロー*することで、パイプラインにアクセスし、プロジェクトのステータスに関する\[メール通知\]({{site.baseurl }}/2.0/notifications/)を受け取ることができます。

## プロジェクトの追加ページ

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

*プロジェクト管理者*とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーです。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示またはフォローするには、ユーザーが \[GitHub または Bitbucket 組織\]({{ site.baseurl }}/2.0/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。

## ステップ

ステップとは、ジョブを実行するために行う必要があるアクションのことです。 ステップは通常、実行可能なコマンドの集まりです。 たとえば以下の例では、`checkout` ステップが SSH コマンドでジョブのソース コードをチェックアウトします。 次に、`run` ステップが、デフォルトで非ログイン シェルを使用して、`make test` コマンドを実行します。

```yaml
#...
    steps:
      - checkout # ソース コードをチェックアウトする特別なステップ。
      - run: # コマンドを実行する run ステップ。詳しくは以下を参照してください。
      # circleci.com/ja/docs/2.0/configuration-reference/#run
          name: テストの実行
          command: make test # 実行可能なコマンド。デフォルトでは、
          # /bin/bash -eo pipefail オプションを使用して
          # 非ログイン シェルで実行されます。
#...          
```

## イメージ

イメージは、実行コンテナを作成するための指示を含むパッケージ化されたシステムです。 プライマリ コンテナは、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルに最初にリストされているイメージとして定義されます。 ここで、Docker または Machine Executor を使用してジョブのコマンドが実行されます。 Docker Executor は、Docker イメージを使用してコンテナを起動します。 Machine Executor は完全な Ubuntu 仮想マシン イメージを起動します。 比較表と考慮事項については、「[Executor タイプを選択する]({{ site.baseurl }}/2.0/executor-types/)」を参照してください。

```yaml
 version: 2
 jobs:
   build1: # ジョブ名
     docker: # プライマリ コンテナ イメージを指定します。
     # dockerhub にあるビルド済みの CircleCI イメージの一覧は、
     # circleci.com/ja/docs/2.0/circleci-images/ にて参照してください。
       - image: buildpack-deps:trusty

       - image: postgres:9.4.1 # 1 つの共通ネットワーク内で実行される
        # セカンダリ サービス コンテナのデータベース イメージを指定します。
        # 共通ネットワークでは、プライマリ コンテナ上に公開されている
        # ポートをローカルホストで利用できます。
         environment: # POSTGRES_USER 認証環境変数を指定します。
          # 環境変数の使用方法については、
          # circleci.com/ja/docs/2.0/env-vars/ を参照してください。
           POSTGRES_USER: root
#...
   build2:
     machine: # Docker 17.06.1-ce および docker-compose 1.14.0 と
     # 共に Ubuntu バージョン 14.04 イメージを使用する
     # マシン イメージを指定します。新しいイメージのリリースについては、
     # CircleCI Discuss の「Announcements」をフォローしてください。
       image: circleci/classic:201708-01
#...       
   build3:
     macos: # macOS 仮想マシンと Xcode バージョン 11.3 を指定します。
       xcode: "11.3.0"
# ...          
 ```


## ジョブ

ジョブは [ステップ] の集まりです (#steps)。 各ジョブでは、`docker`、`machine`、`windows`、`macos` のいずれかの Executor を宣言する必要があります。 指定しなかった場合、`machine` には [デフォルト イメージ](https://circleci.com/ja/docs/2.0/executor-intro/#machine) が含まれます。`docker` には、プライマリ コンテナで使用する [イメージを指定](https://circleci.com/ja/docs/2.0/executor-intro/#docker) する必要があります。`macos` には [Xcode バージョン](https://circleci.com/ja/docs/2.0/executor-intro/#macos) を指定する必要があります。`windows` では、[Windows Orb](https://circleci.com/ja/docs/2.0/executor-intro/#windows) を使用する必要があります。

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

### キャッシュ
{:.no_toc}

キャッシュは、依存関係やソース コードなどを 1 つのファイルとして、または複数のファイルが入ったディレクトリとして、オブジェクト ストレージに格納します。
特別なステップを各ジョブに追加することで、以前のジョブから依存関係をキャッシュし、ビルドを高速化できます。

{% raw %}

```yaml
version: 2
jobs:
  build1:
    docker: # 各ジョブで Executor (docker、macos、machine) 
    # を指定する必要があります。これらの比較や他の例
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
          ```

{% endraw %}

## ワークフロー

ワークフローは、ジョブのリストとその実行順序を定義します。 ジョブは、並列実行、順次実行、スケジュールに基づいて実行、あるいは承認ジョブを使用して手動ゲートで実行することができます。

{:.tab.workflows.Cloud}
![ワークフローの図]({{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server}
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

### ワークスペースとアーティファクト
{:.no_toc}

ワークスペースは、ワークフロー対応のストレージ メカニズムです。 ワークスペースには、ダウンストリーム ジョブで必要になる可能性がある、ジョブ固有のデータが保存されます。 アーティファクトにはワークフローが完了した後もデータが維持され、ビルド プロセス出力の長期ストレージとして使用できます。

各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

{% raw %}
```yaml
version: 2
jobs:
  build1:
#...   
    steps:    

      - persist_to_workspace: # ダウンストリーム ジョブで使用するために、指定されたパス 
      # (workspace/echo-output) をワークスペースに維持します。 このパスは、絶対パスまたは
      # working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルート ディレクトリとなる、コンテナ上のディレクトリです。
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
      - store_artifacts: # 詳細については、circleci.com/ja/docs/2.0/artifacts/ を参照してください。
          path: /tmp/artifact-1
          destination: artifact-file
#...
```        
{% endraw %}

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| タイプ      | ライフタイム    | 用途                                                           | 例                                                                                                                                            |
| -------- | --------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月       | 長期アーティファクトを保存します。                                            | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。                            |
| ワークスペース  | ワークフローの期間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                        |
| キャッシュ    | 数か月       | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## 関連項目
{:.no_toc}

`jobs` と `steps` のキーとオプションの使用方法については、「[Orb、ジョブ、ステップ、ワークフロー]({{ site.baseurl }}/2.0/jobs-steps/)」を参照してください。