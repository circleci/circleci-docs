---
layout: classic-docs
title: ビルドのスキップとキャンセル
short-title: ビルドのスキップとキャンセル
description: CircleCI の自動ビルドを止める方法
categories:
  - configuring-jobs
order: 100
---

ここでは、以下のセクションに沿って、ビルドをスキップまたはキャンセルする方法について説明します。

- 目次
{:toc}

## ビルドのスキップ

CircleCI のデフォルトでは、ユーザーが変更をバージョン管理システム (VCS) にプッシュするたびに、自動的にプロジェクトがビルドされます。 この動作は、`[ci skip]` または `[skip ci]` タグをコミットのタイトルまたは説明の任意の場所に追加することで、オーバーライドできます。 これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**Note:** This feature is not supported for fork PRs.

### コミットのタイトルの例
{:.no_toc}

```bash
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` in the commit title.

### コミットの説明の例
{:.no_toc}

```bash
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel
Date:   Tue Apr 25 15:56:42 2016 -0800

    A large feature with squashed commits

    Fix bug in feature
    Refactor feature code
    First attempt at feature [ci skip]
```

When pushed to a VCS, this commit will not be built on CircleCI because of the `[ci skip]` in the commit description.

**Note:** If you push multiple commits at once, a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.

## 冗長ビルドの自動キャンセル

If you are frequently pushing changes to a branch, you increase the chances of builds queueing. This means you might have to wait for an older version of a branch to finish building before the most recent version builds.

To save time, you can configure CircleCI to automatically cancel any queued or running builds when a newer build is triggered on that same branch.

**Note:** Your project's default branch will never auto-cancel builds. This feature only applies to non-workflow builds, builds triggered by pushes to GitHub, or workflow builds that use the new pipelines feature.

### GitHub へのプッシュによってトリガーされたワークフロー以外の新しいビルドの自動キャンセルを有効にする手順
{:.no_toc}

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Build Settings (ビルド設定)]** セクションで、**[Advanced Settings (詳細設定)]** をクリックします。

3. In the **Enable Pipelines** section, click the **On** button.

### GitHub または API へのプッシュによってトリガーされたワークフローの自動キャンセルを有効にする手順
{:.no_toc}

Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch.

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches. Auto-cancelling workflows requires enabling the preview feature.

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **[Build Settings (ビルド設定)]** セクションで、**[Advanced Settings (詳細設定)]** をクリックします。

3. In the **Enable Pipelines** section, click the **On** button.

4. 変更をコミットしてビルドをトリガーし、新しいパイプラインを使用して正常に実行されることを確認します。

5. **[Auto-cancel redundant builds (冗長ビルドを自動キャンセルする)]** セクションで **[On (オン)]** ボタンをクリックします。

Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:

- スケジュールされたワークフローおよび再実行されたワークフローはキャンセルされません。