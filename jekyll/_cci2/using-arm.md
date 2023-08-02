---
layout: classic-docs
title: "Using the Arm VM execution environment"
description: "Learn how to configure a your jobs to run in the Arm execution environment."
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

You can access the Arm VM (virtual machine) execution environment for a job by using the machine executor, specifying a Linux virtual machine image that includes arm resources, and then specifying an Arm resource class.

{:.tab.armblock.Cloud}
```yaml
# .circleci/config.yml
jobs:
  my-job:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

{:.tab.armblock.Server_v3_and_v4}
```yaml
# .circleci/config.yml
jobs:
  my-job:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

## Available resource classes
{: #available-resource-classes }

The following Arm resources are available part of the [`machine` executor]({{site.baseurl}}/configuration-reference/#machine-executor-linux):

{% include snippets/arm-resource-table.md %}

For pricing and plans information, see the [resource class pricing overview](https://circleci.com/product/features/resource-classes/).

### View resource usage
{: #view-resource-usage }

{% include snippets/resource-class-view.md %}

## Images with Arm support

Arm resources are accessible by using the machine executor when using one of the following images:

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

For a full list of machine executor images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine). And for announcements about image updates, see [CircleCI Discuss](https://discuss.circleci.com/c/ecosystem/circleci-images/64).

## Limitations
{: #limitations }

* Some orbs that include an executable may **not** be compatible with Arm at
  this time. If you run into issues with orbs on Arm, please [open an
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
* CircleCI does not currently support ARM with our Docker executor. If you would like to follow updates on this functionality, please refer to the following Canny post: [Support ARM resource class on Docker executor](https://circleci.canny.io/cloud-feature-requests/p/support-arm-resource-class-on-docker-executor).

### M1 Mac Support
{: #m1-mac-support }

Docker images built on M1 Macs, are by default, not compatible with the CircleCI standard platform. The `spin up environment` job in your pipelines will give you a green tic, but you will see the following message in the response:

```shell
WARNING: docker image ghcr.io/{your_username}/runner-test:latest targets wrong architecture (found arm64 but need [amd64 i386 386])
```

If you build an image on an M1 you need to specify `docker build --platform linux/amd64` as the default builds `arm64`.

## Arm on Docker
{: #arm-on-docker }

**Arm on Docker** Support for Arm architecture in the Docker execution environment is in **Preview**.
{: class="alert alert-caution"}

For further information on using Arm with the Docker execution environment, see the [Using the Docker execution enviornment](/docs/using-docker/#arm) page.


## Learn More
{: #learn-more }
Take the [Arm course](https://academy.circleci.com/arm-course?access_code=public-2021) with CircleCI Academy to learn more about using Arm resources and associated use cases.
