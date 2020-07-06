---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

_Available on CircleCI with `version 2.1` config. Not currently available on self-hosted installations of CircleCI Server_

CircleCI orbs are open-source, shareable packages of parameterizable _[reusable configuration]({{site.baseurl}}/2.0/reusing-config/)_ elements, including [jobs](https://circleci.com/docs/2.0/reusing-config/#authoring-parameterized-jobs), [commands](https://circleci.com/docs/2.0/reusing-config/#authoring-reusable-commands), and [executors](https://circleci.com/docs/2.0/reusing-config/#executor).

Orbs can drastically reduce configuration complexity and help developers integrate with their software and services stack quickly and easily across many projects.

Published orbs can be found on our [Orb Registry]({{site.baseurl}}/orbs/registry/), or you can [author your own]()!

An orb is identified by its _slug_ which contains the _namespace_ and _orb name_. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed be an `@` symbol and a [semantic version](https://semver.org/) string, identifying which version of the orb is being used.

Example orb slug: `<namespace>/<orb-name>@1.2.3`

## Why use Orbs?

Orbs provide parameterizable configuration elements that can greatly simplify your configuration. To illustrate this, the following example shows how we may typically test a Node.js application by defining a job ourselves with the required steps for testing our application, versus using the "test" job provided by the [`circleci/node`](https://circleci.com/orbs/registry/orb/circleci/node) orb.

{:.tab.nodeTest.Orbs}
```yaml
version: 2.1
orbs:
  node: circleci/node@x.y #orb version
workflows:
  test_my_app:
    jobs:
      - node/test:
          version: <node-version>
```

{:.tab.nodeTest.Without-Orbs}
```yaml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
    steps:
      - checkout
      - restore_cache:
          keys:
            - node-deps-v1-{{.Branch }}-{{checksum "package-lock.json"}}
      - run:
          name: install packages
          command: npm ci
      - save_cache:
          key: node-deps-v1-{{.Branch }}-{{checksum "package-lock.json"}}
          paths:
            - ~/.npm
      - run:
          name: Run Tests
          command: npm run test
workflows:
  test_my_app:
    jobs:
      - test

```

## Orb Registry

The [Orb Registry]({{site.baseurl}}/orbs/registry/) is an open repository of all published orbs. Find the orb for your stack or consider developing and publishing your own.

[picture]

Orbs on the registry will appear with one of three different namespace designations:
|   |   |
|---|---|
| Certified   | Written and tested by the CircleCI team  |
| Partner  | Written by our technology partners  |
| Community | Written by the community  |

**Note:** _In order to use non-certified orbs, your organization’s administrator must opt-in to 3rd-party uncertified orb usage on the *Settings > Security* page for your org._

Each orb will contain its own description and documentation listed on the orb registry. Orbs may also have a set of usage examples to get you started.

If you would like to contribute to an existing orb or file an issue on the orb's repository, many orb authors will include the git repository link

## How to use orbs

Each orb within the orb registry will provide a sample code snippet for importing that specific orb, with its most recent version.

To import an orb, within your version`2.1` config file, create an `orbs` key. Within the newly created `orbs` we will create a key to reference the orb we wish to import, this will be the name we will later reference in the config. Enter the orb slug containing the version string for the value of the orb name.

```yaml
version: 2.1
orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```
Once imported, the config elements provided by the orb will be available as `<orb-name>/<element>`. Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/2.0/reusing-config/).

**Example:**
The Node orb provides a command "[install-packages](https://circleci.com/orbs/registry/orb/circleci/node#commands-install-packages)", which will install the user's node packages with caching automatically enabled and additional options provided via parameters. To use this command, we will reference it from our list of [steps](https://circleci.com/docs/2.0/configuration-reference/#steps).

```yaml
version: 2.1
orbs:
  node: circleci/node@x.y #orb version
jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
    steps:
      - checkout
      - node/install-packages # Utilize commands in steps
```


## See Also
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/) for information on known issues and questions that have been addressed when using CircleCI orbs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Orbs Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for information about how you can use CircleCI orb recipes in your configurations.