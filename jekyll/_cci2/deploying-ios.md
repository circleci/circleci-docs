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


Finally, Fastlane requires some information from us in order to know which Apple ID to use and which app identifier we are targeting. These can be set in the `fastlane/Appfile` as follows:

```ruby
# fastlane/Appfile
apple_id "ci@example.com"
app_identifier "com.example.HelloWorld"
```

### Deploying to the App Store

The example below shows a basic lane to build, sign and upload a binary to App Store Connect. The `deliver` action provided by Fastlane is a powerful tool that automates the App Store submission process. 

Deliver also allows various options such as automatic uploading of metadata and screenshots (which can be generated with the [screenshot](https://docs.fastlane.tools/actions/snapshot/) and [frameit](https://docs.fastlane.tools/actions/frameit/) actions). For further configuration, refer to the Fastlane [documentation for deliver](https://docs.fastlane.tools/actions/deliver/).

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload Release to App Store"
  lane :upload_release do
    # Get the version number from the project and check against
    # the latest build already available on App Store Connect, then
    # increase the build number by 1. If no build is available
    # for that version, then start at 1
    increment_build_number(
      build_number: app_store_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloCircle.xcodeproj"),
        live: false
      ) + 1,
    )
    # Set up Distribution code signing and build the app
    match(type: "appstore")
    gym(scheme: "HelloCircle")
    # Upload the binary to App Store Connect
    deliver(
      submit_for_review: false,
      force: true
    )
  end
end
```

### Deploying to TestFlight

TestFlight is Apple's beta distribution service which is tied into App Store Connect. Fastlane provides the `pilot` action to make managing TestFlight distribution simple.

The example below shows how Fastlane can be configured to automatically build, sign and upload an iOS binary. Pilot has lots of customisation options to help deliver apps to TestFlight, so it is highly recommended to check out the [pilot documentation](https://docs.fastlane.tools/actions/pilot/) for further information.

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
    # increase the build number by 1. If no build is available
    # for that version, then start at 1
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

## Deploying to Visual Studio App Center

Visual Studio App Center, formally HockeyApp, is a distribution service from Microsoft. App Center integration with Fastlane is enabled by installing the [App Center plugin](https://github.com/microsoft/fastlane-plugin-appcenter).

### Fastlane Plugin Setup

To set up the plugin for your project, On your local machine open your project directory in Terminal and run the command `fastlane add_plugin appcenter`. This will install the plugin and add the required information to `fastlane/Pluginfile` and your `Gemfile`. 

**Note:** It is important that both of these files are checked into your git repo so that this plugin can be installed by CircleCI during the job execution via a `bundle install` step.

### App Center Setup

First, the app needs to be created in VS App Center.

1. Log in, or sign up, to [Visual Studio App Center](https://appcenter.ms/)
2. At the top-right of the page, click on "Add New", then select "Add New App"
3. Fill out the required information in the form as required

Once this is complete you will need to generate an API token to allow Fastlane to upload to App Center. 

1. Go to the [API Tokens](https://appcenter.ms/settings/apitokens) section in Settings
2. Click on "New API Token"
3. Enter a description for the token, then set the access to "Full Access"

When the token is generated, make sure to copy it somewhere safe.

### Fastlane Configuration

Below is an example of a lane that distributes beta app builds to Visual Studio App Center. Both the username of your App Center account and an API Token with "Full Access" is required to upload the binary to App Center.

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to VS App Center"
  lane :upload_appcenter do
    # Here we are using the CircleCI job number
    # for the build number
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    # Set up Adhoc code signing and build  the app
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    # Set up the required information to upload the
    # app binary to VS App Center
    appcenter_upload(
      api_token: "YOUR_API_TOKEN",
      owner_name: "YOUR_VS_APPCENTER_USERNAME",
      owner_type: "user",
      app_name: "HelloWorld"
    )
  end
end
```