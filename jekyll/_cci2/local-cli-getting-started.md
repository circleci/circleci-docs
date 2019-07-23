---
layout: classic-docs
title: "Getting Started with the Local CLI "
short-title: "Getting Started with the Local CLI"
description: "An introduction to interfacing with CircleCI from the commandline"
categories: [getting-started]
order: 50
---

# Overview

For those who prefer to spend most of their development time in the terminal, consider installing the CircleCI CLI to interact with your CircleCI projects and other components of the web application. This document provides a step by step document on getting started with getting a project on CircleCI while using the terminal as much as possible. 

# Prerequisites

- You are using a unix-machine (Mac or linux).
- You have a basic knowledge of CI/CD and the features and concepts of CircleCI's offerings.
- You have a GitHub account
- You have a CircleCI account.
- You have your terminal open and ready to go.

If some of these prerequisites sound unfamiliar, or you are new to the CircleCI platform, you may want to consider reading our [getting started](???) guide or reading our [getting started concepts document](https://circleci.com/docs/2.0/concepts/#section=getting-started) before proceeding.

# Steps

## Initialize a Git Repo.

Let's start from the very basics. Create a project and initialize a git repository.

```sh
cd ~ ; mkdir foo_ci ; cd foo_ci # navigate to ~, make a folder and change directories into it.
git init # create a git repository
touch README.md # Create a file to put in our repository
echo "Hello World!" >> README.md # add some demo content to our new file.
```

## Connect Your Git Repo to a VCS

Great! We have a git repository set up, with one file. We need to connect out local git repository to a Version Control System - either GitHub or BitBucket. Let's do that now.

Head over to GitHub, login, and [create a new respository](https://github.com/new).

![]()

## Connect Your Repo to CircleCI

## Download the CircleCI CLI

## Connect Your API Tokevyn to the CLI

## 

## Create a Simple CircleCI Configuration
Look for an Orb.

## Validate Your Config Before Pushing



