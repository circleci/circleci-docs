---
layout: classic-docs
title: "Using the Linux VM execution environment"
description: "Learn how to configure a your jobs to run in the Linux VM execution environment using the machine executor."
version:
- Cloud
- Server v3.x
- Server v2.x
---

You can run your jobs in the linux VM (virtual machine) execution environment by using the machine executor and specifying a Linux image. Using the machine executor runs your jobs in a dedicated, ephemeral VM.

Using the machine executor gives your application full access to OS resources and provides you with full control over the job environment. This control can be useful in situations where you need full access to the network stack; for example, to listen on a network interface, or to modify the system with `sysctl` commands.

To use the machine executor, use the [`machine` key]({{ site.baseurl }}/configuration-reference/#machine) in your job configuration and specify an image:

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  my-job:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  my-job:
    machine: true
    resource_class: large
```

You can view the list of available images [in the docs Configuration Reference]({{ site.baseurl }}/configuration-reference/#available-linux-machine-images), or on the [Developer Hub](https://circleci.com/developer/images?imageType=machine). If you are working on an installation of CircleCI server, you will notice in the example above the syntax is slightly different, and the available Linux images are managed by your system administrator.

## Available LinuxVM resource classes
{: #available-linuxvm-resource-classes } 

{% include snippets/machine-resource-table.md %}

## Pre-installed software
{: #pre-installed-software }

The most up to date list of pre-installed software can be found on the [image builder](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) page. You can also visit the [Discuss](https://discuss.circleci.com/tag/machine-images) page for more information.

Additional packages can be installed with `sudo apt-get install <package>`. If the package in question is not found, `sudo apt-get update` may be required before installing it.

## Use machine with Docker
{:  #use-machine-with-docker }

Using the machine executor also means that you get full access to the Docker process. This allows you to run privileged Docker containers and build new Docker images.

The following example uses an image and enables [Docker layer caching]({{ site.baseurl }}/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or workflow.

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

## Using machine and IP ranges
{: #using-machine-and-ip-ranges }

The IP range `192.168.53.0/24` is reserved by CircleCI for internal use on the machine executor. This range should not be used in your jobs.

## Next steps
{: #next-steps }

To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/docker-to-machine) document.
