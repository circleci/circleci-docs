---
layout: classic-docs
title: Deploying iOS Applications
short-title: Deploying iOS Applications
categories: [platforms]
description: Deploying iOS Applications
order: 1
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

To set up Fastlane to automatically upload iOS binaries to App Store Connect and/or TestFlight, a few steps need to be followed to allow Fastlane access to your App Store Connect account. For ease of use and security, it is advisable to create a new user, with limited privileges, in App Store Connect that will only be used for your CI jobs.

1. Head over to the [Users and Access](https://appstoreconnect.apple.com/access/users) section of App Store Connect
2. Click on the `+` to add a new user
3. Fill out the form, giving the user a unique email (such as `ci@yourcompany.com`) and select the "App Manager" role along with selecting the app to provide access to.
4. Check the email inbox for the user you just created and click on the confirmation link

**Note:** If this is a new Apple ID, you may need to log in to [Apple ID](https://appleid.apple.com/) and App Store Connect/Developer Portal at least once to agree to any privacy policies before being able to use the account for Fastlane

Next, the password for the App Store Connect user needs to be added to the CircleCI project as an environment variable. In the project settings on CircleCI, navigate to **Build Settings -> Environment Variables** and add the `FASTLANE_PASSWORD` variable, and set its value to the password for the App Store Connect account. The password will be stored encrypted at rest.

Finally, Fastlane requires some information from us in order to know which Apple ID to use and which app identifier we are targeting. These can be set in the `fastlane/Appfile` as follows:

```ruby
# fastlane/Appfile
apple_id "ci@yourcompany.com"
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

## Deploying to Firebase

Firebase is a distribution service from Google. Deploying to Firebase is simplified by installing the [Firebase app distribution plugin](https://github.com/fastlane/fastlane-plugin-firebase_app_distribution).

### Fastlane Plugin Setup

To set up the plugin for your project, On your local machine open your project directory in Terminal and run the command `fastlane add_plugin firebase_app_distribution`. This will install the plugin and add the required information to `fastlane/Pluginfile` and your `Gemfile`. 

**Note:** It is important that both of these files are checked into your git repo so that this plugin can be installed by CircleCI during the job execution via a `bundle install` step.

### Generating a CLI Token

Firebase requires a token to used during authentication. To generate the token, we need to use the Firebase CLI and a browser - as CircleCI is a headless environment, we will need to generate this token locally, rather than at runtime, then add it to CircleCI as an environment variable.

1. Download and install the Firebase CLI locally with the command `curl -sL https://firebase.tools | bash`
2. Trigger a login by using the command `firebase login:ci`
3. Complete the sign in via the browser window, then copy the token provided in the Terminal output
4. Go to your project settings in CircleCI and create a new environment variable named `FIREBASE_TOKEN` with the value of the token.

### Fastlane Configuration

The Firebase plugin requires minimal configuration to upload an iOS binary to Firebase. The main parameter is `app` which will require the App ID set by Firebase. To find this, go to your project in the [Firebase Console](https://console.firebase.google.com), then go to `Settings -> General`. Under "Your apps", you will see the list of apps that are part of the project and their information, including the App ID (generally in the format of `1:123456789012:ios:abcd1234abcd1234567890`).

For more configuration options, see the [Firebase Fastlane plugin documentation](https://firebase.google.com/docs/app-distribution/ios/distribute-fastlane#step_3_set_up_your_fastfile_and_distribute_your_app).

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload to Firebase"
  lane :upload_firebase do
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    firebase_app_distribution(
      app: "1:123456789012:ios:abcd1234abcd1234567890",
      release_notes: "This is a test release!"
    )
  end
end
```

To use the Firebase Fastlane plugin, the Firebase CLI must be installed as part of the job via the `curl -sL https://firebase.tools | bash` command:

```yaml
version: 2.1
jobs:
  adhoc:
    macos:
      xcode: "11.3.1"
    environment:
      FL_OUTPUT_DIR: output
    steps:
      - checkout
      - run: echo 'chruby ruby-2.6' >> ~/.bash_profile
      - run: bundle install
      - run: curl -sL https://firebase.tools | bash
      - run: bundle exec fastlane upload_firebase

workflows:
  adhoc-build:
    jobs:
      - adhoc
```

**Note:** The Firebase plugin may cause errors when run with the macOS system Ruby. It is therefore advisable to [switch to a different ruby version][({{ site.baseurl }}/2.0/testing-ios/#using-custom-ruby-versions)

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
4. When the token is generated, make sure to copy it somewhere safe.
5. Go to your project settings in CircleCI and create a new environment variable named `VS_API_TOKEN` with the value of the API Key.

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
      api_token: ENV[VS_API_TOKEN],
      owner_name: "YOUR_VS_APPCENTER_USERNAME",
      owner_type: "user",
      app_name: "HelloWorld"
    )
  end
end
```

## Uploading to TestFairy

[TestFairy](https://www.testfairy.com) is another popular Enterprise App distribution and testing service. Fastlane has built in support for TestFairy making it quick and easy to upload new builds to the service.

![TestFairy preferences image](  {{ site.baseurl }}/assets/img/docs/testfairy-open-preferences.png)

1. On the TestFairy dashboard, navigate to the Preferences page.
2. On the Preferences page, go to the API Key section and copy your API Key.
3. Go to your project settings in CircleCI and create a new environment variable named `TESTFAIRY_API_KEY` with the value of the API Key.

### Fastlane Configuration

To configure uploading to TestFairy within Fastlane, see the following example:

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to TestFairy"
  lane :upload_testfairy do
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
    testfairy(
      api_key: ENV[TESTFAIRY_API_KEY],
      ipa: 'path/to/ipafile.ipa',
      comment: ENV[CIRCLE_BUILD_URL]
    )
  end
end
```
