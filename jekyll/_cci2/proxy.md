---
layout: classic-docs
title: Setting up HTTP Proxies
category: [administration]
order: 7
description: "How use an HTTP proxy with my CircleCI installation."
---

This document describes how to configure CircleCI to use an HTTP proxy in the following sections:

* TOC
{:toc}

## Overview

If you are setting up your proxy through Amazon, read this before proceeding: 

[Using an HTTP Proxy - AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-http-proxy.html)

Avoid proxying internal requests, especially for the Services machine. Run `export NO_PROXY=<services_box_ip>` to add it to the `NO_PROXY` rules. In an ideal case, traffic to S3 will not be proxied, and instead be bypassed by adding `s3.amazonaws.com,*.s3.amazonaws.com` to the `NO_PROXY` rule.

These instructions assume an unauthenticated HTTP proxy at `10.0.0.33:3128`, a Services machine at `10.0.1.238` and use of `ghe.example.com` as the GitHub Enterprise host.

**Note:** The following proxy instructions must be completed **before** installing CircleCI on fresh VMs or instances. You must also configure JVM OPTs again as well as described below.

## Service Machine Proxy Configuration

The Service machine has many components that need to make network calls, as follows:

- **External Network Calls** - Replicated is a vendor service that we use for the Management Console of CircleCI. CircleCI  requires Replicated to make an outside call to validate the license, check for updates, and download upgrades. Replicated also downloads docker, installs it on the local machine, and uses a Docker container to create and configure S3 buckets.
   
- **Internal Network calls**  
  - If S3 traffic requires going through an HTTP proxy, CircleCI must pass proxy settings into the container.
  - The CircleCI instance on the Services machine runs in a Docker container, so it must to pass the proxy settings to the container to maintain full functionality.

### Set up Service Machine Proxy Support

SSH into the Services machine and run the following code snippet with your proxy address. If you run in Amazon's EC2 service then you'll need to include `169.254.169.254` EC2 services as shown below.

```
# 1.) instruct replicated to use proxy for pulling down containers
echo '{"HttpProxy": "http://<proxy-ip:port>"}' | sudo tee  /etc/replicated.conf
# 2.) instruct all CircleCI containers to use proxy for their communications
(cat <<'EOF'
HTTP_PROXY=<proxy-ip:port>
HTTPS_PROXY=<proxy-ip:port>
NO_PROXY=169.254.169.254,<circleci-service-ip>,127.0.0.1,localhost,ghe.example.com
JVM_OPTS="-Dhttp.proxyHost=<ip> -Dhttp.proxyPort=<port> -Dhttps.proxyHost=<proxy-ip> -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|<circleci-service-ip>|127.0.0.1|localhost|ghe.example.com"

EOF
) | sudo tee -a /etc/circle-installation-customizations
# 3.) Restart replicated to pick up changes
sudo service replicated-ui stop; sudo service replicated stop; sudo service replicated-operator stop; sudo service replicated-ui start; sudo service replicated-operator start; sudo service replicated start
```

**Note:** The above is not handled by by our enterprise-setup script and will need to be added to the user data for the services box startup or done manually. 

### Corporate Proxies
In some environments you may not have access to a `NO_PROXY` equivalent outside your network. In that case, put all relevant outbound addresses into the `HTTP_PROXY` or `HTTPS_PROXY` and only add machines on the internal network to `NO_PROXY` such as the Services and Builders.  


Also note that when the instructions ask you if you use a proxy, they will also prompt you for the address. It is **very important** that you input the proxy in the following format `<protocol>://<ip>:<port>`. If you are missing any part of that, then `apt-get` won't work correctly and the packages won't download. 

If you cannot access the page of the CircleCI Replicated management console, but the services machine seems to be running, try to SSH tunnel into the machine doing the following: `ssh -L 8800:<address you want to proxy through>:8800 ubuntu@<ip_of_services_box>`. 


### Nomad Client Configuration

- **External Network Calls** - CircleCI uses `curl`  and `awscli` scripts to download initialization scripts, along with jars from Amazon S3. Both `curl` and `awscli` respect environment settings, but if you have whitelisted traffic from Amazon S3 you should not have any problems.
  
- **Internal Network Calls** 
  - CircleCI JVM:  
    - Any connections to other Nomad Clients or the Services machine should be excluded from HTTP proxy
    - Connections to GitHub Enterprise should be excluded from HTTP proxy
  - The following contains parts that may be impacted due to a proxy configuration:
      - Amazon EC2 metadata (http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html).  This **should not** be proxied.  If it is, then the machine will be misconfigured.
      - Amazon S3 traffic — note S3 discussion above
      - Amazon EC2 API - EC2 API traffic may need to be proxied.  You would note lots of failures (timeout failures) in logs if the proxy setting is misconfigured, but it will not block CircleCI from functioning.

### Nomad Client Proxy Setup

If you are using AWS Terraform install you'll have to add the below to your Nomad client launch configuration. These instructions should be added to `/etc/environment`. If you are using Docker, refer to the [Docker HTTP Proxy Instructions](https://docs.docker.com/engine/admin/systemd/#/http-proxy) documentation.


```
#!/bin/bash

# 1.) Set proxy to be read by any processes
(cat <<'EOF'
HTTP_PROXY=<proxy-ip:port>
HTTPS_PROXY=<proxy-ip:port>
NO_PROXY=169.254.169.254,<circleci-service-ip>,127.0.0.1,localhost,ghe.example.com
JVM_OPTS="-Dhttp.proxyHost=<ip> -Dhttp.proxyPort=<port> -Dhttps.proxyHost=<proxy-ip> -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|<circleci-service-ip>|127.0.0.1|localhost|ghe.example.com"
EOF
) | sudo tee -a /etc/environment

# 2.) Read the modified environment into current shell
set -a
. /etc/environment

```

You'll also need to follow these instructions: https://docs.docker.com/network/proxy/ for making sure that your containers have outbound/proxy access. 
