---
layout: classic-docs
title: "Scheduled Pipelines"
short-title: "Scheduled Pipelines"
description: "Learn about schedule pipeline for CircleCI projects."
order: 20
contentTags: 
  platform:
  - Cloud
---

## Introduction
{: #introduction }

Scheduled pipelines allow you to trigger pipelines periodically based on a schedule. Scheduled pipelines retain all the features of pipelines:

- Control the actor associated with the pipeline, which can enable the use of [restricted contexts]({{site.baseurl}}/contexts/#restricting-a-context)
- Use [dynamic config]({{site.baseurl}}/dynamic-config/) via setup workflows
- Modify the schedule without having to edit `.circleci/config.yml`
- Take advantage of [auto-cancelling]({{site.baseurl}}/skip-build/#auto-cancelling)
- Specify [pipeline parameters]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration) associated with a schedule
- Manage common schedules, for example, across workflows

Scheduled pipelines are configured through the API, or through the project settings in the CircleCI web app.

A scheduled pipeline can only be configured for one branch. If you need to schedule for two branches, you would need to set up two schedules.
{: class="alert alert-info"}

## Get started with scheduled pipelines
{: #get-started-with-scheduled-pipelines }

To get started with scheduled pipelines, you have the option of using the API, or using the CircleCI web app. Both methods are described below. If you have existing workflows you need to migrate to scheduled pipelines, use the [Scheduled pipelines migration]({{site.baseurl}}/migrate-scheduled-workflows-to-scheduled-pipelines) guide.

### Use the API
{: #use-the-api }

If your project has no scheduled workflows, and you would like to try out scheduled pipelines:

1. Have your CCI token ready, or create a new token by following the steps on the [Managing API tokens]({{site.baseurl}}/managing-api-tokens/) page.
2. Create a new schedule [using the API](https://circleci.com/docs/api/v2/index.html#operation/createSchedule). For example:

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

### Use project settings in the web app
{: #use-project-settings }

1. In the CircleCI web app, navigate to **Projects** in the sidebar, then click the ellipsis (...) next to your project and click on **Project Settings**. You can also find the **Project Settings** button on each project's landing page.
2. Navigate to **Triggers**.
3. To create a new schedule, click **Add Trigger**.
4. Define the new schedule by filling out the form, then click **Save Trigger**.

The form also provides the option of adding [pipeline parameters]({{site.baseurl}}/pipeline-variables/), which are typed pipeline variables declared at the top level of a configuration.

## Add workflows filtering
{: #add-workflows-filtering }

As a scheduled pipeline is a triggered pipeline, and it will run every workflow in the configuration.

One way to implement workflows filtering is by using pipeline values. The example below uses the built in pipeline values `pipeline.trigger_source` and `pipeline.schedule.name`.

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

You may also add filtering for workflows that should *not* run when a schedule is triggered:

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

For a full list of pipeline values, visit the [Pipeline values and parameters]({{site.baseurl}}/pipeline-variables/#pipeline-values) page.

## FAQs
{: #faq }

**Q:** Can I migrate existing scheduled workflows to scheduled pipelines?

**A:** Yes, visit the [Scheduled pipelines migration]({{site.baseurl}}/migrate-scheduled-workflows-to-scheduled-pipelines) guide for more information.

**Q:** How do I find the schedules that I have created?

**A:** As scheduled pipelines are stored directly in CircleCI, there is a UUID associated with each schedule. You can view schedules that you have created on the **Triggers** page of the project settings. You can also list all the schedules under a single project:

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

For GitHub and Bitbucket users: `project-slug` takes the form of `vcs-type/org-name/repo-name`, e.g. `gh/CircleCI-Public/api-preview-docs`.

For GitLab SaaS Support users: `project-slug` takes the form of `circleci/:slug-remainder`. Refer to the [Getting started section]({{site.baseurl}}/api-developers-guide/#getting-started-with-the-api) of the API Developer's Guide for more information on the project slug format.

**Q:** Why is my scheduled pipeline not running?

**A:** There could be a few possible reasons:
* Is the actor who is set for the scheduled pipelines still part of the organization?
* Is the branch set for the schedule deleted?
* Is your GitHub organization using SAML protection? SAML tokens expire often, which can cause requests to GitHub to fail.

**Q:** Why did my scheduled pipeline run later than expected?

**A:** There is a nuanced difference in the scheduling expression with Scheduled Pipelines, compared to [the Cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

For example, when you express the schedule as 1 per-hour for 08:00 UTC, the scheduled pipeline will run once within the 08:00 to 09:00 UTC window. Note that it does not mean that it will run at 08:00 UTC exactly.

However, subsequent runs of the scheduled pipeline will always be run on the same time as its previous run. In other words, if a previous scheduled pipeline ran at 08:11 UTC, the next runs should also be at 08:11 UTC.

**Q:** Do you support regex?

**A:** 
Not currently. Scheduled pipelines require highly deterministic inputs such as a commit SHA, branch, or tag (fully qualified, no regexes) included in the webhook, API call, or schedule. 
