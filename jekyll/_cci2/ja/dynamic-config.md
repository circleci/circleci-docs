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

ダイナミック コンフィグを使用する場合には、`セットアップ` ワークフローの終わりに、[`continuation`](https://circleci.com/developer/ja/orbs/orb/circleci/continuation) [`Orb`]({{ site.baseurl }}/2.0/orb-intro/) の `continue` ジョブを呼び出す必要があります (**注:** 特定のファイルに対する更新に応じてワークフローやステップを実行する場合には当てはまりません。詳しくは、「[構成クックブック]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)」の例を参照)。

`セットアップ` ワークフローを使用してダイナミック コンフィグを利用する方法の基本的な例は、「[構成クックブック]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration)」を参照してください。 クックブックには、他にも詳しい例が掲載されています。クックブックの内容は、この機能の開発に合わせて更新される予定です。

CircleCI のダイナミック コンフィグを使用する際のパイプライン作成/続行プロセスのバックグラウンド処理に関する詳細は、[GitHub の公開リポジトリ](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts)を参照してください。

## ダイナミック コンフィグに関するよくあるご質問
{: #dynamic-config-faqs }

### パイプライン パラメーター
{: #pipeline-parameters }

**Q:** パイプライン パラメーターは API でしか使用できないのではありませんか？

**A:** 以前はそうでした。 しかし、ダイナミック コンフィグ機能を使用すると、パイプライン パラメーターを動的に設定してから、パイプラインを実行したり、API または Web フック (VCS へのプッシュ イベント) からパイプラインをトリガーしたりすることができます。

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
