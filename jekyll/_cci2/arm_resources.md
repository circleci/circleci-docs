---
layout: classic-docs
title: "ARM resources"
short-title: "Using ARM resources on CircleCI"
description: "Using ARM resources on CircleCI"
version:
- Cloud
---

# Overview

This document will walk you through the setup steps required to use an ARM
resource on CircleCI. Current, ARM resources are not available on CircleCI
Server.

CircleCI offers multiple kinds of environments for you to run jobs in. In your
CircleCI `config.yml` file you can choose the right environment for your job using the
[`resource_class`]({{site.baseurl}}/2.0/configuration-reference/#resource_class)
key. CircleCI offers two ARM resources as part of the [`machine` executor]({{site.baseurl}}/2.0/configuration-reference/#machine-executor-linux):

* `arm.medium` - `arm64` architecture, 2 vCPU, 8GB RAM
* `arm.large` - `arm64` architecture, 4 vCPU, 16GB RAM

Which are available under these images:

* `ubuntu-2004:202101-01` - most recent, recommended for all users
* `ubuntu-2004:202011-01` - deprecated as of Feb 3, 2021

As these are `machine` executor resources, each class is a dedicated VM that is created specifically for your job and subsequently taken down after the job has finished running.

## Pricing and availability

The following ARM resource class is available to all CircleCI customers:

| Resource class name | Specs             | Pricing        | Requisite Plan                   |
|---------------------|-------------------|----------------|----------------------------------|
| `arm.medium`        | 2 vCPUs, 8GB RAM  | 10 credits/min | Free, Performance, Scale, Custom |
| `arm.large`         | 4 vCPUs, 16GB RAM | 20 credits/min | Performance, Scale               |
{: class="table table-striped"}

At this moment, ARM resources are only available on our cloud offering. If you
are a CircleCI Server customer, you can try out ARM resources by signing up for
a free CircleCI cloud account.

## Using ARM resources

Update your `.circleci/config.yml` file to use ARM resources. Consider the example config:

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
      - run: echo "Hello, ARM!"

  build-large:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, ARM!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

## Limitations

* Some orbs that include an executable may **not** be compatible with ARM at
  this moment. If you run into issues with orbs on ARM, please [open an
  issue](https://github.com/CircleCI-Public/arm-preview-docs/issues).
* We currently don’t provide support for 32-bit ARM architectures. Only 64-bit
  `arm64` architecture is supported.
* There may be up to 2 minutes of spin-up time before your job actually starts
  running. This time will decrease as more customers start using ARM resources.
* If there is software you require that’s not available in the image, please
  [open an issue](https://github.com/CircleCI-Public/arm-preview-docs/issues) to
  let us know.


