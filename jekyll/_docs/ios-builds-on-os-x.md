---
layout: classic-docs
title: Test iOS applications on OS X
short-title: iOS builds on OS X
categories: [mobile-platforms]
description: Testing iOS applications on OS X
---

CircleCI now offers support for building and testing iOS and OS X projects.
You can select an OS X project you would like to build on the [Add
Projects page](https://circleci.com/add-projects).

## Software Versions

The OS X container that CircleCI uses to build has the following software
versions installed:

- OS X 10.11.3 (15D21) Darwin 15.3.0
- Xcode:
  - 7.0 Build version 7A218
  - 7.1.1 Build version 7B1005
  - 7.2.1 Build version 7C1002
  - 7.3.1 Build version 7D1014
- Facebook xctool 0.2.9
- CocoaPods 0.39.0
- xcpretty 0.2.2
- fastlane 1.84.0
- carthage 0.16.2
- shenzhen 0.14.2

## Simulator UUIDs

When targeting a specific iOS simulator with the `-destination` flag, we suggest that you use one of these UUIDs instead of a combination of `-destination 'platform= , name='`.

```
distiller-build-8:~ distiller$ xcrun instruments -s
Known Devices:
distiller-build-1 (2) [564D9991-8876-86A0-7497-2C2D8B529CBD]
Apple TV 1080p (9.2) [CFB6004F-16F9-49B4-A117-CAFBCC0CE7CB] (Simulator)
iPad 2 (8.4) [A4276BA9-2D38-434D-A063-A1A7DC399235] (Simulator)
iPad 2 (9.0) [2F39BEF2-E92D-498C-B2D9-29366BD8F732] (Simulator)
iPad 2 (9.3) [101B434D-924B-4C7E-B8C1-ED8B376BF7CA] (Simulator)
iPad Air (8.4) [AD005E41-F7E6-4C5F-B3B1-6C980E834739] (Simulator)
iPad Air (9.0) [42D87249-99F2-4BC1-9180-317D268C46F7] (Simulator)
iPad Air (9.3) [72F9B9E8-DC05-4450-B030-407D4B0968D9] (Simulator)
iPad Air 2 (9.0) [6E2B1E19-6466-4328-917C-16019130FDE8] (Simulator)
iPad Air 2 (9.3) [A141F49D-F20A-49B3-ACBF-A97F9FFB9B89] (Simulator)
iPad Retina (8.4) [399AEF36-5560-4C4A-AE61-03F0A81555D0] (Simulator)
iPad Retina (9.0) [A1EC86BA-49AB-414B-9C27-2D0F26A34A81] (Simulator)
iPad Retina (9.3) [A70FE3C7-756F-44BF-BE46-68663FAE2EE3] (Simulator)
iPhone 4s (8.4) [F2E9EEAB-9FCE-4109-A40F-3DD79627C985] (Simulator)
iPhone 4s (9.0) [5EF3DECC-3E8F-41A0-B2CF-DC384A66E12E] (Simulator)
iPhone 4s (9.3) [8538CCCC-80FB-4B6B-9281-222771C38FEB] (Simulator)
iPhone 5 (8.4) [C5C8EA0E-F5A8-4AF8-BBAA-385B61026A5E] (Simulator)
iPhone 5 (9.0) [24F6F5A0-343E-4C64-9F4C-B50D88F5E99E] (Simulator)
iPhone 5 (9.3) [075FB8BA-F088-4A16-89CF-4EA36BC25E7A] (Simulator)
iPhone 5s (8.4) [45BFA4E8-C0A9-4A04-9CD0-4449FE4CF40B] (Simulator)
iPhone 5s (9.0) [49DAC9E5-C129-497D-853E-D93BC4BB8A10] (Simulator)
iPhone 5s (9.3) [3011ED5C-C63A-42E6-9D91-82A39DE4AD06] (Simulator)
iPhone 6 (8.4) [65AAA024-64D5-40B9-A122-8872E3F52EC4] (Simulator)
iPhone 6 (9.0) [53600017-30F1-428A-A16A-25C6CEDBD849] (Simulator)
iPhone 6 (9.3) [547B1B63-3F66-4E5B-8001-F78F2F1CDEA7] (Simulator)
iPhone 6 Plus (8.4) [DFB14113-4697-4E2D-AD3F-B4FBA4B62969] (Simulator)
iPhone 6 Plus (9.0) [321D1CF5-2514-4897-8B09-C133602F6DB5] (Simulator)
iPhone 6 Plus (9.3) [C63728B8-89B5-4FFB-8B6E-174A2F85B47F] (Simulator)
iPhone 6s (9.0) [763DC427-F2C5-4AA4-989F-2CA944FA8F04] (Simulator)
iPhone 6s (9.3) [E8DD285C-51EE-4DB5-B326-7E927686EC36] (Simulator)
iPhone 6s Plus (9.0) [011805C3-BB7A-4785-A313-D7AD2AF6DE49] (Simulator)
iPhone 6s Plus (9.3) [019CFBB0-0086-44A7-AA41-D39182D9CE01] (Simulator)
```

## Basic setup

After enabling the OS X builds for your project, you will need to share
the scheme that is going to be built on CircleCI so that we run the
correct build actions. Here is how to share an existing scheme in Xcode:

1. Choose Product > Scheme > Manage Schemes.
2. Select the Shared option for the scheme to share, and click Close.
3. Choose Source Control > Commit.
4. Select the Shared Data folder.
5. Enter your commit message in the text field.
6. Select the "Push to remote" option (if your project is managed with Git).
7. Click the Commit Files button.

After doing this you will have a new `.xcscheme` file located in the
`xcshareddata/xcschemes` folder under your Xcode project. You will need to
commit this file to your git repository so that CircleCI can access it.

Simple projects should run with minimal or no configuration.

By default, CircleCI will:

* **Install any Ruby gems specified in a Gemfile** - we will run `bundle
  install` and cache the installed gems.
* **Install any dependencies managed by CocoaPods** - if a Podfile is
  present, we will run `pod install`, or `bundle exec pod install` if
  both a Podfile and a Gemfile are present, and also cache the installed pods.
* **Run the "test" build action for detected workspace (or project) and scheme
  from the command line** - We will use `xctool` to build either the workspace
  we find in your repo, or the project, if there is no workspace.

See [customizing your build](#customizing-your-build) for more information about
customization options.

## Xcode Version

By default, CircleCI will build your project with Xcode 7.0. You can select 7.1, 7.2 or 7.3.
by specifying the version in a [circle.yml file]({{ site.baseurl }}/configuration/) in the root of your
repo. For example, for 7.3, add the following:

```
machine:
  xcode:
    version: 7.3
```

### CocoaPods

CircleCI will automatically detect if your project is using [CocoaPods](https://cocoapods.org)
to manage dependencies. If you are using CocoaPods, then we recommend that you
check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control).
This will ensure that you have a deterministic, reproducable build.

If CircleCI finds a `Podfile` and the `Pods` directory is not present (or empty)
 then we will run `pod install` to install the necessary dependencies in the
`dependencies` step of your build.

We cannot handle all setups automatically, so for some projects you might need
to invoke CocoaPods manually with some custom configuration. To do this you will
need to override the `dependencies` section of your `circle.yml` file.
See our [documentation on overriding build phases for more information on this.]({{ site.baseurl }}/configuration/#phases).
If you need more help please reach out to our support team who are always happy
to help out.

## Supported build and test tools

CircleCI's automatic commands cover a lot of common test patterns, and you can customize your build
as needed to satisfy almost any iOS build and test strategy.

### XCTest-based tools
In addition to standard `XCTestCase` tests, CircleCI will automatically run tests
written in any other tool that builds on top of XCTest and is configured to run
via the "test" build action. The following test tools are known to work well on CircleCI
(though many others should work just fine):

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)

### Other tools
Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also
work normally, though they will need to be installed and called using custom commands.
See [customizing your build](#customizing-your-build) for more info.

## Code signing
[fastlane](https://fastlane.tools) and [Shenzhen](http://nomad-cli.com/#shenzhen)
are pre-installed on the container image. It is recommended to use fastlane to
build, sign and distribute your iOS app to beta-testers.

The fastest way to get code signing working on CircleCI is to follow
these steps:

1. Upload your `.P12` file in **Project Settings > iOS Code Signing**.
1. Add your provisioning profile  (`.mobileprovision`) file to your
   repo.
1. Set `GYM_CODE_SIGNING_IDENTITY` environment variable
   to match your code-signing identity, ie `"iPhone Distribution: Acme Inc."`.
1. Build with `gym` and deploy with `ipa`.

Please check out the [code signing doc]({{ site.baseurl }}/ios-code-signing/) for more
details about setting up code signing, and the [deployment](#deployment)
section for examples of deployment setups.

## Customizing your build
While CircleCI's inferred commands will handle many common testing patterns, you
also have a lot of flexibility to customize what happens in your build.

### Build Commands
CircleCI runs tests from the command line with the [`xcodebuild`](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/xcodebuild.1.html)
command by default. This is a tool developed by Apple, and we find it to be the most
stable and functional option for building and testing your OS X project.

CircleCI will try to automatically build your iOS project by infering the
workspace, project and scheme. In some cases, you may need to override the
inferred test commands. The following command is representative of how CircleCI
will build an iOS project:

```
test:
  override:
    - set -o pipefail &&
      xcodebuild
        CODE_SIGNING_REQUIRED=NO
        CODE_SIGN_IDENTITY=
        PROVISIONING_PROFILE=
        -sdk iphonesimulator
        -destination 'platform=iOS Simulator,OS=9.0,name=iPhone 6'
        -workspace MyWorkspace.xcworkspace
        -scheme "My Scheme"
        clean build test |
      tee $CIRCLE_ARTIFACTS/xcode_raw.log |
      xcpretty --color --report junit --output $CIRCLE_TEST_REPORTS/xcode/results.xml
```

In some situations you might also want to build with [`xctool`](https://github.com/facebook/xctool),
an alternative build tool. Please mind that some of the `xcodebuild` functionality might not be
supported by `xctool`. Here is an example of an `xctool` build command:

```
test:
  override:
    - xctool
      -reporter pretty
      -reporter junit:$CIRCLE_TEST_REPORTS/xcode/results.xml
      -reporter plain:$CIRCLE_ARTIFACTS/xctool.log
      CODE_SIGNING_REQUIRED=NO
      CODE_SIGN_IDENTITY=
      PROVISIONING_PROFILE=
      -destination 'platform=iOS Simulator,name=iPhone 6,OS=latest'
      -sdk iphonesimulator
      -workspace MyWorkspace.xcworkspace
      -scheme "My Scheme"
      build build-tests run-tests
```

### Environment variables
You can customize the behavior of CircleCI's automatic build commands by setting
the following environment variables in a `circle.yml` file or at
**Project Settings > Environment Variables** (see [here]({{ site.baseurl }}/environment-variables/#custom) for more info
about environment variables):

* `XCODE_WORKSPACE` - The path to your `.xcworkspace` file relative to the git repository root
* `XCODE_PROJECT` - The path to your `.xcodeproj` file relative to the repository root
* `XCODE_SCHEME` - The name of the scheme you would like to use to run the "test" build action

**Note:** Only one of `XCODE_WORKSPACE` or `XCODE_PROJECT` will be used, with workspace taking
precedence over project.

If more than one scheme is present, then you should specify the
`XCODE_SCHEME` [environment variable]({{ site.baseurl }}/environment-variables/#custom).
Otherwise a scheme will be chosen arbitrarily.

You can also use the Environment Variables section to add all the
secrets that your build needs, as the content of the variables is stored
securely.

### Configuration file
The most flexible means to customize your build is to add a `circle.yml` file to your project,
which allows you to run arbitrary bash commands instead of or in addition to the inferred commands
at various points in the build process. See the [configuration doc]({{ site.baseurl }}/configuration/) for
a detailed discussion of the structure of the `circle.yml` file. Note, however, that
a number of options discussed in that doc will not work for OS X builds.
Please see the [the Constraints section](#constraints-on-os-x-based-builds) for the
exact commands that are not supported.

### Custom packages
[Homebrew](http://brew.sh/) is pre-installed on CircleCI, so you can simply use `brew install`
to add nearly any dependency required in your build VM. Here's an example:

```
dependencies:
  pre:
    - brew install cowsay
test:
  override:
    - cowsay Hi!
```

You can also use the `sudo` command if necessary to perform customizations outside of Homebrew.

### Using custom versions of CocoaPods and other Ruby gems

To make sure the version of CocoaPods that you use locally is also used
in your CircleCI builds, we suggest creating a Gemfile in your iOS
project and adding the CocoaPods version to it:

```
source 'https://rubygems.org'

gem 'cocoapods', '= 0.39.0'
```

If we detect a Gemfile in your project we’ll run `bundle install` and
will then invoke CocoaPods with `bundle exec` prepended to the command.

Please mind that, if overriding the `dependencies` step, you will need
to manually add the `bundle install` step to your config.

If you have any other gems specified in your Gemfile, we will
automatically install and cache those as well during the `bundle
install` step.

## Deployment

Once you have a signed app you are on the homeward stretch. Distributing
the app is easy. One popular way to distribute your app is using `shenzhen`.
Shenzhen supports many distribution services, including:

* [iTunes Connect](https://itunesconnect.apple.com/)
* [HockeyApp](http://hockeyapp.net/)
* [Beta by Crashlytics](http://try.crashlytics.com/beta/)
* [TestFairy](https://testfairy.com/)

### Hockey App

Log in to Hockey app and create a new API token on the [Tokens page](
https://rink.hockeyapp.net/manage/auth_tokens). Your token will need at
least upload permission to upload new builds to Hockey App. Give your
new API token a name specific to CircleCI such as "CircleCI
Distribution". Copy the token, and log into CircleCI and visit the
Project Settings for your app. Create a new Environment Variable with
the name `HOCKEY_APP_TOKEN` and paste the token as the value. You can now
access this token during the build.

Modify the deployment section of your `circle.yml` as follows:

```
deployment:
  beta_distribution:
    branch: master
    commands:
      - gym
      - ipa distribute:hockeyapp
          --file             /Users/distiller/<yourprojectname>/<yourappname>.ipa
          --token            "$HOCKEY_APP_TOKEN"
          --notes            "CircleCI build $CIRCLE_BUILD_NUM"
          --commit-sha       "$CIRCLE_SHA1"
          --build-server-url "$CIRCLE_BUILD_URL"
          --repository-url   "$CIRCLE_REPOSITORY_URL"
```

### Beta By Crashlytics

First, we need to get some credentials. Log in to Fabric.io and visit
your organization's settings page.

![]({{ site.baseurl }}/assets/img/docs/fabric-org-settings-page.png)

Click on your organisation (CircleCI in the image above), and click on
the API key and Build Secret links to reveal the items.

![]({{ site.baseurl }}/assets/img/docs/fabric-api-creds-page.png)

On CircleCI, navigate to your App's Project Settings page, and under
Environment Variables add 2 new items named `CRASHLYTICS_API_KEY` and
`CRASHLYTICS_SECRET`, with the values you find on Crashlytics website.

You can then modify the deployment section of your circle.yml as
follows:

```
deployment:
  beta_distribution:
    branch: master
    commands:
      - gym
      - ipa distribute:crashlytics
          --crashlytics_path Crashlytics.framework
          --api_token    "$CRASHLYTICS_API_KEY"
          --build_secret "$CRASHLYTICS_SECRET"
```

### TestFairy

To set up your app on TestFairy first visit the preferences page in the
TestFairy dashboard and navigate to the API Key section. Copy your API
key and go to your App's Project settings on CircleCI. Add a new
Environment Variable named `TESTFAIRY_API_KEY` and paste in the API key
from the TestFairy dashboard.

Next, you need to edit your `circle.yml` as follows:

```
deployment:
  beta_distribution:
    branch: master
    commands:
      - gym
      - ipa distribute:testfairy
          --key     "$TESTFAIRY_API_KEY"
          --comment "CircleCI build $CIRCLE_BUILD_URL"
```

## Common issues

A series of simulator-related issues are known to happen on some
projects. Here are the most frequent of those:

* **Xcode version is not available.** We install
  a few [different versions](#software-versions) of Xcode in the build
  image and keep those updated with the latest point releases. Therefore
  to use the latest Xcode 7.1, for example, which is `7.1.1`, it is
  sufficient to specify `7.1` in your `circle.yml`. If a newer point
  release of 7.1 comes out, we will make that one available under the same
  `7.1` version on CircleCI.

* **Dependency version mismatches.** If you see that the version of the
  dependencies used in the build are not the expected ones, please try
  rebuilding without cache — chances are an older dependency got stuck
  in the cache and is not allowing for the newer version to get
  installed.

* **Cryptic compilation errors.** If you see compile-time errors that do
  not really make sense, please check if the version of Xcode you are using
  in your build is the same one you are using locally. When the
  `circle.yml` of the project does not specify an Xcode version,
  we default to an older Xcode which might not support the necessary
  features.

* **Timeout waiting for simulator.** If you see your test command
  failing with errors similar to this:

```
iPhoneSimulator: Timed out waiting 120 seconds for simulator to boot, current state is 1
```

  Then the version of the simulator you are trying to use on CircleCI
  might not be present in the build machines.
  In addition to the default version of simulator for every Xcode
  installation, we also make simulators of the following iOS versions
  available for all Xcode versions:

  * 7.1
  * 8.4

  Please try using any of the versions of simulator that are present on
  the machines — the error might disappear.

* **Ruby segfaults.** We have seen cases where some of the Ruby gems
  used during the build would produce a segmentation fault in Ruby. This
  might happen because of the mismatch of Ruby version used to build the
  gem and the Ruby version used to run it. Please make sure that the Ruby
  version used locally is the same as the one used on CircleCI. You can
  install a newer version Ruby in the container by following [this
  guide](https://discuss.circleci.com/t/installing-a-newer-ruby-version-on-ios-os-x-containers/2466).

* **Inconsistent timeouts during test runs.** If you are seeing your UI
  tests time out in some of the builds, please try using both the raw
  `xcodebuild` command and the `xctool` command command we suggest [here](#build-commands).
  Sometimes the issue would only be present with one of these tools but not the other.

* **Errors while installing code signing certificates.** Please check out [the Troubleshooting
  section]({{ site.baseurl }}/ios-code-signing/#troubleshooting) of the code signing doc.

### A note on code-generating tools
Many iOS app developers use tools that generate substantial amounts of code. In such
cases CircleCI's inference may not correctly detect the Xcode workspace, project, or
scheme. Instead, you can specify these through [environment variables](#environment-variables).

### Constraints on OS X-based builds
There are a few features normally available on CircleCI's standard
Linux containers that are not available for OS X builds at the moment:

* Parallelism is not supported
* While the general `circle.yml` file structure will be honored in OS X-based builds
[configuration options]({{ site.baseurl }}/configuration/), the following sections of
`circle.yml` will not work correctly:
  * `machine: services`
  * `machine: <language>`, where `<language>` is any language mentioned
    in the [Configuration doc]({{ site.baseurl }}/configuration/)

Please see the [customizing your build](#customizing-your-build) section for alternatives.

## A sample `circle.yml`
The following configuration will use all the default dependency steps
but will override the test steps with the specified commands.
The code signing will be performed with our built-in mechanism,
and all successful builds of the app on the `master` branch
will be distributed to Crashlytics:

```
general:
  # if the application is *not* in the root of the repo but
  # in the sub-directory called "ios-app"
  build_dir: ios-app

machine:
  xcode:
    version: "7.3"
  environment:
    # please specify your code signing identity name here
    GYM_CODE_SIGNING_IDENTITY: "iPhone Distribution: Acme Inc. (GL31ZZ3256)"

test:
  override:
    - set -o pipefail &&
      xcodebuild
        CODE_SIGNING_REQUIRED=NO
        CODE_SIGN_IDENTITY=
        PROVISIONING_PROFILE=
        -sdk iphonesimulator
        -destination 'platform=iOS Simulator,OS=9.0,name=iPhone 6'
        -workspace MyWorkspace.xcworkspace
        -scheme "My Scheme"
        clean build test |
      tee $CIRCLE_ARTIFACTS/xcode_raw.log |
      xcpretty --color --report junit --output $CIRCLE_TEST_REPORTS/xcode/results.xml

deployment:
  beta_distribution: # just a label, can be anything
    branch: master
      commands:
        # this will build the ipa file
        - gym --scheme "App" --workspace "App.xcworkspace"
        - ipa distribute:crashlytics
            --crashlytics_path Crashlytics.framework
            --api_token    "$CRASHLYTICS_API_KEY"
            --build_secret "$CRASHLYTICS_SECRET"
```
