---
layout: classic-docs
title: "最適化の概要"
short-title: "最適化の概要"
description: "CircleCI ビルドの最適化"
redirect_from: /optimization-cookbook/
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 各方法について簡単に説明し、ジョブを高速化するためのユースケースを紹介します。

* TOC
{:toc}

## ストレージコントロールのカスタマイズ
{: #custom-storage-controls }

[CircleCI Web アプリ](https://app.circleci.com/)では、ワークスペース、キャッシュ、アーティファクトのストレージ保存期間のカスタマイズをコントロールすることができます。 この設定を確認するには、**Plan > Usage Controls** に移動します。 デフォルトでは、保存期間はアーティファクトの場合は 30 日間、キャッシュやワークスペースの場合は 15 日間です。 この日数はストレージの最大保存期間でもあります。 アーティファクトの最大保存期間は 30 日間、キャッシュやワークスペースの最大保存期間は 15 日間です。

See the [Persisting Data]({{site.baseurl}}/persist-data/#custom-storage-usage) page for more information on custom storage settings.

## Docker イメージの選択
{: #docker-image-choice }

プロジェクトに最適な Docker イメージを選択すると、ビルド時間が大幅に短縮されます。 たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを設定し、イメージを指定するときには、以下の点を考慮してください。

* CircleCI provides a range of [convenience images]({{site.baseurl}}/circleci-images/#section=configuration), typically based on official Docker images, but with a range of useful language tools pre-installed.
* You can [create your own images]({{site.baseurl}}/custom-images/#section=configuration), maximizing specificity for your projects. To help with this we provide both a [Docker image build wizard](https://github.com/circleci-public/dockerfile-wizard), and [guidance for building images manually]({{site.baseurl}}/custom-images/#creating-a-custom-image-manually).

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

Docker レイヤーキャッシュは、ビルド内の Docker イメージの_ビルド時間_を短縮するのに役立つ機能です。 日常的な CI/CD プロセスの中で頻繁に Docker イメージをビルドする場合、DLC は大変便利です。

DLC は、ジョブ内でビルドしたイメージレイヤーを_保存_し、それを後続のビルドで使用できるようにするという点で、前述の_依存関係のキャッシュ_に似ています。

* Read more on the [Docker Layer Caching]({{site.baseurl}}/docker-layer-caching) page.

## 依存関係のキャッシュ
{: #caching-dependencies }

ジョブの最適化にあたってまず検討すべき項目の 1 つがキャッシュです。 ジョブで任意の時点のデータをフェッチする場合は、キャッシュを活用できる場合があります。 一般的によく用いられるのが、パッケージ マネージャーや依存関係管理ツールです。 たとえば、プロジェクトで Yarn、Bundler、Pip などを利用すると、ジョブの実行中にダウンロードする依存関係は、ビルドのたびに再ダウンロードされるのではなく、後で使用できるようにキャッシュされます。

* Read more on the [Caching Dependencies]({{site.baseurl}}/caching) page.

## ワークフロー
{: #workflows }

ワークフローは、一連のジョブとその実行順序を定義する機能です。 設定の任意の時点で 2 つのジョブを互いに独立して実行しても問題のないステップがある場合は、ワークフローを使用すると便利です。 ワークフローには、CI/CD を強化するための機能もいくつか用意されています。 Read more about workflows on the [Workflow]({{site.baseurl}}/workflows/) page.

* ワークフローの例については、[CircleCI デモワークフローリポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/)を参照してください。

## ワークスペース
{: #workspaces }

ワークスペースを使用すると、_ダウンストリーム ジョブ_に必要な、_その実行に固有_のデータを渡せます。 つまり、ワークスペースを使用して、ビルドの最初の段階で実行するジョブのデータをフェッチし、そのデータをビルドの後段で実行するジョブで_利用する_ことができます。

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{site.baseurl}}/configuration-reference#attachworkspace) key, configure the job to use the [`persist_to_workspace`]({{site.baseurl}}/configuration-reference#persisttoworkspace) key. `persist_to_workspace` の `paths:` プロパティに記述されたファイルとディレクトリは、root キーで指定しているディレクトリの相対パスとなるワークフローの一時ワークスペースにアップロードされます。 その後、それらのファイルとディレクトリは、後続のジョブ (およびワークフローの再実行) で使用するためにアップロードされ、利用可能になります。

* Read more on the [Workspaces]({{site.baseurl}}/workspaces/) page.

## 並列実行
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality]({{site.baseurl}}/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests), or a [third party application or library]({{site.baseurl}}/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI では、複数のマシンにファイルごとに自動的にテストを割り当てることや、テストの割り当て方法を手動でカスタマイズすることも可能です。

* Read more about splitting tests on the [Parallelism]({{site.baseurl}}/parallelism-faster-jobs/) page.

## リソースクラス
{: #resource-class }

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに設定できます。 For Cloud, see [this table]({{site.baseurl}}/configuration-reference/#resourceclass) for a list of available classes, and for self-hosted installations contact your system administrator for a list.

`resource_class` が明示的に宣言されていない場合、CircleCI は組織に最適なデフォルトのリソースを探します。

* See the `resource_class` section of the [Configuration Reference]({{site.baseurl}}/configuration-reference/#resourceclass) for more information.

## 関連項目
{: #see-also }
{:.no_toc}

- [データの永続化]({{site.baseurl}}/persist-data)
- For a complete list of customizations, view the [Configuration Reference]({{site.baseurl}}/configuration-reference/) page.
- For information about how Yarn can potentially speed up builds and reduce errors, view the [Caching Dependencies]({{site.baseurl}}/caching/#basic-example-of-package-manager-caching) page.
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
