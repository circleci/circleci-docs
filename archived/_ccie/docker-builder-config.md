---
layout: enterprise
section: enterprise
title: "Setting Builder Machine Environment Variables"
category: [advanced-config]
order: 0
sitemap: false
---

Several aspects of CircleCI Builder behavior can be customized by passing
environment variables into the builder process. **NOTE:** If you are using
LXC-based build containers (including those using the Terraform-based AWS
install or the AWS builder AMIs), please see [this doc]({{site.baseurl}}/enterprise/config/).

## Setting Environment Variables

If you are using the [single-box]({{site.baseurl}}/enterprise/single-box/) installation
option, then you can create a file called `/etc/circle-installation-customizations`
with entries like `export CIRCLE_OPTION_A=foo`.

If you are using a clustered install with Docker-based builder machines, then you can set environment
variables like this:

```
$ curl -sSL https://get.docker.com | sh
# How to specify the docker storage driver will vary by distro. You may instead
# need to edit /usr/lib/docker-storage-setup/docker-storage-setup or another config file.
$ sudo sed -i 's/docker daemon/docker daemon --storage-driver=overlay/' \
   /usr/lib/systemd/system/docker.service \
   && sudo systemctl daemon-reload && sudo service docker restart
# Pre-pulling the build image is optional, but makes it easier to follow progress
# You can always see the latest at https://circleci.com/docs/1.0/build-image-trusty/#build-image
$ sudo docker pull circleci/build-image:ubuntu-14.04-XXL-1167-271bbe4
$ sudo docker run -d -p 443:443 -v /var/run/docker.sock:/var/run/docker.sock \
    -e CIRCLE_CONTAINER_IMAGE_URI="docker://circleci/build-image:ubuntu-14.04-XXL-1167-271bbe4" \
    -e CIRCLE_SECRET_PASSPHRASE=<your passphrase> \
    -e SERVICES_PRIVATE_IP=<private ip address of services box>  \
    -e CIRCLE_PRIVATE_IP=<private ip address of this machine> \ # Only necessary outside of ec2
    -e CIRCLE_OPTION_A=foo \
    circleci/builder-base:1.1
```

### Sharing the Docker Socket

**NOTE**: The primary drawback here is security-related. Giving builds access to the Docker daemon on the host is basically equivalent to giving them root access to the machine. Another option is to use dedicated remote docker hosts exposed to builds via TCP sockets.

If you'd like to share your builder host's Docker socket to enable Docker use within builds:

1. You may need to modify permissions for `/var/run/docker.sock` on the build host to give containers permission to use the daemon.
2. Start the builder process with `CIRCLE_DOCKER_RUN_ARGUMENTS="-v /var/run/docker.sock:/var/run/docker.sock"`

Then inside of a build, you can just use Docker as usual. You do not need to specify it under the "services" section in circle.yml,
because no container-local Docker daemon services needs to be started.
