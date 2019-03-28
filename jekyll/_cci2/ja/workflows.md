---
layout: classic-docs
title: "ジョブの実行を Workflow で制御する"
short-title: "ジョブの実行を Workflow で制御する"
description: "ジョブの実行を Workflow で制御する"
categories:
  - configuring-jobs
order: 30
---
![header]({{ site.baseurl }}/assets/img/docs/wf-header.png)

迅速なフィードバック、再実行までの時間短縮、リソースの最適化でソフトウェア開発のスピードアップを目指すなら、Workflows を活用してください。 このページでは、下記の内容に沿って Workflows の機能と設定例を解説しています。

- 目次
{:toc}

## 概要

**Workflow** は、ジョブの集まりとその実行順序の定義に関するルールを決めるものです。 単純な設定キーで複雑なジョブを自動化し、ビルドに失敗しても素早いリカバリーを可能にします。

Workflows を使うと下記が可能になります。

- リアルタイムのステータス表示を見ながら、ジョブの実行とトラブルシューティングをそれぞれ別個に行えます
- 定期的に実行したいジョブを含む Workflows のスケジュール化が可能です
- バージョンごとのテストの効率化を目的とした、複数ジョブを並行実行するファンアウトをサポートします
- 複数の環境に対して高速なデプロイを実現するファンインをサポートします

Workflow 内のジョブの 1 つが失敗したとしても、それをリアルタイムで知ることができます。 ビルド処理全体が終了するのを待って、改めて最初からジョブを実行するような無駄な時間は不要です。Workflow では*失敗したジョブのみ*を再実行できます。

### ステータス値
{:.no_toc}

Workflows のステータスは下記のうちいずれかの値をとります。

- RUNNING：Workflow は実行中です。
- NOT RUN：Workflow は未実行です。
- CANCELLED : Workflow は完了前に中断されました。
- FAILING：Workflow 内のジョブが失敗しました。
- FAILED：Workflow 内の 1 つ以上のジョブが失敗しました。
- SUCCESS：Workflow 内のすべてのジョブが問題なく完了しました。
- ON HOLD：Workflow 内のジョブ実行が承認待ちの状態です。
- NEEDS SETUP：そのプロジェクトの [config.yml file]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルに Workflow の記述がないか、内容に誤りがあります。

### 制限について
{:.no_toc}

プロジェクトの設定にある Advanced Settings で [[Enable build processing]]({{ site.baseurl }}/ja/2.0/build-processing/) を有効にすると、Workflows の実行トリガーに CircleCI API を利用できるようにもなります。 Projects that do not enable pipelines will run as if the workflows did not exist when triggered by the API. **注 :** Workflows を使わずにビルドするには `build` ジョブを使います。

こうした制限に関する詳細については [FAQ]({{ site.baseurl }}/ja/2.0/faq) をご確認ください。

## Workflows の設定例

`workflows` *キーに関する細かな仕様は、CircleCI 設定マニュアルの [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) で説明しています。*

**注 :** Workflows で構成されたプロジェクトは通常、Docker イメージ、環境変数、`run` ステップなど、いくつかの構文に分けて記述された複数のジョブからなります。 `.circleci/config.yml` のコードをコンパクトにまとめられるエイリアスの使い方や構文の再利用方法については [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) でご確認ください。 [CircleCI の設定における YAML ファイルの再利用](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)というブログ投稿の内容も参考にしてください。

パラレルジョブを実行したいときは、`.circleci/config.yml` ファイルの末尾に新たに `workflows:` セクションを追加し、バージョンと Workflow 識別用の固有名を付けます。 下記は、並列動作させる 2 つのジョブからなる Workflow による典型的な自動化の手法を示した `.circleci/config.yml` の例です。 `build_and_test` という名前の `workflows:` キーで Workflow が定義され、その下にネストされた `jobs:` キーとジョブ名のリストが見えます。 ジョブには依存関係の定義がないことから、これらは並列で実行されます。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```

以上に関する実際の設定ファイルは [Sample Parallel Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) で確認できます。

### シーケンシャルジョブの例
{:.no_toc}

下記は 4 つのシーケンシャルジョブを含む Workflow の例です。 ジョブは設定した順番通りに実行され、図示しているように、各ジョブはそれぞれ `requires:` に記述されたジョブが問題なく完了するまで、処理が待機する仕組みになっています。

![シーケンシャルジョブを実行する Workflow]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

下記に示す `config.yml` のコードは、シーケンシャルジョブで構成した Workflow の例です。

```yaml
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - deploy:
          requires:
            - test2
```

これを見るとわかるように、依存関係は `requires:` キーで定義されます。 `deploy:` ジョブは `build`、`test1`、`test2` という 3 つのジョブが全て完了するまで実行されません。 ジョブは依存関係にあるそれ以前の全ジョブの処理が終了するまで待つことになるため、 `deploy` ジョブは `test2` を待ち、`test2` ジョブは `test1` を待ち、そして`test1` ジョブは `build` を待つという構図になります。

以上に関する実際の設定ファイルは [Sample Sequential Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) で確認できます。

### ファンイン・ファンアウトの Workflow の例
{:.no_toc}

図示している例では、Workflow は最初に build ジョブを普通に実行し、並列動作する一連の `acceptance_test` ジョブを実行するファンアウトを行います。最終的には `deploy` ジョブを走らせるファンインで処理を終えます。

![ファンイン・ファンアウト Workflow]({{ site.baseurl }}/assets/img/docs/fan_in_out.png)

下記で示した `config.yml` のコードは、ファンイン・ファンアウトジョブで構成した Workflow の例です。

```yaml
workflows:
  version: 2
  build_accept_deploy:
    jobs:
      - build
      - acceptance_test_1:
          requires:
            - build
      - acceptance_test_2:
          requires:
            - build
      - acceptance_test_3:
          requires:
            - build
      - acceptance_test_4:
          requires:
            - build
      - deploy:
          requires:
            - acceptance_test_1
            - acceptance_test_2
            - acceptance_test_3
            - acceptance_test_4
```

この例では、`build` ジョブが完了した後すぐに 4 つの `acceptance_test` ジョブがスタートします。 その後、4 つの `acceptance_test` ジョブの完了を待って、`deploy` ジョブが実行されます。

以上の実際の設定サンプルは [Sample Fan-in/Fan-out Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out) で確認できます。

## 承認後に処理を続行する Workflow の例

Workflow では、次のジョブを続行する前に手動の承認操作を待つ設定にすることも可能です。 リポジトリに対するプッシュ権限があれば、Workflow の続行を指示する [Approval] ボタンをクリックできます。 これを設定するには `jobs` 内にジョブを追加し、`type: approval` キーを追加してください。 設定例としては次のようなものになります。

```yaml
# ...
# << build、test1、test2、deploy ジョブを含むビルドの設定 >>
# ...

workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:
      - build  # コードをビルドする任意のジョブ
      - test1: # 1 つめの test を実行する任意のジョブ
          requires: # build ジョブが完了次第 test1 を実行します
            - build
      - test2: # 2 つめの test を実行する任意のジョブ
          requires: # test2 は test1 が完了してからの実行となります
            - test1
      - hold: # <<< ジョブの続きを実行するには CircleCI の Web ページ上で手動で承認する必要があります。
          type: approval # <<< このキーを使うと Workflow を「待機」状態にします
          requires: # test2 が完了すると hold ジョブに処理が移ります
           - test2
      # hold ジョブにおいて承認すると、hold ジョブの完了待ちとなっていた残りのジョブが実行されます 
      # この例では、ユーザーの手動操作が deploy ジョブの実行トリガーとなります
      - deploy:
          requires:
            - hold
```

The outcome of the above example is that the `deploy:` job will not run until you click the `hold` job in the Workflows page of the CircleCI app and then click Approve. In this example the purpose of the `hold` job is to wait for approval to begin deployment.

Workflow で手動承認を選択する場合は、下記の点に注意が必要です。

- `approval` は `workflow` キー配下のジョブ内で**のみ**利用できる特殊な type 属性です。
- The `hold` job must be a unique name not used by any other job.
- that is, your custom configured jobs, such as `build` or `test1` in the example above wouldn't be given a `type: approval` key.
- The name of the job to hold is arbitrary - it could be `wait` or `pause`, for example, as long as the job has a `type: approval` key in it.
- All jobs that are to run after a manually approved job *must* `require:` the name of that job. Refer to the `deploy:` job in the above example.
- Jobs run in the order defined until the workflow processes a job with the `type: approval` key followed by a job on which it depends.

スクリーンショット： `request-testing` ジョブの承認を待つ Workflow。

![待機状態の Workflow で承認されたジョブ]({{ site.baseurl }}/assets/img/docs/approval_job.png)

The following is a screenshot of the Approval dialog box that appears when you click the `request-testing` job:

![Workflow が待機状態の時の承認ダイアログ]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## Workflow をスケジュール実行する

It can be inefficient and expensive to run a workflow for every commit for every branch. Instead, you can schedule a workflow to run at a certain time for specific branches. この機能を使った場合は、そのブランチにおけるトリガーとなるジョブからのコミットは無効となります。

これは膨大なリソースを使用する Workflow、あるいは `triggers` キーを利用してコミット時以外にも定期的にリポートを生成するような Workflow において有効です。 `triggers` キーを挿入できるのは `workflows` キーの配下**だけ**です。 この機能は、指定したブランチについて、協定世界時 (UTC) を扱う `cron` コマンドの構文で Workflow の実行をスケジュールできるようにします。

### 夜間に実行する例
{:.no_toc}

By default, a workflow is triggered on every `git push`. To trigger a workflow on a schedule, add the `triggers` key to the workflow and specify a `schedule`.

下記は `nightly` という Workflow が毎日午前 12 時 00 分 (UTC) に実行されるよう設定した例です。 `cron` キーは POSIX 規格における `crontab` の構文で表記します。`cron` の書き方については [crontab man page](https://www.unix.com/man-page/POSIX/1posix/crontab/) を参照してください。 この例では、Workflow は `master` と `beta` のブランチにおいてのみ実行されます。

```yaml
workflows:
  version: 2
  commit:
    jobs:
      - test
      - deploy
  nightly:
    triggers:
      - schedule:
          cron: "0 0 * * *"
          filters:
            branches:
              only:
                - master
                - beta
    jobs:
      - coverage
```

In the above example, the `commit` workflow has no `triggers` key and will run on every `git push`. The `nightly` workflow has a `triggers` key and will run on the specified `schedule`.

### スケジュール設定における注意点
{:.no_toc}

A valid `schedule` requires a `cron` key and a `filters` key.

`cron` キーの値は [valid crontab entry](https://crontab.guru/) にある通りに指定してください。

**Note:** Cron step syntax (for example, `*/1`, `*/20`) is **not** supported. Range elements within comma-separated lists of elements are also **not** supported.

The value of the `filters` key must be a map that defines rules for execution on specific branches.

For more details, see the `branches` section of the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#branches-1) document.

For a full configuration example, see the [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml).

## Workflows におけるコンテキストとフィルターの使い方

このセクションではジョブの実行を管理するコンテキストとフィルターの使い方について解説しています。

### 環境変数を共有するジョブコンテキストを使う
{:.no_toc}

下記は、環境変数の共有を可能にするコンテキストを使った 4 つのシーケンシャルジョブを含む Workflow の例です。 詳しい設定の手順は[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)で確認できます。

下記に示した `config.yml` のコードは、`org-global` コンテキストで定義したリソースを使う構成にした、シーケンシャルジョブの例です。

```yaml
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
          context: org-global  
      - test2:
          requires:
            - test1
          context: org-global  
      - deploy:
          requires:
            - test2
```

上記では Context の設定画面におけるデフォルト名である `org-global` を設定していますが、このように `context` キーを設定することで環境変数が定義されます。 この例の `test1` と `test2` のジョブは、組織に所属するユーザーによって実行された際に同じ共有環境変数を使います。 デフォルトでは、組織の管理する全プロジェクトが、その組織におけるコンテキストについてアクセス権限をもちます。

### ブランチレベル（ブランチの配下）でジョブを実行する
{:.no_toc}

下記は、Dev、Stage、Pre-Prod という 3 つのブランチを扱うジョブを設定した Workflow の例です。 Workflows は `jobs` 直下でネストしている `branches` キーを無視します。最初は Workflow を使わずジョブレベル（jobs の直下）で branches を使っていて、その後 Workflow を使う設定に変える場合は、ジョブレベルに記述するのではなく、workflows セクションの jobs のなかで branches キーを宣言しなければなりません。下記の `config.yml` を参考にしてください。

![ブランチレベル（ブランチの配下）でジョブを実行する]({{ site.baseurl }}/assets/img/docs/branch_level.png)

下記に示した `config.yml` ファイルのコードは、ブランチレベルでジョブを実行する構成にした Workflow の例です。

```yaml
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:  # ブランチ全体にマッチさせる正規表現フィルターを使う
            branches:
              only:  # 下記の正規表現フィルターにマッチするブランチのみが実行される
                - dev
                - /user-.*/
      - test_stage:
          filters:
            branches:
              only: stage
      - test_pre-prod:
          filters:
            branches:
              only: /pre-prod(?:-.+)?$/
```

For more information on regular expressions, see the [Using Regular Expressions to Filter Tags And Branches](#using-regular-expressions-to-filter-tags-and-branches) section below.

For a full example of workflows, see the [configuration file](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for the Sample Sequential Workflow With Branching project.

### Git タグに対応可能な Workflows を実行する
{:.no_toc}

CircleCI は明示的にタグフィルターを指定しない限り、タグが含まれる Workflows は実行しません。 Additionally, if a job requires any other jobs (directly or indirectly), you must [use regular expressions](#using-regular-expressions-to-filter-tags-and-branches) to specify tag filters for those jobs. CircleCI では軽量版と注釈付き版のどちらのタグにも対応しています。

In the example below, two workflows are defined:

- `untagged-build` は全てのブランチに対して `build` ジョブを実行します。
- `tagged-build` は全てのブランチ**だけでなく**`v` から始まるタグに対して `build` ジョブを実行します。

```yaml
workflows:
  version: 2
  untagged-build:
    jobs:
      - build
  tagged-build:
    jobs:
      - build:
          filters:
            tags:
              only: /^v.*/
```

In the example below, two jobs are defined within the `build-n-deploy` workflow:

- `build` ジョブは全てのブランチ、全てのタグについて実行します。
- `deploy` ジョブはブランチのない、「v」から始まるタグに対してのみ実行します。

```yaml
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:  # タグフィルター付き、かつ「build」を requires している「deploy」に必要
            tags:
              only: /.*/
      - deploy:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

In the example below, three jobs are defined with the `build-test-deploy` workflow:

- `build` ジョブは全てのブランチを対象に、タグが「config-test」から始まるものについてのみ実行します。
- `test` ジョブは全てのブランチを対象に、タグが「config-test」から始まるものについてのみ実行します。
- `deploy` ジョブはブランチない、タグが「config-test」から始まるものについてのみ実行します。

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build:
          filters:  # タグフィルター付き、かつ「build」を requires している「test」に必要
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:  # タグフィルター付き、かつ「test」を requires している「deploy」に必要
            tags:
              only: /^config-test.*/
      - deploy:
          requires:
            - test
          filters:
            tags:
              only: /^config-test.*/
            branches:
              ignore: /.*/
```

**Note:** Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads) and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags. If you push several tags at once, CircleCI may not receive all of them.

### 正規表現でタグとブランチをフィルターする方法
{:.no_toc}

CircleCI branch and tag filters support the Java variant of regex pattern matching. When writing filters, CircleCI matches exact regular expressions.

For example, `only: /^config-test/` only matches the `config-test` tag. To match all tags starting with `config-test`, use `only: /^config-test.*/` instead.

Using tags for semantic versioning is a common use case. To match patch versions 3-7 of a 2.1 release, you could write `/^version-2\.1\.[3-7]/`.

For full details on pattern-matching rules, see the [java.util.regex documentation](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

## ジョブ間のデータ共有を可能にする Workspaces を使う

各 Workflow には Workspace が割り当てられています。Workspace は、Workflow の進行につれてダウンストリームのジョブにファイルを転送するために使用されます。 The workspace is an additive-only store of data. Jobs can persist data to the workspace. This configuration archives the data and creates a new layer in an off-container store. Downstream jobs can attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow graph.

![workspaces data flow]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Workspaces.png)

Use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Workflows that include jobs running on multiple branches may require data to be shared using workspaces. Workspaces are also useful for projects in which compiled data are used by test containers.

For example, Scala projects typically require lots of CPU for compilation in the build job. In contrast, the Scala test jobs are not CPU-intensive and may be parallelised across containers well. Using a larger container for the build job and saving the compiled data into the workspace enables the test containers to use the compiled Scala from the build job.

A second example is a project with a `build` job that builds a jar and saves it to a workspace. The `build` job fans-out into the `integration-test`, `unit-test`, and `code-coverage` to run those tests in parallel using the jar.

To persist data from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow's temporary workspace relative to the directory specified with the `root` key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

Configure a job to get saved data by configuring the `attach_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start.

```yaml
# ここでは再利用可能な Executor を有効にするため CircleCI 2.1 を使用しています。
# これによりジョブ間で再利用する Docker イメージを定義できるようになります。　
# 詳細は https://circleci.com/docs/2.0/reusing-config/#authoring-reusable-executors

version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # 後に続くジョブで利用できるように Workspace に指定のパス（workspace/echo-output）を保存します。 
      - persist_to_workspace:
          # working_directory からの相対パスか絶対パスを指定します。 
          # これは Workspace のルートディレクトリとなるコンテナ内のディレクトリです
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  version: 2

  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

For a live example of using workspaces to pass data between build and deploy jobs, see the [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) that is configured to build the CircleCI documentation.

For additional conceptual information on using workspaces, caching, and artifacts, refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) blog post.

## Workflow のなかで失敗したジョブを再実行する

When you use workflows, you increase your ability to rapidly respond to failures. To rerun only a workflow's **failed** jobs, click the **Workflows** icon in the app and select a workflow to see the status of each job, then click the **Rerun** button and select **Rerun from failed**.

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング

This section describes common problems and solutions for Workflows.

### 失敗した Workflows を再実行する
{:.no_toc}

It has been observed that in some cases, a failure happens before the workflow runs (during build processing). In this case, re-running the workflow will fail even though it was succeeding before the outage. To work around this, push a change to the project's repository. This will re-run build processing first and then run the workflow.

### Workflows がスタートしない
{:.no_toc}

When creating or modifying workflow configuration, if you don't see new jobs, you may have a configuration error in `config.yml`.

Oftentimes if you do not see your workflows triggering, a configuration error is preventing the workflow from starting. As a result, the workflow does not start any jobs.

When setting up workflows, you currently have to check your Workflows page of the CircleCI app (*not* the Job page) to view the configuration errors.

A project's Job page URL looks like this:

`https://circleci.com/:VCS/:ORG/:PROJECT`

A Workflow page URL looks like this:

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

Look for Workflows that have a yellow tag and "Needs Setup" for the text.

![Invalid workflow configuration example]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)

### Workflows の処理中に GitHub で待機状態のままになる
{:.no_toc}

If you have implemented Workflows on a branch in your GitHub repository, but the status check never completes, there may be status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to GitHub with a key that includes the job by name.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.

## 関連情報
{:.no_toc}

- CircleCI 1.0 の `circle.yml` ファイルから CircleCI 2.0 の `.circleci/config.yml` ファイルへ移行する際の Workflow の設定方法を知りたい場合は、2.0 移行マニュアルの [Workflows の設定の手順]({{ site.baseurl }}/ja/2.0/migrating-from-1-2/)をご覧ください。

- Workflows に関するよくある質問は、FAQ の [Workflow]({{ site.baseurl }}/ja/2.0/faq) を参照してください。

- Workflows を使ったデモアプリは、GitHub の [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) で入手できます。

## 動画：Workflows を使った複数ジョブの設定
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe> 

### 動画：テストとデプロイを自動実行するビルドのスケジューリング方法
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>