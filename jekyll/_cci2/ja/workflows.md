---
layout: classic-docs
title: "ワークフローを使用したジョブのスケジュール"
short-title: "ワークフローを使用したジョブのスケジュール"
description: "ワークフローを使用したジョブのスケジュール"
order: 30
version:
  - Cloud
  - Server v2.x
---

Workflows help you increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources. This document describes the Workflows feature and provides example configurations in the following sections:

* TOC
{:toc}

## 概要

A **workflow** is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you resolve failures sooner.

With workflows, you can:

- リアルタイムのステータス フィードバックによって、ジョブの実行とトラブルシューティングを分離する
- 定期的に実行したいジョブをワークフローとしてスケジュールする
- Fan-out to run multiple jobs concurrently for efficient version testing.
- ファンインして複数のプラットフォームにすばやくデプロイする

For example, if only one job in a workflow fails, you will know it is failing in real-time. Instead of wasting time waiting for the entire build to fail and rerunning the entire job set, you can rerun *just the failed job*.

### ステータス
{:.no_toc}

Workflows may appear with one of the following states:

| State       | Description                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| RUNNING     | Workflow is in progress                                                                                                                      |
| NOT RUN     | Workflow was never started                                                                                                                   |
| CANCELLED   | Workflow was cancelled before it finished                                                                                                    |
| FAILING     | A job in the workflow has failed                                                                                                             |
| FAILED      | One or more jobs in the workflow failed                                                                                                      |
| SUCCESS     | All jobs in the workflow completed successfully                                                                                              |
| ON HOLD     | A job in the workflow is waiting for approval                                                                                                |
| NEEDS SETUP | A workflow stanza is not included or is incorrect in the [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file for this project |

### 制限事項
{:.no_toc}

* Projects that have pipelines enabled may use the CircleCI API to trigger workflows.
* Config without workflows requires a job called `build`.

Refer to the [Workflows]({{ site.baseurl }}/2.0/faq/#workflows) section of the FAQ for additional information and limitations.

## Workflows configuration examples

_For a full specification of the_ `workflows` _key, see the [Workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of the Configuring CircleCI document._

**Note:** Projects configured with Workflows often include multiple jobs that share syntax for Docker images, environment variables, or `run` steps. Refer the [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) documentation for information about how to alias and reuse syntax to keep your `.circleci/config.yml` file small. See the [Reuse YAML in the CircleCI Config](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/) blog post for a summary.

To run a set of concurrent jobs, add a new `workflows:` section to the end of your existing `.circleci/config.yml` file with the version and a unique name for the workflow. The following sample `.circleci/config.yml` file shows the default workflow orchestration with two concurrent jobs. It is defined by using the `workflows:` key named `build_and_test` and by nesting the `jobs:` key with a list of job names. The jobs have no dependencies defined, therefore they will run concurrently.

```yaml
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
See the [Sample Parallel Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) for a full example.

## Tips for advanced configuration

Using workflows enables users to create much more advanced configurations over running a single set of jobs. With more customizability and control comes more room for error, however. When using workflows try to do the following:

- Move the quickest jobs up to the start of your workflows. For example, lint or syntax checking should happen before longer-running, more computationally expensive jobs.
- Using a "setup" job at the _start_ of a workflow can be helpful to do some preflight checks and populate a workspace for all the following jobs.

Consider reading the [optimization]({{ site.baseurl }}/2.0/optimizations) and [advanced config]({{ site.baseurl }}/2.0/adv-config) documentation for more tips related to improving your configuration.

### Sequential job execution example
{:.no_toc}

The following example shows a workflow with four sequential jobs. The jobs run according to configured requirements, each job waiting to start until the required job finishes successfully as illustrated in the diagram.

![Sequential Job Execution Workflow]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

The following `config.yml` snippet is an example of a workflow configured for sequential job execution:

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

The dependencies are defined by setting the `requires:` key as shown. The `deploy:` job will not run until the `build` and `test1` and `test2` jobs complete successfully. A job must wait until all upstream jobs in the dependency graph have run. So, the `deploy` job waits for the `test2` job, the `test2` job waits for the `test1` job and the `test1` job waits for the `build` job.

See the [Sample Sequential Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for a full example.

### Fan-out/fan-in workflow example
{:.no_toc}

The illustrated example workflow runs a common build job, then fans-out to run a set of acceptance test jobs concurrently, and finally fans-in to run a common deploy job.

![Fan-out and Fan-in Workflow]({{ site.baseurl }}/assets/img/docs/fan-out-in.png)

The following `config.yml` snippet is an example of a workflow configured for fan-out/fan-in job execution:

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
In this example, as soon as the `build` job finishes successfully, all four acceptance test jobs start. The `deploy` job must wait for all four acceptance test jobs to complete successfully before it starts.

See the [Sample Fan-in/Fan-out Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out) for a full example.

## Holding a workflow for a manual approval

Workflows can be configured to wait for manual approval of a job before continuing to the next job. Anyone who has push access to the repository can click the Approval button to continue the workflow. To do this, add a job to the `jobs` list with the key `type: approval`. Let's look at a commented config example.

```yaml
# ...
# << your config for the build, test1, test2, and deploy jobs >>
# ...

workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:
      - build  # your custom job from your config, that builds your code
      - test1: # your custom job; runs test suite 1
          requires: # test1 will not run until the `build` job is completed.
            - build
      - test2: # another custom job; runs test suite 2,
          requires: # test2 is dependent on the success of job `test1`
            - test1
      - hold: # <<< A job that will require manual approval in the CircleCI web application.
          type: approval # <<< このキー・値のペアにより、ワークフローのステータスが "On Hold" に設定されます。
          requires: # test2 が成功した場合にのみ "hold" ジョブを実行します。
           - test2
      # `hold` ジョブが承認されると、`hold` ジョブを必要とする後続のジョブが実行されます。 
      # この例では、ユーザーが手動でデプロイ ジョブをトリガーしています。
      - deploy:
          requires:
            - hold
```

The outcome of the above example is that the `deploy:` job will not run until you click the `hold` job in the Workflows page of the CircleCI app and then click Approve. In this example the purpose of the `hold` job is to wait for approval to begin deployment. A job can be approved for up to 15 days after being issued.

Some things to keep in mind when using manual approval in a workflow:

- `approval` is a special job type that is **only** available to jobs under the `workflow` key
- The `hold` job must be a unique name not used by any other job.
- that is, your custom configured jobs, such as `build` or `test1` in the example above wouldn't be given a `type: approval` key.
- The name of the job to hold is arbitrary - it could be `wait` or `pause`, for example, as long as the job has a `type: approval` key in it.
- All jobs that are to run after a manually approved job _must_ `require:` the name of that job. Refer to the `deploy:` job in the above example.
- Jobs run in the order defined until the workflow processes a job with the `type: approval` key followed by a job on which it depends.

The following screenshot demonstrates a workflow on hold.

{:.tab.switcher.Cloud}
![Approved Jobs in On Hold Workflow]({{ site.baseurl }}/assets/img/docs/approval_job_cloud.png)

{:.tab.switcher.Server}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/approval_job.png)


By clicking on the pending job's name (`build`, in the screenshot above), an approval dialog box appears requesting that you approve or cancel the holding job.

After approving, the rest of the workflow runs as directed.

## Scheduling a workflow

It can be inefficient and expensive to run a workflow for every commit for every branch. Instead, you can schedule a workflow to run at a certain time for specific branches. This will disable commits from triggering jobs on those branches.

Consider running workflows that are resource-intensive or that generate reports on a schedule rather than on every commit by adding a `triggers` key to the configuration. The `triggers` key is **only** added under your `workflows` key. This feature enables you to schedule a workflow run by using `cron` syntax to represent Coordinated Universal Time (UTC) for specified branches.

**Note:** In CircleCI v2.1, when no workflow is provided in config, an implicit one is used. However, if you declare a workflow to run a scheduled build, the implicit workflow is no longer run. You must add the job workflow to your config in order for CircleCI to also build on every commit.

**Note:** Please note that when you schedule a workflow, the workflow will be counted as an individual user seat.

### Nightly example
{:.no_toc}

デフォルトでは、`git push` ごとにワークフローがトリガーされます。 スケジュールに沿ってワークフローをトリガーするには、ワークフローに `triggers` キーを追加し、`schedule` を指定します。

以下の例では、`nightly` ワークフローが毎日午前 0 時 (UTC) に実行されるように構成しています。 `cron` キーは、POSIX `crontab` 構文を使用して指定されます。`cron` 構文の基本については、[crontab の man ページ](https://www.unix.com/man-page/POSIX/1posix/crontab/)を参照してください。 このワークフローは、`master` ブランチと `beta` ブランチで実行されます。

**Note:** Scheduled workflows may be delayed by up to 15 minutes. これは、午前 0 時 (UTC) などの混雑時の信頼性を維持するために実施されます。 スケジュールが設定されたワークフローが分単位の正確性で開始されることを想定しないようにご注意ください。

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

上の例の `commit` ワークフローに `triggers` キーはなく、`git push` ごとに実行されます。 `nightly` ワークフローには `triggers` キーがあるため、`schedule` の指定に沿って実行されます。

### Specifying a valid schedule
{:.no_toc}

有効な `schedule` には、`cron` キーと `filters` キーが必要です。

`cron` キーの値は、[有効な crontab エントリ](https://crontab.guru/)である必要があります。

**Note:** Cron step syntax (for example, `*/1`, `*/20`) is **not** supported. Range elements within comma-separated lists of elements are also **not** supported. In addition, range elements for days (for example, `Tue-Sat`) is **not** supported. Use comma-separated digits instead.


Example **invalid** cron range syntax:

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3-5,6" # < the range separator with `-` is invalid
```

Example **valid** cron range syntax:

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3,4,5,6" 
```

The value of the `filters` key must be a map that defines rules for execution on specific branches.

For more details, see the `branches` section of the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#branches-1) document.

For a full configuration example, see the [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml).

## Using contexts and filtering in your workflows

The following sections provide example for using Contexts and filters to manage job execution.

### Using job contexts to share environment variables
{:.no_toc}

The following example shows a workflow with four sequential jobs that use a context to share environment variables. See the [Contexts]({{ site.baseurl }}/2.0/contexts) document for detailed instructions on this setting in the application.

The following `config.yml` snippet is an example of a sequential job workflow configured to use the resources defined in the `org-global` context:

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

The environment variables are defined by setting the `context` key as shown to the default name `org-global`. The `test1` and `test2` jobs in this workflows example will use the same shared environment variables when initiated by a user who is part of the organization. By default, all projects in an organization have access to contexts set for that organization.

### Branch-level job execution
{:.no_toc}

The following example shows a workflow configured with jobs on three branches: Dev, Stage, and Pre-Prod. Workflows will ignore `branches` keys nested under `jobs` configuration, so if you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

![Branch-Level Job Execution]({{ site.baseurl }}/assets/img/docs/branch_level.png)

The following `config.yml` snippet is an example of a workflow configured for branch-level job execution:

```yaml
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:  # using regex filters requires the entire branch to match
            branches:
              only:  # only branches matching the below regex filters will run
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

### Executing workflows for a git tag
{:.no_toc}

CircleCI does not run workflows for tags unless you explicitly specify tag filters. Additionally, if a job requires any other jobs (directly or indirectly), you must [use regular expressions](#using-regular-expressions-to-filter-tags-and-branches) to specify tag filters for those jobs. Both lightweight and annotated tags are supported.

In the example below, two workflows are defined:

- `untagged-build` runs the `build` job for all branches.
- `tagged-build` runs `build` for all branches **and** all tags starting with `v`.

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

- The `build` job runs for all branches and all tags.
- The `deploy` job runs for no branches and only for tags starting with 'v'.

```yaml
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:  # required since `deploy` has tag filters AND requires `build`
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

- The `build` job runs for all branches and only tags starting with 'config-test'.
- The `test` job runs for all branches and only tags starting with 'config-test'.
- The `deploy` job runs for no branches and only tags starting with 'config-test'.

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build:
          filters:  # required since `test` has tag filters AND requires `build`
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:  # required since `deploy` has tag filters AND requires `test`
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

In the example below, two jobs are defined (`test` and `deploy`) and three workflows utilize those jobs:

- The `build` workflow runs for all branches except `main` and is not run on tags.
- The `staging` workflow will only run on the `main` branch and is not run on tags.
- The `production` workflow runs for no branches and only for tags starting with `v.`.

```yaml
workflows:
  build: # This workflow will run on all branches except 'main' and will not run on tags
    jobs:
      - test:
          filters:
            branches:
              ignore: main
  staging: # This workflow will only run on 'main' and will not run on tags
    jobs:
      - test:
          filters: &filters-staging # this yaml anchor is setting these values to "filters-staging"
            branches:
              only: main
            tags:
              ignore: /.*/
      - deploy:
          requires:
            - build
          filters:
            <<: *filters-staging # this is calling the previously set yaml anchor
  production: # This workflow will only run on tags (specifically starting with 'v.') and will not run on branches
    jobs:
      - test:
          filters: &filters-production # this yaml anchor is setting these values to "filters-production"
            branches:
              ignore: /.*/
            tags:
              only: /^v.*/
      - deploy:
          requires:
            - build
          filters:
            <<: *filters-production # this is calling the previously set yaml anchor
```

**Note:** Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads) and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags. If you push several tags at once, CircleCI may not receive all of them.

### Using regular expressions to filter tags and branches
{:.no_toc}

CircleCI branch and tag filters support the Java variant of regex pattern matching. When writing filters, CircleCI matches exact regular expressions.

For example, `only: /^config-test/` only matches the `config-test` tag. To match all tags starting with `config-test`, use `only: /^config-test.*/` instead.

Using tags for semantic versioning is a common use case. To match patch versions 3-7 of a 2.1 release, you could write `/^version-2\.1\.[3-7]/`.

For full details on pattern-matching rules, see the [java.util.regex documentation](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

## Using workspaces to share data among jobs

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. The workspace is an additive-only store of data. Jobs can persist data to the workspace. This configuration archives the data and creates a new layer in an off-container store. ダウンストリーム ジョブは、そのコンテナ ファイルシステムに workspace をアタッチできます。 workspace をアタッチすると Workflows グラフ内のアップストリーム ジョブの順序に基づいて、各レイヤーがダウンロードされアンパッケージ化されます。

![Workspace のデータ フロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

workspace を使用してその実行に固有であり、ダウンストリーム ジョブで必要になるデータを渡します。 複数のブランチでジョブを実行するような workflows では、workspace を利用してデータを共有する必要に迫られることがあります。 Workspace は、コンパイル化されたデータがテスト コンテナによって使用されるプロジェクトでも便利です。

例えば、Scala プロジェクトは通常、ビルド ジョブ内のコンパイルで CPU に高い負荷がかかります。 対照的に、Scala テスト ジョブは CPU に高い負荷がかからず、コンテナ間で十分に並列処理できます。 ビルドジョブにより大きなコンテナを使い、コンパイルされたデータを workspace に保存することで、ビルドジョブからコンパイルされた Scala をテストコンテナで使用できるようになります。

もう 1 つの例は、Java アプリケーションをビルドし、その jar ファイルを workspace に保存する `build` ジョブを含むプロジェクトです。 この `build` ジョブは、`integration-test`、`unit-test`、`code-coverage` にファンアウトし、jar を使用してこれらのテストを並列に実行します。

あるジョブのデータを維持し、他のジョブにそのデータを提供するには、`persist_to_workspace` キーを使用するようにジョブを構成します。 `persist_to_workspace` の `paths:` プロパティに記述されたファイルとディレクトリは、`root` キーで指定しているディレクトリの相対パスとなる一時 workspace にアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

`attach_workspace` キーを構成することで、保存されたデータを取得するようにジョブを構成します。 以下の `config.yml` ファイルでは 2 つのジョブが定義されており、`downstream` ジョブは `flow` ジョブのアーティファクトを使用します。 Workflow はシーケンシャルのため、`downstream` ジョブの処理が開始する前に `flow` ジョブが終了していなければなりません。

```yaml
# 以下のスタンザは、CircleCI 2.1 を使用して再利用可能な Executor を使用していることに注意してください
# これにより、ジョブ間で再利用される Docker イメージを定義できます。
# 詳細については、https://circleci.com/ja/docs/2.0/reusing-config/#再利用可能な-executors-のオーサリング を参照してください。

version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job. 
      - persist_to_workspace:
          # 絶対パスまたは working_directory からの相対パスでなければなりません。 これは、workspace の
      # ルート ディレクトリとなる、コンテナ上のディレクトリです。
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

ビルドジョブとデプロイジョブの間でデータをやりとりする workspace を活用する生きたサンプルとして、CircleCI マニュアルのビルドを構成している [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) も参考にしてください。

ワークスペース、キャッシュ、およびアーティファクトの使用に関する概念的な情報については、ブログ記事「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## Rerunning a workflow's failed jobs

Workflows を利用すると、ビルドの失敗に迅速に対応できるようになります。 To rerun only a workflow's **failed** jobs, click the **Workflows** icon in the app and select a workflow to see the status of each job, then click the **Rerun** button and select **Rerun from failed**.

![CircleCI の Workflows ページ]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング

ここでは Workflows に関する一般的な問題とその解決方法について解説しています。

### Workflow and subsequent jobs do not trigger

Workflows がトリガーされないのは、主に構成エラーによって Workflows の起動が妨げられていることが原因です。 そのため、Workflow がジョブを開始しない事態が発生します。 プロジェクトのパイプラインをナビゲートし、失敗の可能性を識別する Workflow 名をクリックしてください。

### Rerunning workflows fails
{:.no_toc}

(パイプラインの処理中に) Workflow を実行する前にエラーが発生する場合があることがわかっています。 この場合、停止する前は正しく動作していた Workflow でも、再実行すると失敗します。 これを回避するには、プロジェクトのリポジトリに変更をプッシュします。 これにより、最初にパイプライン処理が再実行されてから Workflow が実行されます。

### Workflows waiting for status in GitHub
{:.no_toc}

GitHub リポジトリのブランチに実装済みの Workflows があり、かつステータスチェックの処理が終わらないときは、GitHub のステータス設定で解除したほうが良い項目があるかもしれません。 たとえば、ブランチの保護を選択している場合は、以下に示すように `ci/circleci` ステータス キーの選択を解除する必要があります。このキーが選択されていると、デフォルトの CircleCI 1.0 チェックが参照されるためです。

![GitHub ステータスキーのチェックを外す]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Workflow を使用している場合に `ci/circleci` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。これは、CircleCI が名前にジョブを含むキーを使用して GitHub にステータスを送信するためです。

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.


## See also
{:.no_toc}

- For procedural instructions on how to add Workflows your configuration as you are migrating from a 1.0 `circle.yml` file to a 2.0 `.circleci/config.yml` file, see the [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/) section of the Migrating from 1.0 to 2.0 document.

- For frequently asked questions and answers about Workflows, see the [Workflows]({{ site.baseurl }}/2.0/faq) section of the  FAQ.

- For demonstration apps configured with Workflows, see the [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) on GitHub.

## Video: configure multiple jobs with workflows
{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>

### Video: how to schedule your builds to test and deploy automatically
{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
