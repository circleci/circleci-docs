---
layout: classic-docs
title: "Scheduled Pipelines"
short-title: "Scheduled Pipelines"
description: "Learn how to use scheduled pipelines"
order: 20
version:
- Cloud
- Server v3.x
- Server v2.x
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

Schedule pipelines allow users to trigger pipelines periodically based on a schedule.

Since the scheduled run is based on pipelines, scheduled pipelines have all the features that come with using pipelines:

- Can control the actor that's associated with the pipeline, which can enable the use of restricted contexts
- Can use dynamic config via setup workflows
- Can modify the schedule without having to change the config.yml
- Can interact with auto-cancelling of pipelines
- Can specify pipeline parameters associated with a schedule

CircleCI has APIs that allows users to create, view, edit, and delete scheduled pipelines.

**Note**: *At this time, the UI for scheduled pipelines is not available. It will become available soon.

## Getting started with scheduled pipelines in CircleCI
{: #getting-started }

### Start from scratch
{: #start-from-scratch }

If your project has no scheduled workflows and would like to try out scheduled pipelines:

- Have your CCI token ready or create a new one following [these steps](https://circleci.com/docs/2.0/managing-api-tokens/)
- Create a new schedule using the new pipelines schedule API, for example:

```sh
curl --location --request POST 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <your-cci-token>' \
--header 'Content-Type: application/json' \
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

- Check out the `schedule` section under the [open-api docs](https://circleci.com/docs/api/v2/) for additional information

### Migrating from scheduled workflows to scheduled pipelines
{: #migrate-from-scheduled-workflows }

Currently, using scheduled workflows has numerous shortcomings. Some of them are listed below:

- Cannot control the actor, so scheduled workflows can't use restricted contexts
- Cannot control the interaction with auto-cancelling of pipelines
- Cannot use scheduled workflow together with dynamic config without hakcy workarounds
- Cannot change or cancel scheduled workflows on a branch without triggering a pipeline
- Cannot kick off test runs for scheduled workflows without changing the schedule
- Cannot restrict scheduled workflows from PR branches if you want the workflow to run on webhooks

To migrate from scheduled workflows to scheduled pipelines, one can follow the steps below:

- Find the scheduled trigger in your project's .circleci/config.yml
    - For example, it might look like this one:

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

- Interpret the frequency your trigger needs to run from the cron expression
- Use the same step from `Starting from scratch` section above to create the schedule via the API
- In the circleci config file, remove the `triggers` section so that it looks like a normal workflow

```yaml
daily-run-workflow:
  jobs:
    - test
    - build
```

- Add workflows filtering. As a scheduled pipeline is essentially a triggered pipeline, it will run every workflow in the config.
    - One way to implement workflows filtering is by using the pipeline values, for example:

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

- Please note that in the above example, the second `equal` under `when` is not strictly necessary. The `pipeline.schedule.name` is an available pipeline value when the pipeline is triggered by a schedule.


- Add workflows filtering for workflows that should NOT run when a schedule triggers:

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

## Scheduled pipelines FAQs
{: #faq }

**Q:** How do I find the schedules that I've created?

**A:** As scheduled pipelines are stored directly in CircleCI, we now have a UUID associated with each schedule. Or you could list all the schedules under a single project

```sh
curl --location --request GET 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <PERSONAL_API_KEY>'
```

**Q:** Why is my scheduled pipeline not running?

**A:** There can be many reasons for this. For example:
- Is the actor who is set for the scheduled pipelines still part of the organization?
- Is the branch set for the schedule deleted?
- Is your github organization using SAML protection? SAML tokens expire often, which can cause requests to github to fail.