---
layout: classic-docs
title: Environment variables
categories: [reference]
last_updated: Apr 13, 2015
---

We export a number of environment variables during each build, which you may find
useful for more complex testing or deployment.

### Basics

Ideally, you won't have code which behaves differently in CI. But for the cases
when it's necessary, we set two environment variables which you can test:

<dl>
  <dt>
    `CIRCLECI`
  </dt>
  <dd>
    true
  </dd>
  <dt>
    `CI`
  </dt>
  <dd>
    true
  </dd>
</dl>

### Build Details

We publish the details of the currently running build in these variables:

<dl>
  <dt>
    `CIRCLE_PROJECT_USERNAME`
  </dt>
  <dd>
    The username or organization name of the project being tested, i.e. "foo" in circleci.com/gh/foo/bar/123
  </dd>
  <dt>
    `CIRCLE_PROJECT_REPONAME`
  </dt>
  <dd>
    The repository name of the project being tested, i.e. "bar" in circleci.com/gh/foo/bar/123
  </dd>
  <dt>
    `CIRCLE_BRANCH`
  </dt>
  <dd>
    The name of the branch being tested, e.g. 'master'.
  </dd>
  <dt>
    `CIRCLE_SHA1`
  </dt>
  <dd>
    The SHA1 of the commit being tested.
  </dd>
  <dt>
    `CIRCLE_REPOSITORY_URL`
  </dt>
  <dd>
    A link to the homepage for the current repository, for example, `https://github.com/circleci/frontend`.
  </dd>
  <dt>
    `CIRCLE_COMPARE_URL`
  </dt>
  <dd>
    A link to GitHub's comparison view for this push. Not present for builds that are triggered by GitHub pushes.
  </dd>
  <dt>
    `CIRCLE_BUILD_URL`
  </dt>
  <dd>
    A permanent link to the current build, for example, `https://circleci.com/gh/circleci/frontend/933`.
  </dd>
  <dt>
    `CIRCLE_BUILD_NUM`
  </dt>
  <dd>
    The build number, same as in circleci.com/gh/foo/bar/123
  </dd>
  <dt>
    `CIRCLE_PREVIOUS_BUILD_NUM`
  </dt>
  <dd>
    The build number of the previous build, same as in circleci.com/gh/foo/bar/123
  </dd>
  <dt>
    `CI_PULL_REQUESTS`
  </dt>
  <dd>
    Comma-separated list of pull requests this build is a part of.
  </dd>
  <dt>
    `CI_PULL_REQUEST`
  </dt>
  <dd>
    If this build is part of only one pull request, its URL will be populated here. If there was more than one pull request, it will contain one of the pull request URLs (picked randomly).
  </dd>
  <dt>
    `CIRCLE_ARTIFACTS`
  </dt>
  <dd>
    The directory whose contents are automatically saved as [build artifacts](/docs/build-artifacts).
  </dd>
  <dt>
    `CIRCLE_USERNAME`
  </dt>
  <dd>
    The GitHub login of the user who either pushed the code to GitHub or triggered the build from the UI/API.
  </dd>
  <dt>
    `CIRCLE_TEST_REPORTS`
  </dt>
  <dd>
    The directory whose contents are automatically processed as [JUnit test metadata](/docs/test-metadata).
  </dd>

</dl>

### Building pull requests that come from forks

When the build is a part of a pull request from a fork, these variables
will be available:

<dl>
  <dt>
    `CIRCLE_PR_USERNAME`
  </dt>
  <dd>
    The username of the owner of the fork.
  </dd>
  <dt>
    `CIRCLE_PR_REPONAME`
  </dt>
  <dd>
    The name of the repository the pull request was submitted from.
  </dd>
  <dt>
    `CIRCLE_PR_NUMBER`
  </dt>
  <dd>
    The number of the pull request this build forms part of.
  </dd>
</dl>

### Parallelism

These variables are available for [manually setting up parallelism](/docs/parallel-manual-setup):

<dl>
  <dt>
    `CIRCLE_NODE_TOTAL`
  </dt>
  <dd>
    The total number of nodes across which the current test is running.
  </dd>
  <dt>
    `CIRCLE_NODE_INDEX`
  </dt>
  <dd>
    The index (0-based) of the current node.
  </dd>
</dl>

### Other

There are quite a few other environment variables set. Here are some of
the ones you might be looking for:

<dl>
  <dt>
    `HOME`
  </dt>
  <dd>
    /home/ubuntu
  </dd>
  <dt>
    `DISPLAY`
  </dt>
  <dd>
    :99
  </dd>
  <dt>
    `LANG`
  </dt>
  <dd>
    en_US.UTF-8
  </dd>
  <dt>
    `PATH`
  </dt>
  <dd>
    Includes /home/ubuntu/bin
  </dd>
</dl>

<h3 id="custom">Set your own!</h3>

You can of course set your own environment variables, too!
The only gotcha is that each command runs in its own shell, so just adding an
`export FOO=bar` command won't work.

#### Setting environment variables for all commands using circle.yml

You can set environment variables in your `circle.yml` file, that
[will be set for every command](/docs/configuration#environment).

#### Setting environment variables for all commands without adding them to git

Occasionally, you'll need to add an API key or some other secret as
an environment variable.  You might not want to add the value to your
git history.  Instead, you can add environment variables using the
**Project settings &gt; Environment Variables** page of your project.

All commands and data on CircleCI's VMs can be accessed by any of your colleagues&mdash;we run your arbitrary code, so it is not possible to secure.
Take this into account before adding important credentials that some colleagues do not have access to.

It's important to note that environment variables configured through
the UI are exported during the `machine` section of the build.  This
means you cannot read UI environment variables during the `machine: pre`.

#### Per-command environment variables

You can set environment variables per-command as well.
You can use standard bash syntax in your commands:

```
RAILS_ENV=test bundle exec rake test
```

You can also use [the environment modifier](/docs/configuration#modifiers) in your
`circle.yml` file.
