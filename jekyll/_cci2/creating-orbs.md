---
layout: classic-docs
title: "Creating Orbs"
short-title: "Creating Orbs"
description: "Starting point for Creating CircleCI Orbs"
categories: [getting-started]
order: 1
---

Orbs are reusable packages of CircleCI configuration that you may share across projects, enabling you to create encapsulated, parameterized commands, jobs, and executors that can be used across multiple projects. 

[Orbs]({{ site.baseurl }}/2.0/orb-intro/) are made available for use in a configuration through the `orbs` key in the top level of your 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file.

This document describes how you can:

* Use an existing orb in your configuration
* Import an orb
* Create an inline orb in your `config.yml` file
* Create, validate, and publish an orb in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/)

## Overview

CircleCI has made available a number of certified and 3rd-Party orbs that you may use in your configuration to reduce the time needed to get up and running using orbs in your configuration. 

By using CircleCI certified orbs, or 3rd-party orbs developed by CircleCI partners, you can be confident that these orbs have been developed and tested to ensure they work with the CircleCI platform.

### Certified Orbs

Certified orbs are those that CircleCI has built or has reviewed and approved as part of the features of the CircleCI platform. Any project may use certified orbs in configuration version 2.1 and higher.

### 3rd-Party Orbs

3rd-party orbs are those published by CircleCI customers and other members of our community. For you to publish orbs or for your projects to use 3rd-party orbs, your organization must opt-in under Security within the Settings tab under the Orb Security Settings where an organization administrator must agree to the terms for using 3rd-party software.

**Note:** The Security setting required for publishing or using 3rd-party orbs may only be toggled by organization administrators.

### Orb Reference Format

Orb references have the following format:

```
[namespace]/[orb]@[version]
```

#### Semantic Versioning in Orbs

Orbs are published with the standard 3-number semantic versioning system:

* major
* minor
* patch

Orb authors need to adhere to semantic versioning. Within ```config.yml```, you may specify wildcard version ranges to resolve orbs. You may also use the special string ```volatile``` to pull in whatever the highest version number is at time your build runs.

For example, when ```mynamespace/some-orb@8.2.0``` exists, and ```mynamespace/some-orb@8.1.24``` and ```mynamespace/some-orb@8.0.56``` are published after 8.2.0, ```volatile``` will still refer to ```mynamespace/some-orb@8.2.0``` as the highest semantic version.

Examples of orb version declarations and their meaning:

1. ```circleci/python@volatile``` - use the highest version of the Python orb in the registry at the time a build is triggered. This is likely the most recently published and least stable Python orb.
2. ```circleci/python@2``` - use the latest version of version 2.x.y of the Python orb.
3. ```circleci/python@2.4``` - use the latest version of version 2.4.x of the Python orb.
4. ```circleci/python@3.1.4``` - use exactly version 3.1.4 of the Python orb.

#### Using Development Versions

While all production orbs must be published securely by organization administrators, development orbs provide non-administrator members of the team with a way to publish orbs. Unlike production orbs, dev orbs are also mutable, so they are ideal for rapid iteration of an idea.

A development version must be referenced by its complete, fully-qualified name, such as: ```mynamespace/myorb@dev:mybranch.```; whereas production orbs allow wildcard semantic version references. Note that there are no shorthand conveniences for development versions.

**Note:** Dev versions are mutable and expire: their contents can change, and they are subject to deletion after 90 days; therefore, it is strongly recommended you do not rely on a development versions in any production software, and use them only while actively developing your orb. It is possible for admin members of a team to publish a semantic version of an orb based off of a dev orb instead of copy-pasting some config from another teammate.


## Importing an Orb

Importing a set of existing orbs is a simple process that only requires you to provide the following instruction in your configuration. In the example below, you can see how to import a CircleCI Slack and Heroku orb:

```
orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@volatile
```

### Designing Orbs

When designing your own orbs, make sure your orbs meet the following requirements:

* Orbs should always use `description`. - Be sure to explain usage, assumptions, and any tricks in the ```description``` key under jobs, commands, executors, and parameters.
* Match commands to executors - If you are providing commands, try to provide one or more executors in which they will run.
* Use concise naming for your orb - Remember that use of your commands and jobs is always contextual to your Orb, so you can use general names like "run-tests" in most cases.
* Required vs. optional parameters - Provide sound default values of parameters whenever possible.
* Avoid job-only orbs - Job-only orbs are inflexible. While these orbs are sometimes appropriate, it can be frustrating for users to not be able to use the commands in their own jobs. Pre and post steps when invoking jobs are a workaround for users.
* Parameter `steps` are powerful - Wrapping steps provided by the user allows you to encapsulate and sugar things like caching strategies and other more complex tasks, providing a lot of value to users.

Refer to [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) for details and examples of commands, executors and parameters in orbs.

When developing your own orb, you may find it useful to write an inline orb. The section below describes how you can write your own inline orb.

## Creating Inline Orbs

Inline orbs can be handy during development of an orb or as a convenience for name-spacing jobs and commands in lengthy configurations, particularly if you later intend to share the orb with others.

To write inline orbs, you need to place the orb elements under that orb's key in the ```orbs``` declaration in the configuration. For example, if you want to import one orb and then author inline for another, the orb might look like the example shown below:

```
description: # The purpose of this orb

orbs:
  codecov: circleci/codecov-clojure@0.0.4
  my-orb:
    executors:
      default:
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

version: 2.1
workflows:
  main:
    jobs:
      - my-orb/myjob
```

In the example above, note that the contents of ```my-orb``` are resolved as an inline orb because the contents of ```my-orb``` are a map; whereas the contents of ```codecov``` are a scalar value, and thus assumed to be an orb URI.


### Example Template

When you want to author an orb, you may wish to use this example template to quickly and easily create a new orb with all of the required components. This example includes each of the three top-level concepts of orbs. While any orb can be equally expressed as an inline orb definition, it will generally be simpler to iterate on an inline orb and use ```circleci config process .circleci/config.yml``` to check whether your orb usage matches your expectation.

```
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
          name:
            type: string
        steps:
          - run: echo "hello <<parameters.name>>, from the inline command"
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

## Publishing an Orb

This section covers the tooling and flow of authoring and publishing your own orbs to the orb registry.

Orbs may be authored inline in your config.yml file or authored separately and then published to to the orb registry for reuse across projects.

[WARNING] Orbs are always world-readable. All published orbs (production and development) can be read and used by anyone. They are not limited to just the members of your organization. In general, CircleCI strongly recommends that you do not put secrets or other sensitive variables into your configuration. Instead, use contexts or project environment variables and reference the names of those environment variables in your orbs.

### Prerequisites

Before publishing an orb, you will need to first opt-in to the new Code Sharing Terms of Service and turn on orb publishing for your organization.


**Note:** Only an organization administrator can opt-in to the Code Sharing Terms of Service. The organization admin will need to navigate to the organization Settings tab and complete the form on the Security page.


### Orb Publishing Concepts

The sections below describe important concepts that you should understand before publishing an orb.

#### Orb Registry

CircleCI has a single orb registry. The registry on `circleci.com` serves as the master source for all certified namespaces and orbs. This master source is the only orb registry available to users of `circleci.com`.

<aside class="notice">
Orbs are not yet supported for CircleCI installed on your private servers or cloud.
</aside>

#### Namespaces

Namespaces are used to organize a set of orbs. Each namespace has a unique and immutable name within the registry, and each orb in a namespace has a unique name. For example, the `circleci/rails` orb may coexist in the registry with an orb called ```hannah/rails``` because they are in separate namespaces.

Namespaces are owned by organizations. Only organization administrators can create namespaces.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you require more than one namespace please contact your account team at CircleCI.

#### Development and Production Orbs

Orb versions may be added to the registry either as development versions or production versions. Production versions are always a semantic version like 1.5.3; whereas development versions can be tagged with a string and are always prefixed with `dev:` for example `dev:myfirstorb`.

##### Development and Production Orb Security Profiles

* Only organization administrators can publish production orbs.

* Any member of an organization can publish dev orbs in namespaces.

* Organization administrators can promote any dev orb to be a semantically versioned production orb.

##### Development and Production Orb Retention and Mutability Characteristics

* Dev orbs are mutable and expire. Anyone can overwrite any development orb who is a member of the organization that owns the namespace in which that orb is published.

* Production orbs are immutable and long-lived. Once you publish a production orb at a given semantic version you may not change the content of that orb at that version. To change the content of a production orb you must publish a new version with a unique version number. It is best practice to use the ```orb publish increment``` and/or the ```orb publish promote``` commands in the ```circleci``` CLI when publishing orbs to production.

##### Development and Production Orbs Versioning Semantics

Development orbs are tagged with the format ```dev:<< your-string >>```. Production orbs are always published using the semantic versioning ("semver") scheme.

In development orbs, the string label given by the user has the following restrictions:

* Up to 1023 non-whitespace characters

Examples of valid development orb tags:

* Valid:
  "dev:mybranch"
  "dev:2018_09_01"
  "dev:1.2.3-rc1"
  "dev:myinitials/mybranch"
  "dev:myVERYIMPORTANTbranch"

* Invalid
  "dev: 1" (No spaces allowed)
  "1.2.3-rc1" (No leading "dev:")

In production orbs you must use the form ```X.Y.Z``` where ```X``` is a "major" version, ```Y``` is a "minor" version, and ```Z``` is a "patch" version. For example, 2.4.0 implies the major version 2, minor version 4, and the patch version of 0.

While not strictly enforced, it is best practice when versioning your production orbs to use the standard semantic versioning convention for major, minor, and patch:

* MAJOR: when you make incompatible API changes
* MINOR: when you add functionality in a backwards-compatible manner
* PATCH: when you make backwards-compatible bug fixes

#### Using Orbs Within Your Orb and Register-Time Resolution

You may use an ```orbs``` stanza inside an orb. 

Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb ```foo/bar``` is published at version ```1.2.3``` with an ```orbs``` stanza that imports ```biz/baz@volatile```. At the time you register ```foo/bar@1.2.3``` the system will resolve ```biz/baz@volatile``` as the latest version and include its elements directly into the packaged version of ```foo/bar@1.2.3```.

If ```biz/baz``` is updated to ```3.0.0```, anyone using ```foo/bar@1.2.3``` will not see the change in ```biz/baz@3.0.0``` until ```foo/bar``` is published at a higher version than `1.2.3`.


#### Deleting Production Orbs

In general, CircleCI prefers to never delete production orbs that were published as world-readable because it harms the reliability of the orb registry as a source of configuration and the trust of all orb users.

If the case arises where you need to delete an orb for emergency reasons, please contact CircleCI (**Note:** If you are deleting because of a security concern, you must practice responsible disclosure using the [CircleCI Security](https://circleci.com/security/) web page.

#### Using the CLI to Create and Publish Orbs

The ```circleci``` CLI has several commands for managing your orb publishing pipeline. The simplest way to learn the CLI is to install it and run ```circleci help```. Refer to [Using the CircleCI CLI]( {{ site.baseurl }}/2.0/local-cli/#configuring-the-cli) for details. Listed below are some of the most pertinent commands for publishing orbs:

* ```circleci namespace create <name> <vcs-type> <org-name> [flags]```

* ```circleci orb create <namespace>/<orb> [flags]```

* ```circleci orb validate <path> [flags]```

* ```circleci orb publish <path> <namespace>/<orb>@<version> [flags]```

* ```circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]```

* ```circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]```

For a full list of help commands inside the CLI, visit the [CircleCI CLI help](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

### Orb Publishing Process

To publish an orb, follow the steps listed below as an org Admin.

1. Claim a namespace (assuming you don't yet have one), e.g.;

`circleci namespace create sandbox github CircleCI-Public`

2. Create the orb inside your namespace, e.g.:

`circleci orb create sandbox/hello-world`

3. Create the content of your orb in a file. You will generally perform this action in your code editor in a git repo made for your orb. For example, let's assume a file in `/tmp/orb.yml` could be made with a simple orb similar to:

`echo '{version: "2.1", description: "a sample orb"}' > /tmp/orb.yml`

4. Validate that your code is a valid orb using the CLI. For example, using the path above you could use:

`circleci orb validate /tmp/orb.yml`

5. Publish a development version of your orb, e.g.:

`circleci orb publish /tmp/orb.yml sandbox/hello-world@dev:first`

6. Once you are ready to push your orb to production, you can publish it manually using ```circleci orb publish``` command or promote it directly from the development version. To increment the new dev version to become 0.0.1, use the following command:

`circleci orb publish promote sandbox/hello-world@dev:first patch`

7. Your orb is now published in an immutable form as a production version and can be used safely in builds. You can view the source of your orb by using:

`circleci orb source sandbox/hello-world@0.0.1`


## Creating a CircleCI Orb 

This section describes each step of the orb creation and publishing process so you will have a deep understanding of how to write and publish your own orb. These examples enables you to follow the process step-by-step to ensure you write an orb that both adheres to CircleCI requirements while also meeting your own needs.

The following sections describe each step in the orb authoring and publishing process:

1. Meet initial CircleCI prerequisites
2. Import an existing orb or author your own orb
3. Validate and publish your orb

## Meet Initial CircleCI Prerequisites

Before you begin creating your own orb, there are a few steps you need to take to ensure that your orb will work with the CircleCI platform and your orb will be properly formatted and structured.

### CircleCI Settings

In the CircleCI app Settings page for your project, [Build Processing]({{ site.baseurl }}/2.0/build-processing/) must be enabled (default is to be ON for all new projects). The org Admin must also opt-in to use of uncertified orbs in your organization under the Settings tab on the Security page of the CircleCI app.

### Get the new CircleCI CLI

The CircleCI platform enables you to write orbs using the CircleCI CLI. If you choose to work with the CLI, the process of writing orbs will be more efficient because you will be able to use existing CircleCI CLI tools and commands.

#### Installing the CLI for the First Time

If you are installing the new `circleci` CLI for the first time, run the following command:

```
curl -fLSs https://circle.ci/cli | bash
```

By default, the `circleci` app will be installed in the `/usr/local/bin directory`. If you do not have write permissions to `/usr/local/bin`, you may need to use the `sudo` command. Alternatively, you may install the CLI to an alternate location by defining the `DESTDIR` environment variable when invoking `bash`:

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

If you have used a previous version of the CircleCI and are currently running a version older than `0.1.6`, you will need to run the following commands to upgrade your CLI version to the latest version.

```
circleci update
circleci switch
```

If you do not have write permissions, be sure to use the `sudo` command. This will install the CLI to the `/usr/local/bin` directory.

#### Updating the CircleCI CLI after Installation

The CircleCI comes with a built-in version management system. After you have installed the CLI, you should check to see if there are any updates to the CLI that need to be installed by running the following commands:

```
circleci update check
circleci update install
```

### Configuring the CircleCI CLI

Now that you have installed the CircleCI CLI, you will want to configure the CLI for use. The process for configuring the CLI is simple and straightforward, requiring you only to follow a few steps.

Before you can configure the CLI, you may need to first generate a CircleCI API token from the [Personal API Token tab](https://circleci.com/accounts/api):

```
$ circleci setup
```

If you are using the CLI tool on `circleci.com`, make sure to accept the provided default `CircleCI Host`.

If you are a user of a privately installed CircleCI deployment you will have to change the default value to your custom address, for example, circleci.my-org.com.

**Note:** CircleCI installed on a private cloud or datacenter does not yet support config processing and orbs; therefore, you will only be able to use `circlecli local execute` (this was previously `circleci build`).


### Validating a Build Config

To ensure that the CircleCI CLI tool has been installed properly, you can use the CLI tool to validate a build config file by running the following command:

```
$ circleci config validate
```

You should see a response similar to the following:

```
Config file at .circleci/config.yml is valid
```

### Set the Version Property to 2.1

After you have installed the CircleCI CLI tool, you will then need to set the version property to version 2.1. This is a very simple process, requiring you only to set the value of the top-level 'version' key in your configuration file. This will enable all 2.1 features and allow you to begin working with orbs in your environment.

## Import an Existing Orb or Author Your Own Orb

After you have met all of the prerequisites for working with orbs, you may now begin either working with an existing orb (via the import feature) or authoring your own orb. Because CircleCI has provided 20 certified and tested orbs, along with several 3rd-party orbs authored by CircleCI partners, it is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow.

### Importing an Existing Orb

If you wish to import an existing orb, it would be similar to the example shown below.

```
orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@1.0.0
```

In the above example, two orbs would be made available to you (slack & heroku), one for each key in the map.

Because the values of the above keys under `orbs` are all scalar values they are assumed to be imports based on the orb ref format of `${NAMESPACE}/${ORB_NAME}@${VERSION}`

### Authoring Your Own Orb

If you find that there are no existing orbs that meet your needs, you may wish to author your own orb to meet your specific environment or configuration requirements. Although this is more time-consuming than using the import feature, authoring your own orb enables you to create an orb that is specific to your organization.

For examples of orb source, please refer to the [Public CircleCI Repo](https://github.com/CircleCI-Public/), where you will find source code for several certified orbs.

## Validate and Publish Your Orb

When you have completed authoring your own orb, you will want to validate that the orb is properly constructed and will work in your configuration before publication. Although there are several different tests you can perform to ensure an orb's integrity, CircleCI recommends that you use the `circleci/orb-tools` orb.

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

In this example, the `btd` workflow runs the `orb-tools/validate` job first. If the orb is indeed valid, the next step will execute, and `orb-tools/publish` will execute. When `orb-tools/publish` succeeds, the job input will contain a success message that the new orb has been published.

