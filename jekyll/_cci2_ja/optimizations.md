---
layout: classic-docs
title: "最適化の概要"
short-title: "最適化の概要"
description: "CircleCI ビルドの最適化"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 Each optimization method will be described briefly, and present possible use cases for speeding up your jobs.

* TOC
{:toc}

**Warning:** Persisting data is project specific, and examples is this document are not meant to be copied and pasted into your project. The examples are meant to be guides to help you find areas of opportunity to optimize your own projects.
{: class="alert alert-warning"}

## Docker image choice
{: #docker-image-choice }

プロジェクトに最適な Docker イメージを選択すると、ビルド時間が大幅に短縮されます。 たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを構成し、イメージを指定するときには、以下の点を考慮してください。

* CircleCI provides a range of [convenience images]({{site.baseurl}}/2.0/circleci-images/#section=configuration), typically based on official Docker images, but with a range of useful language tools pre-installed.
* You can [create your own images]({{site.baseurl}}/2.0/custom-images/#section=configuration), maximizing specificity for your projects. To help with this we provide both a [Docker image build wizard](https://github.com/circleci-public/dockerfile-wizard), and [guidance for building images manually]({{site.baseurl}}/2.0/custom-images/#creating-a-custom-image-manually).

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

Docker layer caching is a feature that can help to reduce the _build time_ of a Docker image in your build. DLC is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_, in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

* Read more on the [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching) page.

## 依存関係のキャッシュ
{: #caching-dependencies }

ジョブの最適化にあたってまず検討すべき項目の 1 つがキャッシュです。 ジョブで任意の時点のデータをフェッチする場合は、キャッシュを利用できる可能性があります。 一般的によく用いられるのが、パッケージ マネージャーや依存関係管理ツールです。 たとえば、プロジェクトで Yarn、Bundler、Pip などを利用すると、ジョブの実行中にダウンロードする依存関係は、ビルドのたびに再ダウンロードされるのではなく、後で使用できるようにキャッシュされます。

* Read more on the [Caching Dependencies]({{site.baseurl}}/2.0/caching) page.

## ワークフロー
{: #workflows }

ワークフローは、一連のジョブとその実行順序を定義する機能です。 If at any point in your configuration you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your CI/CD configuration. Read more about workflows on the [Workflow]({{site.baseurl}}/2.0/workflows/) page.

* You can view examples of workflows in the [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

## ワークスペース
{: #workspaces }

ワークスペースを使用すると、_ダウンストリーム ジョブ_に必要な、_その実行に固有_のデータを渡せます。 つまり、ワークスペースを使用して、ビルドの最初の段階で実行するジョブのデータをフェッチし、そのデータをビルドの後段で実行するジョブで_利用する_ことができます。

任意のジョブのデータを永続化し、[`attach_workspace`]({{site.baseurl}}/2.0/configuration-reference#attachworkspace) キーを使用してダウンストリーム ジョブで利用できるようにするには、[`persist_to_workspace`]({{site.baseurl}}/2.0/configuration-reference#persisttoworkspace) キーを使用するようにジョブを構成します。 Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. その後、それらのファイルとディレクトリは、後続のジョブ (およびワークフローの再実行) で使用するためにアップロードされ、利用可能になります。

* Read more on the [Workspaces]({{site.baseurl}}/2.0/workspaces/) page.

## 並列処理
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality]({{site.baseurl}}/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) or a [third party application or library]({{site.baseurl}}/2.0/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

* Read more about splitting tests on the [Parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs/) page.

## リソース クラス
{: #resource-class }

**Note:**  If you are on a container-based plan, you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable this feature on your account. セルフホスティング環境では、システム管理者がリソース クラスのオプションを設定できます。

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 For Cloud, see [this table]({{site.baseurl}}/2.0/configuration-reference/#resourceclass) for a list of available classes, and for self hosted installations contact your system administrator for a list.

* See the `resource_class` section of the [Configuration Reference]({{site.baseURL}}/2.0/configuration-reference/#resourceclass) for more information.

## 関連項目
{: #see-also }
{:.no_toc}

- [データの永続化]({{site.baseurl}}/2.0/persist-data)
- For a complete list of customizations, view the [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/) page.
- For information about how Yarn can potentially speed up builds and reduce errors, view the [Using Yarn]({{site.baseurl}}/2.0/yarn) page.
- Coinbase published an article titled [Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161).
