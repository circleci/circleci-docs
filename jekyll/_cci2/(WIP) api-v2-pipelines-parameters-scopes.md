---
layout: classic-docs
title: "API v2 Pipelines, Parameters and Scopes"
short-title: "API v2 Miscellaneous"
description: "detailed information about API v2 pipelines, parameters, and scopes"
categories: [getting-started]
order: 1
---

The CircleCI API v2 was designed to utilize pipelines, parameters, and scopes so you can work with API v2 more efficiently.

## Pipeline Parameters

Pipeline parameters are new with API v2. To use pipeline parameters you must use configuration version 2.1 or higher.

### Declaring and using pipeline parameters in configuration

Pipeline parameters are declared using a `parameters` stanza in the top level keys of your `.circleci/config.yml` file. You can then reference the value of the parameter as a config variable in the scope `pipeline.parameters`.

The example belows shows a configuration with two pipeline parameters, `image-tag` and `workingdir` both used on the subsequent config stanzas:

```yaml
version: 2.1
parameters:
  image-tag:
    type: string
    default: "latest"
  workingdir:
    type: string
    default: "~/main"

jobs:
  build:
    docker:
      - image: circleci/node:<< pipeline.parameters.image-tag >>
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
```

### Passing Parameters When Triggering Pipelines Via the API

Use the API v2 endpoint to trigger a pipeline, passing the `parameters` key in the JSON packet in your `POST` body.

The example below triggers a pipeline with the parameters in the above config example (NOTE: To pass a parameter when triggering a pipeline via the API the parameter must be declared in the configuration file.).

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "workingdir": "./myspecialdir",
    "image-tag": "4.8.2"
  }
}' https://circleci.com/api/v2/project/:project_slug/pipeline
```

### The Scope of Pipeline Parameters

Pipeline parameters can only be resolved in the `.circleci/config.yml` file in which they are declared. Pipeline parameters are not available in orbs, including orbs declared locally in your config.yml file. This was done because access to the pipeline scope in orbs would break encapsulation and create a hard dependency between the orb and the calling config, potentially jeopardizing determinism and creating a surface area of vulnerability. 


## Config Processing Stages and Parameter Scopes

### Processing Stages

Configuration processing happens in the following stages:

- Pipeline parameters are resolved and type-checked
- Pipeline parameters are replaced in the orb statement
- Orbs are imported

The remaining configuration is processed, element parameters are resolved, type-checked, and substituted,

## Element Parameter Scope

Element parameters use lexical scoping, so parameters are in scope within the element they are defined in, e.g. a job, a command, or an executor. If an element with parameters calls another element with parameters, like in the example below, the inner element does not inherit the scope of the calling element.

```
version: 2.1

commands:
    print:
    parameters:
        message:
        type: string
    steps:
        - run: echo << parameters.message >>

jobs:
    cat-file:
    parameters:
        file:
        type: string
    steps:
        - print:
            message: Printing << parameters.file >>
        - run: cat << parameters.file >>

workflows:
    my-workflow:
    jobs:
        - cat-file:
            file: test.txt
```

Even though the `print` command is called from the cat-file job, the file parameter would not be in scope inside the print. This ensures that all parameters are always bound to a valid value, and the set of available parameters is always known.

## Pipeline Value Scope

Pipeline values, the pipeline-wide values that are provided by CircleCI (e.g. << pipeline.number >>) are always in scope.

### Pipeline Parameter Scope

Pipeline parameters which are defined in configuration are always in scope, with two exceptions:

- Pipeline parameters are not in scope for the definition of other pipeline parameters, so they cannot depend on one another.
- Pipeline parameters are not in scope in the body of orbs, even inline orbs, to prevent data leaks.

## Conditional Workflows

New as of June 2019, you can use a when clause (we also support the inverse clause unless) under a workflow declaration with a boolean value to decide whether or not to run that workflow.

The most common use of this construct is to use a pipeline parameter as the value, allowing an API trigger to pass that parameter to determine which workflows to run.

Below is an example configuration using two different pipeline parameters, one used to drive whether a particular workflow will run and another to determine if a particular step will run.

```
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false
  deploy:
    type: boolean
    default: false

workflows:
  version: 2
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob
      - when:
          condition: << pipeline.parameters.deploy >>
          steps:
            - deploy

jobs:
  ...
```

The example shown above prevents the workflow `integration_tests` from being triggered unless it is explicitly invoked when the pipeline is triggered with the following in the `POST` body:

```
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

The `when` key actually accepts any boolean, not just pipeline parameters, though pipeline parameters will be the primary use of this feature until more are implemented. `when` also has an inverse clause called `unless`, which inverts truthiness of the condition.
