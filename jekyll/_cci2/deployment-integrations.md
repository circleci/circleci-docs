---
layout: classic-docs
title: "Configuring Deploys"
short-title: "Configuring Deploys"
---

CircleCI can be configured to deploy to virtually any service. This document provides an overview of the deployment process, along with best practices, presented using deployment examples for a variety of popular platforms.

* TOC
{:toc}

## Overview
{:.no_toc}

Once a software application has been developed and tested, it needs to be deployed and made available for the intended audience. CircleCI can be configured to deploy to any platform, including integration with: 
* UI QA/testing 
* Feature management tools 
* Multiple deployment targets, for example, staging/production

It's easy to fully customize your config to match your deployment strategy, whether a fully automated process or elements of manual approval are required.

![Deployment]( {{ site.baseurl }}/assets/img/docs/pipeline-to-deployment.png)

Orbs are available for many common deployment targets to help simplify and streamline your config. Orbs are packages of reusable configuration, and often, for simple pipelines, the defaults within the orb will meet requirements so all you would need to do is call the orb and configure your workflow to run the deployment once your application is built and tested.

### A Simple Example Using Heroku

Below is a simple example of deploying a Rails application to Heroku. The full application can be found in the [Sequential Job branch of the CircleCI Demo Workflows repository](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/sequential-branch-filter).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - checkout
      - run: bundle install --path vendor/bundle  # install dependencies
      - run: bundle exec rake db:create db:schema:load  # setup database
      - run:
          name: Run tests
          command: rake

  deploy:
    machine:
        enabled: true
    working_directory: ~/circleci-demo-workflows
    environment:
      HEROKU_APP: "sleepy-refuge-55486"
    steps:
      - checkout
      - run:
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP.git master

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: sequential-branch-filter
```

The configuration uses [workflows]({{ site.baseurl }}/2.0/workflows/) to deploy only if the `sequential-branch-filter` branch is checked out and the `build` job has run. If your deploy job uses any output from previous jobs, you can share that data by [using workspaces]({{ site.baseurl }}/2.0/workflows/#using-workspaces-to-share-data-among-jobs). For more information on conditional deploys, see [Using Contexts and Filtering in your Workflows]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows).

## Deployment: The Basics

To deploy your application, add a [job]({{ site.baseurl }}/2.0/jobs-steps/#jobs-overview) to your `.circleci/config.yml` file and configure the job to run the steps required to deploy your application.

To fulfill the deploy steps you will need to [add environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) and/or [SSH keys]({{ site.baseurl }}/2.0/add-ssh-key/) for your deployment target.

To simplify your configuration you can choose to use orbs. There are certified orbs available for most commonly-used deployment targets. Orbs include preconfigured jobs to run your deployments, once the relevant environment variables are defined within your project. To find out if there is an orb available

