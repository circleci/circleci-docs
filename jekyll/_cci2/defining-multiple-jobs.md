---
layout: classic-docs
title: "Defining Multiple Jobs"
short-title: "Defining Multiple Jobs"
categories: [configuring-jobs]
order: 98
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
