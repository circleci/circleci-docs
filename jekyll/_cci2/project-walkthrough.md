---
layout: classic-docs
title: "Project Walkthrough"
short-title: "Project Walkthrough"
categories: [getting-started]
order: 25
---

## Introduction

This tutorial will show you how to build, test, and deploy a web application using CircleCI. Whether you're new to the platform or a long-time user, we think you'll find the information here helpful.

If you're a mobile developer, please note that CircleCI 2.0 doesn’t yet support building iOS/Android apps. Until then, please refer to our documentation for [mobile on 1.0](https://circleci.com/docs/1.0/mobile/).

## The Demo App - 'Circulate'

'Circulate' is a 'social blogging' Twitter-like web application based on Miguel Grinberg's excellent [Flasky](https://github.com/miguelgrinberg/flasky) application. Users can create accounts, make posts, follow users and comment on posts. You can *circulate* your thoughts and ideas :-)

![Circulate demo app screenshot]({{ site.baseurl }}/assets/img/docs/walkthrough0.png)

The source for the application is here: [cci-demo-walkthrough](https://github.com/circleci/cci-demo-walkthrough).

### The Stack

While the application uses Python and Flask for the backend, concepts for building on CircleCI are the same for Ruby / Rails, JavaScript / Node, and other stacks -- so please stay with us even if you don't use Python.

PostgreSQL is used for the database -- you'll learn how to run tests on CircleCI with this. If you're using MySQL or another database, the concepts are similar.

You'll learn how to run unit tests and integration tests with Selenium and Chrome in the CircleCI environment.

Finally, we'll deploy the application to Heroku and discuss other deployment options.

## Upload Your Code

To use CircleCI, your code must be available on GitHub or BitBucket, in either a private or public repository. We'll be using GitHub for this walkthrough.

<div class="alert alert-info" role="alert">
<strong>Tip:</strong> If you're following along and want to use the code, you should fork and clone the <a class="alert-link" href="https://github.com/circleci/cci-demo-walkthrough">cci-demo-walkthrough</a> project. On your local machine, delete the <code>.circleci</code> directory and make a commit. You now have a clean project ready to start configuring for use with CircleCI.
</div>

## Create CircleCI config file

To make sure our project runs on CircleCI 2.0, we need to create a configuration file:

- create a directory called `.circleci`
- create a file in this directory called `config.yml`

Then, add the following line to `config.yml`.

```YAML
version: 2
```

This tells CircleCI to use CircleCI 2.0. Without this, CircleCI will try to build the project on CircleCI 1.0.

## Add Project and Start Building

Log into CircleCI ([create an account](https://circleci.com/signup/) if you haven't already) and go to the '[Add Projects](https://circleci.com/add-projects)' screen. Locate your project and click the green 'Build Project' button.

When you click 'Build Project', we’ll run a build. The first one will fail since our `config.yml` isn't valid:

![First build]({{ site.baseurl }}/assets/img/docs/walkthrough1.png)

Note that you must be an administrator or owner of the project in order to start building it.

## Add a Job

<div class="alert alert-info" role="alert">
<strong>Tip:</strong> The <code>config.yml</code> file is flexible and powerful. In this guide, we'll only be covering pieces essential to getting started.<br /><a class="alert-link" href="/docs/2.0/configuration-reference/">Full reference documentation for <code>config.yml</code> is available here</a>.
</div>

`config.yml` is comprised of several **jobs**. In turn, a job is comprised of several **steps**, which are commands that execute in the first specified container -- the 'primary container'.

**There is no 'inference' in CircleCI 2.0.** On CircleCI 1.0, if we didn't detect a configuration file, we 'inferred' things about your project and tried to build it. This was great for getting projects up and running quickly, but as things got more complex, it added 'magic' that was hard to debug.

Here's a minimal example for our demo project:

```YAML
version: 2
jobs:
  build:
    working_directory: ~/circulate
    docker:
      - image: python:3.6.0
    steps:
      - checkout
      - run: echo "hello world"
```

In the example above, all configuration lives under a job called `build`. **Every config file must have a 'build' job**. This is the only job that will be automatically picked up and run by CircleCI.

### Inside a 'Build' Job

First, we specify a working directory where commands will be executed.

Next, we have to choose an 'executor', the underlying technology that's running your build. While getting started, we recommend using the `docker` executor. [Read more about executor types and their tradeoffs here](/docs/2.0/executor-types).

#### Specify an Image

Because we chose the `docker` executor, we have to specify a Docker image as our 'primary container'. The image you choose can be any public Docker image. Private images are supported, but [some additional setup is required](/docs/2.0/building-docker-images/#private-images-and-docker-registries).

The best way to get started is to use one of [Docker's official images on Docker Hub](https://hub.docker.com/explore/) for the language you’re using. In our example, we're using the `python:3.6.0` image.

<div class="alert alert-warning" role="alert">
<strong>Note:</strong> If you choose a lightweight image, it may not have essential tools like Git installed. You'll need to take some extra steps to add those tools so you can checkout your code and get your job running. You can <a href="https://discuss.circleci.com/c/circleci-2-0" class="alert-link">find solutions and ask questions about this on Discuss</a>.
</div>

#### Specify Steps

With our primary container specified, we can create the first 'steps' for our job. Steps are a series of commands that run sequentially on the primary container.

The first step checks out our code from GitHub with the special `checkout` step. Then we `run` a command, which can be any valid `bash` command. To get started, we're just going to `echo` a greeting to stdout.

### Commit and Push

With the above in `config.yml`, we can commit and push our code. CircleCI will automatically run the `build` job, check out our code, and echo "Hello World", giving us our first green build!

![First passing build]({{ site.baseurl }}/assets/img/docs/walkthrough2.png)

<div class="alert alert-info" role="alert">
<h3>The CircleCI CLI</h3>
<p>You may be wondering how all this happened just by pulling a standard image from Docker Hub. The magic is made possible with a tool called the CircleCI CLI. We inject this agent into the primary container to enable jobs to run. You can learn more about the CircleCI CLI (and even how to install it locally), by reading <a class="alert-link" href="/docs/2.0/local-jobs/">Running Jobs Locally</a>.
</p>
</div>

## Install and Configure Dependencies

Now that we've specified a `build` job, let's add some more configuration:

```YAML
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
      - run:
          name: Install Dependencies
          command: pip install -r requirements/dev.txt
```

If you're following along, update your `config.yml`, commit and push to GitHub. The build should run and install all your dependencies.

We've added quite a lot, so let's go through everything in more detail:

### Environment Variables

For any 'image', we can set environment variables with `environment`. In our example, we've set variables for testing and connecting to the database container.

If any of these variables have the same name as variables you create in the CircleCI web application, the ones in `config.yml` will take precedence.

Similarly, environment variables defined in a `step` will take precedence over the ones at the image level.

### Database Image

We're using PostgreSQL 9.6.2. As before, we select an official image from Docker Hub. By setting 3 environment variables, we make a test database available for our app.

<div class="alert alert-info" role="alert">
<strong>Note:</strong> We'll soon have more details on using other databases with CircleCI. In the meantime, you can <a href="https://discuss.circleci.com/c/circleci-2-0" class="alert-link">find solutions and ask questions about the database you are using on Discuss</a>.
</div>

### Browser Tests with Selenium

Our app uses WebDriver to run tests via Selenium on Chrome. A great way to do this on CircleCI 2.0 is to use the `selenium/standalone` image, as we've done in the example above.

Your tests should now run the same way they would locally if you're set up for Selenium testing.

Current images for Firefox and Chrome are available on Docker Hub:

- <https://hub.docker.com/r/selenium/standalone-firefox/tags/>
- <https://hub.docker.com/r/selenium/standalone-chrome/tags/>

## Cache Dependencies

To speed up our builds, we should cache our dependencies:

{% raw %}
```YAML
...
    steps:
      - checkout
      - restore_cache:
          key: projectname-{{ .Branch }}-{{ checksum "requirements/dev.txt" }}
      - run:
          name: Install Dependencies
          command: pip install -r requirements/dev.txt
      - run:
          # this can be removed
          name: Locate site Packages
          command: python -c "import site; print(site.getsitepackages())"
      - save_cache:
          key: projectname-{{ .Branch }}-{{ checksum "requirements/dev.txt" {% raw %}}}
          paths:
            - "~/.cache/pip"
            - "/usr/local/lib/python3.6/site-packages"
```
{% endraw %}

From the bottom up:

### save_cache

Here, we're only saving the cache for this project on the current branch with `{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}`.

Then, we let CircleCI know how to save a new cache if the checksum for our requirements file changes: `{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}`. Finally, we specify the paths we want to cache, which in this case are where our Python pip dependencies are stored.

### run: ...Locate site Packages

This section is temporary and helps us locate where our Python dependencies are being saved. We're including this as it illustrates a useful way to test things in CircleCI.

Currently, `ssh` for jobs is not enabled. Since we can't inspect the container directly, we're echoing out the location via a Python command run from the Shell. You can widely apply this tactic in CircleCI.

### restore_cache

This restores the cache using a format similar to that used in the `save_cache` step.

---

Caching is a subtle art, and we're only scratching the surface here. To get the best performance for your needs, please read [Caching](https://circleci.com/docs/2.0/caching/) and see the [caching config reference](https://circleci.com/docs/2.0/configuration-reference/#savecache)

## Run Tests

Finally, we're ready to run our tests by adding:

```YAML
      - run:
          name: Run Tests
          command: python manage.py test
```

`config.yml` at this stage should look like this:

```YAML:
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
          key: projectname-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
      - run:
          name: Install Dependencies
          command: pip install -r requirements/dev.txt
      - run:
          # this can be removed
          name: Locate site Packages
          command: python -c "import site; print(site.getsitepackages())"
      - save_cache:
          key: projectname-{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}-{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}
          paths:
            - "~/.cache/pip"
            - "/usr/local/lib/python3.6/site-packages"
      - run:
          name: Run Tests
          command: python manage.py test
```

If you're following along - you can add all of this, commit and push to watch CircleCI run your tests and give you a green build.

## Store Artifacts

You may want to generate build artifacts for things like compiled assets or screenshots. Our tests produce report files that we'd like to store and access with the following step:

```YAML
...
      - store_artifacts:
          path: test-reports/
          destination: tr1
```

The `store_artifacts` step is a special step. `path` is a directory relative to the project root where the files are stored. `destination` specifies a 'prefix' that we've chosen to be unique in case another step in the job produces artifacts in a directory with the same name. CircleCI will collect and upload your artifacts to S3 for storage.

When the build completes you can find the artifacts via the CircleCI UI:

![Artifacts on CircleCI]({{ site.baseurl }}/assets/img/docs/walkthrough3.png)

## Store Test Results

It would be helpful to get test timing results. Our test suite has already been configured to output results in the JUnit XML format. We can use CircleCI to analyze the files by adding the following to `config.yml`:

```YAML
...
      - store_test_results:
          path: test-reports/
```

The path for the result files is relative to the root of the project. In our example we're using the same directory as we used to store artifacts - but this doesn't have to be the case.

When the build completes, CircleCI will analyze your test timings and summarize them on the `Test Summary` tab:

![Test Result Summary]({{ site.baseurl }}/assets/img/docs/walkthrough4.png)

## Deployment

**Note: 2017-03-10:** We're in the process of updating this guide with new configuration syntax for CircleCI 2.0. Please check back in the next 24 hours to read about deploying your application.

For now, here's a [guide on Discuss](https://discuss.circleci.com/t/deploying-examples/8093)

## Make the Job Faster with Parallelism

**Note: 2017-03-10:** We're in the process of updating this guide with new configuration syntax for CircleCI 2.0. Please check back in the next 24 hours to read about testing your application in parallel.

A key feature is the ability to run your jobs in parallel on many containers to speed up large test suites. [This article](https://circleci.com/docs/2.0/parallelism-faster-jobs/) will help you get started.

-----

## Feedback and Updates

We will be developing this guide as CircleCI 2.0 evolves. We welcome your [feedback](https://discuss.circleci.com/c/circleci-2-0/feedback) and [questions](https://discuss.circleci.com/c/circleci-2-0/support) on Discuss.

