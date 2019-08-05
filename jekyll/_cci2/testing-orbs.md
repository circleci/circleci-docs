---
layout: classic-docs
title: "Testing CircleCI Orbs"
short-title: "Testing Orbs"
description: "Starting point for Testing CircleCI Orbs"
categories: [getting-started]
order: 1
---

This page describes various testing methodologies you can test use to test orbs.

* TOC
{:toc}

## Introduction

CircleCI orbs are packages of configuration that you can use in your configurations to simplify your workflows and quickly and easily deploy application and orbs in your workflow. When creating orbs for your workflow, you will want to perform testing to ensure your orb meets your specific needs before deploying and publishing the orb.

You can think of orb testing at four levels, in increasing levels of complexity and scope.

* Schema Validation - this can be done with a single CLI command and checks if the orb is well-formed YAML and conforms to the orb schema.
* Expansion Testing - this can be done by scripting the CircleCI CLI and tests whether the elements of the orb generate the configuration you intended when processing configuration containing those elements.
* Runtime Testing - this requires setting up separate tests and running them inside a CircleCI build.
* Integration Testing - this is likely only needed for fairly advanced orbs or orbs designed specifically as public, stable interfaces to 3rd-party services. Doing orb integration tests requires a custom build and your own external testing environments for whatever systems you are integration with.

The sections below provide details on each of these techniques for each level of orb testing.

### Schema Validation

To test whether an orb is valid YAML and is well-formed according to the schema, use `circleci orb validate` with the CircleCI CLI.

#### Example

Given an orb with source at `./src/orb.yml` you can run `circleci orb validate ./src/orb.yml` to receive feedback on whether the orb is valid and will pass through config processing. If there is an error, you will receive the first schema validation error encountered. Alternatively, you can pass STDIN rather than a file path. 

For example, equivalent to the previous example you can run `cat ./src/orb.yml | circleci orb validate -` 

**Note** Schema errors are often best read "inside out", where your coding error may be best described in one of the inner-most errors in a stack of errors.

Validation testing may also be performed inside a build using the CircleCI CLI. You can directly use the `circleci/circleci-cli` orb to insert the CLI into your builds, or use the `circleci/orb-tools` orb that contains a few handy commands jobs, including performing schema validation by default in its jobs. An example of an orb that uses `orb-tools` to do basic publishing is the "hello-build" orb.

### Expansion Testing

The next level of orb testing validates that an orb is expanding to generate the desired final `config.yml` consumed by the CircleCI system.

This testing is best completed by either publishing the orb as a dev version and then using it in your config and processing that config, or by using config packing to make it an inline orb and then processing that. Then you can use `circleci config` process and compare it to the expanded state you expect.

Another form of expansion testing can be done on the orb itself when your orb references other orbs. You can use the `circleci orb` process to resolve the orbs-dependent orbs and see how it would be expanded when you publish it to the registry.

Keep in mind that when testing expansion it's best to test the underlying structure of the data rather than the literal string that is expanded. A useful tool to make assertions about things in yaml is `yq`. This allows you to inspect specific structural elements rather than having fragile tests that depend on string comparisons or every aspect of an expanded job.

The following steps illustrate doing basic expansion testing from the CLI:

1) Assume a simple orb in `src/orb.yml`

{% raw %}
```yaml
version: 2.1

executors:
  default:
    parameters:
      tag:
        type: string
        default: "curl-browsers"
      docker:
        - image:  circleci/buildpack-deps:parameters.tag

jobs:
  hello-build:
    executor: default
    steps:
      - run: echo "Hello, build!"
```
{% endraw %}

2) Validate the orb with `circleci orb validate src/orb.yml`.

3) Publish a dev version with `circleci orb publish src/orb.yml namespace/orb@dev:0.0.1`.

4) Include that orb in `.circleci/config.yml`:

{% raw %}
```yaml
version: 2.1

orbs:
  hello: namespace/orb@dev:0.0.1

workflows:
  hello-workflow:
    jobs:
      - hello/hello-build
```
{% endraw %}

After running `circleci config process .circleci/config.yml` the expected result would be:

{% raw %}
```yaml
version: 2.1

jobs:
  hello/hello-build:
    docker:
      - image: circleci/buildpack-deps:curl-browsers
    steps:
      - run:
          command: echo "Hello, build!"
workflows:
  hello-workflow:
    jobs:
      - hello/hello-build
  version: 2
```
{% endraw %}

The `config.yml` file should look like the following:

{% raw %}
```yaml
version: 2.1

orbs:
  hello: namespace/orb@dev:0.0.1

  workflows:
    hello-workflow:
    jobs:
        - hello/hello-build
```
{% endraw %}

The result shown above may now be used in a custom script that tests for its structure relative to what is expected. This form of testing is useful for ensuring you do not break any contracts your orb interface has established with users of the orb, while also enabling you to test different parameter inputs to determine how these parameter imputs impact what is generated during config processing.

### Runtime Testing

Runtime testing involves running active builds with orbs. Because the jobs in a build can only depend on orbs that are either part of the config or were published when the build started, this technique requires some special planning.

One approach is to run jobs within your build's jobs by using the circleci CLI to run local builds using `circleci local execute` on a machine executor within your builds. This allows you to print the build output to `stdout` so you can make assertions about it. This approach can be limiting, however, because local builds do not support workflows and have other caveats. This is also powerful if you need to test the actual running output of a build using your orb elements. 

For an example of using this technique see the [Artifactory Orb](https://github.com/CircleCI-Public/artifactory-orb) page in the CircleCI public GitHub page.

The other main approach to runtime testing is to make the orb entities available to your job's configuration directly.

One option is to make checks using post-steps for jobs that you run and test, or subsequent steps for commands that you run and test. These can check things like filesystem state, but cannot make assertions about the output of the jobs and commands 

**Note** CircleCI is working to improve this limitation and welcomes feedback on your ideal mechanism for testing orbs.

Another approach is to use your orb source as your `config.yml`. If you define your testing and publishing jobs in your orb, they will have access to everything defined in the orb. The downside is that you may need to add extraneous jobs and commands to your orb, and your orb will depend on any orbs that you need for testing and publishing.

Yet another approach is when you run a build, publish a dev version of the orb, then do an automated push to a branch which uses a config that uses that dev version. This new build can run the tests. The downside with this approach is that the build that does the real testing is not directly tied to its commit, and you end up with multiple jobs every time you want to change your orb.

### Integration Testing

Sometimes you will want to test how your orbs interact with external services. There are several possible approaches depending on circumstances:

* Make your orb support a dry-run functionality of whatever it is interacting with, and use that mode in your tests.
* Do real interactions, using a properly set up test account and a separate repository that runs those tests using a published dev version of your orb.
* Spin up a local service in another container of your job.

## Orb Testing Best Practices

The most significant issue when testing orbs is that it is not straightforward to push a new commit to a repository containing orb source code. This is because orbs are interpolated into an expanded `config.yml` at build inception and may not have the newest changes to the orb contained in that commit.

There are several different approaches you can use to test your orbs (for example, using inline orbs or external repositories) to ensure orb compatibility with the CircleCI platform. CircleCI is also in the process of developing newer ways for you to test your orbs. For more detailed information about these testing examples, refer to the [Emerging Testing Best Practices for Orbs](https://discuss.circleci.com/t/emerging-testing-best-practices-for-orbs/27474) page in the CircleCI Discussion Forum.

## Orb Testing Methodologies

### Testing Orbs Locally

One of the easiest ways to test your orbs locally is to create an inline orb. Creating an inline orb enables you to test your orb while in active development. Inline orbs can be useful when developing your orb, or as a convenience for name-spacing jobs and commands in lengthy configurations.

For more detailed information on how to create an inline orb, refer to the [Creating Orbs]({{site.baseurl}}/2.0/author-orbs/) page in the CircleCI technical documentation.

### Testing Orbs Automatically

Testing orbs can be done at a few different levels. Choosing how much testing you want to do will depend on the complexity and scope of the audience for your orb.

In all cases, CircleCI recommends that you make use of the CircleCI CLI to validate your orb locally and/or automate testing in a build. For installation instructions for the CLI see the CLI documentation

For advanced testing, you may also want to use a shell unit testing framework such as BATS.

## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to the [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orbs Registry](https://circleci.com/orbs/registry/licensing) for more detailed information about legal terms and conditions when using orbs.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.
