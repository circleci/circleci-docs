---
layout: classic-docs
title: Test Insights
short-title: Test Insights
description: Analyze your test performance using test Insights.
contentTags:
  platform:
  - Cloud
---

The test Insights feature is not currently supported for GitLab or GitHub App projects. To find out if you authorized through the GitHub OAuth app or the CircleCI GitHub App, see the [GitHub App integration](/docs/github-apps-integration/) page.
{: class="alert alert-info" }

## Overview
{: #overview }

Using CircleCI test Insights, you are able to analyze your test performance within the most recent executions and identify opportunities for test optimization. To access test insights, select the **Tests** tab on the **Workflow Insights** page.

The next sections go over what test insights are available.

### Performance summary
{: #performance-summary }

The summary section displays test suite performance across your most recent 100 runs. You can view the following:

- Average test per run
- Number of all flaky tests detected
- Failure counts
- Slow run times in test suite

![Performance summary example]({{site.baseurl}}/assets/img/docs/test-insights-performance-summary.png)

### Most recent runs
{: #most-recent-runs }

The most recent runs chart displays the most recent 100 executions of the test suite. You can hover over each bar to review the following:

- Test count
- Skipped tests
- Success rate of tests

![Recent runs example]({{site.baseurl}}/assets/img/docs/test-insights-recent-runs.png)

### Flaky tests
{: #flaky-tests }

Flaky tests are tests that fail non-deterministically; they pass and fail due to some state external to the repository. As a result, flaky tests introduce uncertainty to a project’s build state.

Test Insights detect flaky tests by identifying tests that failed and passed on the same commit in a 14-day window. Deterministic tests rely on the state of the repository and demonstrate the same behavior on re-runs. Additionally, these types of tests are labeled “FLAKY” throughout the CircleCI app making them easy to identify and fix.

![Flakey tests Insights example]({{site.baseurl}}/assets/img/docs/test-insights-flaky.png)

### Most failed tests
{: #most-failed-tests }

You can view the 100 tests with the lowest success rates in their most recent pipeline executions. The table provides the following:

- Test name
- Associated job
- Run time
- Success rate

![Most failed tests examples]({{site.baseurl}}/assets/img/docs/test-insights-failed.png)

### Slowest tests
{: #slowest-tests }

You can view the 100 tests with the longest run times in their most recent pipeline executions. The table provides the following:

- Test name
- Associated job
- Run time
- Success rate

![Slowest tests example]({{site.baseurl}}/assets/img/docs/test-insights-slowest.png)
