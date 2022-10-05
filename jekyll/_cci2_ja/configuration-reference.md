---
layout: classic-docs
title: CircleCI の設定
short-title: CircleCI の設定
description: .circleci/config.yml に関するリファレンス
order: 20
redirect_from: /ja/configuration/
readtime: false
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
sectionTags:
  config-version-2:
    - "#version"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-cloud"
    - "#available-linux-machine-images-server"
    - "#available-linux-gpu-images"
    - "#available-windows-machine-images-cloud"
    - "#available-windows-gpu-image"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#self-hosted-runner"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#macos-server"
    - "#windows-execution-environment"
    - "#gpu-execution-environment-linux"
    - "#gpu-execution-environment-windows"
    - "#arm-execution-environment-linux"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#workflows"
    - "#workflow-version"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#example-full-configuration"
  config-version-2.1:
    - "#version"
    - "#setup"
    - "#commands"
    - "#parameters-pipeline"
    - "#executors"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-cloud"
    - "#available-linux-machine-images-server"
    - "#available-linux-gpu-images"
    - "#available-windows-machine-images-cloud"
    - "#available-windows-gpu-image"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#self-hosted-runner"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#windows-execution-environment"
    - "#gpu-execution-environment-linux"
    - "#gpu-execution-environment-windows"
    - "#arm-execution-environment-linux"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#the-when-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#using-pipeline-values"
    - "#circleciipranges"
    - "#workflows"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#using-when-in-workflows"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#matrix"
    - "#excluding-sets-of-parameters-from-a-matrix"
    - "#dependencies-and-matrix-jobs"
    - "#pre-steps-and-post-steps"
    - "#logic-statements"
    - "#logic-statement-examples"
    - "#example-full-configuration"
  cloud:
    - "#version"
    - "#setup"
    - "#commands"
    - "#parameters-pipeline"
    - "#executors"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-cloud"
    - "#available-linux-gpu-images"
    - "#available-windows-machine-images-cloud"
    - "#available-windows-gpu-image"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#self-hosted-runner"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#windows-execution-environment"
    - "#gpu-execution-environment-linux"
    - "#gpu-execution-environment-windows"
    - "#arm-execution-environment-linux"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#the-when-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#using-pipeline-values"
    - "#circleciipranges"
    - "#workflows"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#using-when-in-workflows"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#matrix"
    - "#excluding-sets-of-parameters-from-a-matrix"
    - "#dependencies-and-matrix-jobs"
    - "#pre-steps-and-post-steps"
    - "#logic-statements"
    - "#logic-statement-examples"
    - "#example-full-configuration"
  server-v4:
    - "#version"
    - "#setup"
    - "#commands"
    - "#parameters-pipeline"
    - "#executors"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-server"
    - "#available-windows-machine-images-server"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#self-hosted-runner"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#macos-server"
    - "#windows-execution-environment"
    - "#arm-execution-environment-linux"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#the-when-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#using-pipeline-values"
    - "#workflows"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#using-when-in-workflows"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#matrix"
    - "#excluding-sets-of-parameters-from-a-matrix"
    - "#dependencies-and-matrix-jobs"
    - "#pre-steps-and-post-steps"
    - "#logic-statements"
    - "#logic-statement-examples"
    - "#example-full-configuration"
  server-v3:
    - "#version"
    - "#setup"
    - "#commands"
    - "#parameters-pipeline"
    - "#executors"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-server"
    - "#available-windows-machine-images-server"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#self-hosted-runner"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#macos-server"
    - "#windows-execution-environment"
    - "#arm-execution-environment-linux"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#the-when-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#using-pipeline-values"
    - "#workflows"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#using-when-in-workflows"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#matrix"
    - "#excluding-sets-of-parameters-from-a-matrix"
    - "#dependencies-and-matrix-jobs"
    - "#pre-steps-and-post-steps"
    - "#logic-statements"
    - "#logic-statement-examples"
    - "#example-full-configuration"
  server-v2:
    - "#version"
    - "#jobs"
    - "#job-name"
    - "#environment"
    - "#parallelism"
    - "#parameters-job"
    - "#executor-job"
    - "#docker"
    - "#machine"
    - "#available-linux-machine-images-server"
    - "#available-windows-machine-images-server"
    - "#branches-deprecated"
    - "#resourceclass"
    - "#docker-execution-environment"
    - "#linuxvm-execution-environment"
    - "#macos-execution-environment"
    - "#windows-execution-environment"
    - "#steps"
    - "#run"
    - "#default-shell-options"
    - "#background-commands"
    - "#shorthand-syntax"
    - "#the-when-attribute"
    - "#ending-a-job-from-within-a-step"
    - "#checkout"
    - "#setupremotedocker"
    - "#savecache"
    - "#restorecache"
    - "#deploy-deprecated"
    - "#migrate-deploy-run"
    - "#storeartifacts"
    - "#storetestresults"
    - "#persisttoworkspace"
    - "#attachworkspace"
    - "#add-ssh-keys"
    - "#workflows"
    - "#workflow-version"
    - "#workflowname"
    - "#triggers"
    - "#schedule"
    - "#cron"
    - "#filters"
    - "#branches"
    - "#jobs-in-workflow"
    - "#job-name-in-workflow"
    - "#requires"
    - "#name"
    - "#context"
    - "#type"
    - "#jobfilters"
    - "#branches"
    - "#tags"
    - "#example-full-configuration"
suggested:
  - 
    title: 6 config optimization tips
    link: https://circleci.com/blog/six-optimization-tips-for-your-config/
  - 
    title: Intro to dynamic config
    link: https://discuss.circleci.com/t/intro-to-dynamic-config-via-setup-workflows/39868
  - 
    title: Using dynamic config
    link: https://circleci.com/blog/building-cicd-pipelines-using-dynamic-config/
  - 
    title: Validate your config using local CLI
    link: https://support.circleci.com/hc/en-us/articles/360006735753?input_string=configuration+error
  - 
    title: How to trigger a single job
    link: https://support.circleci.com/hc/en-us/articles/360041503393?input_string=changes+in+v2+api
---

このドキュメントは、`.circleci/config.yml` ファイルで使用される CircleCI 2.x 設定キーのリファレンスガイドです。

`config.yml` の全体は「[サンプル設定ファイル全文](#example-full-configuration)」で確認できます。

---

* 目次
{:toc}

## **`version`**
{: #version }

| キー      | 必須 | タイプ    | 説明                                                                                                                                                                                                       |
| ------- | -- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version | Y  | String | `2`, `2.0`, or `2.1` See the [Reusing Config]({{ site.baseurl }}/reusing-config/) doc for an overview of 2.1 keys available to simplify your `.circleci/config.yml` file, reuse, and parameterized jobs. |
{: class="table table-striped"}

The `version` field is intended to be used in order to issue warnings for deprecation or breaking changes.

---

## **`setup`**
{: #setup }

| キー    | 必須 | タイプ     | 説明                                                                                                                    |
| ----- | -- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| setup | N  | Boolean | Designates the config.yaml for use of CircleCI's [dynamic configuration]({{ site.baseurl }}/dynamic-config/) feature. |
{: class="table table-striped"}

The `setup` field enables you to conditionally trigger configurations from outside the primary `.circleci` parent directory, update pipeline parameters, or generate customized configurations.

---

## **`orbs`**
{: #orbs }

The `orbs` key is supported in `version: 2.1` configuration
{: class="alert alert-info"}

| Key       | Required | Type | Description                                                                                                                                                                                                                                      |
| --------- | -------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| orbs      | N        | Map  | A map of user-selected names to either: orb references (strings) or orb definitions (maps). Orb definitions must be the orb-relevant subset of 2.1 config. See the [Creating Orbs]({{ site.baseurl }}/creating-orbs/) documentation for details. |
| executors | N        | Map  | A map of strings to executor definitions. See the [Executors]({{ site.baseurl }}/configuration-reference/#executors-requires-version-21) section below.                                                                                          |
| commands  | N        | Map  | A map of command names to command definitions. See the [Commands]({{ site.baseurl }}/configuration-reference/#commands-requires-version-21) section below.                                                                                       |
{: class="table table-striped"}

The following example uses the `node` orb that exists in the certified `circleci` namespace. Refer to the Node orb page in the [Orb Registry](https://circleci.com/developer/orbs/orb/circleci/node) for more examples and information.

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y

jobs:
  install-node-example:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - node/install:
          install-yarn: true
          node-version: '16.13'
      - run: node --version
workflows:
  test_my_app:
    jobs:
      - install-node-example

```

Documentation is available for [Using Orbs]({{site.baseurl}}/orb-intro/) and [Authoring Orbs]({{site.baseurl}}/orb-author-intro/). Public orbs are listed in the [Orb Registry](https://circleci.com/developer/orbs).

---

## **`commands`**
{: #commands }

The `commands` key is supported in `version: 2.1` configuration
{: class="alert alert-info"}

A command defines a sequence of steps as a map to be executed in a job, enabling you to reuse a single command definition across multiple jobs. For more information see the [Reusable Config Reference Guide]({{ site.baseurl }}/reusing-config/).

| Key         | Required | Type     | Description                                                                                                                                                                                        |
| ----------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | Y        | Sequence | A sequence of steps run inside the calling job of the command.                                                                                                                                     |
| parameters  | N        | Map      | A map of parameter keys. See the [Parameter Syntax]({{ site.baseurl }}/reusing-config/#parameter-syntax) section of the [Reusing Config]({{ site.baseurl }}/reusing-config/) document for details. |
| description | N        | String   | A string that describes the purpose of the command.                                                                                                                                                |
{: class="table table-striped"}

Example:

```yaml
commands:
  sayhello:
    description: "デモ用の簡単なコマンド"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

---

## **`parameters`**
{: #parameters-pipeline }

The pipeline `parameters` key is supported in `version: 2.1` configuration
{: class="alert alert-info"}

Pipeline parameters declared for use in the configuration. See [Pipeline Values and Parameters]({{ site.baseurl }}/pipeline-variables#pipeline-parameters-in-configuration) for usage details.

| Key        | Required | Type | Description                                                                                                                                                                 |
| ---------- | -------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| parameters | N        | Map  | A map of parameter keys. Supports `string`, `boolean`, `integer` and `enum` types. See [Parameter Syntax]({{ site.baseurl }}/reusing-config/#parameter-syntax) for details. |
{: class="table table-striped"}

---

## **`executors`**
{: #executors }

The `executors` key is supported in `version: 2.1` configuration
{: class="alert alert-info"}

Executors define the execution environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

| Key               | Required         | Type   | Description                                                                                                                                               |
| ----------------- | ---------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | Y <sup>(1)</sup> | List   | Options for [docker executor](#docker)                                                                                                                    |
| resource_class    | N                | String | Amount of CPU and RAM allocated to each container in a job.                                                                                               |
| machine           | Y <sup>(1)</sup> | Map    | Options for [machine executor](#machine)                                                                                                                  |
| macos             | Y <sup>(1)</sup> | Map    | Options for [macOS executor](#macos)                                                                                                                      |
| windows           | Y <sup>(1)</sup> | Map    | [Windows executor](#windows) currently working with orbs. Check out [the orb](https://circleci.com/developer/orbs/orb/circleci/windows).                  |
| shell             | N                | String | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options)) |
| working_directory | N                | String | In which directory to run the steps. Will be interpreted as an absolute path.                                                                             |
| environment       | N                | Map    | A map of environment variable names and values.                                                                                                           |
{: class="table table-striped"}

<sup>(1)</sup> One executor type should be specified per job. If more than one is set you will receive an error.

Example:

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:3.0.3-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo "Hello executor!"
```

See the [Using Parameters in Executors]({{site.baseurl}}/reusing-config/#using-parameters-in-executors) section of the [Reusing Config]({{ site.baseurl }}/reusing-config/) page for examples of parameterized executors.

---

## **`jobs`**
{: #jobs }

A Workflow is comprised of one or more uniquely named jobs. Jobs are specified in the `jobs` map, see [Sample config.yml]({{site.baseurl}}/sample-config/) for two examples of a `job` map. The name of the job is the key in the map, and the value is a map describing the job.

Jobs have a maximum runtime of 1 (Free), 3 (Performance), or 5 (Scale) hours depending on pricing plan. If your jobs are timing out, consider a larger [resource class]({{site.baseurl}}/configuration-reference/#resourceclass) and/or [parallelism]({{site.baseurl}}/parallelism-faster-jobs). Additionally, you can upgrade your pricing plan or run some of your jobs concurrently using [workflows]({{ site.baseurl }}/workflows/).
{: class="alert alert-note"}

---

### **<`job_name`>**
{: #job-name }

Each job consists of the job's name as a key and a map as a value. A name should be case insensitive unique within a current `jobs` list. The value map has the following attributes:

| Key               | Required         | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | Y <sup>(1)</sup> | List    | Options for [docker executor](#docker)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| machine           | Y <sup>(1)</sup> | Map     | Options for [machine executor](#machine)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| macos             | Y <sup>(1)</sup> | Map     | Options for [macOS executor](#macos)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| shell             | N                | String  | Shell to use for execution command in all steps. Can be overridden by `shell` in each step (default: See [Default Shell Options](#default-shell-options))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| parameters        | N                | Map     | [Parameters](#parameters) for making a `job` explicitly configurable in a `workflow`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| steps             | Y                | List    | A list of [steps](#steps) to be performed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| working_directory | N                | String  | In which directory to run the steps. Will be interpreted as an absolute path. Default: `~/project` (where `project` is a literal string, not the name of your specific project). Processes run during the job can use the `$CIRCLE_WORKING_DIRECTORY` environment variable to refer to this directory. **Note:** Paths written in your YAML configuration file will _not_ be expanded; if your `store_test_results.path` is `$CIRCLE_WORKING_DIRECTORY/tests`, then CircleCI will attempt to store the `test` subdirectory of the directory literally named `$CIRCLE_WORKING_DIRECTORY`, dollar sign `$` and all. `working_directory` will be created automatically if it doesn't exist. |
| parallelism       | N                | Integer | Number of parallel instances of this job to run (default: 1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| environment       | N                | Map     | A map of environment variable names and values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| branches          | N                | Map     | A map defining rules to allow/block execution of specific branches for a single job that is **not** in a workflow or a 2.1 config (default: all allowed). See [Workflows](#workflows) for configuring branch execution for jobs in a workflow or 2.1 config.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| resource_class    | N                | String  | Amount of CPU and RAM allocated to each container in a job.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
{: class="table table-striped"}

<sup>(1)</sup> One executor type should be specified per job. If more than one is set you will receive an error.

---

#### `environment`
{: #environment }
A map of environment variable names and values. For more information on defining and using environment variables, and the order of precedence governing the various ways they can be set, see the [Environment variables]({{site.baseurl}}/env-vars/) page.

---

#### `parallelism`
{: #parallelism }

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. This feature is used to optimize your test steps. Split your test suite, using the CircleCI CLI, across parallel containers so the job will complete in a shorter time. Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor. Learn more on the [Running Tests in Parallel]({{ site.baseurl }}/parallelism-faster-jobs/) page.

Example:

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:2022.09
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split)
```

---

#### `parameters`
{: #parameters-job }

Job-level `parameters` can be used when [calling a `job` in a `workflow`](#jobs-in-workflow).

Reserved parameter-names:

* `name`
* `requires`
* `context`
* `type`
* `filters`
* `matrix`
<!-- Others? -->
<!-- branches & type pass `circleci config validate`. Strange -->

See [Parameter Syntax]({{ site.baseurl }}/reusing-config/#parameter-syntax) <!-- In this reference, it's not mentioned which types are allowed for job-parameters. --> for definition details.

---

#### Executor **`docker`** / **`machine`** / **`macos`**
{: #executor-job }

CircleCI offers several execution environments in which to run your jobs. To specify an execution environment choose an _executor_, then specify and image and a resource class. An executor defines the underlying technology, environment and operating system in which to run a job.

Set up your jobs to run using the `docker` (Linux), `machine` (LinuxVM, Windows, GPU, Arm), or `macos` executor, then specify an image with the tools and packages you need, and a resource class.

Learn more about execution environments and executors in the [Introduction to Execution Environments]({{ site.baseurl }}/executor-intro/).

---

#### `docker`
{: #docker }

Configured by `docker` key which takes a list of maps:

| キー          | 必須 | タイプ            | 説明                                                                                                                                                                                                                                                                                                           |
| ----------- | -- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image       | ○  | 文字列型           | The name of a custom docker image to use. The first `image` listed under a job defines the job's own primary container image where all steps will run.                                                                                                                                                       |
| name        | ×  | String         | `name` defines the name for reaching the secondary service containers.  By default, all services are exposed directly on `localhost`.  The field is appropriate if you would rather have a different host name instead of localhost, for example, if you are starting multiple versions of the same service. |
| entrypoint  | N  | String or List | The command used as executable when launching the container. `entrypoint` overrides the image's [`ENTRYPOINT`](https://docs.docker.com/engine/reference/builder/#entrypoint).                                                                                                                                |
| command     | N  | String or List | The command used as pid 1 (or args for entrypoint) when launching the container. `command` overrides the image's `COMMAND`. It will be used as arguments to the image `ENTRYPOINT` if it has one, or as the executable if the image has no `ENTRYPOINT`.                                                     |
| user        | N  | String         | Which user to run commands as within the Docker container                                                                                                                                                                                                                                                    |
| environment | N  | Map            | A map of environment variable names and values. The `environment` settings apply to the entrypoint/command run by the docker container, not the job steps.                                                                                                                                                   |
| auth        | N  | Map            | Authentication for registries using standard `docker login` credentials                                                                                                                                                                                                                                      |
| aws_auth    | N  | Map            | Authentication for AWS Elastic Container Registry (ECR)                                                                                                                                                                                                                                                      |
{: class="table table-striped"}

For a [primary container]({{ site.baseurl }}/glossary/#primary-container) (the first container in the list) if neither `command` nor `entrypoint` is specified in the config, then any `ENTRYPOINT` and `COMMAND` in the image are ignored. This is because the primary container is typically used only for running the `steps` and not for its `ENTRYPOINT`, and an `ENTRYPOINT` may consume significant resources or exit prematurely. A \[custom image\]({{ site.baseurl }}/custom-images/#adding-an-entrypoint) may disable this behavior and force the `ENTRYPOINT` to run.

You can specify image versions using tags or digest. You can use any public images from any public Docker registry (defaults to Docker Hub). Learn more about specifying images on the [Using the Docker Execution Environment]({{ site.baseurl }}/using-docker) page.

Some registries, Docker Hub, for example, may rate limit anonymous docker pulls. It is recommended you authenticate in such cases to pull private and public images. The username and password can be specified in the `auth` field.  See [Using Docker Authenticated Pulls]({{ site.baseurl }}/private-images/) for details.

Example:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty # primary container
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          ENV: CI

      - image: mongo:2.6.8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        command: [--smallfiles]

      - image: postgres:14.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: user

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

Using an image hosted on [AWS ECR](https://aws.amazon.com/ecr/) requires authentication using AWS credentials. By default, CircleCI uses the AWS credentials you provide by setting the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` project environment variables. It is also possible to set the credentials by using the `aws_auth` field as in the following example:

```yaml
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定するか
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # UI から設定したプロジェクトの環境変数を参照するように指定します
```

---

#### **`machine`**
{: #machine }

The machine executor is configured using the `machine` key, which takes a map:

| Key                    | Required | Type    | Description                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image                  | Y        | String  | The virtual machine image to use. View [available images](#available-linux-machine-images). **Note:** This key is **not** supported for Linux VMs on installations of CircleCI server. For information about customizing `machine` executor images on CircleCI installed on your servers, see our [VM Service documentation]({{ site.baseurl }}/server-3-operator-vm-service). |
| docker_layer_caching | N        | Boolean | Set this to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/docker-layer-caching).                                                                                                                                                                                                                                                                                  |
{: class="table table-striped"}


Example:

```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:202010-01
    steps:
      - checkout
      - run:
          name: "テスト"
          command: echo "Hi"
```

---

##### 使用可能な Linux `machine` イメージ
{: #available-linux-machine-images-cloud }

**Specifying an image in your config file is strongly recommended.** CircleCI supports multiple Linux machine images that can be specified in the `image` field. For a full list of supported images, refer to the [Ubuntu 20.04 page in the Developer Hub](https://circleci.com/developer/machine/image/ubuntu-2004). More information on what software is available in each image can be found in our [Discuss forum](https://discuss.circleci.com/tag/machine-images).

* `ubuntu-2204:2022.07.1` - Ubuntu 22.04, Docker v20.10.17, Docker Compose v2.6.0,
* `ubuntu-2204:2022.04.1` - Ubuntu 22.04, Docker v20.10.14, Docker Compose v2.4.1,
* `ubuntu-2004:2022.07.1` - Ubuntu 20.04, Docker v20.10.17, Docker Compose v2.6.0,
* `ubuntu-2004:2022.04.1` - Ubuntu 20.04, Docker v20.10.14, Docker Compose v2.4.1,
* `ubuntu-2004:202201-02` - Ubuntu 20.04, Docker v20.10.12, Docker Compose v1.29.2, Google Cloud SDK updates
* `ubuntu-2004:202201-01` - Ubuntu 20.04, Docker v20.10.12, Docker Compose v1.29.2
* `ubuntu-2004:202111-02` - Ubuntu 20.04, Docker v20.10.11, Docker Compose v1.29.2, log4j updates
* `ubuntu-2004:202111-01` - Ubuntu 20.04, Docker v20.10.11, Docker Compose v1.29.2,
* `ubuntu-2004:202107-02` - Ubuntu 20.04, Docker v20.10.7, Docker Compose v1.29.2,
* `ubuntu-2004:202104-01` - Ubuntu 20.04、Docker v20.10.6、Docker Compose v1.29.1
* `ubuntu-2004:202101-01` - Ubuntu 20.04、Docker v20.10.2、Docker Compose v1.28.2
* `ubuntu-2004:202010-01` - Ubuntu 20.04、Docker v19.03.13、Docker Compose v1.27.4 (`ubuntu-2004:202008-01` はエイリアス)

The machine executor supports [Docker Layer Caching]({{ site.baseurl }}/docker-layer-caching) which is useful when you are building Docker images during your job or Workflow.

---

##### Available Linux `machine` images on server
{: #available-linux-machine-images-server }

If you are using CircleCI server, contact your system administrator for details of available Linux machine images.

---

##### Available Linux GPU `machine` images
{: #available-linux-gpu-images }

When using the [Linux GPU executor](#gpu-executor-linux), the available images are:

* `ubuntu-2004-cuda-11.4:202110-01` - CUDA v11.4.2, Docker v20.10.7, nvidia-container-toolkit v1.5.1-1
* `ubuntu-2004-cuda-11.2:202103-01` - CUDA v11.2.1, Docker v20.10.5, nvidia-container-toolkit v1.4.2-1
* `ubuntu-1604-cuda-11.1:202012-01` - CUDA v11.1、Docker v19.03.13、nvidia-container-toolkit v1.4.0-1
* `ubuntu-1604-cuda-10.2:202012-01` - CUDA v10.2、Docker v19.03.13、nvidia-container-toolkit v1.3.0-1
* `ubuntu-1604-cuda-10.1:201909-23` - CUDA v10.1、Docker v19.03.0-ce、nvidia-docker v2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA v9.2、Docker v19.03.0-ce、nvidia-docker v2.2.2

---

##### Available Windows `machine` images
{: #available-windows-machine-images-cloud }

**Specifying an image in your config file is strongly recommended.** CircleCI supports multiple Windows machine images that can be specified in the `image` field.

For a full list of supported images, refer to one of the following:

* [windows-server-2022-gui](https://circleci.com/developer/machine/image/windows-server-2022-gui)
* [windows-server-2019](https://circleci.com/developer/machine/image/windows-server-2019)

More information on what software is available in each image can be found in our [Discuss forum](https://discuss.circleci.com/c/ecosystem/circleci-images/).

Alternatively, use the [Windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) to manage your Windows execution environment. For examples, see the [Using the Windows Execution Environment]({{site.baseurl}}/using-windows/) page.

---

##### Available Windows `machine` images on server
{: #available-windows-machine-images-server }

If you are using CircleCI server, contact your system administrator for details of available Windows machine images.

---

##### Available Windows GPU `machine` image
{: #available-windows-gpu-image }

When using the [Windows GPU executor](#gpu-executor-windows), the available image is:

* `windows-server-2019-nvidia:stable` - Windows Server 2019、CUDA 10.1。 このイメージはデフォルトです。

**Example**

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: windows-server-2019-nvidia:stable
```

---

#### **`macos`**
{: #macos }

CircleCI supports running jobs on [macOS](https://developer.apple.com/macos/), to allow you to build, test, and deploy apps for macOS, [iOS](https://developer.apple.com/ios/), [tvOS](https://developer.apple.com/tvos/) and [watchOS](https://developer.apple.com/watchos/). To run a job in a macOS virtual machine, add the `macos` key to the top-level configuration for your job and specify the version of Xcode you would like to use.

| Key   | Required | Type   | Description                                                                                                                                                                                                            |
| ----- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| xcode | Y        | String | The version of Xcode that is installed on the virtual machine, see the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/using-macos/#supported-xcode-versions) document for the complete list. |
{: class="table table-striped"}

Example: Use a macOS virtual machine with Xcode version 12.5.1:


```yaml
jobs:
  build:
    macos:
      xcode: "12.5.1"
```

---

#### **`branches` – 廃止予定**
{: #branches-deprecated }

**This key is deprecated. Use [workflows filtering](#jobfilters) to control which jobs run for which branches.**

----

#### **`resource_class`**
{: #resourceclass }

The `resource_class` feature allows configuring CPU and RAM resources for each job. Resource classes are available for each execution environment, as described in the tables below.

We implement soft concurrency limits for each resource class to ensure our system remains stable for all customers. If you are on a Performance or custom plan and experience queuing for certain resource classes, it's possible you are hitting these limits. [Contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request a raise on these limits for your account.

If you do not specify a resource class, CircleCI will use a default value that is subject to change.  It is best practice to specify a resource class as opposed to relying on a default.
{: class="alert alert-warning"}

Java, Erlang and any other languages that introspect the `/proc` directory for information about CPU count may require additional configuration to prevent them from slowing down when using the CircleCI resource class feature. Programs with this issue may request 32 CPU cores and run slower than they would when requesting one core. Users of languages with this issue should pin their CPU count to their guaranteed CPU resources.
{: class="alert alert-warning"}

If you want to confirm how much memory you have been allocated, you can check the cgroup memory hierarchy limit with `grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat`.
{: class="alert alert-note"}

If you are using CircleCI server, contact your system administrator for a list of available resource classes.
{: class="alert alert-note"}

---

##### Self-hosted runner
{: #self-hosted-runner }

Use the `resource_class` key to configure a [self-hosted runner instance](https://circleci.com/docs/runner-overview/).

For example:

```yaml
jobs:
  job_name:
    machine: true
    resource_class: <my-namespace>/<my-runner>
```

---

##### Docker execution environment
{: #docker-execution-environment }

| Class                  | vCPUs | RAM  |
| ---------------------- | ----- | ---- |
| small                  | 1     | 2GB  |
| medium                 | 2     | 4GB  |
| medium+                | 3     | 6GB  |
| large                  | 4     | 8GB  |
| xlarge                 | 8     | 16GB |
| 2xlarge<sup>(2)</sup>  | 16    | 32GB |
| 2xlarge+<sup>(2)</sup> | 20    | 40GB |
{: class="table table-striped"}

Example:

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:2022.09
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    resource_class: xlarge
    steps:
      ... // other config
```

---

##### LinuxVM execution environment
{: #linuxvm-execution-environment }

{% include snippets/machine-resource-table.md %}

Example:

{:.tab.linuxvm.Cloud}
```yaml
jobs:
  build:
    machine:
      image: ubuntu-2004:202010-01 # 推奨 Linux イメージ
    resource_class: large
    steps:
      ... // 他の構成
```

{:.tab.linuxvm.Server}
```yaml
jobs:
  build:
    machine: true
    resource_class: large
    steps:
      ... // other config
```
---

##### macOS execution environment
{: #macos-execution-environment }

{% include snippets/macos-resource-table.md %}

**Example**

```yaml
jobs:
  build:
    macos:
      xcode: "12.5.1"
    resource_class: large
    steps:
      ... // その他の設定
```

---

##### macOS execution environment on server
{: #macos-server }

If you are working on CircleCI server v3.1 and up, you can access the macOS execution environment using [self-hosted runner](/docs/runner-overview).

---

##### Windows execution environment
{: #windows-execution-environment }

{% include snippets/windows-resource-table.md %}

Example:

{:.tab.windowsblock.Cloud_with_orb}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor: 
      name: win/default # executor type
      size: medium # can be medium, large, xlarge, 2xlarge

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Cloud_with_machine}
```yaml
jobs:
  build: # name of your job
    machine:
      image: 'windows-server-2022-gui:current'
      shell: 'powershell.exe -ExecutionPolicy Bypass'
    resource_class: windows.medium # can be medium, large, xlarge, 2xlarge
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```yaml
jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium # can be medium, large, xlarge, 2xlarge
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

---

##### GPU execution environment (Linux)
{: #gpu-execution-environment-linux }

{% include snippets/gpu-linux-resource-table.md %}

Example:

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-1604-cuda-10.1:201909-23
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
      - run: docker run --gpus all nvidia/cuda:9.0-base nvidia-smi
```

See the [Available Linux GPU images](#available-linux-gpu-images) section for the full list of available images.

---

##### GPU execution-environment (Windows)
{: #gpu-execution-environment-windows }

{% include snippets/gpu-windows-resource-table.md %}

Example:

```yaml
version: 2.1
orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - checkout
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

<sup>(2)</sup> _This resource requires review by our support team. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to request access._

---

##### Arm execution-environment (LinuxVM)
{: #arm-execution-environment-linux }

{% include snippets/arm-resource-table.md %}

Example:

{:.tab.armblock.Cloud}
```yaml
jobs:
  my-job:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

{:.tab.armblock.Server_v3_and_v4}
```yaml
jobs:
  my-job:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"
```

---

#### **`steps`**
{: #steps }

The `steps` setting in a job should be a list of single key/value pairs, the key of which indicates the step type. The value may be either a configuration map or a string (depending on what that type of step requires). For example, using a map:

```yaml
jobs:
  build:
    working_directory: ~/canary-python
    environment:
      FOO: bar
    steps:
      - run:
          name: Running tests
          command: make test
```

Here `run` is a step type. The `name` attribute is used by the UI for display purposes. The `command` attribute is specific for `run` step and defines command to execute.

Some steps may implement a shorthand semantic. For example, `run` may be also be called like this:

```yml
jobs:
  build:
    steps:
      - run: make test
```

In its short form, the `run` step allows us to directly specify which `command` to execute as a string value. In this case step itself provides default suitable values for other attributes (`name` here will have the same value as `command`, for example).

Another shorthand, which is possible for some steps, is to simply use the step name as a string instead of a key/value pair:

```yml
jobs:
  build:
    steps:
      - checkout
```

In this case, the `checkout` step will checkout project source code into the job's [`working_directory`](#jobs).

In general all steps can be described as:

| Key                  | Required | Type          | Description                                                                              |
| -------------------- | -------- | ------------- | ---------------------------------------------------------------------------------------- |
| &lt;step_type> | Y        | Map or String | A configuration map for the step or some string whose semantics are defined by the step. |
{: class="table table-striped"}

Each built-in step is described in detail below.

---

##### **`run`**
{: #run }

Used for invoking all command-line programs, taking either a map of configuration values, or, when called in its short-form, a string that will be used as both the `command` and `name`. Run commands are executed using non-login shells by default, so you must explicitly source any dotfiles as part of the command.

**Note:** the `run` step replaces the deprecated `deploy` step. If your job has a parallelism of 1, the deprecated `deploy` step can be swapped out directly for the `run` step. If your job has parallelism >1, see [Migration from `deploy` to `run`](#migration-from-deploy-to-run).
{: class="alert alert-info"}

| Key                 | Required | Type    | Description                                                                                                                                                                                                                          |
| ------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| command             | Y        | String  | Command to run via the shell                                                                                                                                                                                                         |
| name                | N        | String  | Title of the step to be shown in the CircleCI UI (default: full `command`)                                                                                                                                                           |
| shell               | N        | String  | Shell to use for execution command (default: See [Default Shell Options](#default-shell-options))                                                                                                                                    |
| environment         | N        | Map     | Additional environmental variables, locally scoped to command                                                                                                                                                                        |
| background          | N        | Boolean | Whether or not this step should run in the background (default: false)                                                                                                                                                               |
| working_directory   | N        | String  | In which directory to run this step. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`)                                                                                                    |
| no_output_timeout | N        | String  | Elapsed time the command can run without output. The string is a decimal with unit suffix, such as "20m", "1.25h", "5s". The default is 10 minutes and the maximum is governed by the [maximum time a job is allowed to run](#jobs). |
| when                | N        | String  | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`)                                                                             |
{: class="table table-striped"}

Each `run` declaration represents a new shell. It is possible to specify a multi-line `command`, each line of which will be run in the same shell:

```yml
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

You can also configure commands to run [in the background](#background-commands) if you don't want to wait for the step to complete before moving on to subsequent run steps.

---

###### _デフォルトのシェルオプション_
{: #default-shell-options }

For jobs that run on **Linux**, the default value of the `shell` option is `/bin/bash -eo pipefail` if `/bin/bash` is present in the build container. Otherwise it is `/bin/sh -eo pipefail`. The default shell is not a login shell (`--login` or `-l` are not specified). Hence, the shell will **not** source your `~/.bash_profile`, `~/.bash_login`, `~/.profile` files.

For jobs that run on **macOS**, the default shell is `/bin/bash --login -eo pipefail`. The shell is a non-interactive login shell. The shell will execute `/etc/profile/` followed by `~/.bash_profile` before every step.

For more information about which files are executed when bash is invocated, [see the `INVOCATION` section of the `bash` manpage](https://linux.die.net/man/1/bash).

Descriptions of the `-eo pipefail` options are provided below.

`-e`

> パイプライン (1 つのコマンドで構成される場合を含む)、かっこ「()」で囲まれたサブシェル コマンド、または中かっこ「{}」で囲まれたコマンド リストの一部として実行されるコマンドの 1 つが 0 以外のステータスで終了した場合は、直ちに終了します。

So if in the previous example `mkdir` failed to create a directory and returned a non-zero status, then command execution would be terminated, and the whole step would be marked as failed. If you desire the opposite behaviour, you need to add `set +e` in your `command` or override the default `shell` in your configuration map of `run`. For example:
```yml
- run:
    command: |
      echo Running test
      set +e
      mkdir -p /tmp/test-results
      make test

- run:
    shell: /bin/sh
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

`-o pipefail`

> pipefail を有効にすると、パイプラインの戻り値は、0 以外のステータスで終了した最後 (右端) のコマンドのステータス値か、すべてのコマンドが正しく終了した場合に 0 となります。 シェルは、パイプライン内のすべてのコマンドの終了を待って値を返します。

For example:
```yml
- run: make test | tee test-output.log
```

If `make test` fails, the `-o pipefail` option will cause the whole step to fail. Without `-o pipefail`, the step will always run successfully because the result of the whole pipeline is determined by the last command (`tee test-output.log`), which will always return a zero status.

Note that even if `make test` fails the rest of pipeline will be executed.

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

In general, we recommend using the default options (`-eo pipefail`) because they show errors in intermediate commands and simplify debugging job failures. For convenience, the UI displays the used shell and all active options for each `run` step.

For more information, see the [Using Shell Scripts]({{ site.baseurl }}/using-shell-scripts/) document.

---

###### _background コマンド_
{: #background-commands }

The `background` attribute enables you to configure commands to run in the background. Job execution will immediately proceed to the next step rather than waiting for return of a command with the `background` attribute set to `true`. The following example shows the config for running the X virtual framebuffer in the background which is commonly required to run Selenium tests:

```yml
- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

---

###### _省略構文_
{: #shorthand-syntax }

`run` has a very convenient shorthand syntax:

```yml
- run: make test

# shorthanded command can also have multiple lines
- run: |
    mkdir -p /tmp/test-results
    make test
```
In this case, `command` and `name` become the string value of `run`, and the rest of the config map for that `run` have their default values.

---

###### `when` 属性
{: #the-when-attribute }

By default, CircleCI will execute job steps one at a time, in the order that they are defined in `config.yml`, until a step fails (returns a non-zero exit code). After a command fails, no further job steps will be executed.

Adding the `when` attribute to a job step allows you to override this default behaviour, and selectively run or skip steps depending on the status of the job.

The default value of `on_success` means that the step will run only if all of the previous steps have been successful (returned exit code 0).

A value of `always` means that the step will run regardless of the exit status of previous steps. This is useful if you have a task that you want to run regardless of whether the previous steps are successful or not. For example, you might have a job step that needs to upload logs or code-coverage data somewhere.

A value of `on_fail` means that the step will run only if one of the preceding steps has failed (returns a non-zero exit code). It is common to use `on_fail` if you want to store some diagnostic data to help debug test failures, or to run custom notifications about the failure, such as sending emails or triggering alerts in chatrooms.

Some steps, such as `store_artifacts` and `store_test_results` will always run, even if a **step has failed** (returned a non-zero exit code) previously. The `when` attribute, `store_artifacts` and  `store_test_results` are not run if the job has been **killed** by a cancel request or has reached the runtime timeout limit.
{: class="alert alert-info"}

```yml
- run:
    name: Upload CodeCov.io Data
    command: bash <(curl -s https://codecov.io/bash) -F unittests
    when: always # Uploads code coverage results, pass or fail
```

---

###### `step` 内からのジョブの終了
{: #ending-a-job-from-within-a-step }

A job can exit without failing by using `run: circleci-agent step halt`. However, if a step within the job is already failing then the job will continue to fail. This can be useful in situations where jobs need to conditionally execute.

Here is an example where `halt` is used to avoid running a job on the `develop` branch:

```yml
run: |
    if [ "$CIRCLE_BRANCH" = "develop" ]; then
        circleci-agent step halt
    fi
```

---

##### **The `when` Step**
{: #the-when-step }

The `when` and `unless` steps are supported in `version: 2.1` configuration
{: class="alert alert-info"}

A conditional step consists of a step with the key `when` or `unless`. Under the `when` key are the subkeys `condition` and `steps`. The purpose of the `when` step is customizing commands and job configuration to run on custom conditions (determined at config-compile time) that are checked before a workflow runs. See the [Conditional Steps section of the Reusing Config document]({{ site.baseurl }}/reusing-config/#defining-conditional-steps) for more details.

| Key       | Required | Type     | Description                                                                     |
| --------- | -------- | -------- | ------------------------------------------------------------------------------- |
| condition | Y        | Logic    | [A logic statement]({{site.baseurl}}/configuration-reference/#logic-statements) |
| steps     | Y        | Sequence | A list of steps to execute when the condition is true                           |
{: class="table table-striped"}

Example:

```yml
version: 2.1

jobs: # conditional steps may also be defined in `commands:`
  job_with_optional_custom_checkout:
    parameters:
      custom_checkout:
        type: string
        default: ""
    machine:
      image: ubuntu-2004:202107-02
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

---

##### **`checkout`**
{: #checkout }

A special step used to check out source code to the configured `path` (defaults to the `working_directory`). The reason this is a special step is because it is more of a helper function designed to make checking out code easy for you. If you require doing git over HTTPS you should not use this step as it configures git to checkout over ssh.

| Key  | Required | Type   | Description                                                                                                      |
| ---- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| path | N        | String | Checkout directory. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`) |
{: class="table table-striped"}

If `path` already exists and is:
 * Ubuntu 16.04、Docker v18.09.3、Docker Compose v1.23.1
 * Git リポジトリ以外 - ステップは失敗します。

In the case of `checkout`, the step type is just a string with no additional attributes:

```yml
- checkout
```

The checkout command automatically adds the required authenticity keys for interacting with GitHub and Bitbucket over SSH, which is detailed further in our [integration guide](/docs/github-integration#establish-the-authenticity-of-an-ssh-host) – this guide will also be helpful if you wish to implement a custom checkout command.

CircleCI does not check out submodules. If your project requires submodules, add `run` steps with appropriate commands as shown in the following example:

```yml
- checkout
- run: git submodule sync
- run: git submodule update --init
```

The `checkout` step will configure Git to skip automatic garbage collection. If you are caching your `.git` directory with [restore_cache](#restore_cache) and would like to use garbage collection to reduce its size, you may wish to use a [run](#run) step with command `git gc` before doing so.
{: class="alert alert-info"}

---

##### **`setup_remote_docker`**
{: #setupremotedocker }

Creates a remote Docker environment configured to execute Docker commands. See [Running Docker Commands]({{ site.baseurl }}/building-docker-images/) for details.

| Key                    | Required | Type    | Description                                                                                                                                                                       |
| ---------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker_layer_caching | N        | boolean | Set this to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/docker-layer-caching/) in the Remote Docker Environment (default: `false`)                                 |
| version                | N        | String  | Version string of Docker you would like to use (default: `20.10.17`). View the list of supported docker versions [here]({{site.baseurl}}/building-docker-images/#docker-version). |
{: class="table table-striped"}

**Notes**:

- `setup_remote_docker` は、`machine` Executor と互換性がありません。 `machine` Executor における Docker レイヤーキャッシングの方法について、詳細は「Docker レイヤーキャッシング」の「[Machine Executor]({{ site.baseurl }}/ja/docker-layer-caching/#machine-executor)」を参照してください。
- The `version` key is not currently supported on CircleCI server. リモート環境にインストールされている Docker のバージョンについては、システム管理者に問い合わせてください。

---

##### **`save_cache`**
{: #savecache }

Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later jobs can [restore this cache](#restore_cache). Learn more on the [Caching Dependencies]({{site.baseurl}}/caching/) page.

Cache retention can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**.

| Key   | Required | Type   | Description                                                                                                                                              |
| ----- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| paths | Y        | List   | List of directories which should be added to the cache                                                                                                   |
| key   | Y        | String | Unique identifier for this cache                                                                                                                         |
| name  | N        | String | Title of the step to be shown in the CircleCI UI (default: "Saving Cache")                                                                               |
| when  | N        | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`) |
{: class="table table-striped"}

The cache for a specific `key` is immutable and cannot be changed once written.

**Note:** If the cache for the given `key` already exists it will not be modified, and job execution will proceed to the next step.

When storing a new cache, the `key` value may contain special templated values for your convenience:

| Template                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | The VCS branch currently being built.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | The CircleCI build number for this build.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | The VCS revision currently being built.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| {% raw %}`{{ .CheckoutKey }}`{% endraw %}              | The SSH key used to checkout the repo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | The environment variable `variableName` (supports any environment variable [exported by CircleCI]({{site.baseurl}}/env-vars) or added to a specific [context]({{site.baseurl}}/contexts)—not any arbitrary environment variable).                                                                                                                                                                                                                                                                                     |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | A base64 encoded SHA256 hash of the given filename's contents. This should be a file committed in your repo and may also be referenced as a path that is absolute or relative from the current working directory. Good candidates are dependency manifests, such as `package-lock.json`, `pom.xml` or `project.clj`. It's important that this file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key different than the one used at `restore_cache` time. |
| {% raw %}`{{ epoch }}`{% endraw %}                     | The current time in seconds since the unix epoch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| {% raw %}`{{ arch }}`{% endraw %}                      | The OS and CPU information.  Useful when caching compiled binaries that depend on OS and CPU architecture, for example, `darwin amd64` versus `linux i386/32-bit`.                                                                                                                                                                                                                                                                                                                                                    |
{: class="table table-striped"}

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`.

Template examples:
 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変わるたびにキャッシュが再生成されます。このプロジェクトのさまざまなブランチで同じキャッシュ キーが生成されます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - 上の例と同じように、ファイルの内容が変わるたびにキャッシュが再生成されますが、各ブランチで個別のキャッシュが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ジョブを実行するごとに個別のキャッシュが生成されます。

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, because it will take some time to upload the cache to our storage. So it makes sense to have a `key` that generates a new cache only if something actually changed and avoid generating a new one every run of a job.

**Tip:** Given the immutability of caches, it might be helpful to start all your cache keys with a version prefix <code class="highlighter-rouge">v1-...</code>. That way you will be able to regenerate all your caches just by incrementing the version in this prefix.
{: class="alert alert-info"}

Example:

{% raw %}
```yml
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

**Notes:**
- `save_cache` パスは現在のところ、ワイルドカードをサポートしていません。 お客様やお客様の組織にとってワイルドカードが有益でしたら、[Ideas board](https://ideas.circleci.com/cloud-feature-requests/p/support-wildcards-in-savecachepaths) にご意見をお寄せください。

- インスタンスによっては、特定のワークスペースをキャッシュに保存する回避策もあります。

{% raw %}
```yml
- save_cache:
    key: v1-{{ checksum "yarn.lock" }}
    paths:
      - node_modules/workspace-a
      - node_modules/workspace-c
```
{% endraw %}

---

##### **`restore_cache`**
{: #restorecache }

Restores a previously saved cache based on a `key`. Cache needs to have been saved first for this key using the [`save_cache` step](#save_cache). Learn more in [the caching documentation]({{ site.baseurl }}/caching/).

| Key  | Required         | Type   | Description                                                                                    |
| ---- | ---------------- | ------ | ---------------------------------------------------------------------------------------------- |
| key  | Y <sup>(1)</sup> | String | Single cache key to restore                                                                    |
| keys | Y <sup>(1)</sup> | List   | List of cache keys to lookup for a cache to restore. Only first existing key will be restored. |
| name | N                | String | Title of the step to be shown in the CircleCI UI (default: "Restoring Cache")                  |
{: class="table table-striped"}

<sup>(1)</sup> at least one attribute has to be present. If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

A key is searched against existing keys as a prefix.

**Note**: When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

For example:

```yml
steps:
  - save_cache:
      key: v1-myapp-cache
      paths:
        - ~/d1

  - save_cache:
      key: v1-myapp-cache-new
      paths:
        - ~/d2

  - run: rm -f ~/d1 ~/d2

  - restore_cache:
      key: v1-myapp-cache
```

In this case cache `v1-myapp-cache-new` will be restored because it's the most recent match with `v1-myapp-cache` prefix even if the first key (`v1-myapp-cache`) has exact match.

For more information on key formatting, see the `key` section of [`save_cache` step](#save_cache).

When CircleCI encounters a list of `keys`, the cache will be restored from the first one matching an existing cache. Most probably you would want to have a more specific key to be first (for example, cache for exact version of `package-lock.json` file) and more generic keys after (for example, any cache for this project). If no key has a cache that exists, the step will be skipped with a warning.

A path is not required here because the cache will be restored to the location from which it was originally saved.

Example:

{% raw %}
```yml
- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # if cache for exact version of `project.clj` is not present then load any most recent one
      - v1-myapp-

# ... Steps building and testing your application ...

# cache will be saved only once for each version of `project.clj`
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

---

##### **`deploy` - DEPRECATED**
{: #deploy-deprecated }

Please see [run](#run) for current processes. If you have parallelism > in your job, please see [Migration from `deploy` to `run`](#migration-from-deploy-to-run).

---

##### **Migration from `deploy` to `run`**
{: #migrate-deploy-run }

**Note:** A config file that uses the deprecated `deploy` step _must_ be converted, and _all_ instances of the `deploy` step must be removed, regardless of whether or not parallelism is used in the job.

*Does your job have [parallelism]({{site.baseurl}}/parallelism-faster-jobs/) of 1?* Swap out the `deploy` key for the [`run`](#run) key. Nothing more is needed to migrate.

*Does your job have [parallelism]({{site.baseurl}}/parallelism-faster-jobs/) > 1?* There is no direct replacement for the `deploy` step if you are using parallelism > 1 in your job. The recommendation is to create two separate jobs within one workflow: a test job, and a deploy job. The test job will run the tests in parallel, and the deploy job will depend on the test job. The test job has parallelism > 1, and the deploy job will have the command from the previous `deploy` step replaced with ‘run’ and no parallelism. Please see examples below.

Example:

The following is an example of replacing the deprecated `deploy` step in a config file that has parallelism > 1 (this code is deprecated, do not copy):

```yml
# Example of deprecated syntax, do not copy
version: 2.1
jobs:
  deploy-step-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
      - deploy: #deprecated deploy step, do not copy
          command: |
            echo "this is a deploy step which needs data from the rand"
            cat rand_*.txt

workflows:
  deploy-step-workflow:
    jobs:
      - deploy-step-job
```

If you are entirely reliant on external resources (for example, Docker containers pushed to a registry), you can extract the `deploy` step above as a job, which requires `doing-things-job` to complete. `doing-things-job` uses parallelism of 3, while `deploy-step-job` performs the actual deployment. See example below:

```yml
version: 2.1
jobs:
  doing-things-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
  # create a new job with the deploy step in it
  deploy-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: # change "deploy" to "run"
          command: |
            echo "this is a deploy step"

workflows:
  deploy-step-workflow:
    jobs:
      - doing-things-job
      # add your new job and make it depend on the 
      # "doing-things-job"
      - deploy-job:
          requires:
            - doing-things-job
```

If files are needed from `doing-things-job` in the `deploy-job`, use [workspaces]({{site.baseurl}}/workspaces/). This enables sharing of files between two jobs so that the `deploy-job` can access them. See example below:

```yml
version: 2.1
jobs:
  doing-things-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
      # save the files your deploy step needs
      - persist_to_workspace:
          root: .     # relative path to our working directory
          paths:      # file globs which will be persisted to the workspace
           - rand_*

  deploy-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # attach the files you persisted in the doing-things-job
      - attach_workspace:
          at: . # relative path to our working directory
      - run:
          command: |
            echo "this is a deploy step"

workflows:
  deploy-step-workflow:
    jobs:
      - doing-things-job
      - deploy-job:
          requires:
            - doing-things-job
```

This is effectively using a "fan-in" workflow which is described in detail on the [workflows]({{site.baseurl}}/workflows/#fan-outfan-in-workflow-example) page. Support for the deprecated `deploy` step will be removed at some point in the near future. Ample time will be given for customers to migrate their config.

---

##### **`store_artifacts`**
{: #storeartifacts }

Step to store artifacts (for example logs, binaries, etc) to be available in the web app or through the API. See the [Uploading Artifacts]({{ site.baseurl }}/artifacts/) document for more information.

| Key         | Required | Type   | Description                                                                                                      |
| ----------- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| path        | Y        | String | Directory in the primary container to save as job artifacts                                                      |
| destination | N        | String | Prefix added to the artifact paths in the artifacts API (default: the directory of the file specified in `path`) |
{: class="table table-striped"}

There can be multiple `store_artifacts` steps in a job. Using a unique prefix for each step prevents them from overwriting files.

Artifact storage retention can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**.

Example:

```yml
- run:
    name: Build the Jekyll site
    command: bundle exec jekyll build --source jekyll --destination jekyll/_site/docs/
- store_artifacts:
    path: jekyll/_site/docs/
    destination: circleci-docs
```

---

##### **`store_test_results`**
{: #storetestresults }

Special step used to upload and store test results for a build. Test results are visible on the CircleCI web application under each build's **Test Summary** section. Storing test results is useful for timing analysis of your test suites. For more information on storing test results, see the [Collecting Test Data]({{site.baseurl}}/collect-test-data/) page.

It is also possible to store test results as a build artifact; to do so, please refer to [the **store_artifacts** step](#storeartifacts).

| Key  | Required | Type   | Description                                                                                                                                                |
| ---- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path | Y        | String | Path (absolute, or relative to your `working_directory`) to directory containing JUnit XML or Cucumber JSON test metadata files, or to a single test file. |
{: class="table table-striped"}

Example:

Directory structure:

```shell
test-results
├── jest
│   └── results.xml
├── mocha
│   └── results.xml
└── rspec
    └── results.xml
```

`config.yml` syntax:

```yml
- store_test_results:
    path: test-results
```

---

##### **`persist_to_workspace`**
{: #persisttoworkspace }

Special step used to persist a temporary file to be used by another job in the workflow. For more information on using workspaces, see the [Using Workspaces to Share Data Between Jobs]({{site.baseurl}}/workspaces/) page.

`persist_to_workspace` adopts the storage settings from the storage customization controls on the CircleCI web app. If no custom setting is provided, `persist_to_workspace` defaults to 15 days.

Workspace storage retention can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**.

| Key   | Required | Type   | Description                                                                                                                                                                       |
| ----- | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| root  | Y        | String | Either an absolute path or a path relative to `working_directory`                                                                                                                 |
| paths | Y        | List   | Glob identifying file(s), or a non-glob path to a directory to add to the shared workspace. Interpreted as relative to the workspace root. Must not be the workspace root itself. |
{: class="table table-striped"}

The root key is a directory on the container which is taken to be the root directory of the workspace. The paths values are all relative to the root.

**Example for root Key**

For example, the following step syntax persists the specified paths from `/tmp/dir` into the workspace, relative to the directory `/tmp/dir`.

```yml
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

After this step completes, the following directories are added to the workspace:

```
/tmp/dir/foo/bar
/tmp/dir/baz
```

**Example for paths Key**

```yml
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

The `paths` list uses `Glob` from Go, and the pattern matches [filepath.Match](https://golang.org/pkg/path/filepath/#Match).

```
pattern:
        { term }
term:
        '*' matches any sequence of non-Separator characters
        '?' matches any single non-Separator character
        '[' [ '^' ] { character-range }
        ']' character class (must be non-empty)
        c matches character c (c != '*', '?', '\\', '[')
        '\\' c matches character c
character-range:
        c matches character c (c != '\\', '-', ']')
        '\\' c matches character c
        lo '-' hi matches character c for lo <= c <= hi
```

The Go documentation states that the pattern may describe hierarchical names such as `/usr/*/bin/ed` (assuming the Separator is '/'). **Note:** Everything must be relative to the work space root directory.

---

##### **`attach_workspace`**
{: #attachworkspace }

Special step used to attach the workflow's workspace to the current container. The full contents of the workspace are downloaded and copied into the directory the workspace is being attached at. For more information on using workspaces, see the [Using Workspaces to Share Data Between Jobs]({{site.baseurl}}/workspaces/) page.

| Key | Required | Type   | Description                           |
| --- | -------- | ------ | ------------------------------------- |
| at  | Y        | String | Directory to attach the workspace to. |
{: class="table table-striped"}

Workspace storage retention can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**.

Example:

```yml
- attach_workspace:
    at: /tmp/workspace
```

The lifetime of artifacts, workspaces, and caches can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. Here you can control the storage retention periods for these objects. If no storage period is set, the default storage retention period of artifacts is 30 days, while the default storage retention period of workspaces and caches is 15 days.
{: class="alert alert-info" }

---

##### **`add_ssh_keys`**
{: #add-ssh-keys }

Special step that adds SSH keys from a project's settings to a container. Also configures SSH to use these keys. For more information on SSH keys see the [GitHub and Bitbucket Integration]({{site.baseurl}}/gh-bb-integration/#deployment-keys-and-user-keys) page.

| Key          | Required | Type | Description                                                                          |
| ------------ | -------- | ---- | ------------------------------------------------------------------------------------ |
| fingerprints | N        | List | List of fingerprints corresponding to the keys to be added (default: all keys added) |
{: class="table table-striped"}

```yaml
steps:
  - add_ssh_keys:
      fingerprints:
        - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

**Note:** Even though CircleCI uses `ssh-agent` to sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

---

##### Using `pipeline` values
{: #using-pipeline-values }

Pipeline values are available to all pipeline configurations and can be used without previous declaration. The pipeline values available are as follows:

{% include snippets/pipeline-values.md %}

For example:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:17.2.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

---

#### **`circleci_ip_ranges`**
{: #circleciipranges }

Enables jobs to go through a set of well-defined IP address ranges. See [IP ranges]({{ site.baseurl }}/ip-ranges/) for details.

Example:

```yaml
version: 2.1

jobs:
  build:
    circleci_ip_ranges: true # opts the job into the IP ranges feature
    docker:
      - image: curlimages/curl
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: echo “Hello World”
workflows:
  build-workflow:
    jobs:
      - build
```

**Notes**:

- IP アドレスの範囲機能をご利用いただくには、有料の [Performance プランまたは Scale プラン](https://circleci.com/ja/pricing/)のご契約が必要です。

---

## **`workflows`**
{: #workflows }

Used for orchestrating all jobs. Each workflow consists of the workflow name as a key and a map as a value. A name should be unique within the current `config.yml`. The top-level keys for the Workflows configuration are `version` and `jobs`. For more information, see the [Using Workflows to Schedule Jobs]({{site.baseurl}}/workflows/) page.

---

### **`version`**
{: #workflow-version }

The workflows `version` key is **not** required for v2.1 configuration
{: class="alert alert-info" }

The Workflows `version` field is used to issue warnings for deprecation or breaking changes.

| Key     | Required                   | Type   | Description             |
| ------- | -------------------------- | ------ | ----------------------- |
| version | Y if config version is `2` | String | Should currently be `2` |
{: class="table table-striped"}

---

### **<`workflow_name`>**
{: #workflowname }

A unique name for your workflow.

---

#### **`triggers`**
{: #triggers }

Specifies which triggers will cause this workflow to be executed. Default behavior is to trigger the workflow when pushing to a branch.

| Key      | Required | Type  | Description                     |
| -------- | -------- | ----- | ------------------------------- |
| triggers | N        | Array | Should currently be `schedule`. |
{: class="table table-striped"}

---

##### **`schedule`**
{: #schedule }

**Scheduled workflows will be phased out by the end of 2022.** Visit the scheduled [pipelines migration guide]({{site.baseurl}}/scheduled-pipelines/#get-started) to find out how to migrate existing scheduled workflows to scheduled pipelines, or to set up scheduled pipelines from scratch.
{: class="alert alert-warning"}

A workflow may have a `schedule` indicating it runs at a certain time, for example a nightly build that runs every day at 12am UTC:

```yml
workflows:
   version: 2
   nightly:
     triggers:
       - schedule:
           cron: "0 0 * * *"
           filters:
             branches:
               only:
                 - main
                 - beta
     jobs:
       - test
```

---

###### **`cron`**
{: #cron }

The `cron` key is defined using POSIX `crontab` syntax.

| Key  | Required | Type   | Description                                                                                |
| ---- | -------- | ------ | ------------------------------------------------------------------------------------------ |
| cron | Y        | String | See the [crontab man page](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html). |
{: class="table table-striped"}

---

###### **`filters`**
{: #filters }

Trigger Filters can have the key `branches`.

| Key     | Required | Type | Description                                             |
| ------- | -------- | ---- | ------------------------------------------------------- |
| filters | Y        | Map  | A map defining rules for execution on specific branches |
{: class="table table-striped"}

---

###### **`branches`**
{: #branches }

The `branches` key controls whether the *current* branch should have a schedule trigger created for it, where *current* branch is the branch containing the `config.yml` file with the `trigger` stanza. That is, a push on the `main` branch will only schedule a [workflow]({{ site.baseurl }}/workflows/#using-contexts-and-filtering-in-your-workflows) for the `main` branch.

Branches can have the keys `only` and `ignore` which each map to a single string naming a branch. You may also use regular expressions to match against branches by enclosing them with `/`'s, or map to a list of such strings. Regular expressions must match the **entire** string.

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のどちらも指定していない場合、全てのブランチでジョブを実行します。 `only` と `ignore` の両方を指定した場合、`only` が使用され、 `ignore` は使われません。

| Key      | Required | Type                       | Description                                                      |
| -------- | -------- | -------------------------- | ---------------------------------------------------------------- |
| branches | Y        | Map                        | A map defining rules for execution on specific branches          |
| only     | Y        | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers |
| ignore   | N        | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers |
{: class="table table-striped"}

---

#### **ワークフローでの `when` の使用**
{: #using-when-in-workflows }

Using `when` or `unless` under `workflows` is supported in `version: 2.1` configuration
{: class="alert alert-info"}

You may use a `when` clause (the inverse clause `unless` is also supported) under a workflow declaration with a [logic statement]({{site.baseurl}}/configuration-reference/#logic-statements) to determine whether or not to run that workflow.

The example configuration below uses a pipeline parameter, `run_integration_tests` to drive the `integration_tests` workflow.

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

workflows:
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob

jobs:
...
```

This example prevents the workflow `integration_tests` from running unless the tests are invoked explicitly when the pipeline is triggered with the following in the `POST` body:

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

Refer to the [Workflows]({{ site.baseurl }}/workflows) for more examples and conceptual information.

---

#### **`jobs`**
{: #jobs-in-workflow }

A job can have the keys `requires`, `name`, `context`, `type`, and `filters`.

| Key  | Required | Type | Description                                   |
| ---- | -------- | ---- | --------------------------------------------- |
| jobs | Y        | List | A list of jobs to run with their dependencies |
{: class="table table-striped"}

---

##### **<`job_name`>**
{: #job-name-in-workflow }

A job name that exists in your `config.yml`.

---

###### **`requires`**
{: #requires }

Jobs are run in parallel by default, so you must explicitly require any dependencies by their job name.

| Key      | Required | Type | Description                                                                                                                                                                                                                                                                                                                                                                     |
| -------- | -------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| requires | N        | List | A list of jobs that must succeed for the job to start. Note: When jobs in the current workflow that are listed as dependencies are not executed (due to a filter function for example), their requirement as a dependency for other jobs will be ignored by the requires option. However, if all dependencies of a job are filtered, then that job will not be executed either. |
{: class="table table-striped"}

---

###### **`name`**
{: #name }

The `name` key can be used to invoke reusable jobs across any number of workflows. Using the name key ensures numbers are not appended to your job name (i.e. sayhello-1 , sayhello-2, etc.). The name you assign to the `name` key needs to be unique, otherwise the numbers will still be appended to the job name.

| キー   | 必須 | タイプ    | 説明                                                                                                                                                                                                          |
| ---- | -- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name | N  | String | A replacement for the job name. Useful when calling a job multiple times. If you want to invoke the same job multiple times, and a job requires one of the duplicate jobs, this key is required. (2.1 only) |
{: class="table table-striped"}

---

###### **`context`**
{: #context }

Jobs may be configured to use global environment variables set for an organization, see the [Contexts]({{ site.baseurl }}/contexts) document for adding a context in the application settings.

| Key     | Required | Type        | Description                                                                                                                                                                                                                                                    |
| ------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| context | N        | String/List | The name of the context(s). The initial default name is `org-global`. Each context name must be unique. If using CircleCI Server, only a single Context per workflow is supported. **Note:** A maximum of 100 unique contexts across all workflows is allowed. |
{: class="table table-striped"}

---

###### **`type`**
{: #type }

A job may have a `type` of `approval` indicating it must be manually approved before downstream jobs may proceed. For more information see the [Using Workflows to Schedule Jobs]({{site.baseurl}}/workflows/#holding-a-workflow-for-a-manual-approval) page.

Jobs run in the dependency order until the workflow processes a job with the `type: approval` key followed by a job on which it depends, for example:

```yml
      - hold:
          type: approval
          requires:
            - test1
            - test2
      - deploy:
          requires:
            - hold
```

The `hold` job name must not exist in the main configuration.
{: class="alert alert-info"}

---

###### **`filters`**
{: #jobfilters }

Job Filters can have the key `branches` or `tags`.

Workflows will ignore job-level branching. If you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`.
{: class="alert alert-info"}

| Key     | Required | Type | Description                                             |
| ------- | -------- | ---- | ------------------------------------------------------- |
| filters | N        | Map  | A map defining rules for execution on specific branches |
{: class="table table-striped"}

The following is an example of how the CircleCI documentation uses a regex to filter running a workflow for building PDF documentation:

```yaml
# ...
workflows:
  build-deploy:
    jobs:
      - js_build
      - build_server_pdfs: # << the job to conditionally run based on the filter-by-branch-name.
          filters:
            branches:
              only: /server\/.*/
```

The above snippet causes the job  `build_server_pdfs` to only be run when the branch being built starts with "server/".

You can read more about using regex in your config in the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/workflows/#using-regular-expressions-to-filter-tags-and-branches) page.

---

###### **`branches`**
{: #branches }

Branches can have the keys `only` and `ignore` which either map to a single string naming a branch. You may also use regular expressions to match against branches by enclosing them with slashes, or map to a list of such strings. Regular expressions must match the **entire** string.

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

| Key      | Required | Type                       | Description                                                      |
| -------- | -------- | -------------------------- | ---------------------------------------------------------------- |
| branches | N        | Map                        | A map defining rules for execution on specific branches          |
| only     | N        | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers |
| ignore   | N        | String, or List of Strings | Either a single branch specifier, or a list of branch specifiers |
{: class="table table-striped"}

---

###### **`tags`**
{: #tags }

CircleCI does not run workflows for tags unless you explicitly specify tag filters. Additionally, if a job requires any other jobs (directly or indirectly), you must specify tag filters for those jobs.

Tags can have the keys `only` and `ignore`. You may also use regular expressions to match against tags by enclosing them with slashes, or map to a list of such strings. Regular expressions must match the **entire** string. Both lightweight and annotated tags are supported.

- `only` の値にマッチするタグはすべてジョブを実行します。
- `ignore` の値にマッチするタグはすべてジョブを実行しません。
- `only` と `ignore` のどちらも指定していない場合、すべてのタグのジョブがスキップされます。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

| Key    | Required | Type                       | Description                                                |
| ------ | -------- | -------------------------- | ---------------------------------------------------------- |
| tags   | N        | Map                        | A map defining rules for execution on specific tags        |
| only   | N        | String, or List of Strings | Either a single tag specifier, or a list of tag specifiers |
| ignore | N        | String, or List of Strings | Either a single tag specifier, or a list of tag specifiers |
{: class="table table-striped"}

For more information, see the [Executing Workflows For a Git Tag]({{ site.baseurl }}/workflows/#executing-workflows-for-a-git-tag) section of the Workflows document.

---

###### **`matrix`**
{: #matrix }

The `matrix` key is supported in `version: 2.1` configuration
{: class="alert alert-info"}

The `matrix` stanza allows you to run a parameterized job multiple times with different arguments. For more information see the how-to guide on [Using Matrix Jobs]({{site.baseurl}}/using-matrix-jobs). In order to use the `matrix` stanza, you must use parameterized jobs.

| Key        | Required | Type   | Description                                                                                                          |
| ---------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| parameters | Y        | Map    | A map of parameter names to every value the job should be called with                                                |
| exclude    | N        | List   | A list of argument maps that should be excluded from the matrix                                                      |
| alias      | N        | String | An alias for the matrix, usable from another job's `requires` stanza. Defaults to the name of the job being executed |
{: class="table table-striped"}

Example:

The following is a basic example of using matrix jobs.

```yaml
workflows:
  workflow:
    jobs:
      - build:
          matrix:
            parameters:
              version: ["0.1", "0.2", "0.3"]
              platform: ["macos", "windows", "linux"]
```

This expands to 9 different `build` jobs, and could be equivalently written as:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-macos-0.1
          version: 0.1
          platform: macos
      - build:
          name: build-macos-0.2
          version: 0.2
          platform: macos
      - build:
          name: build-macos-0.3
          version: 0.3
          platform: macos
      - build:
          name: build-windows-0.1
          version: 0.1
          platform: windows
      - ...
```

---

###### マトリックスから一部のパラメーターを除外する
{: #excluding-sets-of-parameters-from-a-matrix }

Sometimes you may wish to run a job with every combination of arguments _except_ some value or values. You can use an `exclude` stanza to achieve this:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          matrix:
            parameters:
              a: [1, 2, 3]
              b: [4, 5, 6]
            exclude:
              - a: 3
                b: 5
```

The matrix above would expand into 8 jobs: every combination of the parameters `a` and `b`, excluding `{a: 3, b: 5}`

---

###### 依存関係とマトリックスジョブ
{: #dependencies-and-matrix-jobs }

To `require` an entire matrix (every job within the matrix), use its `alias`. The `alias` defaults to the name of the job being invoked.

```yaml
workflows:
  workflow:
    jobs:
      - deploy:
          matrix:
            parameters:
              version: ["0.1", "0.2"]
      - another-job:
          requires:
            - deploy
```

This means that `another-job` will require both deploy jobs in the matrix to finish before it runs.

Additionally, matrix jobs expose their parameter values via `<< matrix.* >>` which can be used to generate more complex workflows. For example, here is a `deploy` matrix where each job waits for its respective `build` job in another matrix.

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-v<< matrix.version >>
          matrix:
            parameters:
              version: ["0.1", "0.2"]
      - deploy:
          name: deploy-v<< matrix.version >>
          matrix:
            parameters:
              version: ["0.1", "0.2"]
          requires:
            - build-v<< matrix.version >>
```

This workflow will expand to:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-v0.1
          version: 0.1
      - build:
          name: build-v0.2
          version: 0.2
      - deploy:
          name: deploy-v0.1
          version: 0.1
          requires:
            - build-v0.1
      - deploy:
          name: deploy-v0.2
          version: 0.2
          requires:
            - build-v0.2
```

---

###### **`pre-steps`** and **`post-steps`**
{: #pre-steps-and-post-steps }

Pre-steps and post-steps are supported in `version: 2.1` configuration
{: class="alert alert-info"}

Every job invocation in a workflow may optionally accept two special arguments: `pre-steps` and `post-steps`.

Steps under `pre-steps` are executed before any of the other steps in the job. The steps under `post-steps` are executed after all of the other steps.

Pre and post steps allow you to execute steps in a given job without modifying the job. This is useful, for example, to run custom setup steps before job execution.

```yaml
version: 2.1

jobs:
  bar:
    machine:
      image: ubuntu-2004:202107-02
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
          pre-steps: # steps to run before steps defined in the job bar
            - run:
                command: echo "install custom dependency"
          post-steps: # steps to run after steps defined in the job bar
            - run:
                command: echo "upload artifact to s3"
```

---

## ロジックステートメント
{: #logic-statements }

Certain dynamic configuration features accept logic statements as arguments. Logic statements are evaluated to boolean values at configuration compilation time, that is, before the workflow is run. The group of logic statements includes:

| Type                                                                                                | Arguments             | `true` if                              | Example                                                                  | |-----------------------------------------------------------------------------------------------------+-----------------------+----------------------------------------+--------------------------------------------------------------------------| | YAML literal                                                                                        | None                  | is truthy                              | `true`/`42`/`"a string"`                                                 | | YAML alias                                                                                          | None                  | resolves to a truthy value             | *my-alias                                                                | | [Pipeline Value]({{site.baseurl}}/pipeline-variables/#pipeline-values)                          | None                  | resolves to a truthy value             | `<< pipeline.git.branch >>`                                              | | [Pipeline Parameter]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration) | None                  | resolves to a truthy value             | `<< pipeline.parameters.my-parameter >>`                                 | | and                                                                                                 | N logic statements    | all arguments are truthy               | `and: [ true, true, false ]`                                             | | or                                                                                                  | N logic statements    | any argument is truthy                 | `or: [ false, true, false ]`                                             | | not                                                                                                 | 1 logic statement     | the argument is not truthy             | `not: true`                                                              | | equal                                                                                               | N values              | all arguments evaluate to equal values | `equal: [ 42, << pipeline.number >>]`                                    | | matches                                                                                             | `pattern` and `value` | `value` matches the `pattern`          | `matches: { pattern: "^feature-.+$", value: << pipeline.git.branch >> }` |
{: class="table table-striped"}

The following logic values are considered falsy:

- false
- null
- 0
- NaN
- 空の文字列 ("")
- 引数を持たないステートメント

All other values are truthy. Also note that using logic with an empty list will cause a validation error.

Logic statements always evaluate to a boolean value at the top level, and coerce as necessary. They can be nested in an arbitrary fashion, according to their argument specifications, and to a maximum depth of 100 levels.

`matches` uses [Java regular expressions](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html) for its `pattern`. A full match pattern must be provided, prefix matching is not an option. Though, it is recommended to enclose a pattern in `^` and `$` to avoid accidental partial matches.

**Note:** When using logic statements at the workflow level, do not include the `condition:` key (the `condition` key is only needed for `job` level logic statements).

---

### ロジックステートメントの例
{: #logic-statement-examples }

```yaml
workflows:
  my-workflow:
    when:
      or:
        - equal: [ main, << pipeline.git.branch >> ]
        - equal: [ staging, << pipeline.git.branch >> ]
```

```yaml
workflows:
  my-workflow:
    when:
      and:
        - not:
            matches:
              pattern: "^main$"
              value: << pipeline.git.branch >>
        - or:
            - equal: [ canary, << pipeline.git.tag >> ]
            - << pipeline.parameters.deploy-canary >>
```

```yaml
version: 2.1

executors:
  linux-13:
    docker:
      - image: cimg/node:13.13
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  macos: &macos-executor
    macos:
      xcode: 12.5.1

jobs:
  test:
    parameters:
      os:
        type: executor
      node-version:
        type: string
    executor: << parameters.os >>
    steps:
      - checkout
      - when:
          condition:
            equal: [ *macos-executor, << parameters.os >> ]
          steps:
            - run: echo << parameters.node-version >>
      - run: echo 0

workflows:
  all-tests:
    jobs:
      - test:
          os: macos
          node-version: "13.13.0"
```

---

## サンプル設定ファイル全文
{: #example-full-configuration }

{% raw %}
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      - image: mongo:2.6.8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        command: [mongod, --smallfiles]

      - image: postgres:14.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # some containers require setting environment variables
        environment:
          POSTGRES_USER: user

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      - image: rabbitmq:3.5.4
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    environment:
      TEST_REPORTS: /tmp/test-reports

    working_directory: ~/my-project

    steps:
      - checkout

      - run:
          command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

      # Create Postgres users and database
      # Note the YAML heredoc '|' for nicer formatting
      - run: |
          sudo -u root createuser -h localhost --superuser ubuntu &&
          sudo createdb -h localhost test_db

      - restore_cache:
          keys:
            - v1-my-project-{{ checksum "project.clj" }}
            - v1-my-project-

      - run:
          environment:
            SSH_TARGET: "localhost"
            TEST_ENV: "linux"
          command: |
            set -xu
            mkdir -p ${TEST_REPORTS}
            run-tests.sh
            cp out/tests/*.xml ${TEST_REPORTS}

      - run: |
          set -xu
          mkdir -p /tmp/artifacts
          create_jars.sh << pipeline.number >>
          cp *.jar /tmp/artifacts

      - save_cache:
          key: v1-my-project-{{ checksum "project.clj" }}
          paths:
            - ~/.m2

      # Save artifacts
      - store_artifacts:
          path: /tmp/artifacts
          destination: build

      # Upload test results
      - store_test_results:
          path: /tmp/test-reports

  deploy-stage:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Staging
          command: ansible-playbook site.yml -i staging

  deploy-prod:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Main
          command: ansible-playbook site.yml -i production

workflows:
  version: 2
  build-deploy:
    jobs:
      - build:
          filters:
            branches:
              ignore:
                - develop
                - /feature-.*/
      - deploy-stage:
          requires:
            - build
          filters:
            branches:
              only: staging
      - deploy-prod:
          requires:
            - build
          filters:
            branches:
              only: main
```
{% endraw %}

