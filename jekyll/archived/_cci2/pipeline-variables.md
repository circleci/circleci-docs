---
layout: classic-docs
title: Pipeline values and parameters
description: "Information about pipeline parameters and values and how to use them."
categories: [getting-started]
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Introduction
{: #introduction}

Pipeline values and parameters can be used to create reusable pipeline configurations.

* **Pipeline values** represent pipeline metadata that can be used throughout the configuration.
* **Pipeline parameters** are typed pipeline variables that are declared in the `parameters` key at the top level of a configuration. Users can pass `parameters` into their pipelines when triggering a new run of a pipeline through the API or web app.

## Pipeline values
{: #pipeline-values }

Pipeline values are available to all pipeline configurations and can be used without previous declaration.

For a full list of values and built-in environment variables, see the [Project values and variables](/docs/variables/#pipeline-values) guide.

{% include snippets/pipeline-values.md %}

Usage example:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:17.0
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

When using the above method to set the values in the `environment` key, note that if the pipeline variable is empty it will be set to `<nil>`. If you need an empty string instead, [set the variable in a shell command](/docs/set-environment-variable/#set-an-environment-variable-in-a-shell-command).
{: class="alert alert-info" }

## Pipeline parameters in configuration
{: #pipeline-parameters-in-configuration }

Pipeline parameters are declared using the `parameters` key at the top level of a `.circleci/config.yml` file. Pipeline parameters can be referenced by value and used as a configuration variable under the scope `pipeline.parameters`.

Pipeline parameters support the following types:

* string
* boolean
* integer
* enum

See [Parameter syntax](/docs/reusing-config/#parameter-syntax) for usage details.

The example below shows a configuration with two pipeline parameters (`image-tag` and `workingdir`) defined at the top of the configuration, and then subsequently referenced in the `build` job:

```yaml
version: 2.1

parameters:
  image-tag:
    type: string
    default: "current"
  workingdir:
    type: string
    default: "~/main"

jobs:
  build:
    docker:
      - image: cimg/node:<< pipeline.parameters.image-tag >>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

### Passing parameters when triggering pipelines via the API
{: #passing-parameters-when-triggering-pipelines-via-the-api }

A pipeline can be triggered with specific `parameter` values using the API v2 endpoint to [trigger a pipeline](https://circleci.com/docs/api/v2/#trigger-a-new-pipeline). This can be done by passing a `parameters` key in the JSON packet of the `POST` body.

The `parameters` key passed in this `POST` request is **NOT** secret.
{: class="alert alert-warning" }

The example below triggers a pipeline with the parameters described in the above configuration example. If you run a command to trigger a pipeline, and the parameter has not been declared in the configuration file, you will receive an error response message, such as `Project not found`.

```shell
curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

### Passing parameters when triggering pipelines using the CircleCI web app
{: #passing-parameters-when-triggering-pipelines-using-the-circleci-web-app }

In addition to using the API, you can also trigger a pipeline with parameters from the CircleCI web app. If you pass a parameter when triggering a pipeline from the web app, and the parameter has not been declared in the configuration file, the pipeline will fail with the error `Unexpected argument(s)`.

1. Use the project filter to select the desired project.
2. Use the branch filter to select the branch on which you want to run the new pipeline.
3. Click the **Trigger Pipeline** button (towards the top right corner of the page).
4. Use the **Add Parameters** dropdown to specify the type, name, and value of your desired parameters.
5. Click **Trigger Pipeline**.

Parameters can also be called when setting up a scheduled pipeline in the web app. The parameters are part of the trigger form in **Project Settings > Triggers**. Any parameter set up as a part of a scheduled pipeline will also need to be declared in the configuration file, otherwise the the pipeline will fail with the error `Unexpected argument(s)`.

## Configuration processing stages
{: #configuration-processing-stages }

Configuration processing happens in the following stages:

- Pipeline parameters are resolved and type-checked
- Pipeline parameters are replaced in the orb statement
- Orbs are imported

The remaining configuration is processed, element parameters are resolved, type-checked, and substituted.

## The scope of pipeline parameters
{: #the-scope-of-pipeline-parameters }

Pipeline parameters can only be resolved in the `.circleci/config.yml` file in which they are declared. Pipeline parameters are not available in orbs, including orbs declared locally in your `.circleci/config.yml` file. This is because access to pipeline scope in orbs would break encapsulation and create a hard dependency between the orb and the calling configuration. This would potentially create a surface area of vulnerability, increasing security risks.

### Element parameter scope
{: #element-parameter-scope }

Element parameters use lexical scoping, so parameters are in scope within the element they are defined in, for example, a job, a command, or an executor. If an element with parameters calls another element with parameters, like in the example below, the inner element does not inherit the scope of the calling element.

```yaml
version: 2.1

commands:
  print:
    parameters:
      message:
        type: string
    steps:
      - run: echo << parameters.message >>

jobs:
  daily-message:
    machine: true
    parameters:
      message:
        type: string
    steps:
      - print:
          message: Printing << parameters.message >>

workflows:
  my-workflow:
    jobs:
      - daily-message:
         message: echo << parameters.message >>
```

Even though the `print` command is called from the `cat-file` job, the file parameter would not be in scope inside the print job. This ensures that all parameters are always bound to a valid value, and the set of available parameters is always known. Running this would throw a pipeline error of `Arguments referenced without declared parameters: message`.

### Pipeline value scope
{: #pipeline-value-scope }

Pipeline values, the pipeline-wide values that are provided by CircleCI (e.g. `<< pipeline.number >>`) are always in scope.

### Pipeline parameter scope
{: #pipeline-parameter-scope }

Pipeline parameters which are defined in configuration are always in scope, with two exceptions:

- Pipeline parameters are not in scope for the definition of other pipeline parameters, so they cannot depend on one another.
- Pipeline parameters are not in scope in the body of orbs, even inline orbs, to prevent data leaks.

## Conditional workflows
{: #conditional-workflows }

Use the [`when` clause](/docs/configuration-reference/#using-when-in-workflows) (or the inverse clause `unless`) under a workflow declaration, along with a [logic statement](/docs/configuration-reference/#logic-statements), to decide whether or not to run that workflow. Logic statements in a `when` or `unless` clause should evaluate to a truthy or falsy value.

The most common use of this construct is to use a pipeline parameter as the value, allowing a trigger to pass that parameter to determine which workflows to run. Below is an example configuration using the pipeline parameter `run_integration_tests` to set whether the workflow `integration_tests` will run.

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
  mytestjob:
    steps:
      - checkout
      - ... # job steps
```

In this example, the workflow `integration_tests` is not triggered unless it is explicitly invoked when the pipeline is triggered with the following in the `POST` body:

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

The `when` key accepts any truthy or falsy value, not just pipeline parameters, though pipeline parameters will be the primary use of this feature until more are implemented. `when` also has an inverse clause `unless`, which inverts truthiness of the condition.
