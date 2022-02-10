---
layout: classic-docs
title: "Running Tests in Parallel"
short-title: "Running Tests in Parallel"
description: "How to run tests in parallel"
categories: [optimization]
order: 60
version:
- Cloud
- Server v3.x
- Server v2.x
---

The more tests your project has, the longer it will take for them to complete on a single machine. To reduce this time, you can run tests in parallel by spreading them across multiple separate executors. This requires specifying a parallelism level to define how many separate executors get spun up for the test job. Then, you can use either the CircleCI CLI to split test files, or use environment variables to configure each parallel machine individually.

* TOC
{:toc}

## Specifying a job's parallelism level
{: #specifying-a-jobs-parallelism-level }

Test suites are conventionally defined at the [job]({{ site.baseurl }}/2.0/jobs-steps/#sample-configuration-with-concurrent-jobs) level in your `.circleci/config.yml` file.
The `parallelism` key specifies how many independent executors will be set up to run the steps of a job.

To run a job's steps in parallel, set the `parallelism` key to a value greater than 1.

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
```

![Parallelism]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

For more information,
see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document.

## Using the CircleCI CLI to split tests
{: #using-the-circleci-cli-to-split-tests }

CircleCI supports automatic test allocation across your containers. The allocation is filename or classname based, depending on the requirements of the test-runner you are using. It requires the CircleCI CLI, which is automatically injected into your build at run-time.

To install the CLI locally, see the [Using the CircleCI Local CLI]({{ site.baseurl }}/2.0/local-cli/) document.

Note: The `circleci tests` commands (`glob` and `split`) cannot be run locally via the CLI as they require information that only exists within a CircleCI container.

### Splitting test files
{: #splitting-test-files }
{:.no_toc}

The CLI supports splitting tests across machines when running parallel jobs. This is achieved by passing a list of either files or classnames, whichever your test-runner requires at the command line, to the `circleci tests split` command.

#### Globbing test files
{: #globbing-test-files }
{:.no_toc}

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

#### Splitting by timing data
{: #splitting-by-timing-data }

The best way to optimize your test suite across a set of parallel executors is to split your tests using timing data. This will ensure the tests are split in the most even way, leading to a shorter overall test time.

![Test Splitting]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

On each successful run of a test suite, CircleCI saves timings data from the directory specified by the path in the [`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) step. This timings data consists of how long each test took to complete per filename or classname, depending on the language you are using.

Note: If you do not use `store_test_results`, there will be no timing data available for splitting your tests.

To split by test timings, use the `--split-by` flag with the `timings` split type. The available timings data will then be analyzed and your tests will be split across your parallel-running containers as evenly as possible leading to the fastest possible test run time

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

The CLI expects both filenames and classnames to be present in the timing data produced by the testing suite. By default, splitting defaults to filename, but you can specify classnames by using the `--timings-type` flag.

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

For partially found test results, we automatically assign a random small value to any test we did not find timing data for. You can override this assigned value to a specific value with the `--time-default` flag.

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

If you need to manually store and retrieve timing data, use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step.

Note: If no timing data is found, you will receive a message: `Error autodetecting timing type, falling back to weighting by name.`. The tests will then be split alphabetically by test name.

#### Splitting by name
{: #splitting-by-name }
{:.no_toc}

By default, if you don't specify a method using the `--split-by` flag, `circleci tests split` expects a list of filenames/classnames and splits tests alphabetically by test name. There are a few ways to provide this list:

Create a text file with test filenames.

```shell
circleci tests split test_filenames.txt
```

Provide a path to the test files.

```shell
circleci tests split < /path/to/items/to/split
```

Or pipe a glob of test files.

```shell
circleci tests glob "test/**/*.java" | circleci tests split
```

The CLI looks up the number of available containers, along with the current container index. Then, it uses deterministic splitting algorithms to split the test files across all available containers.

By default, the number of containers is specified by the `parallelism` key. You can manually set this by using the `--total` flag.

```shell
circleci tests split --total=4 test_filenames.txt
```

Similarly, the current container index is automatically picked up from environment variables, but can be manually set by using the `--index` flag.

```shell
circleci tests split --index=0 test_filenames.txt
```

#### Splitting by filesize
{: #splitting-by-filesize }
{:.no_toc}

When provided with filepaths, the CLI can also split by filesize. To do this, use the `--split-by` flag with the `filesize` split type.

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

## Using environment variables to split tests
{: #using-environment-variables-to-split-tests }

For full control over parallelism, CircleCI provides two environment variables that you can use in lieu of the CLI to configure each container individually.
`CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job, and `CIRCLE_NODE_INDEX` is the index of the specific container that is currently running.
See the [built-in environment variable documentation]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) for more details.

## Running split tests
{: #running-split-tests }

Globbing and splitting tests does not actually run your tests. To combine test grouping with test execution, consider saving the grouped tests to a file, then passing this file to your test runner.

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

The contents of the file `/tmp/tests-to-run` will be different in each container, based on `$CIRCLE_NODE_INDEX` and `$CIRCLE_NODE_TOTAL`.

## Using test splitting with Python Django tests
{: #using-test-splitting-with-python-django-tests }

To utilize test splitting with CircleCI, you must pass in a list of tests to run. However, with how you execute tests with Django, you are unable to simply glob the tests and pass them in.

Sometimes, users run into specific issues when performing test splitting for their own unique use cases. One example of a user resolving an issue when test splitting in Python Django did not perform correctly can be found in the following Discuss post, which can be found [here](https://discuss.circleci.com/t/python-django-tests-not-being-split-correctly/36624)

Using this example, here is a quick example of how you can accomplish test splitting:
```yml
- run:
    command: |
      # get test files while ignoring __init__ files
      TESTFILES=$(circleci tests glob "catalog/tests/*.py" | sed 's/\S\+__init__.py//g')
      echo $TESTFILES | tr ' ' '\n' | sort | uniq > circleci_test_files.txt
      cat circleci_test_files.txt
      TESTFILES=$(circleci tests split --split-by=timings circleci_test_files.txt)
      # massage filepaths into format manage.py test accepts
      TESTFILES=$(echo $TESTFILES | tr "/" "." | sed 's/\.py$//g')
      echo $TESTFILES
      pipenv run python manage.py test --verbosity=2 $TESTFILES
```

## Using test splitting with pytest
{: #using-test-splitting-with-pytest }

If you try to split your tests across containers with pytest, you may encounter any of the following errors:

```shell
No timing found for "tests/commands/__init__.py"
No timing found for "tests/commands/test_1.py"
No timing found for "tests/commands/test_2.py"
```

If any of these errors are returned, you may need to make a few adjustments, which are listed below.

### Are you setting a custom working_directory?
{: #are-you-setting-a-custom-working-directory? }

If so, you may need to adjust the file paths that are saving to your test metadata XML file. Alternatively, if you are able to, try working out of the standard working directory we set for a container to see if that helps (you can do this by removing any instances of `working_directory` in your test run job).

### Where does your `pytest.ini` live?
{: #where-does-your-pytest-ini-live }

To ensure test splitting performs correctly, make sure you are running your tests in the root directory. If your tests are not being run in the root directory, you may need to run the following command before you test the `run` command:

```shell
cp -f .circleci/resources/pytest_build_config.ini pytest.ini
```

The `.circleci/resources/pytest_build_config.ini` path may need to be replaced to point to where it's located in your project.

### Are you setting the junit_family in your pytest.ini?
{: #are-you-setting-the-junit-family-in-your-pytest-ini }

Check to see if you have something like `junit_family=legacy` set in your pytest.ini file. For more information on how to set `junit_family`, refer to the following page, which can be found [here](https://docs.pytest.org/en/stable/_modules/_pytest/junitxml.html)

Search for "families" to see the relevant information.

### Example project that correctly splits by timings
{: #example-project-that-correctly-splits-by-timing }

The example below is a fork of our `sample-python-cfd` project(https://github.com/CircleCI-Public/sample-python-cfd) that shows how you can implement test splitting:

```yml
version: 2.1
orbs:
  python: circleci/python@1.2
jobs:
  build-and-test:
    parallelism: 2
    docker:
      - image: cimg/python:3.8
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Run tests
          command: |
            set -e
            TEST_FILES=$(circleci tests glob "openapi_server/**/test_*.py" | circleci tests split --split-by=timings)
            mkdir -p test-results
            pytest --verbose --junitxml=test-results/junit.xml $TEST_FILES
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
workflows:
  sample:
    jobs:
      - build-and-test
```

You may find an example build of proper test splitting [here](https://app.circleci.com/pipelines/github/nbialostosky/sample-python-cfd/18/workflows/8b37bd45-ed19-42e1-8cc4-44401697f3fc/jobs/20)

### Video: troubleshooting globbing
{: #video-troubleshooting-globbing }
{:.no_toc}

Note: To follow along with the commands in the video below you will need to be [`SSH-ed into a job`]({{ site.baseurl }}/2.0/ssh-access-jobs/).

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## See also
{: #see-also }

[Using Containers]({{ site.baseurl }}/2.0/containers/)

## Other ways to split tests
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test
suite. These applications are not developed or supported by CircleCI. Please check with the owner if you have issues using it with CircleCI. If you're unable to resolve the issue you can search and ask on our forum, [Discuss](https://discuss.circleci.com/).

- **[Knapsack Pro](https://knapsackpro.com)** - Enables allocating tests
  dynamically across parallel CI nodes, allowing your test suite exection to run
  faster. See [CI build time graph examples](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress).

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)** - This is
  a helper CLI tool that queries `phpunit.xml` files to get a list of test
  filenames and print them. This is useful if you want to split tests to run
  them in parallel based on timings on CI tools.
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)** - Use the built-in Go command `go list ./...` to glob Golang packages. This allows splitting package tests across multiple containers.

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```
