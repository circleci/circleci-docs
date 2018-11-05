---
layout: classic-docs
title: "Using Workflows to Schedule Jobs"
short-title: "Using Workflows to Schedule Jobs"
description: "Using Workflows to Schedule Jobs"
categories:
  - configuring-jobs
order: 30
---
![ヘッダー]({{ site.baseurl }}/assets/img/docs/wf-header.png)

フィードバックの迅速化、再実行までの時間短縮、リソースの効率的な活用を通じてソフトウェア開発のスピードアップを目指すなら、Workflow を設定します。 このページでは、下記の内容に沿って Workflow の機能と設定例を解説しています。

- 目次 {:toc}

## はじめに

**Workflow** は、ジョブの集まりとその実行順序の定義に関するルールを決めるものです。 Workflow は、失敗の素早いリカバリーを可能にするシンプルな設定キーにより、複雑なジョブの自動化をサポートします。

Workflow を使うと下記が可能になります。

- リアルタイムのステータス表示を見ながら、ジョブの実行とトラブルシューティングをそれぞれ別個に行えます
- 定期的に実行する必要があるジョブを含む Workflow のスケジュール化が可能です
- バージョンごとのテストの効率化を目的とした、複数ジョブを並行実行するファンアウトをサポートします
- 複数の OS に対する高速なデプロイを実現するファンインをサポートします

Workflow 内のジョブの 1 つが失敗した場合、リアルタイムで知ることができます。 ビルド全体が失敗するのを待ってから全てのジョブを改めて実行するような無駄な時間を費やすことがなく、*失敗したジョブのみを*再実行できます。

### States

{:.no_toc}

Workflows may appear with one of the following states:

- RUNNING: Workflow is in progress
- NOT RUN: Workflow was never started
- CANCELLED: Workflow was cancelled before it finished
- FAILING: A Job in the workflow has failed
- FAILED: One or more jobs in the workflow failed
- SUCCESS: All jobs in the workflow completed successfully
- ON HOLD: A job in the workflow is waiting for approval
- NEEDS SETUP: A workflow stanza is not included or is incorrect in the [config.yml file]({{ site.baseurl }}/2.0/configuration-reference/) for this project

### 制限について

{:.no_toc}

Projects that have [Build Processing]({{ site.baseurl }}/2.0/build-processing/) enabled may use the CircleCI API to trigger workflows. Projects that do not enable build processing will run as if the workflows did not exist when triggered by the API. **Note:** Builds without workflows require a `build` job.

Refer to the [Workflows]({{ site.baseurl }}/2.0/faq) section of the FAQ for additional information and limitations.

## Workflow の設定例

`workflows` *キーに関する詳細な仕様は、CircleCI 設定マニュアルの [Workflow]({{ site.baseurl }}/2.0/configuration-reference/#workflows) の項で説明しています。*

Workflow が設定されたプロジェクトは通常、Docker イメージ、環境変数、`run` ステップなど、いくつかの構文に分けて記述された複数のジョブからなります。 `.circleci/config.yml` のコードをコンパクトにするエイリアスの使い方や構文の再利用方法については [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) でご確認ください。 また、ブログページの [CircleCI の設定における YAML ファイルの再利用](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)も参考にしてください。

パラレルジョブを扱うときは、`.circleci/config.yml` ファイルの末尾に新たに `workflows:` セクションを設け、バージョンと Workflow 識別用の固有名を付けます。 下記は、並列動作させる 2 つのジョブからなる典型的な Workflow 自動化の手法を示した `.circleci/config.yml` の例です。 `build_and_test` という名前の `workflows:` キーで Workflow が定義され、その下にネストされた `jobs:` キーとジョブ名のリストが見えます。 ジョブには依存関係の定義がないことから、これらは並列で実行することになります。

```yaml
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

これに関する実際の設定ファイルは [Sample Parallel Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) で確認できます。

### シーケンシャルジョブ実行の例

{:.no_toc}

下記は 4 つのシーケンシャルジョブを含む Workflow の例です。 ジョブは設定された順番通りに実行され、`requires:` で要求されたジョブが問題なく完了するまで、以下で図示しているように各ジョブの処理が待機する仕組みになっています。

![シーケンシャルジョブを実行する Workflow]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

下記で示した `config.yml` のコードは、シーケンシャルジョブの設定を施した Workflow の例です。

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
    

例にある通り、依存関係は `requires:` キーで定義されます。 `deploy:` ジョブは `build`、`test1`、`test2` という 3 つのジョブが無事完了するまで実行されません。 ジョブは依存関係にあるそれ以前の全ジョブの処理が完了するまで待つことになるため、 `deploy` ジョブは `test2` を待ち、`test2` ジョブは `test1` ジョブを待ち、そして`test1` ジョブは `build` ジョブを待つという構図になります。

これに関する実際の設定ファイルは [Sample Sequential Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) で確認できます。

### ファンイン・ファンアウト Workflow の例

{:.no_toc}

図示している例では、Workflow は最初に build ジョブを普通に実行し、並列動作する一連の `acceptance_test` ジョブを実行するファンアウトを行います。最終的には `deploy` ジョブを走らせるファンインで処理を終えます。

![ファンイン・ファンアウト Workflow]({{ site.baseurl }}/assets/img/docs/fan_in_out.png)

下記で示した `config.yml` のコードは、ファンイン・ファンアウトジョブの設定を施した Workflow の例です。

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
    

この例では、`build` ジョブが完了した後すぐに 4 つの `acceptance_test` ジョブがスタートします。 その後、 4 つの `acceptance_test` ジョブの完了を待って、`deploy` ジョブが実行されます。

実際の設定サンプルは [Sample Fan-in/Fan-out Workflow config](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out) で確認できます。

## 承認後に処理を続行する Workflow の例

Workflow では、`type: approval` キーを利用することで、ジョブを続行する前に手動の承認操作を待つ設定にすることも可能です。 `approval` は `workflow` キー配下のジョブに挿入できる**唯一**の特殊な type 属性です。 Workflow のなかで承認操作を待ちたい一連のジョブの前に `type: approval` を挿入することで設定が有効になります。 下記の `config.yml` の例にあるように、Workflow が `type: approval` キーを処理するまで、ジョブは順番通りに実行されます。

    workflows:
      version: 2
      build-test-and-approval-deploy:
        jobs:
          - build
          - test1:
              requires:
                - build
          - test2:
              requires:
                - test1
          - hold:
              type: approval
              requires:
               - test2
          - deploy:
              requires:
                - hold
    

この例では、CircleCI の Workflows ページで `hold` ジョブをクリックし、Approve をクリックしない限り `deploy:` ジョブは実行されません。 `hold` ジョブは、他のジョブで使われていない一意の名前を指定する必要があります。 ジョブと Approve をクリックするまで、Workflow は「ON HOLD」の状態で待機し、 `type: approval` が指定されたジョブを承認すれば、そのジョブがスタートします。 上の例はデプロイ開始の承認を待つことを目的としています。 この動作実現には、`hold` ジョブを `type: approval` とし、`deploy` ジョブが `hold` ジョブ を `require` するようにします。

スクリーンショット： `request-testing` ジョブの承認を待つ Workflow 。

![ジョブの承認で処理を続行する Workflow]({{ site.baseurl }}/assets/img/docs/approval_job.png)

また、下記は `request-testing` ジョブをクリックしたときに現れる承認ダイアログのスクリーンショットです。

![Workflow が一時停止された時の承認ダイアログ]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## Workflow をスケジュール実行する

It can be inefficient and expensive to run a workflow for every commit for every branch. Instead, you can schedule a workflow to run at a certain time for specific branches. This will disable commits from triggering jobs on those branches.

膨大なリソースを使用する Workflow、あるいは `triggers` キーを利用してコミット時以外にも定期的にリポートを生成するような Workflow を考えてみます。 `triggers` キーを挿入できるのは `workflows` キーの配下**のみ**となります。 この機能は、指定したブランチについて、協定世界時 (UTC) を扱う `cron` コマンドの構文で Workflow の実行をスケジューリングできるようにします。

### 夜間に実行する例

{:.no_toc}

デフォルトでは、Workflow は `git push` するたびに実行されます。一方、Workflow をスケジュール実行するには、`triggers` キーを Workflow に追加して、`schedule` を指定します。

下記は、`nightly` という Workflow が毎日午前 12 時 00 分 (UTC) に実行されるよう設定した例です。 The `cron` key is specified using POSIX `crontab` syntax, see the [crontab man page](https://www.unix.com/man-page/POSIX/1posix/crontab/) for `cron` syntax basics. この例では、Workflow は `master` と `beta` のブランチにおいてのみ実行されます。

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

このなかで `commit` という名前の Workflow には `triggers` がありません。そのため、この部分は `git push` するたびに実行されます。 `nightly` の Workflow には `triggers` があり、指定した`スケジュールに沿って`実行されます。

### スケジュール設定における注意点

{:.no_toc}

`schedule` 配下では、`cron` キー と `filters` キーを指定する必要があります。

`cron` キーの値は [valid crontab entry](https://crontab.guru/) にある通りに指定しなければなりません。

**注**：Cron のステップ値 (`*/1` や `*/20` など) には**対応していません**。

`filters` キーの値は、所定のブランチの実行ルールを定義する内容とします。

詳しくは [CircleCI 設定リファレンス]({{ site.baseurl }}/2.0/configuration-reference/#branches-1)ページの `branches` を参照してください。

実際の設定サンプルは [Sample Scheduled Workflows configuration](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml) で確認できます。

## Workflow でのコンテキストとフィルターの使い方

次のセクションではジョブの実行を管理するコンテキストとフィルターの使い方を解説しています。

### 環境変数を共有するジョブコンテキストの使い方

{:.no_toc}

下記は、環境変数の共有を可能にするコンテキストを使った 4 つのシーケンシャルジョブを含む Workflow の例です。 詳しい設定手順は[コンテキスト]({{ site.baseurl }}/2.0/contexts)で確認できます。

下記で示した `config.yml` のコードは、`org-global` コンテキストで定義したリソースを使う設定を施した、シーケンシャルジョブ Workflow の例です。

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
    

この例では、環境変数はデフォルト名の `org-global` としている `context` キーを設定することで定義されます。 Workflows にある `test1` と `test2` のジョブは、組織に属するユーザーが初期化した際に同じ共有環境変数を使います。 通常は、組織が管理している全プロジェクトがその組織の一連のコンテキストにアクセスすることになります。

### 枝分かれしたジョブの実行

{:.no_toc}

下記は、Dev、Stage、Pre-Prod という 3 つのブランチにおけるジョブを設定した Workflow の例です。 Workflow は `jobs` 配下でネストしている `branches` キーを無視します。そのため、ジョブレベルでブランチを宣言して、その後に Workflow を追加する場合には、下記の `config.yml` にあるように、ジョブレベルにあるブランチを削除し、workflows セクションで宣言しなければなりません。

![枝分かれしたジョブの実行]({{ site.baseurl }}/assets/img/docs/branch_level.png)

下記で示した `config.yml` ファイルのコードは、ブランチレベルのジョブ実行の設定を施した Workflow の例です。

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

For more information on regular expressions, see the [Using Regular Expressions to Filter Tags And Branches](#using-regular-expressions-to-filter-tags-and-branches) section below. For a full example of workflows, see the [configuration file](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) for the Sample Sequential Workflow With Branching project.

### Executing Workflows for a Git Tag

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

**Note:** Webhook payloads from GitHub [are capped at 5MB](https://developer.github.com/webhooks/#payloads) and [for some events](https://developer.github.com/v3/activity/events/types/#createevent) a maximum of 3 tags. If you push several tags at once, CircleCI may not receive all of them.

### Using Regular Expressions to Filter Tags and Branches

{:.no_toc}

CircleCI branch and tag filters support the Java variant of regex pattern matching. When writing filters, CircleCI matches exact regular expressions.

For example, `only: /^config-test/` only matches the `config-test` tag. To match all tags starting with `config-test`, use `only: /^config-test.*/` instead. Using tags for semantic versioning is a common use case. To match patch versions 3-7 of a 2.1 release, you could write `/^version-2\.1\.[3-7]/`.

For full details on pattern-matching rules, see the [java.util.regex documentation](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

## ジョブ間でデータ共有を可能にする Workspace の使い方

各 Workflow は、後で実行されるジョブにファイルを渡すことのできる Workspace を、その Workflow に関連付けた形で保持しています。 Workspace ではデータの追加保存のみが可能で、 ジョブは Workspace に永続的にデータを保管しておけます。 この設定を行うとデータをアーカイブし、コンテナの外に新たなレイヤーを生成します。 後で実行されるジョブは、Workspace を通じてそのコンテナのファイルシステムにアクセスできるということです。 下記のイラストは、Workspace 内に保管されたファイルへのアクセスと、ジョブの順序を表すレイヤーの展開図を説明しているものです。

![Workspace のデータフロー]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Workspaces.png)

そのジョブ固有の動作を行ったり、後のジョブで必要になるデータを渡したりするのに Workspace を使います。 複数のブランチでジョブを実行するようなワークフローでは、Workspace を利用してデータを共有する必要に迫られることがあります。 また、テストコンテナで使われるコンパイル済みデータを含むプロジェクトにも Workspace は役立ちます。

例えば、Scala のプロジェクトはビルドジョブにおけるコンパイルの部分で多くの CPU リソースを消費します。 一方、Scala のテストジョブは CPU 負荷が高いとは言えず、複数コンテナを並行処理しても問題ないほどです。 ビルドジョブに大きなコンテナを使い、Workspace にコンパイル済みデータを保存しておくことで、ビルドジョブで作成したコンパイル済みの Scala をテストコンテナで使うことが可能になります。

もう 1 つの例は、JAVA アプリケーションをビルドし、その jar ファイルを Workspace に保存する `build` ジョブを含むプロジェクトです。 jar を用いてテストを並行処理するために、`build` ジョブは `integration-test`、`unit-test`、`code-coverage` にファンアウトするとします。

ジョブで作られたデータを保存して他のジョブでも使えるよう、`persist_to_workspace` キーをジョブに追加します。 `persist_to_workspace` の `paths:` プロパティに記述されたディレクトリ・ファイルは、`root` キーで指定しているディレクトリの相対パスとなる一時 Workspace にアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

`attach_workspace` キーをセットして、保存されたデータを取得できるようにします。 下記の `config.yml` ファイルでは 2 つのジョブ、`flow` ジョブで作られたリソースを使う `downstream` ジョブ、を定義しています。 Workflow はシーケンシャルのため、`downstream` ジョブの処理がスタートする前に `flow` ジョブが終了していなければなりません。

     # 以降の一連のコードでは、YAML のマージ記号（<<: *）を使って、
     # 後でタイプした文字列を保存するために defaults という名前で値をマッピングします。
     # マージについての詳細は http://yaml.org/type/merge.html を参照してください。
    
    defaults: &defaults
      working_directory: /tmp
      docker:
        - image: buildpack-deps:jessie
    
    version: 2
    jobs:
      flow:
        <<: *defaults
        steps:
          - run: mkdir -p workspace
          - run: echo "Hello, world!" > workspace/echo-output
    
          # 以降のジョブで使えるよう、指定のパス (workspace/echo-output) をWorkspace に保存します 
          - persist_to_workspace:
              # working_directory からの相対パスか絶対パスを指定します 
              # これは Workspace のルートディレクトリとなるコンテナ内のディレクトリです
              root: workspace
              # ルートからの相対パスを指定します
              paths:
                - echo-output
    
      downstream:
        <<: *defaults
        steps:
          - attach_workspace:
              # working_directory からの相対パスか絶対パスを指定します
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
    

**注**：1 行目の`defaults:` キーの部分は任意で名前をつけられます。 新しい名前でキーを作るのはもちろん、再利用しやすい設定キーにするために、`&name` のような参照名で定義することも可能です。

ビルドジョブとデプロイジョブの間でデータをやりとりする Workspace を活用する生きたサンプルとして、CircleCI マニュアルのビルドを構成している [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) も参考にしてください。 Workspace、キャッシュ、アーティファクトの使用における概念がわかる情報として、ブログページ [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) もチェックしてみてください。

## Workflow で失敗したジョブの再実行の仕方

Workflow を利用すると、ビルドの失敗に迅速に対応できるようになります。 その際、Workflow のなかで**失敗した**ジョブのみを再実行するには、CircleCI 上で **WORKFLOWS** アイコンをクリックし、目的の Workflow を選んでジョブごとのステータスを表示します。さらに、**Rerun** ボタンをクリックして **Rerun from failed** を選びます。

![CircleCI の Workflow ページ]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング

ここでは Workflow に関する一般的な問題とその解決方法について解説しています。

### Workflow がスタートしない

{:.no_toc}

Workflow を設定しているときに新しいジョブが表示されなくなった場合、`config.yml` の記述にエラーがあると考えられます。

Workflow がトリガーされないときは、設定エラーが原因で Workflow の実行が妨げられることがよくあります。結果的に、Workflow がジョブをスタートしないことになります。

Workflow の設定を行っているときは、その設定に問題がないか CircleCI の Workflow ページ (ジョブページでは*ありません*) をたびたび確認するとよいでしょう。

プロジェクトのジョブページは下記のような URL になっています。

`https://circleci.com/:VCS/:ORG/:PROJECT`

また、Workflow ページは下記のような URL となっています。

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

この Workflow ページで、黄色地に「Needs Setup」という文字が表示されていないか確認してください。

![Workflow の誤った設定例]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)

### Workflow の処理中に GitHub で待機状態のままになる

{:.no_toc}

GitHub リポジトリのブランチに実装済みの Workflow があり、かつステータスチェックの処理が終わらないときは、GitHub のステータス設定で解除した方が良い項目があるかもしれません。 例えば、「Protect this branches」をオンにしている場合、以下のスクリーンショットにあるように、ステータスチェックの設定対象から `ci/circleci` を外す必要があります。この項目は古い CircleCI 1.0 のデフォルト設定になっていたものです。

![GitHub ステータスキーのチェックを外す]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

`ci/circleci` のチェックボックスがオンになっていると、Workflow 使用時に GitHub での処理完了を表すステータス表示に問題が出ることがあります。原因は、名前で区別したジョブを含むキーと合わせて CircleCI がステータスを GitHub にポストするためです。

この設定を解除するには、GitHub の Setting ページから Branches にアクセスし、保護されたブランチの Edit ボタンクリックします。該当のページは https://github.com/your-org/project/settings/branches といった URL になっています。

## その他の参考資料

{:.no_toc}

- CircleCI 1.0 の `circle.yml` ファイルから CircleCI 2.0 の `.circleci/config.yml` ファイルへ移行する際の Workflow の設定方法を知りたい場合は、2.0 移行マニュアルの [Workflow 設定の手順]({{ site.baseurl }}/2.0/migrating-from-1-2/)をご覧ください。

- Workflow に関するよくある質問は、FAQ ページの [Workflow]({{ site.baseurl }}/2.0/faq) セクションを参照してください。

- Workflow を使ったデモアプリは、GitHub の [CircleCI Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows) から入手できます。

- Workflow の処理中に GitHub で待機状態のままになってしまう問題を解決するには、[GitHub で Workflow が待機状態になる問題]({{ site.baseurl }}/2.0/workflows-waiting-status) を参照してください。

## 動画：Workflow を使った複数ジョブの設定

{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe> 

### 動画：テストとデプロイを自動実行するビルドのスケジューリング方法

{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>