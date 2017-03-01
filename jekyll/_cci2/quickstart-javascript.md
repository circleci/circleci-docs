---
layout: classic-docs
title: "Quickstart Guide: JavaScript"
short-title: "JavaScript"
categories: [quickstart-guides]
order: 2
---

This guide should help get you started with a JavaScript project on CircleCI 2.0. This walkthrough will be pretty thorough and will explain why we need each piece of configuration. If you’re just looking for a sample `config.yml` file, then just skip to the end.

If you want to follow along, fork our [example React app](https://github.com/circleci/cci-demo-react) and add the project through CircleCI. Once you’ve done that, create an empty `.circleci/config.yml` in your project’s root.

Enough talk, let’s get started!

---

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-react
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-react
    docker:
      - image: node:7.4.0
```

Now we’ll add several `steps` within the `build` stage.

One difference between CircleCI Classic and 2.0 is that 2.0 doesn’t automatically make an artifacts directory. Let’s do that now.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-react
    docker:
      - image: node:7.4.0
    steps:
      - run:
          name: Pre-Dependencies
          command: mkdir ~/cci-demo-react/artifacts
```

Next, let's install our dependencies. In CircleCI Classic, we would have done this in a separate `dependencies` stage.

```yaml
...
      - run:
          name: Dependencies
          command: npm install
```

Next, we run our tests. Like dependencies, this would have been run in a separate `test` stage in CircleCI Classic.

```yaml
      - run:
          name: NPM Test
          command: npm test
```

Remember when we created a directory for our artifacts? CircleCI won't unless we tell it where to look.

```yaml
      - store_artifacts:
          path: ~/cci-demo-react/artifacts
```

We also want to deploy our app to Heroku, so we'll do that with another step after adding the SSH keys needed for deploy. Because 2.0 doesn't yet have built-in commands to deploy by branch, we use a Bash conditional to determine if the current branch is appropriate.

If it is the right branch, we'll add the SSH key fingerprint directly. Note the git commands as well.

```yaml
      - add_ssh_keys
      - deploy:
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              echo 'heroku.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAu8erSx6jh+8ztsfHwkNeFr/SZaSOcvoa8AyMpaerGIPZDB2TKNgNkMSYTLYGDK2ivsqXopo2W7dpQRBIVF80q9mNXy5tbt1WE04gbOBB26Wn2hF4bk3Tu+BNMFbvMjPbkVlC2hcFuQJdH4T2i/dtauyTpJbD/6ExHR9XYVhdhdMs0JsjP/Q5FNoWh2ff9YbZVpDQSTPvusUp4liLjPfa/i0t+2LpNCeWy8Y+V9gUlDWiyYwrfMVI0UwNCZZKHs1Unpc11/4HLitQRtvuk0Ot5qwwBxbmtvCDKZvj1aFBid71/mYdGRPYZMIxq1zgP1acePC1zfTG/lvuQ7d0Pe0kaw==' >> ~/.ssh/known_hosts

              git config --global push.default simple
              git push -f git@heroku.com:cci-demo-react.git
            fi
```

And we're done! Let's see what the whole `circle.yml` looks like now:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: node:7.4.0
    working_directory: ~/cci-demo-react
    steps:
      - checkout
      - run:
          name: Pre-Dependencies
          command: mkdir -p ~/cci-demo-react/artifacts
      - run:
          name: Install Dependencies
          command: npm install
      - run:
          name: NPM Test
          command: npm test
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

Nice! You just set up CircleCI for a React app. Check out our project’s corresponding build on CircleCI [here](https://circleci.com/gh/circleci/cci-demo-react).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
