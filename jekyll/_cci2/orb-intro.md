---
layout: classic-docs
title: "Orbs Introduction"
short-title: "Orbs Introduction"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

* TOC
{:toc}

Orbs are reusable snippets of code that help automate repeated processes, accelerate project setup, and make it easy to integrate with third-party tools. Visit the [Orbs Registry](https://circleci.com/developer/orbs) on the CircleCI Developer Hub to search for orbs to help simplify your configuration.

Examples of reusable snippets that can be included in orbs are [jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands), [executors]({{site.baseurl}}/reusing-config/#executor), as well as Node.js and its package managers.

Use orbs to reduce configuration complexity, and help you integrate with your software and services stack quickly and easily across many projects.

If you would like to author your own orb, read more on the [Introduction to Authoring Orbs]({{site.baseurl}}/orb-author-intro/) page.

## Benefits of using orbs
{: #benefits-of-using-orbs }

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

## The orb registry
{: #the-orb-registry }

The [Orb Registry](https://circleci.com/developer/orbs) is an open repository of all published orbs. Find the orb for your stack or consider developing and [publishing your own orb]({{site.baseurl}}/orb-author-intro/).

![Orb Registry]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

Orbs in the registry will appear with one of three different namespace designations:

| Certified | Written and tested by the CircleCI team |
| Partner | Written by our technology partners |
| Community | Written by the community |
{: class="table table-striped"}

**Note:** _In order to use uncertified orbs (partner or community), your organization’s administrator must opt-in to allow uncertified orb usage on the **Organization Settings > Security** page for your org._
{: class="alert alert-warning"}

Each orb contains its own description and documentation listed in the orb registry. Often, orbs will have a set of usage examples to get you started.

If you would like to contribute to an existing orb, or file an issue on the orb's repository, many orb authors will include the git repository link.

## Public or private
{: #public-or-private }
Orbs can be published in one of two ways:

* **Publicly**: Searchable in the orb registry, and available for anyone to use 
* **Privately**: Only available to use within your organization, and only findable in the registry with a direct URL and when authenticated 

To understand these concepts further read the [Public Orbs vs Private Orbs]({{site.baseurl}}/orb-concepts/#private-orbs-vs-public-orbs) section of the Orb Concepts page.

## Identifying orbs
{: #identifying-orbs }
An orb is identified by its _slug_ which contains the _namespace_ and _orb name_. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed by an `@` symbol and a [semantic version]({{site.baseurl}}/orb-concepts/#semantic-versioning) string, identifying which version of the orb is being used.

Example orb slug: `<namespace>/<orb-name>@1.2.3`

## Using orbs
{: #using-orbs }

Each orb within the registry provides a sample code snippet for importing that specific orb with its most recent version.

The example below shows how to import an orb into your `version: 2.1` config file. Create an `orbs` key followed by the orb-name key to reference which orb you want to import. The value for the orb-name key should then be the orb slug and version.

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

After the orb has been imported into the configuration file, the elements provided by the orb are available as `<orb-name>/<element>`. Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/reusing-config/) elements. The Node example below shows how to use an orb command.

### Node example
{: #node-example }
{:.no_toc}

The Node orb provides a command, [`install-packages`](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages), to install your node packages, automatically enable caching, and provide additional options through the use of parameters. To use the `install-packages` command, reference it in a job's [steps]({{site.baseurl}}/configuration-reference/#steps).

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

## Orbs page in the CircleCI app
{: #orbs-view}

The orbs page in the CircleCI web app is not currently available on CircleCI server.
{: class="alert alert-warning"}

To access the orbs page in the web app, navigate to **Organization Settings** and select **Orbs** from the sidebar.

The orbs page list orbs created within your organization. You can view orb type (public or private), orb usage (how many times the orb is used across all configurations), latest version, and description.

Full orb details, including orb source, are accessible by clicking on the orb name. The orb details page is similar to the CircleCI orb registry in that the details page provides the orb's contents, commands, and usage examples. 

Private orb details pages may only be viewed by logged-in members of your organization. Unpublished orbs will not have linked details pages.
{: class="alert alert-info"}


## See also
{: #see-also }

- Refer to [Orbs Concepts]({{site.baseurl}}/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/orbs-faq/) for information on known issues and questions that have been addressed when using CircleCI orbs.
- Refer to [Reusable Configuration Reference]({{site.baseurl}}/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/testing-orbs/) for information on how to test orbs you have created.

## Learn More
{: #learn-more }
Take the [orbs course](https://academy.circleci.com/orbs-course?access_code=public-2021) with CircleCI academy to learn more.
