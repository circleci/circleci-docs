---
layout: classic-docs
title: "Project values and variables"
description: A list of all built-in variables for your CircleCI projects.
version:
- Cloud
- Server v3.x
- Server v2.x
---

This page is a reference for all built-in values available for use in your CircleCI projects.

## Built-in environment variables
{: #built-in-environment-variables }

The following built-in environment variables are available for all CircleCI projects. Environment variables are scoped at the job level. They can be used within the context of a job but do not exist at a pipeline level, therefore they cannot be used for any logic at the pipeline or workflow level.

**Note**: You cannot use a built-in environment variable to define another environment variable. Instead, you must use a `run` step
to export the new environment variables using `BASH_ENV`. For more details, see [Setting an Environment Variable in a Shell Command]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command).

{% include snippets/built-in-env-vars.md %}

## Pipeline values
{: #pipeline-values }

Pipeline values are available to all pipeline configurations and can be used without previous declaration. Pipeline values are scoped at the pipeline level. They are interpolated at compilation time, not workflow/job runtime.

{% include snippets/pipeline-values.md %}

For example:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      CIRCLE_COMPARE_URL: << pipeline.project.git_url >>/compare/<< pipeline.git.base_revision >>..<<pipeline.git.revision>>
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
      - run: echo $CIRCLE_COMPARE_URL
```

**Note:** When using the above method to set the variables in the `environment` key, note that if the pipeline variable is empty it will be set to `<nil>`. If you need an empty string instead, [set the variable in a shell command]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command).

