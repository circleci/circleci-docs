---
layout: classic-docs
title: "Orbs Concepts"
short-title: "Orbs Concepts"
description: "Conceptual Overview for Orbs"
categories: [getting-started]
order: 1
---

[CircleCI orbs](https://circleci.com/orbs/) are shareable packages of configuration elements, including jobs, commands, and executors. Orbs make writing and customizing CircleCI config simple.

Ensure you have first read the [orb introduction]({{site.baseurl}}/2.0/reusing-config/).


## Reusable Configuration

[Reusable Configuration]({{site.baseurl}}/2.0/reusing-config/) on CircleCI allows you to define parametrizable CircleCI configuration elements and re-use those elements. It is recommended to become familiar with our full [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/#section=configuration) before moving on to the [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/).

### Commands
Commands contain one or more [steps]() which can use [parameters]() to modify behavior. Commands are the logic of our orbs and are responsible for executing steps such as [checking out code](https://circleci.com/docs/2.0/configuration-reference/#checkout), or running shell code such as running BASH or running CLI tools.

_[See: Authoring Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)._

### Executors

Executors define the environment in which commands are run. CircleCI provides multiple [execution platforms](https://circleci.com/docs/2.0/configuration-reference/#docker--machine--macos--windows-executor) including:
  - Docker
  - macOS
  - Windows
  - Machine (Linux VM)

In our [Node orb](https://circleci.com/orbs/registry/orb/circleci/node) for example, we provide users with a parameterized Docker based executor where the user may set the Docker tag. This allows the user to easily test their application against many version of Node.js when utilized by the Node orb's _[test job](https://circleci.com/orbs/registry/orb/circleci/node#usage-run_matrix_testing)_.

```yaml
docker:
  - image: '<org>/<image>:<<parameters.tag>>'
parameters:
  tag:
    default: '13.11'
    type: string
```

_[See: Authoring Reusable Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors)._
_[See Example: Node Orb Executor](https://circleci.com/orbs/registry/orb/circleci/node#executors-default)._


### Jobs
Jobs are a definition of a collection of [steps](https://circleci.com/docs/2.0/configuration-reference/#steps) to be run within a given executor. Users ultimately compose [Workflows]() which are comprised of one or many jobs.


_[See: Authoring Reusable Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)._
_[See Example: Using Node Test Job](https://circleci.com/orbs/registry/orb/circleci/node#usage-run_matrix_testing)._

## Namespaces

A _namespace_ is a unique identifier claimed by a user or organization to group a set of orbs by author. Each user and organization may claim _one_ unique and immutable namespace name. Each namespace my contain main uniquely named orbs.

For example, the `circleci/rails` orb may coexist in the registry with an orb called `<username>/rails` because they are in separate namespaces.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you are in need of changing your namespace, please contact your account team at CircleCI.

By default, any created namespaces will appear as a "community" namespace on the [Orb Registry](https://circleci.com/orbs/registry/).

_[See: Orb-Intro](https://circleci.com/orbs/registry/orb/circleci/node#executors-default) for more information on types of namespaces._

## Semantic Versioning

Orbs utilize the [semver](https://semver.org/) release process, in which each orb update follows a standardized versioning pattern that users should take advantage of.

In Semantic versioning, release versions are represented by three integers separated by a `.`, where each integer represents a different type of change being added.

`[Major].[Minor].[Patch]`

| Semver  | Description |
| ------------- | ------------- |
| Major | Breaking changes.  |
| Minor  | Backwards compatible additional features.  |
| Patch  | Bug fixes |

When users import an orb, they may pin to a particular semver component.

| Imported Version  | Description |
| ------------- | ------------- |
| 1.2.3 | Will match full semver version. No changes will be introduced  |
| 1.2  | Locked to major version `1`, minor version `2`, will receive all patch updates.  |
| 1 | Locked to major version `1`. Will receive all minor and patch updates. Major version will not change automatically.|
| volatile | **Not Recommended** Will pull the last published version of the orb, may be useful in testing. Not a part of semver versioning.|

To avoid negatively impacting a user's CI process, all orb authors should strictly adhere to semver versioning to ensure no breaking changes are introduced at the `minor` or `patch` update levels.


**Note:** CircleCI does not currently support non-numeric semantic versioning elements. We suggest that you use either semver-style version strings in x.y.z format, or a development-style version string in dev:* format.


## Orb Versions (Development vs. Production)

### Production Orbs

  - Production orbs are immutable. They can not be deleted or edited. Updates must be provided in a new semver release.
  - Version string must be in semver format. `<namespace>/<orb>@1.2.3`
  - Production orbs may only be published by an owner of the namespace organization.
  - Published to the Orb Registry

### Development Orbs

 - Development orbs automatically expire 90 days after they are published. Mutable and can be overwritten.
 - Version string must begin with `dev:` followed by any string. `<namespace>/<orb>@dev:my-feature-branch`
 - May be published by any member of the namespace organization.
 - Will not appear on the Orb Registry


## Using Orbs Within Your Orb and Register-Time Resolution

You may also use an orbs stanza inside an orb.

Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

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
