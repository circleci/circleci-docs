---
layout: classic-docs
title: "Using Shell Scripts"
description: "Best practices for using shell scripts for use in CircleCI configuration"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Overview
{: #overview }

Configuring CircleCI often requires writing shell scripts. While shell scripting can give you finer control over your pipelines, it is possible you will come across a few errors. You can avoid many of these errors by reviewing the best practices explained below.

## Shell script best practices
{: #shell-script-best-practices }

### Use ShellCheck
{: #use-shellcheck }

[ShellCheck](https://github.com/koalaman/shellcheck) is a shell script static analysis tool that gives warnings and suggestions for bash/sh shell scripts.

Use the [ShellCheck orb](https://circleci.com/developer/orbs/orb/circleci/shellcheck) for the simplest way to add ShellCheck to your configuration (remember to replace `x.y.z` with a valid version):

```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  check-build:
    jobs:
      - shellcheck/check # job defined within the orb so no further config necessary
      - build-job:
          requires:
            - shellcheck/check # only run build-job once shellcheck has run
          filters:
            branches:
              only: main # only run build-job on main branch

jobs:
  build-job:
    ...
```

Alternatively, ShellCheck can be configured without using the orb:

```yaml
version: 2.1
jobs:
  shellcheck:
    docker:
      - image: koalaman/shellcheck-alpine:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
  build-job:
    ...

workflows:
  check-build:
    jobs:
      - shellcheck
      - build-job:
          requires:
            - shellcheck # only run build-job once shellcheck has run
          filters:
            branches:
              only: main # only run build-job on main branch
```

Take caution when using `set -o xtrace` / `set -x` with ShellCheck. When the shell expands secret environment variables, they can be exposed, as in the example below.
{: class="alert alert-info" }

As cautioned above, observe how the `tmp.sh` script file reveals too much.

```shell
> cat tmp.sh
#!/bin/sh

set -o nounset
set -o errexit
set -o xtrace

if [ -z "${SECRET_ENV_VAR:-}" ]; then
  echo "You must set SECRET_ENV_VAR!"
fi
> sh tmp.sh
+ '[' -z '' ']'
+ echo 'You must set SECRET_ENV_VAR!'
You must set SECRET_ENV_VAR!
> SECRET_ENV_VAR='s3cr3t!' sh tmp.sh
+ '[' -z 's3cr3t!' ']'
```

### Set error flags
{: #set-error-flags }

There are several error flags you can set to automatically exit scripts when unfavorable conditions occur. As a best practice, add the following flags at the beginning of each script to protect yourself from tricky errors.

```shell
#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail
```

## Run a shell script
{: #run-a-shell-script }

In your terminal, navigate to the folder/location of the script you want to run. You can use `ls` to verify you have navigated to the correct path for the script. You should now be able to run the following in your terminal:

```bash
sh <name-of-file>.sh
```

Occasionally, a script might not be executable by default, and you will be required to make the file executable before you run it. This process differs per platform, and you will need to search how to do this for your specific platform.

For example, you can try to right-click on the script file and see if there is an option to make it executable. If you are on macOS or Linux, you can also look up how to use `chmod` commands to make a script file executable with different permissions.

## Additional resources
{: #additional-resources }

For more detailed explanations and additional techniques, see this [Writing Robust Bash Shell Scripts](https://www.davidpashley.com/articles/writing-robust-shell-scripts) blog post on writing robust shell scripts.
