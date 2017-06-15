---
layout: classic-docs
title: "Running Tests in Parallel"
short-title: "Running Tests in Parallel"
description: "How to run tests in parallel"
categories: [optimization]
order: 60
---

One of the most powerful features of CircleCI is the ability to run your tests in parallel. This section describes how to use `circleci` commands in your `config.yml` file to merge and split tests with the hosted CircleCI CLI for faster builds. See [Writing Jobs with Steps]({{ site.baseurl }}/2.0/configuration-reference/#jobs) for information about setting the `parallelism` key in your configuration file. 

Use the circle tests glob command to specify multiple globs to merge using a pattern, for example: 
	`circleci tests glob "tests/unit/*.java" "tests/functional/*.java"`

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

### Supported Globbing Patterns

The following patterns are used to glob files.

- `*`: matches any sequence of characters (excluding path separators)
- `**`: matches any sequence of characters (including path separators)
- `?`: matches any single character (excluding path separators)
- `[abc]`: matches any character (excluding path separators) against characters in braces
- `{foo,bar,...}`: matches a sequence of characters if any of the alternatives in braces matches

For example:

`circleci tests glob "**/*.java"`

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

The `timings` split type uses historical timing data to weight the split. CircleCI automatically makes timing data from previous runs available inside your container in a default location so the CLI tool can discover them (`/.circleci-task-data/circle-test-results/`).

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
