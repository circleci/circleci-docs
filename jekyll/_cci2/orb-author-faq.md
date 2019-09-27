---
layout: classic-docs
title: "Orb Author FAQ"
short-title: "Orb Author FAQ"
description: "Frequently asked questions from orb authors."
categories: [configuring-jobs]
order: 20
---

This document describes various questions and technical issues that you may find helpful when authoring orbs.

* TOC
{:toc}



## Errors Claiming Namespace Or Publishing Orbs

* Question: I recieve an error when attempting to claim a namespace or publish a production orb.

* Answer: You may not be an organization owner/admin.

Organizations may only claim a single namespace. In order to claim a namespace for an organization the authenticating user must possess owner/admin privledges over the organization. 

If you do not have the proper permissions you may see an error similar to below:

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

Read more in our [Orbs Quickstart]({{site.baseurl}}/2.0/orb-author/#orbs-quickstart).


## Secure API Tokens

* Question: How do I protect user's API tokens from being commited to their config?

* Answer: Utilize the "env_var_name" parameter type for the API key parameter. This parameter type will only accept POSIX valid environment variable name strings as valid. In the parameter description it is best to mention to the user to add this environment variable. 

Read more:
* [Environment Variable Name]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/)

## Environment Variables

* Question: How can I require a user to add an environment variable?
* Answer: Create a parameter for the environment variable name, even if it is a statically named environment variable the user _should not_ change, and assign it the correct default value. In the parameter description let the user know if this value should not be changed. In either event instruct the user where they can obtain their API key. 

Read more:
* [Environment Variable Name]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/)

## Supported Programming Languages

* Question: What programming language can I write my orb in?
* Answer: Orbs are packages of [CircleCI YAML config]({{site.baseurl}}/2.0/configuration-reference/) language. CircleCI config may contain commands that are issued against a given [Executor]({{site.baseurl}}/2.0/executor-intro/).

CircleCI orbs package [CircleCI reusable config]({{site.baseurl}}/2.0/reusing-config/), such as [Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), which can execute within a given [Executor]({{site.baseurl}}/2.0/executor-intro/) defined by either the user if using a command within a custom job, or by the orb author if using a [Reusable Job]({{site.baseurl}}/2.0/orb-author-intro/#jobs). The environment within which your logic is running may influence your language descisions.

**Bash**

Bash is the preferred language as it is most commonly available among all available executors. Bash can be (and should) easily written directly using the native [run]({{site.baseurl}}/2.0/configuration-reference/#run) command. The default shell MacOS and Linux will be Bash.

**Interactive Interpreter (Ex: Python)**

In some use-cases an Orb may only exist in a particular environment. For instance, if your orb is for a popular Python utility it may be reasonable to require Python as a dependancy of your orb. We can utilize the [run]({{site.baseurl}}/2.0/configuration-reference/#run) command with a modified shell parameter.

```yaml
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**Binary**

This option is strongly discouraged when possible. Sometimes it may be necessary to fetch a remote binary file such as a CLI tool. These binaries should be fetched from a package manager or hosted by a VCS such as GitHub releases when possible. 

Ex: Installing Homebrew as a part of the [AWS Serverless orb](https://circleci.com/orbs/registry/orb/circleci/aws-serverless#commands-install)

```yaml
 - run:
      command: >
        curl -fsSL
        "https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh"
        | bash
        /home/linuxbrew/.linuxbrew/bin/brew shellenv >> $BASH_ENV
      name: Install Homebrew (for Linux)
```




## See Also
- Refer to [Orbs Best Practices]({{site.baseurl}}/2.0/orbs-best-practices) for suggestions on creating a production-ready orb.
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.
