---
layout: classic-docs
title: "データの永続化"
description: "CircleCI でデータを永続化する方法"
version:
  - Cloud
  - Server v2.x
---

ここでは、 CircleCI ビルド内外でデータを永続化する様々な方法を概説します。 ジョブ間およびジョブの内外にデータを移動したり、データを保持して後で使用するには複数の方法があります。 適切なタスクに適切な機能を使用することで、ビルドが高速化し、再現性と効率が向上します。

* 目次
{:toc}

## キャッシュの活用方法
{: #caching-strategies }

![caching data flow]({{ site.baseurl}}/assets/img/docs/caching-dependencies-overview.png)

キャッシュにより、異なるワークフロー内のビルドにおける同じジョブのデータが保持され、高コストなフェッチ操作のデータを前回のジョブから再利用することができます。 ジョブを一回実行すると、その後のインスタンスでは同じ処理をやり直す必要がないため、実行が高速化されます（キャッシュが無効になっていない場合）。 わかりやすい例としては、Yarn や Bundler、Pip といった依存関係管理ツールが挙げられます。 キャッシュから依存関係を復元することで、yarn install などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

キャッシュは、プロジェクト内でグローバルに配置されます。 1 つのブランチに保存されたキャッシュが他のブランチで実行されるジョブでも使用されるため、キャッシュはブランチ間での共有に適したデータに対してのみ使用してください。

**save_cache ステップで作成されたキャッシュは、最長 15 日間保存されます。**

詳細については、[依存関係のキャッシュガイド]({{site.baseurl}}/2.0/caching/)を参照してください。

## ワークスペースの使用
{: #using-workspaces }

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

ジョブ内でワークスペースが宣言されていると、ファイルやディレクトリを追加することができます。 追加するたびにワークスペースのファイルシステム内に新しいレイヤーが作成されます。 ダウンストリーム ジョブで必要に応じてこのワークスペースを使用したり、レイヤーをさらに追加することができます。

ワークスペースはそれぞれのパイプラインの実行において共有されません The only time a workspace can be accessed after the pipeline has run is when a workflow is rerun within the 15 day limit.

**ワークスペースは最長で 15 日間保存されます。**

ワークスペースを使用してワークフロー全体のデータを保持する方法の詳細については、[ワークフローガイド]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs)をご覧ください。 [CircleCI のワークスペースの詳細](https://circleci.com/blog/deep-diving-into-circleci-workspaces/)のブログ記事もご覧ください。

## アーティファクトの使用
{: #using-artifacts }

![artifacts data flow]( {{ site.baseurl}}/assets/img/docs/Diagram-v3-Artifact.png)

アーティファクトは、パイプラインの出力を長期保存するために使用されます。 たとえば Java プロジェクトを使用している場合、ビルドにより多くの場合、コードの` .jar `ファイルが生成されます。 このコードはテストによって検証されます。 ビルドやテストプロセスがすべて成功した場合は、プロセスの出力（` .jar `）をアーティファクトとして保存できます。 この `jar `ファイルは、ファイルを作成したワークフローの終了後も長期間アーティファクトシステムからダウンロードできます。

プロジェクトをパッケージ化する必要がある場合は、`.apk` ファイルが Google Play にアップロードされる Android アプリを使用して、アーティファクトとして保存することをお勧めします。 多くのユーザーがアーティファクトを Amazon S3 や Artifactory などの全社的な保存先にアップロードしています。

**アーティファクトは最長で 30 日間保存されます。**

アーティファクトを使用してジョブの完了後にデータを保持する方法の詳細については、[ビルドアーティファクトの保存方法]({{site.baseurl}}/2.0/artifacts/)を参照してください。

## ネットワークとストレージ使用の管理
{: #managing-network-and-storage-use }

### ストレージとネットワーク転送の概要
{: #overview-of-storage-and-network-transfer }

ジョブ内でデータを保持するための操作には、ネットワークとストレージの使用が発生します。関連するアクションは次のとおりです。

* キャッシュのアップロードとダウンロード
* ワークスペースのアップロードとダウンロード
* アーティファクトのアップロード
* テスト結果のアップロード

上記のアクションを行うジョブを決定するには、プロジェクトの config.yml ファイルで次のコマンドを検索します。

* `save_cache`
* `restore_cache`
* `persist_to_workspace`
* `store_artifacts`
* `store_test_results`

すべてのネットワーク転送にはネットワークの使用が発生します。関連するアクションは次のとおりです。

* キャッシュとワークスペースのセルフホストランナーへの復元
* アーティファクトのダウンロード
* CircleCI 外のジョブからのデータプッシュ

ストレージとネットワーク転送の使用状況の詳細は、プラン > プランの使用状況画面で確認できます。

* ネットワークとストレージの総使用量は、画面上部の表に表示されます。
* 個々のプロジェクトのネットワークとストレージの使用状況は、 [Project (プロジェクト)] タブに表示されます。
* ストレージデータアクティビティは、 [Object (オブジェクト)] タブに表示されます。
* 総ストレージ量のデータは[Strage (ストレージ)]タブに表示されます。

![plan-usage-screen]( {{ site.baseurl }}/assets/img/docs/screen-plan-usage.png)

個々のステップのストレージおよびネットワーク転送の使用方法の詳細については、以下のジョブページのステップ出力を参照してください。

![save-cache-job-output]( {{ site.baseurl }}/assets/img/docs/job-output-save-cache.png)

### ストレージとネットワーク転送の使用の管理方法
{: #how-to-manage-your-storage-and-network-transfer-use }

ストレージとネットワークの使用を最大限に活用するために設定を最適化する一般的な方法が複数あります。

データ使用量の削減を試みる前に、まずそのデータの使用を維持する価値が十分にあかるどうかを検討してください。 キャッシュとワークスペースの場合、比較が非常に簡単です。キャッシュによる開発 / 計算時間の節約は、ダウンロードとアップロードのコストを上回っていますか？ ストレージとネットワークの最適化例については、以下を参照してください。

### アーティファクトやキャッシュ/ワークスペースのトラフィックを減らす方法
{: #opportunities-to-reduce-artifact-and-cacheworkspace-traffic }

#### アップロードされているアーティファクトの確認
{: #check-which-artifacts-are-being-uploaded }

Often we see that the store_artifacts step is being used on a large directory when only a few files are really needed, so a simple action you can take is to check which artifacts are being uploaded and why.

If you are using parallelism in your jobs, it could be that each parallel task is uploading an identical artifact. 実行ステップで CIRCLE_NODE_INDEX 環境変数を使用することにより並列タスクの実行に応じてスクリプトの動作を変更できます

#### Uploading large artifacts
{: #uploading-large-artifacts }

* Artifacts that are text can be compressed at very little cost.
* If you are uploading images/videos of UI tests, filter out and upload only failing tests. Many organizations upload all of the images from their UI tests, many of which will go unused.
* If your pipelines build a binary, uberjar, consider if these are necessary for every commit? You may wish to only upload artifacts on failure / success, or perhaps only on a single branch, using a filter.
* If you must upload a large artifact you can upload them to your own bucket at no cost.

#### Caching unused or superfluous dependencies
{: #caching-unused-or-superfluous-dependencies }

Depending on what language and package management system you are using, you may be able to leverage tools that clear or “prune” unnecessary dependencies. For example, the node-prune package removes unnecessary files (markdown, typescript files, etc.) from node_modules.

#### Optimizing cache usage
{: #optimizing-cache-usage }

If you notice your cache usage is high and would like to reduce it, try:

* Searching for the `save_cache` and `restore_cache` commands in your config.yml file to find all jobs utilizing caching and determine if their cache(s) need pruning.
* Narrowing the scope of a cache from a large directory to a smaller subset of specific files.
* Ensuring that your cache “key” is following [best practices]({{ site.baseurl}}/2.0/caching/#further-notes-on-using-keys-and-templates):

{% raw %}
```sh
     - save_cache:
         key: brew-{{epoch}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

Notice in the above example that best practices are not being followed. `brew-{{ epoch }}` will change every build; causing an upload every time even if the value has not changed. This will eventually cost you money, and never save you any time. Instead pick a cache key like the following:

{% raw %}
```sh
     - save_cache:
         key: brew-{{checksum “Brewfile”}}
         paths:
           - /Users/distiller/Library/Caches/Homebrew
           - /usr/local/Homebrew
```
{% endraw %}

Which will only change if the list of requested dependencies has changed. If you find that this is not uploading a new cache often enough, include the version numbers in your dependencies.

* Let your cache be slightly out of date. In contrast to the suggestion above where we ensured that a new cache would be uploaded any time a new dependency was added to your lockfile or version of the dependency changed, use something that tracks it less precisely.

* Prune your cache before you upload it, but make sure you prune whatever generates your cache key as well.

#### Optimizing workspace usage
{: #optimizing-workspace-usage }

If you notice your workspace usage is high and would like to reduce it, try:

* Searching for the `persist_to_workspace` command in your config.yml file to find all jobs utilizing workspaces and determine if all items in the path are necessary.

#### Reducing excess use of network egress
{: #reducing-excess-use-of-network-egress }

If you would like to reduce the amount of network usage that network egress is contributing to, try:

* For runner, deploy any cloud-based runners in AWS US-East-1.
* Download artifacts once and store them on your site for additional processing.
