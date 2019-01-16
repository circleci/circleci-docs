---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

CircleCI Orbs are shareable packages of configuration elements, including jobs, commands, and executors. CircleCI provides certified orbs, along with 3rd-party orbs authored by CircleCI partners. It is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of certified orbs. 

## Importing an Existing Orb

To import an existing orb, add a single line to to your version 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file for each orb, for example:

```
version: 2.1

orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@0.0.1
```

In the above example, two orbs are imported into your config, the [Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) and the [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku). 

**Note:** If your project was added to CircleCI prior to 2.1, you must enable [Build Processing]({{ site.baseurl }}/2.0/build-processing/) to use the `orbs` key.

## Authoring Your Own Orb

If you find that there are no existing orbs that meet your needs, you may author your own orb to meet your specific environment or configuration requirements by using the [CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) as shown in the `circleci orb help` output below. Although this is more time-consuming than using the import feature, authoring your own orb enables you to create a world-readable orb for sharing your configuration.

```nohighlight
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

## Importing Partner Orbs

Import the following Partner Orbs by using the `orbs` key in your `.circleci.yml/config.yml` file and replacing `<orb reference string>` with one from the table.

```
version: 2.1

orbs:
  <orb reference string>
```

Partner Orb Registry Link | Orb Reference String 
------------|-----------
[Anchore](https://circleci.com/orbs/registry/orb/anchore/anchore-engine) | `anchore: anchore/anchore-engine@1.0.0`
[Aqua Security](https://circleci.com/orbs/registry/orb/aquasecurity/microscanner) | `aqua: aquasecurity/microscanner@0.0.1`
[Codecov](https://circleci.com/orbs/registry/orb/codecov/codecov) | `codecov: codecov/codecov@1.0.1`
[Cypress-io](https://circleci.com/orbs/registry/orb/cypress-io/cypress) | `cypress-io: cypress-io/cypress@1.0.0`
[Datree](https://circleci.com/orbs/registry/orb/datree/version-alignment-rule) | `datree: datree/version-alignment-rule@1.0.0`
[Ghost Inspector](https://circleci.com/orbs/registry/orb/ghostinspector/test-runner) | `ghostinspector: ghostinspector/test-runner@1.0.0`
[Honeybadger-io](https://circleci.com/orbs/registry/orb/honeybadger-io/deploy) | `honeybadger-io: honeybadger-io/deploy@1.1.1`
[Nowsecure](https://circleci.com/orbs/registry/orb/nowsecure/ci-auto-orb) | `nowsecure: nowsecure/ci-auto-orb@1.0.5`
[Packagecloud](https://circleci.com/orbs/registry/orb/packagecloud/packagecloud) | `packagecloud: packagecloud/packagecloud@0.1.0`
[Percy](https://circleci.com/orbs/registry/orb/percy/agent) | `percy: percy/agent@0.1.2`
[Postman](https://circleci.com/orbs/registry/orb/postman/newman) | `postman: postman/newman@0.0.1`
[Pulumi](https://circleci.com/orbs/registry/orb/pulumi/pulumi) | `pulumi: pulumi/pulumi@1.0.0`
[Rocro](https://circleci.com/orbs/registry/orb/rocro/inspecode) | `rocro: rocro/inspecode@1.0.0`
[Rollbar](https://circleci.com/orbs/registry/orb/rollbar/deploy) | `rollbar: rollbar/deploy@1.0.0`
[Rookout](https://circleci.com/orbs/registry/orb/rookout/rookout-node) | `rookout: rookout/rookout-node@0.0.2`
[Sauce Labs](https://circleci.com/orbs/registry/orb/saucelabs/sauce-connect) | `saucelabs: saucelabs/sauce-connect@1.0.1`
[Sonatype](https://circleci.com/orbs/registry/orb/sonatype/nexus-platform-orb) | `sonatype: sonatype/nexus-platform-orb@1.0.2`
[Twistlock](https://circleci.com/orbs/registry/orb/twistlock/twistcli-scan) | `twistlock: twistlock/twistcli-scan@1.0.4`
[WhiteSource](https://circleci.com/orbs/registry/orb/whitesource/whitesource-scan) | `whitesource: whitesource/whitesource-scan@18.10.2`
{: class="table table-striped"}

**Note:**  As a prerequisite, you must enable use of 3rd-party orbs on the Settings > Security page for your org.

## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to the [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
