---
layout: classic-docs
title: "Using Yarn (an NPM alternative) on CircleCI"
short-title: "Yarn Package Manager"
categories: [how-to]
description: "Yarn is an open-source package manager for JavaScript. Learn how to use Yarn in CircleCI config and with caching to speed up builds."
version:
- Cloud
- Server v3.x
- Server v2.x
---

[Yarn](https://yarnpkg.com/) is an open-source package manager for JavaScript.
The packages it installs can be cached.
This can potentially speed up builds, but, more importantly, can reduce errors related to network connectivity.

## Using Yarn in CircleCI
{: #using-yarn-in-circleci }

Yarn might already be installed in your execution environment if you are using the [`docker` executor]({{site.baseurl}}/2.0/using-docker).
With [Pre-built CircleCI Docker Images]({{site.baseurl}}/2.0/circleci-images/), the NodeJS image (`circleci/node`) already has Yarn preinstalled.
If you are using one of the other language images such as `circleci/python` or `circleci/ruby`, there are two [image variants]({{site.baseurl}}/2.0/circleci-images/#language-image-variants) that will include Yarn as well as NodeJS.
These would be the `-node` and `-node-browsers` image variants.
For example, using the Docker image `circleci/python:3-node` will give you a Python execution environment with Yarn and NodeJS installed.

If you're using your own Docker image base or the `macos`, `windows` or `machine` executors, you can install Yarn by following the official instructions from [Yarn Docs](https://yarnpkg.com/lang/en/docs/install/). The Yarn Docs provide several installation methods depending on what machine executor you might be using. For example, you can install on any unix-like environment using the following curl command.

```shell
curl -o- -L https://yarnpkg.com/install.sh | bash
```

## Caching
{: #caching }

Yarn packages can be cached to improve CI build times.

Yarn 2.x added the ability to do [Zero Installs](https://yarnpkg.com/features/zero-installs); if you're using Zero Installs, you shouldn't need to do any special caching.

If you're using Yarn 2.x without Zero Installs, you can do something like this:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --immutable
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - .yarn/cache
            - .yarn/unplugged
#...
```
{% endraw %}

An example for Yarn 1.x:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --frozen-lockfile --cache-folder ~/.cache/yarn
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## See also
{: #see-also }

[Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
