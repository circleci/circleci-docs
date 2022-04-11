---
layout: classic-docs-experimental
title: "Configuring a Node.js Application on CircleCI"
short-title: "JavaScript"
description: "Building and Testing with JavaScript and Node.js on CircleCI"
categories: [language-guides]
order: 5
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document provides a walkthrough of the [`.circleci/config.yml`]({{site.baseurl}}/2.0/configuration-reference/) file for a Node.js sample application.

* TOC
{:toc}

## Quickstart: demo JavaScript Node.js reference project
{: #quickstart-demo-javascript-nodejs-reference-project }

We maintain a reference JavaScript project to show how to build a React.js app on CircleCI with `version: 2.1` configuration:

- [Demo JavaScript Node Project on GitHub](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [Demo JavaScript Node Project building on CircleCI](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app){:rel="nofollow"}

In the project, you will find a CircleCI configuration file [`.circleci/config.yml`](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app/blob/master/.circleci/config.yml). This file shows best practice for using `version 2.1` config with Node projects.

## Build the demo JavaScript Node project yourself
{: #build-the-demo-javascript-node-project-yourself }

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account.
2. Go to the **Projects** page on the [CircleCI web app](https://app.circleci.com/), and click the **Set Up Project** button next to the project you just forked.
3. To make changes, you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.


## Sample configuration
{: #sample-configuration }

Below is the `.circleci/config.yml` file in the demo project.

{% raw %}

```yaml
orbs: # declare what orbs we are going to use
  node: circleci/node@2.0.2 # the Node orb provides common Node-related configuration

version: 2.1 # using 2.1 provides access to orbs and other features

workflows:
  matrix-tests:
    jobs:
      - node/test:
          version: 13.11.0
      - node/test:
          version: 12.16.0
      - node/test:
          version: 10.19.0
```
{% endraw %}


## Config walkthrough
{: #config-walkthrough }

The [2.1 Node orb](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test) sets an executor from CircleCI's highly cached convenience images built for CI and allows you to set the version of Node to use. Any available tag in the [docker image list](https://hub.docker.com/r/cimg/node/tags) can be used.

The Node orb `test` command will test your code with a one-line command, with optional parameters.

Matrix jobs are a simple way to test your Node app on various Node environments. For a more in-depth example of how the Node orb utilizes matrix jobs, see our blog on [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/). See [documentation on pipeline parameters]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to learn how to set a Node version with Pipeline parameters.

Success! You just set up a Node app to build on CircleCI with `version: 2.1` configuration. Check out [our project’s pipeline page](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app) to see how this looks when building on CircleCI.

## See also
{: #see-also }
{:.no_toc}

- See the [Deploy]({{site.baseurl}}/2.0/deployment-integrations/) page for example deploy target configurations.
- Refer to the [Examples]({{site.baseurl}}/2.0/examples/) page for more configuration examples of public JavaScript projects.
- If you're new to CircleCI, we recommend reading our [Project Walkthrough]({{site.baseurl}}/2.0/project-walkthrough/) page for a detailed explanation of our configuration using Python and Flask as an example.
