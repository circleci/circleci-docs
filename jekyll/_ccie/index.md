---
layout: classic-docs
title: "Enterprise Documentation"
description: "Landing page for Enterprise CircleCI Documentation"
permalink: /enterprise/
---

Welcome to Enterprise Documentation for CircleCI! The CircleCI Enterprise solution is installable inside your private cloud or data center and is available to try with a free license. If you are new to CircleCI Enterprise administration, check out the [Try CircleCI Enterprise]({{ site.baseurl }}/enterprise/single-box/) document for trial installation instructions and links to the machine images. Then, see the [Overview]({{ site.baseurl }}/enterprise/overview/) document for details about the features, build environments, and architecture. If you are a developer, refer to [Setting Up Projects]({{ site.baseurl }}/enterprise/quick-start) for information about adding and debugging projects.

## Hardware Platform Support and Requirements

- Minimum of two machines or instances, one for the Services component and one for the Builders 
- The Services machine must have at least four CPUs or GPUs, 8GB RAM, and 30GB of disk space 
- The Builders machine must have six CPUs or GPUs and 10GB RAM and a root volume of at least 50GB
- Both machines must have network access to a GitHub Enterprise instance
- Amazon AWS using the CircleCI AMI 

OR

- Private cloud running a Linux distribution with Docker support, such as Ubuntu Trusty 

To determine the size required for your workload, provision two CPUs for processing plus two CPUs and 4GB of memory for each container. For example, six CPUs and 10GB of RAM supports two containers concurrently because the default container size is two CPUs with 4GB. 

## Installation Options

It is possible to install the Enterprise CircleCI solution in either of the following configurations:

- A single Services machine with one or more Builder machines.
- Two Services machines for HA with one or more Builder machines, see [High Availability]({{ site.baseurl }}/enterprise/single-box/) for instructions.

## Customer Use Cases 

**Coinbase** runs CircleCI Enterprise behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%. 

**Fanatics** increased their team efficiency by 300% with CircleCI Enterprise. See the [Fanatics case study report](https://circleci.com/customers/fanatics/).

CircleCI enables **Cruise Automation** (Subsidiary of GM) to run many more simulations before putting code in a road test, see the [Cruise case study report](https://circleci.com/customers/cruise/).

Refer to the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI.

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
