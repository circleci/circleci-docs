---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI 2.0"
categories: [configuring-jobs]
order: 40
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Using Environment Variables*

This document describes using environment variables in CircleCI in the following sections:

* TOC
{:toc}

## Overview

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared inside a shell command in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key for a `run` step.
3. Environment variables set with the `environment` key for a job.
4. Environment variables set with the `environment` key for a container.
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]( {{ site.baseurl }}/2.0/contexts/) documentation for instructions.
6. Project-level environment variables set on the Project Settings page.
7. Special CircleCI environment variables defined in the [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/#circleci-built-in-environment-variables) section of this document.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page. Finally, special CircleCI environment variables are loaded.

## Adding Project-Level Environment Variables

1. In the CircleCI application,
go to your project's settings
by clicking the gear icon next to your project.

2. In the **Build Settings** section,
click on **Environment Variables**.

3. Import variables from another project
by clicking the **Import Variable(s)** button.
Add new variables
by clicking the **Add Variable** button.

4. Use your new environment variables in your `.circleci/config.yml` file.
For an example,
see the [Heroku deploy walkthrough]({{ site.baseurl }}/2.0/deployment-integrations/#heroku).

Once created,
environment variables are hidden and uneditable in the application.
Changing an environment variable is only possible
by deleting and recreating it.

### Encoding Multi-Line Environment Variables

If you are having difficulty adding a multiline environment variable,
use `base64` to encode it.

```bash
$ echo "foobar" | base64
Zm9vYmFyCg==
```

Store the resulting value in a CircleCI environment variable.

```bash
$ echo $MYVAR
Zm9vYmFyCg==
```

Decode the variable in any commands
that use the variable.

```bash
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**Note:**
Not all command-line programs take credentials
in the same way that `docker` does.

## Adding Global Environment Variables

To add global environment variables that may be shared across projects, use the Settings > Contexts page of the CircleCI application. See the [Contexts]( {{ site.baseurl }}/2.0/contexts/) documentation for instructions.

## Setting Environment Variables in `.circleci/config.yml`

It is also possible to set environment variables at the **job**, **container**, and **step** levels,
in order of increasing specificity.

**Warning**:
Environment variables set within configuration are fully visible in build output.
If you are adding secrets or sensitive data,
set these at the [project level](#adding-project-level-environment-variables) instead.

### Setting Job-Level Environment Variables

To set environment variables at the job level,
use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#job_name).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: "bar"
```

### Setting Container-Level Environment Variables

To set environment variables at the container level,
use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macosexecutor).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
      - image: circleci/postgres:9.6
      # environment variables for all commands executed in the primary container
        environment:
          POSTGRES_USER: conductor
          POSTGRES_DB: conductor_test
```

The following example shows separate environment variable settings for the primary container image (listed first) and the secondary or service container image.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2
       # environment variables for all commands executed in the primary container
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6
```

### Setting Step-Level Environment Variables

Use the environment key inside a run step to set variables for a single command shell as shown in the following example:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - checkout
      - run:
          name: Run migrations
          command: sql/docker-entrypoint.sh sql
          # Environment variable for a single command shell
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

## Interpolating Environment Variables

CircleCI does not support interpolation
when defining configuration variables like `working_directory` or `images`.
All defined values are treated literally.

However, it is possible to interpolate a variable within a command
by setting it for the current shell.

```yaml
version: 2
jobs:
  build:
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**Note**:
Depending on your shell,
you may have to append the new variable to a shell startup file
like `~/.tcshrc` or `~/.zshrc`.
For more information,
refer to your shell's documentation on setting environment variables.

## Injecting Environment Variables with the API

Build parameters are environment variables, therefore their names have to meet the following restrictions:

- They must contain only ASCII letters, digits and the underscore character.
- They must not begin with a number.
- They must contain at least one character.

Aside from the usual constraints for environment variables there are no restrictions on the values themselves and are treated as simple strings. The order that build parameters are loaded in is **not** guaranteed so avoid interpolating one build parameter into another. It is best practice to set build parameters as an unordered list of independent environment variables.

For example, when you pass the parameters:

```
{
  "build_parameters": {
    "foo": "bar",
    "baz": 5,
    "qux": {"quux": 1},
    "list": ["a", "list", "of", "strings"]
  }
}
```

Your build will see the environment variables:

```
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

Build parameters are exported as environment variables inside {% comment %} TODO: Job {% endcomment %}the build's containers and can be used by scripts/programs and commands in `config.yml`. The injected environment variables may be used to influence the steps that are run during the {% comment %} TODO: Job {% endcomment %} build. It is important to note that injected environment variables will not override values defined in `config.yml` nor in the project settings.

You might want to inject environment variables with the `build_parameters` key to enable your functional tests to build against different targets on each run. For example, a run with a deploy step to a staging environment that requires functional testing against different hosts. It is possible to include `build_parameters` by sending a JSON body with `Content-type: application/json` as in the following example that uses `bash` and `curl` (though you may also use an HTTP library in your language of choice).

```
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

For example using `curl`

```
curl \
  --header "Content-Type: application/json" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master?circle-token=$CIRCLE_TOKEN
```

The build will see the environment variables:

```
export param1="value1"
export param2="500"
```

Start a run with the POST API call, see the [new build]( {{ site.baseurl }}/api/v1-reference/#new-build) section of the API documentation for details. A POST with an empty body will start a new run of the named branch.


## CircleCI Built-in Environment Variables

CircleCI uses Bash,
which follows the POSIX naming convention for environment variables.
Valid characters include: letters (uppercase and lowercase), digits, and the underscore.
The first character of each environment variable must be a letter.

The following environment variables are exported in each build
and can be used for more complex testing or deployment.

### General Environment Variables

`CI`

Represents whether the current environment is a CI environment.

Has a value of `true` on our platform.

`CIRCLECI`

Represents whether the current environment is a CircleCI environment.

Has a value of `true` on our platform.

`HOME`

Your home directory.

### Build-Specific Environment Variables

`CIRCLE_BRANCH`

The name of the Git branch currently being built.

`CIRCLE_NODE_TOTAL`

An integer representing the number of total build instances.

`CIRCLE_NODE_INDEX`

An integer between 0 and (`CIRCLECI_NODE_TOTAL` - 1) representing a specific build instance.

`CIRCLE_BUILD_NUM`

The CircleCI build number.

`CIRCLE_PREVIOUS_BUILD_NUM`

The number of previous builds in the branch.

`CIRCLE_BUILD_URL`

The URL for the current build.

`CIRCLE_SHA1`

The SHA1 hash for the current build’s last commit.

`CIRCLE_USERNAME`

The GitHub/Bitbucket username of the user who triggered the build.

`CIRCLE_JOB`

The current job’s name.

`CIRCLE_WORKING_DIRECTORY`

The `working_directory` for the current job.

`CIRCLE_COMPARE_URL`

The GitHub/Bitbucket compare URL between commits in the build.

`CIRCLE_REPOSITORY_URL`

The GitHub/Bitbucket repository URL.

`CIRCLE_PR_NUMBER`

The GitHub/Bitbucket pull request number.

`CIRCLE_PR_REPONAME`

The GitHub/Bitbucket repository name in which the pull request was made.

`CIRCLE_PR_USERNAME`

The GitHub/Bitbucket username of the user who created the pull request.

`CIRCLE_PULL_REQUESTS`

Comma-separated list of URLs of pull requests this build is a part of.

`CIRCLE_PULL_REQUEST`

If this build is part of only one pull request, its URL will be populated here. If there was more than one pull request, it will contain one of the pull request URLs (picked randomly).

`CI_PULL_REQUESTS`

Same as `CIRCLE_PULL_REQUESTS`, only kept for the backward compatibility with 1.0.

`CI_PULL_REQUEST`

Same as `CIRCLE_PULL_REQUEST`, only kept for the backward compatibility with 1.0.

`CIRCLE_TAG`

The name of the git tag being tested, e.g. 'release-v1.5.4', if the build is running for a tag. See the [CircleCI 1.0 documentation of tags]( {{ site.baseurl }}/1.0/configuration/#tags) for more information.

`CIRCLE_PROJECT_USERNAME`

The username or organization name of the project being tested, i.e. “foo” in circleci.com/gh/foo/bar/123.

`CIRCLE_PROJECT_REPONAME`

The repository name of the project being tested, i.e. “bar” in circleci.com/gh/foo/bar/123.

`CIRCLE_INTERNAL_TASK_DATA`

The directory where test timing data can be found.

`CIRCLE_STAGE`

The job being executed. The default 2.0 job is `build` without using Workflows.

`CIRCLE_WORKFLOW_ID`

A unique identifier for the workflow run that the job belongs to. This identifier will be the same for every job that belongs to this workflow run.
