---
layout: classic-docs
title: "Defining Multiple Jobs"
short-title: "Defining Multiple Jobs"
categories: [configuring-jobs]
order: 98
---

You can define jobs in your config other than `build`.

## Defining Jobs

You can define as many jobs as you wish in your config. You can also name your jobs as you like.

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

Each job can have a different set of configurations. To illustrate this, we use `docker` executor in `build` job and `machine` executor in `deploy_staging` and `deploy_production` jobs in the example above.

## Triggering Jobs

`build` job is the default job and the only one that CircleCI runs automatically. In other words, CircleCI won't run `deploying_staging` and `deploy_production` when you push.

Currently, the only way to run these jobs is calling API like the following.

```YAML
curl -u ${CIRCLE_API_TOKEN}: \
     -d build_parameters[CIRCLE_JOB]=deploy_production \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/master
```

The above example shows how to trigger a `deploy_production` job by using `curl`.

A few notes about this example:

- `CIRCLE_API_TOKEN` should be the API token from your project's setting page.
- `<vcs-type>/<org>/<repo>` should be replaced with your own VCS and org/repo names; at time of writing, `<vcs-types>` must be either `github` or `bitbucket`.
