---
layout: classic-docs
title: "Workflows Waiting for Status in Github"
short-title: "Workflows Waiting for Status in Github"
description: "Fixing Workflows Waiting for Status in Github"
categories: [troubleshooting]
order: 1
---

If you have implemented workflows on a branch in your GitHub repository, but the status check never completes, there may be  status settings in GitHub that you need to reset. For example, if you choose to protect your branches, you may need to deselect the status keys you expect from CircleCI, as follows:

![Uncheck GitHub Status Keys]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

Having the `ci/circleci` checkbox enabled may prevent the status from showing as completed in GitHub because CircleCI posts statuses to Github with a key that includes the job by name.

