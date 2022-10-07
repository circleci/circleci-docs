---
layout: classic-docs
title: Insights Partnerships
description: This document describes how users may track and visualize analytical data across all of their jobs on CircleCI with third party integrations.
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Overview
{: #overview }

{:toc}

This document describes how you can connect Insights data with third party providers. Currently we support integrations with [New Relic](https://newrelic.com/), [Datadog](https://www.datadoghq.com/) and [Sumo Logic](https://www.sumologic.com/).

## New Relic integration

The [New Relic CircleCI integration](https://newrelic.com/instant-observability/circleci) allows users to view analytical data about their CircleCI jobs within the New Relic monitoring stack.

Complete these steps to set up a CircleCI webhook to forward your logs to New Relic:

**Step 1.** Log in to [CircleCI](https://app.circleci.com/projects).

**Step 2.** Go to one of your CircleCI projects.

**Step 3.** Click **Project settings**.

**Step 4.** In the sidebar of your Project Settings, click **Webhooks**.

**Step 5.** Click **Add webhook**.

**Step 6.** Name your webhook.

**Step 7.** Enter New Relic's **Logs endpoint:**

US:

`https://log-api.newrelic.com/log/v1?Api-Key=YOUR_LICENSE_KEY`

EU:

`https://log-api.eu.newrelic.com/log/v1?Api-Key=YOUR_LICENSE_KEY`

Use the region you set on your New Relic account. Replace `YOUR_LICENSE_KEY` with your New Relic license key, which you can [retrieve from the UI or API](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#manage-license-key).

**Step 8.** Select either **Workflow** or **Job**, depending on the type of event you want to trigger the logpush.

**Step 9.** If you've set up your receiving API or third-party service, click **Test ping event** to create a test event.

For more information, refer to the New Relic CircleCi [installation docs](https://docs.newrelic.com/docs/logs/forward-logs/circleci-logs/).

## Datadog integration
{: #datadog-integration }

You can send data to Datadog through the use of webhooks with CircleCI.

1. In the [CircleCI App](https://app.circleci.com/), click on the ellipsis menu for each project, and then click **Project Settings** > **Webhooks**.
  - **Webhook URL**: `https://webhook-intake.datadoghq.com/api/v2/webhook/?dd-api-key=<API_KEY>` where `<API_KEY>` is your [Datadog API key](https://app.datadoghq.com/account/login).
  - **Name**: `Datadog CI Visibility` or any other identifier name that you want to provide.
  - **Events**: Select `Workflow Completed` and `Job Completed`.
  - **Certificate verifications**: Enable this check.

1. Click **Add Webhook** to save the new webhook.

### Visualize pipeline data in Datadog
{: #visualize-pipeline-data-in-datadog }

Sign in to [Datadog](https://app.datadoghq.com/account/login) and visit the Pipelines and Pipeline Executions pages to see data populate after workflows finish.

**Note**: The Pipelines page will only show data for the default branch of each repository.

## Sumo Logic integration
{: #sumo-logic-integration }

The CircleCI app for Sumo Logic provides advanced views to track the performance and health of your continuous integration and deployment pipelines.


### The CircleCI dashboard for Sumo Logic
{: #the-circleci-dashboard-for-sumo-logic }

Use this dashboard to:
  - Monitor real-time CI performance, activity, and health, or track over time.
  - Identify opportunities for optimization.

![header]({{ site.baseurl }}/assets/img/docs/Sumologic_Demo.png)

Gain insights into your pipelines with the included dashboard panels. Filter each panel for specific projects or jobs, over any period of time. Available dashboard panels include:

  - Total Jobs Ran
  - Job Health (% success)
  - Summary
  - Jobs Ran Per Project
  - Daily Performance
  - Jobs Per Day
  - 5 Most Recent Failed Jobs
  - 5 Most Recent Failed Workflows
  - Top 10 Longest Workflows (Averaged)
  - Top 10 Longest Running Jobs
  - Average Job Runtime Per Day

Install the CircleCI dashboard by using the App Catalog from the dashboard home page.

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

This dashboard receives data through the CircleCI Sumo Logic orb which must be included in your projects to be tracked.

### Set up Sumo Logic metrics using CircleCI webhooks
{: #set-up-sumo-logic-metrics-using-circleci-webhooks }

To begin collecting and visualizing data with Sumo Logic, first configure CircleCI webhooks to send metrics data to Sumo Logic.
#### Configure Webhooks
{: #configure-webhooks }
##### **Step 1. Configure Hosted Collector**
{: #step-1-configure-hosted-collector }

Follow the Sumo Logic documentation for [Configuring a Hosted Collector](https://help.sumologic.com/03Send-Data/Hosted-Collectors/Configure-a-Hosted-Collector).

##### **Step 2. Add an HTTP Source**
{: #step-2-add-an-http-source }

To get the URL where the CircleCI Webhooks will be sent, and then recorded to the collector, we must [add an HTTP Source](https://help.sumologic.com/03Send-Data/Sources/02Sources-for-Hosted-Collectors/HTTP-Source).

When complete, copy the generated “HTTP Source Address”. You can always get this link from Sumo Logic again in the future. This is the URL that will need to be entered in the CircleCI Webhooks UI in the next step.

##### **Step 3. Configure Project Webhooks**
{: #step-3-configure-project-webhooks }

For each project on CircleCI you wish to track, configure a webhook directed at the HTTP Source Address.
Follow the [CircleCI docs for configuring webhooks]({{ site.baseurl }}/webhooks/#setting-up-a-hook).

When configuring the webooks, ensure to include both the “workflow-completed”, and “job-completed” events.

### Install the CircleCI App for Sumo Logic
{: #install-the-circleci-app-for-sumo-logic }

Now that you have set up collection, install the Sumo Logic App for CircleCI to use the preconfigured searches and Dashboards that provide insight into your CI Pipeline.

#### To install the CircleCI app for Sumo Logic:
{: #to-install-the-circleci-app-for-sumo-logic }

1. Locate and install the CircleCI app from the App Catalog. If you want to see a preview of the dashboards included with the app before installing, click **Preview Dashboards**.
2. Select the version of the service you are using and click **Add to Library**. Version selection is applicable only to a few apps currently. For more information, see the [Install the Apps from the Library](https://help.sumologic.com/05Search/Library/Apps-in-Sumo-Logic/Install-Apps-from-the-Library) document.
3. To install the app, complete the following fields.
  - **App Name**. You can retain the existing name, or enter a name of your choice for the app.
  - **Data Source**. Select either of these options for the data source:
    - Choose **Source Category**, and select a source category from the list.
    - Choose **Enter a Custom Data Filter**, and enter a custom source category beginning with an underscore. Example: `(_sourceCategory=MyCategory)`.
  - **Advanced**. Select the Location in Library (the default is the Personal folder in the Library), or click **New Folder** to add a new folder.
4. Click **Add to Library**.

Once an app is installed, it will appear in your Personal folder, or wherever you set to be the default in your library. From here, you can share it with your organization.
Panels will start to fill automatically. It is important to note that each panel slowly fills with data matching the time range query and received since the panel was created. Results won't immediately be available, but with a bit of time, you will see full graphs and maps.
