---
layout: classic-docs
title: "Deployment Integrations"
short-title: "Deployment Integrations"
categories: [deploying]
order: 10
---


## Conditional Deployment 

Add the `deploy` step to your `config.yml` to set up conditional deployment for your application. The following example uses a bash command to check that the current branch is the `master` branch before running any deploy commands. Without this check, `<your-deploy-commands>` would be executed every time this job is triggered. It is also possible to create a separate job for deploy for this purpose, see [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows/) for instructions.

```YAML
version: 2
jobs:
  build:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run: <do-some-stuff>
      - deploy:
          name: Maybe Deploy
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              <your-deploy-commands>
            fi
```

To learn more about the `deploy` step, please check out our [documentation]({{ site.baseurl }}/2.0/configuration-reference/#deploy).

## AWS Deployment

The CircleCI Project > Settings page contains a Continuous Deployment section with AWS, Heroku, and Other Deployments listed  as shown in the following image:

![Deployment Integrations]({{ site.baseurl }}/assets/img/docs/deployment-integrations.png)

1. To deploy to AWS from CircleCI 2.0 use the [awscli installation instructions](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) to ensure that `awscli` is installed in your primary container. 

2. Add your AWS credentials to the **Project Settings > AWS Permissions** page in the CircleCI application.

The **Access Key ID** and **Secret Access Key** that you entered are automatically available in your primary build container and exposed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

## Heroku

The built-in Heroku integration through the CircleCI UI is not implemented for CircleCI 2.0.

However, it is possible to deploy to Heroku manually by setting environment variables. Refer to the full example in the [2.0 Project Tutorial]( {{ site.baseurl }}/2.0/project-walkthrough/) for instructions.
