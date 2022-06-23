---
layout: classic-docs
title: "Using the macOS execution environment"
description: "Learn how to configure a your jobs to run in the macOS execution environment."
version:
- Cloud
---

The macOS execution environment is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

You can use the macOS execution environment to run your [jobs]({{site.baseurl}}/2.0/jobs-steps/) in a macOS environment on a virtual machine (VM). You can access the macOS execution environment by using the `macos` executor and specifying an Xcode version:

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

## Supported Xcode versions
{: #supported-xcode-versions }

{% include snippets/xcode-versions.md %}

## Available resource classes
{: #available-resource-classes }

Class                 | vCPUs | RAM
----------------------|-------|-----
medium                | 4 @ 2.7 GHz     | 8GB
macos.x86.medium.gen2 | 4 @ 3.2 GHz     | 8GB
large                 | 8 @ 2.7 GHz     | 16GB
macos.x86.metal.gen1                 | 12 @ 3.2 GHz     | 32GB
{: class="table table-striped"}

**Note:** The `macos.x86.metal.gen1` resource requires a minimum 24-hour lease. See the [Dedicated Host for macOS]({{ site.baseurl }}/2.0/dedicated-hosts-macos) page to learn more about this resource class.

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1
    resource_class: large
```

## macOS VM Storage
{: #macos-vm-storage }

The amount of available storage on CircleCI macOS virtual machines depends on the resource class and Xcode image being used. The size of the Xcode images varies based on which tools are pre-installed. The table below indicated how much storage will be available with various Xcode/resource class combinations. Also note the exceptions to this noted below.

Xcode Version | Class                 | Minimum Available Storage
--------------|-----------------------|--------------------------
10.3.0        | medium, large         | 36GB
10.3.0        | macos.x86.medium.gen2 | 36GB
11.*          | medium, large         | 23GB
11.*          | macos.x86.medium.gen2 | 23GB
12.*          | medium, large         | 30GB
12.*          | macos.x86.medium.gen2 | 30GB
13.*          | medium, large         | 23GB
13.*          | macos.x86.medium.gen2 | 89GB
{: class="table table-striped"}

**Note:** If you specify Xcode 12.0.1, 12.4.0 and 12.5.1 you have a minimum 100GB of available storage.

## Image update cycle for the macOS executor
{: #using-the-macos-executor }

Each `macos` job is run a fresh virtual machine, running a specified version macOS. We build a new image each time a new stable, or beta, version of Xcode is released by Apple and aim to get these deployed as soon as possible. Generally, the contents of a particular build image will remain unchanged, except in very exceptional circumstances we might be forced to re-build a container for a specific reason. Our goal is to keep your execution environment stable, and to allow you to opt-in to newer containers by setting the `xcode` key in your `config.yml` file.

Periodically, CircleCI will update the version of macOS each image includes to ensure the execution environment is as up to date as possible. When a new major version of macOS is released, CircleCI will update once the new major version of Xcode reaches the `xx.2` release. This ensures the execution environment is kept stable.

CircleCI will announce the availability of new macOS containers, including Xcode betas, in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

### Beta image support
{: #beta-image-support }

CircleCI aims to make beta Xcode versions available on the macOS executor as soon as possible to allow developers to test their apps ahead of the next stable Xcode release.

Unlike CircleCI's stable images (which are frozen and will not change), once a new beta image is released it will overwrite the previous beta image until a GM (stable) image is released, at which point the image is frozen and no longer updated. 

If you are requesting an image using an Xcode version that is currently in beta, you should expect it to change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode/associated tooling which are beyond CircleCI's control.

To read about CircleCI's customer support policy regarding beta images, please check out the following [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

### Apple silicon support
{: #apple-silicon-support }

It is possible to build Apple Silicon/Universal binaries using Xcode `12.0.0` and higher as Apple provides both the Intel (`x86_64`) and Apple Silicon (`arm64`) toolchains in this release. Cross-compiling Apple Silicon binaries on Intel hosts has an additional overhead, and, as a result, compilation times will be longer than native compilation for Intel.

Running or testing Apple Silicon apps natively is currently not possible as CircleCI build hosts are Intel-based Macs. Binaries will need to be exported as [artifacts]({{site.baseurl}}/2.0/artifacts/) for testing apps locally. Alternatively, [CircleCI runner]({{site.baseurl}}/2.0/runner-overview/#supported) can also be used to run jobs natively on Apple Silicon.

## Xcode Cross Compilation
{: #xcode-cross-compilation }

### Universal Binaries
{: #universal-binaries }

Xcode currently supports the creation of universal
binaries which can be run on both `x86_64` and `ARM64` CPU architectures without
needing to ship separate executables. This is supported only under Xcode 12.2+,
although older Xcode versions can still be used to compile separate `x86_64` and
`ARM64` executables.

### Extracting Unwanted Architectures
{: #extracting-unwanted-architectures }

By default, Xcode 12.2+ will create universal binaries, compiling to a single
executable that supports both `x86_64` and `ARM64` based CPUs. If you need to remove
an instruction set, you can do so by using the `lipo` utility.

Assuming that we are interested in creating a standalone `x86_64` binary from a
universal binary called `circleci-demo-macos`, we can do so by running the
command:

```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

We can then confirm the supported architecture of the extracted binary with
`lipo -info circleci-demo-macos-x86_64`, which will output the following

```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```

### Cross Compiled Binaries
{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still
cross compile binaries for architectures other than the architecture of the
machine being used to build the binary. For xcodebuild the process is relatively
straightforward. To build `ARM64` binaries, prepend the `xcodebuild` command with
`ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...`. For the `x86_64` architecture simply change `ARCHS` to
`x86_64`.

## Optimization and best practises
{: #optimization-and-best-practises }

### Pre-starting the simulator
{: #pre-starting-the-simulator }

Pre-start the iOS simulator before building your
application to make sure that the simulator is booted in time.
Doing so generally reduces the number of simulator
timeouts observed in builds.

To pre-start the simulator, add the macOS orb (version `2.0.0` or higher) to your config:

```yaml
orbs:
  macos: circleci/macos@2
```

Then call the `preboot-simulator` command, as shown in the example below:

```yaml
steps:
  - macos/preboot-simulator:
      version: "15.0"
      platform: "iOS"
      device: "iPhone 13 Pro Max"
```

It is advisable to place this command early in your job to allow maximum time for the simulator to boot in the background.

If you require an iPhone simulator that is paired with an Apple Watch simulator, use the `preboot-paired-simulator` command in the macOS orb:

```yaml
steps:
  - macos/preboot-paired-simulator:
      iphone-device: "iPhone 13"
      iphone-version: "15.0"
      watch-device: "Apple Watch Series 7 - 45mm"
      watch-version: "8.0"
```

**Note:** It may take a few minutes to boot a simulator, or longer if booting a pair of simulators. During this time, any calls to commands such as `xcrun simctl list` may appear to hang while the simulator is booting up.

### Collecting iOS simulator crash reports
{: #collecting-ios-simulator-crash-reports }

Often if your `scan` step fails, for example due to a test runner timeout, it is likely that your app has crashed during the test run. In such cases, collecting crash report is useful for diagnosing the exact cause of the crash. Crash reports can be uploaded as artifacts, as follows:

```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```

### Optimizing Fastlane
{: #optimizing-fastlane }

By default, Fastlane Scan generates test output reports in `html` and `junit` formats. If your tests are taking a long time and you do not need these reports, consider disabling them by altering the `output_type` parameter as described in the [fastlane docs](https://docs.fastlane.tools/actions/run_tests/#parameters).

### Optimizing Cocoapods
{: #optimizing-cocoapods }

In addition to the basic setup steps, it is best practice to use Cocoapods 1.8 or newer which allows the use of the CDN, rather than having to clone the entire Specs repo. This will allow you to install pods faster, reducing build times. If you are using Cocoapods 1.7 or older, consider upgrading to 1.8 or newer as this change allows for much faster job execution of the `pod install` step.

To enable this, ensure the first line in your Podfile is as follows:

```
source 'https://cdn.cocoapods.org/'
```

If upgrading from Cocoapods 1.7 or older, additionally ensure the following line is removed from your Podfile, along with removing the "Fetch CocoaPods Specs" step in your CircleCI Configuration:

```
source 'https://github.com/CocoaPods/Specs.git'
```

To update Cocoapods to the latest stable version, simply update the Ruby gem with the following command:

```shell
sudo gem install cocoapods
```

We also recommend that you check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control). This will ensure that you have a deterministic, reproducible build.

**Note:** The previous S3 mirror we provided for the Cocoapods Spec repo is no longer being maintained or updated since the release of Cocoapods 1.8. It will remain available to prevent existing jobs breaking, we highly recommend switching to the CDN method described above.

### Optimizing Homebrew
{: #optimizing-homebrew }

Homebrew, by default, will check for updates at the start of any operation. As Homebrew has a fairly frequent release cycle, this means that any step which calls `brew` can take some extra time to complete.

If build speed, or bugs introduced by new Homebrew updates are a concern, this automatic update feature can be disabled. On average, this can save up to 2-5 minutes per job.

To disable this feature, define the `HOMEBREW_NO_AUTO_UPDATE` environment variable within your job:

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    environment:
      HOMEBREW_NO_AUTO_UPDATE: 1
    steps:
      - checkout
      - run: brew install wget
```

## Supported build and test tools
{: #supported-build-and-test-tools }

With the macOS executor on CircleCI, it is possible to customize your build as needed to satisfy almost any iOS build and test strategy.

### Common test tools
{: #common-test-tools }

The following common test tools are known to work well on CircleCI:

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)
* [Appium](http://appium.io/)

### React Native projects
{: #react-native-projects }

React Native projects can be built on CircleCI using `macos` and `docker` executor types. For an example of configuring a React Native project, please see [our demo React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native)

### Creating a `config.yml` File
{: #creating-a-configyml-file }

The most flexible way to customize your build is to modify the CircleCI configuration for your project in `.circleci/config.yml`. This allows you to run arbitrary bash commands as well as use built-in features such as workspaces and caching. See the [Configuring CircleCI]( {{ site.baseurl }}/2.0/configuration-reference/) documentation for a detailed description of the structure of the `.circleci/config.yml` file.

## Using Multiple Executor Types (macOS + Docker)
{: #using-multiple-executor-types-macos-docker }

It is possible to use multiple [executor types]({{site.baseurl}}/2.0/executor-intro/) in the same workflow. In the following example each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    environment:
      FL_OUTPUT_DIR: output

    steps:
      - checkout
      - run:
          name: Install CocoaPods
          command: pod install --verbose

      - run:
          name: Build and run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests

      - store_test_results:
          path: output/scan
      - store_artifacts:
          path: output

  swiftlint:
    docker:
      - image: bytesguy/swiftlint:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:
      - image: bytesguy/danger:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: danger

workflows:
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```

## Next steps
{: #next-steps }

Get started with [Configuring a Simple macOS Application on CircleCI]({{ site.baseurl }}/2.0/hello-world-macos).