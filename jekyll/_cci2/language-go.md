---
layout: classic-docs
title: "Language Guide: Go"
short-title: "Go"
description: "Building and Testing with Go (Golang) on CircleCI"
categories: [language-guides]
order: 3
version:
- Cloud
- Server v3.x
- Server v2.x
---

CircleCI supports building Go projects using any version of Go that can be
installed in a Docker image. If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) in your project’s root directory and start building.

* TOC
{:toc}

## Quickstart: Demo Go reference project
{: #quickstart-demo-go-reference-project }

We maintain a reference Go project to show how to build on CircleCI:

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project on GitHub</a>
- [Demo Go Project building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI with Go projects.


## Sample configuration
{: #sample-configuration }

{% raw %}

```yaml
version: 2
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    parallelism: 2

    environment: # environment variables for the build itself
      TEST_RESULTS: /tmp/test-results # path to where test results will be saved

    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      - run: mkdir -p $TEST_RESULTS # create the test results directory

      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}

      #  Wait for Postgres to be ready before proceeding
      - run:
          name: Waiting for Postgres to be ready
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: Run unit tests
          environment: # environment variables for the database url and path to migration files
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations

          # store the results of our tests in the $TEST_RESULTS directory
          command: |
            PACKAGE_NAMES=$(go list ./... | circleci tests split --split-by=timings --timings-type=classname)
            gotestsum --junitfile ${TEST_RESULTS}/gotestsum-report.xml -- $PACKAGE_NAMES

      - run: make # pull and build dependencies for the project

      - save_cache:
          key: go-mod-v4-{{ checksum "go.sum" }}
          paths:
            - "/go/pkg/mod"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts

      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
workflows:
  version: 2
  build-workflow:
    jobs:
      - build
```

{% endraw %}

### Pre-built CircleCI Docker images
{: #pre-built-circleci-docker-images }
{:.no_toc}

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the version you need from Docker Hub: <https://hub.docker.com/r/circleci/golang/>. The demo project uses an official CircleCI image.

### Build the demo project yourself
{: #build-the-demo-project-yourself }
{:.no_toc}

A good way to start using CircleCI is to build a project yourself. Here's how to build the <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project</a> with your own account:

1. Fork the <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project on GitHub</a> to your own account
2. Go to the [**Projects**](https://app.circleci.com/projects/){:rel="nofollow"} dashboard in the CircleCI app and click the **Follow Project** button next to the project you just forked.
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

If you want to test your changes locally, use [our CLI tool]({{site.baseurl}}/local-cli/) and run `circleci build`.

---

## Config walkthrough
{: #config-walkthrough }

This section explains the commands in `.circleci/config.yml`

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

Next, we have a `jobs` key. If we do not use workflows and have only one job, it must be named `build`. Below, our job specifies to use the `docker` executor as well as the CircleCI created docker-image for golang 1.12. Next, we use a *secondary image* so that our job can also make use of Postgres. Finally, we use the `environment` key to specify environment variables for the Postgres container.


```yaml
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test
```

After setting up Docker we will set an environment variable to store the path to
our test results. Note, this environment variable is set for the entirety of the _job_ whereas the environment variables set for `POSTGRES_USER` and `POSTGRES_DB` are specifically for the Postgres container.

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

Now we need to add several `steps` within the `build` job. Steps make up the bulk of a job.

Use the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) step
to check out source code.

```yaml
    steps:
      - checkout
```

Next we create a directory for collecting test results

```yaml
      - run: mkdir -p $TEST_RESULTS
```

Then we pull down the cache (if present). If this is your first run, this won't do anything.

{% raw %}
```yaml
      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}
```
{% endraw %}

And install the Go implementation of the JUnit reporting tool and other dependencies for our application. These are good candidates to be pre-installed in primary container.

Both containers (primary and postgres) start simultaneously. Postgres, however, may require some time to get ready. If our tests start before Postgres is available, the job will fail. It is good practice to wait until dependent services are ready; in this example Postgres is the only dependent service.

```yaml
      - run:
          name: Waiting for Postgres to be ready
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
```

Now we run our tests. To do that, we need to set an environment variable for our database's URL and path to the DB migrations files. This step has some additional commands, we'll explain them below.

{% raw %}
```yaml
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: |
            PACKAGE_NAMES=$(go list ./... | circleci tests split --split-by=timings --timings-type=classname)
            gotestsum --junitfile ${TEST_RESULTS}/gotestsum-report.xml -- $PACKAGE_NAMES
```
{% endraw %}

The command for running unit tests is more complicated than some of our other
steps. Here we are using [test splitting]({{ site.baseurl
}}/parallelism-faster-jobs/#splitting-test-files) to allocate resources across parallel containers. Test splitting can help speed up your pipeline if your project has a large test suite.

Next we run our actual build command using `make` - the Go sample project uses make to run build commands. If this build happens to pull in new dependencies, we will cache them in the `save_cache` step.

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build
```


Now we will start the Postgres dependent service, using `curl` to ping it to validate that the service is up and running.

{% raw %}
```yaml
      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts
```
{% endraw %}

If all went well, the service ran and successfully responded to the post request at `localhost:8080`.

Finally, let's specify a path to store the results of the tests. The
`store_test_results` step allows you to leverage insights to view how your test
results are doing over time, while using the `store_artifacts` step allows you
to upload any type of file; in this case, also the test logs if one would like
to inspect them manually.

```yaml
      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
```


Finally, we specify the workflow block. This is not mandatory (as we only have one job to sequence) but it is recommended.

```yaml

workflows:
  version: 2
  build-workflow: # the name of our workflow
    jobs: # the jobs that we are sequencing.
      - build
```

Success! You just set up CircleCI for a Go app. Check out our [Job page](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"} to see how this looks when building on CircleCI.

## See also
{: #see-also }

See the [Deployment overview]({{site.baseurl}}/deployment-overview#next-steps/) document for links to various target configuration examples.

How to use [workflows]({{ site.baseurl }}/workflows), which are particularly useful for optimizing your pipelines and orchestrating more complex projects.

Refer to the [Caching Dependencies]({{ site.baseurl }}/caching/) document for more caching strategies.
