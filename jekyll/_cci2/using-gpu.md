---
layout: classic-docs
title: "Using the GPU execution environment"
description: "Learn how to configure a your jobs to run in the GPU execution environment."
version:
- Cloud
plan:
- Scale
---

You can run your jobs in the GPU execution environment, using either Windows or Linux virtual machines, for access to Nvidia GPUs for specialized workloads. 

To use the Linux GPU execution environment, use the machine executor and specify a GPU-enabled image. For a full list of machine executor images see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine) or the [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference#available-linux-gpu-images).

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    steps:
      - run: nvidia-smi
```

To use the Windows GPU execution environment, you can either choose to use the windows orb and specify the built-in GPU executor, or use the machine executor and specify a Windows GPU-enabled image. Refer to the [Orb Registry page](https://circleci.com/developer/orbs/orb/circleci/windows) for full details, and the [Developer Hub](https://circleci.com/developer/images?imageType=machine) for full details of available machine executor images.

{:.tab.gpublock.Windows_GPU_with_orb}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.0

jobs:
  build:
    executor: win/server-2019-cuda
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

{:.tab.gpublock.Windows_GPU_with_machine}
```yaml
version: 2.1

jobs:
  build:
    machine: 
      image: windows-server-2019-nvidia:stable
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

## Available resource classes
{: #available-resource-classes }

Specify a resource class to fit your project and requirements. For further details on credit usage for these options, see the [Resource Class pricing and plans page](https://circleci.com/product/features/resource-classes/).

### Linux GPU
{: linux-gpu}

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{% include snippets/gpu-linux-resource-table.md %}

### Windows GPU
{: windows-gpu}

For Windows there is currently one resource class option. This will be used by default so you are not required to specify it in your configuration.

{% include snippets/gpu-windows-resource-table.md %}

## GPUs on server v2.x
If you are using CircleCI server v2.x, you can configure your VM service to use GPU-enabled machine executors. See [Running GPU Executors in Server]({{ site.baseurl }}/2.0/gpu/).
