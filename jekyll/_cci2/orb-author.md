---
layout: classic-docs
title: "Orb Authoring Process"
short-title: "Authoring Orbs"
description: "Starting point for authoring CircleCI orbs"
categories: [getting-started]
order: 1
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

* TOC
{:toc}

## Introduction
{: #introduction }

This orb authoring guide assumes you have read the [Introduction to orbs]({{site.baseurl}}/orb-intro) document, the [Introduction to authoring an orb]({{site.baseurl}}/orb-author-intro) document, and claimed your namespace. Now you are ready to develop an orb.

Whether you are writing your first orb or getting ready for production level, we recommend using our [orb development kit](#orb-development-kit) to get started. Alternatively, as orbs are packages of [reusable configuration]({{site.baseurl}}/reusing-config), they can be written [manually]({{site.baseurl}}/orb-author-validate-publish), as singular `yaml` files, and published using our [circleci orb cli]({{site.baseurl}}/local-cli/#installation).


## Orb Development Kit
{: #orb-development-kit }

The orb development kit refers to a suite of tools that work together to simplify the orb development process, with automatic testing and deployment on CircleCI. The `orb init` command is the key to using the orb development kit. This command initiates a new orb project based on a template, and that template uses the other tools in the kit to automatically test and deploy your orb.

The orb development kit is made up of the following components:

* [Orb Template](https://github.com/CircleCI-Public/Orb-Template)
* [CircleCI CLI](https://circleci-public.github.io/circleci-cli/)
    * [Orb Pack Command](https://circleci-public.github.io/circleci-cli/circleci_orb_pack.html)
    * [Orb Init Command](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb Tools Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

The **orb template** is a repository with CircleCI's orb project template, which is automatically ingested and modified by the `orb init` command.

The **CircleCI CLI** contains two commands which are designed to work with the kit. The **orb init command** initializes a new orb project, and the **orb pack command** packs the orb source into a single `orb.yml` file.

The **orb tools orb** is an orb for creating orbs.

## Create, test and publish an orb
{: #create-test-and-publish-an-orb }

Follow the steps below to create, test and publish your own orb, using the orb development kit.

### Getting started
{: #getting-started }

To get started with orb authoring, first follow the [Create an orb tutorial](/docs/create-an-orb).

### Writing your orb
{: #writing-your-orb }

Before you begin working on your orb, ensure you are on a non-default branch. We typically recommend starting your orb on the `alpha` branch.

```shell
$ git branch

* alpha
  main
```

If you have run the `circleci orb init` command, you will automatically be in the `alpha` branch and have a repository with `.circleci` and `src` directories.

**_Example: Orb Project Structure_**

| type | name|
| --- | --- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.circleci](https://github.com/CircleCI-Public/Orb-Template/tree/main/.circleci) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.github](https://github.com/CircleCI-Public/Orb-Template/tree/main/.github) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [src](https://github.com/CircleCI-Public/Orb-Template/tree/main/src) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [.gitignore](https://github.com/CircleCI-Public/Orb-Template/blob/main/.gitignore) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [LICENSE](https://github.com/CircleCI-Public/Orb-Template/blob/main/LICENSE) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [README.md](https://github.com/CircleCI-Public/Orb-Template/blob/main/README.md) |
{: class="table table-striped"}

#### Orb source
{: #orb-source }

Navigate to the `src` directory to look at the included sections.

**_Example: Orb Project "src" Directory_**

| type | name|
| --- | --- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [commands](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/commands) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i>| [scripts](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i>| [@orb.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/%40orb.yml) |
{: class="table table-striped"}

The directories listed above represent orb components that can be included with your orb. @orb.yml acts as the root of your orb. In addition to the directories representing your orb's yaml components, you will also see a '[scripts/](#scripts)' directory where we can store code we want to inject into our components.

Each directory within `src` corresponds with a [reusable configuration]({{site.baseurl}}/reusing-config) component type, which can be added or removed from the orb. If, for example, your orb does not require any `executors` or `jobs`, these directories can be deleted.

##### @orb.yml
{: #orbyml }


@orb.yml acts as the "root" to your orb project and contains the config version, the orb description, the display key, and imports any additional orbs if needed.

Use the `display` key to add clickable links to the orb registry for both your `home_url` (the home of the product or service), and `source_url` (the git repository URL).

```yaml
version: 2.1

description: >
  Sample orb description

display:
  home_url: "https://www.website.com/docs"
  source_url: "https://www.github.com/EXAMPLE_ORG/EXAMPLE_PROJECT"
```

##### Commands
{: #commands }


Author and add [Reusable Commands]({{site.baseurl}}/reusing-config/#authoring-reusable-commands) to the `src/commands` directory. Each _YAML_ file within this directory will be treated as an orb command, with a name which matches its filename.

This example shows a simple command which contains a single `run` step, which will echo "hello" and the value passed in the `target` parameter.

```yaml
description: >
  # What will this command do?
  # Descriptions should be short, simple, and clear.
parameters:
  target:
    type: string
    default: "Hello"
    description: "To whom to greet?"
steps:
  - run:
      name: Hello World
      environment:
        ORB_PARAM_TARGET: << parameters.target >>
      command: echo "Hello ${ORB_PARAM_TARGET}"
```

##### Examples
{: #examples }


Author and add [Usage Examples]({{site.baseurl}}/orb-concepts/#usage-examples) to the `src/examples` directory. Usage Examples are not for use directly by end users in their project configs, but they provide a way for you, the orb developer, to share use-case specific examples on the [Orb Registry](https://circleci.com/developer/orbs) for users to reference.

Each _YAML_ file within this directory will be treated as an orb usage example, with a name which matches its filename.

View a full example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples).

##### Executors
{: #executors }


Author and add [Parameterized Executors]({{site.baseurl}}/reusing-config/#authoring-reusable-executors) to the `src/executors` directory.

Each _YAML_ file within this directory will be treated as an orb executor, with a name that matches its filename.

View a full example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors).

##### Jobs
{: #jobs }


Author and add [Parameterized Jobs]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs) to the `src/jobs` directory.

Each _YAML_ file within this directory will be treated as an orb job, with a name that matches its filename.

Jobs can include orb commands and other steps to fully automate tasks with minimal user configuration.

View the _[hello.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/jobs/hello.yml)_ job example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs).

```yaml
description: >
  # What will this job do?
  # Descriptions should be short, simple, and clear.

docker:
  - image: cimg/base:current
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "Select a proper greeting"
steps:
  - greet:
      greeting: "<< parameters.greeting >>"
```

#### Scripts
{: #scripts }

One of the major benefits of the orb development kit is a [script inclusion]({{site.baseurl}}/orb-concepts/#file-include-syntax) feature. When using the `circleci orb pack` command in the CLI (automated when using the orb development kit), you can use the value `<<include(file)>>` within your orb config code, for any key, to include the file contents directly in the orb.

This is especially useful when writing complex orb commands, which might contain a lot of _bash_ code, _(although you could use python too!)_.

{:.tab.scripts.Orb_Development_Kit_Packing}
```yaml
parameters:
  to:
    type: string
    default: "World"
    description: "Hello to whom?"
steps:
  - run:
      environment:
        PARAM_TO: <<parameters.to>>
      name: Hello Greeting
      command: <<include(scripts/greet.sh)>>
```

{:.tab.scripts.Standard_YAML_Config}
```yaml
parameters:
  to:
    type: string
    default: "World"
    description: "Hello to whom?"
steps:
  - run:
      name: Hello Greeting
      command: echo "Hello <<parameters.to>>"
```

##### Why include scripts?
{: #why-include-scripts }


CircleCI configuration is written in `YAML`. Logical code such as `bash` can be encapsulated and executed on CircleCI through `YAML`, but, for developers, it is not convenient to write and test programmatic code within a non-executable format. Also, parameters can become cumbersome in more complex scripts as the `<<parameter>>` syntax is a CircleCI native YAML enhancement, and not something that can be interpreted and executed locally.

Using the orb development kit and the `<<include(file)>>` syntax, you can import existing scripts into your orb, locally execute and test your orb scripts, and even utilize true testing frameworks for your code.

##### Using parameters with scripts
{: #using-parameters-with-scripts }


To keep your scripts portable and locally executable, it is best practice to expect a set of environment variables within your scripts and set them at the config level. The `greet.sh` file, which was included with the special `<<include(file)>>` syntax above in our `greet.yml` command file, looks like this:

```shell
echo Hello "${PARAM_TO}"
```

This way, you can both mock and test your scripts locally.

### Testing orbs
{: #testing-orbs }

Much like any software, to ensure quality updates, we must test our changes. There are a variety of methods and tools available for testing your orb from simple validation, to unit and integration testing.

In the `.circleci/` directory created by the orb development kit, you will find a `config.yml` file and a `test-deploy.yml` file. You will find in the `config.yml` file, the different static testing methods we apply to orbs, such as linting, shellchecking, reviewing, validating, and in some cases, unit testing. While, the `test-deploy.yml` config file is used to test a development version of the orb for integration testing.

Read our full [Orb Testing Methodologies]({{site.baseurl}}/testing-orbs/) documentation.

### Publishing your orb
{: #publishing-your-orb }

With the orb development kit, a fully automated CI and CD pipeline is automatically configured within `.circleci/config.yml`. This configuration makes it simple to automatically deploy semantically versioned releases of your orbs.

For more information, see the [Orb Publishing Process]({{site.baseurl}}/creating-orbs/) guide.

### Listing your orbs
{: #listing-your-orbs }

List your available orbs using the CLI:

To list **[public]({{site.baseurl}}/orb-intro/#public-or-private)** orbs:
```shell
circleci orb list <my-namespace>
```

To list **[private]({{site.baseurl}}/orb-intro/#public-or-private)** orbs:
```shell
circleci orb list <my-namespace> --private
```

For more information on how to use the `circleci orb` command, see the CLI [documentation](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

### Categorizing your orb
{: #categorizing-your-orb }

Orb categorization is **not** available on installations of CircleCI server.
{: class="alert alert-warning"}

You can categorize your orb for better discoverability in the [Orb Registry](https://circleci.com/developer/orbs). Categorized orbs are searchable by category in the [Orb Registry](https://circleci.com/developer/orbs). CircleCI may, from time to time, create or edit orb categorizations to improve orb discoverability.

#### Listing categories
{: #listing-categories }

![Example of showing listing categories using the CLI](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

You can select up to two categories for your orb. These are the available categories:

- Artifacts/Registry
- Build
- Cloud Platform
- Code Analysis
- Collaboration
- Containers
- Deployment
- Infra Automation
- Kubernetes
- Language/Framework
- Monitoring
- Notifications
- Reporting
- Security
- Testing

The list of categories can also be obtained by running the `circleci orb list-categories` CLI command. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_list-categories.html).

#### Add an orb to a category
{: #add-an-orb-to-a-category }

![Adding an orb category](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

Add your orb to your chosen category by running `circleci orb add-to-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html).

#### Remove an orb from a category
{: #remove-an-orb-from-a-category }

![Removing an orb from a category](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

Remove an orb from a category by running `circleci orb remove-from-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html).

#### Viewing an orb's categorizations
{: #viewing-an-orbs-categorizations }

![Show which categorizations have been added to an orb](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

To see which categorizations have been applied an orb, check the output of `circleci orb info <namespace>/<orb>` for a list. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html).
