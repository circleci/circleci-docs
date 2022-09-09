---
layout: classic-docs
title: "Configuring a Node.js Application on CircleCI"
short-title: "JavaScript"
description: "Building and Testing with JavaScript and Node.js on CircleCI"
categories: [language-guides]
order: 5
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

{% include snippets/language-guided-tour-cards.md lang="Node.JS" demo_url_slug="javascript" demo_branch="master" guide_completion_time="15" sample_completion_time="10" %}

## Overview
{: #overview }

This is a quickstart guide for integrating a Node.JS project with CircleCI. This guide is designed to help you create a basic CircleCI configuration file to build, test and deploy your Node.JS project. After completing this quickstart you can edit and optimize the config to fit the requirements of your project.

## Prerequisites
{: #prerequisites}

* [A CircleCI account]({{site.baseurl}}/first-steps/)
* A Node.JS project located in a supported VCS (currently GitHub or Bitbucket)

If you do not have a Node.JS project, but would like to follow this guide, you can use our sample project, which is [hosted on GitHub]({{site.gh_public_org_url}}/sample-javascript-cfd)
and is [building on CircleCI]({{site.cci_public_org_url}}/sample-javascript-cfd). Consider [forking the repository]({{site.gh_help_articles_url}}/fork-a-repo/)
and rewriting [the configuration file]({{site.gh_public_org_url}}/sample-javascript-cfd/blob/master/.circleci/config.yml)
as you follow this guide.

## Configuration walkthrough
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

### 1. Specify a version
{: #specify-a-version }

Every CircleCI config.yml starts with the version key. This key is used to issue warnings about breaking changes.
```yaml
version: 2.1
```

`2.1` is the latest CircleCI version, and it ensures you have access to all our latest features and improvements.

### 2. Use the Node orb
{: #use-the-node-orb }

The Node.js [orb]({{site.devhub_base_url}}/orbs/orb/circleci/node) contains a set of prepackaged CircleCI configurations you can use to easily install Node.js and its package managers (npm, yarn). Best of all, packages are installed with caching by default, and support for Linux x86_64, macOS x86_64, and Arm64 is automatically included. Learn more about [orbs]({{site.baseurl}}/orb-intro/).

To add the orb to your config, insert:
```yaml
orbs:
  node: circleci/node@5.0.2
```

**Note**: When using an orb, it is a good idea to check the [Orb Registry](https://circleci.com/developer/orbs) to ensure you are using the most recent version, or the version that fits best with your specific project.

### 3. Create jobs
{: #create-jobs }

Jobs are the building blocks of your config. Jobs are collections of steps, which run commands/scripts as required. All of the steps in the job are executed in a single unit, either within a fresh container or Virtual Machine. Learn more about jobs on the [Jobs and Steps]({{site.baseurl}}/jobs-steps/) page.

A common ask from developers who are getting started with CircleCI is to perform 3 basic tasks: `build`, `test` and `deploy`. This section guides you through each of the config changes needed. Because we are using the official Node orb, we can use commands that are built into the orb to keep our config simple and succinct:

#### a. Build and test the app
{: #build-and-test-the-app }

If you are using yarn:

```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: node/default # use the default executor defined within the orb
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: Run tests
      - run:
          command: yarn build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths: .
```

Similarly, if you are using npm:

```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: node/default # use the default executor defined within the orb
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          command: npm run test
          name: Run tests
      - run:
          command: npm run build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

Because we are using the Node orb, this job will install your Node packages with automated caching and best practices applied. Note that it requires a lock file.

#### b. Deploy the app
{: #deploy-the-app }

In this quickstart guide, we will deploy to [Heroku](https://www.heroku.com/). We can do this using the official Heroku orb by adding a new line into our orb section. The Heroku orb contains a set of prepackaged CircleCI configurations you can use to deploy applications to Heroku. Learn more about the [Heroku orb]({{site.devhub_base_url}}/orbs/orb/circleci/heroku).

```yaml
orbs:
  node: circleci/node@4.7.0
  heroku: circleci/heroku@1.2.6
```

We then need to add a job to our list to take care of the deploy step:

```yaml
jobs:
  # ...previous job(s)...
  deploy: # this can be any name you choose
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

Note: Environment variables containing the necessary secrets such as `HEROKU_API_KEY` and `HEROKU_APP_NAME` can be set up in the CircleCI UI. Learn more about [environment variables]({{site.baseurl}}/env-vars/#setting-an-environment-variable-in-a-project).

### 3. Create a workflow
{: #create-a-workflow }

A workflow is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a set of configuration keys to help you resolve failures sooner. Inside the workflow, you define the jobs you want to run. CircleCI will run this workflow on every commit. Learn more about [workflow configuration]({{ site.baseurl }}/configuration-reference/#workflows).

```yaml
workflows:
  build_test_deploy: # this can be any name you choose
```

### 4. Add jobs to the workflow
{: #add-jobs-to-the-workflow }

Now that we have our workflow, `build_test_deploy`, we can use it to orchestrate the running of our `build_and_test` and `deploy` jobs. Refer to the [Using Workflows to Schedule Jobs]({{site.baseurl}}/workflows/) page for more details about orchestrating jobs with concurrent, sequential, and manual approval workflows.

```yaml
workflows:
  build_test_deploy: # this can be any name you choose
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # only deploy if the build_and_test job has completed
          filters:
            branches:
              only: main # only deploy when on main
```

### 5. Conclusion
{: #conclusion }

You just set up a Node.js app to build on CircleCI. Check out your project’s [pipeline page]({{site.baseurl}}/project-build/#overview) to see how this looks when building on CircleCI.

## Full configuration file
{: #full-configuration-file }

```yaml
version: 2.1
orbs:
  node: circleci/node@5.0.2
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test:
    executor: node/default
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: Run tests
      - run:
          command: yarn build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # this can be any name you choose
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git

workflows:
  test_my_app:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # only deploy if the build_and_test job has completed
          filters:
            branches:
              only: main # only deploy when on main
```

## See also
{: #see-also-new }

- [Continuous deployment of Node apps to Heroku]({{site.blog_base_url}}/continuous-deployment-to-heroku/)
- [Continuous deployment of Node.js to Azure VM]({{site.blog_base_url}}/cd-azure-vm/)
- [Troubleshoot Node.js build and test suite timeouts]({{site.support_base_url}}/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout)
