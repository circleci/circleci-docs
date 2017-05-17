---
layout: classic-docs
title: "2.0 Docs (Beta)"
description: "Landing page for CircleCI 2.0"
permalink: /2.0/
---

Welcome to CircleCI 2.0 Beta! The Beta release of CircleCI 2.0 includes many improvements for faster performance and greater control. 

## Programming Language Support

Code that builds on Linux will generally build on CircleCI 2.0. For some language versions, CircleCI provides demo applications and Docker images for primary container use, as follows: 

- Clojure 1.8 and later, see https://github.com/circleci/cci-demo-clojure and https://hub.docker.com/r/circleci/clojure
- Go 1.7 and later, see https://github.com/circleci/cci-demo-go and https://hub.docker.com/r/circleci/golang
- Node.js 4 and later, see https://github.com/circleci/cci-demo-react and https://hub.docker.com/r/circleci/node
- PHP 5 and later, see https://github.com/circleci/cci-demo-lumen and https://hub.docker.com/r/circleci/php
- Python 2 and later, see https://github.com/circleci/cci-demo-flask and https://hub.docker.com/r/circleci/python
- Ruby 2 and later, see https://github.com/circleci/cci-demo-rails and https://hub.docker.com/r/circleci/ruby 

In addition, CircleCI provides Docker database images for use as a secondary service container:

- MongoDB 3 and later, see https://hub.docker.com/r/circleci/mongo
- MySQL 5 and later, see https://hub.docker.com/r/circleci/mysql
- PostgreSQL 9 and later, see https://hub.docker.com/r/circleci/postgres

Build projects in C, C#, C++, Clojure, Elixir, Erlang, Go, Groovy, Haskell, Haxe, Java, Javascript, Node.js, Perl, PHP, Python, Ruby, Rust, Scala and many more. 

## Faster Performance with 2.0

- Infrastructure upgrades resulting in significant performance improvements that reduce overall time to build, test, and deploy for all platforms at scale. [Join the CircleCI 2.0 Beta](https://circleci.com/beta-access/) to access the latest features. 

- Caching of images, source code, dependencies, custom caches, and save/restore points throughout jobs for increased speed. See [Caching in CircleCI]({{ site.baseurl }}/2.0/caching/) for details.

## Greater Control with 2.0

- Implementation of first-class Docker support for nearly all public Docker images, layer caching, compose, public or private registries, and runtime metrics. See [Using Docker Compose]({{ site.baseurl }}/2.0/docker-compose/) for the steps.

- Availability of *CircleCI Images* on Dockerhub that include pre-installed dependencies, test tools, Git, and SSH to save  time getting started with the most popular languages and databases. See the [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) document for an overview of the available images and how to add them to the `config.yml` file. 

- Ability to create custom images or compose multiple images together to minimize build failures related to unexpected image updates. See [Building Custom Images for Docker Executor]({{ site.baseurl }}/2.0/custom-images/) for instructions.

- Increased flexibility of CPU and RAM limits for premium users. 

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
