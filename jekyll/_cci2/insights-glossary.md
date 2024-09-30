---
layout: classic-docs
title: Insights metrics glossary
description: Definitions for the metrics in CircleCI Insights, Insights dashboard as well as the Insights API.
contentTags:
  platform:
  - Cloud
  - Server v3.x
---

## Overview
{: #overview }

This document provides definitions for all the metrics in CircleCI Insights. You
can review metrics in the Insights dashboard as well as the Insights API.

## General metrics
{: #general-metrics }

General metrics appear across the Insights experience and can refer to different
entities, depending on the context. For example, the `Runs` metric may refer to a
count of workflow executions or jobs, depending on the context.

| Term                                                 | Definition                                                                                                                                                                                                                                                                                                             |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| {::nomarkdown}<div id="runs-definition">Runs</div>{:/} | The count of executions in a selected time window.                                                                                                                                                                                                                                                                     |
| {::nomarkdown}<div id="totalDuration-definition">Total Duration</div>{:/}         | The sum of execution times for all workflows in a project.                                                                                                                                                                                                                                                             |
| {::nomarkdown}<div id="p95Duration-definition">P95 Duration</div>{:/}            | The 95th percentile of execution times for an entity in a selected time window (i.e. 95% of runs completed in the same or less amount of this time). <br/> _The 95th percentile is a standard measure used to interpret performance data. It provides a measure of max value when outlier or transient values are excluded._ |
| {::nomarkdown}<div id="p50Duration-definition">P50 (median) Duration</div>{:/} | The median execution time. <br/> _Medians are a better measure of central tendency than arithmetic means because they are more resilient to_ skewness _in datasets_.                                                                                                                                                         |
| {::nomarkdown}<div id="totalCredits-general-definition">Total Credits</div>{:/}         | The sum of Docker layer caching (DLC) and compute credits during execution.                                                                                                                                                                                                                                                                      |
| {::nomarkdown}<div id="successRate-definition">Success Rate</div>{:/}         | The percentage of runs that completed successfully, excluding cancelled runs. Calculated by `100 x (Successful Runs / All Runs - Cancelled Runs)`                                                                                                                                                                                                                   |
{: class="table table-striped"}
{: #insights-table}

## Organization-level metrics
{: #organization-level-metrics }

![Organization-level metrics example]({{ site.baseurl }}/assets/img/docs/insights-org-metrics.png)

Organization-level metrics allow you to analyze your organization’s performance.

| Term                    | Definition     |
|-------------------------|----------------|
| {::nomarkdown}<div id="workflowRuns-definition">Workflow Runs</div>{:/} | The count of all workflows executions for an organization for the selected projects in the selected time frame. |
| {::nomarkdown}<div id="totalWorkflowDuration-definition">Total Workflow Duration</div>{:/} | The total execution time of all workflows runs for an organization within the selected projects and time frame. |
| {::nomarkdown}<div id="totalCredits-organization-definition">Total Credits</div>{:/} | The total credits consumed across all selected projects in an organization. |
| {::nomarkdown}<div id="overallSuccesRate-definition">Overall Success Rate</div>{:/} | The percentage of runs that completed successfully across all runs in the selected projects and workflows. Excludes cancelled runs. (calculated by `100 x (All Successful Runs/ All Runs - Cancelled Runs)`) |
{: class="table table-striped"}
{: #insights-table}

## Workflow Metrics
{: #workflow-metrics }

![Workflow metrics example]({{ site.baseurl }}/assets/img/docs/insights-workflow-metrics.png)

| Term                    | Definition     |
|-------------------------|----------------|
| {::nomarkdown}<div id="timeToRecovery-definition">Time to Recovery</div>{:/} | Total time spent in a failed state before a successful execution. |
| {::nomarkdown}<div id="meanTimeToRecovery-definition">Mean Time to Recovery (MTTR)</div>{:/}| The average time it takes to get back to a successful execution from a failed one (Calculated by `total recovery time / # of failures`). <br> _If there are no failed builds (and thus no recoveries) in the current time window, the MTTR value will be empty. Empty MTTR values will be treated as 0 when calculating Trends._ |
| {::nomarkdown}<div id="throughput-definition">Throughput</div>{:/} | The average (mean) number of builds of any status per day. Calculated by `Sum of builds/ # of days.` |
{: class="table table-striped"}
{: #insights-table}

## Trends
{: #trends }

Raw metric values are often difficult to interpret on their own. Trends provide
additional context to Insights metrics by presenting a relative benchmark
against previous performance. For instance, on the last 7-day view, trends will
display the change in value or delta compared to the prior 7-day window.

Trends displayed in the CircleCI UI are calculated as `100 * (current value - previous value) / prior-value`.

Trends received from the [CircleCI API](https://circleci.com/docs/api/v2/index.html#operation/getProjectWorkflowsPageData) are calculated as a ratio instead of a percentage with the following formula: `(current-value / prior-value)`. These trends are 1-based and not 0-based.

* A ratio of 1.0 indicates *no change*.
* A value less than 1.0 indicates a negative trend, and a value greater than 1.0 indicates a positive trend.
* A value of -1.0 is an infinite trend.

This also applies to the following API endpoints:

* [getOrgSummaryData](https://circleci.com/docs/api/v2/index.html#operation/getOrgSummaryData)
* [getWorkflowSummary](https://circleci.com/docs/api/v2/index.html#operation/getWorkflowSummary).

Despite the trend being reported as a ratio via the API, the result returned is still effectively equivalent to the percentage that is shown in the UI. To compare the ratio from the API with the percentage reported in the UI, you can compute `| trend-value - 1|` (vertical line indicates absolute value). For example, if the API returns a ratio of 3.33, in the UI it will be shown as `| 3.33 - 1 | = 2.33` which is equivalent to +233%.

Trends are available only for 24-hour, 7-day, and 30-day time windows.
{: class="alert alert-info"}

### Approximate Trends
{: #approximate-trends }

For percentile metrics like duration, approximation methods are used to find the prior window benchmarks.

#### Duration
{: #duration }

**P95 Duration**

For P95 duration, trends data is calculated by using the worst-case performance
of the previous time window as a benchmark.

For example, to calculate the last 7-day trend information, Insights selects the
worst/largest daily P95 duration of the previous 7 days as a benchmark. For the
last 24-hour trends, Insights selects the worst hourly P95 of the previous 24
hours as a benchmark.

**P50 Duration**

For P50 duration, Trends compares current duration with the median performance
of the prior time window. For example, the last 30-day trends for P50 duration
are calculated by taking the median of the daily P50 values as a benchmark.


### Representations of trend data
{: #representations-of-trend-data }


This section describes how your trend data may appear across various metrics.

![Trends data example]({{ site.baseurl }}/assets/img/docs/insights_trend_data.png)

- **Green**: The metric is trending in the right direction.
- **Red**: The metric is trending in the wrong direction.
- **Grey**: A trend in either direction is not right or wrong.

Red and Green are used when describing the `Success Rate`, `Throughput` and `MTTR` metrics. Grey arrows are used when describing `Runs`, `Duration` and `Total Credits`

**Percentages**

Percentages indicate the relative percentage change for a metric in
the selected time window compared to the prior window. For instance, if the
success rate of a workflow in the last 7 days has increased to 60% from 40% in
the prior 7 days, Trends displays the +50% change in the current time window.

**Multiples**

Multiples are used to indicate large swings in relative change over the selected
period.

**Arrows**

Trend arrows with no values are used to indicate that the previous time window
contains zero executions or no data.

**No Trend Data**

Empty trend values indicate that there has been no change in data between the
two periods.
