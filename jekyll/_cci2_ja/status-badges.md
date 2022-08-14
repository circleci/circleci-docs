---
layout: classic-docs
title: ステータスバッジの追加
description: CircleCI のステータスバッジを Web ページや Web ドキュメントに埋め込む方法
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Services VM
---

プロジェクトのビルドステータス (成功または失敗) を表示するバッジを README または他のドキュメントに作成する方法について説明します。

## 概要
{: #overview }

ステータスバッジは、一般的にプロジェクトの README に埋め込まれていますが、どの Web ドキュメントにも配置することができます。 CircleCI では、ステータスバッジの埋め込みコードを生成するツールを提供しています。 デフォルトで、バッジにはプロジェクトのデフォルトブランチのステータスが表示されますが、特定のブランチを選択することも可能です。

バッジのステータスにより、リポジトリにおけるビルドステータスを素早く確認することができます。 バッジはステータス（成功または失敗）に応じて表示されます。

以下の形式のコードを生成できます。
- 画像 URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## ステータスバッジの生成
{: #generating-a-status-badge }

独自のバッジを生成するには、下記のコードスニペットの変数について理解し、置き換える必要があります。

- `<PROJECT_NAME>`: プロジェクト名（ 例: `circleci-docs`）
- `<ORG_NAME>` : そのプロジェクトの組織名またはユーザー名
- `<VCS>`: VCS プロバイダー ("github" は `gh`、Bitbucket は `bb` )
- `<LINK>`: ステータスバッジをクリックしたら移動するリンク（パイプラインの概要のページなど）
- オプション: API トークン（プライベートプロジェクト用のバッジの作成）

下記は、様々なテンプレート言語でステータスバッジを生成する例です。 各例では特定のブランチ用のステータスバッジコードも示しています。

{:.tab.status.Markdown}
```text
# テンプレート:
[![<ORG_NAME>](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg)](<LINK>)

# 例:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs)

# 特定のブランチ用の例:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5)
```

{:.tab.status.Textile}
```text
# テンプレート:
!https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg!:<LINK>

# 例:
!https://circleci.com/gh/circleci/circleci-docs.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs

# 特定のブランチ用の例:
!https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.Rdoc}
```text
# テンプレート:
{<img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg" alt="<ORG_NAME>" />}[https://circleci.com/gh/<ORG_NAME>/<PROJECT_NAME>]

# 例:
{<img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs]

# 特定のブランチ用の例:
{<img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5]
```

{:.tab.status.Asciidoc}
```text
# テンプレート:
image:https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg["<ORG_NAME>", link="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"]

# 例:
image:https://circleci.com/gh/circleci/circleci-docs.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs"]

# 特定のブランチの例:
image:https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"]
```

{:.tab.status.reStructuredText}
```text
# テンプレート:
.. image:: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg
    :target: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>

# 例:
.. image:: https://circleci.com/gh/circleci/circleci-docs.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs

# 特定のブランチの例:
.. image:: https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.pod}
```text
# テンプレート:
=for HTML <a href="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"><img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg"></a>

# 例:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs"><img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg"></a>

# 特定のブランチの例:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"><img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg"></a>

```

## プライベートリポジトリ用のバッジの作成
{: #creating-badges-for-private-repositories }

**注: プライベートリポジトリ用のステータスバッジを作成するには、_ "status" のスコープを持つ </strong>**API トークン**_を作成する必要があります。 上記の Markdown 形式の例と比較して、下記の Markdown 形式のイメージバッジスニペットを考えてみましょう。この例では、トークンの URL パラメータが追加されています。</p>

```markdown
[![CircleCI](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg&circle-token=<YOUR_STATUS_API_TOKEN>)](<LINK>)
```

ステータス API トークンを作成するには、[CircleCI Web アプリ](https://app.circleci.com/)を開き、目的のプロジェクトに行き、**Project Settings > API Permissions** に移動し、`status`のスコープを持つトークンを作成します。

## その他のスタイル
{: #different-styles }

デフォルトのステータスバッジでは物足りないという場合は、[Shields スタイル](https://shields.io/)を使用できます。 Shield スタイルを使用するには、前述の手順で生成したリンクの `style=svg` を `style=shield` に置き換えます。

![svg</code>@@ version" />]({{site.baseurl}}/assets/img/docs/svg-passed.png)

![svg</code>@@ version" />]({{site.baseurl}}/assets/img/docs/svg-failed.png)

![シールドバージョンのパス]({{site.baseurl}}/assets/img/docs/shield-passing.png)

![シールドバージョンの失敗]({{site.baseurl}}/assets/img/docs/shield-failing.png)

## 設定ファイルの詳細
{: #see-also }

* [ステータス]({{site.baseurl}}/ja/status/)
