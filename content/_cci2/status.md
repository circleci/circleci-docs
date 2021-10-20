---
layout: classic-docs
title: "Status"
short-title: "Status"
description: "Status dashboard"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v2.x
---

<hr>

Badges     | Debugging
----------------------------|----------------------
Integrations enable you to [include status badges in other web pages]({{ site.baseurl }}/2.0/status-badges/)  |   If you need to troubleshoot a job, you can [debug failed builds using SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/).

<hr>

Queuing |
------------------------|------------------
If your jobs are queuing, you can switch to either a [performance or custom plan](https://circleci.com/pricing/). For further information see our guide to [using credits]({{ site.baseurl }}/2.0/credits/). |

<hr>

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/job_status.png)

CircleCI provides an integrated dashboard showing status of the last completed job run:

- SUCCESS: All jobs passed successfully
- FAILED: One or more jobs failed

If you are using [workflows]({{ site.baseurl}}/2.0/workflows/#overview) you may
see other [workflow-specific statuses]({{ site.baseurl}}/2.0/workflows/#states).
