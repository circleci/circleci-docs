---
layout: classic-docs
title: "Workflows"
short-title: "Workflows"
description: "Description of workflows"
categories: [workflows]
order: 2
---
CircleCI [Workflows]({{ site.baseurl }}/2.0/workflows/) enable you to sequence and parallelize your job runs with great flexibility for faster feedback when jobs fail.

<hr>

Holding a Workflow for Manual Approval     |  Using Filters
----------------------------|----------------------
Add an [approval job]({{ site.baseurl }}/2.0/workflows/#holding-a-workflow-for-a-manual-approval) to set up a manual gate. &nbsp;&nbsp;&nbsp;&nbsp; |   Use [regex]({{ site.baseurl }}/2.0/workflows/#using-regular-expressions-to-filter-tags-and-branches) to [filter on branches]({{ site.baseurl }}/2.0/workflows/#branch-level-job-execution) or [filter on tags]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag).  

<hr>

Scheduling a Workflow | Using Workspaces
------------------------|------------------
[Trigger]({{ site.baseurl }}/2.0/workflows/#scheduling-a-workflow) a workflow on a set schedule with `cron`.&nbsp;&nbsp;&nbsp;&nbsp; |  Use [workspaces]({{ site.baseurl }}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) to share data among jobs.

<hr>


## Video: Configure Multiple Jobs with Workflows

The following video shows you how to configure workflows in your `.circleci/config.yml` file.

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Possible Workflow Statuses

Workflows may appear with one of the following states:

- RUNNING: Workflow is in progress
- NOT RUN: Workflow was never started
- CANCELLED: Workflow was cancelled before it finished
- FAILING: A Job in the workflow has failed
- FAILED: One or more jobs in the workflow failed
- SUCCESS: All jobs in the workflow completed successfully
- ON HOLD: A job in the workflow is waiting for approval
- NEEDS SETUP: A workflow stanza is not included or is incorrect in the `config.yml` file for this project
