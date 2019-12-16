---
layout: classic-docs
title: "CircleCI Server v2.18 What's New"
short-title: "CircleCI Server v2.18 What's New"
description: "Starting point for CircleCI Server v2.18 docs"
categories: [getting-started]
order: 1
---
This document provides a summary of features and product notes for the release of CircleCI Server v2.18. For a full list of changes, including patch releases, refer to the [changelog](https://circleci.com/server/changelog). For a step by step guide to **upgrading** your CircleCI Server installation from v2.17.x to v2.18, see our [upgrade guide]({{ site.baseurl }}/2.0/updating-server/).

## Requirements for Upgrading

<div class="alert alert-warning" role="alert">
<b>Warning:</b> If at any time your organization name has been changed, there is a <a href="https://circleci.com/docs/2.0/updating-server/#org-rename-script">script</a> that <b>must</b> be run before stating the upgrade process.
</div>

## Notes and Best Practices

* We now require a minimum 32GB of RAM for the Services Machine. 
* We have made some changes to our Redis configuration. If you have externalized Redis then you’ll need to update your configuration. Please contact your Customer Success Manager.
* We have also made changes to our Postgres version and require at least postgreSQL v9.5.16. If you have externalized postgreSQL then please update to at least that version in 2.17.x before upgrading to 2.18.

## What's New in Release 2.18.3

* You can now generate a Windows-based image to make available for running using the `machine` executor. See the VM Service guide for [instructions on building the image and making it available]({{ site.baseurl }}/2.0/vm-service/#creating-a-windows-ami). For details of using the Windows executor, see our [Executors and Images overview]({{ site.baseurl }}/2.0/executor-intro/#windows).

## What's New in Release 2.18

* It is now possible to restrict environment variables at run time by adding security groups to contexts. Security groups are defined as GitHub teams or LDAP groups. After a security group is added to a context, only CircleCI users who are members of that security group may access or use the environment variables of the context. For more information see our [guide to restricting a context]({{ site.baseurl }}/2.0/contexts/#restricting-a-context).
* Customers running storage drivers external to AWS will see improved routing times when searching for build Artifacts.
* You can now customize the metrics that get output from CircleCI. For steps and options, see our [Custom Metrics guide]({{ site.baseurl }}/2.0/monitoring/#custom-metrics). Below is a short list of metrics that are included by default when enabling Custom Metrics:

<br>

Metric | Description
--- | ---
`circle.backend.action.upload-artifact-error` | Tracks how many times an artifact has failed to upload
`circle.build-queue.runnable.builds` | Track how many builds flowing through the system are considered runnable
`circle.dispatcher.find-containers-failed` | Track how many 1.0 builds 
`circle.github.api_call` | Tracks how many api calls CircleCI is making to GitHub
`circle.http.request` | Tracks the response codes to CircleCi requests
`circle.nomad.client_agent.*` | Tracks nomad client metrics
`circle.nomad.server_agent.*` | Tracks how many nomad servers there are 
`circle.run-queue.latency` | Tracks how long it takes for a runnable build to be accepted
`circle.state.container-builder-ratio` | Keeps track of how many containers exist per builder ( 1.0 only ) 
`circle.state.lxc-available` | Tracks how many containers are available ( 1.0 only ) 
`circle.state.lxc-reserved` | Tracks how many containers are reserved/in use ( 1.0 only )
`circleci.cron-service.messaging.handle-message` | Provides timing and counts for RabbitMQ messages processed by the `cron-service`
`circleci.grpc-response` | Tracks latency over the system grpc system calls

<!-- * You can now customize your resource class sizes in Server! This means you can change your default resource class as well as define new ones! For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#resource-classes)

* Server installations can now have a new machine type enabled for the Large resource class.  For information on how, see our [customizations guide](https://circleci.com/docs/2.0/customizations/#enable-the-large-resource-class-for-machine-executor) -->

<br>

* You can now provide individual AMIs for both Remote Docker and machine executor jobs. Previously we provided the option for a single custom AMI to be used across both, but with v2.18, this expanded customization gives you greater control over versioning and dependencies to meet your individual CICD needs. See [the VM Service guide]({{ site.baseurl }}/2.0/vm-service/) for more information.  

## Fixed in Release 2.18

* Additional fixes around contexts and org renames.
* Fixed an issue where occasionally volumes would fail to attach to spun up Remote Docker/`machine` instances. 
* Fixed an issue where the CircleCI integration could not be installed on JIRA instances with the jira.com subdomain.
* Fixed an issue where the Workflows page would still point to an old repo after renaming an organization.
* Fixed an issue where the Workflows UI would fail to refresh data automatically.
* Improved context loading times in cases when they could cause timeouts in the UI.
* Fixed an issue where contexts would cause builds to return CIRCLE_BUG .
