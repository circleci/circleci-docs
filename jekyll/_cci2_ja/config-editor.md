---
layout: classic-docs
title: "CircleCI アプリ内の設定ファイルエディターの使用"
description: "アプリ内設定ファイルエディターの使用方法と機能"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

CircleCI 設定ファイルエディターを使うと、[CircleCI CLI]({{site.baseurl}}/ja/local-cli/) やテキストエディターを使わずに CircleCI 設定ファイルを変更することができます。 また、CI/CD プロセスを統一された方法で迅速に変更できます。

![設定ファイルエディター]({{site.baseurl}}/assets/img/docs/config-editor-main.png)

CircleCI 設定ファイルエディターには、以下のメリットがあります。

- 自動バリデーションおよびエラーチェック機能
- 自動補完機能
- CircleCI の設定ファイル構文固有の設定のヒント
- CircleCI のコンセプトに関する説明
- CircleCI ドキュメントへのアクセス

## CircleCI 設定ファイルエディターの使い方
{: #getting-started-with-the-circleci-configuration-editor }

[CircleCI Web UI](https://app.circleci.com/) のダッシュボードで **All Pipelines** ビューから、任意のパイプラインを選択します。

設定ファイルエディターにアクセスするには、まず、画面上方にある **All Branches** ドロップダウンメニューで編集するブランチを選択します。 ブランチを選択すると、**Edit Config** ボタンが有効化され、設定ファイルエディターを利用できるようになります。

![設定ファイルエディターへのアクセス方法]({{site.baseurl}}/assets/img/docs/config-editor-all-branches.png)

Web UI 経由で設定ファイルを利用する方法は、他にもいくつかあります。 **Set Up Project** ボタンから任意のプロジェクトを設定する場合、**Fast** オプションが表示され、それにより編集可能なデフォルトの設定ファイルが表示されます(リポジトリにまだ設定ファイルがない場合に使用)。

パイプラインの列の**パイプライン**ビューとページ上部の**ワークフロー**では、3 点リーダー (ミートボールメニュー) が表示されます。 このメニューをクリックすると、設定ファイルを開くことができます。

## 自動補完機能
{: #auto-completion }

CircleCI 設定ファイルエディターでは、入力時に自動補完機能が動作し、サジェスチョンをクリックするとさらに詳細が表示されます。 自動補完されるヒントには、関連するドキュメントへのリンクも表示されます。

![自動補完機能]({{site.baseurl}}/assets/img/docs/config-editor-auto-complete.png)

## 設定ファイルタブのオプション
{: #configuration-menu }

エディターの下部に、**リンター (構文チェック)**、 **ドキュメント**、ワークフロー名 (今回は **Sample**) のタブが表示されます。

この組み込みのリンターは、変更のたびに YAML を確認し、問題がある場合はエラーを表示します。 ページ下部に緑色または赤色のバーが常に表示され、YAML が有効 (緑) なのかエラー (赤) なのかが分かります。 このバリデーションバーには、YAML を JSON として表示する切り替えスイッチがあります。

ドキュメントタブには、設定ファイルに関連する役立つドキュメントのリンクが表示されます。

ワークフロータブには、そのワークフローの全てのジョブが表示され、Web UI の各ジョブの**ジョブ**ビューのリンクが表示されます。

![推奨ドキュメント]({{site.baseurl}}/assets/img/docs/config-editor-docs.png)

設定ファイルのキーと値のペアにカーソルを合わせると、CircleCI 設定ファイルの構文に関する追加情報を示すヒントが表示されます。

![ヒント]({{site.baseurl}}/assets/img/docs/config-editor-tooltips.png)

## 保存と実行
{: #save-and-run }

変更が完了し、設定ファイルが有効な場合、**Save and Run** ボタンをクリックすると、VCS にコミットし、パイプラインを再実行することができます。 モーダルがポップアップされ、作業中のブランチにコミットするオプションが表示されます。コミット用の新しいブランチを作成することもできます。

メインブランチを変更していない場合は、VCS でプルリクエストを作成し、準備が出来次第メインブランチに変更を保存します。

![保存と実行]({{site.baseurl}}/assets/img/docs/config-editor-commit-and-run.png)

## 関連項目
{: #see-also }

- [CircleCI 設定のリファレンス]({{site.baseurl}}/ja/configuration-reference)
- [CircleCI のローカル CLI の使用]({{site.baseurl}}/ja/local-cli)
