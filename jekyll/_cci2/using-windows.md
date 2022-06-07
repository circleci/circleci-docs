---
layout: classic-docs
title: "Using the Windows execution environment"
description: "Learn how to configure a your jobs to run in the Windows execution environment."
version:
- Cloud
- Server v3.x
- Server v2.x
---
[custom-images]: {{ site.baseurl }}/2.0/custom-images/
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/
[server-gpu]: {{ site.baseurl }}/2.0/gpu/

Using the `windows` executor allows you to run your job in a Windows environment. The following is an example configuration that will run a simple Windows job. The syntax for using the Windows executor in your config differs depending on whether you are using:
* CircleCI Cloud – config version 2.1.
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable Orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor: win/default # executor type

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Cloud users will notice the Windows orb is used to set up the Windows executor to simplify the configuration. See [the Windows orb details page](https://circleci.com/developer/orbs/orb/circleci/windows) for more details.

CircleCI server users should contact their system administrator for specific information about the image used for Windows jobs. The Windows image is configured by the system administrator, and in the CircleCI config is always available as the `windows-default` image name.
