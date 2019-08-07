---
layout: classic-docs
title: "Setting Your Platform Version to Work With Orbs"
short-title: "Setting Your Platform Version for Orbs"
description: "How to set your platform version so you can work with CircleCI and Partner orbs"
categories: [getting-started]
order: 1
---

## Introduction

Before you can work with CircleCI and Partner-certified orbs, you must first ensure that your platform version is set to `2.1` in your `config.yml`. Previous versions do not currently support working with orbs.

The section below describes how you can set your platform version to 2.1 so you can work with orbs.

## Setting Your Platform to Work With Orbs

Setting your platform version to work with orbs is a very simple process, requiring you to perform the following steps:

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**Note** If you do not already have Pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and turn it on.

2) Add the `orbs` stanza below your version, thereby invoking the orb. The example below shows how you can invoke the `aws-cli` orb.

```
orbs:
  aws-cli: circleci/aws-cli@0.1.13
```

3) Use the elements specific to your selected orb in your existing workflows and jobs.

### Hello World Example

The example below demonstrates how you can invoke the `hello-build` orb in the `circleci` namespace.

```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**Note:** If your project was added to CircleCI prior to 2.1, you must enable pipelines to use the `orbs` key.

## Next Steps
{:.no_toc}

- Refer to [Selecting and Using an Orb]({{site.baseurl}}/2.0/orbs-user-select-orb/) for next steps.
