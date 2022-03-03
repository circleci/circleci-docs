---
layout: classic-docs
title: "データの永続化の概要"
description: "CircleCI でデータを永続化する方法の紹介"
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ここでは、 CircleCI ビルド内外でデータを永続化する様々な方法を概説します。 ジョブ間およびジョブの内外にデータを移動したり、データを永続化して後で使用するには複数の方法があります。 適切なタスクに適切な機能を使用することで、ビルドが高速化し、再現性と効率が向上します。

* 目次
{:toc}

## キャッシュ
{: #caching }

キャッシュにより、異なるビルドにおける同じジョブのデータが永続化され、高コストなフェッチ操作のデータを以前のジョブから再利用することができます。 ジョブを一回実行すると、その後のインスタンスでは同じ処理をやり直す必要がないため、実行が高速化されます（キャッシュが無効になっていない場合）。

### 依存関係のキャッシュ
{: #caching-dependencies }

キャッシュ戦略の主な例としては、Yarn、Bundler、Pip などの依存関係管理ツールと共に使用することが挙げられます。 キャッシュから依存関係をリストアすることで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

Because caches are global within a project, a cache saved on one branch will be used by jobs run on other branches. Caches should only be used for data that is suitable to share across branches.

* For more information on caching dependencies, including race conditions, managing caches, expiration, and using cache keys, see the [Caching Dependencies]({{site.baseurl}}/2.0/caching/) page.

### Caching optimization
{: #cache-optimization }

There are several common ways that your configuration can be optimized to ensure you are getting the most out of your network and storage usage. たとえば、データ使用量を減らしたい場合、特定の使用方法が保持に値する価値を提供しているか検討してください。 In the cases of caches, this can be quite easy to compare. Does the developer or compute time-saving from the cache outweigh the cost of the download and upload?

Caching optimization strategies can include avoiding unnecessary workflow reruns, combining jobs, creating meaningful workflow orders, and pruning.

* For more information on caching optimization and other caching strategies, like partial dependency caching, caching tradeoffs, and using multiple caches, see the [Caching Strategies]({{site.baseurl}}/2.0/caching-strategy/) page.

## ワークスペース
{: #workspaces }

ワークスペースは、ワークフローが進むにつれてデータをダウンストリームジョブに転送するために使用されます。 ジョブ内でワークスペースが宣言されていると、ファイルやディレクトリを追加することができます。 追加するたびにワークスペースのファイルシステム内に新しいレイヤーが作成されます。 Downstream jobs can then use this workspace for their own needs, or add more layers on top.

### Workspace optimization
{: #workspace-optimization }

If you notice your workspace usage is high and would like to reduce it, try searching for the `persist_to_workspace` command in your `.circleci/config.yml` file to find all jobs utilizing workspaces and determine if all items in the path are necessary.

* For more information on workspace optimization, configuration, and expiration, see the [Using Workspaces]({{site.baseurl}}/2.0/workspaces/) page.
* For more information on workflows, see the [Workflows]({{site.baseurl}}/2.0/workflows/) page.
* [CircleCI のワークスペースの詳細](https://circleci.com/ja/blog/deep-diving-into-circleci-workspaces/)に関するブログ記事もご覧ください。

## アーティファクト
{: #artifacts }

アーティファクトは、パイプラインの出力を長期保存するために使用されます。 たとえば Java プロジェクトを使用している場合、ビルドにより多くの場合、コードの` .jar `ファイルが生成されます。 このコードはテストによって検証されます。 ビルドやテストプロセスがすべて成功した場合は、プロセスの出力（` .jar `）をアーティファクトとして保存できます。 この `jar `ファイルは、ファイルを作成したワークフローの終了後も長期間アーティファクトシステムからダウンロードできます。

プロジェクトをパッケージ化する必要がある場合は、`.apk` ファイルが Google Play にアップロードされる Android アプリを使用して、アーティファクトとして保存することをお勧めします。 多くのユーザーがアーティファクトを Amazon S3 や Artifactory などの全社的な保存先にアップロードしています。

### Artifact optimization
{: #artifact-optimization }

最適化オプションは、実行しようとしている内容に応じてプロジェクトごとに異なります。 ネットワークやストレージの使用量を削減するために、下記をお試しください。

- `store_artifacts` が不必要なファイルをアップロードしていないか確認する。
- 並列処理を使用している場合は、同じアーティファクトがないか確認する。
- 最低限のコストでテキストのアーティファクトを圧縮する。
- UI テストのイメージや動画をアップロードする場合は、フィルタを外し、失敗したテストのみをアップロードする。
- フィルタを外し、失敗したテストまたは成功したテストのみをアップロードする。
- 1つのブランチにのみアーティファクトをアップロードする。
- 大きなアーティファクトは、独自のバケットに無料でアップロードする。

For more information on artifact optimization, and using artifacts to persist data once a job has completed, see the [Storing Build Artifacts]({{site.baseurl}}/2.0/artifacts/) page.

## Managing network and storage usage
{: #managing-network-and-storage-usage }

Optimization goes beyond speeding up your builds and improving efficiency. Optimization can also help reduce costs. 以下では、ネットワークとストレージの使用量がどのように蓄積されるかを説明しています。最適化やコスト削減方法の検討にお役立てください。

To view your network and storage usage, visit the [CircleCI web app](https://app.circleci.com/) and follow these steps:

1. アプリのサイドバーから **Plan** を選択します。
2. **Plan Usage** を選択します。
3. **Network** または **Storage** のどちらか表示したいタブを選択します。

この Network タブおよび Storage タブから請求期間毎の使用量の詳細を見ることができます。  The usage is also broken down by storage object type: cache, artifact, workspace, testresult.

### Overview of all network and storage transfer
{: #overview-of-network-and-storage-transfer }

ジョブ内でデータを永続化するための操作には、ストレージの使用が発生します。関連するアクションは次のとおりです。

* キャッシュのアップロード
* ワークスペースのアップロード
* アーティファクトのアップロード
* テスト結果のアップロード

To determine which jobs utilize the above actions, you can search for the following commands in your project's `.circleci/config.yml` file:

* `save_cache`
* `persist_to_workspace`
* `store_artifacts`
* `store_test_results`

The only network traffic that will be billed for is that accrued through **restoring caches and workspaces to self-hosted runners.**
{: class="alert alert-info" }

Details about your network and storage transfer usage can be viewed on your **Plan > Plan Usage** screen. この画面では以下のことが確認できます。

- 課金対象となるネットワーク転送量 (画面の一番上の表に表示)
- 個々のプロジェクトのネットワークとストレージの使用量 (Project タブに表示)
- ストレージのデータとアクティビティ (Network タブに表示)
- ストレージ総量のデータ (Storage タブに表示)

Details about individual step network and storage transfer usage can be found in the step output on the Jobs page as seen below.

![save-cache-job-output]({{site.baseurl}}/assets/img/docs/job-output-save-cache.png)

### ネットワーク転送の過剰な使用を減らす
{: #reducing-excess-use-of-network-egress }

セルフホストランナーへのネットワーク転送の使用量は、特に`US-East-1` でランナーを AWS 上でホストすることにより減らせます。

### How to calculate an approximation of network and storage costs
{: #how-to-calculate-an-approximation-of-network-and-storage-costs}

**NOTE:** Billing for network egress and storage will start to take effect on **April 1 2022** (subject to change). CircleCI では現在、ネットワークとストレージの使用状況を管理するための変数と制御機能を追加しています。 The information in this section is applicable after the changes take effect on April 1, 2022. 現在の使用状況を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)から、**Plan > Plan Usage** に移動してください。
{: class="alert alert-info" }

Charges apply when an organization has runner network egress beyond the included GB allotment for network and storage usage. ネットワークの使用に対する課金は、CircleCI からセルフホストランナーへのトラフィックに対してのみ適用されます。 クラウドホスティングの Exexutor のみを使用している場合は、ネットワーク料金は適用されません。

お客様のプランで使用できるネットワークとストレージの量を確認するには、[料金プラン](https://circleci.com/pricing/)のページの機能に関するセクションをご覧ください。 クレジットの使用量、および今後のネットワークとストレージの料金の計算方法の詳細については、[よくあるご質問]({{site.baseurl}}/2.0/faq/#how-do-I-calculate-my-monthly-storage-and-network-costs)の請求に関するセクションを参照してください。

For quesions on data usage for the IP ranges feature, visit the [FAQ](https://circleci.com/docs/2.0/faq/#how-do-I-calculate-my-monthly-IP-ranges-costs) page.

## 関連項目
{: #see-also }
{:.no_toc}
- [依存関係のキャッシュ]({{site.baseurl}}/2.0/caching)
- [キャッシュ戦略]({{site.baseurl}}/2.0/caching-strategy)
- [ワークスペース]({{site.baseurl}}/2.0/workspaces)
- [アーティファクト]({{site.baseurl}}/2.0/artifacts)
- [IP アドレスの範囲機能]({{site.baseurl}}/2.0/ip-ranges/)
- [最適化の概要]({{site.baseurl}}/2.0/optimizations)
