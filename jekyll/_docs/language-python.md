---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Python
short-title: Python
categories: [languages]
description: Continuous Integration and Continuous Deployment with Python
---

CircleCI works well for Python projects. We run automatic inference on each
build to determine your dependencies and test commands. If we don't infer all
of your settings, you can also add custom configuration to a
[circle.yml]({{ site.baseurl }}/configuration/) file checked into your repo's root directory.

## Version

When Circle detects Python, we automatically use `virtualenv` to create an isolated Python environment.

We have many versions of Python pre-installed on [Ubuntu 12.04]({{ site.baseurl }}/build-image-precise/#python) and [Ubuntu 14.04]({{ site.baseurl }}/build-image-trusty/#python) build images.

If you don't want to use the default, you can specify your version in `circle.yml`:

```
machine:
  python:
    version: pypy-2.2.1
```

If you need to use multiple Python versions simultaneously, you can make them available as follows:

```
machine:
  post:
    - pyenv global 2.7.9 3.4.2
```
These will be available as python2.7 and python3.4

Please [contact us](mailto:support@circleci.com) if other versions of Python
would be of use to you.

<span class='label label-info'>Note:</span>
Circle will set up `virtualenv` if you specify your Python version in your `circle.yml`.
This can be useful if we didn't automatically detect that you're using Python.

## Package managers and dependencies

Circle automatically installs your dependencies using either `pip` when we find
a `requirements.txt`, or `distutils` when we find a `setup.py` file. You can
also [add custom dependencies]({{ site.baseurl }}/configuration/#dependencies) commands from
your `circle.yml`, for example:

```
dependencies:
  pre:
    - pip install PIL --allow-external PIL --allow-unverified PIL
```

## Databases

Circle has pre-installed more than a dozen databases and queues, including PostgreSQL and
MySQL. If needed, you can
[manually set up your test database]({{ site.baseurl }}/manually/#dependencies) from your
`circle.yml`.

## Testing

CircleCI automatically runs test commands when certain files are detected:

- `tox` when `tox.ini` is found
- `nosetest` when `unittest.py` is found
- `manage.py test` when `manage.py` contains a testing section
- `setup.py test` when `setup.py` contains a testing section

Be aware that if you are testing a framework that has generated static assets, i.e. CSS files
that are created using SASS, you will need to trigger their generation. For example, with Django
you can tell `manage.py` to gather up the static assets and prevent "file not found" testing errors:

```
test:
  pre:
    - ./manage.py collectstatic --no-input
```

You can [add custom test commands]({{ site.baseurl }}/configuration/#test) from your `circle.yml`:

```
test:
  override:
    - ./my_testing_script.sh
```

We can automatically parallelize both standard Python tests run with nose and
Django tests. However, the mechanisms to collect the tests only see class-style
tests, not bare-function nose-style tests.

## Deployment

CircleCI has [first-class support for deployment]({{ site.baseurl }}/configuration/#deployment)
with Fabric or Paver. To set up deployment after green builds, you can add
commands to the deployment section of your `circle.yml`:

```
deployment:
  production:
    branch: master
    commands:
      - fab deploy
```

## Troubleshooting for Python

Problems? Check out our [Python troubleshooting]({{ site.baseurl }}/troubleshooting-python/)
information:

* [Git errors during pip install]({{ site.baseurl }}/git-pip-install/)

If you are still having trouble, please [contact us](mailto:support@circleci.com)
and we will be happy to help.
