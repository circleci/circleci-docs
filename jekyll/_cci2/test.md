---
layout: classic-docs
title: Automated testing in CircleCI
description: An overview of setting up testing automation, integration, and analytics.
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Introduction
{: #introduction }

CircleCI allows you to automatically test your code before changes are merged. You can integrate testing tools and frameworks such as Jest, Mocha, pytest, JUnit, Selenium, XCTest, and more.

When you integrate your tests into your CircleCI pipelines, you not only deliver software to your users more reliably and efficiently, you get feedback more quickly so you can fix issues and failed tests faster. Test output data becomes available in CircleCI to help debug failed tests. If you save your test data in CircleCI, you can also take advantage of Test Insights as well as parallelism features to identify opportunities to further optimize your pipelines.

## Basics
{: #basics}

To automatically run your test suites in a project pipeline, you will add configuration keys in your `.circleci/config.yml` file. These would typically be defined as a **step** or collection of steps to be executed in a **job**.

A pipeline might consist of a single workflow, with a single job defined that includes a step to execute a suite of tests within an execution environment.

{% include snippets/docker-auth.md %}

```yaml
jobs:
  build-and-test:
    docker:
      - image: cimg/node:16.10
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run tests
          command: npm test
```

`run` is a built-in step that runs commands in a shell. To read more about the `run` step for executing tests and other commands, go to the [Configuration reference](/docs/configuration-reference) page.

Depending on your requirements, you might have more complex workflows that orchestrate multiple jobs. For example, you might have several concurrent jobs for building and testing your project in separate Linux, macOS, and Windows execution environments. You might also want to require that a test job is run only if a preceding build job is successful.

For a more in-depth look at workflows functionality, visit the [Workflows](/docs/workflows) page. You can also refer to the [Sample configuration](/docs/sample-config) page for more workflow examples.

## Use orbs to simplify testing
{: #orbs }

Orbs provide a way to integrate popular testing tools into your configuration. You can invoke CircleCI partner orbs such as Cypress, LambdaTest, and Sauce Labs in your `.circleci/config.yml` file. These orbs will allow you to include common testing tasks in your pipelines by running built-in jobs or concise usage commands in your jobs.

Orbs are available for mobile testing, browser testing, load testing, and code coverage. To get started with orbs, visit the [Orbs introduction](/docs/orb-intro) page. To view the orb registry, visit the [CircleCI Developer Hub](https://circleci.com/developer/orbs?query=&category=Testing).

## Store test data
{: #store-test-data }

Results from testing can be saved in CircleCI in two different ways.

  * Use the `store_test_results` step:

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_test_results:
          path: test-results
    ```

    This step uploads and stores test results, and also enables direct access to output from failed tests on the **Tests** tab of a job in the web app.

    More details on `store_test_results` can be found on the [Configuration reference](/docs/configuration-reference#storetestresults) page.

  * Store test results as artifacts:

    Test results can also be stored as artifacts using the `store_artifacts` step.

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_artifacts:
          path: test-results
          destination: junit
    ```

    Results can later be accessed or downloaded as files via the **Artifacts** section of a job in the CircleCI web app, or through the API.

    More details on `store_artifacts` can be found in the [Configuration reference](/docs/configuration-reference#storeartifacts) page. You can also read more in the [Storing build artifacts](/docs/artifacts) guide.

For more detailed examples of storing test data with different testing frameworks, refer to the [Collect test data](/docs/collect-test-data) page.

## Timing Tab
{: #timing-tab }

When [parallelism and test splitting](/docs/parallelism-faster-jobs/) are enabled, CircleCI provides a bird's-eye view into the timing of each parallel run in the **Timing** tab in the **Job Details** UI.

![Timing tab, parallel runs]({{site.baseurl}}/assets/img/docs/parallel-runs-timing-tests.png)

The Timing tab lets you identify which steps are taking the longest amount of time in a given parallel run so that you can make targeted improvements to reduce overall runtime.

## Test Insights
{: #test-insights }

The test Insights feature is not currently supported for GitLab or GitHub App projects. To find out if you authorized through the GitHub OAuth app or the CircleCI GitHub App, see the [GitHub App integration](/docs/github-apps-integration/) page.
{: class="alert alert-info" }

When test results are stored, test analytics also become available on the **Tests** tab of the **Insights** page in the web app. Metrics for flaky tests, tests with the lowest success rates, and slow tests help you identify opportunities to optimize pipelines as well as further improve your testing strategy.

More information is available on the [Test Insights](/docs/insights-tests) page.

## Re-run failed tests only (circleci tests run)
{: #rerun-failed-tests-only }

You can configure jobs to re-run failed tests only. Using this option, when a transient test failure arises, only a subset of tests are re-run instead of the entire test suite. Also, only failed tests from the same commit are re-run, not new ones.

More information on how to use this option is available on the [Rerun failed tests overview](/docs/rerun-failed-tests/) page.  This functionality uses a command called `circleci tests run`.

Historically, when your testing job in a workflow has flaky tests, the only option to get to a successful workflow was to re-run your workflow from failed. This type of re-run executes all tests from your testing job, including tests that passed, which prolongs time-to-feedback and consumes credits unnecessarily.

## Next steps
{: #next-steps }

* Further optimize your pipelines with [parallelism and test splitting](/docs/parallelism-faster-jobs/).
* Try our [test splitting tutorial](/docs/test-splitting-tutorial).
* Integrate tests for [macOS](/docs/testing-macos) or [iOS](/docs/testing-ios) apps.
* Read our [Browser testing](/docs/browser-testing) guide to common methods for running and debugging browser tests in CircleCI.
* To get event-based notifications in Slack about your pipelines (for example, if a job passes or fails), try our [Slack orb](/docs/slack-orb-tutorial) tutorial.

