---
layout: classic-docs
title: "Deployment Integrations"
short-title: "Deployment Integrations"
categories: [deploying]
order: 1
---

## AWS

### Configuring AWS CLI

You can add your AWS credentials from **Project Settings > AWS Permissions** page.

The **Access Key ID** and **Secret Access Key** that you entered will be automatically available in your primary build container and exposed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environmental variables.
