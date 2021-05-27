---
layout: classic-docs
title: "Test Insights"
short-title: "Using Test Insights"
description: "Using Test Insights"
version:
- Cloud
---

## Overview
{: #overview }

Using CircleCI Test Insights, users are able to analyze their test performance
within their most recent executions and identify opportunities for test
optimization. To access Test Insights, select the **Tests** tab on the
**Workflow Insights** page.

The following test insights are available:

### Performance Summary
{: #performance-summary }


![]({{ site.baseurl }}/assets/img/docs/insights-test-performance.png)

The summary chart displays test performance across the most recent 10 workflow
runs. Users can hover over each bar to review the test count, skipped tests, and
success rate of their tests.

### Top 10 Most Failed Tests
{: #top-10-most-failed-tests }

![]({{ site.baseurl }}/assets/img/docs/insights-test-most-failed.png)

Users can view the 10 tests with the lowest success rates in their most recent
pipeline executions. The table provides the Test name, the associated Job, run
time, and success rate.


### Top 10 Slowest Tests
{: #top-10-slowest-tests }

![]({{ site.baseurl }}/assets/img/docs/insights-test-slowest.png)

Users can view the 10 tests with the longest run times in their most recent
pipeline executions. The table provides the Test name, the associated Job, run
time, and success rate.

