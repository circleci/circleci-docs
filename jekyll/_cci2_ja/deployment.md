---
layout: classic-docs
title: "Deployment"
short-title: "Deployment"
---

CircleCI は、ほぼすべてのサービスに[デプロイ]({{ site.baseurl }}/ja/2.0/deployment-integrations/)するように設定できます。

## Amazon Web Services

        steps:
          - run:
              name: awscli をインストール
              command: sudo pip install awscli
          - run:
              name: S3 にデプロイ
              command: aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete
    

## Pivotal

        steps:
          - run:
              name: CF CLI をセットアップ
              command: |
                curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
                sudo dpkg -i cf-cli_amd64.deb
                cf -v
                cf api https://api.run.pivotal.io  # または、プライベート Cloud Foundry デプロイをターゲットにします
                cf auth "$CF_USER" "$CF_PASSWORD"
                cf target -o "$CF_ORG" -s "$CF_SPACE"
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
    

## Google

        steps:
          - run:
              name: Master を Firebase にデプロイ
              command: ./node_modules/.bin/firebase deploy --token=$FIREBASE_DEPLOY_TOKEN
    

## Heroku

        steps:
          - checkout
          - run:
              name: Master を Heroku にデプロイ
              command: |
                git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
    

## NPM

        steps:
          - checkout
          - run: echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
          - run: npm publish
    

## SSH

        steps:
          - run:
              name: SSH を介してデプロイ
              command: |
                ssh $SSH_USER@$SSH_HOST "<remote deploy command>"
    

## Snapcraft

        steps:
          - run:
              name: "ストアにパブリッシュ"
              command: |
                mkdir .snapcraft
                echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
                snapcraft push *.snap --release stable
    

## Artifactory

        steps:
          - run:
              name: Artifactory にプッシュ
              command: |
                ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
                ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
                ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # エージェント上のすべての環境変数を収集します
                ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # artifactory 内のビルドに ^^ を付加します
    

これらの例を使用して、目的のターゲットに対してグリーンビルドを自動的にデプロイしてみましょう。