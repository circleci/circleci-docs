---
layout: classic-docs
title: "Jira と CircleCI の接続"
categories:
  - how-to
description: "Jira と CircleCI の接続"
---

ここでは、Jira を CircleCI ビルドに接続する方法について説明します。 CircleCI Jira プラグインを使用すると、ジョブ ページから直接 Jira チケットを作成して、ジョブのステータスを基にタスクや修正を割り当てたり、ビルドのステータスを Jira に表示したりといったことが可能です。

**メモ:** CircleCI Jira プラグインは Jira 管理者のみがインストールできます。

# インストール手順

1. プロジェクトのジョブ ページで、右上にある歯車のアイコンをクリックして、プロジェクト設定を開きます。 [`Permissions (権限)`] の下の [`Jira integration (Jira インテグレーション)`] をクリックします。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Atlassian Marketplace にアクセスし、[CircleCI Jira プラグイン](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)を入手します。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. プラグインをインストールし、プロンプトに従ってセットアップします。![]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png) ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. CircleCI の [Jira Integration (Jira インテグレーション)] 設定ページに戻り、生成されたトークンを追加します。

* * *

# ジョブ ページで Jira チケットを作成する

インテグレーションを追加し、ジョブの詳細ページに移動すると、Jira アイコンが有効化されています。

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_5.png)

Jira アイコンをクリックし、以下を指定します。

- プロジェクト名
- 課題のタイプ
- 課題の概要
- 説明

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_6.png)

メモ: 現在、Jira プラグインはデフォルトのフィールドのみをサポートしています。

以上の手順で、ジョブ出力ページからすばやくチケットを作成できます。

# Jira でビルドとデプロイのステータスを表示する

CircleCI Orb を使用すると、Jira でビルドとデプロイのステータスを確認できるようになります。 そのプロセスは以下のとおりです。

1. 前述の手順に従って Jira と CircleCI を接続します。
2. `.circleci/config.yml` ファイルの上部で、バージョン `2.1` が使用されていることを確認します。
3. パイプラインを有効化していない場合は、**[Project Settings (プロジェクト設定)] -> [Build Settings (ビルド設定)] -> [Advanced Settings (詳細設定)]** の順に選択して有効化します。
4. ビルド情報を取得する API トークンを入手するために、**[Project Settings (プロジェクト設定)] -> [Permissions (権限)] -> [API Permissions (API 権限)]** の順に移動します。**[Scope: all (範囲: すべて)]** を選択してトークンを作成したら、 そのトークンをコピーします。
5. インテグレーションを許可してキーを使用するには、**[Project Settings (プロジェクト設定)] -> [Build Settings (ビルド設定)] -> [Environment Variables (環境変数)]** の順に選択して、*CIRCLE_TOKEN* という変数と作成したトークンの値を追加します。
6. Orb スタンザを追加し、Jira Orb を呼び出します。
7. ステップで Jira Orb を使用します。

Jira Orb を使用したシンプルな `config.yml` の例を以下に示します。

```yaml
jobs:
  build:
    docker:
      - image: 'circleci/node:10'
    steps:
      - run: echo "hello"
orbs:
  jira: circleci/jira@1.0.5
version: 2.1
workflows:
  build:
    jobs:
      - build:
          post-steps:
            - jira/notify
```