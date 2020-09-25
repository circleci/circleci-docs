---
layout: classic-docs
title: "Manual Orb Authoring Process"
description: "Authoring simple orbs manually without the orb development kit."
version:
- Cloud
---

This guide covers the steps required to create a simple orb manually, without using the orb development kit.

1. If you have not already done so, claim a namespace for your user/organization using the following command, substituting your namespace choice and GitHub org name:
```sh
circleci namespace create <my-namespace> github <my-GH-Org>
```
**Note:** When creating a namespace via the CircleCI CLI, be sure to specify the VCS provider.

1. Create your orb inside your namespace. At this stage no orb content is being generated, but the naming is reserved for when the orb is published:
```sh
circleci orb create <my-namespace>/<my-orb-name>
```

1. Create the content of your orb in a YAML file. Generally, you would do this in your code editor, in a git repo made for your orb, but, For this simple example, let's assume a file in `/tmp/orb.yml` could be made with a bare-bones orb like:
```sh
echo 'version: "2.1"\ndescription: "a sample orb"' > /tmp/orb.yml
```

1. Validate that your code is a valid orb using the CLI. For example, using the path above you could use:
```
circleci orb validate /tmp/orb.yml
```

1. Publish a dev version of your orb:
```sh
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

1. Once you are ready to push your orb to production, you can publish it manually using `circleci orb publish` or promote it directly from the dev version. In the case where you want to publish the orb, assuming you wanted to increment the new dev version to become 0.0.1, you can use:
```sh
circleci orb publish promote sandbox/hello-world@dev:first patch
```

1. Your orb is now published in an immutable form as a production version and can be used safely in builds. You can then pull the source of your orb using:
```sh
circleci orb source sandbox/hello-world@0.0.1
```
