---
layout: classic-docs
title: "最適化の概要"
short-title: "最適化の概要"
description: "CircleCI ビルドの最適化"
redirect_from: /ja/optimization-cookbook/
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 各方法について簡単に説明し、ジョブを高速化するためのユースケースを紹介します。

* TOC
{:toc}

## ストレージコントロールのカスタマイズ
{: #custom-storage-controls }

[CircleCI Web アプリ](https://app.circleci.com/)では、ワークスペース、キャッシュ、アーティファクトのストレージ保存期間のカスタマイズをコントロールすることができます。 この設定を確認するには、**Plan > Usage Controls** に移動します。 デフォルトでは、保存期間はアーティファクトの場合は 30 日間、キャッシュやワークスペースの場合は 15 日間です。 この日数はストレージの最大保存期間でもあります。 アーティファクトの最大保存期間は 30 日間、キャッシュやワークスペースの最大保存期間は 15 日間です。

ストレージのカスタム設定の詳細は、[データの永続化]({{site.baseurl}}/ja/persist-data/#custom-storage-usage)のページを参照してください。

## Docker イメージの選択
{: #docker-image-choice }

プロジェクトに最適な Docker イメージを選択すると、ビルド時間が大幅に短縮されます。 たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを設定し、イメージを指定するときには、以下の点を考慮してください。

* CircleCI には多数の [CircleCI イメージ]({{site.baseurl}}/ja/circleci-images/#section=configuration) が用意されています。 多くは公式の Docker イメージに基づいていますが、便利な言語ツールもプリインストールされています。
* プロジェクトに特化した[独自のイメージを作成]({{site.baseurl}}/ja/custom-images/#section=configuration)することも可能です。 そのサポートガイドとして、[Docker イメージ ビルドウィザード](https://github.com/circleci-public/dockerfile-wizard)や[イメージを手動でビルドするためのガイド]({{site.baseurl}}/ja/custom-images/#creating-a-custom-image-manually)を提供しています。

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

Docker レイヤーキャッシュは、ビルド内の Docker イメージの_ビルド時間_を短縮するのに役立つ機能です。 日常的な CI/CD プロセスの中で頻繁に Docker イメージをビルドする場合、DLC は大変便利です。

DLC は、ジョブ内でビルドしたイメージレイヤーを_保存_し、それを後続のビルドで使用できるようにするという点で、前述の_依存関係のキャッシュ_に似ています。

* 詳細については、[Docker レイヤーキャッシュ]({{site.baseurl}}/ja/docker-layer-caching)を参照してください。

## 依存関係のキャッシュ
{: #caching-dependencies }

ジョブの最適化にあたってまず検討すべき項目の 1 つがキャッシュです。 ジョブで任意の時点のデータをフェッチする場合は、キャッシュを活用できる場合があります。 一般的によく用いられるのが、パッケージ マネージャーや依存関係管理ツールです。 たとえば、プロジェクトで Yarn、Bundler、Pip などを利用すると、ジョブの実行中にダウンロードする依存関係は、ビルドのたびに再ダウンロードされるのではなく、後で使用できるようにキャッシュされます。

* 詳細については、[依存関係のキャッシュガイド]({{site.baseurl}}/ja/caching)を参照してください。

## ワークフロー
{: #workflows }

ワークフローは、一連のジョブとその実行順序を定義する機能です。 設定の任意の時点で 2 つのジョブを互いに独立して実行しても問題のないステップがある場合は、ワークフローを使用すると便利です。 ワークフローには、CI/CD を強化するための機能もいくつか用意されています。 詳細については、[ワークフロー]({{site.baseurl}}/ja/workflows/)を参照してください。

* ワークフローの例については、[CircleCI デモワークフローリポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/)を参照してください。

## ワークスペース
{: #workspaces }

ワークスペースを使用すると、_ダウンストリーム ジョブ_に必要な、_その実行に固有_のデータを渡せます。 つまり、ワークスペースを使用して、ビルドの最初の段階で実行するジョブのデータをフェッチし、そのデータをビルドの後段で実行するジョブで_利用する_ことができます。

任意のジョブのデータを永続化し、[`attach_workspace`]({{site.baseurl}}/ja/configuration-reference#attachworkspace) キーを使用してダウンストリームジョブで利用できるようにするには、[`persist_to_workspace`]({{site.baseurl}}/ja/configuration-reference#persisttoworkspace) キーを使用するようにジョブを設定します。 `persist_to_workspace` の `paths:` プロパティに記述されたファイルとディレクトリは、root キーで指定しているディレクトリの相対パスとなるワークフローの一時ワークスペースにアップロードされます。 その後、それらのファイルとディレクトリは、後続のジョブ (およびワークフローの再実行) で使用するためにアップロードされ、利用可能になります。

* 詳細については、[ワークスペース]({{site.baseurl}}/ja/workspaces/)を参照してください。

## 並列実行
{: #parallelism }

プロジェクトに大規模なテストスイートがある場合は、[`parallelism`]({{site.baseurl}}/ja/configuration-reference#parallelism)と[CircleCI のテスト分割機能]({{site.baseurl}}/ja/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests)または[サードパーティのアプリケーションまたはライブラリ]({{site.baseurl}}/ja/parallelism-faster-jobs/#other-ways-to-split-tests)を使用するようにビルドを設定し、テストを複数のマシンに分割することができます。 CircleCI では、複数のマシンにファイルごとに自動的にテストを割り当てることや、テストの割り当て方法を手動でカスタマイズすることも可能です。

* テストの分割の詳細については、[並列実行]({{site.baseurl}}/ja/parallelism-faster-jobs)を参照してください。

## リソースクラス
{: #resource-class }

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに設定できます。 クラウド版で使用可能なクラスの一覧は、[こちらの表]({{site.baseurl}}/ja/configuration-reference/#resourceclass)にまとめています。セルフホスティング環境で使用可能なクラスについては、システム管理者にお問い合わせください。

`resource_class` が明示的に宣言されていない場合、CircleCI は組織に最適なデフォルトのリソースを探します。

* 詳細については、[設定ファイルのリファレンス]({{site.baseurl}}/ja/configuration-reference/#resourceclass)の `resource_class` を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- [データの永続化]({{site.baseurl}}/ja/persist-data)
- カスタマイズの全リストについては、[設定ファイルのリファレンス]({{site.baseurl}}/ja/configuration-reference/)をご覧ください。
- Yarn によりビルドを高速化し、エラーを削減する方法については、[依存関係のキャッシュ]({{site.baseurl}}/ja/caching/#basic-example-of-package-manager-caching)のページをご覧ください。
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
