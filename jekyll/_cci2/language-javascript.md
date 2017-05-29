---
layout: classic-docs
title: "Language Guide: JavaScript"
short-title: "JavaScript"
description: "Building and Testing with JavaScript and NodeJS on CircleCI 2.0"
categories: [language-guides]
order: 5
---

## New to CircleCI 2.0?

If you're new to CircleCI 2.0, we recommend reading our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) for a detailed explanation of our configuration using Python and Flask as an example.

## Quickstart: demo JavaScript NodeJS reference project

We maintain a reference JavaScript NodeJS project to show how to build an Express.js app on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express" target="_blank">Demo JavaScript Node Project on GitHub</a>
- <a href="https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express" target="_blank">Demo JavaScript Node Project building on CircleCI</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with Node projects.

## Pre-built CircleCI Docker images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Node version you need from Docker Hub: <https://hub.docker.com/r/circleci/node/>. The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available.

## Build the demo JavaScript Node project yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

## Config Walkthrough

Details of the configuration steps will be updated soon. Please see the `.circleci/config.yml` file in the demo project to get started.

---

Success! You just set up CircleCI 2.0 for a NodeJS app. Check out our [project’s build page](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express) to see how this looks when building on CircleCI.

If you have any questions about the specifics of testing your NodeJS application, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
