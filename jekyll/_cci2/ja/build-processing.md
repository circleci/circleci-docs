---
layout: classic-docs
title: "Working with Pipelines"
short-title: "パイプラインの有効化"
description: "How to work effectively with CircleCI pipelines"
categories:
  - settings
order: 1
version:
  - Cloud
---

CircleCI API または自動キャンセルのワークフローからワークフローをトリガーする必要がある場合に、パイプライン エンジンを有効化する方法を説明します。 パイプラインは、現在オンプレミス版の CircleCI Server ではサポートされていません。

* TOC
{:toc}

## What are pipelines?
{: #what-are-pipelines }

CircleCI Pipelines encompass the full set of workflows you run when triggering work on your projects in CircleCI. Workflows coordinate the jobs defined within your project configuration.

## Benefits of using pipelines
{: #benefits-of-using-pipelines }

Pipelines offer the following benefits:

{% include snippets/pipelines-benefits.adoc %}

## Implications of pipelines
{: #implications-of-pipelines }

When using pipelines, please note the following:

- If no builds or workflows are defined, you will receive an error.

## Transitioning to pipelines
{: #transitioning-to-pipelines }

The following sections outline the process of transitioning to pipelines.

### Pipelines with 2.0 configuration
{: #pipelines-with-20-configuration }
{:.no_toc}

When using 2.0 configuration in combination with pipelines, CircleCI will inject the `CIRCLE_COMPARE_URL` environment variable into all jobs for backwards compatibility. This environment variable is generated in a different way to the version that is available in legacy jobs, and is not always available – it is not injected when there is no meaningful previous revision, for example, on the first push of commits to an empty repository, or when a new branch is created/pushed without any additional commits.

## Giving feedback
{: #giving-feedback }
{:.no_toc}

If you have feedback, suggestions, or comments:

- CircleCI の Twitter アカウント (@CircleCIJapan) 宛てにツイートする
- [アイデア ボード](https://ideas.circleci.com/)で既存の投稿に投票する、または投稿を追加する

## See also
{: #see-also }
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
