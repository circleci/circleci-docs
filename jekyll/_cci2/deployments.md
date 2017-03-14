---
layout: classic-docs
title: "Deployments"
short-title: "Deployments"
categories: [configuring-jobs]
order: 98
---

There are two standard ways to do deployment in 2.0: using a [deploy]({{ site.baseurl }}/2.0/configuration-reference/#deploy) step and triggering a deploy job.

## Using a Deploy Step

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

The above is an example of configuring your job to do deployment by using a `deploy` step with some pseudo commands.

The most important part to be stressed in the example is that we are checking whether the current branch is `master` branch.

```
command: |
  if [ "${CIRCLE_BRANCH}" == "master" ]; then
    ...
  fi
```

Without this checking, `<your-deploy-commands>` will be executed every time this job is triggered.

To learn more about `deploy` step, please checkout our [doc]({{ site.baseurl }}/2.0/configuration-reference/#deploy).

## Triggering a Deploy Job

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

The above is an example of triggering a deploy job to do the deployment. In this example, we are triggering a `deploy` job by calling CircleCI REST API with curl. The `deploy` job then will do the actual deployment.

You may get puzzled at the first glance of this example: *why do I need to define a `deploy` job and trigger it if I can do the actual deployment in the `deploy` step of the `build` job?*

This deployment pattern is useful when you want to use a different executor type in the `deploy` job. In our example, we are using a machine executor with `machine:true` in order to push a new Docker image which is not possible in `docker` executor. Please checkout our [doc]({{ site.baseurl }}/2.0/executor-types/) to learn more about the differences between the executors.

Finally, there are a few things to be noted in the example:

- You need to get an API token and store it in `CIRCLE_API_TOKEN` environment variable from the project setting page.
- You need to replace `<vcs-type>/<org>/<repo>` with your own. **Please note that `<vc-types>` part is either `github` or `bitbucket` as of the writing of this page.**
- Your image, `my-image` in this case, must have `curl` pre-installed.
