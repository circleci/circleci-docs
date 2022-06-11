---
layout: classic-docs
title: "Using the macOS execution environment"
description: "Learn how to configure a your jobs to run in the macOS execution environment."
version:
- Cloud
---

The macOS execution environment is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

You can use the macOS execution environment to run your [jobs]({{site.baseurl}}/2.0/jobs-steps/) in a macOS environment on a virtual machine (VM). You can access the macOS execution environment by using the `macos` executor and specifying an Xcode version:

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

## Supported Xcode versions
{: #supported-xcode-versions }

{% include snippets/xcode-versions.md %}

## Available resource classes
{: available-resource-classes }

Class                 | vCPUs | RAM
----------------------|-------|-----
medium                | 4 @ 2.7 GHz     | 8GB
macos.x86.medium.gen2 | 4 @ 3.2 GHz     | 8GB
large                 | 8 @ 2.7 GHz     | 16GB
macos.x86.metal.gen1                 | 12 @ 3.2 GHz     | 32GB
{: class="table table-striped"}

**Note:** The `macos.x86.metal.gen1` resource requires a minimum 24-hour lease. See the [Dedicated Host for macOS]({{ site.baseurl }}/2.0/dedicated-hosts-macos) page to learn more about this resource class.

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1
    resource_class: large
```

## macOS VM Storage
{: #macos-vm-storage }

The amount of available storage on our macOS VMs depends on the resource class and Xcode image being used. The size of the Xcode images varies based on which tools are pre-installed.

Xcode Version | Class                 | Minimum Available Storage
--------------|-----------------------|--------------------------
10.3.0        | medium, large         | 36GB
10.3.0        | macos.x86.medium.gen2 | 36GB
11.*          | medium, large         | 23GB
11.*          | macos.x86.medium.gen2 | 23GB
12.*          | medium, large         | 30GB
12.*          | macos.x86.medium.gen2 | 30GB
13.*          | medium, large         | 23GB
13.*          | macos.x86.medium.gen2 | 89GB
{: class="table table-striped"}

**Note:** Xcode 12.0.1, 12.4.0 and 12.5.1 have a minimum 100GB of available storage.

## Xcode Cross Compilation
{: #xcode-cross-compilation }

### Universal Binaries
{: #universal-binaries }

Xcode currently supports the creation of universal
binaries which can be run on both `x86_64` and `ARM64` CPU architectures without
needing to ship separate executables. This is supported only under Xcode 12.2+
although older Xcode versions can still be used to compile separate `x86_64` and
`ARM64` executables.

### Extracting Unwanted Architectures
{: #extracting-unwanted-architectures }

Xcode 12.2+ will by default create universal binaries, compiling to a single
executable that supports both `x86_64` and `ARM64` based CPUs. If you need to remove
an instruction set, you can do so by using the `lipo` utility.

Assuming that we are interested in creating a standalone x86_64 binary from a
universal binary called `circleci-demo-macos`, we can do so by running the
command:

```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

We can then confirm the supported architecture of the extracted binary with
`lipo -info circleci-demo-macos-x86_64` which will output the following

```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```

### Cross Compiled Binaries
{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still
cross compile binaries for architectures other than the architecture of the
machine being used to build the binary. For xcodebuild the process is relatively
straightforward. To build ARM64 binaries, prepend the `xcodebuild` command with
`ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...`. For the `x86_64` architecture simply change `ARCHS` to
`x86_64`.

## Next steps
{: #next-steps }

Get started with [Configuring a Simple macOS Application on CircleCI]({{ site.baseurl }}/2.0/hello-world-macos).