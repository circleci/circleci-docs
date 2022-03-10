---
layout: classic-docs
title: "Docker から Machine への Executor の移行"
short-title: "Docker から Machine への Executor の移行"
description: "Executor の移行におけるベストプラクティスと考慮すべき事項"
categories:
  - 移行
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、Docker Executor から Machine (またはその逆) に移行する際に考慮すべき事項と一般的なガイドラインについて説明します。

* TOC
{:toc}

## はじめに
{: #overview }
{:.no_toc}

お客様のビルドによっては、Docker Executor が適さない場合があります。 メモリ不足や専用の CPU が必要な場合などがその例です。 専用の仮想マシンに移行することで、これらの問題の一部は解消できますが、実行ファイルの変更は設定ファイルを数行変えるような簡単な作業ではありません。 There are some other considerations to make, such as the tools and libraries required to be installed for your application and tests.

## Pre-installed software
{: #pre-installed-software }

The most up to date list of pre-installed software can be found on the [image builder](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) page. You can also visit the [Discuss](https://discuss.circleci.com/) page for more information.

Additional packages can be installed with `sudo apt-get install <package>`. If the package in question is not found, `sudo apt-get update` may be required before installing it.

## Running docker containers on machine
{: #running-docker-containers-on-machine }

Machine executors come installed with Docker, which can be used to run your application within a container rather than installing additional dependencies. Note, it is recommended this is done with a customer Docker image rather than a CircleCI convenience image, which are built under the assumption they will be used with the Docker executor and may be tricky to work around. Since each machine executor environment is a dedicated virtual machine, commands to run background containers can be used is normal.

**Note:** if you have Docker Layer Caching (DLC) enabled for your account, machine executors can utilize this to cache your image layers for subsequent runs.

## Why use docker executors at all?
{: #why-use-docker-executors-at-all }

While machine executors do offer twice the memory and a more isolated environment, there is some additional overhead regarding spin up time, and, depending on the approach taken for running the application, more time is taken to install the required dependencies or pull your Docker image. The Docker executor will also cache as many layers as possible from your image during spin-up, as opposed to the machine executor, where DLC will need to be enabled.

All executors have their pros and cons, which have been laid out here to help decide which is right for your pipelines.

## Further reading
{: #further-reading }

We have more details on each specific executor [here](https://circleci.com/docs/2.0/executor-types/), which includes specific memory and vCPU allocation details, as well as how to implement each one in your own configuration.
