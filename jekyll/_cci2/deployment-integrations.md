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

To deploy your application, add a [job]({{ site.baseurl }}/2.0/jobs-steps/#jobs-overview) to `.circleci/config.yml`. You will also have to set any necessary secrets on the **Project Settings > Environment Variables** page of the CircleCI application.

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
          name: Setup Heroku
          command: bash .circleci/setup-heroku.sh

      - run:
          command: |
            git push heroku sequential-branch-filter:master
            heroku run rake db:migrate
            sleep 5  # sleep for 5 seconds to wait for dynos
            heroku restart

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

## Azure

To deploy to Azure, use a similar job to the above example that uses an appropriate command. If pushing to your repo is required, see the [Adding Read/Write Deployment Keys to GitHub or Bitbucket]( {{ site.baseurl }}/2.0/gh-bb-integration/) section of the Github and Bitbucket Integration document for instructions. Then, configure the Azure Web App to use your production branch. 

## Heroku

The built-in Heroku integration through the CircleCI UI is not implemented for CircleCI 2.0.
However, it is possible to deploy to Heroku manually.

First, create a bash script to set up Heroku and place the file in the `.circleci` directory:

 ```bash
 #!/bin/bash
 wget https://cli-assets.heroku.com/branches/stable/heroku-linux-amd64.tar.gz
 sudo mkdir -p /usr/local/lib /usr/local/bin
 sudo tar -xvzf heroku-linux-amd64.tar.gz -C /usr/local/lib
 sudo ln -s /usr/local/lib/heroku/bin/heroku /usr/local/bin/heroku

 cat > ~/.netrc << EOF
 machine api.heroku.com
   login $HEROKU_LOGIN
   password $HEROKU_API_KEY
 EOF

 cat >> ~/.ssh/config << EOF
 VerifyHostKeyDNS yes
 StrictHostKeyChecking no
 EOF
 ```

**Note:** `sudo` is only necessary if the script runs in a Docker container with a non-root user.
If the user _is_ root,
remove `sudo` as it may not be installed.

Next, install and authorize Heroku for the CircleCI account that owns the project.
[Add environment variables]({{ site.baseurl }}/2.0/env-vars/) for the Heroku API key and login email to the CircleCI application as shown in the following image:

![Add Environment Variables]({{ site.baseurl }}/assets/img/docs/walkthrough5.png)

To connect to the Heroku Git server from CircleCI,
create a new SSH key without a passphrase.
The private key is added through the SSH Permissions page
with a hostname of `git.heroku.com` as shown in the following image:

![Add SSH Key]({{ site.baseurl }}/assets/img/docs/walkthrough6.png)

Note the private key's fingerprint for later reference.
Add the public key to Heroku on the [Account page](https://dashboard.heroku.com/account).

Finally, update your `config.yml` file with a job and workflow section similar to the following:

```yaml
version: 2
jobs:
  # jobs for building/testing go here
  deploy-job:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - checkout
      - add_ssh_keys:  # add key from CircleCI account based on fingerprint
          fingerprints:
            - "48:a0:87:54:ca:75:32:12:c6:9e:a2:77:a4:7a:08:a4"
      - run:
          name: Run Setup Script
          command: bash .circleci/setup-heroku.sh
      - run:
          name: Deploy Master to Heroku
          command: |  # this command is framework-dependent and may vary
            heroku git:remote -a $HEROKU_APP_NAME
            git push --force git@heroku.com:$HEROKU_APP_NAME.git HEAD:refs/heads/master
            heroku run python manage.py deploy
            heroku restart
workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job
      - deploy-jobs:  # only deploy when master successfully builds
          requires:
            - build-job
          filters:
            branches:
              only: master
```

If you prefer to deploy to Heroku using https, please consider this circleci (2.0) configuration which is even easier:

Since we are deploying our app with https, the bash script above needed to setup heroku with ssh is not required anymore.
For that reason the following steps can be deleted from the configuration:

```yaml
- add_ssh_keys:  # add key from CircleCI account based on fingerprint
            fingerprints:
            - "48:a0:87:54:ca:75:32:12:c6:9e:a2:77:a4:7a:08:a4"
- run:
     name: Run Setup Script
     command: bash .circleci/setup-heroku.sh
```

instead we use the following step

```yaml
- run:
     name: Deploy to Heroku
        command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git HEAD:refs/heads/master
            sleep 5  # sleep for 5 seconds to wait for dynos
            heroku restart
```

- Result:

```yaml
version: 2
jobs:
  # jobs for building/testing go here
  deploy-job:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - checkout
      - run:
          name: Deploy Master to Heroku
          command: |  # this command is framework-dependent and may vary
            heroku git:remote -a HEROKU_APP_NAME
            git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git HEAD:refs/heads/master
            sleep 5  # sleep for 5 seconds to wait for dynos
            heroku restart
workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job
      - deploy-jobs:  # only deploy when master successfully builds
          requires:
            - build-job
          filters:
            branches:
              only: master
```

For additional details,
refer to the full example in the [2.0 Project Tutorial]({{ site.baseurl }}/2.0/project-walkthrough/).

## Google Cloud

Before deploying to Google Cloud, ensure that you have authenticated the `gcloud` command line tool. To do that, you can read the [Authenticating Google Cloud Platform]({{ site.baseurl }}/2.0/google-auth/) document.

In addition, ensure that the Google Cloud SDK is installed in your primary container so that `gcloud` and all of the necessary tools for manipulating Kubernetes resources are at your disposal inside your deployment script/commands. See the [Deploying to Google Container Engine]({{ site.baseurl }}/2.0/google-container-engine/) document for details.

In the following example, if the build passes and the current branch was the master branch, CircleCI runs `deploy.sh` to do the actual deployment work.

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

