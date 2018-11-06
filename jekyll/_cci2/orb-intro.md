---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

CircleCI Orbs are shareable packages of configuration elements, including jobs, commands, and executors. CircleCI provides certified orbs, along with 3rd-party orbs authored by CircleCI partners. It is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of available orbs. 

### Importing an Existing Orb

To import an existing orb, add a single line to to your version 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file for each orb, for example:

```
version: 2.1

orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@0.0.1
```

In the above example, two orbs are imported into your config, the [Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) and the [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku). 

**Note:** If your project was added to CircleCI prior to 2.1, you must enable [Build Processing]({{ site.baseurl }}/2.0/build-processing/#section=projects/) to use the `orbs` key.

### Authoring Your Own Orb

If you find that there are no existing orbs that meet your needs, you may author your own orb to meet your specific environment or configuration requirements by using the [CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/#section=configuration) as shown in the `circleci orb help` output below. Although this is more time-consuming than using the import feature, authoring your own orb enables you to create a world-readable orb for sharing your configuration.

```
$ circleci orb help
Operate on orbs


Usage:
  circleci orb [command]

Available Commands:
  create      Create an orb in the specified namespace
  list        List orbs
  process     Validate an orb and print its form after all pre-registration processing
  publish     Publish an orb to the registry
  source      Show the source of an orb
  validate    Validate an orb.yml
```


## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to the [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
