---
layout: classic-docs
title: ジョブとワークフローのスキップとキャンセル
description: このドキュメントでは、ジョブをスキップしたり、ワークフローを自動キャンセルすることにより、プロジェクトで処理が自動的に実行されるタイミングを制御するためのオプションについて説明します。
order: 100
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、パイプラインをトリガーする際に処理をスキップまたはキャンセルする方法を説明します。 これには複数の方法があります。 パイプラインのジョブは、コミット時にスキップしたり、ワークフロー自動キャンセル機能を使ってワークフローをキャンセルすることができます。 それぞれの方法を下記でご紹介します。

* 目次
{:toc}

## パイプラインのジョブのスキップ
{: #skipping-a-build }

デフォルトでは、プロジェクトに変更をプッシュすると CircleCI は常に自動的にパイプラインをトリガーします。 この動作を無効にするには、コミットの本文またはタイトルの最初の250文字の中に、 `[ci skip]` タグまたは `[skip ci]` タグを追加します。 これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**CircleCI Server v2.x** CircleCI Server v2.x をご使用であれば、パイプラインの機能を使っていなくても、下記で説明するワークフローをスキップする方法を使用できます。

### スコープ
{: #scope }
{:.no_toc}

`ci skip` 機能の範囲については以下の点にご注意ください。

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
