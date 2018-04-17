---
layout: classic-docs
title: "Test"
description: "CircleCI 2.0 test automation setup"
---
<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/HB5DehCufG0" frameborder="0" allowfullscreen></iframe>
</div>
### Set up to test a local config file
1 add a shell script in your `.circleci` directory, e.g. `run-build-locally.sh`
2 create a token on (cirlceci)[https://circleci.com/account/api]
3 export the token on the command line `export CIRCLE_TOKEN=<token-from-step-above>`
4 gather the following information:
  - commit hash from which to build
  - username
  - source for project
  - projectname
  - branch from which to build
5 add those values into your shell script
```
#!/usr/bin/env bash
curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=<commit hash>\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v2.0/project/<source, eg. github>/<user name>/<project name>/tree/<branch name>
```
Run the shell script and debug your config file without having to push through the repo.

Refer to the following documents for help with setting up your tests.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/configuration-reference/#run">Configuration Reference `run` Step section</a> | Write a job to run your tests.
[Browser Testing]({{ site.baseurl }}/2.0/browser-testing/) | Common methods for running and debugging browser tests in CircleCI.
<a href="{{ site.baseurl }}/2.0/collect-test-data/">Collecting Test Metadata</a> | How to set up various common test runners in your CircleCI configuration.
<a href="{{ site.baseurl }}/2.0/testing-ios/">Testing iOS Applications on macOS</a> | How to set up and customize testing for an iOS application with CircleCI.
<a href="{{ site.baseurl }}/2.0/parallelism-faster-jobs/">Running Tests in Parallel</a> | How to glob and splitting tests inside a job. 
<a href="{{ site.baseurl }}/2.0/postgres-config/">Configuring Databases</a> | Configuring a database container using Postgres and Rails. 
**Code Signing** |
<a href="{{ site.baseurl }}/2.0/ios-codesigning/">Setting Up Code Signing for iOS Projects</a> | Describes the guidelines for setting up code signing for your iOS or Mac project on CircleCI 2.0.
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
