---
layout: enterprise
section: enterprise
title: "LXC-based Builder Configuration"
category: [advanced-config]
order: 6
hide: true
description: "Configuring the CircleCI Enterprise installation."
sitemap: false
---

CircleCI Enterprise builder behavior can be customized with a number parameters specified via environment variables. These variables can be specified by customizing the startup script (or `*.tf` file if using Terraform) for builders to the following instead of the default:

```
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    CIRCLE_CONFIG_OPTION_1=<value> \
    CIRCLE_CONFIG_OPTION_2=<value> \
    bash
```

### Adjusting Build Container Power

You can, optionally, adjust the CPU and memory used by your build containers using the following build configuration variables. Our default containers have 2 CPUs and 4G of memory:

* `CIRCLE_CONTAINER_MEMORY_LIMIT` - the amount of memory allocated to each container set with a value of `xG` where `x` is an integer number of gigabytes of memory.
Default value is `4G`.

* `CIRCLE_CONTAINER_CPUS` - the number of CPUs allocated to each container.
Default value is `2`.
*Note:* if `CIRCLE_CONTAINER_CPUS` is `0` there will be no limit on cpu resources per container.

* `CIRCLE_NUM_CONTAINERS` - the number of containers to run on each build box.
Default value is ([TOTAL_CORES] - 2)/`CIRCLE_CONTAINER_CPUS`
*Note:* **You must leave 2 cores and at least 4G of memory free to run the Circle process in the container.**


In order to set them up, please follow the following steps:

1. Add them to the user data field of the Launch Configuration associated with your auto-scaling group in amazon.

2. Terminate all instances in the auto-scaling group. If you are worried about downtime, you can launch new instances first before terminating the old instances.

For more information on how many containers your builder instance can support, please checkout the amazon instance type specifications for your chosen instance type: <https://aws.amazon.com/ec2/instance-types/>. By default, our terraform and cloudformation scripts spin up `r3.2xlarge` builder instances.

### Selecting a build container image

You can control the container image used to run builds with the `CIRCLE_CONTAINER_IMAGE_URI` environment variable. The URI may either be a standard http(s) resource, or it may use the `s3://` protocol (e.g. `s3://bucket-name/key`) in which case AWS IAM instance profile authentication may be used. For CircleCI-managed containers, you may also use the abbreviated, region-independent `CIRCLE_CONTAINER_IMAGE_ID` variable to fix your builder machines to a specific container version.

#### Using the Trusty image

CircleCI builders can use the same Trusty (Ubuntu 14.04) build container image available on circleci.com by specifying `CIRCLE_CONTAINER_IMAGE_ID=circleci-trusty-container_0.0.575`. This image includes the languages and packages specified [here](https://circle-artifacts.com/gh/circleci/image-builder/575/artifacts/0/tmp/circle-artifacts.RbPnATN/versions.json).

#### Using a custom image

If you're running into serious performance issues configuring your dependencies via the `circle.yml`, CircleCI enterprise has functionality that allows you to generate your own custom image and use it to run all your builds. This can often lead to much faster startup times, since the new container will come pre-configured with all your dependencies, and is frequently much smaller than our default container. Some things to consider before deciding if this is the right approach for you:

_Once you move to a custom image container, you will be responsible for all future updates to your own container._

You can build a customized image with Docker using the [container image builder](https://github.com/circleci/image-builder).

_If you are interested, please reach out to us by opening a ticket at <https://support.circleci.com/hc/en-us/> as well.  We'd love to hear your feedback and give guidance on how best to configure your build environment_

### Running Upstream Docker

If you wish to use the upstream version of Docker rather than the patched version provided by CircleCI you will need to run an privileged LXC container. You can do this by editing the launch configuration in AWS and setting `CIRCLE_CONTAINER_TYPE=privileged-lxc`.

You can now either bake the version of Docker that you want into your custom image, or install it via `circle.yml` by adding the code below:


```
machine:
  post:
    - sudo curl -L -o /usr/bin/docker https://get.docker.com/builds/Linux/x86_64/docker-1.9.1
    - sudo container=yes docker daemon: { background: true }
```

### Sharing Docker Socket

In CircleCI Enterprise, it's possible to bind-mount a Docker socket from the underlying host into the build containers so that they can all share a single long-running daemon for improved performance. It should be equivalent to the cache performance you see on Jenkins.

**NOTE**: The primary drawback here is security-related. Giving builds access to the Docker daemon on the host is basically equivalent to giving them root access to the machine. The same is true on Jenkins, but CircleCI's default nested Docker approach, while it has performance issues, does provide a layer of security.

To setup a long-running Docker daemon on a builder machine, you can start it with userdata like this:

```
#!/bin/bash
curl -sSL https://get.docker.com | bash
sudo chmod 777 /var/run/docker.sock
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    SERVICES_PRIVATE_IP=X.X.X.X \
    CIRCLE_SECRET_PASSPHRASE=xxxx \
    CIRCLE_SHARED_DOCKER_ENGINE=true \
    CIRCLE_CONTAINER_IMAGE_ID=ubuntu-14.04-dot-com-XXL-927-41cd8fe \
    bash
```

There are also a couple small differences to use this daemon within builds:

1. Set `DOCKER_HOST="unix:///tmp/docker.sock"`
2. Don't enter "docker" in the "services" section of circle.yml (no need to start the service as it's already running on the host)

You should then see improved performance between builds!


### Adjusting Builder Networking

You can adjust which subnets containers use by setting the following environment variables:

* `CIRCLE_CONTAINERS_SUBNET` - the subnet all containers will share, in CIDR notation.
* `CIRCLE_CONTAINERS_SUBNET_MASK_LENGTH` - the size of the netmask for
  each container's individual subnet. Needs to be no more than 30, and needs to be a large
  enough to fit enough containers in the `CIRCLE_CONTAINERS_SUBNET`.

Some examples:

* The defaults:
  ```
  CIRCLE_CONTAINERS_SUBNET=172.16.1.0/16
  CIRCLE_CONTAINERS_SUBNET_NETMASK_LENGTH=24
  ```

* Use 10.0.3.x
  ```
  CIRCLE_CONTAINERS_SUBNET=10.0.3.1/24
  CIRCLE_CONTAINERS_SUBNET_NETMASK_LENGTH=30
  ```

* Use 192.168.x.x
  ```
  CIRCLE_CONTAINERS_SUBNET=192.168.1.0/16
  CIRCLE_CONTAINERS_SUBNET_NETMASK_LENGTH=24
  ```
