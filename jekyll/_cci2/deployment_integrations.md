---
layout: classic-docs
title: "Deploy"
short-title: "Deploy"
categories: [deploying]
order: 10
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/nQo1dngizvA" frameborder="0" allowfullscreen></iframe>

This document describes using the `deploy` step with example instructions in the following sections:

* TOC
{:toc}

## Deployment Overview 

It is possible to deploy to any service by adding commands to `.circleci/config.yml` and setting secrets on the Project Settings > Environment Variables page of the CircleCI application. Available deployment targets include Azure, Google (App Engine, Container Engine, and Cloud) and many others. 

Add a job to your `config.yml` to set up conditional deployment for your application. The following example uses a workflow job filter to check that the current branch is the `master` branch before running any deploy commands. Without this workflow configuration, `<my-deploy-commands>` would be executed every time this job is triggered. See [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows/) for additional workflow examples and links to demo workflow repositories.

```YAML
version: 2
jobs:
  build-job:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run: <do-some-stuff>
            
  deploy-job:
    docker:
      - image: my-image
    working_directory: /tmp/my-project  
    steps:
      - run:
          name: Install some stuff
          command: <do-some-stuff>
      - run:
          name: Deploy if tests pass and branch is Master
          command: <my-deploy-commands>

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

## AWS Deployment

1. To deploy to AWS from CircleCI 2.0 use the [awscli installation instructions](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) to ensure that `awscli` is installed in your primary container. 

2. Add your AWS credentials to the **Project Settings > AWS Permissions** page in the CircleCI application.
The **Access Key ID** and **Secret Access Key** that you entered are automatically available in your primary build container and exposed as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

3. Add a job to your `config.yml` file that refers to the specific AWS service, for example S3 and add a workflow  that requires the `build-job` to succeed and a `filter` on the master branch.

```
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

The built-in Heroku integration through the CircleCI UI is not implemented for CircleCI 2.0. However, it is possible to deploy to Heroku manually by using a script to set up Heroku, adding SSH keys with the `add_ssh_keys` option and configuring a workflow. 

1. Create a script to set up Heroku similar to this example `setup-heroku.sh` file in the `.circleci` folder:
     ```
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
***Note:*** *`sudo` is necessary in the above script if running in a Docker container where the user is not `root` (for example, CircleCI's [convenience images](https://hub.docker.com/r/circleci)).  For images running with user `root` (as in most official Docker community images), remove `sudo` as it may not be installed for `root`.*

This file runs on CircleCI and configures everything Heroku needs to deploy the app. The second part creates a `.netrc` file and populates it with the API key and login details set previously.

2. Install and authorize Heroku for the CircleCI account that owns the project. 

3. Add environment variables for the Heroku API key and login email to the CircleCI application on the Project > Settings > Environment Variables page as shown in the following image:
![Add Environment Variables]({{ site.baseurl }}/assets/img/docs/walkthrough5.png)

4. Create a new SSH key, without a passphrase, to connect to the Heroku Git server from CircleCI. The private key is added through the SSH Permissions page with a hostname of `git.heroku.com` as shown in the following screenshot:
![Add SSH Key]({{ site.baseurl }}/assets/img/docs/walkthrough6.png)

5. Note down the Fingerprint for the private key for later reference. 

6. Add the public key to Heroku on the <https://dashboard.heroku.com/account> screen.

7. Add a job with `run` steps and a workflow section similar to the following example in your `config.yml` file: 

     ```
     deploy-job:
       docker:
         - image: my-image
       working_directory: /tmp/my-project  
       steps:
         - run:
             name: Run setup script
             command: bash .circleci/setup-heroku.sh
         - add_ssh_keys:
             fingerprints:
               - "48:a0:87:54:ca:75:32:12:c6:9e:a2:77:a4:7a:08:a4"
         - run:
             name: Deploy Master to Heroku
             command: |
               git push --force git@heroku.com:$HEROKU_APP_NAME.git HEAD:refs/heads/master
               heroku run python manage.py deploy
               heroku restart
               
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

Notes:

- The new `run:` step executes the `setup-heroku.sh` script.
- The `add_ssh_keys:` adds an SSH key to this build, which it gets from your CircleCI account based on the fingerprint you provide.
- The `workflow` section filters on `master` and runs the Heroku deployment commands with every successful build on the master branch. 
- The `heroku run` commands should be changed to whatever steps make sense for the framework you use. For example, you may need to run `rails db:migrate`.

Refer to the full example in the [2.0 Project Tutorial]( {{ site.baseurl }}/2.0/project-walkthrough/) for additional details.

## Google Cloud

Ensure that the Google Cloud SDK is installed in your primary container so that `gcloud` and all of the necessary tools for manipulating Kubernetes resources are at your disposal inside your deployment script/commands. In the following example, if the build passes and the current branch was the master branch, CircleCI 
runs `deploy.sh` to do the actual deployment work.

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

The deployment script pushes the newly created
Docker image out to the registry, then updates the K8s deployment to use the
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

