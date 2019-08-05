---
layout: classic-docs
title: "Orb Publishing Process"
short-title: "Publishing Orbs"
description: "Starting point for publishing CircleCI Orbs"
categories: [getting-started]
order: 1
---

## High-Level Orb Publishing Process

Before working with orbs, you may find it helpful to gain a high-level understanding of the end-to-end orbs publishing process. The diagram shown below illustrates the orbs publishing process. ![Orbs Workflow Diagram image](  {{ site.baseurl }}/assets/img/docs/orbs_outline_v3.png)

### Step 1 - Set Up the CircleCI CLI

Although it is possible to CI/CD orb publishing using the [`orbs-tool`](https://circleci.com/docs/2.0/creating-orbs/#orb-toolspublish) orb, the most direct and iterable way to build, publish, and test orbs is by using our CLI. Detailed instructions can be found in the [Get the new CircleCI CLI](https://circleci.com/docs/2.0/creating-orbs/#get-the-new-circleci-cli) section on this page.

* [Download and Install the CircleCI CLI](https://circleci.com/docs/2.0/creating-orbs/#installing-the-cli-for-the-first-time).
* [Update the CLI](https://circleci.com/docs/2.0/creating-orbs/#updating-the-circleci-cli-after-installation).
* [Configure the CLI](https://circleci.com/docs/2.0/creating-orbs/#configuring-the-circleci-cli).

### Step 2 - Verify You Installed the CLI Correctly

Once you have configured the CircleCI CLI, verify you installed the CLI correctly and the CLI is updated and configured properly before beginning to work with orbs.

### Step 3 - Bump Version Property to Orbs-Compatible 2.1

After validating your build configuration, bump the version property to 2.1 so it is compatible for use with orbs.

### Step 4 - Create a New Orb Using Inline Template

Using inline orbs are the easiest way to get started with orbs because you can reference them from your existing configuration. Although not required for orb authoring, using inline orbs can simplify the process and is a reasonable approach to authoring orbs quickly and easily.

### Step 5 - Design Your Orb
Depending on whether you use an inline template or author your orb independent of this inline template, you will want to add elements (Jobs, Commands, and Executors) to your orb. For more information on these orb elements, refer to the [Commands](https://circleci.com/docs/2.0/using-orbs/#commands), [Jobs](https://circleci.com/docs/2.0/using-orbs/#jobs), and [Executors](https://circleci.com/docs/2.0/using-orbs/#executors) sections found in the [Using Orbs](https://circleci.com/docs/2.0/using-orbs/#section=configuration) page.

### Step 6 - Validate your Orb
When you have finished authoring your orb, simply run the `validate` command from your CLI. CircleCI provides several different tools to validate your orb, including the `circleci/orb-tools` orb. For more information on using the `circleci/orb-tools` orb, see the [Validate and Publish Your Orb](https://circleci.com/docs/2.0/creating-orbs/#validate-and-publish-your-orb) section on this page.

### Step 7 - Publish Your Orb
The final step in the orb publishing process is for you to simply publish your orb using the `orb-tools/publish` CLI command in the `circleci/orb-tools` orb. Note that `dev` orb versions make it possible to publish multiple versions of an orb name (`dev` orbs are mutable).

For detailed information about this command, refer to the [orb-tools/publish](https://circleci.com/docs/2.0/creating-orbs/#orb-toolspublish) section on this page.

## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
- Refer to [Testing Orbs]({{site.baseurl}}/2.0/testing-orbs/) for information about how to test the orbs you have created.
- Refer to [Orbs Registry](https://circleci.com/orbs/registry/licensing) for more detailed information about legal terms and conditions when using orbs.
- Refer to [Local CLI]({{site.baseurl}}/2.0/local-cli/#overview) for more information about how you can use the CircleCI CLI in your orbs deployments.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.
