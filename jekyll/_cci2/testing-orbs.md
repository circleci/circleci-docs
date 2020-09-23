---
layout: classic-docs
title: "Orb Testing Methodologies"
short-title: "Testing Methodologies"
description: "Starting point for Testing CircleCI Orbs"
categories: [getting-started]
order: 1
version:
- Cloud
---
* TOC
{:toc}

## Introduction

Like any software, especially open source software expecting community contributions, proper testing is important. Because orbs are ultimately YAML, it may seem difficult to properly test your orbs, but, with the Orb Development Kit it is easy to implement a full range of robust tests for your orb.


## Validation

The most basic form of "testing" for orbs is basic configuration validation, and code linting. When an orb is packed and published it must both be valid YAML, and valid CircleCI syntax. Both of these checks can be performed manually locally and are also automatically in the Orb Development Kit provided config file at `.circleci/config.yml`.

When you first make a commit to your orb repository, this will trigger the [test-pack](https://github.com/CircleCI-Public/Orb-Project-Template/blob/43712ad367f2f3b06b2ae46e43ddf70bd3d83222/.circleci/config.yml#L40) workflow, which contains several jobs related to validating and testing our orb.

Learn more about the included config file on [Orb Publishing Process]({site.baseurl}}/2.0/creating-orbs).

### YAML Lint

The first job listed within the workflow, `orb-tools/lint` is from our [orb tools orb](https://circleci.com/orbs/registry/orb/circleci/orb-tools), another major component of the Orb Development Kit. The `orb-tools/lint` job is responsible for basic YAML linting. You can modify the linting rules or other settings via the [job's parameters, which are listed on the orb registry](https://circleci.com/orbs/registry/orb/circleci/orb-tools#jobs-lint).

### Config Validation

A singular orb.yml file (a packed orb) can be validated with the CircleCI CLI via `circleci orb validate orb.yml`. However, if you are using the Orb Development Kit, we rarely work out of singular YAML files anymore. Instead, your configuration file is automatically validated after it has been packed with the `circleci orb pack <dir> > orb.yml` command.

In the `test-pack` workflow in your Orb Development Kit provided config file will run the [orb-tools/pack](https://circleci.com/orbs/registry/orb/circleci/orb-tools#jobs-pack) job in parallel with your YAML linting job, and automatically pack and validate the result.

### Shellcheck

One of the major benefits of using the Orb Development Kit is the ability to import bash scripts externally into the final orb. Because we can keep our bash scripts in the [src/scripts](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/scripts) directory, we can run additional tests against our scripts.

The most basic tests we can run against our bash scripts is a form of validation, "shellchecking". This is similar to a linter for Bash, you can find out more at [shellcheck.net](https://www.shellcheck.net/).

In the `test-pack` workflow again, you will find included the [shellcheck orb](https://circleci.com/orbs/registry/orb/circleci/shellcheck). The shellcheck orb and this step are completely optional and can be removed, especially for instance, if your orb does not require importing scripts.

## Unit Testing

If you are taking advantage of the Orb Development Kit's `<<include(file)>>` feature and `src/scripts` directory to store and source your bash files, it is even possible to write true integration tests for your scripts. When writing longer or complex Bash scripts, it is often helpful to break up our code into smaller and more manageable functions, which we can test with the help of testing frameworks just like any other code.

Included in the provided `config.yml` file from the Orb Development Kit, within the `test-pack` workflow is the [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) job, which is responsible for automatically executing [.bats](#bats-core) tests within the `src/tests` directory.

When you initialize your orb, there is a generated [greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml) command, which _includes_ the [greet.sh](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh) shell script. Also included is a test case example using the BATS-Core (Bash Automation Testing System) framework, in the `src/tests` directory, named [greet.bats](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats)

{:.tab.unitTest.greet-yaml}

```yaml

# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml

description: >
  This command echos "Hello World" using file inclusion.
parameters:
  to:
    type: string
    default: "World"
    description: "Hello to whom?"
steps:
  - run:
      environment:
        PARAM_TO: <<parameters.to>>
      name: Hello Greeting
      command: <<include(scripts/greet.sh)>>

```

{:.tab.unitTest.greet-sh}

```bash
# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh

Greet() {
    echo Hello "${PARAM_TO}"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    Greet
fi

```

{:.tab.unitTest.greet-bats}
```bash
# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats

# Runs prior to every test
setup() {
    # Load our script file.
    source ./src/scripts/greet.sh
}

@test '1: Greet the world' {
    # Mock environment variables or functions by exporting them (after the script has been sourced)
    export PARAM_TO="World"
    # Capture the output of our "Greet" function
    result=$(Greet)
    [ "$result" == "Hello World" ]
}

```


### BATS Core

The [Bash Automation Testing System](https://github.com/bats-core/bats-core) is an open source testing framework that provides a simple way to test UNIX programs.

Within your [src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) is a [README](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/README.md) with a full and updated tutorial for creating BATS test cases.

Each `.bats` file within the [src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) directory will be automatically loaded and tested by the [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) job provided by the [bats orb](https://circleci.com/orbs/registry/orb/circleci/bats).

**Example**
For a real-life example, take a look at the tests in our [Shellcheck orb](https://github.com/CircleCI-Public/shellcheck-orb/blob/master/src/tests/check-test.bats).

Remember, including bats tests are optional and can be removed from your configuration file if desired.
{: class="alert alert-warning"}


## Integration Testing

Up until this point all testing had occurred prior to packing the orb, and applied to the code itself but not the finalized functionality of our orb. For the final critical part of orb testing, we want to actually test our orb commands and jobs to ensure they work as intended in production. We do this after we have ran our validation tests and published a new development version of the orb which we will use to test.

After the development version of the orb has been published, the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow will be automatically triggered and use the newly created development version of the orb.

Within the `integration-test_deploy` workflow, we run a series of final integration tests, and if all pass, and we are on our main deployment branch, then we may also deploy our orb.

### How To Test Orb Commands

The first job you will see in the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow is the [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L82) job, a sample integration test included with the `hello-world` orb generated by the `orb-init` command.

You can see the definition of the [`integration-test-1` job](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L27) above in the `jobs` key.

{:.tab.integration-test-job.integration-test-1}
```yaml
  integration-test-1:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - <orb-name>/greet
```

In your local version, `<orb-name>` will be replaced by the orb name you provided. This job offers a way for us to test our orb's jobs in a real CircleCI environment. You could include a sample project if needed or otherwise just run your orb's commands to ensure they do not result in a failure.

### How To Test Orb Jobs

If we needed to test our orb's jobs, rather than commands, we can simply add our orb job right next to the `integration-test-1` job in our config under the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow.

{:.tab.integration-test-workflow.integration-test_deploy}
```yaml
integration-test_deploy:
    when: << pipeline.parameters.run-integration-tests >>
    jobs:
      - integration-test-1
      - my-orb/orb-job
      - orb-tools/dev-promote-prod-from-commit-subject:
          requires:
            - integration-test-1
            - my-orb/orb-job
```

## What's Next?

Once you have added new orb features, and created passing tests, it is time to publish your orb to the Orb Registry. View the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) docs for information on automatically publishing semantically versioned orbs.

## See Also

- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.
