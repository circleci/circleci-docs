---
layout: classic-docs
title: Test Android Applications
short-title: Android
categories: [build-images]
description: Testing Android applications on CircleCI
sitemap: false
---

CircleCI supports building and testing Android applications.

## Dependencies

The SDK is already installed on the VM at `/usr/local/android-sdk-linux`. We export
this path as `$ANDROID_HOME`.

We have many versions of the Android SDK pre-installed on [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/#android) and [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/#android) build images.

If there's an SDK package that's not here that you would like
installed, you can install it as part of your build with:

```
dependencies:
  pre:
    - echo y | android update sdk --no-ui --all --filter "package-name"
```

**Note:**
Only install one package at a time, as `echo y` will only work for one license. 
If you don't do it this way, Android will give you an error message but won't 
fail and your build continues. This is undesirable since it makes debugging 
very difficult.

`./gradlew dependencies` will also be run automatically if you have a
Gradle wrapper checked in to the root of your repository.

## Building Android Projects Manually

If you only want to build your project you can create a debug build with

```
test:
  override:
    - ./gradlew assembleDebug
```

or build a release `.apk` and save it to [artifacts]( {{ site.baseurl }}/1.0/build-artifacts/) with

```
test:
  override:
    - ./gradlew assembleRelease
    - cp -r project-name/build/outputs $CIRCLE_ARTIFACTS
```

If you start the emulator, you can install your APK on it with something like 
the following:

```
test:
  override:
    - adb install path/to/build.apk
```


### Disable Pre-Dexing to Improve Build Performance

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

## Testing Android Projects

Firstly: if you have a Gradle wrapper in the root of your repository,
we'll automatically run `./gradlew test`.

### Starting the Android Emulator

Starting the android emulator can be an involved process and, unfortunately, can take
a few minutes. You can start the emulator and wait for it to finish with something like
the following:

```
# Disable emulator audio
machine:
  environment:
    QEMU_AUDIO_DRV: none

test:
  pre:
    - emulator -avd circleci-android24 -no-window:
        background: true
        parallel: true
    - circle-android wait-for-boot
```

One important note: it's not possible to emulate Android on x86 or
x86_64 on our build containers. The Android emulator requires KVM on
Linux, and we can't provide it.

`circle-android wait-for-boot` is a tool on our build containers that waits for the emulator
to have finished booting. `adb wait-for-device` is not sufficient here; it only waits
for the device's shell to be available, not for the boot process to finish. You can read more about
this [here][starting-emulator].

[starting-emulator]:https://devmaze.wordpress.com/2011/12/12/starting-and-stopping-android-emulators/


### Running Tests Against the Emulator

The standard way to run tests in the Android emulator is with
something like `./gradlew connectedAndroidTest`.

You may also want to run commands directly with `adb shell`, after
installing your APK on the emulator. Note however that `adb shell`
[does not correctly forward exit codes][adb-shell-bug]. Some commands are:

- `adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > $CIRCLE_ARTIFACTS/screen-$(date +"%T").png`
  to take a screenshot of the emulator and store it as a build artifact.
- `adb shell input keyevent 82` to unlock the emulator, but see the
  next paragraph


Whilst the above command can be used to unlock the emulator, the emulator
could lock if it takes a long time to build the tests. A more thorough
way of unlocking the emulator is to add the following code to the `setUp`
junit method of the test class:

```java
package com.mypackage.espressoTest;

import android.view.WindowManager;
import org.junit.Before;
import org.junit.Rule;
import org.junit.runner.RunWith;

import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;

@RunWith(AndroidJUnit4.class)
class TestClass {
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(
            MainActivity.class);

    @Before
    public void setUp() {
        MainActivity activity = mActivityRule.getActivity();
        Runnable wakeUpDevice = new Runnable() {
            public void run() {
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        };
        activity.runOnUiThread(wakeUpDevice);
    }
}
```

This will wake up the device and try to unlock the screen. If there is a password/pattern lock on the device, then `MainActivity` will get launched on top of the lock screen instead of unlocking the device (how cool is that?).

[adb-shell-bug]: https://code.google.com/p/android/issues/detail?id=3254

## Gradle output formatting

The standard formatting gradle uses when printing to STDOUT can look quite messy and confusing when reviewing your CircleCI builds. To neaten up the output, add `--console=plain` to your gradle commands. So, for example, `./gradlew dependencies` would become `./gradlew dependencies --console=plain`.

### Test Metadata

Many test suites for Android produce JUnit XML output. After running your tests,
you can copy that output to `$CIRCLE_TEST_REPORTS` so that CircleCI will display
the individual test results.

### Deploying to Google Play Store

There are a few plugins for Gradle that allow you to push your `apk` to
Google Play Store with a simple Gradle command, for example [this plugin](https://github.com/Triple-T/gradle-play-publisher).

After applying the plugin and setting up all the configuration details,
you can use the `deployment` section of your `circle.yml` to publish the
`apk` to the desired channel. We suggest reading the channel from
a property in the plugin configuration like this:

```
play {
  track = "${track}"
}
```

This will allow you to specify different deployment channels right in
the `circle.yml`:

```
deployment:
  production: # just a label; label names are completely up to you
    branch: master
    commands:
      - ./gradlew publishApkRelease
        -Dorg.gradle.project.track=production
  beta:
    branch: develop
    commands:
      - ./gradlew publishApkRelease
        -Dorg.gradle.project.track=beta
```

## Sample circle.yml

```
test:
  override:
    # start the emulator
    - emulator -avd circleci-android24 -no-window:
        background: true
        parallel: true
    # wait for it to have booted
    - circle-android wait-for-boot
    # run tests  against the emulator.
    - ./gradlew connectedAndroidTest
    # copy the build outputs to artifacts
    - cp -r my-project/build/outputs $CIRCLE_ARTIFACTS
    # copy the test results to the test results directory.
    - cp -r my-project/build/outputs/androidTest-results/* $CIRCLE_TEST_REPORTS
```
