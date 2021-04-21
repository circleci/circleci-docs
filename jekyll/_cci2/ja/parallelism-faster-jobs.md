---
layout: classic-docs
title: "テストの並列実行"
short-title: "テストの並列実行"
description: "テストを並列に実行する方法"
categories:
  - optimization
order: 60
version:
  - Cloud
  - Server v2.x
---

プロジェクトに含まれるテストの数が多いほど、テストを 1 台のマシンで実行するのに時間がかかるようになります。 この時間を短縮するために、テストを複数の Executor に分散させて並列に実行することができます。 それには、並列処理レベルを指定して、テスト ジョブ用にスピン アップする個別の Executor の数を定義する必要があります。 さらに、CircleCI CLI を使用してテスト ファイルを分割するか、環境変数を使用して各並列マシンを個別に構成します。

* TOC
{:toc}

## Specifying a job's parallelism level
{: #specifying-a-jobs-parallelism-level }

Test suites are conventionally defined at the [job]({{ site.baseurl }}/2.0/jobs-steps/#sample-configuration-with-concurrent-jobs) level in your `.circleci/config.yml` file. The `parallelism` key specifies how many independent executors will be set up to run the steps of a job.

To run a job's steps in parallel, set the `parallelism` key to a value greater than 1.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![Parallelism]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

For more information, see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document.

## Using the CircleCI CLI to split tests
{: #using-the-circleci-cli-to-split-tests }

CircleCI supports automatic test allocation across your containers. The allocation is filename or classname based, depending on the requirements of the test-runner you are using. It requires the CircleCI CLI, which is automatically injected into your build at run-time.

To install the CLI locally, see the [Using the CircleCI Local CLI]({{ site.baseurl }}/2.0/local-cli/) document.

Note: The `circleci tests` commands (`glob` and `split`) cannot be run locally via the CLI as they require information that only exists within a CircleCI container.

### Splitting test files
{: #splitting-test-files }
{:.no_toc}

The CLI supports splitting tests across machines when running parallel jobs. This is achieved by passing a list of either files or classnames, whichever your test-runner requires at the command line, to the `circleci tests split` command.

#### Globbing test files
{: #globbing-test-files }
{:.no_toc}

To assist in defining your test suite, the CLI supports globbing test files using the following patterns:

- `*` は、任意の文字シーケンスに一致します (パス区切り文字を除く)。
- `**` は、任意の文字シーケンスに一致します (パス区切り文字を含む)。
- `?` は、任意の 1 文字に一致します (パス区切り文字を除く)。
- `[abc]` は、角かっこ内の任意の文字に一致します (パス区切り文字を除く)。
- `{foo,bar,...}` は、中かっこ内のいずれかの文字シーケンスに一致します。

To glob test files, pass one or more patterns to the `circleci tests glob` command.

```
circleci tests glob "tests/unit/*.java" "tests/functional/*.java"
```

To check the results of pattern-matching, use the `echo` command.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

#### Splitting by timing data
{: #splitting-by-timing-data }

The best way to optimize your test suite across a set of parallel executors is to split your tests using timing data. This will ensure the tests are split in the most even way, leading to a shorter overall test time.

![Test Splitting]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

On each successful run of a test suite, CircleCI saves timings data from the directory specified by the path in the [`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) step. This timings data consists of how long each test took to complete per filename or classname, depending on the language you are using.

Note: If you do not use `store_test_results`, there will be no timing data available for splitting your tests.

To split by test timings, use the `--split-by` flag with the `timings` split type. The available timings data will then be analyzed and your tests will be split across your parallel-running containers as evenly as possible leading to the fastest possible test run time

```
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

The CLI expects both filenames and classnames to be present in the timing data produced by the testing suite. By default, splitting defaults to filename, but you can specify classnames by using the `--timings-type` flag.

```
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

If you need to manually store and retrieve timing data, use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step.

#### Splitting by name
{: #splitting-by-name }
{:.no_toc}

By default, if you don't specify a method using the `--split-by` flag, `circleci tests split` expects a list of filenames/classnames and splits tests alphabetically by test name. There are a few ways to provide this list:

Create a text file with test filenames.

```
circleci tests split test_filenames.txt
```

Provide a path to the test files.

```
circleci tests split < /path/to/items/to/split
```

Or pipe a glob of test files.

```
circleci tests glob "test/**/*.java" | circleci tests split
```

The CLI looks up the number of available containers, along with the current container index. Then, it uses deterministic splitting algorithms to split the test files across all available containers.

By default, the number of containers is specified by the `parallelism` key. You can manually set this by using the `--total` flag.

```
circleci tests split --total=4 test_filenames.txt
```

Similarly, the current container index is automatically picked up from environment variables, but can be manually set by using the `--index` flag.

```
circleci tests split --index=0 test_filenames.txt
```

#### Splitting by filesize
{: #splitting-by-filesize }
{:.no_toc}

When provided with filepaths, the CLI can also split by filesize. To do this, use the `--split-by` flag with the `filesize` split type.

```
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

## Using environment variables to split tests
{: #using-environment-variables-to-split-tests }

For full control over parallelism, CircleCI provides two environment variables that you can use in lieu of the CLI to configure each container individually. `CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job, and `CIRCLE_NODE_INDEX` is the index of the specific container that is currently running. See the [built-in environment variable documentation]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) for more details.

## Running split tests
{: #running-split-tests }

Globbing and splitting tests does not actually run your tests. To combine test grouping with test execution, consider saving the grouped tests to a file, then passing this file to your test runner.

```bash
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

The contents of the file `/tmp/tests-to-run` will be different in each container, based on `$CIRCLE_NODE_INDEX` and `$CIRCLE_NODE_TOTAL`.

### Video: troubleshooting globbing
{: #video-troubleshooting-globbing }
{:.no_toc}

Note: To follow along with the commands in the video below you will need to be [`SSH-ed into a job`]({{ site.baseurl }}/2.0/ssh-access-jobs/). <iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>

## See also
{: #see-also }

[Using Containers]({{ site.baseurl }}/2.0/containers/)

## その他のテスト分割方法
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test suite. These applications are not developed or supported by CircleCI. Please check with the owner if you have issues using it with CircleCI. If you're unable to resolve the issue you can search and ask on our forum, [Discuss](https://discuss.circleci.com/).

- **[Knapsack Pro](https://knapsackpro.com)** - Enables allocating tests dynamically across parallel CI nodes, allowing your test suite exection to run faster. CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)** - This is a helper CLI tool that queries `phpunit.xml` files to get a list of test filenames and print them. テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)** - Use the built-in Go command `go list ./...` to glob Golang packages. これにより、パッケージ テストを複数のコンテナに分割できます。

  ```
  go test -v $(go list ./... | circleci tests split)
  ```
