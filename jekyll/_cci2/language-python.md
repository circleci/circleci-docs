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
[hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-python-django) and is
[building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}.

Consider [forking the repository](https://help.github.com/articles/fork-a-repo/)
and rewriting [the configuration file](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml)
as you follow this guide.

## Configuration Walkthrough

Let's walk through each piece of configuration for a Python application. At any
time, feel free to consult the complete configuration, as it available in the
[sample application repository](https://github.com/CircleCI-Public/my-first-blog/blob/master/.circleci/config.yml). Every CircleCI project requires a configuration
file called [`.circleci/config.yml`]({{ site.baseurl
}}/2.0/configuration-reference/). Follow the steps below to create a complete
`config.yml` file.

### Specify a Version

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used
to issue warnings about breaking changes.

```yaml
version: 2.1
```


### Add the Python Orb and Create a Workflow

In a `2.1` configuration, the certified [Python Orb](https://circleci.com/orbs/registry/orb/circleci/python) 
provides simple commands that will allow you to set up a simple workflow for
your Python project, such as:

- loading your cache 
- installing dependencies
- saving your cache. 

For these steps, the Python Orb also provides a default python executor
docker image environment that you can define in an executor key at the top of
your job definition. This default python executor pulls from the officially
maintained [CircleCI images](https://hub.docker.com/r/cimg/python) and provides 
a highly available container environment with a lean set of tools you
can then utilize in your workflow.

Let's look at how you would define a job:

```yaml
jobs:
  build-and-test: # our job name.
    executor: python/default # use the default python executor; this can be customized.
    steps:
      - checkout # pull source code into the container.
      - python/load-cache  # load from the python cache, if it exists
      - python/install-deps # install dependencies if necessary
      - python/save-cache # Save dependency cache.
      - run: 
          command: ./manage.py test
          name: Test
```

Learn more about customizing your use of the Python Orb on the [orb
registry](https://circleci.com/orbs/registry/orb/circleci/python).

In the above example, we exercise [caching]({{site.baseurl}}/2.0/caching/) to speed up our build.

Next up, we set up our workflows.

```yaml
workflows:
  main: # our workflow name
    jobs: # the jobs this workflow runs.
      - build-and-test
```

If our application had multiple jobs, they would be orchestrated in the above Workflow yaml block. 

## Customization beyond Orbs

You can always add extra customization beyond orbs. Use the `run` step to execute
bash commands. In the orb, we use the official default Python executor that
provides many tools needed for your environment. If you need to add other tools,
check out this example - Pipenv is used to create a virtual environment and
install Python packages.

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
  
