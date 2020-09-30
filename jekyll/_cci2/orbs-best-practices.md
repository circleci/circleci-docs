---
layout: classic-docs
title: "Orbs Authoring Best Practices"
short-title: "Best Practices for Orb Authors"
description: "a guide to best practices for developing orbs"
categories: [getting-started]
order: 1
version:
- Cloud
---

* TOC
{:toc}

## General

#### Give your Orb a Descriptive Name
{:.no_toc}

An orb "slug" is made up of a _namespace_ and _orb_ name separated by a forward slash. The namespace represents, the individual, company, or organization that owns and maintains the orb, while the orb name itself should describe the product, service, or action provided by the individual orb.

| Proper Orb Slug | Bad Orb Slug |
| --------------- | ------------ |
| circleci/node   | circleci/node-orb |
| company/orb  | company/company |
{: class="table table-striped"}

#### Ensure All Orb Components Include Descriptions
{:.no_toc}

Commands, Jobs, Executors, Examples, and Parameters can all accepts descriptions. Ensure each and every component of your orb has a helpful description and provides any additional documentation that may be needed.

{:.tab.elementDescription.myCommand-yml}

```yaml
description: "Utilize this command to echo Hello to a step in the UI."
steps:
  - run:
      name: "Running Echo command"
      command: echo "Hello"
```

Create detailed descriptions that fully explain the benefit and usage of the orb element. Descriptions are an excellent place for more specific documentation related to each component.

#### Ensure Your Orb-Publishing Context is Restricted
{:.no_toc}

If using the Orb Developer Kit, your CircleCI Personal Access Token is saved to a context in your Organization. Ensure you restrict this context so that jobs accessing it will only run when triggered or approved by you or other approved users. For more information, see the [Using Contexts]({{site.baseurl}}/2.0/contexts/#restricting-a-context) guide.

## Structure

### @orb.yml

The `@orb.yml` file acts as the "root" of our project and contains much of the meta-data for our orb, which will appear on the Orb Registry as well as the CLI.

#### All Orbs Should Include a Description
{:.no_toc}

When orbs are published to the Orb Registry they are searchable by their name and description. Besides giving your users a better idea of the purpose and functionality of your orb, good descriptions are important for search optimization.

#### Include Display Links
{:.no_toc}

Orbs utilize a special config key [`display`]({{site.baseurl}}/2.0/orb-author/#orbyml) that can hold a `source_url` for linking to your Git repository, which in turn holds the orb source code and `home_url` to link to the product or service home page if applicable.

```yaml
display:
  home_url: "https://www.website.com/docs"
  source_url: "https://www.github.com/EXAMPLE_ORG/EXAMPLE_PROJECT"
```

### Commands

#### Most Orbs Will Contain At Least One Command
{:.no_toc}

Most orbs will contain at least a single command. Commands are used to execute shell commands and special CircleCI steps automatically on the user's behalf. In less common situations, for instance, if a tool _requires_ the use of a particular Docker container, an orb may not contain commands and only provide jobs.

#### Use The Minimal Number of Steps Required.
{:.no_toc}

When writing a [Reusable Command]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) for your orb, you may input any number of [steps]({{site.baseurl}}/2.0/configuration-reference/#steps). Each step should be properly named as it will appear in the user's UI. To limit the amount of "noise" in the UI, attempt to use as few steps as possible.

{:.tab.minsteps.Deploy_Command_GOOD}
```yaml

description: "A demo of a command to install a CLI, authenticate, and deploy an app"
parameters:
  api-token:
    type: env_var_name
    default: MY_SECRET_TOKEN
steps:
  - run:
      name: "Deploying application"
      command: |
        pip install example
        example login $<<parameters.api-token>>
        example deploy my-app
```

{:.tab.minsteps.Deploy_Command_BAD}
```yaml

description: "A bad example of a deploy command. Steps should be named, and combined when possible."
parameters:
  api-token:
    type: env_var_name
    default: MY_SECRET_TOKEN
steps:
  - run: pip install example
  - run: example login $<<parameters.api-token>>
  - run: example deploy my-app
```

#### Check For Root
{:.no_toc}

Before adding "sudo" to your commands, check to see if the user is already the root user. This can be done dynamically with environment variables.

```bash
if [[ $EUID == 0 ]]; then export SUDO=""; else # Check if we are root
  export SUDO="sudo";
fi

$SUDO do_command
```

### Jobs

#### Consider "pass-through" Parameters
{:.no_toc}

Inside your job, if you are utilizing any commands or executors, you must include a copy of each parameter from each of those components into your job. You can then "pass-through" the parameters given to the job, to each referenced component.

For example, here is a partial snippet of the [Node orb's `test` job](https://circleci.com/orbs/registry/orb/circleci/node#jobs-test):

{:.tab.nodeParam.Test_Job}
```yaml
description: |
  Simple drop-in job to test your NodeJS application automatically.
parameters:
  version:
    default: 13.11.0
    description: >
      A full version tag must be specified. Example: "13.11.0" For a full list
      of releases, see the following: https://nodejs.org/en/download/releases
    type: string
executor:
  name: default
  tag: << parameters.version >>
```

{:.tab.nodeParam.Default_Executor}
```yaml
description: >
  Select the version of NodeJS to use. Uses CircleCI's highly cached convenience
  images built for CI.

  Any available tag from this list can be used:
  https://circleci.com/developer/images/image/cimg/node
docker:
  - image: 'cimg/node:<<parameters.tag>>'
parameters:
  tag:
    default: '13.11'
    description: >
      Pick a specific cimg/node image version tag:
      https://circleci.com/developer/images/image/cimg/node
    type: string
```

As you can see, this job utilizes an executor named `default` which accepts a `version` parameter. In order to enable the user of this _job_ to set the `version` parameter in the _executor_, we must create the parameter in our job, and pass the parameter to our other orb components.

#### A Docker Image Parameter might be Preferable To an Executor.
{:.no_toc}
Does your orb have multiple jobs which require a specific execution environment? If so, you may choose to implement a custom executor. Will your job run on most linux platforms? Consider just using the `docker` executor directly in your job, and parameterize the image.

#### Consider _Post_ and _Pre_ Steps, and Step Parameters
{:.no_toc}

Jobs on CircleCI can have steps injected into them, either before or after the job, or somewhere in-between with the use of parameters. Jobs are often easier to set up for users than assembling commands into a custom job (where applicable). Injectable steps allow for more flexibility in jobs and may allow new functionalities in your orb.

See the following:
* [Pre and Post Steps]({{site.baseurl}}/2.0/configuration-reference/#pre-steps-and-post-steps-requires-version-21)
* [Step Parameter]({{site.baseurl}}/2.0/reusing-config/#steps)

### Executors

#### Your Orb May Not Benefit From An Executor
{:.no_toc}
Executors are especially useful outside of orbs, in users own configs as a way to create [matrix tests](https://circleci.com/blog/circleci-matrix-jobs/) for custom jobs. In orbs, we usually use executors to either provide or utilize a specific execution environment when we have multiple jobs which can only be run in said environment. For example, if your orb were to rely on a specific Docker container and provided two jobs and no commands, it make make sense to abstract the execution environment into a single [Reusable Exeuctor]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) used in both jobs.

### Examples

Orb [Usage Examples]({{site.baseurl}}/2.0/orb-concepts/#usage-examples) provide an excellent way for orb developers to share use-cases and best practices for using their orb with the community. Usage examples act as the main source of documentation users will reference when utilizing an orb, so it is important to include clear and useful examples.

#### All Public Orbs Should Contain At Least One Usage Example.
{:.no_toc}

Orbs intended for consumption by other organizations should include at least one usage example, with a description.

#### Use-Case Based Examples
{:.no_toc}

Each included usage example should be named for a specific use-case to instruct the user in how to accomplish a task. Example: `install_cli_and_deploy`, `scan_docker_container`, or `test_application_with_this-tool`

#### Show Correct Orb Version
{:.no_toc}

Each usage example must present a full example including showing the orb being imported. The version number displayed in the usage-example should match the currently published orb. If your orb is currently on version `0.1.0`, and you were to open a pull request to publish version `1.0.0`, your usage examples should be updated to reflect version `1.0.0` of the orb in use.

### Parameters

#### Secrets Should _Never_ Be Directly Entered
{:.no_toc}

Any information that could be considered "secret" such as API keys, auth tokens, passwords, ect. should never be entered directly as a parameter value. Instead, the orb developer should use the [env_var_name]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name) parameter type, which expects the string value of the name of the environment variable which will contain the secret information.

#### Parameterize the Installation Path
{:.no_toc}

When installing any binary into a potentially unknown user-defined Docker image, it is hard to know what permissions will be available. Create an `install-path` parameter, ideally with a default value of `/usr/local/bin`, and install binaries to this location (if possible). This often avoids the issue of requiring "root" privileges in environments where that may not possible.

## Deployment

#### Always Follow Strict Semantic Versioning
{:.no_toc}

Semantic versioning is a critical update and release practice in which version numbers communicate either bug fixes and patches, new functionality, or breaking changes. Introducing a breaking change as a patch update, for example, can lead to users of that orb automatically receiving updates that block their CI process. Before updating your orbs, make sure you have read over and understood [semantic versioning]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning).

## Promotion

#### Share Your Orb With The Community!
{:.no_toc}

Have you published an orb to the Orb Registry? We'd love to hear about it. Come make a post on [CircleCI Discuss](https://discuss.circleci.com/c/ecosystem/orbs).
