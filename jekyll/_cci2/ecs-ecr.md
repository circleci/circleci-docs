---
layout: classic-docs
title: Deploying to AWS ECR/ECS
description: How to deploy to AWS ECR/ECS with CircleCI
---

This document describes
how to deploy to Amazon Elastic Container Service (ECS) from Amazon Elastic Container Registry (ECR)
using CircleCI.

* TOC
{:toc}

## Overview

There are three main parts of this guide:

- Build and test a Dockerized web application.
- Push the Docker image to ECR.
- Use AWS Fargate to deploy to ECS.

The application is [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)
and is [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

## Prerequisites

- set up an ECS cluster
- set up ECR --> repo URL prefixed with AWS Account ID
- set CircleCI env vars
  - AWS_ACCESS_KEY_ID
  - AWS_ACCOUNT_ID
  - AWS_REGION
  - AWS_SECRET_ACCESS_KEY

## Configuration

```yaml
version: 2
jobs:
  build:
    ...
  test:
    ...
  deploy:
    docker:
      - image: <pick-an-image>
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Install AWS CLI
      - run:
          name: Build Docker image locally
      - run:
          name: Log into AWS ECR
      - run:
          name: Tag and push Docker image to ECR
      - run:
          name: Create task for deploy
      - run:
          name: Register task definition
      - run:
          name: Find revision number
      - run:
          name: Deploy specific revision
```
