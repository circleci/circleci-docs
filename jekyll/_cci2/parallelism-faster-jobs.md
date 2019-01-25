---
layout: classic-docs
title: "Running Tests in Parallel"
short-title: "Running Tests in Parallel"
description: "How to run tests in parallel"
categories: [optimization]
order: 60
---

If your project has a large number of tests,
it will need more time to run them on one machine.
To reduce this time,
you can run tests in parallel
by spreading them across multiple machines.
This requires specifying a parallelism level.
You can use either the CircleCI CLI
to split test files,
or use environment variables
to configure each parallel machine
individually.

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
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    parallelism: 4
```

For more information,
see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document.

## Using the CircleCI CLI to Split Tests

CircleCI supports automatic test allocation
across your containers.
The allocation is file-based.
It requires the CircleCI CLI,
which is automatically injected
into your build at run-time.

To install the CLI locally,
see the [Using the CircleCI Local CLI]({{ site.baseurl }}/2.0/local-cli/) document.

### Globbing Test Files
{:.no_toc}

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
    parallelism: 4
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

### Splitting Test Files
{:.no_toc}

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
{:.no_toc}

By default,
`circleci tests split` expects a list of filenames
and splits tests alphabetically by test name.
There are a few ways to provide this list:

Create a text file with test filenames.

    circleci tests split test_filenames.txt

Provide a path to the test files.

    circleci tests split < /path/to/items/to/split

Or pipe a glob of test files.

    circleci tests glob "test/**/*.java" | circleci tests split

#### Splitting by Filesize
{:.no_toc}

When provided with filepaths,
the CLI can also split by filesize.
To do this,
use the `--split-by` flag with the `filesize` split type.

    circleci tests glob "**/*.go" | circleci tests split --split-by=filesize

#### Splitting by Timings Data
{:.no_toc}

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

## Using Environment Variables to Split Tests 

For full control over parallelism,
CircleCI provides two environment variables
that you can use in lieu of the CLI
to configure each container individually.
`CIRCLE_NODE_TOTAL` is the total number of
parallel containers being used to run your
job, and `CIRCLE_NODE_INDEX` is the index
of the specific container that is
currently running.
See the [built-in environment variable documentation]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables)
for more details.

## Running Split Tests

Globbing and splitting tests does not actually run your tests.
To combine test grouping with test execution,
consider saving the grouped tests to an environment variable,
then passing this variable to your test runner.

```bash
TESTFILES=$(circleci tests glob "spec/**/*.rb" | circleci tests split --split-by=timings)
bundle exec rspec -- ${TESTFILES}
```

The TESTFILES var will have a different value in each container, based on $CIRCLE_NODE_INDEX and $CIRCLE_NODE_TOTAL.

### Video: Troubleshooting Globbing
{:.no_toc}

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## See Also

[Using Containers]({{ site.baseurl }}/2.0/containers/)

## Other ways to split tests

### Test suite split with Knapsack Pro for Ruby & JavaScript
{% include third-party-info.html app='Knapsack Pro'%}

You can allocate tests in a dynamic way across parallel CI nodes with [Knapsack Pro](https://knapsackpro.com) Queue Mode. This way you can auto balance CI nodes timing affected by the randomness of tests time execution to run faster CI builds. See [CI build time graph examples](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress).
