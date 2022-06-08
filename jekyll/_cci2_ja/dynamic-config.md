---
layout: classic-docs
title: "ダイナミックコンフィグ"
description: "セットアップワークフローによるダイナミックコンフィグの使用方法に関する開発者向けページ"
version:
  - クラウド
  - Server v3.x
---

プロジェクトごとに毎回 CircleCI 設定ファイルを手動で作成するのではなく、特定の[パイプライン値]({{ site.baseurl }}/ja/2.0/pipeline-variables/)やファイルパスに応じて設定ファイルを動的に生成できると便利な場合があります。

CircleCI のダイナミックコンフィグ機能により、以下が可能となります。

- 条件付きでワークフローやコマンドを実行する。
- パイプライン パラメーターの値を渡す/ 別の設定ファイルを生成する。
- デフォルトの親 `.circleci/` ディレクトリの外部に存在する別の `config.yml` をトリガーする。

チームでのコードの格納に、複数のリポジトリではなくモノレポ (単一のリポジトリ) を使用している場合には特に、条件付きの自動生成が役立ちます。

例えば、リポジトリで変更されたファイルまたはサブディレクトリに基づいて、ダイナミックコンフィグを使用し、特定のワークフローをトリガーすることが考えられます。 そうしなければ、ちょっとした更新を加えるだけだとしても、すべてのマイクロサービスやサブプロジェクトでビルド、テスト、デプロイの一連のプロセスを毎回行うことになります。 このシナリオは、_パス フィルタリング_とも呼ばれます。

ダイナミックコンフィグを使用するもう 1 つのシナリオは、プロジェクトが複数のモジュールから構成され、それぞれのモジュールが別のジョブを要求する場合です。 こうしたジョブは、設定ファイルの_フラグメント_として複数のファイルに格納できます。 1 つの完全な `.circleci/config.yml` ファイルを使用する代わりに、パイプラインがトリガーされると、ダイナミックコンフィグを使用してこうした個別のフラグメントを結合して完全な設定ファイルにすることができます。 このシナリオは、_コンフィグ分割_とも呼ばれます。

## CircleCI のダイナミックコンフィグの入門ガイド
{: #getting-started-with-dynamic-config-in-circleci }

CircleCI でダイナミックコンフィグの使用を開始するには、以下の手順に従います。

1. CircleCI Web アプリケーションの **Projects** ダッシュボードで、目的のプロジェクトを選択します。
2. 右上隅の **Project Settings** ボタンをクリックします。
3. 左側のパネルで **Advanced** を選択します。
4. **Enable dynamic config using setup workflows (セットアップ ワークフローによるダイナミックコンフィグを有効にする)** 設定までスクロールし、下記画像のようにオンにします。
  <br>
  ![UI でのダイナミックコンフィグの有効化]({{ site.baseurl }}/assets/img/docs/dynamic-config-enable.png)

5. 上記のステップにより、ダイナミックコンフィグ機能が使用できるようになりますが、静的な `config.yml` はこれまでどおり動作します。 この機能は、`config.yml` に `setup` キーと `true` 値を追加しないと使用**できません**。 `setup: true` キーを (`.circleci/` ディレクトリ内の) 親設定ファイルの最上部に追加すると、その `config.yml` は設定ファイルとして指定されます。
6. `setup` ワークフローの最後で、[`continuation` Orb](https://circleci.com/developer/orbs/orb/circleci/continuation) から `continue` ジョブを呼び出す必要があります。 **注:** [ダイナミックコンフィグの使用]({{ site.baseurl }}/ja/2.0/using-dynamic-configuration) で説明されているように、 **指定されたファイルの更新** に基づいてワークフローまたはステップを条件付きで実行する場合 ("パスフィルタリング")、これは適用 _されません_ 。

## ダイナミックコンフィグが機能するしくみ
{: #how-dynamic-config-works }

CircleCI のダイナミックコンフィグ機能では、セットアップワークフローを使用します。 _セットアップ ワークフロー_には、パイプラインパラメーターを演算するジョブを含めることが可能で、パイプラインパラメーターは、その後、他のディレクトリに存在する別の設定ファイルに渡すことができます。 セットアップ ワークフローはまた、既存のスクリプトを使って新しい設定ファイルを生成することもできます。 いずれの場合でも、セットアップワークフローは、目的の次の設定ファイルまでパイプラインを続行します。

その裏では、_continuation_ 設定は、パブリック_pipeline continuation (パイプラインの続行)_ API への呼び出しとして実行されます。 この API は、_continuation キー_を受け入れます。このキーはジョブ (初期セットアップ ワークフローの一部として実行) の環境に自動的に挿入され、パイプラインごとに一意のシークレットキーとなります。 API はまた、設定ファイル文字列と一連のパイプライン パラメーターも受け入れます。

次の内容に注意してください。
- セットアップには、`version: 2.1` 以上を指定する必要があります。
- パイプラインは一回のみ続行できます (つまり、別のセットアップ設定では、パイプラインは続行できません)。
- パイプラインは、作成して 6 時間以内であれば続行できます。
- セットアップ設定には、1 つのワークフローのみを含めることができます。
- 続行時間に送信されたパイプラインパラメーターは、トリガー (セットアップ) 時に送信されたパイプラインパラメーターとオーバーラップすることはできません。
- セットアップ設定で宣言されたパイプラインパラメーターは、continuation 設定でも宣言される必要があります。 このパラメーターは、続行時に使用することができます。

セットアップ ワークフローを使用してダイナミックコンフィグを生成する方法の基本的な例は、[ダイナミックコンフィグの使用]({{ site.baseurl }}/ja/2.0/using-dynamic-configuration)を参照してください。

## ダイナミックコンフィグに関するよくあるご質問
{: #dynamic-config-faqs }

### パイプラインパラメーター
{: #pipeline-parameters }

**Q:** パイプラインパラメーターは API でしか使用できないのではありませんか？

**A:** 以前はそうでした。 今では、ダイナミックコンフィグ機能を使用すると、パイプラインが実行される (API または Webhook のいずれかからトリガーされる、つまり VCS へのプッシュイベント) 前に、パイプラインパラメーターを動的に設定できるようになりました。

### カスタム Executor
{: #custom-executors}

**Q:** カスタム Executor を使用できますか？

**A:** カスタム Executor は使用できますが、continuation ステップが機能するように、特定の依存関係をインストールする必要があります (現時点: `curl`、`jq`)。

### continuation Orb
{: #the-continuation-orb }

**Q:** `continuation` Orb とは何ですか？

**A:** `continuation` Orb は、パイプラインの続行プロセスを管理できるようにユーザーを支援します。 `continuation` Orb は、 [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) に対する API 呼び出しをラップします。 詳細については、[`continuation`](https://circleci.com/developer/orbs/orb/circleci/continuation) Orb のドキュメントを参照してください。

**Q:** continuation Orb を使用**しない**ことは可能ですか？

**A:** continuation Orb でカバーされない特別な要件がある場合は、他の方法で同じ機能を実装することができます。 Orb を使って続行機能がどのように実装されているかを学習するには、[Orb Source](https://circleci.com/developer/orbs/orb/circleci/continuation#orb-source)を参照してください。

## 次のステップ
{: #what-to-read-next }
- [ダイナミックコンフィグの使用]({{ site.baseurl }}/ja/2.0/using-dynamic-configuration/) ガイド
- [`continuation`](https://circleci.com/developer/ja/orbs/orb/circleci/continuation) Orb
- [`continuePipeline`](https://circleci.com/docs/api/v2/#operation/continuePipeline) API 呼び出し
- CircleCI Academy の[ダイナミックコンフィグコース](https://academy.circleci.com/dynamic-config?access_code=public-2021) を受講すると、さらに詳しく学ぶことができます。

