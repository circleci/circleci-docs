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
Integrations enable you to [include status badges in other web pages]({{ site.baseurl }}/2.0/status-badges/)  |   If you need to troubleshoot a job, you can [debug failed builds using SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/).

<hr>

Queuing |
------------------------|------------------
If your jobs are queuing, you can upgrade your plan for [using containers]({{ site.baseurl }}/2.0/containers/). |  

<hr>

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/job_status.png)

CircleCI provides an integrated dashboard showing job status:

- PASSED: All jobs passed successfully
- FAILED: One or more jobs failed

If you are using [workflows]({{ site.baseurl}}/2.0/workflows/#overview) you may
see other [workflow-specific statuses]({{ site.baseurl}}/2.0/workflows/#states).
