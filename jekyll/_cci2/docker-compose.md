---
layout: classic-docs
title: "Using docker-compose"
short-title: "Using docker-compose"
categories: [docker]
order: 2
---

If you use `docker-compose` for your dev environment you can use it in CircleCI 2.0 as well using [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images). We've prepared an [example project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) to demonstrate it.

You can examine [full config file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) and use it as template. Here we'll cover relevant parts.

In order to work with `docker-compose` you'll need to have it your [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container). You can have it pre-installed in your custom image (recommended) or install it during the job execution:

``` YAML
- run:
    name: Install Docker Compose
    command: |
      set -x
      curl -L https://github.com/docker/compose/releases/download/1.11.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
```

To active Remote Docker Environment you need to have a special step ([read more]({{ site.baseurl }}/2.0/building-docker-images)):

``` YAML
- setup_docker_engine
```

After that you can use `docker-compose` as usual. You can build images:

``` YAML
docker-compose build
```

Or run whole system:

``` YAML
docker-compose up -d
```

In out example we start whole system and verify it's running and responding to requests:

``` YAML
      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

Notice that to interact with a running service we don't just "curl" it from [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) but do it using docker and container running in the same network as our service. This is because an environment of primary container and Remote Docker is separated and cannot communicate directly. Read more about [separation of environments]({{ site.baseurl }}/2.0/building-docker-images/#separation-of-environments).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
