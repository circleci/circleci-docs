---
layout: classic-docs
title: "Defining Multiple Jobs"
short-title: "Defining Multiple Jobs"
categories: [configuring-jobs]
order: 80
---

You can define jobs in your config other than `build`.

## Defining Jobs

`build` isn't the only job allowed in `config.yml`. You can define any number of jobs and name them whatever you'd like.

```
version: 2
jobs:
  build:
    docker:
      - image: my-image
    working_directory: /tmp
    steps:
      .....

  deploy_staging:
    machine: true
    working_directory: /root
    steps:
      .....

  deploy_production:
    machine: true
    working_directory: /root
    steps:
      .....
```

Each job can be configured differently. To illustrate this, we use the `docker` executor in the `build` job and `machine` executor in the other jobs, `deploy_staging` and `deploy_production`.

## Triggering Jobs

The `build` job is the default and the only one CircleCI runs automatically. You'll need to explicitly run any other jobs you've added. Currently, the only way to do that is to use the CircleCI API:

```YAML
curl -u ${CIRCLE_API_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_production \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/master
```

The above example shows how to trigger our `deploy_production` job by using `curl`.

A few notes about this example:

- `CIRCLE_API_TOKEN` should be the API token from your project's setting page.
- `<vcs-type>/<org>/<repo>` should be replaced with your own VCS and org/repo names; at time of writing, `<vcs-types>` must be either `github` or `bitbucket`.

## Conditionally triggering jobs

Building on the previous example, suppose you want to build docker images with `setup_remote_docker` only for builds that should be deployed. You can use a config such as the following:

```YAML
  build:
    docker:
      - image: ruby:2.4.0
        environment:
          - LANG: C.UTF-8
    working_directory: /my-project
    parallelism: 2
    steps:
      - checkout

      - run:
          name: Tests
          command: |
            echo "run some tests"

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

**Notes on the above example:**

- Using the `deploy` step in the build job is important so that you don't trigger N builds, where N is your parallelism level.
- We use an API call with `build_parameters[CIRCLE_JOB]=deploy_docker` so that only the `deploy_docker` job will be run.
- **This approach is a temporary workaround for the current features available during Beta.** Soon we'll be adding a much more elegant way to manage multiple jobs.
