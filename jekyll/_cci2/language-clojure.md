---
layout: classic-docs
title: "Language Guide: Clojure"
short-title: "Clojure"
description: "Building and Testing with Clojure on CircleCI 2.0"
categories: [language-guides]
order: 2
---

This guide will help you get started with a Clojure application on CircleCI 2.0. If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

* TOC
{:toc}

## Overview
{:.no_toc}

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

We're going to make a few assumptions here:

* You're using `clojure.test` with Leiningen's built-in `test` task.
* Your application can be distributed as an all-in-one uberjar.

If you use another testing tool, you can just adjust that step to run a different `lein` task.

## Sample Configuration

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    working_directory: ~/cci-demo-clojure # directory where steps will run
    docker: # run the steps with Docker
      - image: circleci/clojure:lein-2.7.1 # ...with this image as the primary container; this is where all `steps` will run
    environment: # environment variables for primary container
      LEIN_ROOT: nbd
      JVM_OPTS: -Xmx3200m # limit the maximum heap size to prevent out of memory errors
    steps: # commands that comprise the `build` job
      - checkout # check out source code to working directory
      - restore_cache: # restores saved cache if checksum hasn't changed since the last run
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache: # generate and store cache in the .m2 directory using a key template
          paths:
            - ~/.m2
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: target/uberjar/cci-demo-clojure.jar
          destination: uberjar
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples     
```

{% endraw %}

## Get the Code

The configuration above is from a demo Clojure app, which you can access at [https://github.com/CircleCI-Public/circleci-demo-clojure-luminus](https://github.com/CircleCI-Public/circleci-demo-clojure-luminus).

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-clojure
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```yaml
version: 2
...
    docker:
      - image: circleci/clojure:lein-2.7.1
```

We use the [CircleCI-provided Clojure image](https://circleci.com/docs/2.0/circleci-images/#clojure) with the `lein-2.7.1` tag.

We set `JVM_OPTS` here in order to limit the maximum heap size; otherwise we'll run into out of memory errors. The standard container limit is 4 GB, but we leave some extra room for Leiningen itself as well as things the JVM keeps outside the heap. (You can avoid the Leiningen overhead by using `lein trampoline ...` in some cases.) If you have background containers for your database or queue, for example, consider those containers when you allocate memory for the main JVM heap.

Normally Leiningen expects to be run as a non-root user and will assume you're running as root by accident. We set the `LEIN_ROOT` environment variable to indicate that it's intentional in this case. 

```yaml
    environment:
      JVM_OPTS: -Xmx3200m
      LEIN_ROOT: nbd
```

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed `project.clj`, this won't do anything. We run `lein deps` next to pull down the project's dependencies. Normally you never call this task directly since it's done automatically when it's needed, but calling it directly allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

Then `lein do test, uberjar` runs the actual tests, and if they succeed, it creates an "uberjar" file containing the application source along with all its dependencies.

Finally we store the uberjar as an [artifact](https://circleci.com/docs/1.0/build-artifacts/) using the `store_artifacts` step. From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```yaml
...
    steps:
      - checkout
      - restore_cache:
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache:
          paths:
            - ~/.m2
            - ~/.lein
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts:
          path: target/cci-demo-clojure.jar
          destination: uberjar
```
{% endraw %}

Nice! You just set up CircleCI for a Clojure app.

## See Also
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.

### Detailed Examples
{:.no_toc}

The app described in this guide illustrates the simplest possible setup for a Clojure web app. Real-world projects tend to be more complex, so you may find this more detailed example useful as you configure your own projects:

* [Syme](https://github.com/technomancy/syme/blob/master/.circleci/config.yml), a site which configures disposable virtual machines for remote collaboration (uses PostgreSQL, continuously deployed to Heroku)

