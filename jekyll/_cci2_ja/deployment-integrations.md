---
layout: classic-docs
title: "デプロイの構成"
short-title: "デプロイの構成"
---

CircleCI は、ほぼすべてのサービスにデプロイできるように構成できます。 以下のプラットフォームでのデプロイ方法とその例を紹介します。

- 目次
{:toc}

## 概要
{:.no_toc}

アプリケーションをデプロイするには、[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#ジョブの概要)を `.circleci/config.yml` ファイルに追加します。 また、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)と [SSH キー]({{ site.baseurl }}/ja/2.0/add-ssh-key/)を追加する必要があります。

以下に、Rails アプリケーションを Heroku にデプロイする場合の簡単な例を示します。 アプリケーション全体は、[CircleCI デモ ワークフロー リポジトリの連続ジョブのブランチ](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/sequential-branch-filter)で確認できます。

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
      - run: bundle install --path vendor/bundle  # 依存関係のインストール
      - run: bundle exec rake db:create db:schema:load  # データベースのセットアップ
      - run:
          name: テストの実行
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
          name: Heroku への master のデプロイ
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

`sequential-branch-filter` ブランチがチェック アウトされ `build` ジョブが実行された場合にのみデプロイされるように、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使用して構成されています。 デプロイ ジョブで前のジョブからの出力を使用する場合は、[ワークスペースを使用する]({{ site.baseurl }}/ja/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)ことでそのデータを共有できます。 条件付きデプロイについては、「[ワークフローにおけるコンテキストとフィルターの使用]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)」を参照してください。

## AWS

AWS S3 にデプロイするには、以下の手順を行います。

AWS ECR から AWS ECS にデプロイする方法については、「[AWS ECR/ECS へのデプロイ]({{ site.baseurl }}/ja/2.0/ecs-ecr/)」を参照してください。

1. セキュリティ上のベスト プラクティスとして、CircleCI 専用の新しい [IAM ユーザー](https://aws.amazon.com/jp/iam/details/manage-users/)を作成します。

2. [AWS アクセス キー](https://docs.aws.amazon.com/ja_jp/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)を[プロジェクト環境変数](https://circleci.com/ja/docs/2.0/env-vars/#プロジェクトでの環境変数の設定)または[コンテキスト環境変数](https://circleci.com/ja/docs/2.0/env-vars/#コンテキストでの環境変数の設定)として CircleCI に追加します。 アクセス キー ID を `AWS_ACCESS_KEY_ID` という変数に、またシークレット アクセス キーを `AWS_SECRET_ACCESS_KEY` という変数に格納します。

3. `.circleci/config.yml` ファイルで、新しい `deploy` ジョブを作成します。 `deploy` ジョブで、プライマリ コンテナに `awscli` をインストールするステップを追加します。

4. [AWS CLI に関するドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-install.html)に従って、プライマリ コンテナに `awscli` をインストールします。

5. [AWS CLI を使用](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-using.html)して、アプリケーションを S3 にデプロイするか、他の AWS 操作を実行します。 以下の例は、CircleCI で[このドキュメント サイト](https://github.com/circleci/circleci-docs)を S3 にデプロイする方法を示しています。 ビルド ジョブが終了し、現在のブランチが `master` である場合にのみ、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使用してデプロイしてください。

```yaml
version: 2
jobs:
  # 簡潔にするためにビルド ジョブは省略しています
  deploy:
    docker:
      - image: circleci/python:3.7-stretch
    working_directory: ~/circleci-docs
    steps:
      - run:
          name: awscli のインストール
          command: sudo pip install awscli
      - run:
          name: S3 へのデプロイ
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

AWS CLI のコマンドとオプションの一覧は、「[AWS CLI コマンド リファレンス](https://docs.aws.amazon.com/cli/latest/reference/)」で参照できます。

### AWS Orb のサンプル

CircleCI はパートナーと協力して、AWS アプリケーションを迅速にデプロイするための AWS Orb をいくつか開発しています。これらの Orb は [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)で確認できます。 以下に AWS S3、AWS ECR、AWS ECS の各 Orb の使用方法を説明します。

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
    

AWS S3 Orb の詳細については、[CircleCI AWS S3 Orb のページ](https://circleci.com/developer/ja/orbs/orb/circleci/aws-s3)を参照してください。

#### AWS ECR と AWS ECS の Orb のサンプル

##### AWS ECR

この Orb では、AWS にログインしてビルドし、イメージを Amazon ECS にプッシュできます。

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

この Orb では、既存の AWS ECS インスタンスを更新できます。

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

`aws-code-deploy` Orb を使用すると、AWS CodeDeploy を通じてデプロイを実行できます。

```yaml
version: 2.1 # Orb を使用するには 2.1 を使用する必要があります
orbs: # 使用するすべての Orb を指定します
  aws-code-deploy: circleci/aws-code-deploy@1.0.0
workflows:
  deploy_application:
    jobs:
      - aws-code-deploy/deploy:
          application-name: myApplication # 該当する IAM ユーザーまたは AWS アカウントに関連付けられた AWS CodeDeploy アプリケーションの名前
          deployment-group: myDeploymentGroup # 指定されたアプリケーションの新規デプロイ グループの名前
          service-role-arn: myDeploymentGroupRoleARN # デプロイ グループのサービス ロール
          bundle-bucket: myApplicationS3Bucket # アプリケーションのリビジョンが格納される s3 バケット
          bundle-key: myS3BucketKey # アプリケーションのリビジョンが格納される s3 バケットのキー
```

AWS ECS、AWS ECR、AWS CodeDeploy Orb の詳細については、Orb レジストリの各ページを参照してください。

- [AWS ECR](https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecr)
- [AWS ECS](https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs)
- [AWS CodeDeploy](https://circleci.com/developer/ja/orbs/orb/circleci/aws-code-deploy)

## Azure

Azure にデプロイするには、上記の例と同様のジョブで適切なコマンドを使用します。 リポジトリにプッシュする必要がある場合は、「[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)」の GitHub または Bitbucket への読み取り/書き込みデプロイ キーの追加に関するセクションで手順を確認してください。 次に、production ブランチを使用するように Azure Web App を構成します。

## Capistrano

```yaml
version: 2
jobs:
  #  ビルド ジョブとテスト ジョブ
  deploy-job:
    docker:
      - image: image pinned to a version and tag
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: バンドル インストール
          command: bundle check || bundle install
      - run:
          name: テストが完了し、ブランチが master である場合は AWS にデプロイ
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

Cloud Foundry へのデプロイには Cloud Foundry CLI が必要です。 アーキテクチャは必ず Docker イメージに一致させてください。以下のコマンドは、Debian ベースのイメージが使用されていることを前提としています。 この例では、Cloud Foundry の map-route/unmap-route コマンドを使用して、"Blue-Green" デプロイを実装しています。これは、基本の `cf push` にはないオプションの機能です。

### CLI のインストール
{:.no_toc}

- run:
        name: CF CLI のセットアップ
        command: |
          curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
          sudo dpkg -i cf-cli_amd64.deb
          cf -v
          cf api https://api.run.pivotal.io  # またはプライベート Cloud Foundry デプロイをターゲットにします
          cf auth "$CF_USER" "$CF_PASSWORD"
          cf target -o "$CF_ORG" -s "$CF_SPACE"
    

### dark デプロイ
{:.no_toc}

これは Blue-Green デプロイの最初のステップで、アプリケーションを non-production ルートにプッシュします。

    - run:
        name: CF デプロイ
        command: |
          # "dark" サブドメインにアーティファクトをプッシュしますが、環境変数を付加できるように開始はしません
          cf push --no-start app-name-dark -f manifest.yml -p application.jar -n dark -d example.com
          # CircleCI の変数を Cloud Foundry に渡します (オプション)
          cf set-env app-name-dark circle_build_num ${CIRCLE_BUILD_NUM}
      cf set-env app-name-dark circle_commit ${CIRCLE_SHA1}
          cf set-env app-name-dark circle_workflow_guid ${CIRCLE_WORKFLOW_ID}
      cf set-env app-name-dark circle_user ${CIRCLE_PROJECT_USERNAME}
      cf set-env app-name-dark circle_repo ${CIRCLE_PROJECT_REPONAME}
      # アプリケーションを開始します
          cf start app-name-dark
          # dark ルートを dark アプリケーション専用にします
          cf unmap-route app-name example.com -n dark || echo "Dark Route Already exclusive"
    

### live デプロイ
{:.no_toc}

ここまで、前にプッシュした "app-name" は変更されていません。 最後に、本番 URL を dark アプリケーションにルーティングし、それまでのバージョンへのトラフィックを停止し、アプリケーションの名前を変更します。

    - run:
        name: 最新の live ドメインへの再ルーティング
        command: |
          # "実際の" URL を新バージョンに送信します
          cf map-route app-name-dark example.com -n www
          # 以前のバージョンへのトラフィックを停止します
          cf unmap-route app-name example.com -n www
          # 以前のバージョンを停止します
          cf stop app-name
          # 以前のバージョンを削除します
          cf delete app-name -f
          # "dark" バージョンの名前を正しい名前に切り替えます
          cf rename app-name-dark app-name
    

### 手動による承認
{:.no_toc}

さらなるコントロールとバリデーションを行うには、以下のサンプル ワークフローに示すように、dark のステップと live のステップの間に手動の "hold" ステップを追加します。

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
    

### Orb のデプロイ例

CircleCI は、構成ワークフローを簡略化するために Cloud Foundry Orb を開発しました。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)には、Cloud Foundry で実行できるタスクのサンプルがいくつか含まれています。この中には、単一のジョブで Cloud Foundry アプリケーションをビルドしてデプロイする方法を示した以下のサンプルも含まれています。

    version: 2.1
    
    build_and_push:
        description: |
          単一ジョブでアプリケーションをビルドしてデプロイします
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
                      - run: # ビルド ステップ
                      - run: # さらに追加できます
                    manifest: # manifest.yml ファイルへのパス
                    package: # アプリケーション パッケージへのパス
    

構成ワークフローで使用できるさまざまな Cloud Foundry Orb のサンプルについては、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の [Cloud Foundry Orb のページ](https://circleci.com/developer/ja/orbs/orb/circleci/cloudfoundry)で詳細を確認できます。

## Firebase

CircleCI で firebase-tools をグローバルにインストールすることはできません。このため、firebase-tools はプロジェクトの devDependencies に追加します。

    npm install --save-dev firebase-tools
    

以下のコマンドを使用して、Firebase CLI トークンを生成します。

    firebase login:ci
    

生成されたトークンを CircleCI プロジェクトの環境変数に $FIREBASE_DEPLOY_TOKEN として追加します。

以下の行をプロジェクトの `config.yml` ファイルに追加します。

    <br />     deploy-job:
           docker:
    
             - image: my-image-version-tag
           working_directory: /tmp/my-project
           steps:
             - run:
                 name: Firebase への master のデプロイ
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
    
    

Firebase で Google Cloud Functions を使用する場合は、以下の行を `config.yml` に追加し、Google Cloud Functions が保存されているフォルダー (この場合は 'functions') に移動して、npm インストールを実行するように CircleCI に指示します。

       - run: cd functions && npm install
    

### Firebase Orb のサンプル

Firebase の構成ワークフローを簡略化するには、必要な構成が含まれた事前構成済みパッケージ (「Orb」と呼ばれます) を使用して、アプリケーションを Firebase にデプロイします。 以下は、Firebase Orb の一例です。

    version: 2.1
    description: Firebase デプロイ用の Orb
    commands:
      deploy:
        description: Firebase へのデプロイ
        parameters:
          token:
            type: string
            description: Firebase デプロイ トークン
        steps:
          - run:
              name: Firebase ツールのインストール
              command: npm install --prefix=./firebase-deploy firebase-tools
          - run:
              name: Firebase へのデプロイ
              command: ./firebase-deploy/node_modules/.bin/firebase deploy --token=<< parameters.token >>
    

Firebase Orb を使用してアプリケーションをデプロイする方法については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の [Firebase Orb のデプロイ](https://circleci.com/developer/ja/orbs/orb/cloudliner/firebase-deploy)に関するページを参照してください。

## Google Cloud

Google Cloud Platform にデプロイする前に、Google Cloud SDK を承認して、デフォルトの構成設定を行う必要があります。 詳細については、「[Google Cloud SDK の承認]({{ site.baseurl }}/ja/2.0/google-auth/)」を参照してください。

以下の例では、`build-job` が終了し、現在のブランチが master ブランチである場合に、`deploy.sh` が実行され、実際のデプロイ処理が行われます。

    <br />     deploy-job:
           docker:
    
             - image: my-image-version-tag
           working_directory: /tmp/my-project  
           steps:
             - run:
                 name: GKE への master のデプロイ
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
    
    

デプロイ スクリプトを実行すると、新しく作成された Docker イメージがレジストリにプッシュされ、K8s デプロイが更新されます。これにより、`gcloud` コマンドでは新しいイメージが使用されて、承認の処理とイメージのプッシュが一度に実行されます。

    sudo /opt/google-cloud-sdk/bin/gcloud docker -- push us.gcr.io/${PROJECT_NAME}/hello
    

これで、新しいイメージが GCR で使用可能になり、GCP インフラストラクチャからアクセスできるようになります。 次に、権限を変更します。

    sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
    

最後に、`kubectl` の patch サブコマンドを使用して、コンテナで使用するイメージを指定する行を検索し、ビルドしたイメージのイメージ タグを置き換えます。 これで、K8s デプロイによって以前のコンテナがシャット ダウンされ、最新のコンテナの使用が開始されて、クラスタがアップグレードされます。

    kubectl patch deployment docker-hello-google -p '{"spec":{"template":{"spec":{"containers":[{"name":"docker-hello-google","image":"us.gcr.io/circle-ctl-test/hello:'"$CIRCLE_SHA1"'"}]}}}}'
    

`deploy.sh` ファイル全体は [GitHub](https://github.com/circleci/docker-hello-google/blob/master/deploy.sh) で確認できます。 また、CircleCI 2.0 Google Cloud デプロイ サンプル プロジェクトは[こちら](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app)で確認できます。

### Google Cloud Orb のサンプル

CircleCI Orb (ジョブ、コマンド、Executor を含む構成パッケージ) を使用して構成ワークフローを簡略化するには、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)で提供されている Google Cloud 向けの Orb のサンプルを参照してください。この中には、以下のサンプルも含まれています。

          version: 2.1
          orbs:
            gcp-cli: circleci/gcp-cli@1.0.0
          workflows:
            install_and_configure_cli:
              # 使用する Executor を決定 (オプション)
              executor: default
              jobs:
                - gcp-cli/install_and_initialize_cli:
                    context: myContext # コンテキストまたはプロジェクトレベルの環境変数を介して gCloud サービス キーを保存します
                    google-project-id: myGoogleProjectId
                    google-compute-zone: myGoogleComputeZone
    

この Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の [CircleCI Google Cloud Orb](https://circleci.com/developer/ja/orbs/orb/circleci/gcp-cli) に関するページを参照してください。

## Heroku

[Heroku](https://jp.heroku.com/) は、クラウドでアプリケーションをホスティングするための一般的なプラットフォームです。 アプリケーションを Heroku にデプロイするように CircleCI を構成するには、以下の手順を行います。

1. Heroku アカウントを作成し、[Heroku の Web ページ](https://devcenter.heroku.com/start)に記載された手順に従って、選択した言語でプロジェクトをセットアップします。

2. Heroku アプリケーションの名前と Heroku API キーを環境変数として追加します。 手順については、「[プロジェクトでの環境変数の設定]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)」を参照してください。 以下の例では、これらの変数はそれぞれ `HEROKU_APP_NAME` および `HEROKU_API_KEY` として定義されています。

3. `.circleci/config.yml` で、`deploy` ジョブを作成し、Executor タイプを追加します。

手順については、[Executor タイプに関するドキュメント]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

5. コードをチェック アウトし、git を使用して master ブランチを Heroku にデプロイするコマンドを追加します。

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
          name: Heroku への master のデプロイ
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

**メモ:** Heroku では、デプロイまたは自動デプロイで、デプロイの前に渡す CI を待機するオプションが提供されます。 詳細については、[Heroku のドキュメント](https://devcenter.heroku.com/articles/github-integration#automatic-deploys)を参照してください。

### Heroku Orb のサンプル

Heroku をデプロイする場合や、Heroku ワークフローをカスタマイズする場合などに、Heroku 構成ワークフローを簡略化するには、以下のような Heroku Orb を使用します。

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
    executor: heroku/default # 標準の buildpack-deps イメージを使用します。このイメージは、Heroku の CLI をインストールする際に前提条件を提示します。
    steps:
      - checkout
      - heroku/install # 必要に応じて heroku インストール コマンドを実行します。
      - heroku/deploy-via-git: # git プッシュを使用して Heroku にブランチをデプロイします。
          only-branch: master # only-branch を指定した場合、他のブランチでデプロイは行われません。
```

これらの Heroku Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の [CircleCI Heroku Orb のページ](https://circleci.com/developer/ja/orbs/orb/circleci/heroku)を参照してください。

## NPM

パッケージを npm レジストリにパブリッシュするように CircleCI をセットアップすると、プロジェクトのコラボレーターは、一貫性のある予測可能な方法で新しいパッケージのバージョンを簡単にリリースできるようになります。

1. パッケージのパブリッシュに使用するアカウント用に npm authToken を取得します。

そのためには、まず npm にログインします (`npm login`)。 これで、authToken が `~/.npmrc` ファイルに保存されます。 以下の行を探します。

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    この場合、authToken は `00000000-0000-0000-0000-000000000000` です。
    

2. [プロジェクト設定]({{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git)に移動して、取得した authToken に `NPM_TOKEN` 変数を設定します。

3. authToken を `~/.npmrc` に追加するように CircleCI を構成し、バージョンが指定されたタグにのみ `npm publish` を実行します。

```yaml
version: 2
jobs:
  publish:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run:
          name: NPM へのパブリッシュ
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

    これで、`package.json` ファイルが更新され、タグ付きの Git コミットが作成されます。 次に、タグ付きのコミットをプッシュします。
    

    ```
    git push --follow-tags
    ```

5. テストが完了すると、パッケージが npm に自動的にパブリッシュされます。

## SSH

SSH を介してアプリケーションをデプロイするように CircleCI を構成するには、以下の手順を行います。

1. デプロイ先のサーバー用の SSH キーを追加します。 手順については、「[CircleCI に SSH キーを登録する]({{ site.baseurl }}/ja/2.0/add-ssh-key/)」を参照してください。

2. ビルド VM の SSH ユーザー名と SSH ホスト名を環境変数として追加します。 手順については、「[プロジェクトでの環境変数の設定]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)」を参照してください。 以下の例では、これらの変数はそれぞれ `SSH_USER` および `SSH_HOST` として定義されています。

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
          name: SSH 経由のデプロイ
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
