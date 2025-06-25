---
layout: classic-docs
title: Continuous Deployment with Ninefold
categories: [how-to]
description: Continuous Deployment with Ninefold
deprecated: "This guide has been deprecated since NineFold.com has shutdown."
sitemap: false
---

Deploying from CircleCI to Ninefold is easy with Ninefold's GitHub integration.
You can simply create a dedicated branch in your repo named "production" and setup Ninefold to deploy
this branch. When you get a green build on CircleCI, you can deploy it to Ninefold using an entry like
the following in the "deployment" section of your `circle.yml` file:

```yaml
deployment:
  production:
    branch: master
    commands:
      - git push origin master:production
```
