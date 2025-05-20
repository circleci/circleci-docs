---
layout: classic-docs
title: "Arm resources"
short-title: "Using Arm resources on CircleCI"
description: "Using Arm resources on CircleCI"
version:
- Cloud
- Server v3.x
---

This document will walk you through the setup steps required to use an Arm
resource on CircleCI. Arm resources are available on cloud and server 3.x.

<div class="alert alert-warning" role="alert">
  <strong>CircleCI does not currently support ARM with our Docker executor.</strong> If you would like to follow updates on this functionality, please refer to the following Canny post: <a href="https://circleci.canny.io/cloud-feature-requests/p/support-arm-resource-class-on-docker-executor">Support ARM resource class on Docker executor</a>.
</div>

## Overview
{: #overview }
CircleCI offers multiple kinds of environments for you to run jobs in. In your
CircleCI `config.yml` file you can choose the right environment for your job using the
[`resource_class`]({{site.baseurl}}/2.0/configuration-reference/#resource_class)
key. CircleCI offers two Arm resources as part of the [`machine` executor]({{site.baseurl}}/2.0/configuration-reference/#machine-executor-linux):

* `arm.medium` - `arm64` architecture, 2 vCPU, 8GB RAM
* `arm.large` - `arm64` architecture, 4 vCPU, 16GB RAM

Which are available under these images:

* `ubuntu-2004:current` - most recent, recommended for all users
* `ubuntu-2004:2022.04.1`
* `ubuntu-2004:202201-02`
* `ubuntu-2004:202201-01`
* `ubuntu-2004:202111-02`
* `ubuntu-2004:202111-01`
* `ubuntu-2004:202107-01`
* `ubuntu-2004:202104-01`
* `ubuntu-2004:202101-01`
* `ubuntu-2004:202011-01` - deprecated as of Feb 3, 2021

These are `machine` executor resources, therefore each class is a dedicated virtual machine that is created specifically for your job and subsequently taken down after the job has finished running.

## Pricing and availability
{: #pricing-and-availability }

The following Arm resource class is available to all CircleCI customers:

| Resource class name | Specs                           | Requisite Plan                   |
|---------------------|---------------------------------|----------------------------------|
| `arm.medium`        | 2 vCPUs, 8GB RAM, 100 GB Disk   | Free, Performance, Scale, Custom |
| `arm.large`         | 4 vCPUs, 16GB RAM, 100 GB Disk  | Performance, Scale, Custom       |
{: class="table table-striped"}

For pricing and availability check out our [Pricing](https://circleci.com/pricing/) page.

## Using Arm resources
{: #using-arm-resources }

Update your `.circleci/config.yml` file to use Arm resources. Consider the example config:

{:.tab.armblock.Cloud}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

{:.tab.armblock.Server_3}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: arm-default
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

Please note that it is indeed possible to mix various resources in the same
configuration (and even the same workflow).

## Limitations
{: #limitations }

* Some orbs that include an executable may **not** be compatible with Arm at
  this moment. If you run into issues with orbs on Arm, please [open an
  issue](https://github.com/CircleCI-Public/arm-preview-docs/issues).
* We currently do not provide support for 32-bit Arm architectures. Only 64-bit
  `arm64` architectures are supported at this time.
* There may be up to 2 minutes of spin-up time before your job actually starts
  running. This time will decrease as more customers start using Arm resources.
* If there is software you require that is not available in the image, please
  [open an issue](https://github.com/CircleCI-Public/arm-preview-docs/issues) to
  let us know.
* In server 3.x, Arm resources are only available when using the EC2 provider
  for VM service. This is because there are no Arm instances available in GCP.

### M1 Mac Support
{: #m1-mac-support }

Docker images built on M1 Macs, are by default, not compatible with the CircleCI standard platform. The Spin Up Environment job will give you a green tic, but you will see the following message in the response:

```shell
WARNING: docker image ghcr.io/{your_username}/runner-test:latest targets wrong architecture (found arm64 but need [amd64 i386 386])
```

If you build an image on an M1 you need to specify `docker build --platform linux/amd64` as the default builds `arm64`.


## Learn More
{: #learn-more }
Take the [Arm course](https://academy.circleci.com/arm-course?access_code=public-2021) with CircleCI Academy to learn more about using Arm resources and associated use cases.
