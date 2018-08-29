---
layout: classic-docs
title: Nightly Builds
categories: [reference]
description: Nightly Builds
sitemap: false
---

The [Parameterized Build API]( {{ site.baseurl }}/1.0/parameterized-builds/)
allows you to trigger a build using the [CircleCI API]( {{ site.baseurl }}/api/v1-reference/#new-build)
and inject environment variables into the build environment. Typically a server in your own infrastructure or 3rd party service would be used to trigger these builds.

You can customize your `circle.yml` to take different actions, such as running a much more extensive test suite, when certain build parameters are present.

## Example

You've a straight-forward `circle.yml` for your project `example-corp/project-foo`.
It just sets a Python version and deploys to your staging Heroku app.

```yaml
machine:
  python:
    version: 2.7.6

deployment:
  staging:
    branch: master
    heroku:
      appname: staging-dawn-435
```

But sometimes you need to run a nightly build.
You have a large functional test suite that takes too long to run for a quick edit/test cycle during development.
These tests should be run once a day at least.

Creating a conditional step is easy; `circle.yml` commands are just shell commands and build parameters are just environment variables:

```yaml
machine:
  python:
    version: 2.7.6

test:
  post:
    - >
      if [ -n "${RUN_NIGHTLY_BUILD}" ]; then
        ./bin/run-functional-tests.sh ${FUNCTIONAL_TEST_TARGET};
      fi

deployment:
  staging:
    branch: master
    heroku:
      appname: staging-dawn-435
```

`./bin/run-functional-tests.sh` is only run if `RUN_NIGHTLY_BUILD` is set (`-n` means non-zero length).
Rather than hard-code the target app we use another build-parameter to specify the target for the functional test script in `FUNCTIONAL_TEST_TARGET`.

Now, create a simple script to trigger a build:

```
#!/bin/bash

_project=$1
_branch=$2
_circle_token=$3

trigger_build_url=https://circleci.com/api/v1.1/project/github/${_project}/tree/${_branch}?circle-token=${_circle_token}

post_data=$(cat <<EOF
{
  "build_parameters": {
    "RUN_NIGHTLY_BUILD": "true",
    "FUNCTIONAL_TEST_TARGET": "staging-dawn-435.herokuapp.com"
  }
}
EOF)

curl \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--data "${post_data}" \
--request POST ${trigger_build_url}
```

This triggers a new build of master, passing in the parameters `RUN_NIGHTLY_BUILD` and `FUNCTIONAL_TEST_TARGET`.

The final step to make this a nightly build is to invoke this script in a scheduled job as:

```
trigger_nightly_build.sh example-corp/project-foo master ${CIRCLE_TOKEN}
```

E.g. if you use `cron` you can set a new job to run every night as your user by running `crontab -e` and adding:

```
30 0 * * * /bin/bash /home/ubuntu/bin/trigger_nightly_build.sh example-corp/project-foo master $(cat /home/ubuntu/.circle_token) 2>&1 | /usr/bin/logger
```

This runs the trigger_nightly_build.sh script at 30 minutes past midnight (check your server time!).
It reads the CircleCI API token from `/home/ubuntu/.circle_token` and sends any output from the script to syslog via `logger`.

Note the use of full paths for all binaries, cronjobs aren't run with your normal environment so it's a good idea to always specify full paths.
