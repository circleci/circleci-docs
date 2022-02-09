---
layout: classic-docs
title: ジョブとワークフローのスキップとキャンセル
description: This document describes the options available to you for controlling when work is automatically carried out on your project, by skipping jobs or auto-cancelling workflows.
order: 100
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

This document describes how to skip or cancel work when triggering pipelines. There are a couple of ways to do this. The jobs within a pipeline can be skipped on commit, or workflows can be cancelled using the auto-cancel feature. Both methods are described below.

* 目次
{:toc}

## Skipping jobs in a pipeline
{: #skipping-a-build }

By default, CircleCI automatically triggers a pipeline whenever you push changes to your project. You can override this behavior by adding a `[ci skip]` or `[skip ci]` tag within the first 250 characters of the body or title of the commit. これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**CircleCI server v2.x** If you are using CircleCI server v2.x, you can still use the method for skipping workflows described here, even though you are not using the pipelines feature.

### スコープ
{: #scope }
{:.no_toc}

A few points to note regarding the scope of the `ci skip` feature:

* The pipeline and workflows will still exist for these commits but no jobs will be run.
* If you push multiple commits at once, a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.
* This feature is not supported for fork PRs. Scheduled workflows will run even if you push a commit with `[ci skip]` message. 設定ファイルを変更することで、現在のスケジュールをアップグレードすることができます。

### コミットのタイトルの例
{: #example-commit-title }
{:.no_toc}

```shell
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

このコミットはタイトルに `[ci skip]` が含まれているため、VCS にプッシュされても CircleCI でビルドされません。

### コミットの説明の例
{: #example-commit-description }
{:.no_toc}

```shell
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel
Date:   Tue Apr 25 15:56:42 2016 -0800

    A large feature with squashed commits

    [skip ci] Fix bug in feature
    Refactor feature code
    First attempt at feature
```

このコミットは説明に `[ci skip]` または`[skip ci]`が含まれているため、VCS にプッシュされても CircleCI 上でビルドされません。

## Auto cancelling
{: #auto-cancelling}

変更を頻繁にブランチにプッシュすると、ビルドキューイングが発生する可能性が高まります。 This means you might have to wait for an older pipeline to complete before the most recent version starts.

To save time, you can configure CircleCI to automatically cancel any non-terminated workflows when a newer pipeline is triggered on that same branch.

### スコープ
{: #scope }
{:.no_toc}

A few points to note regarding the use of the auto-cancel feature:

* Your project's default branch (usually `main`) will never auto-cancel builds.

### GitHub または API へのプッシュによってトリガーされたパイプラインの自動キャンセルを有効にする手順
{: #steps-to-enable-auto-cancel-for-pipelines-triggered-by-pushes-to-github-or-the-api }
{:.no_toc}

**注意:** 非デフォルトのブランチで自動デプロイ ジョブを設定しているなどの場合、自動キャンセル機能の有効化による影響を慎重に検討する必要があります。

1. CircleCI アプリケーションで、[Project Setting (プロジェクトの設定)] に移動します。

2. **[Advanced Settings (詳細設定)]** をクリックします。

3. **[Auto-cancel redundant builds (冗長ビルドの自動キャンセル)]** で、トグルスイッチを **On** の位置に切り替えて、機能を有効にします。

[Advanced Settings (詳細設定)] で自動キャンセルが有効になっているプロジェクトでは、非デフォルトのブランチで新しいビルドがトリガーされると、同じブランチ上のパイプラインやワークフローがキャンセルされます。ただし、以下の例外があります。
- スケジュールされたワークフローおよび再実行されたワークフローはキャンセルされません。

## CircleCI Server での自動キャンセル
{: #auto-cancel-for-circleci-server-installations }

CircleCI Server では現在パイプライン機能を使用していません。そのためビルドの自動キャンセル機能は 、API によりトリガーされたビルド、またはワークフローを使用**しない**プロジェクトの GitHub へのプッシュによりトリガーされたビルドにのみ有効です。

### CircleCI Server での自動キャンセルを有効にする手順
{: #steps-to-enable-auto-cancel-for-circleci-server-installations }
{:.no_toc}

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Build Settings (ビルドの設定)]** セクションで、**[Advanced Settings (詳細設定)]** をクリックします。

3. **[Auto-cancel redundant builds (冗長ビルドの自動キャンセル)]** セクションで **[On (オン)]** ボタンをクリックします。
