---
layout: enterprise
section: enterprise
title: "Overview"
category: [documentation]
order: 1
description: "High-level overview of the CircleCI Enterprise."
---

This article provides an overview of CircleCI Enterprise architecture in the following sections:

* TOC
{:toc}

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. The CircleCI Enterprise solution is installable inside your private cloud or data center and is free to try for two weeks. CircleCI automates build, test, and deployment of software.

## Basic Features

After a software repository in GitHub Enterprise is added as a project to the CircleCI Enterprise application, every new commit triggers a build and notification of success or failure through webhooks with integrations for Slack, HipChat, Campfire, Flowdock, or IRC notifications. Code coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may also be configured to deploy code to various environments, including the following:

- AWS CodeDeploy
- AWS EC2 Container Service (ECS)
- AWS S3
- Google Container Engine (GKE)
- Heroku

Other cloud service deployments can be easily scripted using SSH or by installing the API client of the service with your job configuration.

Contact us at <enterprise-support@circleci.com> to request a trial license.

## Build Environments

CircleCI Enterprise installations may run a single Linux or MacOS
image for builds. Users of your CircleCI Enterprise installation must use this single contianer image for all of their builds and may **not** choose between Precise and Trusty build container images, or custom built
images, for example. 

**Note:** If your CircleCI Enterprise installation is not open to the internet, you may
need to connect to a VPN or take other special steps to access the CircleCI application or SSH builds.
These steps will vary depending on your network setup.

## Architecture

CircleCI Enterprise requires two types of instances to run: service and builder instances. The service type is a single instance that contains the CircleCI application and the resources that store data and run protocols. Any number of builder instances execute your jobs as defined by the plan for your CircleCI account. Both instance types must access your instance of GitHub Enterprise on the network as illustrated in the following architecture diagram. 

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/enterprise-network-diagram.png)

The machine on which the Service instance runs must not be restarted and must be backed up using VM snapshots at a minimum. DNS resolution must point to the IP address of the machine on which the service instance is installed. The following table describes the ports used for traffic on the Service instance:

| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443                 | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Builder Boxes               | all traffic / all ports | Internal Communication |
| GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |


The machines on which Builder instances run may be restarted by using the `circle-shutdown` command to gracefully shutdown. The Builder instances run without storing state, enabling you to increase or decrease containers as needed. To ensure that there are enough builder machines running to handle all of the builds, track the queued builds and increase the Builder instance machines as needed to balance the load.

Each machine on which the Builders are installed reserves two CPUs and 4GB of memory for coordinating builds. The remaining processors and memory create the containers. Larger machines are able to run more containers and are limited by the number of available cores after two are reserved for coordination. The following table describes the ports used on the Builder instances:

| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/1.0/ssh-build/) |
| Administrators                   | 80, 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Builder Boxes (including itself) | all traffic / all ports | Internal Communication                                         |

CircleCI Enterprise uses GitHub Enterprise credentials for
authentication which, in turn, may use LDAP, SAML, or SSH for access. The following table describes the ports used on machines running GitHub to communicate with the Services and Builder instances.

| Source        | Ports   | Use          |
|---------------|---------|--------------|
| Services   | 22      | Git Access   |
| Services   | 80, 443 | API Access   |
| Builder  | 22      | Git Access   |
| Builder  | 80, 443 | API Access   |





