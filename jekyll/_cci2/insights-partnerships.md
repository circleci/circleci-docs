---
layout: classic-docs
title: "Insights Partnerships"
short-title: "Insights Partnerships"
version:
- Cloud
---

## Overview
{: #overview }

{:toc}

This document describes how you can connect Insights data with third party
providers.

### Sumo Logic integration
{: #sumo-logic-integration }

Sumo Logic users may track and visualize analytical data across all of their
jobs on CircleCI. To do so, use the Sumo Logic Orb and Sumo Logic app
integration from the Sumo Logic partner integrations site.


#### The CircleCI dashboard for Sumo Logic
{: #the-circleci-dashboard-for-sumo-logic }

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

#### The Sumo Logic orb
{: #the-sumo-logic-orb }

Find the latest version of the Sumo Logic orb on the [Orb Registry](https://circleci.com/developer/orbs/orb/circleci/sumologic).

##### 1. Import the Sumo Logic orb.
{: #1-import-the-sumo-logic-orb }
{:.no_toc}

Add the Sumo Logic orb to your project by including the top-level `orbs` key and import `circleci/sumologic@x.y.z` as follows, replacing `x.y.z` with the latest version number at the link above.

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

##### 2. Add _workflow-collector_ to workflow.
{: #2-add-workflow-collector-to-workflow }
{:.no_toc}

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

##### 3. Create two source collectors.
{: #3-create-two-source-collectors }
{:.no_toc}
You will need to create two *source collectors* on Sumo Logic which will return an HTTPS URL. Your job data will be sent to this HTTPS URL.

You will need to create one called `circleci/job-collector` and another called `circleci/workflow-collector`.

To create the two source collectors:
1. From the dashboard select the **Setup Wizard**.
2. Select **Set Up Streaming Data**.
3. Scroll to the bottom and select **All Other Sources**.
4. Select **HTTPS Source**
5. For the `Source Category` enter one of the two mentioned above.
6. Save the resulting URL.

##### 4. Add environment variables.
{: #4-add-environment-variables }
{:.no_toc}

For each of the URLs produce in the previous step, create the corresponding environment variable.

Env vars:
- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[How to add an environment variable to your project.]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

This will link the orb with your Sumo Logic dashboard.

Your Sumo Logic dashboard will now begin to populate with data as each job runs on CircleCI.


## See also
{: #see-also }

Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs.
