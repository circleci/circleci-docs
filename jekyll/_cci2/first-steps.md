---
layout: classic-docs2
title: "Getting Started with CircleCI 2.0"
short-title: "Getting Started with CircleCI 2.0"
categories: [getting-started]
order: 1
---

Before you can start running builds on CircleCI, you’ll need to allow CircleCI to access your code. Depending on whether your code is hosted on GitHub or Bitbucket, [authorize CircleCI](https://circleci.com/signup/) to access your code.

After authorizing a version control system (VCS), you’ll be redirected to your CircleCI Dashboard, which will be empty since you haven’t added any projects yet.

## Adding Projects

Click “PROJECTS” in the lefthand sidebar and select one of your organizations. Then, click “Build project” next to the project you’d like to start building on CircleCI.

## Adding Teammates

Adding teammates to a project is as easy as having them join CircleCI. If they’re authorized on GitHub/Bitbucket, they’ll have access on CircleCI, too.

## Notifications

One of the best things about CircleCI is that each user gets an account.
This means that notifications are personalized, so CircleCI won’t spam your team with emails about branches that only one person is pushing to.

You can see and edit your notiication settings [here](https://circleci.com/account/notifications).

## Following Projects

Maybe someone else in your GitHub/Bitbucket organization linked a project to CircleCI. In that case, you’ll want to follow that project.

Following a project subscribes you to email notifications and adds the project to your dashboard’s project/branch picker.

You’ll automatically follow any new project that you push to, but you can also manually follow a project by clicking “PROJECTS” in the lefthand sidebar, clicking on your organization, and then clicking the “Follow project” button next to the project you’d like to follow.

## Next Steps

Now that you’ve integrated with a VCS and added one of your projects, you’ll need to create a `.circleci/config.yml` file to tell CircleCI what to do during each build.

If you’re itching to get building, then check out one of our quickstart guides for popular languages/frameworks.
