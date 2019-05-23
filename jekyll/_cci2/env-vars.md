---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI 2.0"
categories: [configuring-jobs]
order: 40
---

This document describes using environment variables in CircleCI in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

To add private keys or secret environment variables to your private project, use the Environment Variables page of the Build > Project > Settings in the CircleCI application. The value of the variables are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable and add it again with the new value. It is possible to add individual variables or to import variables from another project. Private environment variables enable you to store secrets safely even when your project is public, see [Building Open Source Projects]({{ site.baseurl }}/2.0/oss/) for associated settings information. Use Contexts to further restrict access to environment variables from within the build, refer to the [Restricting a Context]({{ site.baseurl }}/2.0/contexts/#restricting-a-context) documentation. 

### Environment Variable Usage Options
{:.no_toc}

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Valid characters include letters (uppercase and lowercase), digits, and the underscore. The first character of each environment variable must be a letter.

Secrets and private keys that are securely stored in the CircleCI app may be referenced with the variable in a `run` key, `environment` key, or a Workflows `context` key in your configuration. Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command](#setting-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step](#setting-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job](#setting-an-environment-variable-in-a-job).
4. Environment variables set with the `environment` key [for a container](#setting-an-environment-variable-in-a-container).
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]( {{ site.baseurl }}/2.0/contexts/) documentation for instructions.
6. [Project-level environment variables](#setting-an-environment-variable-in-a-project) set on the Project Settings page.
7. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables](#built-in-environment-variables) section of this document.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page. Finally, special CircleCI environment variables are loaded.

**Note**:
Do not add secrets or keys inside the `.circleci/config.yml` file. The full text of `config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project](#setting-an-environment-variable-in-a-project) or [context]({{ site.baseurl }}/2.0/contexts/) settings in the CircleCI app.

For more information, see the [Encryption section]({{ site.baseurl }}/2.0/security/#encryption) of the "Security" document.

Running scripts within configuration may expose secret environment variables. See the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/#shell-script-best-practices) document for best practices for secure scripts.


### Example Configuration of Environment Variables

Consider the example `config.yml` below:

```yaml
version: 2  # use CircleCI 2.0
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI node images available at: https://hub.docker.com/r/circleci/node/
      - image: circleci/node:10.0-browsers
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      # Run a step to setup an environment variable.
      - run: 
          name: "Setup custom environment variables"
          command: |
            echo 'export MY_ENV_VAR="FOO"' >> $BASH_ENV # Redirect MY_ENV_VAR into $BASH_ENV
      # Run a step to print what branch our code base is on.
      - run: # test what branch we're on.
          name: "What branch am I on?"
          command: echo ${CIRCLE_BRANCH}
      # Run another step, the same as above; note that you can
      # invoke environment variable without curly braces.
      - run:
          name: "What branch am I on now?"
          command: echo $CIRCLE_BRANCH
      - run:
          name: "What was my custom environment variable?"
          command: echo ${MY_ENV_VAR}
```

The above `config.yml` demonstrates the following: 

- Setting custom environment variables
- Reading a built-in environment variable that CircleCI provides (`CIRCLE_BRANCH`)
- How variables are used (or interpolated) in your `config.yml`

When the above config runs, the output looks like this:

![Env Vars Interpolation Example]({{site.baseurl}}/assets/img/docs/env-vars-interpolation-example.png)

You may have noticed that there are two similar steps in the above image and config - "What branch am I on?". These steps illustrate two different methods to read environment variables. Note that both `${VAR}` and `$VAR` syntaxes are supported. You can read more about shell paramater expansion in the [Bash documentation (https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion).

### Using `BASH_ENV` to Set Environment Variables
{:.no_toc}

CircleCI does not support interpolation when setting environment variables. All defined values are treated literally. This can cause issues when defining `working_directory`, modifying `PATH`, and sharing variables across multiple `run` steps.

In the example below, `$ORGNAME` and `$REPONAME` will not be interpolated.

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

There are several workarounds to interpolate values into your config.

If you are using **CircleCI 2.1**, you can reuse pieces of config across your  `config.yml`. By using the `parameters` declaration, you can interpolate (or, "pass values") into reusable `commands` `jobs` and `executors`. Consider reading the documentation on [using the parameters declaration]({{ site.baseurl }}/2.0/reusing-config/#using-the-parameters-declaration).

Another possible method to interpolate values into your config is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH/bin:$PATH"' >> $BASH_ENV
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> $BASH_ENV
```

In every step, CircleCI uses `bash` to source `BASH_ENV`. This means that `BASH_ENV` is automatically loaded and run,
allowing you to use interpolation and share environment variables across `run` steps.

**Note:**
The `BASH_ENV` workaround only works with `bash`. Other implementations like `sh` will not work. This limitation affects your image options. For example, because [Alpine images](https://alpinelinux.org/) do not include `bash` by default, the `BASH_ENV` workaround will not work without first installing `bash`.

## Setting an Environment Variable in a Shell Command

While CircleCI does not support interpolation when setting environment variables, it is possible to set variables for the current shell by [using `BASH_ENV`](#using-bash_env-to-set-environment-variables). This is useful for both modifying your `PATH` and setting environment variables that reference other variables.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            echo 'export PATH=/path/to/foo/bin:$PATH' >> $BASH_ENV
            echo 'export VERY_IMPORTANT=$(cat important_value)' >> $BASH_ENV
            source $BASH_ENV
```

**Note**:
Depending on your shell, you may have to append the new variable to a shell startup file like `~/.tcshrc` or `~/.zshrc`.

For more information, refer to your shell's documentation on setting environment variables.

## Setting an Environment Variable in a Step

To set an environment variable in a step, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#run).

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

**Note:**
Since every `run` step is a new shell, environment variables are not shared across steps. If you need an environment variable
to be accessible in more than one step, export the value [using `BASH_ENV`](#using-bash_env-to-set-environment-variables).

## Setting an Environment Variable in a Job

To set an environment variable in a job, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#job_name).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
```

## Setting an Environment Variable in a Container

To set an environment variable in a container, use the [`environment` key]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macosexecutor).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
      - image: circleci/postgres:9.6-jessie
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
      - image: circleci/python:3.6.2-jessie
       # environment variables for all commands executed in the primary container
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6
```

## Setting an Environment Variable in a Context

Creating a context allows you to share environment variables across multiple projects. To set an environment variables in a context, see the [Contexts documentation]({{ site.baseurl }}/2.0/contexts/).

## Setting an Environment Variable in a Project

1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.

2. In the **Build Settings** section, click on **Environment Variables**.

3. Import variables from another project by clicking the **Import Variable(s)** button. Add new variables by clicking the **Add Variable** button. (**Note:** The **Import Variables(s)** button is not currently available on CircleCI installed in your private cloud or datacenter.)

4. Use your new environment variables in your `.circleci/config.yml` file. For an example, see the [Heroku deploy walkthrough]({{ site.baseurl }}/2.0/deployment-integrations/#heroku).

Once created, environment variables are hidden and uneditable in the application. Changing an environment variable is only possible by deleting and recreating it.

### Encoding Multi-Line Environment Variables
{:.no_toc}

If you are having difficulty adding a multiline environment variable, use `base64` to encode it.

```bash
$ echo "foobar" | base64 --wrap=0
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
Not all command-line programs take credentials in the same way that `docker` does.

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

Build parameters are exported as environment variables inside each job's containers and can be used by scripts/programs and commands in `config.yml`. The injected environment variables may be used to influence the steps that are run during the job. It is important to note that injected environment variables will not override values defined in `config.yml` nor in the project settings.

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

In the above example,
`$CIRCLE_TOKEN` is a [personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).

The build will see the environment variables:

```
export param1="value1"
export param2="500"
```

Start a run with the POST API call, see the [new build](https://circleci.com/docs/api/#trigger-a-new-build-with-a-branch) section of the API documentation for details. A POST with an empty body will start a new run of the named branch.

## Built-in Environment Variables

The following environment variables are exported in each build and can be used for more complex testing or deployment.

**Note:**
You cannot use a built-in environment variable to define another environment variable. Instead, you must use a `run` step
to export the new environment variables using `BASH_ENV`.

For more details, see [Setting an Environment Variable in a Shell Command](#setting-an-environment-variable-in-a-shell-command).

Variable                    | Type    | Value
----------------------------|---------|-----------------------------------------------
`CI`                        | Boolean | `true` (represents whether the current environment is a CI environment)
`CI_PULL_REQUEST`           | String  | Deprecated version of `CIRCLE_PULL_REQUEST`. Kept for backward compatibility with CircleCI 1.0.
`CI_PULL_REQUESTS`          | List    | Deprecated version of `CIRCLE_PULL_REQUESTS`. Kept for backward compatibility with CircleCI 1.0.
`CIRCLE_BRANCH`             | String  | The name of the Git branch currently being built.
`CIRCLE_BUILD_NUM`          | Integer | The number of the CircleCI build.
`CIRCLE_BUILD_URL`          | String  | The URL for the current build.
`CIRCLE_COMPARE_URL`        | String  | The GitHub or Bitbucket URL to compare commits of a build.
`CIRCLE_INTERNAL_TASK_DATA` | String  | The directory where test timing data is saved.
`CIRCLE_JOB`                | String  | The name of the current job.
`CIRCLE_NODE_INDEX`         | Integer | The index of the specific build instance. A value between 0 and (`CIRCLECI_NODE_TOTAL` - 1)
`CIRCLE_NODE_TOTAL`         | Integer | The number of total build instances.
`CIRCLE_PR_NUMBER`          | Integer | The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
`CIRCLE_PR_REPONAME`        | String  | The name of the GitHub or Bitbucket repository where the pull request was created. Only available on forked PRs.
`CIRCLE_PR_USERNAME`        | String  | The GitHub or Bitbucket username of the user who created the pull request. Only available on forked PRs.
`CIRCLE_PREVIOUS_BUILD_NUM` | Integer | The number of previous builds on the current branch.
`CIRCLE_PROJECT_REPONAME`   | String  | The name of the repository of the current project.
`CIRCLE_PROJECT_USERNAME`   | String  | The GitHub or Bitbucket username of the current project.
`CIRCLE_PULL_REQUEST`       | String  | The URL of the associated pull request. If there are multiple associated pull requests, one URL is randomly chosen.
`CIRCLE_PULL_REQUESTS`      | List    | Comma-separated list of URLs of the current build's associated pull requests.
`CIRCLE_REPOSITORY_URL`     | String  | The URL of your GitHub or Bitbucket repository.
`CIRCLE_SHA1`               | String  | The SHA1 hash of the last commit of the current build.
`CIRCLE_TAG`                | String  | The name of the git tag, if the current build is tagged. For more information, see the [Git Tag Job Execution]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag).
`CIRCLE_USERNAME`           | String  | The GitHub or Bitbucket username of the user who triggered the build.
`CIRCLE_WORKFLOW_ID`        | String  | A unique identifier for the workflow instance of the current job. This identifier is the same for every job in a given workflow instance.
`CIRCLE_WORKING_DIRECTORY`  | String  | The value of the `working_directory` key of the current job.
`CIRCLECI`                  | Boolean | `true` (represents whether the current environment is a CircleCI environment)
`HOME`                      | String  | Your home directory.
{:class="table table-striped"}

## See Also
{:.no_toc}

[Contexts]( {{ site.baseurl }}/2.0/contexts/)
