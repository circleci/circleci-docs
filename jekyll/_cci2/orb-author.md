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

  Once you have read the [Introduction to authoring an orb]({{site.baseurl}}/2.0/orb-intro) document and claimed your namespace, you are ready to develop and orb.

  As orbs are simply packages of [reusable config]({{site.baseurl}}/2.0/reusing-config), orbs can be written [manually]({{site.baseurl}}/2.0/orb-author-validate-publish) as singular `yaml` files and published using our [circleci orb cli]({{site.baseurl}}/2.0/local-cli/#installation).

  Alternatively, whether you are writing your first orb or getting ready for a production level orb, we recommend using our Orb Development Kit to get started.

## Orb Development Kit

The Orb Development Kit refers to a suite of tools working together to make production-level orb development simple, with automatic testing and deployment on CircleCI.

### Getting Started

To begin creating your new orb with the Orb Developer Kit, first create a new repository on GitHub.com. Ensure the Organization on GitHub is the owner for the [namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces) for which you are developing your orb. If this is your own personal organization and namespace, you need not worry.

1) Create new [GitHub repository](https://github.com/new).

The name of your repository is not critical but we recommend something similar to "myProject-orb".

![Orb Registry]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

2) Clone or initialize the repository locally and change directory into the git project.

```bash
$ git clone https://github.com/<user>/myProject-orb.git
$ cd myProject-orb
```

3) Initialize a new orb project using the `orb init` CLI command.

```bash
$ circleci orb init .
```

The `circleci orb init` is called, followed by the directory where we will create our orb. We are going to use `.` for the current directory.

4) When prompted, we will opt to select the fully automated orb setup.

```text
? Would you like to perform an automated setup of this orb?:
  ▸ Yes, walk me through the process.
    No, I'll handle everything myself.
```

5) You will be asked a short series of questions to configure and setup your orb such as your [namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces) and orb name.

In the background the `orb init` command will be copying and customizing the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template) based on your inputs. There is a detailed `README.md` file within each directory that contains helpful information specific to that directory.

6) When prompted, in a separate terminal, push the changes up to Github.

During the setup process, the `orb init` command will take several steps to prepare your automated orb development pipeline. The modified template code produced by the CLI must be pushed to the repository before the CLI can continue and automatically follow your project on CircleCI.com.

```bash
$ git push origin master
```

7) Once complete, return to the CLI window and confirm the changes have been pushed. The CLI will finish by automatically following the project on CircleCI and generating the first development version fo your orb for testing (a hello-world sample).

You are now ready to push changes to your orb and automatically publish your orb. We'll go over deploying changes with semver versioning in the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs) docs.

### Writing Your Orb

Before you begin working on your orb, ensure you are on a non-default branch. We typically recommend s tarting your orb on the `alpha` branch.

```shell
$ git checkout -b alpha
```

Once you have ran the `circleci orb init` command, you will have a repository with importantly, a `.circleci` and `src` directory.

_Example: Orb Project Structure_

| type | name|
| --- | --- |
| 📁| [.circleci](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.circleci) |
| 📁| [.github](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.github) |
| 📁| [src](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src) |
| 📄| [.gitignore](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.gitignore) |
| 📄| [CHANGELOG.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/CHANGELOG.md) |
| 📄| [LICENSE](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/LICENSE) |
| 📄| [README.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/README.md) |
{: class="table table-striped"}

#### Orb Source

Navigate to the `src` directory.

_Example: Orb Project "src" Directory_

| type | name|
| --- | --- |
| 📁| [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands) |
| 📁| [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples) |
| 📁| [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| 📁| [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs) |
| 📄| [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

These files and directories above are the only "_required_" components, you may additionally see a `scripts` and `tests` folder in your project and we will go over those shortly. If your orb however does not need any `executors` or `jobs` for instance, these directories can be deleted.

Each directory in the `src` folder listed above corresponds with an orb component type which can be added or removed from the orb.

##### @orb.yml
{:.no_toc}

This file acts as the "root" to your orb project and contains the config version, the orb description, the display key, and imports any additional orbs if needed.

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

Easily add and author [Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) to the `src/commands` directory.

Each _YAML_ file within this directory will be treated as an orb command, with a name which matches its filename.

View the included _[greet.yml](./greet.yml)_ command example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src).

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

Easily author and add [Usage Examples]({{site.baseurl}}/2.0/orb-author/#providing-usage-examples-of-orbs) to the `src/examples` directory.

Each _YAML_ file within this directory will be treated as an orb usage example, with a name which matches its filename.

View the full example on the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)

##### Executors
{:.no_toc}

Easily author and add [Parameterized Executors]({{site.baseurl}}/2.0/reusing-config/#executors) to the `src/executors` directory.

Each _YAML_ file within this directory will be treated as an orb executor, with a name which matches its filename.

View the full example on the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors)


##### Jobs
{:.no_toc}

Easily author and add [Parameterized Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) to the `src/jobs` directory.

Each _YAML_ file within this directory will be treated as an orb job, with a name which matches its filename.

Jobs may invoke orb commands and other steps to fully automate tasks with minimal user configuration.

View the included _[hello.yml](./hello.yml)_ job example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs).


```yaml
description: >
  # What will this job do?
  # Descriptions should be short, simple, and clear.

executor: default
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

One of the major improvements and benefits included in the orb development kit, is a script inclusion feature. Within your orb config code, when using the Orb Dev Kit, you may use the value `<<include(file)>>` for any key and include the file contents directly in the orb.

This is especially useful when writing complex orb commands which may contain a lot of _bash_ code for instance _(although you could use python too!)_.

{:.tab.command.noScript}
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

{:.tab.command.Scripts}
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

##### Why include scripts?
{:.no_toc}

CircleCI configuration is written in `YAML`. While we can encapsulate our logical code such as `bash` and execute it on CircleCI through `YAML`, it is not convenient for us as developers to write and test our programatic code within a non-executable format.

Parameters also can become cumbersome in more complex scripts as the `<<parameter>>` syntax is a CircleCI native YAML enhancement, and not something that can be interpreted and executed locally.

Using the Orb Dev Kit and the `<<include(file)>>` syntax, we can import into our orb existing scripts that already exist, locally execute and test our orb scripts, and even utilize true testing frameworks for our code.

##### How to use parameters with scripts?
{:.no_toc}

To keep our scripts portable and able to be executed locally, we expect a set of environment variables within our script and set them at the config level.

The `greet.sh` file which was included with the special `<<include(file)>>`syntax above in our `greet.yml` command file looks like this:

```bash
echo Hello "${PARAM_TO}"
```

This way we can both mock and test our scripts locally.

### Testing Your Orb

Much like any or all other software, there are multiple ways to test your code and it is entirely up to you as the developer to implement as many or few tests as desired.

Within your config file right now there will be a job named [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) which will need to be updated to test your orb components. This is a type of _integration testing_. Unit testing with orbs is possible as well.

Read our full [Orb Testing Methodologies]({site.baseurl}}/2.0/testing-orbs) documentation.

### Publishing Your Orb

With the Orb Dev Kit, a fully automated CI and CD pipeline is automatically configured within `.circleci/config.yml`. This configuration makes it simple to automatically deploy semantically versioned releases of our orbs.

Read our full [Orb Publishing Process]({site.baseurl}}/2.0/creating-orbs) documentation.