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

![ワークスペースのデータフロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

## ワークスペースの設定
{: #workspace-configuration }

ジョブで作られたデータを保存して他のジョブでも使えるよう、`persist_to_workspace` キーをジョブに追加します。 `persist_to_workspace` の `paths:` プロパティに記述されたファイルやディレクトリは、`root` キーで指定しているディレクトリの相対パスとなる一時的なワークスペースにアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (およびワークフローの再実行時に) 利用できるようにします。

`attach_workspace` キーを設定して、保存されたデータを取得できるようにします。 下記の `config.yml` ファイルでは 2 つのジョブ、`flow` ジョブで作られたリソースを使う `downstream` ジョブ、を定義しています。 ワークフローの設定は順次実行なので、`downstream` ジョブの処理がスタートする前に `flow` ジョブが終了していなければなりません。

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

      # ダウンストリーム ジョブ用に、指定したパス (workspace/echo-output) をワークスペースに維持します。
      - persist_to_workspace:
#  絶対パス、または working_directory からの相対パスで指定する必要があります。
      ```
- persist_to_workspace:
          # working_directory からの相対パスか絶対パスを指定します
``` これは、コンテナ上のディレクトリで、
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

ワークスペースを使用してビルドジョブとデプロイジョブの間でデータを受け渡す実際の例については、CircleCI ドキュメントをビルドするように設定された [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) を参照してください。

ワークスペース、キャッシュ、およびアーティファクトの使用に関する概念的な情報については、ブログ記事「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## ワークスペースの使用期限
{: #workspace-expiration }

ワークスペースは最長で15日間保存されます。 ワークスペースはパイプライン間では共有されません。ワークフローの完了後にワークスペースにアクセスする唯一の方法は、15 日以内にワークフローを再実行することです

## ワークスペースとランナーネットワークの料金
{: #workspaces-and-runner-network-charges }

セルフホストランナーを使用する場合、プランに含まれるネットワークとストレージ使用量には制限があります。 使用量がその制限を超えた場合、料金が発生します。 この料金は、発生した超過分に基づいて計算されます。

ネットワークとストレージの使用状況の表示、および毎月のネットワークとストレージの超過コストの計算については、[データの永続化 ]({{site.baseurl}}/2.0/persist-data/#managing-network-and-storage-use)ガイドを参照してください。

## ワークスペースの使用の最適化
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

- データの永続化に関する詳細や戦略は[データの永続化]({{ site.baseurl }}/2.0/persist-data)ガイドを参照して下さい。
- ワークフローの概念や使用方法に関しては、[ワークフローを使ったジョブのスケジュール実行]({{ site.baseurl }}/2.0/workflows)を参照して下さい。
