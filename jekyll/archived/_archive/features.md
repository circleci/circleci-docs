---
layout: classic-docs
title: "Core Features"
short-title: "Core Features"
description: "Starting point for learning core features of CircleCI"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document provides a summary of differentiating features of CircleCI for Developers and Operators.

## Developer features
{: #developer-features }

Following are the most popular features CircleCI offers that Developers are interested in.

### SSH into builds
{: #ssh-into-builds }

Often the best way to troubleshoot problems is to [SSH into a job]({{ site.baseurl }}/ssh-access-jobs/) and inspect things like log files, running processes, and directory paths. CircleCI gives you the option to access all jobs via SSH.

Note: When CircleCI runs your pipeline, the [`run` ]({{site.baseurl}}/configuration-reference/#run) command executes shell commands in a _non-interactive_ shell. When SSH-ing into a build, you are using an _interactive_ shell (see the section on [Invocation](https://linux.die.net/man/1/bash) in the bash manual for more information). An interactive bash shell loads a series of startup files (such as `~/.bash_profile`), which may or may not change the outcome of SSH debugging process.

### Parallelism
{: #parallelism }

If your project has a large number of tests, it will need more time to run them on one machine. To reduce this time, you can [run tests in parallel]({{ site.baseurl }}/parallelism-faster-jobs/) by spreading them across multiple machines. This requires specifying a parallelism level.

Use either the CircleCI CLI to split test files or use environment variables to configure each parallel machine individually.


### Resource class
{: #resource-class }

It is possible to configure CPU and RAM resources for each job, allowing for efficient use of your resources. The [resource class]({{ site.baseurl }}/configuration-reference/#resource_class) will need to be specified in the `.circleci/config.yml` file. 

### Cache
{: #cache }

Another popular feature is [caching]({{ site.baseurl }}/caching/). Caching is one of the most effective ways to make jobs faster on CircleCI by reusing the data from expensive fetch operations from previous jobs.

### Workflows
{: #workflows }

CircleCI [Workflows]({{ site.baseurl }}/workflows/) are a great feature that can increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.


## Operator features
{: #operator-features }

These are the most frequently asked about features CircleCI offers that Operators are interested in.

### Monitoring
{: #monitoring }

System Administrators are able to gather [metrics for monitoring]({{ site.baseurl }}/monitoring/) their CircleCI installation for various environment variables including installed Nomad Clients and Docker metrics.

### Nomad cluster
{: #nomad-cluster }

CircleCI uses Nomad as the primary job scheduler. Refer to the [basic introduction to Nomad]({{ site.baseurl }}/server-3-operator-nomad/) for understanding how to operate the Nomad Cluster in your CircleCI server installation.

### APIs
{: #apis }

The [CircleCI API]({{ site.baseurl }}/api/) is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI.

### Basic troubleshooting
{: #basic-troubleshooting }

There are some [initial troubleshooting]({{ site.baseurl }}/troubleshooting/) steps to take if you are having problems with your CircleCI installation on your private server.

If your issue is not addressed in the above article, generate a [support bundle](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/) for your installation and open a support ticket.

### Insights
{: #insights }

The [Insights page]({{ site.baseurl }}/insights/) in the CircleCI UI is a dashboard showing the health of all repositories you are following including median build time, median queue time, last build time, success rate, and parallelism.
