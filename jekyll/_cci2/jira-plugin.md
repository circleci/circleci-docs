---
layout: classic-docs
title: "Connecting JIRA with CircleCI"
categories: [how-to]
description: "Connecting JIRA with CircleCI"
---

This document describes how you can connect JIRA to your CircleCI builds. With
the CircleCI JIRA plugin, you can create JIRA tickets directly from your Jobs
page, allowing you to assign tasks and fixes based on the status of your job, as
well as display your build statuses in Jira.

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

# Viewing Build and Deploy Statuses in Jira 

With CircleCI orbs it is also possible to display your build and deploy status
in Jira. To do this, you will need to: 

1. Make sure you followed the steps above to connect Jira with CircleCI.
1. Make sure that you are using version `2.1` at the top of your `.circleci/config.yml` file.
1. If you do not already have pipelines enabled, go to **Project Settings -> Advanced Settings** and enable them.
1. Add the orb stanza, invoking the Jira orb.
1. Use the Jira orb in a step.

The example config below provides a bare `config.yml` illustrating the use of the Jira Orb.


```yaml
jobs:
  build:
    docker:
      - image: 'circleci/node:10'
    steps:
      - run: echo "hello"
orbs:
  jira: circleci/jira@1.0.0
version: 2.1
workflows:
  build:
    jobs:
      - build:
          post-steps:
            - jira/notify
```
