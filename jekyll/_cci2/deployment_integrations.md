---
layout: classic-docs
title: "Deployment Integrations"
short-title: "Deployment Integrations"
categories: [deploying]
order: 1
---

In the CircleCI 'Project Settings' page you will see a section called 'Continuous Deployment':

![Deployment Integrations]({{ site.baseurl }}/assets/img/docs/deployment-integrations.png)

Deployment options with built-in integration are listed there. This document exaplains how to use them with CircleCI 2.0.

## AWS

### Configuring AWS CLI

To deploy to AWS from CircleCI 2.0 you will need to make sure the [awscli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) is installed in your primary container.

You can add your AWS credentials from **Project Settings > AWS Permissions** page.

The **Access Key ID** and **Secret Access Key** that you entered will be automatically available in your primary build container and exposed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

## Heroku

The built-in Heroku integration via the CircleCI UI is not implemented for CircleCI 2.0.

You can deploy to Heroku manually by setting environment variables. There is a full example in the [Project Walkthrough]( {{ site.baseurl }}/2.0/project-walkthrough/#deployment).
