---
layout: classic-docs
title: "Manual Orb Authoring Process"
description: "Authoring simple orbs manually without the orb development kit."
version:
- Cloud
---

This guide covers the steps required to create a simple orb, manually, without using the orb development kit. We recommend the orb development kit for most orb projects, to find out more, see the [Orb Authoring Guide]({{site.baseurl}}/2.0/orb-author).

## Create a namespace
{: #create-a-namespace }

1. If you have not already done so, claim a namespace for your user/organization using the following command, substituting your namespace choice and GitHub organization name:
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

## Create your orb
{: #create-your-orb }

1. Create your orb inside your namespace. At this stage no orb content is being generated, but the naming is reserved for when the orb is published. **If you are using CircleCI server, you should ensure the `--private` flag is used here to keep your orbs private within your installation**.
To create a **[public]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** orb:
```shell
circleci orb create <my-namespace>/<my-orb-name>
```
To create a **[private]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** orb:
```shell
circleci orb create <my-namespace>/<my-orb-name> --private
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

## Validate your orb
{: #validate-your-orb }

1. Validate your orb code using the CLI:
```
circleci orb validate /tmp/orb.yml
```

## Publish your orb
{: #publish-your-orb }

1. Publish a dev version of your orb:
```shell
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

1. Once you are ready to push your orb to production, you can publish it manually using `circleci orb publish` or promote it directly from the dev version. Using the following command will increment the dev version to become `0.0.1`:
```shell
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch
```

1. Your orb is now published, in an immutable form, as a production version and can be used safely in CircleCI projects. You can pull the source of your orb using:
```shell
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```

## List available orbs
{: #list-available-orbs }

1. List your available orbs using the CLI:

To list **[public]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** orbs:
```shell
circleci orb list <my-namespace>
```

To list **[private]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** orbs:
```shell
circleci orb list <my-namespace> --private
```

## Next Steps
{: #next-steps }

For more information on how to use the `circleci orb` command, see the CLI [documentation](https://circleci-public.github.io/circleci-cli/circleci_orb.html).
