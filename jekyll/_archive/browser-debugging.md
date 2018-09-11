---
layout: classic-docs
title: "Interacting with the browser on CircleCI's VM"
description: "How to interact with a browser on CircleCI's VM"
sitemap: false
---

Integration tests can be hard to debug, especially when they're running on a remote machine.
There are four good ways to debug browser tests on CircleCI.

## Screenshots and artifacts

At the end of a build on CircleCI, we will gather up all [build artifacts]( {{ site.baseurl }}/1.0/build-artifacts/)
and make them available from your build. This allows you to save screenshots as part of your build,
and then view them when the build finishes.

Saving screenshots is straightforward: it's a built-in feature in WebKit and Selenium, and supported by most test suites:

*   [Manually, using Selenium directly](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Automatically on failure, using Cucumber](https://github.com/mattheworiordan/capybara-screenshot)
*   [Automatically on failure, using Behat and Mink](https://gist.github.com/michalochman/3175175)

To make this work with build artifacts, you need to save the screenshot to the
`$CIRCLE_ARTIFACTS` directory.

## Using a browser on your dev machine to access HTTP server on CircleCI

If you are running a test that runs an HTTP server on CircleCI, sometimes it can
be helpful to use a browser running on your local machine to debug why a
particular test is failing. Setting this up is easy with an SSH-enabled
build.

First, you should run an SSH build. You will be shown the command to log into
the build container over SSH. This command will look like this:

```
ssh -p 64625 ubuntu@54.221.135.43
```

We want to add port-forwarding to the command, which we do with the `-L` flag.
We want to specify a local port and remote port. In this example we will forward
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

## Interact with the browser over VNC

### Spawning your own X Server

VNC allows you to view and interact with the browser that is running your tests. This will only work if you're using a driver that runs a real browser. You will be able to interact with a browser that Selenium controls, but phantomjs is headless &mdash; there is nothing to interact with.

Before you start, make sure you have a VNC viewer installed. If you're using macOS, we recommend
[Chicken of the VNC](http://sourceforge.net/projects/chicken/).
[RealVNC](http://www.realvnc.com/download/viewer/) is also available on most platforms.

First, [start an SSH build]( {{ site.baseurl }}/1.0/ssh-build/)
to a CircleCI VM. When you connect to the machine, add the -L flag and forward the remote port 5901 to the local port 5902:

```
daniel@mymac$ ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```

You should be connected to the CircleCI VM. Now start the VNC server:

```
ubuntu@box159:~$ vnc4server -geometry 1280x1024 -depth 24
```

Enter the password `password` when it prompts you for a password. Your connection is secured with SSH, so there is no need for a strong password. You do need to enter a password to start the VNC server.

Start your VNC viewer and connect to `localhost:5902`. Enter the password you entered when it prompts you for a password. You should see a display containing a terminal window. You can ignore any warnings about an insecure or unencrypted connection. Your connection is secured through the SSH tunnel.

Next, make sure to run:

```
ubuntu@box159:~$ export DISPLAY=:1.0
```

to ensure that windows open in the VNC server, rather than the default headless X server.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser &mdash; it's as if the tests were running on your local machine!

### Sharing CircleCI's X Server

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use x11vnc to attach a VNC server to X.

Download [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) and start it before your tests:

```
dependencies:
  post:
    - sudo apt-get install -y x11vnc
    - x11vnc -forever -nopw:
        background: true
```

Now when you [start an SSH build]( {{ site.baseurl }}/1.0/ssh-build/), you'll be able to connect to the VNC server while your default test steps run. You can either use a VNC viewer that is capable of SSH tunneling, or set up a tunnel on your own:

```
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## X11 forwarding over SSH

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

Before you start, make sure you have an X Window System on your computer. If you're using macOS, we recommend
[XQuartz](http://xquartz.macosforge.org/landing/).

With X set up on your system, [start an SSH build]( {{ site.baseurl }}/1.0/ssh-build/)
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

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser &mdash; it's as if the tests were running on your local machine!

### VNC Viewer Recommendations

Some of our customers have had some VNC clients perform poorly and
others perform well.  Particularly, on macOS, RealVNC produces a better
image than Chicken of the VNC.

If you have had a good or bad experience with a VNC viewer,
[let us know](https://support.circleci.com/hc/en-us) so we can update this page and help
other customers.

## Troubleshooting

If you find that VNC or X11 disconnects unexpectedly, your build container may be running out of memory. See [our guide to memory limits]( {{ site.baseurl }}/1.0/oom/) to learn more.
