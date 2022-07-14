---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI"
order: 40
version:
- Cloud
- Server v3.x
- Server v2.x
suggested:
  - title: Keep environment variables private
    link: https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/
  - title: Troubleshoot env vars settings
    link: https://discuss.circleci.com/t/somehow-i-just-cannot-get-the-enviroment-variable-from-enviroment-variable-setting-an-context-in-organization-menu/40342
  - title: Insert files as environment variables
    link: https://support.circleci.com/hc/en-us/articles/360003540393?input_string=how+to+i+inject+an+environment+variable+using+the+api%3F
---

This document describes using environment variables in CircleCI in the following sections:

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

There are several ways to use environment variables in CircleCI to provide variety in scope and authorization level. Environment variables are governed by an [order of precedence](#order-of-precedence), depending on how they are set, allowing control at each level in your configuration.

To add **private keys** or **secret environment variables** for use throughout your private project, use the [Environment Variables page under Project Settings](#setting-an-environment-variable-in-a-project) on the CircleCI web app. The variable values are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable and add it again with the new value.

Private environment variables enable you to store secrets safely even when your project is public. Refer to the [Building Open Source Projects]({{site.baseurl}}/oss/) page for associated settings information.

Use Contexts to [further restrict access to environment variables](#setting-an-environment-variable-in-a-context). Contexts are set from the Organization Settings in the CircleCI application. For more information about controlling access to env vars with Contexts, refer to the [Restricting a Context]({{site.baseurl}}/contexts/#restricting-a-context) documentation.

## Secrets masking
{: #secrets-masking }

_Secrets masking is not currently available on self-hosted installations of CircleCI server_

Secrets Masking is applied to environment variables set within Project Settings or under Contexts. Environment variables may hold project secrets or keys that perform crucial functions for your applications. Secrets masking provides added security within CircleCI by obscuring environment variables in the job output when `echo` or `print` are used.

The value of the environment variable will not be masked in the build output if:

* the value of the environment variable is less than 4 characters
* the value of the environment variable is equal to one of `true`, `True`, `false` or `False`

**Note:** Secrets Masking will only prevent the value of the environment variable from appearing in your build output. Invoking a bash shell with the `-x` or `-o xtrace` options may inadvertantly log unmasked secrets (please refer to [Using Shell Scripts]({{site.baseurl}}/using-shell-scripts)).

If your secrets appear elsewhere, such as test results or artifacts, they will not be masked. In addition, the value of the environment variable is still accessible to users [debugging builds with SSH]({{site.baseurl}}/ssh-access-jobs).

## Renaming orgs and repositories
{: #renaming-orgs-and-repositories }

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. Rename org/repo in VCS.
2. Head to the CircleCI application, using the new org/repo name, for example,  `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.

**Note**: If you do not follow these steps, it is possible that you may lose access to your org or repo settings, including **environment variables** and **contexts**.

## Environment variable usage options
{: #environment-variable-usage-options }

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Valid characters include letters (uppercase and lowercase), digits, and the underscore. The first character of each environment variable must be a letter.

### Order of precedence
{: #order-of-precedence }
{:.no_toc}

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command](#setting-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step](#setting-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job](#setting-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables](#built-in-environment-variables) section of this document.
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]({{site.baseurl}}/contexts/) documentation for instructions.
6. [Project-level environment variables](#setting-an-environment-variable-in-a-project) set on the Project Settings page.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.

![Env Var Order]({{site.baseurl}}/assets/img/docs/env-var-order.png)

#### Notes on security
{: #notes-on-security }
{:.no_toc}

Do not add secrets or keys inside the `.circleci/config.yml` file. The full text of `config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project](#setting-an-environment-variable-in-a-project) or [context](#setting-an-environment-variable-in-a-context) settings in the CircleCI app. For more information, see the [Encryption]({{site.baseurl}}/security/#encryption) section of the Security document.

Running scripts within configuration may expose secret environment variables. See the [Using Shell Scripts]({{site.baseurl}}/using-shell-scripts/#shell-script-best-practices) document for best practices for secure scripts.

### Example configuration of environment variables
{: #example-configuration-of-environment-variables }
{:.no_toc}

Consider the example `config.yml` below:

```yaml
version: 2.1

jobs: # basic units of work in a run
  build:
    docker: # use the Docker executor
      # CircleCI node images available at: https://hub.docker.com/r/circleci/node/
      - image: cimg/node:17.2.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      # Run a step to setup an environment variable
      # Redirect MY_ENV_VAR into $BASH_ENV
      - run:
          name: "Setup custom environment variables"
          command: echo 'export MY_ENV_VAR="FOO"' >> $BASH_ENV
      - run: # print the name of the branch we're on
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
      - run:
          name: "Print an env var stored in the Project"
          command: echo ${PROJECT_ENV_VAR}
      - run:
          name: "Print an env var stored in a Context"
          command: echo ${CONTEXT_ENV_VAR}

workflows: # a single workflow with a single job called build
  build:
    jobs:
      - build:
          context: Testing-Env-Vars
```

The above `config.yml` demonstrates the following:

- Setting custom environment variables
- Reading a built-in environment variable that CircleCI provides (`CIRCLE_BRANCH`)
- How variables are used (or interpolated) in your `config.yml`
- Secrets masking, applied to environment variable set in the project or within a Context.

When the above config runs, the output looks like this. Notice the env var stored in the Project is masked, and displays as `****`:

![Env Vars Interpolation Example]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

Notice there are two similar steps in the above image and config - "What branch am I on?". These steps illustrate two different methods to read environment variables. Note that both `${VAR}` and `$VAR` syntaxes are supported. You can read more about shell parameter expansion in the [Bash documentation](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion).

### Using parameters and bash environment
{: #using-parameters-and-bash-environment }
{:.no_toc}

In general, CircleCI does not support interpolating environment variable into build config. Values used are treated as literals. This can cause issues when defining `working_directory`, modifying `PATH`, and sharing variables across multiple `run` steps.

An exception to this rule is the docker image section in order to support [Private Images]({{site.baseurl}}/private-images/).

In the example below, `$ORGNAME` and `$REPONAME` will not be interpolated.

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

Using `version: 2.1` config, you can reuse pieces of config across your
`config.yml`. By using the `parameters` declaration, you can interpolate (or,
"pass values") into reusable `commands` `jobs` and `executors`:

```yaml
version: 2.1

jobs:
  build:
    parameters:
      org_name:
        type: string
        default: my_org
      repo_name:
        type: string
        default: my_repo
    docker:
      - image: cimg/go:1.17.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: echo "project directory is go/src/github.com/<< parameters.org_name >>/<< parameters.repo_name >>"

workflows:
  my_workflow:
    jobs:
      - build:
          org_name: my_organization
          repo_name: project1

      - build:
          org_name: my_organization
          repo_name: project2

```

For more information, read the documentation on [using the parameters declaration]({{site.baseurl}}/reusing-config/#using-the-parameters-declaration).

Another possible method to interpolate values into your config is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH=$GOPATH/bin:$PATH' >> $BASH_ENV
        echo 'export GIT_SHA1=$CIRCLE_SHA1' >> $BASH_ENV
```

In every step, CircleCI uses `bash` to source `BASH_ENV`. This means that `BASH_ENV` is automatically loaded and run,
allowing you to use interpolation and share environment variables across `run` steps.

**Note:**
The `$BASH_ENV` workaround only works with `bash`. Other shells probably won't work.

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

An image that's based on [Alpine Linux](https://alpinelinux.org/) (like [docker](https://hub.docker.com/_/docker)), uses the `ash` shell.

To use environment variables with `bash`, just add these 2 parameters to your job.

```yaml
version: 2.1

jobs:
  build:
    shell: /bin/sh -leo pipefail
    environment:
      - BASH_ENV: /etc/profile
```

## Setting an environment variable in a shell command
{: #setting-an-environment-variable-in-a-shell-command }

While CircleCI does not support interpolation when setting environment variables, it is possible to set variables for the current shell by [using `BASH_ENV`](#using-parameters-and-bash-environment). This is useful for both modifying your `PATH` and setting environment variables that reference other variables.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

## Setting an environment variable in a step
{: #setting-an-environment-variable-in-a-step }

To set an environment variable in a step, use the [`environment` key]({{site.baseurl}}/configuration-reference/#run).

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
to be accessible in more than one step, export the value [using `BASH_ENV`](#using-parameters-and-bash-environment).

## Setting an environment variable in a job
{: #setting-an-environment-variable-in-a-job }

To set an environment variable in a job, use the [`environment` key]({{site.baseurl}}/configuration-reference/#job_name).

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/base:2022.04-20.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
```

**Note: Integers longer than 6 digits will be converted to an exponential number. To avoid this, store them as a string instead (i.e. "1234567").**

## Setting an environment variable in a context
{: #setting-an-environment-variable-in-a-context }

1. On the CircleCI web app, go to your organization settings by clicking the link in the left hand navigation.

    ![Contexts]({{site.baseurl}}/assets/img/docs/org-settings-contexts-v2.png)

2. Select the Context you want to associate your environment variable with, or create a new one by clicking the Create Context button.
3. Click Add Environment Variable and enter a name and value.
4. Use your new environment variable in your `.circleci/config.yml` once the context is added under the workflows key, as follows:

```yaml
version: 2.1

workflows:
  test-env-vars:
    jobs:
      - build:
          context: my_context_name # has an env var called MY_ENV_VAR

jobs:
  build:
    docker:
      - image: cimg/base:2021.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo an env var that is part of our context"
          command: |
            echo $MY_ENV_VAR
```

Creating a context allows you to share environment variables across multiple projects, and control who has access. For more information, see the [Contexts documentation]({{site.baseurl}}/contexts/).

## Setting an environment variable in a project
{: #setting-an-environment-variable-in-a-project }

1. On the CircleCI web app, go to your project's settings. You can do this two ways: Navigate to **Projects** on the side navigation, and then click the ellipsis button in the project's row, or click the **Project Settings** button on the project's individual **Pipelines** page.

    ![Environment Variables]({{site.baseurl}}/assets/img/docs/project-settings-env-var-v2.png)

2. Click on **Environment Variables** in the side navigation.
3. Click the **Add Variable** button to enter a name and value of the new environment variable.
4. Use your new environment variables in your `.circleci/config.yml` as follows:

```yaml
version: 2.1

workflows:
  test-env-vars:
    jobs:
      - build

jobs:
  build:
    docker:
      - image: cimg/base:2021.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo an env var that is part of our project"
          command: |
            echo $MY_ENV_VAR # this env var must be set within the project
```

Once created, environment variables are hidden and uneditable in the application. Changing an environment variable is only possible by deleting and recreating it.

## Setting an environment variable in a container
{: #setting-an-environment-variable-in-a-container }

Environment variables can also be set for a Docker container. To do this, use the [`environment` key]({{site.baseurl}}/configuration-reference/#docker).

**Note**: Environment variables set in this way are not available to _steps_ run within the container, they are only available to the entrypoint/command run _by_ the container. By default, CircleCI will ignore the entrypoint for a job's primary container. For the primary container's environment variables to be useful, you will need to preserve the entrypoint. For more information, see the [_adding an entrypoint_ section of the Custom Images guide]({{site.baseurl}}/custom-images/#adding-an-entrypoint).

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # environment variables available for entrypoint/command run by docker container
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
```

The following example shows separate environment variable settings for the primary container image (listed first) and the secondary or service container image.

**Note**: While hard-coded environment variable values will be passed on correctly to the secondary or service container, contexts or project specific environment variables will not be interpolated for non-primary containers.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MY_ENV_VAR_1: my-value-1
          MY_ENV_VAR_2: my-value-2
      - image: <image>:<tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MY_ENV_VAR_3: my-value-3
          MY_ENV_VAR_4: my-value-4
```

### Encoding multi-line environment variables
{: #encoding-multi-line-environment-variables }
{:.no_toc}

If you are having difficulty adding a multiline environment variable, use `base64` to encode it.

```shell
$ echo "foobar" | base64 --wrap=0
Zm9vYmFyCg==
```

Store the resulting value in a CircleCI environment variable.

```shell
$ echo $MYVAR
Zm9vYmFyCg==
```

Decode the variable in any commands that use the variable.

```shell
$ echo $MYVAR | base64 --decode | docker login -u my_docker_user --password-stdin
Login Succeeded
```

**Note:**
Not all command-line programs take credentials in the same way that `docker` does.

## Injecting environment variables with API v2
{: #injecting-environment-variables-with-api-v2 }

Pipeline parameters can be used to pass variables using the CircleCI API v2.

A pipeline can be triggered with specific `parameter` values using the API v2
endpoint to [trigger a pipeline]({{site.baseurl}}/api/v2/#operation/getPipelineConfigById).
This can be done by passing a `parameters` key in the JSON packet of the `POST` body.

The example below triggers a pipeline with the parameters described in the above config example (NOTE: To pass a parameter when triggering a pipeline via the API the parameter must be declared in the configuration file.).

```shell
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

**IMPORTANT** Pipeline parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). You can find this sensitive information in [Project Settings]({{site.baseurl}}/settings/) and [Contexts]({{site.baseurl}}/glossary/#context).

Read more in the [Pipeline Values and Parameters]({{site.baseurl}}/pipeline-variables/) guide.

## Injecting environment variables with API v1
{: #injecting-environment-variables-with-api-v1 }

Build parameters are environment variables, therefore their names have to meet the following restrictions:

- They must contain only ASCII letters, digits and the underscore character.
- They must not begin with a number.
- They must contain at least one character.

Aside from the usual constraints for environment variables there are no restrictions on the values themselves and are treated as simple strings. The order that build parameters are loaded in is **not** guaranteed so avoid interpolating one build parameter into another. It is best practice to set build parameters as an unordered list of independent environment variables.

**IMPORTANT** Build parameters are not treated as sensitive data and must not be used by customers for sensitive values (secrets). You can find this sensitive information in [Project Settings]({{site.baseurl}}/settings/) and [Contexts]({{site.baseurl}}/glossary/#context).

For example, when you pass the parameters:

```json
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

```shell
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

Build parameters are exported as environment variables inside each job's containers and can be used by scripts/programs and commands in `config.yml`. The injected environment variables may be used to influence the steps that are run during the job. It is important to note that injected environment variables will not override values defined in `config.yml` nor in the project settings.

You might want to inject environment variables with the `build_parameters` key to enable your functional tests to build against different targets on each run. For example, a run with a deploy step to a staging environment that requires functional testing against different hosts. It is possible to include `build_parameters` by sending a JSON body with `Content-type: application/json` as in the following example that uses `bash` and `curl` (though you may also use an HTTP library in your language of choice).

```json
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

For example using `curl`

```shell
curl \
  --header "Content-Type: application/json" \
  --header "Circle-Token: $CIRCLE_TOKEN" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master
```

In the above example,
`$CIRCLE_TOKEN` is a [personal API token]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token).

The build will see the environment variables:

```shell
export param1="value1"
export param2="500"
```

Start a run with the POST API call, see the [new build](https://circleci.com/docs/api/v1/#trigger-a-new-build-with-a-branch) section of the API documentation for details. A POST with an empty body will start a new run of the named branch.

## Built-in environment variables
{: #built-in-environment-variables }

Built-in environment variables are exported in each job and can be used for more complex testing or deployment.

{% include snippets/built-in-env-vars.md %}

For a full list of available built-in data see the [Project Values and Variables guide]({{site.baseurl}}/variables/#built-in-environment-variables).

## See also
{: #see-also }
{:.no_toc}

[Contexts]({{site.baseurl}}/contexts/)
[Keep environment variables private with secret masking](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)
