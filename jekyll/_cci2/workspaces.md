---
layout: classic-docs
title: "Using workspaces to share data between jobs"
description: "This document describes how to use workspaces to share data to downstream jobs in your workflows."
version:
- Cloud
- Server v3.x
- Server v2.x
---

Workflows each have an associated `workspace`. Workspaces are used to transfer data to downstream jobs as the workflow progresses.

Use workspaces to pass along data that is unique to a workflow and is needed for downstream jobs. Workflows that include jobs running on multiple branches may require data to be shared using workspaces. Workspaces are also useful for projects in which compiled data are used by test containers.

For example, a project with a `build` job that builds a `.jar` file and saves it to a workspace. The `build` job fans-out into concurrently running test jobs: `integration-test`, `unit-test`, and `code-coverage`, each of which can have access to the jar by attaching the workspace.

## Overview
{: #overview }

Workspaces are additive-only data storage. Jobs can persist data to the workspace. When a workspace is used, data is archived and stored in an off-container store. With each addition to the workspace a new layer is created in the store. Downstream jobs can then attach the workspace to their container filesystem. Attaching the workspace downloads and unpacks each layer based on the ordering of the upstream jobs in the workflow.

![workspaces data flow]( {{ site.baseurl }}/assets/img/docs/workspaces.png)

## Workspace configuration
{: #workspace-configuration }

To persist data from a job and make it available to other jobs, configure the job to use the `persist_to_workspace` key. Files and directories named in the `paths:` property of `persist_to_workspace` will be uploaded to the workflow's temporary workspace relative to the directory specified with the `root` key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

Configure a job to get saved data by configuring the `attach_workspace` key. The following `config.yml` file defines two jobs where the `downstream` job uses the artifact of the `flow` job. The workflow configuration is sequential, so that `downstream` requires `flow` to finish before it can start.

```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: buildpack-deps:jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:
      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # Persist the specified paths (workspace/echo-output) into the workspace for use in downstream job.
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory. This is a directory on the container which is
          # taken to be the root directory of the workspace.
          root: workspace
          # Must be relative path from root
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  btd:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
```

For a live example of using workspaces to pass data between build and deploy jobs, see the [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) that is configured to build the CircleCI documentation.

For additional conceptual information on using workspaces, caching, and artifacts, refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) blog post.

## Workspace expiration
{: #workspace-expiration }

Workspaces are stored for up to 15 days. Workspaces are not shared between pipelines, and the only way to access a workspace once the workflow has completed is if the workflow is rerun within the 15 day window.

## Workspaces and runner network charges
{: #workspaces-and-runner-network-charges }

When using self-hosted runners there is a network and storage usage limit included in your plan. Once your usage exceeds your limit charges will apply. These charges are based on your accrued overages.

For information on viewing your network and stoarage usage, and calculating your monthly network and storage overage costs, see the [Persisting Data]({{site.baseurl}}/2.0/persist-data/#managing-network-and-storage-use) guide.

## Workspace usage optimization
{: #workspace-usage-optimization }

It is important to define paths and files when using `persist_to_workspace`. Not doing so can cause a significant increase is storage. Specify paths and files using the following syntax:

```yml
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

## See also
{: #see-also }
{:.no_toc}

- For further information and strategies for persisting data see the [Persisting Data]({{ site.baseurl }}/2.0/persist-data) guide.
- For conceptual and usage information on Workflows, see the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows) guide.
