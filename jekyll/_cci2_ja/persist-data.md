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

キャッシュはプロジェクト内でグローバルなため、 1 つのブランチに保存されたキャッシュは、他のブランチで実行されるジョブで使用されます。 キャッシュは、ブランチ間での共有に適したデータにのみ使用してください。

* 競合状態、キャッシュの管理、有効期限、キャッシュキーの使用など依存関係のキャッシュに関する詳細は、[依存関係のキャッシュ]({{site.baseurl}}/2.0/caching/)をご覧ください。

### キャッシュの最適化
{: #cache-optimization }

ネットワークとストレージの使用を最大限に活用するために設定を最適化する一般的な方法は複数あります。 たとえば、データ使用量を減らしたい場合、各データの使用量を保持する価値があるかどうかを検討してください。 キャッシュの場合、比較検討が非常に簡単にできます。 キャッシュによる開発 / コンピューティング時間の節約は、ダウンロードとアップロードのコストを上回っていますか？

キャッシュ戦略の最適化には、不必要なワークフローの再実行の回避、ジョブの統合、有意義なワークフロー実行順序の作成、キャッシュの削除が含まれます。

* キャッシュの詳細や一部の依存関係のキャッシュ、キャッシュのトレードオフ、複数のキャッシュの使用などその他のキャッシュ戦略に関する情報は、[キャッシュ戦略]({{site.baseurl}}/2.0/caching-strategy/) をご覧ください。

## ワークスペース
{: #workspaces }

ワークスペースは、ワークフローが進むにつれてデータをダウンストリームジョブに転送するために使用されます。 ジョブ内でワークスペースが宣言されていると、ファイルやディレクトリを追加することができます。 追加するたびにワークスペースのファイルシステム内に新しいレイヤーが作成されます。 ダウンストリームジョブで必要に応じてこのワークスペースを使用したり、レイヤーをさらに追加することができます。

### ワークスペースの最適化
{: #workspace-optimization }

ワークスペースの使用量が多く、減らしたい場合は、`config.yml ` ファイル内の `persist_to_workspace` コマンドを検索し、ワークスペースを使用しているすべてのジョブを探し、パス内のすべてのアイテムが必要かどうかを検討してください。

また、失敗したビルドを再実行するためだけにワークスペースを使用している場合もあります。 ビルドが成功したら、そのワークスペースは不要になります。 保存期間を例えば 1 日に設定した方が、プロジェクトに適している場合があります。 ワークスペースのストレージ保存期間を短くし、ストレージに不要なデータを保存しないことにより、コストを削減できます。

* ワークスペースの最適化、設定、有効期限に関する詳細は、[ワークスペースの使用]({{site.baseurl}}/2.0/workspaces/)をご覧ください。
* ワークフローの詳細については、[ワークフロー]({{site.baseurl}}/2.0/workflows/)を参照してください。
* [CircleCI のワークスペースの詳細](https://circleci.com/ja/blog/deep-diving-into-circleci-workspaces/)に関するブログ記事もご覧ください。

## アーティファクト
{: #artifacts }

アーティファクトは、パイプラインの出力を長期保存するために使用されます。 たとえば Java プロジェクトを使用している場合、ビルドにより多くの場合、コードの` .jar `ファイルが生成されます。 このコードはテストによって検証されます。 ビルドやテストプロセスがすべて成功した場合は、プロセスの出力（` .jar `）をアーティファクトとして保存できます。 この `jar `ファイルは、ファイルを作成したワークフローの終了後も長期間アーティファクトシステムからダウンロードできます。

プロジェクトをパッケージ化する必要がある場合は、`.apk` ファイルが Google Play にアップロードされる Android アプリを使用して、アーティファクトとして保存することをお勧めします。 多くのユーザーがアーティファクトを Amazon S3 や Artifactory などの全社的な保存先にアップロードしています。

### アーティファクトの最適化
{: #artifact-optimization }

アーティファクトにより、ビルドに失敗する問題を解決することができます。 問題が解決し、ビルドに成功したら、アーティファクトの役目はほぼ終了です。 保存期間を例えば 1 日に設定すると、ビルドのトラブルシューティングを行い、かつストレージに不要なデータを保存しないためコストを削減することができます。

アーティファクトを長期間保存する必要がある場合は、実行しようとしている内容に応じて様々な最適化オプションがあります。 どのプロジェクトもそれぞれ異なりますが、ネットワークとストレージの使用量の削減には以下のアクションをお試し下さい。

- `store_artifacts` が不必要なファイルをアップロードしていないか確認する。
- 並列実行を使用している場合は、同じアーティファクトがないか確認する。
- 最低限のコストでテキストのアーティファクトを圧縮する。
- UI テストのイメージや動画をアップロードする場合は、フィルタを外し、失敗したテストのみをアップロードする。
- フィルタを外し、失敗したテストまたは成功したテストのみをアップロードする。
- 1つのブランチにのみアーティファクトをアップロードする。
- 大きなアーティファクトは、独自のバケットに無料でアップロードする。

アーティファクトの最適化に関する詳細やアーティファクトを使用してジョブの完了後にデータを永続化する方法の詳細については、[ビルドアーティファクトの保存方法]({{site.baseurl}}/2.0/artifacts/)を参照してください。

## ネットワークとストレージの使用状況の管理
{: #managing-network-and-storage-usage }

最適化により実現できるのは、ビルドの高速化や効率化の向上だけではありません。 最適化により、コストの削減も可能です。 以下では、ネットワークとストレージの使用量がどのように蓄積されるかを説明しています。最適化やコスト削減方法の検討にお役立てください。

ネットワークとストレージの使用量を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)を開いて以下のステップを実行します。

1. アプリのサイドバーから **Plan** を選択します。
2. **Plan Usage** を選択します。
3. **Network** または **Storage** のどちらか表示したいタブを選択します。

この Network タブおよび Storage タブから請求期間毎の使用量の詳細を見ることができます。  使用量は、ストレージオブジェクトタイプ  (キャッシュ、アーティファクト、ワークスペース) 別にも分けられます。

CircleCI Web アプリで分かる範囲以上のご質問がある場合は、**アカウント / 請求** チケットをオープンして[サポート](https://support.circleci.com/hc/en-us/requests/new)にご連絡下さい。

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

ストレージとネットワーク通信の使用状況の詳細は、**Plan > Plan Usage** 画面で確認できます。 この画面では以下のことが確認できます。

- 課金対象となるネットワーク通信量 (画面の一番上の表に表示)
- 個々のプロジェクトのネットワークとストレージの使用量 (Project タブに表示)
- ストレージのデータとアクティビティ (Network タブに表示)
- ストレージ総量のデータ (Storage タブに表示)

請求の対象となる**ネットワーク通信**は、**キャッシュとワークスペースのセルフホストランナーへのリストア**により発生したトラッフィックのみです。


個々のステップのストレージおよびネットワーク通信の使用方法の詳細については、下記の**ジョブ**ページのステップ出力を参照してください。

![save-cache-job-output]({{site.baseurl}}/assets/img/docs/job-output-save-cache.png)

### ストレージ使用量のカスタマイズ
{: #custom-storage-usage }

You can customize storage usage retention periods for workspaces, caches, and artifacts on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. Here you can set custom storage periods by adjusting the sliders for each object type (see image below). By default, the storage period is 30 days for artifacts, and 15 days for caches and workspaces. These are also the maximum retention periods for storage. The maximum storage period is 30 days for artifacts, and 15 days for caches and workspaces.

When you have determined your preferred storage retention for each object type, click the **Save Changes** button and your preferences will take effect immediately for any new workspaces, caches, or artifacts created. Previously created objects that are stored with a different retention period will continue to persist for the retention period set when the object was created.

The **Reset to Default Values** button will reset the object types to their default storage retention periods: 30 days for artifacts, and 15 days for caches and workspaces.

Anyone in the organization can view the custom usage controls, but you must be an admin to make changes to the storage periods.

![storage-usage-controls]({{site.baseurl}}/assets/img/docs/storage-usage-controls.png)

If you store data toward the end of your billing cycle, the data will be restored when the cycle restarts, for whatever storage period you have set in your usage controls. For example, if you restore and save a cache on day 25 of your billing cycle with a 10 day storage period set, and on day 30 no changes have been made to the cache, on day 31, a new cache will be built and saved for a new 10 day storage period.

### ストレージ料金とネットワーク料金の概算方法
{: #how-to-calculate-an-approximation-of-network-and-storage-costs}

**注:** Performance プランのお客様の場合、外向きの通信とストレージに対する課金は、2022 年 5 月 1 日より有効になり、お客様の請求日に基づいて請求されます (変更される場合があります)。 CircleCI では現在、ネットワークとストレージの使用状況を管理するための変数と制御機能を追加しており、**2022 年 4 月 1 日**よりご利用いただける予定です。 ここで記載されている内容は、2022 年 5 月 1 日にこれらの追加変更が有効になって以降適用されます。 現在の使用状況を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)から、**Plan > Plan Usage** に移動してください。
{: class="alert alert-info" }

Network charges apply when an organization has runner network egress beyond the included network GB allotment. ネットワークの使用に対する課金は、CircleCI からセルフホストランナーへのトラフィックに対してのみ適用されます。 クラウドホスティングの Executor のみを使用している場合は、ネットワーク料金は適用されません。

Storage charges apply when you retain artifacts, workspaces, and caches beyond the included storage GB allotment.

お客様のプランで使用できるネットワークとストレージの量を確認するには、[料金プラン](https://circleci.com/pricing/)のページの機能に関するセクションをご覧ください。 クレジットの使用量、および今後のネットワークとストレージの料金の計算方法の詳細については、[よくあるご質問]({{site.baseurl}}/2.0/faq/#how-do-I-calculate-my-monthly-storage-and-network-costs)の請求に関するセクションを参照してください。

For questions on data usage for the IP ranges feature, visit the [FAQ](https://circleci.com/docs/2.0/faq/#how-do-I-calculate-my-monthly-IP-ranges-costs) page.

### Reducing excess use of network egress and storage
{: #reducing-excess-use-of-network-egress-and-storage }

セルフホストランナーへのネットワーク通信の使用量は、 `US-East-1` でランナーを AWS 上でホストすることにより減らせます。

Billing for storage can be minimized by evaluating your storage needs and setting custom storage retention periods for artifacts, workspaces, and caches on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**.

## 関連項目
{: #see-also }
{:.no_toc}
- [依存関係のキャッシュ]({{site.baseurl}}/ja/2.0/caching)
- [キャッシュ戦略]({{site.baseurl}}/ja/2.0/caching-strategy)
- [ワークスペース]({{site.baseurl}}/ja/2.0/workspaces)
- [アーティファクト]({{site.baseurl}}/ja/2.0/artifacts)
- [IP アドレスの範囲機能]({{site.baseurl}}/ja/2.0/ip-ranges/)
- [最適化の概要]({{site.baseurl}}/ja/2.0/optimizations)
