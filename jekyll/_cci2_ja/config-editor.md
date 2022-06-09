---
layout: classic-docs
title: "CircleCI アプリ内の設定ファイルエディターの使用"
description: "アプリ内設定ファイルエディターの使用方法と機能"
version:
  - クラウド
  - Server v3.x
---

CircleCI 設定ファイルエディターにより、[CircleCI CLI]({{site.baseurl}}/ja/2.0/local-cli/) やテキストエディターを使わずに CircleCI 設定ファイルを変更することができます。 また、CI/CD プロセスを統一された方法で迅速に変更できます。

![Configuration Editor]({{site.baseurl}}/assets/img/docs/config-editor-main.png)

CircleCI 設定ファイルエディターを利用すると、以下のメリットがあります。

- 自動バリデーションおよびエラーチェック機能
- Auto-complete suggestions
- CircleCI の設定ファイル構文固有の設定ツールチップ
- CircleCI のコンセプトに関する説明
- 使いやすい CircleCI ドキュメント

## CircleCI 設定ファイルエディターの使い方
{: #getting-started-with-the-circleci-configuration-editor }

[CircleCI Web UI](https://app.circleci.com/) の**ダッシュボードですべてのパイプライン**を表示し、任意のパイプラインを選択します。

設定ファイルエディターを使用するには、まず、画面上方にある **[All Branches (すべてのブランチ)]** ドロップダウンメニューでブランチを選択します。 ブランチを選択したら、**Edit Config** ボタンが有効化され、設定ファイルエディターが使用できるようになります。

![Configuration Editor Access]({{site.baseurl}}/assets/img/docs/config-editor-all-branches.png)

Web UI 全体で設定ファイルにアクセスする方法は、他にもいくつかあります。 **Set Up Project** ボタンからプロジェクトを設定する場合、**Fast** オプションが表示され、それにより編集可能なデフォルトの設定ファイルが表示されます(リポジトリにまだ設定ファイルがない場合に使用)。

パイプラインの列の **パイプライン**ビューとページ上部の**ワークフロー**では、3 点リーダー (ミートボールメニュー) が表示されます。 このメニューをクリックすると、設定ファイルを開くことができます。

## 自動補完機能
{: #auto-completion }

CircleCI 設定ファイルエディターにより、入力時に推奨事項が自動的に補完され、推奨事項をクリックするとさらに詳細が表示されます。 自動補完されるヒントには、関連するドキュメントへのリンクも表示されます。

![自動補完機能]({{site.baseurl}}/assets/img/docs/config-editor-auto-complete.png)

## Configuration tab options
{: #configuration-menu }

At the bottom of the editor, you will see tabs for **Linter**, **Docs**, and the name of your workflow (in this case **Sample**).

The built in linter will validate your YAML after every change and show you errors if there is a problem. A green or red bar is always visible across the bottom of the page, and will indicate if your YAML is valid (green) or has an error (red). There is also a toggle switch to view the YAML as JSON within the validation bar.

The docs tab will link out to some helpful documentation relating to configuration files.

The workflow tab will show you all the jobs in the workflow, and link out to the individual job's **Job** view in the web UI.

![Suggested Docs]({{site.baseurl}}/assets/img/docs/config-editor-docs.png)

When hovering over a key-value pair in your configuration file, a tooltip will appear, giving you additional information specific to CircleCI configuration syntax.

![ツールチップ]({{site.baseurl}}/assets/img/docs/config-editor-tooltips.png)

## Save and run
{: #save-and-run }

Once your changes are made and your configuration is valid, you may commit to your VCS and re-run the pipeline by clicking the **Save and Run** button. A modal will pop up, and you will see the option to commit on the branch you are working from, or you can choose to create a new branch for the commit.

If you are not making changes on your main branch, you will need to open a pull request on your VCS to save the changes to your main branch when you are ready.

![Save and run]({{site.baseurl}}/assets/img/docs/config-editor-commit-and-run.png)

## 関連項目
{: #see-also }

- [CircleCI Configuration Reference]({{site.baseurl}}/2.0/configuration-reference)
- [CircleCI のローカル CLI の使用]({{site.baseurl}}/2.0/local-cli)
