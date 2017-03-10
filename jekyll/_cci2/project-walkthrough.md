---
layout: classic-docs
title: "Project Walkthrough"
short-title: "Project Walkthrough"
categories: [getting-started]
order: 25
---

## Introduction

This tutorial will teach you important concepts about using CircleCI. We recommend it to all CircleCI users whether you are new to the platform or have experience using CircleCI 1.0.

You will learn how to build, test and deploy an application using CircleCI. The application is a working web application and will be **relevant to you no matter what language or stack you are using**.

**Note: CircleCI 2.0 does not currently support building iOS and Android applications.** Mobile developers should check our documentation for [mobile on 1.0](https://circleci.com/docs/1.0/mobile/).

## The Demo App - 'Circulate'

'Circulate' is a 'social blogging' web application similar to Twitter. Users can create accounts, make posts, follow users and comment on posts. You can *circulate* your thoughts and ideas :-) Here's a screenshot of it in use:

![Circulate demo app screenshot]({{ site.baseurl }}/assets/img/docs/walkthrough0.png)

The source for the application is here: [cci-demo-walkthrough](https://github.com/circleci/cci-demo-walkthrough).

**Original Author Credit:** This is based on Miguel Grinberg's excellent [Flasky](https://github.com/miguelgrinberg/flasky) application.

The application uses Python and Flask for the back-end. The concepts for building on CircleCI are the same for Ruby / Rails, JavaScript / Node, and other stacks -- so please stay with us, even if you don't use Python.

PostgreSQL is used for the database -- you'll learn how to run tests on CircleCI with this. If you're using MySQL or another database, the concepts are similar.

You'll learn how to run unit tests and integration tests with Selenium and Chrome in the CircleCI environment.

Finally, we'll deploy the application to Heroku and discuss other deployment options.

## Upload Your Project to GitHub or BitBucket

To use CircleCI your code must be available on GitHub or BitBucket. You can use private or public repositories.

In this walkthrough we'll use GitHub.

<div class="alert alert-info" role="alert">
<strong>Tip:</strong> If you're following along and want to use the code, you should fork and clone the <a class="alert-link" href="https://github.com/circleci/cci-demo-walkthrough">cci-demo-walkthrough</a> project. On your local machine, delete the <code>.circleci</code> directory and make a commit. You now have a clean project ready to start configuring for use with CircleCI.
</div>

## Create CircleCI config file

To make sure our project runs on CircleCI 2.0, we need to create a configuration file.

- create a directory called `.circleci`
- create a file in this directory called `config.yml`

Add the following to `config.yml`:

```YAML
version: 2
```

This tells CircleCI to use CircleCI 2.0. Without this, CircleCI will try to build the project on CircleCI 1.0.

**There is no 'inference' on CircleCI 2.0.** On CircleCI 1.0, if we didn't detect a configuration file, we 'inferred' things about your project and tried to build it. This was great for getting projects up and running quickly, but as things got more complex, it added 'magic' that was hard to debug.

## Add the Project to CircleCI

Now log into CircleCI ([create an account](https://circleci.com/signup/) if you haven't already) and go to the '[Add Projects](https://circleci.com/add-projects)' screen. Locate the project and click the green 'Build Project' button.

You must be an administrator / owner of the project on GitHub or BitBucket in order to start building it.

## Your First Build

As soon as you click 'Build Project', we will run a build. The first one will fail since we didn't add a complete `config.yml`:

![First build]({{ site.baseurl }}/assets/img/docs/walkthrough1.png)

## Adding a Job

<div class="alert alert-info" role="alert">
<strong>Tip:</strong> The <code>config.yml</code> file is flexible and powerful. In this guide, we'll cover essential elements to get you up and running.<br /><a class="alert-link" href="/docs/2.0/configuration-reference/">Full reference documentation for <code>config.yml</code> is available here</a>.
</div>

`config.yml` is comprised of several **jobs**. In turn, a job is comprised of several **steps**, which are commands that execute in the first specified container -- the 'primary container'.

Here's a minimal example for our demo project. We'll explain the steps below:

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

The above config has one job we've called 'build'. **Every config file must have a job called 'build'**. This is the only job that will be automatically picked up and run by CircleCI.

We then set some configuration values for the 'build' job. First, we specify a working directory with `working_directory` where commands will be executed.

Next, we specify the 'executor' as `docker`. While getting started, you should always use `docker` as shown above. [Read more about executor types](/docs/2.0/executor-types/).

Now we choose a Docker image for our 'primary container'. This can be any publicly available Docker image. The best way to get started is to use an officially maintained image from Docker Hub for the language you are using. Above we're using the `python:3.6.0` image. You can [explore official images here](https://hub.docker.com/explore/).

Private images are supported but there are some requirements you will need to meet. [Read more about using private images here](/docs/2.0/building-docker-images/#private-images-and-docker-registries). While getting started we recommend using public images.

<div class="alert alert-warning" role="alert">
<strong>Note:</strong> If you choose a lightweight image, such as an 'alpine' based image, it may not have essential tools installed, such as Git, that you will need to checkout your code, or get your job running. You will need to take some extra steps to add those tools if you do this. You can <a href="https://discuss.circleci.com/c/circleci-2-0" class="alert-link">find solutions and ask questions about  this on Discuss</a>.
</div>

With a primary container specified, we can create the first 'steps' for our job. The first step checks out our code from GitHub with the special `checkout` step. Then we `run` a command. This can be any valid 'bash' command. To get started, we're just going to `echo` a greeting to stdout.

With the above in `config.yml`, we can commit and push our code. CircleCI will automatically run the job, and we’ll get our first green build!

![First passing build]({{ site.baseurl }}/assets/img/docs/walkthrough2.png)

CircleCI has started our primary container, checked out our code, and run our 'Hello World' command.

<div class="alert alert-info" role="alert">
<h3>The CircleCI CLI</h3>
<p>You may be wondering how this all ran, just by pulling a standard image from Docker hub. The magic is made possible with a tool called the CircleCI CLI. We inject this agent into the primary build container to enable jobs to run. You can find out more about this, and even install it locally, by reading <a class="alert-link" href="/docs/2.0/local-jobs/">Running Jobs Locally</a>.
</p>
</div>

Now we need to install and configure our dependencies and run some tests.

## Install and Configure Dependencies

Here's the next version of our `config.yml`:

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

If you're following along, you can add that to your project, commit and push to GitHub. The build should run and install all your dependencies.

We've added quite a few things. Let's go through them:

### Environment Variables

For any 'image', we can set environment variables with `environment`. You can see we've set env vars for our app to use the correct configuration for testing and to connect to the database container.

### Database Image

We're using PostgreSQL 9.6.2. As before, we select an official image from Docker Hub. By setting three environment variables, we make a test database available for our app.

<div class="alert alert-info" role="alert">
<strong>Note:</strong> We'll have more details on using a range of databases with CircleCI 2.0 on this documentation site very soon. You can <a href="https://discuss.circleci.com/c/circleci-2-0" class="alert-link">find solutions and ask questions about the database you are using on Discuss</a>.
</div>

### Browser tests with Selenium

Our app uses webdriver to run tests via Selenium on Chrome. A great way to do this on CircleCI 2.0 is to use the `selenium/standalone` images. All we need to do is add:

```YAML
  - image: selenium/standalone-chrome:3.1.0
```

Your tests should now run just as they do locally if you're set up for webdriver / selenium testing.

Current images for Firefox and Chrome are available on Docker Hub:

- <https://hub.docker.com/r/selenium/standalone-firefox/tags/>
- <https://hub.docker.com/r/selenium/standalone-chrome/tags/>

## Cache Dependencies

To speed up our builds, we should cache our dependencies. This is very flexible on CircleCI 2.0. Here are the steps we're adding to `config.yml`:

```YAML
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
```

Let's go from the bottom up:

- `save_cache` does what you'd expect. You have control over the granularity of what to save.
  - Here we're saving cache for this project on the current branch only with `{% raw %}{{{% endraw %} .Branch {% raw %}}}{% endraw %}`.
  - We then let CircleCI know to save a new cache if the checksum for our requirements file changes: `{% raw %}{{{% endraw %} checksum "requirements/dev.txt" {% raw %}}}{% endraw %}`
  - Finally, we specify the paths we want to cache. For Python pip dependencies, we've listed where the files are stored.
- `run: ...Locate site Packages` - this section is a temporary addition and helps us locate where our Python dependencies are being saved. We're including this as it illustrates a useful way to test things on 2.0. Currently `ssh` for jobs is not enabled. Since we can't inspect the container directly, we're echoing out the location via a Python command run from the Shell. You can apply this principle widely in CircleCI.
- Working upwards, the next _new_ section is `restore_cache` - this does what you'd expect based on the setting we explained in `save_cache`.

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

## Deployment

**Note: 2017-03-09:** We're in the process of updating this guide with new configuration syntax for CircleCI 2.0. Please check back in the next 24 hours to read about deploying your application.

For now, here's a [guide on Discuss](https://discuss.circleci.com/t/deploying-examples/8093)

## Make the Job Faster with Prallelism

**Note: 2017-03-09:** We're in the process of updating this guide with new configuration syntax for CircleCI 2.0. Please check back in the next 24 hours to read about testing your application in parallel.

A key feature is the ability to run your jobs in parallel on many containers to speed up large test suites. [This article](https://circleci.com/docs/2.0/parallelism-faster-jobs/) will help you get started.

-----

## Feedback and Updates

We will be developing this guide as CircleCI 2.0 evolves. We welcome your [feedback](https://discuss.circleci.com/c/circleci-2-0/feedback) and [questions](https://discuss.circleci.com/c/circleci-2-0/support) on Discuss.

