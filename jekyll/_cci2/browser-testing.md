---
layout: classic-docs
title: Browser Testing
description: Browser Testing on CircleCI
category: [test]
---

This document describes common methods for running and debugging browser testing in your CircleCI config in the following sections:

* TOC
{:toc}

## Prerequisites
{:.no_toc}

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, Geckodriver, Firefox, and Chrome. Add  `-browsers-legacy` to the image name for a variant which includes PhantomJS.

## Overview
{:.no_toc}

Every time you commit and push code, CircleCI automatically runs all of your tests against the browsers you choose. You can configure your browser-based tests to run whenever a change is made, before every deployment, or on a certain branch. 

## Selenium 

Many automation tools used for browser tests use Selenium WebDriver, a widely-adopted browser driving standard. 

Selenium WebDriver provides a common API for programatically driving browsers implemented in several popular languages, including Java, Python, and Ruby. Because Selenium WebDriver provides a unified interface for these browsers, you only need to write your browser tests once. These tests will work across all browsers and platforms. See the [Selenium documentation](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project) for details on set up. Refer to the [Xvfb man page](http://www.xfree86.org/4.0.1/Xvfb.1.html) for virtual framebuffer X server documentation.

WebDriver can operate in two modes: local or remote. When run locally, your tests use the Selenium WebDriver library to communicate directly with a browser on the same machine. When run remotely, your tests interact with a Selenium Server, and it is up to the server to drive the browsers. 

If Selenium is not included in your primary docker image, install and run Selenium as shown below::

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:jessie-browsers
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

Refer to the [Install and Run Selenium to Automate Browser Testing]({{ site.baseurl }}/2.0/project-walkthrough/) section of the 2.0 Project Tutorial for a sample application. Refer to the [Knapsack Pro documentation](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless) for an example of Capybara/Selenium/Chrome headless CircleCI 2.0 configuration for Ruby on Rails.

For more information about working with Headless Chrome,
see the CircleCI blog post [Headless Chrome for More Reliable, Efficient Browser Testing](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)
and the related [discuss thread](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112).

As an alternative to configuring your environment for Selenium, Sauce Labs provides a Selenium Server as a service, with a large number of browsers and system combinations available to test. Sauce Labs also has some extra goodies like videos of all test runs. 

## Sauce Labs

Sauce Labs operates browsers on a network that is separate from CircleCI build containers. To allow the browsers access
the web application you want to test, run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs' secure tunnel [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).

Sauce Connect allows you to run a test server within the CircleCI build container and expose it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you run your browser tests after deploying to a publicly accessible staging environment, you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `config.yml` file shows how to run browser tests through Sauce Labs against a test server running within a CircleCI build container.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:jessie-node-browsers
    steps:
      - checkout
      - run:
          name: Install Sauce Labs and Set Up Tunnel
          background: true
          command: |
            curl https://saucelabs.com/downloads/sc-4.4.12-linux.tar.gz -o saucelabs.tar.gz
            tar -xzf saucelabs.tar.gz
            cd sc-*
            bin/sc -u ${SAUCELABS_USER} -k ${SAUCELABS_KEY}
            wget --retry-connrefused --no-check-certificate -T 60 localhost:4445  # wait for app to be ready
      - run: # base image is python, so we run `nosetests`, an extension of `unittest`
          command: nosetests
      - run:
          name: Shut Down Sauce Connect Tunnel
          command: |
            kill -9 `cat /tmp/sc_client.pid`          
```

### Sauce Labs Browser Testing Orb Example

CircleCI has developed a Sauce labs browser testing orb that enables you to open a Sauce Labs tunnel before performing any browser testing. This orb (a package of configurations that you can use in your workflow) has been developed and certified for use and can simplify your configuration workflows. An example of the orb is shown below.

```
version: 2.1
orbs:
  sauce-connect: saucelabs/sauce-connect@1.0.1
workflows:
  browser_tests:
    jobs:
      - sauce-connect/with_proxy:
          name: Chrome Tests
          steps:
            - run: mvn verify -B -Dsauce.browser=chrome  -Dsauce.tunnel="chrome"
          tunnel_identifier: chrome
      - sauce-connect/with_proxy:
          name: Safari Tests
          steps:
            - run: mvn verify -B -Dsauce.browser=safari  -Dsauce.tunnel="safari"
          tunnel_identifier: safari
```

For more detailed information about the Sauce Labs orb and how you can use the orb in your workflows, refer to the [Sauce Labs Orb](https://circleci.com/orbs/registry/orb/saucelabs/sauce-connect) page in the [CircleCI Orbs Registry] (https://circleci.com/orbs/registry/).

## BrowserStack and Appium

As in the Sauce Labs example above, you could replace the installation of Sauce Labs with an installation of another cross-browser testing platform such as BrowserStack. Then, set the USERNAME and ACCESS_KEY [environment variables]({{ site.baseurl }}/2.0/env-vars/) to those associated with your BrowserStack account.

For mobile applications, it is possible to use Appium or an equivalent platform that also uses the WebDriver protocol by installing Appium in your job and using CircleCI [environment variables]({{ site.baseurl }}/2.0/env-vars/) for the USERNAME and ACCESS_KEY.

## Cypress

Another browser testing solution you can use in your Javascript end-to-end testing is [Cypress] (https://www.cypress.io/). Unlike a Selenium-architected browser testing solution, when using Cypress, you can run tests in the same run-loop as your application. To simplify this process, you may use a CircleCI-certified orb to perform many different tests, including running all Cypress tests without posting the results to your Cypress dashboard. The example below shows a CircleCI-certified orb that enables you to run all Cypress tests without publishing results to a dashboard.

```
version: 2.1
orbs:
  cypress: cypress-io/cypress@1.1.0
workflows:
  build:
    jobs:
      - cypress/run
```

There are other Cypress orb examples that you can use in your configuration workflows. For more information about these other orbs, refer to the [Cypress Orbs](https://circleci.com/orbs/registry/orb/cypress-io/cypress) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

## Debugging Browser Tests

Integration tests can be hard to debug, especially when they're running on a remote machine. This section provides some examples of how to debug browser tests on CircleCI.

### Using Screenshots and Artifacts
{:.no_toc}

CircleCI may be configured to collect [build artifacts]( {{ site.baseurl }}/2.0/artifacts/) and make them available from your build. For example, artifacts enable you to save screenshots as part of your job, and view them when the job finishes. You must explicitly collect those files with the `store_artifacts` step and specify the `path` and `destination`. See the [store_artifacts]( {{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) section of the Configuring CircleCI document for an example.

Saving screenshots is straightforward: it's a built-in feature in WebKit and Selenium, and is supported by most test suites:

*   [Manually, using Selenium directly](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Automatically on failure, using Cucumber](https://github.com/mattheworiordan/capybara-screenshot)
*   [Automatically on failure, using Behat and Mink](https://gist.github.com/michalochman/3175175)

### Using a Local Browser to Access HTTP server on CircleCI
{:.no_toc}

If you are running a test that runs an HTTP server on CircleCI, it is sometimes helpful to use a browser running on your local machine to debug a failing test. Setting this up is easy with an SSH-enabled run.

1. Run an SSH build using the Rerun Job with SSH button on the **Job page** of the CircleCI app. The command to log into the container over SSH apears, as follows:
```
ssh -p 64625 ubuntu@54.221.135.43
```
2. To add port-forwarding to the command, use the `-L` flag. The following example forwards requests to `http://localhost:8080` to port `3000` on the CircleCI container. This would be useful, for example, if your job runs a debug Ruby on Rails app, which listens on port 8080.
```
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```
3. Then, open your browser on your local machine and navigate to `http://localhost:8080` to send requests directly to the server running on port `3000` on the CircleCI container. You can also manually start the test server on the CircleCI container (if it is not already running), and you should be able to access the running test server from the browser on your development machine.

This is a very easy way to debug things when setting up Selenium tests, for example.

### Interacting With the Browser Over VNC
{:.no_toc}

VNC allows you to view and interact with the browser that is running your tests. This only works if you are using a driver that runs a real browser. You can interact with a browser that Selenium controls, but PhantomJS is headless, so there is nothing to interact with.

1. Install a VNC viewer. If you're using macOS, consider [Chicken of the VNC](http://sourceforge.net/projects/chicken/).
[RealVNC](http://www.realvnc.com/download/viewer/) is also available on most platforms.

2. Open a Terminal window, [start an SSH run]( {{ site.baseurl }}/2.0/ssh-access-jobs/) to a CircleCI container and forward the remote port 5901 to the local port 5902.

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```
3. Install the `vnc4server` and `metacity` packages. You can use `metacity` to move the browser around and return to your Terminal window.

```bash
sudo apt install vnc4server metacity
```
4. After connecting to the CircleCI container, start the VNC server.

```bash
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```
5. Since your connection is secured with SSH, there is no need for a strong password. However, you still need _a_ password, so enter `password` at the prompt.

6. Start your VNC viewer and connect to `localhost:5902`. Enter your `password` at the prompt.

7. You should see a display containing a terminal window. Since your connection is secured through the SSH tunnel, ignore any warnings about an insecure or unencrypted connection.

8. To allow windows to open in the VNC server, set the `DISPLAY` variable. Without this command, windows would open in the default (headless) X server.

```bash
ubuntu@box159:~$ export DISPLAY=:1.0
```
9. Start `metacity` in the background.

```bash
ubuntu@box159:~$ metacity &
```
10. Start `firefox` in the background.

```bash
ubuntu@box159:~$ firefox &
```

Now, you can run integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### Sharing CircleCI's X Server
{:.no_toc}

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use `x11vnc` to attach a VNC server to X.

1. Download [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) and start it before your tests:

```
steps:
  - run:
      name: Download and start X
      command: |
        sudo apt-get install -y x11vnc
        x11vnc -forever -nopw
      background: true
```
2. Now when you [start an SSH build]( {{ site.baseurl }}/2.0/ssh-access-jobs/), you'll be able to connect to the VNC server while your default test steps run. You can either use a VNC viewer that is capable of SSH tunneling, or set up a tunnel on your own:
```
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## X11 forwarding over SSH

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

1. Install an X Window System on your computer. If you're using macOS, consider [XQuartz] (http://xquartz.macosforge.org/landing/).

2. With X set up on your system, [start an SSH build]( {{ site.baseurl }}/2.0/ssh-access-jobs/) to a CircleCI VM, using the `-X` flag to set up forwarding:

```
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```
This will start an SSH session with X11 forwarding enabled.

3. To connect your VM's display to your machine, set the display environment variable to `localhost:10.0`

```
ubuntu@box10$ export DISPLAY=localhost:10.0
```
4. Check that everything is working by starting xclock.

```
ubuntu@box10$ xclock
```
You can kill xclock with `Ctrl+c` after it appears on your desktop.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

## See Also

[Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/)
