---
layout: classic-docs
title: "Orbs FAQ"
short-title: "Orbs FAQ"
description: "FAQs for Orbs"
order: 20
version:
- Cloud
- Server v3.x
---

This document describes various questions and technical issues that you may find helpful when working with orbs.

## Private orbs
{: #private-orbs }

* **Question:** Can orbs be made private?

* **Answer:** [Private orbs]({{site.baseurl}}/2.0/orb-intro/#private-orbs) are available on any of our [current plans](https://circleci.com/pricing).

## Difference between commands and jobs
{: #difference-between-commands-and-jobs }

* **Question:** What is the difference between commands and jobs?

* **Answer:** Both [commands]({{site.baseurl}}/2.0/reusing-config/#the-commands-key) and [jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) are elements that can be used within orbs. _Commands_ contain one or many [steps]({{site.baseurl}}/2.0/configuration-reference/#steps), which contain the logic of the orb. Commands generally execute some shell code (bash). _Jobs_ are a definition of what steps/commands to run _and_ the [executor]({{site.baseurl}}/2.0/reusing-config/#the-executors-key) to run them in. _Commands_ are invoked within jobs. _Jobs_ are orchestrated using _[Workflows]({{site.baseurl}}/2.0/workflows/#workflows-configuration-examples)_.

## Using orbs on CircleCI server
{: #using-orbs-on-circleci-server }

* **Question:** Can orbs be used on a private installation of CircleCI server?

* **Answer:** Orbs can be used with installations of CircleCI server v3. For information on importing and using orbs for server, see the [CircleCI Server v3.x Orbs guide]({{site.baseurl}}/2.0/server-3-operator-orbs/).
 
  Orbs are not available on installations of server v2.19.x, however, if you process your config prior to committing, orbs can be translated and used. Follow this guide on using git pre-commit hooks to [use orbs on server](https://discuss.circleci.com/t/orbs-on-server-solution/36264).

## Report an issue with an orb
{: #report-an-issue-with-an-orb }

* **Question:** How can I report a bug or issue with an orb?

* **Answer:** All orbs are open source projects. Issues, bug reports, or even pull requests can be made against the orb's git repository. Orb authors may opt to include a link to the git repo on the Orb Registry.

  If the git repo link is unavailable, contact support and we will attempt to contact the author. Alternatively, consider forking the orb and publishing your own version.

## Using uncertified orbs
{: #using-uncertified-orbs }

* **Question:** Why do I receive an error message when trying to use an uncertified orb?

* **Answer:** To enable usage of _uncertified_ orbs, go to your organization's settings page, and click the _Security_ tab. Then, click yes to enable _Allow Uncertified Orbs_.

**Note:** _Uncertified orbs are not tested or verified by CircleCI. Currently, only orbs created by CircleCI are considered certified. Any other orbs, including partner orbs, and not certified._

## How to use the latest version of an orb
{: #how-to-use-the-latest-version-of-an-orb }

* **Question:** How do import an orb always at the latest version?

* **Answer:** Orbs utilize [semantic versioning](), meaning if you set the _major_ version (example: `3`), you will receive all _minor_ and _patch_ updates, where if you statically set the version (example: `3.0.0`), no updates will apply, this is the most deterministic and recommended method.

_**Note:** NOT RECOMMENDED - It is possible to use `@volatile` to receive the last published version of an orb. This is not recommended as breaking changes are expected._
{: class="alert alert-danger"}

## Build error when testing locally
{: #build-error-when-testing-locally }

* **Question:** Why do I get the following error when testing locally:

```bash
circleci build -c .circleci/jobs.yml --job test
```

```bash
Error:
You attempted to run a local build with version 2.1 of configuration.
```

* **Answer:** To resolve this error, run `circleci config process` on your configuration and then save that configuration to disk. You then should run `circleci local execute` against the processed configuration.

## See also
{: #see-also }
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
