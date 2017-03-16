---
layout: classic-docs
title: "Deployments"
short-title: "Deployments"
categories: [configuring-jobs]
order: 6
---

There are 2 standard ways to deploy in 2.0:

- use a [deploy step][deploy-step]
- trigger a deploy job

## Use a Deploy Step

```YAML
version: 2
jobs:
  build:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run: <do-some-stuff>
      - deploy:
          name: Maybe Deploy
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              <your-deploy-commands>
            fi
```

The above example shows how to configure your job to deploy using a `deploy` step with some pseudo commands.

The most important piece of this example is that we're checking whether the current branch is the `master` branch.

```
command: |
  if [ "${CIRCLE_BRANCH}" == "master" ]; then
    ...
  fi
```

Without this check, `<your-deploy-commands>` will be executed every time this job is triggered.

To learn more about the `deploy` step, please check out our [documentation][deploy-step].

## Trigger a Deploy Job

```YAML
version: 2
jobs:
  build:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run: <do-some-stuff>
      - deploy:
          name: Maybe Triggering Deploy Job
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
                curl -u ${CIRCLE_API_TOKEN}: \
                     -d build_parameters[CIRCLE_JOB]=deploy \
                     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/master
            else
                echo 'Not deploying...'
            fi
  deploy:
    machine: true
    working_directory: /tmp/my-project
    steps:
      - checkout
      - deploy:
          name: Do Deployment
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
               docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
               docker build -i new-image .
               docker push new-image
            else
               echo 'You are trying to deploy from a non-master branch!'
            fi
```

The above example shows how to trigger a `deploy` job for the deployment. Here, we're triggering the job by calling the CircleCI REST API with `curl`. The `deploy` job will then do the actual deployment. We have to manually trigger this `deploy` job because `build` is the only job CircleCI currently runs automatically.

To learn more about jobs, check out our [documentation]({{ site.baseurl }}/2.0/configuration-reference/#jobs).

A few notes about this example:

- `CIRCLE_API_TOKEN` should be the API token from your project's setting page.
- `<vcs-type>/<org>/<repo>` should be replaced with your own VCS and org/repo names; at time of writing, `<vcs-types>` must be either `github` or `bitbucket`.
- `my-image` should have `curl` pre-installed

It might seem strange that you need to define a `deploy` job and trigger it if you can do the actual deployment in the `deploy` step of the `build` job.

But this deployment pattern is useful when you want to use a different executor type in the `deploy` job. In our example, we're using a machine executor with `machine: true` to push a new Docker image; this isn't possible with the `docker` executor.

To learn more about the different executor types, check out our [documentation]({{ site.baseurl }}/2.0/executor-types/).

[deploy-step]: {{ site.baseurl }}/2.0/configuration-reference/#deploy
