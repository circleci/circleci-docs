---
layout: classic-docs
title: ジョブとワークフローのスキップとキャンセル
description: このドキュメントでは、ジョブのスキップや、ワークフローの自動キャンセルにより、プロジェクトで処理が自動的に実行されるタイミングを制御する方法について説明します。
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

このドキュメントでは、パイプラインをトリガーする際に処理をスキップまたはキャンセルする方法を説明します。 これには複数の方法があります。 パイプラインのジョブをコミット時にスキップする、またはワークフロー自動キャンセル機能を使ってワークフローをキャンセルすることが可能です。 それぞれの方法を下記でご紹介します。

## ジョブをスキップする
{: #skip-jobs }

CircleCI はデフォルトでは、プロジェクトに変更をプッシュするたびに自動的にパイプラインをトリガーします。 この動作を無効にするには、コミットの本文またはタイトルの最初の 250 文字の中に、 `[ci skip]` タグまたは `[skip ci]` タグを追加します。 これにより、マークされたコミットだけでなく、そのプッシュに含まれる**他のすべてのコミット**もスキップされます。

**CircleCI Server v2.x** をお使いの場合は、このパイプラインの機能を使わなくても、下記の方法でワークフローをスキップできます。
{: class="alert alert-info"}

### スコープ
{: #scope }

`ci skip` 機能のスコープに関して以下の点にご注意ください。

* これらのコミットにパイプラインとワークフローは存在しますが、ジョブは実行されません。
* 一度に複数のコミットをプッシュする場合、1 つの `[ci skip]` または `[skip ci]` で**すべてのコミット**のビルドがスキップされます。
* この機能はフォーク PR ではサポートされていません。 `[ci skip]` のメッセージを含むコミットをプッシュしても、スケジュールされたワークフローは実行されます。 設定ファイルを変更することで、現在のスケジュールをアップグレードすることができます。

### コミットのタイトルの例
{: #example-commit-title }

```shell
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

このコミットはタイトルに `[ci skip]` が含まれているため、VCS にプッシュされても CircleCI 上でビルドされません。

### コミットの説明の例
{: #example-commit-description }

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

このコミットは説明に `[ci skip]` または `[skip ci]` が含まれているため、VCS にプッシュされても CircleCI 上でビルドされません。

## 冗長ワークフローの自動キャンセル
{: #auto-cancel}

ブランチに変更を頻繁にプッシュすると、キューに入る可能性が高まります。 これにより、古いパイプラインのビルドが終わるまで、最新バージョンでのビルドを実行できない場合があります。

時間を節約するために、同じブランチで新しいパイプラインがトリガーされた場合は完了していないワークフローを自動的にキャンセルするように CircleCI を設定することができます。

### スコープ
{: #scope }

自動キャンセル機能を使用する際は以下の点にご注意ください。

* プロジェクトのデフォルトのブランチ (通常は `main`) では、ビルドの自動キャンセルは行われません。
* 自動キャンセルは、VCS へのプッシュや API 経由のプッシュによりトリガーされたパイプラインに影響を与えます。

### 自動キャンセルの有効化
{: #enable-auto-cancel }

非デフォルトのブランチで自動デプロイジョブを設定している場合など、自動キャンセル機能の有効化による影響を慎重に検討する必要があります。
{: class="alert alert-warning"}

1. CircleCI Web アプリで **Project Settings** に移動します。　

2. **Advanced Settings** をクリックします。

3. スイッチを切り替えて、**Auto-cancel redundant workflows (冗長ワークフローの自動キャンセル)**オプションを有効にします。

自動キャンセルが有効になっているプロジェクトでは、非デフォルトのブランチで新しいビルドがトリガーされると、同じブランチ上のパイプラインやワークフローがキャンセルされます。ただし、以下のワークフローを除きます。

* スケジュールされたワークフロー
* 再実行のワークフロー

## CircleCI Server での自動キャンセル
{: #auto-cancel-for-circleci-server-installations }

CircleCI Server v2.x では、ビルドの自動キャンセル機能は 、API によりトリガーされたビルド、またはワークフローを使用**しない**プロジェクトの GitHub へのプッシュによりトリガーされたビルドにのみ有効です。

### CircleCI Server での自動キャンセルを有効にする手順
{: #steps-to-enable-auto-cancel-for-circleci-server-installations }

1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

2. **Build Settings** セクションで、**Advanced Settings** をクリックします。

3. **Auto-cancel redundant builds** セクションで **On** ボタンをクリックします。
