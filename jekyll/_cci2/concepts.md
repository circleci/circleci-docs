---
layout: classic-docs
title: "Concepts"
short-title: "Concepts"
description: "CircleCI 2.0 concepts"
categories: [getting-started]
order: 1
---

*[Basics]({{ site.baseurl }}/2.0/concepts/) > Concepts*

This document provides an overview of the concepts used in CircleCI 2.0 in the following sections:

* TOC
{:toc}

## Steps

Steps are actions that need to be taken to perform your build. ![step illustration]( {{ site.baseurl }}/assets/img/docs/concepts_step.png) Steps are usually a collection of executable commands. For example, the `checkout` step checks out the source code for a job over SSH. Then, the `run` step executes the `make test` command using a non-login shell by default.


```YAML
...
    steps:
      - checkout # Special step to checkout your source code
      - run: # Run step to execute commands, see
      # circleci.com/docs/2.0/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.
...          
```          

## Image

An image is a packaged system that has the instructions for creating a running container. ![image illustration]( {{ site.baseurl }}/assets/img/docs/concepts_image.png)
 The Primary Container is defined by the first image listed in `.circleci/config.yml` file. This is where commands are executed for jobs using the Docker executor.

 ```YAML
 version 2
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/2.0/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: buildpack-deps:trusty

       - image: postgres:9.4.1 # Specifies the database image
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/2.0/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: root
...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 14.04 image with Docker 17.06.1-ce
     # and docker-compose 1.14.0, follow CircleCI Discuss Announcements
     # for new image releases.
       image: circleci/classic:201708-01
...       
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 9.0
       xcode: "9.0"       
 ...          
 ```


## Jobs

Jobs are a collection of steps. The Job Space is all of the containers being run by an executor (`docker`, `machine`, or `macos`) for the current job.

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

### Cache

A cache stores a file or directory of files such as dependencies or source code in object storage.
Each job may contain special steps for caching dependencies from previous jobs to speed up the build.

![cache illustration]( {{ site.baseurl }}/assets/img/docs/concepts_cache.png)

{% raw %}

```YAML
version 2
jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/2.0/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}       
```



{% endraw %}

## Workflows

Workflows define a list of jobs and their run order. Within the CI/CD industry, this feature is also referred to as Pipelines. It is possible to run jobs in parallel, sequentially, on a schedule, or with a  manual gate using an approval job.

![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

{% raw %}
```YAML
version 2
jobs:
  build1:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
  build2:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
...                          
workflows:
  version: 2
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
        requires:
           - build1 # wait for build1 job to complete successfully before starting
      - build3:
        requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 in parallel to save time.
```
{% endraw %}

### Workspaces and Artifacts

Workspaces are a workflows-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs. Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

  {% raw %}
  ```YAML
version: 2
jobs:
  build1:
...   
    steps:    
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace  for use in downstream job. Must be an absolute path,
      # or relative path from working_directory. This is a directory on the container which is
      # taken to be the root directory of the workspace.
          root: workspace
            # Must be relative path from root
          paths:
            - echo-output

  build2:
...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
          at: /tmp/workspace
  build3:
...
    steps:
      - store_artifacts:
          path: /tmp/artifact-1
          destination: artifact-file
...
```        
