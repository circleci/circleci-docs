---
layout: classic-docs
title: "Scheduled Pipeline"
description: "Docs page on using Scheduled Pipeline"
version:
- Cloud
---

Currently, using Scheduled Workflows has numerous shortcomings for customers. Some of them are listed below:

- Cannot control the actor, so scheduled workflows can't use restricted contexts
- Cannot control the interaction with auto-cancelling of pipelines
- Cannot use scheduled workflow together with dynamic config without hakcy workarounds
- Cannot change or cancel scheduled workflows on a branch without triggering a pipeline
- Cannot kick off test runs for scheduled workflows without changing the schedule
- Cannot restrict scheduled workflows from PR branches if you want the workflow to run on webhooks

CircleCI has introduced a few new APIs that allows users to create, view, edit, and delete Scheduled Pipelines.

**Note**: *At this time, the UI for Scheduled Pipelines is not available. It will become available soon.

## Getting started with scheduled pipelines in CircleCI
{: #getting-started-with-scheduled-pipelines-in-circleci }

### Start from scratch
{: #start-from-scratch }
If your project has no scheduled workflows and would like to try out scheduled pipelines:

- Have your CCI token ready or create a new one following [these steps](https://circleci.com/docs/2.0/managing-api-tokens/)
- Create a new schedule using the new Pipeline Schedules API, for example:

```
curl --location --request POST 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <your-cci-token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "my schedule name",
    "description": "some description",
    "attribution-actor": "system",
    "parameters": {
      "branch": "master"
      <additional pipeline parameters can be added here>
    },
    "timetable": {
        "per_hour": 3,
        "hours_of_day": [1,15],
        "days_of_week": ["MON", "WED"]
    }
}'
```

- Check out the [open-api docs](https://circleci.com/docs/api/v2/) for additional information

### Migrating from scheduled workflows to scheduled pipelines
{: #migrating-from-scheduled-workflows-to-scheduled-pipelines }
- Find the scheduled trigger in your project's .circleci/config.yml
    - For example, it might look like this one:

```
daily-run-workflow:
  triggers:
    - schedule:
        # Every day, 0421Z.
        cron: "21 4 * * *"
        filters:
          branches:
            only:
              - master
  jobs:
    - test
    - build
```

- Interpret the frequency your trigger needs to run from the cron expression
- Use the same step from `Starting from scratch` section above to create the schedule
- In the circleci config file, remove the `triggers` section so that it looks like a normal workflow

```
daily-run-workflow:
  jobs:
    - test
    - build
```

- Add workflows filtering. As scheduled pipeline is essentially a triggered pipeline, it will run every workflow in the config.
    - One way to implement workflows filtering is by using the pipeline values, for example:

```
daily-run-workflow:
  when:
    and:
      - equal: [ schedule, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build
```

- Add workflows filtering for workflows that should NOT run when a schedule triggers:

```
daily-run-workflow:
  when:
    and:
      - equal: [ schedule, << pipeline.trigger_source >> ]
      - equal: [ "my schedule name", << pipeline.schedule.name >> ]
  jobs:
    - test
    - build

other-workflow:
  when:
    not:
      equal: [ schedule, << pipeline.trigger_source >> ]
  jobs:
   - build
   - deploy
```

## Scheduled pipeline FAQs
{: #scheduled-pipeline-faqs }

**Q:** How do I find the schedules that I've created?

**A:** As scheduled pipelines are stored directly in CircleCI, we now have a UUID associated with each schedule. Or you could list all the schedules under a single project

```
curl --location --request GET 'https://circleci.com/api/v2/project/<project-slug>/schedule' \
--header 'circle-token: <PERSONAL_API_KEY>'
```

**Q:** Why is my Scheduled Pipeline not running?

**A:** There can be many reasons for this. For example:
- Is the actor who is set for the scheduled pipelines still part of the organization?
- Is the branch set for the schedule deleted?
- Is your github organization using SAML protection? SAML tokens expire often, which can cause requests to github to fail.
