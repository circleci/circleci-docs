---
layout: classic-docs
title: "Using Docker Authenticated Pulls"
short-title: "Using Docker Authenticated Pulls"
description: "Use Docker authenticated pulls to access private images and avoid rate limits."
categories: [containerization]
order: 50
version:
- Cloud
- Server v2.x
---


This document describes how to authenticate with your Docker registry provider to pull images.

Authenticated pulls allow access to private Docker images.  It may also grant higher rate limits depending on your registry provider.

Starting [November 1, 2020](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/), Docker Hub will impose rate limits based on the originating IP. Since CircleCI runs jobs from a shared pool of IPs, it is highly recommended to use authenticated Docker pulls with Docker Hub to avoid rate limit problems.

For the [Docker]({{ site.baseurl }}/2.0/executor-types/#using-docker) executor, specify username and password in the `auth` field of your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file. To protect the password, place it in a [context]({{ site.baseurl }}/2.0/contexts), or use a per-project Environment Variable.

**Note:** Server customers may instead [setup a pull through Docker Hub registry mirror]({{ site.baseurl }}/2.0/docker-hub-pull-through-mirror/).

**Note:** Contexts are the more flexible option.  CircleCI supports multiple contexts, which is a great way modularize secrets, ensuring jobs can only access what they *need*.

In this example, we grant the "build" job access to Docker credentials context, `docker-hub-creds`, without bloating the existing `build-env-vars` context:

```yaml
workflows:
  my-workflow:
    jobs:
      - build:
          context:
            - build-env-vars
            - docker-hub-creds

jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project environment variable reference
```

You can also use images from a private repository like [gcr.io](https://cloud.google.com/container-registry) or [quay.io](https://quay.io). Make sure to supply the full registry/image URL for the `image` key, and use the appropriate username/password for the `auth` key. For example:

```
- image: quay.io/project/image:tag
  auth:
    username: $QUAY_USERNAME
    password: $QUAY_PASSWORD
```

Alternatively, you can utilize the `machine` executor to achieve the same result using the Docker orb:

``` yaml
version: 2.1
orbs:
  docker: circleci/docker@1.5.0

workflows:
  my-workflow:
    jobs:
      - machine-job:
          context:
            - build-env-vars
            - docker-hub-creds

jobs:
  machine-job:
    machine: true
    steps:
      - docker/check:
          docker-username: mydockerhub-user  # DOCKER_LOGIN is the default value, if it exists, it automatically would be used.
          docker-password: DOCKERHUB_PASSWORD  # DOCKER_PASSWORD is the default value
      - docker/pull:
          images: 'circleci/node:latest'
```

or with cli:

```yaml
version: 2
jobs:
  build:
    machine: true
    working_directory: ~/my_app
    steps:
      # Docker is preinstalled, along with docker-compose
      - checkout

      # start proprietary DB using private Docker image
      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietary-db:1.2.3
```

CircleCI now supports pulling private images from Amazon's ECR service. You can start using private images from ECR in one of two ways:

1. Set your AWS credentials using standard CircleCI private environment variables.
2. Specify your AWS credentials in `.circleci/config.yml` using `aws_auth`:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # can specify string literal values
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # or project UI envar reference
```

Both options are virtually the same, however, the second option enables you to specify the variable name you want for the credentials. This can come in handy where you have different AWS credentials for different infrastructure. For example, let's say your SaaS app runs the speedier tests and deploys to staging infrastructure on every commit while for Git tag pushes, we run the full-blown test suite before deploying to production:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_STAGING
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_STAGING
    steps:
      - run:
          name: "Every Day Tests"
          command: "testing...."
      - run:
          name: "Deploy to Staging Infrastructure"
          command: "something something darkside.... cli"
  deploy:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: $AWS_ACCESS_KEY_ID_PRODUCTION
          aws_secret_access_key: $AWS_SECRET_ACCESS_KEY_PRODUCTION
    steps:
      - run:
          name: "Full Test Suite"
          command: "testing...."
      - run:
          name: "Deploy to Production Infrastructure"
          command: "something something darkside.... cli"

workflows:
  version: 2
  main:
    jobs:
      - build:
          filters:
            tags:
              only: /^\d{4}\.\d+$/
      - deploy:
          requires:
            - build
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^\d{4}\.\d+$/
```

## See Also

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
