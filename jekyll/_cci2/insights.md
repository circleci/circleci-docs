---
layout: classic-docs
title: "Using Insights"
short-title: "Using Insights"
description: "Viewing the status of repos and test performance"
categories: [configuring-jobs]
order: 41
---

This document describes creating and using insights in CircleCI in the following sections:

## Overview

Click the Insights menu item in the CircleCI app to view a dashboard showing the health of all repositories you are following. Median build time, median queue time, last build time, success rate, and parallelism appear for your default branch. **Note:** If you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

The image illustrates the following data about your builds:

- Status of all your repos building on CircleCI in real time

- Median queue time

- Median build time

- Number of branches

- Last build

## Project Insights

Click the Insights icon on the main navigation, then click your repo name to access per-project insights.

The per-project insights page gives you access to the build status and build performance graphs for a selected branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)


- **Build Status:** The Insights dashboard shows the last 50 builds for your default branch. Click a branch in the top right corner to access over 100 build/job statuses for the selected branch.

- **Build Performance:** The Build Performance graph aggregates your build/job data for a particular day and plots the median for that day going back as far as 90 days. Monitor the performance of your repo by clicking a particular branch.

## See Also

Refer to the [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/) document for instructions to configure insights into your most failed tests.

## Sumo Logic Integration

Sumo Logic users may now track and visualize analytical data  across all of their jobs on CircleCI by utilizing the new Sumo Logic Orb and CircleCI App for Sumo Logic app integration on Sumo Logic's partner integrations site.


### The CircleCI Dashboard for Sumo Logic

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

You can install the CircleCI dashboard via the App Catalog from the dashboard home page.

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

This dashboard receives data via the CircleCI Sumo Logic orb which must be included in your projects to be tracked.

### The Sumo Logic Orb

You can find the latest version of the Sumo Logic orb on the [Orb Registry](https://circleci.com/orbs/registry/orb/circleci/sumologic).

#### 1. Import the Sumo Logic orb.
Add the Sumo Logic orb to your project by including the top-level "orbs" key and import `circleci/sumologic@x.y.z` as `sumologic`.

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. Add _Workflow-Collector_ to Workflow.
The `workflow-collector` is a job that will run in parallel along side your workflow and send anyalytics to Sumo Logic until all of the jobs in your Workflow have complete.

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
You will need to create two "source collectors" on Sumo Logic which will return an HTTPS URL which will be used to send your job data to.

You will need to create one called `circleci/job-collector` and another called `circleciworkflow-collector`.

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

**[How to add an environment variable to your project.]({{ site.baseurl }}2.0/env-vars/#setting-an-environment-variable-in-a-project)**

This will link the orb with your Sumo Logic dashboard.

Your Sumo Logic dashboard will now begin to populate with data as each job runs on CircleCI.

## See Also
Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs.
