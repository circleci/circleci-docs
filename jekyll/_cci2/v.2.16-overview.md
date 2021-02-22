---
layout: classic-docs
title: "CircleCI Server v2.16 What's New"
short-title: "CircleCI Server v2.16 What's New"
description: "Starting point for CircleCI Server v2.16 docs"
categories: [getting-started]
order: 1
---

This document provides a summary of features and product notes for the release of CircleCI Server v2.16.

## What's new in release 2.16

- We are excited to announce that you can now distribute your data and workload external to the Services Machine. The following services can be externalized; MongoDB, Redis, Nomad Server, RabbitMQ, Postgres and Vault. Contact your CSM for the latest documentation.

- Custom Metrics can now be accomplished via a Telegraf Output Configuration File. See the Monitoring chapter of the Operations Guide. 

- Users can now receive email notifications about Workflows.

- The PostgreSQL image has been updated to allow modifying the default configuration by creating the following file: `/etc/circleconfig/postgres/extra.conf`  A list of configuration options can be found [here](https://github.com/circleci/postgres-docker/blob/da250f226be17afdde923c08f2af6fe63ceec99e/postgresql.conf).

- PDF installation and operations documentation:
   - *CircleCI v2.16 Installation Guide*
   - *CircleCI v2.16 Operations Guide*

## Fixed in release 2.16

- Fix for an issue with Contexts that would break after 32 days.

- Vault auth tokens will now renew periodically to prevent expiration.

- Fix for an issue where workflow listing pages would intermittently fail to render.

- We have fixed a small number of bugs affecting processing incoming web hooks from GitHub to CircleCI.

- For installs that are using an HTTP or HTTPS proxy, the jobs will now ignore that proxy so that setup_remote_docker works.

- Reduced the number of connections 1.0 builders make to the PostgreSQL database.

- Security fixes for potential cross-site scripting vulnerability and HTTP header injection vulnerability

- Forked PRs can no longer write the caches of parent projects by default for security reasons. It is possible to still write parent project caches from the fork if the "Pass secrets to builds from forked pull requests" (in Advanced settings) is enabled.


## Updated in release 2.16

- Removed EOL banner on build emails.

- VM Service stability improvements.

- Improved metrics for VM provisioning for machine executor. This changed metric names, so if you are monitoring VM provisioning in your install already, you will need to reconfigure the monitoring dashboards for the following new metrics:
    - `vm-service.gauges.available-vms` and `vm-service.gauges.running-vms` is replaced by `vm-service.gauges.vms_by_status`
    - `vm-service.gauges.running-tasks` is replaced by `vm-service.gauges.tasks_by_status`
    - `vm-service.gauges.oldest-unassigned-task` is replaced by `vm-service.gauges.unassigned_tasks_age`

- Replicated was updated to version 2.29.0 in this release which requires Docker 17.12.1. Follow the instructions below before upgrading to CircleCI v2.16.

### Prequisites for updating Replicated

- Your installation is Ubuntu 14.04-based
- You are running replicated version 2.10.3 on your services machine
  - `replicated --version`
- Your installation is **not** airgapped and you can access the internet from it
- All steps are completed on the Services machine

### Preparations

Before performing a replicated version update, backup your data using the Backup section of the *CircleCI v2.16 Operations Guide*.

- Stop the CircleCI application with

```
    replicatedctl app stop
```

Application shutdown takes a few minutes. Please check the administration dashboard, and wait for the status to become “Stopped” before continuing. You can also run the following command to view the app status:

```
    replicatedctl app status inspect
```

Example Output:
```
[
    {
        "AppID": "edd9471be0bc4ea04dfca94718ddf621",
        "Sequence": 2439,
        "State": "stopped",
        "DesiredState": "stopped",
        "Error": "",
        "IsCancellable": false,
        "IsTransitioning": false,
        "LastModifiedAt": "2018-10-23T22:00:21.314987894Z"
    }
]
```

- For the replicated update to succeed, it’s necessary to update docker to the recommended version, 17.12.1:

```
    sudo apt-get install docker-ce=17.12.1~ce-0~ubuntu
```

- Pin the Docker version using the following command:

```
    sudo apt-mark hold docker-ce
```

### Update

Perform the Replicated update by executing the update script as follows:

```
    curl -sSL "https://get.replicated.com/docker?replicated_tag=2.29.0" | sudo bash
```

Double-check your replicated and docker versions:

```
    replicatedctl version    # 2.29.0
    docker -v                # 17.12.1
```

Restart the app with

```
    replicatedctl app start
```

The application will take a few minutes to spin up. You can check the progress in the administration dashboard or by executing;

```
    replicatedctl app status inspect
```

Example output:
```
[
    {
        "AppID": "edd9471be0bc4ea04dfca94718ddf621",
        "Sequence": 2439,
        "State": "started",
        "DesiredState": "started",
        "Error": "",
        "IsCancellable": true,
        "IsTransitioning": true,
        "LastModifiedAt": "2018-10-23T22:04:05.00374451Z"
    }
]
```
