---
layout: classic-docs
title: Testing with Firebase Test Lab
categories: [how-to]
description: Testing with Firebase Test Lab
sitemap: false
---

This guide is based off of commands in Firebase Test Lab. 
You can always check for any changes to the official documentation at
the [Overview Page](https://firebase.google.com/docs/test-lab/overview).

## Prerequisites
Before you can use Cloud Test Lab with CircleCI, you need to complete the
following steps:

1. **Set up gcloud**. Follow the instructions from
[Using Cloud Test Lab from the Command Line](https://developers.google.com/cloud-test-lab/command-line)
to create a Google Cloud project, request access to the Cloud Test Lab Beta
program, and configure your local Google Cloud SDK environment. It's pre-installed on CircleCI, but you'll probably want to have it locally too.
1. **Create a service account**. Using a service account causes gcloud to treat the user as a program, instead of treating the user as a person. This avoids checks for spam and prevents the account from being blocked or prompted for captchas. Service accounts are created via the Cloud Console ([doc](https://cloud.google.com/iam/docs/service-accounts)). To activate a service account, follow the instructions for using the
[`gcloud auth activate-service-account` command](https://cloud.google.com/sdk/gcloud/reference/auth/activate-service-account).
1. **Enable required APIs**. In the
[Google Developers Console](https://console.developers.google.com/), enable the
**Google Cloud Testing API** and **Cloud Tool Results API** for the project under test. To enable these
APIs, type these API names into the search box at the top of the console, and
then click **Enable API** on the on the overview page for that API.

## Set up Your Repository With CircleCI
If you're not yet a CircleCI user, you can follow our
[Getting Started]( {{ site.baseurl }}/1.0/getting-started/) guide to quickly
get set up. For the purpose of this guide we'll be using the [Notepad example
Android app](https://github.com/circleci/android-cloud-test-lab).

### Project Settings / Environment Variables
When creating your service account (from the previous section) you would have
downloaded a `.json` private key. We need to give CircleCI access to this key so
that it can authorize `gcloud`. Placing it directly in version control isn't
smart for security.

Instead we'll utilize an environment variable set in CircleCI's GUI for
authorization. Instructions on how to do this can be found
[here]( {{ site.baseurl }}/1.0/google-auth/).

### circle.yml

```
dependencies:
  pre:
    - sudo pip install -U crcmod
  post:
    - ./gradlew :app:assembleDebug -PdisablePreDex
    - ./gradlew :app:assembleDebugTest -PdisablePreDex
    - echo $GCLOUD_SERVICE_KEY | base64 --decode > ${HOME}/client-secret.json
    - sudo /opt/google-cloud-sdk/bin/gcloud config set project <PROJECT-ID>
    - sudo /opt/google-cloud-sdk/bin/gcloud --quiet components update
    - sudo /opt/google-cloud-sdk/bin/gcloud --quiet components install beta
    - sudo /opt/google-cloud-sdk/bin/gcloud auth activate-service-account <ACCOUNT> --key-file ${HOME}/client-secret.json
```
We start off by installing `crcmod` which Google's gsutil tool needs (we'll see
this later).

In the dependencies section we build both the debug apk as well as test sdk. We
then set up gcloud. Here we recreate the .json key, tell gcloud which project
we're working on, install the beta commands, and authenticate to our project.
Make sure to set your own project name where appropriate.

By default the Gradle android plugin pre-dexes dependencies,
converting their Java bytecode into Android bytecode. This speeds up
development greatly since gradle only needs to do incremental dexing
as you change code.

Because CircleCI always runs clean builds this pre-dexing has no
benefit; in fact it makes compilation slower and can also use large
quantities of memory.  We recommend
[disabling pre-dexing][disable-pre-dexing] for Android builds on
CircleCI.

[disable-pre-dexing]: http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/

```
test:
  override:
    - echo "y" | sudo /opt/google-cloud-sdk/bin/gcloud beta firebase test android run --app app/build/outputs/apk/app-debug.apk --test app/build/outputs/apk/app-debug-test-unaligned.apk --results-bucket cloud-test-<PROJECT-ID>
  post:
    - sudo /opt/google-cloud-sdk/bin/gsutil -m cp -r -U `sudo /opt/google-cloud-sdk/bin/gsutil ls gs://cloud-test-circle-ctl-test | tail -1` $CIRCLE_ARTIFACTS/ | true
```

In the test section we override CircleCI's default action of running
`gradle test` and instead instruct gcloud to run it in Test Lab. You'll need to
adjust the apk names to correspond to your project.
Make sure to set your own Google Cloud Storage URL where appropriate.

In post, we use `gsutil` to download the newest files in the bucket to the
CircleCI artifacts folder. This enables you to see and use those artifacts from
within both Google Cloud Storage and CircleCI.
