---
layout: classic-docs
title: "Using Private Images"
short-title: "Using Private Images"
description: "How to use private images with the Remote Docker Environment"
categories: [containerization]
order: 50
---

To use private images, specify the username and password in the `auth` field.  To protect the password, create an Environment Variable in the CircleCI Project Settings page and then reference it:

```YAML
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # can specify string literal values
          password: $DOCKERHUB_PASSWORD  # or project environment variable reference
```

The following is an example of an application that requires a private image called `proprietary-db` for testing:

```
version: 2
jobs:
  build:
    docker:
      - image: docker:1.13.1-git
    working_directory: ~/my_app
    steps:
      - checkout

      # start proprietary DB using private Docker image
      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietary-db:1.2.3

      # build and test application
      - run: |
          docker build -t my-app .
          # assuming that our app expects to have DB on localhost
          docker run --network container:db my-app test
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

      # build and test application
      - run: |
          docker build -t my-app .
          # assuming that our app expects to have DB on localhost
          docker run --network container:db my-app test
```          
