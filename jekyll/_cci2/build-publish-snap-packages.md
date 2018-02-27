---
layout: classic-docs
title: "Build & Publish Snap Packages using Snapcraft on CircleCI"
short-title: "Build & Publish Snap Packages"
description: |
  A guide on how to build, test, and publish Snap packages on CircleCI using
  Snapcraft.
categories: [containerization]
order: 20
---

Snap packages (a.k.a `.snap files`) can be created once and installed on multiple Linux distributions (distros). This makes them a quick way to publish your software to most Linux users with one package. More information on Snapcraft itself can be found [here][snapcraft].

## Overview

Here's how you can build a snap package and publish it to the [Snap Store][snapcraft-store] via CircleCI. We'll walk through snippets of a sample `.circleci/config.yml` file with the full version at the end of this doc.

Building a snap on CircleCI is mostly the same as your local machine, wrapped with [CircleCI 2.0 syntax][2.0-docs].

## Build Environment

```
...
version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
...
```

The `docker` executor is used here with the `cibuilds/snapcraft` Docker image. This image includes the `snapcraft` command which will be used to build the actual snap. This image is based on the official `snapcore/snapcraft` Docker image by Canonical with all of the command-line tools you'd want to be installed in a CI environment. The source for `cibuilds/snapcraft` can be found [here][cibuilds-snapcraft] and the source for the upstream image [here][snapcore-snapcraft].

## Running Snapcraft

To build a snap in any environment (local, company servers CI, etc) there needs to be a Snapcraft config file. Typically this will be located at `snap/snapcraft.yml`. This doc assumes you already have this file and can build snaps successfully on your local machine. If not, you can read through the [Build Your First Snap][snap-guide-1] doc by Snapcraft to get your snap building on your local machine.

```
...
    steps:
      - checkout
      - run:
          name: "Build Snap"
          command: snapcraft
...
```

On CircleCI, this single command is needed to actually build your snap. This will run Snapcraft, which will then go through all of it's build steps and generate a `.snap` file for you. This file will typically be in the format of `<snap-name>-<snap-version>-<system-arch>.snap`.

## Testing

Unit testing your software's code has been covered extensively in [our blog][blog], [our docs][docs], and around the Internet. Searching for your language/framework and unit testing or CI will turn up tons of information.

You'll likely want to create a `job` before building the snap that pull project dependencies, any pre-checks you'd want to do, testing, and compiling.

Building snaps on CircleCI means we end with a `.snap` file which we can test in addition to the code that created it. How you test the snap itself is up to you. Some users will attempt to install the snap in various distros and then run a command to make sure that installation process works. Snapcraft offers a build fleet for spreadtesting that allows you to test snaps on different distros, after you've already tested the code itself. This can be found [here][snapcraft-build].

## Publishing

Publishing a snap is more or less a two-step process. The first step which is done once, is to create a Snapcraft "login file" on your local machine that we upload to CircleCI. Assuming your local machine already has these tools installed and you are logged in to the Snapcraft Store (`snapcraft login`), we use the command `snapcraft export-login snapcraft.login` to generate a login file called `snapcraft.login`. As we don't want this file visible to the public or stored in the Git repository, we will base64 encode this file and store it in a [private environment variable][private-envars] called `$SNAPCRAFT_LOGIN_FILE`.

Here's on this might look on a Linux machine:

```
snapcraft login
# follow prompts for logging in with an Ubuntu One account
snapcraft export-login snapcraft.login
base64 snapcraft.login | xsel --clipboard
```

Once the base64 encoded version of the file is stored on CircleCI as a private environment variable, we can then use it within a build to automatically publish to the store.

```
...
      - run:
          name: "Publish to Store"
          command: |
            mkdir .snapcraft
            echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
            snapcraft push *.snap --release stable
...
```

In this example, Snapcraft automatically looks for login credentials in `.snapcraft/snapcraft.cfg` so we decode the environment variable we made previously right into that location. `snapcraft push` is then used to upload the .snap file into the Snap Store.

### Uploading vs Releasing

`snapcraft push *.snap` by default will upload the snap to the Snap Store, run any store checks on the server side, and then stop. The snap won't be "released" meaning users won't automatically see the update. The snap can be published locally with the `snap release <release-id>` command or by logging into the Snap Store and clicking the release button.

In typical CircleCI fashion, we can go fully automated (as in the above example) but using the `--release <channel>` flag. This uploads the snap, does Store side verification, and then will automatically release the snap in the specified channels. 


## Workflows

We can utilize multiple jobs to better organize our snap build. A job to build/compile the actual project, a job to build the snap itself, and a job that published the snap (and other packages) only on `master` would all be useful.

[Workflows][workflows] can help with building snaps in two ways:

1. **Snap Store Channels** - As we mentioned in the previous section, when we upload to the Store we could optionally release at the same time. This allows us to designate specific jobs on CircleCI to deploy to specific Snap Channels. For example, the `master` branch could be used to deploy to the `edge` channel` while tagged releases could be used to deploy to the `stable` channel.
1. **Parallelize Packing** - If your software is being packaged as a snap as well as something else, say a flatpak, .deb, .apk, etc, each package type could be placed in its own job and all run parallel. This allows your build to complete must fast than if the .deb package could start to build until the snap completed, and so on.

Utilize CircleCI `workspaces` to move a generated snap file between jobs when neccessarily. Here's an example showing a snippet from the "from" job and a snippet of the "to" job:

```
... # from a job that already has the snap
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"
... # to the next job that needs the snap
      - attach_workspace:
          at: .
...
```

Below is a complete example of how a snap package could be built on CircleCI. This same process is used the build the Snap pakcage for the [CircleCI Local CLI][local-cli-repo].


## Full Example Config

```
workflows:
  version: 2
  main:
    jobs:
      - build
      - publish:
          requires:
            - build
          filters:
            branches:
              only: master


version: 2
jobs:
  build:
    docker:
      - image: cibuilds/snapcraft:stable
    steps:
      - checkout
      - run:
          name: "Build Snap"
          command: snapcraft
      - persist_to_workspace:
          root: .
          paths:
            - "*.snap"

  publish:
    docker:
      - image: cibuilds/snapcraft:stable
    steps:
      - attach_workspace:
          at: .
      - run:
          name: "Publish to Store"
          command: |
            mkdir .snapcraft
            echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
            snapcraft push *.snap --release stable
```



[snapcraft]: https://snapcraft.io/
[snapcraft-store]: https://snapcraft.io/store
[snapcraft-build]: https://build.snapcraft.io/
[cibuilds-snapcraft]: https://github.com/cibuilds/snapcraft
[snapcore-snapcraft]: https://github.com/snapcore/snapcraft/tree/master/docker
[snap-guide-1]: https://docs.snapcraft.io/build-snaps/your-first-snap
[blog]: https://circleci.com/blog/
[docs]: https://circleci.com/docs/2.0/
[private-envars]: https://circleci.com/docs/2.0/env-vars/#adding-environment-variables-in-the-app
[workflows]: https://circleci.com/docs/2.0/workflows/
[local-cli-repo]: https://github.com/circleci/local-cli
