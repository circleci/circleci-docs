---
layout: classic-docs
title: "Creating Orbs"
short-title: "Creating Orbs"
description: "Starting point for Creating CircleCI Orbs"
categories: [getting-started]
order: 1
---
## Introduction
Orbs are reusable packages of CircleCI configuration that you may share across projects, enabling you to create encapsulated, parameterized commands, jobs, and executors that can be [used across multiple projects]({{ site.baseurl }}/2.0/using-orbs/). 

[Orbs]({{ site.baseurl }}/2.0/orb-intro/) are made available for use in a configuration through the `orbs` key in the top level of your 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file.

### Orbs Quickstart

The following high-level steps will enable you to publish your first orb:

1. Claim a namespace (assuming you don't yet have one). For example:
`circleci namespace create sandbox github CircleCI-Public`

In this example we are creating the `sandbox` namespace, which will be linked to the GitHub organization `CircleCI-Public`.

**Note:** When creating a namespace via the CircleCI CLI, be sure to specify the VCS provider. Note that the org you specified should already be added to CircleCI CLI. Also, the org setting "Uncertified Orbs" needs to be enabled.

**Note:** Namespaces cannot be removed or renamed once you have claimed a namespace.

**Note:** Only organization owners can create namespaces.

2. Create the orb inside your namespace. For example:
`circleci orb create sandbox/hello-world`

3. Create the content of your orb in a file. You will generally do this in your code editor in a git repo made for your orb, but, for the sake of an example, let's assume a file in /tmp/orb.yml could be made with a bare-bones orb like:
`echo '{version: "2.1", description: "a sample orb"}' > /tmp/orb.yml`

4. Validate that your code is a valid orb using the CLI. For example, using the path above you could use:
`circleci orb validate /tmp/orb.yml`

5. Publish a dev version of your orb. Assuming the above orb that would look like:
`circleci orb publish /tmp/orb.yml sandbox/hello-world@dev:first`

6. Once you are ready to push your orb to production, you can publish it manually using circleci orb publish or promote it directly from the dev version. In the case of the above, assuming you wanted to increment the new dev version to become 0.0.1 you can use:
`circleci orb publish promote sandbox/hello-world@dev:first patch`

7. Your orb is now published in an immutable form as a production version and can be used safely in builds. You can pull the source of your orb using:
`circleci orb source sandbox/hello-world@0.0.1`

### Orb Publishing Process

Before working with orbs, you may find it helpful to gain a high-level understanding of the end-to-end orbs publishing process. The diagram shown below illustrates the orbs publishing process. ![Orbs Workflow Diagram image](  {{ site.baseurl }}/assets/img/docs/orbs_outline_v3.png)

#### Step 1 - Set Up the CircleCI CLI
Although it is possible to CI/CD orb publishing using the [`orbs-tool`](https://circleci.com/docs/2.0/creating-orbs/#orb-toolspublish) orb, the most direct and iterable way to build, publish, and test orbs is by using our CLI. Detailed instructions can be found in the [Get the new CircleCI CLI](https://circleci.com/docs/2.0/creating-orbs/#get-the-new-circleci-cli) section on this page.

* [Download and Install the CircleCI CLI](https://circleci.com/docs/2.0/creating-orbs/#installing-the-cli-for-the-first-time).
* [Update the CLI](https://circleci.com/docs/2.0/creating-orbs/#updating-the-circleci-cli-after-installation).
* [Configure the CLI](https://circleci.com/docs/2.0/creating-orbs/#configuring-the-circleci-cli).

#### Step 2 - Verify You Installed the CLI Correctly
Once you have configured the CircleCI CLI, verify you installed the CLI correctly and the CLI is updated and configured properly before beginning to work with orbs.

#### Step 3 - Bump Version Property to Orbs-Compatible 2.1
After validating your build configuration, bump the version property to 2.1 so it is compatible for use with orbs. More information on how to bump the version property can be found in the "Bump Version Property to Orbs-Compatible 2.1" section on this page.

#### Step 4 - Create a New Orb Using Inline Template
Using inline orbs are the easiest way to get started with orbs because you can reference them from your existing configuration. Although not required for orb authoring, using inline orbs can simplify the process and is a reasonable approach to authoring orbs quickly and easily.

#### Step 5 - Design Your Orb
Depending on whether you use an inline template or author your orb independent of this inline template, you will want to add elements (Jobs, Commands, and Executors) to your orb. For more information on these orb elements, refer to the [Commands](https://circleci.com/docs/2.0/using-orbs/#commands), [Jobs](https://circleci.com/docs/2.0/using-orbs/#jobs), and [Executors](https://circleci.com/docs/2.0/using-orbs/#executors) sections found in the [Using Orbs](https://circleci.com/docs/2.0/using-orbs/#section=configuration) page.

#### Step 6 - Validate your Orb
When you have finished authoring your orb, simply run the `validate` command from your CLI. CircleCI provides several different tools to validate your orb, including the `circleci/orb-tools` orb. For more information on using the `circleci/orb-tools` orb, see the [Validate and Publish Your Orb](https://circleci.com/docs/2.0/creating-orbs/#validate-and-publish-your-orb) section on this page.

#### Step 7 - Publish Your Orb
The final step in the orb publishing process is for you to simply publish your orb using the `orb-tools/publish` CLI command in the `circleci/orb-tools` orb. Note that `dev` orb versions make it possible to publish multiple versions of an orb name (`dev` orbs are mutable).

For detailed information about this command, refer to the [orb-tools/publish](https://circleci.com/docs/2.0/creating-orbs/#orb-toolspublish) section on this page.

## Overview

This following sections of this document describe in more detail:

* Versioning and Designing orbs
* Creating an inline orb in your `config.yml` file with templates
* Creating, validating, and publishing an orb in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/)

Certified orbs are those that CircleCI has built or has reviewed and approved as part of the features of the CircleCI platform. Any project may use certified orbs in configuration version 2.1 and higher.

3rd-party orbs are those published by CircleCI customers and other members of our community. For you to publish orbs or for your projects to use 3rd-party orbs, your organization must opt-in under Security within the Settings tab under the Orb Security Settings where an organization administrator must agree to the terms for using 3rd-party software.

**Note:** The Security setting required for publishing or using 3rd-party orbs may only be toggled by organization administrators.

**Note:** Orbs are not currently supported on private installations of CircleCI Server.

## Semantic Versioning in Orbs

Orbs are published with the standard 3-number semantic versioning system:

* major
* minor
* patch

Orb authors should adhere to semantic versioning. Within `config.yml`, you may specify wildcard version ranges to resolve orbs. You may also use the special string `volatile` to pull in whatever the highest version number is at time your build runs.

For example, when `mynamespace/some-orb@8.2.0` exists, and `mynamespace/some-orb@8.1.24` and `mynamespace/some-orb@8.0.56` are published after 8.2.0, `volatile` will still refer to `mynamespace/some-orb@8.2.0` as the highest semantic version.

Examples of orb version declarations and their meaning:

1. `circleci/python@volatile` - use the highest version of the Python orb in the registry at the time a build is triggered. This is likely the most recently published and least stable Python orb.
2. `circleci/python@2` - use the latest version of version 2.x.y of the Python orb.
3. `circleci/python@2.4` - use the latest version of version 2.4.x of the Python orb.
4. `circleci/python@3.1.4` - use exactly version 3.1.4 of the Python orb.

### Using Development Versions

While all production orbs can be published securely by organization owners, development orbs provide non-owner members of the team with a way to publish orbs. Unlike production orbs, development orbs are also mutable, so they are ideal for rapid iteration of an idea.

A development version should be referenced by its complete, fully-qualified name, such as: `mynamespace/myorb@dev:mybranch.`; whereas production orbs allow wildcard semantic version references. Note that there are no shorthand conveniences for development versions.

**Note:** Dev versions are mutable and expire: their contents can change, and they are subject to deletion after 90 days; therefore, it is strongly recommended you do not rely on a development versions in any production software, and use them only while actively developing your orb. It is possible for org members of a team to publish a semantic version of an orb based off of a dev orb instead of copy-pasting some config from another teammate.

## Designing Orbs

When designing your own orbs, make sure your orbs meet the following requirements:

* Orbs should always use `description`. - Be sure to explain usage, assumptions, and any tricks in the `description` key under jobs, commands, executors, and parameters.
* Match commands to executors - If you are providing commands, try to provide one or more executors in which they will run.
* Use concise naming for your orb - Remember that use of your commands and jobs is always contextual to your orb, so you can use general names like "run-tests" in most cases.
* Required vs. optional parameters - Provide sound default values of parameters whenever possible.
* Avoid job-only orbs - Job-only orbs are inflexible. While these orbs are sometimes appropriate, it can be frustrating for users to not be able to use the commands in their own jobs. Pre and post steps when invoking jobs are a workaround for users.
* Parameter `steps` are powerful - Wrapping steps provided by the user allows you to encapsulate and sugar things like caching strategies and other more complex tasks, providing a lot of value to users.

Refer to [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) for details and examples of commands, executors and parameters in orbs.

When developing your own orb, you may find it useful to write an inline orb. The section below describes how you can write your own inline orb.

## Creating Inline Orbs

Inline orbs can be handy during development of an orb or as a convenience for name-spacing jobs and commands in lengthy configurations, particularly if you later intend to share the orb with others.

To write inline orbs, place the orb elements under that orb's key in the `orbs` declaration in the configuration. For example, if you want to import one orb and then author inline for another, the orb might look like the example shown below:

{% raw %}
```yaml
version: 2.1
description: # The purpose of this orb

orbs:
  my-orb:
    orbs:
      codecov: circleci/codecov-clojure@0.0.4
    executors:
      specialthingsexecutor:
        docker:
          - image: circleci/ruby:1.4.2
    commands:
      dospecialthings:
        steps:
          - run: echo "We will now do special things"
    jobs:
      myjob:
        executor: specialthingsexecutor
        steps:
          - dospecialthings
          - codecov/upload:
              path: ~/tmp/results.xml

workflows:
  main:
    jobs:
      - my-orb/myjob
```
{% endraw %}

In the example above, note that the contents of `my-orb` are resolved as an inline orb because the contents of `my-orb` are a map; whereas the contents of `codecov` are a scalar value, and thus assumed to be an orb URI.

### Example Inline Template

When you want to author an orb, you may wish to use this example template to quickly and easily create a new orb with all of the required components. This example includes each of the three top-level concepts of orbs. While any orb can be equally expressed as an inline orb definition, it will generally be simpler to iterate on an inline orb and use `circleci config process .circleci/config.yml` to check whether your orb usage matches your expectation.

{% raw %}
```yaml
version: 2.1
description: This is an inline job

orbs:
  inline_example:
    jobs:
      my_inline_job:
        parameters:
          greeting_name:
            description: # a helpful description
            type: string
            default: olleh
        executor: my_inline_executor
        steps:
          - my_inline_command:
              name: <<parameters.greeting_name>>
    commands:
      my_inline_command:
        parameters:
          greeting_name:
            type: string
        steps:
          - run: echo "hello <<parameters.greeting_name>>, from the inline command"
    executors:
      my_inline_executor:
        parameters:
          version:
            type: string
            default: "2.4"
        docker:
          - image: circleci/ruby:<<parameters.version>>

workflows:
  build-test-deploy:
    jobs:
      - inline_example/my_inline_job:
          name: mybuild # best practice is to name each orb job
      - inline_example/my_inline_job:
          name: mybuild2
          greeting_name: world
```
{% endraw %}

## Providing Usage Examples of Orbs
_The `examples` stanza is available in configuration version 2.1 and later_

As an author of an orb, you may wish to document examples of using it in a CircleCI config file, not only to provide a starting point for new users, but also to demonstrate more complicated use cases. 

When you have completed authoring an orb, and have published the orb, the orb will be published in the [Orb Registry](https://circleci.com/orbs/registry/). You will see your newly-created orb in the Orb Registry, which is shown below.

![Orbs Registry image]({{ site.baseurl }}/assets/img/docs/Orbs-Registry.png)

### Simple Examples
Below is an example orb you can use:

{% raw %}
```yaml
version: 2.1
description: A foo orb

commands:
  hello:
    description: Greet the user politely
    parameters:
      username:
        type: string
        description: A name of the user to greet
    steps:
      - run: "echo Hello << parameters.username >>"
```
{% endraw %}

If you would like, you may also supply an additional `examples` stanza in the orb like the example shown below:

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Greeting a user named Anna
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
```
{% endraw %}

Please note that `examples` can contain multiple keys at the same level as `simple_greeting`, allowing for multiple examples.

### Expected Usage Results

The above usage example can be optionally supplemented with a `result` key, demonstrating what the configuration will look like after expanding the orb with its parameters:

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Greeting a user named Anna
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
    result:
      version: 2.1
      jobs:
        build:
          machine: true
          steps:
          - run:
              command: echo Hello Anna
      workflows:
        version: 2
        workflow:
          jobs:
          - build
```
{% endraw %}

### Usage Examples Syntax
The top level `examples` key is optional. Usage example maps nested below it can have the following keys:

- **description:** (optional) A string that explains the example's purpose, making it easier for users to understand it.
- **usage:** (required) A full, valid config map that includes an example of using the orb.
- **result:** (optional) A full, valid config map demonstrating the result of expanding the orb with supplied parameters.

## Publishing an Orb

This section covers the tooling and flow of authoring and publishing your own orbs to the orb registry.

Orbs may be authored inline in your `config.yml` file or authored separately and then published to to the orb registry for reuse across projects.

[WARNING] Orbs are always world-readable. All published orbs (production and development) can be read and used by anyone. They are not limited to just the members of your organization. In general, CircleCI strongly recommends that you do not put secrets or other sensitive variables into your configuration. Instead, use contexts or project environment variables and reference the names of those environment variables in your orbs.

### Prerequisites

Before publishing an orb, be sure to first opt-in to the new Code Sharing Terms of Service and turn on orb publishing for your organization.

**Note:** Only an organization owner can opt-in to the Code Sharing Terms of Service. The organization owner will navigate to the organization Settings tab and complete the form on the Security page.

### Namespaces

Namespaces are used to organize a set of orbs. Each namespace has a unique and immutable name within the registry, and each orb in a namespace has a unique name. For example, the `circleci/rails` orb may coexist in the registry with an orb called `hannah/rails` because they are in separate namespaces.

Namespaces are owned by organizations.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you require more than one namespace, please contact your account team at CircleCI.

### Development and Production Orbs

Orb versions may be added to the registry either as development versions or production versions. Production versions are always a semantic version like 1.5.3; whereas development versions can be tagged with a string and are always prefixed with `dev:` for example `dev:myfirstorb`.

### Development and Production Orb Security Profiles

* Only organization owners can publish production orbs.
* Any member of an organization can publish dev orbs in namespaces.
* Organization owners can promote any dev orb to be a semantically versioned production orb.

### Development and Production Orb Retention and Mutability Characteristics

* Dev orbs are mutable and expire. Anyone can overwrite any development orb who is a member of the organization that owns the namespace in which that orb is published.
* Production orbs are immutable and long-lived. Once you publish a production orb at a given semantic version you may not change the content of that orb at that version. To change the content of a production orb you must publish a new version with a unique version number. It is best practice to use the `orb publish increment` and/or the `orb publish promote` commands in the `circleci` CLI when publishing orbs to production.

### Development and Production Orbs Versioning Semantics

Development orbs are tagged with the format `dev:<< your-string >>`. Production orbs are always published using the semantic versioning ("semver") scheme.

In development orbs, the string label given by the user has the following restrictions:

* Up to 1023 non-whitespace characters

Examples of valid development orb tags:

* Valid:

{% raw %}
```
  "dev:mybranch"
  "dev:2018_09_01"
  "dev:1.2.3-rc1"
  "dev:myinitials/mybranch"
  "dev:myVERYIMPORTANTbranch"
```
{% endraw %}

* Invalid

{% raw %}
```
  "dev: 1" (No spaces allowed)
  "1.2.3-rc1" (No leading "dev:")
```
{% endraw %}

In production orbs, use the form `X.Y.Z` where `X` is a "major" version, `Y` is a "minor" version, and `Z` is a "patch" version. For example, 2.4.0 implies the major version 2, minor version 4, and the patch version of 0.

While not strictly enforced, it is best practice when versioning your production orbs to use the standard semantic versioning convention for major, minor, and patch:

* MAJOR: when you make incompatible API changes
* MINOR: when you add functionality in a backwards-compatible manner
* PATCH: when you make backwards-compatible bug fixes

#### Using Orbs Within Your Orb and Register-Time Resolution

You may use an `orbs` stanza inside an orb. 

Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb `foo/bar` is published at version `1.2.3` with an `orbs` stanza that imports `biz/baz@volatile`. At the time you register `foo/bar@1.2.3` the system will resolve `biz/baz@volatile` as the latest version and include its elements directly into the packaged version of `foo/bar@1.2.3`.

If `biz/baz` is updated to `3.0.0`, anyone using `foo/bar@1.2.3` will not see the change in `biz/baz@3.0.0` until `foo/bar` is published at a higher version than `1.2.3`.

**Note:** Orb elements may be composed directly with elements of other orbs. For example, you may have an orb that looks like the example below.

{% raw %}
```yaml
version: 2.1

orbs:
  some-orb: some-ns/some-orb@volatile
executors:
  my-executor: some-orb/their-executor
commands:
  my-command: some-orb/their-command
jobs:
  my-job: some-orb/their-job
  another-job:
    executor: my-executor
    steps:
      - my-command:
          param1: "hello"
```
{% endraw %}

### Deleting Production Orbs

In general, CircleCI prefers to never delete production orbs that were published as world-readable because it harms the reliability of the orb registry as a source of configuration and the trust of all orb users.

If the case arises where you need to delete an orb for emergency reasons, please contact CircleCI (**Note:** If you are deleting because of a security concern, you must practice responsible disclosure using the [CircleCI Security](https://circleci.com/security/) web page.

## Using the CLI to Create and Publish Orbs

The `circleci` CLI has several commands for managing your orb publishing pipeline. The simplest way to learn the CLI is to install it and run `circleci help`. Refer to [Using the CircleCI CLI]( {{ site.baseurl }}/2.0/local-cli/#configuring-the-cli) for details. Listed below are some of the most pertinent commands for publishing orbs:

* `circleci namespace create <name> <vcs-type> <org-name> [flags]`
* `circleci orb create <namespace>/<orb> [flags]`
* `circleci orb validate <path> [flags]`
* `circleci orb publish <path> <namespace>/<orb>@<version> [flags]`
* `circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]`
* `circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]`

For a full list of help commands inside the CLI, visit the [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

## Creating a CircleCI Orb 

This section describes each step of the orb creation and publishing process so you will have a deep understanding of how to write and publish your own orb. These examples enables you to follow the process step-by-step to ensure you write an orb that both adheres to CircleCI requirements while also meeting your own needs.

The following sections describe each step in the orb authoring and publishing process:

1. Meet initial CircleCI prerequisites.
2. Author your own orb.
3. Validate and publish your orb.

## Meet Initial CircleCI Prerequisites

Before you begin creating your own orb, there are a few steps you should take to ensure that your orb will work with the CircleCI platform and your orb will be properly formatted and structured.

### CircleCI Settings

In the CircleCI app Settings page for your project, pipelines must be enabled (default is to be ON for all new projects). The organization owner must also opt-in to use of uncertified orbs in your organization under the Settings tab on the Security page of the CircleCI app.

### Get the new CircleCI CLI

The CircleCI platform enables you to write orbs using the CircleCI CLI. If you choose to work with the CLI, the process of writing orbs will be more efficient because you will be able to use existing CircleCI CLI tools and commands.

#### Installing the CLI for the First Time

If you are installing the new `circleci` CLI for the first time, run the following command:

```
curl -fLSs https://circle.ci/cli | bash
```

By default, the `circleci` app will be installed in the `/usr/local/bin directory`. If you do not have write permissions to `/usr/local/bin`, use the `sudo` command. Alternatively, you may install the CLI to an alternate location by defining the `DESTDIR` environment variable when invoking `bash`:

```
curl -fLSs https://circle.ci/cli | DESTDIR=/opt/bin/bash
```

##### Homebrew

If you wish to use Homebrew, run the following command:

```
brew install circleci
```
##### Snapcraft

You may also use Snapcraft to install the CLI by running the following command:

```
sudo snap install circleci
```

#### Upgrading From an Existing CLI

If you have used a previous version of the CircleCI and are currently running a version older than `0.1.6`, run the following commands to upgrade your CLI version to the latest version.

```
circleci update
circleci switch
```

If you do not have write permissions, be sure to use the `sudo` command. This will install the CLI to the `/usr/local/bin` directory.

#### Updating the CircleCI CLI after Installation

The CircleCI comes with a built-in version management system. After you have installed the CLI, check if there are any updates to the CLI that need to be installed by running the following commands:

```
circleci update check
circleci update install
```

### Configuring the CircleCI CLI

Now that you have installed the CircleCI CLI, you will want to configure the CLI for use. The process for configuring the CLI is simple and straightforward, requiring you only to follow a few steps.

Before you can configure the CLI, you may need to first generate a CircleCI API token from the [Personal API Token tab](https://circleci.com/account/api):

```
$ circleci setup
```

If you are using the CLI tool on `circleci.com`, accept the provided default `CircleCI Host`.

If you are a user of a privately installed CircleCI deployment, change the default value to your custom address, for example, circleci.your-org.com.

**Note:** CircleCI installed on a private cloud or datacenter does not yet support config processing and orbs; therefore, you may only use `circleci local execute` (this was previously `circleci build`).

### Packing A Config

The CLI provides a `pack` command, allowing you to create a single `config.yml` file from several separate files. This is particularly useful for breaking up large configs and allows custom organization of your yaml configuration. `circleci config pack` converts a filesystem tree into a single yaml file based on directory structure and file contents. How you **name** and **organize** your files when using the `pack` command will determine the final outputted `config.yml`. Consider the following example folder structure:

```sh
$ tree
.
├── config.yml
└── foo
    ├── bar
    │   └── @baz.yml
    ├── foo.yml
    └── subtree
        └── types.yml

3 directories, 4 files
```

The unix `tree` command is great for printing out folder structures. In the example tree structure above, the `pack` command will  map the folder names and file names to **yaml keys**  and the file contents as the **values** to those keys. Let's `pack` up the example folder from above:

{% raw %}
```sh
$ circleci config pack foo
```

```yaml
version: 2.1
bar:
  baz: qux
foo: bar
subtree:
  types:
    ginkgo:
      seasonality: deciduous
    oak:
      seasonality: deciduous
    pine:
      seasonality: evergreen
```
{% endraw %}

#### Other Config Packing Capabilities
{:.no_toc}

A file beginning with `@` will have its contents merged into its parent folder level. This can be useful at the top level of an orb, when one might want generic `orb.yml` to contain metadata, but not to map into an `orb` key-value pair.

Thus:

{% raw %}
```sh
$ cat foo/bar/@baz.yml
{baz: qux}
```
{% endraw %}

Is mapped to:

```yaml
bar: 
  baz: qux
```

#### An Example Packed Config.yml
{:.no_toc}

See the [example_config_pack folder](https://github.com/CircleCI-Public/config-preview-sdk/tree/master/docs/example_config_pack) to see how `circleci config pack` could be used with git commit hooks to generate a single `config.yml` from multiple yaml sources.

### Processing A Config

Running `circleci config process` validates your config, but will also display expanded source configuration alongside your original config (useful if you are using orbs).

Consider the example configuration that uses the `hello-build` orb:

{% raw %}
```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
{% endraw %}

Running `circleci config process .circleci/config.yml` will output the following (which is a mix of the expanded source and the original config commented out).

{% raw %}
```sh
# Orb 'circleci/hello-build@0.0.5' resolved to 'circleci/hello-build@0.0.5'
version: 2.1
jobs:
  hello/hello-build:
    docker:
    - image: circleci/buildpack-deps:curl-browsers
    steps:
    - run:
        command: echo "Hello ${CIRCLE_USERNAME}"
    - run:
        command: |-
          echo "TRIGGERER: ${CIRCLE_USERNAME}"
          echo "BUILD_NUMBER: ${CIRCLE_BUILD_NUM}"
          echo "BUILD_URL: ${CIRCLE_BUILD_URL}"
          echo "BRANCH: ${CIRCLE_BRANCH}"
          echo "RUNNING JOB: ${CIRCLE_JOB}"
          echo "JOB PARALLELISM: ${CIRCLE_NODE_TOTAL}"
          echo "CIRCLE_REPOSITORY_URL: ${CIRCLE_REPOSITORY_URL}"
        name: Show some of the CircleCI runtime env vars
    - run:
        command: |-
          echo "uname:" $(uname -a)
          echo "arch: " $(arch)
        name: Show system information
workflows:
  Hello Workflow:
    jobs:
    - hello/hello-build
  version: 2

 Original config.yml file:
 version: 2.1
 
 orbs:
     hello: circleci/hello-build@0.0.5
 
 workflows:
     \"Hello Workflow\":
         jobs:
           - hello/hello-build
```
{% endraw %}

### Validating a Build Config

To ensure that the CircleCI CLI tool has been installed properly, use the CLI tool to validate a build config file by running the following command:

```
$ circleci config validate
```

You should see a response similar to the following:

```
Config file at .circleci/config.yml is valid
```

### Bump Version Property to Orb-Compatible 2.1

After you have installed the CircleCI CLI tool, bump the version property to an orbs-compatible version (2.1). This is a very simple process, requiring you only to set the value of the top-level 'version' key in your configuration file. This enables all 2.1 features and allow you to begin working with orbs in your environment.

### Authoring Your Orb

For examples of orb source, please refer to the [Public CircleCI Repo](https://github.com/CircleCI-Public/), where you will find source code for several certified orbs.

## Validate and Publish Your Orb

When you have completed authoring your own orb, validate that the orb is properly constructed and will work in your configuration before publication. Although there are several different tests you can perform to ensure an orb's integrity, CircleCI recommends that you use the `circleci/orb-tools` orb.

The `orb-tools orb` provides the following jobs and commands that you may find useful.

* `orb-tools/pack` (experimental) uses the CLI to pack an orb file structure into a single orb yml.
* `orb-tools/validate` uses the CLI to validate a given orb yml.
* `orb-tools/increment` uses the CLI to increment the version of an orb in the registry. If the orb does not have a version yet it starts at 0.0.0.
* `orb-tools/publish` uses the CLI to publish an orb to the registry.

### `orb-tools/pack`

This CLI command enables you to pack the content of an orb for publishing. The following parameters may be passed with this command:

* source-dir: Path to the root of the orb source directory to be packed. (for example, `my-orb/src/`)
* destination-orb-path: Path including filename of where the packed orb will be written.
* validate: Boolean for whether or not to do validation on the orb. Default is false.
* checkout: Boolean for whether or not to checkout as a first step. Default is true.
* attach-workspace: Boolean for whether or not to attach to an existing workspace. Default is false.
* workspace-root: Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to '.' (the working directory)
* workspace-path: Path of the workspace to persist to relative to workspace-root. Typically this is the same as the destination-orb-path. If the default value of blank is provided then this job will not persist to a workspace.
* artifact-path: Path to directory that should be saved as a job artifact. If the default value of blank is provided then this job will not save any artifacts.

### `orb-tools/increment`

This command uses the CLI to increment the version of an orb in the registry. If the orb does not have a version yet it starts at 0.0.0. The following parameters may be passed with this command:

* orb-path: Path to an orb file.
* orb-ref: A version-less orb-ref in the form /
* segment: The semantic version segment to increment 'major' or 'minor' or 'patch'
* publish-token-variable: The env var containing your token. Pass this as a literal string such as $ORB_PUBLISHING_TOKEN. Do not paste the actual token into your configuration. If omitted it's assumed the CLI has already been setup with a valid token.
* validate: Boolean for whether or not to do validation on the orb. Default is false.
* checkout: Boolean for whether or not to checkout as a first step. Default is true.
* attach-workspace: Boolean for whether or not to attach to an existing workspace. Default is false.
* workspace-root: Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to '.' (the working directory)

### `orb-tools/publish`

This command is used to publish an orb. The following parameters may be passed with this command:

* orb-path: Path of the orb file to publish.
* orb-ref: A full orb-ref in the form of /@
* publish-token-variable: The env var containing your publish token. Pass this as a literal string such as `$ORB_PUBLISHING_TOKEN`. DO NOT paste the actual token into your configuration. If omitted it's assumed the CLI has already been setup with a valid token.
* validate: Boolean for whether or not to do validation on the orb. Default is false.
* checkout: Boolean for whether or not to checkout as a first step. Default is true.
* attach-workspace: Boolean for whether or not to attach to an existing workspace. Default is false.
* workspace-root: Workspace root path that is either an absolute path or a path relative to the working directory. Defaults to '.' (the working directory)

### Validate and Publish Example

Below is an example of how to use the `orb-tools` orb to validate and publish an orb.

{% raw %}
```yaml
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
{% endraw %}

In this example, the `btd` workflow runs the `orb-tools/validate` job first. If the orb is indeed valid, the next step will execute, and `orb-tools/publish` will execute. When `orb-tools/publish` succeeds, the job input will contain a success message that the new orb has been published.

## See Also
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Orbs FAQ]({{site.baseurl}}/2.0/orbs-faq/), where you will find answers to common questions.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
- Refer to [Testing Orbs]({{site.baseurl}}/2.0/testing-orbs/) for information about how to test the orbs you have created.
- Refer to [Orbs Registry](https://circleci.com/orbs/registry/licensing) for more detailed information about legal terms and conditions when using orbs.
- Refer to [Local CLI]({{site.baseurl}}/2.0/local-cli/#overview) for more information about how you can use the CircleCI CLI in your orbs deployments.
