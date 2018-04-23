---
layout: classic-docs
title: "Using the Static Installation Scripts"
category: [administration]
order: 1
description: "Using CircleCI 2.0 static installation scripts."
hide: true
---
This article provides System Administrators with a preview of installing a clean CircleCI 2.0 installation if your existing 1.0 installation did not use AWS and instead used a custom hardware installation in the following sections:

* TOC
{:toc}


## Limitations 

This method of preview installation has the following limitations:

- It is not possible to use machine executors
- It is not possible to use Remote Docker or Docker Layer Caching
- There is no first class high availability

CircleCI 2.0 provides new infrastructure that includes the following improvements:

* New configuration with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching and per-job CPU or memory allocation. 

## Build Environments

By default, CircleCI 2.0 Nomad Client instances automatically provision containers according to the image configured for each job in your `.circleci/config.yml` file. CircleCI uses Nomad as the primary job scheduler in CircleCI 2.0. Refer to the [Introduction to Nomad Cluster Operation]({{ site.baseurl }}/2.0/nomad/) to learn more about the job scheduler and how to perfom basic client and cluster operations.

## Architecture

CircleCI Static consists of two primary components: Services and Nomad Clients. Services run on a single instance that is comprised of the core application, storage, and networking functionality. Any number of Nomad Clients execute your jobs and communicate back to the Services. Both components must access your instance of GitHub or GitHub Enterprise on the network as illustrated in the following architecture diagram.

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/architecture-v1.png)

### Services 

The machine on which the Service instance runs should only be restarted gracefully and may be backed up using built-in VM snapshotting. **Note:** It is possible to configure external data storage with PostgreSQL and Mongo for high availability and then use standard tooling for database backups, see [Adding External Database Hosts for High Availability]({{ site.baseurl }}/2.0/high-availability/). DNS resolution must point to the IP address of the machine on which the Services are installed. The following table describes the ports used for traffic on the Service instance:


| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443, 7171, 8081     | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Nomad Clients               | 4647, 8585, 7171, 3001  | Internal Communication |
| GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |
{: class="table table-striped"}

### Nomad Clients

The Nomad Client instances run without storing state, enabling you to increase or decrease containers as needed. To ensure that there are enough client machines running to handle all of the builds, track the queued builds, and increase the client machines as needed to balance the load.

Each machine on which the Nomad Clients are installed reserves two CPUs and 4GB of memory for coordinating builds. The remaining processors and memory create the containers. Larger machines are able to run more containers and are limited by the number of available cores after two are reserved for coordination. The following table describes the ports used on the Nomad client instances:


| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/2.0/ssh-access-jobs/) |
| Administrators                   | 80 or 443               | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services VM                      | 4647, 8585, 7171, 3001  | Internal Communication                                         |
{: class="table table-striped"}

### GitHub

CircleCI uses GitHub or GitHub Enterprise credentials for
authentication which, in turn, may use LDAP, SAML, or SSH for access. That is, CircleCI will inherit the authentication supported by your central SSO infrastructure. The following table describes the ports used on machines running GitHub to communicate with the Services and Nomad client instances.


| Source        | Ports   | Use          |
|---------------|---------|--------------|
| Services   | 22      | Git Access   |
| Services   | 80, 443 | API Access   |
| Nomad Client | 22      | Git Access   |
| Nomad Client | 80, 443 | API Access   |
{: class="table table-striped"}


## Installation 

The following sections describe the steps for installation of the Services VM and the Nomad cluster.

### Prerequisites

Have the following information available before beginning the installation procedure:

- CircleCI License file (.rli), contact CircleCI support for a license.
- A machine to run Ubuntu 14.04 with a minimum of at least 100 GB storage, 32 GB RAM, and 4 CPUs (8 CPUs preferred) for the Services VM.
- A cluster of machines running Ubuntu 14.04 with minumum of 8 GB RAM, 4 CPUs each, and network access any Docker registries that are required by your builds for the Nomad Client VMs.

### Steps

To install the Services machine, perform the following steps:

1. Copy the [Services init script](https://github.com/circleci/server-static-install/blob/master/provision-services-ubuntu.sh) to the Services VM machine.

2. Log in to the machine provisioned for the Services VM and run the `sudo su` command.

3. Run './provision-services-ubuntu.sh' to start the script. 

4. Go to the public IP of the host on port 8800 using HTTPS.

5. Enter your license.

6. Complete the Storage section.

To install the Nomad Clients, perform the following steps:

1. Copy the [Client init script](https://github.com/circleci/server-static-install/blob/master/provision-nomad-client-ubuntu.sh) to the Nomad Server machine.

2. Log in to the machine provisioned for the Nomad Server and run the `sudo su` command.

3. Run './provision-services-ubuntu.sh' with the NOMAD_SERVER_ADDRESS environment variable set to the routable IP of the Services machine to start the script. 



