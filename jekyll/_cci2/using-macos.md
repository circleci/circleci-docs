---
layout: classic-docs
title: "Using the macOS execution environment"
description: "Learn how to configure a your jobs to run in the macOS execution environment."
version:
- Cloud
- Server v3.x
- Server v2.x
---
[custom-images]: {{ site.baseurl }}/2.0/custom-images/
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/
[server-gpu]: {{ site.baseurl }}/2.0/gpu/

Using the `macos` executor allows you to run your job in a macOS environment on a VM. In macOS, the following resources classes are available:

Class                 | vCPUs | RAM
----------------------|-------|-----
medium                | 4 @ 2.7 GHz     | 8GB
macos.x86.medium.gen2 | 4 @ 3.2 GHz     | 8GB
large                 | 8 @ 2.7 GHz     | 16GB
macos.x86.metal.gen1<sup>(1)</sup>                 | 12 @ 3.2 GHz     | 32GB
{: class="table table-striped"}

You can also specify which version of Xcode should be used. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list of version numbers and information about technical specifications for the VMs running each particular version of Xcode.

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

### macOS VM Storage
{: #macos-vm-storage }

The amount of available storage on our macOS VMs depends on the resource class and Xcode image being used. The size of the Xcode images varies based on which tools are pre-installed.

Xcode Version | Class                 | Minimum Available Storage
--------------|-----------------------|--------------------------
10.3.0        | medium, large         | 36GB
10.3.0        | macos.x86.medium.gen2 | 36GB
11.*          | medium, large         | 23GB
11.*          | macos.x86.medium.gen2 | 23GB
12.*          | medium, large         | 30GB
12.*          | macos.x86.medium.gen2 | 30GB<sup>(2)</sup>
13.*          | medium, large         | 23GB
13.*          | macos.x86.medium.gen2 | 89GB
{: class="table table-striped"}

<sup>(1)</sup> _This resource requires a minimum 24-hour lease. See the [Dedicated Host for macOS]({{ site.baseurl }}/2.0/dedicated-hosts-macos) page to learn more about this resource class._

<sup>(2)</sup> _Exception: Xcode 12.0.1, 12.4.0 and 12.5.1 have a minimum 100GB of available storage._
