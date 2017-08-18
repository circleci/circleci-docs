---
layout: classic-docs
title: "Using Private Images"
short-title: "Using Private Images"
description: "How to use private images with the Remote Docker Environment"
categories: [containerization]
order: 50
---

To use private images, specify the username and password in the `auth` field.  To protect the password, create an Environment Variable in the CircleCI Project Settings page, and then reference it:

```YAML
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project environment variable reference
```


Alternatively, you can utilize the `machine` executor to achieve the same thing:

```
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
