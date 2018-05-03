---
layout: classic-docs
title: "Introduction to Nomad Cluster Operation"
category: [administration]
order: 9
description: "Introduction to Nomad Cluster Operation with CircleCI"
---

CircleCI uses [Nomad](https://www.hashicorp.com/blog/nomad-announcement/) as the primary job scheduler in CircleCI 2.0.
This document provides a basic introduction to Nomad for understanding how to operate the Nomad Cluster in your CircleCI 2.0 installation in the following sections:

* TOC
{:toc}

## Basic Terminology and Architecture

- **Nomad Server:** Nomad Servers are the brains of the cluster. It receives and allocates jobs to Nomad clients. In CircleCI, a Nomad server is running in your service box as a Docker Container.

- **Nomad Client:** Nomad Clients execute jobs allocated by Nomad servers. Usually a Nomad client runs on a dedicated machine (often a VM) in order to fully take the advantage of its machine power. You can have multiple Nomad clients to form a cluster and the Nomad server allocates jobs to the cluster with its scheduling algorithm.

- **Nomad Jobs:** Nomad Job is a specification provided by users that declares a workload for Nomad. In CircleCI 2.0, a Nomad job corresponds to an execution of CircleCI job/build. If the job/build uses parallelism, say 10 parallelism, then Nomad will run 10 jobs.

- **Build Agent:** Build Agent is a Go program written by CircleCI that executes steps in a job and reports the results. Build Agent is executed as the main process inside a Nomad Job.

## Basic Operations

This section will give you the basic guide of operating a Nomad cluster in your installation.

The `nomad` CLI is installed in the Service instance. It is pre-configured to talk to the Nomad cluster, so it is possible to use the `nomad` command to run the following commands in this section.

### Checking the Jobs Status

The `nomad status` command will give you the list of jobs status in your cluster. The `Status` is the most important field in the output with the following status type definitions:

- `running`: The status becomes `running` when Nomad has started executing the job. This typically means your job in CircleCI is started.

- `pending`: The status becomes `pending` when there are not enough resources available to execute the job inside the cluster.

- `dead`: The status becomes `dead` when Nomad finishes executing the job. The status becomes `dead` regardless of whether the corresponding CircleCI job/build succeeds or fails.

### Checking the Cluster Status

The `nomad node-status` command will give you the list of Nomad clients. Note that `nomad node-status` command also reports both Nomad clients that are currently serving (status `active`) and Nomad clients
that were taken out of the cluster (status `down`). Therefore, you need to count the number of `active` Nomad clients to know the current capacity of your cluster.

The `nomad node-status -self` command will give you more information about the client where you execute the command. Such information includes how many jobs are running on the client and the resource utilization of the client.

### Checking Logs

As noted in the Nomad Jobs section above, a Nomad Job corresponds to an execution of CircleCI job/build. Therefore, checking logs of Nomad Jobs sometimes helps you to understand the status of CircleCI job/build if there is a problem.

The `nomad logs -job -stderr <nomad-job-id>` command will give you the logs of the job.

**Note:** Be sure to specify `-stderr` flag as most of logs from Build Agent appears in the `stderr`.

While the `nomad logs -job` command is useful, the command is not always accurate because the `-job` flag uses a random allocation of the specified job. The term `allocation` is a smaller unit in Nomad Job which is out of scope of this document. To learn more, please see [the official document](https://www.nomadproject.io/docs/internals/scheduling.html).

Complete the following steps to get logs from the allocation of the specified job:

1. Get the job ID with `nomad status` command.

1. Get the allocation ID of the job with `nomad status <job-id>` command.

1. Get the logs from the allocation with `nomad logs -stderr <allocation-id>`

<!---
## Scaling the Nomad Cluster
Nomad itself does not provide a scaling method for cluster, so you must implement one. This section provides basic operations regarding scaling a cluster.
--->

### Scaling Up the Client Cluster

Refer to the Auto Scaling section of the [Administrative Variables, Monitoring, and Logging](https://circleci.com/docs/2.0/monitoring/#auto-scaling) document for details about adding Nomad Client instances to an AWS auto scaling group and using a scaling policy to scale up automatically according to your requirements. 

<!--- 
commenting until we have non-aws installations?
Scaling up Nomad cluster is very straightforward. To scale up, you need to register new Nomad clients into the cluster. If a Nomad client knows the IP addresses of Nomad servers, then the client can register to the cluster automatically.
HashiCorp recommends using Consul or other service discovery mechanisms to make this more robust in production. For more information, see the following pages in the official documentation for [Clustering](https://www.nomadproject.io/intro/getting-started/cluster.html), [Service Discovery](https://www.nomadproject.io/docs/service-discovery/index.html), and [Consul Integration](https://www.nomadproject.io/docs/agent/configuration/consul.html).
--->

### Shutting Down a Nomad Client

When you want to shutdown a Nomad client, you must first set the client to `drain` mode. In the `drain` mode, the client will finish already allocated jobs but will not get allocated new jobs.

1. To drain a client, log in to the client and set the client to drain mode with `node-drain` command as follows:

`nomad node-drain -self -enable`

2. Then, make sure the client is in drain mode with `node-status` command:

`nomad node-status -self`

Alternatively, you can drain a remote node with `nomad node-drain -enable -yes <node-id>`.

### Scaling Down the Client Cluster

To set up a mechanism for clients to shutdown in `drain` mode first and wait for all jobs to be finished before terminating the client, configure an ASG Lifecycle Hook that triggers a script when scaling down instances.

The script should use the above commands to put the instance in drain mode, monitor running jobs on the instance, wait for them to finish and then terminate the instance.
