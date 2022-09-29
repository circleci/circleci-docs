---
layout: classic-docs
title: "Concepts"
short-title: "Concepts"
description: "CircleCI concepts"
categories: [getting-started]
order: 1
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

This guide introduces some basic concepts to help you understand how CircleCI manages your [CI/CD](https://circleci.com/continuous-integration/#what-is-continuous-integration) pipelines. 

* TOC
{:toc}

## Concurrency
{: #concurrency }

In CircleCI, *concurrency* refers to utilizing multiple containers to run multiple jobs at the same time. To keep the system stable for all CircleCI customers, we implement different soft concurrency limits on each of the [resource classes]({{site.baseurl}}/configuration-reference/#resource_class) for different executors. If you are experiencing queueing on your jobs, it is possible you are hitting these limits. Customers on annual plans can request an increase to those limits at no extra charge.

See [Orchestrating Workflows]({{site.baseurl}}/workflows/) to configure concurrency as shown in the [Sample Config Files document]({{site.baseurl}}/sample-config/#concurrent-workflow).

## Configuration
{: #configuration }

CircleCI believes in *configuration as code*. Your entire CI/CD process is orchestrated through a single file called `config.yml`. The `config.yml` file is located in a folder called `.circleci` at the root of your project. CircleCI uses the YAML syntax for config. See the [Writing YAML]({{ site.baseurl }}/writing-yaml/) document for a basic introduction.

```shell
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

`.circleci/config.yml` is a powerful YAML file that defines the entire pipeline for your project. For a full overview of the various keys used, see the [Configuration Reference]({{ site.baseurl }}/configuration-reference/) page.

Your CircleCI configuration can be adapted to fit many different needs of your project. The following terms, sorted in order of granularity and dependence, describe the components of most common CircleCI projects:

- **[Pipeline](#pipelines)**: Represents the entirety of your configuration. (not available for server v2.x)
- **[Workflows](#workflows)**: Responsible for orchestrating multiple _jobs_.
- **[Jobs](#jobs)**: Responsible for running a series of _steps_ that perform commands.
- **[Steps](#steps)**: Run commands (such as installing dependencies or running tests) and shell scripts to do the work required for your project.

The following illustration uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various config elements:

![configuration elements]({{ site.baseurl }}/assets/img/docs/config-elements.png)

## Contexts
{: #contexts }

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime. After a context has been created, you can use the `context` key in the workflows section of a project `config.yml` file to give any job(s) access to the environment variables associated with the context.

{:.tab.contextsimage.Cloud}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

See [Using Contexts]({{ site.baseurl }}/contexts/) for more information.

## Data Persistence
{: #data-persistence }

Data persistence allows you to move data between jobs and speed up your build. There are three main methods for persisting data in CircleCI: caches, workspaces, and artifacts.

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

### Caches
{: #caches }

A cache stores a file or directory of files such as dependencies or source code in object storage. To speed up the build, each job may contain special steps for caching dependencies from previous jobs.

If you need to [clear your cache]({{site.baseurl}}/caching/#clearing-cache), refer to the [Caching Dependencies]({{site.baseurl}}/caching/) page for more information on caching.

{:.tab.cache.Cloud}
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```
{% endraw %}

{:.tab.cache.Server_3}
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```
{% endraw %}

{:.tab.cache.Server_2}
{% raw %}
```yaml
version: 2

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/executor-intro/ for a comparison
    # and more examples.
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
```
{% endraw %}

### Workspaces
{: #workspaces }

Workspaces are a workflow-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs. Each workflow has a temporary workspace associated with it. The workspace can be used to pass along unique data built during a job to other jobs in the same workflow.

### Artifacts
{: #artifacts }

Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.

{:.tab.workspace.Cloud}
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

{:.tab.workspace.Server_3}
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

{:.tab.workspace.Server_2}
{% raw %}
```yaml
version: 2

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

Note the following distinctions between artifacts, workspaces, and caches:

Type       | Lifetime             | Use                                | Example
-----------|----------------------|------------------------------------|--------
Artifacts  | Months               | Preserve long-term artifacts.      |  Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container` or similar directory.
Workspaces | Duration of workflow | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and recreates the entire workspace content when it runs.
Caches     | Months               | Store non-vital data that may help the job run faster, for example npm or Gem packages. | The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision). Restore the cache with `restore_cache` and the appropriate `key`.
{: class="table table-striped"}

See [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces guide](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

## Docker Layer Caching
{: #docker-layer-caching }

Docker Layer Caching (DLC) caches the individual layers of Docker images built during your CircleCI jobs. Any unchanged layers are used on subsequent runs, rather than rebuilding the image each time.

In the `config.yml` snippet below, the `build_elixir` job builds an image using the `ubuntu-2004:202104-01` Dockerfile. Adding `docker_layer_caching: true` below the `machine` executor key ensures CircleCI saves each Docker image layer as the Elixir image is built.

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

See [Docker Layer Caching]({{ site.baseurl }}/docker-layer-caching/) for more information.


## Dynamic Configuration
{: #dynamic-configuration }

Instead of manually creating your configuration for each CircleCI project, you can generate this configuration dynamically, based on specific pipeline parameters or file paths. This is especially helpful where your team is working on a monorepo (or a single repository). Dynamic configuration allows you to trigger builds from *specific* parts of your project, rather than rebuilding everything each time.

See [Dynamic Configuration]({{ site.baseurl }}/dynamic-config/) for more information.

## Execution environments
{: #execution-environments }

Each separate job defined within your config runs in a unique Execution environment. We call them *executors*. An executor can be a Docker container or a virtual machine running Linux, Windows, or macOS.

![job illustration]( {{ site.baseurl }}/assets/img/docs/executor_types.png)

You can define an image for each executor. An image is a packaged system that includes instructions for creating a running container or virtual machine. CircleCI provides a range of images for use with the Docker executor, we call these _convenience images_. For more information, see the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/circleci-images/) guide.

{:.tab.executors.Cloud}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.executors.Server_2}
```yaml
version: 2

jobs:
 build1: # job name
   docker: # Specifies the primary container image,
     - image: cimg/base:2022.04-20.04
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
     - image: postgres:14.2 # Specifies the database image
       auth:
         username: mydockerhub-user
         password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: user
#...
 build2:
   machine: true # Specifies a machine image.
   # Contact your system administrator for details of the image.
#...
```

The primary container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file. This is where commands are executed. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See [Introduction to Execution Environments]({{ site.baseurl }}/executor-intro/) document for a comparison table and considerations. Further images can be added to spin up secondary/service containers.

For added security when using the Docker executor and running Docker commands, the `setup_remote_docker` key can be used to spin up another Docker container in which to run these commands. For more information see the [Running Docker Commands]({{ site.baseurl }}/building-docker-images/#accessing-the-remote-docker-environment) guide.

**Note:** macOS is not available on installations of CircleCI server v2.x.

## Images
{: #images }

An image is a packaged system that includes instructions for creating a running container. The primary container is defined by the first image listed in a [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file. This is where commands are executed for jobs, using the Docker or machine executor.

The **Docker executor** spins up a container with a Docker image. CircleCI maintains [convenience images]({{ site.baseurl }}/circleci-images/) for popular languages on Docker Hub.

The **machine executor** spins up a complete Ubuntu virtual machine image, giving you full access to OS resources and complete control over the job environment. For more information, see the [Using machine]({{ site.baseurl}}/configuration-reference/#machine) page.

See the [Introduction to Execution Environments]({{ site.baseurl }}/executor-intro/) document for a comparison.

 ```yaml
 version: 2.1
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: cimg/base:2022.04-20.04
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

       - image: postgres:14.2 # Specifies the database image
         auth:
           username: mydockerhub-user
           password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
## Jobs
{: #jobs }

Jobs are the building blocks of your config. Jobs are collections of [steps](#steps), which run commands/scripts as required. Each job must declare an executor that is either `docker`, `machine`, `windows`, or `macos`. For `docker` you must [specify an image]({{site.baseurl}}/executor-intro/#docker) to use for the primary container. For `macos` you must specify an [Xcode version]({{site.baseurl}}/executor-intro/#macos). For `windows` you must use the [Windows orb]({{site.baseurl}}/executor-intro/#windows).

![job illustration]( {{ site.baseurl }}/assets/img/docs/job.png)
## Orbs
{: #orbs }

Orbs are reusable snippets of code that help automate repeated processes, accelerate project setup, and make it easy to integrate with third-party tools. See [Using Orbs]({{ site.baseurl }}/orb-concepts/) for details on how to use orbs in your config and an introduction to orb design. Visit the [Orbs Registry](https://circleci.com/developer/orbs) to search for orbs to help simplify your config.

The illustration in the [Configuration](#configuration) section showing an example Java configuration could be simplified using orbs. The following illustration demonstrates a simplified configuration with [the Maven orb](https://circleci.com/developer/orbs/orb/circleci/maven). Here, the orb sets up a default executor that can execute steps with Maven and run a common job (`maven/test`).

![config elements orbs]({{ site.baseurl }}/assets/img/docs/config-elements-orbs.png)
## Parallelism
{: #parallelism }

The more tests your project involves, the longer it takes for them to complete on a single machine. With _parallelism_, you can spread your tests across a specified number of separate executors.

Test suites are conventionally defined at the [job]({{ site.baseurl }}/jobs-steps/#sample-configuration-with-concurrent-jobs) level in your `.circleci/config.yml` file. The `parallelism` key specifies how many independent executors will be set up to run the steps of a job.

To run a job's steps in parallel, set the `parallelism` key to a value greater than 1.

```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![Parallelism]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

See [Running Tests in Parallel]({{ site.baseurl }}/parallelism-faster-jobs/) for more information.

## Pipelines
{: #pipelines }

A CircleCI pipeline is the full set of processes you run when you trigger work on your projects. Pipelines encompass your workflows, which in turn coordinate your jobs. This is all defined in your project [configuration file](#configuration). Pipelines are not available on CircleCI server v2.x.

Pipelines represent methods for interacting with your configuration:

{% include snippets/pipelines-benefits.adoc %}

## Projects
{: #projects }

A CircleCI project shares the name of the associated code repository in your [Version Control System]({{ site.baseurl }}/gh-bb-integration/) (VCS). Select **Projects** in the CircleCI web app sidebar to enter the projects dashboard. From here you can set up and follow the projects you have access to.

On the Projects Dashboard, you can either:
* _Set Up_ any project that you are the owner of in your VCS.
* _Follow_ any project in your organization to gain access to its pipelines and to subscribe to [email notifications]({{site.baseurl }}/notifications/) for the project's status.

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

## Resource class
{: #resource-class}

A resource class is a configuration option that allows you to control available compute resources (CPU and RAM) for your jobs. When you specify an execution environment for a job, a default resource class value for the environment will be set _unless_ you define the resource class in your [configuration]({{site.baseurl}}/configuration-reference#resourceclass). It is best practice to define the resource class, as opposed to relying on a default.

The example below shows how to define a resource class in the Docker execution environment.

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:current
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    resource_class: large
```

Examples for all execution environments are available on the following pages:

* [Using the Docker execution environment]({{site.baseurl}}/using-docker)
* [Using the LinuxVM execution environment]({{site.baseurl}}/using-linuxvm)
* [Using the macOS execution environment]({{site.baseurl}}/using-macos)
* [Using the Windows execution environment]({{site.baseurl}}/using-windows)
* [Using the GPU execution environment]({{site.baseurl}}/using-gpu)
* [Using the Arm execution environment]({{site.baseurl}}/using-arm)

Pricing and plans information for the various resource classes can be found on the [Resource Classes](https://circleci.com/product/features/resource-classes/) product page.

The `resource_class` key is also used to configure a [self-hosted runner instance]({{site.baseurl}}/runner-concepts#namespaces-and-resource-classes).

## Steps
{: #steps }

 Steps are usually a collection of the executable commands required to complete your job. For example, the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) step (which is a built-in step available across all CircleCI projects) checks out the source code for a job over SSH. The `run` step allows you to run custom commands, such as executing the command `make test`, using a non-login shell by default. Commands can also be defined [outside the job declaration]({{ site.baseurl }}/configuration-reference/#commands-requires-version-21), making them reusable across your config.

```yaml
#...
jobs:
  build:
    docker:
      - image: <image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout # Special step to checkout your source code
      - run: # Run step to execute commands, see
      # circleci.com/docs/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.
#...
```

## User types
{: #user-types }

Here are the user types relating to CircleCI projects. Many of them have permissions inherited from VCS accounts

* The *Organization Administrator* is a permission level inherited from your VCS:
  * GitHub: **Owner** and following at least one project building on CircleCI.
  * Bitbucket: **Admin** and following at least one project building on CircleCI.
* The *Project Administrator* is the user who adds a GitHub or Bitbucket
repository to CircleCI as a Project.
* A *User* is an individual user within an organization, inherited from your VCS.
* A CircleCI user is anyone who can log in to the CircleCI platform with a
username and password. Users must be added to a [GitHub or Bitbucket org]({{site.baseurl }}/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.

## Workflows
{: #workflows }

Workflows define a list of jobs and their run order. It is possible to run jobs concurrently, sequentially, on a schedule, or with a manual gate using an approval job.

{:.tab.workflows.Cloud}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_3}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server_2}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

The following config example shows a workflow called `build_and_test` in which the job `build1` runs and then jobs `build2` and `build3` run concurrently:

{:.tab.workflows-example.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.workflows-example.Server_3}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.workflows-example.Server_2}
{% raw %}
```yaml
version: 2

jobs:
  build1:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: cimg/ruby:2.4-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:9.4.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...
workflows:
  version: 2.1
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

## See also
{: #see-also }
{:.no_toc}

[Your First Green Build]({{ site.baseurl }}/getting-started/) guides you step-by-step through setting up a working pipeline.
