---
layout: classic-docs
title: "Scheduled Pipelines"
short-title: "Scheduled Pipelines"
description: "Learn how to schedule pipelines for your CircleCI projects."
order: 20
contentTags: 
  platform:
  - Cloud
suggested:
  - title: Manual job approval and scheduled workflow runs
    link: https://circleci.com/blog/manual-job-approval-and-scheduled-workflow-runs/
  - title: How to trigger a workflow
    link: https://support.circleci.com/hc/en-us/articles/360050351292?input_string=how+can+i+share+the+data+between+all+the+jobs+in+a+workflow
  - title: Conditional workflows
    link: https://support.circleci.com/hc/en-us/articles/360043638052-Conditional-steps-in-jobs-and-conditional-workflows
---

* TOC
{:toc}

## Overview
{: #overview }

Scheduled pipelines allow you to trigger pipelines periodically based on a schedule.

Since the scheduled run is based on pipelines, scheduled pipelines have all the features that come with using pipelines:

- Control the actor associated with the pipeline, which can enable the use of [restricted contexts]({{site.baseurl}}/contexts/#restricting-a-context).
- Use [dynamic config]({{site.baseurl}}/dynamic-config/) via setup workflows.
- Modify the schedule without having to edit `.circleci/config.yml`.
- Take advantage of [auto-cancelling]({{site.baseurl}}/skip-build/#auto-cancelling).
- Specify [pipeline parameters]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration) associated with a schedule.
- Manage common schedules, e.g. across workflows.

Scheduled pipelines are configured through the API, or through the project settings in the CircleCI web app.

A scheduled pipeline can only be configured for one branch. If you need to schedule for two branches, you would need to set up two schedules.
{: class="alert alert-info"}

## Get started with scheduled pipelines in CircleCI
{: #get-started-with-scheduled-pipelines-in-circleci }

You have the option of setting up scheduled pipelines from scratch, or you can migrate existing scheduled workflows to scheduled pipelines.

### Start from scratch
{: #start-from-scratch }

#### Use the API
{: #api }

If your project has no scheduled workflows and you would like to try out scheduled pipelines:

1. Have your CCI token ready, or create a new token by following [these steps]({{site.baseurl}}/managing-api-tokens/).
2. [Create a new schedule using the API](https://circleci.com/docs/api/v2/index.html#operation/createSchedule). For example:

```shell
curl --location --request POST "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>" \
--header "Content-Type: application/json" \
--data-raw '{
    "name": "my schedule name",
    "description": "some description",
    "attribution-actor": "system",
    "parameters": {
      "branch": "main"
      <additional pipeline parameters can be added here>
    },
    "timetable": {
        "per-hour": 3,
        "hours-of-day": [1,15],
        "days-of-week": ["MON", "WED"]
    }
}'
```

For additional information, refer to the **Schedule** section under the [API v2 docs](https://circleci.com/docs/api/v2/).

#### Use project settings
{: #project-settings }

1. In the CircleCI application, navigate to **Projects** in the sidebar, then click the ellipsis (...) next to your project. You can also find the **Project Settings** button on each project's landing page.
2. Navigate to **Triggers**.
3. To create a new schedule, click **Add Scheduled Trigger**.
4. Define the new schedule's name, timetable, pipeline parameters, and attribution actor (i.e. user associated with the schedule), then save the trigger.

### Migrate scheduled workflows to scheduled pipelines
{: #migrate-scheduled-workflows }

The current method for scheduling work on your projects is to use the scheduled workflows feature. This feature has some limitations, so consider migrating your scheduled workflows to the scheduled pipelines feature. Some limitations of scheduled workflows are:

* Cannot control the actor, so scheduled workflows can't use restricted contexts.
* Cannot control the interaction with auto-cancelling of pipelines.
* Cannot use scheduled workflows together with dynamic config without complex workarounds.
* Cannot change or cancel scheduled workflows on a branch without triggering a pipeline.
* Cannot kick off test runs for scheduled workflows without changing the schedule.
* Cannot restrict scheduled workflows from PR branches if you want the workflow to run on webhooks.

To migrate from scheduled workflows to scheduled pipelines, follow the steps below:

1. Find the scheduled trigger in your project's `.circleci/config.yml`
    For example, it might look like:

    ```yaml
    daily-run-workflow:
      triggers:
        - schedule:
            # Every day, 0421Z.
            cron: "21 4 * * *"
            filters:
              branches:
                only:
                  - main
      jobs:
        - test
        - build
    ```
2. Interpret the frequency your trigger needs to run from the cron expression.
3. Use the same step from the [Start from scratch](#start-from-scratch) section above to create the schedule via the API or project settings.
4. In the config file, remove the `triggers` section, so that it resembles a standard workflow.
    ```yaml
    daily-run-workflow:
      jobs:
        - test
        - build
    ```

#### Add workflows filtering
{: #add-workflows-filtering }

As a scheduled pipeline is essentially a triggered pipeline, it will run every workflow in the config.

One way to implement workflows filtering is by using the [pipeline values]({{site.baseurl}}/pipeline-variables/#pipeline-values). For example:

```yaml
daily-run-workflow:
  when:
    and:
      - equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build
```

Note that in the above example, the second `equal` under `when` is not strictly necessary. The `pipeline.schedule.name` is an available pipeline value when the pipeline is triggered by a schedule.

You may also add filtering for workflows that should NOT run when a schedule triggers:

{% raw %}
```yaml
daily-run-workflow:
  when:
    and:
      - equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build

other-workflow:
  when:
    not:
      equal: [ scheduled_pipeline, << pipeline.trigger_source >> ]
  jobs:
   - build
   - deploy
```
{% endraw %}

## FAQs
{: #faq }

**Q:** How do I find the schedules that I have created?

**A:** As scheduled pipelines are stored directly in CircleCI, there is a UUID associated with each schedule. You can view schedules that you have created on the **Triggers** page of the project settings. You can also list all the schedules under a single project:

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

`project-slug` takes the form of `vcs-slug/org-name/repo-name`, e.g. `gh/CircleCI-Public/api-preview-docs`.

**Q:** Why is my scheduled pipeline not running?

**A:** There could be a few possible reasons:
* Is the actor who is set for the scheduled pipelines still part of the organization?
* Is the branch set for the schedule deleted?
* Is your GitHub organization using SAML protection? SAML tokens expire often, which can cause requests to GitHub to fail.

**Q:** Why did my scheduled pipeline run later than expected?

**A:** There is a nuanced difference in the scheduling expression with Scheduled Pipelines, compared to [the Cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

For example, when you express the schedule as 1 per-hour for 08:00 UTC, the scheduled pipeline will run once within the 08:00 to 09:00 UTC window.
Note that it does not mean that it will run at 08:00 UTC exactly.

However, subsequent runs of the scheduled pipeline will always be run on the same time as its previous run.
In other words, if a previous scheduled pipeline ran at 08:11 UTC, the next runs should also be at 08:11 UTC.

**Q:** Do you support regex?

**A:** 
Not currently. Scheduled pipelines require highly deterministic inputs such as a commit SHA, branch, or tag (fully qualified, no regexes) included in the webhook, API call, or schedule. 
