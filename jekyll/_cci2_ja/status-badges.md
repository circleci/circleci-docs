---
layout: classic-docs
title: ステータスバッジの追加
description: CircleCI のステータスバッジを Web ページや Web ドキュメントに埋め込む方法
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

プロジェクトのビルドステータス (成功または失敗) を表示するバッジを README または他のドキュメントに作成する方法について説明します。

## 概要
{: #overview }

ステータスバッジは、一般にプロジェクトの README に埋め込まれていますが、どの Web ドキュメントにも配置できます。 CircleCI では、ステータスバッジの埋め込みコードを生成するツールが提供されています。 デフォルトで、バッジにはプロジェクトのデフォルトブランチのステータスが表示されますが、特定のブランチを選択することも可能です。

バッジのステータスにより、リポジトリでビルドのステータスを素早く確認することができます。 バッジはステータス（成功または失敗）によって、外観が変わります。

以下の形式のコードを生成できます。
- イメージの URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## ステータスバッジの生成
{: #generating-a-status-badge }

独自のバッジを生成するには、下記のコードスニペットの変数について理解し、置き換えられる必要があります。

- `<PROJECT_NAME>`: プロジェクト名 例: `circleci-docs`
- `<ORG_NAME>` : そのプロジェクトの組織名またはユーザー名
- `<VCS>`: VCS プロバイダー ("github" は `gh`、BitBucket は `bb` )
- `<LINK>` - The link you want the status badge to go to when clicked (example: the pipeline overview page)
- Optional: an API token (to create badges for private projects)

The following examples demonstrate how to generate a status badge for various template languages. Each example also provides a status badge code for a specific branch.

{:.tab.status.Markdown}
```text
# Template:
[![<ORG_NAME>](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg)](<LINK>)

# Example:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs)

# Example for specific branch:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5)
```

{:.tab.status.Textile}
```text
# Template:
!https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg!:<LINK>

# Example:
!https://circleci.com/gh/circleci/circleci-docs.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs

# Example for specific branch:
!https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.Rdoc}
```text
# Template:
{<img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg" alt="<ORG_NAME>" />}[https://circleci.com/gh/<ORG_NAME>/<PROJECT_NAME>]

# Example:
{<img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs]

# Example for specific branch:
{<img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5]
```

{:.tab.status.Asciidoc}
```text
# Template:
image:https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg["<ORG_NAME>", link="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"]

# Example:
image:https://circleci.com/gh/circleci/circleci-docs.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs"]

# Example for specific branch:
image:https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"]
```

{:.tab.status.reStructuredText}
```text
# Template:
.. image:: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg
    :target: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>

# Example:
.. image:: https://circleci.com/gh/circleci/circleci-docs.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs

# Example for specific branch:
.. image:: https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.pod}
```text
# Template:
=for HTML <a href="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"><img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg"></a>

# Example:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs"><img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg"></a>

# Example for specific branch:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"><img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg"></a>

```

## Creating badges for private repositories
{: #creating-badges-for-private-repositories }

**NOTE:** To create a status badge for a private project you will need to create an **api token** _specifically scoped to "status"_ and include that token in the url string of your badge. Consider the following markdown image badge snippet against the original markdown example above; it has a URL parameter for a token added.

```markdown
[![CircleCI](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg&circle-token=<YOUR_STATUS_API_TOKEN>)](<LINK>)
```

To create a status API token, go to the [CircleCI web app](https://app.circleci.com/), navigate to a specific project, go to **Project Settings -> API Permissions**, and create a token scoped to `status`.

## Different styles
{: #different-styles }

デフォルトのステータス バッジでは物足りないという場合は、[Shields スタイル](https://shields.io/)を使用できます。 Shield スタイルを使用するには、前述の手順で生成したリンクの `style=svg` を `style=shield` に置き換えます。

![svg</code>@@ version" />]({{site.baseurl}}/assets/img/docs/svg-passed.png)

![svg</code>@@ version" />]({{site.baseurl}}/assets/img/docs/svg-failed.png)

![Passing shield version]({{site.baseurl}}/assets/img/docs/shield-passing.png)

![Failing shield version]({{site.baseurl}}/assets/img/docs/shield-failing.png)

## 設定ファイルの詳細
{: #see-also }

* [ステータス]({{site.baseurl}}/2.0/status/)