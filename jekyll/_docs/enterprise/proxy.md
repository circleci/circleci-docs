---
layout: enterprise
title: Setting up HTTP Proxies
category: [enterprise]
order: 4
description: "How to get CircleCI Enterprise to use a HTTP proxy."
hide: true
---

This document specifies the different components involved in potentially configuring CCIE to use HTTP proxy:

## To support HTTP Proxy upgrade to the latest released version

We don't officially support HTTP Proxies yet. This is an very rough doc that outlines the network requirements of CircleCI and provides guidance for setting it up for yourself. For the purposes of this demo and to follow the examples, we assume that we have an unauthenticated http proxy at `10.0.0.33:3128` and the services box is at `10.0.1.238`. We use `ghe.example.com` as our github enterprise host.

In an ideal case, traffic to S3 will not be proxied, and it’s controlled by the NO_PROXY rules (to bypass it out add `s3.amazonaws.com,*.s3.amazonaws.com`  to `NO_PROXY`)

MUST bypass 169.254.169.254 going to EC2
Should avoid proxying internal requests, specially for services box so add it there as well

*Note that you must configure JVM OPTs again as well*

## Service Box configuration

The service box has many components that need to make network calls

- Replicated — hits `*.replicated.com`
  - outside the network and should be going through http call.
- Docker — it’s managed by Replicated.
- A Helper docker container — we have a helper docker container that creates and configure S3 buckets
  - If S3 traffic requires going through http proxy, we need to pass proxy settings into container
- The CircleCI instance on Services box (runs in a Docker container)
  - This has the complexity of having Docker, so we would need to pass proxy settings to container
  - See next for the relevant settings

### SSH into the services box and run the following (with correct arguments):
```
$ echo '{"HttpProxy": "http://10.0.0.33:3128"}' | sudo tee  /etc/replicated.conf
$ (cat <<'EOF'
HTTP_PROXY=10.0.0.33:3128
HTTPS_PROXY=10.0.0.33:3128
NO_PROXY=169.254.169.254,10.0.1.238,127.0.0.1,localhost,ghe.sphereci.com
JVM_OPTS="-Dhttp.proxyHost=10.0.0.33 -Dhttp.proxyPort=3128 -Dhttps.proxyHost=10.0.0.33 -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|10.0.1.238|127.0.0.1|localhost|ghe.example.com $JVM_OPTS"

EOF
) | sudo tee -a /etc/environment
$ sudo service replicated stop; sudo service replicated-agent stop; sudo service replicated-agent start; sudo service replicated start
```

## Builder Box configuration:
This one is a bit easier - it has few moving parts:

- Plenty of `curl` commands to download CircleCI init-builder script and jars from S3.  If you whitelist S3 traffic, then you're are good.  Otherwise, curl respects environment settings.
- `awscli` tool to download container from S3. The same rules of `curl` apply here (i.e. dependent on S3 traffic and environment variable)
- CircleCI JVM.  This makes plenty of connections:
  - Internal call that should be excluded from http proxy — presumably this happens by default:
    - Any connections to other builders and/or Services box
    -  connections to GitHub Enterprise
  - Other calls:
    - Amazon EC2 metadata (http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) .  This SHOULD NOT be proxied.  If it is, then the machine will be misconfigured
    - Amazon S3 traffic — note S3 discussion above
    - Amazon EC2 API - EC2 API traffic may need to be proxied.  You would note lots of failures (timeout failures) in logs if the proxy setting is misconfigured, but it will not block CCIE functioning

### On Builder boxes Launch Configuration - change it to add the /etc/environment modifcation

```
#!/bin/bash

(cat <<'EOF'
# Append
HTTP_PROXY=10.0.0.33:3128
HTTPS_PROXY=10.0.0.33:3128
NO_PROXY=169.254.169.254,10.0.1.238,127.0.0.1,localhost,ghe.sphereci.com
JVM_OPTS="-Dhttp.proxyHost=10.0.0.33 -Dhttp.proxyPort=3128 -Dhttps.proxyHost=10.0.0.33 -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|10.0.1.238|127.0.0.1|localhost|ghe.sphereci.com $JVM_OPTS"

EOF
) | sudo tee -a /etc/environment

set -a
. /etc/environment

# Back to normal BUT MUST REMOVE sudo
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    SERVICES_PRIVATE_IP=10.0.1.238 bash
```
