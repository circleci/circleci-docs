---
layout: classic-docs
title: "Orbs Concepts"
short-title: "Orbs Concepts"
description: "Conceptual Overview for Orbs"
categories: [getting-started]
order: 1
---

* TOC
{:toc}

## Quick Start

[CircleCI orbs](https://circleci.com/orbs/) are shareable packages of configuration elements, including [jobs]({{site.baseurl}}/2.0/2.0/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/2.0/2.0/reusing-config/#authoring-reusable-commands), and [executors]({site.baseurl}}/2.0/2.0/reusing-config/#authoring-reusable-executors). Orbs make writing and customizing CircleCI config simple. The reusable configuration elements used in orbs are explained fully in the [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/).

## Reusable Configuration

CircleCI's [Reusable Configuration]({{site.baseurl}}/2.0/reusing-config/) features allow you to define parametrizable configuration elements and re-use those elements throughout a project config file. It is recommended you become familiar with the full [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/) features before moving on to the [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/).

### Commands
Commands contain one or more [steps]() in which [parameters]() can be used to modify behavior. Commands are the logic of orbs and are responsible for executing steps such as [checking out code](https://circleci.com/docs/2.0/configuration-reference/#checkout), or running shell code, for example, running BASH or running CLI tools. For more information see the [Authoring Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) guide.

As an example, the AWS S3 orb includes a _command_ to copy a file or object to a new location: `aws-s3/copy`. If your AWS authentication details are stored as environment variables, the syntax to use this command in your config is simply:

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@x.y.z

jobs:
  build:
    docker:
      - image: 'cimg/python:3.6'
    steps:
      - checkout
      - run: mkdir bucket && echo "lorem ipsum" > bucket/build_asset.txt
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: 's3://my-s3-bucket-name'

... # workflows , other jobs etc.
```

### Executors

Executors define the environment in which commands are run. CircleCI provides multiple [execution platforms]({{site.baseurl}}/2.0/configuration-reference/#docker--machine--macos--windows-executor) including:
  - Docker
  - macOS
  - Windows
  - Machine (Linux VM)

In the [Node orb](https://circleci.com/orbs/registry/orb/circleci/node), for example, a parameterized Docker-based executor is provided, through which users can set the Docker tag. This provides a simple way to test applications against any version of Node.js when used with the Node orb's [test job](https://circleci.com/orbs/registry/orb/circleci/node#usage-run_matrix_testing).

```yaml
docker:
  - image: '<org>/<image>:<<parameters.tag>>'
parameters:
  tag:
    default: '13.11'
    type: string
```

For more information, see the guide to [Authoring Reusable Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) and the registry page for the [Node Orb](https://circleci.com/orbs/registry/orb/circleci/node#executors-default).

### Jobs
Jobs define a collection of [steps](https://circleci.com/docs/2.0/configuration-reference/#steps) to be run within a given executor. [Workflows]() are then used to orchestrate one or many jobs.

```yaml
version: 2.1

orbs:
  <orb>: <orb>/<namespace>@x.y #orb version

workflows:
  use-orb-job:
    jobs:
      - <orb>/<job-name>
```

See the [Authoring Reusable Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) guide for more information, and the [Using Node Test Job](https://circleci.com/orbs/registry/orb/circleci/node#usage-run_matrix_testing) example in the orb registry.

## Namespaces

A _namespace_ is a unique identifier claimed by a user or organization to group a set of orbs by author. Each user or organization can claim _one_ unique and immutable namespace. Each namespace can contain many uniquely named orbs.

For example, the `circleci/rails` orb may coexist in the registry with an orb called `<other-namespace>/rails` because they are in separate namespaces.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you need to change your namespace, please contact your account team at CircleCI.

By default, created namespaces appear as "community" namespaces in the [Orb Registry](https://circleci.com/orbs/registry/).

_[See: Orb-Intro](https://circleci.com/orbs/registry/orb/circleci/node#executors-default) for more information on types of namespaces._

## Semantic Versioning

Orbs utilize the [semver](https://semver.org/) release process, in which each orb update follows a standardized versioning pattern that users should take advantage of.

In Semantic versioning, release versions are represented by three integers separated by a `.`, where each integer represents a different type of change being added.

```
[Major].[Minor].[Patch]
```

| Semver  | Description |
| ------------- | ------------- |
| Major | Breaking changes.  |
| Minor  | Backwards compatible additional features.  |
| Patch  | Bug fixes |
{: class="table table-striped"}

When users import an orb, they may pin to a particular semver component.

| Imported Version  | Description |
| ------------- | ------------- |
| 1.2.3 | Will match full semver version. No changes will be introduced  |
| 1.2  | Locked to major version `1`, minor version `2`, will receive all patch updates.  |
| 1 | Locked to major version `1`. Will receive all minor and patch updates. Major version will not change automatically.|
| volatile | **Not Recommended** Will pull the last published version of the orb, may be useful in testing. Not a part of semver versioning.|
{: class="table table-striped"}

To avoid negatively impacting a user's CI process, all orb authors should strictly adhere to semver versioning to ensure no breaking changes are introduced at the `minor` or `patch` update levels.

**Note:** CircleCI does not currently support non-numeric semantic versioning elements. We suggest that you use either semver-style version strings in x.y.z format, or a development-style version string in dev:* format.


## Orb Versions (Development vs. Production vs Inline)

### Production Orbs

Production orbs are immutable and can be found on the [Orb Registry](https://circleci.com/orbs/registry/).

- Production orbs are immutable, they cannot be deleted or edited, and updates must be provided in a new semver release
- Version string must be in semver format, for example, `<namespace>/<orb>@1.2.3`
- Production orbs can only be published by an owner of the namespace organization
- Published to the Orb Registry
- Open source, released under [MIT license](https://circleci.com/orbs/registry/licensing)
- Available via CircleCI CLI

### Development Orbs

Development orbs are temporary overwrite-able orb tag versions, useful for rapid development and testing prior to deploying a semver deployed production change.

- Development orbs are mutable, can be overwritten, and automatically expire 90 days after they are published
- Version string must begin with `dev:` followed by any string, for example, `<namespace>/<orb>@dev:my-feature-branch`
- May be published by any member of the namespace organization
- Will not appear on the Orb Registry
- Open source, released under [MIT license](https://circleci.com/orbs/registry/licensing).
- Available via CircleCI CLI (if the development tag name is known)

### Inline Orbs

Inline orbs are defined directly within the user's config, are completely local and scoped to the individual project.
_[See: inline orbs](# Fix this later) for more information on types of namespaces._

- Not published to the orb service
- No versioning
- Exist only locally within the user's config
- Not accessible outside of the repository
- Not public
- Not accessible via CircleCI CLI

## Using Orbs Within Your Orb and Register-Time Resolution

An orbs stanza can be used inside an orb. Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb `foo/bar` is published at version 1.2.3 with an orbs stanza that imports `biz/baz@volatile`. At the time you register `foo/bar@1.2.3` the system will resolve `biz/baz@volatile` as the latest version and include its elements directly into the packaged version of `foo/bar@1.2.3`.

If `biz/baz` is updated to `3.0.0`, anyone using `foo/bar@1.2.3` will not see the change in `biz/baz@3.0.0` until `foo/bar` is published at a higher version than `1.2.3`.

**Note:** Orb elements may be composed directly with elements of other orbs. For example, you may have an orb that looks like the example below.

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

## See Also
{:.no_toc}

- Refer to [Orb Introduction]({{site.baseurl}}/2.0/orb-intro/) for a high-level overview of CircleCI orbs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for a detailed reference information about Orbs, including descriptions of commands, jobs and executors.
- Refer to [Orbs FAQs]({{site.baseurl}}/2.0/orbs-faq/) for information on frequent issues encountered when using orbs.
