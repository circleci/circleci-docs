---
layout: classic-docs
title: Manually Setting Up Parallelism
description: Manually setting up parallelism
category: parallelism
sitemap: false
---

If you want the benefits of parallel testing, and you're not
using one of our automatically supported test runners, or if
you've overridden our test commands, you'll still be able to set up parallelism and reduce your test run-times.

To begin with, you'll need to turn on parallelism from your project's settings page.
Go to **Project Settings > Parallelism** to adjust the settings.

## Splitting your test suite

When you use CircleCI's parallelization, we run your code on multiple separate VMs.
To use parallelism, you make your test runner run only a subset of tests on each VM.

There are two mechanisms for splitting tests among nodes: using the `files`
configuration modifier (a very simple and straightforward way for most use cases), or
using parallelism environment variables (aimed at more complex scenarios).

Either way, there are a few things to keep in mind:

- `test` and `deploy` sections in your `circle.yml` are single-node only by
  default and will only run on node 0. However, you can override `test` sections
  per command (add `:` to the end of each command you'd like to parallelize, then
  add a double-indented `parallel: true` below that).
- Inferred `test` commands will automatically parallelize.
- Currently, commands that only run in node 0 will erroneously show up in the
  UI as running on all nodes.

### Using the `files` configuration modifier

Parallelizing test runners that accept file names is straightforward!  The `files` modifier
can list paths to the test files, and CircleCI will run the test runners with different test files in each node.
For example, to parallelize an rspec command, you can set the following:

```
test:
  override:
    - bundle exec rspec:
        parallel: true
        files:
          - spec/unit/sample.rb   # can be a direct path to file
          - spec/**/*.rb          # or a glob (ruby globs)
```

**Note:**  
The `**` pattern matches multiple directory layers with Ruby globs. You can test glob patterns locally with e.g. `ruby -e "puts Dir.glob('**/*.py')"`.

In this example, we will run `bundle exec rspec` in all nodes appended with
roughly `1/N` of the files on each VM (where N is the number of nodes).

By default, the file arguments will be appended to the end of the command.

### Using environment variables

For more control over parallelism, we use environment variables to denote the number of VMs and to identify each one, and you can access these from your test runner:

<dl>
  <dt>
    CIRCLE_NODE_TOTAL
  </dt>
  <dd>
    is the total number of parallel VMs being used to run your tests on each push.
  </dd>
  <dt>
    CIRCLE_NODE_INDEX
  </dt>
  <dd>
    is the index of the particular VM. CIRCLE_NODE_INDEX is indexed from zero.
  </dd>
</dl>

### A simple example

If you want to run the two commands `rake spec` and `npm test` in parallel, you can use a bash case statement:

```
test:
  override:
    - case $CIRCLE_NODE_INDEX in 0) rake spec ;; 1) npm test ;; esac:
        parallel: true
```

Note the final colon, and `parallel: true` (double-indented) on the next line.

This is a command modifier which tells CircleCI that the command should be run in parallel on all test machines. It defaults to true for commands in the machine, checkout, dependencies and database build phases, and it defaults to false for commands in the test phases.

Please note that since we do not support parallel deployment, specifying `parallel: true` in the deployment phase will cause an error.

Obviously, this is slightly limited because it's hard-coded to
only work with two nodes, and the test time might not balance
across all nodes equally.

### <a name="auto-balancing"></a>Automatic balancing with manual parallel setup

With some of the inferred test commands, we [automatically
balance](https://circleci.com/blog/announcing-automatic-test-balancing/)
the tests so that the total execution time is minimised.

If you are overriding the default test command as explained above and
still want the tests to be automatically balanced, you’ll need to make
sure that the [test metadata]( {{ site.baseurl }}/1.0/test-metadata/)
is collected properly. For example, you would modify the initial RSpec
command like this to include the RSpec Junit formatter:

```
test:
  override:
    - bundle exec rspec --format progress --format RspecJunitFormatter --out $CIRCLE_TEST_REPORTS/rspec.xml:
        parallel: true
        files:
          - spec/unit/sample.rb   # can be a direct path to file
          - spec/**/*.rb          # or a glob (ruby globs)
```

The same principle applies to Cucumber tests — to enable automatic test
balancing when you manually specify the Cucumber command, you would
include the following in your `circle.yml`:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/cucumber:
        parallel: true
    - bundle exec cucumber --format json --out $CIRCLE_TEST_REPORTS/cucumber/tests.cucumber:
        parallel: true
        files:
          - spec/feature/*.feature
```

### Balancing

A more powerful version evenly splits all test files across N nodes. We recommend you write a script that does something like:

```
#!/bin/bash

testfiles=$(find ./test -name '*.py' | sort | awk "NR % ${CIRCLE_NODE_TOTAL} == ${CIRCLE_NODE_INDEX}")

if [ -z "$testfiles" ]
then
    echo "more parallelism than tests"
else
    test-runner $testfiles
fi
```

This script partitions the test files into N equally sized buckets, and calls "test-runner" on the bucket for this machine. Note that you will still need to include `parallel: true` in `circle.yml` with this script.

### Test suite split with knapsack gem

{% include third-party-info.html app='Knapsack'%}

You can parallelize tests for RSpec, Cucumber, Minitest, Spinach and Turnip with [knapsack gem](https://github.com/ArturT/knapsack). It will split tests across CI nodes and it makes sure that tests will run comparable time on each CI node. Knapsack gem has [built in support for CircleCI](https://github.com/ArturT/knapsack#info-for-circleci-users).


### Build matrix support

{% include third-party-info.html app='circleci-matrix'%}

CircleCI 1.0 does not have native support for build matrices. However, there is a community project **not** maintained by CircleCI called [circleci-matrix](https://github.com/michaelcontento/circleci-matrix) which can be used to produce build matrix behaviour on CircleCI. Please see their [documentation for more details](https://github.com/michaelcontento/circleci-matrix). Note that in CircleCI 2.0 you can use parallel jobs to accomplish build matrix behaviors.
