---
layout: classic-docs
title: "Testing Orbs"
short-title: "Testing Orbs"
description: "Starting point for Testing CircleCI Orbs"
categories: [getting-started]
order: 1
---

This page describes various testing methodologies you can use to test orbs.

* TOC
{:toc}

## Introduction

When producing production orbs for personal use or for the wider community, it is always a great idea to test your code. Much like when implementing tests for software, tests can be configured in a CircleCI pipeline to automatically test and publish contributions to your orb.

## Inline Orb Testing

Inline orbs can be useful for rapid prototyping and testing within a live configuration file. Inline orbs are defined locally within a project's CircleCI configuration file, and in that same configuration file the orb elements can be immediately invoked for use or testing.

```yaml
version: 2.1

orbs:
  my-orb:
    commands:
      my_command:
        steps:
          - run:
              name: My Command
              command: |
              MyInt=$((1+1))
              if [ "$MyInt" != "2" ]; then
                  echo "An error has occured." && exit 1
              fi
              echo "export MyInt=${MyInt}" >> $BASH_ENV
    jobs:
      test-command:
        docker:
          - image: cimg/base:stable
        steps:
          - my_command

workflows:
  main:
    jobs:
      - test-command

```

For more information see the [Writing Inline Orbs]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs) guide.

## Schema Validation

To test whether an orb is valid YAML and is well-formed according to the CircleCI schema, use the CircleCI CLI command `circleci orb validate`.

For example,given an orb with source at `./src/orb.yml`, run `circleci orb validate ./src/orb.yml` to receive feedback on whether the orb is valid and will pass through config processing. If there is an error, you will receive the first schema validation error encountered. Alternatively, you can pass STDIN rather than a file path.

## Integration Testing

Using [development orbs]({{site.baseurl}}/2.0/orb-concepts/#development-orbs), it is possible to publish changes to a live development version of an orb and use that development version within a live configuration for testing. Development versions of orbs can later be promoted to production orbs.

Integrations tests validate the usage of your orb and its parameters in a live environment on CircleCI using sample project code (if required). Integration test jobs should be declared that both use the commands defined within your orb, and validate the correct functioning of those commands. See the following examples for testing a command, and testing a job.

### Test a command

```yaml
version: 2.1

orbs:
  # import development version of orb
  my-orb: my-namespace/my-orb@dev:my-dev-version

jobs:
  # create jobs for each test
  test-my_command:
      docker:
      - image: cimg/base:stable
    steps:
      - my-orb/my_command:  # Invoking the orb command from the development orb
          my_parameter: "value"
      - run:
          name: Validate my_command
          command: |
            if [ "$ITWORKED" != "yes" ]; then
            echo "error" && exit 1
            fi
            
workflows:
  main:
    jobs:
      - test-my_command
```

### Test a job

```yaml
version: 2.1

orbs:
  # import development version of orb
  my-orb: my-namespace/my-orb@dev:my-dev-version

workflows:
  main:
    jobs:
      - my-orb/run-tests:
          name: integration-test-saved-tests # a custom name can be applied if desired.
          path: ~/tests
          post-steps:
            - run:
                name: Validate test artifact
                command: |
                  if [ ! -f ~/tests/results.file ]; then
                    echo "error" && exit 1
                  fi
```

## Automated Testing and Deployment

The [orb-tools orb](https://circleci.com/orbs/registry/orb/circleci/orb-tools) can be used to construct pipelines for creating, testing and publishing orbs.

After publishing a development orb, the [`trigger-integration-test-workflow`](https://circleci.com/orbs/registry/orb/circleci/orb-tools#usage-orb-dev-workflows) job can be used to immediately and automatically trigger a workflow containing your integration tests.

If you have used the [orb starter kit](https://github.com/CircleCI-Public/orb-starter-kit), your generated config will already contain orb-tools.

For configuration examples and documentation on using orb-tools, see the [Orb Registry](https://circleci.com/orbs/registry/orb/circleci/orb-tools) page and [GitHub README](https://github.com/CircleCI-Public/orb-tools-orb).

For live sample orb projects using orb-tools, view any of our CircleCI authored orbs.

## Example Orbs

* [Node Orb](https://github.com/circleci-public/node-orb)
* [Ruby Orb](https://github.com/CircleCI-Public/ruby-orb)
* [Serverless Framework Orb](https://github.com/CircleCI-Public/serverless-framework-orb)