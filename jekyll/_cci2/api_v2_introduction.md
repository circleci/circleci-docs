---
layout: classic-docs
title: "API v2 Introduction"
short-title: "Introduction"
description: "CircleCI API v2 introduction"
categories: [getting-started]
order: 1
---

The CircleCI Application Programming Interface (API) version 2, referred to as API v2 throughout this page, is a significant update to the existing CircleCI API v1.1 that is currently being used by internal and external audiences.

* TOC 
{:toc}

## Introduction


When making a request, use the following URL in your request:

`https://circleci.com/api/v2`

## What's New In API v2

The CircleCI API v2 

### Project Slugs

The CircleCI v2 API is backwards compatible with previous API versions in the way it identifies your projects using repository name. For example, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as gh/CircleCI-Public/circleci-cli, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. 

For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI has introduced a string representation of the triplet called the `project_slug`, and takes the following form: 

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It's possible in the future we could change the shape of a `project_slug`, but in all cases it would be usable as a human-readable identifier for a given project.

### New Endpoints

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

Endpoint       | Description                       
-----------|-------------------------------------------------------
`GET /workflow/:id ` | This endpoint enables users to return an individual workflow based on the `id` parameter being passed in the request
`GET /workflow/:id/jobs` | This endoint enables users to retrieve all jobs associated with a specific workflow, based on its unique `id`.
`GET /project/:project_slug`  | This endpoint enables users to retrieve a specific project by its unique slug.
`POST /project/:project_slug/pipeline` | This endpoint enables users to retrieve an individual project by its unique slug.
`GET /pipeline/:id` | This endpoint enables users to retrieve an individual pipeline, based on the `id` passed in the request.
`GET /pipeline/:id/config`  | This endpoint enables users to retrieve the configuration of a specific pipeline.
`GET /project/:project_slug/pipelines/[:filter]`  | This endpoint enables users to retrieve the most recent set of pipelines for a project.

### Deprecated Endpoints
{:.no_toc}

For this updated API v2 release, a number of endpoints have been deprecated 

Endpoint       | Description
-----------|-----------------------------------------------------
`POST /project/:vcs-type/:username/:project`  | This endpoint allowed users to trigger a new build.
`POST /project/:vcs-type/:username/:project/build` | This endpoint enables users to trigger a new build by project.
`DELETE /project/:vcs-type/:username/:project/build-cache` | This endpoint enabled users to clear the project cache for a specific project.
`GET /recent-builds` | This endpoint enabled users to retrieve an array of recent builds.

## Authentication

The CircleCI API v2 enables users to be authenticated in much the same way as they would be authenticated in the previous API v1.1. A simple way to authenticate is to send your API token as the username of the HTTP request. For example, if you have set `CIRCLECI_TOKEN` in your shell's environment, then you could then use `curl` with that token like the examnple shown below:

curl -u ${CIRCLECI_TOKEN}: https://circleci.com/api/v2/me

For more detailed information on how to authenticate with a token, please refer to the [Authentication](https://circleci.com/docs/api/#authentication) section in the main CirlceCI API documentation.

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
...   
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
...
    steps:
      - attach_workspace:
        # Must be absolute path or relative path from working_directory
          at: /tmp/workspace
  build3:
...
    steps:
      - store_artifacts: # See circleci.com/docs/2.0/artifacts/ for more details.
          path: /tmp/artifact-1
          destination: artifact-file
...
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
