---
layout: classic-docs
title: Using CircleCI 1.0 Environment Variables
categories: [configuration-tasks]
description: How to work with environment variables
order: 30
sitemap: false
---

We export a number of environment variables during each build, which you may find
useful for more complex testing or deployment.

## Basics

Ideally, you won't have code which behaves differently in CI. But for the cases
when it's necessary, we set two environment variables which you can test:

`CIRCLECI`

true

`CI`

true

We use Bash, which follows the POSIX naming convention for environment variables. Basically, uppercase and lowercase letters, digits, and the underscore are allowed. With the added rule that the first character should be a letter. Variable names are case-sensitive.

## Build Details

We publish the details of the currently running build in these variables:

`CIRCLE_PROJECT_USERNAME`

The username or organization name of the project being tested, i.e. "foo" in circleci.com/gh/foo/bar/123

`CIRCLE_PROJECT_REPONAME`

The repository name of the project being tested, i.e. "bar" in circleci.com/gh/foo/bar/123

`CIRCLE_BRANCH`

The name of the Git branch being tested, e.g. 'master', if the build is running for a branch.

`CIRCLE_TAG`

The name of the git tag being tested, e.g. 'release-v1.5.4', if the build is running [for a tag]( {{ site.baseurl }}/1.0/configuration/#tags).

`CIRCLE_SHA1`

The SHA1 of the commit being tested.

`CIRCLE_REPOSITORY_URL`

A link to the homepage for the current repository, for example, `https://github.com/circleci/frontend`.

`CIRCLE_COMPARE_URL`

A link to GitHub's comparison view for this push. Not present for builds that are triggered by GitHub pushes.

`CIRCLE_BUILD_URL`

A permanent link to the current build, for example, `https://circleci.com/gh/circleci/frontend/933`.

`CIRCLE_BUILD_NUM`

The build number, same as in circleci.com/gh/foo/bar/123

`CIRCLE_PREVIOUS_BUILD_NUM`

The build number of the previous build, same as in circleci.com/gh/foo/bar/123

`CI_PULL_REQUESTS`

Comma-separated list of pull requests this build is a part of.

`CI_PULL_REQUEST`

If this build is part of only one pull request, its URL will be populated here. If there was more than one pull request, it will contain one of the pull request URLs (picked randomly).

`CIRCLE_ARTIFACTS`

The directory whose contents are automatically saved as [build artifacts](/docs/1.0/build-artifacts/).

`CIRCLE_USERNAME`

The GitHub login of the user who either pushed the code to GitHub or triggered the build from the UI/API.

`CIRCLE_TEST_REPORTS`

The directory whose contents are automatically processed as [JUnit test metadata](/docs/1.0/test-metadata/).

### Building pull requests that come from forks

When the build is a part of a pull request from a fork, these variables
will be available:

`CIRCLE_PR_USERNAME`

The username of the owner of the fork.

`CIRCLE_PR_REPONAME`

The name of the repository the pull request was submitted from.

`CIRCLE_PR_NUMBER`

The number of the pull request this build forms part of.

## Parallelism

These variables are available for [manually setting up parallelism](/docs/1.0/parallel-manual-setup/):

`CIRCLE_NODE_TOTAL`

The total number of nodes across which the current test is running.

`CIRCLE_NODE_INDEX`

The index (0-based) of the current node.

`CIRCLE_BUILD_IMAGE`

The build image this build runs on.

## Other

There are quite a few other environment variables set. Here are some of
the ones you might be looking for:

`HOME`

/home/ubuntu

`DISPLAY`

:99

`LANG`

en_US.UTF-8

`PATH`

Includes /home/ubuntu/bin

<h3 id="custom">Set your own!</h3>

You can of course set your own environment variables, too!
The only gotcha is that each command runs in its own shell, so just adding an
`export FOO=bar` command won't work.

All commands and data on CircleCI's VMs can be accessed by any of your colleagues&mdash;we run your arbitrary code, so it is not possible to secure.
Take this into account before adding important credentials that some colleagues do not have access to.
Similarly, **if your CircleCI project is public, don't put any sensitive information/credentials into CircleCI**, as environment variables or otherwise.

## Setting environment variables for all commands using circle.yml

You can set environment variables in your `circle.yml` file, that
[will be set for every command](/docs/1.0/configuration/#environment).

## Setting environment variables for all commands without adding them to git

Occasionally, you'll need to add an API key or some other secret as
an environment variable.  You might not want to add the value to your
git history.  Instead, you can add environment variables using the
**Project settings &gt; Environment Variables** page of your project.

It's important to note that environment variables configured through
the UI are exported during the `machine` section of the build.  This
means you cannot read UI environment variables during the `machine: pre`. Another note, the value of these variables won't be readable in the UI after setting them nor can you edit it. If you need to change its value, you should delete the current variable and add it again with the new value.

## Keeping encrypted environment variables in source code

If you prefer to keep your sensitive environment variables checked into
git, but encrypted, you can follow the process outlined at
[circleci/encrypted-files](https://github.com/circleci/encrypted-files).


## Per-command environment variables

You can set environment variables per-command as well.
You can use standard bash syntax in your commands:

```
RAILS_ENV=test bundle exec rake test
```

You can also use [the environment modifier](/docs/1.0/configuration/#modifiers) in your
`circle.yml` file.

**Note:** We don't parse any environment variables in the `webhooks` section of `circle.yml`.
