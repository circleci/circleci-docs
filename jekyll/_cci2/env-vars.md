---
layout: classic-docs2
title: "CircleCI 2.0 Environment Variables"
short-title: "Environment Variables"
categories: [configuring-jobs]
order: 2001
---

**CI**

Represents whether the current environment is a CI environment.

Has a value of `true` on our platform.

**CIRCLECI**

Represents whether the current environment is a CircleCI environment

Has a value of `true` on our platform.

**CIRCLE_BRANCH**

The name of the Git branch currently being built.

**CIRCLECI_NODE_TOTAL**

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

Possible values include: `build`

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

Same as **CIRCLE_PULL_REQUESTS**, only kept for the backward compatibility with 1.0

**CI_PULL_REQUEST**

Same as **CIRCLE_PULL_REQUEST**, only kept for the backward compatibility with 1.0
