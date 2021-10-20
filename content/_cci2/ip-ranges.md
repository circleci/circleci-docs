---
layout: classic-docs
title: "IP ranges"
short-title: "IP ranges"
description: "Enable CircleCI jobs to go through a set of well-defined IP address ranges"
categories: []
order: 70
version:
 - Cloud
---


Enable CircleCI jobs to go through a set of well-defined IP address ranges.


* TOC
{:toc}

## Overview
{: #overview }

IP ranges is a feature for CircleCI customers who need to configure IP-based access to their restricted environments. As part of this feature, CircleCI provides a list of well-defined IP address ranges associated with the CircleCI service. CircleCI jobs that have this feature enabled will have their traffic routed through one of the defined IP address ranges.

The feature is currently available in preview to customers on a [Performance or Scale plan](https://circleci.com/pricing/). Pricing will be calculated based on network data usage of jobs that have opted in to using the IP ranges feature. There is no charge while the feature is in preview and pricing details will be shared once the feature is generally available.  

## IP ranges: use cases
{: #usecases }

IP ranges lets you limit inbound connections to your infrastructure to only IP address ranges that are verifiably associated with CircleCI.

Some example use cases where IP-based restricted access might be desired include:
- Accessing private artifact repositories
- Pulling dependencies from a CocoaPods proxy hosted behind a firewall
- Running test cases on an internal environment
- Performing integration testing against private AWS resources
- Deploying an internal app with sensitive data
- Granting access to a production network

Prior to offering IP ranges, the only solution CircleCI offered to configure and control static IP addresses was [CircleCI’s Runner](https://circleci.com/docs/2.0/runner-overview/). IP ranges now enables you to meet your IP-based security and compliance requirements using your existing workflows and platform.

## Example configuration file using IP ranges
{: #exampleconfiguration }

```yaml
version: 2.1
jobs:
  build:
    circleci_ip_ranges: true # opts the job into the IP ranges feature
    docker:
      - image: curlimages/curl
    steps:
      - run: echo “Hello World”
workflows:
  build-workflow:
    jobs:
      - build
```

## List of IP address ranges associated with the IP ranges feature
{: #listofipaddressranges }

*Last updated*: 2021-08-23

Jobs that have been opted into the IP ranges feature will have one of the following IP address ranges associated with them:

- 107.22.40.20
- 18.215.226.36
- 3.228.208.40
- 3.228.39.90
- 3.91.130.126
- 34.194.144.202
- 34.194.94.201
- 35.169.17.173
- 35.174.253.146
- 52.20.179.68
- 52.21.153.129
- 52.22.187.0
- 52.3.128.216
- 52.4.195.249
- 52.5.58.121
- 52.72.72.233
- 52.72.73.201
- 54.144.204.41
- 54.161.182.76
- 54.162.196.253
- 54.164.161.41
- 54.167.72.230
- 54.205.138.102
- 54.209.115.53
- 54.211.118.70
- 54.226.126.177
- 54.81.162.133
- 54.83.41.200
- 54.92.235.88

**Note:** _jobs can use any of the address ranges above. It is also important to note that the address ranges are shared by all CircleCI customers who have opted into using the feature._
{: class="alert alert-warning"}

IP address ranges for core services (used to trigger jobs, exchange information about users between CircleCI and Github etc):

- 18.214.70.5
- 52.20.166.242
- 18.214.156.84
- 54.236.156.101
- 52.22.215.219
- 52.206.105.184
- 52.6.77.249 
- 34.197.216.176
- 35.174.249.131
- 3.210.128.175

### Upcoming changes to the list of IP address ranges

#### 2021-08-23
* Added new items to the list of IP address ranges for core services.

The machine-consumable lists have also been updated to reflect the new IP address ranges.

**Machine-consumable lists can be found below:**

- IP address ranges *for jobs*: [DNS A record](https://dnsjson.com/jobs.knownips.circleci.com/A.json).

- IP address ranges *for core services*: [DNS A record](https://dnsjson.com/core.knownips.circleci.com/A.json).

- *All IP address ranges*:  [DNS A record](https://dnsjson.com/all.knownips.circleci.com/A.json).

During the preview phase, this list may change. You should check regularly for updates, at least once a week.

Notifications of a change to this list will be sent out by email to all customers who have at least one job opted into the IP ranges feature. When the feature is generally available, **30 days notice** will be given before changes are made to the existing set of IP address ranges. This page and the machine-consumable list will also be updated when there are upcoming changes.

## Pricing
{: #pricing }

Pricing will be calculated based on network data usage of jobs opted into the IP ranges feature, however, only the traffic of the opted-in jobs will be counted. It is possible to mix jobs with and without the IP ranges feature within the same workflow or pipeline.

Specific rates and details are being finalized and will be published when the feature is generally available.

While IP ranges is in preview, CircleCI may contact you if the amount of traffic sent through this feature reaches an excessive threshold. 

## AWS and GCP IP Addresses
{: #awsandgcpipaddresses }

The machines that execute *all jobs* on CircleCI’s platform, not just jobs opted into IP ranges, are hosted on Amazon Web Services (AWS), Google Cloud Platform (GCP), and CircleCI's macOS Cloud. An exhaustive list of IP addresses that CircleCI’s traffic may come from on these cloud providers’ platforms can be found by looking up each cloud provider's IP address ranges. AWS & GCP offer endpoints to find this information.

- [AWS](https://ip-ranges.amazonaws.com/ip-ranges.json): CircleCI uses the *us-east-1* and *us-east-2* regions
- [GCP](https://www.gstatic.com/ipranges/cloud.json): CircleCI uses the *us-east1* and *us-central1* regions
- CircleCI macOS Cloud:
  - 162.252.208.0/24
  - 162.252.209.0/24
  - 192.206.63.0/24
  - 162.221.90.0/24
  - 38.39.177.0/24
  - 38.39.178.0/24
  - 38.39.188.0/24
  - 38.39.189.0/24 
  - 38.39.186.0/24
  - 38.39.187.0/24
  - 38.39.184.0/24 
  - 138.39.185.0/24

CircleCI *does not recommend* configuring an IP-based firewall based on the AWS or GCP IP addresses, as the vast majority are not CircleCI’s machines. Additionally, there is *no guarantee* that the addresses in the AWS or GCP endpoints persist from day-to-day, as these addresses are reassigned continuously.
 
**IP ranges** is the recommended method for configuring an IP-based firewall to allow traffic from CircleCI’s platform.

## Known limitations
{: #knownlimiations}

- IP ranges is currently available exclusively for the [Docker executor](https://circleci.com/docs/2.0/executor-types/#using-docker), not including `remote_docker`.
- When downloading or uploading files larger than ~10 MB during execution of jobs with IP ranges enabled, intermittently, the job may receive TCP reset (RST) packets and drop the connection. This could cause the job to fail if there is no retry logic in place while downloading/uploading the file.  CircleCI recommends including robust retry mechanisms in your config when attempting to download/upload large files during execution of jobs with IP ranges enabled.  For example, if your job uses [curl](http://www.ipgp.fr/~arnaudl/NanoCD/software/win32/curl/docs/curl.html) to download/upload a large file, include the ```--retry <num>``` flag and set ```<num>``` to a large number such as 1,000.
