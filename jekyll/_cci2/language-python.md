---
layout: classic-docs
title: "Configuring a Python Application on CircleCI"
short-title: "Python"
description: "Continuous integration with Python on CircleCI"
categories: [language-guides]
order: 7
---

This document describes how to configure CircleCI using a sample application
written in Python.

* TOC {:toc}

## Overview

This guide uses a sample Django application to describe configuration best
practices for Python applications building on CircleCI. The application is
[hosted on GitHub](https://github.com/CircleCI-Public/my-first-blog/blob/master/.circleci/config.yml) and is
[building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}.

Consider [forking the repository](https://help.github.com/articles/fork-a-repo/)
and rewriting [the configuration file](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml)
as you follow this guide.

## Configuration Walkthrough

The sample codeblock below, which is also found in the sample app [repository](https://github.com/CircleCI-Public/my-first-blog/blob/master/.circleci/config.yml), is commented to provide a walkthrough of each piece of configuration.


```yaml
# Specify which configuration version we want to use
# 2.1 enables using pipelines and orbs, among other features.
version: 2.1 

# Here we are declaring the orbs that are configuration will use.
# The python orb makes it easier to get started with a Python project;
# it includes common steps for caching, testing, and more.
# You can learn more here: https://circleci.com/orbs/registry/orb/circleci/python
orbs:
  python: circleci/python@0.2.1


# Declare the jobs we want to run
jobs:
  # we have only one job, named "build-and-test"
  build-and-test:
    # using the python orb, we can can set a "default" executor
    # this can be customized, if you want to specify which version of the language
    # used, for example. Refer to the python orb documentation linked above.
    executor: python/default
    
    # Steps run a series of commands.
    steps:
      - checkout              # pull down code from our VCS repo.
      - python/load-cache     # load the cache, if it exists.
      - python/install-deps   # install our dependencies
      - python/save-cache     # save our dependency cache, if necessary
      - run:                  # run a custom command
          name: Test
          command: ./manage.py test 

# Workflows are used to orchestrate jobs.
# We are only running one job; we aren't using the full power of workflows.
# Read more about workflows here: https://circleci.com/docs/2.0/workflows/
workflows:
  main:                       # "main" is the name of our workflow.
    jobs:                     # the job(s) to run
      - build-and-test        # runs the job.
```

## Customization beyond Orbs

You can always add extra customization beyond orbs. Use the `run` step to
execute bash commands. In the orb, we use the official default Python executor
that provides many tools needed for your environment. If you need to add other
tools, you may do so. In the following example Pipenv is used to create a
virtual environment and install Python packages.

```yaml
version: 2.1
jobs:
  build:
    # ...
    steps:
      - checkout  # checkout source code to working directory
      - run:
          command: |  # use pipenv to install dependencies
            sudo pip install pipenv
            pipenv install
```

## See Also

- See the [Tutorials page]({{ site.baseurl }}/2.0/tutorials/) for other language guides.
- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.
- Further refine and improve your configuration by learning about:
  - Storing [artifacts]({{ site.baseurl }}/2.0/artifacts/) and [test results]({{site.baseurl}}/2.0/collect-test-data/)
  - Using [workflows]({{ site.baseurl }}/2.0/workflows/)
  
