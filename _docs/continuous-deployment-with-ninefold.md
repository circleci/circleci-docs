---

title: Continuous Deployment with Ninefold
layout: doc
tags:
  - how-to

---

Deploying from CircleCI to [Ninefold](https://ninefold.com/) is easy with Ninefold's GitHub integration.
You can simply create a dedicated branch in your repo named "production" and setup Ninefold to deploy
this branch. When you get a green build on CircleCI, you can deploy it to Ninefold using an entry like
the following in the "deployment" section of your `circle.yml` file:

<pre>
yaml
deployment:
  production:
    branch: master
    commands:
      - git push origin master:production
</pre>
