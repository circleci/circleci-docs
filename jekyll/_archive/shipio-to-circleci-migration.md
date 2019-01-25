---
layout: classic-docs
title: Ship.io to CircleCI Migration
short_title: Ship.io
description: "Ship.io to CircleCI Migration"
sitemap: false
---

Coming from Ship.io? You've come to the right place, we'll help you get started.

## Getting Started with iOS

For iOS projects, please [contact support](https://support.circleci.com/hc/en-us) with the name of your GitHub user or organization for access to the iOS build system. Once you've been enabled,

1. Add your project on the [Add Projects page](https://circleci.com/add-projects){:rel="nofollow"}.
2. Turn on the "Build iOS project" setting through the **Project Settings > Build Settings > Build Environment** page of your your project.
3. Push a new commit to start a build on the iOS build system.

## Getting Started with Android

You can easily migrate your Android projects from Ship.io to CircleCI in a few simple steps.

1. Add your project on the [Add Projects page](https://circleci.com/add-projects){:rel="nofollow"}.
2. After adding your project, CircleCI will usually infer your build settings. Sometimes the magic doesn't always work. Please take a look at our [getting started]( {{ site.baseurl }}/1.0/getting-started/) documentation.
3. Check out the [Testing Android on CircleCI]( {{ site.baseurl }}/1.0/android/) documentation.


## iOS FAQ: How do I...

### Set environment variables
You can set environment variables through the **Project Settings > Environment Variables** page of your project, or through [circle.yml]( {{ site.baseurl }}/1.0/configuration/#environment).

### Use Xcode 7
Include a `circle.yml` file in the repo's root directory with the following contents:

```
machine:
  xcode:
    version: "7.0"
```

### Pick a scheme
CircleCI will automatically detect your shared scheme. If you have more than one shared scheme in your repo, you can specify the name of the scheme you would like to use to run your tests using the `XCODE_SCHEME` environment variable.

### Pick a workspace
CircleCI will detect your workspace. If you have more than one workspace, you can specify the path to your `.xcworkspace` file relative to the git repository root using the `XC_WORKSPACE` environment variable.

### Run scripts
Make sure any scripts that you want to run are included in your repository. You can run your script using a bash command (e.g. `./example_script.sh`) configured in our UI (through **Project Settings > Dependency/Test Commands**) or in a [circle.yml]( {{ site.baseurl }}/1.0/configuration/) file.

### Configure build notifications
You can configure build notifications using the "Notifications" section of your Project Settings. Email notifications can be configured from the [Account page](https://circleci.com/account){:rel="nofollow"}.

### Customize the build commands
You can add to or override our inferred commands through your Project Settings or through a [circle.yml file]( {{ site.baseurl }}/1.0/configuration/).

### Deploy my app
We recommend using [fastlane](https://medium.com/mitoo-insider/how-to-set-up-continuous-delivery-for-ios-with-fastlane-and-circleci-c7dae19df2ed).

### Get more help
* [macOS build docs]( {{ site.baseurl }}/1.0/ios-builds-on-os-x/)
* [discuss.circleci.com](https://discuss.circleci.com/c/mobile)
* [CircleCI Support](https://support.circleci.com/hc/en-us)

## Android FAQ: How do I...

CircleCI is a powerful, developer friendly platform that allows for much greater flexibility in customizing your build environment. At Ship.io, "build steps" were used to specify configuration settings.
Rather than manually adding Gradle tasks individually or spending precious time tinkering with how much RAM the Android Emulator uses, at CircleCI, nearly all of your configuration is done on the circle.yml. CircleCI has customizable notifications that keep you up to speed with the status of your build.
You can configure build notifications using the "Notifications" section of your Project Settings.
Email notifications can be configured from the [Account page](https://circleci.com/account){:rel="nofollow"}.


### Run Gradle tests
If you have a Gradle Wrapper in the root of your repository, CircleCI will automatically run ./gradlew test.

### Use the Android Emulator
In order to start the Android Emulator you will need to add some configuration settings to your [circle.yml]( {{ site.baseurl }}/1.0/configuration/).

Below is a sample circle.yml file taken from an [excellent blog post](http://blog.originate.com/blog/2015/03/22/android-and-ci-and-gradle-a-how-to/) written by someone who has an extensively configured Android project on CircleCI.

```
general:
  artifacts:
    -/home/ubuntu/**repo_name**/build/outputs/reports/**testFolderName**/connected

machine:
  environment:
    ANDROID_HOME: /home/ubuntu/android
  java:
    version: oraclejdk6

dependencies:
  cache_directories:
    - ~/.android
    - ~/android
  override:
    - (echo "Downloading Android SDK v19 now!")
    - (source scripts/environmentSetup.sh && getAndroidSDK)

test:
  pre:
    - $ANDROID_HOME/tools/emulator -avd testAVD -no-skin -no-audio -no-window:
      background: true
    - (./gradlew assembleDebug):
        timeout: 1200
    - (./gradlew assembleDebugTest):
        timeout: 1200
    - (source scripts/environmentSetup.sh && waitForAVD)
  override:
    - (echo "Running JUnit tests!")
    - (./gradlew connectedAndroidTest)
```
### Run scripts
You can specify which scripts to run in your [circle.yml]( {{ site.baseurl }}/1.0/configuration/).
The following .yml snippit would trigger script.sh to run during each build.

```
machine:
  pre:
    - ./script.sh
```
Phew, that was a lot!
Questions, comments, concerns?
Please don't hesitate to give our [support team](https://support.circleci.com/hc/en-us) a shout should you have any difficulties!

### Additional resources

[Configuring custom AVDs](https://developer.android.com/tools/devices/managing-avds-cmdline.html#AVDCmdLine)

[Getting Started on CircleCI]( {{ site.baseurl }}/1.0/getting-started/)

[An excellent CircleCI and Android Gradle how-to](http://blog.originate.com/blog/2015/03/22/android-and-ci-and-gradle-a-how-to/)

[Debugging Android applications on CircleCI]( {{ site.baseurl }}/1.0/oom/#out-of-memory-errors-in-android-builds)
[CircleCI & Android 101]( {{ site.baseurl }}/1.0/android/)

[CircleCI Docs]( {{ site.baseurl }}/1.0/)

[Discuss.circleci.com](https://discuss.circleci.com/)
