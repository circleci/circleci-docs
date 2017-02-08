---
layout: classic-docs
title: macOS Build Image
categories: [build-images]
description: macOS
changefreq: "weekly"
---

CircleCI will try to run your build on macOS if we can detect an Xcode project.
To change a project from building on Linux to building on macOS you can go to
'Project Settings' -> 'Build Environment', and enable the 'Build OS X project'
setting.

To apply the new setting, you will need to trigger a build by pushing commits to GitHub or Bitbucket (instead of rebuilding).

## Software

We maintain a [manifest of the software installed on our macOS images on GitHub](https://circleci.github.io/macos-image-tests/).


