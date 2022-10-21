---
layout: classic-docs
title: "Using Insights"
short-title: "Using Insights"
description: "Viewing the status of repos and test performance"
order: 41
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

## Overview
{: #overview }


The CircleCI Insights dashboard provides an overview of the health and usage of
your repository build processes, allowing users to make better engineering
decisions. _Insights_ provides time-series data overviews of credit usage,
success rates, pipeline duration, and other pertinent information.

This document describes how to access and use the Insights dashboard on CircleCI Cloud and Server.

## Usage
{: #usage }

Insights across your organization can be accessed from the sidebar of the
CircleCI web application.

To access a specific project's insights, view a pipeline's workflow and click
 the **Insights** button. Alternatively, you may access the Insights page by
 clicking on the **actions** button while viewing the _pipelines dashboard_.

{:.tab.insight-access.Access_by_sidebar}
![Access insights from the CircleCI web app sidebar]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_pipeline}
![Access insights from a pipeline in the CircleCI web app]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

{:.tab.insight-access.Access_by_workflow}
![Access insights from a workflow in the CircleCI web app]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)


### Workflow overview
{: #workflow-overview }

The Insights dashboard provides workflow details plotted over time.
**Please note that the data is not real time and there may be up to a 24 hour
 delay**. You may also filter by different workflows at the top of the page. The
 following data is charted under the workflow overview:

- All workflow runs
- Workflow success rate
- Workflow duration
- Workflow credit usage*

### Job overview
{: #job-overview }

Switch to the **Job** tab to view cumulative time-series data on a per-job basis:

- Total credits used*
- Duration (the 95th percentile)
- Total runs
- Success rate


<small>
<i> * The Insights dashboard is not a real time financial reporting tool and should
not be used for credit reporting. The most up to date credit information can be
found in your organization's Plan Overview.</i>
</small>

---

## CircleCI Server v2.19.x Insights
{: #circleci-server-v219x-insights }

⚠️ **Heads up!**
The following section refers to using the Insights page on installations of CircleCI Server v2.19.x.
{: class="alert alert-warning"}

### Overview
{: #overview }

Click the Insights menu item in the CircleCI app to view a dashboard showing the health of all repositories you are following. Median build time, median queue time, last build time, success rate, and parallelism appear for your default branch. **Note:** If you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

The image illustrates the following data about your builds:

- Status of all your repos building on CircleCI in real time
- Median queue time
- Median build time
- Number of branches
- Last build

### Project insights
{: #project-insights }

Click the Insights icon on the main navigation, then click your repo name to access per-project insights.

The per-project insights page gives you access to the build status and build performance graphs for a selected branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **Build Status:** The Insights dashboard shows the last 50 builds for your default branch. Click a branch in the top right corner to access over 100 build/job statuses for the selected branch.

- **Build Performance:** The Build Performance graph aggregates your build/job data for a particular day and plots the median for that day going back as far as 90 days. Monitor the performance of your repo by clicking a particular branch.


## See also
{: #see-also }

Refer to the [Collecting Test Metadata]({{ site.baseurl }}/collect-test-data/) document for instructions to configure insights into your most failed tests.

## Learn More
{: #learn-more }
Take the [insights course](https://academy.circleci.com/insights-course?access_code=public-2021) with CircleCI Academy to learn more.
