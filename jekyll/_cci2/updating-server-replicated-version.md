---
layout: classic-docs
title: "Updating Server Replicated Version"
category: [administration]
order: 12
description: "How to update server replicated and docker version"
---

This document describes how to update the server replicated version for your private installation of CircleCI in the following sections:

* TOC
{:toc}

## Assumptions

- Your installation is Ubuntu 14.04 or 16.04 based.
- You are running replicated version 2.10.3<= on your services machine
  - replicated --version
- Your installation is **not** airgapped and you can access the internet from it
- All steps are completed on the Services machine
- Verify what version of replicated you need to update to by viewing the [Server Changelog](https://circleci.com/server/changelog/)
  
## Preparations

Before performing a replicated version update, backup your data using the [Backup instructions]({{site.baseurl}}/2.0/backup/).

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

## Update

Perform the Replicated update by executing the update script as follows:

```
    curl -sSL "https://get.replicated.com/docker?replicated_tag=<specific_replicated_version>" | sudo bash
```

Double-check your replicated and docker versions:

Example Output
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
