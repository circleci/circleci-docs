---
layout: classic-docs
title: "2.0 Project Tutorial"
short-title: "Project Tutorial"
description: "Tutorial and sample config for a Flask project in CircleCI 2.0"
categories: [migration]
order: 3
---

* Contents
{:toc}


The demo application in this tutorial uses Python and Flask for the backend. PostgreSQL is used for the database. The source for the demo application is at [cci-demo-walkthrough](https://github.com/circleci/cci-demo-walkthrough).

The following sections walk through how Jobs and Steps are configured for this application, how to run unit tests and integration tests with Selenium and Chrome in the CircleCI environment, and how to deploy the demo application to Heroku.

## Basic Setup 

The `.circleci/config.yml` is comprised of several Jobs for this application. In turn, a job is comprised of several Steps, which are commands that execute in the container that is defined in the first `image:` key in the file. This first image is also referred to as the *primary container*.

Following is a minimal example for our demo project with all configuration nested in the `build` job:

```
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

**Note:** Every `config.yml` file must have a job named `build` that includes the following:


- Working directory where commands will be executed.
- Executor of the underlying technology, defined as `docker` in this example.
- Image is a public Docker image for Python 3.6.0 in this demo. 
- Steps starting with a required `checkout` Step and followed by `run:` keys that execute commands sequentially on the primary container.


## Installing Dependencies

Next, the file defines required dependencies in the `environment` key for each Image and in the run Step as follows:

```
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.6.2
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
      - image: selenium/standalone-chrome:3.1.0
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

These variables define the following new dependencies:

- Testing and connecting to the PostgreSQL 9.6.2 database container, using a public Docker image.
- Three environment variables to make a test database available for the application.
- The `selenium/standalone-chrome:3.1.0` image to run tests using Selenium on Chrome.
- An environment variable defined in a `run:` key that overrides the image-level variable.

## Caching Dependencies

To speed up the builds, the demo configuration defines `restore_cache`, a virtual environment for storing the pip dependencies, and `save_cache`:

```
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.6.2
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
      - image: selenium/standalone-chrome:3.1.0
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
    steps:
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
```

The following describes the detail of the added key values:

- The `restore_cache:` key is named `deps1` and it restores the cache on the current branch by using `{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}`. Then, CircleCI restores a new cache if the checksum for the requirements file changes by using `{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}`.

- The `run:` key creates and activates a virtual environment in which to install the Python dependencies.

- The `save_cache:` key is named `deps1` and it saves the project cache on the current branch by using `{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}`. Then, CircleCI saves a new cache if the checksum for the requirements file changes by using `{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}`. Finally, the path that is to be to cached is specified as `venv`.


## Running Tests

In the demo application, tests run in the virtual Python environment through a new `run:` key. Then, the reports and results are stored by using `store_artifacts` and `store_test_results`.

```
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.6.2
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
      - image: selenium/standalone-chrome:3.1.0
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
      - store_test_results:
          path: test-reports/
```

Notes on the added keys:

- Each command runs in a new shell, so the virtual environment that was activated in the dependencies installation step is activated again in this final `run:` key with `. venv/bin/activate`. 
- The `store_artifacts` step is a special step. The `path:` is a directory relative to the project’s `root` directory where the files are stored. The `destination:` specifies a prefix chosen to be unique in the event that another step in the job produces artifacts in a directory with the same name. CircleCI collects and uploads the artifacts to S3 for storage.
- When the build completes, artifacts appear in the CircleCI Artifacts tab:

![Artifacts on CircleCI]({{ site.baseurl }}/assets/img/docs/walkthrough3.png)

- The path for the results files is relative to the `root` directory of the project. The demo application uses the same directory used to store artifacts, but this is not required. When the build completes, CircleCI analyzes the test timings and summarizes them on the Test Summary tab:

![Test Result Summary]({{ site.baseurl }}/assets/img/docs/walkthrough4.png)

## Deploying to Heroku

<div class="alert alert-info" role="alert">
<p><strong>Note:</strong> CircleCI 2.0 does not yet support seamlessly integrated Heroku and AWS deployments. Keys and configuration added to the Heroku Deployment and AWS CodeDeploy pages in CircleCI are currently not available to 2.0 jobs.</p>
</div>

The demo `.circleci/config.yml` includes `run:`, `add_ssh_keys:`, `fingerprints:` and `deploy:` keys to automatically deploy when a build on `master` passes all tests:

```
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.6.2
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
      - image: selenium/standalone-chrome:3.1.0
    steps:
      - checkout
      - restore_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
      - save_cache:
          key: deps1-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
      - store_test_results:
          path: test-reports/
      - run: bash .circleci/setup-heroku.sh
      - add_ssh_keys:
          fingerprints:
            - "48:a0:87:54:ca:75:32:12:c6:9e:a2:77:a4:7a:08:a4"
      - deploy:
          name: Deploy Master to Heroku
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              git push heroku master
              heroku run python manage.py deploy
              heroku restart
            fi
```

Notes on the added keys:

- The new `run:` executes the `setup-heroku.sh` script.
- The `add_ssh_keys:` adds an installed SSH key with a unique fingerprint.
- The `deploy` section is a special section that runs deployment commands. It checks if it is on `master` using the `${CIRCLE_BRANCH}` environment variable. If it is, it runs the Heroku deployment commands in the following Appendix section.

Woo woo! The app will now update on Heroku with every successful build on the master branch. Here's the first passing build with deployment for the demo app: <https://circleci.com/gh/circleci/cci-demo-walkthrough/6>

## Appendix

This section describes manual setup for deployment of the demo application to Heroku on CircleCI 2.0.

The demo application is configured to run on Heroku with `config.py` and `manage.py`. These two files tell the app to use production settings, run migrations for the PostgreSQL database, and use SSL when on Heroku.

Other files required by Heroku are:

- `Procfile`: Tells Heroku how to run the demo app
- `runtime.txt`: Tells Heroku to use Python 3.6.0 instead of the default (2.7.13)
- `requirements.txt`: When this is present, Heroku will automatically install the Python dependencies

**Consult the [Heroku documentation](https://devcenter.heroku.com/start) to configure your own app for their environment.**

The following commands would be used to manually build the app on Heroku for this demo before actual deployment.

```
heroku create cci-demo-walkthrough
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set FLASK_CONFIG=heroku
git push heroku master
heroku run python manage.py deploy
heroku restart
```

The example app is available here: <https://cci-demo-walkthrough.herokuapp.com/>

Deployment with CircleCI 2.0 requires installation and authorization of Heroku for the CircleCI account that owns the demo application project. Then, environment variables for the Heroku API key and login email must be added to the CircleCI UI:

![Add Environment Variables]({{ site.baseurl }}/assets/img/docs/walkthrough5.png)

Creation of a new SSH key, without a passphrase, enables connecting to the Heroku Git server from CircleCI. The private key is added through the CircleCI UI SSH Permissions page with a hostname of `git.heroku.com` as follows:

![Add SSH Key]({{ site.baseurl }}/assets/img/docs/walkthrough6.png)

The private key is pasted into the input as shown above. A note is made of the Fingerprint for the private key for later reference. The public key is added to Heroku on the <https://dashboard.heroku.com/account> screen.

The `setup-heroku.sh` file in the `.circleci` folder includes the following:

```
#!/bin/bash
  git remote add heroku https://git.heroku.com/cci-demo-walkthrough.git
  wget https://cli-assets.heroku.com/branches/stable/heroku-linux-amd64.tar.gz
  mkdir -p /usr/local/lib /usr/local/bin
  tar -xvzf heroku-linux-amd64.tar.gz -C /usr/local/lib
  ln -s /usr/local/lib/heroku/bin/heroku /usr/local/bin/heroku

  cat > ~/.netrc << EOF
  machine api.heroku.com
    login $HEROKU_LOGIN
    password $HEROKU_API_KEY
  machine git.heroku.com
    login $HEROKU_LOGIN
    password $HEROKU_API_KEY
  EOF

  # Add heroku.com to the list of known hosts
  ssh-keyscan -H heroku.com >> ~/.ssh/known_hosts
```

This file runs on CircleCI and configures everything Heroku needs to deploy the app. The second part creates a `.netrc` file and populates it with the API key and login details set previously.


