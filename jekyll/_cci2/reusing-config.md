---
layout: classic-docs
title: "Orbs Reference Guide"
short-title: "Orbs Reference"
description: "Reference guide for CircleCI 2.1 orbs"
categories: [configuration]
order: 1
---

This Orbs Reference page describes how to version your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file and get started with reusable orbs, commands, jobs, and executors.

* TOC
{:toc}

## Getting Started with Config Reuse
{:.no_toc}

1. Add your project on the **Add Projects** page if it is a new project. For an existing Project, select **Settings > Projects**, click the cog icon for the project, then select **Advanced Settings** and enable "pipelines" with the radio button. ![Enable Pipelines]( {{ site.baseurl }}/assets/img/docs/enable_pipelines.png) If this radio button is not available, your project is already using pipelines.

2. (Optional) Install the CircleCI-Public CLI by following the [Using the CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) documentation. The `circleci config process` command is helpful for checking reusable config.

3. Change the `version` key to 2.1 in your `.circleci/config.yml` file and commit the changes to test your build. Ensure that your project build succeeds with the new pipelines before adding any new 2.1 keys to your config.

4. Run builds with your new configuration by pushing to your GitHub or Bitbucket repo. The Jobs page displays runs using the new pipelines service.

After your build is running successfully with pipelines enabled and version 2.1 in the `.circleci/config.yml` file, it is possible to add new keys to reuse config and run the same job more than once with different parameters (re-use jobs).

## Authoring Reusable Commands

A reusable command may have the following immediate children keys as a map:

- **Description:** (optional) A string that describes the purpose of the command, used for generating documentation.
- **Parameters:** (optional) A map of parameter keys, each of which adheres to the `parameter` spec.
- **Steps:** (required) A sequence of steps run inside the calling job of the command.

Command, job, executor, and parameter names can only contain lowercase letters a-z, digits, and _ and -, and must start with a letter.

### The `commands` Key** 

A command definition defines a sequence of steps as a map to be executed in a job, enabling you to reuse a single command definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
steps | Y | Sequence | A sequence of steps run inside the calling job of the command.
parameters | N  | Map | A map of parameter keys. See the [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) section for details.
description | N | String | A string that describes the purpose of the command.
{: class="table table-striped"}

Commands are declared under the `commands` key of a `config.yml` file. The following example defines a command called `sayhello`:

```yaml
version: 2.1
commands:
  sayhello:
    description: "A very simple command for demonstration purposes"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

**Note:** The `commands` stanza is available in configuration version 2.1 and later.

## Invoking Reusable Commands
{:.no_toc}

Reusable commands are invoked with specific parameters as steps inside a job. When using a command, the steps of that command are inserted in the location where the command is invoked. Commands may only be used as part of the sequence under `steps` in a job.

The following example invokes the command `sayhello` and passes it a parameter `to`:

```yaml
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

### Invoking Other Commands in Your Command
{:.no_toc}

Commands can use other commands in the scope of execution.

For instance, if a command is declared inside your Orb it can use other commands in that orb. It can also use commands defined in other orbs that you have imported (for example `some-orb/some-command`).

## Special Keys

CircleCI has several special keys available to all [circleci.com](http://circleci.com) customers and available by default in CircleCI server installations. Examples of these keys are:

  * `checkout`
  * `setup_remote_docker`
  * `persist_to_workspace`

**Note:** It is possible to override the special keys with a custom command.

## Examples

The following is an example of part of an `aws-s3` orb defining a command called `sync`:

```yaml
version: 2.1
# aws-s3 orb
commands:
  sync:
    description: "A simple encapsulation of doing an s3 sync"
    parameters:
      from:
        type: string
      to:
        type: string
      overwrite:
        default: false
        type: boolean
    steps:
      - run:
          name: Deploy to S3
          command: aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"
```

Defining a command called `sync` is invoked in a 2.1 `.circleci/config.yml` file as:

```yaml
version: 2.1
orbs:
  aws-s3: circleci/aws-s3@1.0.0

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3: # a sample job that would be defined above.
        steps:
          - aws-s3/sync:
              from: .
              to: "s3://mybucket_uri"
              overwrite: true
```

Defining a `build` job:

```yaml
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.2
  aws-s3: circleci/aws-s3@1.0.0
jobs:
  build:
    executor: aws-cli/default
    steps:
      - checkout
      - run: mkdir bucket && echo "lorum ipsum" > bucket/build_asset.txt
      - aws-s3/sync:
          from: bucket
          to: "s3://my-s3-bucket-name/prefix"
          overwrite: true
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: "s3://my-s3-bucket-name"
          arguments: --dryrun
```

## Authoring Reusable Executors

Executors define the environment in which the steps of a job will be run. When declaring a `job` in CircleCI configuration, you define the type of execution environment (`docker`, `machine`, `macos`. etc.) to run in, as well as any other parameters of that environment including: environment variables to populate, which shell to use, what size `resource_class` to use, etc.

Executor declarations in config outside of `jobs` can be used by all jobs in the scope of that declaration, allowing you to reuse a single executor definition across multiple jobs.

An executor definition includes one or more of the following keys:

- `docker` or `machine` or `macos`
- `environment`
- `working_directory`
- `shell`
- `resource_class`

In the following example `my-executor` is passed as the single value of the key `executor`.

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

**Note:** Reusable `executor` declarations are available in configuration version 2.1 and later.

## **`executors`** 

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

Key | Required | Type | Description
----|-----------|------|------------
docker | Y <sup>(1)</sup> | List | Options for `docker` executor.
resource_class | N | String | Amount of CPU and RAM allocated to each container in a job. (Only available with the `docker` executor) **Note:** A paid account is required to access this feature. Customers on paid container-based plans can request access by [opening a support ticket](https://support.circleci.com/hc/en-us/requests/new).
machine | Y <sup>(1)</sup> | Map | Options for `machine` executor.
macos | Y <sup>(1)</sup> | Map | Options for `macOS` executor.
shell | N | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step.
working_directory | N | String | In which directory to run the steps.
environment | N | Map | A map of environment variable names and values.
{: class="table table-striped"}

Example:

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

## Invoking Reusable Executors
{:.no_toc}

The following example passes `my-executor` as the value of a `name` key under `executor` -- this method is primarily employed when passing parameters to executor invocations:

```yaml
version: 2.1
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

It is also possible to allow an orb to define the executor used by all of its commands. This allows users to execute the commands of that orb in the execution environment defined by the orb's author.

### Example of Using an Executor Declared in config.yml in Multiple Jobs
{:.no_toc}

The following example declares and invokes an executor in two jobs that need to run in the same Docker image and working directory with a common set of environment variables. Each job has distinct steps, but runs in the same environment.

```yaml
version: 2.1
executors:
  lein_exec: # declares a reusable executor
    docker:
      - image: clojure:lein-2.8.1
    working_directory: ~/project
    environment:
      MYSPECIALVAR: "my-special-value"
      MYOTHERVAR: "my-other-value"
jobs:
  build:
    executor: lein_exec
    steps:
      - checkout
      - run: echo "hello world"  
  test:
    executor: lein_exec
    environment:
      TESTS: unit
    steps:
      - checkout
      - run: echo "how are ya?"
```

You can also refer to executors from other orbs. Users of an orb can invoke its executors. For example, `foo-orb` could define the `bar` executor:

```yaml
version: 2.1
# yaml from foo-orb
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` could define the `bar` executor too:

```yaml
version: 2.1
# yaml from baz-orb
executors:
  bar:
    docker:
      - image: clojure:lein-2.8.1
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


### Overriding Keys When Invoking an Executor
{:.no_toc}

When invoking an executor in a `job` any keys in the job itself will override those of the executor invoked. For example, if your job declares a `docker` stanza, it will be used, in its entirety, instead of the one in your executor.

**Note:** The `environment` variable maps are additive. If an `executor` has one of the same `environment` variables as the `job`, the value in the job will be used. For example, if you had the following configuration:

```yaml
version: 2.1
executors:
  python:
    docker:
      - image: python:3.7.0
      - image: rabbitmq:3.6-management-alpine
    environment:
      ENV: ci
      TESTS: all
    shell: /bin/bash    
    working_directory: ~/project
jobs:
  build:
    docker:
      - image: python:2.7.15
      - image: postgres:9.6
    executor: python
    environment:
      TESTS: unit
    working_directory: ~/tests
```

The above config would resolve to the following:

```yaml
version: 2.1
jobs:
 build:
   steps: []
   docker:
     - image: python:2.7.15    # From job
     - image: postgres:9.6     # From job
   environment:                # Merged:
     ENV: ci                     # From executor
     TESTS: unit                 # From job
   shell: /bin/bash            # From executor
   working_directory: ~/tests  # From job
```

## Using the `parameters` Declaration

Parameters are declared by name under a job, command, or executor. The immediate children of the `parameters` key are a set of keys in a map.

The following example defines a command called `sync`:

```yaml
version: 2.1
commands: # a reusable command with parameters
  sync:
    parameters:
      from:
        type: string
      to:
        type: string
      overwrite:
        default: false
        type: boolean
    steps:
      - run: # a parameterized run step
          name: Deploy to S3
          command: "aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"
executors: # a reusable executor
  aws:
    docker:
      - image: cibuilds/aws:1.15
jobs: # a job that invokes the `aws` executor and the `sync` command
  deploy2s3:
    executor: aws
    steps:
      - sync:
          from: .
          to: "s3://mybucket_uri"
          overwrite: true
```

**Note:** The `parameters` declaration is available in configuration version 2.1 and later.

### Parameter Syntax
{:.no_toc}

A parameter can have the following keys as immediate children:

| Key Name    | Description                                                                                   | Default value |
|-------------|-----------------------------------------------------------------------------------------------|---------------|
| description | Optional. Used to generate documentation for your orb.                                        | N/A           |
| type        | Required. See **Parameter Types** in the section below for details.                           | N/A           |
| default     | The default value for the parameter. If not present, the parameter is implied to be required. | N/A           |
{: class="table table-striped"}

### Parameter Types
{:.no_toc}

This section describes the types of parameters and their usage. The parameter types supported are:
* string
* boolean
* integer
* enum
* executor
* steps
* environment variable name

#### String
{:.no_toc}

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

Strings should be quoted if they would otherwise represent another type (such as boolean or number) or if they contain characters that have special meaning in YAML, particularly for the colon character. In all other instances, quotes are optional. Empty strings are treated as a falsy value in evaluation of `when` clauses, and all other strings are treated as truthy. Using an unquoted string value that YAML interprets as a boolean will result in a type error.

#### Boolean
{:.no_toc}

Boolean parameters are useful for conditionals:

```yaml
version: 2.1
commands:
  list-files:
    parameters:
      all:
        description: include all files
        type: boolean
        default: false
    steps:
      - run: ls <<# parameters.all >> -a <</ parameters.all >>
```

Boolean parameter evaluation is based on the [values specified in YAML 1.1](http://yaml.org/type/bool.html):

* True: `y` `yes` `true` `on`
* False: `n` `no` `false` `off`

Capitalized and uppercase versions of the above values are also valid.

#### Integer
{:.no_toc}

Use the parameter type `integer` to pass a numeric integer value. The following example uses the `integer` type to populate the value of `parallelism` in a job.

```yaml
version: 2.1
jobs:
  build:
    parameters:
      p:
        type: integer
        default: 1
    parallelism: << parameters.p >>
    machine: true
    steps:
      - checkout
workflows:
  workflow:
    jobs:
      - build:
          p: 2
```

#### Enum
{:.no_toc}

The `enum` parameter may be a list of any values. Use the `enum` parameter type when you want to enforce that the value must be one from a specific set of string values. The following example uses the `enum` parameter to declare the target operating system for a binary.

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
{:.no_toc}

Use an `executor` parameter type to allow the invoker of a job to decide what executor it will run on.

{% raw %}
```yaml
version: 2.1
executors:
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
    executor: << parameters.e >>
    steps:
      - run: some-tests

workflows:
  workflow:
    jobs:
      - test:
          e: bionic
      - test:
          e:
            name: xenial
            some-value: foobar
```
{% endraw %}

#### Steps
{:.no_toc}

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
jobs:
  build:
    machine: true
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

#### Environment Variable Name

The environment variable name (``env_var_name``) parameter is a string that must match a POSIX_NAME regexp (for example there can be no spaces or special characters). The `env_var_name` parameter is a more meaningful parameter type that enables additional checks to be performed, see [Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/) for details.

The example below shows you how to use the `env_var_name` parameter type for deploying to AWS S3 with a re-usable `build` job. This example shows using the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` environment variables with the `access-key` and `secret-key` parameters. So, if you have a deploy job that runs the `s3cmd`, it is possible to create a re-usable command that uses the needed authentication, but deploys to a custom bucket.

{% raw %}
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
  version: 2
```

Original `config.yml` file:

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

## Authoring Parameterized Jobs

It is possible to invoke the same job more than once in the workflows stanza of `config.yml`, passing any necessary parameters as subkeys to the job. See the parameters section above for details of syntax usage.

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
    machine: true
    steps:
      - run: echo "Hello << parameters.saywhat >>"
workflows:
  build:
    jobs:
      - sayhello: # invokes the parameterized job
          saywhat: Everyone
```
{% endraw %}

**Note:** Invoking jobs multiple times in a single workflow and parameters in jobs are available in configuration version 2.1 and later.

### Jobs Defined in an Orb

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
    machine: true
    steps:
      - say:
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

### Using Parameters in Executors
{:.no_toc}

To use parameters in executors, define the parameters under the given executor. When you invoke the executor, pass the keys of the parameters as a map of keys under the `executor:` declaration, each of which has the value of the parameter to pass in.

Parameters in executors can be of the type `string`, `enum`, or `boolean`. Default values can be provided with the optional `default` key.

#### Example Build Configuration Using a Parameterized Executor
{:.no_toc}

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
      - image: circleci/python:<< parameters.tag >>
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
      - image: circleci/python:2.7
    environment:
      MYPRECIOUS: "myspecialvalue"
```

### The Scope of Parameters
{:.no_toc}

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
    machine: true
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

### Invoking the Same Job Multiple Times
{:.no_toc}

A single configuration may invoke a job multiple times. At configuration processing time during build ingestion, CircleCI will auto-generate names if none are provided or you may name the duplicate jobs explicitly with the `name` key.

**Note:** You must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow. For example, if a job is used under the `requires` key of a job invocation in a workflow you will need to explicitly name it.

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

### Using Pre and Post Steps
{:.no_toc}

Every job invocation may optionally accept two special arguments: `pre-steps` and `post-steps`. Steps under `pre-steps`
are executed before any of the other steps in the job. The steps under `post-steps` are executed after all of the other steps.

Pre and post steps allow you to execute steps in a given job without modifying the job. This is useful, for example, to run custom setup steps before job execution.

### Defining Pre and Post Steps
{:.no_toc}

The following example defines pre-steps and post-steps in the `bar` job of the `build` workflow:

```yaml
# config.yml
version: 2.1
jobs:
  bar:
    machine: true
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

**Note:** The keys `pre-steps` and `post-steps` in jobs are available in configuration version 2.1 and later.

## Defining Conditional Steps

Conditional steps allow the definition of steps that only run if a `condition` is met.

For example, an orb could define a command that runs a set of steps *if* invoked with `myorb/foo: { dostuff: true }`, but not
`myorb/foo: { dostuff: false }`.

These conditions are checked before a workflow is actually run. This means, for example, that you may not use a condition to check an environment variable.

Conditional steps may be located anywhere a regular step could and may only use parameter values as inputs.

For example, an orb author could define conditional steps in the `steps` key of a Job or a Command.

A conditional step consists of a step with the key `when` or `unless`. Under this conditional key are the subkeys `steps` and `condition`. If `condition` is met (using when/unless logic), the subkey `steps` are run.

A `condition` is a single value that evaluates to `true` or `false` at the time the config is processed, so you cannot use environment variables as conditions, as those are not injected until your steps are running in the shell of your execution environment. You may use parameters as your conditions. The empty string will resolve as falsey in `when` conditions.

### Example
{:.no_toc}

```yaml
# inside config.yml
version: 2.1
jobs:
  myjob:
    parameters:
      preinstall-foo:
        type: boolean
        default: false
    machine: true
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
```

**Note** Both `condition` and `unless` accept the values `true` or `false`. The value is provided by the value `true` or `false` using parameters as above. Also, `when` only runs when its value is `true`, whereas `unless` only runs when it's value is `false`.

**Note:** Conditional steps are available in configuration version 2.1 and later.

##### **The `when` Step** 

A conditional step consists of a step with the key `when` or `unless`. Under the `when` key are the subkeys `condition` and `steps`. The purpose of the `when` step is customizing commands and job configuration to run on custom conditions (determined at config-compile time) that are checked before a workflow runs. 

Key | Required | Type | Description
----|-----------|------|------------
condition | Y | String | A parameter value
steps |	Y |	Sequence |	A list of steps to execute when the condition is true
{: class="table table-striped"}

###### *Example*

```
version: 2.1

jobs: # conditional steps may also be defined in `commands:`
  job_with_optional_custom_checkout:
    parameters:
      custom_checkout:
        type: string
        default: ""
    machine: true
    steps:
      - when:
          condition: <<parameters.custom_checkout>>
          steps:
            - run: echo "my custom checkout"
      - unless:
          condition: <<parameters.custom_checkout>>
          steps:
            - checkout
workflows:
  build-test-deploy:
    jobs:
      - job_with_optional_custom_checkout:
          custom_checkout: "any non-empty string is truthy"
      - job_with_optional_custom_checkout
```

## See Also
- Refer to [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/) for detailed information about how you can work with your CircleCI configuration.
- Refer to [Sample Configurations]({{site.baseurl}}/2.0/sample-config/) for some sample configurations that you can use in your own CircleCI configuration.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for more detailed information about how you can use CircleCI orb recipes in your configurations.
- Refer to [Database Examples]({{site.baseurl}}/2.0//postgres-config/) for database examples you can use in your CircleCI configuration.
