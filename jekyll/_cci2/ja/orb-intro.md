---
layout: classic-docs
title: "Orb の概要"
short-title: "Orb の概要"
description: "CircleCI Orb の入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

- TOC
{:toc}

## Quick Start
{:.no_toc}

CircleCI orbs are open-source, shareable packages of parameterizable [reusable configuration]({{site.baseurl}}/2.0/reusing-config/) elements, including [jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/2.0/reusing-config/#executor). Use orbs to reduce configuration complexity and help you integrate with your software and services stack quickly and easily across many projects.

Published orbs can be found on our [Orb Registry](https://circleci.com/developer/orbs), or you can [author your own orb]({{site.baseurl}}/2.0/orb-author-intro/).

## Benefits of Using Orbs

Orbs provide parameterizable configuration elements that can greatly simplify your configuration. To illustrate this, the following example shows a typical configuration for testing a Node.js application – defining a job with the required steps for testing the application – versus using the `test` job provided by the [`circleci/node`](https://circleci.com/developer/orbs/orb/circleci/node) orb. With orbs, it is possible to write a parameterized configuration once and utilize it across multiple similar projects.

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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

## The Orb Registry

The [Orb Registry](https://circleci.com/developer/orbs) is an open repository of all published orbs. Find the orb for your stack or consider developing and [publishing your own orb]({{site.baseurl}}/2.0/orb-author-intro/).

![Orb Registry]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

Orbs in the registry will appear with one of three different namespace designations:

| Certified | Written and tested by the CircleCI team | | Partner | Written by our technology partners | | Community | Written by the community |
{: class="table table-striped"}

**Note:** *In order to use uncertified orbs, your organization’s administrator must opt-in to allow 3rd-party uncertified orb usage on the **Organization Settings > Security** page for your org.*
{: class="alert alert-warning"}

Each orb contains its own description and documentation listed in the orb registry. Often, orbs will have a set of usage examples to get you started.

If you would like to contribute to an existing orb or file an issue on the orb's repository, many orb authors will include the git repository link.

## Identifying Orbs

An orb is identified by its *slug* which contains the *namespace* and *orb name*. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed be an `@` symbol and a [semantic version]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning) string, identifying which version of the orb is being used.

Example orb slug: `<namespace>/<orb-name>@1.2.3`

## Using Orbs

Each orb within the registry provides a sample code snippet for importing that specific orb with its most recent version.

The example below shows how to import an orb into your `version: 2.1` config file. Create an `orbs` key followed by the orb-name key to reference which orb you want to import. The value for the orb-name key should then be the orb slug and version.

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

After the orb has been imported into the configuration file, the elements provided by the orb are available as `<orb-name>/<element>`. Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/2.0/reusing-config/) elements. The Node example below shows how to use an orb command.

### Node Example
{:.no_toc}

The Node orb provides a command, [`install-packages`](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages), to install your node packages, automatically enable caching, and provide additional options through the use of parameters. To use the `install-packages` command, reference it in a job's [steps](https://circleci.com/docs/2.0/configuration-reference/#steps).

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #orb version

jobs:
  test:
    docker:

      - image: cimg/node:<node-version>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - node/install-packages # Utilize commands in steps
```

## See Also
{:.no_toc}

- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- [Orbs に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): CircleCI Orbs の使用に際して発生している既知の問題や不明点
- Refer to [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orbs のテスト方法
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for information about how you can use CircleCI orb recipes in your configurations.