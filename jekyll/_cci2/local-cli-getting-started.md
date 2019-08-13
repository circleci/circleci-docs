---
layout: classic-docs
title: "Getting Started with the CircleCI CLI"
short-title: "Getting Started with the CircleCI CLI"
description: "An introduction to interfacing with CircleCI from the command line"
categories: [getting-started]
order: 50
---

# Overview

For those who prefer to spend most of their development time in the terminal, consider installing the [CircleCI CLI](https://github.com/CircleCI-Public/circleci-cli) to interact with your projects on CircleCI. This document provides a step-by-step guide on intializing and working with a CircleCI project primarily from within the terminal. 

# Prerequisites

- You are using a unix-machine (Mac or Linux): the CircleCI CLI tool _is_ installable on Windows but is currently in beta and not as fully featured as unix installations. 
- You have a basic knowledge of CI/CD and the features and concepts of CircleCI's offerings.
- You have a GitHub account
- You have a CircleCI account.
- You have your terminal open and ready to go.
- Optional: An installation of Github's [`Hub`](https://hub.github.com/) command line tool (allowing us to interface with Github from the command line rather than the web UI). Learn [how to install Hub](https://github.com/github/hub#installation).

If some of these prerequisites sound unfamiliar, or you are new to the CircleCI platform, you may want to consider reading our [getting started]({{site.baseurl}}/2.0/getting-started/) guide or reading our [concepts document](https://circleci.com/docs/2.0/concepts/#section=getting-started) before proceeding.

# Steps

## Initialize a Git Repo

Let's start from the very basics: create a project and initialize a git repository. Refer to the below code block for a list of steps.

```sh
cd ~ # navigate to your home directory.
mkdir foo_ci # create your project in a folder called "foo_ci"
cd foo_ci # change directories into the new foo_ci folder.
git init # create a git repository
touch README.md # Create a file to put in your repository
echo 'Hello World!' >> README.md
git add . # Stage every file to commit
git commit -m "Initial commit" # create your first commit.
```

## Connect Your Git Repo to a VCS

Great! We have a git repository set up, with one file that says "Hello World!". We need to connect out local git repository to a Version Control System - either GitHub or BitBucket. Let's do that now.

If you have installed and setup the Hub CLI, you can simply run:

```sh
hub create
```

Then follow any prompts regarding logins / authorizing the HUB CLI.

If you aren't using Hub, head over to GitHub, login, and [create a new respository](https://github.com/new). Follow the instructions to commit and push to the remote. These instructions generally looks like this:

```sh
git remote add origin git@github.com:<YOUR_USERNAME>/foo_ci.git
git push --set-upstream origin master
```

You now have a git repo that is connected to a VCS. The remote on your VCS ("origin") now matches your local work.

## Download and Setup the CircleCI CLI

Next, we will install the CircleCI CLI and try out some of its features. To install the CLI on a unix machine run the following command in your terminal:

```sh
curl -fLSs https://circle.ci/cli | bash
```

There are multiple installation methods for the CLI, you can read more about them [here]({{site.baseurl}}/2.0/local-cli) if you need to use an alternative method.

Now run the setup step after the installation:

```sh
circleci setup
```

You'll be asked for your API token. Go to the [Account Settings](https://circleci.com/account/api) page and click `Create a New Token`. Name your token and copy the resulting token string and keep it somewhere safe!

Return to the CLI and paste in your API token to complete your setup.

## Setup and Validate Our First Config

Now it's time to create a configuration file in our project directory. 

```sh
cd ~/foo_ci # Make sure you are still in the foo_ci folder
mkdir .circleci # create a directory called ".circleci"
cd .circleci # change directories to the new directory
touch config.yml # create an YAML file called "config.yml"
```

The above commands create a `.circleci` folder where we will store our config file.

Open the newly created `config.yml` file and paste the following contents into it.

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.2-jessie-node
    steps:
      - checkout
      - run: echo "Hello World"
```

Now let's validate your config to ensure it's useable. In the root of your project, run the following command:

```sh
circleci config validate
```

**NOTE**: if at any time you want to learn more about a command you are using you can append `--help` to receive additional information in the terminal about the command:

```sh
circleci config validate --help
```

## Testing a Job before Pushing to a VCS

The CircleCI CLI enables you to test a job locally from the command line rather than having to push to your VCS. If a job in your configuration is proving problematic, this is a great way to try and debug it locally rather than using credits or minutes on the platform.

Try running the "build" job locally:

```sh
circleci local execute
```

This will pull down the docker image you have specified, in this case `circleci/ruby::2.4.2-jessie-node` and run the job. This may take a bit of time depending on the size of the docker image you are using.

You should see quite a bit of a text in your terminal. The last few lines of output should look similar to this:

```sh
====>> Checkout code
  #!/bin/bash -eo pipefail
mkdir -p /home/circleci/project && cp -r /tmp/_circleci_local_build_repo/. /home/circleci/project
====>> echo "Hello World"
  #!/bin/bash -eo pipefail
echo "Hello World"
Hello World
Success!
```
	
## Connect Your Repo to CircleCI

We will need to leave the terminal behind for this step. Head over to [the "Add Projects page"](https://circleci.com/add-projects). It's time to set up your project to run CI whenever you push code.

Find your project ("foo_ci", or whatever you named it on GitHub) in the list of projects and click "Set Up Project". Next, return to your terminal and push your latest changes to GitHub (the addition of our `config.yml` file.)

```sh
git add .
git commit -m "add config.yml file"
git push
```

Returning to CircleCI in your browser, you can now click "start building" to run your build. 

# Next Steps

This document provides a small overview to getting started with the CircleCI CLI tool. There are several more complex features that the CircleCI CLI offers:

- Creating, viewing, validating and publishing [orbs](https://circleci.com/orbs/)
- Querying the CircleCI GraphQL api
- Packing and Processing complex configuration files.

Consider reading our [document covering]({{site.baseurl}}/2.0/local-cli) the CLI for more details.
