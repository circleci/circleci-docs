---
layout: classic-docs
title: Why can I not follow a project?
last_updated: Feb 2, 2013
description: Trouble following projects
sitemap: false
---

GitHub or Bitbucket requires admin permissions to add an SSH key to a
project, and to add the webhook that tells CircleCI when someone
pushes new code. If you're not an admin, invite a user with
permissions to CircleCI, and have them follow the project first.

For BitBucket repos you will need to look under the user or team that is the *owner* of the repo to be able to add it from the CircleCI 'Add Projects' screen.

**NOTE:** CircleCI currently only supports Git repositories for BitBucket. Mercurial (Hg) repositories are not supported and will not show up on CircleCI.
