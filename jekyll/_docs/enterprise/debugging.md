---
layout: enterprise
title: "Debugging"
category: [resources]
order: 4.05
description: "Tips for debugging CircleCI Enterprise."
---

This document covers debugging various parts of CircleCI Enterprise.

## Replicated

As you may know, we use [Replicated](https://www.replicated.com/) to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI Enterprise.

If you're experiencing any issues with Replicated, here are a few ways to debug it.

### Check the current version of Replicated installed

First, make sure you have the CLI tool for Replicated installed and up to date by checking the version:

```
replicated -version
```

### "Config file /etc/replicated.conf not found."

This error may occur when using the CLI tool.

Please check if the file exists and if not, please create the file manually. The file content must look like the following.

```
{
        "ReleaseChannel": "stable"
}
```

### Restarting replicated and the CircleCI app

Please try restarting replicated services. You can do this by running the following commands on the service box.

```
sudo restart replicated-ui
sudo restart replicated
sudo restart replicated-agent
```

Then, go to your services box admin (i.e.: https://YOUR-CCIE-INSTALL:8800) and try restarting with "Stop Now" and "Start Now".

### Trying to login replicated

Please try if you can login to replicated. You can do this by running the following commands on the service box. You will be only asked to enter password. The password is the one that you use to unlock the admin (i.e.: https://YOUR-CCIE-INSTALL:8800).

```
replicated login
```

If you could login, then please run the following command too and give us the output.

```
sudo replicated apps
```

You are getting Error: `request returned Unauthorized for API route`.. error probably because you are not logged into replicated, so please check if you are still getting the error after successful login.

### Output of docker ps

Please provide us with the output of sudo docker ps in service box.


