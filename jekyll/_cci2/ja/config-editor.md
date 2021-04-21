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

CircleCI アプリの **[All Pipelines (すべてのパイプライン)]** ビューでパイプラインを選択選択します。

設定ファイル エディターにアクセスするには、まず、画面上方にある *[All Branches (すべてのブランチ)]* ドロップダウン メニューで設定ファイルを編集するブランチを選択します。

![設定ファイル エディターへのアクセス方法]({{ site.baseurl }}/assets/img/docs/config-editor-all-branches.png)

ブランチを選択すると、**[Edit Config (設定ファイルを編集)]** ボタンが使用可能になります。 このボタンをクリックすると、設定ファイル エディターにアクセスできます。

また、以下の方法で設定ファイルにアクセスすることも可能です。

- **[Projects (プロジェクト)]** ビューの **[Set Up Project (プロジェクトのセットアップ)]** を選択する
- **[Pipelines (パイプライン)]** ビューの **[Actions (操作)]** 列にある 3 つの点を選択し、表示されたメニューで *[Configuration File (設定ファイル)]* を選択する
- **[Pipelines (パイプライン)]** ビューでジョブを選択し、右上隅にある 3 つの点を選択してから、**[Configuration File (設定ファイル)]** を選択する

## 自動補完機能

一般的な多くの IDE と同じく、CircleCI 設定ファイル エディターでは、入力を自動で補完する機能が搭載されています。また、参考となるドキュメントも示されます。

![自動補完機能]({{ site.baseurl }}/assets/img/docs/config-editor-auto-complete.png)

## スマート ツールチップ

設定ファイル内の CircleCI 定義済み項目にカーソルを合わせると、CircleCI 設定ファイルの構文の関連情報を示すツールチップが表示されます。

![ツールチップ]({{ site.baseurl }}/assets/img/docs/config-editor-tooltips.png)

## 自動バリデーション機能

設定ファイル エディターでは、YAML 設定ファイルに変更を加えるたびに自動でバリデーションが行われます。

設定ファイルが有効な場合は、設定ファイル エディターの最下部に次のメッセージが表示されます。

![設定ファイルが有効な場合]({{ site.baseurl }}/assets/img/docs/config-editor-validate-pass.png)

設定ファイルに問題がある場合は赤色のバーが表示されるとともに、構文エラーがあればその場所が示されます。また、エラーの修正に役立つ参考ドキュメントがある場合は、下記スクリーンショットの中の [DOCS (ドキュメント)] タブにそれらのドキュメントが示されます。

![設定ファイルが無効な場合]({{ site.baseurl }}/assets/img/docs/config-editor-validate-fail.png)

## コミットおよび実行

設定ファイルにエラーがなければ、設定ファイル エディター内で VCS へのコミットからパイプラインの再実行までを行うことができます。このためには、右上隅にある **[Commit and Run (コミットして実行)]** ボタンを選択します。

![コミットおよび実行]({{ site.baseurl }}/assets/img/docs/config-editor-commit-and-run.png)

## 関連項目

- [CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)
- [CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli)
