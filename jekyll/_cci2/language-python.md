---
layout: classic-docs2
title: "Language Guide: Python"
short-title: "Python"
categories: [languages-and-tools]
order: 4
---

This guide should help get you started with a Python project on CircleCI 2.0. This walkthrough will be pretty thorough and will explain why we need each piece of configuration. If you're just looking for a sample `config.yml` file, then just skip to the end.

If you want to follow along, fork our [example Flask app](https://github.com/circleci/cci-demo-flask) and add the project through CircleCI. Once you’ve done that, create an empty `.circleci/config.yml` in your project’s root.

Enough talk, let's get started!

---

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

We also need to specify container images for this build in `docker`.

We'll need to tell the Flask app to run in `testing` mode by setting it in `environment`, as well as where to find the database (DB). This is a special local URL linked to an additional Docker container.

```yaml
jobs:
  build:
    docker:
      - image: python:3.5
        environment:
          FLASK_CONFIG: testing
          DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
```

We'll also create a container for PostgreSQL, along with 3 environment variables for initializing the database.

```yaml
      - image: postgres:9.5.5
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

Now we need to add several `steps` within the `build` job.

You could install NPM, but we’re going to use Yarn for reasons that are outside the scope of this document.

```yaml
...
    steps:
      - checkout
      - run:
          name: Install Yarn
          command: |
            apt-key adv --fetch-keys http://dl.yarnpkg.com/debian/pubkey.gpg
            echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
            apt-get update -qq
            apt-get install -y -qq yarn
```

Let's restore the Yarn package cache if it's available.

{% raw %}
```yaml
      - restore_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
```
{% endraw %}

Install both Yarn and Python dependencies.

```yaml
      - run:
          name: Install Dependencies
          command: yarn && pip install -r requirements.txt
```

Specify where to save that Yarn cache.

{% raw %}
```yaml
      - save_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
          paths:
            - "/home/ubuntu/.yarn-cache"
```
{% endraw %}

Run our tests.

```yaml
      - run
          name: Run Tests
          command: python manage.py test --coverage
```

Store test results as an artifact.

```yaml
      - store_artifacts:
          path: test-reports/coverage
```

Finally, let's specify where those test results are actually located.

```yaml
      - store_test_results:
          path: "test-reports/"
```

And we're done! Let's see what the whole `circle.yml` looks like now:

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.5
        environment:
          FLASK_CONFIG: testing
          DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.5.5
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    working_directory: /home/ubuntu/cci-demo-flask
    steps:
      - checkout
      - run:
          name: Install Yarn
          command: |
            apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68576280 86E50310
            echo "deb http://deb.nodesource.com/node_7.x jessie main" | tee /etc/apt/sources.list.d/nodesource.list
            echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
            apt-get update -qq
            apt-get install -y -qq nodejs yarn
      - restore_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn && pip install -r requirements.txt
      - save_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
          paths:
            - "/home/ubuntu/.yarn-cache"
      - run:
          name: Run Tests
          command: python manage.py test --coverage
      - store_artifacts:
          path: test-reports/coverage
          destination: reports
      - store_test_results:
          path: "test-reports/"
```
{% endraw %}

Nice! You just set up CircleCI for a Flask app. Check out our project’s corresponding build on CircleCI [here](https://circleci.com/gh/circleci/cci-demo-flask).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
