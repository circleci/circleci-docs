---
layout: classic-docs
title: "Parallelism with CircleCI CLI"
short-title: "Parallelism for Faster Jobs"
description: "How to run tests in parallel"
categories: [configuring-jobs]
order: 50
---

One of the most powerful features of CircleCI is the ability to run your tests in parallel. In CircleCI 2.0 you manage this parallelism with a CLI tool called `circleci`. We inject this agent into the primary job container so the `circleci` command is always available in container `0`.

Access help by running `circleci tests help` or see below for descriptions of your options.

- This tool is available on circleci.com and within the [local CircleCI CLI](/docs/2.0/local-jobs/).
- You can specify multiple globs.  This is pretty common for test suites in 1.0.  For example: `circleci tests glob "tests/unit/*.java" "tests/functional/*.java"`
- As you migrate from 1.0 to 2.0, it's worthwhile to manually check that your globs pick up exactly what you want and nothing else.  `circleci tests glob` scans the filesystem based on the globs you pass it and returns plain text in Bash.  So you can do check your glob results by adding a line like the following:

```YAML
- type: shell
  command: |
  # Print all files in one line
  echo $(circleci tests glob "foo/**/*" "bar/**/*")
  # Print one file per line
  circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

## Commands

### Globbing

Supported patterns:

- `*`: matches any sequence of characters (excluding path separators)
- `**`: matches any sequence of characters (including path separators)
- `?`: matches any single character (excluding path separators)
- `[abc]`: matches any character (excluding path separators) against characters in braces
- `{foo,bar,...}`: matches a sequence of characters if any of the alternatives in braces matches

`circleci tests glob "**/*.java"`

### Splitting

`circleci` can be used to split a list of test files or classnames when running parallel builds on 2.0.

The tool uses the environment to look up the total number of containers, along with the current container index. Then, the tool uses deterministic splitting algorithms to return a distinct subset of the input filenames or classnames on each container.

The list of items to split can be provided via standard input or as a file argument.

- piping: `circleci tests glob test/**/*.java | circleci tests split`
- stdin redirection: `circleci tests split < /path/to/items/to/split`
- process substitution: `circleci tests split <(circleci tests glob test/**/*.java)`
- from file: `circleci tests split test_filenames.txt`

By default, it’s assumed that the items being split are filenames and should be split by name. However, the tool can also split by filesize or use historical data to split by test runtimes.

#### Controlling splits
Items can be split by `name`, `filesize` (for filepaths), or `timings` (when run on CircleCI).

##### **name**
This is the default and splits items alphabetically.

`circleci tests glob "**/*.go" | circleci tests split`

##### **filesize**
When the items are filepaths, this option will weight the split by filesize.

`circleci tests glob "**/*.go" | circleci tests split --split-by=filesize`

##### **timings**
This split type uses historical timing data to weight the split. CircleCI automatically makes timing data from previous runs available inside your container in a default location so the CLI tool can discover them (`/.circleci-task-data/circle-test-results/`).

When splitting by `timings`, the tool will assume it’s splitting filenames. If you’re splitting classnames, you’ll need to specify that with the `--timings-type` flag.

`circleci tests glob "**/*.go" | circleci tests split --split-by=timings --timings-type=filename`

`cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname`

#### Additional flags
- `--index`: set the container index for this invocation of `circleci tests split`
- `--total`: set the total number of containers to consider

When running on CircleCI, these values will be automatically picked up from environment variables.

## Balancing libraries

The following libraries have built-in support for the CircleCI environment variables:

{% include third-party-info.html app='Knapsack'%}

* [Knapsack](https://github.com/ArturT/knapsack) - deterministic test suite split

    A ruby gem for that will automatically divide your tests between parallel CI nodes, as well as making sure each job runs in comparable time. Supports RSpec, Cucumber, Minitest, Spinach and Turnip.

```YAML
- run: bundle exec rake knapsack:rspec
```

* [Knapsack Pro](https://github.com/KnapsackPro/knapsack_pro-ruby) - dynamic optimal test suite split

    Is more advanced version of knapsack gem. Knapsack Pro has automated recording of tests time execution across branches, commits and it can distribute tests across parallel CI nodes with predetermine split (regular mode) or in a dynamic way (queue mode) to get most optimal test suite split.

```YAML
# some tests that are not balanced and executed only on first CI node
- run: case $CIRCLE_NODE_INDEX in 0) npm test ;; esac

# auto-balancing CI build time execution to be flat and optimal (as fast as possible).
# Queue Mode does dynamic tests allocation so the previous not balanced run command won't
# create a bottleneck on the CI node
- run: bundle exec rake knapsack_pro:queue:rspec
```
