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
and using the CircleCI CLI
to split test files.

* TOC
{:toc}

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
  docker:
    - image: circleci/<language>:<version TAG>
  test:
    parallelism: 4
```

For more information,
see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document.

## Using the CircleCI CLI to Split Tests

Test allocation across containers is file-based
and requires the CircleCI CLI. It is automatically
injected into your build at run-time.

To install the CLI locally,
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
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```
### Video: Troubleshooting Globbing

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

### Splitting Test Files

The CLI supports splitting tests across machines
when running parallel builds.
To do this,
pass a list of filenames to the `circleci tests split` command.

    circleci tests split test_filenames.txt

The CLI looks up the number of containers,
along with the current container index.
Then, it uses deterministic splitting algorithms
to split the test files across all available containers.

By default,
the number of containers is specified by the `parallelism` key.
You can manually set this
by using the `--total` flag.

    circleci tests split --total=4 test_filenames.txt

Similarly,
the current container index is automatically picked up from environment variables,
but can be manually set
by using the `--index` flag.

    circleci tests split --index=0 test_filenames.txt

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

#### Splitting by Filesize

When provided with filepaths,
the CLI can also split by filesize.
To do this,
use the `--split-by` flag with the `filesize` split type.

    circleci tests glob "**/*.go" | circleci tests split --split-by=filesize

#### Splitting by Timings Data

On each successful run of a test suite,
CircleCI saves timings data to a directory
specified by the path in the [`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) step.
If you do not use `store_test_results`,
there will be no timing data available for splitting your tests.

To split by test timings,
use the `--split-by` flag with the `timings` split type.

    circleci tests glob "**/*.go" | circleci tests split --split-by=timings

The CLI expects both filenames and classnames
to be present in the timing data
produced by the testing suite.
By default, splitting defaults to filename,
but you can specify classnames
by using the `--timings-type` flag.

    cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname

If you need to manually store and retrieve timing data,
use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step.

## Test suite split with Knapsack Pro

{% include third-party-info.html app='Knapsack Pro'%}

You can parallelize tests for RSpec, Cucumber, Minitest, Test::Unit, Spinach and Turnip with [knapsack_pro gem](https://github.com/KnapsackPro/knapsack_pro-ruby). It will split tests across CI nodes and it makes sure that tests will run comparable time on each CI node. [Knapsack Pro](https://knapsackpro.com/) gem has built-in support for CircleCI and can help to track slow test files among your CI builds.

<iframe width="854" height="480" src="https://www.youtube.com/embed/pkdLzKlnlQg?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

You may find useful an example of [Capybara/Selenium/Chrome headless CircleCI 2.0 configuration for Ruby on Rails](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless) project.

### Splitting in a dynamic way (Queue Mode) - recommended

Autobalance tests to get optimal test suite split between CI nodes. It is designed for tests with random time execution and can solve other issues like filling timing gaps between jobs to complete the CI build as fast as possible. See video [how to split Ruby tests across CI nodes in a dynamic way using Knapsack Pro Queue Mode](https://www.youtube.com/watch?v=hUEB1XDKEFY).

### Splitting in a deterministic way (Regular Mode)

Deterministic split based on test files timing tracked across multiple branches and commits. See video [how split Ruby tests in the deterministic way across CI nodes with Regular Mode in Knapsack Pro](https://www.youtube.com/watch?v=ZEb6NeRRfQ4).
