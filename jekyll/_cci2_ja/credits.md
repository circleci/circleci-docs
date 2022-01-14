---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: CircleCI のクレジットの使用方法
version:
  - Cloud
---

このドキュメントでは、CircleCI でのクレジット使用の基本事項について説明します。 CircleCI の従来のコンテナベースのプランを利用している場合は、「[コンテナを使用する]({{site.baseurl}}/ja/2.0/containers)」をご覧ください。 コンテナ使用からクレジット使用への切り替えを希望される場合は、[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。

## 概要
{: #overview }

CircleCI のクレジットベースの従量課金制プランでは、チームの CI ソリューションを柔軟にカスタマイズおよびスケールでき、使用量に応じた料金のみが請求されます。 クレジットは分単位で消費され、レートは選択したビルドの構成によって異なります。

チームに最適なプランを検討するときには、以下のような要素を考慮する必要があります。

- チームのユーザー数
- 必要なサポートのレベル (コミュニティによるサポート、標準サポート、プレミアム サポート)
- 複数のマシン タイプへのアクセスの要否
- Docker レイヤー キャッシュ、ビルドの同時処理、ビルド履歴といった機能の要否

例として、Performance プランでクレジットを使用する場合を考えてみましょう。 Performance プランでは以下を利用できます。 この例では、チームが複数のグループに分かれ、それぞれ異なるプロジェクトを進めています。 大規模なプロジェクトもあれば、CI の構成で割り当てるリソースが少なくて済む小規模なプロジェクトもあります。 クレジットを使用すると、リソースを最大化する必要があるマシンと利用時間をピンポイントで指定できます。

たとえば、大規模なプロジェクトのビルドを高速化するためには `large` `resource_class` (vCPU 4 基、RAM 8 GB、20 クレジット/分) を使用できます。 一方、小規模なプロジェクトでコードのリリース頻度が低い場合や、ビルド時間を重視しない場合は `small` `resource_class` (vCPU 1 基、RAM 2 GB、5 クレジット/分) を使用できます。

ご希望のプランを設定するには、CircleCI の Web アプリケーションで [`Settings`] > [`Plan Overview`] を開き、 お客様のニーズに最適なプランを選択します。

## クレジットベース プランの設定
{: #configuring-your-credit-plan }

ご希望のプランを設定するには、CircleCI の Web アプリケーションで [`Settings`] > [`Plan Overview`] を開き、 お客様のニーズに最適なプランを選択します。

## Free プラン
{: #free-plan }

従来の CircleCI のコンテナベース プランと同様に、従量課金制でも無料のプランをご用意しています。 Free プランでも CircleCI の多くの主要機能を利用して生産性、効率、速度を高めることが可能です。

従量課金制の Free プランでは、Medium タイプのマシンに対して毎週一定のビルドクレジットが提供されます (CPU 2 基、4 GBのメモリが提供されます)。 この組み合わせでは、1 分あたりの消費クレジット数が少なく、ユーザーのシート数に制限はありません。 クレジット数の詳細については、 [Pricing](https://circleci.com/pricing/)のページを参照してください。

下記は Free プランでご利用いただける主要機能の一部です。

| 機能                | 説明                                                                         |
| ----------------- | -------------------------------------------------------------------------- |
| 無制限のユーザー数         | CircleCI上でビルドおよび開発できるユーザー数に制限はありません。 異なるチームやグループで複数のプロジェクトの共同作業を行うことが可能です。 |
| 使用可能なリソースクラスの拡張配列 | Docker、Linux、および Windows のリソースクラスの拡張配列にアクセスできます(macOS は近日リリース予定です)。        |
| 同時処理とテスト分割        | ビルドとテスト分割の高速化により、ビルドの生産性とスピードが向上します。                                       |
| セルフホストランナー        | 使用できるランナーの数が増え、CircleCIで作業する際の柔軟性が向上しました。                                  |
| 不安定なテストの検出        | 失敗したテストや不安定なテストのトラブルシューティングに役立つ高度なインサイトをご利用いただけます。                         |
| 無制限のプライベートOrb数    | チームやグループ間で安全に共有することができるプライベート Orbを無制限にご利用いただけます。                           |
| Dockerレイヤーキャッシュ   | Docker のパフォーマンスを利用して迅速にビルドできるように効率化機能が設計されています。                            |
{: class="table table-striped"}

### 無制限のユーザー数
{: #unlimited-users }

Freeプランでは、ユーザー数に制限なく CircleCI 上でビルドや開発を行うことができます。 組織内のより多くのチームやグループとコラボレーションすることができ、スピード、生産性、効率が向上します。

### 使用可能なリソースクラスの拡張配列
{: #expansive-array-of-available-resource-classes }

無料プランでは、 Docker、Linux、Windows、および macOS (近日リリース予定) で最も幅広いリソースクラスをご使用いただけます。 柔軟性の高い選択肢により、適切なコンピューティングリソースを選択することが可能です。

これらのリソースの詳細については、[Executor とイメージ](https://circleci.com/docs/ja/2.0/executor-intro/)を参照してください。

### 同時処理とテスト分割
{: #concurrency-and-test-splitting }

複数のテストを同時に実行する同時処理機能は、ワークフローと同時にジョブを実行することでビルド時間を短縮し、フィードバックサイクルを短縮することができる強力な機能です。

テスト分割の活用方法の詳細は、[テストの並列実行](https://circleci.com/docs/ja/2.0/parallelism-faster-jobs/#using-test-splitting-with-python-django-tests)を参照してください。

### セルフホストランナー
{: #self-hosted-runners }

CircleCI ランナーにより、お客様のインフラを使用してジョブを実行できるため、お客様の環境をより詳細に制御することができ、さまざまなアーキテクチャでのビルドとテストを柔軟に行うことができます。

CircleCI ランナーの使用方法の詳細については、[CircleCIランナーの概要](https://circleci.com/docs/ja/2.0/runner-overview/)を参照してください。

### 不安定なテストの検出
{: #flaky-test-detection }

ワークフローの失敗による平均消費時間は約 30 分です。 不安定なテストを検出することで、ビルドやワークフローにかかる時間を大幅に短縮できます。

不安定なテストの詳細については、[テスト インサイト](https://circleci.com/docs/ja/2.0/insights-tests/#flaky-tests)を参照してください。

### 無制限のプライベートOrb数
{: #unlimited-private-orbs }

CircleCI Orb は共有可能な設定パッケージであり、開発者は組織全体で様々なチームが使用できるように、プライベートで標準化された設定を作成できます。

プライベート Orb の詳細については、[Orbの概要](https://circleci.com/docs/ja/2.0/orb-intro/#private-orbs-vs-public-orbs)を参照してください。

### Docker レイヤーキャッシュ
{: #docker-layer-caching }

ワークフローにおいて常に Dockerイメージを使用する開発者にとって、 Dockerイメージのビルドにかかる時間の短縮は重要な考慮事項です。 Dockerイメージのビルドが CI/CD プロセスにおける日常作業である場合、Docker レイヤーキャッシュ(DLC) の使用を検討してください。 DLC は、ジョブの実行に使用される実際のコンテナに影響を与えるのではなく、ジョブ内で作成されたイメージレイヤーを保存します。

Docker レイヤーキャッシュの詳細は、[Dockerレイヤ ーキャッシュの有効化](https://circleci.com/docs/ja/2.0/docker-layer-caching/)を参照してください。

## Performance プラン
{: #performance-plan }

Performance プランにアップグレードすると、Free プランの内容に加えて複数のメリットが提供されます。

- すべてのマシン サイズの Docker/Linux ベース マシンへのアクセス
- Medium サイズの macOS マシンへのアクセス
- 無制限のユーザーシート数
- Docker レイヤー キャッシュへのアクセス
- キューイングなし
- サポート

## オープンソース プロジェクトでのクレジット使用
{: #open-source-credit-usage }

Free プランの組織には、毎月 400,000 クレジットが無料で付与され、Linux コンピューティングでのオープンソース プロジェクトのビルドに利用できます。 この特典を受け取るには、Free プランを利用し、リポジトリをパブリックにする必要があります。  オープンソース のクレジットの利用可能量や制限は、UI 画面上では確認できません。

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。

## Docker レイヤー キャッシュ
{: #docker-layer-caching }

Docker レイヤー キャッシュ (DLC) は 1 回のジョブ実行につき 200 クレジットでご利用いただけます。 DLCはPerformanceプランでのみ利用可能です。 DLC の詳細については、[こちらのドキュメント]({{site.baseurl}}/2.0/docker-layer-caching)をご覧ください。

## トラブルシューティング
{: #troubleshooting }

### ビルドが「Queued」または「Preparing」の場合、課金されますか？
{: #am-i-charged-if-my-build-is-queued-or-preparing }

はい。 If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If you find that jobs are "preparing" for quite some time, you may be able to reduce it if your jobs use the docker executor; try using more recent docker images to decrease preparation time.

## ご意見・ご質問
{: #questions-and-comments }

ご不明な点がございましたら、まずは「よくあるご質問」の「[料金・支払]({{site.baseurl}}/2.0/faq/#billing)」セクションをご確認ください。 解決しない場合は、お気軽に[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。
