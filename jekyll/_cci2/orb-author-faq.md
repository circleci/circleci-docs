---
layout: classic-docs
title: "Orb Author FAQ"
short-title: "Orb Author FAQ"
description: "Frequently asked questions from orb authors."
order: 20
version:
- Cloud
- Server v3.x
---

This document describes various questions and technical issues that you may find helpful when authoring orbs.

* TOC
{:toc}

## Errors claiming namespace or publishing orbs
{: #errors-claiming-namespace-or-publishing-orbs }

* Question: I receive an error when attempting to claim a namespace or publish a production orb.

* Answer: You may not be an organization owner/admin.

Organizations can only claim a single namespace. In order to claim a namespace for an organization the authenticating user must have owner/admin privileges within the organization.

If you do not have the required permission level you might see an error similar to below:

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

Read more in the [Orb CLI Permissions Matrix]({{site.baseurl}}/2.0/orb-author-intro/#permissions-matrix).

## Deleting Orbs
{: #deleting-orbs }

* Question: Is it possible to delete an orb I've created?

* Answer: No. Orbs are public by default and immutable, once a version of an orb is published it can not be changed. This is done so users can reasonably expect a known version of an orb will behave the same on every run. Deleting an orb could potentially lead to a failing pipeline in any of its user's projects.

Orbs can however be "Unlisted" from the [Orb Registry](https://circleci.com/developer/orbs). Unlisted orbs still exist and are discoverable via the API or CLI, but will not appear in the Orb Registry results. This may be desired if for instance, an orb is no longer maintained.

```
circleci orb unlist <namespace>/<orb> <true|false> [flags]
```

**Use caution when unlisting Private Orbs.**
<br/>
Currently the `orb source` CircleCI CLI command does not work for _any_ Private Orbs, regardless if they are listed or unlisted. So unless the Private Orb name is documented before it is unlisted, you will not be able to find the orb through the Orb Registry or the CircleCI CLI. If you believe this happened to you, please create a [Support Ticket](https://support.circleci.com/hc/en-us).
{: class="alert alert-warning"}

## Secure API tokens
{: #secure-api-tokens }

* Question: How do I protect a user's API tokens and other sensitive information?

* Answer: Use the `env_var_name` parameter type for the API key parameter. This parameter type will only accept valid POSIX environment variable name strings as input. In the parameter description, it is best practice to mention to the user to add this environment variable.

Read more:
* [Environment Variable Name]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/)

## Environment variables
{: #environment-variables }

* Question: How can I require a user to add an environment variable?

* Answer: Create a parameter for the environment variable name, even if it is a statically named environment variable the user _should not_ change. Then, assign it the correct default value. In the parameter description let the user know if this value should not be changed. Either way, consider instructing the user on how they can obtain their API key.

Consider validating required environment variables. See more in the [Orb Author Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/#commands) guide.

Read more:
* [Environment Variable Name parameter type]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/)

## Supported programming languages
{: #supported-programming-languages }

* Question: What language do I use to write an orb?

* Answer: Orbs are packages of [CircleCI YAML configuration]({{site.baseurl}}/2.0/configuration-reference/).

CircleCI orbs package [CircleCI reusable config]({{site.baseurl}}/2.0/reusing-config/), such as [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), which can execute within a given [executor]({{site.baseurl}}/2.0/executor-intro/) defined by either, the user if using a _command_ within a custom job, or by the orb author if using a [reusable job]({{site.baseurl}}/2.0/orb-concepts/#jobs). The environment within which your logic is running may influence your language decisions.

* Question: What programming languages can I write my Command logic in?

* Answer: POSIX compliant bash is the most portable and universal language. This is the recommended option when you intend to share your orb. Orbs do, however, come with the flexibility and freedom to run other programming languages or tools.

**Bash**

Bash is the preferred language as it is most commonly available among all available executors. Bash can (and should) be easily written directly using the native [run]({{site.baseurl}}/2.0/configuration-reference/#run) command. The default shell on MacOS and Linux will be bash.

**Interactive Interpreter (for example, Python)**

For some use-cases an orb might only exist in a particular environment. For instance, if your orb is for a popular Python utility it may be reasonable to require Python as a dependency of your orb. Consider utilizing the [run]({{site.baseurl}}/2.0/configuration-reference/#run) command with a modified shell parameter.

```yaml
steps:
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**Binary**

This option is strongly discouraged wherever possible. Sometimes it may be necessary to fetch a remote binary file such as a CLI tool. These binaries should be fetched from a package manager or hosted by a VCS such as GitHub releases wherever possible. For example, installing Homebrew as a part of the [AWS Serverless orb](https://circleci.com/developer/orbs/orb/circleci/aws-serverless#commands-install)

```yaml
steps:
  - run:
    command: >
      curl -fsSL
      "https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh" | bash
      /home/linuxbrew/.linuxbrew/bin/brew shellenv >> $BASH_ENV
    name: Install Homebrew (for Linux)
```

## Command vs Job
{: #command-vs-job }

* Question: Should I create a command or a job?

* Answer: The answer might be both, but it will heavily depend on the task you want to accomplish.

An orb [command]({{site.baseurl}}/2.0/orb-concepts/#commands) can be utilized by the user, or even the orb developer, to perform some action within a job. The command itself has no knowledge of the job it is within as the user could utilize it however they wish. A command may be useful, for example, to automatically install a CLI application or go a step further and install and authenticate.

A [job]({{site.baseurl}}/2.0/orb-concepts/#jobs) defines a collection of steps and commands within a specific execution environment. A job is highly opinionated as it generally chooses the execution platform to run on and what steps to run. Jobs may offer a useful way to automate tasks such as deployments. A deployment job may select a certain execution platform that is known, such as _python_, and automatically checkout the users code, install a CLI, and run a deployment command, all with little to no additional configuration required from the user.

Read more:
* [Introduction To CircleCI Config Language]({{site.baseurl}}/2.0/config-intro/)
* [Reusable Config Reference]({{site.baseurl}}/2.0/reusing-config/)


## See also
{: #see-also }
- Refer to [Orbs Best Practices]({{site.baseurl}}/2.0/orbs-best-practices) for suggestions on creating a production-ready orb.
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
