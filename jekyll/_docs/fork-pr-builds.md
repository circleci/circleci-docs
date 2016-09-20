---
layout: classic-docs
title: Building Pull Requests from forks
short-title: Fork PR Builds
categories: [reference]
description: How to build Pull Requests from forks
last_updated: April 2, 2015
---

When someone submits a pull request against your project you want to see if the
tests pass before deciding whether to accept their code or not. In the case of a PR from a fork
it would be great if the forker didn't have to know or care that the forkee is using CircleCI.

## Quick Start

Suppose your repository is https://github.com/yourorg/yourproject, and someone creates a fork at
otherdev/yourproject then:

If yourorg/yourproject is a public repository, we will run builds for pull requests
from otherdev/yourproject under yourorg/yourproject on CircleCI, with some restrictions
outlined below.

If yourorg/yourproject is private, we *will not* automatically run builds against pull requests
from the fork. You can explicitly allow fork PR builds using the advanced feature setting on
_your-org_/_your-project_ at Project settings > Build Settings > Advanced Settings > Project, but it will expose
sensitive information to the fork developers.

<span class='label label-info'>Note:</span> If otherdev/yourproject is explicitly configured to
build on CircleCI in its own right, then we will not run builds in the yourorg/yourproject context
for PRs from the fork in either case.

## Details

### Security Implications of running builds for pull requests from forks

Project settings on CircleCI often
contain sensitive information which make running an unrestricted build in the context of the parent
repository potentially dangerous. In general, any configuration which is made available to a build
is accessible to anyone who can push code which triggers the build (eg., that person can
include commands in circle.yml to echo the data to the terminal and see it on the build page.)
So in this special case of running builds for fork PRs, we have to be careful.

There are 5 kinds of configuration data that we would normally use in a build which we suppress
for builds triggered by pull requests from forks:

1. **Environment variables configured via the web UI**
   (configured in Project settings > Build Settings > Environment variables)

   Non-sensitive environment variables for your project can be set
   in circle.yml; values configured via the web UI are stored encrypted at rest and
   injected into the build environment during regular builds.

   The variables configured via the `circle.yml` will be available in
   the fork PR builds (as they have access to the same `circle.yml` file);
   the values configured through the UI will not be visible to the fork
   PRs.

   <span class='label label-info'>Note:</span> If the same key is set in both, the web UI value overrides the circle.yml one.

2. **Checkout keys**
   (configured in Project settings > Permissions > Checkout SSH keys)

   In normal circumstances, we use either a per project deploy key or a GitHub user key to check
   out the code during a build. Deploy keys are keys valid for a specific project only, while a user
   key can be used to act as that user on GitHub.

   For safe fork PR builds, we use a user key associated with a machine GitHub user that
   CircleCI controls, so if they key is leaked due to a malicious PR it has no impact
   on your project.

3. **SSH keys**
   (configured in Project settings > Permissions > SSH Permissions)

   These are passphraseless private keys which you can add to CircleCI to access arbitrary
   hosts during a build. They are not made available to fork PR builds.

4. **AWS permissions**
   (configured in Project settings > Permissions > AWS Permissions)

   This configuration gets stored in files in ~/.aws/ and would allow hostile code to perform actions through AWS API calls. This file is not made available to the fork PR builds.

5. **Deployment credentials**

   Currently we offer streamlined configuration to facilitate deployment to Heroku and
   CodeDeploy. Any credentials you configure here will not be made available to fork PR builds.

#### CircleCI will only run builds of pull requests from forks for public GitHub repositories by default.

We do this because of the **Checkout keys** issue above; we can't use a generic user key to
check out your code for a private repository.


### Unsafe fork PR builds

In the event that you *want* these five categories of configuration to be made available, or you need
to run fork PR builds for private repositories, you need to affirmatively enable it because of these
security issues.

There is a per-project flag (in Project settings > Build Settings > Advanced Settings > Project fork pull requests)
which will cause us to run builds of all fork pull requests without suppressing any of the sensitive
information listed above.

### Note

CircleCI currently does not support this feature for Bitbucket repositories. 
