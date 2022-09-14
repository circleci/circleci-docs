---
layout: classic-docs
title: "Environment Variables"
short-title: "Environment Variables"
description: "Understanding environment variables in CircleCI"
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

## Overview
{: #overview }

Environment variables in CircleCI are governed by an [order of precedence](#order-of-precedence), depending on how they are set, allowing control at each level in your configuration.

To add **private keys** or **secret environment variables** for use throughout your private project, use the [Environment Variables page under Project Settings]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) on the CircleCI web app. The variable values are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable and add it again with the new value.

Private environment variables enable you to store secrets safely even when your project is public. Refer to the [Building Open Source Projects]({{site.baseurl}}/oss/) page for associated settings information.

Use Contexts to [further restrict access to environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-context). Contexts are set from the Organization Settings in the CircleCI application. For more information about controlling access to env vars with Contexts, refer to the [Restricting a Context]({{site.baseurl}}/contexts/#restricting-a-context) documentation.

## Secrets masking
{: #secrets-masking }

_Secrets masking is not currently available on self-hosted installations of CircleCI server_

Secrets masking is applied to environment variables set within Project Settings or under Contexts. Environment variables may hold project secrets or keys that perform crucial functions for your applications. Secrets masking provides added security within CircleCI by obscuring environment variables in the job output when `echo` or `print` are used.

The value of the environment variable will not be masked in the job output if:

* the value of the environment variable is less than 4 characters
* the value of the environment variable is equal to one of `true`, `True`, `false` or `False`

**Note:** Secrets masking will only prevent the value of the environment variable from appearing in your job output. Invoking a bash shell with the `-x` or `-o xtrace` options may inadvertantly log unmasked secrets (please refer to [Using Shell Scripts]({{site.baseurl}}/using-shell-scripts)).

If your secrets appear elsewhere, such as test results or artifacts, they will not be masked. In addition, the value of the environment variable is still accessible to users [debugging builds with SSH]({{site.baseurl}}/ssh-access-jobs).

## Environment variable usage options
{: #environment-variable-usage-options }

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Valid characters include letters (uppercase and lowercase), digits, and the underscore. The first character of each environment variable must be a letter.

### Order of precedence
{: #order-of-precedence }

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command](({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables]({{site.baseurl}}/built-in-environment-variables) document.
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]({{site.baseurl}}/contexts/) documentation for instructions.
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the Project Settings page.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.

![Env Var Order]({{site.baseurl}}/assets/img/docs/env-var-order.png)

### Example configuration of environment variables
{: #example-configuration-of-environment-variables }

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
          command: echo 'export MY_ENV_VAR="FOO"' >> "$BASH_ENV"
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

Notice there are two similar steps in the above image and config - "What branch am I on?". These steps illustrate two different methods to read environment variables. 

Note that both `${VAR}` and `$VAR` syntaxes are supported. You can read more about shell parameter expansion in the [Bash documentation](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion).

### Using parameters and bash environment
{: #using-parameters-and-bash-environment }

In general, CircleCI does not support interpolating environment variables in the config. Values used are treated as literals. This can cause issues when defining `working_directory`, modifying `PATH`, and sharing variables across multiple `run` steps.

In the example below, `$ORGNAME` and `$REPONAME` will not be interpolated.

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

An exception to this rule is using project environment variables to pull [private images]({{site.baseurl}}/private-images/).

Using `version: 2.1` config, you can reuse pieces of config across your
`config.yml`. By using the `parameters` declaration, you can pass values into reusable `commands`, `jobs`, and `executors`:

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

Another possible method to "interpolate" values into your config is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH"/bin:"$PATH"' >> "$BASH_ENV"
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> "$BASH_ENV"
```

In every step, CircleCI uses `bash` to source `BASH_ENV`. This means that `BASH_ENV` is automatically loaded and run,
allowing you to use interpolation and share environment variables across `run` steps.

**Note:**
The `$BASH_ENV` workaround only works with `bash`, and has not been confirmed to work with other shells.

### Alpine Linux
{: #alpine-linux }
{:.no_toc}

An image that's based on [Alpine Linux](https://alpinelinux.org/) (like [docker](https://hub.docker.com/_/docker)), uses the `ash` shell.

To use environment variables with `bash`, add the `shell` and `environment` keys to your job.

```yaml
version: 2.1

jobs:
  build:
    shell: /bin/sh -leo pipefail
    environment:
      BASH_ENV: /etc/profile
```

## Notes on security
{: #notes-on-security }

Do not add secrets or keys inside the `.circleci/config.yml` file. The full text of `config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project](#setting-an-environment-variable-in-a-project) or [context](#setting-an-environment-variable-in-a-context) settings in the CircleCI app. For more information, see the [Encryption]({{site.baseurl}}/security/#encryption) section of the Security document.

Running scripts within configuration may expose secret environment variables. See the [Using Shell Scripts]({{site.baseurl}}/using-shell-scripts/#shell-script-best-practices) document for best practices for secure scripts.

## See also
{: #see-also }
{:.no_toc}

- [Inject variables using the CircleCI API]({{site.baseurl}}/inject-environment-variables-with-api/)
- [Built-in environment variables in CircleCI]({{site.baseurl}}/built-in-environment-variables)
- [Contexts]({{site.baseurl}}/contexts/)
- [Keep environment variables private with secret masking](https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/)
