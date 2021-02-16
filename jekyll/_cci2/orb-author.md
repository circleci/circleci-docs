---
layout: classic-docs
title: "Orb Authoring Process"
short-title: "Authoring Orbs"
description: "Starting point for authoring CircleCI orbs"
categories: [getting-started]
order: 1
version:
- Cloud
---

* TOC
{:toc}

## Introduction

This orb authoring guide assumes you have read the [Introduction to authoring an orb]({{site.baseurl}}/2.0/orb-intro) document and claimed your namespace. At this point you are ready to develop an orb.

Whether you are writing your first orb or getting ready for production level, we recommend using our [orb development kit](#orb-development-kit) to get started. Alternatively, as orbs are packages of [reusable configuration]({{site.baseurl}}/2.0/reusing-config), they can be written [manually]({{site.baseurl}}/2.0/orb-author-validate-publish), as singular `yaml` files, and published using our [circleci orb cli]({{site.baseurl}}/2.0/local-cli/#installation).

## Orb Development Kit

The orb development kit refers to a suite of tools that work together to simplify the orb development process, with automatic testing and deployment on CircleCI. The orb development kit is made up of the following components:

* [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template)
* [Orb Pack]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)
* [Orb Init](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb Tools Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

<script id="asciicast-362192" src="https://asciinema.org/a/362192.js" async></script>

### Getting started

To begin creating your new orb with the orb development kit, follow these steps. The starting point is creating a new repository on [GitHub.com](https://github.com).

Ensure the organization on GitHub is the owner for the [namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces) for which you are developing your orb. If this is your own personal organization and namespace, you need not worry.

1. **Create a new [GitHub repository](https://github.com/new).**<br/>
The name of your repository is not critical, but we recommend something similar to "myProject-orb". ![Orb Registry]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    When complete, you will be brought to a page confirming your new repository and you should see the generated git URL. Note down the git URL, you will need it in step 4. You can select SSH or HTTPS, which ever you can authenticate with. ![Orb Registry]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

1. **Open a terminal and initialize your new orb project using the `orb init` CLI command.**
```bash
circleci orb init /path/to/myProject-orb
```
The `circleci orb init` command is called, followed by a path that will be created and initialized for our orb project. It is best practice to use the same name for this directory and the git project repo.

1. **Choose the fully automated orb setup option.**
```
? Would you like to perform an automated setup of this orb?:
  ▸ Yes, walk me through the process.
    No, I'll handle everything myself.
```
When choosing the fully automated option, the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) will be downloaded and automatically modified with your customized settings. The project will be followed on CircleCI with an automated CI/CD pipeline included. <br/><br/>
For more information on the included CI/CD pipeline, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) documentation.
Alternatively, if you would simply like a convenient way of downloading the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) you can opt to handle everything yourself.

1. **Answer questions to configure and set up your orb.**<br/>
In the background, the `orb init` command will be copying and customizing the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template) based on your inputs. There are detailed `README.md` files within each directory that contain helpful information specific to the contents of each directory. You will also be asked for the remote git repository URL that you obtained back in step 1.<br/><br/>
The [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template) contains a full CI/CD pipeline (described in [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/)) which automatically [packs]({{site.baseurl}}/2.0/orb-concepts/#orb-packing), [tests]({{site.baseurl}}/2.0/testing-orbs/), and publishes your orb. <br/><br/>
In the setup process you will be asked if you would like to save your [Personal API Token]({{site.baseurl}}/2.0/managing-api-tokens/) into an `orb-publishing` [context]({{site.baseurl}}/2.0/contexts/). Saving this token is necessary for publishing development and production versions of your orb.
 
    **Ensure the context is restricted**
    <br/>
    Restrict a context by navigating to _Organization Settings > Contexts_.
    <br/><br/>
    After completing your orb, you should see a new context called `orb-publishing`. Click into `orb-publishing` and add a _Security Group_. Use Security Groups to limit access to users that are allowed to trigger jobs. Only these users will have access to the private [Personal API Token]({{site.baseurl}}/2.0/managing-api-tokens/).
    <br/><br/>
    For more information, see the [Contexts]({{site.baseurl}}/2.0/contexts/#restricting-a-context) guide.
    {: class="alert alert-warning"}

1. **Push the changes up to Github.**<br/>
During the setup process, the `orb init` command takes steps to prepare your automated orb development pipeline. The modified template code produced by the CLI must be pushed to the repository before the CLI can continue and automatically follow your project on circleci.com. Run the following command from a separate terminal when prompted to do so, substituting the name of your default branch:
```bash
git push origin <default-branch>
```
Once complete, return to your terminal and confirm the changes have been pushed.

1. **Complete and write your orb.**<br/>
The CLI will finish by automatically following your new orb project on CircleCI and generating the first development version `<namespace>/<orb>@dev:alpha` for testing (a hello-world sample).<br/><br/>
You will be provided with a link to the project building on CircleCI where you can view the validation, packing, testing, and publication process.
You should also see the CLI has automatically migrated you into a new development branch, named `alpha`.<br/><br/>
From your new branch you are now ready to make and push changes. From this point on, on every commit, your orb will be packed, validated, tested (optional), and can be published.<br/><br/>
When you are ready to deploy the first major version of your orb, find information on deploying changes with semver versioning in the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide.

### Writing your orb

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
| <i class="fa fa-folder" aria-hidden="true"></i> | [.circleci](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.circleci) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.github](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.github) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [src](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [.gitignore](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.gitignore) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [CHANGELOG.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/CHANGELOG.md) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [LICENSE](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/LICENSE) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [README.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/README.md) |
{: class="table table-striped"}

#### Orb source

Navigate to the `src` directory to look at the included sections.

**_Example: Orb Project "src" Directory_**

| type | name|
| --- | --- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i>| [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

The directories listed above represent orb components that can be included with your orb. @orb.yml acts as the root of your orb. You may additionally see [`scripts`](#scripts) and [`tests`](#testing-orbs) directories in your project for optional orb development enhancements, which we will cover in the [Scripts](#scripts) section and the [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) guide.

Each directory within `src` corresponds with a [reusable configuration]({{site.baseurl}}/2.0/reusing-config) component type, which can be added or removed from the orb. If, for example, your orb does not require any `executors` or `jobs`, these directories can be deleted.

##### @orb.yml
{:.no_toc}

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
{:.no_toc}

Author and add [Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) to the `src/commands` directory. Each _YAML_ file within this directory will be treated as an orb command, with a name which matches its filename.

Below is the _[greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml)_ command example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src).

```yaml
description: >
  # What will this command do?
  # Descriptions should be short, simple, and clear.
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "Select a proper greeting"
steps:
  - run:
      name: Hello World
      command: echo << parameters.greeting >> world
```

##### Examples
{:.no_toc}

Author and add [Usage Examples]({{site.baseurl}}/2.0/orb-concepts/#usage-examples) to the `src/examples` directory. Usage Examples are not for use directly by end users in their project configs, but they provide a way for you, the orb developer, to share use-case specific examples on the [Orb Registry](https://circleci.com/developer/orbs) for users to reference.

Each _YAML_ file within this directory will be treated as an orb usage example, with a name which matches its filename.

View a full example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples).

##### Executors
{:.no_toc}

Author and add [Parameterized Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) to the `src/executors` directory.

Each _YAML_ file within this directory will be treated as an orb executor, with a name that matches its filename.

View a full example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors).

##### Jobs
{:.no_toc}

Author and add [Parameterized Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) to the `src/jobs` directory.

Each _YAML_ file within this directory will be treated as an orb job, with a name that matches its filename.

Jobs can include orb commands and other steps to fully automate tasks with minimal user configuration.

View the _[hello.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/jobs/hello.yml)_ job example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs).

```yaml
description: >
  # What will this job do?
  # Descriptions should be short, simple, and clear.

docker:
  - image: cimg/base:stable
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

One of the major benefits of the orb development kit is a script inclusion feature. When using the `circleci orb pack` command (automated when using the orb development kit), you can use the value `<<include(file)>>` within your orb config code, for any key, to include the file contents directly in the orb.

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
{:.no_toc}

CircleCI configuration is written in `YAML`. Logical code such as `bash` can be encapsulated and executed on CircleCI through `YAML`, but, for developers, it is not convenient to write and test programmatic code within a non-executable format. Also, parameters can become cumbersome in more complex scripts as the `<<parameter>>` syntax is a CircleCI native YAML enhancement, and not something that can be interpreted and executed locally.

Using the orb development kit and the `<<include(file)>>` syntax, you can import existing scripts into your orb, locally execute and test your orb scripts, and even utilize true testing frameworks for your code.

##### Using parameters with scripts
{:.no_toc}

To keep your scripts portable and locally executable, it is best practice to expect a set of environment variables within your scripts and set them at the config level. The `greet.sh` file, which was included with the special `<<include(file)>>` syntax above in our `greet.yml` command file, looks like this:

```bash
echo Hello "${PARAM_TO}"
```

This way, you can both mock and test your scripts locally.

### Testing orbs

Much like any other software, there are multiple ways to test your code and it is entirely up to you as the developer to implement as many tests as desired. Within your config file right now there will be a job named [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) that will need to be updated to test your orb components. This is a type of _integration testing_. Unit testing with orbs is possible as well.

Read our full [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) documentation.

### Keeping a changelog

Deciphering the difference between two versions of an orb can prove tricky. Along with semantic versioning, we recommend leveraging a changelog to more clearly describe changes between versions. The orb template comes with the `CHANGELOG.md` file, which should be updated with each new version of your orb. The file uses the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

### Publishing your orb

With the orb development kit, a fully automated CI and CD pipeline is automatically configured within `.circleci/config.yml`. This configuration makes it simple to automatically deploy semantically versioned releases of your orbs.

For more information, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide.

### Categorizing your orb

You can categorize your orb for better discoverability in the [Orb Registry](https://circleci.com/developer/orbs). Categorized orbs are searchable by category in the [Orb Registry](https://circleci.com/developer/orbs). CircleCI may, from time to time, create or edit orb categorizations to improve orb discoverability.

#### Listing categories

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

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

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

Add your orb to your chosen category by running `circleci orb add-to-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html).


#### Remove an orb from a category

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

Remove an orb from a category by running `circleci orb remove-from-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html).

#### Viewing an orb's categorizations

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

To see which categorizations have been applied an orb, check the output of `circleci orb info <namespace>/<orb>` for a list. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html).
