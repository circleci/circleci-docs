### Can I migrate existing scheduled workflows to scheduled pipelines?
{: #can-i-migrate-existing-scheduled-workflows }

Yes, visit the [Scheduled pipelines migration](/docs/migrate-scheduled-workflows-to-scheduled-pipelines) guide for more information.

### How do I find the schedules that I have created?
{: #find-schedules-that-i-have-created }

As scheduled pipelines are stored directly in CircleCI, there is a UUID associated with each schedule. You can view schedules that you have created on the **Triggers** page of the project settings. You can also list all the schedules under a single project:

```shell
curl --location --request GET "https://circleci.com/api/v2/project/<project-slug>/schedule" \
--header "circle-token: <PERSONAL_API_KEY>"
```

For GitHub and Bitbucket users: `project-slug` takes the form of `vcs-type/org-name/repo-name`, for example, `gh/CircleCI-Public/api-preview-docs`.

### Why is my scheduled pipeline not running?
{: #scheduled-pipeline-not-running }

There could be a few possible reasons:

* Is the assigned actor who is set for the scheduled pipelines still part of the organization (you can find this setting is under **Attribution** in the **Triggers** section of the web app)?
* Is the branch set for the schedule deleted?
* Is your GitHub organization using SAML protection? SAML tokens expire often, which can cause requests to GitHub to fail.

### Why did my scheduled pipeline run later than expected?
{: #scheduled-pipeline-run-later }

There is a nuanced difference in the scheduling expression with Scheduled Pipelines, compared to [the Cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

For example, when you express the schedule as 1 per-hour for 08:00 UTC, the scheduled pipeline will run once within the 08:00 to 09:00 UTC window. Note that it does not mean that it will run at 08:00 UTC exactly.

However, subsequent runs of the scheduled pipeline will always be run on the same time as its previous run. In other words, if a previous scheduled pipeline ran at 08:11 UTC, the next runs should also be at 08:11 UTC.

### Do you support regex?
{: #do-you-support-regex }

Not currently. Scheduled pipelines require highly deterministic inputs such as a commit SHA, branch, or tag (fully qualified, no regexes) included in the webhook, API call, or schedule.