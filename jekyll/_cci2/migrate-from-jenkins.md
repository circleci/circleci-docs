---
layout: classic-docs
title: Migrate from Jenkins
categories: [migration]
description: Differences between CircleCI and Jenkins, with migration guide.
version:
- Cloud
- Server v3.x
---

This document provides the basic concepts that a longtime Jenkins user needs to know when migrating from Jenkins to CircleCI.

* TOC
{:toc}

## Quick start
{: #quick-start }

CircleCI is a very different product from Jenkins, with a lot of different concepts on how to manage CI/CD, but it will not take long to migrate the basic functionality of your Jenkins build to CircleCI. To get started quickly, try these steps:

1. **Getting Started:** Run your first green build on CircleCI using the [guide]({{site.baseurl}}/2.0/getting-started).

2. **Copy-paste your commands from Execute Shell:** To simply duplicate your project exactly as it is in Jenkins, add a file called `config.yml` to a `.circleci/` directory of your project with the following content:

```yaml
    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Copy-paste from 'Execute Shell' in Jenkins"
```

Some programs and utilities are [pre-installed on CircleCI Images]({{site.baseurl}}/2.0/circleci-images/#pre-installed-tools), but anything else required by your build must be installed with a `run` step. Your project’s dependencies may be [cached]({{site.baseurl}}/2.0/caching/) for the next build using the `save_cache` and `restore_cache` steps, so that they only need to be fully downloaded and installed once.

**Manual configuration:** If you were using plugins or options other than Execute Shell in Jenkins to run your build steps, you may need to manually port your build from Jenkins. Use the [Configuring CircleCI]({{site.baseurl}}/2.0/configuration-reference/) document as a guide to the complete set of CircleCI configuration keys.

## Job configuration
{: #job-configuration }

Jenkins projects are generally configured in the Jenkins web UI, and the settings are stored on the filesystem of the Jenkins server. This makes it difficult to share configuration information within a team or organization. Cloning a repository from your VCS does not copy the information stored in Jenkins. Settings stored on the Jenkins server also make regular backups of all Jenkins servers required.

Almost all configuration for CircleCI builds are stored in a file called `.circleci/config.yml` that is located in the root directory of each project. Treating CI/CD configuration like any other source code makes it easier to back up and share. Just a few project settings, like secrets, that should not be stored in source code are stored (encrypted) in the CircleCI app.

### Access to build machines
{: #access-to-build-machines }

It is often the responsibility of an ops person or team to manage Jenkins servers. These people generally get involved with various CI/CD maintenance tasks like installing dependencies and troubleshooting issues.

It is never necessary to access a CircleCI environment to install dependencies, because every build starts in a fresh environment where custom dependencies must be installed automatically, ensuring that the entire build process is truly automated. Troubleshooting in the execution environment can be done easily and securely by any developer using CircleCI’s [SSH feature]({{site.baseurl}}/2.0/ssh-access-jobs/).

If you install CircleCI on your own hardware, the divide between the host OS (at the "metal"/VM level) and the containerized execution environments can be extremely useful for security and ops (see [Your builds in containers](#your-builds-in-containers) below). Ops team members can do what they need to on the host OS without affecting builds, and they never need to give developers access. Developers, on the other hand, can use CircleCI’s SSH feature to debug builds at the container level as much as they like without affecting ops.

## Plugins
{: #plugins }

You have to use plugins to do almost anything with Jenkins, including checking out a Git repository. Like Jenkins itself, its plugins are Java-based, and a bit complicated. They interface with any of several hundred possible extension points in Jenkins and can generate web views using JSP-style tags and views.

All core CI functionality is built into CircleCI. Features such as checking out source from a VCS, running builds and tests with your favorite tools, parsing test output, and storing artifacts are plugin-free. When you do need to add custom functionality to your builds and deployments, you can do so with a couple snippets of bash in appropriate places.

Below is a table of supported plugins that you can convert using the [CircleCI Jenkins converter tool](https://circleci.com/developer/tools/jenkins-converter) ([see Jenkins converter section](#jenkinsfile-converter)).

**Jenkinsfiles relying on plugins not listed below cannot be converted**. Please remove stanzas relying on those unsupported plugins (for example `options`), otherwise you will see an error message saying something is `Unknown` or `Invalid`. Please [submit a ticket](https://support.circleci.com/hc/en-us/requests/new) with our support center if you have a request to add a plugin to the list.
{: class="alert alert-info" }

- Ant Plugin (`ant`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- Bouncy Castle API Plugin (`bouncycastle-api`)
- Branch API Plugin (`branch-api`)
- Build Timeout (`build-timeout`)
- Command Agent Launcher Plugin (`command-launcher`)
- Config File Provider Plugin (`config-file-provider`)
- Credentials Binding Plugin (`credentials-binding`)
- Credentials Plugin (`credentials`)
- Display URL API (`display-url-api`)
- Docker Commons Plugin (`docker-commons`)
- Docker Pipeline (`docker-workflow`)
- Durable Task Plugin (`durable-task`)
- Email Extension Plugin (`email-ext`)
- Folders Plugin (`cloudbees-folder`)
- GitHub API Plugin (`github-api`)
- GitHub Branch Source Plugin (`github-branch-source`)
- GitHub plugin (`github`)
- Gradle Plugin (`gradle`)
- H2 API Plugin (`h2-api`)
- JUnit Plugin (`junit`)
- Jackson 2 API Plugin (`jackson2-api`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- Jenkins GIT server Plugin (`git-server`)
- Jenkins Git client plugin (`git-client`)
- Jenkins Git plugin (`git`)
- Jenkins JSch dependency plugin (`jsch`)
- Jenkins Mailer Plugin (`mailer`)
- Jenkins Subversion Plug-in (`subversion`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- LDAP Plugin (`ldap`)
- Lockable Resources plugin (`lockable-resources`)
- MapDB API Plugin (`mapdb-api`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- Matrix Project Plugin (`matrix-project`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- PAM Authentication plugin (`pam-auth`)
- Pipeline (`workflow-aggregator`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Pipeline Maven Integration Plugin (`pipeline-maven`)
- Pipeline Utility Steps (`pipeline-utility-steps`)
- Pipeline: API (`workflow-api`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Pipeline: Build Step (`pipeline-build-step`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Input Step (`pipeline-input-step`)
- Pipeline: Job (`workflow-job`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: Step API (`workflow-step-api`)
- Pipeline: Supporting APIs (`workflow-support`)
- Plain Credentials Plugin (`plain-credentials`)
- Resource Disposer Plugin (`resource-disposer`)
- SCM API Plugin (`scm-api`)
- SSH Build Agents plugin (`ssh-slaves`)
- SSH Credentials Plugin (`ssh-credentials`)
- Script Security Plugin (`script-security`)
- Structs Plugin (`structs`)
- Timestamper (`timestamper`)
- Token Macro Plugin (`token-macro`)
- Trilead API Plugin (`trilead-api`)

## Distributed builds
{: #distributed-builds }

It is possible to make a Jenkins server distribute your builds to a number of "agent" machines to execute the jobs, but this takes a fair amount of work to set up. According to Jenkins’ [docs](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds), “Jenkins is not a clustering middleware, and therefore it doesn't make this any easier.”

CircleCI distributes builds to a large fleet of builder machines by default. If you use SaaS-based circleci.com, then this just happens for you - your builds do not queue unless you are using all the build capacity in your plan. If you use CircleCI installed in your own environment, then you will appreciate that CircleCI does manage your cluster of builder machines without the need for any extra tools.

## Containers and Docker
{: #containers-and-docker }

Talking about containerization in build systems can be complicated, because arbitrary build and test commands can be run inside of containers as part of the implementation of the CI/CD system, and some of these commands may involve running containers. Both of these points are addressed below. Also note that Docker is an extremely popular tool for running containers, but it is not the only one. Both the terms "container" (general) and "Docker" (specific) will be used.

### Containers in your builds
{: #containers-in-your-builds }

If you use a tool like Docker in your workflow, you will likely also want to run it on CI/CD. Jenkins does not provide any built-in support for this, and it is up to you to make sure it is installed and available within your execution environment.

Docker has long been one of the tools that is pre-installed on CircleCI, so you can access Docker in your builds by adding `docker` as an executor in your `.circleci/config.yml` file. See the [Introduction to Execution Environments]({{site.baseurl}}/2.0/executor-intro/) page for more info.

### Your builds in containers
{: #your-builds-in-containers }

Jenkins normally runs your build in an ordinary directory on the build server, which can cause lots of issues with dependencies, files, and other state gathering on the server over time. There are plugins that offer alternatives, but they must be manually installed.

CircleCI runs all Linux and Android builds in dedicated containers, which are destroyed immediately after use (macOS builds run in single-use VMs). This creates a fresh environment for every build, preventing unwanted cruft from getting into builds. One-off environments also promote a disposable mindset that ensures all dependencies are documented in code and prevents “snowflake” build servers.

If you run builds on your own hardware with [CircleCI](https://circleci.com/enterprise/), running all builds in containers allows you to heavily utilize the hardware available to run builds.

## Parallelism
{: #parallelism }

It is possible to run multiple tests in parallel on a Jenkins build using techniques like multithreading, but this can cause subtle issues related to shared resources like databases and filesystems.

CircleCI lets you increase the parallelism in any project’s settings so that each build for that project uses multiple containers at once. Tests are evenly split between containers allowing the total build to run in a fraction of the time it normally would. Unlike with simple multithreading, tests are strongly isolated from each other in their own environments. You can read more about parallelism on CircleCI in the [Running Tests in Parallel]( {{ site.baseurl }}/2.0/parallelism-faster-jobs/) document.

## Jenkinsfile converter
{: #jenkinsfile-converter }

The CircleCI [Jenkins Converter](https://circleci.com/developer/tools/jenkins-converter) is a web tool that allows you to easily convert a Jenkinsfile to a `.circleci/config.yml` file, helping you to get started building on CircleCI quickly and easily.

**The converter only supports declarative Jenkinsfiles**. While the number of supported plug-ins and steps continue to be expanded, the hope is that this tool gets you started at least 50% of the way, and makes it easier for you to get started building on CircleCI.

### Supported syntax
{: #supported-syntax }

Only declarative (pipeline) `Jenkinsfile`s are currently supported.

Jenkinsfile Syntax | Approx. CircleCI Syntax | Status
--- | --- | ---
agent | [executor]({{site.baseurl}}/2.0/configuration-reference/#executors-requires-version-21) | Static
post | [when attribute]({{site.baseurl}}/2.0/configuration-reference/#the-when-attribute) | See [when]({{site.baseurl}}/2.0/configuration-reference/#the-when-attribute)
stages | [workflows]({{site.baseurl}}/2.0/workflows/) | Supported |
steps | [step]({{site.baseurl}}/2.0/jobs-steps/#steps-overview) | Limited
environment | [environment]({{site.baseurl}}/2.0/env-vars/) | [Unsupported](https://github.com/circleci/jenkinsfile-converter/issues/26)
options | N/A | See [Supported Jenkins Plugins](#supported-jenkins-plugins)
parameters | [parameters]({{site.baseurl}}/2.0/reusing-config/#using-the-parameters-declaration) | Unsupported
triggers | [cron]({{site.baseurl}}/2.0/workflows/#scheduling-a-workflow) | Unsupported
stage | [job]({{site.baseurl}}/2.0/configuration-reference/#jobs) | Supported
{: class="table table-striped"}

### Limitations
{: #limitations }

* A limited number of syntaxes and plugins are supported. Jenkinsfiles relying on unsupported syntaxes and plugins cannot be converted. Please manually remove them.

* Only a single Jenkinsfile is accepted per request. Namely, [Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/) will not be resolved, and the resulting `config.yml` may be incomplete. Note that under certain cases the converter does not raise errors even if there are unresolvable Shared Libraries.

* Only `Default` is supported as a tool name for `maven`, `jdk` and `gradle` in the [`tools` block](https://www.jenkins.io/doc/book/pipeline/syntax/#tools), and other names will cause conversion failures. Please configure them as follows or remove them manually.

  For example, the following stanza:
  ```groovy
  tools {
    maven 'Maven 3.6.3'
    jdk 'Corretto 8.232'
  }
  ```
  should be changed to:
  ```groovy
  tools {
    maven 'Default'
    jdk 'Default'
  }
  ```

### Next steps after conversion
{: #next-steps-after-conversion }

The following sections describe next steps with various aspects of the CircleCI pipeline.

#### Executors
{: #executors }

A static Docker executor, [cimg/base](https://github.com/CircleCI-Public/cimg-base), is inserted as the [executor]({{site.baseurl}}/2.0/configuration-reference/#executors-requires-version-21) regardless of the one defined within the Jenkinsfile input.

Given that `cimg/base` is a very lean image, it is highly likely that your project will require a different image. [CircleCI's convenience images](https://circleci.com/developer/images/) are a good place to find other images. Refer to [custom Docker image]({{site.baseurl}}/2.0/custom-images/) for advanced steps to create your own custom image.

Depending on the use case, you might require the [machine executor]({{site.baseurl}}/2.0/configuration-reference/#machine) if your application requires full access to OS resources and the job environment, or the [macOS executor]({{site.baseurl}}/2.0/using-macos).

#### Workflows
{: #workflows }

[CircleCI Workflows]({{site.baseurl}}/2.0/workflows/) (the equivalent of Jenkins pipelines) are transferred from your Jenkinsfile to the `.circleci/config.yml`, including branch filters. The converter will not transfer any [scheduled builds]({{site.baseurl}}/2.0/configuration-reference/#triggers) to prevent unintentional builds from being triggered.

#### Jobs
{: #jobs }

Many of the configuration options within CircleCI jobs do not have equivalents to Jenkins' offerings. It is best practice to start with the following features to get a richer experience from CircleCI:

- [Checkout code]({{site.baseurl}}/2.0/configuration-reference/#checkout)
- [Resource class]({{site.baseurl}}/2.0/configuration-reference/#resource_class)
- [Parallelism]({{site.baseurl}}/2.0/configuration-reference/#parallelism)
- Caches, [saving]({{site.baseurl}}/2.0/configuration-reference/#save_cache) and [restoring]({{site.baseurl}}/2.0/configuration-reference/#restore_cache)
- [Store Artifacts]({{site.baseurl}}/2.0/configuration-reference/#store_artifacts)

#### Steps
{: #steps }

While the Jenkinsfile Converter attempts to directly translate steps, it does not provide full translation of all steps. To address this, the `JFC_STACK_TRACE` key was added to translate specific steps within the output YAML and to provide some guidance on how to proceed with unsupported step directives.

## Next steps
{: #next-steps }

* [Introduction to the CircleCI Web App]({{site.baseurl}}/2.0/introduction-to-the-circleci-web-app)
