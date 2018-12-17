---
layout: classic-docs
title: "Testing Config Files Locally"
description: "Example CircleCI 2.0 Configuration Files"
---

<div class="alert alert-info" role="alert">
<b>Note:</b> This document describes how to test and validate your config through the CircleCI API.
It is also possible to install the <a href="{{ site.baseurl }}/2.0/local-cli/#overview">CircleCI
CLI</a>, which allows you to <a href="{{ site.baseurl }}/2.0/local-cli/#validate-a-circleci-config">validate</a> your CircleCI config locally.
</div>

To add a script that tests your config file locally, complete the following steps:

1. Add a shell script in your `.circleci` directory, for example, `run-build-locally.sh`.
2. [Create a personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).
3. Export the token on the command line `export CIRCLE_TOKEN=<token-from-step-above>`.
4. Gather the following information:
  - Commit hash from which to build
  - Username
  - Source for project
  - Project name
  - Branch from which to build
5. Add those values into your shell script. 

```bash
#!/usr/bin/env bash
curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=<commit hash>\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/<source, eg. github>/<user name>/<project name>/tree/<branch name>
```

Now you can run the shell script and debug your `config.yml` file without having to push through the repo.

## See Also

[Using the Local CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/)

