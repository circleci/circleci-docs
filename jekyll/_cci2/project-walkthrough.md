---
layout: classic-docs
title: "2.0 Project Tutorial"
short-title: "Project Tutorial"
description: "Tutorial and sample config for a Flask project in CircleCI 2.0"
categories: [migration]
order: 3
---

*[Tutorials & 2.0 Demo Apps]({{ site.baseurl }}/2.0/tutorials/) > 2.0 Project Tutorial*

The demo application in this tutorial uses Python and Flask for the backend. PostgreSQL is used for the database. The source for the demo application is available on GitHub: <https://github.com/CircleCI-Public/circleci-demo-python-flask>

* Contents
{:toc}

The following sections walk through how Jobs and Steps are configured for this application, how to run unit tests and integration tests with Selenium and Chrome in the CircleCI environment, and how to deploy the demo application to Heroku.

## Basic Setup 

The `.circleci/config.yml` file may be comprised of several Jobs. In this example we have one Job called `build`. In turn, a job is comprised of several Steps, which are commands that execute in the container that is defined in the first `image:` key in the file. This first image is also referred to as the *primary container*.

Following is a minimal example for our demo project with all configuration nested in the `build` job:

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
    steps:
      - checkout
      - run: pip install -r requirements/dev.txt
```

**Note:** Every `.circleci/config.yml` file must have a job named `build` that includes the following:

- Executor of the underlying technology, defined as `docker` in this example.
- Image is a Docker image - in this example containing Python 3.6.2 on Debian Stretch provided by CircleCI with web browsers installed to help with testing. 
- Steps starting with a required `checkout` Step and followed by `run:` keys that execute commands sequentially on the primary container.

## Service containers

If the job requires services such as databases they can be run as additional containers by listing more `image:`s in the `docker:` stanza.

Docker images are typically configured using environment variables, if these are necessary a set of environment variables to be passed to the container can be supplied:

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

The environment variables for the *primary container* set some config specific to the Flask framework and set a database URL that references a database run in the `circleci/postgres:9.6.5-alpine-ram` service container. Note that the PostgreSQL database is available at `localhost`.

The `circleci/postgres:9.6.5-alpine-ram` service container is configured with a user called `root` with an empty password, and a database called `circle_test`.

## Installing Dependencies

Next the job installs Python dependencies into the *primary container* by running `pip install`. Depedencies are installed into the *primary container* by running regular Steps executing shell commands:

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run:
          name: Install Python deps in a venv
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements/dev.txt
```

An environment variable defined in a `run:` key will override image-level variables, e.g.:

```
      - run:
          command: echo ${FLASK_CONFIG}
          environment:
            FLASK_CONFIG: staging
```

## Caching Dependencies

To speed up the builds, the demo configuration places the Python virtualenv into the CircleCI cache and restores that cache before running `pip install`. If the virtualenv was cached the `pip install` command will not need to download any dependencies into the virtualenv because they are already present. Saving the virtualenv into the cache is done using the `save_cache` step which runs after the `pip install` command.

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
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
```

The following describes the detail of the added key values:

- The `restore_cache:` step searches for a cache with a key that matches the key template. The template begins with `deps1-` and embeds the current branch name using `{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}`. The checksum for the `requirements.txt` file is also embedded into the key template using `{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}`. CircleCI restores the most recent cache that matches the template, in this case the branch the cache was saved on and the checksum of the `requirements/dev.txt` file used to create the cached virtualenv must match.

- The `run:` step named `Install Python deps in a venv` creates and activates a virtual environment in which to install the Python dependencies, as before.

- The `save_cache:` step creates a cache from the specified paths, in this case `venv`. The cache key is created from the template specified by the `key:`. Note that it is important to use the same template as the `restore_cache:` step so that CircleCI saves a cache that can be found by the `restore_cache:` step. Before saving the cache CircleCI generates the cache key from the template, if a cache that matches the generated key already exists then CircleCI does not save a new cache. Since the template contains the branch name and the checksum of `requirements/dev.txt`, CircleCI will create a new cache whenever the job runs on a different branch, and/or if the checksum of `requirements/dev.txt` changes.

## Install and run Selenium to automate browser testing

The demo application contains a file `tests/test_selenium.py` that uses Chrome, Selenium and webdriver to automate testing the application in a web browser. The primary image has the current stable version of Chrome pre-installed (this is designated by the `-browsers` suffix). Selenium needs to be installed and run since this is not included in the primary image:

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

## Running Tests

In the demo application, tests run in the virtual Python environment through a new `run:` key. Then, the reports and results are stored by using `store_artifacts` and `store_test_results`.

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
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

![Artifacts on CircleCI]({{ site.baseurl }}/assets/img/docs/walkthrough7.png)

- The path for the results files is relative to the `root` directory of the project. The demo application uses the same directory used to store artifacts, but this is not required. When the build completes, CircleCI analyzes the test timings and summarizes them on the Test Summary tab:

![Test Result Summary]({{ site.baseurl }}/assets/img/docs/walkthrough8.png)

## Deploying to Heroku

<div class="alert alert-info" role="alert">
<p><strong>Note:</strong> CircleCI 2.0 does not yet support seamlessly integrated Heroku and AWS deployments. Keys and configuration added to the Heroku Deployment and AWS CodeDeploy pages in CircleCI are currently not available to 2.0 jobs.</p>
</div>

The demo `.circleci/config.yml` includes `run:`, `add_ssh_keys:`, `fingerprints:` and `deploy:` keys to automatically deploy when a build on `master` passes all tests:

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.5-alpine-ram
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
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

The app will now update on Heroku with every successful build on the master branch. Here's a passing build with deployment for the demo app: <https://circleci.com/gh/CircleCI-Public/circleci-demo-python-flask/23>

## Additional configuration for Heroku

The demo application is configured to run on Heroku with settings provided `config.py` and `manage.py`. These two files tell the app to use production settings, run migrations for the PostgreSQL database, and use SSL when on Heroku.

Other files required by Heroku are:

- `Procfile`: Tells Heroku how to run the demo app
- `runtime.txt`: Tells Heroku to use Python 3.6.0 instead of the default (2.7.13)
- `requirements.txt`: When this is present, Heroku will automatically install the Python dependencies

**Consult the [Heroku documentation](https://devcenter.heroku.com/start) to configure your own app for their environment.**

The following commands would be used to manually build the app on Heroku for this demo before actual deployment.

```
heroku create circleci-demo-python-flask # change this to a unique name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set FLASK_CONFIG=heroku
git push heroku master
heroku run python manage.py deploy
heroku restart
```

The example app is available here: <https://circleci-demo-python-flask.herokuapp.com/>

Deployment with CircleCI 2.0 requires installation and authorization of Heroku for the CircleCI account that owns the demo application project. Then, environment variables for your Heroku API key and login email must be added to the CircleCI UI:

![Add Environment Variables]({{ site.baseurl }}/assets/img/docs/walkthrough9.png)

Creation of a new SSH key, without a passphrase, enables connecting to the Heroku Git server from CircleCI. The private key is added through the CircleCI UI SSH Permissions page with a hostname of `git.heroku.com` as follows:

![Add SSH Key]({{ site.baseurl }}/assets/img/docs/walkthrough10.png)

The private key is pasted into the input as shown above. A note is made of the Fingerprint for the private key for later reference. The public key is added to Heroku on the <https://dashboard.heroku.com/account> screen.

The `setup-heroku.sh` file in the `.circleci` folder includes the following:

```
#!/bin/bash
  git remote add heroku https://git.heroku.com/circleci-demo-python-flask.git
  wget https://cli-assets.heroku.com/branches/stable/heroku-linux-amd64.tar.gz
  sudo mkdir -p /usr/local/lib /usr/local/bin
  sudo tar -xvzf heroku-linux-amd64.tar.gz -C /usr/local/lib
  sudo ln -s /usr/local/lib/heroku/bin/heroku /usr/local/bin/heroku

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

This file runs on CircleCI and configures everything Heroku needs to deploy the app. `sudo` is required because commands are run by the `ubuntu` user by default in the primary container provided by CircleCI. ¦¦The second part creates a `.netrc` file and populates it with the API key and login details set previously.

**Note:** If you fork this demo project so you can try it out for yourself, make sure to rename the Heroku project setting so that it can deploy to Heroku without clashing with the namespace used in this tutorial.
