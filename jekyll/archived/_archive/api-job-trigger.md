---
layout: classic-docs
title: "Using the API to Trigger Jobs"
short-title: "Using the API to Trigger Jobs"
description: "How to define and trigger non-build jobs"
order: 80
version:
- Cloud
- Server v3.x
- Server v2.x
---


This document describes how to trigger jobs using the CircleCI API.

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ Heads up!</span></p>
  <span> This document refers to using the legacy CircleCI API 1.0, a service that will be eventually be deprecated in favor of the <a href="https://circleci.com/docs/api/v2/">V2 API</a>. Consider using the <a href="https://circleci.com/docs/api/v2/#trigger-a-new-pipeline">Pipelines</a> endpoints to trigger pipelines.</span>
</div>


* TOC
{:toc}

## Overview
{: #overview }

Use the [CircleCI API](https://circleci.com/docs/api/v1/#trigger-a-new-job) to trigger [jobs]({{ site.baseurl }}/2.0/jobs-steps/#jobs-overview) that you have defined in `.circleci/config.yml`.

The following example shows how to trigger the `deploy_docker` job by using `curl`.

```shell
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d 'build_parameters[CIRCLE_JOB]=deploy_docker' \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

Alternative syntaxes for the above example:
- Replace single quotes with double quotes (`-d "build_parameters[CIRCLE_JOB]=deploy_docker"`)
- Escape the square brackets (`-d build_parameters\[CIRCLE_JOB\]=deploy_docker`)

Some notes on the variables used in this example:
- `CIRCLE_API_USER_TOKEN` is a [personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).
- `<vcs-type>` is a placeholder variable and refers to your chosen VCS (either `github` or `bitbucket`).
- `<org>` is a placeholder variable and refers to the name of your CircleCI organization.
- `<repo>` is a placeholder variable and refers to the name of your repository.
- `<branch>` is a placeholder variable and refers to the name of your branch.

For a complete reference of the API, see the [CircleCI API Documentation](https://circleci.com/docs/api/v2/#section=reference).

**Important Considerations When Triggering A Job Via The API**

- Jobs triggered with the API may contain a `workflows` section
- Your workflow does **not** have to reference the job you triggered with the API
- Jobs that are triggered via the API do **not** have access to environment variables created for [a CircleCI Context]({{ site.baseurl }}/2.0/contexts/)
- If you wish to use environment variables they have to be defined at the [Project level]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)
- It is currently not possible to trigger a single job if you are using CircleCI 2.1 and Workflows
- It is possible to trigger [workflows]({{ site.baseurl }}/2.0/workflows/) with the CircleCI API: a [singular workflow can be re-run](https://circleci.com/docs/api/v2/#rerun-a-workflow), or you may [trigger a pipeline](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline) which will run its subsequent workflows.

## Conditionally running jobs with the API
{: #conditionally-running-jobs-with-the-api }

The next example demonstrates a configuration for building docker images with `setup_remote_docker` only for builds that should be deployed.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.4.0-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          LANG: C.UTF-8
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
              curl --user ${CIRCLE_API_USER_TOKEN}: \
                --data 'build_parameters[CIRCLE_JOB]=deploy_docker' \
                --data revision=$CIRCLE_SHA1 \
                https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/tree/$CIRCLE_BRANCH
            fi

  deploy_docker:
    docker:
      - image: ruby:2.4.0-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /
    steps:
      - setup_remote_docker
      - run: echo "deploy section running"
```

Notes on the above example:

- Using the `deploy` step in the build job is important to prevent triggering N builds, where N is your parallelism value - `deploy` is a special step that will only run on one container, even when the job parallelism is set greater that one.
- We use an API call with `build_parameters[CIRCLE_JOB]=deploy_docker` so that only the `deploy_docker` job will be run.

## See also
{: #see-also }

[Triggers]({{ site.baseurl }}/2.0/triggers/)
