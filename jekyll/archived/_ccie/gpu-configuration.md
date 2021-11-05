---
layout: enterprise
section: enterprise
title: "Setting up GPU Builders"
category: [advanced-config]
order: 6
description: "How to set up CircleCI GPU builders"
sitemap: false
---

This document list the various commands you can use to install GPUs that may be accessed by containers running in your fleet in the following sections:

* TOC 
{:toc}

## Steps

Complete the following steps on an LXC-based builder or a Docker-based builder. 

1.)`wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`



2.)

```
sudo apt-get install -y linux-image-extra-`uname -r` linux-headers-`uname -r` linux-image-`uname -r`
```



3.)

```
sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
sudo apt-get update
;;installing cuda breaks the circle.jar because it changes the java version for LXC. This is hanldled by the update-alternatives step 
sudo apt-get --yes --force-yes install cuda
```

### Docker

Complete the following steps for Docker-based builders, for LXC-based builders, skip to the next section.

1.) Using our image builder, add this to the dockerfile of the image you wish to build

```
RUN NVIDIA_GPGKEY_SUM=d1be581509378368edeec8c1eb2958702feedf3bc3d17011adbf24efacce4ab5 && \
    NVIDIA_GPGKEY_FPR=ae09fe4bbd223a84b2ccfce3f60f4b3d7fa2af80 && \
    apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1404/x86_64/7fa2af80.pub && \
    apt-key adv --export --no-emit-version -a $NVIDIA_GPGKEY_FPR | tail -n +2 > cudasign.pub && \
    echo "$NVIDIA_GPGKEY_SUM  cudasign.pub" | sha256sum -c --strict - && rm cudasign.pub && \
    echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1404/x86_64 /" > /etc/apt/sources.list.d/cuda.list

ENV CUDA_VERSION 8.0

LABEL com.nvidia.cuda.version="8.0"

ENV CUDA_PKG_VERSION 8-0=8.0.44-1

RUN apt-get update && apt-get install -y --no-install-recommends \
        cuda-nvrtc-$CUDA_PKG_VERSION \
        cuda-nvgraph-$CUDA_PKG_VERSION \
        cuda-cusolver-$CUDA_PKG_VERSION \
        cuda-cublas-$CUDA_PKG_VERSION \
        cuda-cufft-$CUDA_PKG_VERSION \
        cuda-curand-$CUDA_PKG_VERSION \
        cuda-cusparse-$CUDA_PKG_VERSION \
        cuda-npp-$CUDA_PKG_VERSION \
        cuda-cudart-$CUDA_PKG_VERSION && \
    ln -s cuda-$CUDA_VERSION /usr/local/cuda && \
    rm -rf /var/lib/apt/lists/*

RUN echo "/usr/local/cuda/lib64" >> /etc/ld.so.conf.d/cuda.conf && \
    ldconfig

RUN echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf && \
    echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf

ENV PATH /usr/local/nvidia/bin:/usr/local/cuda/bin:${PATH}

ENV LD_LIBRARY_PATH /usr/local/nvidia/lib:/usr/local/nvidia/lib64

RUN apt-get update && apt-get install -y --no-install-recommends \
        cuda-core-$CUDA_PKG_VERSION \
        cuda-misc-headers-$CUDA_PKG_VERSION \
        cuda-command-line-tools-$CUDA_PKG_VERSION \
        cuda-nvrtc-dev-$CUDA_PKG_VERSION \
        cuda-nvml-dev-$CUDA_PKG_VERSION \
        cuda-nvgraph-dev-$CUDA_PKG_VERSION \
        cuda-cusolver-dev-$CUDA_PKG_VERSION \
        cuda-cublas-dev-$CUDA_PKG_VERSION \
        cuda-cufft-dev-$CUDA_PKG_VERSION \
        cuda-curand-dev-$CUDA_PKG_VERSION \
        cuda-cusparse-dev-$CUDA_PKG_VERSION \
        cuda-npp-dev-$CUDA_PKG_VERSION \
        cuda-cudart-dev-$CUDA_PKG_VERSION \
        cuda-driver-dev-$CUDA_PKG_VERSION && \
    rm -rf /var/lib/apt/lists/*
ENV LIBRARY_PATH /usr/local/cuda/lib64/stubs:${LIBRARY_PATH}

```
2.) Run `curl -sSL https://get.docker.com | sh`

3.) Install [Nvidia-Docker](https://github.com/NVIDIA/nvidia-docker#quick-start)

4.) Run `sudo nvidia-docker-plugin`.

5.) Use the following command to run the builder processes

```
    sudo docker run --privileged -d -v /var/run/docker.sock:/var/run/docker.sock \
    -e CIRCLE_SECRET_PASSPHRASE=<circle_secret_passphrase> \
    -e SERVICES_PRIVATE_IP=<services_private_ip>  \
    -e CIRCLE_CONTAINER_IMAGE_URI="docker://<repo_name>/<image_name>" \
    -e CIRCLE_DOCKER_RUN_ARGUMENTS="--privileged --volume-driver=nvidia-docker --volume=nvidia_driver_367.57:/usr/local/nvidia:ro" \
    circleci/builder-base:1.1
```

6.) 

In your GPU Circle Project add the following under your environment variables

Name: `PATH`

Key: `/usr/local/nvidia/bin:/usr/local/cuda/bin:$PATH`

Name: `LD_LIBRARY_PATH` 

Key: `/usr/local/nvidia/lib:/usr/local/nvidia/lib64`

Name: `LIBRARY_PATH`

Key: `/usr/local/cuda/lib64/stubs:${LIBRARY_PATH}`

Now you should have a full GPU access from your CircleCI Enterprise Containers!


See here for a working sample project

    https://github.com/GERey/Sample-GPU-Project
    
    
### LXC

Complete the following steps on an LXC-based builder running a release after ( 1.47.0 +). Contact us at <https://support.circleci.com/hc/en-us> for upgrade assistance.


1.) Run `nvidia-smi` 
2.) Run `sudo modprobe nvidia-uvm`


3.)`curl -o ./provision-builder.sh https://s3.amazonaws.com/circleci-enterprise/provision-builder-lxc-2016-12-05.sh`

4.) `sudo bash ./provision-builder.sh`



5.) `sudo update-alternatives --set java /usr/lib/jvm/jdk1.8.0_73/bin/java`


6.) Copy and paste the following lxc configurations into lxc_config.txt

```
lxc.cgroup.devices.allow = c 195:* rwm
lxc.cgroup.devices.allow = c 250:* rwm
lxc.mount.entry = /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry = /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry = /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
```


7.) `CIRCLE_LXC_RUN_ARGUMENTS="$(cat lxc_config.txt)"`

8.) Run `echo "$CIRCLE_LXC_RUN_ARGUMENTS"` to ensure that you outputs looks like like 

```
lxc.cgroup.devices.allow = c 195:* rwm
lxc.cgroup.devices.allow = c 250:* rwm
lxc.mount.entry = /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry = /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry = /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
```

9.)`curl -o ./init-builder.sh https://s3.amazonaws.com/circleci-enterprise/init-builder-lxc-2016-12-05.sh`


10.) 

```
sudo -E \
  SERVICES_PRIVATE_IP=<priviate ip> \
  CIRCLE_SECRET_PASSPHRASE=<secret passphrase> \
  CIRCLE_BUILD_VOLUMES="<stuff>" \
  CIRCLE_CONTAINER_IMAGE_ID="circleci-trusty-container_0.0.575" \
  bash ./init-builder.sh
```



11.) In your circle.yml/image run the following commands to install the driver without making kernel changes:

    - wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
    - sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
    - sudo apt-get update
    - sudo apt-get --yes --force-yes install cuda

## Update the Test Section     

Finally, in your circle.yml test section, add the following:

    - export PATH=/usr/local/cuda-8.0/bin:$PATH
    - export LD_LIBRARY_PATH=/usr/local/cuda-8.0/lib64:$LD_LIBRARY_PATH

    
GPU access is made available to your projects.
