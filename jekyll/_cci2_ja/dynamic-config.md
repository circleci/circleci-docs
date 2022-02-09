---
layout: classic-docs
title: "ダイナミック コンフィグ"
description: "セットアップ ワークフローによるダイナミック コンフィグの使用方法に関する開発者向けページ"
version:
  - Cloud
---

You may find that instead of manually creating each and every individual CircleCI configuration per project, you would prefer to generate these configurations dynamically, depending on specific [pipeline]({{ site.baseurl }}/2.0/concepts/#pipelines) parameters or file-paths.

This becomes particularly useful in cases where your team is using a monorepo, or a single repository, as opposed to using multiple repositories to store your code. In the case of using a monorepo, it is of course optimal to only trigger specific builds in specific areas of your project. Otherwise, all of your microservices/sub-projects will go through the entirety of your build, test, and deployment processes when any single update is introduced.

In both of these (and many other) use cases, automatic, dynamic generation of your configuration files will optimize your CircleCI experience and save your team both time and money.

CircleCI のダイナミック コンフィグ機能では、`セットアップ ワークフロー`構成を使用します。 A `setup workflow` can contain jobs that `setup` children pipelines through computed pipeline parameters, or by generating follow-up pipelines via pre-existing scripts. These computed pipeline parameters and/or generated `config.yaml` files can then be passed into an additional `config.yaml` that potentially exists in outside directories.

要約すると、CircleCI のダイナミック コンフィグ機能では以下が可能です。

- 条件付きでワークフローやコマンドを実行する
- パイプライン パラメーターの値を渡す/別の設定ファイルを生成する
- デフォルトの親 `.circleci/` ディレクトリの外部に存在する別の `config.yml` をトリガーする

To use our dynamic configuration feature, you can add the key `setup` with a value of `true` to the top-level of your parent configuration file (in the `.circleci/` directory). This will designate that `config.yaml` as a `setup workflow` configuration, enabling you and your team to get up and running with dynamic configuration.

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

`セットアップ` ワークフローを使用してダイナミック コンフィグを利用する方法の基本的な例は、「[構成クックブック]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration)」を参照してください。 クックブックにはより詳細な例が掲載されており、この機能の成熟に合わせて更新される予定です。

For a more in-depth explanation on the behind-the-scenes pipeline creation/continuation process when using CircleCI's dynamic configuration, see our [public GitHub repository](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts).

## ダイナミック コンフィグに関するよくあるご質問
{: #dynamic-config-faqs }

### パイプライン パラメーター
{: #pipeline-parameters }

**Q:** パイプライン パラメーターは API でしか使用できないのではありませんか？

**A:** 以前はそうでした。 But using our dynamic configuration feature, you can set pipeline parameters dynamically, before the pipeline is executed, triggered from both the API, or a webhook (A push event to your VCS).

### continuation Orb
{: #the-continuation-orb }

**Q:** `continuation` Orb とは何ですか？

**A:** `continuation` Orb は、パイプラインの続行プロセスを簡単に管理できるように CircleCI ユーザーを支援する Orb です。 `continuation` Orb は、[`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) に対する API 呼び出しを使いやすくラップします。 詳細については、[`continuation` Orb のドキュメント](https://circleci.com/developer/ja/orbs/orb/circleci/continuation)を参照してください。

## 次に読む
{: #what-to-read-next }
- クックブック内のサンプル
  - [基本的な例]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
  - [変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)
- [`continuation`](https://circleci.com/developer/ja/orbs/orb/circleci/continuation) Orb
- [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API 呼び出し

## さらに詳しく
{: #learn-more }
Take the [dynamic configuration course](https://academy.circleci.com/dynamic-config?access_code=public-2021) with CircleCI Academy to learn more.
