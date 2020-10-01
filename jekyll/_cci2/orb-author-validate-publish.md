---
layout: classic-docs
title: "Manual Orb Authoring Process"
description: "Authoring simple orbs manually without the orb development kit."
version:
- Cloud
---

This guide covers the steps required to create a simple orb, manually, without using the orb development kit. We recommend the orb development kit for most orb projects, to find out more, see the [Orb Authoring Guide]({{site.baseurl}}/2.0/orb-author).

1. If you have not already done so, claim a namespace for your user/organization using the following command, substituting your namespace choice and GitHub org name:
```sh
circleci namespace create <my-namespace> github <my-gh-org>
```
**Note:** When creating a namespace via the CircleCI CLI, be sure to specify the VCS provider.

1. Create your orb inside your namespace. At this stage no orb content is being generated, but the naming is reserved for when the orb is published:
```sh
circleci orb create <my-namespace>/<my-orb-name>
```

1. Create the content of your orb in a YAML file. Here is a simple example to get you started:
```yaml
version: 2.1
description: A greeting command orb
commands:
    greet:
        description: Greet someone with a "hello".
        parameters:
            to:
                type: string
                default: World
        steps:
            - run: echo "Hello, << parameters.to >>"
```

1. Validate your orb code using the CLI:
```
circleci orb validate /tmp/orb.yml
```

1. Publish a dev version of your orb:
```sh
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

1. Once you are ready to push your orb to production, you can publish it manually using `circleci orb publish` or promote it directly from the dev version. Using the following command will increment the dev version to become `0.0.1`:
```sh
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch
```

1. Your orb is now published, in an immutable form, as a production version and can be used safely in CircleCI projects. You can pull the source of your orb using:
```sh
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```
