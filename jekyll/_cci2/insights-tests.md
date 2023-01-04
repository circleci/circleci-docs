---
layout: classic-docs
title: "Test Insights"
short-title: "Using Test Insights"
description: "Using Test Insights"
contentTags: 
  platform:
  - Cloud
---

## Overview
{: #overview }

Using CircleCI test insights, you are able to analyze your test performance within the most recent executions and identify opportunities for test optimization. To access test insights, select the **Tests** tab on the **Workflow Insights** page.

The next sections go over what test insights are available.

### Performance Summary
{: #performance-summary }

The summary section displays test suite performance across your most recent 100 runs. You can view the following:
- average test per run
- number of all flaky tests detected
- failure counts
- slow run times in test suite

![Performance summary example]({{ site.baseurl }}/assets/img/docs/test-insights-performance-summary.png)

### Most Recent Runs
{: #most-recent-runs }

The most recent runs chart displays the most recent 100 executions of the test suite. You can hover over each bar to review the following:
- test count
- skipped tests
- success rate of tests

![Recent runs example]({{ site.baseurl }}/assets/img/docs/test-insights-recent-runs.png)

### Flaky Tests
{: #flaky-tests }

Flaky tests are tests that fail non-deterministically; they pass and fail due to some state external to the repository. As a result, flaky tests introduce uncertainty to a project’s build state.

Test insights detect flaky tests by identifying tests that failed and passed on the same commit in a 14-day window. Deterministic tests rely on the state of the repository and demonstrate the same behavior on re-runs. Additionally, these types of tests are labeled “FLAKY” throughout the CircleCI app making them easy to identify and fix.

![Flakey tests insights example]({{ site.baseurl }}/assets/img/docs/test-insights-flaky.png)

### Most Failed Tests
{: #most-failed-tests }

You can view the 100 tests with the lowest success rates in their most recent pipeline executions. The table provides the following:
- test name
- associated job
- run time
- success rate

![Most failed tests examples]({{ site.baseurl }}/assets/img/docs/test-insights-failed.png)

### Slowest Tests
{: #slowest-tests }

You can view the 100 tests with the longest run times in their most recent pipeline executions. The table provides the following:
- test name
- associated job
- run time
- success rate

![Slowest tests example]({{ site.baseurl }}/assets/img/docs/test-insights-slowest.png)
