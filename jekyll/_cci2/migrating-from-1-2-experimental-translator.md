---
layout: classic-docs
title: "Experimental Translator from 1.0 to 2.0 config"
short-title: "Experimental Translator for CircleCI 1.0 to 2.0"
description: "Instructions for using the experimental Translator to translate CircleCI 1.0 configuration to the 2.0 format."
categories: [migration]
hide: true
order: 15
---

This document provides instructions for using an experimental Translator that generates a CircleCI 2.0 configuration based on an existing 1.0 project.

* Contents
{:toc}

## Important Caveat:
This Translator is designed to produce working configuration, but not necessarily optimal configuration. The configuration generated is commented to help you understand the inferred commands that the 1.0 build engine executed. _For production use, we strongly recommend reading and manually creating your 2.0 configuration using our [documentation on migrating from 1.0 to 2.0]({{ site.baseurl }}/2.0/migrating-from-1-2/)_.

## Translator Overview
The configuration Translator is an experimental project to help with migrating from CircleCI 1.0 to 2.0. 

The approach in CircleCI 2.0 differs in a few significant ways that make an automated migration complicated:
1. **CircleCI 1.0 has "magic" inferred commands, whereas 2.0 is wholly deterministic.** In CircleCI 1.0 our Inference Engine runs implicit commands based on the contents of your repository in many cases. For instance, unless overridden, CircleCI 1.0 would detect the presence of rspec tests and run them automatically with no intervention. In 2.0 our philosophy is to run no "magic" commands, preferring instead to have all configuration be explicit and deterministic for developers. 
2. **CircleCI 1.0 has an opinionated lifecycle, whereas 2.0 is built around arbitrary jobs orchestrated with workflows.** In CircleCI 1.0 your build consists of specific stages that are baked into the system, and the configuration semantics are structured around those stages. In CircleCI 2.0 we allow for arbitrary jobs that are orchestrated with Workflows, so the idiom for how to structure the various tasks of your build is quite different and more powerful in 2.0.

## Translator Limitations
### Supported Languages
The Translator currently attempts to support transfer of inferred commands for the following languages (with some limitations for each):
* Ruby
* PHP
* Node.js
* iOS (partial: 1.0 code signing is not supported - use Fastlane instead)

Inferred commands from the following languages are NOT currently supported:
* Python
* Java (partial)
* Clojure
* Haskell

### Build Phases
* The Translator does NOT currently support the DEPLOY step of 1.0 builds.

## Using the Translator
When viewing the generated configuration files from the Translator, please be sure to read the in-line comments designed to explain why certain commands have been added. _For production use, we strongly recommend reading and manually creating your 2.0 configuration using our [documentation on migrating from 1.0 to 2.0]({{ site.baseurl }}/2.0/migrating-from-1-2/), using the generated configuration of the Translator as a reference_.

The simplest way to use the Translator is to hit an API endpoint passing the name of your CircleCI project building on 1.0. The Translator uses the build history of your 1.0 project to discern the inferred commands.

The API 1.1 endpoint is:

`GET: /project/:vcs-type/:username/:project/config-translation`

For instance, to use the Translator from your browser (assuming you are authenticated in circleci.com) for a repository called `foo` in a GitHub org named `bar` you could request this URL in your browser:

`https://circleci.com/api/v1.1/project/github/bar/foo/config-translation`

If you are not logged in and hitting the endpoint in your browser you can pass your `circle-token` directly in the query string. You can also optionally pass the `branch` you want to translate (default is to use whatever your default branch is in your VCS, typically `master`). For instance, if you were to call this with `curl` for the above theoerical project (assuming you had your CircleCI API token in an environment variable called `CIRCLE_TOKEN` it might look like:

``` Shell
curl https://circleci.com/api/v1.1/project/github/bar/foo/config-translation?circle-token=$CIRCLE_TOKEN&branch=develop
```
