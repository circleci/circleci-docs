---
layout: classic-docs
title: "Administrator’s Overview"
category: [administration]
order: 1
description: "High-level overview of the CircleCI installation process."
---
This article provides System Administrators with an overview of CircleCI 2.0 installation, features, environments, and architecture in the following sections:

* TOC
{:toc}

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. CircleCI is installable inside your private cloud or data center and is free to try for a limited time. Contact us to request a [trial license](https://circleci.com/enterprise-trial-install).

CircleCI 2.0 provides new infrastructure that includes the following improvements:
* New configuration with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching and per-job CPU or memory allocation. 

If you are a user or developer, refer to [Sign Up and Try CircleCI]({{ site.baseurl }}/2.0/first-steps/) to get started with the hosted application.

## Installation Options

There are three basic ways to install CircleCI in your environment (AWS is currently required for each option):

1. A [single-box installation]({{ site.baseurl }}/2.0/single-box/), suitable for trials and small teams
2. A [clustered installation]({{ site.baseurl }}/2.0/aws/), suitable for production use for most teams
3. A [highly-available configuration]({{ site.baseurl }}/2.0/high-availability/) (if supported by your license) to meet higher uptime requirements

## Build Environments

By default, CircleCI 2.0 Builder instances automatically provision containers according to the image configured for each job in your `.circleci/config.yml` file. CircleCI uses Nomad as the primary job scheduler in CircleCI 2.0. Refer to the [Introduction to Nomad Cluster Operation]({{ site.baseurl }}/2.0/nomad/) to learn more about the job scheduler and how to perfom basic client and cluster operations.

## Architecture

CircleCI consists of two primary components: Services and Nomad Clients. Services typically run on a single instance that is comprised of the core application, storage, and networking functionality. Any number of Nomad Clients execute your jobs and communicate back to the Services. Both components must access GitHub or your hosted instance of GitHub Enterprise on the network as illustrated in the following architecture diagram.

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/architecture-v1.png)

### Services 

The machine on which the Service instance runs must not be restarted and may be backed up using built-in VM snapshotting. **Note:** It is possible to configure external data storage with PostgreSQL and Mongo for high availability and then use standard tooling for database backups, see [Adding External Database Hosts for High Availability]({{ site.baseurl }}/2.0/high-availability/). DNS resolution must point to the IP address of the machine on which the Services are installed. The following table describes the ports used for traffic on the Service instance:


| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443 , 4434          | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Builder Boxes               | all traffic / all ports | Internal Communication |
| GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |
{: class="table table-striped"}

### Nomad Clients
The Nomad Clients run without storing state, enabling you to increase or decrease containers as needed. To ensure that there are enough running to handle all of the builds, track the queued builds, and increase the Nomad Client machines as needed to balance the load.

Each machine reserves two CPUs and 4GB of memory for coordinating builds. The remaining processors and memory create the containers. Larger machines are able to run more containers and are limited by the number of available cores after two are reserved for coordination. The following table describes the ports used on the Builder instances:


| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/2.0/ssh-access-jobs/) |
| Administrators                   | 80 or 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Nomad Clients (including itself) | all traffic / all ports | Internal Communication                                         |
{: class="table table-striped"}

### GitHub
CircleCI uses GitHub or GitHub Enterprise credentials for
authentication which, in turn, may use LDAP, SAML, or SSH for access. That is, CircleCI will inherit the authentication  supported by your central SSO infrastructure. The following table describes the ports used on machines running GitHub to communicate with the Services and Builder instances.


| Source        | Ports   | Use          |
|---------------|---------|--------------|
| Services   | 22      | Git Access   |
| Services   | 80, 443 | API Access   |
| Nomad Client  | 22      | Git Access   |
| Nomad Client  | 80, 443 | API Access   |
{: class="table table-striped"}


## Customer Use Cases 

**Coinbase** runs CircleCI behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%. 

CircleCI enables **Cruise Automation** (a subsidiary of GM) to run many more simulations before putting code in a road test, see the [Cruise case study report](https://circleci.com/customers/cruise/).

Refer to the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI.

