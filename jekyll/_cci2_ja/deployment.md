---
layout: classic-docs
title: デプロイ
description: このドキュメントを参考に、CircleCI を、ほぼすべてのサービスにデプロイできるように構成できます。
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI は、ほぼすべてのサービスに[デプロイ]({{ site.baseurl }}/ja/deployment-integrations/)するように構成できます。


## Amazon Web Services
{: #amazon-web-services }

```yml
    steps:

      - run:
          name: awscli のインストール
          command: sudo pip install awscli

      - run:
          name: S3 へのデプロイ
          command: aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete
```

## Pivotal
{: #pivotal }

```yml
    steps:

      - run:
          name: CF CLI のセットアップ
          command: |
            curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
            sudo dpkg -i cf-cli_amd64.deb
            cf -v
            cf api https://api.run.pivotal.io  # または、プライベート Cloud Foundry デプロイをターゲットにします
            cf auth "$CF_USER" "$CF_PASSWORD"
            cf target -o "$CF_ORG" -s "$CF_SPACE"

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
```


## Google
{: #google }

```yml
    steps:

      - run:
          name: Firebase への master のデプロイ
          command: ./node_modules/.bin/firebase deploy --token=$FIREBASE_DEPLOY_TOKEN
```


## Heroku
{: #heroku }

```yml
    steps:

      - checkout
      - run:
          name: Heroku への master のデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```

## NPM
{: #npm }

```yml
    steps:

      - checkout
      - run: 
          name: NPM へのパブリッシュ
          command: | 
            npm set //registry.npmjs.org/:_authToken=$NPM_TOKEN
            npm publish
```

## SSH
{: #ssh }

```yml
    steps:

      - run:
          name: SSH 経由のデプロイ
          command: |
            ssh $SSH_USER@$SSH_HOST "<remote deploy command>"
```

## Snapcraft
{: #snapcraft }

```yml
    steps:

      - run:
          name: "ストアへのパブリッシュ"
          command: |
            mkdir .snapcraft
            echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
            snapcraft push *.snap --release stable
```

## Artifactory
{: #artifactory }

```yml
    steps:

      - run:
          name: Artifactory へのプッシュ
          command: |
            ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # エージェント上のすべての環境変数を収集します
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # Artifactory 内のビルドに ^^ を付加します
```

## NuGet (.NET Core CLI 経由)
{: #nuget-via-net-core-cli }

```yml
    steps:

      - run:
          name: NuGet へのプッシュ
          command: |
            dotnet pack --output <output-directory> --configuration Release
            dotnet nuget push --source "${NUGET_FEED_URL}" --api-key="${NUGET_KEY}" <output-directory>/*.nupkg
```

ここにご紹介した例を参考に、ターゲット環境に対する成功ビルドのデプロイを自動化してみましょう。
