---
layout: classic-docs2
title: "Managing Parallelism with the 2.0 Tests CLI"
short-title: "Managing Parallelism"
categories: [configuring-circleci]
order: 3
---

One of the most powerful features of CircleCI is the ability to run your tests in parallel. You can manage this parallelism by using a CLI tool called `picard`, which can be accessed from the primary build container.

Access help by running `picard tests help` or see below for descriptions of your options.

## Commands

### Globbing

Supported patterns:

- `*`: matches any sequence of characters (excluding path separators)
- `**`: matches any sequence of characters (including path separators)
- `?`: matches any single character (excluding path separators)
- `[abc]`: matches any character (excluding path separators) against characters in braces
- `{foo,bar,...}`: matches a sequence of characters if any of the alternatives in braces matches

`picard tests glob "**/*.java"`

### Splitting

`picard` can be used to split a list of test files or classnames when running parallel builds on 2.0.

The tool uses the environment to look up the total number of containers, along with the current container index. Then, the tool uses deterministic splitting algorithms to return a distinct subset of the input filenames or classnames on each container.

The list of items to split can be provided via standard input or as a file argument.

- piping: `picard tests glob test/**/*.java | picard tests split`
- stdin redirection: `picard tests split < /path/to/items/to/split`
- process substitution: `picard tests split <(picard tests glob test/**/*.java)`
- from file: `picard tests split test_filenames.txt`

By default, it’s assumed that the items being split are filenames and should be split by name. However, the tool can also split by filesize or use historical data to split by test runtimes.

#### Controlling splits
Items can be split by `name`, `filesize` (for filepaths), or `timings` (when run on CircleCI).

##### **name**
This is the default and splits items alphabetically.

`picard tests glob "**/*.go" | picard tests split`

##### **filesize**
When the items are filepaths, this option will weight the split by filesize.

`picard tests glob "**/*.go" | picard tests split --split-by=filesize`

##### **timings**
This split type uses historical timing data to weight the split. CircleCI automatically makes timing data from previous runs available inside your container in a default location so the CLI tool can discover them (`/.circleci-task-data/circle-test-results/`).

When splitting by `timings`, the tool will assume it’s splitting filenames. If you’re splitting classnames, you’ll need to specify that with the `--timings-type` flag.

`picard tests glob "**/*.go" | picard tests split --split-by=timings --timings-type=filename`

`cat my_java_test_classnames | picard tests split --split-by=timings --timings-type=classname`

#### Additional flags
- `--index`: set the container index for this invocation of `picard tests split`
- `--total`: set the total number of containers to consider

When running on CircleCI, these values will be automatically picked up from environment variables.
