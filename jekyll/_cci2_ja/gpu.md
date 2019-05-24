---
layout: classic-docs
title: "GPU Executors の実行"
category: [administration]
order: 11
description: "CircleCI Server で GPU Executors を有効にする方法"
---

ここでは、CircleCI Server を使用して GPU (Graphics Processing Unit) Machine Executors を実行する方法の概要について説明します。

* 目次
{:toc}

## 前提条件

GPU 対応インスタンスを開始するには、Replicated 管理コンソールで `vm-service` を設定しておく必要があります。

## 概要

任意の NVIDIA GPU 対応インスタンスで、以下のコマンドを実行します。 以下の例では CUDA 8.0 を使用していますが、GPU インスタンスでサポートされていれば、どの CUDA ランタイムバージョンでも使用できます。

1. `wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`
2. `sudo apt-get update`
3. `export OS_RELEASE=$(uname -r)`
4. `sudo apt-get install -y linux-image-extra-$OS_RELEASE linux-headers-$OS_RELEASE linux-image-$OS_RELEASE`
5. `sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`
6. `sudo apt-get update`
7. `sudo apt-get --yes --force-yes install cuda`
8. `nvidia-smi`

ステップ 8 はテスト用のコマンドです。 GPU Executors は、ステップ 7 で CUDA ドライバをインストールした時点で有効になります。

## AMI への GPU 手順の追加

上記の手順で発生する起動時間を回避するには、[VM サービスの設定]({{ site.baseurl }}/ja/2.0/vm-service)の指示に従って上記の手順を AMI に追加します。
