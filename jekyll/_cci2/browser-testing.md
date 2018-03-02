---
layout: classic-docs
title: Browser Testing
description: Browser Testing on CircleCI
category: [test]
---

*[Test]({{ site.baseurl }}/2.0/basics/) > Browser Testing*

This document describes common methods for running and debugging browser testing in your CircleCI config in the following sections:

* TOC
{:toc}

## Prerequisites

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, PhantomJS, Firefox, and Chrome.

## Overview

CircleCI automatically runs all your tests, against whatever browsers you choose, every time you commit code. You can configure your browser-based tests to run whenever a change is made, before every deployment, or on a certain branch. 

## Selenium 

Many automation tools used for browser tests use Selenium WebDriver, a widely-adopted browser driving standard. 

Selenium WebDriver provides a common API for programatically driving browsers implemented in several popular languages, including Java, Python, and Ruby. Because Selenium WebDriver provides a unified interface to talk to all of these browsers, you only need to write your browser tests once, and you can run them on as many browsers and platforms as you want. See the [Selenium documentation](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project) for details on set up. Refer to the [Xvfb man page](http://www.xfree86.org/4.0.1/Xvfb.1.html) for virtual framebuffer X server documentation.

WebDriver can operate in two modes: local or remote. When run locally, your tests use the Selenium WebDriver library to communicate directly with a browser on the same machine. When run in remote mode, your tests interact with a Selenium Server, and it it is up to the server to drive the browsers. 

Selenium needs to be installed and run as shown in the following example if it is not included in the primary docker image:

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node-browsers
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

Sauce Labs essentially provides a Selenium Server as a service, with all kinds of browsers available to test. It has some extra goodies like videos of all test runs as well. 

## Sauce Labs

Sauce Labs operates browsers on a network separate from CircleCI build containers, so there needs to be a way for the browsers to access the web application you want to test. 

You can run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs'
secure tunnel, [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).
Sauce Connect allows you to run a test server within the CircleCI build container
and expose it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you
run your browser tests after deploying to a publicly accessible staging environment,
then you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `circle.yml` file demonstrates how to run browser tests through Sauce Labs
against a test server running within a CircleCI build container.

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:jessie-node-browsers
    steps:
      - checkout
      - run: 
          command: |
            wget https://saucelabs.com/downloads/sc-latest-linux.tar.gz
            tar -xzf sc-latest-linux.tar.gz
      - run: 
          name: sauce testing
          command: npm run-script sauce
          environment:
            SAUCE_USERNAME: # ?
            SAUCE_ACCESS_KEY: # ?
      - run: # Wait for app to be ready
          command: wget --retry-connrefused --no-check-certificate -T 30 http://localhost:5000
      - run: # Run selenium tests
          command: nosetests
      - run: # wait for Sauce Connect to close the tunnel
          command: killall --wait sc  
```

## BrowserStack and Appium

In this same way, you could replace the installation of Sauce Labs with installation of another cross-browser testing platform such as BrowserStack and set the USERNAME and ACCESS_KEY [environment variables]({{ site.baseurl }}/2.0/env-vars/) to those for your BrowserStack account.

For mobile applications, it is possible to use Appium or an equivalent platform that also uses the WebDriver protocol by installing Appium in your job and using CircleCI [environment variables]({{ site.baseurl }}/2.0/env-vars/) for the USERNAME and ACCESS_KEY.

## Debugging Browser Tests

Integration tests can be hard to debug, especially when they're running on a remote machine.
This section provides some examples of how to debug browser tests on CircleCI.

### Using Screenshots and Artifacts

CircleCI can be configured to collect [build artifacts]( {{ site.baseurl }}/2.0/artifacts/)
and make them available from your build. For example, artifacts enable you to save screenshots as part of your build,
and view them when the build finishes. You must explicitly collect those files with the `store_artifacts` step and specify the `path` and `destination`, see the [store_artifacts]( {{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) section of the Configuration Reference for an example.

Saving screenshots is straightforward: it's a built-in feature in WebKit and Selenium, and is supported by most test suites:

*   [Manually, using Selenium directly](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Automatically on failure, using Cucumber](https://github.com/mattheworiordan/capybara-screenshot)
*   [Automatically on failure, using Behat and Mink](https://gist.github.com/michalochman/3175175)

### Using a Local Browser to Access HTTP server on CircleCI

If you are running a test that runs an HTTP server on CircleCI, sometimes it can
be helpful to use a browser running on your local machine to debug why a
particular test is failing. Setting this up is easy with an SSH-enabled
run.

First, run an SSH build using the Rerun Job with SSH button on the Builds page of the CircleCI app. You will be shown the command to log into
the container over SSH. This command will look like this:

```
ssh -p 64625 ubuntu@54.221.135.43
```

To add port-forwarding to the command, use the `-L` flag.
The following example forwards
requests to `http://localhost:3000` to port `8080` on the CircleCI container.
This would be useful, for instance, if your build runs a debug Ruby on Rails app, which listens
on port 8080.

```
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```

You can now open your browser on your local machine and navigate to
`http://localhost:8080` and this will send requests directly to the server
running on port `3000` on the CircleCI container. You can also manually start the
test server on the CircleCI container (if it is not already running), and you
should be able to access the running test server from the browser on your development machine.

This is a very easy way to debug things when setting up Selenium tests, for
example.

### Interacting With the Browser Over VNC

VNC allows you to view and interact with the browser that is running your tests. This will only work if you're using a driver that runs a real browser. You will be able to interact with a browser that Selenium controls, but phantomjs is headless &mdash; there is nothing to interact with.

Before you start, make sure you have a VNC viewer installed. If you're using macOS, we recommend
[Chicken of the VNC](http://sourceforge.net/projects/chicken/).
[RealVNC](http://www.realvnc.com/download/viewer/) is also available on most platforms.

First, [start an SSH run]( {{ site.baseurl }}/2.0/ssh-access-jobs/)
to a CircleCI container. When you connect to the machine, add the -L flag and forward the remote port 5901 to the local port 5902:

```
daniel@mymac$ ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```

You should be connected to the CircleCI container. Now start the VNC server:

```
ubuntu@box159:~$ vnc4server -geometry 1280x1024 -depth 24
```

Enter the password `password` when it prompts you. Your connection is secured with SSH, so there is no need for a strong password. You do need to enter a password to start the VNC server.

Start your VNC viewer and connect to `localhost:5902`. Enter the password when it prompts you. You should see a display containing a terminal window. You can ignore any warnings about an insecure or unencrypted connection. Your connection is secured through the SSH tunnel.

Next, make sure to run:

```
ubuntu@box159:~$ export DISPLAY=:1.0
```

to ensure that windows open in the VNC server, rather than the default headless X server.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

For information about Headless Chrome, refer to the [Headless Chrome for More Reliable, Efficient Browser Testing](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/) CircleCI blog post and the [Related Discuss](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112) thread.

### Sharing CircleCI's X Server

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use x11vnc to attach a VNC server to X.

Download [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) and start it before your tests:

```
    steps:
      - run:
          name: Download and start X
          command: |
            sudo apt-get install -y x11vnc
            x11vnc -forever -nopw:
          background: true
```

Now when you [start an SSH build]( {{ site.baseurl }}/2.0/ssh-access-jobs/), you'll be able to connect to the VNC server while your default test steps run. You can either use a VNC viewer that is capable of SSH tunneling, or set up a tunnel on your own:

```
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## X11 forwarding over SSH

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

Before you start, make sure you have an X Window System on your computer. If you're using macOS, we recommend
[XQuartz](http://xquartz.macosforge.org/landing/).

With X set up on your system, [start an SSH build]( {{ site.baseurl }}/2.0/ssh-access-jobs/)
to a CircleCI VM, using the `-X` flag to set up forwarding:

```
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```

This will start an SSH session with X11 forwarding enabled.

To connect your VM's display to your machine, set the display environment variable to `localhost:10.0`

```
ubuntu@box10$ export DISPLAY=localhost:10.0
```

Check that everything is working by starting xclock.

```
ubuntu@box10$ xclock
```

You can kill xclock with `Ctrl+c` after it appears on your desktop.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### VNC Viewer Recommendations

Some of our customers have had some VNC clients perform poorly and
others perform well.  Particularly, on macOS, RealVNC produces a better
image than Chicken of the VNC.

If you have had a good or bad experience with a VNC viewer,
[let us know](https://support.circleci.com/hc/en-us) so we can update this page and help
other customers.

## Troubleshooting

If you find that VNC or X11 disconnects unexpectedly, your build container may be running out of memory. See [our guide to memory limits]( {{ site.baseurl }}/1.0/oom/) to learn more.

