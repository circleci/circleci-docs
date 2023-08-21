---
layout: classic-docs
title: Concepts
short-title: Concepts
description: CircleCI concepts
categories: [getting-started]
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Introduction
{: #introduction }

This guide introduces some basic concepts to help you understand how CircleCI manages your CI/CD pipelines.

## Concurrency
{: #concurrency }

In CircleCI, *concurrency* refers to utilizing multiple containers to run multiple jobs at the same time. To keep the system stable for all CircleCI customers, we implement different soft concurrency limits on each of the [resource classes](/docs/configuration-reference/#resource_class) for different executors. If you are experiencing queueing on your jobs, it is possible you are hitting these limits. Customers on annual plans can request an increase to those limits at no extra charge.

See the [Concurrency](/docs/concurrency/) page for more information.

## Configuration
{: #configuration }

CircleCI believes in *configuration as code*. Your entire CI/CD process is orchestrated through a single file called `config.yml`. The `config.yml` file is located in a folder called `.circleci` at the root of your project that defines the entire pipeline.

Example of a directory setup using CircleCI:

```shell
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

Your CircleCI configuration can be adapted to fit many different needs of your project. The following terms, sorted in order of granularity and dependence, describe the components of most common CircleCI projects:

- **[Pipeline](#pipelines)**: Represents the entirety of your configuration.
- **[Workflows](#workflows)**: Responsible for orchestrating multiple _jobs_.
- **[Jobs](#jobs)**: Responsible for running a series of _steps_ that perform commands.
- **[Steps](#steps)**: Run commands (such as installing dependencies or running tests) and shell scripts to do the work required for your project.

The following illustration uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various configuration elements:

![configuration elements]({{site.baseurl}}/assets/img/docs/config-elements.png)

CircleCI configurations use YAML. See the [Introduction to YAML configurations](/docs/introduction-to-yaml-configurations) page for basic guidance. For a full overview of what is possible in a configuration file, see the [Configuration reference](/docs/configuration-reference) page.

## Contexts
{: #contexts }

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime. After a context has been created, you can use the `context` key in the workflows section of a project's `.circleci/config.yml` file to give any job(s) access to the environment variables associated with the context.

![Contexts Overview]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

See the [Using contexts]({{site.baseurl}}/contexts/) page for more information.

## Data Persistence
{: #data-persistence }

Data persistence allows you to move data between jobs and speed up your build. There are three main methods for persisting data in CircleCI: artifacts, caches, and workspaces.

![workflow illustration]({{site.baseurl}}/assets/img/docs/workspaces.png)

Note the following distinctions between artifacts, caches and workspaces:

Type       | Lifetime             | Use                                | Example
-----------|----------------------|------------------------------------|--------
Artifacts  | Months               | Preserve long-term artifacts.      |  Available in the Artifacts tab of the **Job** page under the `tmp/circle-artifacts.<hash>/container` or similar directory.
Caches     | Months               | Store non-vital data that may help the job run faster, for example npm or Gem packages. | The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision). Restore the cache with `restore_cache` and the appropriate `key`.
Workspaces | Duration of workflow | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and recreates the entire workspace content when it runs.
{: class="table table-striped"}

See [Persisting data in workflows: When to use caching, artifacts, and workspaces guide](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces) for additional conceptual information about using artifacts, caches, and workspaces.

### Artifacts
{: #artifacts }

Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.

{% raw %}
```yaml
version: 2.1

jobs:
  build1:
#...
    steps:
      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace for use in downstream job. Must be an absolute path,
      # or relative path from working_directory. This is a directory on the container which is
      # taken to be the root directory of the workspace.
          root: workspace
            # Must be relative path from root
          paths:
            - echo-output

  build2:
#...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
          at: /tmp/workspace
  build3:
#...
    steps:
      - store_artifacts: # See circleci.com/docs/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```
{% endraw %}

See the [Storing build artifacts](/docs/artifacts) page for more information.

### Caches
{: #caches }

A cache stores a file or directory of files such as dependencies or source code in object storage. To speed up the build, each job may contain special steps for caching dependencies from previous jobs.

If you need to clear your cache, refer to the [Caching dependencies](/docs/caching/#clearing-cache) page for more information.

{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/executor-intro/ for a comparison
    # and more examples.
      - image: cimg/ruby:2.4-node
      - image: cimg/postgres:9.4.12
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
      - image: cimg/postgres:9.4.12
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```
{% endraw %}

For more information see the [Caching dependencies](/docs/caching) and [Caching strategies](/docs/caching-strategy) pages.

### Workspaces
{: #workspaces }

Workspaces are a workflow-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs. Each workflow has a temporary workspace associated with it. The workspace can be used to pass along unique data built during a job to other jobs in the same workflow.

See the [Using workspaces](/docs/workspaces) page for more information.

## Docker Layer Caching
{: #docker-layer-caching }

Docker layer caching (DLC) caches the individual layers of Docker images built during your CircleCI jobs. Any unchanged layers are used on subsequent runs, rather than rebuilding the image each time.

In the `.circle/config.yml` snippet below, the `build_elixir` job builds an image using the `ubuntu-2004:202104-01` Dockerfile. Adding `docker_layer_caching: true` below the `machine` executor key ensures CircleCI saves each Docker image layer as the Elixir image is built.

```yaml
version: 2.1

jobs:
  build_elixir:
    machine:
      image: ubuntu-2004:202104-01
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: build Elixir image
          command: docker build -t circleci/elixir:example .
```

On subsequent commits, if the Dockerfile has not changed, DLC pulls each Docker image layer from cache during the `build Elixir image` step and the image builds significantly faster.

See the [Docker layer caching](/docs/docker-layer-caching) page for more information.


## Dynamic Configuration
{: #dynamic-configuration }

Instead of manually creating your configuration for each CircleCI project, you can generate this configuration dynamically, based on specific pipeline parameters or file paths. This is especially helpful where your team is working on a monorepo (or a single repository). Dynamic configuration allows you to trigger builds from *specific* parts of your project, rather than rebuilding everything each time.

See the [Dynamic configuration](/docs/dynamic-config) page for more information.

## Execution environments
{: #execution-environments }

Each separate job defined within your configuration runs in a unique execution environment, known as executors. An executor can be a Docker container, or a virtual machine running Linux, Windows, or macOS. In some of these instances, you can set up an environment using GPU, or Arm. CircleCI also provides a machine-based and container-based self-hosted runner solution.

![Illustration of a CircleCI job]( {{site.baseurl}}/assets/img/docs/executor_types.png)

An _image_ is a packaged system that includes instructions for creating a running container or virtual machine, and you can define an image for each executor. CircleCI provides a range of images for use with the Docker executor, called _convenience images_ (details in the [images](#images) section).

{% include snippets/docker-auth.md %}

{:.tab.executors.Cloud}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
     - image: postgres:14.2 # Specifies the database image
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 20.04 image with Docker 20.10.12
   # and docker-compose 1.29.2, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-2004:202201-02
#...
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
     xcode: "12.5.1"
# ...
```

{:.tab.executors.Server_3}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
     - image: postgres:14.2 # Specifies the database image
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: true
   # Contact your system administrator for details of the image.
#...
```

The primary container is defined by the first image listed in `.circleci/config.yml` file. This is where commands are executed. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. Further images can be added to spin up secondary/service containers.

For added security when using the Docker executor and running Docker commands, the `setup_remote_docker` key can be used to spin up another Docker container in which to run these commands. For more information see the [Running Docker commands](/docs/building-docker-images/#accessing-the-remote-docker-environment) page.

For more information, see the [Execution environments overview](/docs/executor-intro) page.

## Images
{: #images }

An image is a packaged system that includes instructions for creating a running container. The primary container is defined by the first image listed in a `.circleci/config.yml` file. This is where commands are executed for jobs, using the Docker or machine executor.

The **Docker executor** spins up a container with a Docker image. CircleCI maintains [convenience images](/docs/circleci-images) for popular languages on Docker Hub.

{% include snippets/docker-auth.md %}

The **machine executor** spins up a complete Ubuntu virtual machine image, giving you full access to OS resources and complete control over the job environment. For more information, see the [Using machine](/docs/configuration-reference#machine) page.

 ```yaml
 version: 2.1
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: cimg/base:2022.04-20.04
       - image: postgres:14.2 # Specifies the database image
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: user
...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 20.04 image.
     # The image uses the current tag, which always points to the most recent
     # supported release. If stability and determinism are crucial for your CI
     # pipeline, use a release date tag with your image, e.g. ubuntu-2004:202201-02
       image: ubuntu-2004:current
...
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 12.5.1
       xcode: "12.5.1"
 ...
 ```

 See the [Images](/docs/circleci-images) page for more information.

## Jobs
{: #jobs }

Jobs are the building blocks of your configuration. Jobs are collections of [steps](#steps), which run commands/scripts as required. Each job must declare an executor that is either `docker`, `machine`, `windows`, or `macos`. For `docker` you must [specify an image](/docs/executor-intro#docker) to use for the primary container. For `macos` you must specify an [Xcode version](/docs/executor-intro#macos). For `windows` you must use the [Windows orb](/docs/executor-intro#windows).

![Illustration of a CircleCI job]({{site.baseurl}}/assets/img/docs/job.png)

See the [Jobs and steps](/docs/jobs-steps) page for more information.

## Orbs
{: #orbs }

Orbs are reusable snippets of code that help automate repeated processes, accelerate project setup, and make it easy to integrate with third-party tools.

The illustration in the [Configuration](#configuration) section showing an example Java configuration could be simplified using orbs. The following illustration demonstrates a simplified configuration with [the Maven orb](https://circleci.com/developer/orbs/orb/circleci/maven). Here, the orb sets up a default executor that can execute steps with Maven and run a common job (`maven/test`).

<!-- Turn this into a config snippet -->
![Configuration using Maven orb]({{site.baseurl}}/assets/img/docs/config-elements-orbs.png)

See [Using orbs](/docs/orb-concepts) for details on how to use orbs in your configuration and an introduction to orb design. Visit the [Orbs registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your configuration.

## Parallelism
{: #parallelism }

The more tests your project involves, the longer it takes for them to complete on a single machine. With _parallelism_, you can spread your tests across a specified number of separate executors.

Test suites are conventionally defined at the [job](/docs/jobs-steps#sample-configuration-with-concurrent-jobs) level in your `.circleci/config.yml` file. The `parallelism` key specifies how many independent executors will be set up to run the steps of a job.

To run a job's steps in parallel, set the `parallelism` key to a value greater than `1`.

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/<language>:<version TAG>
    parallelism: 4
```

![Executor types with parallelism]({{site.baseurl}}/assets/img/docs/executor_types_plus_parallelism.png)

See [Running tests in parallel](/docs/parallelism-faster-jobs) page for more information.

## Pipelines
{: #pipelines }

A CircleCI pipeline is the full set of processes you run when you trigger work on your projects. Pipelines encompass your workflows, which in turn coordinate your jobs. This is all defined in your project [configuration file](#configuration).

Pipelines represent methods for interacting with your configuration:

{% include snippets/pipelines-benefits.adoc %}

See the [Pipelines overview](/docs/pipelines) page for more information.

## Projects
{: #projects }

For [GitHub OAuth](/docs/github-integration/) and [Bitbucket](/docs/bitbucket-integration/) accounts, a _project_ in CircleCI is tied to, and shares the name of the associated code repository in your VCS.

For [GitHub App](/docs/github-apps-integration/) and [GitLab](/docs/gitlab-integration/) users, a _project_ in CircleCI is standalone. You name your project and then connect your code (in your GitHub or GitLab repository) to that project. A standalone project can have:

* One or more configurations (pipeline definitions), including, but not limited to, a `.circleci/config.yml` file in the repo associated with the project.
* One or more triggers (events from a source of change), including, but not limited to, a VCS. A trigger determines which configuration it should use to start a pipeline.

Select **Projects** in the CircleCI web app sidebar to enter the projects dashboard. On the dashboard, you can set up and follow any project you have access to. There are two options:

* _Set Up_ or _Create_ any project that you are the owner of in your VCS.
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications](/docs/notifications/) for the project's status.

![Project dashboard]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

## Resource class
{: #resource-class}

A resource class is a configuration option that allows you to control available compute resources (CPU and RAM) for your jobs. When you specify an execution environment for a job, a default resource class value for the environment will be set _unless_ you define the resource class in your configuration. It is best practice to define the resource class, as opposed to relying on a default.

The example below shows how to define a resource class in the Docker execution environment.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:current
    # resource class declaration
    resource_class: large
```

Examples for all execution environments are available on the following pages:

* [Using the Docker execution environment](/docs/using-docker)
* [Using the LinuxVM execution environment](/docs/using-linuxvm)
* [Using the macOS execution environment](/docs/using-macos)
* [Using the Windows execution environment](/docs/using-windows)
* [Using the GPU execution environment](/docs/using-gpu)
* [Using the Arm execution environment](/docs/using-arm)

Pricing and plans information for the various resource classes can be found on the [Resource classes](https://circleci.com/product/features/resource-classes/) product page.

The `resource_class` key is also used to configure a [self-hosted runner instance](/docs/runner-concepts#namespaces-and-resource-classes).

## Steps
{: #steps }

 Steps are a collection of the executable commands required to complete your job. For example, the [`checkout`](/docs/configuration-reference#checkout) step (which is a built-in step available across all CircleCI projects) checks out the source code for a job over SSH. The `run` step allows you to run custom commands, such as executing the command `make test`, using a non-login shell by default. Commands can also be defined [outside the job declaration](/docs/configuration-reference#commands), making them reusable across your configuration.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: <image-name-tag>
    steps:
      - checkout # Special step to checkout your source code
      - run: # Run step to execute commands, see
      # circleci.com/docs/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.

```
See the [Jobs and steps](/docs/jobs-steps) page for more information.

## User types
{: #user-types }

CircleCI has various user types with permissions inherited from VCS accounts.

* The *Organization Administrator* is a permission level inherited from your VCS:
  * GitHub: **Owner** and following at least one project building on CircleCI.
  * Bitbucket: **Admin** and following at least one project building on CircleCI.
  * GitLab: **Admin** and following at least one project building on CircleCI.
* The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project.
* A *User* is an individual user within an organization, inherited from your VCS.
* A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to an org in the VCS to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.

## Workflows
{: #workflows }

Workflows orchestrate jobs. A workflow defines a list of jobs and their run order. It is possible to run jobs concurrently, sequentially, on a schedule, or with a manual gate using an approval job.

![Workflows illustration cloud](/docs/assets/img/docs/workflow_detail_newui.png)

The following configuration example shows a workflow called `build_and_test` in which the job `build1` runs and then jobs `build2` and `build3` run concurrently:

{% include snippets/docker-auth.md %}

{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
      - image: cimg/postgres:9.4.12
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
      - image: cimg/postgres:9.4.12
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
      - image: cimg/postgres:9.4.12
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...
workflows:
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```
{% endraw %}

See the [Using workflows](/docs/workflows) page for more information.

## See also
{: #see-also }

- [Your First Green Build](/docs/getting-started) guides you step-by-step through setting up a working pipeline.
