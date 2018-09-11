---
layout: classic-docs
title: Building Pull Requests from Forks
short-title: Fork PR Builds
categories: [reference]
description: How to build Pull Requests from forks
sitemap: false
---

CircleCI has the ability to build pull request from forked repositories. This setting can be found within a project's setting page **Settings > Build Settings > Advanced Settings > Build forked pull requests**. Projects initially built on CircleCI will have this setting "Off" by default.

## Security Implications

Projects often contain sensitive information which make running an unrestricted build in the context of the parent repository potentially dangerous. In general, any configuration made available to a build is accessible to anyone who can push code which triggers the build (eg., that person can include commands in `circle.yml` to echo the data to the terminal and see it on the build page). So in this special case of running builds for fork PRs, we have to be careful.

An additional setting controls whether or not this sensitive information is available within forked PR builds at **Settings > Build Settings > Advanced Settings > Pass secrets to builds from forked pull requests**. There are 5 kinds of configuration data that we would normally use in a build which we suppress for builds triggered by pull requests from forks:

1. **Environment Variables (Settings > Build Settings > Environment Variables)**

   Non-sensitive environment variables for your project can be set in `circle.yml`; values configured via the web UI are stored encrypted at rest and injected into the build environment during regular builds.

   The variables configured via the `circle.yml` will be available in the fork PR builds (as they have access to the same `circle.yml` file); the values configured through the UI will not be visible to the fork PRs.

   *Note: If the same key is set in both, the web UI value overrides the `circle.yml` one.*

1. **Checkout Keys (Settings > Permissions > Checkout SSH keys)**

   In normal circumstances, we use either a per project deploy key or a GitHub user key to check out the code during a build. Deploy keys are keys valid for a specific project only, while a user key can be used to act as that user on GitHub.

   For safe fork PR builds, we use a user key associated with a machine GitHub user that CircleCI controls, so if they key is leaked due to a malicious PR it has no impact on your project.

1. **SSH Keys (Settings > Permissions > SSH Permissions)**

   These are passphraseless private keys which you can add to CircleCI to access arbitrary hosts during a build. They are not made available to fork PR builds.

1. **AWS permissions (Settings > Permissions > AWS Permissions)**

   This configuration gets stored in files in `~/.aws/` and would allow hostile code to perform actions through AWS API calls. This file is not made available to the fork PR builds.

1. **Deployment Credentials**

   Currently we offer streamlined configuration to facilitate deployment to Heroku and CodeDeploy. Any credentials you configure here will not be made available to fork PR builds.

*Note: CircleCI currently does not support this feature for Bitbucket repositories.*
