---
layout: classic-docs
title: "Using Yarn (the npm replacement) on CircleCI"
short-title: "Yarn Package Manager"
categories: [how-to]
description: "How to use the Yarn package manager on CircleCI."
---

[Yarn](https://yarnpkg.com/) is an open-source package manager for JavaScript.
The packages it installs can be cached.
This can potentially speed up builds but, more importantly, can reduce errors related to network connectivity.

## Using Yarn in CircleCI

Yarn might already be installed in your build environment if you are using the [`docker` executor](https://circleci.com/docs/2.0/executor-types/#using-docker).
With [Pre-built CircleCI Docker Images](https://circleci.com/docs/2.0/circleci-images/), the NodeJS image (`circleci/node`) already has Yarn preinstalled.
If you are using one of the other language images such as `circleci/python` or `circleci/ruby`, there are two [image variants](https://circleci.com/docs/2.0/circleci-images/#image-variants) that will include Yarn as well as NodeJS.
These would be the `-node` and `-node-browsers` image variants.
For example, using the Docker image `circleci/python:3-node` will give you a Python build environment with Yarn and NodeJS installed.

If you're using your own Docker image base or the `macos` or `machine` executors, you can install Yarn by following the official instructions from [Yarn Docs](https://yarnpkg.com/lang/en/docs/install/). The Yarn Docs provide several installation methods depending on what machine execturo you might be using. For example, you can install on any unix-like environment using the following curl command.

```sh
curl -o- -L https://yarnpkg.com/install.sh | bash
```

## Caching

Yarn packages can be cached to improve CI build times.
Here's an example:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --frozen-lockfile
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## See Also

[Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
