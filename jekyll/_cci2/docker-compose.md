---
layout: classic-docs
title: "Using docker-compose"
short-title: "Using docker-compose"
categories: [docker]
order: 2
---

If you use `docker-compose`, you can use it in CircleCI 2.0 as well using the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images). We've prepared an [example project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) to demonstrate it.

You can use the [full config file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) as a template for your own projects. Here, we'll just cover the relevant parts.

In order to use `docker-compose`, you'll need to have it in your [primary container][primary-container]. You can either pre-install it in your custom image (recommended) or install it during the job's execution:

``` YAML
- run:
    name: Install Docker Compose
    command: |
      set -x
      curl -L https://github.com/docker/compose/releases/download/1.11.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
```

To activate the Remote Docker Environment, you need use [this special step]({{ site.baseurl }}/2.0/building-docker-images):

``` YAML
- setup_remote_docker
```

After that, you can use `docker-compose` as usual. You can build images:

``` YAML
docker-compose build
```

Or run the whole system:

``` YAML
docker-compose up -d
```

In our example, we start the whole system, then verify that it's running and responding to requests:

``` YAML
      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

Note that, to interact with a running service, we don't just `curl` it from the [primary-container][primary-container], but instead use docker and a container running in the service's network. This is because your primary container and Remote Docker live in [separate environments]({{ site.baseurl }}/2.0/building-docker-images/#separation-of-environments) and can't communicate directly.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.

[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container
