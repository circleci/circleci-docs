---
layout: classic-docs
title: "CircleCI Server v2.17 What's New"
short-title: "CircleCI Server v2.17 What's New"
description: "Starting point for CircleCI Server v2.17 docs"
categories: [getting-started]
order: 1
---

This document provides a summary of features and product notes for the release of CircleCI Server v2.18. For a full list of changes, including patch releases, refer to the [changelog](https://circleci.com/server/changelog). For a step by step guide to **upgrading** your CircleCI Server installation from v2.17.x to v2.18, se our [upgrade guide](https://circleci.com/docs/2.0/updating-server/#section=server-administration).

## Requirements for Upgrading

**Note:** If at any time your organization name has been changed, there is a script(https://circleci.com/docs/2.0/updating-server/#org-rename-script) that **must** be run before stating the upgrade process.

## Notes and Best Practices

* We now require a minimum 32GB of RAM for the Services Machine. 
* We have made some changes to our Redis configuration. If you have externalized Redis then you’ll need to update your configuration. Please contact your Customer Success Manager.
* We have also made changes to our Postgres version and require at least postgreSQL v9.5.16. If you have externalized postgreSQL then please update to at least that version in 2.17.x before upgrading to 2.18.

## What's New in Release 2.18

* It is now possible to restrict environment variables at run time by adding security groups to contexts. Security groups are defined as GitHub teams or LDAP groups. After a security group is added to a context, only CircleCI users who are members of that security group may access or use the environment variables of the context. For more information see our [guide to restricting a context](https://circleci.com/docs/2.0/contexts/#restricting-a-context).
* Customers running storage drivers external to AWS will see improved routing times when searching for build Artifacts.
* You can now customize the metrics that get output from CircleCI. For steps and options, see our [Custom Metrics guide](https://circleci.com/docs/2.0/monitoring/#custom-metrics). Below is a short list of metrics that are included by default when enabling Custom Metrics:

Metric | Description
--- | ---
`Circle.backend.action.upload-artifact-error` | Tracks how many times an artifact has failed to upload.
`Circle.build-queue.runnable.builds` | Track how many builds flowing through the system are considered runnable
`Circle.dispatcher.find-containers-failed` | Track how many 1.0 builds 
`Circle.github.api_call` | Tracks how many api calls CircleCI is making to github
`Circle.http.request | Tracks the response codes to CircleCi requests
`circle.nomad.client_agent.*` | Tracks nomad client metrics
`circle.nomad.server_agent.*` | Tracks how many nomad servers there are. 
`Circle.run-queue.latency` | Tracks how long it takes for a runnable build to be accepted. 
`Circle.state.container-builder-ratio` | Keeps track of how many containers exist per builder ( 1.0 only ) 
`Circle.state.lxc-available` | Tracks how many containers are available ( 1.0 only ) 
`Circle.state.lxc-reserved` | Tracks how many containers are reserved/in use ( 1.0 only )
`Circle.vm-service.vm.assigned-vm` | Tracks how many vm’s are in use
`Circle.vm-service.vms.delete.status` | Tracks how many vm’s we’re deleting at a given moment
`Circle.vm-service.vms.get.status` |  Tracks how many vm’s we have? ( not sure)
`Circle.vm-service.vms.post.status` | Not sure
`Circleci.cron-service.messaging.handle-message` | Provides timing and counts for RabbitMQ messages processed by the `cron-service`
`Circleci.grpc-response` | Tracks latency over the system grpc system calls. 

* You can now customize your resource class sizes in Server! This means you can change your default resource class as well as define new ones! For information on how, see our [customizations guide]https://circleci.com/docs/2.0/customizations/#section=server-administration

Server installations can now have a new machine type enabled for the Large resource class.  For information on how, see our [customizations guide]https://circleci.com/docs/2.0/customizations/#section=server-administration 

* You can now provide individual AMIs for both Remote Docker and machine executor jobs. Previously we provided the option for a single custom AMI to be used across both, but with v2.18, this expanded customization gives you greater control over versioning and dependencies to meet your individual CICD needs. See [our VM Service guide](https://circleci.com/docs/2.0/vm-service/#section=server-administration)  for more information.  

## Fixed in Release 2.18

* Additional fixes around contexts and org renames.
* Fixed an issue where occasionally volumes would fail to attach to spun up Remote Docker/`machine` instances. 
* Fixed an issue where the CircleCI integration could not be installed on JIRA instances with the jira.com subdomain.
* Fixed an issue where the Workflows page would still point to an old repo after renaming an organization.
* Fixed an issue where the Workflows UI would fail to refresh data automatically.
* Improved context loading times in cases when they could cause timeouts in the UI.
* Fixed an issue where contexts would cause builds to return CIRCLE_BUG .
