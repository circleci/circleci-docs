---
layout: classic-docs
title: "Configuring a Python Application on CircleCI"
short-title: "Python"
description: "Continuous integration with Python on CircleCI"
categories: [language-guides]
order: 7
contentTags: 
  platform:
  - Cloud
  - Server v3.x
  - Server v2.x
---

{% include snippets/language-guided-tour-cards.md lang="Python" demo_url_slug="python" demo_branch="main" guide_completion_time="15" sample_completion_time="10" %}

## Overview
{: #overview-new }

This is a quickstart guide for integrating a Python project with CircleCI. This guide is designed to help you create a basic CircleCI configuration file to build, test and deploy your Python project. After completing this quickstart you can edit and optimize the config to fit the requirements of your project.

## Prerequisites
{: #prerequisites}

* [A CircleCI account]({{site.baseurl}}/first-steps/)
* A Python project located in a supported VCS (currently GitHub or Bitbucket)

If you do not have a Python project, but would like to follow this guide, you can use our sample project which is [hosted on GitHub](https://github.com/CircleCI-Public/sample-python-cfd)
and is [building on CircleCI]({{site.cci_public_org_url}}/sample-python-cfd){:rel="nofollow"}. Consider [forking the repository]({{site.gh_help_articles_url}}/fork-a-repo/)
and rewriting [the configuration file]({{site.gh_public_org_url}}/sample-python-cfd/blob/main/.circleci/config.yml)
as you follow this guide.

## Configuration walkthrough
{: #configuration-walkthrough-new }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/). Follow the steps below to create a working `config.yml` file.

### 1. Specify a version
{: #specify-a-version-new }

Every CircleCI config.yml starts with the version key. This key is used to issue warnings about breaking changes.
```yaml
version: 2.1
```

`2.1` is the latest CircleCI version, and it ensures you have access to all our latest features and improvements.

### 2. Use the Python orb
{: #use-the-python-orb }

The Python [orb]({{site.devhub_base_url}}/orbs/orb/circleci/python) contains a set of prepackaged CircleCI configurations you can use to do common CircleCI tasks for the Python programming language. It supports Linux x86_64, macOS x86_64, and Arm64. Learn more about [orbs]({{site.baseurl}}/orb-intro/).

To add the orb to your config, insert:
```yaml
orbs:
  python: circleci/python@2.0.3
```

**Note**: When using an orb, it is a good idea to check the [Orb Registry](https://circleci.com/developer/orbs) to ensure you are using the most recent version, or the version that fits best with your specific project.

### 3. Create jobs
{: #create-jobs }

Jobs are the building blocks of your config. Jobs are collections of steps, which run commands/scripts as required. All of the steps in the job are executed in a single unit, either within a fresh container or virtual machine. Learn more about jobs on the [Jobs and Steps]({{site.baseurl}}/jobs-steps/) page.

A common ask from developers who are getting started with CircleCI is to perform three basic tasks: `build`, `test` and `deploy`. This section guides you through each of the config changes needed. Because we are using the official Python orb, we can use commands that are built into the orb to keep our config simple and succinct:

#### a. Build and test the app
{: #build-and-test-the-app }

For this step, we are using the `python/install-packages` command that comes from the Python [orb]({{site.devhub_base_url}}/orbs/orb/circleci/python). This command automatically sets up a python environment and installs the packages for your project either globally with `pip` or in a `virtualenv` with `poetry` or `pipenv`.
```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: python/default # use the default executor defined within the orb
    steps:
      - checkout # checkout source code
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Run tests
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

#### b. Deploy the app
{: #deploy-the-app }

In this quickstart guide, we will deploy to [Heroku](https://www.heroku.com/). We can do this using the official Heroku orb by adding a new line into our orb section. The Heroku orb contains a set of prepackaged CircleCI configurations you can use to deploy applications to Heroku. Learn more about the [Heroku orb]({{site.devhub_base_url}}/orbs/orb/circleci/heroku).

```yaml
orbs:
  python: circleci/python@2.0.3
  heroku: circleci/heroku@1.2.6
```

We then need to add a job to our list to take care of the deploy step:

```yaml
jobs:
  # ...previous job(s)...
  deploy: # this can be any name you choose
    executor: heroku/default # use the default executor defined within the orb
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

Environment variables containing the necessary secrets such as `HEROKU_API_KEY` and `HEROKU_APP_NAME` can be set up in the CircleCI web app. Learn more about [environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project).
{ class="alert alert-info" }

### 4. Create a workflow
{: #create-a-workflow }

A workflow is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a set of configuration keys to help you resolve failures sooner. Inside the workflow, you define the jobs you want to run. CircleCI will run this workflow on every commit. Learn more about [workflow configuration]({{ site.baseurl }}/configuration-reference/#workflows).

```yaml
workflows:
  build_test_deploy: # this can be any name you choose
```

### 5. Add jobs to the workflow
{: #add-jobs-to-the-workflow }

Now that we have our workflow, `build_test_deploy`, we can use it to orchestrate the running of our `build_and_test` and `deploy` jobs. Refer to the [Using Workflows to Schedule Jobs]({{site.baseurl}}/workflows/) page for more details about orchestrating jobs with concurrent, sequential, and manual approval workflows.

```yaml
workflows:
  build_test_deploy:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # only deploy if the build_and_test job has completed
          filters:
            branches:
              only: main # only deploy when on main
```

### 6. Conclusion
{: #conclusion }

You just set up a Python app to build on CircleCI. Check out your project’s [pipeline page]({{site.baseurl}}/project-build/#overview) to see how this looks when building on CircleCI.

## Full configuration file
{: #full-configuration-file-new }

```yaml
version: 2.1
orbs:
  python: circleci/python@2.0.3
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test: # this can be any name you choose
    executor: python/default
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Run tests
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # this can be any name you choose
    executor: python/default
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

- [Use test splitting with Python Django tests]({{site.support_base_url}}/hc/en-us/articles/360048786831-Use-test-splitting-with-Python-Django-tests)
- [Testing Flask framework with Pytest]({{site.blog_base_url}}/testing-flask-framework-with-pytest/)
- [How do I use Django on CircleCI?]({{site.support_base_url}}/hc/en-us/articles/115012795327-How-do-I-use-Django-on-CircleCI-)
