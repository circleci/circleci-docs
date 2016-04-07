---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Python
short-title: Python
categories: [languages]
description: Continuous Integration and Continuous Deployment with Python
last_updated: March 12, 2014
---

CircleCI works well for Python projects.
We run automatic inference on each build to determine your dependencies and test commands.
If we don't infer all of your settings, you can also add custom configuration to a
[circle.yml](/docs/configuration) file checked into your repo's root directory.

### Version

When Circle detects Python, we automatically use `virtualenv`
to create an isolated Python environment using Python `{{ site.data.versions.default_python }}`.

We have
[many versions of Python](/docs/environment/#python)
pre-installed. If you don't want to use the default, you can specify your Python version from your circle.yml:

```
machine:
  python:
    version: pypy-2.2.1
```

Please [contact us](mailto:sayhi@circleci.com)
if other versions of Python would be of use to you.

<span class='label label-info'>Note:</span>
Circle will set up `virtualenv` if you specify your Python version in your `circle.yml`.
This can be useful if we didn't automatically detect that you're using Python.

### Package managers and dependencies

Circle automatically installs your dependencies using either `pip`
when we find a `requirements.txt`, or `distutils`
when we find a `setup.py` file.

You can also
[add custom dependencies commands from your `circle.yml`, for example:](/docs/configuration/#dependencies)

```
dependencies:
  pre:
    - pip install PIL --allow-external PIL --allow-unverified PIL```

### Databases

Circle has pre-installed more than a dozen
[databases and queues](/docs/environment/#databases),
including PostgreSQL and MySQL. If needed, you can
[manually set up your test database](/docs/manually/#dependencies)
from your `circle.yml`.

### Testing

CircleCI automatically runs `tox` when we find a `tox.ini` file,
and runs `nosetests` when we find a `unittest.py` file.
If you are using Django, then Circle will run `manage.py test`.
You can [add custom test commands](/docs/configuration/#test)
from your `circle.yml`:

```
test:
  override:
    - ./my_testing_script.sh
```

We can automatically parallelize both standard python tests run with nose and
django tests.  However, the mechanisms to collect the tests only see
class-style tests, not bare-function nose-style tests.

### Deployment

CircleCI has [first-class support for deployment](/docs/configuration/#deployment)
with Fabric or Paver.
To set up deployment after green builds, you can add commands to the deployment section of your `circle.yml`:

```
deployment:
  production:
    branch: master
    commands:
      - fab deploy
```

### Troubleshooting for Python

Problems?
Check out our [Python troubleshooting](/docs/troubleshooting-python)
information:

*   [Git errors during pip install](/docs/git-pip-install)

If you are still having trouble, please [contact us](mailto:sayhi@circleci.com)
and we will be happy to help.
