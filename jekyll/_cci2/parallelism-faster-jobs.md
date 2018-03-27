---
layout: classic-docs
title: "Running Tests in Parallel"
short-title: "Running Tests in Parallel"
description: "How to run tests in parallel"
categories: [optimization]
order: 60
---

*[Test]({{ site.baseurl }}/2.0/test/) > Running Tests in Parallel*

CircleCI can run your tests in parallel,
allowing you to validate your code more quickly.
This document describes
how to organize tests
before running them in parallel.

## Overview

If your project has a large suite of tests,
it will take more time
to run those tests on one machine.
To reduce this time,
you can spread your tests across multiple machines.
This requires
specifying a parallelism level
and globbing or splitting tests
using the CircleCI Local CLI.

### Specifying a Job's Parallelism Level

Test suites are conventionally defined at the [job]({{ site.baseurl }}/2.0/jobs-steps/#sample-configuration-with-parallel-jobs) level in your `.circleci/config.yml` file.
The `parallelism` key specifies
how many independent executors will be set up
to run the steps of a job.
To run a job's steps in parallel,
set the `parallelism` key to a value greater than 1.

For more information,
see the [configuration reference]({{ site.baseurl }}/2.0/configuration-reference/#parallelism).

### Installing the CircleCI Local CLI

Running tests in parallel requires the CircleCI Local CLI.
For installation instructions,
refer to the [Using the CircleCI Local CLI]({{ site.baseurl }}/2.0/local-cli/#installing-the-circleci-local-cli-on-macos-and-linux-distros) document

### Globbing and Splitting

Test allocation across containers is file-based.
You can make groups of files by
specifying patterns for globbing or splitting.
To specify patterns for globbing,
use the `circleci tests glob` command,
as shown below:

    circleci tests glob "tests/unit/*.java" "tests/functional/*.java"

In this example, the `glob` command takes the Java files in the `tests/unit/` and `tests/functional` directories as arguments.
This set of files is run across the number of machines you specified with the `parallelism` key.

#### Supported Globbing Patterns

The following patterns are used to glob files.

- `*`: matches any sequence of characters (excluding path separators)
- `**`: matches any sequence of characters (including path separators)
- `?`: matches any single character (excluding path separators)
- `[abc]`: matches any character (excluding path separators) against characters in braces
- `{foo,bar,...}`: matches a sequence of characters if any of the alternatives in braces matches

#### Checking Glob Results

In your `config.yml` file, check your glob results by using the `circleci tests glob` command, for example:

```
run:
- type: shell
  command: |
  # Print all files in one line
  echo $(circleci tests glob "foo/**/*" "bar/**/*")
  # Print one file per line
  circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

### Splitting Patterns

The `circleci` CLI can be used to split a list of test files or classnames when running parallel builds on 2.0. The CLI uses the environment to look up the total number of containers, along with the current container index. Then, it uses deterministic splitting algorithms to return a distinct subset of the input filenames or classnames on each container.

The list of items to split can be provided via standard input or as a file argument, as follows:

- Piping: `circleci tests glob test/**/*.java | circleci tests split`
- `stdin` redirection: `circleci tests split < /path/to/items/to/split`
- Process substitution: `circleci tests split <(circleci tests glob test/**/*.java)`
- From file: `circleci tests split test_filenames.txt`

By default, it is assumed that the items being split are filenames and should be split by name. However, the tool can also split by file size or may use historical data to split by test runtimes.

Items can be split by `name`, `filesize` (for filepaths), or `timings` (when run on CircleCI). Splitting by name is the default and splits items alphabetically, for example:

`circleci tests glob "**/*.go" | circleci tests split`

When the items are filepaths, the `filesize` option will weight the split by file size, for example:

`circleci tests glob "**/*.go" | circleci tests split --split-by=filesize`

The `timings` split type uses historical timing data to weight the split. CircleCI automatically makes timing data from previous successful runs available inside your container in a default location so the CLI tool can discover them (`$CIRCLE_INTERNAL_TASK_DATA/circle-test-results`). Make sure you are using the [`store_test_results` key]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) to save your test timing data, otherwise there will not be any historical timing data available.

When splitting by `timings`, the tool will assume it’s splitting filenames. If you’re splitting classnames, you’ll need to specify that with the `--timings-type` flag, as in the following examples:

`circleci tests glob "**/*.go" | circleci tests split --split-by=timings --timings-type=filename`

`cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname`

The following additional flags are supported:
- `--index`: set the container index for this invocation of `circleci tests split`
- `--total`: set the total number of containers to consider

When running on CircleCI, these values will be automatically picked up from environment variables.

### Balancing Libraries

The following libraries have built-in support for the CircleCI environment variables:

{% include third-party-info.html app='Knapsack'%}

* [Knapsack](https://github.com/ArturT/knapsack) - Deterministic test suite split. A ruby gem for Knapsack will automatically divide your tests between parallel CI nodes, as well as making sure each job runs in comparable time. Supports RSpec, Cucumber, Minitest, Spinach and Turnip.

```
- run: bundle exec rake knapsack:rspec
```

* [Knapsack Pro](https://github.com/KnapsackPro/knapsack_pro-ruby) - Dynamic optimal test suite split. Knapsack Pro is a more advanced version of knapsack gem. It has automated recording of tests time execution across branches, commits and it can distribute tests across parallel CI nodes with predetermine split (regular mode) or in a dynamic way (queue mode) to get most optimal test suite split.

```
# some tests that are not balanced and executed only on first CI node
- run: case $CIRCLE_NODE_INDEX in 0) npm test ;; esac

# auto-balancing CI build time execution to be flat and optimal (as fast as possible).
# Queue Mode does dynamic tests allocation so the previous not balanced run command won't
# create a bottleneck on the CI node
- run: bundle exec rake knapsack_pro:queue:rspec
```
