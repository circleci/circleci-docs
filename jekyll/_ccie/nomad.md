---
layout: enterprise
section: enterprise
title: "Introduction to Nomad"
category: [advanced-config]
order: 9
description: "Introduction to Nomad"
---

We chose [Nomad](https://www.hashicorp.com/blog/nomad-announcement/) as the primary job scheduler in CircleCI 2.0.
This document will give you the basic introduction to Nomad and helps to operate Nomad Cluster in your installation.

# Basic Terminologies and Architecture

### Nomad Server
Nomad Servers are the brains of the cluster. It receives and allocate jobs to Nomad clients. In CircleCI, a Nomad server is running in your service box as a Docker Container.

### Nomad Client
Nomad Clients execute jobs allocated by Nomad servers. Usually a Nomad client runs on a dedicated machine (often a VM) in order to fully take the advantage of its machine power.
You can have multiple of Nomad clients to form a cluster and Nomad server allocates jobs to the cluster with it's scheduling algorithm.

### Nomad Jobs
Nomad Job is a specification provided by users that declares a workload for Nomad. In CircleCI 2.0, a Nomad job corresponds to an execution of CircleCI job/build. If the job/build uses parallelism, say 10 parallelism, then Nomad will run 10 jobs.

### Build Agent
Build Agent is a Go program written by CircleCI that executes steps in a job and reports the results. Build Agent is executed as the main process inside a Nomad Job.

# Basic Operations

This section will give you the basic guide of operating a Nomad cluster in your installation.

### Checking the Jobs Status

`nomad status` will give you the list of jobs status in your cluster. The `Status` is the most important field in the output.

`running`: The status becomes `running` when Nomad started executing the job. This typically means your job in CircleCI is started.

`pending`: The status becomes `pending` when there is not enough resource available to execute the job inside the cluster.

`dead`: The status becomes `dead` when Nomad finishes executing the job. The status becomes `dead` regardless whether the corresponding CircleCI job/build succeeds or fails.

### Checking the Cluster Status

`nomad node-status` will give you the list of Nomad clients. Note that `nomad node-status` command also reports both Nomad clients that are currently serving (status `active`) and Nomad clients
that were taken out of the cluster (status `down`). Therefore, you need to count the number of `active` Nomad clients to know the current capacity of your cluster.

`nomad node-status -self` will give you more information about the client where you execute the command. Such information includes how many jobs are running on the client and the resource utilization of the client.

### Checking logs

As we talked in [Nomad Jobs]({{ site.baseurl }}/enterprise/nomad/#nomad-jobs)  section, a Nomad Job corresponds to an execution of CircleCI job/build. Therefore, checking logs of Nomad Jobs sometimes help you to understand the status of CircleCI job/build when things go wrong.

`nomad logs -job -stderr <nomad-job-id>` command will give you the logs of the job.

**Note:** Make sure to specify `-stderr` flag as most of logs from Build Agent appears in the stderr.

While `nomad logs -job` command is handy, the command is not always accurate as `-job` flag uses a random allocation of the specified job. The term `allocation` is a smaller unit in Nomad Job which is out of scope of this document. To learn more, please see [the official document](https://www.nomadproject.io/docs/internals/scheduling.html).

It's three steps work to get logs from the allocation of the specified job.

1. Get the job id with `nomad status` command.

1. Get the allocation of the job with `nomad status <job-id>`.

1. Get the logs from the allocation with `nomad logs -stderr <allocation-id>`

# Scaling the Nomad Cluster

Nomad itself doesn't provide a scaling method for cluster, so you need to implement one by your self. This section provides basic operations regarding scaling cluster.

### Scale Up

Scaling up Nomad cluster is very straightforward. To scale up, you need to register new Nomad clients into the cluster. If a Nomad client knows the IP addresses of Nomad servers, then the client can registers to the cluster automatically.

HashiCorp recommends using Consul or other service discovery mechanisms to make this more robust in production but this is out of scope of this document.

For more information, you can see the following pages in the official doc.

[Clustering](https://www.nomadproject.io/intro/getting-started/cluster.html)

[Service Discovery](https://www.nomadproject.io/docs/service-discovery/index.html)

[Consul Integration](https://www.nomadproject.io/docs/agent/configuration/consul.html)

### Drain

When you want to shutdown a Nomad client, you first need to make the client drain mode. In the drain mode, the client will finish already allocated jobs but will not get allocated new jobs.

To drain a client, login to the client and make the client drain mode with `node-drain` command.

`nomad node-drain -self -enable`

Then, make sure the client is in drain mode with `node-status` command.

`nomad node-sattus -self`

Alternatively, you can drain a remote node with `nomad node-drain -enable -yes <node-id>`

### Scale Down

To scale your Nomad cluster properly, you need a mechanism that make clients that are going to shutdown in drain mode first. Then, wait for all jobs to be finished before terminating the client.

While there are many ways to archive this, here is one example of implementing such mechanism by using AWS and ASG.

* Configure ASG Lifecycle Hook that triggers a script when scaling down instances.
* The script makes the instance in drain mode.
* The script monitors running jobs on the instance and wait for them to finish.
* Terminate the instance.
