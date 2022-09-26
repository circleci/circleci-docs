---
layout: classic-docs
title: "Using Shell Scripts"
short-title: "Using Shell Scripts"
description: "Best practices for using shell scripts for use in CircleCI configuration"
categories: [getting-started]
order: 10
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

## Overview
{: #overview }

Configuring CircleCI often requires writing shell scripts. While shell scripting can grant finer control over your build, it is a subtle art that can produce equally subtle errors. You can avoid many of these errors by reviewing the best practices explained below.

## Shell script best practices
{: #shell-script-best-practices }

### Use ShellCheck
{: #use-shellcheck }

[ShellCheck](https://github.com/koalaman/shellcheck) is a shell script static analysis tool that gives warnings and suggestions for bash/sh shell scripts.

Use the [Shellcheck orb](https://circleci.com/developer/orbs/orb/circleci/shellcheck) for the simplest way to add shellcheck to your `version: 2.1` configuration (remember to replace `x.y.z` with a valid version):

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

Alternatively, shell check can be configured without using the orb if you are using version 2 configuration:

```yaml
version: 2
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
  version: 2
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

**Note:**
Be careful when using `set -o xtrace` / `set -x` with ShellCheck. When the shell expands secret environment variables, they will be exposed in a not-so-secret way.
In the example below, observe how the `tmp.sh` script file reveals too much.

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


### Set Error Flags
{: #set-error-flags }

There are several error flags you can set to automatically exit scripts when unfavorable conditions occur.
As a best practice, add the following flags at the beginning of each script to protect yourself from tricky errors.

```shell
#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail
```

## See also
{: #see-also }
{:.no_toc}

For more detailed explanations and additional techniques,
see [this blog post](https://www.davidpashley.com/articles/writing-robust-shell-scripts)
on writing robust shell scripts.
