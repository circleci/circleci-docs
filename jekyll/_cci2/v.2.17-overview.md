---
layout: classic-docs
title: "CircleCI Server v2.17 What's New"
short-title: "CircleCI Server v2.17 What's New"
description: "Starting point for CircleCI Server v2.17 docs"
categories: [getting-started]
order: 1
---

This document provides a summary of features and product notes for the release of CircleCI Server v2.17.

## What's New in Release 2.17

* Workflows now has a Slack Integration! Users can choose to receive Slack notifications when their workflows complete.
* Administrators can now restrict which organizations are allowed into their CircleCI installation. For more details on how to enable this feature, please see the User Management Section of the 2.17 Ops Manual.
* We changed the renamed org flow so orgs that have been renamed will no longer result in errors going forward. Existing users who had applied workarounds for this use case will now no longer require said workarounds.
* Workflows now take up less DB space and will be easier to maintain going forward.
* Improved the cache in front of GraphQL API resulting in overall improved performance.
* Added backpressure to avoid overwhelming nomad with requests, this will result in increased performance from existing nomad clusters.


- PDF installation and operations documentation:
   - *CircleCI v2.17 Installation Guide*
   - *CircleCI v2.17 Operations Guide*

## Fixed in Release 2.17

* Fixed some bugs related to GitHub API response handling and webhook handling.
* Fixed issue with Scheduled Workflows when the services machine is restarted.
* Fixed changing the RabbitMQ hostname for Scheduled Workflows when externalizing.
* You can no longer create contexts with no names. If you are using a context with no names, it will no longer be accessible from your execution environment.
* We have optimized our handling of large amounts of build output and test results XML, to avoid out-of-memory errors.
* The CIRCLE_PULL_REQUEST environment variable was not being populated correctly in all cases when building across forks. This has been fixed.
* Fixed a bug where some commits with [ci skip] in the message were still being built.
* Fixed a bug causing Workflows to get stuck when infrastructure_failure happens after a job fails.
* Fixed a bug causing duplicate docker networks on same nomad client (if running build using machine:true AND vm-provider=on_host).
* Improved performance when using local storage. Previously, caching issues had been experienced when local storage was used rather than the default option of using S3 (selecting None under * Storage Driver options from the Management Console).
* We have added more error checking and validation around Github’s API so the existing list commit endpoint no longer causes issues.
* Datadog API token field was stored in plaintext, now set as a password field.
* Fixed issue where workflows were constrained from fanning out to large number of jobs.


## Updated in Release 2.17

* New machine executor AMIs based on Ubuntu 16.04 for AWS.
  Ubuntu 16.04 with Docker 18.06.3 has apt-daily and apt-daily-upgrade services disabled.
  It is highly recommended that customers try to experiment with the AMIs below before officially switching:
  The new images are as follows:

  ```
  Ap-northeast-1:ami-0e49af0659db9fc5d,
  Ap-northeast-2:ami-03e485694bc2da249,
  Ap-south-1:ami-050370e57dfc6574a,
  Ap-southeast-1:ami-0a75ff7b28897268c
  Ap-southeast-2:ami-072b1b45245549586,
  Ca-central-1:ami-0e44086f0f518ad2d,
  Eu-central-1:ami-09cbcfe446101b4ea,
  Eu-west-1:ami-0d1cbc2cc3075510a,
  Eu-west-2:ami-0bd22dcdc30fa260b,
  Sa-east-1:ami-038596d5a4fc9893b,
  Us-east-1:ami-0843ca047684abe87,
  Us-east-2:ami-03d60a35576647f63,
  Us-west-1:ami-06f6efb13d9ccf93d,
  us-west-2:ami-0b5b8ad02f405a909
  ```

  They are replacing:

  ```
  Ap-northeast-1:ami-cbe000ad
  ap-northeast-2:ami-629b420c,
  Ap-south-1:ami-97bac2f8
  ap-southeast-1:ami-63b22100,
  Ap-southeast-2:ami-dd6c73be,
  Ca-central-1:ami-d02c93b4,
  Eu-central-1:ami-b243eedd
  eu-west-1:ami-61de3718,
  Eu-west-2:ami-904e5ff4,
  Sa-east-1:ami-c22057ae,
  Us-east-1:ami-05b6e77e,
  Us-east-2:ami-9b4161fe,
  Us-west-1:ami-efc9e08f,
  us-west-2:ami-ce8c94b7
  ```

* It is currently a best practice to use a Services Machine with a minimum of 32GB of RAM. Starting in v2.18 it will become required. See [docs](https://circleci.com/docs/2.0/aws/#planning) for our recommendation(s).
* We have updated our software packages to the following versions. This is not a required update for those with externalized environments at this time, but will be when v2.18 is released.

  * Vault 1.1.2
  * Mongo 3.6.12-xenial
  * Redis 4.0.14

* We are removing the 1.0 Single-Box options from CircleCI 2.0. We found a few critical vulnerabilities in our 1.0 build image, and we have long stopped recommending it for trials. If this is absolutely critical to your workflow please reach out to us. This does not impact people who are running 1.0 in clustered mode.

## Updating
Steps to update to CircleCI Server v2.17 are as follows:

1. Check you are running Docker v17.12.1, and if not update (steps in section below)
2. Update Replicated to v2.34.1 (steps in section below)
3. Navigate to your Management Console dashboard, for example, `https://<your-circleci-hostname>.com:8800` and select the v2.17 upgrade.

### Prequisites for Updating Replicated

- Your installation is Ubuntu 14.04 or 16.04 based.
- You are running replicated version 2.10.3<= on your services machine
  - replicated --version
- Your installation is **not** airgapped and you can access the internet from it
- All steps are completed on the Services machine
- Verify what version of replicated you need to update to by viewing the (Server Changelog)[https://circleci.com/server/changelog/]

### Preparations

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

### Update

Perform the Replicated update by executing the update script as follows:

```
    curl -sSL "https://get.replicated.com/docker?replicated_tag=2.34.1" | sudo bash
```

Double-check your replicated and docker versions:

Example Output
```
    replicatedctl version    # 2.34.1
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
