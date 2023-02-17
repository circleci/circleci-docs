---
layout: classic-docs
title: "データの永続化の概要"
description: "CircleCI でデータを永続化する方法の紹介"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

ここでは、 CircleCI ビルド内外でデータを永続化する様々な方法を概説します。 ジョブ間およびジョブの内外にデータを移動したり、データを永続化して後で使用するには複数の方法があります。 適切なタスクに適切な機能を使用することで、ビルドが高速化し、再現性と効率が向上します。

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| 型        | 用途                                                           | 例                                                                                                                                             |
| -------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 長期アーティファクトを保存します。                                            | **[Job (ジョブ)]** ページの [Artifacts (アーティファクト)] タブから参照できます。 `tmp/circle-artifacts.<hash>/container` などのディレクトリの下に格納されています。                   |
| ワークスペース  | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                         |
| キャッシュ    | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。   `restore_cache` と 適切な `key` を使ってキャッシュを復元する。 |
{: class="table table-striped"}

## キャッシュ
{: #caching }

Caching persists data between the same job in different workflows, allowing you to reuse the data from expensive fetch operations from previous jobs. After an initial job run, future pipelines will run faster as they will not need to redo the work (provided your cache has not been invalidated).

### 依存関係のキャッシュ
{: #caching-dependencies }

キャッシュ戦略の主な例としては、Yarn、Bundler、Pip などの依存関係管理ツールと共に使用することが挙げられます。 When dependencies are restored from a cache, commands like `yarn install` will only need to download new dependencies (if any), instead of re-downloading every dependency on every build.

キャッシュはプロジェクト内でグローバルなため、 1 つのブランチに保存されたキャッシュは、他のブランチで実行されるジョブで使用されます。 キャッシュは、ブランチ間での共有に適したデータにのみ使用してください。

* For more information on caching dependencies, including race conditions, managing caches, and using cache keys, see the [Caching Dependencies](/docs/caching/) page.

### キャッシュの最適化
{: #cache-optimization }

ネットワークとストレージの使用を最大限に活用するために設定を最適化する一般的な方法は複数あります。 たとえば、データ使用量を減らしたい場合、各データの使用量を保持する価値があるかどうかを検討してください。 In the case of caches, this can be quite easy to compare. キャッシュによる開発 / コンピューティング時間の節約は、ダウンロードとアップロードのコストを上回っていますか？

キャッシュ戦略の最適化には、不必要なワークフローの再実行の回避、ジョブの統合、有意義なワークフロー実行順序の作成、キャッシュの削除が含まれます。

* For more information on caching optimization and other caching strategies, like partial dependency caching, caching tradeoffs, and using multiple caches, see the [Caching Strategies](/docs/caching-strategy/) page.

## ワークスペース
{: #workspaces }

ワークスペースは、ワークフローが進むにつれてデータをダウンストリームジョブに転送するために使用されます。 ジョブ内でワークスペースが宣言されていると、ファイルやディレクトリを追加することができます。 追加するたびにワークスペースのファイルシステム内に新しいレイヤーが作成されます。 ダウンストリームジョブで必要に応じてこのワークスペースを使用したり、レイヤーをさらに追加することができます。

### ワークスペースの最適化
{: #workspace-optimization }

ワークスペースの使用量が多く、減らしたい場合は、`config.yml ` ファイル内の `persist_to_workspace` コマンドを検索し、ワークスペースを使用しているすべてのジョブを探し、パス内のすべてのアイテムが必要かどうかを検討してください。

また、失敗したビルドを再実行するためだけにワークスペースを使用している場合もあります。 ビルドが成功したら、そのワークスペースは不要になります。 保存期間を例えば 1 日に設定した方が、プロジェクトに適している場合があります。 ワークスペースのストレージ保存期間を短くし、ストレージに不要なデータを保存しないことにより、コストを削減できます。

* For more information on workspace optimization, configuration, and expiration, see the [Using Workspaces](/docs/workspaces/) page.
* For more information on workflows, see the [Workflows](/docs/workflows/) page.
* [CircleCI のワークスペースの詳細](https://circleci.com/ja/blog/deep-diving-into-circleci-workspaces/)に関するブログ記事もご覧ください。

## アーティファクト
{: #artifacts }

アーティファクトは、パイプラインの出力を長期保存するために使用されます。 For example, if you have a Java project, your build will most likely produce a `.jar` file of your code. このコードはテストによって検証されます。 ビルドやテストプロセスがすべて成功した場合は、プロセスの出力（` .jar `）をアーティファクトとして保存できます。 この `jar `ファイルは、ファイルを作成したワークフローの終了後も長期間アーティファクトシステムからダウンロードできます。

プロジェクトをパッケージ化する必要がある場合は、`.apk` ファイルが Google Play にアップロードされる Android アプリを使用して、アーティファクトとして保存することをお勧めします。 多くのユーザーがアーティファクトを Amazon S3 や Artifactory などの全社的な保存先にアップロードしています。

### アーティファクトの最適化
{: #artifact-optimization }

Artifacts can be useful for troubleshooting why a pipeline is failing. However, once the issue is resolved and the pipeline runs successfully, the artifact might serve little purpose. Setting a storage period of, for example, one day, allows you to both troubleshoot the build as well as save costs by not keeping unnecessary data in storage.

アーティファクトを長期間保存する必要がある場合は、実行しようとしている内容に応じて様々な最適化オプションがあります。 どのプロジェクトもそれぞれ異なりますが、ネットワークとストレージの使用量の削減には以下のアクションをお試し下さい。

- `store_artifacts` が不必要なファイルをアップロードしていないか確認する。
- 並列実行を使用している場合は、同じアーティファクトがないか確認する。
- 最低限のコストでテキストのアーティファクトを圧縮する。
- UI テストのイメージや動画をアップロードする場合は、フィルタを外し、失敗したテストのみをアップロードする。
- フィルタを外し、失敗したテストまたは成功したテストのみをアップロードする。
- 1つのブランチにのみアーティファクトをアップロードする。
- 大きなアーティファクトは、独自のバケットに無料でアップロードする。

For more information on artifact optimization, and using artifacts to persist data once a job has completed, see the [Storing Build Artifacts](/docs/artifacts/) page.

## ネットワークとストレージの使用状況の管理
{: #managing-network-and-storage-usage }

最適化により実現できるのは、ビルドの高速化や効率化の向上だけではありません。 最適化により、コストの削減も可能です。 以下では、ネットワークとストレージの使用量がどのように蓄積されるかを説明しています。最適化やコスト削減方法の検討にお役立てください。

ネットワークとストレージの使用量を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)を開いて以下のステップを実行します。

1. アプリのサイドバーから **Plan** を選択します。
2. **Plan Usage** を選択します。
3. **Network** または **Storage** のどちらか表示したいタブを選択します。

On the **Network** and **Storage** tabs, you will find a breakdown of your usage for the billing period. 使用量は、ストレージオブジェクトタイプ  (キャッシュ、アーティファクト、ワークスペース) 別にも分けられます。

CircleCI Web アプリで分かる範囲以上のご質問がある場合は、**アカウント / 請求** チケットをオープンして[サポート](https://support.circleci.com/hc/ja/requests/new)にご連絡下さい。

### ストレージとネットワーク通信の概要
{: #overview-of-network-and-storage-transfer }

ジョブ内でデータを永続化するための操作には、ストレージの使用が発生しますが、すべてのストレージの使用に料金が発生するわけではありません。 ストレージ使用が発生する関連アクション:

* キャッシュのアップロード
* ワークスペースのアップロード
* アーティファクトのアップロード

上記のアクションを行うジョブを決定するには、プロジェクトの`.circleci/config.yml` ファイルで次のコマンドを検索します。

* `save_cache`
* `persist_to_workspace`
* `store_artifacts`

ストレージとネットワーク通信の使用状況の詳細は、**Plan > Plan Usage** 画面で確認できます。 この画面では以下の内容を確認できます。

- 課金対象となるネットワーク通信量 (画面の一番上の表に表示)
- 個々のプロジェクトのネットワークとストレージの使用量 (Project タブに表示)
- ストレージのデータとアクティビティ (Network タブに表示)
- ストレージ総量のデータ (Storage タブに表示)

請求の対象となる**ネットワーク通信**は、**キャッシュとワークスペースのセルフホストランナーへのリストア**により発生したトラッフィックのみです。

個々のステップのストレージおよびネットワーク通信の使用方法の詳細については、下記の**ジョブ**ページのステップ出力を参照してください。

![ジョブでキャッシュを保存した場合の出力](/docs/assets/img/docs/job-output-save-cache.png)

### ストレージ使用量のカスタマイズ
{: #custom-storage-usage }

有料プランをご利用中のお客様は、[CircleCI Web アプリ](https://app.circleci.com/)で **Plan > Usage Controls** に移動し、ワークスペース、キャッシュ、アーティファクトのストレージ使用量や保存期間をカスタマイズすることができます。 各オブジェクトタイプ毎にスライダーを調節して、カスタムのストレージ期間を設定することができます。 デフォルトでは、保存期間はアーティファクトの場合は 30 日間、キャッシュやワークスペースの場合は 15 日間です。 この日数はストレージの最大保存期間でもあります。 アーティファクトの最大保存期間は 30 日間、キャッシュとワークスペースの最大保存期間は 15 日間です。

各オブジェクトタイプで希望のストレージ保存期間が決まったら、**Save Changes** ボタンをクリックします。その設定は即座に新しく作成されたすべてのワークスペース、キャッシュ、アーティファクトに適用されます。 別の保存期間で保存されている以前作成したオブジェクトに対しては、作成時に設定された保存期間が維持されます。

**Reset to Default Values** ボタンにより、オブジェクトタイプのデフォルトのストレージ保存期間 (アーティファクトは 30 日間、キャッシュとワークスペースは 15 日間) をリセットすることができます。

組織の誰でもカスタムの使用量の制御を見ることはできますが、保存期間を変更できるのは管理者のみです。

![ストレージのコントロール UI 画面](/docs/assets/img/docs/storage-usage-controls.png)

請求期間の終わりにデータを保存すると、使用状況の制御で設定した保存期間に関係なく、そのデータは新しい請求期間の開始時にリストアされます。 たとえば、請求期間の 25 日目に 10 日間の保存期間の設定でキャッシュを保存した場合に　30日目にそのキャッシュに何も変更がなかった場合、新しいキャッシュがビルドされ、新たに 10 日間の保存期間保存されます。

### ストレージ料金とネットワーク料金の概算方法
{: #how-to-calculate-an-approximation-of-network-and-storage-costs}

For our monthly Performance plan customers: billing for network egress and storage started to take effect on **May 1, 2022**, based on your billing date. CircleCI has added variables and controls to help you manage network and storage usage. 現在の使用状況を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)から、**Plan > Plan Usage** に移動してください。
{: class="alert alert-info" }

プランに含まれているネットワークの使用 GB を超える量のランナーネットワーク通信を使用した場合、課金されます。 ネットワークの使用に対する課金は、CircleCI からセルフホストランナーへのトラフィックに対してのみ適用されます。 クラウドホスティングの Executor のみを使用している場合は、ネットワーク料金は適用されません。

ストレージ料金は、プランに含まれているストレージの GB を超えるアーティファクト、ワークスペース、キャッシュを保存する場合に適用されます。

お客様のプランで使用できるネットワークとストレージの量を確認するには、[料金プラン](https://circleci.com/ja/pricing/)のページの機能に関するセクションをご覧ください。 If you would like more details about credit usage, and how to calculate your potential network and storage costs, visit the billing section on the [FAQ](/docs/faq/#how-do-I-calculate-my-monthly-storage-and-network-costs) page.

IP アドレスの範囲機能のデータ使用量に関するご質問については、[よくあるご質問](/docs/faq/#how-do-I-calculate-my-monthly-IP-ranges-costs)をご覧ください。

### ネットワーク通信の過剰な使用を減らす
{: #reducing-excess-use-of-network-egress-and-storage }

セルフホストランナーへのネットワーク通信の使用量は、 CircleCI が提供する組み込みのキャッシュ/ワークスペースではなく、永続ボリュームなどのカスタマイズされたローカルストレージを使用することにより減らせます。

ご自身のストレージのニーズを評価し、[CircleCI Web アプリ](https://app.circleci.com/)で **Plan > Usage Controls** に移動し、アーティファクト、ワークスペース、キャッシュ、のストレージ保存期間をカスタマイズすることによりストレージに対する課金を最小限にすることができます。

## 関連項目
{: #see-also }
- [依存関係のキャッシュ](/docs/caching)
- [キャッシュ戦略](/docs/caching-strategy)
- [ワークスペース](/docs/workspaces)
- [アーティファクト](/docs/artifacts)
- [IP アドレスの範囲機能](/docs/ip-ranges/)
- [最適化の概要](/docs/optimizations)
- [ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)
