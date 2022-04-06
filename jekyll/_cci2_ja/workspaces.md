---
layout: classic-docs
title: "ワークスペースによるジョブ間のデータ共有"
description: "ここではワークスペースを使ってデータをワークフローのダウンストリームジョブで共有する方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

各ワークフローには `workspace` がそれぞれ関連付けられています。 ワークスペースは、ワークフローが進むにつれてデータをダウンストリームジョブに転送するために使用されます。

ワークスペースを使って、各ワークフロー固有のデータやダウンストリームジョブで必要なデータを渡すことができます。 複数のブランチでジョブを実行するようなワークフローでは、ワークスペースを使ってデータを共有する必要がある場合があります。 また、テストコンテナで使われるコンパイル済みデータを含むプロジェクトにもワークスペースは役立ちます。

たとえば、`.jar` ファイルをビルドし、それをワークスペースに保存する `build` ジョブを含むプロジェクトの場合、 その`build`ジョブは、同時に実行されるテストジョブにファンアウトします。`integration-test`、`unit-test`、および`code-coverage` は、それぞれワークスペースをアタッチすることで jar ファイルにアクセスできます。

## はじめに
{: #overview }

ワークスペースは、追加のみが可能なデータストレージです。 ジョブはワークスペースに永続的にデータを保管することができます。 ワークスペースを使用すると、データはコンテナの外のストアにアーカイブされ保存されます。 ワークスペースにデータが追加されるたびに、そのストアに新しいレイヤーが作成されます。 ダウンストリームジョブは、コンテナのファイルシステムにそのワークスペースをアタッチできます。 ワークスペースをアタッチすると、ワークフロー内のアップストリームジョブの順序に基づいて、各レイヤーがダウンロードされ、アンパッケージ化されます。

デフォルトのワークスペースの保存期間は 15 日間です。 保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。 現在、設定できる保存期間の最大値が 15 日間となっています。

![Workspace のデータフロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

## ワークスペースの設定
{: #workspace-configuration }

ジョブで作られたデータを保存して他のジョブでも使えるよう、`persist_to_workspace` キーをジョブに追加します。 `persist_to_workspace` の `paths:` プロパティに記述されたディレクトリ・ファイルは、`root` キーで指定しているディレクトリの相対パスとなる一時 Workspace にアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

If you have custom storage settings, `persist_to_workspace` will default to the customizations you have set for your workspaces. If none are set, `persist_to_workspace` will be the default setting of 15 days.

`attach_workspace` キーを設定して、保存されたデータを取得できるようにします。 下記の `config.yml` ファイルでは 2 つのジョブ、`flow` ジョブで作られたリソースを使う `downstream` ジョブ、を定義しています。 ワークフローの設定は順次実行なので、`downstream` ジョブの処理がスタートする前に `flow` ジョブが終了していなければなりません。

{:.tab.workspaces.Cloud}
```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job.
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is
          # taken to be the root directory of the workspace.
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

{:.tab.workspaces.Server_3}
```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job.
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is
          # taken to be the root directory of the workspace.
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

{:.tab.workspaces.Server_2}
```yaml
version: 2

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job.
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is
          # taken to be the root directory of the workspace.
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

ワークスペースを使用してビルド ジョブとデプロイ ジョブの間でデータを受け渡す実際の例については、CircleCI ドキュメントをビルドするように構成された [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) を参照してください。

ワークスペース、キャッシュ、およびアーティファクトの使用に関する概念的な情報については、ブログ記事「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## Workspace storage customization
{: #workspaces-and-self-hosted-runner }

セルフホストランナーを使用する場合、プランに含まれるネットワークとストレージ使用量には制限があります。 There are certain actions related to workspaces that will accrue network and storage usage. Once your usage exceeds your limit, charges will apply.

Retaining a workspace for a long period of time will have storage cost implications, therefore, it is best to determine why you are retaining workspaces. In most projects, the benefit of retaining a workspace is that you can re-run your build from fail. Once the build passes, the workspace is likely not needed. Setting a low storage retention for workspaces is recommended if this suits your needs.

You can customize storage usage retention periods for workspaces on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. For information on managing network and storage usage, see the [Persisting Data]({{site.baseurl}}/ja/2.0/persist-data/#managing-network-and-storage-use) page.

## ワークスペースの最適化
{: #workspace-usage-optimization }

`persist_to_workspace` を使用する際は、パスとファイルを定義することが重要です。 定義しないと、ストレージが大幅に増加する場合があります。 パスとファイルは以下の構文を使って指定します。

```yml
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

## 関連項目
{: #see-also }
{:.no_toc}

- ワークフローの概念や使用方法に関しては、[ワークフローを使ったジョブのスケジュール実行]({{site.baseurl}}/ja/2.0/workflows)を参照して下さい。
- [データの永続化]({{site.baseurl}}/ja/2.0/persist-data)
- [依存関係のキャッシュ]({{site.baseurl}}/ja/2.0/caching)
- [キャッシュ戦略]({{site.baseurl}}/ja/2.0/caching-strategy)
- [アーティファクト]({{site.baseurl}}/ja/2.0/artifacts)
- [最適化の概要]({{site.baseurl}}/ja/2.0/optimizations)
