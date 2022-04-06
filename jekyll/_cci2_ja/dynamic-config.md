---
layout: classic-docs
title: "ダイナミックコンフィグ"
description: "セットアップワークフローによるダイナミックコンフィグの使用方法に関する開発者向けページ"
version:
  - Cloud
---

プロジェクトごとに毎回 CircleCI 設定ファイルを手動で作成するのではなく、特定の[パイプライン]({{ site.baseurl }}/2.0/concepts/#pipelines) パラメーターやファイルパスに応じて設定ファイルを動的に生成できると便利な場合があります。

チームでコードの格納に複数のリポジトリではなくモノレポ (単一のリポジトリ) を使用している場合には特に、条件付きの自動生成が役立ちます。 当然ながら、モノレポを使用する場合、プロジェクトの特定の領域にある特定のビルドだけをトリガーするのが最善です。 そうしなければ、ちょっとした更新を加えるだけだとしても、すべてのマイクロサービスやサブプロジェクトでビルド、テスト、デプロイの一連のプロセスを毎回行うことになります。

どちらの (さらにその他多くの) ユース ケースでも、設定ファイルの自動動的生成を利用すると、CircleCI エクスペリエンスが最適化され、チームの時間とコストの両方を節約できます。

CircleCI のダイナミックコンフィグ機能では、`setup workflow `設定を使用します。 `setup workflow` に含めたジョブでは、演算したパイプライン パラメーターを使用するか、スクリプトによるフォローアップ パイプラインを生成して、子パイプラインを `setup` できます。 それらの演算されたパイプラインパラメーターや生成された `config.yaml` ファイルは、外部ディレクトリに存在する別の `config.yaml` に渡すことができます。

つまり、CircleCI のダイナミックコンフィグ機能では以下が可能です。

- 条件付きでワークフローやコマンドを実行する
- パイプラインパラメーターの値を渡す/ 別の設定ファイルを生成する
- デフォルトの親 `.circleci/` ディレクトリの外部に存在する別の `config.yml` をトリガーする

ダイナミックコンフィグ機能を使用するには、(`.circleci/` ディレクトリにある) 親設定ファイルの最上部に `setup` キーを追加し、値として `true` を設定します。 これで `config.yaml` が`セットアップ ワークフロー`設定として指定され、ダイナミックコンフィグを利用できるようになります。

詳細については、下記の[入門ガイド](#getting-started-with-dynamic-config-in-circleci)を参照してください。

## CircleCI のダイナミックコンフィグの入門ガイド
{: #getting-started-with-dynamic-config-in-circleci }

CircleCI でダイナミックコンフィグ機能の使用を開始するには、以下の手順に従います。

- CircleCI アプリケーションの **[Projects (プロジェクト)]** ダッシュボードで、目的のプロジェクトを選択します。
- 右上隅の **[Project Settings (プロジェクト設定)]** ボタンをクリックします。
- 左側のパネルで **[Advanced (詳細設定)]** を選択します。
- 画面下部にある **[Enable dynamic config using setup workflows (セットアップワークフローによるダイナミックコンフィグを有効にする)]** を、下記画像のようにオンにします。

![UI でのダイナミックコンフィグの有効化]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

これで、プロジェクトで設定ファイルの動的な生成と更新ができるようになりました。

注: 上記のステップにより、ダイナミックコンフィグ機能が使用できるようになりますが、静的な `config.yml` はこれまでどおり動作します。 この機能は、`config.yml` に `setup` キーと`true` 値を追加しないと使用できません。

ダイナミックコンフィグを使用する場合には、`setup workflow` の終わりに、[`continuation`](https://circleci.com/developer/ja/orbs/orb/circleci/continuation) [`Orb`]({{ site.baseurl }}/2.0/orb-intro/) の `continue` ジョブを呼び出す必要があります (**注:** 特定のファイルに対する更新に応じてワークフローやステップを実行する場合には当てはまりません。 詳しくは、「[設定クックブック]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)」の例を参照して下さい)。

`setup workflows` を使ってダイナミックコンフィグを使用する方法の基本的な例は、「[設定クックブック]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#dynamic-configuration)」を参照してください。 このクックブックにはより詳細な例が掲載されており、この機能の成熟に合わせて更新される予定です。

CircleCI のダイナミックコンフィグを使用する際のパイプライン作成/続行プロセスのバックグラウンド処理に関する詳細は、[GitHub のパブリックリポジトリ](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/setup-workflows.md#concepts)を参照してください。

## ダイナミックコンフィグに関するよくあるご質問
{: #dynamic-config-faqs }

### パイプラインパラメーター
{: #pipeline-parameters }

**Q:** パイプラインパラメーターは API でしか使用できないのではありませんか？

**A:** 以前はそうでした。 しかし、ダイナミックコンフィグ機能を使用すると、パイプラインパラメーターを動的に設定してからパイプラインを実行したり、API または Web フック (VCS へのプッシュイベント) からパイプラインをトリガーしたりすることができます。

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
CircleCI Academy の[ダイナミックコンフィグコース](https://academy.circleci.com/dynamic-config?access_code=public-2021) を受講すると、さらに詳しく学ぶことができます。
