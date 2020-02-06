---
layout: classic-docs
title: "Using the Static Installation Scripts"
category: [administration]
order: 1
description: "Using CircleCI 2.0 static installation scripts."
hide: false
---
This article provides a System Administrators' overview of CircleCI's 2.0 static installation for non-AWS environments.

* TOC
{:toc}


## Limitations 

This method of installation has the following limitations:

- It is not possible to use `machine` executors.
- It is not possible to use the Remote Docker Environment or Docker Layer Caching.
- There is no first-class high-availability option.

CircleCI 2.0 provides new infrastructure that includes the following improvements:

* New configuration with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching and per-job CPU or memory allocation. 

## Build Environments

By default, CircleCI 2.0's Nomad Client instances automatically provision containers according to the image configured for each job in your `.circleci/config.yml` file. CircleCI uses Nomad as the primary job scheduler in CircleCI 2.0. Refer to the [Introduction to Nomad Cluster Operation]({{ site.baseurl }}/2.0/nomad/) to learn more about the job scheduler and how to perfom basic client and cluster operations.

## Architecture

A CircleCI static installation consists of two primary components: Services and Nomad Clients. Services run on a single instance that is comprised of the core application, storage, and networking functionality. Any number of Nomad Clients execute jobs and communicate back to the Services machine. Both components must access an instance of GitHub or GitHub Enterprise on the network as illustrated in the following architecture diagram.

![A Diagram of the CircleCI Architecture]({{site.baseurl}}/assets/img/docs/architecture-v1.png)

### Services 

The machine on which the Services instance runs should only be restarted gracefully and may be backed up using built-in VM snapshotting. **Note:** It is possible to configure external data storage with PostgreSQL and Mongo for high availability and then use standard tooling for database backups, see [Adding External Database Hosts for High Availability]({{ site.baseurl }}/2.0/high-availability/). DNS resolution must point to the IP address of the machine on which the Services are installed. The following table describes the ports used for traffic on the Service instance:


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
authentication which, in turn, may use LDAP, SAML, or SSH for access. CircleCI will inherit the authentication supported by your central SSO infrastructure. The following table describes the ports used on machines running GitHub to communicate with the Services and Nomad client instances.


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

Have the following available before beginning the installation procedure:

- A Platinum CircleCI support agreement. Contact CircleCI support or your account representative to get started.
- A CircleCI License file (.rli). Contact CircleCI support if you need a license.
- A machine to run Ubuntu 14.04 or 16.04 with a minimum of at least 100 GB storage, 32 GB RAM, and 4 CPUs (8 CPUs preferred) for the Services VM.
- A cluster of machines running Ubuntu 14.04 or 16.04 with a minumum of 8 GB RAM and 4 CPUs each, as well as network access to any Docker registries that are required by your builds for the Nomad Client VMs.

### Installing the Services Machine

1. Copy the [Services init script](https://github.com/circleci/server-static-install/blob/master/provision-services-ubuntu.sh) to the Services VM machine.

2. Log in to the machine provisioned for the Services VM and run the `sudo su` command.

3. Run `./provision-services-ubuntu.sh` to start the script. 

4. Go to the public IP of the host on port 8800 using HTTPS. You may need to configure a firewall rule or other public Internet gateway to enable access to the services host.

5. You will see a page about bypassing the browser's TLS warning. If you'd like, you can copy the command below that into your terminal to verify the certificate's authenticity.

6. Enter your license.

7. On the Replicated settings page, enter the following information:
  - Hostname: either an IP address or your hostname if you've configured DNS records for a domain.
  - Services: make sure all boxes are checked.
  - Execution Engines: make sure 1.0 is unchecked and 2.0 is checked.
  - 2.0 Builders: make sure this is set to "Cluster".
  - GitHub Integration: Follow the instructions in the description and fill in the details.
  - Storage: if you're running this installation in Amazon, you can configure an S3 bucket to store build artifacts and files. If not, set to "None".
  - VM Provider: set to "None".

8. Any sections not explicitly mentioned above can be configured or left alone per your needs.

9. Accept the License Agreement, and click "Save".

### Installing the Nomad Clients

1. Copy the [Client init script](https://github.com/circleci/server-static-install/blob/master/provision-nomad-client-ubuntu.sh) to the Nomad Server machine.

2. Log in to the machine provisioned for the Nomad Server and run the `sudo su` command.

3. To start the script, set the `NOMAD_SERVER_ADDRESS` environment variable to the routable IP of the Services machine you set up in the last section. Then, run `./provision-nomad-client-ubuntu.sh` (for example, `NOMAD_SERVER_ADDRESS=1.2.3.4 ./provision-nomad-client-ubuntu.sh`).

### Storage

The `None` storage driver saves all of your CircleCI data locally. This means that artifacts, test results, and action logs will be saved locally at `/data/circle/storage-fileserver`. It is best practice to mount an external volume and create a symbolic link between the two when using this storage option. **Note:** Data may only be transferred as quickly as the external volume will allow, so SSDs are best practice.

### Troubleshooting

This section includes some possible resolutions for common issues that may be encountered during system setup and installation.

- Symptom: Jobs stay in `queued` status until they fail and never successfully run.
  - Check port 8585 if the nomad client logs contain the following type of error message:
    - {"error":"rpc error: code = Unavailable desc = grpc: the connection is unavailable","level":"warning","msg":"error fetching config, retrying","time":"2018-04-17T18:47:01Z"}
