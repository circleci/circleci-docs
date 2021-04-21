---
layout: classic-docs
title: "CircleCI アプリ内の設定ファイル エディターの使用"
description: "アプリ内設定ファイル エディターの使用方法と機能に関する開発者向けページ"
version:
  - Cloud
  - Server v2.x
---

[CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) やテキスト エディターを使わずに CircleCI 設定ファイルを変更できるよう、UI 要素として CircleCI 設定ファイル エディターが用意されています。 CircleCI 設定ファイル エディターは、CI/CD プロセスの変更方法の統一性を高め、開発しやすい環境を提供します。

![設定ファイル エディター]({{ site.baseurl }}/assets/img/docs/config-editor-main.png)

CircleCI 設定ファイル エディターには次のメリットがあります。

- 自動バリデーションおよびエラー チェック機能
- 自動補完機能、およびCircleCI 設定ファイルの構文に関するヒント
- CircleCI のコンセプトに関する説明
- ユーザーにニーズに合う CircleCI ドキュメントへのリンク

## CircleCI 設定ファイル エディターを使うには
{: #getting-started-with-the-circleci-config-editor }

In the CircleCI app, select a pipeline in the **All Pipelines** view.

To access the CircleCI Configuration Editor, select your desired branch from the *All Branches* drop-down menu near the top of the screen.

![Config Editor Access]({{ site.baseurl }}/assets/img/docs/config-editor-all-branches.png)

Once you select a branch, the **Edit Config** button will become enabled. Click it to access the configuration editor.

You can also access the config editor:

- **[Projects (プロジェクト)]** ビューの **[Set Up Project (プロジェクトのセットアップ)]** を選択する
- **[Pipelines (パイプライン)]** ビューの **[Actions (操作)]** 列にある 3 つの点を選択し、表示されたメニューで *[Configuration File (設定ファイル)]* を選択する
- **[Pipelines (パイプライン)]** ビューでジョブを選択し、右上隅にある 3 つの点を選択してから、**[Configuration File (設定ファイル)]** を選択する

## 自動補完機能
{: #auto-completion }

Like many traditional IDEs, the CircleCI configuration editor will provide auto-complete suggestions as you type, as well as any supporting documentation.

![Auto-completion]({{ site.baseurl }}/assets/img/docs/config-editor-auto-complete.png)

## スマート ツールチップ
{: #smart-tooltips }

When hovering over a CircleCI definition in your configuration file, a tooltip will appear, giving you additional information specific to CircleCI configuration syntax.

![Tooltips]({{ site.baseurl }}/assets/img/docs/config-editor-tooltips.png)

## 自動バリデーション機能
{: #automatic-validation }

The config editor will automatically validate your configuration yaml after every change.

For a valid configuration, you will see the following at the bottom of the configuration editor:

![Passing Configuration]({{ site.baseurl }}/assets/img/docs/config-editor-validate-pass.png)

For a failing validation, a red bar is displayed, as well as any errors, where they occur, and any relevant documentation that may assist in fixing the error (see the "DOCS" tab in the below screenshot).

![Failing Configuration]({{ site.baseurl }}/assets/img/docs/config-editor-validate-fail.png)

## コミットおよび実行
{: #commit-and-run }

Once your configuration is valid, you may commit to your VCS and re-run the pipeline, all from within the Config Editor, by selecting the **Commit and Run** button in the upper-right corner.

![Commit and Run]({{ site.baseurl }}/assets/img/docs/config-editor-commit-and-run.png)

## 関連項目
{: #see-also }

- [CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)
- [CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli)
