---
layout: classic-docs
title: "Connecting Jira with CircleCI"
description: "Connecting Jira with CircleCI"
---

This document describes how you can connect Jira to your CircleCI builds. With
the CircleCI Jira plugin, you can display your build statuses in Jira.

**Note:** You have to be an Jira admin to install this plugin.

## Installation steps
{: #installation-steps }

1. Navigate to project settings and select `Jira integration`
![CircleCI web app Project Settings Jira integration options]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Go to the Atlassian Marketplace to get the [CircleCI Jira Plugin](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)
![Atlassian marketplace showing CircleCI Jira plugin]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. Install the plugin and follow the prompts to set it up.
![Setting up the plugin 1]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png)
![Setting up the plugin 2]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. Return to the CircleCI Jira Integration settings page and add the generated token.

---

## Viewing build and deploy statuses in Jira
{: #viewing-build-and-deploy-statuses-in-jira }

With CircleCI orbs it is possible to display your build and deploy status
in Jira Cloud. To do this, you will need to:

1. Make sure you followed the steps above to connect Jira Cloud with CircleCI.
1. Make sure that you are using version `2.1` at the top of your `.circleci/config.yml` file.
1. To get an API token for build information retrieval, go to [User Settings > Tokens](https://app.circleci.com/settings/user/tokens) and create a token. Copy the token. (*Note*: older versions of the Jira orb may require you to retrieve a _Project API Token_, which is accessible from **Project Settings > API Permissions**)
1. To give the integration access to the key, go to **Project Settings -> Environment Variables** and add a variable named _CIRCLE_TOKEN_ with the value being the token you just made.
1. Add the Jira orb to your configuration and invoke it (see example below).

The example config below provides a bare `config.yml` illustrating the use of the Jira Orb.


```yaml
version: 2.1
orbs: # adds orbs to your configuration
  jira: circleci/jira@1.0.5 # invokes the Jira orb, making its commands accessible
workflows:
  build:
    jobs:
      - build:
          post-steps:
            - jira/notify # Runs the Jira's "notify" commands after a build has finished its steps.
jobs:
  build:
    docker:
      - image: 'cimg/base:stable'
    steps:
      - run: echo "hello"
```
