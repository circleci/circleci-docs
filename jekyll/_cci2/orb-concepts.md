---
layout: classic-docs
title: "Orbs Concepts"
short-title: "Orbs Concepts"
description: "Conceptual Overview for Orbs"
categories: [getting-started]
order: 1
verison:
- Cloud
---

* TOC
{:toc}

## Quick Start
{:.no_toc}

[CircleCI orbs](https://circleci.com/orbs/) are shareable packages of configuration elements, including [jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors). Orbs make writing and customizing CircleCI config simple. The reusable configuration elements used in orbs are explained fully in the [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/).

## Orb Configuration Elements

CircleCI's [Reusable Configuration]({{site.baseurl}}/2.0/reusing-config/) features allow you to define parameterizable configuration elements and re-use those elements throughout a project config file. It is recommended you become familiar with the full [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/) features before moving on to the [Reusable Configuration Reference]({{site.baseurl}}/2.0/reusing-config/).

### Commands

Commands contain one or more steps in which [parameters]({{site.baseurl}}/2.0/reusing-config/#using-the-parameters-declaration) can be used to modify behavior. Commands are the logic of orbs and are responsible for executing steps such as [checking out code](https://circleci.com/docs/2.0/configuration-reference/#checkout), or running shell code, for example, running BASH or CLI tools. For more information see the [Authoring Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) guide.

As an example, the AWS S3 orb includes a _command_ to copy a file or object to a new location: `aws-s3/copy`. If your AWS authentication details are stored as environment variables, the syntax to use this command in your config is simply:

#### Usage Example
{:.no_toc}

```yaml
version: 2.1

orbs:
  aws-s3: circleci/aws-s3@x.y.z

jobs:
  build:
    docker:
      - image: 'cimg/python:3.6'
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir bucket && echo "lorem ipsum" > bucket/build_asset.txt
      # using the aws-s3 orb's "copy" command.
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: 's3://my-s3-bucket-name'

  #... workflows , other jobs etc.
```

See the [AWS-S3 Orb](https://circleci.com/orbs/registry/orb/circleci/aws-s3#commands) page in the registry for more information.

### Executors

Executors are parameterized execution environments in which [jobs]({{site.baseurl}}/2.0/orb-concepts/#jobs) can be run. CircleCI provides multiple [executor options]({{site.baseurl}}/2.0/configuration-reference/#docker--machine--macos--windows-executor):

- Docker
- macOS
- Windows
- Machine (Linux VM)

Executors defined within orbs can be used to run jobs within your project configuration, or within the jobs defined in the orb.

#### Executor Definition Example
{:.no_toc}

{:.tab.executor.Node-Docker}
```yaml
description: >
  Select the version of NodeJS to use. Uses CircleCI's highly cached convenience
  images built for CI.
docker:
  - image: 'cimg/node:<<parameters.tag>>'
    auth:
      username: mydockerhub-user
      password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
parameters:
  tag:
    default: '13.11'
    description: >
      Pick a specific cimg/node image version tag:
      https://hub.docker.com/r/cimg/node
    type: string
```

{:.tab.executor.Ruby-Docker}
{% raw %}
```yaml
description: >
  Select the version of Ruby to use. Uses CircleCI's highly cached convenience
  images built for CI.

  Any available tag from this list can be used:
  https://hub.docker.com/r/cimg/ruby/tags
docker:
  - image: 'cimg/ruby:<< parameters.tag >>'
    auth:
      username: mydockerhub-user
      password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
parameters:
  tag:
    default: '2.7'
    description: The `circleci/ruby` Docker image version tag.
    type: string
```
{% endraw %}

In the [Node orb](https://circleci.com/orbs/registry/orb/circleci/node), for example, a parameterized Docker-based executor is provided, through which you can set the Docker tag. This provides a simple way to test applications against any version of Node.js when used with the Node orb's [test job](https://circleci.com/orbs/registry/orb/circleci/node#usage-run_matrix_testing).

For more information, see the guide to [Authoring Reusable Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) and the registry page for the [Node Orb](https://circleci.com/orbs/registry/orb/circleci/node#executors-default).

### Jobs

Jobs define a collection of
[steps](https://circleci.com/docs/2.0/configuration-reference/#steps) to be run
within a given [executor]({{site.baseurl}}/2.0/orb-concepts/#executors), and are
orchestrated using [Workflows]({{site.baseurl}}/2.0/workflows/). Jobs
will also individually return their status via [GitHub
Checks](https://circleci.com/docs/2.0/enable-checks/).

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

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you need to change your namespace, please contact support.

By default, created namespaces appear as "community" namespaces in the [Orb Registry](https://circleci.com/orbs/registry/).


## Semantic Versioning

Orbs utilize the [semver](https://semver.org/) release process, in which each orb update follows a standardized versioning pattern that orb authors and users should take advantage of.

In Semantic versioning, release versions are represented by three integers separated by a `.`, where each integer represents a different type of change being added.

```
[Major].[Minor].[Patch]
```

| Semver  | Description |
| ------------- | ------------- |
| Major | Breaking changes.  |
| Minor  | Backwards compatible additional features.  |
| Patch  | Bug fixes. |
{: class="table table-striped"}

When you import an orb, you can pin it to a particular semver component.

| Imported Version  | Description |
| ------------- | ------------- |
| 1.2.3 | Will match full semver version. No changes will be introduced.  |
| 1.2  | Locked to major version `1`, minor version `2`, will receive all patch updates.  |
| 1 | Locked to major version `1`. Will receive all minor and patch updates. Major version will not change automatically.|
| volatile | **Not Recommended** Will pull the last published version of the orb, may be useful in testing. Not a part of semver versioning.|
{: class="table table-striped"}

To avoid negatively impacting a user's CI process, orb authors should strictly adhere to semver versioning to ensure no breaking changes are introduced at the `minor` or `patch` update levels.

**Note:** CircleCI does not currently support non-numeric semantic versioning elements. We suggest that you use either semver-style version strings in x.y.z format, or a development-style version string in dev:* format.
{: class="alert alert-warning"}



## Orb Versions (Development vs. Production vs Inline)

### Production Orbs
{:.no_toc}

Production orbs are immutable and can be found on the [Orb Registry](https://circleci.com/orbs/registry/).

- Production orbs are immutable, they cannot be deleted or edited, and updates must be provided in a new semver release
- Version string must be in semver format, for example, `<namespace>/<orb>@1.2.3`
- Production orbs can only be published by an owner of the namespace organization
- Published to the Orb Registry
- Open source, released under [MIT license](https://circleci.com/orbs/registry/licensing)
- Available via CircleCI CLI

### Development Orbs
{:.no_toc}

Development orbs are temporary overwrite-able orb tag versions, useful for rapid development and testing prior to deploying a semver deployed production change.

- Development orbs are mutable, can be overwritten, and automatically expire 90 days after they are published
- Version string must begin with `dev:` followed by any string, for example, `<namespace>/<orb>@dev:my-feature-branch`
- Development orbs may be published by any member of the namespace organization
- Will not appear on the Orb Registry
- Open source, released under [MIT license](https://circleci.com/orbs/registry/licensing).
- Available via CircleCI CLI (if the development tag name is known)

### Inline Orbs
{:.no_toc}

Inline orbs are defined directly within the user's config, are completely local and scoped to the individual project.
_[See: inline orbs]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs) for more information on types of namespaces._

- Not published to the orb service
- No versioning
- Exist only locally within the user's config
- Not accessible outside of the repository
- Not public
- Not accessible via CircleCI CLI

## Using Orbs Within Your Orb and Register-Time Resolution

An orbs stanza can be used inside an orb. Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb `foo/bar` is published at version 1.2.3 with an orbs stanza that imports `biz/baz@volatile`. At the time you register `foo/bar@1.2.3` the system will resolve `biz/baz@volatile` as the latest version and include its elements directly into the packaged version of `foo/bar@1.2.3`.

If `biz/baz` is updated to `3.0.0`, anyone using `foo/bar@1.2.3` will not see the change from `biz/baz@3.0.0` until `foo/bar` is published at a higher version than `1.2.3`.

Orb elements may be composed directly with elements of other orbs. For example, you may have an orb that looks like the example below.


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
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for detailed reference information about Orbs, including descriptions of commands, jobs and executors.
- Refer to [Orbs FAQs]({{site.baseurl}}/2.0/orbs-faq/) for information on frequent issues encountered when using orbs.
