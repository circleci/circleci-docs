---
layout: classic-docs
title: "Creating Orbs"
short-title: "Creating Orbs"
description: "Starting point for Creating CircleCI Orbs"
categories: [getting-started]
order: 1
---

Orbs are reusable packages of CircleCI configuration that you may share across projects, enabling you to create encapsulated, parameterized commands, jobs, and executors that can be used across multiple projects.

This section describes how you can:

* Use an existing orb in your configuration
* Import an orb
* Create an inline orb in your `config.yml` file
* Create and publish an orb in the registry

Orbs are made available for use in a configuration through the orbs key in the top level of your config.yml.

## Using Existing Orbs

CircleCI has made available a number of certified and 3rd party orbs that you may use in your configuration to reduce the time needed to get up and running using orbs in your configuration. By using CircleCI certified orbs, or 3rd-party orbs developed by CircleCI partners, you can be confident that these orbs have been developed and tested to ensure they work with the CircleCI platform.

### Certified orbs vs. 3rd party Orbs

Certified orbs are those that CircleCI has built or has reviewed and approved as part of the features of the CircleCI platform. Any project may use certified orbs in configuration version 2.1 and higher.

3rd party orbs are those published by our customers and other members of our community. For you to publish orbs or for your projects to use 3rd party orbs, your organization must opt-in under SECURITY within the Organization Settings page under the section "Orb Security Settings" where an organization administrator must agree to the terms for using 3rd-party software.

<aside class="notice">
This setting can only be toggled by organization administrators.
</aside>

### Orb reference format

Orb references have the following format shown below:

```
[namespace]/[orb]@[version]
```

### Semantic Versioning in Orbs

Orbs are published with the standard 3-number semantic versioning system:

* major
* minor
* patch

Orb authors need to adhere to semantic versioning. Within ```config.yml```, you may specify wildcard version ranges to resolve orbs. You may also use the special string ```volatile``` to pull in whatever the highest version number is at time your build runs.

For example:

* when ```mynamespace/some-orb@8.2.0``` exists, and ```mynamespace/some-orb@8.1.24``` and ```mynamespace/some-orb@8.0.56``` are published after 8.2.0, ```volatile``` will still refer to ```mynamespace/some-orb@8.2.0``` as the highest semantic version.

Examples of orb version declarations and their meaning:

1. ```circleci/python@volatile``` - use the latest version of the Python orb in the registry at the time a build is triggered.
2. ```circleci/python@2``` - use the latest version of version 2.x.y of the Python orb.
3. ```circleci/python@2.4``` - use the latest version of version 2.4.x of the Python orb.
4. ```circleci/python@3.1.4``` - use exactly version 3.1.4 of the Python orb.

#### Using Development Versions

While all production orbs must be published securely by organization administrators, development orbs provide non-administrator members of the team with a way to publish orbs. Unlike production orbs, `dev` orbs are also mutable, so they are ideal for rapid iteration of an idea.

A development version must be referenced by its complete, fully-qualified name, such as: ```mynamespace/myorb@dev:mybranch.```; whereas production orbs allow wildcard semantic version references. Note that there are no shorthand conveniences for development versions.

<aside class="notice">
Dev versions are mutable and expire: their contents can change, and they are subject to deletion after 90 days; therefore, it is strongly recommended you do not rely on a development versions in any production software, and use them only while actively developing your orb. It is possible for admin members of a team to publish a semantic version of an orb based off of a dev orb instead of copy-pasting some config from another teammate.
</aside>

## Importing an Orb

Importing a set of existing orbs is a simple process that only requires you to provide the following instruction in your configuration. In the example below, you can see how to import a CircleCI Slack and Heroku orb:

```orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@volatile
```

### Designing Orbs

When designing your own orbs, make sure your orbs meet the following requirements:

* Orbs should always use 'description'. - Be sure to explain usage, assumptions, and any tricks in the ```description``` key under jobs, commands, executors, and parameters.
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

<aside class="notice">
In the example above, note that the contents of ```my-orb``` are resolved as an inline orb because the contents of ```my-orb``` are a map; whereas the contents of ```codecov``` are a scalar value, and thus assumed to be an orb URI.
</aside>

### Example Template

When you want to author an orb, you may wish to use this example template to quickly and easily create a new orb with all of the required components. This example includes each of the three top-level concepts of orbs. While any orb can be equally expressed as an inline orb definition, it will generally be simpler to iterate on an inline orb and use ```circleci config process .circleci/config.yml``` to check whether your orb usage matches your expectation.
```
version: 2.1
orbs:
  inline_example:
    jobs:
      my_inline_job:
        parameters:
          greeting_name:
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
          name: build
      - inline_example/my_inline_job:
          name: build2
          greeting_name: world
```

## Publishing an Orb

This section covers the tooling and flow of authoring and publishing your own orbs to the orb registry.

Orbs may be authored inline in your config.yml file or authored separately and then published to to the orb registry for reuse across projects.

[WARNING] Orbs are always world-readable. All published orbs (production and development) can be read and used by anyone. They are not limited to just the members of your organization. In general, CircleCI strongly recommends that you do not put secrets or other sensitive variables into your configuration. Instead, use contexts or project environment variables and reference the names of those environment variables in your orbs.

### Prerequisites

Before publishing an orb, you will need to first opt-in to the new 3rd-Party Software terms and turn on orb publishing for your organization.

<aside class="notice">
Only an organization administrator can opt-in to the 3rd-party Software terms. The organization admin will need to navigate to the organization Settings tab and complete the form on the Security page.
</aside>

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

#### Development vs. Production Orbs

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

#### Using Orbs in Orbs and Register-Time Resolution

You may use an ```orbs``` stanza inside an orb. 

<aside class="notice">
Because production orb releases are immutable, the system will resolve all orb dependencies at the time you register your orb rather than at the time you run your build.

For example, orb ```foo/bar``` is published at version ```1.2.3``` with an ```orbs``` stanza that imports ```biz/baz@volatile```. At the time you register ```foo/bar@1.2.3``` the system will resolve ```biz/baz@volatile``` as the latest version and include its elements directly into the packaged version of ```foo/bar@1.2.3```.

If ```biz/baz``` is updated to ```3.0.0```, anyone using ```foo/bar@1.2.3``` will not see the change in ```biz/baz@3.0.0``` until ```foo/bar``` is published at a higher version than `1.2.3`.
</aside>

#### Deleting Production Orbs

In general, CircleCI prefers to never delete production orbs that were published as world-readable because it harms the reliability of the orb registry as a source of configuration and the trust of all orb users.

If the case arises where you need to delete an orb for emergency reasons, please contact CircleCI (**Note:** If you are deleting because of a security concern, you must practice responsible disclosure: https://circleci.com/security/).

#### Using the CLI to Create and Publish Orbs

The ```circleci``` CLI has several handy commands for managing your orb publishing pipeline. The simplest way to learn the CLI is to install it and run ```circleci help```. Listed below are some of the most pertinent commands for publishing orbs:

* ```circleci namespace create <name> <vcs-type> <org-name> [flags]```

* ```circleci orb create <namespace>/<orb> [flags]```

* ```circleci orb validate <path> [flags]```

* ```circleci orb publish <path> <namespace>/<orb>@<version> [flags]```

* ```circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]```

* ```circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]```

For a full list of help commands inside the CLI, visit https://circleci-public.github.io/circleci-cli/circleci_orb.html [update link when the link to the docs site is active]

### Orb Publishing Workflow

To publish an orb, follow the steps listed below as an org Admin.

1. Claim a namespace (assuming you don't yet have one), e.g.;

`circleci namespace create sandbox github CircleCI-Public`

2. Create the orb inside your namespace, e.g.:

`circleci orb create sandbox/hello-world`

3. Create the content of your orb in a file. You will generally perform this action in your code editor in a git repo made for your orb. For example, let's assume a file in /tmp/orb.yml could be made with a simple orb similar to:

`echo '{version: "2.1", description: "a sample orb"}' > /tmp/orb.yml`

4. Validate that your code is a valid orb using the CLI. For example, using the path above you could use:

`circleci orb validate /tmp/orb.yml`

5. Publish a development version of your orb, e.g.:

`circleci orb publish /tmp/orb.yml sandbox/hello-world@dev:first`

6. Once you are ready to push your orb to production, you can publish it manually using ```circleci orb publish``` command or promote it directly from the development version. To increment the new dev version to become 0.0.1, use the following command:

`circleci orb publish promote sandbox/hello-world@dev:first patch`

7. Your orb is now published in an immutable form as a production version and can be used safely in builds. You can view the source of your orb by using:

`circleci orb source sandbox/hello-world@0.0.1`
