---
layout: enterprise
title: Advanced Configuration
category: [resources]
order: 0
description: "Advance Configurations"
hide: false
---


# Advanced Configuration 

## Proxy Support


### Getting Started

Lets assume that we have an unauthenticated http proxy at `10.0.0.33:3128` and the services box is at `10.0.1.238`. We use `ghe.example.com` as our github enterprise host.

In an ideal case, traffic to S3 will not be proxied, and instead be added to the NO_PROXY rules (to bypass it out add `s3.amazonaws.com,*.s3.amazonaws.com`  to `NO_PROXY`)

The proxy instructions must be done **before** installing CircleCI on fresh vm's/instances.


### EC2 Proxies
If you are setting up your proxy through Amazon, please read this before preceeding: http://docs.aws.amazon.com/cli/latest/userguide/cli-http-proxy.html

You should also avoid proxying internal requests, especially for the services box. Run `export NO_PROXY=<services_box_ip>` to add it to the `NO_PROXY` rules.

*Note that you must configure JVM OPTs again as well. This will be covered below*

### Service Box configuration

The service box has many components that need to make network calls

- External Network Calls
  - Replicated
    - Replicated is a vendor service that we use to bootstrap CircleCI. We require them to make an outside call to validate the license. 
    - Replicated also goes and downloads docker and installs in on the local machine. They then use a Docker container to create and configure S3 buckets.
   
-Internal Network calls  
  - If S3 traffic requires going through an http proxy, we need to pass proxy settings into the container.
  - The CircleCI instance on Services box (runs in a Docker container)
    - We run the core app in a Docker containers, so we would need to pass the proxy settings to the container to maintain full functionality.

### Setup Service Proxy Support

- SSH into the services box and run the following code snippet with your proxy address.
  - If you run in Amazon's EC2 service then you'll need to include `169.254.169.254` EC2 services as shown below.

```
1.) echo '{"HttpProxy": "http://<proxy-ip:port>"}' | sudo tee  /etc/replicated.conf
2.) (cat <<'EOF'
HTTP_PROXY=<proxy-ip:port>
HTTPS_PROXY=<proxy-ip:port>
NO_PROXY=169.254.169.254,<circleci-service-ip>,127.0.0.1,localhost,ghe.sphereci.com
JVM_OPTS="-Dhttp.proxyHost=<ip> -Dhttp.proxyPort=<port> -Dhttps.proxyHost=<proxy-ip> -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|<circleci-service-ip>|127.0.0.1|localhost|ghe.example.com $JVM_OPTS"

EOF
) | sudo tee -a /etc/environment
3.) sudo service replicated stop; sudo service replicated-agent stop; sudo service replicated-agent start; sudo service replicated start
```
### Installing CircleCI Services 

```
1.) curl -o ./init-services.sh https://s3.amazonaws.com/circleci-enterprise/init-services.sh
2.) sudo -E bash init-services.sh
```

Note that this differs from the regular installation instructions by including the `-E` command with `sudo`. This allows the script to have access to the enviroment variables you exported above.

Also note that when the instructions ask you if you use a proxy, they will also prompt you for the address. It is **very important** that you input the proxy in the following format `<protocol>://<ip>:<port>`. If you are missing any part of that, then apt-get won't work correctly and the packages won't download. 

If for any reason you can't access the page the CircleCI Replicated console, but the services machine seems to be running, try to ssh tunnel into the machine doing the following: `ssh -L 8800:<address you want to proxy through>:8800 ubuntu@<ip_of_services_box>`. 


### Builder Box configuration:

- External Network Calls
  - We use scripts to download initialization scripts, along with jars from Amazon S3. 
    - `Curl` respects enviroment settings, but if you have whitelisted traffic from Amazon S3 you shouldn't have any problems.
  - `awscli` tool to download container from S3. The same rules of `curl` apply here (i.e. dependent on S3 traffic and environment variable)
  

- Internal Network Calls
  - CircleCI JVM.  
    - Internal calls that should be excluded from http proxy — presumably this happens by default:
    - Any connections to other builders and/or Services box
    - Connections to GitHub Enterprise.
  - The following contains parts that may be impacted due to a proxy configuration:
      - Amazon EC2 metadata (http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) .  This **should not** be proxied.  If it is, then the machine  will be misconfigured.
      - Amazon S3 traffic — note S3 discussion above
      - Amazon EC2 API - EC2 API traffic may need to be proxied.  You would note lots of failures (timeout failures) in logs if the proxy setting is misconfigured, but it will not block CCIE functioning.

### Setup Builder Proxy Support



- Quick note. If you are using AWS you'll have to add the below to your builder's launch configuration. These instructions should be added to /etc/environment.

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

##GPU Install Instructions 

This is only supported in releases after ( 1.47.0 +). If you need help upgraging, please reachout to enterprise-support@circleci.com

First

`wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`

next while the above runs

```
sudo apt-get install -y linux-image-extra-`uname -r` linux-headers-`uname -r` linux-image-`uname -r`
```

then once both finish

```
sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
sudo apt-get update
;;installing cuda breaks the circle.jar because it changes the java version. This is hanldled by the update-alternatives step 
sudo apt-get --yes --force-yes install cuda
```

after

try without this but with the exact same steps




type in `nvidia-smi` ( this will initialize the nvidia drivers to be visiable to the lxc container ) and press enter
`sudo modprobe nvidia-uvm`


next
`curl -o ./provision-builder.sh https://s3.amazonaws.com/circleci-enterprise/provision-builder-lxc-2016-12-05.sh`

sudo bash ./provision-builder.sh

then 

`sudo update-alternatives --set java /usr/lib/jvm/jdk1.8.0_73/bin/java`


For the next step copy and paste the following lxc configurations into lxc_config.txt

----Below is the final version and the one that should be posted into a circle argument./pasted into the file

```
lxc.cgroup.devices.allow = c 195:* rwm
lxc.cgroup.devices.allow = c 250:* rwm
lxc.mount.entry = /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry = /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry = /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
```

then run the following command

`CIRCLE_LXC_RUN_ARGUMENTS="$(cat lxc_config.txt)"`

run `echo "$CIRCLE_LXC_RUN_ARGUMENTS"` to ensure that you outputs looks like like 

```
lxc.cgroup.devices.allow = c 195:* rwm
lxc.cgroup.devices.allow = c 250:* rwm
lxc.mount.entry = /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry = /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry = /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
```

 next

in the script.

`curl -o ./init-builder.sh https://s3.amazonaws.com/circleci-enterprise/init-builder-lxc-2016-12-05.sh`

make the builder join

```
sudo -E \
  SERVICES_PRIVATE_IP=<priviate ip> \
  CIRCLE_SECRET_PASSPHRASE=<secret passphrase> \
  CIRCLE_BUILD_VOLUMES="<stuff>" \
  CIRCLE_CONTAINER_IMAGE_ID="circleci-trusty-container_0.0.575" \
  bash ./init-builder.sh
```

then 

the above settings will only take affect after the containers are initlized with the default configs, so run a couple of builds to make sure
that you are indeed importing the nvidia settings. 

In your circle.yml/image you'll want to do the following 

    - wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
    - sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
    - sudo apt-get update
    - sudo apt-get --yes --force-yes install cuda

   this will install the driver without making kernel changes 

Then in your circle.yml test section, you'll need to add 

    - export PATH=/usr/local/cuda-8.0/bin:$PATH
    - export LD_LIBRARY_PATH=/usr/local/cuda-8.0/lib64:$LD_LIBRARY_PATH


See here for a working sample project

    https://github.com/GERey/Sample-GPU-Project