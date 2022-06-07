---
layout: classic-docs
title: デプロイの設定例
description: ここでは、よく使われるデプロイターゲットの設定例を紹介します。
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、よく使われるデプロイターゲットのさまざまな設定例を紹介します。 多くの例では Orb を使用します。 CircleCI とパートナーは、最小限の設定でアプリケーションを迅速にデプロイできる Orb リストを作成しました。 すべての Orb に関する詳細は、[CircleCI Orb レジストリ](https://circleci.com/ja/developer/orbs)をご覧ください。

* TOC
{:toc}

#### 設定例に関する注意事項
{: #notes-on-examples }
{:.no_toc}

* Orb を使用するには、`version 2.1` の設定ファイルを使用する必要があります。
* `<docker-image-name-tag>` を使ってどこで[ジョブに Docker イメージ]({{ site.baseurl }}/ja/2.0/optimizations/#docker-image-choice)を指定するかを記載しました。
* `version 2.0` の設定ファイルを引き続き使用する場合や CircleCI Server v2.x をご使用の場合も、ここで紹介する設定例により [Orb レジストリ](https://circleci.com/developer/orbs)で幅広い Orb ソースを参照し、ジョブのビルド方法をご覧いただけます。
* このページの Orb を使用した設定例では、例えば`aws-s3: circleci/aws-s3@x.y.z`のように Orb はタグによるバージョンがつけられてています。 設定例をコピー & ペーストする場合は、`x.y.z` を特定のバージョンの値に変更する必要があります。 使用可能なバージョンについては、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の各 Orb のページを参照してください。
* 設定例の `< >`の中の項目は、すべてご自身のパラメーターに置き換える必要があります。

## AWS
{: #aws }

このセクションでは S3、ECR/ECS (Elastic Container Registry/Elastic Container Service) へのデプロイや AWS Code Deploy を使ったアプリケーションのデプロイについて説明します。

AWS S3、ECS、ECR、CodeDeploy Orb の詳細については、Orb レジストリの各ページを参照してください。
- [AWS S3](https://circleci.com/developer/orbs/orb/circleci/aws-s3)
- [AWS ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
- [AWS ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)
- [AWS CodeDeploy](https://circleci.com/developer/orbs/orb/circleci/aws-code-deploy)

### S3 へのデプロイ
{: #deploy-to-s3 }
{:.no_toc}
#### AWS S3 Orb の使用
{: #using-the-aws-s3-orb }
{:.no_toc}

AWS S3 Orb の詳細については、[CircleCI AWS S3 Orb のページ](https://circleci.com/ja/developer/orbs/orb/circleci/aws-s3)を参照してください。 このセクションでは、AWS S3 と`version: 2.1` を使った簡単にデプロイを行う方法の詳細を紹介します。下記では、同じ設定例で Orb を使用せず `version: 2` の設定を使った場合の例を紹介します。

1. セキュリティ上のベストプラクティスとして、CircleCI 専用の新しい [IAM ユーザー](https://aws.amazon.com/jp/iam/details/manage-users/)を作成します。

2. [AWS アクセスキー](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) を CircleCI に追加します（Access Key ID を `AWS_ACCESS_KEY_ID`という変数に保存します）。 {% include snippets/ja/env-var-or-context.md %}

3. Orb の `sync` コマンドを使ってデプロイします。  `build` ジョブが終了し、現在のブランチが `main` である場合にのみ、ワークフローを使用してデプロイしてください。

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
                  only: main # Only deploy when the commit is on the Main branch

    jobs: # Define the build and deploy jobs
      build:
        docker: # Use the Docker executor for the build job
          - image: <image-name-and-tag> # Specify the Docker image to use for the build job
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      ... # build job steps omitted for brevity
      deploy:
        docker: # Use the Docker executor for the deploy job
          - image: <image-name-and-tag>  # Specify the Docker image to use for the deploy job
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

#### 2.0 設定ファイルを使用した AWS S3 へのデプロイ
{: #deploy-to-aws-s3-with-20-config }
{:.no_toc}

1. セキュリティ上のベストプラクティスとして、CircleCI 専用の新しい [IAM ユーザー](https://aws.amazon.com/jp/iam/details/manage-users/)を作成します。

2. [AWS アクセスキー](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) を CircleCI に追加します（Access Key ID を `AWS_ACCESS_KEY_ID`という変数に保存します）。 {% include snippets/ja/env-var-or-context.md %}

3. `.circleci/config.yml` ファイルで、新しい `deploy` ジョブを作成します。 `deploy` ジョブで、プライマリ コンテナに `awscli` をインストールするステップを追加します。

4. [AWS CLI に関するドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-install.html)に従って、プライマリ コンテナに `awscli` をインストールします。

5. [AWS CLI を使用](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-using.html)して、アプリケーションを S3 にデプロイするか、他の AWS 操作を実行します。  build ジョブが終了し、現在のブランチが `main` である場合にのみ、ワークフローを使用してデプロイしてください。

    {% raw %}
    ```yaml
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
                  only: main # Only deploys when the commit is on the Main branch

    jobs:
      build:
        docker: # Specify executor for running build job - this example uses a Docker container
          - image: <docker-image-name-tag> # Specify docker image to use
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      ... # build job steps omitted for brevity
      deploy:
        docker: # Specify executor for running deploy job
          - image: <docker-image-name-tag> # Specify docker image to use
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        steps:
          - run: # Install the AWS CLI if it is not already included in the docker image
              name: Install awscli
              command: sudo pip install awscli
          - run: # Deploy to S3 using the sync command
              name: Deploy to S3
              command: aws s3 sync <path/to/bucket> <s3://location/in/S3-to-deploy-to>
    ```
    {% endraw %}

AWS CLI のコマンドとオプションの一覧は、「[AWS CLI コマンド リファレンス](https://docs.aws.amazon.com/cli/latest/reference/)」で参照できます。

### AWS ECR への Docker イメージのデプロイ
{: #deploy-docker-image-to-aws-ecr }
{:.no_toc}
AWS ECR Orb により、AWS へのログイン、ビルド、Docker イメージの AWS Elastic Container Registry へのプッシュが最小限の設定で可能になります。 すべてのパラメーター、ジョブ、コマンド、オプションのリストは、[Orb レジストリのページ](https://circleci.com/ja/developer/orbs/orb/circleci/aws-ecr)を参照してください。

下記のように `build-and-push-image` ジョブを使う場合は、環境変数 `AWS_ECR_ACCOUNT_URL`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`、`AWS_DEFAULT_REGION` を設定する必要があります。 {% include snippets/ja/env-var-or-context.md %}

{% raw %}

```yaml
version: 2.1

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # Use the AWS ECR orb in your config

workflows:
  build_and_push_image:
    jobs:
      - aws-ecr/build-and-push-image: # Use the pre-defined `build-and-push-image` job
          dockerfile: <my-Docker-file>
          path: <path-to-my-Docker-file>
          profile-name: <my-profile-name>
          repo: <my-ECR-repo>
          tag: <my-ECR-repo-tag> # default - latest
```

{% endraw %}

### AWS ECS インスタンスのアップデート
{: #update-an-aws-ecs-instance }
{:.no_toc}

[AWS ECR](https://circleci.com/ja/developer/orbs/orb/circleci/aws-ecr) Orb と [ECS](https://circleci.com/ja/developer/orbs/orb/circleci/aws-ecs) Orb を使って既存の AWS ECS インスタンスを簡単にアップデートすることができます。

下記のように `build-and-push-image` ジョブを使う場合は、環境変数 `AWS_ECR_ACCOUNT_URL`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`、`AWS_DEFAULT_REGION` を設定する必要があります。 {% include snippets/ja/env-var-or-context.md %}

{% raw %}

```yaml
version: 2.1

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # Use the AWS ECR orb in your config
  aws-ecs: circleci/aws-ecs@x.y.z # Use the AWS ECS orb in your config

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          dockerfile: <my-Docker-file>
          path: <path-to-my-Docker-file>
          profile-name: <my-profile-name>
          repo: ${MY_APP_PREFIX}
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build-and-push-image # only run the deployment job once the build and push image job has completed
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

{% endraw %}

### AWS CodeDeploy
{: #aws-codedeploy }
{:.no_toc}

[AWS CodeDeploy](https://circleci.com/ja/developer/orbs/orb/circleci/aws-code-deploy) Orb を使用すると、AWS CodeDeploy を通じてデプロイを実行できます。

{% raw %}

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

{% endraw %}

## Azure Container Registry
{: #azure-container-registry }

このセクションでは、CircleCI ACR Orb と `version 2.1` の設定ファイル を使った Azure Container Registry (ACR) への簡単なデプロイについて説明します。

Azure ACR Orb の詳細について（すべてのオプションを含む）は、[CircleCI ACR Orb のページ](https://circleci.com/ja/developer/orbs/orb/circleci/azure-acr)を参照してください。

1. ユーザーまたはサービスプリンシパルのログインが必要かどうかにかかわらず、CircleCI にユーザー名、パスワード、およびテナントの環境変数を指定する必要があります。 ユーザーログインの場合は、環境変数名、`AZURE_USERNAME`、`AZURE_PASSWORD`、 `AZURE_TENANT` を使用します。 サービスプリンシパルのログインの場合は、`AZURE_SP`、`AZURE_SP_PASSWORD`、`AZURE_SP_TENANT` を使用します。 {% include snippets/ja/env-var-or-context.md %}

2. Orb の `build-and-push-image` ジョブを使ってイメージをビルドし、ACR にデプロイします。 現在のブランチが `main` である場合にのみ、ワークフローを使用してデプロイしてください。

    {% raw %}

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
                  only: main # Only deploys when the commit is on the Main branch
    ```

    {% endraw %}

リポジトリにプッシュする必要がある場合は、GitHub と Bitbucket のインテグレーションの [GitHub または Bitbucket への読み取り/書き込みデプロイキーの追加]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)に関するセクションでを参照してください。 次に、production ブランチを使用するように Azure Web App を設定します。

## Capistrano
{: #capistrano }

Capistrano を使用するためのプロジェクトのセットアップが完了したら、CircleCI のジョブステップで、必要に応じて[deployment commands](https://github.com/capistrano/capistrano/blob/master/README.md#command-line-usage) を実行することができます。

{% raw %}

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
              only: main # Only run deploy job when commit is on the main branch

jobs:
  #  build and test jobs go here - not included for brevity
  deploy-job:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: Bundle Install
          command: bundle check || bundle install
      - run:
          name: Deploy if tests pass and branch is Main
          command: bundle exec cap production deploy
```

{% endraw %}

## Cloud Foundry
{: #cloud-foundry }

CircleCI は、設定ワークフローを簡略化するために Cloud Foundry Orb を開発しました。 [CircleCI Orb レジストリ](https://circleci.com/ja/developer/orbs/orb/circleci/cloudfoundry) の Cloud Foundry のページでは、Cloud Foundry を使ってタスクを実行するための様々な方法を紹介しています。ここでは、単一のジョブでブルーグリーンデプロイをビルド、実行する方法も紹介しています。この例では、2つのサブドメインを指定するために、`domain` には自動的に `dark` と `live` のプレフィックスが付けられます。 live デプロイが実行できるよう確認ステップも指定する必要があります。

{% raw %}

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

{% endraw %}

設定ワークフローで使用できるさまざまな Cloud Foundry Orb の要素については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs)の [Cloud Foundry Orb](https://circleci.com/developer/orbs/orb/circleci/cloudfoundry) に関するページで詳細を確認できます。

### 2.0 設定ファイルを使用した Cloud Foundry へのデプロイ
{: #deploy-to-cloud-foundry-with-20-config }
{:.no_toc}

Cloud Foundry へのデプロイには Cloud Foundry CLI が必要です。 アーキテクチャは必ず Docker イメージに一致させてください。以下のコマンドは、Debian ベースのイメージが使用されていることを前提としています。 この例では、Cloud Foundry の map-route/unmap-route コマンドを使用して、"Blue-Green" デプロイを実装しています。これは、基本の `cf push` にはないオプションの機能です。

#### CLI のインストール
{: #install-the-cli }
{:.no_toc}

```yaml
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

#### dark デプロイ
{: #dark-deployment }
{:.no_toc}

これは、[Blue-Green](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html) デプロイにおける最初のステップです。アプリケーションを非本番ルートにプッシュします。

{% raw %}

```yaml
      - run:
          name: CF Deploy
          command: |
            # push artifacts on "dark" subdomain, and set environment variables before running `cf start`.
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

{% endraw %}

#### live デプロイ
{: #live-deployment }
{:.no_toc}

ここまで、前項でプッシュした "app-name" は変更されていません。  最後に、本番 URL を dark アプリケーションにルーティングし、それまでのバージョンへのトラフィックを停止し、アプリケーションの名前を変更します。

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

#### 手動による承認
{: #manual-approval }
{:.no_toc}

さらなる制御と検証を行うには、以下のサンプルワークフローに示すように、dark のステップと live のステップの間に手動の "hold" ステップを追加します。

{% raw %}

```yaml
workflows:
  version: 2 # only required if using `version: 2` config.

  build-deploy:
    jobs:
      - test
      - dark-deploy:
          requires:
            - test
          filters:
            branches:
              only: main
      - hold:
          type: approval
          requires:
            - dark-deploy
          filters:
            branches:
              only: main
      - live-deploy:
          requires:
            - hold # manual approval required via the CircleCI UI to run the live-deploy job
          filters:
            branches:
              only: main
```

{% endraw %}

## Firebase
{: #firebase }

Firebase にデプロイするには、CircleCI で Firebase ツールをグローバルにインストールしようとしてもできないため、`firebase-tools`をプロジェクトのdevDependencies に追加する必要があります。

```shell
npm install --save-dev firebase-tools
```

以下のコマンドを使用して、Firebase CLI トークンを生成します。

```shell
firebase login:ci
```

生成されたトークンを CircleCI プロジェクトの環境変数に `$FIREBASE_DEPLOY_TOKEN` として追加します。 {% include snippets/ja/env-var-or-context.md %}

次の例は、Firebase ジョブとプロジェクトの`config.yml`ファイルにデプロイを追加する方法を示します。 このスニペットは、アプリケーションをビルドするための `build-job` というジョブが既に存在することを前提としています。また、ビルドジョブが完了して、**かつ**メインブランチにいる場合にのみデプロイジョブを実行するデプロイワークフローを紹介します。

{% raw %}

```yaml
  deploy-job:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy Main to Firebase
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
              only: main

```

{% endraw %}

Firebase で Google Cloud Functions を使用する場合は、以下の行を `config.yml` に追加し、Google Cloud Functions が保存されているフォルダー (この場合は 'functions') に移動して、`npm install` を実行するように CircleCI に指示します。

{% raw %}

```yaml
      - run: cd functions && npm install
```

{% endraw %}

## Google Cloud Platform
{: #google-cloud-platform }

Google Cloud Platform にデプロイする前に、Google Cloud SDK を承認して、デフォルトの設定を行う必要があります。 詳細については、「[Google Cloud SDK の承認]({{ site.baseurl }}/ja/2.0/google-auth/)」を参照してください。

### Google Cloud Orb の使用
{: #using-google-cloud-orbs }
{:.no_toc}

[CircleCI Orb レジストリ](https://circleci.com/ja/developer/orbs)にある複数の Google Cloud Orb を使ってデプロイを簡易化することができます。 たとえば、[Google Kubernetes Engine (GKE) Orb](https://circleci.com/ja/developer/orbs/orb/circleci/gcp-gke#usage-publish-and-rollout-image) は、ビルド済みのジョブで、Docker イメージをビルドおよびパブリッシュし、イメージを GKE クラスタに以下のようにロールアウトします。

{% raw %}

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

{% endraw %}

### 2.0 設定ファイルを使用した GKE へのデプロイ
{: #deployment-to-gke-with-20-config }
{:.no_toc}

以下の例では、 `build-job`が終了し、現在のブランチが`main`の場合に、CircleCI はデプロイジョブを実行します。

{% raw %}

```yml
version: 2

jobs:
  # build job ommitted for brevity
  deploy-job:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy Main to GKE
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
              only: main # Only deploy on the main branch

```
{% endraw %}

他の例は、[CircleCI Google Cloud deployment example project](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app)を参照してください。

## Heroku
{: #heroku }

[Heroku](https://jp.heroku.com/) は、クラウドでアプリケーションをホスティングするための一般的なプラットフォームです。 アプリケーションを Heroku にデプロイするように CircleCI を設定するには、以下の手順を行います。

### Heroku Orb を使用したデプロイ
{: #deploy-with-the-heroku-orb }
{:.no_toc}
1. Heroku アカウントを作成し、[Heroku の Web ページ](https://devcenter.heroku.com/start)に記載された手順に従って、選択した言語でプロジェクトをセットアップします。

2. Heroku アプリケーションの名前と Heroku API キーを、それぞれ環境変数 `HEROKU_APP_NAME` と `HEROKU_API_KEY`として追加します。 {% include snippets/ja/env-var-or-context.md %}

3. [Heroku Orb](https://circleci.com/developer/orbs/orb/circleci/heroku)を使って設定を簡単にします。 `deploy-via-git`  により、Heroku CLI のプライマリコンテナへのインストール、定義した任意のデプロイ前のステップの実行、アプリケーションの実行、そして定義した任意のデプロイ後のステップの実行が行われます。 パラメーターとオプションの詳細については、[Orb レジストリ](https://circleci.com/ja/developer/orbs/orb/circleci/heroku)の Heroku Orb ページを参照してください。

    {% raw %}

    ```yaml
    version: 2.1

    orbs:
      heroku: circleci/heroku@x.y # Use the Heroku orb in your config

    workflows:
      heroku_deploy:
        jobs:
          - build
          - heroku/deploy-via-git:
              requires:
                - build # only run deploy-via-git job if the build job has completed
              filters:
                branches:
                  only: main # only run deploy-via-git job on main branch
    ```

    {% endraw %}

CircleCI Heroku Orb の詳細については、[CircleCI Orb](https://circleci.com/ja/developer/orbs/orb/circleci/heroku)　を参照してください。

### 2.0 設定を使った Heroku のデプロイ
{: #heroku-deployment-with-20-config }
{:.no_toc}

1. Heroku アカウントを作成し、[Heroku 入門ガイド](https://devcenter.heroku.com/start)に記載された手順に従って、選択した言語でプロジェクトをセットアップします。

2. Heroku アプリケーションの名前と Heroku API キーを、それぞれ環境変数 `HEROKU_APP_NAME` と `HEROKU_API_KEY`として追加します。 {% include snippets/env-var-or-context.md %}

3. `.circleci/config.yml` で、デプロイジョブを作成し、[Executor タイプ]({{ site.baseurl }}/ja/2.0/executor-intro/)を追加します。

4. デプロイジョブにステップを追加し、コードをチェックアウトしデプロイします。 デプロイしたいブランチを指定します。この例では、main ブランチを指定し、`git push` コマンドを使ってデプロイします。

    {% raw %}

    ```yaml
    version: 2

    jobs:
      build:
        ...
      deploy:
        docker:
          - image: <docker-image-name-tag>
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        steps:
          - checkout
          - run:
              name: Deploy Main to Heroku
              command: |
                git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git main

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
                  only: main # only run deploy-via-git job on main branch
    ```

    {% endraw %}

**注:** Heroku では、デプロイまたは自動デプロイで、デプロイの前に渡す CI を待機するオプションが提供されます。 詳細については、[Heroku のドキュメント](https://devcenter.heroku.com/articles/github-integration#automatic-deploys)を参照してください。

## NPM
{: #npm }

パッケージを npm レジストリにパブリッシュするように CircleCI を設定すると、プロジェクトのコラボレーターは、一貫性のある予測可能な方法で新しいパッケージのバージョンを簡単にリリースできるようになります。

1.  パッケージのパブリッシュに使用するアカウント用に npm authToken を取得します。

    それには、npm にログインします (`npm login`)。 これで、authToken が `~/.npmrc` ファイルに保存されます。 次の行を探します。

    ```shell
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    この場合、authToken は `00000000-0000-0000-0000-000000000000` です。

2.  [プロジェクト設定]({{ site.baseurl }}/ja/2.0/env-vars/#setting-an-environment-variable-in-a-project)に移動して、取得した authToken に `NPM_TOKEN` 変数を設定します。

3.  authToken を `~/.npmrc` に追加するように CircleCI を構成し、バージョンが指定されたタグにのみ `npm publish` を実行します。

    {% raw %}

    ```yaml
    version: 2

    jobs:
      publish:
        docker:
          - image: <docker-image-name-tag>
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

    {% endraw %}

4.  新しいバージョンを npm にパブリッシュするには、以下に示すように `npm version` を実行して新しいバージョンを作成します。

    ```shell
    npm version 10.0.1
    ```

    これで、`package.json` ファイルがアップデートされ、タグ付きの Git コミットが作成されます。 次に、タグ付きのコミットをプッシュします。

    ```shell
    git push --follow-tags
    ```
5.  テストが完了すると、パッケージが npm に自動的にパブリッシュされます。

## SSH
{: #ssh }

SSH を介してアプリケーションをデプロイするように CircleCI を設定するには、以下の手順を行います。

1. デプロイ先のサーバー用の SSH キーを追加します。 手順については、[CircleCI に SSH キーを追加する]({{ site.baseurl }}/ja/2.0/add-ssh-key/)を参照してください。

2. ビルド VM の SSH ユーザー名と SSH ホスト名を環境変数として追加します。 手順については、「[プロジェクト内で環境変数を設定する]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)」を参照してください。 以下の例では、これらの変数はそれぞれ `SSH_USER` および `SSH_HOST` として定義されています。

3. `.circleci/config.yml` で、`deploy` ジョブを作成し、main ブランチをデプロイするコマンドを追加します。

    {% raw %}

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
                - build # only deploy once build job has completed
              filters:
                branches:
                  only: main # only deploy on the main branch
    ```

    {% endraw %}
