<!--

title: Test iOS applications
short_title: iOS
last_updated: August 28, 2015

-->

CircleCI now offers Beta support for building and testing iOS (and OSX) projects.
To enable this feature, go to **Project Settings > Experimental Settings** and
enable the "Build iOS project" experimental setting. This will cause builds for
this project to be run on OSX machines rather than the usual Linux containers,
and iOS-related build and test commands will be automatically inferred.


## Basic setup

Simple projects should run with minimal or no configuration. By default,
CircleCI will:

* **Install any Ruby gems specified in a Gemfile** - You can install a specific
  version of CocoaPods or other gems this way.
* **Install any dependencies managed by [CocoaPods](http://cocoapods.org/)**
* **Run the "test" build action for detected workspace (or project) and scheme
  from the command line using `xctool`** - If a workspace is detected, it
  will take precedence over a project and be used to call `xctool`. The
  detected settings can be overridden with [environment variables](#environment-variables)

See [customizing your build](#customizing-your-build) for more information about
customization options.

## Xcode Version

By default, CircleCI will build your project with Xcode 6.4. You can select 7.0 or 7.1
by specifying the version in a [circle.yml file](/docs/configuration) in the root of your
repo. For example, for 7.1, add the following:

```
machine:
  xcode:
    version: "7.1"
```

## Shared Schemes
Your scheme (what you select in the dropdown next to the run/stop buttons in
Xcode) must be shared (there is a checkbox for this at the bottom of the
"Edit scheme" screen in Xcode) so that CircleCI can run the appropriate build
action. After doing this you will have a new `.xcscheme` file located in the
`xcshareddata/xcschemes` folder under your Xcode project. You will need to
commit this file to your git repository so that CircleCI can access it.

If more than one scheme is present, then you should specify the
`XCODE_SCHEME` [environment variable](/docs/environment-variables#custom).
Otherwise a scheme will be chosen arbitrarily.

### CocoaPods

CircleCI will automatically detect if your project is using [CocoaPods](http://cocoapods.org/)
to manage dependencies. If you are using CocoaPods, then we recommend that you
check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-ignore-the-pods-directory-in-source-control).
This will ensure that you have a deterministic, reproducable build.

If CircleCI finds a `Podfile` and no `Pods` directory, then we will run
`pod install` to install the necessary dependencies in the `dependencies`
step of your build.

##Supported build and test tools

CircleCI's automatic commands cover a lot of common test patterns, and you can customize your build
as needed to satisfy almost any iOS build and test strategy.

###XCTest-based tools
In addition to standard `XCTestCase` tests, CircleCI will automatically run tests
written in any other tool that builds on top of XCTest and is configured to run
via the "test" build action. The following test tools are known to work well on CircleCI
(though many others should work just fine):

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/Introduction/Introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)

###Other tools
Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also
work normally, though they will need to be installed and called using custom commands.
See [customizing your build](#customizing-your-build) for more info.


## Customizing your build
While CircleCI's inferred commands will handle many common testing patterns, you
also have a lot of flexibility to customize what happens in your build.

## Build Commands
CircleCI runs tests from the command line with the [`xctool`](https://github.com/facebook/xctool)
command by default. We have found that `xctool` is more stable when testing with
the iOS simulator than using `xcodebuild` directly.

CircleCI will try to automatically build your iOS project by infering the
workspace, project and scheme. In some cases, you may need to override the
inferred test commands. The following command is representative of how CircleCI
will build an iOS project:

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

In some situations you might also want to build with `xcodebuild` directly. A
typical `xcodebuild` command line should look like this:

```
test:
  override:
    - set -o pipefail &&
      xcodebuild
        CODE_SIGNING_REQUIRED=NO
        CODE_SIGN_IDENTITY=
        PROVISIONING_PROFILE=
        -sdk iphonesimulator
        -destination 'platform=iOS Simulator,OS=8.1,name=iPhone 6'
        -workspace MyWorkspace.xcworkspace
        -scheme "My Scheme"
        clean build test |
      tee $CIRCLE_ARTIFACTS/xcode_raw.log |
      xcpretty --color --report junit --output $CIRCLE_TEST_REPORTS/xcode/results.xml
```



### Environment variables
You can customize the behavior of CircleCI's automatic build commands by setting
the following environment variables in a `circle.yml` file or at **Project Settings > Environment Variables** (see [here](/docs/environment-variables#custom) for more info
about environment variables):

* `XCODE_WORKSPACE` - The path to your `.xcworkspace` file relative to the git repository root
* `XCODE_PROJECT` - The path to your `.xcodeproj` file relative to the repository root
* `XCODE_SCHEME` - The name of the scheme you would like to use to run the "test" build action

**Note:** Only one of `XCODE_WORKSPACE` or `XCODE_PROJECT` will be used, with workspace taking
precedence over project.

###Configuration file
The most flexible means to customize your build is to add a `circle.yml` file to your project,
which allows you to run arbitrary bash commands instead of or in addition to the inferred commands
at various points in the build process. See the [configuration doc](/docs/configuration) for
a detailed discussion of the structure of the `circle.yml` file. Note, however, that
a number of options, particularly in the `machine` section, may result in errors because
OSX vms feature fewer pre-installed packages and options than our standard Linux containers.
In such cases you may need to run custom commands in appropriate build phases and install
custom packages yourself (see below).

###Custom packages
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

### Upgrading CocoaPods

It is possible to upgrade the version of CocoaPods installed on the container
by editing your `circle.yml` file. You will need to set the terminal ouput to
UTF-8, and use `sudo` to install the gem. The example below will install
CocoaPods version 0.39.0.

```
machine:
  environment:
    # CocoaPods versions greater than 0.34 require
    # your terminal to be using UTF-8 encoding.
    LANG: en_US.UTF-8
dependencies:
  pre:
    - sudo gem install cocoapods --version 0.38.2
    # CocoaPods sometimes has issues using caches
    # between different versions of CocoaPods.
    - pod setup
    - pod install
```

##Code signing and deployment
You can build a signed app and deploy to various destinations using the customization options
mentioned [above](#customizing-your-build). Note that [environment variables](/docs/environment-variables#custom) set in
the UI are encrypted and secure and can be used to store credentials related to signing and deployment.
Contact support at [sayhi@circleci.com](mailto:sayhi@circleci.com) if you need help with code signing
or deployment.

##A note on code-generating tools
Many iOS app developers use tools that generate substantial amounts of code. In such
cases CircleCI's inference may not correctly detect the Xcode workspace, project, or
scheme. Instead, you can specify these through [environment variables](/docs/environment-variables#custom).


##Constraints on OSX-based builds
During the Beta phase, there are a few features normally available on CircleCI's standard
Linux containers that are not available on OSX vms:

* It is not possible yet to SSH into build containers
* Parallelism is not supported
* While the general `circle.yml` file structure will be honored in OSX-based builds
[configuration options](/docs/configuration) that would normally be specified in the
`machine:language` (e.g. language version declarations), `machine:services`,
or a few other sections will not work correctly.
See the [customizing your build](#customizing-your-build) section for alternatives.

## Simulator Stability

There is a Known Issue with the iOS Simulator in Xcode 6 that is documented in
the [Xcode release notes](https://developer.apple.com/library/mac/releasenotes/DeveloperTools/RN-Xcode/Xcode_Release_Notes.pdf)
as follows:

> Testing on iOS simulator may produce an error indicating that the application
> could not be installed or launched.
> Re-run testing or start another integration. (17733855)

This issue is further discussed in a [sticky post on the official iOS developer
forums](https://devforums.apple.com/thread/248879).

When this bug occurs Xcode will output a message like:

> Unable to run app in Simulator If you believe this error represents a bug,
> please attach the log file at /var/folders/jm/fw86rxds0xn69sk40d18y69m0000g/T/com.apple.dt.XCTest-status/Session-2015-02-19_18:37:47-WjiMos.log

The path and timestamp of the log file will change from run to run, but the
location is always `$TMPDIR/com.apple.dt.XCTest-status/`.

The log file will contain the following output:

```
Initializing test infrastructure.
Creating the connection.
Listening for proxy connection request from the test bundle (all platforms)
Resuming the connection.
Test connection requires daemon assistance.
Checking test manager availability..., will wait up to 120s
testmanagerd handled session request.
Waiting for test process to launch.
Launch session started, setting a disallow-finish-token on the run operation.
Waiting for test process to check in..., will wait up to 120s
Adding console adaptor for test process.
Test operation failure: Unable to run app in Simulator
_finishWithError:Error Domain=IDEUnitTestsOperationsObserverErrorDomain Code=3 "Unable to run app in Simulator" UserInfo=0x7fbb496f1c00 {NSLocalizedDescription=Unable to run app in Simulator} didCancel: 1
```

We have found the taking the recommended action (re-trying the test) is not
effective. Instead, we have had good success working around this bug in the
simulator by using [`xctool`](https://github.com/facebook/xctool) for building
and testing Xcode projects instead of `xcodebuild`.

If you encounter this bug when building your project on CircleCI please contact
us through the in-app messenger or through [sayhi@circleci.com](mailto:sayhi@circleci.com).
We will be happy to help you work around the issue.

## Software Versions

The OSX container that CircleCI uses to build has the following software
versions installed:

- OS X 10.10.3 (14D136) Darwin 14.3.0
- Xcode:
  - 6.4 Build version 6E35b
  - 7.0 Build version 7A218
  - 7.1.1 Build version 7B1005
- Facebook xctool 0.2.7
- CocoaPods 0.39.0
- xcpretty 0.1.12
- fastlane 1.39.0
- carthage 0.10.0
- shenzhen 0.13.1
