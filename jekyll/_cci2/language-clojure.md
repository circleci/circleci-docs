---
layout: classic-docs
title: "Language Guide: Clojure"
short-title: "Clojure"
categories: [language-guides]
order: 2
---

## Overview

This guide will help you get started with a Clojure application on CircleCI. If you’re in a rush, just copy the sample configuration below into a `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

We're going to make a few assumptions here:

* You're using `clojure.test` with Leiningen's built-in `test` task. But if you use another testing tool, you can just adjust the last step to run a different `lein` task.
* Your application can be distributed as an all-in-one uberjar.
* You have the [bin/lein shell script](https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein) checked into your project's repository, ensuring everyone is operating with the same version of [Leiningen](https://leiningen.org).

That last one is not a strict requirement, (you can require devs to install it by hand and use a container image that has it preinstalled) but it makes things a bit smoother.

## Sample Configuration

{% raw %}
```YAML
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-clojure
    docker:
      - image: openjdk:8
    environment:
      LEIN_ROOT=nbd
    steps:
      - checkout
      - restore_cache:
          key: {{ checksum "project.clj" }}
      - run: bin/lein deps
      - save_cache:
          paths:
            - $HOME/.m2
            - $HOME/.lein
          key: {{ checksum "project.clj" }}
      - run: bin/lein do test, uberjar
      - store_artifacts:
          path: target/cci-demo-clojure.jar
          destination: uberjar
```
{% endraw %}

## Get the Code

The configuration above is from a demo Clojure app, which you can access at [https://github.com/circleci/cci-demo-clojure](https://github.com/circleci/cci-demo-clojure).

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Then, [add the project]({{ site.baseurl }}/2.0/first-steps/#adding-projects) through CircleCI. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-clojure
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```YAML
version: 2
...
    docker:
      - image: openjdk:8
```

We use the [official OpenJDK images](https://hub.docker.com/_/openjdk/) tagged to version `8`.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed `project.clj`, this won't do anything. We run `bin/lein deps` next to pull down the project's dependencies. Normally you never call this task directly since it's done automatically when it's needed, but calling it directly allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

Then `bin/lein do test, uberjar` runs the actual tests, and if they succeed, it creates an "uberjar" file containing the application source along with all its dependencies.

Finally we store the uberjar as an [artifact](https://circleci.com/docs/1.0/build-artifacts/) using the `store_artifacts` step. From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```YAML
...
    steps:
      - checkout
      - restore_cache:
          key: {{ checksum "project.clj" }}
      - run: bin/lein deps
      - save_cache:
          paths:
            - $HOME/.m2
            - $HOME/.lein
          key: {{ checksum "project.clj" }}
      - run: bin/lein do test, uberjar
      - store_artifacts:
          path: target/cci-demo-clojure.jar
          destination: uberjar
```
{% endraw %}

Nice! You just set up CircleCI for a Clojure app.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
