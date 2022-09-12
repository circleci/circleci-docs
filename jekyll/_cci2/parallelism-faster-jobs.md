---
layout: classic-docs
title: "Test splitting and parallelism"
description: "A guide for test splitting and running tests across parallel compute environments to optimize your CircleCI pipelines."
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

The more tests your project has, the longer it will take for them to complete using a single compute resource. To reduce this time, you can split your tests and run them across multiple, parallel-running execution environments. Specifying a level of parallelism defines how many separate [executors]({{site.baseurl}}/executor-intro/) get spun up to run your test suite. You can then split your test suite using the CircleCI CLI or use environment variables to configure each parallel-running executor individually.

* TOC
{:toc}

## Test splitting to speed up pipelines
{: #test-splitting-to-speed-up-pipelines }

Pipelines are often configured so that each time code is committed a set of tests are run. Test splitting is a great way to speed up the testing portion of your CI/CD pipeline. A set of tests can be split over a range of test environments running in parallel.

CircleCI test splitting lets you intelligently define where splits happen across a test suite:

* by name
* by size
* using timing data

Using **timing-based** test splitting takes the timing data from the previous test run to split a test suite as evenly as possible over a specified number of test environments running in parallel, to give the lowest possible test time for the compute power in use.

![Test Splitting]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

To illustrate this, take a sequentially running test suite – all tests run in a single test environment (docker container):

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

To split these tests using timing data, first introduce parallelism to spin up a number of identical test environments (10 in this example). Then use the `circleci tests split` command, with the `--split-by=timings` flag to split the tests evenly across all executors, so the tests run in the shortest possible time.

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 10
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

**Note:** The first time the tests are run there will be no timing data for the command to use, but on subsequent runs the test time will be optimized.

### Is it worth it?
{: #is-it-worth-it }

To give a quantitative illustration of the power of splitting tests using timing data, adding `parallelism: 10` on a test suite run across the CircleCI application project decreased the test time **from 26:11 down to 3:55**.

Using timings-based test splitting gives the most accurate split, and is guaranteed to optimize with each test suite run. The most recent timings data is always used to define where splits are made.

## Specifying a job's parallelism level
{: #specifying-a-jobs-parallelism-level }

Test suites are conventionally defined at the [job]({{ site.baseurl }}/jobs-steps/) level in your `.circleci/config.yml` file.
The `parallelism` key specifies how many independent executors are set up to run the steps.

To run a job's steps in parallel, set the `parallelism` key to a value greater than 1.

```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![Parallelism]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

### Using parallelism with self-hosted runners

To use the parallelism feature with jobs that use [self-hosted runners]({{site.baseurl}}/runner-overview/), ensure that you have at least two self-hosted runners associated with the runner resource class that your job will run on. If you set the parallelism value to be greater than the number of active self-hosted runners in a given resource class, the excess parallel tasks that do not have a self-hosted runner to execute on will queue until a self-hosted runner is available.

For more information, see the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/#parallelism) document.

## Using the CircleCI CLI to split tests
{: #using-the-circleci-cli-to-split-tests }

CircleCI supports automatic test allocation across your containers. The allocation is filename or classname based, depending on the requirements of the test-runner you are using. Test splitting requires the CircleCI CLI, which is automatically injected into your build at run-time.

**Note**: The `circleci tests` commands (`glob` and `split`) cannot be run locally via the CLI as they require information that only exists within a CircleCI container.

The CLI supports splitting tests across executors when running parallel jobs. This is achieved by passing a list of either files or classnames, whichever your test-runner requires at the command line, to the `circleci tests split` command.

[Self-hosted runners]({{site.baseurl}}/runner-overview/) can invoke `circleci-agent` directly instead of using the CLI to split tests. This is because the [task-agent]({{site.baseurl}}/runner-overview/#circleci-runner-operation) already exists on the `$PATH`, removing an additional dependency when splitting tests.


### Globbing test files
{: #globbing-test-files }

To assist in defining your test suite, the CLI supports globbing test files using the following patterns:

- `*` matches any sequence of characters (excluding path separators)
- `**` matches any sequence of characters (including path separators)
- `?` matches any single character (excluding path separators)
- `[abc]` matches any character (excluding path separators) against characters in brackets
- `{foo,bar,...}` matches a sequence of characters, if any of the alternatives in braces matches

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
      - image: cimg/<language>:<version TAG>
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

### Splitting by timing data
{: #splitting-by-timing-data }

The best way to optimize your test suite across a set of parallel executors is to split your tests using timing data. This will ensure the tests are split in the most even way, leading to a shorter test time.

On each successful run of a test suite, CircleCI saves timings data from the directory specified by the path in the [`store_test_results`]({{ site.baseurl }}/configuration-reference/#store_test_results) step. This timings data consists of how long each test took to complete per filename or classname.

**Note**: If you do not use `store_test_results`, there will be no timing data available to split your tests.

To split by test timings, use the `--split-by` flag with the `timings` split type. The available timings data will then be analyzed and your tests will be split across your parallel-running containers as evenly as possible.

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

The CLI expects both filenames and classnames to be present in the timing data produced by the testing suite. By default, splitting defaults to filename, but you can specify classnames by using the `--timings-type` flag.

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

For partially found test results, a random small value is assigned to any test with missing timing data. You can override this default value to a specific value with the `--time-default` flag.

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

If you need to manually store and retrieve timing data, use the [`store_artifacts`]({{ site.baseurl }}/configuration-reference/#store_artifacts) step.

**Note**: If no timing data is found, you will receive a message: `Error autodetecting timing type, falling back to weighting by name.`. The tests will then be split alphabetically by test name.

### Splitting by name
{: #splitting-by-name }

By default, if you do not specify a method using the `--split-by` flag, `circleci tests split` expects a list of filenames or classnames and splits tests alphabetically by test name. There are a few ways to provide this list:

* Create a text file with test filenames.
```shell
circleci tests split test_filenames.txt
```

* Provide a path to the test files.
```shell
circleci tests split < /path/to/items/to/split
```

* Or pipe a glob of test files.
```shell
circleci tests glob "test/**/*.java" | circleci tests split
```

The CLI looks up the number of available containers, along with the current container index. Then, it uses deterministic splitting algorithms to split the test files across all available containers.

By default, the number of containers is specified by the `parallelism` key in the project configuration file. You can manually set this by using the `--total` flag.

```shell
circleci tests split --total=4 test_filenames.txt
```

Similarly, the current container index is automatically picked up from environment variables, but can be manually set by using the `--index` flag.

```shell
circleci tests split --index=0 test_filenames.txt
```

### Splitting by filesize
{: #splitting-by-filesize }

When provided with filepaths, the CLI can also split by filesize. To do this, use the `--split-by` flag with the `filesize` split type.

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

## Running split tests
{: #running-split-tests }

Globbing and splitting tests does not actually run your tests. To combine test grouping with test execution, consider saving the grouped tests to a file, then passing this file to your test runner.

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

The contents of the file `/tmp/tests-to-run` will be different in each container, based on `$CIRCLE_NODE_INDEX` and `$CIRCLE_NODE_TOTAL`.

## Using environment variables to split tests
{: #using-environment-variables-to-split-tests }

For full control over how tests are split across parallel executors, CircleCI provides two environment variables that you can use in place of the CLI to configure each container individually.
`CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job, and `CIRCLE_NODE_INDEX` is the index of the specific container that is currently running.
Refer to the [built-in environment variable documentation]({{ site.baseurl }}/env-vars-built-in) for more details.

## Other ways to split tests
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test
suite. These applications are not developed or supported by CircleCI. Please check with the owner if you have issues using it with CircleCI. If you're unable to resolve the issue you can search and ask on our forum, [Discuss](https://discuss.circleci.com/).

- **[Knapsack Pro](https://knapsackpro.com)** - Enables allocating tests
  dynamically across parallel CI nodes, allowing your test suite execution to run
  faster. See [CI build time graph examples](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress).

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)** - This is
  a helper CLI tool that queries `phpunit.xml` files to get a list of test
  filenames and print them. This is useful if you want to split tests to run
  them in parallel based on timings on CI tools.
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)** - Use the built-in Go command `go list ./...` to glob Golang packages. This allows splitting package tests across multiple containers.

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```


## Next steps
{: #next-steps }

* [Troubleshooting Test Splitting]({{ site.baseurl }}/troubleshoot-test-splitting/)
* [Collecting Test Data]({{ site.baseurl }}/collect-test-data/)
* [Test Insights]({{ site.baseurl }}/insights-tests/)
