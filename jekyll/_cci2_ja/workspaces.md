---
layout: classic-docs
title: "Using workspaces to share data between jobs"
description: "This document describes how to use workspaces to share data to downstream jobs in your workflows."
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

Workflows each have an associated `workspace`. Workspaces are used to transfer data to downstream jobs as the workflow progresses.

Use workspaces to pass along data that is unique to a workflow and is needed for downstream jobs. 複数のブランチでジョブを実行するようなワークフローでは、Workspace を利用してデータを共有する必要に迫られることがあります。 また、テストコンテナで使われるコンパイル済みデータを含むプロジェクトにも Workspace は役立ちます。

For example, a project with a `build` job that builds a `.jar` file and saves it to a workspace. The `build` job fans-out into concurrently running test jobs: `integration-test`, `unit-test`, and `code-coverage`, each of which can have access to the jar by attaching the workspace.

## はじめに
{: #overview }

Workspaces are additive-only data storage. ジョブは Workspace に永続的にデータを保管しておけます。 When a workspace is used, data is archived and stored in an off-container store. With each addition to the workspace a new layer is created in the store. Downstream jobs can then attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow.

![Workspace のデータフロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

## Workspace configuration
{: #workspace-configuration }

ジョブで作られたデータを保存して他のジョブでも使えるよう、`persist_to_workspace` キーをジョブに追加します。 `persist_to_workspace` の `paths:` プロパティに記述されたディレクトリ・ファイルは、`root` キーで指定しているディレクトリの相対パスとなる一時 Workspace にアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

`attach_workspace` キーをセットして、保存されたデータを取得できるようにします。 下記の `config.yml` ファイルでは 2 つのジョブ、`flow` ジョブで作られたリソースを使う `downstream` ジョブ、を定義しています。 Workflow はシーケンシャルのため、`downstream` ジョブの処理がスタートする前に `flow` ジョブが終了していなければなりません。

```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: /tmp

jobs:
   flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # ダウンストリーム ジョブ用に、指定したパス (workspace/echo-output) を Workspace に維持します。
      - persist_to_workspace:
#  絶対パス、または working_directory からの相対パスで指定する必要があります。
      ```
- persist_to_workspace:
          # working_directory からの相対パスか絶対パスを指定します
``` これは、コンテナ上のディレクトリで、
           # ワークスペースのルート ディレクトリと見なされます。
          これは、コンテナ上のディレクトリで、
           # ワークスペースのルート ディレクトリと見なされます。
                    root: workspace
          # ルートからの相対パスを指定する必要があります。
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # 絶対パスまたは working_directory からの相対パスを指定する必要があります。
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

## Workspace expiration
{: #workspace-expiration }

ワークスペースは最長で15日間保存されます。 Workspaces are not shared between pipelines, and the only way to access a workspace once the workflow has completed is if the workflow is rerun within the 15 day window.

## Workspaces and runner network charges
{: #workspaces-and-runner-network-charges }

When using self-hosted runners there is a network and storage usage limit included in your plan. Once your usage exceeds your limit charges will apply. These charges are based on your accrued overages.

### Viewing network egress usage
{: #viewing-network-egress-usage }

Restoring caches and workspaces to self-hosted runners results in network egress. To view your network egress usage follow these steps:
1. Select **Plan** from the app sidebar.
2. Select **Plan Usage**.
3. Select the **Network** tab.

Within the network tab you will find a breakdown of your network usage for the billing period. The usage is also broken down by storage object type: cache, testresult, artifact, workspace.

For more on storage and networking, and calculating your monthly storage costs, see the [Persisting Data]({{site.baseurl}}/2.0/persist-data/#how-to-calculate-an-approximation-of-your-monthly-costs) guide.

## Workspace usage optimization
{: #workspace-usage-optimization }

It is important to define paths and files when using `persist_to_workspace`. Not doing so can cause a significant increase is storage. Specify paths and files using the following syntax:

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

- For further information and strategies for persisting data see the [Persisting Data]({{ site.baseurl }}/2.0/persist-data) guide.
- For conceptual and usage information on Workflows, see the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows) guide.
