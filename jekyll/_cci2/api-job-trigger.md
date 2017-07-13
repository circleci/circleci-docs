---
layout: classic-docs
title: "Running Jobs With the API"
short-title: "Running Jobs With the API"
description: "How to define and trigger non-build jobs"
categories: [configuring-jobs]
order: 80
---
 
## Starting Jobs With the API
 
This document describes how to initiate jobs using the CircleCI API. The following example initiates a `deploy_production` job by using `curl`.

```YAML
curl -u ${CIRCLE_API_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_production \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/master
```

A few notes about this example:

- `CIRCLE_API_TOKEN` should be the API token from your project's settings page.
- `<vcs-type>/<org>/<repo>` should be replaced with your own VCS and org/repo names; at time of writing, `<vcs-types>` must be either `github` or `bitbucket`.


## Conditionally Running Jobs With the API

The next example demonstrates a configuration for building docker images with `setup_remote_docker` only for builds that should be deployed. 

```YAML
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
