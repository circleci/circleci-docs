---
layout: classic-docs
title: "Scheduled Pipelines"
short-title: "Scheduled Pipelines"
description: "Learn about schedule pipeline for CircleCI projects."
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

### Use project settings in the web app
{: #use-project-settings }

1. In the CircleCI web app, navigate to **Projects** in the sidebar, then click the ellipsis (...) next to your project and click on **Project Settings**. You can also find the **Project Settings** button on each project's landing page.
2. Navigate to **Triggers**.
3. To create a new schedule, click **Add Trigger**.
4. Define the new schedule by filling out the form, then click **Save Trigger**.

The form also provides the option of adding [pipeline parameters]({{site.baseurl}}/pipeline-variables/), which are typed pipeline variables declared at the top level of a configuration.

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

## Set a specific schedule
{: #set-a-specific-schedule}

A common scenario is to only trigger a pipeline overnight. The examples below shows how to schedule a pipeline to be run at midnight every night. Unlike deprecated scheduled workflows, you do not set up basic scheduled pipelines in your configuration file. You can set a schedule right from the CircleCI web app, or if you would prefer, you can set one using the API.

### Set a schedule in the web app
{: #set-a-in-the-web-app }

In your desired project, navigate to **Project Settings > Triggers** to see the form for specifying a schedule for a trigger.

![Scheduled pipelines web app form]({{site.baseurl}}/assets/img/docs/pipelines-scheduled-trigger-form.png)

The form allows you to schedule a trigger weekly or monthly. The weekly option (shown above) allows you to select specific days of the week. The monthly option allows you to select specific days of the month's calendar. With either option, you then specify which months of the year you would like the trigger to repeat.

For a nightly schedule, you will need to take into account the form uses UTC (coordinated universal time). For example, if you would like your pipeline to trigger at midnight (00:00) in eastern standard time (EST), you would need to find the difference from UTC. In this scenario, 00:00 EST is 05:00 UTC.

### Set a schedule with the API
{: #set-a-schedule-with-the-api }

To set a schedule with the API, you will need a project building on CircleCI, environment variables set, and your CircleCI personal API token. Much like in the web app form, you are required to enter a name, parameters (like the branch or tag) as well as a timetable.

```javascript
const axios = require('axios').default;
require('dotenv').config()

// environment variables
const API_BASE_URL = "https://circleci.com/api/v2/project"
const vcs = process.env.VCS_TYPE
const org = process.env.ORG_NAME
const project = process.env.PROJECT_ID
const token = process.env.CIRCLECI_TOKEN

const postScheduleEndpoint = `${API_BASE_URL}/${vcs}/${org}/${project}/schedule`

async function setupNightlySchedule(){
  let res = await axios.post(postScheduleEndpoint,
    {
      name: "Nightly build",
      description: "Builds and pushes a new build every night.",
        "attribution-actor": "system",
        "parameters": {
          "branch": "main",
          "run-schedule": true
        },
        "timetable": {
            // once per hour
            "per_hour": 1,
            // at 01:00 UTC
            "hours_of_day": [1],
            // on the following days of the week
            "days_of_week": ["TUE", "WED", "THU", "FRI", "SAT"]
        }
    },
    {
      headers: { 'circle-token': token }
    }
  )
  console.log(res.data)
}

setupNightlySchedule()
```

You can view the build scheduling of this [sample project](https://github.com/zmarkan/Android-Espresso-ScrollableScroll/tree/main/build-scheduling) on GitHub.

## Set a scheduled pipeline with two workflows
{: #set-a-scheduled-pipeline-with-two-workflows }

To set up scheduled pipelines with multiple workflows, you will need to use pipeline parameters. In the example below, a parameter is created called `run-schedule`, which is set as `type: boolean` and `default: false`. This allows the workflows section to use `when` to specify conditionals about when the pipeline should run. If you use the `when` conditional, you will also need to set a `when: not:`, like in the example below.

```yaml
version: 2.1

orbs:
  android: circleci/android@1.0.3

jobs:
  build-library:
    executor:
      name: android/android-machine
      resource-class: xlarge
    steps:
      - checkout
      - run:
          name: Assemble library
          command: ./gradlew clean
# set pipeline parameters
parameters:
  run-schedule:
    type: boolean
    default: false

workflows:
  build-test-deploy:
  # do not run the scheduled pipeline if build-test-deploy
    when:
      not: << pipeline.parameters.run-schedule >>
    jobs:
      - android/run-ui-tests:
          name: build-and-test
          system-image: system-images;android-23;google_apis;x86
          test-command: ./gradlew assemble sample:connectedDebugAndroidTest
  # run the scheduled pipeline if nightly-snapshot
  nightly-snapshot:
    when: << pipeline.parameters.run-schedule >>
    jobs:
      - android/run-ui-tests:
          name: build-and-test
          system-image: system-images;android-23;google_apis;x86
          test-command: ./gradlew assemble sample:connectedDebugAndroidTest
```

For the full configuration sample, visit the [sample project](https://github.com/zmarkan/Android-Espresso-ScrollableScroll/blob/main/.circleci/config.yml) on GitHub.

## Scheduled pipelines video tutorial
{: #scheduled-pipelines-video-tutorial }

The video offers a short tutorial for the following scenarios:

- Set a schedule in the web app
- Set a schedule with the API
- Migrate from scheduled workflows to scheduled pipelines

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/x3ruGpx6SEI" title="Scheduled pipelines tutorial" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## FAQs
{: #faq }

**Q:** Can I migrate existing scheduled workflows to scheduled pipelines?

**A:** Yes, visit the [Scheduled pipelines migration]({{site.baseurl}}/migrate-scheduled-workflows-to-scheduled-pipelines) guide for more information.

---

**Q:** How do I find the schedules that I have created?

**A:** As scheduled pipelines are stored directly in CircleCI, there is a UUID associated with each schedule. You can view schedules that you have created on the **Triggers** page of the project settings. You can also list all the schedules under a single project:

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

For GitHub and Bitbucket users: `project-slug` takes the form of `vcs-type/org-name/repo-name`, e.g. `gh/CircleCI-Public/api-preview-docs`.

For GitLab SaaS Support users: `project-slug` takes the form of `circleci/:slug-remainder`. Refer to the [Getting started section]({{site.baseurl}}/api-developers-guide/#getting-started-with-the-api) of the API Developer's Guide for more information on the project slug format.

---

**Q:** Why is my scheduled pipeline not running?

**A:** There could be a few possible reasons:
* Is the actor who is set for the scheduled pipelines still part of the organization?
* Is the branch set for the schedule deleted?
* Is your GitHub organization using SAML protection? SAML tokens expire often, which can cause requests to GitHub to fail.

---

**Q:** Why did my scheduled pipeline run later than expected?

**A:** There is a nuanced difference in the scheduling expression with Scheduled Pipelines, compared to [the Cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

For example, when you express the schedule as 1 per-hour for 08:00 UTC, the scheduled pipeline will run once within the 08:00 to 09:00 UTC window. Note that it does not mean that it will run at 08:00 UTC exactly.

However, subsequent runs of the scheduled pipeline will always be run on the same time as its previous run. In other words, if a previous scheduled pipeline ran at 08:11 UTC, the next runs should also be at 08:11 UTC.

---

**Q:** Do you support regex?

**A:** 
Not currently. Scheduled pipelines require highly deterministic inputs such as a commit SHA, branch, or tag (fully qualified, no regexes) included in the webhook, API call, or schedule. 
