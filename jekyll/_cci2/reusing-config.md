---
layout: classic-docs
title: "Reusing Config"
short-title: "Reusing Config"
description: "Reusing configuration in CircleCI 2.1"
categories: [configuration]
order: 1
---


This document describes how to version your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file and get started with reusable commands and executors.

* TOC
{:toc}

## Getting Started with Config Reuse
{:.no_toc}

Complete the following prerequisite steps before adding the `commands`, `executors`, or `parameters` keys to your configuration. 

1. Add your project on the Add Projects page if it is a new project. For an existing Project, go to the Project Settings and enable [Build Processing]({{ site.baseurl }}/2.0/build-processing/) with the radio button.

2. (Optional) Install the CircleCI-Public CLI by following the [Using the CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) documentation. The `circleci config process` command is helpful for checking reusable config.

3. Change the `version` key to 2.1 in your `.circleci/config.yml` file and commit the changes to test your build. Ensure that your project build succeeds with the new processing before adding any new 2.1 keys to your config.

4. Run builds with your new configuration by pushing to your GitHub or Bitbucket repo that has been added in a project in CircleCI. The Jobs page displays runs using the new processing service. 

After your build is running successfully with build processing enabled and version 2.1 in the `.circleci/config.yml` file, it is possible to add new keys to reuse config and run the same job more than once with different parameters (re-use jobs).

## Authoring Reusable Commands

A reusable command may have the following immediate children keys as a map:

- **Description:** (optional) A string that describes the purpose of the command, used for generating documentation.
- **Parameters:** (optional) A map of parameter keys, each of which adheres to the `parameter` spec.
- **Steps:** (required) A sequence of steps run inside the calling job of the command.

Commands are declared under the `commands` key of a `config.yml` file. The following example defines a command called `sayhello`:

```yaml
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

Reusable commands are invoked with specific parameters as steps inside a job. When using a command, the steps of that command are inserted in the location where the command is invoked. Commands may only be used as part of the sequence under `steps` in a job.

The following example invokes the command `sayhello` and passes it a parameter `to`:

```yaml
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

<!---
### Invoking Other Commands in Your Command
{:.no_toc}

Commands can use other commands in the scope of execution. 


For instance, if a command is declared inside your Orb it can use other commands in that orb. It can also use commands defined in other orbs that you have imported (for example `some-orb/some-command`).


## Built-In Commands

CircleCI has several built-in commands available to all [circleci.com](http://circleci.com) customers and available by default in CircleCI server installations. Examples of built-in commands are:

  * `checkout`
  * `setup_remote_docker`
  * `save_to_workspace`

**Note:** It is possible to override the built-in commands with a custom command.


## Examples

The following is a an example of part of an "s3tools" orb defining a command called "s3sync":

```yaml
# s3tools orb
commands:
  s3sync:
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


Defining a command called "s3sync" is invoked in a 2.1 `.circleci/config.yml` file as:

```yaml
version: 2.1

orbs:
  s3tools: circleci/s3@1

workflows:
  build-test-deploy:
    jobs:
      - deploy2s3:
        steps:
          - s3tools/s3sync:
              from: .
              to: "s3://mybucket_uri"
              overwrite: true
```
--->

## Authoring Reusable Executors 
**Note:** Reusable `executor` declarations are available in configuration version 2.1 and later.

Executors define the environment in which the steps of a job will be run. When declaring a `job` in CircleCI configuration, you define the type of execution environment (`docker`, `machine`, `macos`. etc.) to run in, as well as any other parameters of that environment including: environment variables to populate, which shell to use, what size `resource_class` to use, etc. 

Executor declarations in config outside of `jobs` can be used by all jobs in the scope of that declaration, allowing you to reuse a single executor definition across multiple jobs.

An executor definition includes the subset of the children keys of a `job` declaration related to setting the environment for a job to execute. This means it does **not** include `steps`. That subset is one or more of the following keys:

- `docker` or `machine` or `macos` 
- `environment`
- `working_directory`
- `shell`
- `resource_class`

A simple example of using an executor:

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

In the above example the executor `my-executor` is passed as the single value of the key `executor`. Alternatively, you can pass `my-executor` as the value of a `name` key under `executor` -- this method is primarily employed when passing parameters to executor invocations (see below):

```yaml
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

### Common Uses of Executors
{:.no_toc}

Executors in configuration were designed to enable re-use of a defined execution environment in multiple jobs in the `config.yml` file.

<!---
2. Allowing an orb to define the executor used by all of its commands. This allows users to execute the commands of that orb in the execution environment defined by the orb's author.
-->

#### Example of Using an Executor Declared in config.yml in Multiple Jobs
{:.no_toc}

Imagine you have several jobs that you need to run in the same Docker image and working directory with a common set of environment variables. Each job has distinct steps, but should run in the same environment. You have three options to accomplish this:

1. Declare each job with repetitive `docker` and `working_directory` keys.
2. Use YAML anchors to achieve some reuse.
3. Declare an executor with the values you want, and invoke it in your jobs.

With an executor declaration your configuration might look something like: 

**Without Executors**
```yaml
jobs:
  build:
    docker:
      - image: clojure:lein-2.8.1
    working_directory: ~/project
    environment:
      MYSPECIALVAR: "my-special-value"
      MYOTHERVAR: "my-other-value"
    steps:
      - checkout
      - run: echo "your build script would go here"
      
  test:
    docker:
      - image: clojure:lein-2.8.1
    working_directory: ~/project
    environment:
      MYSPECIALVAR: "my-special-value"
      MYOTHERVAR: "my-other-value"
    steps:
      - checkout
      - run: echo "your test commands would run here"
```
    
**Same Code, With Executors**
```yaml
executors:
  lein_exec:
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

<!---
You can also refer to executors from other orbs. Users of an orb can invoke its executors. For example, `foo-orb` could define the `bar` executor:

```yaml
# yaml from foo-orb
executors:
  bar:
    machine: true
    environment:
      RUN_TESTS: foobar
```

`baz-orb` could define the `bar` executor too:
```yaml
# yaml from baz-orb
executors:
  bar:
    docker:
      - image: clojure:lein-2.8.1
```

A user could use either executor from their configuration file with:

```yaml
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

Note that `foo-orb/bar` and `baz-orb/bar` are different executors. They
both have the local name `bar` relative to their orbs, but the are independent executors living in different orbs.

-->

### Overriding Keys When Invoking an Executor
{:.no_toc}

When invoking an executor in a `job` any keys in the job itself will override those of the executor invoked. For instance, if your job declares a `docker` stanza, it will be used, in its entirety, instead of the one in your executor.

There is **one exception** to this rule: `environment` variable maps are additive. If an `executor` has one of the same `environment` variables as the `job`, the `job`'s value will win. For example, if you had the following configuration:

```yaml
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


This would resolve to:
```yaml
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

The following example defines a command called `s3sync`:

```yaml
commands: # a reusable command with parameters
  s3sync:
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
jobs: # a job that invokes the `aws` executor and the `s3sync` command
  deploy2s3:
    executor: aws
    steps:
      - s3sync:
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
| type        | Required. Currently "string", "boolean", "enum" (takes extra keys), and "steps" are supported                           | N/A           |
| default     | The default value for the parameter. If not present, the parameter is implied to be required. | N/A           |

### Parameter Types
{:.no_toc}

This section describes the types of parameters and their usage.

### Parameter Scope
{:.no_toc}

Parameters are in-scope only within the job or command that defined them. If you want a job or command to pass its parameters to a command it invokes, they must be passed explicitly. Command, job, executor, and parameter names can only contain lowercase letters a-z, digits, and _ and -, and must start with a letter.


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


#### String
{:.no_toc}

Basic string parameters are described below:

```yaml
commands:
  copy-markdown:
    parameters:
      destination:
        description: destination directory
        type: string
        default: docs
    steps:
      - cp *.md << destination >>
```

Strings should be quoted if they would otherwise represent another type (such as boolean or number) or if they contain characters that have special meaning in YAML, particularly for the colon character. In all other instances, quotes are optional. Empty strings are treated as a falsy value in evaluation of `when` clauses, and all other strings are treated as truthy. Using an unquoted string value that YAML interprets as a boolean will result in a type error.

#### Boolean
{:.no_toc}

Boolean parameters are useful for conditionals:

```yaml
commands:
  list-files:
    parameters:
      all:
        description: include all files
        type: boolean
        default: false
    steps:
      - ls <<# all >> -a <</ all >>
```

Boolean parameter evaluation is based on the [values specified in YAML 1.1][http://yaml.org/type/bool.html]:

* true: `y` `yes` `true` `on`
* false: `n` `no` `false` `off`

Capitalized and uppercase versions of the above values are also valid.

#### Steps
{:.no_toc}

Steps are used when you have a job or command that needs to mix predefined and user-defined steps. When passed in to a command or job invocation, the steps passed as parameters are always defined as a sequence, even if only one step is provided.

```yaml
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

Steps passed as parameters are given as the value of a `steps` declaration under the job's `steps` declaration and are expanded and spliced into the sequence of existing steps. For example,

```yaml
jobs:
  build:
    machine: true
    steps:
    - run-tests:
        after-deps:
          - run: echo "The dependencies are installed"
          - run: echo "And now I'm going to run the tests"
```

will become:

```yaml
steps:
  - run: make deps
  - run: echo "The dependencies are installed"
  - run: echo "And now I'm going to run the tests"
  - run: make test
```

#### Enum Parameter
{:.no_toc}

The `enum` parameter may be a lists of any values. Use the `enum` parameter type when you want to enforce that the value must be one from a specific set of string values. The following example uses the `enum` parameter to declare the target operating system for a binary.

```yaml
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

```yaml
commands:
  list-files:
    parameters:      
      os:
        type: enum
        default: "windows" #invalid declaration of default that does not appear in the comma-separated enum list
        enum: ["darwin", "linux"]
```        

### Using Parameters in Executors
{:.no_toc}

If you'd like to use parameters in executors, define the parameters under the given executor. When you invoke the executor, pass the keys of the parameters as a map of keys under the `executor:` declaration, each of which has the value of the parameter that you would like to pass in.

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

## Authoring and Using Jobs

**Note:** Invoking jobs multiple times in a single workflow and parameters in jobs are available in configuration version 2.1 and later.

Jobs are sets of steps and the environments they should be executed within.

### Job Naming and Organization
{:.no_toc}

Jobs are defined in your build configuration. Job names are defined
in a map under the `jobs` key in configuration.

Like most elements, jobs can contain an optional but highly recommended `description`.

A user must invoke jobs in the workflows stanza of `config.yml`, passing any necessary parameters as subkeys to the job. See the parameters documentation for more detailed information.

Example of defining and invoking a parameterized job in a `config.yml`:

```yaml
version: 2.1

jobs:
  sayhello:
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
      - sayhello:
          saywhat: Everyone
```

<!---
### Jobs Defined in an orb

If a job is declared inside an orb it can use commands in that orb or the global commands. We do not currently allow calling commands outside the scope of declaration of the job.

**hello-orb**
```yaml
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
--->




### Invoking the Same Job Multiple Times
{:.no_toc}

A single configuration may invoke a job many times. At configuration processing time during build ingestion, CircleCI will auto-generate names if none are provided.  If you care about the name of the duplicate jobs, they can be explicitly named with the `name` key.

**Note:** The user must explicitly name repeat jobs when a repeat job should be upstream of another job in a workflow (ie: if the job is used under the `requires` key of a job invocation in a workflow you will need to name it).

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

### Pre and Post Steps
{:.no_toc}

**Note:** The keys `pre-steps` and `post-steps` in jobs are available in configuration version 2.1 and later.

Every job invocation can optionally accept two special arguments: `pre-steps` and `post-steps`.
You can optionally invoke a job with one or both of these arguments. Steps under `pre-steps`
are executed before any of the other steps in the job. The steps under
`post-steps` are executed after all of the other steps.

For this reason, the parameter names `pre-steps` and `post-steps` are reserved
and may not be redefined by a job author. For example, the following job
definition is invalid:

```yaml
jobs:
  foo:
    parameters:
      pre-steps:    # invalid: pre-steps is a reserved parameter name
        type: steps
        default: []
```

All jobs accept two special arguments of type `steps`: `pre-steps` and
`post-steps`.

If an orb user invokes a job with one or both of these arguments,
the job will run the steps in `pre-steps` first, before any other steps run, and
then it will run the steps in `post-steps` last, after any other steps run.

Pre- and post- steps allow users to be execute steps in a given job's environment
without modifying the job. This is useful, for example, when a user imports a job
and wants to upload assets after it completes, or to run some custom setup steps
before job execution. Pre- and post- steps allow the user to make these additions
without modifying the imported job.

A `steps` parameter can be used for a similar purpose, passing steps into a job,
but it requires that the job be modified with an execution site for the parameter.

#### Example of Using Pre- and Post-Steps
{:.no_toc}

Define a job:

```yaml
jobs:
  bar:
    machine: true
    steps:
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"
```

Then use the job as follows:
```yaml
# config.yml
version: 2.1
workflows:
  build:
    jobs:
      - foo/bar:
          pre-steps:
            - run:
                command: echo "install custom dependency"
          post-steps:
            - run:
                command: echo "upload artifact to s3"
```

The resulting configuration would look like this:

```yaml
version: 2.1
jobs:
  foo/bar:
    machine: true
    steps:
      - run:
          command: echo "install custom dependency"
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"
      - run:
          command: echo "upload artifact to s3"
workflows:
  build:
    jobs:
      - foo/bar
```

## Conditional Steps
**Note:** Conditional steps are available in configuration version 2.1 and later.

Conditional steps allow the definition of steps that only run if a condition is
met. 

<!---
For example, an orb could define a command that runs a set of steps *if* the
orb's user invokes it with `myorb/foo: { dostuff: true }`, but not
`myorb/foo: { dostuff: false }`.
-->

These conditions are checked before a workflow is actually run. That
means, for example, that a user can't use a condition to check an environment
variable.

Conditional steps can be located anywhere a regular step could and only use parameter values as inputs. 

<!---
For example, an
orb author could define conditional steps in the `steps` key of a Job or a
Command.
-->

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
      - myorb/myjob:
          preinstall-foo: true
```





