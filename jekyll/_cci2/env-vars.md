---
layout: classic-docs
title: Introduction to environment variables
short-title: Environment variables
description: Introduction to environment variables in CircleCI
contentTags:
  platform:
    - Cloud
    - Server v4.x
    - Server v3.x
suggested:
  - title: Keep environment variables private
    link: https://circleci.com/blog/keep-environment-variables-private-with-secret-masking/
  - title: Troubleshoot environment variables settings
    link: https://discuss.circleci.com/t/somehow-i-just-cannot-get-the-enviroment-variable-from-enviroment-variable-setting-an-context-in-organization-menu/40342
  - title: Insert files as environment variables
    link: https://support.circleci.com/hc/en-us/articles/360003540393?input_string=how+to+i+inject+an+environment+variable+using+the+api%3F
---

## Introduction
{: #introduction }

Use environment variables to set up various configuration options, and keep your set-up secure with secrets, private keys, and contexts. Environment variables in CircleCI are governed by an [order of precedence](#order-of-precedence), allowing control at each level in your configuration. See the [Set an environment variable](/docs/set-environment-variable/) page for guidance on the different ways to set an environment variable.

If you have existing environment variables (or contexts) and you would like to rename your organization or repository, please follow the [Rename organizations and repositories]({{site.baseurl}}/rename-organizations-and-repositories) guide to make sure you do not lose access to environment variables or contexts in the process.

## Built-in environment variables
{: #built-in-environment-variables }

All projects have access to CircleCI's built-in environment variables. These environment variables are scoped at the job level, so they can be used with the `context` key in a job, but they do not exist at a pipeline level.

For a full list of built-in environment variables, see the [Project values and variables]({{site.baseurl}}/variables#built-in-environment-variables) page.

## Private keys and secrets
{: #private-keys-and-secrets }

To add private keys or secrets as environment variables for use throughout your project, navigate to **Project Settings > Environment Variables** in the [CircleCI web app](https://app.circleci.com/). You can find step-by-step instructions of this process on the [Environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) page. The variable values are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable, and add it again with the new value.

Private environment variables enable you to store secrets safely, even when your project is public. Refer to the [Building open source projects]({{site.baseurl}}/oss/) page for associated security and settings information.

{% include snippets/secrets-masking.md %}

## Environment variable usage options
{: #environment-variable-usage-options }

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Valid characters include letters (uppercase and lowercase), digits, and the underscore. 

### Order of precedence
{: #order-of-precedence }

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined in the [CircleCI Built-in environment variables]({{site.baseurl}}/variables#built-in-environment-variables) document.
5. Context environment variables (assuming the user has access to the context). See the [Contexts]({{site.baseurl}}/contexts/) documentation for more information.
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the **Project Settings** page in the web app.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the **Contexts** page in the web app will take precedence over variables added on the **Project Settings** page.

![Environment variable order of precedence]({{site.baseurl}}/assets/img/docs/env-var-order.png)

### Example configuration of environment variables
{: #example-configuration-of-environment-variables }

Consider the example `.circleci/config.yml` below:

```yaml
version: 2.1

jobs: # basic units of work in a run
  build:
    docker: # use the Docker executor
      # CircleCI Node images available at: https://circleci.com/developer/images/image/cimg/node
      - image: cimg/node:18.11.0
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

The above `.circleci/config.yml` demonstrates the following:

- Setting custom environment variables
- Reading a built-in environment variable that CircleCI provides (`CIRCLE_BRANCH`)
- How variables are used (or interpolated) in your `.circleci/config.yml`
- Secrets masking, applied to environment variable set in the project or within a context.

When the above configuration runs, the output looks like the below image. Notice the environment variables stored in the project is masked, and displays as `****`:

![Environment variable interpolation example]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

Notice there are two similar steps in the above image and configuration - "What branch am I on?" These steps illustrate two different methods to read environment variables.

In the example configuration above, two syntaxes are used: `${VAR}` and `$VAR`. Both syntaxes are supported. You can read more about shell parameter expansion in the [Bash documentation](https://www.gnu.org/software/bash/manual/bashref.html#Shell-Parameter-Expansion).

### Parameters and bash environment
{: #parameters-and-bash-environment }

In general, CircleCI does not support interpolating environment variables in the configuration. Values used are treated as literals. This can cause issues when defining `working_directory`, modifying `PATH`, and sharing variables across multiple `run` steps.

In the example below, `$ORGNAME` and `$REPONAME` will not be interpolated.

```yaml
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

An exception to this rule is using project environment variables to pull [private images]({{site.baseurl}}/private-images/).
{: class="alert alert-info" }

You can reuse pieces of configuration across your `.circleci/config.yml` file. By using the `parameters` declaration, you can pass values into reusable `commands`, `jobs`, and `executors`:

```yaml
version: 2.1 # version 2.1 is required for reusing configuration

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

Another possible method to interpolate values into your configuration is to use a `run` step to export environment variables to `BASH_ENV`, as shown below.

The `$BASH_ENV` workaround only works with `bash`, and has not been confirmed to work with other shells.
{: class="alert alert-info"}

```yaml
steps:
  - run:
      name: Setup Environment Variables
      command: |
        echo 'export PATH="$GOPATH"/bin:"$PATH"' >> "$BASH_ENV"
        echo 'export GIT_SHA1="$CIRCLE_SHA1"' >> "$BASH_ENV"
```

In every step, CircleCI uses `bash` to source `BASH_ENV`. This means that `BASH_ENV` is automatically loaded and run, allowing you to use interpolation and share environment variables across `run` steps.

### Environment variable substitution
{: #environment-variable-substitution }

The CircleCI CLI offers a wrapper around the [`envsubst`](https://github.com/a8m/envsubst) tool, available both locally as well as in all jobs running on CircleCI. `envsubst` is a command-line utility used to replace environment variables in text strings.

CLI command:

```sh
circleci env subst
```

#### Usage
{: #env-subst-usage }

The `circleci env subst` command can accept text input from `stdin` or as an argument.

Within your repository create a file such as `template.json`, with value replaced by environment variable strings

```json
{
  "foo": "$FOO",
  "provider": "${PROVIDER}"
}
```

`envsubst` can convert all types of environment variable strings, including those encased in curly braces (`{}`).

The config example below shows the corresponding environment variables as if they were defined directly within a step in the config. However, we strongly recommend creating the environment variables in the CircleCI app, either in [Project Settings](/docs/set-environment-variable/#set-an-environment-variable-in-a-project/) or as a [context](/docs/contexts).

```yaml
version: 2.1
jobs:
  process-template:
    docker:
      - image: cimg/base:current
    steps:
      - checkout
      - run:
          name: Process template file
          environment:
            # Environment variables would typically be served via a context
            FOO: bar
            PROVIDER: circleci
          command: |
            circleci env subst < template.json > deploy.json
            cat deploy.json
workflows:
  env-subst-workflow:
    jobs:
      - process-template
```

In this example, the `<` symbol is used to redirect the contents of the `template.json` file as _input_ to the `env subst` command, while the `>` symbol is used to redirect the output of the env subst command to the `deploy.json`.

You could alternatively pass input to the `circleci env subst` command as an argument: `circleci env subst "hello \$WORLD"`

Output:

```sh
{
  "foo": "bar",
  "provider": "circleci"
}
```

For instructions on installing the CircleCI CLI locally, read the [Installing the CircleCI local CLI](/docs/local-cli/) guide.

### Alpine Linux
{: #alpine-linux }

An image that has been based on [Alpine Linux](https://alpinelinux.org/) (like [Docker](https://hub.docker.com/_/docker)), uses the `ash` shell.

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

Do not add secrets or keys inside the `.circleci/config.yml` file. The full text of `.circleci/config.yml` is visible to developers with access to your project on CircleCI. Store secrets or keys in [project]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-project) or [context]({{site.baseurl}}/set-environment-variable/#setting-an-environment-variable-in-a-context) settings in the CircleCI web app. For more information, see the [Encryption]({{site.baseurl}}/security/#encryption) section of the security page.

Running scripts within configuration may expose secret environment variables. See the [Using shell scripts]({{site.baseurl}}/using-shell-scripts/#shell-script-best-practices) page for best practices for secure scripts.

## Contexts
{: #contexts }

You can further restrict access to environment variables using [contexts]({{site.baseurl}}/contexts). Contexts are set from the **Organization Settings** in the CircleCI web app.

## See also
{: #see-also }

- [Security recommendations](/docs/security-recommendations)
- [Set an environment variable](/docs/set-environment-variable/)
- [Inject variables using the CircleCI API](/docs/inject-environment-variables-with-api/)
