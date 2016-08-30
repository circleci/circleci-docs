---
layout: enterprise
title: "Configuration Options"
category: [resources]
order: 4.1
description: "Configuring the CircleCI Enterprise installation."
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

### Supported Builder Instance Types
CircleCI currently only supports instance types with attached SSD storage. EBS-only volumes (**C4** / **M4**) will not work. The number of containers per machine below assume the defualt container size of 2CPU/4G. If you want to change those defaults, please see below.

* **M3**: The `m3.2xlarge` is a good choice if you only need a couple containers, as it is usually cheaper than comprable `c3` or `r3` instances. But the `m3.2xlarge` can only fit **3 containers**, and there are no larger `m3` instances. If you plan to use a larger fleet, we recommend `c3` instances.
* **C3**: The `c3` family is a less expensive choice for larger fleets. Since the `c3` instances have less memory than the `r3` instances, the number of containers we can fit on a machine is memory bound. The `c3.4xlarge` can fit **6 containers**, and the `c3.8xlarge` can fit **14 containers**.
* **R3 (recommended)**: The `r3` family is a great choice if you're using memory intensive builds. They are especially good if you plan to increase the default memory allocation for each container. Because of noisy neighbor problems and resource contention, the excess memory of the `r3` family can can also sometimes speed up your builds without changing the default container allocation. The number of containers we can fit on an `r3` is CPU bound. Thus, we will put **3 containers** on an `r3.2slarge`, **7 containers** on an `r3.4xlarge`, and **15 containers** on an `r3.8xlarge`.


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

_If you are interested, please reach out to <enterprise-support@circleci.com> as well.  We'd love to hear your feedback and give guidance on how best to configure your build environment_

### Running Upstream Docker

If you wish to use the upstream version of Docker rather than the patched version provided by CircleCI you will need to run an privileged LXC container. You can do this by editing the launch configuration in AWS and setting `CIRCLE_CONTAINER_TYPE=privileged-lxc`.

You can now either bake the version of Docker that you want into your custom image, or install it via `circle.yml` by adding the code below:


```
machine:
  post:
    - sudo curl -L -o /usr/bin/docker https://get.docker.com/builds/Linux/x86_64/docker-1.9.1
    - sudo container=yes docker daemon: { background: true }
```

### Adjusting Builder Networking

You can adjust which subnets containers use by setting the following enviroment variables:

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
