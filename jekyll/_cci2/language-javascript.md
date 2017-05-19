---
layout: classic-docs
title: "Language Guide: JavaScript"
short-title: "JavaScript"
description: "Overview and sample config for a JavaScript project"
categories: [language-guides]
order: 4
---

## Overview

This guide will help you get started with a JavaScript project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

```YAML
version: 2
jobs:
  build:
    docker:
      - image: node:7.4.0
    working_directory: ~/cci-demo-react
    steps:
      - checkout
      - run: mkdir -p ~/cci-demo-react/artifacts
      - run: npm install
      - run: npm test
      - store_artifacts:
          path: ~/cci-demo-react/artifacts
      - add_ssh_keys
      - deploy:
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              # Install Heroku fingerprint
              mkdir -p ~/.ssh
              echo 'heroku.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAu8erSx6jh+8ztsfHwkNeFr/SZaSOcvoa8AyMpaerGIPZDB2TKNgNkMSYTLYGDK2ivsqXopo2W7dpQRBIVF80q9mNXy5tbt1WE04gbOBB26Wn2hF4bk3Tu+BNMFbvMjPbkVlC2hcFuQJdH4T2i/dtauyTpJbD/6ExHR9XYVhdhdMs0JsjP/Q5FNoWh2ff9YbZVpDQSTPvusUp4liLjPfa/i0t+2LpNCeWy8Y+V9gUlDWiyYwrfMVI0UwNCZZKHs1Unpc11/4HLitQRtvuk0Ot5qwwBxbmtvCDKZvj1aFBid71/mYdGRPYZMIxq1zgP1acePC1zfTG/lvuQ7d0Pe0kaw==' >> ~/.ssh/known_hosts

              git config --global push.default simple
              git push -f git@heroku.com:cci-demo-react.git
            fi
```

## Get the Code

The configuration above is from a demo React app, which you can access at [https://github.com/circleci/cci-demo-react](https://github.com/circleci/cci-demo-react).

Fork the project and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we specify a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
...
jobs:
  build:
    working_directory: ~/cci-demo-react
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```YAML
...
    docker:
      - image: node:7.4.0
```

Now we’ll add several `steps` within the `build` job.

One difference between CircleCI Classic and 2.0 is that 2.0 doesn’t automatically make an artifacts directory. Let’s do that now.

```YAML
...
    steps:
      - checkout
      - run: mkdir ~/cci-demo-react/artifacts
```

Next, let's install our dependencies. In CircleCI Classic, we would have done this in a separate `dependencies` stage.

```YAML
...
      - run: npm install
```

Next, we run our tests. Like dependencies, this would have been run in a separate `test` stage in CircleCI Classic.

```YAML
...
      - run: npm test
```

Remember when we created a directory for our artifacts? CircleCI won't unless we tell it where to look.

```YAML
...
      - store_artifacts:
          path: ~/cci-demo-react/artifacts
```

We also want to deploy our app to Heroku, so we'll do that with another step after adding the SSH keys needed for deploy. Because 2.0 doesn't yet have built-in commands to deploy by branch, we use a Bash conditional to determine if the current branch is appropriate.

If it is the right branch, we'll add the SSH key fingerprint directly. Note the git commands as well.

```YAML
...
      - add_ssh_keys
      - deploy:
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              # Install Heroku fingerprint
              mkdir -p ~/.ssh
              echo 'heroku.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAu8erSx6jh+8ztsfHwkNeFr/SZaSOcvoa8AyMpaerGIPZDB2TKNgNkMSYTLYGDK2ivsqXopo2W7dpQRBIVF80q9mNXy5tbt1WE04gbOBB26Wn2hF4bk3Tu+BNMFbvMjPbkVlC2hcFuQJdH4T2i/dtauyTpJbD/6ExHR9XYVhdhdMs0JsjP/Q5FNoWh2ff9YbZVpDQSTPvusUp4liLjPfa/i0t+2LpNCeWy8Y+V9gUlDWiyYwrfMVI0UwNCZZKHs1Unpc11/4HLitQRtvuk0Ot5qwwBxbmtvCDKZvj1aFBid71/mYdGRPYZMIxq1zgP1acePC1zfTG/lvuQ7d0Pe0kaw==' >> ~/.ssh/known_hosts

              git config --global push.default simple
              git push -f git@heroku.com:cci-demo-react.git
            fi
```

Nice! You just set up CircleCI for a React app. Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-react).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
