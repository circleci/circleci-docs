---
layout: classic-docs
title: "ワークフローを使用したジョブのスケジュール"
short-title: "ワークフローを使用したジョブのスケジュール"
description: "ワークフローを使用したジョブのスケジュール"
order: 30
version:
  - Cloud
  - Server v2.x
suggested:
  - 
    title: Manual job approval and scheduled workflow runs
    link: https://circleci.com/blog/manual-job-approval-and-scheduled-workflow-runs/
  - 
    title: Filter workflows by branch
    link: https://support.circleci.com/hc/en-us/articles/115015953868?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - 
    title: How to trigger a workflow
    link: https://support.circleci.com/hc/en-us/articles/360050351292?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - 
    title: Conditional workflows
    link: https://support.circleci.com/hc/en-us/articles/360043638052-Conditional-steps-in-jobs-and-conditional-workflows
---

ワークフローを使用すれば、迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用が可能で、ソフトウェア開発のスピードアップに役立ちます。 ここでは、以下のセクションに沿って、ワークフロー機能について説明し、構成例を紹介します。

* 目次
{:toc}

## 概要
{: #overview }

**ワークフロー** は、ジョブの集まりとその実行順序の定義に関するルールを決めるものです。 ワークフローを使用すると、単純な設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。

ワークフローにより以下のことが可能になります。

- リアルタイムのステータス フィードバックによって、ジョブの実行とトラブルシューティングを分離する
- 定期的に実行したいジョブをワークフローとしてスケジュールする
- 複数のジョブをファンアウトして同時実行し、バージョン テストを効率的に行う
- ファンインして複数のプラットフォームにすばやくデプロイする

ワークフロー内の 1 つのジョブのみが失敗した場合は、その失敗をリアルタイムに確認できます。 そのため、ビルド全体が失敗に終わるのを待ってからジョブ セット全体を再実行するといった時間の無駄をなくし、*失敗したジョブのみ*を再実行することが可能になります。

### ステータス
{: #states }
{:.no_toc}

ワークフローのステータスには以下の種類があります。

| ステータス       | 説明                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| RUNNING     | ワークフローが実行されている                                                                                                  |
| NOT RUN     | ワークフローが起動されていない                                                                                                 |
| CANCELLED   | ワークフローが終了前にキャンセルされた                                                                                             |
| FAILING     | ワークフロー内の 1 つのジョブが失敗した                                                                                           |
| FAILED      | ワークフロー内の 1 つ以上のジョブが失敗した                                                                                         |
| SUCCESS     | ワークフロー内のすべてのジョブが正常に完了した                                                                                         |
| ON HOLD     | ワークフロー内のジョブが承認待ちになっている                                                                                          |
| NEEDS SETUP | このプロジェクトの [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) ファイル内に workflows スタンザが含まれていないか、または正しくない |
{: class="table table-striped"}


### 制限事項
{: #limitations }
{:.no_toc}

* CircleCI API を使用してワークフローをトリガーできるのは、パイプラインが有効化されているプロジェクトのみです。
* 設定ファイルにワークフローを含めない場合は、`build` という名前のジョブを含める必要があります。

その他の詳細と制限事項については、「よくあるご質問」の[ワークフロー]({{ site.baseurl }}/ja/2.0/faq/#workflows) セクションを参照してください。

## ワークフローの構成例
{: #workflows-configuration-examples }

__ `workflows` _キーに関する詳しい説明は、CircleCI の設定に関するドキュメントの [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) セクションを参照してください。_

**注:** ワークフローを使用してプロジェクトを構成する場合、 Docker イメージ、環境変数、`run` ステップなどの構文を複数のジョブで共有することがよくあります。 `.circleci/config.yml` のコードをコンパクトにするエイリアスの使い方や構文の再利用方法については [YAML Anchors/Aliases](http://yaml.org/spec/1.2/spec.html#id2765878) でご確認ください。 また、ブログページの [CircleCI の設定における YAML ファイルの再利用](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)も参考にしてください。

複数のジョブを同時に実行するには、既存の `.circleci/config.yml` ファイルの末尾に新しい `workflows:` セクションを追加し、バージョンとワークフローの一意名を指定します。 以下の `.circleci/config.yml` ファイルは、2 つの同時実行ジョブから成るデフォルトのワークフロー オーケストレーションの例です。 これは、`build_and_test` という名前の `workflows:` キーを使用し、ジョブ名のリストから成る `jobs:` キーをネストすることによって定義されています。 依存関係が定義されていないため、これらのジョブは同時に実行されます。

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
このサンプルの全文は、 [並行ワークフローの設定例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) でご覧いただけます。

## 高度な構成のヒント
{: #tips-for-advanced-configuration }

ワークフローを使用すると、単一のジョブ セットを実行するよりも格段に高度な構成を作成できます。 しかし、カスタマイズと制御の範囲が広がると、エラーのリスクも高まります。 ワークフローを使用するときは、以下の点を考慮してください。

- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前よりも先に実行することをお勧めします。
- ワークフローの_先頭_に setup ジョブを実行すると、事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備にも役立ちます。

設定ファイルを改善するためのヒントについては、「[最適化]({{ site.baseurl }}/ja/2.0/optimizations)」と「[高度な設定ファイル]({{ site.baseurl }}/ja/2.0/adv-config)」を参照してください。

### 順次ジョブ実行の例
{: #sequential-job-execution-example }
{:.no_toc}

以下の例は、4 つの順次ジョブから成るワークフローを示しています。 ジョブは、構成された要件に従って実行されます。 図に示すように、各ジョブは必要なジョブが正常に終了してから開始されます。

![順次ジョブを実行するワークフロー]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

このサンプルの全文は、[順次ワークフローの設定例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)でご覧いただけます。

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

ここに示されているように、依存関係は `requires:` キーを設定することで定義します。 `deploy:` ジョブは、`build`、`test1`、`test2` の各ジョブが正常に完了するまで実行されません。 ジョブは、依存関係グラフ内のすべてのアップストリーム ジョブが実行を完了するまで待機する必要があります。 したがって、`deploy` ジョブは `test2` ジョブを待ち、`test2` ジョブは `test1` ジョブを待ち、`test1` ジョブは `build` ジョブを待ちます。

下記で示した `config.yml` のコードは、順次ジョブの設定を施した ワークフローの例です。

### ファンアウト/ファンイン ワークフローの例
{: #fan-outfan-in-workflow-example }
{:.no_toc}

以下に示すワークフローの例では、共通のビルド ジョブを実行し、次にファンアウトして一連の受け入れテスト ジョブを同時に実行し、最後にファンインして共通のデプロイ ジョブを実行します。

![ファンイン/ファンアウト ワークフロー]({{ site.baseurl }}/assets/img/docs/fan-out-in.png)

以下の `config.yml` スニペットは、ファンアウト/ファンイン ジョブの実行を設定するワークフローの例を示しています。

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
この例では、`build` ジョブが完了した後すぐに 4 つの `acceptance_test` ジョブがスタートします。 その後、 4 つの `acceptance_test` ジョブの完了を待って、`deploy` ジョブが実行されます。

このサンプルの全文は、[ファンイン・ファンアウトのワークフローの設定例](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out)でご覧いただけます。

## 手動承認後に処理を続行するワークフロー
{: #holding-a-workflow-for-a-manual-approval }

ジョブが手動承認されてから次のジョブを続行するようにワークフローを設定できます。 リポジトリへのアクセスをプッシュしたユーザーはどなたでも、[Approval (承認)] ボタンをクリックしてワークフローを続行できます。 それには、`type: approval` キーを指定したジョブを `jobs` リストに追加します。 コメント付きの設定ファイルを例に説明します。

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

上の例を実行した場合、CircleCI アプリケーションのワークフローのページで `hold` ジョブをクリックし、[Approve (承認)] をクリックするまで、`deploy:` ジョブは実行されません。 この例の `hold` ジョブの目的は、承認されるまでデプロイの開始を待つことです。 ジョブの承認期限は、発行から 90 日間です。 However, workspaces expire after 15 days, so if the jobs after the hold job utilize workspaces, the effective approval time-limit is 15 days.

ワークフローで手動承認を使用する場合は、以下の点に注意する必要があります。

- `approval` は、`workflow` キーの下にあるジョブで**のみ**使用できる特別な種類のジョブです。
- `hold` ジョブは、他のジョブで使用されていない一意の名前である必要があります。
- つまり、上の例の `build` や `test1` など、カスタム構成されたジョブに `type: approval` キーを指定することはできません。
- 保留するジョブの名前は任意で、例えば、 `wait` や `pause`などでもよく、ジョブの中に `type: approval` というキーがあればよいのです。
- 手動承認を行うジョブの後に実行するすべてのジョブには、そのジョブの名前を `require:` で_指定する必要があります_。 上の例の `deploy:` ジョブを参照してください。
- ワークフローで `type: approval` キーを持つジョブと、そのジョブが依存するジョブが処理されるまでは、ジョブは定義された順序で実行されます。

以下のスクリーンショットは、保留中のワークフローを示しています。

{:.tab.switcher.Cloud}
![保留中のワークフローの承認ジョブ]({{ site.baseurl }}/assets/img/docs/approval_job_cloud.png)

{:.tab.switcher.Server_3}
![保留中のワークフローの承認待ちジョブ]({{ site.baseurl }}/assets/img/docs/approval_job_cloud.png)

{:.tab.switcher.Server_2}
![組織の切り替えメニュー]({{ site.baseurl }}/assets/img/docs/approval_job.png)


保留中のジョブの名前 (上記のスクリーンショットでは `build`) をクリックすると、保留中のジョブの承認またはキャンセルを求める承認ダイアログ ボックスが表示されます。

承認後、設定ファイルでの指示に従って残りのワークフローが実行されます。

## ワークフローのスケジュール実行
{: #scheduling-a-workflow }

すべてのブランチで、コミットのたびにワークフローを実行するのは、非効率的でコストもかさみます。 代わりに、特定のブランチに対して特定の時刻にワークフローを実行するようにスケジュールを設定できます。 この機能を使った場合は、そのブランチにおけるトリガーとなるジョブからのコミットは無効となります。

リソースに高い負荷がかかるワークフローや、レポートを生成するワークフローは、コミットのたびに実行するのではなく、設定ファイルに `triggers` キーを追加してスケジュールに沿って実行することを検討してください。 `triggers` キーは、`workflows` キーの下に**のみ**追加できます。 この機能により、指定したブランチについて、協定世界時 (UTC) を表す `cron` 構文で ワークフローの実行をスケジューリングすることができます。

**注:** CircleCI v2.1 では、設定ファイルにワークフローが指定されていない場合、暗黙的なワークフローが使用されます。 しかし、ビルドをスケジュール実行するワークフローを宣言すると、暗黙的なワークフローは実行されなくなります。 コミットごとにもビルドを行うには、設定ファイルにジョブ ワークフローを追加する必要があります。

**注:** ワークフローをスケジュール実行する場合、そのワークフローは個別のユーザー シートとしてカウントされます。

### 夜間に実行する例
{: #nightly-example }
{:.no_toc}

デフォルトでは、`git push` ごとにワークフローがトリガーされます。 スケジュールに沿ってワークフローをトリガーするには、ワークフローに `triggers` キーを追加し、`schedule` を指定します。

下記は、`nightly` というワークフローが毎日午前 0 時 (UTC) に実行されるよう設定した例です。 `cron` キーは POSIX 規格の `crontab` の構文で表記します。 `cron` の書き方については [Crontabのマニュアル](https://www.unix.com/man-page/POSIX/1posix/crontab/) を参照してください。 以下の例では、ワークフローは `master` と `beta` のブランチにおいてのみ実行されます。

**注:** ワークフローのスケジュール実行は、最大 15 分遅れることがあります。 これは、午前 0 時 (UTC) などの混雑時の信頼性を維持するために実施されます。 スケジュールが設定されたワークフローが分単位の正確性で開始されることを想定しないようにご注意ください。

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

### 有効なスケジュールの指定
{: #specifying-a-valid-schedule }
{:.no_toc}

有効な `schedule` には、`cron` キーと `filters` キーが必要です。

`cron` キーの値は [valid crontab entry](https://crontab.guru/) にある通りに指定しなければなりません。

**注:** cron のステップ構文 (`*/1` や `*/20`) は**サポートされません**。 エレメントのカンマ区切りリスト内では、範囲エレメントは**サポートされません**。 曜日の範囲エレメント (例: `Tue-Sat`) も**サポートされません**。 代わりに、カンマ区切りの数字を使用してください。


**無効**な cron の範囲構文の例:

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3-5,6" # < "-" は無効な範囲区切り文字です。
```

**有効**な cron の範囲構文の例:

```yaml
    triggers:
      - schedule:
          cron: "5 4 * * 1,3,4,5,6"
```

`filters` キーの値には、特定ブランチ上の実行ルールを定義するマップを指定します。

詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/2.0/configuration-reference/#branches-1)の`branches `セクションを参照してください。

設定例の全文については、 [スケジュール設定されたワークフローのサンプル](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml)を参照してください。

## ワークフローにおけるコンテキストとフィルターの使用
{: #using-contexts-and-filtering-in-your-workflows }

次のセクションではジョブの実行を管理するコンテキストとフィルターの使い方を解説しています。

### ジョブ コンテキストを使用して環境変数を共有する
{: #using-job-contexts-to-share-environment-variables }
{:.no_toc}

下記は、環境変数の共有を可能にするコンテキストを使った 4 つの順次ジョブを含む ワークフローの例です。 詳しい設定手順は[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)で確認できます。

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

この例では、環境変数はデフォルト名の `org-global` にように `context` キーを設定することで定義されます。 この例のワークフローにある `test1` と `test2` のジョブは、組織に属するユーザーが初期化した際に同じ共有環境変数を使います。 デフォルトでは、組織が管理している全プロジェクトがその組織の一連のコンテキストにアクセスできます。

### ブランチレベルでジョブを実行する
{: #branch-level-job-execution }
{:.no_toc}

下記は、Dev、Stage、Pre-Prod という 3 つのブランチにおけるジョブを設定したワークフロー の例です。 ワークフローは `jobs` 配下でネストしている `branches` キーを無視します。 そのため、ジョブレベルでブランチを宣言して、その後に ワークフローを追加する場合には、下記のように、ジョブレベルにあるブランチを削除し、`config.yml`のワークフローセクションで宣言しなければなりません。

![ブランチレベルでジョブを実行する]({{ site.baseurl }}/assets/img/docs/branch_level.png)

以下の `config.yml` スニペットは、ブランチレベルのジョブ実行を設定するワークフローの例です。

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
{:.no_toc}

CircleCI は明示的にタグフィルターを指定しない限り、タグに対してワークフローは実行しません。 さらに、ジョブが (直接的または間接的に) 他のジョブを必要とする場合は、[正規表現を使用](#using-regular-expressions-to-filter-tags-and-branches)して、それらのジョブに対応するタグ フィルターを指定する必要があります。 CircleCI では軽量版と注釈付き版のどちらのタグにも対応しています。

以下の例では、2 つのワークフローが定義されています。

- `untagged-build`: すべてのブランチに対して `build` ジョブを実行します。
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

以下の例では、`build-test-deploy` ワークフローで 3 つのジョブを定義しています。

- `build`: すべてのブランチおよび "config-test" で始まるタグに対してのみ実行されます。
- `test`: すべてのブランチおよび "config-test" で始まるタグに対してのみ実行されます。
- `deploy`: ブランチに対しては実行されず、"config-test" で始まるタグに対してのみ実行されます。

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
  build: # "main" を除くすべてのブランチに対して実行されます。 タグに対しては実行されません
    jobs:
      - test:
          filters:
            branches:
              ignore: main
  staging: # "main" のみに対して実行されます。 タグに対しては実行されません。
    jobs:
      - test:
          filters: &filters-staging # この YAML アンカーでこの値を"filters-staging" に設定しています。
            branches:
              only: main
            tags:
              ignore: /.*/
      - deploy:
          requires:
            - build
          filters:
            <<: *filters-staging # 上記で設定した YAML アンカーを呼び出します。
  production: # このワークフローはタグに対してのみ実行されます（具体的には"v"で始まるタグ）。 ブランチに対しては実行されません。
    jobs:
      - test:
          filters: &filters-production # この YAML アンカーで次の値を "filters-production" に設定しています。
            branches:
              ignore: /.*/
            tags:
              only: /^v.*/
      - deploy:
          requires:
            - build
          filters:
            <<: *filters-production # 上記で設定した YAML アンカーを呼び出します。
```

**注:** GitHub からの Web フック ペイロードは、[上限が 5MB](https://developer.github.com/webhooks/#payloads) に設定されており、[一部のイベント](https://developer.github.com/v3/activity/events/types/#createevent)は最大 3 つのタグに制限されます。 それ以上のタグを一度にプッシュしても、CircleCI は全てを受け取ることはできません。

### 正規表現を使用してタグとブランチをフィルタリングする
{: #using-regular-expressions-to-filter-tags-and-branches }
{:.no_toc}

CircleCI のブランチおよびタグ フィルターは、Java 正規表現パターン マッチのバリアントをサポートしています。 フィルターを記述した場合、CircleCI では正規表現と正確に一致させます。

たとえば、`only: /^config-test/` は `config-test` タグにのみ一致します。 `config-test` で始まるすべてのタグに一致させるには、代わりに `only: /^config-test.*/` を使用します。

よくあるのは、セマンティック バージョニングに対してタグを利用するケースです。 2.1 リリースのパッチ バージョン 3 ～ 7 と一致させるには、`/^version-2\.1\.[3-7]/` と記述します。

パターンを一致させるルールの詳細については、[java.util.regex のドキュメント](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html)を参照してください。

## ワークスペースによるジョブ間のデータ共有
{: #using-workspaces-to-share-data-among-jobs }

どのワークフローにも必ず、ワークフローの進捗に伴ってダウンストリームジョブにファイルを転送するために使用される Workspace というものが割り当てられます。 Workspace ではデータの追加保存のみが可能で、 ジョブは Workspace に永続的にデータを保管しておけます。 この設定を行うとデータをアーカイブし、コンテナの外に新たなレイヤーを生成します。 ダウンストリーム ジョブは、そのコンテナのファイル システムにワークスペースをアタッチできます。 Workspace をアタッチすると ワークフローグラフ内のアップストリーム ジョブの順序に基づいて、各レイヤーがダウンロードされアンパッケージ化されます。

![Workspaceのデータフロー]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

そのジョブ固有の動作を行ったり、後のジョブで必要になるデータを渡したりするのに Workspace を使います。 複数のブランチでジョブを実行するようなワークフローでは、Workspace を利用してデータを共有する必要がある場合があります。 また、テストコンテナで使われるコンパイル済みデータを含むプロジェクトにも Workspace は役立ちます。

例えば、Scala のプロジェクトは通常ビルドジョブにおけるコンパイルの部分で多くの CPU リソースを消費します。 一方、Scala のテストジョブは CPU 負荷が高いとは言えず、複数コンテナを並行処理しても問題ないほどです。 ビルドジョブに大きなコンテナを使い、Workspace にコンパイル済みデータを保存しておくことで、ビルドジョブで作成したコンパイル済みの Scala をテストコンテナで使うことが可能になります。

もう 1 つの例は、JAVA アプリケーションをビルドし、その jar ファイルを Workspace に保存する `build` ジョブを含むプロジェクトです。 この `build` ジョブは、`integration-test`、`unit-test`、`code-coverage` にファンアウトし、jar を使用してこれらのテストを同時に実行します。

ジョブで作られたデータを保存して他のジョブでも使えるよう、`persist_to_workspace` キーを使うようにジョブを設定します。 `persist_to_workspace` の `paths:` プロパティに記述されたファイルやディレクトリは、`root` キーで指定しているディレクトリの相対パスとなる一時的な Workspace にアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および ワークフローの再実行時に) 利用できるようにします。

`attach_workspace` キーを設定して、保存されたデータを取得できるようにします。 下記の `config.yml` ファイルでは 2 つのジョブ、`flow` ジョブで作られたリソースを使う `downstream` ジョブ、を定義しています。 ワークフローの設定は順次なので、`downstream` ジョブの処理がスタートする前に `flow` ジョブが終了していなければなりません。

```yaml
# 以下のスタンザは、CircleCI 2.1 を使用して再利用可能な Executor を使用していることに注意してください
# これにより、ジョブ間で再利用される Docker イメージを定義できます。
# 詳細は、https://circleci.com/ja/docs/2.0/reusing-config/# 再利用可能な Executor のオーサリング を参照してください。

version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: /tmp

jobs:
   flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # ダウンストリーム ジョブ用に、指定したパス (workspace/echo-output) を Workspace に維持します。
      - persist_to_workspace:
          #  絶対パス、または working_directory からの相対パスで指定する必要があります。 これは、コンテナ上のディレクトリで、
           # ワークスペースのルート ディレクトリと見なされます。
          これは、コンテナ上のディレクトリで、
           # ワークスペースのルート ディレクトリと見なされます。
                    root: workspace
          # ルートからの相対パスを指定する必要があります。
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # 絶対パスまたは working_directory からの相対パスを指定する必要があります。
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

ワークスペースを使用してビルド ジョブとデプロイ ジョブの間でデータを受け渡す実際の例については、CircleCI ドキュメントをビルドするように設定された [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) を参照してください。

ワークスペース、キャッシュ、およびアーティファクトの使用に関する概念的な情報については、ブログ記事「[ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## ワークフロー内の失敗したジョブの再実行
{: #rerunning-a-workflows-failed-jobs }

ワークフローを利用すると、ビルドの失敗に迅速に対応できるようになります。 ワークフローの中の**失敗した**ジョブのみを再実行するには、CircleCI で **[Workflows (ワークフロー)]** アイコンをクリックし、目的のワークフローを選んでジョブごとのステータスを表示してから、**[Rerun (再実行)]** ボタンをクリックして **[Rerun from failed (失敗からの再実行)]** を選びます。

![CircleCI のワークフローのページ]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング
{: #troubleshooting }

ここではワークフローに関する一般的な問題とその解決方法について解説しています。

### ワークフローと後続のジョブがトリガーされない
{: #workflow-and-subsequent-jobs-do-not-trigger }

ワークフローがトリガーされないのは、主に設定エラーによってワークフローの起動が妨げられていることが原因です。 そのため、ワークフローがジョブを開始しない事態が発生します。 プロジェクトのパイプラインに移動し、ワークフロー名 をクリックして、何が失敗しているかを確認します。

### ワークフローの再実行が失敗する
{: #rerunning-workflows-fails }
{:.no_toc}

(パイプラインの処理中に) ワークフローを実行する前にエラーが発生する場合があることがわかっています。 この場合、停止する前は正しく動作していたワークフローでも、再実行すると失敗します。 これを回避するには、プロジェクトのリポジトリに変更をプッシュします。 これにより、最初にパイプライン処理が再実行されてからワークフローが実行されます。

### GitHub でワークフローがステータスを待機する
{: #workflows-waiting-for-status-in-github }
{:.no_toc}

GitHub リポジトリのブランチに実装済みのワークフローがあるのにステータスチェックの処理が終わらないときは、GitHub のステータス設定で解除したほうが良い項目があるかもしれません。 例えば、「Protect this branches」をオンにしている場合、以下のスクリーンショットにあるように、ステータスチェックの設定対象から `ci/circleci` を外す必要があります。 この項目は CircleCI 1.0 のデフォルト設定になっていたものです。

![GitHub ステータスキーのチェックを外す]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

ワークフローを使用している際に `ci/circleci` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。 これは、CircleCI が名前にジョブを含むキーを使用して GitHub にステータスを送信するためです。

GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例: https://github.com/your-org/project/settings/branches)。


## 関連項目
{: #see-also }
{:.no_toc}

- 1.0 `circle.yml` ファイルから 2.0 `.circleci/config.yml` ファイルへの移行時にワークフローを設定に追加する手順については、[1.0 から 2.0 への移行に関するドキュメント]({{ site.baseurl }}/ja/2.0/migrating-from-1-2/)の[ワークフローの設定手順]({{ site.baseurl }}/ja/2.0/migrating-from-1-2/)を参照してください。

- ワークフローに関するよくある質問と回答については、「[よくあるご質問]({{ site.baseurl }}/ja/2.0/faq)」の「ワークフロー」セクションを参照してください。

- ワークフローを使用して設定されたデモ アプリについては、GitHub で [CircleCI デモ ワークフロー](https://github.com/CircleCI-Public/circleci-demo-workflows)を参照してください。

## ビデオ: ワークフローに複数のジョブを設定する
{: #video-configure-multiple-jobs-with-workflows }
{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>

### ビデオ: 自動的にテストおよびデプロイを行うようビルドのスケジュールを設定する
{: #video-how-to-schedule-your-builds-to-test-and-deploy-automatically }
{:.no_toc} <iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
