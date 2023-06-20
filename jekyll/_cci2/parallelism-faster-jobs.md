---
layout: classic-docs
title: Test splitting and parallelism
description: A guide for test splitting and running tests across parallel compute environments to optimize your CircleCI pipelines.
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

Use parallelism and test splitting to:

* Reduce the time taken for the testing portion of your CI/CD pipeline.
* Specify a number of [executors](/docs/executor-intro/) across which to split your tests.
* Split your test suite using one of the options provided by the CircleCI CLI: by name, size or by using timing data.

If you are interested to read about concurrent job runs, see the [Concurrency overview](/docs/concurrency) page.

## Introduction
{: #introduction }

Pipelines are often configured so that a set of tests are run each time code is committed. The more tests your project has, the longer it will take for them to complete using a single compute resource. To reduce this time, you can split your tests and run them across multiple, parallel-running execution environments. Test splitting is a great way to speed up the testing portion of your CI/CD pipeline.

CircleCI test splitting lets you intelligently define where splits happen across a test suite:

* By **name**
* By **size**
* Using **timing** data

It is also possible to use the CLI to [manually allocate tests](#manual-allocation) across parallel environments. Another alternative is to use [environment variables](#using-environment-variables-to-split-tests) instead of the CLI to configure split tests.

## Specify a job's parallelism level
{: #specify-a-jobs-parallelism-level }

Test suites are conventionally defined at the [job](/docs/jobs-steps/) level in your `.circleci/config.yml` file.
The `parallelism` key specifies how many independent executors are set up to run the job.

To run a job's steps in parallel, set the `parallelism` key to a value greater than `1`. In the example below, `parallelism` is set to `4`, meaning four identical execution environments will be set up for the job.

```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/base:2022.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![Parallelism]({{site.baseurl}}/assets/img/docs/executor_types_plus_parallelism.png)

With no further changes, the full `test` job is still run in each of the four execution environment. In order to automatically run _different_ tests in each environment and reduce the overall time taken to run the tests, you also need to use the `circleci tests` CLI commands in your configuration.

### Use parallelism with self-hosted runners
{: #use-parallelism-with-self-hosted-runners }

To use the parallelism feature with jobs that use [self-hosted runners](/docs/runner-overview/), ensure that you have at least two self-hosted runners associated with the runner resource class that your job will run on. If you set the parallelism value to be greater than the number of active self-hosted runners in a given resource class, the excess parallel tasks that do not have a self-hosted runner on which to execute will queue until a self-hosted runner is available.

For more information, see the [Configuration reference](/docs/configuration-reference/#parallelism) page.

## How test splitting works
{: #how-test-splitting-works }

Using **timing-based** test splitting as an example, timing data from the _previous_ test run is used to split a test suite as evenly as possible over a specified number of test environments running in parallel. This delivers the lowest possible test time for the compute power in use.

![Test Splitting]({{site.baseurl}}/assets/img/docs/test_splitting.png)

Timings-based test splitting gives the most accurate split, and is guaranteed to optimize with each test suite run. The most recent timings data is always used to define where splits are made.

As an example, take a Go test suite. Here, all tests run sequentially in a single test environment, a Docker container:

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

To split these tests using timing data:

1. Introduce parallelism to spin up a number of identical test environments (4 in this example)
2. Use the `circleci tests split` command, with the `--split-by=timings` flag to split the tests evenly across all executors.

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
    parallelism: 4
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

For a more detailed walkthrough, read the [guide to using the CLI to split tests](/docs/use-the-circleci-cli-to-split-tests), or follow our [Test splitting tutorial](/docs/test-splitting-tutorial).

The first time the tests are run there will be no timing data for the command to use, but on subsequent runs the test time will be optimized.
{: class="alert alert-info"}

## Manual allocation
{: #manual-allocation }

For full control over how tests are split across parallel executors, CircleCI provides two environment variables that you can use in place of the CLI to configure each container individually.

* `$CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job.
* `$CIRCLE_NODE_INDEX` is the index of the specific container that is currently running.

The CLI looks up the number of available execution environments (`$CIRCLE_NODE_TOTAL`), along with the current container index (`$CIRCLE_NODE_INDEX`). Then, it uses deterministic splitting algorithms to split the test files across all available containers.

The number of containers is specified by the [`parallelism` key](/docs/configuration-reference/#parallelism) in the project configuration file.

The current container index is automatically picked up from the `$CIRCLE_NODE_INDEX` environment variable, but can be manually set by using the `--index` flag.

```shell
circleci tests split --index=0 test_filenames.txt
```

Refer to the [Project values and variables](/docs/variables#built-in-environment-variables) page for more details.

## Other ways to split tests
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test
suite. These applications are not developed or supported by CircleCI. Please check with the owner if you have issues using it with CircleCI. If you are unable to resolve the issue you can search and ask on our forum, [Discuss](https://discuss.circleci.com/).

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
- **[Playwright](https://github.com/microsoft/playwright)** - This is a framework for web testing and automation and allows running sharded tests out of the box. For more details see [playwright docs](https://playwright.dev/docs/ci#circleci).

  ```yaml
  job-name:
    executor: pw-focal-development
    parallelism: 4
    steps:
      - run: SHARD="$((${CIRCLE_NODE_INDEX}+1))"; npx playwright test -- --shard=${SHARD}/${CIRCLE_NODE_TOTAL}
  ```

## Next steps
{: #next-steps }

* [Use the CircleCI CLI to split tests](/docs/use-the-circleci-cli-to-split-tests)
* [Test splitting to speed up your pipelines](/docs/test-splitting-tutorial)
* [Troubleshooting Test Splitting](/docs/troubleshoot-test-splitting/)
* [Collecting Test Data](/docs/collect-test-data/)
* [Test Insights](/docs/insights-tests/)
