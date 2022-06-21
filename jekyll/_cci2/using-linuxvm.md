---
layout: classic-docs
title: "Using the Linux VM execution environment"
description: "Learn how to configure a your jobs to run in the Linux VM execution environment."
version:
- Cloud
- Server v3.x
- Server v2.x
---

The `machine` option runs your jobs in a dedicated, ephemeral VM that has the following specifications:

{% include snippets/machine-resource-table.md %}

Using the `machine` executor gives your application full access to OS resources and provides you with full control over the job environment. This control can be useful in situations where you need full access to the network stack; for example, to listen on a network interface, or to modify the system with `sysctl` commands. To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/2.0/docker-to-machine) document.

Using the `machine` executor also means that you get full access to the Docker process. This allows you to run privileged Docker containers and build new Docker images.

To use the machine executor,
set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) in `.circleci/config.yml`:

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine: true
```

You can view the list of available images [here]({{ site.baseurl }}/2.0/configuration-reference/#available-linux-machine-images).

The following example uses an image and enables [Docker layer caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or workflow.

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

The IP range `192.168.53.0/24` is reserved by CircleCI for internal use on the machine executor. This range should not be used in your jobs.
