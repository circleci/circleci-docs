---
layout: classic-docs
title: "Updating server replicated version"
category: [administration]
order: 12
description: "How to update server replicated and docker version"
---

* TOC
{:toc}


# Updating server replicated version

## Assumptions

- Your installation is Ubuntu 14.04-based
- You are running replicated version 2.10.3 on your services machine
  - replicated --version
- Your installation is **not** airgapped and you can access the internet from it
- All steps take place on the services machine
  
## Preparations

Before performing a replicated version update, make sure to backup your data as per https://circleci.com/docs/2.0/backup/

Stop the CircleCI application with

```
    replicatedctl app stop
```

Application shutdown takes a few minutes. Please check the administration dashboard, and wait for the status to become “Stopped” before continuing. You can also run

```
    replicatedctl app status inspect
```

to check the current status of the application.
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

For the replicated update to succeed, it’s necessary to update docker to the recommended version, 17.12.1:

```
    sudo apt-get install docker-ce=17.12.1~ce-0~ubuntu
```

We suggest that you pin the Docker version using:
```
    sudo apt-mark hold docker-ce
```

## Update

Then, you are ready to perform the actual replicated update, by executing the replicated-provided update script:

```
    curl -sSL "https://get.replicated.com/docker?replicated_tag=2.29.0" | sudo bash
```

Double-check your replicated and docker versions;

```
    replicatedctl version    # 2.29.0
    docker -v                # 17.12.1
```

Restart app with

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
