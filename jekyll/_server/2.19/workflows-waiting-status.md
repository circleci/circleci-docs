---
layout: classic-docs
title: "Workflows Waiting for Status in GitHub"
short-title: "Workflows Waiting for Status in GitHub"
description: "Fixing Workflows Waiting for Status in GitHub"
categories: [troubleshooting]
order: 1
---

`ci/circleci — Waiting for status to be reported`

If you have implemented workflows on a branch in your GitHub repository, but the status check never completes, there may be  status settings in GitHub that you need to deselect. For example, if you choose to protect your branches, you may need to deselect the `ci/circleci` status key as this check refers to the default CircleCI 1.0 check, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled will prevent the status from showing as completed in GitHub when using a workflow because CircleCI posts statuses to GitHub with a key that includes the job by name.

To resolve this, go to GitHub and navigate to **Settings** > **Branches**. Then, click the **Edit** button on the protected branch to deselect the setting. 

Refer to the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document for examples and conceptual information.

