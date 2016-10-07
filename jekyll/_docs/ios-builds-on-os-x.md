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

- OS X 10.11.6 (15G1004)
- Xcode:
  - 7.0.1 Build version 7A1001
  - 7.2.1 Build version 7C1002
  - 7.3.1 Build version 7D1014
  - 8.0 Build version 8A218a
- Facebook xctool 0.2.9
- CocoaPods 1.0.1
- xcpretty 0.2.2
- fastlane 1.101.0
- carthage 0.17.2
- shenzhen 0.14.2

## Simulator UUIDs

When targeting a specific iOS simulator with the `-destination` flag, we suggest that you use one of these UUIDs instead of a combination of `-destination 'platform= , name='`.

```
Apple TV 1080p (10.0) [48B0E1AB-F5EB-40FB-9372-A16B93349B12] (Simulator)
iPad 2 (8.4) [A4276BA9-2D38-434D-A063-A1A7DC399235] (Simulator)
iPad 2 (9.0) [2F39BEF2-E92D-498C-B2D9-29366BD8F732] (Simulator)
iPad Air (10.0) [B9257F59-88B3-421D-B1F2-2BD92F0858D0] (Simulator)
iPad Air (8.4) [AD005E41-F7E6-4C5F-B3B1-6C980E834739] (Simulator)
iPad Air (9.0) [42D87249-99F2-4BC1-9180-317D268C46F7] (Simulator)
iPad Air 2 (10.0) [AC291080-8EFE-4095-8C55-B1E952EFFC36] (Simulator)
iPad Air 2 (9.0) [6E2B1E19-6466-4328-917C-16019130FDE8] (Simulator)
iPad Pro (12.9 inch) (10.0) [BF8D8AD2-6A96-4A62-8059-A836738BB873] (Simulator)
iPad Pro (9.7 inch) (10.0) [F9C94E2A-F080-4AB0-93D6-A41135919D8E] (Simulator)
iPad Retina (10.0) [D56EBD40-B853-4D56-B482-D4C40E69A3FC] (Simulator)
iPad Retina (8.4) [399AEF36-5560-4C4A-AE61-03F0A81555D0] (Simulator)
iPad Retina (9.0) [A1EC86BA-49AB-414B-9C27-2D0F26A34A81] (Simulator)
iPhone 4s (8.4) [F2E9EEAB-9FCE-4109-A40F-3DD79627C985] (Simulator)
iPhone 4s (9.0) [5EF3DECC-3E8F-41A0-B2CF-DC384A66E12E] (Simulator)
iPhone 5 (10.0) [85D8FE66-1208-4478-811C-7BD1AA3B33CA] (Simulator)
iPhone 5 (8.4) [C5C8EA0E-F5A8-4AF8-BBAA-385B61026A5E] (Simulator)
iPhone 5 (9.0) [24F6F5A0-343E-4C64-9F4C-B50D88F5E99E] (Simulator)
iPhone 5s (10.0) [1FB033A8-440D-45F3-B95D-03E4E38B51DF] (Simulator)
iPhone 5s (8.4) [45BFA4E8-C0A9-4A04-9CD0-4449FE4CF40B] (Simulator)
iPhone 5s (9.0) [49DAC9E5-C129-497D-853E-D93BC4BB8A10] (Simulator)
iPhone 6 (10.0) [33D34EBA-703E-4A82-8838-BE75171492E1] (Simulator)
iPhone 6 (10.0) + Apple Watch - 38mm (3.0) [AB222C53-93E0-4D82-A6E0-00BABE11C87F] (Simulator)
iPhone 6 (8.4) [65AAA024-64D5-40B9-A122-8872E3F52EC4] (Simulator)
iPhone 6 (9.0) [53600017-30F1-428A-A16A-25C6CEDBD849] (Simulator)
iPhone 6 Plus (10.0) [5525775C-A351-4986-9BF4-144A84E253AA] (Simulator)
iPhone 6 Plus (10.0) + Apple Watch - 42mm (3.0) [0E10CE3B-532C-4AC9-9F14-13387F90C4A0] (Simulator)
iPhone 6 Plus (8.4) [DFB14113-4697-4E2D-AD3F-B4FBA4B62969] (Simulator)
iPhone 6 Plus (9.0) [321D1CF5-2514-4897-8B09-C133602F6DB5] (Simulator)
iPhone 6s (10.0) [F08BA729-6AD2-42DF-A210-34DC8D990011] (Simulator)
iPhone 6s (9.0) [763DC427-F2C5-4AA4-989F-2CA944FA8F04] (Simulator)
iPhone 6s Plus (10.0) [A310FC97-435A-4026-AF85-F1216F856BA5] (Simulator)
iPhone 6s Plus (9.0) [011805C3-BB7A-4785-A313-D7AD2AF6DE49] (Simulator)
iPhone 7 (10.0) [2D96E690-BFB5-44D5-8B22-31D9C57EDADF] (Simulator)
iPhone 7 (10.0) + Apple Watch Series 2 - 38mm (3.0) [23990084-6F01-4978-86AD-7CEBD9C32E21] (Simulator)
iPhone 7 Plus (10.0) [D4155E82-B930-450B-AFC7-F4800669EC65] (Simulator)
iPhone 7 Plus (10.0) + Apple Watch Series 2 - 42mm (3.0) [EEC8A3AB-A636-4C88-97E7-36C035947432] (Simulator)
iPhone SE (10.0) [84A11478-B7D4-4968-A626-E27CE7372148] (Simulator)
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

By default, CircleCI will build your project with Xcode 7.0. You can select 7.2, 7.3 or 8.0.
by specifying the version in a [circle.yml file]({{ site.baseurl }}/configuration/) in the root of your
repo. For example, for 8.0, add the following:

```
machine:
  xcode:
    version: 8.0
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
  to use the latest Xcode 7.3, for example, which is `7.3.1`, it is
  sufficient to specify `7.3` in your `circle.yml`. If a newer point
  release of 7.3 comes out, we will make that one available under the same
  `7.3` version on CircleCI.

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
