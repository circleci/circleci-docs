---
layout: classic-docs
title: Browser Testing
description: Browser Testing on CircleCI
category: [test]
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes common methods for running and debugging browser testing in your CircleCI config in the following sections:

* TOC
{:toc}

## Prerequisites
{: #prerequisites }
{:.no_toc}

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, Geckodriver, Firefox, and Chrome. Add  `-browsers-legacy` to the image name for a variant which includes PhantomJS.

## Overview
{: #overview }
{:.no_toc}

Every time you commit and push code, CircleCI automatically runs all of your tests against the browsers you choose. You can configure your browser-based tests to run whenever a change is made, before every deployment, or on a certain branch.

## Selenium
{: #selenium }

Many automation tools used for browser tests use Selenium WebDriver, a widely-adopted browser driving standard.

Selenium WebDriver provides a common API for programatically driving browsers implemented in several popular languages, including Java, Python, and Ruby. Because Selenium WebDriver provides a unified interface for these browsers, you only need to write your browser tests once. These tests will work across all browsers and platforms. See the [Selenium documentation](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project) for details on set up. Refer to the [Xvfb man page](http://www.xfree86.org/4.0.1/Xvfb.1.html) for virtual framebuffer X server documentation.

WebDriver can operate in two modes: local or remote. When run locally, your tests use the Selenium WebDriver library to communicate directly with a browser on the same machine. When run remotely, your tests interact with a Selenium server, and it is up to the server to drive the browsers.

If Selenium is not included in your primary docker image, install and run Selenium as shown below::

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:16.13.1-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

Refer to the [Install and Run Selenium to Automate Browser Testing]({{ site.baseurl }}/project-walkthrough/) section of the 2.0 Project Tutorial for a sample application. Refer to the [Knapsack Pro documentation](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless) for an example of Capybara/Selenium/Chrome headless CircleCI configuration for Ruby on Rails.

For more information about working with Headless Chrome,
see the CircleCI blog post [Headless Chrome for More Reliable, Efficient Browser Testing](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)
and the related [discuss thread](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112).

As an alternative to configuring your environment for Selenium, you could move to cloud-based platforms such as LambdaTest, Sauce Labs, or BrowserStack. These cross browser testing clouds provide you with a ready-made infrastructure so you don’t have to spend time configuring a Selenium environment.

## LambdaTest
{: #lambdatest }

[LambdaTest](https://www.lambdatest.com/) now integrates with CircleCI to boost your go-to-market delivery. Perform automated cross browser testing with LambdaTest to ensure your development code renders seamlessly through an online Selenium grid providing 2000+ real browsers running through machines, on the cloud. Perform automation testing in parallel with LambdaTest’s Selenium grid to drastically trim down your test cycles.

LambdaTest provides an SSH (Secure Shell) tunnel connection, Lambda Tunnel, to help you perform cross browser testing of your locally stored web pages. With Lambda Tunnel, you can see how your website will look to your audience before making it live, by executing a test server inside your CircleCI build container to perform automated cross-browser testing on the range of browsers offered by Selenium Grid on LambdaTest.

LambdaTest has developed a [CircleCI orb](https://circleci.com/developer/orbs/orb/lambdatest/lambda-tunnel) for browser compatibility testing that enables you to open a Lambda Tunnel before performing any browser testing, easing the process of integrating LambdaTest with CircleCI. Use the orb to quickly set up a Lambda tunnel and the define your test steps

{% raw %}
```yaml
version: 2.1

orbs:
  lambda-tunnel: lambdatest/lambda-tunnel@0.0.1

jobs:
  lambdatest/with_tunnel:
    tunnel_name: <your-tunnel-name>
    steps:
      - <your-test-steps>
```
{% endraw %}

## Sauce Labs
{: #sauce-labs }

Sauce Labs has an extensive network of operating system and browser combinations you can test your web application against. Sauce Labs supports automated web app testing using Selenium WebDriver scripts as well as through `saucectl`, their test orchestrator CLI, which can be used to execute tests directly from a variety of JavaScript frameworks.

### saucectl
{: #saucectl }

If you are using JavaScript to test your web application, you can still take advantage of the Sauce Labs platform by using [`saucectl`](https://docs.saucelabs.com/testrunner-toolkit) with the JS framework of your choice, and then integrating the [saucectl-run orb](https://circleci.com/developer/orbs/orb/saucelabs/saucectl-run) in your CircleCI workflow.

1. Add your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` as [environment variables]({{site.baseurl}}/env-vars/) in your Circle CI project.
2. Modify your CircleCI project `config.yml` to include the saucectl-run orb and then call the orb as a job in your workflow.

{% raw %}
```yaml
version: 2.1

orbs:
  saucectl: saucelabs/saucectl-run@2.0.0

jobs:
  test-cypress:
    docker:
      - image: cimg/node:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          version: 20.10.2
      - saucectl/saucectl-run

workflows:
  default_workflow:
    jobs:
      - test-cypress
```
{% endraw %}

## BrowserStack and Appium
{: #browserstack-and-appium }

As in the Sauce Labs example above, you could replace the installation of Sauce Labs with an installation of another cross-browser testing platform such as BrowserStack. Then, set the USERNAME and ACCESS_KEY [environment variables]({{ site.baseurl }}/env-vars/) to those associated with your BrowserStack account.

For mobile applications, it is possible to use Appium or an equivalent platform that also uses the WebDriver protocol by installing Appium in your job and using CircleCI [environment variables]({{ site.baseurl }}/env-vars/) for the USERNAME and ACCESS_KEY.

## Cypress
{: #cypress }

Another browser testing solution you can use in your Javascript end-to-end testing is [Cypress](https://www.cypress.io/). Unlike a Selenium-architected browser testing solution, when using Cypress, you can run tests in the same run-loop as your application. 

To simplify this process, you may use a CircleCI-certified orb to perform many different tests, including running all Cypress tests without posting the results to your Cypress dashboard. The example below shows a CircleCI-certified orb that enables you to run all Cypress tests without publishing results to a dashboard.

{% raw %}
```yaml
version: 2.1

orbs:
  cypress: cypress-io/cypress@1
  
workflows:
  build:
    jobs:
      - cypress/run:
          no-workspace: true
```
{% endraw %}

There are other Cypress orb examples that you can use in your configuration workflows. For more information about these other orbs, refer to the [Cypress Orbs](https://circleci.com/developer/orbs/orb/cypress-io/cypress) page in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

## Debugging browser tests
{: #debugging-browser-tests }

Integration tests can be hard to debug, especially when they're running on a remote machine. This section provides some examples of how to debug browser tests on CircleCI.

### Using screenshots and artifacts
{: #using-screenshots-and-artifacts }
{:.no_toc}

CircleCI may be configured to collect [build artifacts]( {{ site.baseurl }}/artifacts/) and make them available from your build. For example, artifacts enable you to save screenshots as part of your job, and view them when the job finishes. You must explicitly collect those files with the `store_artifacts` step and specify the `path` and `destination`. See the [store_artifacts]( {{ site.baseurl }}/configuration-reference/#store_artifacts) section of the Configuring CircleCI document for an example.

Saving screenshots is straightforward: it's a built-in feature in WebKit and Selenium, and is supported by most test suites:

*   [Manually, using Selenium directly](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Automatically on failure, using Cucumber](https://github.com/mattheworiordan/capybara-screenshot)
*   [Automatically on failure, using Behat and Mink](https://gist.github.com/michalochman/3175175)

### Using a local browser to access HTTP server on CircleCI
{: #using-a-local-browser-to-access-http-server-on-circleci }
{:.no_toc}

If you are running a test that runs an HTTP server on CircleCI, it is sometimes helpful to use a browser running on your local machine to debug a failing test. Setting this up is easy with an SSH-enabled run.

1. Run an SSH build using the Rerun Job with SSH button on the **Job page** of the CircleCI app. The command to log into the container over SSH is as follows:
```shell
ssh -p 64625 ubuntu@54.221.135.43
```

1. To add port-forwarding to the command, use the `-L` flag. The following example forwards requests to `http://localhost:3000` on your local browser to port `8080` on the CircleCI container. This would be useful, for example, if your job runs a debug Ruby on Rails app, which listens on port 8080. After you run this, if you go to your local browser and request http://localhost:3000, you should see whatever is being served on port 8080 of the container.
<br><br>
**Note:** Update `8080` to be the port you are running on the CircleCI container.
```shell
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```

1. Then, open your browser on your local machine and navigate to `http://localhost:3000` to send requests directly to the server running on port `8080` on the CircleCI container. You can also manually start the test server on the CircleCI container (if it is not already running), and you should be able to access the running test server from the browser on your development machine.

This is a very easy way to debug things when setting up Selenium tests, for example.

### Interacting with the browser over VNC
{: #interacting-with-the-browser-over-vnc }
{:.no_toc}

VNC allows you to view and interact with the browser that is running your tests. This only works if you are using a driver that runs a real browser. You can interact with a browser that Selenium controls, but PhantomJS is headless, so there is nothing to interact with.

1. Install a VNC viewer. If you're using macOS, consider [Chicken of the VNC](http://sourceforge.net/projects/chicken/).
[RealVNC](http://www.realvnc.com/download/viewer/) is also available on most platforms.

1. Open a Terminal window, [start an SSH run]( {{ site.baseurl }}/ssh-access-jobs/) to a CircleCI container and forward the remote port 5901 to the local port 5902.
```shell
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```
1. Install the `vnc4server` and `metacity` packages. You can use `metacity` to move the browser around and return to your Terminal window.
```shell
sudo apt install vnc4server metacity
```
1. After connecting to the CircleCI container, start the VNC server.
```shell
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```
1. Since your connection is secured with SSH, there is no need for a strong password. However, you still need _a_ password, so enter `password` at the prompt.

1. Start your VNC viewer and connect to `localhost:5902`. Enter your `password` at the prompt.

1. You should see a display containing a terminal window. Since your connection is secured through the SSH tunnel, ignore any warnings about an insecure or unencrypted connection.

1. To allow windows to open in the VNC server, set the `DISPLAY` variable. Without this command, windows would open in the default (headless) X server.
```shell
ubuntu@box159:~$ export DISPLAY=:1.0
```
1. Start `metacity` in the background.
```shell
ubuntu@box159:~$ metacity &
```
1. Start `firefox` in the background.
```shell
ubuntu@box159:~$ firefox &
```

Now, you can run integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### Sharing CircleCI's X Server
{: #sharing-circlecis-x-server }
{:.no_toc}

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use `x11vnc` to attach a VNC server to X.

1. Download [`x11vnc`](https://github.com/LibVNC/x11vnc) and start it before your tests:
```yaml
steps:
  - run:
      name: Download and start X
      command: |
        sudo apt-get install -y x11vnc
        x11vnc -forever -nopw
      background: true
```
1. Now when you [start an SSH build]( {{ site.baseurl }}/ssh-access-jobs/), you'll be able to connect to the VNC server while your default test steps run. You can either use a VNC viewer that is capable of SSH tunneling, or set up a tunnel on your own:
```shell
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## X11 forwarding over SSH
{: #x11-forwarding-over-ssh }

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

1. Install an X Window System on your computer. If you're using macOS, consider [XQuartz](http://xquartz.macosforge.org/landing/).

1. With X set up on your system, [start an SSH build]( {{ site.baseurl }}/ssh-access-jobs/) to a CircleCI VM, using the `-X` flag to set up forwarding:
```shell
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```
This will start an SSH session with X11 forwarding enabled.

1. To connect your VM's display to your machine, set the display environment variable to `localhost:10.0`
```shell
ubuntu@box10$ export DISPLAY=localhost:10.0
```
1. Check that everything is working by starting xclock.
```shell
ubuntu@box10$ xclock
```
You can kill xclock with `Ctrl+c` after it appears on your desktop.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

## See also
{: #see-also }

[Project Walkthrough]({{ site.baseurl }}/project-walkthrough/)
