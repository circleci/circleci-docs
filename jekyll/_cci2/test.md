---
layout: classic-docs
title: "Automated testing in CircleCI"
description: "An overview of setting up testing automation, integration, and analytics"
version:
- Cloud
- Server v3.x
- Server v2.x
---

## Introduction
{: #introduction }

CircleCI allows you to automatically test your code before changes are merged. You can integrate testing tools and frameworks such as Jest, Mocha, pytest, JUnit, Selenium, XCTest, and more.

When you integrate your tests into your CircleCI pipelines, you not only deliver software to your users more reliably and efficiently, you get feedback more quickly so you can fix issues and failed tests faster. If you save your test data in CircleCI, you can also take advantage of the Test Insights as well as parallelism features to identify opportunities to further optimize your pipelines.

## Basics
{: #basics}

To automatically run your test suites in a project pipeline, you will add configuration keys in your `.circleci/config.yml` file. These would typically be defined as a **step** or collection of steps to be executed in a **job**.

A pipeline might consist of a single workflow, with a single job defined that includes a step to execute a suite of tests within an execution environment.

```yaml
# code snippet here
```

To read more about the built-in `run` step for executing tests and other commands, go to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference) reference.

Depending on your requirements, you might have more complex workflows that orchestrate multiple jobs. For example, you might have several concurrent jobs for building and testing your project in separate Linux, macOS, and Windows execution environments. You might also want to require that a test job is run only if a preceding build job is successful.

For a more in-depth look at workflows functionality, read the [Workflows]({{ site.baseurl }}/2.0/workflows) document. You can also refer to the [Sample Configuration]({{ site.baseurl }}/2.0/sample-config) page for more workflow examples.

## Use orbs to simplify testing
{: #orbs }

Orbs provide an easy way to integrate popular testing tools into your configuration. You can invoke CircleCI partner orbs such as Cypress, LambdaTest, and Sauce Labs in your config.yml file. That will then allow you to include common testing tasks in your pipeline by running concise usage commands in your jobs.

Orbs are available for mobile testing, browser testing, load testing, and code coverage. To get started with orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro) document. To view the orb registry, visit the [CircleCI Developer Hub]().

## Store test data
{: #store-test-data }

Results from testing can be saved in CircleCI by adding the following steps within a job:

### `store_test_results`
{: #store-test-results }

This step uploads and stores test results and also enables access to a summary within the CircleCI web app.

More details on `store_test_results` can be found in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference#storetestresults) reference.

#### Test Insights
{: #test-insights }

When test results are stored, test analytics also become available on the **Tests** tab of the **Insights** page in the web app. Metrics for flaky tests, tests with the lowest success rates, and slow tests help you identify opportunities to optimize pipelines as well as further improve your testing strategy.

More information is available in the [Test Insights]({{ site.baseurl }}/2.0/insights-tests) guide.

### `store_artifacts`
{: #store-artifacts }

Test results can also be stored as artifacts. Results can later be accessed or downloaded as files via the **Artifacts** section of a job in the CircleCI web app.

More details on `store_artifacts` can be found in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference#storeartifacts) reference. You can also read more in the [Storing Build Artifacts]({{ site.baseurl }}/2.0/artifacts) guide.

For examples of storing test data with different testing frameworks, refer to the [Collecting Test Data]({{ site.baseurl }}/2.0/collect-test-data) document.

## Next steps
{: #next-steps }

* Further optimize your pipelines with [parallelism and test splitting]({{ site.baseurl }}/2.0/collect-test-data).
* Try our [test splitting tutorial]({{ site.baseurl }}/2.0/test-splitting-tutorial).
* Integrate tests for [macOS]({{ site.baseurl }}/2.0/testing-macos) or [iOS]({{ site.baseurl }}/2.0/testing-ios) apps.
* Read our [Browser Testing]({{ site.baseurl }}/2.0/browser-testing) guide to common methods for running and debugging browser tests in CircleCI.
* To get event-based notifications in Slack about your pipelines (e.g. if a job passes or fails), try our [Slack Orb]({{ site.baseurl }}/2.0/slack-orb-tutorial) tutorial.

