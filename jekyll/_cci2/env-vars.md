---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI 2.0"
categories: [configuring-jobs]
order: 40
---

To add environment variables to your build, use the Environment Variables page of your Build > Project > Settings in the CircleCI application. You can add individual variables or import from another project. To define environment variables in your configuration, use the `environment` key in your `.circleci/config.yml` file, see the [docker/machine executor](https://circleci.com/docs/2.0/configuration-reference/#docker--machine-executor) document for details.

## CircleCI Environment Variables

CircleCI exports the environment variables in this section during each build, which are
useful for more complex testing or deployment. Ideally, you will not have code which behaves differently in CI. But for the cases when it is necessary, CircleCI sets two environment variables which you can test:

`CIRCLECI`

true

`CI`

true

CircleCI uses Bash, which follows the POSIX naming convention for environment variables. Uppercase and lowercase letters, digits, and the underscore are allowed. With the added rule that the first character must be a letter.

## Build Details

CircleCI publishes the details of the currently running build in this list of variables:


**CI**

Represents whether the current environment is a CI environment.

Has a value of `true` on our platform.

**CIRCLECI**

Represents whether the current environment is a CircleCI environment.

Has a value of `true` on our platform.

**CIRCLE_BRANCH**

The name of the Git branch currently being built.

**CIRCLE_NODE_TOTAL**

An integer representing the number of total build instances.

**CIRCLE_NODE_INDEX**

An integer between 0 and (CIRCLECI_NODE_TOTAL - 1) representing a specific build instance.

**CIRCLE_BUILD_NUM**

The CircleCI build number.

**CIRCLE_PREVIOUS_BUILD_NUM**

The number of previous builds in the branch.

**CIRCLE_BUILD_URL**

The URL for the current build.

**CIRCLE_SHA1**

The SHA1 hash for the current build’s last commit.

**CIRCLE_USERNAME**

The GitHub/Bitbucket username of the user who triggered the build.

**CIRCLE_JOB**

The current job’s type.

Possible values include: `build`.

**CIRCLE_COMPARE_URL**

The GitHub/Bitbucket compare URL between commits in the build.

**CIRCLE_REPOSITORY_URL**

The GitHub/Bitbucket repository URL.

**CIRCLE_PR_NUMBER** (_only available in forked PR builds_)

The GitHub/Bitbucket pull request number.

**CIRCLE_PR_REPONAME** (_only available in forked PR builds_)

The GitHub/Bitbucket repository name in which the pull request was made.

**CIRCLE_PR_USERNAME** (_only available in forked PR builds_)

The GitHub/Bitbucket username of the user who created the pull request.

**CIRCLE_PULL_REQUESTS**

Comma-separated list of pull requests this build is a part of.

**CIRCLE_PULL_REQUEST**

If this build is part of only one pull request, its URL will be populated here. If there was more than one pull request, it will contain one of the pull request URLs (picked randomly).

**CI_PULL_REQUESTS**

Same as **CIRCLE_PULL_REQUESTS**, only kept for the backward compatibility with 1.0.

**CI_PULL_REQUEST**

Same as **CIRCLE_PULL_REQUEST**, only kept for the backward compatibility with 1.0.

**CIRCLE_TAG**

The name of the git tag being tested, e.g. 'release-v1.5.4', if the build is running [for a tag]( {{ site.baseurl }}/1.0/configuration/#tags).

**CIRCLE_PROJECT_USERNAME**

The username or organization name of the project being tested, i.e. “foo” in circleci.com/gh/foo/bar/123.

**CIRCLE_PROJECT_REPONAME**

The repository name of the project being tested, i.e. “bar” in circleci.com/gh/foo/bar/123.
