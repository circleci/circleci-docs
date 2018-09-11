---
layout: classic-docs
title: Notable differences between Ubuntu 14.04 and Ubuntu 12.04
short-title: Differences between Ubuntu 14.04 and 12.04
categories: [build-images]
description: "Notable differences between Ubuntu 14.04 and Ubuntu 12.04 CircleCI build images."
sitemap: false
---

Here are notable differences between Ubuntu 14.04 Trusty and Ubuntu 12.04 Precise build images.

## Different installation path for Ruby, Python, Nodejs, and PHP

On 12.04, the versions of these languages are installed under the installation path imposed by the version manager tool such as RVM and NVM. Normally, this is somewhere under `/home/ubuntu`.

On 14.04, we pre-install versions of these languages under `/opt/circleci/<language>`. Here is what the installation path for Ruby looks like:

```
ubuntu@box1225:~$ ls -ls /opt/circleci/ruby
total 4
4 lrwxrwxrwx 1 ubuntu ubuntu 36 Jun 28 07:35 default -> /opt/circleci/.rvm/rubies/ruby-2.2.4
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:29 ruby-2.1.8
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:30 ruby-2.1.9
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jul 18 07:38 ruby-2.2.3
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:32 ruby-2.2.4
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:33 ruby-2.2.5
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:34 ruby-2.3.0
0 drwxr-xr-x 1 ubuntu ubuntu 36 Jun 28 07:35 ruby-2.3.1
```

Version manager tools are also installed under `/opt/circleci` instead of the canonical place of `/home/ubuntu` directory.

For example, RVM is installed under `/opt/circleci/.rvm`.

```
ubuntu@box1225:~$ ls /opt/circleci/.rvm/
archives  contrib       examples   gemsets  installed.at  log      patchsets  rubies   tmp      wrappers
bin       docs          gem-cache  help     lib           man      README     scripts  user
config    environments  gems       hooks    LICENSE       patches  RELEASE    src      VERSION
```

There are two intentions to why we changed the installation path on Ubuntu 14.04 build image.

- Making directory language installation paths consistent
- Making `/home/ubuntu` to be clean and dedicated for storing your code to be built

## Fewer services are started by default

On 12.04, many services are started by default. While this is good because you don't have to think about which services you need to start for your builds, running unnecessary services is a waste of memory in containers.

On 14.04, only popular services are started by default. To see the list of services started by default, please take a look at [Ubuntu 14.04 build image doc]( {{ site.baseurl }}/1.0/build-image-trusty/).

## How we build the image is public

On 12.04, how we build the build image is not public. Therefore, there is no way for our users to know what's installed and how the build image is created.

On 14.04, both tools and creation process of build image are public. Namely, there are two tools that we use to build the image.

[circleci/image-builder](https://github.com/circleci/image-builder) is a collection of shell scripts that installs many tools and software in a way that works the best on CircleCI.
The shell scripts are called by a command `circleci-install` in the main [Dockerfile](https://github.com/circleci/image-builder/blob/master/Dockerfile).
Whenever we make a new build image, we run a [image-builder build](https://circleci.com/gh/circleci/image-builder){:rel="nofollow"} that builds a Docker image and push to our [Docker Hub](https://hub.docker.com/r/circleci/build-image/tags/) repository.

[circleci/package-builder](https://github.com/circleci/package-builder) builds different versions of Ruby, Python, Nodejs, and PHP and creates Debian packages that are easy to install on image-builder. These packages are then pushed to our [PackageCloud](https://packagecloud.io/circleci/trusty) repository by [package-builder build](https://circleci.com/gh/circleci/package-builder){:rel="nofollow"}.
