---
layout: classic-docs
title: "Waiting for Status in GitHub"
short-title: "Waiting for Status in GitHub"
description: "Fixing Waiting for Status in GitHub"
categories: [troubleshooting]
order: 1
---

## Workflows waiting for status in GitHub

`ci/circleci — Waiting for status to be reported`

If you have implemented workflows on a branch in your GitHub repository, but the status check never completes, there may be  status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to GitHub with a key that includes the job by name.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.

Refer to the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document for examples and conceptual information.

## GitHub Checks waiting for status in GitHub

`ci/circleci:build — Waiting for status to be reported`

If you have enabled GitHub Checks in your GitHub repository, but the status check never completes on Github Checks tab, there may be  status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci:build` status key as this check refers to the job status from CircleCI 2.0, as follows:

![Uncheck GitHub Job Status Keys]({{ site.baseurl }}/assets/img/docs/github_job_status.png)

Having the `ci/circleci:build` checkbox enabled will prevent the status from showing as completed in GitHub when using a GitHub Checks because CircleCI posts statuses to GitHub at a workflow level rather than a workflow job level.

Go to Settings > Branches in GitHub and click the Edit button on the protected branch to deselect the settings, for example https://github.com/your-org/project/settings/branches.
