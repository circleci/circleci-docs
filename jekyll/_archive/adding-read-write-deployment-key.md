---
layout: classic-docs
title: Adding read/write deployment key
description: What to know when adding read/write deployment keys
sitemap: false
---

When you add a new project on CircleCI, we will create a deployment key on the web-based VCS (GitHub or Bitbucket) for your project. We'll use GitHub in the following examples. The deployment key is read-only, so CircleCI cannot push to your repository with the key. This is good from the security standpoint of view. However, sometimes you may want push to the repository from builds and you cannot do this with a read-only deployment key. You can manually add a read/write deployment key with the following steps.


Suppose your GitHub repository is `https://github.com/you/test-repo` and the project on CircleCI is [https://circleci.com/gh/you/test-repo](https://circleci.com/gh/you/test-repo){:rel="nofollow"}.

- Create a ssh key pair by following the [GitHub instructions](https://help.github.com/articles/generating-ssh-keys/)
  Note: when asked "Enter passphrase (empty for no passphrase)", do ***not*** enter a passphrase.
- Go to `https://github.com/you/test-repo/settings/keys` on GitHub and click **Add deploy key**. Enter any title in the **Title** field, then copy and paste the public key you just created. Make sure to check **Allow write access**, then click **Add key**.
- Go to [https://circleci.com/gh/you/test-repo/edit#ssh](https://circleci.com/gh/you/test-repo/edit#ssh){:rel="nofollow"} on CircleCI and add the private key that you just created. Enter `github.com` in the **Hostname** field and press the submit button.
- If your project has an old deploy key CircleCI has generated, you'll need to remove it from `https://circleci.com/gh/you/test-repo/edit#checkout`

* Note: You may need to add the hostname to your .ssh/config.

That's it! Now, when you push to your GitHub repository from builds, the read/write key that you added will be used.

