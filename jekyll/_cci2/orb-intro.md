---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

_Available on CircleCI with `version 2.1` config. Not currently available on self-hosted installations of CircleCI Server_

* TOC
{:toc}

## Quick Start

CircleCI orbs are open-source, shareable packages of parameterizable _[reusable configuration]({{site.baseurl}}/2.0/reusing-config/)_ elements, including [jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/2.0/reusing-config/#executor). Use orbs to reduce configuration complexity and help you integrate with your software and services stack quickly and easily across many projects.

Published orbs can be found on our [Orb Registry](https://circleci.com/orbs/registry/), or you can [author your own orb]({{site.baseurl}}/2.0/orb-author-intro/#section=configuration).

## Benefits of Using Orbs

Orbs provide parameterizable configuration elements that can greatly simplify your configuration. To illustrate this, the following example shows how we may typically test a Node.js application by defining a job ourselves with the required steps for testing our application, versus using the `test` job provided by the [`circleci/node`](https://circleci.com/orbs/registry/orb/circleci/node) orb.

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
{% raw %}
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
            - node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
      - run:
          name: install packages
          command: npm ci
      - save_cache:
          key: node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
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
{% endraw %}

With orbs, it is possible to write a parameterized configuration once and utilize it across multiple similar projects.

## The Orb Registry

The [Orb Registry](https://circleci.com/orbs/registry/) is an open repository of all published orbs. Find the orb for your stack or consider developing and [publishing your own orb]({{site.baseurl}}/2.0/orb-author-intro/#section=configuration).

![Orb Registry]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

Orbs in the registry will appear with one of three different namespace designations:

| Certified | Written and tested by the CircleCI team |
| Partner | Written by our technology partners |
| Community | Written by the community |
{: class="table table-striped"}

**Note:** _In order to use uncertified orbs, your organization’s administrator must opt-in to allow 3rd-party uncertified orb usage on the **Organization Settings > Security** page for your org._
{: class="alert alert-warning"}

Each orb contains its own description and documentation listed in the orb registry. Often, orbs will have a set of usage examples to get you started.

If you would like to contribute to an existing orb or file an issue on the orb's repository, many orb authors will include the git repository link.

## Identifying Orbs
An orb is identified by its _slug_ which contains the _namespace_ and _orb name_. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed be an `@` symbol and a [semantic version]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning) string, identifying which version of the orb is being used.

Example orb slug: `<namespace>/<orb-name>@1.2.3`

## Using Orbs

Each orb within the registry provides a sample code snippet for importing that specific orb, with its most recent version.

To import an orb within your `version: 2.1` config file, create an `orbs` key followed by the key to reference the orb you wish to import, the orb name. Enter the orb slug containing the version string for the value of the orb name key.

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

After the orb has been imported into the configuration file, the elements provided by the orb are available as `<orb-name>/<element>`. Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/2.0/reusing-config/) elements.

### Node Example
The Node orb provides a command, [`install-packages`](https://circleci.com/orbs/registry/orb/circleci/node#commands-install-packages), to install your node packages, automatically enable caching, and provide additional options through the use of parameters. To use the `install-packages` command, reference it in a job's [steps](https://circleci.com/docs/2.0/configuration-reference/#steps).

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
