---
layout: classic-docs
title: "Deployment Examples"
short-title: "Deployment Examples"
---
This document presents example config for a variately of popular deployment targets. Many of the examples use orbs: CircleCI and partners have developed a catalogue of orbs that enable you to quickly deploy applications with minimal config. Details of all orbs can be found in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

* TOC
{:toc}

#### Notes on Examples
{:.no_toc}

* In order to use orbs you must use `version 2.1` config, and enable pipelines for your project. 
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using a self-hosted installation of CircleCI Server, the examples shown here are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/orbs/registry/) to see how the jobs are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).
* Any items in these examples that appear within `< >` should be replaced with your own parameters.

## AWS

This section covers deployment to S3, ECR/ECS (Elastic Container Registry/Elastic Container Service), as well as application deployment using AWS Code Deploy. For an in-depth look at deploying to AWS ECS from ECR, see the [Deploying to AWS ECS/ECR document]({{ site.baseurl }}/2.0/ecs-ecr/).

For more detailed information about the AWS ECS, AWS ECR, & AWS CodeDeploy orbs, refer to the following Orb registry pages:
- [AWS ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr)
- [AWS ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs)
- [AWS CodeDeploy](https://circleci.com/orbs/registry/orb/circleci/aws-code-deploy)

### Deploy to S3
{:.no_toc}
#### Using the AWS S3 Orb
{:.no_toc}

For detailed information about the AWS S3 orb, refer to the [CircleCI AWS S3 Orb Reference](https://circleci.com/orbs/registry/orb/circleci/aws-s3) page. This section details the use of the AWS S3 orb and `version: 2.1` config for simple deployment, below we will look at the same example without orbs and using using `version: 2` config.

1. For security best practice, create a new [IAM user](https://aws.amazon.com/iam/details/manage-users/) specifically for CircleCI.

2. Add your [AWS access keys](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) to CircleCI – store your Access Key ID in a variable called `AWS_ACCESS_KEY_ID` and your Secret Access Key in a variable called `AWS_SECRET_ACCESS_KEY`. {% include snippets/env-var-or-context.md %}

3. Use the orb's `sync` command to deploy. Note the use of [workflows]({{ site.baseurl }}/2.0/workflows/) to deploy only if the `build` job passes and the current branch is `master`.

    {% raw %}  
    ```yaml
    version: 2.1 

    orbs:
      aws-s3: circleci/aws-s3@x.y.z # use the AWS S3 orb in your config

    workflows: # Define a Workflow running the build job, then the deploy job
      version: 2
      build-deploy: # Make a workflow to build and deploy your project
        jobs:
          - build
          - deploy:
              requires:
                - build # Only run deploy job once the build job has completed
              filters:
                branches:
                  only: master # Only deploy when the commit is on the Master branch

    jobs: # Define the build and deploy jobs
      build:
        docker: # Use the Docker executor for the build job
          - image: <image-name-and-tag> # Specify the Docker image to use for the build job
      ... # build job steps omitted for brevity
      deploy:
        docker: # Use the Docker executor for the deploy job
          - image: <image-name-and-tag>  # Specify the Docker image to use for the deploy job
      steps:
          - checkout
          - aws-s3/sync:
              from: bucket
              to: 's3://my-s3-bucket-name/prefix'
              arguments: | # Optional arguments
                --acl public-read \
                --cache-control "max-age=86400"
              overwrite: true # default is false
    ```
    {% endraw %}

#### Deploy to AWS S3 with 2.0 Config
{:.no_toc}

1. For security best practice, create a new [IAM user](https://aws.amazon.com/iam/details/manage-users/) specifically for CircleCI.

2. Add your [AWS access keys](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) to CircleCI – store your Access Key ID in a variable called `AWS_ACCESS_KEY_ID` and your Secret Access Key in a variable called `AWS_SECRET_ACCESS_KEY`. {% include snippets/env-var-or-context.md %}

3. In your `.circleci/config.yml` file, create a new `deploy` job. In the `deploy` job, add a step to install `awscli` in your primary container.

4. Install `awscli` in your primary container by following the [AWS CLI documentation](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).

5. [Use the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-using.html) to deploy your application to S3 or perform other AWS operations. Note the use of [workflows]({{ site.baseurl }}/2.0/workflows/) to deploy only if the build job passes and the current branch is `master`.

    ```
    version: 2

    workflows: # Define a Workflow running the build job, then the deploy job
      version: 2
      build-deploy:
        jobs:
          - build
          - deploy:
              requires:
                - build
              filters:
                branches:
                  only: master # Only deploys when the commit is on the Master branch

    jobs:
      build:
        docker: # Specify executor for running build job - this example uses a Docker container
          - image: <docker-image-name-tag> # Specify docker image to use
      ... # build job steps omitted for brevity
      deploy:
        docker: # Specify executor for running deploy job
          - image: <docker-image-name-tag> # Specify docker image to use
        steps:
          - run: # Install the AWS CLI if it is not already included in the docker image
              name: Install awscli 
              command: sudo pip install awscli
          - run: # Deploy to S3 using the sync command
              name: Deploy to S3
              command: aws s3 sync <path/to/bucket> <s3://location/in/S3-to-deploy-to>
    ```

For a complete list of AWS CLI commands and options, see the [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/).

### Deploy Docker Image to AWS ECR
{:.no_toc}
The AWS ECR orb enables you to log into AWS, build, and then push a Docker image to AWS Elastic Container Registry with minimal config. See the [orb registry page](https://circleci.com/orbs/registry/orb/circleci/aws-ecr) for a full list of parameters, jobs, commands and options.

Using the `build_and_push_image` job, as shown below requires the following env vars to be set: `AWS_ECR_ACCOUNT_URL`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `AWS_REGION`. {% include snippets/env-var-or-context.md %}

```
version: 2.1

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # Use the AWS ECR orb in your config

workflows:
  build_and_push_image: 
    jobs:
      - aws-ecr/build_and_push_image: # Use the pre-defined `build_and_push_image` job
          dockerfile: <my-Docker-file>
          path: <path-to-my-Docker-file>
          profile-name: <my-profile-name>
          repo: <my-ECR-repo>
          tag: <my-ECR-repo-tag> # default - latest
```

### Update an AWS ECS Instance
{:.no_toc}

Use the [AWS ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr) and [ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs) orbs to easily update an existing AWS ECS instance.

Using the `build_and_push_image` job, as shown below requires the following env vars to be set: `AWS_ECR_ACCOUNT_URL`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `AWS_REGION`. {% include snippets/env-var-or-context.md %}

```yaml
version: 2.1 

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # Use the AWS ECR orb in your config
  aws-ecs: circleci/aws-ecs@x.y.z # Use the AWS ECS orb in your config

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          dockerfile: <my-Docker-file>
          path: <path-to-my-Docker-file>
          profile-name: <my-profile-name>
          repo: ${MY_APP_PREFIX}
          tag: '${CIRCLE_SHA1}' 
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image # only run the deployment job once the build and push image job has completed
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

### AWS CodeDeploy
{:.no_toc}

The [AWS CodeDeploy](https://circleci.com/orbs/registry/orb/circleci/aws-code-deploy) orb enables you to run deployments through AWS CodeDeploy.

```yaml
version: 2.1 # use 2.1 to make use of orbs and pipelines

orbs:
  aws-code-deploy: circleci/aws-code-deploy@x.y.z # Use the AWS CodeDeploy orb in your config

workflows:
  deploy_application:
    jobs:
      - aws-code-deploy/deploy:
          application-name: <my-application> # The name of an AWS CodeDeploy application associated with the applicable IAM user or AWS account.
          deployment-group: <my-deployment-group> # The name of a new deployment group for the specified application.
          service-role-arn: <my-deployment-group-role-ARN> # The service role for a deployment group.
          bundle-bucket: <my-application-S3-bucket> # The s3 bucket where an application revision will be stored.
          bundle-key: <my-S3-bucket-key> # A key under the s3 bucket where an application revision will be stored.
```

## Azure Container Registry

This section describes a simple deployment to the Azure container registry (ACR) using the CircleCI ACR orb and `version 2.1` configuration.

For detailed information about the Azure ACR orb, including all options, refer to the [CircleCI ACR Orb Reference](https://circleci.com/orbs/registry/orb/circleci/azure-acr) page.

1. Whether your require a user or service principal login, you will need to provide environment variables for username, password and tennent to CircleCI. For user logins use env var names as follows: `AZURE_USERNAME`, `AZURE_PASSWORD` and `AZURE_TENANT`. For service principal logins use: `AZURE_SP`, `AZURE_SP_PASSWORD` and `AZURE_SP_TENANT`. {% include snippets/env-var-or-context.md %}

2. Use the orb's `build-and-push-image` job to build your image and deploy it to ACR. Note the use of [workflows]({{ site.baseurl }}/2.0/workflows/) to deploy only if the current branch is `master`.
  
    ```yaml
    version: 2.1 # Use version 2.1 config to get access to orbs, pipelines

    orbs:
      azure-acr: circleci/azure-acr@x.y.z # Use the Azure ACR orb in your config

    workflows: 
      build-deploy:
        jobs:
          - azure/build-and-push-image:
              dockerfile: <name-of-your-dockerfile> # defaults to `Dockerfile`
              path: <path-to-your-dockerfile> # Defaults to working directory
              login-server-name: <your-login-server-name> # e.g. {yourregistryname}.azure.io
              registry-name: <your-ACR-registry-name>
              repo: <URI-to-your-login-server-name>
              filters:
                branches:
                  only: master # Only deploys when the commit is on the Master branch
    ```

If pushing to your repo is required, see the [Adding Read/Write Deployment Keys to GitHub or Bitbucket]( {{ site.baseurl }}/2.0/gh-bb-integration/) section of the GitHub and Bitbucket Integration document for instructions. Then, configure the Azure Web App to use your production branch.

## Capistrano

Once your project is set up to use Capistrano, you can run [deployment commands](https://github.com/capistrano/capistrano/blob/master/README.md#command-line-usage) within your CircleCI job steps as required.
```yaml
version: 2

workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job
      - deploy-job:
          requires:
            - build-job # Only run deploy job once build job has completed
          filters:
            branches:
              only: master # Only run deploy job when commit is on the master branch

jobs:
  #  build and test jobs go here - not included for brevity
  deploy-job:
    docker:
      - image: <docker-image-name-tag>
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: Bundle Install
          command: bundle check || bundle install
      - run:
          name: Deploy if tests pass and branch is Master
          command: bundle exec cap production deploy
```

## Cloud Foundry

CircleCI has developed a CloudFoundry Orb that you can use to simplify your configuration workflows. The Cloud Foundry page in the [Orbs Registry](https://circleci.com/orbs/registry/orb/circleci/cloudfoundry) contains several different examples of how you can perform tasks with CloudFoundry, including the example below that shows how you can build and run blue green deployment in a single job - in this example `domain` will automatically be prefixed with `dark` and `live` for two subdomains to be specified. Validation steps would also need to be provided to allow the live deployment to go ahead.

```yaml
version: 2.1

orbs:
  cloudfoundry: circleci/cloudfoundry@x.y.z # Use the Cloud Foundry orb in your config
  
workflows:
  build_deploy:
    jobs:
      - cloudfoundry/blue_green:
          appname: <your-app-name>
          build_steps:
            - run: echo 'your build steps'
            - run: echo 'you can have more, too'
            - run: echo 'or provide a workspace'
          context: your-context
          domain: your-domain
          manifest: null
          org: your-org
          package: null
          space: your-space
          validate_steps: 
            # Call any orbs or custom commands that validate the health of deployed application before letting Green deploy/reroute proceed.
            # For example,  hitting a /health endpoint with curl and making sure the dark URL returns a 200.
```

If you would like more detailed information about various CloudFoundry orb elements that you can use in your configuration workflows, refer to the [CloudFoundry Orb](https://circleci.com/orbs/registry/orb/circleci/cloudfoundry) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

### Deploy to Cloud Foundry with 2.0 Config
{:.no_toc}

Cloud Foundry deployments require the Cloud Foundry CLI. Be sure to match the architecture to your Docker image (the commands below assume you are using a Debian-based image). This example pattern implements "Blue-Green" deployments using Cloud Foundry's map-route/unmap-route commands, which is an optional feature above and beyond a basic `cf push`.

#### Install the CLI
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

#### Dark Deployment
{:.no_toc}

This is the first step in a [Blue-Green](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html) deployment, pushing the application to non-production routes.

{% raw $}

```yaml
- run:
    name: CF Deploy
    command: |
      # push artifacts on "dark" subdomain, not yet starting so we can attach environment variables
      cf push --no-start <app-name-dark> -f manifest.yml -p application.jar -n dark -d <example.com>
      # Pass CircleCI variables to Cloud Foundry (optional)
      cf set-env <app-name-dark> circle_build_num ${CIRCLE_BUILD_NUM}
      cf set-env <app-name-dark> circle_commit ${CIRCLE_SHA1}
      cf set-env <app-name-dark> circle_workflow_guid ${CIRCLE_WORKFLOW_ID}
      cf set-env <app-name-dark> circle_user ${CIRCLE_PROJECT_USERNAME}
      cf set-env <app-name-dark> circle_repo ${CIRCLE_PROJECT_REPONAME}
      # Start the application
      cf start <app-name-dark>
      # Ensure dark route is exclusive to dark app
      cf unmap-route <app-name> <example.com> -n dark || echo "Dark Route Already exclusive"
```

{% endraw $}

#### Live Deployment
{:.no_toc}

Until now, the previously pushed "app-name" has not changed.  The final step is to route the production URL to our dark application, stop traffic to the previous version, and rename the applications.

```yaml
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

#### Manual Approval
{:.no_toc}

For additional control or validation, you can add a manual "hold" step between the dark and live steps as shown in the sample workflow below.

```yaml
workflows:
  version: 2 # only requires if using `version: 2` config.
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
            - hold # manual approval required via the CircleCI UI to run the live-deploy job
          filters:
            branches:
              only: master
```

## Firebase

In order to deploy to Firebase you will need to add `firebase-tools` to your project's devDependencies since attempting to install firebase-tools globally in CircleCI will not work.

```
npm install --save-dev firebase-tools
```

Generate a Firebase CLI token using the following command:

```
firebase login:ci
```

Add the generated token to the CircleCI project's environment variables as `$FIREBASE_DEPLOY_TOKEN`. {% include snippets/env-var-or-context.md %}

The following example shows how you can add a deploy to Firebase job to your project's `config.yml` file. This snippet assumes you already have a job to build your application, called `build-job`, and introduces a deployment workflow that only runs the deployment job once the build job has completed **and** you're on the master branch.

```yaml

 deploy-job:
   docker:
     - image: <docker-image-name-tag>
   working_directory: /tmp/my-project
   steps:
     - run:
         name: Deploy Master to Firebase
         command: ./node_modules/.bin/firebase deploy --token=$FIREBASE_DEPLOY_TOKEN

workflows:
  version: 2
  deploy:
    jobs:
      - build-job
      - deploy-job:
          requires:
            - build-job
          filters:
            branches:
              only: master

```

If using Google Cloud Functions with Firebase, instruct CircleCI to navigate to the folder where the Google Cloud Functions are held (in this case 'functions') and run `npm install` by adding the below to `config.yml`:

```
   - run: cd functions && npm install
```

## Google Cloud Platform

Before deploying to Google Cloud Platform, you will need to authorize the Google Cloud SDK and set default configuration settings. Refer to the [Authorizing the Google Cloud SDK]({{ site.baseurl }}/2.0/google-auth/) document for full details.

### Using Google Cloud Orbs
{:.no_toc}

There are several Google Cloud orbs available in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) that you can use to simplify your deployments. For example, the [Google Kubernetes Engine (GKE) orb](https://circleci.com/orbs/registry/orb/circleci/gcp-gke#usage-publish-and-rollout-image) has a pre-built job to build and publish a Docker image, and roll the image out to a GKE cluster, as follows:

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z # Use the GCP GKE orb in your config

workflows:
  main:
    jobs:
      - gke/publish-and-rollout-image:
          cluster: <your-GKE-cluster> # name of GKE cluster to be created
          container: <your-K8-container-name> # name of your Kubernetes container
          deployment: <your-K8-deployment-name> # name of your Kubernetes deployment
          image: <your-image> # name of your Docker image
          tag: $CIRCLE_SHA1 # Docker image tag - optional
```
### Deployment to GKE with 2.0 Config
{:.no_toc}

In the following example, if the `build-job` passes and the current branch is `master`, CircleCI runs the deployment job.

{% raw %}
```
version: 2

jobs:
 build-job:
  # steps ommitted for brevity
 deploy-job:
   docker:
     - image: <docker-image-name-tag>
   working_directory: /tmp/my-project  
   steps:
     - run:
         name: Deploy Master to GKE
         command: |
         # Push Docker image to registry, update K8s deployment to use new image - `gcloud` command handles authentication and push all at once
         sudo /opt/google-cloud-sdk/bin/gcloud docker push us.gcr.io/${PROJECT_NAME}/hello 
         # The new image is now available in GCR for the GCP infrastructure to access, next, change permissions:
         sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
         # Use `kubectl` to find the line that specifies the image to use for our container, replace with image tag of the new image. 
         # The K8s deployment intelligently upgrades the cluster by shutting down old containers and starting up-to-date ones.
         kubectl patch deployment docker-hello-google -p '{"spec":{"template":{"spec":{"containers":[{"name":"docker-hello-google","image":"us.gcr.io/circle-ctl-test/hello:'"$CIRCLE_SHA1"'"}]}}}}'

workflows:
  version: 2
  build-deploy:
    jobs:
      - build-job 
      - deploy-job:
          requires:
            - build-job # Only deploy once the build job has completed
          filters:
            branches:
              only: master # Only deploy on the master branch

```
{% endraw %}

For another example, see our [CircleCI Google Cloud deployment example project](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app).

## Heroku

[Heroku](https://www.heroku.com/) is a popular platform for hosting applications in the cloud. To configure CircleCI
to deploy your application to Heroku, follow the steps below.

### Deploy with the Heroku Orb
{:.no_toc}
1. Create a Heroku account and follow the [Getting Started on Heroku](https://devcenter.heroku.com/start) documentation
to set up a project in your chosen language.

2. Add the name of your Heroku application and your Heroku API key as environment variables as `HEROKU_APP_NAME` and `HEROKU_API_KEY`, respectively. {% include snippets/env-var-or-context.md %}

3. Use the [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku) to keep your config simple. The `deploy-via-git` installs the Heroku CLI in the primary container, runs any pre deployment steps you define, deploys your application, then runs any post-deployment steps you define. See the Heroku orb page in the [orbs registry](https://circleci.com/orbs/registry/orb/circleci/heroku) for full details of parameters and options:

    ```
    version: 2.1

    orbs:
      heroku: circleci/heroku@x.y # Use the Heroku orb in your config

    workflows:
      heroku_deploy:
        jobs:
          - build
          - heroku/deploy-via-git
              requires:
                - build # only run deploy-via-git job if the build job has completed
              filters:
                branches:
                  only: master # only run deploy-via-git job on master branch
    ```

For more detailed information about these Heroku orbs, refer to the [CircleCI Heroku Orb](https://circleci.com/orbs/registry/orb/circleci/heroku).

### Heroku Deployment with 2.0 Config
{:.no_toc}

1. Create a Heroku account and follow the [Getting Started on Heroku](https://devcenter.heroku.com/start) documentation
to set up a project in your chosen language.

2. Add the name of your Heroku application and your Heroku API key as environment variables as `HEROKU_APP_NAME` and `HEROKU_API_KEY`, respectively. {% include snippets/env-var-or-context.md %}

3. In your `.circleci/config.yml`, create a deployment job and add an [executor type]({{ site.baseurl }}/2.0/executor-types/).

4. Add steps to your deployment job to checkout and deploy your code. You can specify which branch you would like to deploy, in this example we specify the master branch and deploy using a `git push` command.

    ```
    version: 2

    jobs:
      build:
        ...
      deploy:
        docker:
          - image: <docker-image-name-tag>
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
                - build # only run deploy-via-git job if the build job has completed
              filters:
                branches:
                  only: master # only run deploy-via-git job on master branch
    ```
**Note:** Heroku provides the option "Wait for CI to pass before deploy" under deploy / automatic deploys. See the [Heroku documentation](https://devcenter.heroku.com/articles/github-integration#automatic-deploys) for details.

## NPM

Setting up CircleCI to publish packages to the npm registry makes it easy for project collaborators to release new package versions in a consistent and predictable way.

1.  Obtain the npm authToken for the account that you wish to use to publish the package.

    You can do that by logging in to npm (`npm login`). This will save the authToken to the `~/.npmrc` file. Look for the following line:

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    In this case, the authToken is `00000000-0000-0000-0000-000000000000`.

2.  Go to your [project settings]( {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git), and set the `NPM_TOKEN` variable to the obtained authToken.

3.  Configure CircleCI to add the authToken to `~/.npmrc`, run `npm publish` and only for versioned tags:

    ```
    version: 2

    jobs:
      publish:
        docker:
          - image: <docker-image-name-tag>
        steps:
          - checkout
          - run:
              name: Publish to NPM
              command: | 
                npm set //registry.npmjs.org/:_authToken=$NPM_TOKEN
                npm publish

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

    This will update the `package.json` file and creates a tagged Git commit. Next, push the commit with tags:

    ```
    git push --follow-tags
    ```
5.  If tests passed, CircleCI will publish the package to npm automatically.

## SSH

To configure CircleCI to deploy your application over SSH, follow the steps below.

1. Add the SSH key for the server to which you're deploying. For instructions, see the [Adding an SSH Key to CircleCI]({{ site.baseurl }}/2.0/add-ssh-key/) document.

2. Add the SSH username and SSH hostname of your build VM as environment variables. For instructions, see the [Adding Project Environment Variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) document. In this example, these variables are defined as `SSH_USER` and `SSH_HOST`, respectively.

3. In your `.circleci/config.yml`, create a `deploy` job and add a command to deploy the master branch.

    ```
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
                - build # only deploy once build job has completed
              filters:
                branches:
                  only: master # only deploy on the master branch
    ```
