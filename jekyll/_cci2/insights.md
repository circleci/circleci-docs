---
layout: classic-docs
title: "Using Insights"
short-title: "Using Insights"
description: "Viewing the status of repos and test performance"
order: 41
version:
- Cloud
- Server v2.x
---

## Overview


The CircleCI Insights dashboard provides an overview of the health and usage of
your repository build processes, allowing users to make better engineering
decisions. _Insights_ provides time-series data overviews of credit usage,
success rates, pipeline duration, and other pertinent information.

This document describes how to access and use the Insights dashboard on CircleCI Cloud and Server.

## Usage (CircleCI Cloud)

Insights across your organization can be accessed from the sidebar of the
CircleCI web application.

To access a specific project's insights, view a pipeline's workflow and click
 the **Insights** button. Alternatively, you may access the Insights page by
 clicking on the **actions** button while viewing the _pipelines dashboard_.

{:.tab.insight-access.Access_by_sidebar}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_pipeline}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

{:.tab.insight-access.Access_by_workflow}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)


### Workflow overview

The Insights dashboard provides workflow details plotted over time.
**Please note that the data is not real time and there may be up to a 24 hour
 delay**. You may also filter by different workflows at the top of the page. The
 following data is charted under the workflow overview:

- All workflow runs
- Workflow success rate
- Workflow duration
- Workflow credit usage*

### Job overview

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

## CircleCI Server Insights

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ Heads up!</span></p>
  <span> The following section refers to using the Insights page on the CircleCI <i>Server</i> product. </span>
</div>

### Overview

Click the Insights menu item in the CircleCI app to view a dashboard showing the health of all repositories you are following. Median build time, median queue time, last build time, success rate, and parallelism appear for your default branch. **Note:** If you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

The image illustrates the following data about your builds:

- Status of all your repos building on CircleCI in real time
- Median queue time
- Median build time
- Number of branches
- Last build

### Project insights

Click the Insights icon on the main navigation, then click your repo name to access per-project insights.

The per-project insights page gives you access to the build status and build performance graphs for a selected branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **Build Status:** The Insights dashboard shows the last 50 builds for your default branch. Click a branch in the top right corner to access over 100 build/job statuses for the selected branch.

- **Build Performance:** The Build Performance graph aggregates your build/job data for a particular day and plots the median for that day going back as far as 90 days. Monitor the performance of your repo by clicking a particular branch.


## Sumo Logic integration

Sumo Logic users may track and visualize analytical data across all of their
jobs on CircleCI. To do so, use the Sumo Logic Orb and Sumo Logic app
integration from the Sumo Logic partner integrations site.


### The CircleCI dashboard for Sumo Logic

![header]({{ site.baseurl }}/assets/img/docs/CircleCI_SumoLogic_Dashboard.png)

Included panels:

- Total Job
- Total Successful Jobs
- Total Failed Jobs
- Job Outcome
- Average Runtime in Seconds (by Job)
- Jobs By Projects
- Recent Jobs (latest 10)
- Top 10 Slowest Failed Jobs In Seconds
- Top 10 Slowest Successful Jobs In Seconds

Install the CircleCI dashboard by using the App Catalog from the dashboard home page.

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

This dashboard receives data through the CircleCI Sumo Logic orb which must be included in your projects to be tracked.

### The Sumo Logic orb

Find the latest version of the Sumo Logic orb on the [Orb Registry](https://circleci.com/developer/orbs/orb/circleci/sumologic).

#### 1. Import the Sumo Logic orb.
Add the Sumo Logic orb to your project by including the top-level `orbs` key and import `circleci/sumologic@x.y.z` as follows, replacing `x.y.z` with the latest version number at the link above.

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. Add _workflow-collector_ to workflow.
The `workflow-collector` job runs concurrently along side your workflow and sends analytics to Sumo Logic until all of the jobs in your workflow have completed.

```yaml
version: 2.1
workflows:
  build-test-and-deploy:
    jobs:
      - sumologic/workflow-collector # add this job to track workflow.
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
```
#### 3. Create two source collectors.
You will need to create two *source collectors* on Sumo Logic which will return an HTTPS URL. Your job data will be sent to this HTTPS URL.

You will need to create one called `circleci/job-collector` and another called `circleci/workflow-collector`.

To create the two source collectors:
1. From the dashboard select the **Setup Wizard**.
2. Select **Set Up Streaming Data**.
3. Scroll to the bottom and select **All Other Sources**.
4. Select **HTTPS Source**
5. For the `Source Category` enter one of the two mentioned above.
6. Save the resulting URL.

#### 4. Add environment variables.
For each of the URLs produce in the previous step, create the corresponding environment variable.

Env vars:
- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[How to add an environment variable to your project.]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

This will link the orb with your Sumo Logic dashboard.

Your Sumo Logic dashboard will now begin to populate with data as each job runs on CircleCI.

## See also

Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs.
Refer to the [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/) document for instructions to configure insights into your most failed tests.
