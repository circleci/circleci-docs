---
layout: classic-docs
title: "Enterprise Documentation"
description: "Landing page for Enterprise CircleCI Documentation"
permalink: /enterprise/
---

Welcome to Enterprise Documentation for CircleCI! The CircleCI Enterprise solution is installable inside your private cloud or data center and is available to try with a free license. Refer to the [Overview]({{ site.baseurl }}/enterprise/overview/) document for details about the features, build environments, and architecture. If you are a developer, refer to [Setting Up Projects]({{ site.baseurl }}/enterprise/quick-start) for information about adding and debugging projects.

## Trial Installation Requirements

- A VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. Must have network connectivity to the GitHub or GitHub Enterprise instance and outbound internet access (proxy server is supported by request to CircleCI customer service).  

OR

- An Amazon EC2 VM instance with at least 8G of RAM, outbound internet access, and network connectivity to the GitHub or GitHub Enterprise instance.

See the [Try CircleCI Enterprise]({{ site.baseurl }}/enterprise/single-box/) document for trial installation instructions and links to the machine images.

## Production Installation Requirements

- Minimum of two instances, one for the Services component and one for the Builders. Both instances require running a Linux distribution with Docker support, such as Ubuntu Trusty, or the CircleCI Amazon Machine Image (AMI). 
- The Services instance must have at least four CPUs or GPUs, 8GB RAM, and 30GB of disk space. 
- The Builders instance must have six CPUs or GPUs and 10GB RAM and a root volume of at least 50GB.
- Both instances must have network access to a GitHub or Github Enterprise instance. 

To determine the size required for your workload, provision two CPUs for processing plus two CPUs and 4GB of memory for each container. For example, six CPUs and 10GB of RAM supports two containers concurrently because the default container size is two CPUs with 4GB. 

### Production Installation Options

It is possible to install the Enterprise CircleCI solution in either of the following configurations:

- A single Services machine with one or more Builder machines. See [Installing CircleCI on Amazon Web Services Manually]({{ site.baseurl }}/enterprise/aws-manual/) or [Installing CircleCI on Amazon Web Services with Terraform]({{ site.baseurl }}/enterprise/aws/) for instructions.
- A single Services machine with four database hosts for HA and one or more Builder machines, see [Installing CircleCI in a High Availability Configuration]({{ site.baseurl }}/enterprise/high-availability/) for instructions.

## Customer Use Cases 

**Coinbase** runs CircleCI Enterprise behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%. 

**Fanatics** increased their team efficiency by 300% with CircleCI Enterprise. See the [Fanatics case study report](https://circleci.com/customers/fanatics/).

CircleCI enables **Cruise Automation** (a subsidiary of GM) to run many more simulations before putting code in a road test, see the [Cruise case study report](https://circleci.com/customers/cruise/).

Refer to the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI.

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
