---
layout: classic-docs
title: "Using Shell Scripts"
short-title: "Using Shell Scripts"
description: "Best practices for using shell scripts for use in CircleCI configuration"
categories: [getting-started]
order: 10
---

This document describes best practices
for using shell scripts in your [CircleCI configuration]({{ site.baseurl }}/2.0/configuration-reference/) in the following sections:

* TOC
{:toc}

## Overview

Configuring CircleCI often requires
writing shell scripts.
While shell scripting can grant finer control over your build,
it is a subtle art
that can produce equally subtle errors.
You can avoid many of these errors
by reviewing the best practices
explained below.

## Shell Script Best Practices

### Use ShellCheck
{:.no_toc}

[ShellCheck](https://github.com/koalaman/shellcheck) is a shell script static analysis tool
that gives warnings and suggestions for bash/sh shell scripts.

ShellCheck works best with CircleCI
when you add it as a separate job in your `.circleci/config.yml` file.
This allows you
to run the `shellcheck` job in parallel with other jobs in a workflow.

```yaml
version: 2
jobs:
  shellcheck:
    docker:
      - image: koalaman/shellcheck-alpine:stable
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
  workflow:
    jobs:
      - shellcheck
      - build-job:
          requires:
            - shellcheck
          filters:
            branches:
              only: master
```

**Note:**
Be careful when using `set -o xtrace` / `set -x` with ShellCheck.
When the shell expands secret environment variables,
they will be exposed in a not-so-secret way.
In the example below,
observe how the `tmp.sh` script file reveals too much.

```
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
{:.no_toc}

There are several error flags
you can set
to automatically exit scripts
when unfavorable conditions occur.
As a best practice,
add the following flags at the beginning of each script
to protect yourself from tricky errors.

```bash
#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail
```

## See Also

For more detailed explanations and additional techniques,
see [this blog post](https://www.davidpashley.com/articles/writing-robust-shell-scripts)
on writing robust shell scripts.
