---
layout: classic-docs2
title: "First Steps with CircleCI"
short-title: "First Steps"
categories: [getting-started]
order: 2
---

Before you can start running builds on CircleCI, you’ll need to allow CircleCI to access your code. Depending on whether you’re using GitHub or Bitbucket, [authorize CircleCI](https://circleci.com/signup/) to access your code.

After authorizing a version control system (VCS), you’ll be redirected to your CircleCI Dashboard, which will be empty since you haven’t added any projects yet.

## Adding Projects

Click “PROJECTS” in the lefthand sidebar and select one of your organizations. Then, click “Build project” next to the project you’d like to start building on CircleCI.

## Following Projects

Maybe someone else in your GitHub/Bitbucket organization linked a project to CircleCI. In that case, you’ll want to follow that project.

Following a project subscribes you to email notifications and adds the project to your dashboard’s project/branch picker.

You’ll automatically follow any new project that you push to, but you can also manually follow a project by clicking “PROJECTS” in the lefthand sidebar, clicking on your organization, and then clicking the “Follow project” button next to the project you’d like to follow.

# Next Steps

Now that you’ve integrated with a VCS and added one of your projects, you’ll need to create a `.circleci/config.yml` file to tell CircleCI what to do during each build.

Head to our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough) for a sample `config.yml` and explanation of each component of the file.

Or, if you have a specific language in mind, check out our [demo applications]({{ site.baseurl }}/2.0/demo-apps).
