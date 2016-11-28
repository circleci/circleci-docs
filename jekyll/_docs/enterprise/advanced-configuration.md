---
layout: enterprise
title: Advanced Configuration
category: [resources]
order: 0
description: "Advance Configurations"
hide: false
---


#Advanced Configuration 

##Proxy Support


### Getting Started

For the purposes of this demo and to follow the examples, we assume that we have an unauthenticated http proxy at `10.0.0.33:3128` and the services box is at `10.0.1.238`. We use `ghe.example.com` as our github enterprise host.

In an ideal case, traffic to S3 will not be proxied, and instead be added to the NO_PROXY rules (to bypass it out add `s3.amazonaws.com,*.s3.amazonaws.com`  to `NO_PROXY`)

Everything here must be done **before** installing CircleCI on fresh vm's/instances.


###EC2 Proxies
If you are setting up your proxy through Amazon, please read this before preceeding: http://docs.aws.amazon.com/cli/latest/userguide/cli-http-proxy.html

You should also avoid proxying internal requests, especially for the services box. Run `export NO_PROXY=<services_box_ip>` to add it to the `NO_PROXY` rules.

*Note that you must configure JVM OPTs again as well. This will be covered below*

### Service Box configuration

The service box has many components that need to make network calls

- Replicated — hits `*.replicated.com`
  - This exists outside the network and should be going through a http call.
- Docker — it’s managed by Replicated.
- Docker Container 
  - The purpose of this container is to create and configure S3 buckets.
  
  - If S3 traffic requires going through an http proxy, we need to pass proxy settings into container.
- The CircleCI instance on Services box (runs in a Docker container)
  - We run the core app in a Docker containers, so we would need to pass the proxy settings to container.

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
###Installing CircleCI Services 

```
$ curl -o ./init-services.sh https://s3.amazonaws.com/circleci-enterprise/init-services.sh
$ sudo -E bash init-services.sh
```

Note that this differs from the regular installation instructions by including the `-E` command with `sudo`. This allows the script to have access to the enviroment variables you exported above.

Also note that when the instructions ask you if you use a proxy, they will also prompt you for the address. It is **very important** that you input the proxy in the following format `<protocol>://<ip>:<port>`. If you are missing any part of that, then apt-get won't work correctly and the packages won't download. 

If for any reason you can't access the page the CircleCI replicated console, but the services machine seems to be running, try to ssh tunnel into the machine doing the following: `ssh -L 8800:<address you want to proxy through>:8800 ubuntu@<ip_of_services_box>`. 


### Builder Box configuration:
This one is a bit easier - it has few moving parts:

- Plenty of `curl` commands to download CircleCI init-builder script and jars from S3.  If you whitelist S3 traffic, then you're are good.  Otherwise, curl respects environment settings.
- `awscli` tool to download container from S3. The same rules of `curl` apply here (i.e. dependent on S3 traffic and environment variable)
- CircleCI JVM.  This makes plenty of connections:
  - Internal call that should be excluded from http proxy — presumably this happens by default:
    - Any connections to other builders and/or Services box
    -  connections to GitHub Enterprise
  - Other calls:
    - Amazon EC2 metadata (http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) .  This **should not** be proxied.  If it is, then the machine will be misconfigured.
    - Amazon S3 traffic — note S3 discussion above
    - Amazon EC2 API - EC2 API traffic may need to be proxied.  You would note lots of failures (timeout failures) in logs if the proxy setting is misconfigured, but it will not block CCIE functioning

### On Builder boxes Launch Configuration - change it to add the /etc/environment modification

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

###Installing CircleCI Builder
This really depends on what type of distro you are installing CircleCI on, but the above instructions cover a basic kind of install


 

