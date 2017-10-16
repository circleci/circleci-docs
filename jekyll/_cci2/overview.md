---
layout: classic-docs
title: "Administrator’s Overview"
category: [administration]
order: 1
description: "High-level overview of the CircleCI installation process."
---
This article provides System Administrator's with an overview of CircleCI 2.0 installation, features, environments, and architecture in the following sections:

* TOC
{:toc}

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. CircleCI is installable inside your private cloud or data center and is free to try for a limited time. 

CircleCI 2.0 provides new infrastructure that includes the following improvements:
* New configuration with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching and per-job CPU or memory allocation. 

If you are a user or developer, refer to [Sign Up and Try CircleCI]({{ site.baseurl }}/2.0/first-steps/) to get started with the hosted application.

## Trial Installation Requirements

- A VM with at least 32GB RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. Must have network connectivity to the GitHub or GitHub Enterprise instance and outbound internet access (proxy server is supported by request to CircleCI customer service).  

OR

- An Amazon EC2 VM instance with at least 32G RAM, outbound internet access, and network connectivity to the GitHub or GitHub Enterprise instance.

See the [CircleCI Trial Installation]({{ site.baseurl }}/2.0/single-box/) document for trial installation instructions and links to the machine images.

## Production Installation Requirements

- Minimum of two instances, one for the Services component and one for the Builders. Both instances require running a Linux distribution with Docker support, such as Ubuntu Trusty, or the CircleCI Amazon Machine Image (AMI). 
- The Services instance must have at least eight CPUs and 32GB RAM. 
- The Builders instance must have six CPUs or GPUs and 10GB RAM and a root volume of at least 50GB.
- Both instances must have network access to a GitHub or Github Enterprise instance. 

To determine the size required for your workload using the default `medium` resource class, provision two CPUs for processing plus two CPUs and 4GB of memory for each container. For example, six CPUs and 10GB of RAM supports two containers concurrently because the default container size is two CPUs with 4GB. Refer to the Resource Class section of the Writing Jobs with Steps document for information about the available CPU and RAM per class and to plan instance sizes for `large` and `xlarge` workloads. 

### Production Installation Options

It is possible to install CircleCI 2.0 in either of the following configurations:

- A single Services machine with one or more Builder machines. See [Installing CircleCI on Amazon Web Services with Terraform]({{ site.baseurl }}/2.0/aws/) for instructions.
- A single Services machine with multiple database hosts for HA and one or more Builder machines, see [Installing CircleCI in a High Availability Configuration]({{ site.baseurl }}/2.0/high-availability/) for instructions.

## Customer Use Cases 

**Coinbase** runs CircleCI behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%. 

**Fanatics** increased their team efficiency by 300% with CircleCI. See the [Fanatics case study report](https://circleci.com/customers/fanatics/).

CircleCI enables **Cruise Automation** (a subsidiary of GM) to run many more simulations before putting code in a road test, see the [Cruise case study report](https://circleci.com/customers/cruise/).

Refer to the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI.

## Basic Features

After a software repository in GitHub or GitHub Enterprise is added as a project to the CircleCI application, every new commit triggers a build and notification of success or failure through webhooks with integrations for Slack, HipChat, Campfire, Flowdock, or IRC notifications. Code coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may also be configured to deploy code to all major platforms, including the following:

- AWS CodeDeploy
- AWS EC2 Container Service (ECS)
- AWS S3
- Google Container Engine (GKE)
- Heroku

Other cloud service deployments can be easily scripted using SSH or by installing the API client of the service with your job configuration.

Contact us at [Support](mailto:enterprise-support@circleci.com) to request a trial license.

## Build Environments

By default, CircleCI 2.0 Builder instances automatically provision containers according to the image configured for each job in your `.circleci/config.yml` file. 

## Architecture

CircleCI consists of two primary components: Services and Builders. Services run on a single instance that is comprised of the core application, storage, and networking functionality. Any number of Builder instances execute your jobs and communicate back to the Services. Both components must access your instance of GitHub or GitHub Enterprise on the network as illustrated in the following architecture diagram.

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/ccie_arch.png)

### Services 

The machine on which the Service instance runs must not be restarted and may be backed up using built-in VM snapshotting. **Note:** It is possible to configure external data storage with PostgreSQL and Mongo for high availability and then use standard tooling for database backups, see [Adding External Database Hosts for High Availability]({{ site.baseurl }}/2.0/high-availability/). DNS resolution must point to the IP address of the machine on which the Services are installed. The following table describes the ports used for traffic on the Service instance:


| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443                 | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Builder Boxes               | all traffic / all ports | Internal Communication |
| GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |
{: class="table table-striped"}

### Builders
The Builder instances run without storing state, enabling you to increase or decrease containers as needed. To ensure that there are enough Builder machines running to handle all of the builds, track the queued builds and increase the Builder instance machines as needed to balance the load.

Each machine on which the Builders are installed reserves two CPUs and 4GB of memory for coordinating builds. The remaining processors and memory create the containers. Larger machines are able to run more containers and are limited by the number of available cores after two are reserved for coordination. The following table describes the ports used on the Builder instances:


| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/2.0/ssh-access-jobs/) |
| Administrators                   | 80 or 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Builder Boxes (including itself) | all traffic / all ports | Internal Communication                                         |
{: class="table table-striped"}

### GitHub
CircleCI uses GitHub or GitHub Enterprise credentials for
authentication which, in turn, may use LDAP, SAML, or SSH for access. That is, CircleCI will inherit the authentication  supported by your central SSO infrastructure. The following table describes the ports used on machines running GitHub to communicate with the Services and Builder instances.


| Source        | Ports   | Use          |
|---------------|---------|--------------|
| Services   | 22      | Git Access   |
| Services   | 80, 443 | API Access   |
| Builder  | 22      | Git Access   |
| Builder  | 80, 443 | API Access   |
{: class="table table-striped"}




