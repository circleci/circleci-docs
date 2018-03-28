---
layout: classic-docs
title: "Running Tests in Parallel"
short-title: "Running Tests in Parallel"
description: "How to run tests in parallel"
categories: [optimization]
order: 60
---

*[Test]({{ site.baseurl }}/2.0/test/) > Running Tests in Parallel*

If your project has a large number of tests,
it will need more time to run them on one machine.
To reduce this time,
you can run tests in parallel
by spreading them across multiple machines.
This requires specifying a parallelism level
and using the CircleCI Local CLI
to glob and split test files.

## Specifying a Job's Parallelism Level

Test suites are conventionally defined at the [job]({{ site.baseurl }}/2.0/jobs-steps/#sample-configuration-with-parallel-jobs) level in your `.circleci/config.yml` file.
The `parallelism` key specifies
how many independent executors will be set up
to run the steps of a job.

To run a job's steps in parallel,
set the `parallelism` key to a value greater than 1.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    parallelism: 5
```

For more information,
see the [configuration reference]({{ site.baseurl }}/2.0/configuration-reference/#parallelism).

## Using the CircleCI Local CLI to Split Tests

Test allocation across containers is file-based
and requires the CircleCI Local CLI.
To install the CLI,
see the [Using the CircleCI Local CLI]({{ site.baseurl }}/2.0/local-cli/#installing-the-circleci-local-cli-on-macos-and-linux-distros) document.

### Globbing Test Files

The CLI supports globbing test files
using the following patterns:

- `*` matches any sequence of characters (excluding path separators)
- `**` matches any sequence of characters (including path separators)
- `?` matches any single character (excluding path separators)
- `[abc]` matches any character (excluding path separators) against characters in brackets
- `{foo,bar,...}` matches a sequence of characters, if any of the alternatives in braces matches

To glob test files,
pass one or more patterns to the `circleci tests glob` command.

    circleci tests glob "tests/unit/*.java" "tests/functional/*.java"

To check the results of pattern-matching,
use the `echo` command.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

### Splitting Test Files

The CLI supports splitting tests across machines
when running parallel builds.
To do this,
pass a list of filenames to the `circleci tests split` command.

    circleci tests split test_filenames.txt

The CLI looks up the number of containers
specified by the `parallelism` key,
along with the current container index.
Then, it uses deterministic splitting algorithms
to spread the test files across all available containers.

#### Splitting by Name

By default,
`circleci tests split` expects a list of filenames
and splits tests alphabetically by test name.
There are a few ways to provide this list:

Create a text file with test filenames.

    circleci tests split test_filenames.txt

Provide a path to the test files.

    circleci tests split < /path/to/items/to/split

Or pipe a glob of test files.

    circleci tests glob test/**/*.java | circleci tests split

However, the tool can also split by file size or may use historical data to split by test runtimes.

#### Splitting by Filesize

The CLI can also split by filesize.

`filesize` (for filepaths), or `timings` (when run on CircleCI).

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
