---
layout: classic-docs
title: "Configuring Deploys"
short-title: "Configuring Deploys"
---

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
      - image: circleci/ruby:2.4-node-jessie
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

To deploy to AWS S3,
follow the steps below.
To deploy to AWS ECS from ECR,
see the [Deploying to AWS ECS/ECR document]({{ site.baseurl }}/2.0/ecs-ecr/).

1. As a best security practice,
create a new [IAM user](https://aws.amazon.com/iam/details/manage-users/) specifically for CircleCI.

2. Add your [AWS access keys](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) to CircleCI
as either [project environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) or [context environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-context).
Store your Access Key ID in a variable called `AWS_ACCESS_KEY_ID`
and your Secret Access Key in a variable called `AWS_SECRET_ACCESS_KEY`.

3. In your `.circleci/config.yml` file,
create a new `deploy` job.
In the `deploy` job,
add a step to install `awscli` in your primary container.

4. Install `awscli` in your primary container
by following the [AWS CLI documentation](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).

5. [Use the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-using.html)
to deploy your application to S3
or perform other AWS operations.
The example below shows
how CircleCI deploys [this documentation site](https://github.com/circleci/circleci-docs) to S3.
Note the use of [workflows]({{ site.baseurl }}/2.0/workflows/)
to deploy only if the build job passes
and the current branch is `master`.

```yaml
version: 2
jobs:
  # build job omitted for brevity
  deploy:
    docker:
      - image: circleci/python:2.7-jessie
    working_directory: ~/circleci-docs
    steps:
      - run:
          name: Install awscli
          command: sudo pip install awscli
      - run:
          name: Deploy to S3
          command: aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete

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

For a complete list of AWS CLI commands and options,
see the [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/).

### AWS S3 Orb Example

CircleCI has created a reusable configuration ("orb") that you may use in your AWS S3 implementation to speed up the process of deployment and configuration. This orb will enable you to configure a set of AWS tools that can be used in your configuration in addition to syncing and moving files within your AWS implementation. The orb source is shown in the example below.

```
version: 2.1

description: |
  A set of tools for working with Amazon S3

examples:
  basic_commands:
    description: "Examples uses aws s3 commands"
    usage:
      version: 2.1
      orbs:
        aws-s3: circleci/aws-s3@volatile
      jobs:
        build:
          docker:
            - image: circleci/python:2.7
          steps:
            - checkout
            - run: mkdir bucket && echo "lorum ipsum" > bucket/build_asset.txt
            - aws-s3/sync:
                from: bucket
                to: "s3://my-s3-bucket-name/prefix"
                overwrite: true
            - aws-s3/copy:
                from: bucket/build_asset.txt
                to: "s3://my-s3-bucket-name"
                arguments: --dryrun

orbs:
  aws-cli: circleci/aws-cli@volatile

commands:
  sync:
    description: "Syncs directories and S3 prefixes. https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html"
    parameters:
      from:
        type: string
        description: A local *directory* path to sync with S3
      to:
        type: string
        description: A URI to an S3 bucket, i.e. 's3://the-name-my-bucket'
      overwrite:
        default: false
        type: boolean
    steps:
      - aws-cli/install
      - aws-cli/configure
      - deploy:
          name: Deploy to S3
          command: "aws s3 sync << parameters.from >> << parameters.to >><<# parameters.overwrite >> --delete<</ parameters.overwrite >>"

  copy:
    description: "Copies a local file or S3 object to another location locally or in S3. https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html"
    parameters:
      from:
        type: string
        description: A local file or source s3 object
      to:
        type: string
        description: A local target or s3 destination
      arguments:
        description: If you wish to pass any additional arguments to the aws copy command (i.e. -sse)
        default: ''
        type: string
    steps:
      - aws-cli/install
      - aws-cli/configure
      - run:
          name: S3 Copy << parameters.from >> -> << parameters.to >>
          command: "aws s3 cp << parameters.from >> << parameters.to >><<# parameters.arguments >> << parameters.arguments >><</ parameters.arguments >>"
 ```

For more detailed information about this AWS S3 orb, refer to the (CircleCI Orb Registry). [https://circleci.com/orbs/registry/orb/circleci/aws-s3].

## Azure

To deploy to Azure, use a similar job to the above example that uses an appropriate command. If pushing to your repo is required, see the [Adding Read/Write Deployment Keys to GitHub or Bitbucket]( {{ site.baseurl }}/2.0/gh-bb-integration/) section of the Github and Bitbucket Integration document for instructions. Then, configure the Azure Web App to use your production branch.

## Capistrano

```yaml
version: 2
jobs:
  #  build and test jobs go here
  deploy-job:
    docker:
      - image: image pinned to a version and tag
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

## Cloud Foundry

Cloud Foundry deployments require the Cloud Foundry CLI. Be sure to match the architecture to your Docker image (the commands below assume you're using a Debian-based image).  This example pattern implements "Blue-Green" deployments using Cloud Foundry's map-route/unmap-route commands, which is an optional feature above and beyond a basic `cf push`.

### Install the CLI
{:.no_toc}

```
- run:
    name: Setup CF CLI
    command: |
      curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
      sudo dpkg -i cf-cli_amd64.deb
      cf -v
      cf api https://api.run.pivotal.io  # alternately target your private Cloud Foundry deployment
      cf auth "$CF_USER" "$CF_PASSWORD"
      cf target -o "$CF_ORG" -s "$CF_SPACE"
```

### Dark Deployment
{:.no_toc}

This is the first step in a Blue-Green deployment, pushing the application to non-production routes.

```
- run:
    name: CF Deploy
    command: |
      # push artifacts on "dark" subdomain, not yet starting so we can attach environment variables
      cf push --no-start app-name-dark -f manifest.yml -p application.jar -n dark -d example.com
      # Pass CircleCI variables to Cloud Foundry (optional)
      cf set-env app-name-dark circle_build_num ${CIRCLE_BUILD_NUM}
      cf set-env app-name-dark circle_commit ${CIRCLE_SHA1}
      cf set-env app-name-dark circle_workflow_guid ${CIRCLE_WORKFLOW_ID}
      cf set-env app-name-dark circle_user ${CIRCLE_PROJECT_USERNAME}
      cf set-env app-name-dark circle_repo ${CIRCLE_PROJECT_REPONAME}
      # Start the application
      cf start app-name-dark
      # Ensure dark route is exclusive to dark app
      cf unmap-route app-name example.com -n dark || echo "Dark Route Already exclusive"
```

### Live Deployment
{:.no_toc}

Until now, the previously pushed "app-name" has not changed.  The final step is to route the production URL to our dark application, stop traffic to the previous version, and rename the applications.

```
- run:
    name: Re-route live Domain to latest
    command: |
      # Send "real" url to new version
      cf map-route app-name-dark example.com -n www
      # Stop sending traffic to previous version
      cf unmap-route app-name example.com -n www
      # stop previous version
      cf stop app-name
      # delete previous version
      cf delete app-name -f
      # Switch name of "dark" version to claim correct name
      cf rename app-name-dark app-name
```

### Manual Approval
{:.no_toc}

For additional control or validation, you can add a manual "hold" step between the dark and live steps as shown in the sample workflow below.

```
workflows:
  version: 2
  build-deploy:
    jobs:
      - test
      - dark-deploy:
          requires:
            - test
          filters:
            branches:
              only: master
      - hold:
          type: approval
          requires:
            - dark-deploy
          filters:
            branches:
              only: master
      - live-deploy:
          requires:
            - hold
          filters:
            branches:
              only: master
```

### Cloud Foundry Orb Example

CircleCI has developed a Cloud Foundry reusable configuration that you may find useful in your Cloud Foundry application. Using this orb with your application enables you to quickly setup a configuration that will work with the CircleCI platform.

```
commands:
  dark_deploy:
    parameters:
      appname:
        description: App Name
        type: string
      dark_subdomain:
        default: dark
        description: Cloud Foundry dark domain to prefix domain (i.e. <dark_subdomain>.<domain>,
          defaults to "dark")
        type: string
      domain:
        description: Cloud Foundry domain registered to handle routes for this space
          (a "dark" or "live" sub-domain will be used in conjunction with this, i.e.
          <dark_subdomain>.<domain>)
        type: string
      manifest:
        description: The Cloud Foundry manifest for this environment
        type: string
      package:
        description: path to the asset/package to push
        type: string
    steps:
    - run:
        command: |
          cf push --no-start <<parameters.appname>>-dark -f <<parameters.manifest>> -p <<parameters.package>> -n <<parameters.dark_subdomain>> -d <<parameters.domain>>
          cf set-env <<parameters.appname>>-dark CIRCLE_BUILD_NUM ${CIRCLE_BUILD_NUM}
          cf set-env <<parameters.appname>>-dark CIRCLE_SHA1 ${CIRCLE_SHA1}
          cf set-env <<parameters.appname>>-dark CIRCLE_WORKFLOW_ID ${CIRCLE_WORKFLOW_ID}
          cf set-env <<parameters.appname>>-dark CIRCLE_PROJECT_USERNAME ${CIRCLE_PROJECT_USERNAME}
          cf set-env <<parameters.appname>>-dark CIRCLE_PROJECT_REPONAME ${CIRCLE_PROJECT_REPONAME}

          # Push as "dark" instance (URL in manifest)
          cf start <<parameters.appname>>-dark
          # Ensure dark route is exclusive to dark app
          cf unmap-route <<parameters.appname>> <<parameters.domain>> -n <<parameters.dark_subdomain>> || echo "Already exclusive"
        name: Cloud Foundry Dark Deployment
  install:
    description: Installs and authenticates with the latest CLI version if not present.
    parameters:
      endpoint:
        default: https://api.run.pivotal.io
        description: The domain of the Cloud Foundry runtime API endpoint. Defaults
          to https://api.run.pivotal.io
        type: string
      org:
        description: Cloud Foundry org to target
        type: string
      space:
        description: Cloud Foundry space to target
        type: string
    steps:
    - run:
        command: |
          : "${CF_USERNAME?Cloud Foundry username and password must be set as Environment variables before running this command.}"
          : "${CF_PASSWORD?Cloud Foundry username and password must be set as Environment variables before running this command.}"
          curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
          sudo dpkg -i cf-cli_amd64.deb
          cf -v
          cf api <<parameters.endpoint>>
          cf auth $CF_USERNAME $CF_PASSWORD
          cf target -o <<parameters.org>> -s <<parameters.space>>
        name: Setup CF CLI
  live_deploy:
    parameters:
      appname:
        description: App Name
        type: string
      domain:
        description: Cloud Foundry domain (a "dark" sub-domain will be used on this.)
        type: string
      live_subdomain:
        default: www
        description: Cloud Foundry live subdomain to prefix domain (i.e. <live_subdomain>.<domain>,
          defaults to "wwww")
        type: string
    steps:
    - run:
        command: |
          # Send "real" url to new version
          cf map-route <<parameters.appname>>-dark <<parameters.domain>> -n <<parameters.live_subdomain>>
          # Stop sending traffic to previous version
          cf unmap-route <<parameters.appname>> <<parameters.domain>> -n <<parameters.live_subdomain>>
          # stop previous version
          cf stop <<parameters.appname>>
          # delete previous version
          cf delete <<parameters.appname>> -f
          # Switch name of "dark" version to claim correct name
          cf rename <<parameters.appname>>-dark <<parameters.appname>>
        name: Cloud Foundry - Re-route live Domain
  push:
    parameters:
      appname:
        description: App Name
        type: string
      manifest:
        description: The Cloud Foundry manifest for this environment
        type: string
      package:
        description: path to the asset/package to push
        type: string
    steps:
    - run:
        command: |
          #push no start so we can set envars
          cf push --no-start <<parameters.appname>> -f <<parameters.manifest>> -p <<parameters.package>>
          cf set-env <<parameters.appname>>-dark CIRCLE_BUILD_NUM ${CIRCLE_BUILD_NUM}
          cf set-env <<parameters.appname>>-dark CIRCLE_SHA1 ${CIRCLE_SHA1}
          cf set-env <<parameters.appname>>-dark CIRCLE_WORKFLOW_ID ${CIRCLE_WORKFLOW_ID}
          cf set-env <<parameters.appname>>-dark CIRCLE_PROJECT_USERNAME ${CIRCLE_PROJECT_USERNAME}
          cf set-env <<parameters.appname>>-dark CIRCLE_PROJECT_REPONAME ${CIRCLE_PROJECT_REPONAME}
          #now start
          cf start <<parameters.appname>>
        name: Cloud Foundry Push
description: |
  Push and deploy applications to Cloud Foundry
jobs:
  blue_green:
    description: Execute a blue/green deploy  in a single job. Expects either build_steps
      or workspace_path for assets to deploy.
    docker:
    - image: circleci/node:10
    parameters:
      appname:
        description: App Name
        type: string
      build_steps:
        default: []
        description: Steps to generate application package or files. Alternately provide
          `workspace_path`
        type: steps
      dark_subdomain:
        default: dark
        description: Cloud Foundry dark domain to prefix domain (i.e. <dark_subdomain>.<domain>,
          defaults to "dark")
        type: string
      domain:
        description: Cloud Foundry domain registered to handle routes for this space
          (a "dark" or "live" sub-domain will be used in conjunction with this, i.e.
          <dark_subdomain>.<domain>)
        type: string
      endpoint:
        default: https://api.run.pivotal.io
        description: The domain of the Cloud Foundry runtime API endpoint. Defaults
          to https://api.run.pivotal.io
        type: string
      live_subdomain:
        default: www
        description: Cloud Foundry live subdomain to prefix domain (i.e. <live_subdomain>.<domain>,
          defaults to "www")
        type: string
      manifest:
        description: The Cloud Foundry manifest for this environment
        type: string
      org:
        description: Cloud Foundry Org to target
        type: string
      package:
        description: path to the asset/package to push
        type: string
      space:
        description: Cloud Foundry space to target
        type: string
      validate_steps:
        default: []
        description: Optional steps to run between the dark and live deployments.
        type: steps
      workspace_path:
        default: ""
        description: The key of a workflow workspace which contains artifact. Alternately
          provide `build_steps`
        type: string
    steps:
    - checkout
    - when:
        condition: <<parameters.build_steps>>
        steps: << parameters.build_steps >>
    - when:
        condition: <<parameters.workspace_path>>
        steps:
        - attach_workspace:
            at: <<parameters.workspace_path>>
    - install:
        endpoint: <<parameters.endpoint>>
        org: <<parameters.org>>
        space: <<parameters.space>>
    - dark_deploy:
        appname: <<parameters.appname>>
        dark_subdomain: <<parameters.dark_subdomain>>
        domain: <<parameters.domain>>
        manifest: <<parameters.manifest>>
        package: <<parameters.package>>
    - when:
        condition: <<parameters.validate_steps>>
        steps: << parameters.validate_steps >>
    - live_deploy:
        appname: <<parameters.appname>>
        domain: <<parameters.domain>>
        live_subdomain: <<parameters.live_subdomain>>
  dark_deploy:
    description: Execute a dark (blue) deploy  in a single job. Expects either build_steps
      or workspace_path for assets to deploy.
    docker:
    - image: circleci/node:10
    parameters:
      appname:
        description: App Name
        type: string
      build_steps:
        default: []
        description: Steps to generate artifacts. Alternately provide `workspace_path`
        type: steps
      dark_subdomain:
        default: dark
        description: Cloud Foundry dark domain to prefix domain (i.e. <dark_subdomain>.<domain>,
          defaults to "dark")
        type: string
      domain:
        description: Cloud Foundry domain registered to handle routes for this space
          (a "dark" or "live" sub-domain will be used in conjunction with this, i.e.
          <dark_subdomain>.<domain>)
        type: string
      endpoint:
        default: https://api.run.pivotal.io
        description: The domain of the Cloud Foundry runtime API endpoint. Defaults
          to https://api.run.pivotal.io
        type: string
      manifest:
        description: The Cloud Foundry manifest for this environment
        type: string
      org:
        description: Cloud Foundry Org to target
        type: string
      package:
        description: path to the asset/package to push
        type: string
      space:
        description: Cloud Foundry space to target
        type: string
      validate_steps:
        default: []
        description: Optional steps to run between the dark and live deployments.
        type: steps
      workspace_path:
        default: ""
        description: The key of a workflow workspace which contains artifact. Alternately
          provide `build_steps`
        type: string
    steps:
    - checkout
    - when:
        condition: <<parameters.build_steps>>
        steps: << parameters.build_steps >>
    - when:
        condition: <<parameters.workspace_path>>
        steps:
        - attach_workspace:
            at: <<parameters.workspace_path>>
    - install:
        endpoint: <<parameters.endpoint>>
        org: <<parameters.org>>
        space: <<parameters.space>>
    - dark_deploy:
        appname: <<parameters.appname>>
        dark_subdomain: <<parameters.dark_subdomain>>
        domain: <<parameters.domain>>
        manifest: <<parameters.manifest>>
        package: <<parameters.package>>
    - when:
        condition: <<parameters.validate_steps>>
        steps: << parameters.validate_steps >>
  live_deploy:
    description: Execute final URL remap and application name cleanup.
    docker:
    - image: circleci/node:10
    parameters:
      appname:
        description: App Name
        type: string
      domain:
        description: Cloud Foundry domain registered to handle routes for this space
          (a "dark" or "live" sub-domain will be used in conjunction with this, i.e.
          <live_subdomain>.<domain>)
        type: string
      endpoint:
        default: https://api.run.pivotal.io
        description: The domain of the Cloud FOundry runtime API endpoint. Defaults
          to https://api.run.pivotal.io
        type: string
      live_subdomain:
        default: www
        description: Cloud Foundry dark domain to prefix domain (i.e. <live_subdomain>.<domain>,
          defaults to "www")
        type: string
      org:
        description: Cloud Foundry Org to target
        type: string
      space:
        description: Cloud Foundry space to target
        type: string
      validate_steps:
        default: []
        description: Optional steps to run before remapping URLs.
        type: steps
    steps:
    - install:
        endpoint: <<parameters.endpoint>>
        org: <<parameters.org>>
        space: <<parameters.space>>
    - when:
        condition: <<parameters.validate_steps>>
        steps: << parameters.validate_steps >>
    - live_deploy:
        appname: <<parameters.appname>>
        domain: <<parameters.domain>>
        live_subdomain: <<parameters.live_subdomain>>
  push:
    description: Execute a simple push in a single job. Expects either build_steps
      or workspace_path for assets to deploy.
    docker:
    - image: circleci/node:10
    parameters:
      appname:
        description: App Name
        type: string
      build_steps:
        default: []
        description: Steps to generate application package or files. Alternately provide
          `workspace_path`
        type: steps
      endpoint:
        default: https://api.run.pivotal.io
        description: The domain of the Cloud Foundry runtime API endpoint. Defaults
          to https://api.run.pivotal.io
        type: string
      manifest:
        description: The Cloud Foundry manifest for this environment
        type: string
      org:
        description: Cloud Foundry 'Org' to target
        type: string
      package:
        description: path to the package/files to push
        type: string
      space:
        description: Cloud Foundry 'Space' to target
        type: string
      workspace_path:
        default: ""
        description: The key of a workflow workspace which contains artifact. Alternately
          provide `build_steps`
        type: string
    steps:
    - checkout
    - when:
        condition: <<parameters.build_steps>>
        steps: << parameters.build_steps >>
    - when:
        condition: <<parameters.workspace_path>>
        steps:
        - attach_workspace:
            at: <<parameters.workspace_path>>
    - install:
        endpoint: <<parameters.endpoint>>
        org: <<parameters.org>>
        space: <<parameters.space>>
    - push:
        appname: <<parameters.appname>>
        manifest: <<parameters.manifest>>
        package: <<parameters.package>>
version: 2.1
```

For more detailed information about this orb, refer to the (CircleCI Orb Registry) [https://circleci.com/orbs/registry/orb/circleci/cloudfoundry].

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
         - image: my-image-version-tag
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

Before deploying to Google Cloud Platform,
you will have to authorize the Google Cloud SDK
and set default configuration settings.
Refer to the [Authorizing the Google Cloud SDK]({{ site.baseurl }}/2.0/google-auth/) document for full details.

In the following example, if `build-job` passes and the current branch was the master branch, CircleCI runs `deploy.sh` to do the actual deployment work.

```

     deploy-job:
       docker:
         - image: my-image-version-tag
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
A CircleCI 2.0 Google Cloud deployment example project is also available [here](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app).

### Google Cloud Orb

CircleCI has developed a reusable configuration (orb) that you may use to install and configure the Google Cloud CLI, which will enable you to quickly setup the CLI to work with the CircleCI pplatform and your Google Cloud application.

To install and configure the Google Cloud CLI using the CircleCI Google Cloud Orb:
```
version: 2.1

description: |
  Install and configure the Google Cloud CLI (gcloud)

examples:
  simple_install_and_configure:
    description: Install the gcloud CLI, if not available
    usage:
      version: 2.1

      orbs:
        gcp-cli: circleci/gcp-cli@1.0.0

      workflows:
        install_and_configure_cli:
          # optionally determine executor to use
          executor: default
          jobs:
            - gcp-cli/install_and_configure_cli:
                context: myContext # store your gCloud service key via Contexts, or project-level environment variables
                google-project-id: myGoogleProjectId
                google-compute-zone: myGoogleComputeZone

executors:
  default:
    description: A debian based docker container to use when running the
                 gcloud CLI
    parameters:
      python-version:
        type: string
        default: "2.7"
      debian-release:
        type: string
        default: "stretch"
    docker:
      - image: circleci/python:<< parameters.python-version >>-<< parameters.debian-release >>
  google:
    description: The official Google docker container with gcloud SDK
                 pre-installed
    docker:
      - image: google/cloud-sdk

commands:
  install:
    description: |
      Install the gcloud CLI, if not available
    steps:
      - run:
          name: Install gcloud CLI, if not available
          command: |
            # Set sudo to work whether logged in as root user or non-root user
            if [[ $EUID == 0 ]]; then export SUDO=""; else export SUDO="sudo"; fi

            # Create an environment variable for the correct distribution
            if [[ $(command -v lsb_release) == "" ]]; then
              $SUDO apt-get update && $SUDO apt-get -y install lsb-release
              export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)"
            else
              export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)"
            fi

            # Add the Google Cloud SDK distribution URI as a package source
            echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | $SUDO tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
            # Import the Google Cloud public key
            if [[ $(command -v curl) == "" ]]; then
              $SUDO apt-get update && $SUDO apt-get -y install curl
              curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | $SUDO apt-key add -
            else
              curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | $SUDO apt-key add -
            fi

            # Update and install the Cloud SDK
            if [[ $(command -v gcloud) == "" ]]; then
              $SUDO apt-get update && $SUDO apt-get -y install google-cloud-sdk
              echo "gcloud CLI is now installed."
            else
              echo "gcloud CLI is already installed."
            fi

  initialize:
    description: Initilize the gcloud CLI
    parameters:
      gcloud-service-key:
        description: The gcloud service key
        type: string
        default: $GCLOUD_SERVICE_KEY
      google-project-id:
        description: The Google project ID to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_PROJECT_ID
      google-compute-zone:
        description: The Google compute zone to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_COMPUTE_ZONE
    steps:
      - run:
          name: Initialize gcloud CLI to connect to Google Cloud
          command: |
            # Set sudo to work whether logged in as root user or non-root user
            if [[ $EUID == 0 ]]; then export SUDO=""; else export SUDO="sudo"; fi

            # Store service account
            echo <<parameters.gcloud-service-key>> > ${HOME}/gcloud-service-key.json

            # Initialize gcloud CLI
            $SUDO gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
            $SUDO gcloud --quiet config set project <<parameters.google-project-id>>
            $SUDO gcloud --quiet config set compute/zone <<parameters.google-compute-zone>>

jobs:
  install_and_initialize_cli:
    description: Install gcloud CLI, if needed, and initialize to connect to
                 Google Cloud.
    executor: default
    parameters:
      gcloud-service-key:
        description: The gcloud service key
        type: string
        default: $GCLOUD_SERVICE_KEY
      google-project-id:
        description: The Google project ID to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_PROJECT_ID
      google-compute-zone:
        description: The Google compute zone to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_COMPUTE_ZONE
    steps:
      - install
      - initialize:
          gcloud-service-key: <<parameters.gcloud-service-key>>
          google-project-id: <<parameters.google-project-id>>
          google-compute-zone: <<parameters.google-compute-zone>>
      - run: gcloud -v
  use_google_image_and_initialize_cli:
    description: Use Google docker image with cloud-sdk pre-installed and
                 initialize to connect to Google Cloud.
    executor: google
    parameters:
      gcloud-service-key:
        description: The gcloud service key
        type: string
        default: $GCLOUD_SERVICE_KEY
      google-project-id:
        description: The Google project ID to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_PROJECT_ID
      google-compute-zone:
        description: The Google compute zone to connect with via the gcloud CLI
        type: string
        default: $GOOGLE_COMPUTE_ZONE
    steps:
      - initialize:
          gcloud-service-key: <<parameters.gcloud-service-key>>
          google-project-id: <<parameters.google-project-id>>
          google-compute-zone: <<parameters.google-compute-zone>>
```

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

### Example Heroku Reusabe Configuration ("Orb")

You may also use a CircleCI-certified configuration ("orb") to quickly setup a reusable Heroku configuration in your environment. Using this orb will speed up deployment and integration with your Heroku application and will ensure that your deployment is properly configured to work with the CircleCI platform. The example Heroku Orb is shown below.

```
version: 2.1

description: |
  Install the Heroku CLI and deploy applications to Heroku

executors:
  default:
    description:
      Uses the basic buildpack-deps image, which has the
      prerequisites for installing heroku's CLI.
    parameters:
      tag:
        type: string
        default: "bionic"
    docker:
      - image: buildpack-deps:<< parameters.tag >>

commands:
  install:
    steps:
      - run:
          name: "Install Heroku CLI, if necessary"
          command: |
            if [[ $(command -v heroku) == "" ]]; then
              curl https://cli-assets.heroku.com/install.sh | sh
            else
              echo "Heroku is already installed. No operation was performed."
            fi
  deploy-via-git:
    parameters:
      app-name:
        description:
          "The name of your Heroku App.
          For backwards compatibility the literal value
          `$HEROKU_APP_NAME` is the default, so you can
          easily use this command by setting an environment
          variable called HEROKU_APP_NAME"
        type: string
        default: $HEROKU_APP_NAME
      api-key:
        description:
          "The API key to use. defaulting to the literal value $HEROKU_API_KEY, so you can
          populate the environment variable HEROKU_API_KEY and not need to declare a value in code."
        type: string
        default: $HEROKU_API_KEY
      branch:
        type: string
        description:
          Deploy the given branch. The default value is your current branch.
        default: "$CIRCLE_BRANCH"
      only-branch:
        type: string
        description:
          "If you specify an only-branch, the deploy will not occur for any other branch. The default value,
          an empty string, will result in the command running for all branches.
          This is here mostly because for people moving from CircleCI 1.0 setting up a workflow
          with branch filters may be more than they want to do, and this is a convenient way to filter
          out deploys for all but one branch (a typical use would be to pass `master` as the value."
        default: ""
    steps:
      - run:
          name: Deploy branch to Heroku via git push
          command: |
            if [[ "<< parameters.only-branch >>" == "" ]] || [[ "${CIRCLE_BRANCH}" == "<< parameters.only-branch >>" ]]; then
              git push https://heroku:<< parameters.api-key >>@git.heroku.com/<< parameters.app-name >>.git << parameters.branch >>
            fi
jobs:
  deploy-via-git:
    parameters:
      app-name:
        description:
          "The name of your Heroku App.
          For backwards compatibility the literal value
          `$HEROKU_APP_NAME` is the default, so you can
          easily use this command by setting an environment
          variable called HEROKU_APP_NAME"
        type: string
        default: $HEROKU_APP_NAME
      maintenance-mode:
        description:
          "Use this to automatically enable mantainance mode before pre-deploy steps
           and have it disabled after post-deploy steps have been run."
        type: boolean
        default: false
      pre-deploy:
        description:
          "A list of pre-deploy steps that are run before deployment. This would
           be an ideal place to scale any processes down."
        type: steps
        default: []
      post-deploy:
        description:
          "A list of post-deploy steps that are run after deployment. This would
           be an ideal place to scale any processes back up."
        type: steps
        default: []
    executor: default
    steps:
      - install
      - checkout
      - when:
          condition: << parameters.maintenance-mode >>
          steps:
            - run: heroku maintenance:on --app << parameters.app-name >>
      - steps: << parameters.pre-deploy >>
      - deploy-via-git:
          app-name: << parameters.app-name >>
      - steps: << parameters.post-deploy >>
      - when:
          condition: << parameters.maintenance-mode >>
          steps:
            - run: heroku maintenance:off --app << parameters.app-name >>
```

For more information on the Heroku orb and its configuration, refer to the (CircleCI Orb Registry) [https://circleci.com/orbs/registry/orb/circleci/heroku).

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
