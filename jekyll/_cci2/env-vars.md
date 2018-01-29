---
layout: classic-docs
title: "Using Environment Variables"
short-title: "Using Environment Variables"
description: "A list of supported environment variables in CircleCI 2.0"
categories: [configuring-jobs]
order: 40
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Using Environment Variables*

This document describes using environment variables in CircleCI in the following sections:

* TOC
{:toc}

## Adding Environment Variables in the App

To add keys or secret environment variables to your private project, use the Environment Variables page of the Build > Project > Settings in the CircleCI application. The value of the variables are neither readable nor editable in the app after they are set. To change the value of an environment variable, delete the current variable and add it again with the new value. It is possible to add individual variables or to import variables from another project. 

### Adding Global Environment Variables

To add global environment variables that may be shared across projects, use the Settings > Contexts page of the CircleCI application. See the [Contexts]( {{ site.baseurl }}/2.0/contexts/) documentation for instructions.

## Adding Environment Variables in the config.yml File

**Warning**: Do **not** add keys or secrets to a public CircleCI project. 
Be careful that the output doesn't appear in build logs and that the variables are set using the CircleCI application and not in the `config.yml` file.

### Adding Environment Variables to a job

To define environment variables for a job command, use the `environment` key under the job name in the `jobs` section.
See [here](https://circleci.com/docs/2.0/configuration-reference/#job_name) for more details.
Ex:

```
version: 2.0

jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      - FOO: "bar"
```

### Adding Environment Variables to a container

Use the `environment` key in your `image` section to set variables for all commands run in the container.

```
version: 2.0
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
      - image: circleci/postgres:9.6
      # Environment variable for all commands executed in the primary container
        environment:
          POSTGRES_USER: conductor
          POSTGRES_DB: conductor_test
```

The following example shows separate environment variable settings for the primary container image (listed first) and the secondary or service container image.

```
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2
       # Environment variable for all commands executed in the primary container
        environment:
          FLASK_CONFIG: testing
          TEST_DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6
```

See the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference/#docker--machine-executor) document for details of the specification for the `environment` key of the docker executor type.

### Adding Environment Variables to a step:

Use the environment key inside a run step to set variables for a single command shell as shown in the following example:

```
version: 2.0
jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
    steps:
      - checkout
      - run:
          name: Run migrations
          command: sql/docker-entrypoint.sh sql
          # Environment variable for a single command shell
          environment:
            DATABASE_URL: postgres://conductor:@localhost:5432/conductor_test
```

## Interpolating Environment Variables to Set Other Environment Variables

If you need to interpolate other environment variables to set an environment variable, the only place to do this at the moment is in Bash.  CircleCI 2.0 automatically sets a `$BASH_ENV` variable to a random name in `/tmp`, and will source this file for each step.

### Setting PATH

For example, this is how you could set PATH within a build:

```
    steps:
      - run: echo 'export PATH=/foo/bin:$PATH' >> $BASH_ENV
      - run: some_program_in_foo_bin
```

## Injecting Environment Variables with the API

Build parameters are environment variables, therefore their names have to meet the following restrictions:

- They must contain only ASCII letters, digits and the underscore character.
- They must not begin with a number.
- They must contain at least one character.

Aside from the usual constraints for environment variables there are no restrictions on the values themselves and are treated as simple strings. The order that build parameters are loaded in is not guaranteed so avoid interpolating one build parameter into another. It is best practice to set build parameters as an unordered list of independent environment variables.

For example, when you pass the parameters:

```
{
  "build_parameters": {
    "foo": "bar",
    "baz": 5,
    "qux": {"quux": 1},
    "list": ["a", "list", "of", "strings"]
  }
}
```

Your build will see the environment variables:

```
export foo="bar"
export baz="5"
export qux="{\"quux\": 1}"
export list="[\"a\", \"list\", \"of\", \"strings\"]"
```

Build parameters are exported as environment variables inside the build's containers and can be used by scripts/programs and commands in `config.yml`. The injected environment variables may be used to influence the steps that are run during the build. It is important to note that injected environment variables will not override values defined in `config.yml` nor in the project settings.

You might want to inject environment variables with the `build_parameters` key to enable your functional tests to build against different targets on each run. For example, a run with a deploy step to a staging environment that requires functional testing against different hosts. It is possible to include `build_parameters` by sending a JSON body with `Content-type: application/json` as in the following example that uses `bash` and `curl` (though you may also use an HTTP library in your language of choice).

```
{
  "build_parameters": {
    "param1": "value1",
    "param2": 500
  }
}
```

For example using `curl`

```
curl \
  --header "Content-Type: application/json" \
  --data '{"build_parameters": {"param1": "value1", "param2": 500}}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/circleci/mongofinil/tree/master?circle-token=$CIRCLE_TOKEN
```

The build will see the environment variables:

```
export param1="value1"
export param2="500"
```

Start a run with the POST API call, see the [new build]( {{ site.baseurl }}/api/v1-reference/#new-build) section of the API documentation for details. A POST with an empty body will start a new run of the named branch.


## CircleCI Environment Variable Descriptions

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

The current job’s name.

**CIRCLE_WORKING_DIRECTORY**

The `working_directory` for the current job.

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

Comma-separated list of URLs of pull requests this build is a part of.

**CIRCLE_PULL_REQUEST**

If this build is part of only one pull request, its URL will be populated here. If there was more than one pull request, it will contain one of the pull request URLs (picked randomly).

**CI_PULL_REQUESTS**

Same as **CIRCLE_PULL_REQUESTS**, only kept for the backward compatibility with 1.0.

**CI_PULL_REQUEST**

Same as **CIRCLE_PULL_REQUEST**, only kept for the backward compatibility with 1.0.

**CIRCLE_TAG**

The name of the git tag being tested, e.g. 'release-v1.5.4', if the build is running for a tag. See the [CircleCI 1.0 documentation of tags]( {{ site.baseurl }}/1.0/configuration/#tags) for more information.

**CIRCLE_PROJECT_USERNAME**

The username or organization name of the project being tested, i.e. “foo” in circleci.com/gh/foo/bar/123.

**CIRCLE_PROJECT_REPONAME**

The repository name of the project being tested, i.e. “bar” in circleci.com/gh/foo/bar/123.

**CIRCLE_INTERNAL_TASK_DATA**

The directory where test timing data can be found.

**CIRCLE_STAGE**

The job being executed. The default 2.0 job is `build` without using Workflows.
