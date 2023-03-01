---
layout: classic-docs
title: "ワークフローを使ったジョブのオーケストレーション"
description: "CircleCI ワークフローを使ったジョブのオーケストレーションについて学びます。"
redirect_from: /ja/defining-multiple-jobs/
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
suggested:
  - 
    title: 手動でのジョブの承認およびワークフローのスケジュール実行
    link: https://circleci.com/blog/manual-job-approval-and-scheduled-workflow-runs/
  - 
    title: ブランチ毎のワークフローのフィルタリング
    link: https://support.circleci.com/hc/en-us/articles/115015953868?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - 
    title: ワークフローをトリガーする方法
    link: https://support.circleci.com/hc/en-us/articles/360050351292?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - 
    title: 条件付きワークフロー
    link: https://support.circleci.com/hc/en-us/articles/360043638052-Conditional-steps-in-jobs-and-conditional-workflows
---

ワークフローを使用すれば、迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用が可能で、ソフトウェア開発のスピードアップに役立ちます。 このドキュメントでは、ワークフロー機能について説明し、設定例を紹介します。

## 概要
{: #overview }

**ワークフロー** は、ジョブの集まりとその実行順序の定義に関するルールを決めるものです。 ワークフローを使用すると、単純な設定キーを組み合わせて複雑なジョブオーケストレーションを構成でき、問題の早期解決に役立ちます。

ワークフローにより以下のことが可能になります。

- リアルタイムのステータス フィードバックによって、ジョブの実行とトラブルシューティングを分離する
- 定期的に実行したいジョブをワークフローとしてスケジュールする
- 複数のジョブをファンアウトして同時実行し、バージョン テストを効率的に行う
- ファンインして複数のプラットフォームにすばやくデプロイする

ワークフロー内の 1 つのジョブのみが失敗した場合は、その失敗をリアルタイムに確認できます。 Instead of wasting time waiting for the entire workflow to fail and rerunning the entire job set, you can rerun *just the failed job*.

### ステータス
{: #states }

ワークフローのステータスには以下の種類があります。

| ステータス       | 意味                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| RUNNING     | ワークフローが実行されている                                                                                                                        |
| NOT RUN     | ワークフローが開始されていない                                                                                                                       |
| CANCELED    | ワークフローが終了前にキャンセルされた                                                                                                                   |
| FAILING     | ワークフロー内の 1 つのジョブが失敗した                                                                                                                 |
| FAILED      | ワークフロー内の 1 つ以上のジョブが失敗した                                                                                                               |
| SUCCESS     | ワークフロー内のすべてのジョブが正常に完了した                                                                                                               |
| ON HOLD     | ワークフロー内のジョブが承認待ちになっている                                                                                                                |
| NEEDS SETUP | A workflow stanza is not included or is incorrect in the [.circleci/config.yml](/docs/configuration-reference/) file for this project |
{: class="table table-striped"}

## ワークフローの設定例
{: #workflows-configuration-examples }

_For a full specification of the_ `workflows` _key, see the [Workflows](/docs/configuration-reference/#workflows) section of the Configuration Reference._

複数のジョブを同時に実行するには、既存の `.circleci/config.yml` ファイルの末尾に新しい `workflows:` セクションを追加し、バージョンとワークフローの一意名を指定します。

以下の `.circleci/config.yml` ファイルは、2 つの同時実行ジョブから成るデフォルトのワークフロー オーケストレーションの例です。 It is defined by using the `workflows` key named `build_and_test`, and by nesting the `jobs` key with a list of job names. The jobs have no dependencies defined, so they will run concurrently.

```yaml
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
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
このサンプルの全文は、[並列ワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml)でご覧いただけます。

When using workflows, try to do the following:

- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前よりも先に実行することをお勧めします。
- ワークフローの _先頭_ に setup ジョブを実行すると、事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備にも役立ちます。

Consider reading the [Optimization overview](/docs/optimizations/) for more tips related to improving your configuration.

### 順次ジョブ実行の例
{: #sequential-job-execution-example }

以下の例は、4 つの順次ジョブから成るワークフローを示しています。 ジョブは、構成された要件に従って実行されます。図に示すように、各ジョブは必要なジョブが正しく終了してから開始されます。

![順次ジョブを実行するワークフロー](/docs/assets/img/docs/sequential_workflow.png)

下記で示した `config.yml` のスニペットは、順次ジョブを実行するワークフローの例を示しています。

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

The dependencies are defined by setting the `requires` key as shown. The `deploy` job will not run until the `build` and `test1` and `test2` jobs complete successfully. ジョブは、依存関係グラフ内のすべてのアップストリーム ジョブが実行を完了するまで待機する必要があります。 したがって、`deploy` ジョブは `test2` ジョブを待ち、`test2` ジョブは `test1` ジョブを待ち、`test1` ジョブは `build` ジョブを待ちます。

このサンプルの全文は、[順次ワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)でご覧いただけます。

### ファンアウト/ファンイン ワークフローの例
{: #fan-outfan-in-workflow-example }

以下の `config.yml` スニペットは、ファンアウト/ファンイン ジョブの実行を構成するワークフローの例を示しています。

![ファンアウトとファンインのワークフロー](/docs/assets/img/docs/fan-out-in.png)

以下の `config.yml` スニペットは、ファンアウトとファンインのジョブ実行を構成するワークフローの例を示しています。

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
この例では、`build` ジョブが正しく終了すると直ちに、4 つすべての受け入れテスト ジョブが開始されます。 `deploy` ジョブは、4 つすべての受け入れテスト ジョブが正しく完了するまで待ってから開始されます。

このサンプルの全文は、[ファンイン・ファンアウトのワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out)でご覧いただけます。

## 手動承認後に処理を続行するワークフロー
{: #holding-a-workflow-for-a-manual-approval }

ジョブが手動承認されてから次のジョブを続行するようにワークフローを設定できます。 Anyone who has push access to the repository can click the **Approval** button to continue the workflow. それには、`type: approval` キーを指定したジョブを `jobs` リストに追加します。

The following is a config example, with comments:

```yaml
# ...
# << your config for the build, test1, test2, and deploy jobs >>
# ...

workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:
      - build  # 設定ファイルに含まれるカスタム ジョブ。コードをビルドします。
      - test1: # カスタム ジョブ。test suite 1 を実行します。
          requires: # "build" ジョブが完了するまで test1 は実行されません。
            - build
      - test2: # 別のカスタム ジョブ。
          requires: # test 2 の実行は、"test1" ジョブが成功するかどうかに依存します。
            - test1
      - hold: # <<< CircleCI Web アプリケーションでの手動承認を必要とするジョブ。
          type: approval # <<< このキーと値のペアにより、ワークフローのステータスが "On Hold" に設定されます。
          requires: # test 2 が成功した場合にのみ "hold" ジョブを実行します。
           - test2
      # "hold" ジョブが承認されると、"hold" ジョブを必要とする後続のジョブが実行されます。
       # この例では、ユーザーが手動でデプロイ ジョブをトリガーしています。
      - deploy:
          requires:
            - hold
```

The outcome of the above example is that the `deploy` job will not run until you click the `hold` job in the **Workflows** page of the CircleCI app and then click **Approve**. In this example, the purpose of the `hold` job is to wait for approval to begin deployment. ジョブの承認期限は、発行から 90 日間です。

ワークフローで手動承認を使用する場合は、以下の点に注意する必要があります。

- `approval` は、`workflow` キーの下にあるジョブで**のみ**使用できる特別な種類のジョブです。
- `hold` ジョブは、他のジョブで使用されていない一意の名前である必要があります。
- つまり、上の例の `build` や `test1` など、カスタム構成されたジョブに `type: approval` キーを指定することはできません。
- 保留するジョブの名前は任意で、例えば、 `wait` や `pause`などでもよく、ジョブの中に `type: approval` というキーがあればよいのです。
- All jobs that are to run after a manually approved job _must_ `require` the name of that job. Refer to the `deploy` job in the above example.
- ワークフローで `type: approval` キーを持つジョブと、そのジョブが依存するジョブが処理されるまでは、ジョブは定義された順序で実行されます。

以下のスクリーンショットは、保留中のワークフローを示しています。

{:.tab.switcher.Cloud}
![保留中のワークフローの承認待ちジョブ](/docs/assets/img/docs/approval_job_cloud.png)

{:.tab.switcher.Server_3}
![保留中のワークフローの承認待ちジョブ](/docs/assets/img/docs/approval_job_cloud.png)

{:.tab.switcher.Server_2}
![組織の切り替えメニュー](/docs/assets/img/docs/approval_job.png)


保留中のジョブの名前 (上記のスクリーンショットでは `build`) をクリックすると、保留中のジョブの承認またはキャンセルを求める承認ダイアログ ボックスが表示されます。

承認後、設定ファイルでの指示に従って残りのワークフローが実行されます。

## ワークフローのスケジュール実行
{: #scheduling-a-workflow }

ワークフローのスケジュール実行機能は廃止される予定です。 ワークフローのスケジュール実行ではなく**パイプラインのスケジュール実行**を使用することで多くのメリットが得られます。 既存のワークフローのスケジュール実行をパイプラインのスケジュール実行に移行する方法については、パイプラインのスケジュール実行の[移行ガイド]({{site.baseurl}}/migrate-scheduled-workflows-to-scheduled-pipelines)を参照してください。 はじめからパイプラインのスケジュール実行をセットアップする場合は、[パイプラインのスケジュール実行]({{site.baseurl}}/scheduled-pipelines)のページを参照してください。
{: class="alert alert-warning"}

Runing a workflow for every commit for every branch can be inefficient and expensive. 代わりに、特定のブランチに対して特定の時刻にワークフローを実行するようにスケジュールを設定できます。 この機能を使った場合は、そのブランチにおけるトリガーとなるジョブからのコミットは無効となります。

リソースに高い負荷がかかるワークフローやレポートを生成するワークフローは、コミットのたびに実行するのではなく、設定ファイルに `triggers` キーを追加してスケジュール実行することを検討してください。 `triggers` キーは、`workflows` キーの下に**のみ**追加できます。 この機能により、指定したブランチについて、協定世界時 (UTC) を表す `cron` 構文で ワークフローの実行をスケジューリングすることができます。

In CircleCI v2.1, when no workflow is provided in the config, an implicit one is used. しかし、ビルドをスケジュール実行するワークフローを宣言すると、暗黙的なワークフローは実行されなくなります。 コミットごとにもビルドを行うには、設定ファイルにジョブ ワークフローを追加する必要があります。
{: class="alert alert-info" }

Please note that when you schedule a workflow, the workflow will be counted as an individual user seat.
{: class="alert alert-info" }

### 夜間に実行する例
{: #nightly-example }

デフォルトでは、`git push` ごとにワークフローがトリガーされます。 スケジュールに沿ってワークフローをトリガーするには、ワークフローに `triggers` キーを追加し、`schedule` を指定します。

下記は、`nightly` というワークフローが毎日午前 0 時 (UTC) に実行されるよう設定した例です。 `cron` は POSIX 規格の `crontab` の構文で表記します。`cron` の書き方については [crontab man page](https://www.unix.com/man-page/POSIX/1posix/crontab/) を参照してください。 この例では、Workflow は `main` と `beta` のブランチにおいてのみ実行されます。

Scheduled workflows may be delayed by up to 15 minutes. これは、午前 0 時 (UTC) などの混雑時の信頼性を維持するために実施されます。 Do not assume that scheduled workflows are started with to-the-minute accuracy.
{: class="alert alert-info" }

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
                - main
                - beta
    jobs:
      - coverage
```

上の例の `commit` ワークフローに `triggers` キーはなく、`git push` ごとに実行されます。 `nightly` ワークフローには `triggers` キーがあるため、`schedule` の指定に沿って実行されます。

### 有効なスケジュールの指定
{: #specifying-a-valid-schedule }

有効な `schedule` には、`cron` キーと `filters` キーが必要です。

`cron` キーの値は [valid crontab entry](https://crontab.guru/) にある通りに指定しなければなりません。

The following are **not** supported:
- Cron step syntax (for example, `*/1`, `*/20`).
- Range elements within comma-separated lists of elements.
- Range elements for days (for example, `Tue-Sat`).  
  Use comma-separated digits instead.
{: class="alert alert-info" }

`filters` キーの値には、特定ブランチ上の実行ルールを定義するマップを指定します。

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3-5,6" # < "-" は無効な範囲区切り文字です。
```

詳細については、「CircleCI を設定する」の「[`branches`]({{ site.baseurl }}/2.0/configuration-reference/#branches-1)」セクションを参照してください。

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3,4,5,6"
```

このサンプルの全文は、[ワークフローのスケジュールを設定する構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml)でご覧いただけます。

For more details, see the `branches` section of the [Configuring CircleCI](/docs/configuration-reference/#branches-1) document.

このサンプルの全文は、[ワークフローのスケジュール実行の設定ファイルサンプル](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml)でご覧いただけます。

## ワークフローにおけるコンテキストとフィルターの使用
{: #using-contexts-and-filtering-in-your-workflows }

次のセクションではジョブの実行を管理するコンテキストとフィルターの使い方を解説しています。

### ジョブ コンテキストを使用して環境変数を共有する
{: #using-job-contexts-to-share-environment-variables }

下記は、環境変数の共有を可能にするコンテキストを使った 4 つの順次ジョブを含む ワークフローの例です。 See the [Contexts](/docs/contexts/) document for detailed instructions on this setting in the application.

下記で示した `config.yml` のスニペットは、`org-global` コンテキストで定義したリソースを使う設定を施した、順次ジョブのワークフローの例です。

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

この例では、環境変数はデフォルト名の `org-global` としている `context` キーを設定することで定義されます。 この例の `test1` と `test2` のジョブは、組織に所属するユーザーによって実行された際に同じ共有環境変数を使います。 デフォルトでは、組織が管理している全プロジェクトがその組織の一連のコンテキストにアクセスできます。

### ブランチレベルでジョブを実行する
{: #branch-level-job-execution }

下記は、Dev、Stage、Pre-Prod という 3 つのブランチにおけるジョブを設定したワークフロー の例です。 Workflows will ignore `branches` keys nested under `jobs` configuration, so if you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `.circleci/config.yml`, as follows:

![ブランチレベルでジョブを実行する](/docs/assets/img/docs/branch_level.png)

The following `.circleci/config.yml` snippet is an example of a workflow configured for branch-level job execution:

```yaml
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:  # 正規表現フィルターを使用する場合、ブランチ全体が一致する必要があります。
            branches:
              only:  # 以下の正規表現フィルターに一致するブランチのみが実行されます。
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

正規表現の詳細については、下記の「[正規表現を使用してタグとブランチをフィルタリングする](#using-regular-expressions-to-filter-tags-and-branches)」を参照してください。

ワークフロー構成例の全文は、ブランチを含む順次ワークフローのサンプル プロジェクトの[設定ファイル](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)でご覧いただけます。

### Git タグに対応するワークフローを実行する
{: #executing-workflows-for-a-git-tag }

CircleCI は明示的にタグフィルターを指定しない限り、タグに対してワークフローは実行しません。 また、ジョブの実行に別のジョブが (直接的または間接的に) 必要とされる場合、[正規表現を使用](#using-regular-expressions-to-filter-tags-and-branches)し、必要なジョブのタグフィルターを指定する必要があります。 CircleCI は軽量版と注釈付き版のどちらのタグにも対応しています。

以下の例では、2 つのワークフローが定義されています。

- `untagged-build` は全てのブランチに対して `build` ジョブを実行します。
- `tagged-build`: すべてのブランチ**に加えて** `v` で始まるすべてのタグに対して `build` を実行します。

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

下記の例では `build-n-deploy` という名前のワークフローで 2 つのジョブを定義しています。

- `build`: すべてのブランチとすべてのタグに対して実行されます。
- `deploy`: ブランチに対しては実行されず、"v" で始まるタグに対してのみ実行されます。

```yaml
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:  # "deploy" にタグ フィルターがあり、それが "build" を必要とするため必須です。
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

以下の例では、`build-n-deploy` ワークフローで 2 つのジョブを定義しています。

- `build` ジョブは全てのブランチを対象に、タグが「config-test」から始まるものについてのみ実行します。
- `test` ジョブは全てのブランチを対象に、タグが「config-test」から始まるものについてのみ実行します。
- `deploy` ジョブはブランチない、タグが「config-test」から始まるものについてのみ実行します。

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build:
          filters:  # "test" にタグ フィルターがあり、それが "build" を必要とするため必須です。
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:  # "deploy" にタグ フィルターがあり、それが "test" を必要とするため必須です。
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

以下の例では、2つのジョブ（`test` と `deploy`）が定義され、3つのワークフローがそれらのジョブを利用します。

- `build`: `main` を除くすべてのブランチに対して実行されます。 タグに対しては実行されません。
- `staging`: `main` ブランチのみに対して実行されます。 タグに対しては実行されません。
- `production`: ブランチに対しては実行されず、`v.` で始まるタグに対してのみ実行されます。

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
            - test
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
            - test
          filters:
            <<: *filters-production # this is calling the previously set yaml anchor
```

Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads) and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags. If you push several tags at once, CircleCI may not receive all of them.
{: class="alert alert-info" }

### 正規表現を使用してタグとブランチをフィルタリングする
{: #using-regular-expressions-to-filter-tags-and-branches }

CircleCI のブランチおよびタグ フィルターは、Java 正規表現パターン マッチのバリアントをサポートしています。 フィルターを記述した場合、CircleCI では正規表現との正確な一致が評価されます。

たとえば、`only: /^config-test/` は `config-test` タグにのみ一致します。 `config-test` で始まるすべてのタグに一致させるには、代わりに `only: /^config-test.*/` を使用します。

セマンティック バージョニングにはタグが一般的に使用されています。 2.1 リリースのパッチ バージョン 3 ～ 7 と一致させるには、`/^version-2\.1\.[3-7]/` と記述します。

パターンを一致させるルールの詳細については、[java.util.regex のドキュメント](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html)を参照してください。

## ワークスペースによるジョブ間のデータ共有
{: #using-workspaces-to-share-data-between-jobs }

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴ってダウンストリーム ジョブにファイルを転送するために使用されます。 For further information on workspaces and their configuration see the [Using Workspaces to Share Data Between Jobs](/docs/workspaces) doc.

## ワークフロー内の失敗したジョブの再実行
{: #rerunning-a-workflows-failed-jobs }

ワークフローを利用すると、ビルドの失敗に迅速に対応できるようになります。 ワークフローの中の**失敗した**ジョブのみを再実行するには、CircleCI で **[Workflows (ワークフロー)]** アイコンをクリックし、目的のワークフローを選んでジョブごとのステータスを表示してから、**[Rerun (再実行)]** ボタンをクリックして **[Rerun from failed (失敗からの再実行)]** を選びます。

![CircleCI のワークフローのページ](/docs/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング
{: #troubleshooting }

This section describes common problems and solutions for workflows.

### ワークフローと後続のジョブがトリガーされない
{: #workflow-and-subsequent-jobs-do-not-trigger }

ワークフローがトリガーされないのは、主に設定エラーによってワークフローの起動が妨げられていることが原因です。 そのため、ワークフローがジョブを開始しない事態が発生します。 プロジェクトのパイプラインに移動し、ワークフロー名 をクリックして、何が失敗しているかを確認します。

### ワークフローの再実行が失敗する
{: #rerunning-workflows-fails }

In some cases, a failure may happen before the workflow runs (during pipeline processing). Re-running the workflow will fail even though it was succeeding before the outage. これを回避するには、プロジェクトのリポジトリに変更をプッシュします。 これにより、最初にパイプライン処理が再実行されてから Workflow が実行されます。

また、90 日以上前のジョブやワークフローは再実行できません。

### GitHub でワークフローがステータスを待機する
{: #workflows-waiting-for-status-in-github }

GitHub リポジトリのブランチに実装済みのワークフローがあるのにステータスチェックの処理が終わらないときは、GitHub のステータス設定で解除したほうが良い項目があるかもしれません。 例えば、「Protect this branch」をオンにしている場合、以下のスクリーンショットにあるように、ステータスチェックの設定対象から `ci/circleci` を外す必要があります。この項目は古い CircleCI 1.0 のデフォルト設定になっていたものです。

![GitHub ステータスキーのチェックを外す](/docs/assets/img/docs/github_branches_status.png)

ワークフローを使用している際に `ci/circleci` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。 これは、CircleCI が名前にジョブを含むキーを使用して GitHub にステータスを送信するためです。

GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例: https://github.com/your-org/project/settings/branches)。


## 関連項目
{: #see-also }

- For frequently asked questions and answers about workflows, see the [Workflows](/docs/faq/) section of the  FAQ.
- For demo apps configured with workflows, see the [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) page on GitHub.
