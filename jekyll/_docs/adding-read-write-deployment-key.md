---
layout: classic-docs
title: Adding read/write deployment key
description: What to know when adding read/write deployment keys
---

When you add a new project on CircleCI, we will create a deployment key in the repository on GitHub. The deployment key is read-only, so CircleCI cannot push to your repository with the key. This is good from the security standpoint of view. However, sometimes you may want push to the repository from builds and you cannot do this with a read-only deployment key. You can manually add a read/write deployment key with the following steps.


Suppose your GitHub repository is `https://github.com/you/test-repo` and the project on CircleCI is `https://circleci.com/gh/you/test-repo`.

- Create a ssh key pair by following the [GitHub instructions](https://help.github.com/articles/generating-ssh-keys/)  
  Note: when asked "Enter passphrase (empty for no passphrase)", do ***not*** enter a passphrase.
- Go to `https://github.com/you/test-repo/settings/keys` on GitHub and add the public key that you just created. Make sure to check on **Allow write access** and save the key. You can enter any title in the **Title** field.
- Go to `https://circleci.com/gh/you/test-repo/edit#ssh` on CircleCI and add the private key that you just created. Enter `github.com` in the **Hostname** field and press the submit button.

That's it! Now, when you push to your GitHub repository from builds, the read/write key that you added will be used.

