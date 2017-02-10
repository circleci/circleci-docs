---
layout: classic-docs
title: CircleCI requires Admin permissions
description: CircleCI admin permissions
last_updated: Feb 3, 2013
---

On the Manage Projects screen, CircleCI won't allow you to add a
project, because it requires admin permissions.

The reason for this is GitHub or Bitbucket requires admin permissions to add
an SSH key to the project, which CircleCI requires to checkout
code, and to add a webhook, so GitHub tells us each time you
commit new code. If you are not admin on a project you would
like to follow, you should have an admin follow the project
first, then you will be able to follow it.
