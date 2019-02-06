---
layout: classic-docs
title: "Status"
short-title: "Status"
description: "Status dashboard"
categories: [getting-started]
order: 1
---

<hr>

Badges     | Debugging
----------------------------|----------------------
Integrations enable you to [include status badges in other web pages]({{ site.baseurl }}/2.0/status-badges/)  |   If you need to troubleshoot your build, you can [debug failed builds using SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/).

<hr>

Queuing |
------------------------|------------------
If your builds are queuing, you can upgrade your plan for [using containers]({{ site.baseurl }}/2.0/containers/). |  

<hr>

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/walkthrough8.png)

CircleCI provides an integrated dashboard with the status of your build jobs:

- SUCCESS: All jobs completed
- FAILED: One or more jobs failed
- RUNNING: Job run is in progress
- ON HOLD: Job is waiting for approval
- QUEUED: Job is waiting for available container

If you are using [workflows]({{ site.baseurl}}/2.0/workflows-overview) you may
see other [workflow-specific statuses]({{ site.baseurl}}/2.0/workflows-overview/#possible-workflow-statuses).
