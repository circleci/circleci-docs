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

以下のセクションでは、ビルドをスキップまたはキャンセルする方法について説明します。

* 目次
{:toc}

## ビルドのスキップ
{: #skipping-a-build }

CircleCI のデフォルトでは、変更をバージョン管理システム (VCS) にプッシュするたびに、自動的にプロジェクトがビルドされます。 この動作を無効にするには、コミットの本文またはタイトルの最初の250文字以内に、 `[ci skip]` または `[skip ci]` タグを追加します。 これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**注意:** この機能は、フォークされた PR ではサポートされていません。 `[ci skip]` のメッセージを含むコミットをプッシュしても、スケジュールされたワークフローはキャンセルされません。 設定ファイルを変更することで、現在のスケジュールをアップグレードすることができます。

### コミットのタイトルの例
{: #example-commit-title }
{:.no_toc}

```bash
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

このコミットは説明に `[ci skip]` または`[skip ci]`が含まれているため、VCS にプッシュされても CircleCI でビルドされません。

**注意:** 一度に複数のコミットをプッシュする場合、1つの `[ci skip]` または `[skip ci]` で**すべてのコミット**のビルドがスキップされます。

## 冗長ビルドの自動キャンセル
{: #auto-cancelling-a-redundant-build }

変更を頻繁にブランチにプッシュすると、ビルドキューイングが発生する可能性が高まります。 これにより、古いパイプラインのビルドが終わるまで、最新バージョンでビルドを実行できない場合があります。

時間を節約するために、新しいビルドがトリガーされたときに、その同じブランチ上のキューイングされたビルドまたは実行中のビルドを自動的にキャンセルするように設定することができます。

**注意:** プロジェクトのデフォルトのブランチ (通常、`master`) では、ビルドの自動キャンセルは行われません。

### GitHub または API へのプッシュによってトリガーされたパイプラインの自動キャンセルを有効にする手順
{: #steps-to-enable-auto-cancel-for-pipelines-triggered-by-pushes-to-github-or-the-api }
{:.no_toc}

**注意:** 非デフォルトのブランチで自動デプロイ ジョブを設定している場合などには、自動キャンセル機能を有効化することの影響を慎重に検討する必要があります。

1. CircleCI アプリケーションで、[Project Setting (プロジェクトの設定)] に移動します。

2. **[Advanced Settings (高度な設定)]** をクリックします。

3. **[Auto-cancel redundant builds (冗長ビルドの自動キャンセル)]** で、トグルスイッチを **On** の位置に切り替えて、機能を有効にします。

Projects for which auto-cancel is enabled in the Advanced Settings will have pipelines and workflows on non-default branches cancelled when a newer build is triggered on that same branch, with the following exceptions:
- スケジュールされたワークフローおよび再実行されたワークフローはキャンセルされません。

## CircleCI Server インストール時の自動キャンセル
{: #auto-cancel-for-circleci-server-installations }

CircleCI Server では現在パイプライン機能を使用していません。そのためビルドの自動キャンセル機能は 、API によりトリガーされたビルド、またはワークフローを使用**しない**プロジェクトの GitHub へのプッシュによりトリガーされたビルドにのみ有効です。

### Steps to enable auto-cancel for CircleCI server installations
{: #steps-to-enable-auto-cancel-for-circleci-server-installations }
{:.no_toc}

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. In the **Build Settings** section, click on **Advanced Settings**.

3. In the **Auto-cancel redundant builds** section, click the **On** button.
