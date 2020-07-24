---
layout: classic-docs
title: "Testing Orbs"
short-title: "Testing Orbs"
description: "Starting point for Testing CircleCI Orbs"
categories: [getting-started]
order: 1
---

This page describes various testing methodologies you can test use to test orbs.

* TOC
{:toc}

## Introduction

Whether producing a production orb for personal use or for the greater community, it's always a great idea to test your code. Much like when implementing tests for software, tests can be utilized in a CircleCI pipeline to automatically test and publish contributions to your orb.

### Inline Orb Testing

Inline orbs may be useful for rapid prototyping and testing within a live configuration file. Inline orbs are defined locally within a configuration file which can immediately invoke those orb elements for use or testing.

```yaml
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

_[See: Writing inline orbs.]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs)_

### Schema Validation

To test whether an orb is valid YAML and is well-formed according to the schema, use `circleci orb validate` with the CircleCI CLI.

**Example**

Given an orb with source at `./src/orb.yml` you can run `circleci orb validate ./src/orb.yml` to receive feedback on whether the orb is valid and will pass through config processing. If there is an error, you will receive the first schema validation error encountered. Alternatively, you can pass STDIN rather than a file path.



## Integration Testing

Using [development orbs]({{site.baseurl}}/2.0/orb-concepts/#development-orbs), it is possible to publish changes to live development version of an orb and use that development version within a live configuration for testing. Development versions of orbs can later be promoted to production orbs.

Integrations tests  validate the usage of your orb and its parameters in a live environment on CircleCI using sample project code (if required). Integration tests jobs should be declared which both use the commands defined within your orb, and validate their function.

### Test a command

```yaml
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

The [orb-tools orb](https://circleci.com/orbs/registry/orb/circleci/orb-tools) is a useful orb used for constructing pipelines for creating, testing and publishing orbs.

 After publishing a development orb, the [`trigger-integration-test-workflow`](https://circleci.com/orbs/registry/orb/circleci/orb-tools#usage-orb-dev-workflows) job can be used to immediately and automatically trigger a workflow containing your integration tests.

If you have used the [orb starter kit](https://github.com/CircleCI-Public/orb-starter-kit), your generated config will already contain orb-tools.

For configuration examples and documentation using orb-tools, view the [Orb Registry](https://circleci.com/orbs/registry/orb/circleci/orb-tools) page and [GitHub README](https://github.com/CircleCI-Public/orb-tools-orb).

For live sample orb projects using orb-tools, view any of our CircleCI authored orbs.

**Orb Repository examples:**
* [Node Orb](https://github.com/circleci-public/node-orb)
* [Ruby Orb](https://github.com/CircleCI-Public/ruby-orb)
* [Serverless Framework Orb](https://github.com/CircleCI-Public/serverless-framework-orb)