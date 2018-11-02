---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI orbs"
categories: [getting-started]
order: 1
---

CircleCI provides certified and tested orbs, along with 3rd-party orbs authored by CircleCI partners. It is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow. Refer to the [CircleCI Orbs Registry](https://circleci.com/) for the complete list of available Orbs. 

### Importing an Existing Orb

If you wish to import an existing orb, it would be similar to the example shown below.

```
orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@1.0.0
```

In the above example, two orbs would be made available to you (slack & heroku), one for each key in the map.

Because the values of the above keys under `orbs` are all scalar values they are assumed to be imports based on the orb ref format of `${NAMESPACE}/${ORB_NAME}@${VERSION}`. 

### Authoring Your Own Orb

If you find that there are no existing orbs that meet your needs, you may author your own orb to meet your specific environment or configuration requirements. Although this is more time-consuming than using the import feature, authoring your own orb enables you to create an orb that is specific to your organization.

## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to the [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
