---
layout: classic-docs
title: "Running Jobs With the API"
short-title: "Running Jobs With the API"
description: "How to define and trigger non-build jobs"
categories: [configuring-jobs]
order: 80
---
 
*[Basics]({{ site.baseurl }}/2.0/basics/) > Running Jobs With the API*
 
This document describes
how to trigger jobs using the CircleCI API.

* TOC
{:toc}

## Overview

You can use the [CircleCI API]({{ site.baseurl }}/api/v1-reference/)
to trigger [jobs]({{ site.baseurl }}/2.0/jobs-steps/#jobs-overview)
that you have defined in `.circleci/config.yml`.

The following example shows
how to trigger the `deploy_docker` job
by using `curl`.

```bash
curl -u ${CIRCLE_API_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_docker \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/master
```

Some notes on the variables
used in this example:
- `CIRCLE_API_TOKEN` is an API token set on your project's settings page.
- `<vcs-type>` is a placeholder variable
and refers to your chosen VCS (either `github` or `bitbucket`).
- `<org>` is a placeholder variable
and refers to the name of your CircleCI organization.
- `<repo>` is a placeholder variable
and refers to the name of your repository.

**Note:**
Jobs triggered with the API
do **not** have access to environment variables
created for [a CircleCI Context]({{ site.baseurl }}/2.0/contexts/).

- The `config.yml` file where the job that is triggered using the API is defined may contain a workflow definition. The workflow does not have to reference this job.


## Conditionally Running Jobs With the API

The next example demonstrates a configuration for building docker images with `setup_remote_docker` only for builds that should be deployed. 

```yaml
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.4.0
        environment:
          - LANG: C.UTF-8
    working_directory: /my-project
    parallelism: 2
    steps:
      - checkout

      - run: echo "run some tests"

      - deploy:
          name: conditionally run a deploy job
          command: |
            # replace this with your build/deploy check (i.e. current branch is "release")
            if [[ true ]]; then
              curl --user ${CIRCLE_API_TOKEN}: \
                --data build_parameters[CIRCLE_JOB]=deploy_docker \
                --data revision=$CIRCLE_SHA1 \
                https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH
            fi

  deploy_docker:
    docker:
      - image: ruby:2.4.0
    working_directory: /
    steps:
      - setup_remote_docker
      - run: echo "deploy section running"
```

Notes on the above example:

- Using the `deploy` step in the build job is important to prevent triggering N builds, where N is your parallelism value.
- We use an API call with `build_parameters[CIRCLE_JOB]=deploy_docker` so that only the `deploy_docker` job will be run.
