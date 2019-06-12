---
layout: classic-docs
title: "Configuration Introduction"
description: "Landing page for CircleCI 2.0 Config"
---

This guide focuses on getting you started with the core of the CircleCI experience - `config.yml` in the following simple steps:

* TOC
{:toc}

## Getting Started with CircleCI Config
{:.no_toc}

This guide describes how CircleCI finds and runs `config.yml` and how you can use shell commands to do things, then it outlines how `config.yml` can interact with code and kick-off a build
followed by how to use docker containers to run in precisely the environment that you need. Finally, there is a short exploration of workflows so you can learn to orchestrate your build, tests, security scans, approval steps, and deployment.

CircleCI believes in *configuration as code*.  As a result, the entire delivery process from build to deploy is orchestrated through a single file called `config.yml`.  The `config.yml` file is located in a folder called `.circleci` at the top of your project.  CircleCI uses the YAML syntax for config, see the [Writing YAML]({{ site.baseurl }}/2.0/writing-yaml/) document for basics.


## Part One: Hello, It’s All About the Shell
Let’s get started.  CircleCI provides a powerful experience because we provide you an on-demand shell to run whatever you need.  In this first example, we will show you how easy it is to setup your first build and execute a shell command.

1. If you haven’t already, go ahead and sign-up with CircleCI and select either GitHub or Bitbucket. If you prefer, you can also sign up through the GitHub marketplace.
2. Make sure the project you want to manage has been added.
3. Add a `.circleci` folder at the top of your project’s master branch.  If you want to experiment on a different branch, you can do that too.  Make sure the folder starts with a period.  This folder is special and hence the .circleci format.
4. Add a `config.yml` file inside the .circleci folder.
5. Add the following contents to your `config.yml` file.

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: alpine:3.7
    steps:
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
```

Check-in the config and see it run.  You can see the output of the job in the CircleCI app.

### Learnings
{:.no_toc}

The CircleCI config syntax is very straight forward.  The trickiest part is typically indentation.  Make sure your indentation is consistent.  This is the single most common error in config.  Let’s go over the nine lines in details

- Line 1: This indicates the version of the CircleCI platform you are using.  2.0 is the most recent version.
- Line 2-3: The `jobs` level contains a collection of arbitrarily named children.  `build` is the first named child in the `jobs` collection.  In this case `build` is also the only job.
- Line 6-7: The `steps` collection is an ordered list of `run` directives.  Each `run` directive is executed in the order in which it was declared.
- Line 8: The `name` attribute provides useful organizational information when returning warnings, errors, and output.  The `name` should be meaningful to you as an action within your build process
- Line 9-11: This is the magic.  The `command` attribute is a list of shell commands that represent the work you want done.  The initial pipe, `|`, indicates that there will be more than one line of shell commands.  Here line 10 will print out `Hello World!` in your build shell and line 11 will print out `This is the delivery pipeline`

## Part Two: Info and Preparing to Build
That was nice but let’s get real.  Delivery graphs start with code.  In this example we will add a few lines that will get your code and then list it.  We will also do this in a second run.

1. If you haven’t already, please go through Part One and add a simple `.circleci/config.yml` file to your project.

2. CircleCI provides a number of simplified commands that you can use to make complex interactions very easy.  Here we are going to add the `checkout` command.  This command automatically gets the branch code for you to work with in subsequent steps.

3. Now, add a second `run` step and do an `ls -al` to see that all of your code is available.

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: alpine:3.7
    steps:
      - checkout
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
```

### Learnings
{:.no_toc}
Although we’ve only made two small changes to the config, these represent significant organizational concepts.

- Line 7: The `checkout` command is an example of a built-in reserved word that contextualizes your job.  In this case, it is pulling down your code so you can start a build.
- Line 13-17: The second run on the `build` job is listing (through `ls -al`) the contents of the checkout.  Your branch is now available for you to interact with.

## Part Three: That’s nice but I need...
Every code base and project is different.  That’s okay.  We like diversity.  This is one of the reasons we allow you to run in your machine or docker container of choice.  In this case we will demonstrate running in a container with node available.  Other examples might include macOS machines, java containers, or even GPU.

1. This section expands on Part One and Two.  If you haven’t already, go through at least Part One to ensure you have a working `config.yml` file in your branch.

2. This is a very simple and yet amazingly powerful change.  We are going to add a reference to a docker image for the build job.

```yaml
version: 2.0
jobs:
  build:
    # pre-built images: https://circleci.com/docs/2.0/circleci-images/
    docker:
      - image: circleci/node:10-browsers
    steps:
      - checkout
      - run:
          name: The First Step
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
      - run:
          name: Running in a Unique Container
          command: |
            node -v
```

We also added a small `run` block that demonstrates we are running in a node container.

### Learnings
{:.no_toc}

The above two changes to the config significantly affect how you get work done.  By associating a docker container to a job and then dynamically running the job in the container, you don’t need to perform special magic or operational gymnastics to upgrade, experiment or tune the environment you run in.  With a small change you can dramatically upgrade a mongo environment, grow or shrink the base image, or even change languages.

- Line 4: Here we see a comment in-line in yml.  Like any other unit of code, comments are a useful tool as config gets complicated.
- Line 5-6: These lines indicate that docker image to use for the job.  Because you can have more than one job in your config (as we will see next) you can also run different parts of your config in different environments.  For example, you could perform a build job in a thin java container and then perform a test job using a container with browsers pre-installed. In this case, it uses  a [pre-built container from CircleCI]({{ site.baseurl }}/2.0/circleci-images/) that already has a browser and other useful tools built in.  
- Line 19-22: These lines add a run step that returns the version of node available in the container. Try experimenting with different containers from CircleCI’s pre-built convenience images or even public containers from Docker hub.

## Part Four: Approved to Start
So far so good?  Let’s spend a moment on orchestration.  In this example, we will spend more time doing analysis than step-by-step modification.
The CircleCI workflow model is based on the orchestration of predecessor jobs.  This is why the reserved word used for workflow definition is `requires`.  Jobs initiation is always defined in terms of the successful completion of prior jobs.  For example, a job vector such as [A, B, C] would be implemented with jobs B and C each requiring the job prior.  Job A would not have a requires block because it starts immediately. For example, job A starts immediately; B requires A; C requires B.

In the example below, an event triggering a build will cause `Hello-World` to start immediately.  The remainder of the jobs will wait.  When `Hello-World` completes, both `I-Have-Code` and `Run-With-Node` will start.  That is because both `I-Have-Code` and `Run-With-Node` require `Hello-World` to complete successfully before they can start.  Next, the approval job called `Hold-For-Approval` will become available when both `I-Have-Code` and `Run-With-Node` complete.  The `Hold-For-Approval` job is slightly different from the others.  It represents a manual intervention to allow the workflow to continue.  While the workflow is waiting for a user (through the CircleCI UI or API) to approve the job, all state is preserved based on the original triggering event.  CircleCI understands that Approval jobs may take hours or even days before completing - although we suggest hours over days. Once `Hold-For-Approval` completes through a manual intervention, the final job `Now-Complete` will run.

All of the job names are arbitrary.  This allows you to create workflows as complex as you need while staying meaningful and clear to the next developer that reads the `config.yml`.

```yaml
version: 2.0
jobs:
  Hello-World:
    docker:
      - image: alpine:3.7
    steps:
      - run:
          name: Hello World
          command: |
            echo 'Hello World!'
            echo 'This is the delivery pipeline'
  I-Have-Code:
    docker:
      - image: alpine:3.7
    steps:
      - checkout
      - run:
          name: Code Has Arrived
          command: |
            ls -al
            echo '^^^That should look familiar^^^'
  Run-With-Node:
    docker:
      - image: circleci/node:10-browsers
    steps:
      - run:
          name: Running In A Container With Node
          command: |
            node -v
  Now-Complete:
    docker:
      - image: alpine:3.7
    steps:
      - run:
          name: Approval Complete
          command: |
            echo 'Do work once the approval has completed'

workflows:
 version: 2
 Example_Workflow:
   jobs:
     - Hello-World
     - I-Have-Code:
         requires:
           - Hello-World
     - Run-With-Node:
         requires:
           - Hello-World
     - Hold-For-Approval:
         type: approval
         requires:
           - Run-With-Node
           - I-Have-Code
     - Now-Complete:
         requires:
           - Hold-For-Approval

```

### Learnings
{:.no_toc}

We now know how to create a workflow including a manual gate that you can use to protect promotion of expensive interactions.

- Line 3: The command that echo’s `Hello World!` has been turned in a full fledged job with the name Hello-World
- Line 12: The commands to get code are now in a job named `I-Have-Code`
- Line 22: The Node example using the CircleCI pre-built image is now called `Run-With-Node`
- Line 30: There is an additional job that operates similarly to `Hello-World` but it won’t run until the approval is complete - see line 57 in the workflow stanza.
- Line 39-57: The config now has a workflow.  In the prior examples the CircleCI engine interpreted the config as having had a single-job workflow.  Here we are staying clear and spelling out the workflow we want to execute. This workflow demonstrates several useful capabilities. The `requires` statement represents a list of prior jobs that must complete successfully prior to the job in question starting.  In this example, both `I-Have-Code` and `Run-With-Node` must complete before `Hold-For-Approval` becomes active.  In addition, both `I-Have-Code` and `Run-With-Node` are dependent on `Hello-World` but not on each other. This means that those two jobs will run in parallel as soon as `Hello-World` is complete.  This is useful if you have multiple jobs that are not directly dependent on one another and you want to improve wall-clock time.
- Line 50-51: Most of the jobs are generic.  However, this job has a type.  In this case the type is `approval` and requires a person through the CircleCI API or UI to take an action for the build to complete. Interleaving approval jobs allows you to create gates that must be approved or managed prior to downstream jobs executing.


The examples above were designed to provide a quick starter to the areas of functionality available through CircleCI config.  There remains a lot more.  Take a look at the rest of the documentation.  You will find that scheduled jobs, workspaces, artifacts, and more are all simple variations on the concepts you’ve learned here.  Now go forth and automate your CI/CD world!

## See Also
{:.no_toc}

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
