---
layout: classic-docs
title: "Connecting JIRA with CircleCI"
categories: [how-to]
description: "Connecting JIRA with CircleCI"
---

This document describes how you can connect JIRA to your CircleCI builds. With
the CircleCI JIRA plugin, you can create JIRA tickets directly from your Jobs
page, allowing you to assign tasks and fixes based on the status of your job.

**Note:** You have to be an JIRA admin to install this plugin.

# Installation Steps

1. Navigate to project settings under `integrations` >  `JIRA integration`
![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Go to the Atlassian Marketplace to get the [CircleCI JIRA Plugin](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)
![]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. Install the plugin and follow the prompts to set it up.
![]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png)
![]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. Return to the CircleCI JIRA Integration settings page and add the generated token.

---

# Creating JIRA Tickets from the Jobs Page

Once the integration is added, navigate to the job details page and the JIRA icon will be enabled. 

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_5.png)

Click on the JIRA icon and select the following:

- Project name
- Issue type
- Issue summary
- Description

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_6.png)

Note: The current JIRA plugin only supports default fields.

You're all set to creating quick tickets from your job output page!
