---
layout: classic-docs2
title: "Project Walkthrough"
short-title: "Project Walkthrough"
categories: [getting-started]
order: 25
---

**TODO: Rewrite as a full project walkthrough tutorial**

Configuration for CircleCI is contained in a single file: `.circleci/config.yml`. This file is committed to your project’s repository along with the rest of your source code.

This file is _extremely_ flexible, so it’s not realistic to list every possible thing you can put in here. Instead, we’ll create a sample `config.yml` file and explain the sections along the way.

*For more comprehensive documentation see the 'Configuring Jobs' section.*

## **version**

The first thing you’ll put in `config.yml` is the _version_ you’re using. We use this field to issue warnings about breaking changes or deprecation.

```yaml
version: 2
```

## Jobs

The rest of `config.yml` is comprised of several _jobs_. In turn, a job is comprised of several _steps_, which are commands that execute in the first specified container.

So what does a job look like? At minimum, a job must have an executor and a list of steps. It can also have a few other values:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/canary-python
    docker:
      - image: golang:1.7.0
    environment:
      FOO: "bar"
    steps:
      - checkout
      - run: make test
```

The job in this case is named “build”, and the value is a map of additional information about that job. CircleCI uses the job’s name in other contexts, so it **must** form a unique tuple in combination with the repository’s URI.

The map for each job accepts the following (optional in brackets):

### **[name]** (string)

The name the UI uses for the job.

If you don’t specify a name, the UI will default to the map’s key (“build” in this case).

### **[working_directory]** (string)

A directory in which to execute a job’s steps. It only applies to the first container since that’s where the steps are being executed.

This is the working directory for the job’s steps, which means this only applies to the first container.

The default `working_directory` depends on the [executor](#executors) you’re using. Note also that the default will not exist for steps that run before the `checkout` step, _unless_ a step directly creates a working directory.

### **docker** or **machine** (map)

Options for either the Docker or machine [executor](#executors).

`docker` and `machine` are mutually exclusive, and you must choose one of them.

### **steps** (list)

A list of [steps](#steps) to be performed for this job.

### **[parallelism]** (integer)

Number of parallel instances of this job to run.

The default is 1. If you choose a number N > 1, then N independent executors will be set up to each run the job’s steps in parallel. Certain parallelism-aware steps can opt out of this and run on a single executor.

### **[environment]** (map)

A map of environment variable names and values.

In our example job, we export the `$FOO` environment variable with a value of `"bar"`.

## Executors

An _executor_ is roughly “a place where job steps occur.” Remember that you must choose between `docker` or `machine`.

### Docker

CircleCI will build the necessary environment by launching as many Docker containers as you need. Here’s an example:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: ubuntu:14.04
        command: ["/bin/bash"]
      - image: mongo:2.6.8
        command: [mongod, --smallfiles]
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root
      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
      - image: rabbitmq:3.5.4
  ...
```

The value of `docker` is a list of maps that list _which_ images to use and (in some cases) _how_ to use those images.

`docker` accepts maps with the following (optional in brackets):

#### **image** (string)

The name of a custom Docker image to use.

You can specify image versions from DockerHub using image tags, like `ubuntu` and `mongo`. Or you can specify image versions using a SHA, like `redis`.

#### **[command]** (string _or_ list of strings)

The command used as pid 1 when launching the container.

In order to avoid parsing ambiguities, `command` can also be a list of strings, as shown above.

#### **[user]** (string)

The user to run the command as.

#### **[environment]** (map)

A map of environment variable names and values.

These environment settings apply to all commands run in this container, not just the initial `command`. Additionally, this local `environment` has higher precedence over the `environment` key specified at the `job` level.

### Machine

If you’re not using Docker, you can use the `machine` executor to have a full virtual machine to yourself.

To use the `machine` executor, set the `machine` key to `true`.

This executor defaults `working_directory` to a directory in `/tmp` named after the repository.

## Steps

As we mentioned earlier, each job is comprised of several _steps_. The `steps` key is a list of single key/value pair maps. The key indicates the _type_ of step, while the value can either be a configuration map or simply a string. Behold:

```yaml
jobs:
  build:
    steps:
      - run:
          name: run tests
          command: make test
```

Here, we have a single step with an associated configuration map. Its type is `run`, its name is “run tests”, and the command is `make test`.

Similar to a job, the UI uses the `name` attribute for display purposes. If no `name` is provided, the step implementation will try to use some sensible default.

If the value of the step invocation key is a string, then the step implementation may implement default behavior. This means we can reduce our example further:

```yaml
jobs:
  build:
    steps:
      - run: make test
```

This is functionally the same as the above example, except the step will use the command as the name of the step.

A final shorthand is to just use a string instead of the entire step map:

```yaml
jobs:
  build:
    steps:
      - checkout
```

This is the equivalent of an empty map under the `checkout` key.

So the optional configuration map for a step invocation is:

### **[name]** (string)

The name the UI uses for the step.

### **[no_output_timeout]** (integer)

Number of seconds of inactivity allowed before the step times out and fails. Default is 600.

### **[absolute_timeout]** (integer)

Number of seconds a step may take overall before it times out and fails.

### **[background]** (boolean)

Whether or not this step run in the background. Default is false.

A step with `background` set will allow the job to immediately move to the next step. A failure of a backgrounded step will halt the build and cause it to fail.

If `background` conflicts with a steps definition, an error will be thrown.

### **[working_directory]** (string)

The directory to run this step in. Overrides the job-level `working_directory` value.
