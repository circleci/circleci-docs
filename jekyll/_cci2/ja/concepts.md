---
layout: classic-docs
title: "コンセプト"
short-title: "コンセプト"
description: "CircleCI 2.0 のコンセプト"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

This guide introduces some basic concepts to help you understand how CircleCI manages your CICD pipelines.

* 目次 
{:toc}

## Projects

A CircleCI project shares the name of the associated code repository in your VCS (GitHub or Bitbucket). Select Add Project from the CircleCI application to enter the Projects dashboard, from where you can set up and follow the projects you have access to.

On the Projects Dashboard, you can either:

* *Set Up* any project that you are the owner of in your VCS 
* *Follow* any project in your organization to gain access to its pipelines and to subscribe to \[email notifications\]({{ site.baseurl }}/2.0/notifications/) for the project's status.

![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

## Configuration

CircleCI believes in *configuration as code*. Your entire continuous integration and deployment process is orchestrated through a single file called `config.yml`. The `config.yml` file is located in a folder called `.circleci` at the root of your project. CircleCI uses the YAML syntax for config, see the [Writing YAML]({{ site.baseurl }}/2.0/writing-yaml/) document for basics.

```bash
├── .circleci
│   ├── config.yml
├── README
└── all-other-project-files-and-folders
```

`config.yml` is a powerful YAML file that defines the entire pipeline for your project. For a full overview of the various keys that are used, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/).

Your CircleCI configuration can be adapted to fit many different needs of your project. The following terms, sorted in order of granularity and dependence, describe the components of most common CircleCI projects:

* **[Pipeline](#pipelines)**: Represents the entirety of your configuration. Available in CircleCI Cloud only.
* **[Workflows](#workflows)**: Responsible for orchestrating multiple *jobs*.
* **[Jobs](#jobs)**: Responsible for running a series of *steps* that perform commands.
* **[Steps](#steps)**: Run commands (such as installing dependencies or running tests) and shell scripts to do the work required for your project. 

The following image uses an [example Java application](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-config) to show the various config elements:

![configuration elements]({{ site.baseurl }}/assets/img/docs/config-elements.png)

## User Types

It is worth taking a minute to define the various user types that relate to CircleCI projects, most of which have permissions inherited from VCS accounts.

* The *Organization Administrator* is a permission level inherited from your VCS: 
  * GitHub: **Owner** and following at least one project building on CircleCI
  * Bitbucket: **Admin** and following at least one project building on CircleCI
* The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. 
* A *User* is an individual user within an organization, inherited from your VCS. 
* A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a \[GitHub or Bitbucket org\]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.

## Pipelines

A CircleCI pipeline is the full set of processes you run when you trigger work on your projects. Pipelines encompass your workflows, which in turn coordinate your jobs. This is all defined in your project [configuration file](#configuration). Pipelines are not currently available for CircleCI Server.

Pipelines represent methods for interacting with your configuration:

{% include snippets/pipelines-benefits.adoc %}

## Orbs

Orbs are reusable snippets of code that help automate repeated processes, speed up project setup, and make it easy to integrate with third-party tools. See [Using Orbs]({{ site.baseurl }}/2.0/using-orbs/) for details about how to use orbs in your config and an introduction to orb design. Visit the [Orbs Registry](https://circleci.com/orbs/registry/) to search for orbs to help simplify your config. Orbs are not currently available for CircleCI Server.

The graphic above illustrating an example Java configuration can be greatly simplified using orbs. The following illustration re-creates the same configuration with [the Maven orb](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/2.1-orbs-config).

![config elements orbs]({{ site.baseurl }}/assets/img/docs/config-elements-orbs.png)

## Jobs

Jobs are the building blocks of your config. Jobs are collections of [steps](#steps), which run commands/scripts as required. Each job must declare an executor that is either `docker`, `machine`, `windows` or `macos`. `machine` includes a [default image](https://circleci.com/docs/2.0/executor-intro/#machine) if not specified, for `docker` you must [specify an image](https://circleci.com/docs/2.0/executor-intro/#docker) to use for the primary container, for `macos` you must specify an [Xcode version](https://circleci.com/docs/2.0/executor-intro/#macos), and for `windows` you must use the [Windows orb](https://circleci.com/docs/2.0/executor-intro/#windows).

![job illustration]({{ site.baseurl }}/assets/img/docs/job.png)

## Executors and Images

Each separate job defined within your config will run in a unique executor. An executor can be a docker container or a virtual machine running Linux, Windows, or MacOS. Note, macOS is not currently available on self-hosted installations of CircleCI Server.

![job illustration]({{ site.baseurl }}/assets/img/docs/executor_types.png)

You can define an image for each executor. An image is a packaged system that has the instructions for creating a running container or virtual machine. CircleCI provide a range of images for use with the Docker executor. For more information see the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) guide.

{:.tab.executors.Cloud}
```yaml
version: 2.1

jobs:
 build1: # job name
   docker: # Specifies the primary container image,

     - image: buildpack-deps:trusty
     - image: postgres:9.4.1 # Specifies the database image
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/2.0/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: root
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 14.04 image with Docker 17.06.1-ce
   # and docker-compose 1.14.0, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-1604:201903-01
#...       
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 11.3
     xcode: "11.3.0"
# ...          
```

{:.tab.executors.Server}
```yaml
version: 2.0

jobs:
 build1: # job name
   docker: # Specifies the primary container image,

     - image: buildpack-deps:trusty
     - image: postgres:9.4.1 # Specifies the database image
      # for the secondary or service container run in a common
      # network where ports exposed on the primary container are
      # available on localhost.
       environment: # Specifies the POSTGRES_USER authentication
        # environment variable, see circleci.com/docs/2.0/env-vars/
        # for instructions about using environment variables.
         POSTGRES_USER: root
#...
 build2:
   machine: # Specifies a machine image that uses
   # an Ubuntu version 14.04 image with Docker 17.06.1-ce
   # and docker-compose 1.14.0, follow CircleCI Discuss Announcements
   # for new image releases.
     image: ubuntu-1604:201903-01
#...       
 build3:
   macos: # Specifies a macOS virtual machine with Xcode version 11.3
     xcode: "11.3.0"
# ...          
```

The Primary Container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for a comparison table and considerations. Subsequent images can be added to spin up Secondary/Service Containers.

When using the docker executor and running docker commands, the `setup_remote_docker` key can be used to spin up another docker container in which to run these commands, for added security. For more information see the [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/#accessing-the-remote-docker-environment) guide.

## Steps

Steps are actions that need to be taken to complete your job. Steps are usually a collection of executable commands. For example, the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step, which is a *built-in* step available across all CircleCI projects, checks out the source code for a job over SSH. Then, the `run` step allows you to run custom commands, such as executing the command `make test` using a non-login shell by default. Commands can also be defined [outside the job declaration]({{ site.baseurl }}/2.0/configuration-reference/#commands-requires-version-21), making them reusable across your config.

```yaml
#...
jobs:
  build:
    docker:
      - image: <image-name-tag>
    steps:
      - checkout # Special step to checkout your source code
      - run: # Run step to execute commands, see
      # circleci.com/docs/2.0/configuration-reference/#run
          name: Running tests
          command: make test # executable command run in
          # non-login shell with /bin/bash -eo pipefail option
          # by default.
#...          
```

## Image

An image is a packaged system that has instructions for creating a running container. The Primary Container is defined by the first image listed in a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed for jobs using the Docker or machine executor. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See the [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for a comparison table and considerations.

```yaml
 version: 2
 jobs:
   build1: # job name
     docker: # Specifies the primary container image,
     # see circleci.com/docs/2.0/circleci-images/ for
     # the list of pre-built CircleCI images on dockerhub.
       - image: buildpack-deps:trusty

       - image: postgres:9.4.1 # Specifies the database image
        # for the secondary or service container run in a common
        # network where ports exposed on the primary container are
        # available on localhost.
         environment: # Specifies the POSTGRES_USER authentication
          # environment variable, see circleci.com/docs/2.0/env-vars/
          # for instructions about using environment variables.
           POSTGRES_USER: root
...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 16.04 image
     # follow CircleCI Discuss Announcements
     # for new image releases.
       image: ubuntu-1604:202007-01
...       
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 9.0
       xcode: "9.0"       
 ...          
 ```


## Workflows

Workflows define a list of jobs and their run order. It is possible to run jobs concurrently, sequentially, on a schedule, or with a manual gate using an approval job.

{:.tab.workflows.Cloud}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

The following config example shows a workflow called `build_and_test` in which the job `build1` runs and then jobs `build2` and `build3` run concurrently:

{:.tab.workflows-example.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
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
           # see circleci.com/docs/2.0/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```
{% endraw %}

{:.tab.workflows-example.Server}
{% raw %}
```yaml
version: 2

jobs:
  build1:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Running tests
          command: make test
  build3:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
#...                          
workflows:
  version: 2
  build_and_test: # name of your workflow
    jobs:
      - build1
      - build2:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # see circleci.com/docs/2.0/workflows/ for more examples.
      - build3:
          requires:
           - build1 # wait for build1 job to complete successfully before starting
           # run build2 and build3 concurrently to save time.
```
{% endraw %}

## Caches, Workspaces and Artifacts

![workflow illustration]({{ site.baseurl }}/assets/img/docs/workspaces.png)

A cache stores a file or directory of files such as dependencies or source code in object storage. Each job may contain special steps for caching dependencies from previous jobs to speed up the build.

{:.tab.cache.Cloud}
{% raw %}
```yaml
version: 2.1

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/2.0/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          ```
{% endraw %}

{:.tab.cache.Server}
{% raw %}
```yaml
version: 2

jobs:
  build1:
    docker: # Each job requires specifying an executor
    # (either docker, macos, or machine), see
    # circleci.com/docs/2.0/executor-types/ for a comparison
    # and more examples.

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout
      - save_cache: # Caches dependencies with a cache key
      # template for an environment variable,
      # see circleci.com/docs/2.0/caching/
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  build2:
    docker:

      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - restore_cache: # Restores the cached dependency.
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}       
```
{% endraw %}

Workspaces are a workflow-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs. Each workflow has a temporary workspace associated with it. The workspace can be used to pass along unique data built during a job to other jobs in the same workflow.

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
      - store_artifacts: # See circleci.com/docs/2.0/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```        
{% endraw %}

{:.tab.workspace.Server}
{% raw %}
```yaml
version: 2

jobs:
  build1:
#...   
    steps:    

      - persist_to_workspace: # Persist the specified paths (workspace/echo-output)
      # into the workspace  for use in downstream job. Must be an absolute path,
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
      - store_artifacts: # See circleci.com/docs/2.0/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
#...
```        
{% endraw %}

Note the following distinctions between Artifacts, Workspaces, and Caches:

| タイプ      | ライフタイム    | 用途                                                           | 例                                                                                                                                            |
| -------- | --------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月       | 長期アーティファクトを保存します。                                            | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブで、`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に表示されます。                            |
| ワークスペース  | ワークフローの期間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                        |
| キャッシュ    | 数か月       | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。 `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

## See Also
{:.no_toc}

Refer to the [Jobs and Steps]({{ site.baseurl }}/2.0/jobs-steps/) document for a summary of how to use the `jobs` and `steps` keys and options.