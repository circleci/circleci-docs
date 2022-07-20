---
layout: classic-docs
title: "Orbs Concepts"
short-title: "Orbs Concepts"
description: "Conceptual Overview for Orbs"
categories: [getting-started]
redirect_from: /using-orbs/
verison:
- Cloud
- Server v3.x
---

* TOC
{:toc}

[CircleCI orbs](https://circleci.com/orbs/) are shareable packages of configuration elements, including [jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/reusing-config/#authoring-reusable-executors). Orbs make writing and customizing CircleCI config simple. The reusable configuration elements used in orbs are explained fully in the [Reusable Configuration Reference]({{site.baseurl}}/reusing-config/).

## Orb configuration elements
{: #orb-configuration-elements }

CircleCI's [Reusable Configuration]({{site.baseurl}}/reusing-config/) features allow you to define parameterizable configuration elements and re-use those elements throughout a project config file. It is recommended you become familiar with the full [Configuration Reference]({{site.baseurl}}/configuration-reference/) features before moving on to the [Reusable Configuration Reference]({{site.baseurl}}/reusing-config/).

### Commands
{: #commands }

Commands contain one or more steps in which [parameters]({{site.baseurl}}/reusing-config/#using-the-parameters-declaration) can be used to modify behavior. Commands are the logic of orbs and are responsible for executing steps such as [checking out code]({{site.baseurl}}/configuration-reference/#checkout), or running shell code, for example, running bash or CLI tools. For more information see the [Authoring Reusable Commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands) guide.

As an example, the AWS S3 orb includes a _command_ to copy a file or object to a new location: `aws-s3/copy`. If your AWS authentication details are stored as environment variables, the syntax to use this command in your config is simply:

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

See the [AWS-S3 Orb](https://circleci.com/developer/orbs/orb/circleci/aws-s3#commands) page in the registry for more information.

### Executors
{: #executors }

Executors are parameterized execution environments in which [jobs]({{site.baseurl}}/orb-concepts/#jobs) can be run. CircleCI provides multiple [executor options]({{site.baseurl}}/configuration-reference/#docker--machine--macos--windows-executor):

- Docker
- macOS
- Windows
- Machine (Linux VM)

Executors defined within orbs can be used to run jobs within your project configuration, or within the jobs defined in the orb.

#### Executor definition example
{: #executor-definition-example }
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

In the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node), for example, a parameterized Docker-based executor is provided, through which you can set the Docker tag. This provides a simple way to test applications against any version of Node.js when used with the Node orb's [test job](https://circleci.com/developer/orbs/orb/circleci/node#usage-run_matrix_testing).

For more information, see the guide to [Authoring Reusable Executors]({{site.baseurl}}/reusing-config/#authoring-reusable-executors) and the registry page for the [Node Orb](https://circleci.com/developer/orbs/orb/circleci/node#executors-default).

### Jobs
{: #jobs }

[Jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs) define a collection of [steps]({{site.baseurl}}/configuration-reference/#steps) to be run within a given [executor]({{site.baseurl}}/orb-concepts/#executors), and are orchestrated using [Workflows]({{site.baseurl}}/workflows/). Jobs will also individually return their status via [GitHub Checks]({{site.baseurl}}/enable-checks/).

When importing an orb which has jobs, you can reference them directly from your workflows.

```yml
version: 2.1

orbs:
  <orb>: <namespace>/<orb>@x.y #orb version

workflows:
  use-orb-job:
    jobs:
      - <orb>/<job-name>
```

See the [Authoring Reusable Jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs) guide for more information, and the [Using Node Test Job](https://circleci.com/developer/orbs/orb/circleci/node#usage-run_matrix_testing) example in the orb registry.

### Usage examples
{: #usage-examples }

Using the [Orb Development Kit]({{site.baseurl}}/orb-author/#orb-development-kit), adding a new usage example is as simple as creating a new file `name-of-example.yml` within the orb project's [src/examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples) directory. Usage examples are not for use in project configuration directly, but are a type of orb metadata to share how a user could best make use of the orb in their configuration. These examples are displayed, for reference purposes, in the [Orb Registry](https://circleci.com/developer/orbs). Below is a sample usage example:

```yaml
# Source https://github.com/circleci-public/Orb-Template/blob/main/src/examples/example.yml

description: >
  Sample example description.
usage:
  version: 2.1
  orbs:
    <orb-name>: <namespace>/<orb-name>@1.2.3
  workflows:
    use-my-orb:
      jobs:
        - <orb-name>/<job-name>

```

## Namespaces
{: #namespaces }

A _namespace_ is a unique identifier claimed by a user or organization to group a set of orbs by author. Each user or organization can claim _one_ unique and immutable namespace. Each namespace can contain many uniquely named orbs.

For example, the `circleci/rails` orb may coexist in the registry with an orb called `<other-namespace>/rails` because they are in separate namespaces.

Organizations are, by default, limited to claiming only one namespace. This policy is designed to limit name-squatting and namespace noise. If you need to change your namespace, please contact support.

By default, created namespaces appear as "community" namespaces in the [Orb Registry](https://circleci.com/developer/orbs).


## Semantic versioning
{: #semantic-versioning }

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

## Orb versions (development vs production vs inline)
{: #orb-versions-development-vs-production-vs-inline }

### Production orbs
{: #production-orbs }
{:.no_toc}

Production orbs are immutable and can be found on the [Orb Registry](https://circleci.com/developer/orbs).

- Production orbs are immutable, they cannot be deleted or edited, and updates must be provided in a new semver release
- Version string must be in semver format, for example, `<namespace>/<orb>@1.2.3`
- Production orbs can only be published by an owner of the namespace organization
- Published to the Orb Registry
- Open source, released under [MIT license](https://circleci.com/developer/orbs/licensing)
- Available via CircleCI CLI

### Development orbs
{: #development-orbs }
{:.no_toc}

Development orbs are temporary overwrite-able orb tag versions, useful for rapid development and testing prior to deploying a semver deployed production change.

- Development orbs are mutable, can be overwritten, and automatically expire 90 days after they are published
- Version string must begin with `dev:` followed by any string, for example, `<namespace>/<orb>@dev:my-feature-branch`
- Development orbs may be published by any member of the namespace organization
- Will not appear on the Orb Registry
- Open source, released under [MIT license](https://circleci.com/developer/orbs/licensing).
- Available via CircleCI CLI (if the development tag name is known)

### Inline orbs
{: #inline-orbs }
{:.no_toc}

Inline orbs are defined directly within the user's config, are completely local and scoped to the individual project.

_[See: Writing Inline Orbs]({{site.baseurl}}/reusing-config/#writing-inline-orbs) for more information on inline orbs._

- Not published to the orb service
- No versioning
- Exist only locally within the user's config
- Not accessible outside of the repository
- Not public
- Not accessible via CircleCI CLI

## Private orbs vs. public orbs
{: #private-orbs-vs-public-orbs }

There are two ways to publish an orb: public or private:

* If you prefer to publish your orb so that only those within your organization can see and use it, you should publish a private orb.
* If you want to publish your orb to the [CircleCI Orb Registry](https://circleci.com/developer/orbs) for use by anyone, create a public orb.

Private orbs are described in more detail below.

### Private orbs
{: #private-orbs }

An unlimited amount of private orbs are available on all of CircleCI’s [plans](https://circleci.com/pricing). Using a private orb enables you to author an orb while ensuring the following:

* Your orb will not appear in the [CircleCI Orb Registry](https://circleci.com/developer/orbs) unless you have the direct URL and are authenticated with the org that created it.

* Your orb cannot be viewed or used by someone outside of your organization.

* Your orb cannot be used in a pipeline that does not belong to your organization.

By choosing to use a private orb instead of a public orb, you also need to understand certain inherent limitations, which include:

* You will be unable to use the `circleci config validate` command to validate your configuration. You may, however, use one of the following options:

    * Paste the content of the orb into the `orbs` stanza of your configuration.
    * Use the `circleci config validate --org-id <your-org-id> <path/to/config.yml>` command to validate your configuration.

* You cannot use private orbs from one organization in another organization's pipelines, regardless of the relationship between organizations. This means that even if you commit code and start a pipeline, and have the necessary membership in both organizations, you can use a private orb from your configuration file, but not from another orb.

### Authoring orbs
{: #authoring-orbs }

Both public and private orbs can be authored in two ways:

* Using the [Manual Orb Authoring Process]({{site.baseurl}}/orb-author-validate-publish/)
* Using the [Orb Development Kit]({{site.baseurl}}/orb-author/#orb-development-kit)  (recommended)

## Orb packing
{: #orb-packing }

All CircleCI orbs are singular YAML files, typically named `orb.yml`. However, for development, it is often easier to break the code up into more manageable chunks. The `circleci orb pack` command, a component of the [Orb Development Kit]({{site.baseurl}}/orb-author/#orb-development-kit), is used to "pack" or condense the separate YAML files together.

If you are using the Orb Development Kit, orb packing is handled automatically, by the included CI/CD pipeline, with the [orb-tools/pack](https://circleci.com/developer/orbs/orb/circleci/orb-tools#jobs-pack) job.
{: class="alert alert-warning"}

**_Example: Orb Project Structure_**

| type | name|
| --- | --- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [commands](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/commands) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i>| [@orb.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/%40orb.yml) |
{: class="table table-striped"}

In order to _pack_ an orb, an [@orb.yml]({{site.baseurl}}/orb-author/#orbyml) file must be present. The `@` signifies the _root_ of our orb project. Within the same directory, you can include additional directories for each orb component's type, such as [commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands), [jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs), [executors]({{site.baseurl}}/reusing-config/#authoring-reusable-executors), and [examples]({{site.baseurl}}/orb-concepts/#usage-examples). Any additional files or folders will be safely ignored.

Additionally, the _pack_ command provides a special pre-processor for orb developers that allows you to import code from external files using the [file include syntax]({{site.baseurl}}/orb-concepts/#file-include-syntax) (`<<include(file)>>`).

**CLI command**

`circleci orb pack <dir> > orb.yml`

For Orb Development Kit users, this step is handled automatically.

## File include syntax
{: #file-include-syntax }

The `file include` syntax (`<<include(dir/file)>>`) is a special config enhancement that allows you to import the contents of a file in place as the value for any key within a CircleCI orb configuration file. The `<<include(dir/file)>>` syntax is a special key for use with the [`circleci orb pack` command](#orb-packing) and _will not_ work more widely on CircleCI.

When `circleci orb pack <dir> > orb.yml` is run against a directory containing an `@orb.yml` file, the pack command begins to combine the contents of the files into a single `orb.yml` file. During the packing process, each instance of the `<<include(dir/file)>>` value will be replaced by the contents of the file referenced within.

Included files are always referenced from the relative location of the `@orb.yml` file.
{: class="alert alert-warning"}

{:.tab.fileInclude.Command-yaml}
```yaml
description: A simple command that imports from a file when packed.
steps:
  - run:
      name: Hello Greeting
      command: <<include(scripts/file.sh)>>
```

{:.tab.fileInclude.file-sh}
```shell
# This is a bash file, but could really be any text-based file
echo "Hello World"

```

{:.tab.fileInclude.Packed_Command-yaml}
```yaml
description: A simple command that imports from a file when packed.
steps:
  - run:
      name: Hello Greeting
      command: |
        # This is a bash file, but could really be any text-based file
        echo "Hello World"
```

File inclusion is especially useful for separating your configuration's bash logic from your yaml. Including bash scripts will allow you to develop and test your bash outside of your orb.

View more about including bash scripts in the [Orb Author]({{site.baseurl}}/orb-author/#scripts) guide.

## Using orbs within your orb and register-time resolution
{: #-within-your-orb-and-register-time-resolution }

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

## See also
{: #see-also }
{:.no_toc}

- Refer to [Orb Introduction]({{site.baseurl}}/orb-intro/) for a high-level overview of CircleCI orbs.
- Refer to [Orbs Reference]({{site.baseurl}}/reusing-config/) for detailed reference information about Orbs, including descriptions of commands, jobs and executors.
- Refer to [Orbs FAQs]({{site.baseurl}}/orbs-faq/) for information on frequent issues encountered when using orbs.
