---
layout: classic-docs
title: "ダイナミック コンフィグ"
description: "セットアップ ワークフローによるダイナミック コンフィグの使用方法に関する開発者向けページ"
version:
  - Cloud
---

プロジェクトごとに毎回 CircleCI 設定ファイルを手動で作成するのではなく、特定の[パイプライン]({{ site.baseurl }}/2.0/concepts/#pipelines) パラメーターやファイルパスに応じて設定ファイルを動的に生成できると便利な場合があります。

チームでコードの格納に複数のリポジトリではなくモノレポ (単一のリポジトリ) を使用している場合には特に、条件付きの自動生成が役立ちます。 当然ながら、モノレポを使用する場合、プロジェクトの特定の領域にある特定のビルドだけをトリガーするのが最善です。 そうしなければ、ちょっとした更新を加えるだけだとしても、すべてのマイクロサービスやサブプロジェクトでビルド、テスト、デプロイの一連のプロセスを毎回行うことになります。

どちらの (さらにその他多くの) ユース ケースでも、設定ファイルの自動動的生成を利用すると、CircleCI エクスペリエンスが最適化され、チームの時間とコストの両方を節約できます。

CircleCI のダイナミック コンフィグ機能では、`セットアップ ワークフロー`構成を使用します。 `セットアップ ワークフロー`に含めたジョブでは、演算したパイプライン パラメーターを使用するか、スクリプトによるフォローアップ パイプラインを生成して、子パイプラインを`セットアップ`できます。 それらの演算されたパイプライン パラメーターや生成された `config.yaml` ファイルは、外部ディレクトリに存在する別の `config.yaml` に渡すことができます。

要約すると、CircleCI のダイナミック コンフィグ機能では以下が可能です。

- 条件付きでワークフローやコマンドを実行する
- パイプライン パラメーターの値を渡す/別の設定ファイルを生成する
- デフォルトの親 `.circleci/` ディレクトリの外部に存在する別の `config.yml` をトリガーする

ダイナミック コンフィグ機能を使用するには、(`.circleci/` ディレクトリにある) 親設定ファイルの最上部に `setup` キーを追加し、値として `true` を設定します。 これで `config.yaml` が`セットアップ ワークフロー`構成として指定され、ダイナミック コンフィグを利用できるようになります。

詳細については、この後の[使用開始に関するセクション](#getting-started-with-dynamic-config-in-circleci)を参照してください。

## CircleCI のダイナミック コンフィグの使用を開始する
{: #getting-started-with-dynamic-config-in-circleci }

CircleCI でダイナミック コンフィグの使用を開始するには、以下の手順に従います。

- CircleCI アプリケーションの **[Projects (プロジェクト)]** ダッシュボードで、目的のプロジェクトを選択します。
- 右上隅の **[Project Settings (プロジェクト設定)]** ボタンをクリックします。
- 左側のパネルで **[Advanced (詳細設定)]** を選択します。
- 画面下部にある **[Enable dynamic config using setup workflows (セットアップ ワークフローによるダイナミック コンフィグを有効にする)]** を、下記画像のようにオンにします。

![UI でのダイナミック コンフィグの有効化]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

これで、プロジェクトで設定ファイルの動的な生成と更新ができるようになりました。

Note: While the steps above will make the feature available, your static `config.yml` will continue to work as normal. This feature will not be used until you add the key `setup` with a value of `true` to that `config.yml`.

When using dynamic configuration, at the end of the `setup workflow`, a `continue` job from the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) [`orb`]({{ site.baseurl }}/2.0/orb-intro/) must be called (**NOTE:** this does not apply if you desire to conditionally execute workflows or steps based on updates to specified files, as described in the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified) example).

For a basic example on how to use `setup workflows` for dynamic configuration generation, see the [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration). Included in the cookbook are other more in-depth examples, which will be updated as this feature matures.

For a more in-depth explanation on the behind-the-scenes pipeline creation/continuation process when using CircleCI's dynamic configuration, see our [public GitHub repository](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts).

## ダイナミック コンフィグに関するよくあるご質問
{: #dynamic-config-faqs }

### パイプライン パラメーター
{: #pipeline-parameters }

**Q:** I thought pipeline parameters could only be used with the API?

**A:** Previously, this was true. But using our dynamic configuration feature, you can set pipeline parameters dynamically, before the pipeline is executed, triggered from both the API, or a webhook (A push event to your VCS).

### continuation Orb
{: #the-continuation-orb }

**Q:** What is the `continuation` orb?

**A:** The `continuation` orb assists CircleCI users in managing the pipeline continuation process easily. The `continuation` orb wraps an API call to [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) in an easy-to-use fashion. See the [`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) orb documentation for more information.

## 次に読む
{: #what-to-read-next }
- クックブック内のサンプル
  - [基本的な例]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
  - [変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)
- [`continuation`](https://circleci.com/developer/ja/orbs/orb/circleci/continuation) Orb
- [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API 呼び出し

## Learn More
{: #learn-more }
Take the [dynamic configuration course](https://academy.circleci.com/dynamic-config) with CircleCI Academy to learn more.
