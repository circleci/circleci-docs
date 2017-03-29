---
layout: classic-docs
title: "Using Private Images and Docker Registries"
short-title: "Using Private Images"
description: "How to use private images with the Remote Docker Environment"
categories: [docker]
order: 1
---

Using private images isn’t directly supported by the [Docker Executor]({{ site.baseurl }}/2.0/executor-types/#docker-executor). However, you _can_ use the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images/).

If your application requires a proprietary DB for testing, for example:

```YAML
version: 2
jobs:
  build:
    docker:
      - image: docker:1.13.1-git
    working_directory: ~/my_app
    steps:
      - checkout
      - setup_remote_docker

      # start proprietary DB using private Docker image
      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietery-db:1.2.3

      # build and test application
      - run: |
          docker build -t my-app .
          # assuming that our app expects to have DB on localhost
          docker run --network container:db my-app test
```

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
