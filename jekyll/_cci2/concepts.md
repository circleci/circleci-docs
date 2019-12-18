---
layout: classic-docs
title: "Concepts"
short-title: "Concepts"
description: "CircleCI 2.0 concepts"
categories: [getting-started]
order: 1
---


A CircleCI project shares the name of the associated code repository and is visible on the Projects page of the CircleCI app. Projects are added by using the Add Project button.

* TOC 
{:toc}

A CircleCI project shares the name of the associated code repository and is visible on the Projects page of the CircleCI app. Projects are added by using the Add Project button.

On the "Add Projects" page, you can either _Set Up_ any project that you are
the owner of on your VCS, or, _Follow_ any project in your organization to gain
access to its pipelines and to subscribe to [email notifications]({{
site.baseurl }}/2.0/notifications/) for the project's status.

## Add Projects Page

{:.tab.addprojectpage.Cloud}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

{:.tab.addprojectpage.Server}
![header]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

The *Project Administrator* is the user who adds a GitHub or Bitbucket repository to CircleCI as a Project. A **User* is an individual user within an org. A CircleCI user is anyone who can log in to the CircleCI platform with a username and password. Users must be added to a [GitHub or Bitbucket org]({{ site.baseurl }}/2.0/gh-bb-integration/) to view or follow associated CircleCI projects. Users may not view project data that is stored in environment variables.

## Steps

Steps are actions that need to be taken to perform your job. Steps are usually a collection of executable commands. For example, the `checkout` step checks out the source code for a job over SSH. Then, the `run` step executes the `make test` command using a non-login shell by default.

```yaml
#...
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


An image is a packaged system that has the instructions for creating a running container. 
 The Primary Container is defined by the first image listed in [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file. This is where commands are executed for jobs using the Docker or machine executor. The Docker executor spins up a container with a Docker image. The machine executor spins up a complete Ubuntu virtual machine image. See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) document for a comparison table and considerations.

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
#...
   build2:
     machine: # Specifies a machine image that uses
     # an Ubuntu version 14.04 image with Docker 17.06.1-ce
     # and docker-compose 1.14.0, follow CircleCI Discuss Announcements
     # for new image releases.
       image: circleci/classic:201708-01
#...       
   build3:
     macos: # Specifies a macOS virtual machine with Xcode version 9.0
       xcode: "9.0"       
# ...          
 ```


## Jobs

Jobs are collections of [steps](#steps). Each job must declare an executor that is either `docker`, `machine`, `windows` or `macos`. `machine` includes a [default image](https://circleci.com/docs/2.0/executor-intro/#machine) if not specified, for `docker` you must [specify an image](https://circleci.com/docs/2.0/executor-intro/#docker) to use for the primary container, for `macos` you must specify an [Xcode version](https://circleci.com/docs/2.0/executor-intro/#macos), and for `windows` you must use the [Windows orb](https://circleci.com/docs/2.0/executor-intro/#windows).

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

### Cache
{:.no_toc}

A cache stores a file or directory of files such as dependencies or source code in object storage.
Each job may contain special steps for caching dependencies from previous jobs to speed up the build.

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

## Workflows

Workflows define a list of jobs and their run order. It is possible to run jobs in parallel, sequentially, on a schedule, or with a manual gate using an approval job.

{:.tab.workflows.Cloud}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail_newui.png)

{:.tab.workflows.Server}
![workflows illustration]( {{ site.baseurl }}/assets/img/docs/workflow_detail.png)

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
           # run build2 and build3 in parallel to save time.
```
{% endraw %}

### Workspaces and Artifacts
{:.no_toc}

Workspaces are a workflows-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs. Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.

Each workflow has a temporary workspace associated with it. The workspace can be used to pass along unique data built during a job to other jobs in the same workflow.

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

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

Type       | Lifetime             | Use                                | Example
-----------|----------------------|------------------------------------|--------
Artifacts  | Months               | Preserve long-term artifacts.      |  Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container` or similar directory.
Workspaces | Duration of workflow | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and re-creates the entire workspace content when it runs.
Caches     | Months               | Store non-vital data that may help the job run faster, for example npm or Gem packages. | The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision). Restore the cache with `restore_cache` and the appropriate `key`.
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

## See Also
{:.no_toc}

Refer to the [Jobs and Steps]({{ site.baseurl }}/2.0/jobs-steps/) document for a summary of how to use the `jobs` and `steps` keys and options.
