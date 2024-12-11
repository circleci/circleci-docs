---
layout: classic-docs
title: "Orbs overview"
description: "Starting point for using CircleCI orbs"
contentTags:
  platform:
  - Cloud
  - Server v4+
---

Use orbs to:

* Simplify configuration (`.circleci/_config.yml`)
* Automate repeated processes
* Accelerate project setup
* Simplify integration with third-party tools

## Introduction
{: #introduction }

Orbs are reusable packages of parameterizable configuration that can be used in any project. They are made up of reusable configuration elements, for example, [jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/reusing-config/#executor). Orbs are available for many languages, platforms, services, and tools. Visit the [Orbs Registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your configuration.

If you would like to author your own orb, read more on the [Introduction to Authoring Orbs]({{site.baseurl}}/orb-author-intro/) page.

## Quickstart
{: #quickstart }

* Follow our [Node.js project quickstart guide](/docs/language-javascript/).
* Follow our [Python project quickstart guide](/docs/language-python/).
* Set up notifications using the [Slack orb](/docs/slack-orb-tutorial/).

## Use an orb
{: #use-an-orb }

An orb is identified by its _slug_ which contains the _namespace_, and _orb name_. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed by an `@` symbol and a [semantic version]({{site.baseurl}}/orb-concepts/#semantic-versioning) string, identifying which version of the orb is being used. For example: `<namespace>/<orb-name>@1.2.3`.

Each orb within the [registry](https://circleci.com/developer/orbs) provides a [quickstart guide](https://circleci.com/developer/orbs/orb/circleci/node#quick-start), which contains a sample code snippet for importing that specific orb, with its most recent version, into your `.circleci/config.yml`.

The example below shows how to import any orb into your CircleCI configuration file. There are two tabs to show both a generic layout for importing any orb, and a specific example of importing the Node.JS orb:

{:.tab.nodeExample.Node}
```yaml
version: 2.1

orbs:
  node: circleci/node@5.0.3
```

{:.tab.nodeExample.Generic}
```yaml
version: 2.1

orbs:
  <orb-name>: <namespace>/<orb-name>@x.y.z
```

After the orb has been imported into the configuration file, the elements provided by the orb are available as `<orb-name>/<element>`. Orb elements can include jobs, commands, and executors. The parameters available for each element are listed in the orb registry in a table under each element.

Most orbs will also include usage examples detailing common functionality, to further simplify the process of incorporating them into your projects. If you would like to contribute to an existing orb, or file an issue on the orb's repository, many orb authors will include the git repository link.

Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/reusing-config/) elements. The Node example below shows how to use an orb's default executor, and an orb command.

### Node example
{: #node-example }

The Node orb provides a command, [`install-packages`](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages), to install your node packages, automatically enable caching, and provide additional options through the use of parameters. To use the `install-packages` command, reference it in a job's [steps]({{site.baseurl}}/configuration-reference/#steps).

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y # replace orb version

jobs:
  test:
    executor: node/default # use the default executor specified by the orb
    steps:
      - checkout
      - node/install-packages # Use a command from the orb in a job's steps
```


## Benefits of using orbs
{: #benefits-of-using-orbs }

Orbs provide parameterizable configuration elements that can greatly simplify your configuration. To illustrate this, the following example shows a typical configuration for testing a Node.js application using the Node.JS orb (using the `test` job provided by the [`circleci/node`](https://circleci.com/developer/orbs/orb/circleci/node) orb), compared to the configuration required without using the orb (defining a job with the required steps for testing the application).

Orbs let you pull in pre-defined, parameterized configuration elements into your project configuration. Taking it a step further, authoring your own orb lets you define parameterized configuration elements once and utilize them across multiple similar projects.

{:.tab.nodeTest.Orbs}
```yaml
version: 2.1

orbs:
  node: circleci/node@x.y # replace orb version https://circleci.com/developer/orbs/orb/circleci/node#quick-start

workflows:
  test_my_app:
    jobs:
      - node/test:
          version: <node-version> # replace node version
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

## The orb registry
{: #the-orb-registry }

The [Orb Registry](https://circleci.com/developer/orbs) is an open repository of all published orbs. Find the orb for your stack or consider developing and [publishing your own orb]({{site.baseurl}}/orb-author-intro/).

![Orb Registry]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

### Orb designations
{: #orb-designation }

In order to use uncertified orbs (partner or community), your organization’s administrator must opt-in to allow uncertified orb usage on the **Organization Settings > Security** page for your org.
{: class="alert alert-warning"}

Orbs in the registry will appear with one of three different namespace designations:

| Designation | Description |
| --- | --- |
| Certified | Written and tested by the CircleCI team |
| Partner | Written by our technology partners |
| Community | Written by the community |
{: class="table table-striped"}

### Public or private
{: #public-or-private }
Orbs can be published in one of two ways:

* **Public**: Searchable in the orb registry, and available for anyone to use
* **Private**: Only available to use within your organization, and only findable in the registry with a direct URL and when authenticated

To understand these concepts further, read the [Public Orbs vs Private Orbs]({{site.baseurl}}/orb-concepts/#private-orbs-vs-public-orbs) section of the Orb Concepts page.


## Orbs page in the CircleCI app
{: #orbs-view}

The orbs page in the CircleCI web app is not currently available on CircleCI server.
{: class="alert alert-warning"}

Private orb details pages may only be viewed by logged-in members of your organization. Unpublished orbs will not have linked details pages.
{: class="alert alert-info"}

To access the orbs page in the web app, navigate to **Organization Settings** and select **Orbs** from the sidebar.

The orbs page lists orbs created within your organization. You can view:

* Orb type (public or private)
* Orb usage (how many times the orb is used across all configurations)
* Latest version
* Description

Full orb details, including orb source, are accessible by clicking on the orb name. The orb details page is similar to the CircleCI orb registry in that the details page provides the orb's contents, commands, and usage examples.


## See also
{: #see-also }

- Refer to [Orbs Concepts]({{site.baseurl}}/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/orbs-faq/) for information on known issues and questions that have been addressed when using CircleCI orbs.
- Refer to [Reusable Configuration Reference]({{site.baseurl}}/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/testing-orbs/) for information on how to test orbs you have created.
