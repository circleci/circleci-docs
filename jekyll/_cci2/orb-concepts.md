---
layout: classic-docs
title: "Orbs Concepts"
short-title: "Orbs Concepts"
description: "Conceptual Overview for Orbs"
categories: [getting-started]
order: 1
---

CircleCI orbs are shareable packages of configuration elements, including jobs, commands, and executors. CircleCI provides certified orbs, along with 3rd-party orbs authored by CircleCI partners. It is best practice to first evaluate whether any of these existing orbs will help you in your configuration workflow. Refer to the CircleCI Orbs Registry for the complete list of certified orbs.

Before using orbs, you should first familiarize yourself with some basic core concepts of orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to leverage orbs and use them easily in your own environments.

### Certified vs. 3rd-Party Orbs

CircleCI has available a number of individual orbs that have been tested and certified to work with the platform. These orbs will be treated as part of the platform; all other orbs are considered 3rd-party orbs. Note: The Admin of your org must opt-in to 3rd-party uncertified orb usage on the Settings > Security page for your org.

All orbs are open, meaning that anyone can use them and see their source.

### Design Methodology

Before using orbs, you may find it helpful to understand the various design decisions and methodologies that were used when these orbs were designed. Orbs were designed with the following considerations:

* Orbs are transparent - If you can execute an orb, you and anyone else can view the source of that orb.
* Metadata is available - Every key can include a description key and an orb may include a description at the top level.
* Production orbs are always semantic versioned (semver’d) - CircleCI allows development orbs that have versions that start with dev:.
* Production orbs are immutable - Once an orb has been published to a semantic version, the orb cannot be changed. This prevents unexpected breakage or changing behaviors in core orchestration.
* One registry (per install) - Each installation of CircleCI, including circleci.com, has only one registry where orbs can be kept.
* Organization Admins publish production orbs. Organization members publish development orbs - All namespaces are owned by an organization. Only the admin(s) of that organization can publish/promote a production orb. All organization members can publish development orbs.

### Orb Structure

Orbs consist of the following elements:

- Commands
- Jobs
- Executors

#### Commands

Commands are reusable sets of steps that you can invoke with specific parameters within an existing job. For example, if you want to invoke the command `sayhello`, you would pass the parameter to as follows:

```
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - myorb/sayhello:
          to: "Lev"
```

#### Jobs

Jobs are comprised of two parts: a set of steps, and the environment they should be executed within. Jobs are defined in your build configuration or in an orb and enable you to define a job name in a map under the jobs key in a configuration, or in an external orb’s configuration.

You must invoke jobs in the workflow stanza of config.yml file, making sure to pass any necessary parameters as subkeys to the job.

#### Executors

Executors define the environment in which the steps of a job will be run. When you declare a job in CircleCI configuration, you define the type of environment (e.g. docker, machine, macos, etc.) to run in, in addition to any other parameters of that environment, such as:

- environment variables to populate
- which shell to use
- what size resource_class to use

When you declare an executor in a configuration outside of jobs, you can use these declarations for all jobs in the scope of that declaration, enabling you to reuse a single executor definition across multiple jobs.

An executor definition has the following keys available (some of which are also available when using the job declaration):

- docker, machine, or macos
- environment
- working_directory
- shell
- resource_class

The example below shows a simple example of using an executor:

```
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.4.0

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

Notice in the above example that the executor `my-executor` is passed as the single value of the key executor. Alternatively, you can pass `my-executor` as the value of a name key under executor. This method is primarily employed when passing parameters to executor invocations. An example of this method is shown in the example below.

```
version: 2.1
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      - run: echo outside the executor
```

### Namespaces

Namespaces are used to organize a set of orbs. Each namespace has a unique and immutable name within the registry, and each orb in a namespace has a unique name. For example, the `circleci/rails` orb may coexist in the registry with an orb called username/rails because they are in separate namespaces.

**Note:** Namespaces are owned by organizations.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you require more than one namespace, please contact your account team at CircleCI.

### Semantic Versioning in Orbs

Orbs are published with the standard 3-number semantic versioning system:

- major
- minor
- patch

Orb authors should adhere to semantic versioning. Within config.yml, you may specify wildcard version ranges to resolve orbs. You may also use the special string volatile to pull in whatever the highest version number is at time your build runs.

For example, when mynamespace/some-orb@8.2.0 exists, and mynamespace/some-orb@8.1.24 and mynamespace/some-orb@8.0.56 are published after 8.2.0, volatile will still refer to mynamespace/some-orb@8.2.0 as the highest semantic version.

**Note:** CircleCI does not currently support non-numeric semantic versioning elements. We suggest that you use either semver-style version strings in x.y.z format, or a development-style version string in dev:* format.

Examples of orb version declarations and their meaning:

* circleci/python@volatile - use the highest version of the Python orb in the registry at the time a build is triggered. This is likely the most recently published and least stable Python orb.
* circleci/python@2 - use the latest version of version 2.x.y of the Python orb.
* circleci/python@2.4 - use the latest version of version 2.4.x of the Python orb.
* circleci/python@3.1.4 - use exactly version 3.1.4 of the Python orb.

## Orb Versions (Development vs. Production)

There are two main types of orbs that you can use in your workflows: Development & Production. Depending on your workflow needs, you may choose to use either of these orbs. The sections below describe the differences between these two types of orbs so you can make a more informed decision of how best to utilize these orb types in your workflows.

While all production orbs can be published securely by organization owners, development orbs provide non-owner members of the team with a way to publish orbs. Unlike production orbs, development orbs are also mutable and expire after 90 days, so they are ideal for rapid iteration of an idea.

A development version should be referenced by its complete, fully-qualified name, such as: mynamespace/myorb@dev:mybranch.; whereas production orbs allow wildcard semantic version references. Note that there are no shorthand conveniences for development versions.

Orb versions may be added to the registry either as development versions or production versions. Production versions are always a semantic version like 1.5.3; whereas development versions can be tagged with a string and are always prefixed with dev: for example `dev:myfirstorb`.

**Note:** Dev versions are mutable and expire: their contents can change, and they are subject to deletion after 90 days; therefore, it is strongly recommended you do not rely on a development versions in any production software, and use them only while actively developing your orb. It is possible for org members of a team to publish a semantic version of an orb based off of a dev orb instead of copy-pasting some config from another teammate.

### Development and Production Orb Security Profiles

- Only organization owners can publish production orbs.
- Any member of an organization can publish dev orbs in namespaces.
- Organization owners can promote any dev orb to be a semantically versioned production orb.

### Development and Production Orb Retention and Mutability Characteristics

Dev orbs are mutable and expire. Anyone can overwrite any development orb who is a member of the organization that owns the namespace in which that orb is published.

Production orbs are immutable and long-lived. Once you publish a production orb at a given semantic version you may not change the content of that orb at that version. To change the content of a production orb you must publish a new version with a unique version number. It is best practice to use the orb publish increment and/or the orb publish promote commands in the circleci CLI when publishing orbs to production.

### Development and Production Orbs Versioning Semantics

Development orbs are tagged with the format `dev:<< your-string >>`. Production orbs are always published using the semantic versioning (“semver”) scheme.

In development orbs, the string label given by the user has the following restriction:

- Up to 1023 non-whitespace characters

Examples of valid development orb tags:

Valid:

```
  "dev:mybranch"
  "dev:2018_09_01"
  "dev:1.2.3-rc1"
  "dev:myinitials/mybranch"
  "dev:myVERYIMPORTANTbranch"
```

Invalid:

```
  "dev: 1" (No spaces allowed)
  "1.2.3-rc1" (No leading "dev:")
```

In production orbs, use the form `X.Y.Z` where `X` is a “major” version, `Y` is a “minor” version, and `Z` is a “patch” version. For example, 2.4.0 implies the major version 2, minor version 4, and the patch version of 0.

While not strictly enforced, it is best practice when versioning your production orbs to use the standard semantic versioning convention for major, minor, and patch:

- Major: when you make incompatible API changes
- Minor: when you add functionality in a backwards-compatible manner
- Patch: when you make backwards-compatible bug fixes

### Using Orbs Within Your Orb and Register-Time Resolution

You may also use an orbs stanza inside an orb.

Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb `foo/bar` is published at version 1.2.3 with an orbs stanza that imports `biz/baz@volatile`. At the time you register `foo/bar@1.2.3` the system will resolve `biz/baz@volatile` as the latest version and include its elements directly into the packaged version of `foo/bar@1.2.3`.

If `biz/baz` is updated to 3.0.0, anyone using `foo/bar@1.2.3` will not see the change in ``biz/baz@3.0.0 until `foo/bar` is published at a higher version than 1.2.3.

**Note:** Orb elements may be composed directly with elements of other orbs. For example, you may have an orb that looks like the example below.

```
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

### Deleting Production Orbs

In general, CircleCI prefers to never delete production orbs that were published as world-readable because it harms the reliability of the orb registry as a source of configuration and the trust of all orb users.

If the case arises where you need to delete an orb for emergency reasons, please contact CircleCI (Note: If you are deleting because of a security concern, you must practice responsible disclosure using the CircleCI Security web page.

## See Also
{:.no_toc}

- Refer to [Orb Introduction] ({{site.baseurl}}/2.0/orb-intro/) for a high-level overview of CircleCI orbs.
- Refer to [Orbs Reference] ({{site.baseurl}}/2.0/reusing-config/) for a detailed reference information about Orbs, including descriptions of commands, jobs and executors.
- Refer to [Orbs FAQs] ({{site.baseurl}}/2.0/orb-intro/) for information on frequent issues encountered when using orbs.
