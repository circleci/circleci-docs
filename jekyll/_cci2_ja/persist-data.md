---
layout: classic-docs
title: "データの永続化"
description: "CircleCI でデータを永続化する方法"
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ここでは、 CircleCI ビルド内外でデータを永続化する様々な方法を概説します。 ジョブ間およびジョブの内外にデータを移動したり、データを保持して後で使用するには複数の方法があります。 適切なタスクに適切な機能を使用することで、ビルドが高速化し、再現性と効率が向上します。

* 目次
{:toc}

## キャッシュの活用方法
{: #caching-strategies }

![キャッシュのデータ フロー]({{ site.baseurl}}/assets/img/docs/caching-dependencies-overview.png)

**save_cache ステップで作成されたキャッシュは、最長 15 日間保存されます。**

Caching persists data between the same job in different builds, allowing you to reuse the data from expensive fetch operations from previous jobs. ジョブを一回実行すると、その後のインスタンスでは同じ処理をやり直す必要がないため、実行が高速化されます（キャッシュが無効になっていない場合）。

わかりやすい例としては、Yarn や Bundler、Pip といった依存関係管理ツールが挙げられます。 キャッシュから依存関係を復元することで、yarn install などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

キャッシュは、プロジェクト内でグローバルに配置されます。 1 つのブランチに保存されたキャッシュが他のブランチで実行されるジョブでも使用されるため、キャッシュはブランチ間での共有に適したデータに対してのみ使用してください。

詳細については、[依存関係のキャッシュガイド]({{site.baseurl}}/ja/2.0/caching/)を参照してください。

## ワークスペースの使用
{: #using-workspaces }

![Workspace のデータフロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

**ワークスペースは最長で15日間保存されます。**

ジョブ内でワークスペースが宣言されていると、ファイルやディレクトリを追加することができます。 追加するたびにワークスペースのファイルシステム内に新しいレイヤーが作成されます。 ダウンストリーム ジョブで必要に応じてこのワークスペースを使用したり、レイヤーをさらに追加することができます。

ワークスペースは異なるパイプラインの実行において共有されません パイプラインの実行後にワークスペースにアクセスできるのは、ワークフローが 15 日以内に再実行された場合のみです。

ワークスペースを使用してワークフロー全体のデータを保持する方法の詳細については、[ワークフローガイド]({{site.baseurl}}/ja/2.0/workflows/#using-workspaces-to-share-data-among-jobs)をご覧ください。 [CircleCI のワークスペースの詳細](https://circleci.com/ja/blog/deep-diving-into-circleci-workspaces/)に関するブログ記事もご覧ください。

## アーティファクトの使用
{: #using-artifacts }

![アーティファクトのデータ フロー]( {{ site.baseurl}}/assets/img/docs/Diagram-v3-Artifact.png)

**アーティファクトは最長で 30 日間保存されます。**

アーティファクトは、パイプラインの出力を長期保存するために使用されます。 たとえば Java プロジェクトを使用している場合、ビルドにより多くの場合、コードの` .jar `ファイルが生成されます。 このコードはテストによって検証されます。 ビルドやテストプロセスがすべて成功した場合は、プロセスの出力（` .jar `）をアーティファクトとして保存できます。 この `jar `ファイルは、ファイルを作成したワークフローの終了後も長期間アーティファクトシステムからダウンロードできます。

プロジェクトをパッケージ化する必要がある場合は、`.apk` ファイルが Google Play にアップロードされる Android アプリを使用して、アーティファクトとして保存することをお勧めします。 多くのユーザーがアーティファクトを Amazon S3 や Artifactory などの全社的な保存先にアップロードしています。

アーティファクトを使用してジョブの完了後にデータを保持する方法の詳細については、[ビルドアーティファクトの保存方法]({{site.baseurl}}/ja/2.0/artifacts/)を参照してください。

## ネットワークとストレージ使用の管理
{: #managing-network-and-storage-use }

The information below describes how your network and storage usage is accumulating, and should help you find ways to optimize and implement cost saving measures.

**NOTE:** Your overall **Network Transfer** amount is not representative of your billable usage. Only certain actions will result in network egress, which in turn results in billable usage. Details of these actions are described below.

### ストレージとネットワーク転送の概要
{: #overview-of-storage-and-network-transfer }

ジョブ内でデータを保持するための操作には、ネットワークとストレージの使用が発生します。関連するアクションは次のとおりです。

* キャッシュのアップロードとダウンロード
* ワークスペースのアップロードとダウンロード
* アーティファクトのアップロード
* テスト結果のアップロード

上記のアクションを行うジョブを決定するには、プロジェクトの `config.yml `ファイルで次のコマンドを検索します。

* `save_cache`
* `restore_cache`
* `persist_to_workspace`
* `store_artifacts`
* `store_test_results`

すべてのネットワーク転送にはネットワークの使用が発生します。関連するアクションは次のとおりです。

* キャッシュとワークスペースのセルフホストランナーへの復元
* アーティファクトのダウンロード
* CircleCI 外のジョブからのデータプッシュ

ストレージとネットワーク転送の使用状況の詳細は、プラン > プランの使用状況画面で確認できます。 On this screen you can find:

* Total network and storage usage (table at the top of the screen)
* Network and storage usage for individual projects (Projects tab)
* Storage data activity (Objects tab)
* Total storage volume data (Storage tab)

個々のステップのストレージおよびネットワーク転送の使用方法の詳細については、以下のジョブページのステップ出力を参照してください。

![save-cache-job-output]( {{ site.baseurl }}/assets/img/docs/job-output-save-cache.png)

### How to calculate an approximation of your monthly costs
{: #how-to-calculate-an-approximation-of-your-monthly-costs}

Charges apply when an organization has network egress beyond the included GB allotment for storage and network usage.

#### ストレージ
{: #storage }
{:.no_toc}

Usage is charged in real time and held for a specific time period: workspaces and caches are held for 15 days, while artifacts and test results are held for 30 days.

To calculate monthly storage costs from your daily usage, click on the Storage tab to see if your organization has accrued any overages beyond the GB-monthly allotment (your network egress). Your overage GB-Months can be multiplied by 420 credits to estimate the total monthly costs.

![storage-usage-overage]( {{ site.baseurl }}/assets/img/docs/storage-usage-overage.png)

#### ネットワーク
{: #network }
{:.no_toc}

To calculate monthly network costs from your usage, click on the Objects tab to see if your organization has accrued any overages (your network egress). Your overage GB can be multiplied by 420 credits to estimate the total monthly costs.

The GB allotment only applies to outbound traffic from CircleCI. Traffic within CircleCI is unlimited.

![network-usage-overage]( {{ site.baseurl }}/assets/img/docs/network-usage-overage.png)

### How to optimize your storage and network transfer use
{: #how-to-optimize-your-storage-and-network-transfer-use }

ストレージとネットワークの使用を最大限に活用するために設定を最適化する一般的な方法は複数あります。

For example, when looking for opportunities to reduce data usage, consider whether specific usage is providing enough value to be kept.

In the cases of caches and workspaces this can be quite easy to compare - does the developer or compute time-saving from the cache outweigh the cost of the download and upload?

See below for examples of storage and network optimization opportunities through reducing artifact, cache, and workspace traffic.

#### アップロードされているアーティファクトの確認
{: #check-which-artifacts-are-being-uploaded }

Often we see that the `store_artifacts` step is being used on a large directory when only a few files are really needed, so a simple action you can take is to check which artifacts are being uploaded and why.

ジョブで並列処理を使用している場合は、各並列タスクが同じアーティファクトをアップロードしている可能性があります。 You can use the `CIRCLE_NODE_INDEX` environment variable in a run step to change the behavior of scripts depending on the parallel task run.

#### 大きなアーティファクトのアップロード
{: #uploading-large-artifacts }

テキスト形式のアーティファクトは、非常に低いコストで圧縮できます。

UI テストのイメージや動画をアップロードする場合は、フィルタを外し、失敗したテストのみをアップロードします。 多くの組織では UI テストからすべてのイメージをアップロードしていますが、その多くは使用されません。

If your pipelines build a binary or uberJAR, consider if these are necessary for every commit. You may wish to only upload artifacts on failure or success, or perhaps only on a single branch using a filter.

大きなアーティファクトをアップロードする必要がある場合、ご自身のバケットに無料でアップロードすることが可能です。

#### 未使用または余分な依存関係のキャッシュ
{: #caching-unused-or-superfluous-dependencies }

ご使用の言語およびパッケージ管理システムによっては、不要な依存関係をクリアまたは「削除」するツールを利用できる場合があります。

For example, the node-prune package removes unnecessary files (markdown, typescript files, etc.) from `node_modules`.

#### キャッシュ使用率の最適化
{: #optimizing-cache-usage }

If you notice your cache usage is high and would like to reduce it:

* Search for the `save_cache` and `restore_cache` commands in your `config.yml` file to find all jobs utilizing caching and determine if their cache(s) need pruning.
* Narrow the scope of a cache from a large directory to a smaller subset of specific files.
* Ensure that your cache `key` is following [best practices]({{ site.baseurl}}/2.0/caching/#further-notes-on-using-keys-and-templates):

{% raw %}
```sh
       - save_cache:
         key: brew-{{epoch}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

上記の例は、ベストプラクティスに従っていません。 `brew-{{ epoch }}` will change every build causing an upload every time even if the value has not changed. この方法では結局コストもかかり、時間も短縮できません。 Instead pick a cache `key` like the following:

{% raw %}
```sh
     - save_cache:
         key: brew-{{checksum “Brewfile”}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

This will only change if the list of requested dependencies has changed. これでは新しいキャッシュのアップロードの頻度が十分でないという場合は、依存関係にバージョン番号を含めます。

キャッシュをやや古い状態にします。 新しい依存関係がロックファイルに追加された時や依存関係のバージョンが変更された時に新しいキャッシュがアップロードされる上記の方法とは対照的に、あまり正確に追跡しない方法を用います。

アップロードする前にキャッシュを削除しますが、キャッシュキーを生成するものはすべて削除してください。

#### ワークスペースの使用率の最適化
{: #optimizing-workspace-usage }

If you notice your workspace usage is high and would like to reduce it, try searching for the `persist_to_workspace` command in your `config.yml` file to find all jobs utilizing workspaces and determine if all items in the path are necessary.

#### ネットワーク転送の過剰な使用を減らす
{: #reducing-excess-use-of-network-egress }

If you would like to try to reduce the amount of network egress that is contributing to network usage, you can try a few things:

* Runner の場合は、 AWS US-East-1 にクラウドベースのランナーをデプロイします。
* アーティファクトを 1 度ダウンロードし、ご自身のサイトに保存して処理を追加します。
