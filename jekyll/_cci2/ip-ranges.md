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

IP ranges is a feature for CircleCI customers who need to configure IP-based access to their restricted environments.  As part of this feature, CircleCI provides a list of well-defined IP address ranges associated with the CircleCI service. CircleCI jobs that have this feature enabled will have their traffic routed through one of the defined IP address ranges.

The feature is currently available in preview to customers on any [paid pricing plan](https://circleci.com/pricing/).

## IP ranges: use cases
{: #usecases }

	IP ranges empowers customers to limit inbound connections to their infrastructure to IP address ranges that are verifiably associated with CircleCI.  

Some example customer use cases where IP-based restricted access might be desired include:
- Accessing private artifact repositories 
- Pulling dependencies from a CocoaPods proxy hosted behind a firewall
- Running test cases on an internal environment 
- Performing integration testing against private AWS resources
- Deploying an internal app with sensitive data
- Granting access to a production network 

Previous to offering IP ranges, the only solution CircleCI offered customers in need of static IP addresses which could be configured and controlled was [CircleCI’s Runner](https://circleci.com/docs/2.0/runner-overview/). IP ranges now enables customers to meet their IP-based security and compliance requirements using their existing workflows and platform. 

## Example configuration file that uses IP ranges
{: #exampleconfiguration }

```
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

*Last updated*: 07/21/2021

Jobs that have opted into the IP ranges feature will have one of the following IP address ranges associated with them:

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

IP address ranges for core services (used to trigger jobs, exchange information about users between CircleCI and Github etc):

- 18.214.70.5
- 52.20.166.242
- 35.174.249.131
- 18.214.156.84
- 54.236.156.101
- 3.210.128.175

**Upcoming Changes to List of IP Address Ranges:
*Last Updated*: 07/21/2021
None

**Note:** _jobs can use any of the address ranges above.  It’s also important to note that the address ranges are shared by all CircleCI customers who have opted into using the feature._
{: class="alert alert-warning"}

Machine-consumable lists can be found below:

- IP address ranges *for jobs*: [DNS A record](https://dnsjson.com/jobs.knownips.circleci.com/A.json).

- IP address ranges *for core services*: [DNS A record](https://dnsjson.com/core.knownips.circleci.com/A.json).

- *All IP address ranges*:  [DNS A record](https://dnsjson.com/all.knownips.circleci.com/A.json).

During the preview phase, this list may change. You should check regularly for updates, at least once a week.  
 
Notifications of a change to this list will be sent out via email to all customers who have at least one job opted into the IP ranges feature. When the feature is generally available, **30 days notice** will be given before changes are made to the existing set of IP address ranges. This page and the machine-consumable list will also be updated when there are upcoming changes.

## Pricing
{: pricing }

Pricing will be calculated based on network data usage of jobs opted into the IP ranges feature; however, only the traffic of the opted-in jobs will be counted. It is possible to mix jobs with and without the IP ranges feature within the same workflow or pipeline.

Specific rates and details are being finalized and will be published when the feature is generally available. 

## AWS and GCP IP Addresses
{: awsandgcpipaddresses }

The machines that execute *all jobs* on CircleCI’s platform, not just jobs opted into IP ranges, are hosted on Amazon Web Services (AWS) and Google Cloud Platform (GCP).  An exhaustive list of IP addresses that CircleCI’s traffic may come from on these cloud providers’ platforms can be found by looking up each cloud providers’ IP address ranges. Each cloud provider offers endpoints to find this information.
 
- [AWS](https://ip-ranges.amazonaws.com/ip-ranges.json): CircleCI uses the *us-east-1* and *us-east-2* regions
- [GCP](https://www.gstatic.com/ipranges/cloud.json): CircleCI uses the *us-east1* and *us-central1* regions
 
CircleCI *does not recommend* configuring an IP-based firewall based on the above IP addresses, as the vast majority are not CircleCI’s machines. Additionally, there is *no guarantee* that the addresses in the endpoints above persist from day-to-day, as these addresses are reassigned continuously.  
 
**IP ranges** is the recommended method for configuring an IP-based firewall to allow traffic from CircleCI’s platform.

## Known limitations
{: known limiations}

IP ranges is only available in the Docker executor.  It is not available for the ```remote_docker`` VMs.
