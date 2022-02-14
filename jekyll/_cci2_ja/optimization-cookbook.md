---
layout: classic-docs
title: "CircleCI 最適化クックブック"
short-title: "最適化クックブック"
description: "最適化クックブック入門編"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

The *CircleCI Optimizations Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to optimize your **pipelines** (the mechanism for taking code changes to your customers). Pipeline optimizations that increase build speed and security have a positive impact an organization's overall development and operations KPIs.

The recipes in this guide will enable you to quickly and easily perform repeatable optimization tasks on the CircleCI platform.

* 目次
{:toc}

## はじめに
{: #introduction }

CircleCI プラットフォームを使用しているときに、パイプライン パフォーマンスに予期せぬ遅れが発生し、構造化されている重要な動作の実行性能に悪影響を及ぼす場合があります。 こうしたパフォーマンスのボトルネックは、パフォーマンス全体に影響するだけでなく、ワークフローやビルドの失敗の原因にもなります。 一見、軽微なトラブルのように思えますが、それぞれのボトルネックを解消するためにクレジットやリソース、時間などを費やすことになり、コストがかさんでしまいます。

## Using caching to optimize builds and workflows
{: #using-caching-to-optimize-builds-and-workflows }

ビルドとワークフローを最適化する一番の早道は、具体的なキャッシュ戦略を実践して、以前のビルドとワークフローで生成された既存のデータを利用できるようにすることです。 パッケージ管理アプリケーション (Yarn、Bundler など) を使用する場合でも、キャッシュ処理を手動で構成する場合でも、最も適正で効果的なキャッシュ戦略を用いることにより、パフォーマンス全体の向上を図ることができます。

ジョブで任意の時点のデータをフェッチする場合は、キャッシュを利用できる可能性があります。 一般的によく用いられるのが、パッケージ マネージャーや依存関係管理ツールです。 たとえば、プロジェクトで Yarn、Bundler、Pip などを利用すると、ジョブの実行中にダウンロードする依存関係は、ビルドのたびに再ダウンロードされるのではなく、後で使用できるようにキャッシュされます。

You can find an example of caching dependencies on the [Optimizations]({{site.baseurl}}/2.0/optimizations/#caching-dependencies) page. _Please note: Persisting data is project specific, and the examples on the Optimizations page are not meant to be copied and pasted into your own projects without some customization._

Because caching is a such a critical aspect of optimizing builds and workflows, you should first familiarize yourself with the [Caching]({{site.baseurl}}/2.0/caching/) page that describes caching, and how various strategies can be used to optimize your config.

## テスト パフォーマンスを改善する
{: #improving-test-performance }

CircleCI プラットフォームでテストを実行するには、テスト プロセスを最適化して、いかにクレジットの使用量を最小限に抑えながらテスト パフォーマンス全体と結果を改善するかを検討する必要があります。 テストによっては、非常に時間がかかったり、高いパフォーマンスが必要になったりします。そのため、テスト時間を短縮できれば、組織の目標達成に向けて大きな後押しとなります。

CircleCI プラットフォームでテストを行う際には、多様なテスト スイートやアプローチを採用できます。 CircleCI はテスト スイートに依存しませんが、以下の例 ([こちらのブログ記事](https://www.brautaset.org/articles/2019/speed-up-circleci.html)でこのテスト最適化ユース ケースについて説明している開発者から許可を得て改変) では、Django と CircleCI プラットフォームでテストを最適化する方法を説明します。

### Testing optimization on the CircleCI platform for a Python Django project
{: #testing-optimization-on-the-circleci-platform-for-a-python-django-project }
{:.no_toc}

一部の組織では、CircleCI を使用して、各変更をメイン ブランチにマージする前にテストを実行しています。 テストを高速化すると、フィードバック サイクルが速く回るようになり、自信を持ってコードを頻繁に配信できるようになります。 Python Django アプリケーションのワークフローの例を見てみましょう。CircleCI プラットフォームでテストを完了するのに 13 分以上かかっています。

テスト プロセスは以下のように表示されます。

![最適化する前のテスト最適化プロセス]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_1.png)

それでは、上図のテスト プロセスを細かく見て、テストの完了までにかかった時間を確認してみましょう。

テスト中には以下のステップが実行されました。

1. The build job created a Docker image, which contained only runtime dependencies.
2. The build job dumped the image to a file with `docker save`, and then persisted it in the workspace.
3. Two test jobs were run to restore the base image from the workspace.
4. The test jobs built on this base image to create an image with all the extra modules required to run the tests.
5. The test jobs started dependencies, and the tests were finally initiated.

通常、セットアップを 1 回実行してからファンアウト ステップを実行することは、リソース使用量を削減する方法として従来から用いられています。ただしこの例では、次のようにファンアウト ステップで非常にコストがかかっていることが判明しました。

- ビルド済みイメージをファイルにダンプする `docker save` の発行に、約 **30** 秒かかっている。
- ワークスペースへのイメージの保存に、さらに **60** 秒かかっている。
- 次に、テスト ジョブでワークスペースをアタッチしてベース イメージを読み込む処理に、さらに **30** 秒かかっている。
- テスト ジョブで `docker-compose` を実行して依存関係に従ってサービス (Redis、Cassandra、PostgreSQL) を開始するときに Machine Executor を使用しており、 Docker Executor と比較して起動時間に **30 ～ 60** 秒が余計にかかっている。
- ビルド ジョブのベース イメージにはランタイムの依存関係のみが含まれていたため、これを拡張してテスト用の依存関係を追加して Docker イメージをビルドする必要があり、 この処理にさらに **70** 秒かかっている。

このように、実質的にテストを実行していないセットアップの段階でかなりの時間がかかっています。 このプロセスでは、実際のテストが実行されるまでに 6.5 分を必要とし、さらにもう 1 つのテスト ジョブの実行までに 6.5 分を要していました。

### Test preparation optimization
{: #test-preparation-optimization }
{:.no_toc}

このワークフローのステップの実行に 13 分は長すぎるため、以下のアプローチが採用されました。

#### Changing the CI test workflow
{: #changing-the-ci-test-workflow }
{:.no_toc}

ベース イメージのビルドを行わないように、CI テスト ワークフローを変更しました。 テスト ジョブも変更し、`docker-compose` を使用するのではなく、CircleCI の Docker Executor に備わっているサービス コンテナ サポートを使用して補助サービスを起動するようにしました。 さらに、メイン コンテナから `tox` を実行して、依存関係のインストールとテストの実行を行うようにすることで、イメージを保存してワークスペースから復元するのに要していた時間を削減しました。 これにより、Machine Executor の起動にかかる余分なコストも削減されました。

#### Dependency changes
{: #dependency-changes }
{:.no_toc}

Dockerfile を使用するのではなく、CircleCI のプライマリ コンテナに依存関係をインストールすると、CircleCI のキャッシュ機能によって `virtualenv` の作成を高速化できる場合があります。

### Test execution optimization
{: #test-execution-optimization }
{:.no_toc}

これでテストの準備時間が短縮されました。次は、実際のテストの実行を高速化することも可能です。 たとえば、テストの実行後にデータベースを保持する必要がない場合もあります。 One way you could speed up testing is to replace the database image used for tests with an [in-memory Postgres image]({{site.baseurl}}/2.0/databases/#postgresql-database-testing-example) that does not save to disk. Another method you may wish to take is to [run your tests in parallel]({{site.baseurl}}/2.0/parallelism-faster-jobs/)/ instead of one-test-at-a-time.

これらの変更によってワークフロー全体の時間がどれだけ短縮されたかは下図のとおりです。

![最適化した後のテスト最適化プロセス]({{site.baseurl}}/assets/img/docs/optimization_cookbook_workflow_optimization_2.png)

ここまで見てきたように、1 つの変更だけでワークフロー全体の時間を短縮したわけではありません。 たとえば、時間の大部分がテストの準備に費やされていたら、テストを並列実行してもそれほどメリットはなかったでしょう。 ローカルの環境ではなく CircleCI プラットフォームでテストを実行することの違いを認識し、テストの準備と実行にいくつかの変更を加えることでテストの実行時間を改善できます。

## Test splitting to speed up pipelines
{: #test-splitting-to-speed-up-pipelines }

Pipelines are often configured so that each time code is committed a set of tests are run. Test splitting is a great way to speed up the testing portion of your CICD pipeline. Tests don't always need to happen sequentially; a suite of tests can be split over a range of test environments running in parallel.

Test splitting lets you intelligently define where these splits happen across a test suite: by name, by size etc. Using **timing-based** test splitting takes the timing data from the previous test run to split a test suite as evenly as possible over a specified number of test environments running in parallel, to give the lowest possible test time for the compute power in use.

![テストの分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

### Parallelism and test splitting
{: #parallelism-and-test-splitting }
{:.no_toc}

To illustrate this with CI config, take a sequentially running test suite – all tests run in a single test environment (docker container):

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

To split these tests, using timing data, we first intoduce parallelism to spin up a number (10 in this case) of identical test environments. Then use the `circleci tests split` command, with the `--split-by=timings` flag to split the tests as equally as possible across all environments, so the full suite runs in the shortest possible time.

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    parallelism: 10
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

**Note:** The first time the tests are run there will be no timing data for the command to use, but on subsequent runs the test time will be optimized.

### Is it worth it?
{: #is-it-worth-it }
{:.no_toc}

To give a quantitative illustration of the power of the split-by-timings feature, adding `parallelism: 10` on a test suite run across the CircleCI application project actually decreased the test time **from 26:11 down to 3:55**.

Test suites can also be split by name or size, but using timings-based test splitting gives the most accurate split, and is guaranteed to optimize with each test suite run; the most recent timings data is always used to define where splits happen. For more on this subject, take a look at our [using parallelism to speed up test jobs]({{site.baseurl}}/2.0/parallelism-faster-jobs/).

## Workflows increase deployment frequency
{: #workflows-increase-deployment-frequency }

Providing value to your customers is the top goal for any organization, and one can measure the performance of an organization by how often (frequency) value is delivered (deployment). High-performing teams deploy value to customers multiple times per day according to the DevOps Research and Assessment Report, 2019.

While many organizations deploy value to customer once per quarter or once per month, the basics of raising this frequency to once per week or once per day is represented by the same type of orchestration added to an organization's value *pipeline*.

To deploy multiple times per day, developers need an automated workflow that enables them to test their changes on a branch of code that matches exactly the environment of main, without being on the main branch. This is possible with the use of workflow orchestration in your continuous integration suite.

{%comment %}![Workflow without Deploy]({{ site.baseurl }}/assets/img/docs/workflows-no-deploy.png){%
endcomment %}

When you provide developers with a workflow that runs all of their tests in the main environment, but doesn't run a deploy, they can safely test and debug their code on a branch until all tests are passing.

{%comment %}![Workflow with Deploy]({{ site.baseurl }}/assets/img/docs/workflows-yes-deploy.png){%
endcomment %}

A workflow that runs all tests *as if they were on main* gives developers the confidence they need to merge to main knowing their code will not break or cause an outage or interruption to service for customers. The small investment in configuring such a workflow is well-worth the increase in deployment frequency of valuable changes to your customers.

A simple example would configure deployment to run *only* if a change is merged to main and the test jobs have already passed.

For an organization deploying multiple times per day, that configuration may be as simple as the following snippet of YAML:

```yaml
workflows:
  build-test-deploy:
    jobs:
      - build
      - test
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: main
```


The time difference in your organization's frequency *without* a workflow to enable developers in the way described above will include the time it takes for them to ensure their environment is the same as production, plus the time to run all of the same tests to ensure their code is good. All environment updates and tests must also be completed by every developer before any other changes are made to main. If changes happen *on main* while they are updating their environment or running their own tests, they will have to rerun everything to have confidence that their code won't break.

For an organization deploying on a slower cadence, a nightly build workflow can ensure that on any day an update is needed by customers, there is a tested and deployable build available:

```yaml
workflows:
  nightly-build:
    triggers:
      - schedule:
          cron: '0 8 ***'
          filters:
            branches:
              only: main
    jobs:
      - build
      - test
      - deploy
```

The time difference includes the lag described above plus the duration of the pipeline run and elapsed time between when a developer finished a change and when the scheduled build runs. All of this time adds up and the more confidence developers have in the quality of their code the higher their deployment frequency.


## 関連項目
{: #see-also }
{:.no_toc}

- [最適化]({{site.baseurl}}/2.0/optimizations): キャッシュ、ワークフロー、ビルドに対して実践できるその他の最適化戦略
- [依存関係のキャッシュ]({{site.baseurl}}/2.0/caching/#はじめに): キャッシュの概要
