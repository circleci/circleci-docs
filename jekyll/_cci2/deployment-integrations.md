---
layout: classic-docs
title: "Deploy"
short-title: "Deploy"
---

![header](  {{ site.baseurl }}/assets/img/docs/deploy.png)

CircleCI can be configured to deploy to virtually any service. This document provides instructions and examples for the following platforms:

* TOC
{:toc}

## Overview
{:.no_toc}

To deploy your application,
add a [job]({{ site.baseurl }}/2.0/jobs-steps/#jobs-overview) to your `.circleci/config.yml` file.
You will also need to [add environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) and [add SSH keys]({{ site.baseurl }}/2.0/add-ssh-key/).

Below is a simple example of deploying a Rails application to Heroku. The full application can be found in the [Sequential Job branch of the CircleCI Demo Workflows repository](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/sequential-branch-filter).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - checkout
      - run: bundle install --path vendor/bundle  # install dependencies
      - run: bundle exec rake db:create db:schema:load  # setup database
      - run:
          name: Run tests
          command: rake

  deploy:
    machine:
        enabled: true
    working_directory: ~/circleci-demo-workflows
    environment:
      HEROKU_APP: "sleepy-refuge-55486"
    steps:
      - checkout
      - run:
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP.git master

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: sequential-branch-filter
```

The configuration uses [workflows]({{ site.baseurl }}/2.0/workflows/) to deploy only if the `sequential-branch-filter` branch is checked out and the `build` job has run. If your deploy job uses any output from previous jobs, you can share that data by [using workspaces]({{ site.baseurl }}/2.0/workflows/#using-workspaces-to-share-data-among-jobs). For more information on conditional deploys, see [Using Contexts and Filtering in your Workflows]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows).

## AWS

1. To deploy to AWS from CircleCI 2.0 use the [awscli installation instructions](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) to ensure that `awscli` is installed in your primary container. 

2. Add your AWS credentials to the **Project Settings > AWS Permissions** page in the CircleCI application.
The **Access Key ID** and **Secret Access Key** that you entered are automatically available in your primary build container and exposed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

3. Add a job to your `config.yml` file that refers to the specific AWS service, for example S3 and add a workflow  that requires the `build-job` to succeed and a `filter` on the master branch.

```yaml
version: 2
jobs:
  #  build and test jobs go here
  deploy-job:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy to S3 if tests pass and branch is Master
          command: aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete
workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job
      - deploy-job:
          requires:
            - build-job
          filters:
            branches:
              only: master
```

Refer to the complete [AWS S3 API documentation](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html#cli-aws-s3api) for details of commands and options.

## AWS - Capistrano

```yaml
version: 2
jobs:
  #  build and test jobs go here
  deploy-job:
    docker:
      - image: image
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: Bundle Install
          command: bundle check || bundle install
      - run:
          name: Deploy to AWS if tests pass and branch is Master
          command: bundle exec cap production deploy
workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job
      - deploy-job:
          requires:
            - build-job
          filters:
            branches:
              only: master
```
## Azure

To deploy to Azure, use a similar job to the above example that uses an appropriate command. If pushing to your repo is required, see the [Adding Read/Write Deployment Keys to GitHub or Bitbucket]( {{ site.baseurl }}/2.0/gh-bb-integration/) section of the Github and Bitbucket Integration document for instructions. Then, configure the Azure Web App to use your production branch.

## Firebase

Add firebase-tools to the project's devDependencies since attempting to install firebase-tools globally in CircleCI will not work.

```
npm install --save-dev firebase-tools
```

Generate a Firebase CLI token using the following command:

```
firebase login:ci
```

Add the generated token to the CircleCI project's environment variables as $FIREBASE_DEPLOY_TOKEN.

Add the below to the project's `config.yml` file

```

     deploy-job:
       docker:
         - image: my-image
       working_directory: /tmp/my-project
       steps:
         - run:
             name: Deploy Master to Firebase
             command: ./node_modules/.bin/firebase deploy --token=$FIREBASE_DEPLOY_TOKEN

    workflows:
      version: 2

      -deploy:
        jobs:
          - build-job
          - deploy-job:
              requires:
                - build-job
              filters:
                branches:
                  only: master

```

If using Google Cloud Functions with Firebase, instruct CircleCI to navigate to the folder where the Google Cloud Functions are held (in this case 'functions') and run npm install by adding the below to `config.yml`:


```
   - run: cd functions && npm install
```

## Google Cloud

Before deploying to Google Cloud, ensure that you have authenticated the `gcloud` command line tool. To do that, you can read the [Authenticating Google Cloud Platform]({{ site.baseurl }}/2.0/google-auth/) document.

In addition, ensure that the Google Cloud SDK is installed in your primary container so that `gcloud` and all of the necessary tools for manipulating Kubernetes resources are at your disposal inside your deployment script/commands. See the [Deploying to Google Container Engine]({{ site.baseurl }}/2.0/google-container-engine/) document for details.

In the following example, if the {% comment %} TODO: Job {% endcomment %}build passes and the current branch was the master branch, CircleCI runs `deploy.sh` to do the actual deployment work.

```

     deploy-job:
       docker:
         - image: my-image
       working_directory: /tmp/my-project  
       steps:
         - run:
             name: Deploy Master to GKE
             command: ./deploy.sh
               
    workflows:
      version: 2
      build-deploy:
        jobs:
          - build-job
          - deploy-job:
              requires:
                - build-job
              filters:
                branches:
                  only: master
                  
```

The deployment script pushes the newly created Docker image out to the registry, then updates the K8s deployment to use the
new image with a `gcloud` command to handle authentication and push the image all at
once: 

```
sudo /opt/google-cloud-sdk/bin/gcloud docker -- push us.gcr.io/${PROJECT_NAME}/hello
```

The new image is now available in GCR for the GCP infrastructure to
access. Then, change permissions:

```
sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
```

Finally, utilize the patch subcommand of `kubectl` to find the line that specifies the image to use for our container,
and replaces it with the image tag of the image just built. The K8s deployment
then intelligently upgrades the cluster by shutting down old containers and
starting up-to-date ones.

```
kubectl patch deployment docker-hello-google -p '{"spec":{"template":{"spec":{"containers":[{"name":"docker-hello-google","image":"us.gcr.io/circle-ctl-test/hello:'"$CIRCLE_SHA1"'"}]}}}}'

```

The full `deploy.sh` file is available on
[GitHub](https://github.com/circleci/docker-hello-google/blob/master/deploy.sh).

## Heroku

[Heroku](https://www.heroku.com/) is a popular platform
for hosting applications in the cloud.
To configure CircleCI
to deploy your application to Heroku,
follow the steps below.

1. Create a Heroku account
and follow the [Getting Started on Heroku](https://devcenter.heroku.com/start) documentation
to set up a project in your chosen language.

2. Add the name of your Heroku application and your Heroku API key as environment variables.
See [Adding Project Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) for instructions.
In this example, these variables are defined as `HEROKU_APP_NAME` and `HEROKU_API_KEY`, respectively.

4. In your `.circleci/config.yml`,
create a `deploy` job
and add an executor type.
See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) for instructions.

5. Checkout your code
and add a command
to deploy the master branch to Heroku using git.

```yaml
version: 2
jobs:
  build:
    ...
  deploy:
    docker:
      - image: buildpack-deps:trusty
    steps:
      - checkout
      - run:
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master

workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```

## NPM

Setting up CircleCI to publish packages to the npm registry makes it easy for project collaborators to release new package versions in a consistent and predictable way.

1.  Obtain the npm authToken for the account that you wish to use to publish the package.

    You can do that by logging in to npm (`npm login`). This will save the
    authToken to the `~/.npmrc` file. Look for the following line:

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    In this case, the authToken is `00000000-0000-0000-0000-000000000000`.

2.  Go to your [project settings]( {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git), and set the `NPM_TOKEN` variable to the
    obtained authToken.

3.  Configure CircleCI to add the authToken to `~/.npmrc`, run `npm publish` and only for versioned tags:

```yaml
version: 2
jobs:
  publish:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
      - run: npm publish
  
workflows:
  version: 2
  tagged-build:
    jobs:
      - publish:
          filters:
            tags:
              only: /v[0-9]+(\.[0-9]+)*/
```

4.  When you want to publish a new version to npm, run `npm version` to create a new version:

    ```
    npm version 10.0.1
    ```

    This will update the `package.json` file and creates a tagged Git commit.
    Next, push the commit with tags:

    ```
    git push --follow-tags
    ``` 
5.  If tests passed, CircleCI will publish the package to npm automatically.

## SSH

To configure CircleCI
to deploy your application over SSH,
follow the steps below.

1. Add the SSH key for the server
to which you're deploying.
For instructions, see the [Adding an SSH Key to CircleCI]({{ site.baseurl }}/2.0/add-ssh-key/) document.

2. Add the SSH username and SSH hostname of your build VM as environment variables.
For instructions, see the [Adding Project Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document.
In this example, these variables are defined as `SSH_USER` and `SSH_HOST`, respectively.

3. In your `.circleci/config.yml`,
create a `deploy` job
and add a command
to deploy the master branch.

```yaml
version: 2
jobs:
  build:
    #...
  deploy:
    machine:
      enabled: true
    steps:
      - run:
          name: Deploy Over SSH
          command: |
            ssh $SSH_USER@$SSH_HOST "<remote deploy command>"

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```
