---
layout: classic-docs
title: "Introduction to Jenkins Converter"
short-title: "Jenkins Converter Introduction"
description: "Starting point for how to use the Jenkins Converter"
categories: [getting-started]
order: 1
noindex: true
sitemap: false
---

The CircleCI [Jenkins Converter](https://circleci.com/developer/tools/jenkins-converter) is a web tool that allows you to easily convert a Jenkinsfile to a CircleCI config.yml, helping you to get started building on CircleCI quickly and easily.

Currently, the converter only supports declarative Jenkinsfiles. While the number of supported plug-ins and steps continue to be expanded, the hope is that this tool gets you started at least 50% of the way, and makes it easier for you to get started building on CircleCI.

## Limitations
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

## Next steps after conversion
{: #next-steps-after-conversion }

### Executors
{: #executors }

A static Docker executor, [cimg/base](https://github.com/CircleCI-Public/cimg-base), is inserted as the [executor]({{site.baseurl}}/2.0/configuration-reference/#executors-requires-version-21) regardless of the one defined within the Jenkinsfile input.

Given that `cimg/base` is a very lean image, it's highly likely that your project will require a different image. [CircleCI's convenience images](https://circleci.com/developer/images/) are a good place to find other images. Refer to [custom Docker image]({{site.baseurl}}/2.0/custom-images/) for advanced steps to create your own custom image.

Depending on the use case, you might require the [machine executor]({{site.baseurl}}/2.0/configuration-reference/#machine) if your application requires full access to OS resources and the job environment, or the [macOS executor]({{site.baseurl}}/2.0/using-macos).

### Workflows
{: #workflows }

[CircleCI Workflows]({{site.baseurl}}/2.0/workflows/) (the equivalent of Jenkins pipelines) are transferred from your Jenkinsfile to the config.yml, including branch filters. The converter will not transfer any [scheduled builds]({{site.baseurl}}/2.0/configuration-reference/#triggers) to prevent unintentional builds from being triggered.

### Jobs
{: #jobs }

Many of the configuration options within CircleCI jobs don't have equivalents to Jenkins' offerings. It is best practice to start with the following features to get a richer experience from CircleCI:

- [Checkout code]({{site.baseurl}}/2.0/configuration-reference/#checkout)
- [Resource class]({{site.baseurl}}/2.0/configuration-reference/#resource_class)
- [Parallelism]({{site.baseurl}}/2.0/configuration-reference/#parallelism)
- Caches, [saving]({{site.baseurl}}/2.0/configuration-reference/#save_cache) and [restoring]({{site.baseurl}}/2.0/configuration-reference/#restore_cache)
- [Store Artifacts]({{site.baseurl}}/2.0/configuration-reference/#store_artifacts)

### Steps
{: #steps }

While the Jenkinsfile Converter attempts to directly translate steps, it does not provide full translation of all steps. To address this, the `JFC_STACK_TRACE` key was added to translate specific steps within the output YAML and to provide some guidance on how to proceed with unsupported step directives.

## Supported syntax
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

## Supported Jenkins plugins
{: #supported-jenkins-plugins }

**Note: Jenkinsfiles relying on plugins not listed below cannot be converted**. Please remove stanzas relying on those unsupported plugins (for example `options`), otherwise **you will see an error message saying something is "Unknown" or "Invalid"**. Please submit a ticket with our support center if you have a request to add a plugin to the list.

- Trilead API Plugin (`trilead-api`)
- Folders Plugin (`cloudbees-folder`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Script Security Plugin (`script-security`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- Command Agent Launcher Plugin (`command-launcher`)
- Structs Plugin (`structs`)
- Pipeline: Step API (`workflow-step-api`)
- Token Macro Plugin (`token-macro`)
- bouncycastle API Plugin (`bouncycastle-api`)
- Build Timeout (`build-timeout`)
- Credentials Plugin (`credentials`)
- Plain Credentials Plugin (`plain-credentials`)
- SSH Credentials Plugin (`ssh-credentials`)
- Credentials Binding Plugin (`credentials-binding`)
- SCM API Plugin (`scm-api`)
- Pipeline: API (`workflow-api`)
- Timestamper (`timestamper`)
- Pipeline: Supporting APIs (`workflow-support`)
- Durable Task Plugin (`durable-task`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- JUnit Plugin (`junit`)
- Matrix Project Plugin (`matrix-project`)
- Resource Disposer Plugin (`resource-disposer`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- Ant Plugin (`ant`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Job (`workflow-job`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- Display URL API (`display-url-api`)
- Jenkins Mailer Plugin (`mailer`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Gradle Plugin (`gradle`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Jackson 2 API Plugin (`jackson2-api`)
- Pipeline: Input Step (`pipeline-input-step`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: Build Step (`pipeline-build-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Jenkins JSch dependency plugin (`jsch`)
- Jenkins Git client plugin (`git-client`)
- Jenkins GIT server Plugin (`git-server`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Branch API Plugin (`branch-api`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- Docker Commons Plugin (`docker-commons`)
- Docker Pipeline (`docker-workflow`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Lockable Resources plugin (`lockable-resources`)
- Pipeline (`workflow-aggregator`)
- GitHub API Plugin (`github-api`)
- Jenkins Git plugin (`git`)
- GitHub plugin (`github`)
- GitHub Branch Source Plugin (`github-branch-source`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- MapDB API Plugin (`mapdb-api`)
- Jenkins Subversion Plug-in (`subversion`)
- SSH Build Agents plugin (`ssh-slaves`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- PAM Authentication plugin (`pam-auth`)
- LDAP Plugin (`ldap`)
- Email Extension Plugin (`email-ext`)
- H2 API Plugin (`h2-api`)
- Config File Provider Plugin (`config-file-provider`)
- Pipeline Maven Integration Plugin (`pipeline-maven`)
- Pipeline Utility Steps (`pipeline-utility-steps`)

## Feedback
{: #feedback }

To share any general feedback regarding this project, submit a ticket with our CircleCI Support team.
