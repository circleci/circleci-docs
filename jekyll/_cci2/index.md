---
layout: classic-docs
title: "2.0 Docs (Beta)"
description: "Landing page for CircleCI 2.0"
permalink: /2.0/
---

Welcome to CircleCI 2.0 Beta! The Beta release of CircleCI 2.0 includes many improvements for performance, default Docker setup, and customization. 

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

## 2.0 Performance Improvements

- Infrastructure upgrades resulting in significant performance improvements that reduce overall time to build, test, and deploy for all platforms at scale. Refer to the [CircleCI Pricing](https://circleci.com/pricing/) page for build container pricing or to contact a sales representative. 

- Caching of images, source code, dependencies, custom caches, and save/restore points throughout jobs for increased speed. See [Caching in CircleCI]({{ site.baseurl }}/2.0/caching/) for details.

## 2.0 Docker Support

- Implementation of first-class Docker support for nearly all public Docker images, layer caching, compose, public or private registries, and runtime metrics. See [Using Docker Compose]({{ site.baseurl }}/2.0/docker-compose/) for the steps.

- *CircleCI Images* on Dockerhub that include pre-installed dependencies, test tools, Git and SSH to save you time getting started with the most popular languages and databases. See the [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) document for an overview of the available images and how to add them to the 'config.yml' file.

## 2.0 Customization 

- Ability to create custom images or compose multiple images together to minimize build failures related to unexpected image updates. See [Building Custom Images for Docker Executor]({{ site.baseurl }}/2.0/custom-images/) for instructions.

- Configuration of compute and memory to fit business needs, increasing the CPU and RAM limits for premium users. 

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
