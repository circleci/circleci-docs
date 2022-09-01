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

This guide covers various best practices for testing orbs.

* TOC
{:toc}

## Introduction
{: #introduction }

Orbs are a critical component of a pipeline on CircleCI, responsible for installing tooling, executing tests, deploying applications, and more. As with any software, it is important to implement tests to protect the orb from breaking with new changes. Because orbs are developed in YAML, the testing process is a little different than for a programming language. With the Orb Development Kit, there is a simple path to implementing a full range of robust tests for your orb.

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/kTeRJrwxShI?start=314" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Orb-tools Pipeline Overview
{: #orb-tools-pipeline-overview }

If you are following this guide and have created your orb using the Orb Development Kit, your orb project will follow the same structure as the [Orb Template](https://github.com/CircleCI-Public/Orb-Template). If you look inside your `.circleci/` directory, you will find two config files, `config.yml` and `test-deploy.yml`, each of which contains a set of tests to run.

### config.yml
{: #configyml }

The first config file is responsible for publishing a development version of our orb, so that you may run integration tests against it in the second workflow, `test-deploy`. At this point in the pipeline, because the orb is not yet published, you can not test the orb _directly_, but in this stage you can still lint, validate, review, and potentially even run unit tests against your scripts.

After the development version of the orb has been published, the final `orb-tools/continue` job will trigger the second workflow, `test-deploy`.

See the full [config.yml template here](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/config.yml).


### test-deploy.yml
{: #test-deployyml }

This second configuration file has two main tasks, as the development version of the orb has been published in the previous config, you may now _directly_ test your orb with integration testing, and in the event that a tag is created, this config will also publish the orb to the CircleCI orb registry.

See the full [test-deploy.yml template here](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/test-deploy.yml).

## Validation
{: #validation }

The most basic forms of testing for orbs are configuration validation and code linting. When an orb is packed and published it must be both valid YAML, and valid CircleCI syntax. Both of these checks are automatically applied when using the Orb Development Kit, through the CI/CD pipeline set out in the project's config file at `.circleci/config.yml`. Config validation and code linting can also be performed manually, locally.

```yaml
# Snippet from lint-pack workflow in config.yml
workflows:
  lint-pack:
    jobs:
      - orb-tools/lint # Lints the YAML and CircleCI syntax of the orb
      - orb-tools/pack # Packs the orb source and validates it
```
### YAML Linting
{: #yaml-lint }

The first job listed within the workflow, `orb-tools/lint`, is from the [`orb-tools` orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools), which is a major component of the Orb Development Kit. The `orb-tools/lint` job is responsible for basic YAML linting. You can modify the linting rules or other settings via the [job's parameters, which are listed on the orb registry](https://circleci.com/developer/orbs/orb/circleci/orb-tools#jobs-lint).

#### Local YAML Linting
{: #local-yaml-lint }

If you have `yamllint` installed locally:

```shell
$ yamllint ./src
```

Using CircleCI's Local Execute:

```shell
circleci local execute --job orb-tools/lint
```

### Orb Validation
{: #orb-validation }

In addition to YAML Linting, we must validate the "packed" `orb.yml` file to ensure it properly conforms to orb schema. We first [pack]({{site.baseurl}}/orb-concepts/#orb-packing) the orb to combine the multiple source files into an `orb.yml`. Then we run the `circleci orb validate` command for schema checking.

```yaml
# Snippet from lint-pack workflow in config.yml
workflows:
  lint-pack:
    jobs:
      - orb-tools/pack # Packs the orb source and validates it
```

#### Local Orb Validate
{: #local-orb-validate }

To pack and validate your orb locally, run the following commands:

```shell
circleci orb pack src > orb.yml
circleci orb validate orb.yml
```

Or, using CircleCI's Local Execute:
```shell
circleci local execute --job orb-tools/pack
```
### Shellcheck
{: #shellcheck }

One of the major benefits of using the Orb Development Kit is the ability to [import external bash scripts]({{site.baseurl}}/orb-concepts/#file-include-syntax) into your final orb. Because you can keep your bash scripts in the [src/scripts](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts) directory, you can run additional tests against your scripts.

The most basic tests to run against bash scripts are a form of validation: "shellchecking". This is similar to a linter for Bash, you can find out more at [shellcheck.net](https://www.shellcheck.net/).

In the `lint-pack` workflow, you will find the [shellcheck orb](https://circleci.com/developer/orbs/orb/circleci/shellcheck) is included. The shellcheck orb steps are completely optional and can be removed, especially, if your orb does not require scripts to be imported.

#### Local ShellCheck
{: #local-shellcheck }

To run shellcheck locally, run the following commands:

```shell
shellcheck src/scripts/*.sh
```

Or, using CircleCI's Local Execute:
```shell
circleci local execute --job shellcheck/check
```

### Review
{: #review }

The orb-tools orb includes a job `orb-tools/review` which will run a suite of tests against your orb designed to find opportunities to implement best practices and improve the quality of the orb. The "review" job was modeled closely after _ShellCheck_, and operates based on a list of rules called "RC" Review Checks. Each "RC" code corresponds to a specific rule, which can optionally be ignored.

Review Checks output to JUNIT XML formatted and are automatically uploaded to CircleCI to be displayed natively in the UI.

![orb-tools review check RC008]({{site.baseurl}}/assets/img/docs/orbtools-rc008.png)

When you click into the error you will receive more information such as what file and at what line in the code the error was found, along with suggestions for resolution.

**Note:** The "orb-tools/review" job currently can not be ran locally due to the fact that the results are output as JUNIT XML and uploaded to CircleCI, which is not supported by the local execute command at this time.
{: class="alert alert-warning"}

## Unit testing
{: #unit-testing }

If you are taking advantage of the Orb Development Kit's [`<<include(file)>>` file inclusion]({{site.baseurl}}/orb-concepts/#file-include-syntax) feature and `src/scripts` directory to store and source your bash files, you can write true integration tests for your scripts.

![Unit testing BASH with BATS-Core]({{site.baseurl}}/assets/img/docs/bats_tests_example.png)

If you have an orb with sufficiently complex internal scripts, you may want to implement unit tests for better code quality and easier local development testing.

For Bash unit testing, we recommend the [BATS-Core](https://github.com/bats-core/bats-core) library, which is an open source testing framework for Bash, analogous to [Jest](https://jestjs.io/) for JavaScript.

CircleCI has created a [BATS orb](https://circleci.com/developer/orbs/orb/circleci/bats-core) to easily integrate BATS into your CircleCI pipelines.

To add BATS to your orb, follow these steps:

  1. Add a `tests` directory to your orb's `src` directory.
  2. Create your tests in the `tests` directory.
  3. Add the [circleci/bats](https://circleci.com/developer/orbs/orb/circleci/bats#usage-run-bats-tests) orb to your `config.yml` file.
  4. Add the `bats/run` job to the pre-publishing jobs in the `config.yml` file.

```
workflows:
  lint-pack:
    jobs:
      - orb-tools/lint:
          filters: *filters
      - orb-tools/pack:
          filters: *filters
      - orb-tools/review:
          filters: *filters
# Add bats
      - bats/run:
          filters: *filters
          path: ./src/tests
# ...
# And ensure to mark it as required in the publish job.
 - orb-tools/publish:
          requires:
            [orb-tools/lint, orb-tools/review, orb-tools/pack, shellcheck/check, bats/run]
```

Want to see how how CircleCI writes unit tests for Bash? Check out our [Slack orb](https://github.com/CircleCI-Public/slack-orb/blob/master/src/tests/notify.bats).

## Integration testing
{: #integration-testing }

After validating, linting, shellchecking, and any other testing that you can perform on the source code is complete, you must test your orb's functionality in a real CircleCI config. In the second config file (`test-deploy.yml`), you can access the development version of the orb you published in the first config, and attempt to execute your orbs commands and jobs.

### Testing orb commands
{: #testing-orb-commands }

By default, when you author a new orb, you will have an example orb source which comes with a "greet" command. You can test the greet command (and maybe other commands) in your `test-deploy` workflow as an integration test. You will be able to execute the commands to validate they run without error, and could even verify their functionality by running additional checks.

You should see a job in your `test-deploy.yml` file named `command-tests`. This example job will run one or all of your commands as an integration test.

In this job, you can call your orb command, with any parameters you want to test. If your command, for example, installs a command line tool, you can test to ensure that command is valid in an additional step.

By default you will see the included "greet" command is being tested. Because the greet command only outputs a message to stdout, you can not do any additional validation checks.

```yaml
jobs:
    command-tests:
      docker:
        - image: cimg/base:current
          auth:
            username: mydockerhub-user
            password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      steps:
        # Run your orb's commands to validate them.
        - <orb-name>/greet
```

Here is a snippet of a real example from our [GitHub CLI orb](https://github.com/CircleCI-Public/github-cli-orb):

```yaml
jobs:
    command-tests:
      docker:
        - image: cimg/base:current
          auth:
            username: mydockerhub-user
            password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      steps:
        - github-cli/install
        - run:
            name: verify Install
            command: command -v gh
```

In this example we are testing the `github-cli/install` command. This command may pass or fail on its own, but we can also validate in the next step that the GitHub CLI has been installed and is available on the command line. If the `gh` binary is not found in the path, this job will fail at this step.

Remember that you can have multiple jobs for testing commands if desired, or if your orb has no commands, you may have no such job. Just ensure that your `orb-tools/publish` job is requiring any jobs that contain your tests.


### Testing orb jobs
{: #testing-orb-jobs }

Testing jobs within your orbs is very similar to testing commands. However, there are a few additional restrictions to consider.

First, in your `test-deploy` workflow, you will see, just as we mentioned with testing commands above, there is ultimately an `orb-tools/publish` job which requires every job before it in the workflow to have completed. To test the jobs of your orb, you need to add them to this workflow and ensure they are required in the `orb-tools/publish` job.

Here is an example from CircleCI's [AWS ECR orb](https://github.com/CircleCI-Public/aws-ecr-orb/blob/0c27bfab932b60f1c60a4c2e74bee114f8d4b795/.circleci/test-deploy.yml#L40)

```yaml
# Shortened for this example
workflows:
  test-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          name: integration-tests-default-profile
          tag: integration,myECRRepoTag
          dockerfile: sample/Dockerfile
          executor: amd64
          post-steps:
            - run:
                name: "Delete repository"
                command: aws ecr delete-repository
          filters:
            tags:
              only: /.*/
# ...
      - orb-tools/publish:
          orb-name: circleci/aws-ecr
          vcs-type: << pipeline.project.type >>
          pub-type: production
          requires:
            - integration-tests-default-profile
          context: orb-publisher
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^v[0-9]+\.[0-9]+\.[0-9]+$/
```

The AWS ECR orb contains a job named "build-and-push-image" which will build and push an image to the AWS ECR repository. We run this job and others with multiple parameter options to test their functionality with each code change.

Similar to how we could use additional steps to test our commands, we can take advantage of [post-steps](https://circleci.com/docs/configuration-reference/#pre-steps-and-post-steps-requires-version-21) to validate in the job environment, or as shown in this example, we can "clean up" anything we may have created in the job. Post-Steps are additional steps that can be injected at the end of an existing job.

## What's next?
{: #whats-next }

Once you have added new orb features, and created tests that pass your CI, it is time to publish your orb to the Orb Registry. View the [Orb Publishing Process]({{site.baseurl}}/creating-orbs/) guide for information on releasing production-ready orbs.

## See also
{: #see-also }

- Refer to [Orbs Concepts]({{site.baseurl}}/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
