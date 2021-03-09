---
layout: classic-docs
title: "Core Features"
short-title: "Core Features"
description: "Starting point for learning core features of CircleCI 2.0"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v2.x
---

This document provides a summary of differentiating features of CircleCI for Developers and Operators.

## Developer features

Following are the most popular features CircleCI offers that Developers are interested in.

### SSH into builds

Often the best way to troubleshoot problems is to [SSH into a job]({{ site.baseurl }}/2.0/ssh-access-jobs/) and inspect things like log files, running processes, and directory paths. CircleCI 2.0 gives you the option to access all jobs via SSH.

Note: When CircleCI runs your pipeline, the [`run` ](https://circleci.com/docs/2.0/configuration-reference/#run) command executes shell commands in a _non-interactive_ shell. When SSH-ing into a build, you are using an _interactive_ shell (see the section on [Invocation](https://linux.die.net/man/1/bash) in the bash manual for more information). An interactive bash shell loads a series of startup files (such as `~/.bash_profile`), which may or may not change the outcome of SSH debugging process.

### Parallelism

If your project has a large number of tests, it will need more time to run them on one machine. To reduce this time, you can [run tests in parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) by spreading them across multiple machines. This requires specifying a parallelism level. 

Use either the CircleCI CLI to split test files or use environment variables to configure each parallel machine individually.


### Resource class

It is possible to configure CPU and RAM resources for each job, allowing for efficient use of your resources. The [resource class]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) will need to be specified in the `.circleci/config.yml` file.  If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used. 

### Cache

Another popular feature is [caching]({{ site.baseurl }}/2.0/caching/). Caching is one of the most effective ways to make jobs faster on CircleCI by reusing the data from expensive fetch operations from previous jobs. 

### Workflows

CircleCI [Workflows]({{ site.baseurl }}/2.0/workflows/) are a great feature that can increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources. 


## Operator features

These are the most frequently asked about features CircleCI offers that Operators are interested in.

### Monitoring

System Administrators are able to gather [metrics for monitoring]({{ site.baseurl }}/2.0/monitoring/) their CircleCI installation for various environment variables including installed Nomad Clients and Docker metrics.

### Nomad cluster

CircleCI uses Nomad as the primary job scheduler in CircleCI 2.0. Refer to the [basic introduction to Nomad]({{ site.baseurl }}/2.0/nomad/) for understanding how to operate the Nomad Cluster in your CircleCI 2.0 installation.

### APIs

The [CircleCI API]({{ site.baseurl }}/api/) is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI. 

### Basic troubleshooting

There are some [initial troubleshooting]({{ site.baseurl }}/2.0/troubleshooting/) steps to take if you are having problems with your CircleCI installation on your private server. 

If your issue is not addressed in the above article, generate a [support bundle](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/) for your installation and open a support ticket. 

### Insights

The [Insights page]({{ site.baseurl }}/2.0/insights/) in the CircleCI UI is a dashboard showing the health of all repositories you are following including median build time, median queue time, last build time, success rate, and parallelism. 
