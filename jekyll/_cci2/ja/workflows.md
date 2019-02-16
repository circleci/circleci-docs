---
layout: classic-docs
title: "ジョブの自動化を可能にする Workflow を使う"
short-title: "ジョブの自動化を可能にする Workflow を使う"
description: "ジョブの自動化を可能にする Workflow を使う"
categories:
  - configuring-jobs
order: 30
---
![header]({{ site.baseurl }}/assets/img/docs/wf-header.png)

迅速なフィードバック、再実行までの時間短縮、リソースの最適化でソフトウェア開発のスピードアップを目指すなら、Workflow を活用してください。 このページでは、下記の内容に沿って Workflow の機能と設定例を解説しています。

- 目次
{:toc}

## 概要

**Workflow** は、ジョブの集まりとその実行順序の定義に関するルールを決めるものです。 単純な設定キーで複雑なジョブを自動化し、ビルドに失敗しても素早いリカバリーを可能にします。

Workflow を使うと下記が可能になります。

- リアルタイムのステータス表示を見ながら、ジョブの実行とトラブルシューティングをそれぞれ別個に行えます
- 定期的に実行したいジョブを含む Workflow のスケジュール化が可能です
- バージョンごとのテストの効率化を目的とした、複数ジョブを並行実行するファンアウトをサポートします
- 複数の環境に対して高速なデプロイを実現するファンインをサポートします

Workflow 内のジョブの 1 つが失敗したとしても、それをリアルタイムで知ることができます。 ビルド処理全体が終了するのを待って、改めて最初からジョブを実行するような無駄な時間は不要です。Workflow では*失敗したジョブのみを*再実行できます。

### ステータス値
{:.no_toc}

Workflows may appear with one of the following states:

- RUNNING: Workflow is in progress
- NOT RUN: Workflow was never started
- CANCELLED: Workflow was cancelled before it finished
- FAILING: A Job in the workflow has failed
- FAILED: One or more jobs in the workflow failed
- SUCCESS: All jobs in the workflow completed successfully
- ON HOLD: A job in the workflow is waiting for approval
- NEEDS SETUP：そのプロジェクトの [config.yml file]({{ site.baseurl }}/2.0/configuration-reference/) ファイルに Workflow の記述がないか、内容に誤りがあります。

### 制限について
{:.no_toc}

[ビルド処理のプレビュー]({{ site.baseurl }}/2.0/build-processing/)を有効にしたプロジェクトは、Workflow の実行トリガーに CircleCI API を用いることもできます。 反対にビルド処理のプレビューを有効にしていないプロジェクトについては、Workflow は API 経由で実行されることはありません。 **※**Workflow を使わずにビルドするには `build` ジョブを使います。</p> 

こうした制限に関する詳細については [FAQ]({{ site.baseurl }}/2.0/faq) をご確認ください。

## Workflow の設定例

`workflows` *キーに関する細かな仕様は、CircleCI 設定マニュアルの [Workflow]({{ site.baseurl }}/2.0/configuration-reference/#workflows) で説明しています。*

**※**Workflow が設定されたプロジェクトは通常、Docker イメージ、環境変数、`run` ステップなど、いくつかの構文に分けて記述された複数のジョブからなります。 `.circleci/config.yml` のコードをコンパクトにまとめられるエイリアスの使い方や構文の再利用方法については [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) でご確認ください。 ブログの [CircleCI の設定における YAML ファイルの再利用](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)という投稿内容も参考にしてください。

パラレルジョブを実行したいときは、`.circleci/config.yml` ファイルの末尾に新たに `workflows:` セクションを追加し、バージョンと Workflow 識別用の固有名を付けます。 下記は、並列動作させる 2 つのジョブからなる Workflow による典型的な自動化の手法を示した `.circleci/config.yml` の例です。 `build_and_test` という名前の `workflows:` キーで Workflow が定義され、その下にネストされた `jobs:` キーとジョブ名のリストが見えます。 ジョブには依存関係の定義がないことから、これらは並列で実行されます。

```yaml
```
version: 2
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
```

以上に関する実際の設定ファイルは [Sample Parallel Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) で確認できます。

### シーケンシャルジョブの例
{:.no_toc}

下記は 4 つのシーケンシャルジョブを含む Workflow の例です。 ジョブは設定した順番通りに実行され、図示しているように、各ジョブはそれぞれ `requires:` に記述されたジョブが問題なく完了するまで、処理が待機する仕組みになっています。

![Sequential Job Execution Workflow]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

下記に示す `config.yml` のコードは、シーケンシャルジョブで構成した Workflow の例です。

    ```
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
    

ご覧いただくとわかるように、依存関係は `requires:` キーで定義されます。 `deploy:` ジョブは `build`、`test1`、`test2` という 3 つのジョブが全て完了するまで実行されません。 ジョブは依存関係にあるそれ以前の全ジョブの処理が終了するまで待つことになるため、 `deploy` ジョブは `test2` を待ち、`test2` ジョブは `test1` を待ち、そして`test1` ジョブは `build` を待つという構図になります。

以上に関する実際の設定ファイルは [Sample Sequential Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) で確認できます。

### ファンイン・ファンアウトの Workflow の例
{:.no_toc}

図示している例では、Workflow は最初に build ジョブを普通に実行し、並列動作する一連の `acceptance_test` ジョブを実行するファンアウトを行います。最終的には `deploy` ジョブを走らせるファンインで処理を終えます。

![Fan-out and Fan-in Workflow]({{ site.baseurl }}/assets/img/docs/fan_in_out.png)

下記で示した `config.yml` のコードは、ファンイン・ファンアウトジョブで構成した Workflow の例です。

    ```
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

Workflow では、次のジョブを続行する前に手動の承認操作を待つ設定にすることも可能です。 リポジトリに対するプッシュ権限があれば、Workflow の続行を指示する「承認ボタン」をクリックできます。 これを設定するには `jobs` 内にジョブを追加し、`type: approval` キーを追加してください。 設定例としては次のようなものになります。

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

結果的に以上の例では、CircleCI の Workflow ページで `hold` ジョブをクリックし、さらに Approve をクリックしない限り `deploy:` ジョブは実行されません。 承認するまでデプロイを待機させるというのが、ここでの `hold` ジョブの目的になっています。

Workflow で手動で承認させる形にする場合は、下記の点に注意が必要です。

- `approval` は `workflow` キー配下のジョブ内で**のみ**利用できる特殊な type 属性です。
- `hold` のように待機用に用意するジョブは、他にジョブ名として使われていない一意の名前にする必要があります。 
  - つまり、`build` や `test1` といったすでに使用しているジョブ名では、そのなかで `type: approval` キーを指定することはできません。
- 待機用のジョブの名前は任意に付けられます。`type: approval` キーを含めてさえいれば、`wait` や `pause` などでもかまいません。
- 手動の承認操作後に実行されることになる全てのジョブは、 *必ず* `require:` でその待機用のジョブ名を指定しておいてください。 上記の例では `deploy:` ジョブがそれに該当します。
- 依存しているジョブに続いて実行される `type: approval` キーのあるジョブまで、Workflow は順番通りに実行します。

スクリーンショット： `request-testing` ジョブの承認を待つ Workflow。

![Approved Jobs in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job.png)

スクリーンショット：`request-testing` ジョブをクリックすると現れる承認ダイアログ。

![Approval Dialog in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## Scheduling a Workflow

ブランチ 1 つ 1 つにおいてコミットごとに Workflow を実行するのは、非効率で手間もかかります。 そんなときは特定のブランチに対して、一定の時刻に Workflow をスケジュール実行する機能が使えます。 この機能を使った場合は、そのブランチにおけるトリガーとなるジョブからのコミットは無効となります。

これは膨大なリソースを使用する Workflow、あるいは `triggers` キーを利用してコミット時以外にも定期的にリポートを生成するような Workflow において有効です。 `triggers` キーを挿入できるのは `workflows` キーの配下**だけ**です。 この機能は、指定したブランチについて、協定世界時 (UTC) を扱う `cron` コマンドの構文で Workflow の実行をスケジュールできるようにします。

### 夜間に実行する例
{:.no_toc}

デフォルトでは、`git push` のたびに Workflow の実行がトリガーされます。 これをスケジュール実行に変えるには、Workflow に `triggers` キーを追加し、`schedule` を指定します。

下記は `nightly` という Workflow が毎日午前 12 時 00 分 (UTC) に実行されるよう設定した例です。 `cron` キーは POSIX 規格における `crontab` の構文で表記します。`cron` の書き方については [crontab man page](https://www.unix.com/man-page/POSIX/1posix/crontab/) を参照してください。 この例では、Workflow は `master` と `beta` のブランチにおいてのみ実行されます。

```yaml
```
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
```

上記では、`commit` という名前の Workflow には `triggers` がありません。そのため、この部分は `git push` するたびに実行されます。 `nightly` の Workflow には `triggers` があり、指定した`スケジュールに沿って`実行されます。

### スケジュール設定における注意点
{:.no_toc}

`schedule` の配下には、`cron` キー と `filters` キーが必要です。

`cron` キーの値は [valid crontab entry](https://crontab.guru/) にある通りに指定してください。

**※**Cron のステップ構文 (`*/1` や `*/20` など) には**対応していません**。

`filters` キーの値は、所定のブランチの実行ルールを定義する内容とします。

詳しくは [CircleCI 設定リファレンス]({{ site.baseurl }}/2.0/configuration-reference/#branches-1)ページの `branches` を参照してください。

実際の設定サンプルは [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml) で確認できます。

## Workflow におけるコンテキストとフィルターの使い方

このセクションではジョブの実行を管理するコンテキストとフィルターの使い方について解説しています。

### 環境変数を共有するジョブコンテキストを使う
{:.no_toc}

下記は、環境変数の共有を可能にするコンテキストを使った 4 つのシーケンシャルジョブを含む Workflow の例です。 詳しい設定の手順は[コンテキスト]({{ site.baseurl }}/2.0/contexts)で確認できます。

下記に示した `config.yml` のコードは、`org-global` コンテキストで定義したリソースを使う構成にした、シーケンシャルジョブの例です。

    ```
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
    

環境変数は、上記でデフォルト名 `org-global` としているように、`context` キーを設定することで定義されます。 この例の `test1` と `test2` のジョブは、組織に所属するユーザーによって実行された際に同じ共有環境変数を使います。 デフォルトでは、組織の管理する全プロジェクトが、その組織におけるコンテキストについてアクセス権限をもちます。

### ブランチレベルでジョブを実行する
{:.no_toc}

下記は、Dev、Stage、Pre-Prod という 3 つのブランチを扱うジョブを設定した Workflow の例です。 Workflow は `jobs` 配下でネストしている `branches` キーを無視します。最初にジョブレベルで `branches` を使っていて、その後 Workflow に変える場合は、ジョブレベルではなく、workflows の `filters` 内で宣言しなければなりません。下記の `config.yml` を参考にしてください。

![ブランチレベルでジョブを実行する]({{ site.baseurl }}/assets/img/docs/branch_level.png)

下記に示した `config.yml` ファイルのコードは、ブランチレベルでジョブを実行する構成にした Workflow の例です。

```yaml
```
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
```

正規表現の詳しい使い方については、[正規表現でタグ、ブランチをフィルタリングする方法](#using-regular-expressions-to-filter-tags-and-branches)をご覧ください。 ブランチ化されているプロジェクトを扱うシーケンシャル Workflow の実際の設定サンプルは、[こちらの設定ファイル](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)で確認できます。

### Git タグに対応可能な Workflow を実行する
{:.no_toc}

CircleCI は明示的にタグフィルターを指定しない限り、タグが含まれる Workflow は実行しません。 また、あるジョブを実行するのに他のジョブを（直接的にしろ間接的にしろ）必要としているような場合も、[正規表現](#using-regular-expressions-to-filter-tags-and-branches)を用いてそのジョブに対するタグフィルターを指定する必要があります。 Both lightweight and annotated tags are supported.

下記は 2 つの workflows を用いた例です。

- `untagged-build` は全てのブランチに対して `build` ジョブを実行します。
- `tagged-build` は `v` から始まるタグをもつ全てのブランチの `build` ジョブを実行します。

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

下記の例では `build-n-deploy` という名前の Workflow で 2 つのジョブを定義しています。

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

下記の例では `build-testn-deploy` という名前の Workflow で 3 つのジョブを定義しています。

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

### Using Regular Expressions to Filter Tags and Branches
{:.no_toc}

CircleCI branch and tag filters support the Java variant of regex pattern matching. When writing filters, CircleCI matches exact regular expressions.

For example, `only: /^config-test/` only matches the `config-test` tag. To match all tags starting with `config-test`, use `only: /^config-test.*/` instead. Using tags for semantic versioning is a common use case. To match patch versions 3-7 of a 2.1 release, you could write `/^version-2\.1\.[3-7]/`.

For full details on pattern-matching rules, see the [java.util.regex documentation](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

## Using Workspaces to Share Data Among Jobs

各 Workflow には Workspace が割り当てられています。Workspace は、Workflow の進行につれてダウンストリームのジョブにファイルを転送するために使用されます。 The workspace is an additive-only store of data. Jobs can persist data to the workspace. This configuration archives the data and creates a new layer in an off-container store. Downstream jobs can attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow graph.

![workspaces data flow]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Workspaces.png)

Use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Workflows that include jobs running on multiple branches may require data to be shared using workspaces. Workspaces are also useful for projects in which compiled data are used by test containers.

For example, Scala projects typically require lots of CPU for compilation in the build job. In contrast, the Scala test jobs are not CPU-intensive and may be parallelised across containers well. Using a larger container for the build job and saving the compiled data into the workspace enables the test containers to use the compiled Scala from the build job.

A second example is a project with a `build` job that builds a jar and saves it to a workspace. The `build` job fans-out into the `integration-test`, `unit-test`, and `code-coverage` to run those tests in parallel using the jar.

To persist data from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow's temporary workspace relative to the directory specified with the `root` key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

Configure a job to get saved data by configuring the `attach_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start.

```yaml
# Note that the following stanza uses CircleCI 2.1 to make use of a Reusable Executor
# This allows defining a docker image to reuse across jobs.
# visit https://circleci.com/docs/2.0/reusing-config/#authoring-reusable-executors to learn more.

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

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job. 
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is 
          # taken to be the root directory of the workspace.
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
  version: 2.1

  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

For a live example of using workspaces to pass data between build and deploy jobs, see the [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) that is configured to build the CircleCI documentation. For additional conceptual information on using workspaces, caching, and artifacts, refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) blog post.

## Rerunning a Workflow's Failed Jobs

When you use workflows, you increase your ability to rapidly respond to failures. To rerun only a workflow's **failed** jobs, click the **Workflows** icon in the app and select a workflow to see the status of each job, then click the **Rerun** button and select **Rerun from failed**.

![CircleCI Workflows Page]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング

This section describes common problems and solutions for Workflows.

### Rerunning Workflows Fails
{:.no_toc}

It has been observed that in some case, a failure happens before the workflow runs (during build processing). In this case, rerunning the workflow will fail even though it was succeeding before the outage. To workaround this, push a change to the project's repository. This will re-run build processing first and then run the workflow.

### Workflows Not Starting
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

### Workflows Waiting for Status in GitHub
{:.no_toc}

If you have implemented Workflows on a branch in your GitHub repository, but the status check never completes, there may be status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to Github with a key that includes the job by name.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.

## 関連情報
{:.no_toc}

- For procedural instructions on how to add Workflows your configuration as you are migrating from a 1.0 `circle.yml` file to a 2.0 `.circleci/config.yml` file, see the [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/) section of the Migrating from 1.0 to 2.0 document.

- For frequently asked questions and answers about Workflows, see the [Workflows]({{ site.baseurl }}/2.0/faq) section of the FAQ.

- For demonstration apps configured with Workflows, see the [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) on GitHub.

## Video: Configure Multiple Jobs with Workflows
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe> 

### Video: How to Schedule Your Builds to Test and Deploy Automatically
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>