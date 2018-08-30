---
layout: classic-docs
title: Deploying to AWS ECR/ECS
description: How to Deploy to AWS ECR/ECS With CircleCI
---

## Overview

- what is AWS ECR/ECS?
- why would you use it with CircleCI?

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
          name: Log into AWS ECR
      - run:
          name: Build, tag and push Docker image to ECR
      - run:
          name: Create task for deploy
      - run:
          name: Register task definition
      - run:
          name: Find revision number
      - run:
          name: Deploy specific revision
```

## Steps

## Next Steps
