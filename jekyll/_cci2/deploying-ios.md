---
layout: classic-docs
title: Deploying iOS Applications
short-title: Deploying iOS Applications
categories: [platforms]
description: Deploying iOS Applications
order: /?
---

This document describes how to configure Fastlane to automatically deploy iOS apps from CircleCI to a distribution service.

* TOC
{:toc}

## Overview
{:.no_toc}

Utilising Fastlane, CircleCI can automatically deploy iOS apps to various services. This helps remove the manual steps required to ship a beta, or release, version of an iOS app to the intended audience.

These deployment lanes can be combined with testing lanes so that the app is automatically deployed upon a successful build and test.

**Note:** Using these deployment examples requires that code signing be already configured for your project. To learn how to set up code signing, see the [code signing documentation]({{ site.baseurl }}/2.0/ios-codesigning/).

## Best Practises

### Using Git Branches

It is advisable to only run your release lane on a specific branch of your git repository, for example a dedicated release/beta branch. This will allow releases on only successful merges into the specified branch, prevent a release every time a push is committed during your development phase. In turn this will also reduce job completion time as uploading to an external service may take some time depending on the size our the iOS app binary. For information on how to set up a workflow to achieve this, check out the [Branch-Level Job Execution]({{ site.baseurl }}/2.0/workflows/#branch-level-job-execution) documentation.

### Setting the Build Number

When uploading to a deployment service, it is important to consider the build number of the iOS app binary. Commonly this is set in the `.xcproject` and has to be updated manually to ensure it is unique. If the build number is not updated before each run of the deployment lane, you may find the receiving service rejects the binary due to a build number conflict.

Fastlane provides an `increment_build_number` [action](https://docs.fastlane.tools/actions/increment_build_number/) which allows the build number to be modified during the lane execution. As an example, if you want to tie the build number to a particular CircleCI job, consider using the `$CIRCLE_BUILD_NUM` environment variable:

```ruby
increment_build_number(
  build_number: "$CIRCLE_BUILD_NUM"
)
```

## App Store Connect

### Setting up

TODO: Describe creating a new user for ASC and setting Fastlane envars

### Deploying to the App Store

```ruby

```

### Deploying to TestFlight

TestFlight is Apple's beta distribution service which is tied into App Store Connect. Fastlane provides the `pilot` [action](https://docs.fastlane.tools/actions/pilot/) to make managing TestFlight distribution simple.

The example below shows how Fastlane can be configured to automatically build, sign and upload an iOS binary:

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload to Testflight"
  lane :upload_testflight do
    # Get the version number from the project and check against
    # the latest build already available on TestFlight, then
    # increase the build number by 1
    increment_build_number(
      build_number: latest_testflight_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloWorld.xcodeproj")
      ) + 1,
    )
    # Set up Distribution code signing and build the app
    match(type: "appstore")
    gym(scheme: "HelloWorld")
    # Upload the binary to TestFlight and automatically publish
    # to the configured beta testing group
    pilot(
      distribute_external: true,
      notify_external_testers: true,
      groups: ["HelloWorld Beta Testers"],
      changelog: "This is another new build from CircleCI!"
    )
  end
end
```

Fastlane requires some information from us in order to know which Apple ID to use and which app identifier we are targeting. These can be set in the `fastlane/Appfile` as follows:

```ruby
# fastlane/Appfile
apple_id "ci@example.com"
app_identifier "com.example.HelloWorld"
```

## Deploying to Visual Studio App Center

Visual Studio App Center, formally HockeyApp, is a distribution service from Microsoft.

```ruby

```