---
layout: classic-docs
title: ビルドのスキップとキャンセル
short-title: ビルドのスキップとキャンセル
description: CircleCI の自動ビルドを止める方法
order: 100
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、ビルドをスキップまたはキャンセルする方法について説明します。

- 目次
{:toc}

## Skipping a build

CircleCI のデフォルトでは、ユーザーが変更をバージョン管理システム (VCS) にプッシュするたびに、自動的にプロジェクトがビルドされます。 You can override this behavior by adding a `[ci skip]` or `[skip ci]` tag in the first line of the body of the commit or the commit's title. これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**Note:** This feature is not supported for fork PRs. Scheduled workflows will not be cancelled even if you push a commit with `[ci skip]` message. Changing the config file is the way to upgrade the current schedule.

### Example commit title
{:.no_toc}

```bash
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

このコミットはタイトルに `[ci skip]` が含まれているため、VCS にプッシュされても CircleCI でビルドされません。

### Example commit description
{:.no_toc}

```bash
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

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` or `[skip ci]` in the commit description.

**メモ:** 一度に複数のコミットをプッシュした場合、1 つの `[ci skip]` または `[skip ci]` で**すべてのコミット**のビルドがスキップされます。

## Auto cancelling a redundant build

If you are frequently pushing changes to a branch, you increase the chances of queueing. This means you might have to wait for an older pipeline to finish building before the most recent version starts.

To save time, you can configure CircleCI to automatically cancel any queued or running pipelines when a newer pipeline is triggered on that same branch.

**Note:** Your project's default branch (usually `master`) will never auto-cancel builds.

### Steps to enable auto-cancel for pipelines triggered by pushes to GitHub or the API
{:.no_toc}

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches.

1. In the CircleCI application, go to your Project Settings.

2. Click on **Advanced Settings**.

3. In the **Auto-cancel redundant builds** section, enable the feature by switching the toggle switch to the **On** position.

Projects for which auto-cancel is enabled in the Advanced Settings will have pipelines and workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:

- スケジュールされたワークフローおよび再実行されたワークフローはキャンセルされません。

## Auto cancel for CircleCI server installations

CircleCI Server does not currently use the pipelines feature, and as a result the Auto Cancel Builds feature only works for builds triggered with the API or by pushes to GitHub for projects that **do not** use workflows.

### Steps to enable auto-cancel for CircleCI server installations
{:.no_toc}

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Build Settings (ビルド設定)]** セクションで、**[Advanced Settings (詳細設定)]** をクリックします。

3. In the **Auto-cancel redundant builds** section, click the **On** button.