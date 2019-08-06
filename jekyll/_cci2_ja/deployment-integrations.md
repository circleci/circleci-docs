---
layout: classic-docs
title: "Configuring Deploys"
short-title: "Configuring Deploys"
---

CircleCI は、ほぼすべてのサービスにデプロイできるように設定できます。 ここでは、以下のプラットフォームでのデプロイ方法とその例を示しています。

- 目次
{:toc}

## 概要
{:.no_toc}

アプリケーションをデプロイするには、[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#ジョブの概要)を `.circleci/config.yml` ファイルに追加します。 また、[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#setting-an-environment-variable-in-a-project)と [SSH 鍵]({{ site.baseurl }}/ja/2.0/add-ssh-key/)を追加する必要があります。

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
      - run: bundle install --path vendor/bundle  # 依存関係のインストール
      - run: bundle exec rake db:create db:schema:load  # データベースのセットアップ
      - run:
          name: テストを実行
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
          name: Master を Heroku にデプロイ
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
  # 簡潔にするために、ビルドジョブは省略しています
  deploy:
    docker:
      - image: circleci/python:2.7-jessie
    working_directory: ~/circleci-docs
    steps:
      - run:
          name: awscli をインストール
          command: sudo pip install awscli
      - run:
          name: S3 にデプロイ
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
      aws-s3: circleci/aws-s3@1.0.0
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
              arguments: '--dryrun’


AWS S3 Orb の詳細については、[CircleCI AWS S3 Orb リファレンス](https://circleci.com/orbs/registry/orb/circleci/aws-s3)ページを参照してください。

#### AWS ECR と AWS ECS の Orb のサンプル

##### AWS ECR

この Orb では、AWS にログインしてビルドし、イメージを Amazon ECS にプッシュできます。

    orbs:
      aws-ecr: circleci/aws-ecr@1.0.0
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


AWS ECS と AWS ECR の Orbs の詳細については、以下の Orb レジストリページを参照してください。 - [AWS ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr) - [AWS ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs)

## Azure

Azure にデプロイするには、上記の例と同様のジョブで適切なコマンドを使用します。 リポジトリにプッシュする必要がある場合は、「[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)」の GitHub または Bitbucket への読み取り/書き込みデプロイキーの追加に関するセクションで手順を確認してください。 次に、production ブランチを使用するように Azure Web App を設定します。

## Capistrano

```yaml
version: 2
jobs:
  #  ビルドジョブとテストジョブ
  deploy-job:
    docker:
      - image: image pinned to a version and tag
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: バンドルインストール
          command: bundle check || bundle install
      - run:
          name: テストが完了し、ブランチが Master である場合は AWS にデプロイ
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
        name: CF CLI をセットアップ
        command: |
          curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
          sudo dpkg -i cf-cli_amd64.deb
          cf -v
          cf api https://api.run.pivotal.io  # または、プライベート Cloud Foundry デプロイをターゲットにします
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

ここまで、前にプッシュした "app-name" は変更されていません。 最後に、本稼働 URL を dark アプリケーションにルーティングし、それまでのバージョンへのトラフィックを停止し、アプリケーションの名前を変更します。

    - run:
        name: live ドメインを最新に再ルーティングする
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

さらなるコントロールとバリデーションを行うには、以下のサンプルワークフローに示すように、dark のステップと live のステップの間に手動の "hold" ステップを追加します。

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

CircleCI は、設定ワークフローを簡略化するために Cloud Foundry Orb を開発しました。 [CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)には、Cloud Foundry で実行できる特定のタスクのサンプルがいくつか含まれています。この中には、単一のジョブで Cloud Foundry アプリケーションをビルドしてデプロイする方法を示した以下のサンプルも含まれています。

    version: 2.1

    build_and_push:
        description: |
          単一ジョブでアプリケーションをビルドしてデプロイします。
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
                      - run: # ビルドステップ
                      - run: # さらに追加できます
                    manifest: # manifest.yml ファイルへのパス
                    package: # アプリケーションパッケージへのパス


設定ワークフローで使用できるさまざまな Cloud Foundry Orb のサンプルについては、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)の [Cloud Foundry Orb](https://circleci.com/orbs/registry/orb/circleci/cloudfoundry) に関するページで詳細を確認できます。

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
                 name: Firebase に Master をデプロイ
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

Firebase の設定ワークフローを簡略化するには、必要な設定が含まれた事前設定済みパッケージ (「Orb」と呼ばれます) を使用して、アプリケーションを Firebase にデプロイします。 以下は、この Firebase Orb の例です。

    version: 2.1
    description: Firebase デプロイ用の Orb
    commands:
      deploy:
        description: Firebase にデプロイ
        parameters:
          token:
            type: string
            description: Firebase デプロイトークン
        steps:
          - run:
              name: Firebase ツールをインストール
              command: npm install --prefix=./firebase-deploy firebase-tools
          - run:
              name: Firebase にデプロイ
              command: ./firebase-deploy/node_modules/.bin/firebase deploy --token=<< parameters.token >>


Firebase Orb を使用してアプリケーションをデプロイする方法については、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)の [Firebase Orb のデプロイ](https://circleci.com/orbs/registry/orb/cloudliner/firebase-deploy)に関するページを参照してください。

## Google Cloud

Google Cloud Platform にデプロイする前に、Google Cloud SDK を承認して、デフォルトの構成設定を行う必要があります。 詳細については、「[Google Cloud SDK の承認]({{ site.baseurl }}/ja/2.0/google-auth/)」を参照してください。

以下の例では、`build-job` が終了し、現在のブランチが master ブランチである場合に、`deploy.sh` が実行され、実際のデプロイ処理が行われます。

    <br />     deploy-job:
           docker:
             - image: my-image-version-tag
           working_directory: /tmp/my-project
           steps:
             - run:
                 name: GKE に Master をデプロイ
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



デプロイスクリプトを実行すると、新しく作成された Docker イメージがレジストリにプッシュされ、K8s デプロイがアップデートされます。これにより、`gcloud` コマンドでは新しいイメージが使用されて、承認の処理とイメージのプッシュが一度に実行されます。

    sudo /opt/google-cloud-sdk/bin/gcloud docker -- push us.gcr.io/${PROJECT_NAME}/hello


これで、新しいイメージが GCR で使用可能になり、GCP インフラストラクチャからアクセスできるようになります。 次に、権限を変更します。

    sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube


最後に、`kubectl` の patch サブコマンドを使用して、コンテナで使用するイメージを指定する行を検索し、ビルドしたイメージのイメージタグを置き換えます。 これで、K8s デプロイによって以前のコンテナがシャットダウンされ、最新のコンテナの使用が開始されて、クラスタがアップグレードされます。

    kubectl patch deployment docker-hello-google -p '{"spec":{"template":{"spec":{"containers":[{"name":"docker-hello-google","image":"us.gcr.io/circle-ctl-test/hello:'"$CIRCLE_SHA1"'"}]}}}}'


`deploy.sh` ファイル全体は [GitHub](https://github.com/circleci/docker-hello-google/blob/master/deploy.sh) のページで確認できます。 また、CircleCI 2.0 Google Cloud デプロイサンプルプロジェクトは[こちら](https://github.com/CircleCI-Public/circleci-demo-k8s-gcp-hello-app)で確認できます。

### Google Cloud Orb のサンプル

CircleCI Orb (ジョブ、コマンド、Executors を含む設定パッケージ) を使用して設定ワークフローを簡略化するには、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)で提供されている Google Cloud 向けの Orb のサンプルを参照してください。この中には、以下のサンプルも含まれています。

          version: 2.1
          orbs:
            gcp-cli: circleci/gcp-cli@1.0.0
          workflows:
            install_and_configure_cli:
              # 使用する Executor を決定 (オプション)
              executor: default
              jobs:
                - gcp-cli/install_and_initialize_cli:
                    context: myContext # コンテキストまたはプロジェクトレベルの環境変数を介して gCloud サービスキーを保存します
                    google-project-id: myGoogleProjectId
                    google-compute-zone: myGoogleComputeZone


この Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)の [CircleCI Google Cloud Orb](https://circleci.com/orbs/registry/orb/circleci/gcp-cli) に関するページを参照してください。

## Heroku

[Heroku](https://jp.heroku.com/) は、クラウドでアプリケーションをホスティングするための一般的なプラットフォームです。 アプリケーションを Heroku にデプロイするように CircleCI を設定するには、以下の手順を行います。

1. Heroku アカウントを作成し、[Heroku の Web ページ](https://devcenter.heroku.com/start)に記載された手順に従って、選択した言語でプロジェクトを設定します。

2. Heroku アプリケーションの名前と Heroku API キーを環境変数として追加します。 手順については、「[プロジェクト内で環境変数を設定する]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)」を参照してください。 以下の例では、これらの変数はそれぞれ `HEROKU_APP_NAME` および `HEROKU_API_KEY` として定義されています。

3. `.circleci/config.yml` で、`deploy` ジョブを作成し、Executor タイプを追加します。

手順については、「[Executor タイプの選択]({{ site.baseurl }}/ja/2.0/executor-types/)」を参照してください。

1. コードをチェックアウトし、git を使用して master ブランチを Heroku にデプロイするコマンドを追加します。

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
          name: Master を Heroku にデプロイ
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

### Heroku Orb のサンプル

Heroku をデプロイする場合や、Heroku ワークフローをカスタマイズする場合などに、Heroku 設定ワークフローを簡略化するには、以下のような Heroku Orb を使用します。

#### Heroku のデプロイ

    version: 2.1
    orbs:
      heroku: circleci/heroku@1.0.0
    workflows:
      heroku_deploy:
        jobs:
          - heroku/deploy-via-git


#### Heroku ワークフローのカスタマイズ

    version: 2.1
    orbs:
      heroku: circleci/heroku@1.0.0
    workflows:
      heroku_deploy:
        jobs:
          - deploy
    jobs:
      deploy:
        executor: heroku/default
        steps:
          - checkout
          - heroku/install
          - heroku/deploy-via-git:
              only-branch: master


これらの Heroku Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)の [CircleCI Heroku Orb](https://circleci.com/orbs/registry/orb/circleci/heroku) に関するページを参照してください。

## NPM

パッケージを npm レジストリにパブリッシュするように CircleCI を設定すると、プロジェクトのコラボレーターは、一貫性のある予測可能な方法で新しいパッケージのバージョンを簡単にリリースできるようになります。

1. パッケージのパブリッシュに使用するアカウント用に npm authToken を取得します。

それには、npm にログインします (`npm login`)。 これで、authToken が `~/.npmrc` ファイルに保存されます。 次の行を探します。

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    この場合、authToken は `00000000-0000-0000-0000-000000000000` です。


1. [プロジェクト設定]({{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git)に移動して、取得した authToken に `NPM_TOKEN` 変数を設定します。

2. authToken を `~/.npmrc` に追加するように CircleCI を設定し、バージョンが指定されたタグにのみ `npm publish` を実行します。

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

1. 新しいバージョンを npm にパブリッシュするには、以下に示すように `npm version` を実行して新しいバージョンを作成します。

        npm version 10.0.1


    これで、`package.json` ファイルがアップデートされ、タグ付きの Git コミットが作成されます。 次に、タグ付きのコミットをプッシュします。

        git push --follow-tags


2. テストが完了すると、パッケージが npm に自動的にパブリッシュされます。

## SSH

SSH を介してアプリケーションをデプロイするように CircleCI を設定するには、以下の手順を行います。

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
          name: SSH を介してデプロイ
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
