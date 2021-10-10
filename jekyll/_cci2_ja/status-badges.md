---
layout: classic-docs
title: ステータス バッジの追加
description: CircleCI のステータス バッジを Web ページや Web ドキュメントに埋め込む方法
version:
  - Cloud
  - Server v2.x
---

プロジェクトのビルド ステータス (成功または失敗) を表示するバッジを README または他のドキュメントに作成する方法について説明します。

## 概要
{: #overview }

Status badges are commonly embedded in project READMEs, although they can be placed in any web document. CircleCI provides a tool to generate embed code for status badges. By default, a badge displays the status of a project's default branch, though you can also display the status of specific branches.

You can generate code for the following formats:

- 画像 URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## Generating a status badge
{: #generating-a-status-badge }

To generate your own status badge, you will need to know and substitute the following variables in the code snippets below:

- `<PROJECT_NAME>` - Your project's name. Example: `circleci-docs`.
- `<ORG_NAME>` - The organization or user name the project in question belongs to.
- `<VCS>` - your VCS provider (`gh` for "github" and `bb` for BitBucket).
- `<LINK>` - The link you want the status badge to go to when clicked (example: the pipeline overview page).
- optional: an API token (to create badges for private projects).

The following examples demonstrate how to generate a status badge for various template languages. Each sample also provides an example of status badge code for a specific branch.


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


**NOTE:** To create a status badge for a private project you will need to create an **api token** _specifically scoped to "status"_ and include that token in the url string of your badge. Consider the following markdown image badge snippet against the original markdown example above; it has a url parameter for a token added.

```markdown
[![CircleCI](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg&circle-token=<YOUR_STATUS_API_TOKEN>)](<LINK>)
```

To create a status api token, go to your **Project's Settings** (present on the top right corner) > **API Permissions** and create a token scoped to `Status`.


## Different styles
{: #different-styles }

If you find the default status badge too minimal, you can use the [shield style](https://shields.io/). To use the shield style, replace `style=svg` with `style=shield` in the link you generated above.

![svg</code>@@ version" />]({{ site.baseurl }}/assets/img/docs/svg-passed.png)

![svg</code>@@ version" />]({{ site.baseurl }}/assets/img/docs/svg-failed.png)

![Passing shield version]({{ site.baseurl }}/assets/img/docs/shield-passing.png)

![Failing shield version]({{ site.baseurl }}/assets/img/docs/shield-failing.png)


## See also
{: #see-also }

[Status]({{ site.baseurl }}/ja/2.0/status/)
