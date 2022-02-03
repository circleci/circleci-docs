---
layout: classic-docs
title: "Configuring a Python Application on CircleCI"
short-title: "Python"
description: "Continuous integration with Python on CircleCI"
categories: [language-guides]
order: 7
version:
- Cloud
- Server v3.x
- Server v2.x
---

{% raw %}
This document describes
how to configure CircleCI
using a sample application written in Python.
{% endraw %}

{% include snippets/language-guided-tour-cards.md lang="Python" demo_url_slug="python" demo_branch="main" guide_completion_time="15" sample_completion_time="10" %}

## Overview
{: #overview-new }

This guide uses a sample Django application
to describe configuration best practices
for Python applications building on CircleCI.
The application is [hosted on GitHub]({{site.gh_public_org_url}}/circleci-demo-python-django)
and is [building on CircleCI]({{site.cci_public_org_url}}/circleci-demo-python-django){:rel="nofollow"}.

Consider [forking the repository]({{site.gh_help_articles_url}}/fork-a-repo/)
and rewriting [the configuration file]({{site.gh_public_org_url}}/circleci-demo-python-django/blob/master/.circleci/config.yml)
as you follow this guide.

## Configuration Walkthrough
{: #configuration-walkthrough-new }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

### 1. Specify a version
{: #specify-a-version-new }

Every config.yml starts with the version key. This key is used to issue warnings about breaking changes.
```yaml
version: 2.1
```

`2.1` is the latest CircleCI version, and it ensures you have access to all our latest features and improvements.

### 2. Use the Python orb
{: #use-the-python-orb }

The Python [orb]({{site.devhub_base_url}}/orbs/orb/circleci/python) contains a set of prepackaged CircleCI configurations you can use to do common CircleCI tasks for the Python programming language. It supports Linux x86_64, macOS x86_64, and Arm64. Learn more about [orbs]({{site.baseurl}}/2.0/orb-intro/).

To add the orb to your config, insert:
```yaml
orbs:
  python: circleci/python@1.5.0
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

A traditional ask from developers who are getting started with CircleCI is to perform 3 basic tasks: `build`, `test` and `deploy`. This section will guide you through each of the config changes needed. Because we are using the official Python orb, these steps can easily be accomplished:

#### a. Build and test the app
{: #build-and-test-the-app }

For this step, we are using the `python/install-packages` command that comes from the Python [orb]({{site.devhub_base_url}}/orbs/orb/circleci/python). This command automatically sets up a python environment and installs the packages for your project either globally with `pip` or in a `virtualenv` with `poetry` or `pipenv`.
```yaml
jobs:
  build_and_test: # this can be any name you choose
    docker:
      - image: cimg/python:3.10.1
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
```

#### b. Deploy the app
{: #deploy-the-app }

In this example, we are choosing to deploy to Heroku. This can be done using the official Heroku orb by adding a new line into our orb section. The Heroku orb contains a set of prepackaged CircleCI configurations you can use to deploy applications to Heroku. Learn more about the [Heroku orb]({{site.devhub_base_url}}/orbs/orb/circleci/heroku).

```yaml
orbs:
  python: circleci/python@1.5.0
  heroku: circleci/heroku@1.2.6
```

We then need to add a job to our list to take care of the deploy step:

```yaml
jobs:
  # ...previous job(s)...
  deploy: # this can be any name you choose
    docker:
      - image: cimg/python:3.10.1
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

### 5. Conclusion
{: #conclusion }

Success! You just set up a Python app to build on CircleCI. Check out your project’s [pipeline page]({{site.baseurl}}/2.0/project-build/#overview) to see how this looks when building on CircleCI.

## Full configuration file
{: #full-configuration-file-new }

```yaml
version: 2.1
orbs:
  python: circleci/python@1.5.0
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test: # this can be any name you choose
    docker:
      - image: cimg/python:3.10.1
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
    docker:
      - image: cimg/python:3.10.1
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
