---
layout: enterprise
section: enterprise
title: "Debugging Replicated"
category: [troubleshooting]
order: 1
description: "Tips for debugging CircleCI Enterprise."
sitemap: false
---

As you may know, we use [Replicated](https://www.replicated.com/) to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI Enterprise.

If you're experiencing any issues with Replicated, here are a few ways to debug it.

### Check the current version of Replicated installed

First, make sure you have the CLI tool for Replicated installed:

```
replicated -version
```

### Restarting Replicated and the CircleCI app

Please try restarting Replicated services. You can do this by running the following commands on the service box:

```
sudo restart replicated-ui
sudo restart replicated
sudo restart replicated-agent
```

Then, go to your services box admin (i.e. https://YOUR-CCIE-INSTALL:8800) and try restarting with "Stop Now" and "Start Now".

### Trying to login Replicated

Please try to login to Replicated. You can do this by running the following commands on the service box. You will only be asked to enter password, which is the same one used to unlock the admin (i.e.: https://YOUR-CCIE-INSTALL:8800).

```
replicated login
```

If you could login, then please run the following command too and give us the output.

```
sudo replicated apps
```

You are getting Error: `request returned Unauthorized for API route`.. error probably because you are not logged into Replicated, so please check if you are still getting the error after successful login.

### Replicated logs

You can find Replicated logs under `/var/log/replicated`.

### Output of docker ps

Replicated starts many Docker containers to run CCIE, so it may be useful to check what containers are running.

You should see something similar to this output:

```
 sudo docker ps
CONTAINER ID        IMAGE                                                    COMMAND                  CREATED             STATUS              PORTS                                                              NAMES
03fb873adf26        <service-box-ip>:9874/circleci-frontend:0.1.149242-d650d3c   "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:4434->4434/tcp   e53e4f74259a6ec0a268d8c984ac6277
113b9ea03b46        <service-box-ip>:9874/circleci-slanger:0.4                   "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:4567->4567/tcp, 0.0.0.0:8081->8080/tcp                     d262cc492bd5d692d467f74d8cc39748
0a66adfbc2f0        <service-box-ip>:9874/postgres:9.4.6                         "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:5432->5432/tcp                                             423e0e6c4099fa99cd89c58a74355ffe
1c72cbef1090        <service-box-ip>:9874/circleci-exim:0.2                      "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:2525->25/tcp                                               94de52d61d464b7543f36817c627fe56
df944bb558ed        <service-box-ip>:9874/mongo:2.6.11                           "/entrypoint.sh mongo"   3 days ago          Up 3 days           0.0.0.0:27017->27017/tcp                                           04a57db9f97a250c99dfdbeec07c3715
66be98cd54fe        <service-box-ip>:9874/redis:2.8.23                           "/entrypoint.sh redis"   3 days ago          Up 3 days           0.0.0.0:6379->6379/tcp                                             e2ce5e702c4114648718d2d5840edc56
ac2faa662bbe        <service-box-ip>:9874/tutum-logrotate:latest                 "crond -f"               3 days ago          Up 3 days                                                                              34e4d4165947f14d185d225191ba4ce8
796013f64732        <service-box-ip>:9874/redis:2.8.23                           "/entrypoint.sh redis"   3 days ago          Up 3 days           0.0.0.0:32773->6379/tcp                                            dce3519e7aff9a365bd3b42ed3a6f77f
```

Providing us with the output of `sudo docker ps` in service box will be helpful in diagnosing the problem.
