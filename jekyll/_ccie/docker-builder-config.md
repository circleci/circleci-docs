---
layout: enterprise
section: enterprise
title: "Docker-based Builder Configuration"
category: [advanced-config]
order: 0
---

Several aspects of CircleCI Builder behavior can be customized by passing
environment variables into the builder process. **NOTE:** If you are using
LXC-based build containers (including those using the Terraform-based AWS
install or the AWS builder AMIs), please see [this doc]({{site.baseurl}}/enterprise/config/).

## Setting Environment Variables

If you are using the [single-box]({{site.baseurl}}/enterprise/single-box/) installation
option, then you can create a file called `/etc/circle-installation-customizations`
with entries like `export CIRCLE_OPTION_A=foo`.

If you are using a clustered install with Docker-based builder machines as documented
[here]({{site.baseurl}}/enterprise/docker-install/), then you can set environment
variables like this:

```
sudo docker run -d -v /var/run/docker.sock:/var/run/docker.sock \
    -e CIRCLE_SECRET_PASSPHRASE=<your passphrase> \
    -e SERVICES_PRIVATE_IP=<private ip address of services box>  \
    -e CIRCLE_PRIVATE_IP=<private ip address of this machine> \
    -e CIRCLE_OPTION_A=foo \
    circleci/builder-base:some-version
```

### Sharing the Docker Socket

**NOTE**: The primary drawback here is security-related. Giving builds access to the Docker daemon on the host is basically equivalent to giving them root access to the machine. Another option is to use dedicated remote docker hosts exposed to builds via TCP sockets.

If you'd like to share your builder host's Docker socket to enable Docker use within builds:

1. You may need to modify permissions for `/var/run/docker.sock` on the build host to give containers permission to use the daemon.
2. Start the builder process with `CIRCLE_DOCKER_RUN_ARGUMENTS="-v /var/run/docker.sock:/var/run/docker.sock"`

Then inside of a build, you can just use Docker as usual. You do not need to specify it under the "services" section in circle.yml,
because no container-local Docker daemon services needs to be started.
