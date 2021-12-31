---
layout: classic-docs
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

{% raw %}
This document describes how to configure CircleCI using a sample application written in Node.js.
{% endraw %}

* TOC
{:toc}

## Configuration Walkthrough
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

### 1. Specify a version
{: #specify-a-version }

Every config.yml starts with the version key. This key is used to issue warnings about breaking changes.
```yaml
version: 2.1
```

`2.1` is the latest CircleCI version, and it ensures you have access to all our latest features and improvements.

### 2. Use the Node orb
{: #use-the-node-orb }

The Node.js [orb]({{site.devhub_base_url}}/orbs/orb/circleci/node) contains a set of prepackaged CircleCI configurations you can use to easily install Node.js and its package managers (npm, yarn). Best of all, packages are installed with caching by default, and support for Linux x86_64, macOS x86_64, and Arm64 is automatically included. Learn more about [orbs]({{site.baseurl}}/2.0/orb-intro/).

To add the orb to your config, insert:
```yaml
orbs:
  node: circleci/node@4.7.0
```

Note: You might need to enable organization settings to allow the use of third-party orbs in the CircleCI dashboard, or request permission from your organization’s CircleCI admin.

### 3. Create a workflow
{: #create-a-workflow }

A workflow is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a set of configuration keys to help you resolve failures sooner. Inside the workflow, you define the jobs you want to run. CircleCI will run this workflow on every commit. Learn more about [workflow configuration]({{ site.baseurl }}/2.0/configuration-reference/#workflows).

```yaml
workflows:
  my_workflow: # This is the name of the workflow, feel free to change it to better match your workflow.
```

### 4. Create a job
{: #create-a-job }

Jobs are the building blocks of your config. Jobs are collections of steps, which run commands/scripts as required. All of the steps in the job are executed in a single unit, either within a fresh container or Virtual Machine. Learn more about [jobs]({{site.baseurl}}/2.0/configuration-reference/#jobs).

A traditional ask from developers who are getting started with CircleCI is to perform 3 basic tasks: `build`, `test` and `deploy`. This section will guide you through each of the config changes needed. Because we are using the official Node.js orb, these steps can easily be accomplished:

#### a. Build and test the app
{: #build-and-test-the-app }

If you are using yarn:

```yaml
jobs:
  build_and_test: # this can be any name you choose
    docker:
      - image: cimg/node:17.2.0
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
    docker:
      - image: cimg/node:17.2.0
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
          paths: .
```

Because we are using the Node orb, this job will install your Node packages with automated caching and best practices applied. Note that it requires a lock file.

#### b. Deploy the app
{: #deploy-the-app }

In this example, we are choosing to deploy to Heroku. This can be done using the official Heroku orb by adding a new line into our orb section. The Heroku orb contains a set of prepackaged CircleCI configurations you can use to deploy applications to Heroku. Learn more about the [Heroku orb]({{site.devhub_base_url}}/orbs/orb/circleci/heroku).

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
    docker:
      - image: cimg/node:17.2.0
    steps:
      - attach_workspace:
        at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

Note: Environment variables containing the necessary secrets such as `HEROKU_API_KEY` and `HEROKU_APP_NAME` can be set up in the CircleCI UI. Learn more about [environment variables]({{site.baseurl}}/2.0/env-vars/#setting-an-environment-variable-in-a-project).

#### c. Add jobs to the workflow
{: #add-jobs-to-the-workflow }

Now that we have the `build_and_test` job and the `deploy` job, we can complete our `build_test_deploy` workflow. Refer to the [workflows]({{site.baseurl}}/2.0/workflows/) documentation for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

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

## Conclusion
{: #conclusion }

Success! You just set up a Node.js app to build on CircleCI. Check out your project’s [pipeline page]({{site.baseurl}}/2.0/project-build/#overview) to see how this looks when building on CircleCI.

### Full configuration file
{: #full-configuration-file }

```yaml
version: 2.1
orbs:
  node: circleci/node@4.7.0
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test:
    docker:
      - image: cimg/node:17.2.0
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
 
  deploy: # this can be any name you choose
    docker:
      - image: cimg/node:17.2.0
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
{: #see-also }
{:.no_toc}

- [Continuous deployment of Node apps to Heroku]({{site.blog_base_url}}/continuous-deployment-to-heroku/)
- [Continuous deployment of Node.js to Azure VM]({{site.blog_base_url}}/cd-azure-vm/)
- [Troubleshoot Node.js build and test suite timeouts]({{site.support_base_url}}/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout)
