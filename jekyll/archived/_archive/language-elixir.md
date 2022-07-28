---
layout: classic-docs
title: "Language Guide: Elixir"
short-title: "Elixir"
description: "Overview and sample config for an Elixir project"
categories: [language-guides]
order: 2
version:
- Cloud
- Server v3.x
- Server v2.x
---

This is an annotated `config.yml` for a simple Phoenix web application, which you can access at <https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix>.

If you're in a rush, just copy the configuration below into [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project's root directory. Otherwise, we recommend reading through the whole configuration for better understanding.

## Sample configuration
{: #sample-configuration }

{:.tab.switch_one.Cloud}
{% raw %}

```yaml
version: 2.1 

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: {{site.baseurl}}/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: {{site.baseurl}}/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

{:.tab.switch_one.Server_3}
{% raw %}

```yaml
version: 2.1 

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: https://circleci.com/docs/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

{:.tab.switch_one.Server_2}
{% raw %}

```yaml
version: 2

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: https://circleci.com/docs/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

## Config walkthrough
{: #config-walkthrough }

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2.1
```

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs).
Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows),
it must have a `build` job.

Use the [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key
to specify where a job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run.
By default, the value of `working_directory` is `~/project`, where `project` is a literal string.

The steps of a job occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-intro/).

In this example, the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used
to specify a custom Docker image. We use the [CircleCI-provided Elixir docker image]({{site.baseurl}}/2.0/circleci-images/#elixir).

```yaml
jobs:
  build:
    parallelism: 1
    docker:
      - image: cimg/elixir:1.7.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MIX_ENV: test
      - image: cimg/postgres:10.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app
```


After choosing containers for a job, create [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) to run specific commands.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
to check out source code. By default, source code is checked out to the path specified by `working_directory`.

Use the [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) step
to execute commands. In this example, [mix](https://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html) is used
to install Elixir tooling.

```yaml
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar --force
```

To save time between runs,
consider [caching dependencies or source code]({{ site.baseurl }}/2.0/caching/).

Use the [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) step
to cache certain files or directories. In this example, the virtual environment and installed packages are cached.

Use the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) step
to restore cached files or directories.

{% raw %}
```yaml
      - restore_cache:
          keys:
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile
      - save_cache:
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
```
{% endraw %}

Finally, we wait for the database to come online so that we can run the test
suite. Following running the tests, we upload our test results to be made
available in the CircleCI web app.

```yaml
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run: mix test
      - store_test_results:
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME
```

## Parallelism
{: #parallelism }

**Splitting by Timings**

As of version 2.0, CircleCI requires users to upload their own JUnit XML [test output]({{site.baseurl}}/2.0/collect-test-data/#enabling-formatters). Currently the main/only Elixir library that produces that output is [JUnitFormatter](https://github.com/victorolinasc/junit-formatter).

In order to allow CircleCI's parallelization to use the `--split-by=timings` strategy with the XML output, you need to configure JUnitFormatter with the `include_filename?: true` option which will add the filename to the XML.

By default, JUnitFormatter saves the output to the `_build/test/lib/<application name>` directory, so in your `.circleci/config.yml` you will want to configure the `store_test_results` step to point to that same directory:

```yml 
  - store_test_results:
      path: _build/test/lib/<application name>
```

However, JUnitFormatter also allows you to configure the directory where the results are saved via the `report_dir` setting, in which case, the `path` value in your CircleCI config should match the relative path of wherever you're storing the output.

## See also
{: #see-also }

[Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
[Configuring Databases]({{ site.baseurl }}/2.0/databases/)
