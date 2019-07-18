---
layout: classic-docs
title: "Orb Author - Validate and Publish Orbs"
short-title: "Testing and Publishing Orbs"
description: "Starting point for tesing and publishing orbs"
categories: [getting-started]
order: 1
---

## Introduction

When you have finished authoring your own orb, you may then validate your orb to ensure it will work in your configuration, and then publish the orb to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/). CircleCI recommends you use the CircleCI CLI to validate and publish your orb since the the CLI provides the 'orb-tools' orb, with its associated commands, that simplify the validation and publication process. 

## orb-tools

The `orb-tools` orb provides a simple and easy way for you to structure and validate your orb before you choose to publish by enabling you to run the following jobs and commands:

Command/Job | Description
------------|-----------
`orb-tools-pack` | This command enables you to use the CircleCI CLI to pack an orb file structure into a single orb yml.
`orb-tools/validate` | This command enables you to use the CircleCI CLI to validate a given orb yml.
`orb-tools/increment` | This command enables you to use the CircleCI CLI to increment the version of an orb in the registry. If the orb does not have a version yet, it starts at 0.0.0.
`orb-tools/publish` | This command uses the CLI to publish an orb to the registry.

### orb-tools/pack

This CLI command enables you to pack the content of an orb prior to publishing. When using this command, you may pass the following parameters with this command:

Parameter | Description
------------|-----------
`source-dir` | Path to the root of the orb source directory to be packed. (for example, my-orb/src/)
`destination-orb-path` | Path including filename of where the packed orb will be written.
`attach-workspace` | Boolean for whether or not to attach to an existing workspace. Default is false.
`workspace-root` | Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to ‘.’ (the working directory)
`workspace-path` | Path of the workspace to persist to relative to workspace-root. Typically this is the same as the destination-orb-path. If the default value of blank is provided, then this job will not persist to a workspace.
`artifact-path` | Path to the directory that should be saved as a job artifact. If the default value of blank is provided, then this job will not save any artifacts.

### orb-tools-validate

This CLI command enables you to validate a given orb to ensure that the orb can be published to the CircleCI Orb Registry. When using this command, you may pass the following parameters with this command:

Parameter | Description
------------|-----------
`validate` | Boolean for whether or not to do validation on the orb. Default is false.
`checkout` | Boolean for whether or not to checkout as a first step. Default is true.
`attach-workspace` | Boolean for whether or not to attach to an existing workspace. Default is false.
`workspace-root` | Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to ‘.’ (the working directory)
`workspace-path` | Path of the workspace to persist to relative to workspace-root. Typically this is the same as the destination-orb-path. If the default value of blank is provided, then this job will not persist to a workspace.
`artifact-path` | Path to the directory that should be saved as a job artifact. If the default value of blank is provided, then this job will not save any artifacts.

### orb-tools/increment

This command uses the CLI to increment the version of an orb in the registry. If the orb does not have a version yet it starts at 0.0.0. The following parameters may be passed with this command:

Parameter | Description
------------|-----------
`orb-path` | Path to an orb file.
`orb-ref` | A version-less orb-ref in the form /
`segment` | The semantic version segment to increment ‘major’ or ‘minor’ or ‘patch’
publish-token-variable | The env var containing your token. Pass this as a literal string such as $ORB_PUBLISHING_TOKEN. Do not paste the actual token into your configuration. If omitted it’s assumed the CLI has already been setup with a valid token.
`validate` | Boolean for whether or not to do validation on the orb. Default is false.
`checkout` | Boolean for whether or not to checkout as a first step. Default is true.
`attach-workspace` | Boolean for whether or not to attach to an existing workspace. Default is false.
`workspace-root` | Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to ‘.’ (the working directory)

### `orb-tools/publish`

This command is used to publish an orb. The following parameters may be passed with this command:

Parameter | Description
------------|-----------
`orb-path` | Path of the orb file to publish.
`orb-ref` | A full orb-ref in the form of /@
`publish-token-variable` | The env var containing your publish token. Pass this as a literal string such as $ORB_PUBLISHING_TOKEN. DO NOT paste the actual token into your configuration. If omitted it’s assumed the CLI has already been setup with a valid token.
`validate` | Boolean for whether or not to do validation on the orb. Default is false.
`checkout` | Boolean for whether or not to checkout as a first step. Default is true.
`attach-workspace` | Boolean for whether or not to attach to an existing workspace. Default is false.
`workspace-root` | Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to ‘.’ (the working directory)

### Validate and Publish Example

Below is an example of how to use the `orb-tools` orb to validate and publish an orb.

```
version: 2.1
orbs:
  orb-tools: circleci/orb-tools@2.0.0

workflows:
  btd:
    jobs:
      - orb-tools/publish:
          orb-path: src/orb.yml
          orb-ref: circleci/hello-build@dev:${CIRCLE_BRANCH}
          publish-token-variable: "$CIRCLECI_DEV_API_TOKEN"
          validate: true
```

Notice in this example, the Build-Test-Depoly (BTD) workflow runs the `orb-tools/validate` job first. If the orb is valid, the next step will execute, and `orb-tools/publish` will execute. When `orb-tools/publish` succeeds, the job input will contain a success message that the new orb has been published to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).
