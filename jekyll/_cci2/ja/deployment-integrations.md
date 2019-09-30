---
layout: classic-docs
title: "デプロイの設定"
short-title: "デプロイの設定"
---

CircleCI は、ほぼすべてのサービスにデプロイできるように設定できます。 ここでは、以下のプラットフォームでのデプロイ方法とその例を示しています。

- 目次
{:toc}

## 概要
{:.no_toc}

アプリケーションをデプロイするには、[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#jobs-overview)を `.circleci/config.yml` ファイルに追加します。 また、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#setting-an-environment-variable-in-a-project)と [SSH 鍵]({{ site.baseurl }}/ja/2.0/add-ssh-key/)を追加する必要があります。

以下に、Rails アプリケーションを Heroku にデプロイする場合の簡単な例を示します。 アプリケーション全体は、[CircleCI デモワークフローリポジトリの連続ジョブのブランチ](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/sequential-branch-filter)で確認できます。

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

設定では、`sequential-branch-filter` ブランチがチェックアウトされ `build` ジョブが実行された場合にのみデプロイされるように、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使用しています。 デプロイジョブで前のジョブからの出力を使用する場合は、[ワークスペースを使用する]({{ site.baseurl }}/ja/2.0/workflows/#ジョブ間のデータ共有を可能にする-workspaces-を使う)ことでそのデータを共有できます。 条件付きデプロイについては、「[Workflows におけるコンテキストとフィルターの使い方]({{ site.baseurl }}/ja/2.0/workflows/#workflows-におけるコンテキストとフィルターの使い方)」を参照してください。

## AWS

AWS S3 にデプロイするには、以下の手順に従います。

ECR から AWS ECS にデプロイする方法については、「[AWS ECR/ECS へのデプロイ]({{ site.baseurl }}/ja/2.0/ecs-ecr/)」を参照してください。

1. セキュリティ上のベストプラクティスとして、CircleCI 専用の新しい [IAM ユーザー](https://aws.amazon.com/jp/iam/details/manage-users/)を作成します。

2. [AWS アクセスキー](https://docs.aws.amazon.com/ja_jp/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)を[プロジェクト環境変数](https://circleci.com/docs/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)または[コンテキスト環境変数](https://circleci.com/docs/ja/2.0/env-vars/#context内で環境変数を設定する)として CircleCI に追加します。 アクセスキー ID を `AWS_ACCESS_KEY_ID` という変数に、またシークレットアクセスキーを `AWS_SECRET_ACCESS_KEY` という変数に格納します。

3. `.circleci/config.yml` ファイルで、新しい `deploy` ジョブを作成します。 `deploy` ジョブで、プライマリコンテナに `awscli` をインストールするステップを追加します。

4. [AWS CLI に関するドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-install.html)に従って、プライマリコンテナに `awscli` をインストールします。

5. [AWS CLI を使用](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-using.html)して、アプリケーションを S3 にデプロイするか、他の AWS 操作を実行します。 以下の例は、CircleCI で[このドキュメントサイト](https://github.com/circleci/circleci-docs)を S3 にデプロイする方法を示しています。 ビルドジョブが終了し、現在のブランチが `master` である場合にのみ、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使用してデプロイしてください。

```yaml
version: 2
jobs:
  # build job omitted for brevity
  deploy:
    docker:
      - image: circleci/python:3.7-stretch
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

AWS CLI のコマンドとオプションの一覧は、「[AWS CLI コマンドリファレンス](https://docs.aws.amazon.com/cli/latest/reference/)」で参照できます。

### AWS Orb のサンプル

CircleCI はパートナーと協力して、AWS アプリケーションを迅速にデプロイするための AWS Orb をいくつか開発しています。これらの Orb は [CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)で確認できます。 以下に AWS S3、AWS ECR、AWS ECS の各 Orb の使用方法を説明します。

#### AWS S3 Orb

    version: 2.1
    orbs:
      aws-s3: circleci/aws-s3@1.0.11
    jobs:
      build:
        docker:
          - image: 'circleci/python:2.7'
        steps:
          - checkout
          - run: mkdir bucket && echo "lorum ipsum" > bucket/build_asset.txt
          - aws-s3/sync:
              from: bucket
              to: 's3://my-s3-bucket-name/prefix'
              arguments: |
                --acl public-read \
                --cache-control "max-age=86400"
              overwrite: true
          - aws-s3/copy:
              from: bucket/build_asset.txt
              to: 's3://my-s3-bucket-name'
              arguments: '--dryrun'
    

AWS S3 Orb の詳細については、[CircleCI AWS S3 Orb リファレンス](https://circleci.com/orbs/registry/orb/circleci/aws-s3)ページを参照してください。

#### AWS ECR と AWS ECS の Orb のサンプル

##### AWS ECR

This orb enables you to log into AWS, build, and then push image to Amazon ECR.

    orbs:
      aws-ecr: circleci/aws-ecr@0.0.10
    version: 2.1
    workflows:
      build_and_push_image:
        jobs:
          - aws-ecr/build_and_push_image:
              account-url: AWS_ECR_ACCOUNT_URL_ENV_VAR_NAME
              aws-access-key-id: ACCESS_KEY_ID_ENV_VAR_NAME
              aws-secret-access-key: SECRET_ACCESS_KEY_ENV_VAR_NAME
              context: myContext
              create-repo: true
              dockerfile: myDockerfile
              path: pathToMyDockerfile
              profile-name: myProfileName
              region: AWS_REGION_ENV_VAR_NAME
              repo: myECRRepository
              tag: myECRRepoTag
    

##### AWS ECS

この Orb では、既存の AWS ECS インスタンスをアップデートできます。

    version: 2.1
    orbs:
      aws-ecr: circleci/aws-ecr@0.0.4
      aws-ecs: circleci/aws-ecs@0.0.3
    workflows:
      build-and-deploy:
        jobs:
          - aws-ecr/build_and_push_image:
              account-url: '${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
              repo: '${MY_APP_PREFIX}'
              region: '${AWS_REGION}'
              tag: '${CIRCLE_SHA1}
      '
          - aws-ecs/deploy-service-update:
              requires:
                - aws-ecr/build_and_push_image
              family: '${MY_APP_PREFIX}-service'
              cluster-name: '${MY_APP_PREFIX}-cluster'
              container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
    

##### AWS CodeDeploy

The `aws-code-deploy` orb enables you to run deployments through AWS CodeDeploy.

```yaml
version: 2.1 # We must use 2.1 to make use of orbs.
orbs: # specify all orbs you want to use.
  aws-code-deploy: circleci/aws-code-deploy@1.0.0
workflows:
  deploy_application:
    jobs:
      - aws-code-deploy/deploy:
          application-name: myApplication # The name of an AWS CodeDeploy application associated with the applicable IAM user or AWS account.
          deployment-group: myDeploymentGroup # The name of a new deployment group for the specified application.
          service-role-arn: myDeploymentGroupRoleARN # The service role for a deployment group.
          bundle-bucket: myApplicationS3Bucket # The s3 bucket where an application revision will be stored.
          bundle-key: myS3BucketKey # A key under the s3 bucket where an application revision will be stored.
```

For more detailed information about the AWS ECS, AWS ECR, & AWS CodeDeploy orbs, refer to the following Orb registry pages:

- [AWS ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr)
- [AWS ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs)
- [AWS CodeDeploy](https://circleci.com/orbs/registry/orb/circleci/aws-code-deploy)

## Azure

To deploy to Azure, use a similar job to the above example that uses an appropriate command. If pushing to your repo is required, see the [Adding Read/Write Deployment Keys to GitHub or Bitbucket]({{ site.baseurl }}/2.0/gh-bb-integration/) section of the GitHub and Bitbucket Integration document for instructions. Then, configure the Azure Web App to use your production branch.

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

Cloud Foundry deployments require the Cloud Foundry CLI. Be sure to match the architecture to your Docker image (the commands below assume you're using a Debian-based image). This example pattern implements "Blue-Green" deployments using Cloud Foundry's map-route/unmap-route commands, which is an optional feature above and beyond a basic `cf push`.

### CLI のインストール
{:.no_toc}

- run:
        name: Setup CF CLI
        command: |
          curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
          sudo dpkg -i cf-cli_amd64.deb
          cf -v
          cf api https://api.run.pivotal.io  # alternately target your private Cloud Foundry deployment
          cf auth "$CF_USER" "$CF_PASSWORD"
          cf target -o "$CF_ORG" -s "$CF_SPACE"
    

### dark デプロイ
{:.no_toc}

This is the first step in a Blue-Green deployment, pushing the application to non-production routes.

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
    

### live デプロイ
{:.no_toc}

Until now, the previously pushed "app-name" has not changed. The final step is to route the production URL to our dark application, stop traffic to the previous version, and rename the applications.

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
    

### 手動による承認
{:.no_toc}

For additional control or validation, you can add a manual "hold" step between the dark and live steps as shown in the sample workflow below.

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
    

### Orb デプロイのサンプル

CircleCI has developed a CloudFoundry Orb that you can use to simplify your configuration workflows. The [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) contains several different examples of how you can perform certain tasks with CloudFoundry, including the example below that shows how you can build and deploy your CloudFoundry application in a single job.

    version: 2.1
    
    build_and_push:
        description: |
          Build and deploy your application in a single job.
        usage:
          version: 2.1
    
          orbs:
            cloudfoundry: circleci/cloudfoundry@1.0
    
          workflows:
            version: 2
            build-deploy:
              jobs:
    
                - cloudfoundry/push:
                    appname: your-app
                    org: your-org
                    space: your-space
                    build_steps:
                      - run: # your build steps
                      - run: # you can have more, too
                    manifest: # path to manifest.yml file
                    package: # path to application package
    

If you would like more detailed information about various CloudFoundry orb examples that you can use in your configuration workflows, refer to the [CloudFoundry Orb](https://circleci.com/orbs/registry/orb/circleci/cloudfoundry) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

## Firebase

Add firebase-tools to the project's devDependencies since attempting to install firebase-tools globally in CircleCI will not work.

    npm install --save-dev firebase-tools
    

Generate a Firebase CLI token using the following command:

    firebase login:ci
    

Add the generated token to the CircleCI project's environment variables as $FIREBASE_DEPLOY_TOKEN.

Add the below to the project's `config.yml` file

    <br />     deploy-job:
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
    
    

If using Google Cloud Functions with Firebase, instruct CircleCI to navigate to the folder where the Google Cloud Functions are held (in this case 'functions') and run npm install by adding the below to `config.yml`:

       - run: cd functions && npm install
    

### Firebase Orb のサンプル

If you would like to simplify your Firebase configuration workflow, you may use a pre-configured package of configurations (referred to as an "orb") to deploy your application to Firebase. The example below shows this Firebase orb.

    version: 2.1
    description: Orb for firebase deploy.
    commands:
      deploy:
        description: Deploy to firebase
        parameters:
          token:
            type: string
            description: Firebase Deploy Token
        steps:
          - run:
              name: Install Firebase Tools
              command: npm install --prefix=./firebase-deploy firebase-tools
          - run:
              name: Deploy to Firebase
              command: ./firebase-deploy/node_modules/.bin/firebase deploy --token=<< parameters.token >>
    

For more detailed information about how you can use the Firebase orb to deploy your application, refer to the [Firebase Orb Deploy](https://circleci.com/orbs/registry/orb/cloudliner/firebase-deploy) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

## Google Cloud

Before deploying to Google Cloud Platform, you will have to authorize the Google Cloud SDK and set default configuration settings. Refer to the [Authorizing the Google Cloud SDK]({{ site.baseurl }}/2.0/google-auth/) document for full details.

In the following example, if `build-job` passes and the current branch was the master branch, CircleCI runs `deploy.sh` to do the actual deployment work.

    <br />     deploy-job:
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
    
    

The deployment script pushes the newly created Docker image out to the registry, then updates the K8s deployment to use the new image with a `gcloud` command to handle authentication and push the image all at once:

    sudo /opt/google-cloud-sdk/bin/gcloud docker -- push us.gcr.io/${PROJECT_NAME}/hello
    

The new image is now available in GCR for the GCP infrastructure to access. Then, change permissions:

    sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
    

Finally, utilize the patch subcommand of `kubectl` to find the line that specifies the image to use for our container, and replaces it with the image tag of the image just built. The K8s deployment then intelligently upgrades the cluster by shutting down old containers and starting up-to-date ones.

    kubectl patch deployment docker-hello-google -p '{"spec":{"template":{"spec":{"containers":[{"name":"docker-hello-google","image":"us.gcr.io/circle-ctl-test/hello:'"$CIRCLE_SHA1"'"}]}}}}'
    

The full `deploy.sh` file is available on [GitHub](https://github.com/circleci/docker-hello-google/blob/master/deploy.sh). A CircleCI 2.0 Google Cloud deployment example project is also available [here](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app).

### Google Cloud Orb のサンプル

If you would like to simplify your configuration workflows using a CircleCI orb (a package of configurations that you can use that includes job, commands and executors), the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) contains several different orb examples for Google Cloud, including the example shown below.

          version: 2.1
          orbs:
            gcp-cli: circleci/gcp-cli@1.0.0
          workflows:
            install_and_configure_cli:
              # optionally determine executor to use
              executor: default
              jobs:
                - gcp-cli/install_and_initialize_cli:
                    context: myContext # store your gCloud service key via Contexts, or project-level environment variables
                    google-project-id: myGoogleProjectId
                    google-compute-zone: myGoogleComputeZone
    

For more detailed information about this orb, refer to the [CircleCI Google Cloud Orbs](https://circleci.com/orbs/registry/orb/circleci/gcp-cli) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

## Heroku

[Heroku](https://www.heroku.com/) is a popular platform for hosting applications in the cloud. To configure CircleCI to deploy your application to Heroku, follow the steps below.

1. Heroku アカウントを作成し、[Heroku の Web ページ](https://devcenter.heroku.com/start)に記載された手順に従って、選択した言語でプロジェクトを設定します。

2. Heroku アプリケーションの名前と Heroku API キーを環境変数として追加します。 手順については、「[プロジェクト内で環境変数を設定する]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)」を参照してください。 以下の例では、これらの変数はそれぞれ `HEROKU_APP_NAME` および `HEROKU_API_KEY` として定義されています。

3. `.circleci/config.yml` で、`deploy` ジョブを作成し、Executor タイプを追加します。

See [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) for instructions.

5. コードをチェックアウトし、git を使用して master ブランチを Heroku にデプロイするコマンドを追加します。

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

**Note:** Heroku provides the option "Wait for CI to pass before deploy" under deploy / automatic deploys. See the [Heroku documentation](https://devcenter.heroku.com/articles/github-integration#automatic-deploys) for details.

### Heroku Orb のサンプル

If you would like to simplify your Heroku configuration workflows, including deploying Heroku, or customizing your Heroku workflow, you can use the Heroku orb, which is shown below.

#### Heroku のデプロイ

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@1.0.0
workflows:
  heroku_deploy:
    jobs:
      - heroku/deploy-via-git
```

#### Heroku ワークフローのカスタマイズ

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@1.0.0
workflows:
  heroku_deploy:
    jobs:
      - deploy
jobs:
  deploy:
    executor: heroku/default # Uses the basic buildpack-deps image, which has the prerequisites for installing heroku's CLI.
    steps:
      - checkout
      - heroku/install # Runs the heroku install command, if necessary.
      - heroku/deploy-via-git: # Deploys branch to Heroku via git push.
          only-branch: master # If you specify an only-branch, the deploy will not occur for any other branch.
```

For more detailed information about these Heroku orbs, refer to the [CircleCI Heroku Orb](https://circleci.com/orbs/registry/orb/circleci/heroku) page in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/).

## NPM

Setting up CircleCI to publish packages to the npm registry makes it easy for project collaborators to release new package versions in a consistent and predictable way.

1. パッケージのパブリッシュに使用するアカウント用に npm authToken を取得します。

You can do that by logging in to npm (`npm login`). This will save the authToken to the `~/.npmrc` file. Look for the following line:

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    In this case, the authToken is `00000000-0000-0000-0000-000000000000`.
    

2. [プロジェクト設定]({{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git)に移動して、取得した authToken に `NPM_TOKEN` 変数を設定します。

3. authToken を `~/.npmrc` に追加するように CircleCI を設定し、バージョンが指定されたタグにのみ `npm publish` を実行します。

```yaml
version: 2
jobs:
  publish:
    docker:
      - image: circleci/<language>:<version TAG>
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

4. 新しいバージョンを npm にパブリッシュするには、以下に示すように `npm version` を実行して新しいバージョンを作成します。

    ```
    npm version 10.0.1
    ```

    This will update the `package.json` file and creates a tagged Git commit. Next, push the commit with tags:
    

    ```
    git push --follow-tags
    ```

5. テストが完了すると、パッケージが npm に自動的にパブリッシュされます。

## SSH

To configure CircleCI to deploy your application over SSH, follow the steps below.

1. デプロイ先のサーバー用の SSH 鍵を追加します。 手順については、「[CircleCI に SSH 鍵を登録する]({{ site.baseurl }}/ja/2.0/add-ssh-key/)」を参照してください。

2. ビルド VM の SSH ユーザー名と SSH ホスト名を環境変数として追加します。 手順については、「[プロジェクト内で環境変数を設定する]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)」を参照してください。 以下の例では、これらの変数はそれぞれ `SSH_USER` および `SSH_HOST` として定義されています。

3. `.circleci/config.yml` で、`deploy` ジョブを作成し、master ブランチをデプロイするコマンドを追加します。

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