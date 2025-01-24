---
layout: classic-docs
title: "Reusable Config Reference Guide"
short-title: "Reusable Config Reference"
description: "Reference guide for CircleCI 2.1 Configuration"
categories: [configuration]
order: 1
contentTags:
  platform:
  - Cloud
  - Server v4+
---

This guide describes how to get started with reusable commands, jobs, executors and orbs. This guide also covers the use of parameters for creating parameterized reusable elements.

{% include snippets/docker-auth.md %}

## Notes on reusable configuration
{: #notes-on-reusable-configuration }

* Install the CircleCI CLI so that you have access to the `circleci config process` command (optional). This command lets you see the expanded configuration with all reusable keys processed. Follow the [Using the CircleCI CLI](/docs/local-cli/) documentation for installation instructions and tips.

* CircleCI reusable configuration elements require a **`version: 2.1`** `.circleci/config.yml` file.

* Command, job, executor, and parameter names must start with a letter and can only contain lowercase letters (`a`-`z`), digits (`0`-`9`), underscores (`_`) and hyphens (`-`).

## Using the `parameters` declaration
{: #using-the-parameters-declaration }

Parameters are declared by name under a job, command, or executor. _Pipeline parameters_ are defined at the top level of a project configuration. See the [Pipeline Values and Parameters guide](/docs/pipeline-variables/#pipeline-parameters-in-configuration) for more information.

The immediate children of the `parameters` key are a set of keys in a map.

In the following example, a command named `greeting` is designed with a single parameter named `to`. The `to` parameter is used within the steps to echo _Hello_ back to the user.

```yaml
version: 2.1
commands: # a reusable command with parameters
  greeting:
    parameters:
      to:
        default: "world"
        type: string
    steps:
      - run: echo "Hello <<parameters.to>>"
jobs:
  my-job:
    docker:
      - image: cimg/base:stable
    steps:
      - greeting:
          to: "My-Name"
workflows:
  my-workflow:
    jobs:
      - my-job


```

### Parameter syntax
{: #parameter-syntax }

A parameter can have the following keys as immediate children:

Key Name | Description | Default value
---|---|---
description | Optional. Used to generate documentation for your orb. | N/A
type | Required. See **Parameter Types** in the section below for details. | N/A
default | The default value for the parameter. Required for pipeline parameters. For all other parameters, if not present, the parameter is implied to be required. | N/A
{: class="table table-striped"}

### Parameter types
{: #parameter-types }

This section describes the types of parameters and their usage.

The parameter types supported by orbs are:
* `string`
* `boolean`
* `integer`
* `enum`
* `executor`
* `steps`
* environment variable name

The parameter types supported by pipeline parameters are:
* `string`
* `boolean`
* `integer`
* `enum`

#### String
{: #string }

Basic string parameters are described below:

```yaml
version: 2.1
commands:
  copy-markdown:
    parameters:
      destination:
        description: destination directory
        type: string
        default: docs
    steps:
      - run: cp *.md << parameters.destination >>
```

Strings must be enclosed in quotes if they would otherwise represent another type (such as boolean or number) or if they contain characters that have special meaning in YAML, particularly for the colon character. In all other instances, quotes are optional.

Empty strings are treated as a falsy value in evaluation of `when` clauses, and all other strings are treated as truthy. Using an unquoted string value that YAML interprets as a boolean will result in a type error.

#### Boolean
{: #boolean }

Boolean parameters are useful for conditionals:

```yaml
version: 2.1
commands:
  npm-install:
    parameters:
      clean:
        description: Perform a clean install
        type: boolean
        default: false
    steps:
      - when:
          condition: << parameters.clean >>
          steps:
            - run: npm clean-install
      - when:
          condition:
            not: << parameters.clean >>
          steps:
            - run: npm install
```

Boolean parameter evaluation is based on the [values specified in YAML 1.1](https://yaml.org/type/bool.html):

* True: `yes` `true` `on`
* False: `no` `false` `off`

Capitalized and uppercase versions of the above values are also valid.

Boolean values may be returned as a '1' for True and '0' for False.
{: class="alert alert-info" }

#### Integer
{: #integer }

Use the parameter type `integer` to pass a numeric integer value.

The following example uses the `integer` type to populate the value of `parallelism` in a job:

```yaml
version: 2.1
jobs:
  build:
    parameters:
      p:
        type: integer
        default: 1
    parallelism: << parameters.p >>
    docker:
      - image: cimg/base:2023.11
    steps:
      - checkout
workflows:
  workflow:
    jobs:
      - build:
          p: 2
```

#### Enum
{: #enum }

The `enum` parameter may be a list of any values. Use the `enum` parameter type when you want to enforce that the value must be one from a specific set of string values.

The following example uses the `enum` parameter to declare the target operating system for a binary:

```yaml
version: 2.1

commands:
  list-files:
    parameters:
      os:
        default: "linux"
        description: The target Operating System for the heroku binary. Must be one of "linux", "darwin", "win32".
        type: enum
        enum: ["linux", "darwin", "win32"]
```

The following `enum` type declaration is invalid because the default is not declared in the enum list.

{% raw %}
```yaml
version: 2.1

commands:
  list-files:
    parameters:
      os:
        type: enum
        default: "windows" #invalid declaration of default that does not appear in the comma-separated enum list
        enum: ["darwin", "linux"]
```
 {% endraw %}

#### Executor
{: #executor }

Use an `executor` parameter type to allow the invoker of a job to decide which executor to use to run the job.

The following example uses parameters:

* The `executor` parameter to allow the invoker of a job to decide which executor to use to run the job: `ubuntu`, `xenial`, `bionic`.
* For the `ubuntu` executor:
  * A string parameter is used to set the image to use.
  * A boolean parameter is used to enable/disable [Docker layer caching](/docs/docker-layer-caching).
  * An enum parameter is used to choose a [resource class](/docs/configuration-reference#linuxvm-execution-environment).

* For the `xenial` executor:
  * A string parameter is used to set an environment variable.

{% raw %}
```yaml
version: 2.1

executors:
  ubuntu:
    parameters:
      image:
        type: string
        default: ubuntu-2404:current
        description: Specifies the machine image to use for the executor
      docker_layer_caching:
        type: boolean
        default: false
        description: Enables Docker layer caching during builds
      resource_class:
        type: enum
        enum: ["medium", "large", "xlarge", "2xlarge", "2xlarge+"]
        description: Specifies the resource class for the executor
    machine:
      image: << parameters.image >>
      docker_layer_caching: << parameters.docker_layer_caching >>
    resource_class: << parameters.resource_class >>
  xenial:
    parameters:
      some-value:
        type: string
        default: foo
    environment:
      SOME_VAR: << parameters.some-value >>
    docker:
      - image: ubuntu:xenial
  bionic:
    docker:
      - image: ubuntu:bionic

jobs:
  test:
    parameters:
      e:
        type: executor
        default: ubuntu
    executor: << parameters.e >>
    steps:
      - run: some-tests

workflows:
  workflow:
    jobs:
      - test:
          e: bionic # Choose to run the test job on the bionic executor
      - test:
          e:
            name: xenial # Choose to run the test job on the xenial executor
            some-value: foobar
      - test:
          e:
            name: ubuntu # Choose to run the test job on the ubuntu executor
            docker_layer_caching: true # Enable Docker layer caching
            resource_class: medium # Set the resource class to medium
            image: ubuntu-2404:edge # Set the image to use
```
{% endraw %}

#### Steps
{: #steps }

Steps are used when you have a job or command that needs to mix predefined and user-defined steps. When passed in to a command or job invocation, the steps passed as parameters are always defined as a sequence, even if only one step is provided.

{% raw %}
```yaml
version: 2.1

commands:
  run-tests:
    parameters:
      after-deps:
        description: "Steps that will be executed after dependencies are installed, but before tests are run"
        type: steps
        default: []
    steps:
      - run: make deps
      - steps: << parameters.after-deps >>
      - run: make test
```
{% endraw %}

The following example demonstrates that steps passed as parameters are given as the value of a `steps` declaration under the job's `steps`.

{% raw %}
```yaml
version: 2.1

commands:
  run-tests:
    parameters:
      after-deps:
        description: "Steps that will be executed after dependencies are installed, but before tests are run"
        type: steps
        default: []
    steps:
      - run: make deps
      - steps: << parameters.after-deps >>
      - run: make test

jobs:
  build:
    docker:
      - image: cimg/base:2023.11
    steps:
      - run-tests:
          after-deps:
            - run: echo "The dependencies are installed"
            - run: echo "And now I'm going to run the tests"
```
{% endraw %}

The above will resolve to the following:

{% raw %}
```yaml
version: 2.1
steps:
  - run: make deps
  - run: echo "The dependencies are installed"
  - run: echo "And now I'm going to run the tests"
  - run: make test
```
{% endraw %}

#### Environment variable name
{: #environment-variable-name }

The environment variable name (`env_var_name`) parameter is a string that must match a POSIX_NAME regular expression (for example, there can be no spaces or special characters). The `env_var_name` parameter is a more meaningful parameter type that enables CircleCI to check that the string that has been passed can be used as an environment variable name. For more information on environment variables, see the guide to [Environment Variables](/docs/env-vars/).

The example below shows you how to use the `env_var_name` parameter type for deploying to AWS S3 with a reusable `build` job. This example uses the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` environment variables with the `access-key` and `secret-key` parameters. If you have a deploy job that runs the `s3cmd`, it is possible to create a reusable command that uses the needed authentication, but deploys to a custom bucket.

{% raw %}

Original `config.yml` file:
```yaml
version: 2.1

jobs:
  build:
    docker:
    - image: ubuntu:latest
    steps:
    - run:
        command: |
          s3cmd --access_key ${FOO_BAR} \
                --secret_key ${BIN_BAZ} \
                ls s3://some/where
workflows:
  workflow:
    jobs:
    - build
```

New `config.yml` file:

```yaml
version: 2.1

jobs:
   build:
     parameters:
       access-key:
         type: env_var_name
         default: AWS_ACCESS_KEY
       secret-key:
         type: env_var_name
         default: AWS_SECRET_KEY
       command:
         type: string
     docker:
       - image: ubuntu:latest
     steps:
       - run: |
           s3cmd --access_key ${<< parameters.access-key >>} \\
                 --secret_key ${<< parameters.secret-key >>} \\
                 << parameters.command >>
workflows:
  workflow:
    jobs:
      - build:
          access-key: FOO_BAR
          secret-key: BIN_BAZ
          command: ls s3://some/where
```
{% endraw %}

## Authoring reusable commands
{: #authoring-reusable-commands }

Commands are declared under the `commands` key of a `.circleci/config.yml` file. The following example defines a command called `sayhello`, which accepts a string parameter `to`:

```yaml
version: 2.1

commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
    parameters:
      to:
        type: string
        default: "World"
    steps:
      - run: echo Hello << parameters.to >>
```

### The `commands` key
{: #the-commands-key }


A command defines a sequence of steps as a map to be executed in a job, enabling you to reuse a single command definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
steps | Y | Sequence | A sequence of steps that run inside the job that calls the command.
parameters | N  | Map | A map of parameter keys. See the [Parameter Syntax](/docs/reusing-config/#parameter-syntax) section for details.
description | N | String | A string that describes the purpose of the command. Used for generating documentation.
{: class="table table-striped"}

### Invoking reusable commands
{: #invoking-reusable-commands }

Reusable commands are invoked with specific parameters as steps inside a job. When using a command, the steps of that command are inserted at the location where the command is invoked. Commands may only be used as part of the sequence under `steps` in a job.

The following example uses the same command from the previous example – `sayhello` – and invokes it in the job `myjob`, passing it a value for the `to` parameter:

```yaml
version: 2.1

commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
    parameters:
      to:
        type: string
        default: "World"
    steps:
      - run: echo Hello << parameters.to >>

jobs:
  myjob:
    docker:
      - image: "cimg/base:stable"
    steps:
      - sayhello: # invoke command "sayhello"
          to: "Lev"
```

### Invoking other commands in a command
{: #invoking-other-commands-in-a-command }

Commands can use other commands in the scope of execution. For instance, if a command is declared inside an orb it can use other commands in that orb. It can also use commands defined in other orbs that you have imported (for example `some-orb/some-command`).

### Special keys
{: #special-keys }

CircleCI has several special keys available to all [circleci.com](https://circleci.com) customers and available by default in CircleCI server installations. Examples of these keys are:

  * `checkout`
  * `setup_remote_docker`
  * `persist_to_workspace`

It is possible to override the special keys with a custom command.
{: class="alert alert-info" }

### Commands usage examples
{: #commands-usage-examples }

The following is an example of part of the `aws-s3` orb where a command called `sync` is defined:

```yaml
#...
sync:
    description: Syncs directories and S3 prefixes.
    parameters:
        arguments:
            default: ""
            description: |
                Optional additional arguments to pass to the `aws sync` command (e.g., `--acl public-read`). Note: if passing a multi-line value to this parameter, include `\` characters after each line, so the Bash shell can correctly interpret the entire command.
            type: string
        aws-access-key-id:
            default: AWS_ACCESS_KEY_ID
            description: aws access key id override
            type: env_var_name
        aws-region:
            default: AWS_REGION
            description: aws region override
            type: env_var_name
        aws-secret-access-key:
            default: AWS_SECRET_ACCESS_KEY
            description: aws secret access key override
            type: env_var_name
        from:
            description: A local *directory* path to sync with S3
            type: string
        to:
            description: A URI to an S3 bucket, i.e. 's3://the-name-my-bucket'
            type: string
    steps:
        - aws-cli/setup:
            aws-access-key-id: << parameters.aws-access-key-id >>
            aws-region: << parameters.aws-region >>
            aws-secret-access-key: << parameters.aws-secret-access-key >>
        - deploy:
            command: |
                aws s3 sync \
                  <<parameters.from>> <<parameters.to>> <<parameters.arguments>>
            name: S3 Sync
#...
```

To invoke this `sync` command in your 2.1 `.circleci/config.yml` file, see the following example:

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@4.1.0

jobs:
  deploy2s3:
    docker:
      - image: cimg/base:2023.06
    steps:
      - aws-s3/sync:
          from: .
          to: "s3://mybucket_uri"

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3
```

Defining a `build` job:

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@5.1.1
  aws-s3: circleci/aws-s3@4.1.0

jobs:
  build:
    executor: aws-cli/default
    steps:
      - checkout
      - run: mkdir bucket && echo "lorum ipsum" > bucket/build_asset.txt
      - aws-s3/sync:
          from: bucket
          to: "s3://my-s3-bucket-name/prefix"
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: "s3://my-s3-bucket-name"
          arguments: --dryrun
```

## Authoring reusable executors
{: #authoring-reusable-executors }

Executors define the environment in which the steps of a job will be run. When declaring a `job` in CircleCI configuration, you define the type of execution environment (`docker`, `machine`, `macos`. etc.) to run in, as well as any other parameters for that environment, including: environment variables to populate, which shell to use, what size `resource_class` to use, etc.

Executor declarations outside of `jobs` can be used by all jobs in the scope of that declaration, allowing you to reuse a single executor definition across multiple jobs.

An executor definition includes one or more of the following keys:

- `docker` or `machine` or `macos`
- `environment`
- `working_directory`
- `shell`
- `resource_class`

In the following example `my-executor` is used for running the job `my-job`.

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:2.5.1-browsers
jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

### The `executors` key
{: #the-executors-key }

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for `docker` executor.
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job.
machine | Y <sup>(1)</sup> | Map | Options for `machine` executor.
macos | Y <sup>(1)</sup> | Map | Options for `macOS` executor.
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step.
working_directory | N | String | The directory in which to run the steps.
environment | N | Map | A map of environment variable names and values.
{: class="table table-striped"}

Example:

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:2.5.1-browsers
jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

### Invoking reusable executors
{: #invoking-reusable-executors }


The following example passes `my-executor` as the value of a `name` key under `executor` -- this method is primarily employed when passing parameters to executor invocations:

```yaml
version: 2.1

executors:
  my-executor:
    docker:
      - image: cimg/ruby:3.2.2
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

It is also possible to allow an orb to define the executor used by all of its commands. This allows users to execute the commands of that orb in the execution environment defined by the orb's author.

### Example of using an executor declared in `config.yml` with matrix jobs.
{: #example-of-using-an-executor-declared-in-configyml-with-matrix-jobs }

The following example declares a Docker executor with a node image, `node-docker`. The tag portion of the image string is parameterized with a `version` parameter. A `version` parameter is also included in the `test` job so that it can be passed through the job into the executor when the job is called from a workflow.

When calling the `test` job in the `matrix-tests` workflow, [matrix jobs](/docs/configuration-reference/#matrix) are used to run the job multiple times, concurrently, each with a different set of parameters. The Node application is tested against many versions of Node.js:


```yaml
version: 2.1

executors:
  node-docker: # declares a reusable executor
    parameters:
      version:
        description: "version tag"
        default: "lts"
        type: string
    docker:
      - image: cimg/node:<<parameters.version>>

jobs:
  test:
    parameters:
      version:
        description: "version tag"
        default: "lts"
        type: string
    executor:
      name: node-docker
      version: <<parameters.version>>
    steps:
      - checkout
      - run: echo "how are ya?"

workflows:
  matrix-tests:
    jobs:
      - test:
          matrix:
            parameters:
              version:
                - 13.11.0
                - 12.16.0
                - 10.19.0
```

### Using executors defined in an orb
{: #using-executors-defined-in-an-orb }

You can also refer to executors from other orbs. Users of an orb can invoke its executors. For example, `foo-orb` could define the `bar` executor:

```yaml
version: 2.1
# Yaml from foo-orb
executors:
  bar:
    docker:
      - image: cimg/base:2023.11
    environment:
      RUN_TESTS: foobar
```

`baz-orb` could define the `bar` executor too:

```yaml
version: 2.1
# Yaml from baz-orb
executors:
  bar:
    docker:
      - image: cimg/base:stable
```

You may use either executor from your configuration file with:

```yaml
version: 2.1
# config.yml
orbs:
  foo-orb: somenamespace/foo@1
  baz-orb: someothernamespace/baz@3.3.1
jobs:
  some-job:
    executor: foo-orb/bar  # prefixed executor
  some-other-job:
    executor: baz-orb/bar  # prefixed executor
```

**Note:** The `foo-orb/bar` and `baz-orb/bar` are different executors. They both have the local name `bar` relative to their orbs, but they are independent executors defined in different orbs.

### Overriding keys when invoking an executor
{: #overriding-keys-when-invoking-an-executor }

When invoking an executor in a `job`, any keys in the job itself will override those of the executor invoked. For example, if your job declares a `docker` stanza, it will be used, in its entirety, instead of the one in your executor.

The `environment` variable maps are additive. If an `executor` has one of the same `environment` variables as the `job`, the value in the job will be used. See the [Environment Variables guide](/docs/env-vars/#order-of-precedence) for more information.
{: class="alert alert-info" }

```yaml
version: 2.1

executors:
  node:
    docker:
      - image: cimg/node:lts
    environment:
      ENV: ci

jobs:
  build:
    docker:
      - image: cimg/base:stable
    # The test executor below will be overwritten by the more explicit "docker" executor. Any env vars will be added.
    executor: node
    steps:
      - run: echo "Node will not be installed."
```

The above config would resolve to the following:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/base:stable
    environment:
      ENV: ci       # From executor.
    steps:
      - run: echo "Node will not be installed."
```

## Authoring parameterized jobs
{: #authoring-parameterized-jobs }

It is possible to invoke the same job more than once in the workflows stanza of `.circleci/config.yml`, passing any necessary parameters as subkeys to the job. See the [Parameters syntax section](#parameter-syntax) above for details of syntax usage.

Example of defining and invoking a parameterized job in a `config.yml`:

{% raw %}
```yaml
version: 2.1

jobs:
  sayhello: # defines a parameterized job
    description: A job that does very little other than demonstrate what a parameterized job looks like
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    docker:
      - image: cimg/base:2023.11
    steps:
      - run: echo "Hello << parameters.saywhat >>"

workflows:
  build:
    jobs:
      - sayhello: # invokes the parameterized job
          saywhat: Everyone
```
{% endraw %}

When invoking the same job multiple times with parameters across any number of workflows, the build name will be changed (i.e. `sayhello-1`, `sayhello-2`, etc.). To ensure build numbers are not appended, utilize the `name` key. The name you assign needs to be unique, otherwise the numbers will still be appended to the job name. As an example:
{: class="alert alert-info" }

```yaml
workflows:
  build:
    jobs:
      - sayhello:
          name: build-sayhello
          saywhat: Everyone
  deploy:
    jobs:
      - sayhello:
          name: deploy-sayhello
          saywhat: All
```

### Jobs defined in an orb
{: #jobs-defined-in-an-orb }

If a job is declared inside an orb it can use commands in that orb or the global commands. It is not possible to call commands outside the scope of declaration of the job.

**hello-orb**

```yaml
version: 2.1
# partial yaml from hello-orb
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    docker:
      - image: cimg/base:2023.11
    steps:
      - saywhat:
          saywhat: "<< parameters.saywhat >>"
commands:
  saywhat:
    parameters:
      saywhat:
        type: string
    steps:
      - run: echo "<< parameters.saywhat >>"
```

**Config leveraging hello-orb**

```yaml
# config.yml
version: 2.1
orbs:
  hello-orb: somenamespace/hello-orb@volatile
workflows:
  build:
    jobs:
      - hello-orb/sayhello:
          saywhat: Everyone
```

### Using parameters in executors
{: #using-parameters-in-executors }

To use parameters in executors, define the parameters under the given executor. When you invoke the executor, pass the keys of the parameters as a map of keys under the `executor:` declaration, each of which has the value of the parameter to pass in.

Parameters in executors can be of the type `string`, `enum`, or `boolean`. Default values can be provided with the optional `default` key.

#### Example build configuration using a parameterized executor
{: #example-build-configuration-using-a-parameterized-executor }

```yaml
version: 2.1
executors:
  python:
    parameters:
      tag:
        type: string
        default: latest
      myspecialvar:
        type: string
    docker:
      - image: cimg/python:<< parameters.tag >>
    environment:
      MYPRECIOUS: << parameters.myspecialvar >>
jobs:
  build:
    executor:
      name: python
      tag: "2.7"
      myspecialvar: "myspecialvalue"
```

The above would resolve to the following:

```yaml
version: 2.1
jobs:
  build:
    steps: []
    docker:
      - image: cimg/python:2.7
    environment:
      MYPRECIOUS: "myspecialvalue"
```

### The scope of parameters
{: #the-scope-of-parameters }

Parameters are in-scope only within the job or command that defined them. If you want a job or command to pass its parameters to a command it invokes, they must be passed explicitly.

```yaml
version: 2.1
jobs:
  sayhello:
    parameters:
      saywhat:
        description: "To whom shall we say hello?"
        default: "World"
        type: string
    docker:
      - image: cimg/base:2023.11
    steps:
      - say:
          # Since the command "say" doesn't define a default
          # value for the "saywhat" parameter, it must be
          # passed in manually
          saywhat: << parameters.saywhat >>
commands:
  say:
    parameters:
      saywhat:
        type: string
    steps:
      - run: echo "<< parameters.saywhat >>"
workflows:
  build:
    jobs:
      - sayhello:
          saywhat: Everyone
```

### Invoking the same job multiple times
{: #invoking-the-same-job-multiple-times }

A single configuration may invoke a job multiple times. At configuration processing time during build ingestion, CircleCI will auto-generate names if none are provided or you may name the duplicate jobs explicitly with the `name` key.

You must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow. For example, if a job is used under the `requires` key of a job invocation in a workflow, you will need to explicitly name it.
{: class="alert alert-info" }

```yaml
version: 2.1
workflows:
  build:
    jobs:
      - loadsay
      # This doesn't need an explicit name as it has no downstream dependencies
      - sayhello:
          saywhat: Everyone
          requires:
            - loadsay
      # This needs an explicit name for saygoodbye to require it as a job dependency
      - sayhello:
          name: SayHelloChad
          saywhat: Chad
      # Uses explicitly defined "sayhello"
      - saygoodbye:
          requires:
            - SayHelloChad
```

### Using pre and post steps
{: #using-pre-and-post-steps }

Every job invocation may optionally accept two special arguments: `pre-steps` and `post-steps`. Steps under `pre-steps`
are executed before any of the other steps in the job. The steps under `post-steps` are executed after all of the other steps.

Pre and post steps allow you to execute steps in a given job without modifying the job. This is useful, for example, in running custom setup steps before job execution.

### Defining pre and post steps
{: #defining-pre-and-post-steps }

The keys `pre-steps` and `post-steps` in jobs are available in configuration version 2.1 and later.
{: class="alert alert-info" }

The following example defines pre-steps and post-steps in the `bar` job of the `build` workflow:

```yaml
# config.yml
version: 2.1
jobs:
  bar:
    docker:
      - image: cimg/base:2023.11
    steps:
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"
workflows:
  build:
    jobs:
      - bar:
          pre-steps:
            - run:
                command: echo "install custom dependency"
          post-steps:
            - run:
                command: echo "upload artifact to s3"
```

## Defining conditional steps
{: #defining-conditional-steps }

Conditional steps are available in configuration version 2.1 and later.
{: class="alert alert-info" }

Conditional steps run only if a condition is met at config-compile time, before a workflow runs. This means, for example, that you may not use a condition to check an environment variable, as those are not injected until your steps are running in the shell of your execution environment.

Conditional steps may be located anywhere a regular step could and may only use parameter values as inputs.

For example, an orb could define a command that runs a set of steps *if* invoked with `myorb/foo: { dostuff: true }`, but not
`myorb/foo: { dostuff: false }`.

Furthermore, an orb author could define conditional steps in the `steps` key of a Job or a Command.

```yaml
# Inside config.yml
version: 2.1
jobs:
  myjob:
    parameters:
      preinstall-foo:
        type: boolean
        default: false
    docker:
      - image: cimg/base:2023.11
    steps:
      - run: echo "preinstall is << parameters.preinstall-foo >>"
      - when:
          condition: << parameters.preinstall-foo >>
          steps:
            - run: echo "preinstall"
      - unless:
          condition: << parameters.preinstall-foo >>
          steps:
            - run: echo "don't preinstall"
workflows:
  workflow:
    jobs:
      - myjob:
          preinstall-foo: false
      - myjob:
          preinstall-foo: true
      - myjob # The empty string is falsy
```

### **The `when` step**
{: #the-when-step }

Under the `when` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a truthy value.

Key | Required | Type | Description
----|-----------|------|------------
condition | Y | Logic | [A logic statement](/docs/configuration-reference/#logic-statements)
steps |	Y |	Sequence |	A list of steps to execute when the condition is truthy.
{: class="table table-striped"}

### **The `unless` step**
{: #the-unless-step }

Under the `unless` key are the subkeys `condition` and `steps`. The subkey `steps` are run only if the condition evaluates to a falsy value.

Key | Required | Type | Description
----|-----------|------|------------
condition | Y | Logic | [A logic statement](/docs/configuration-reference/#logic-statements)
steps |	Y |	Sequence |	A list of steps to execute when the condition is falsy.
{: class="table table-striped"}

## Writing inline orbs
{: #writing-inline-orbs }

When defining reusable configuration elements directly within your config, you can also wrap those elements within an inline orb. You may find inline orbs useful for development or for name-spacing elements that share names in a local config.

To write an inline orb, place the orb elements under that orb’s key in the orbs declaration section of the configuration. For example, if you want to import one orb to use inside another inline orb, the config could look like the example shown below, in which the inline orb `my-orb` imports the `node` orb:

```yaml
version: 2.1

orbs:
  my-orb:
    orbs:
      node: circleci/node@3.0
    commands:
      my_command:
        steps:
          - run: echo "Run my tests"
    jobs:
      my_job:
        executor: node/default # Node orb executor
        steps:
          - checkout
          - my_command
          - store_test_results:
              path: test-results

workflows:
  main:
    jobs:
      - my-orb/my_job

```

## See also
{: #see-also }

- Refer to [Sample Configurations](/docs/sample-config/) for some sample configurations that you can use in your own CircleCI configuration.
- Refer to [Database Examples](/docs/postgres-config/) for database examples you can use in your CircleCI configuration.
