---
layout: classic-docs
title: "Deployment"
short-title: "Deployment"
---

CircleCI can be configured to [deploy](  {{ site.baseurl }}/2.0/deployment-integrations/) to virtually any service.


## Amazon Web Services 

```
    steps:
      - run:
          name: Install awscli
          command: sudo pip install awscli
      - run:
          name: Deploy to S3
          command: aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete
```

## Pivotal

```
    steps:
      - run:
          name: Setup CF CLI
          command: |
            curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
            sudo dpkg -i cf-cli_amd64.deb
            cf -v
            cf api https://api.run.pivotal.io  # alternately target your private Cloud Foundry deployment
            cf auth "$CF_USER" "$CF_PASSWORD"
            cf target -o "$CF_ORG" -s "$CF_SPACE"
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


## Google

```
    steps:
      - run:
          name: Deploy Master to Firebase
          command: ./node_modules/.bin/firebase deploy --token=$FIREBASE_DEPLOY_TOKEN
```


## Heroku 

```    
    steps:
      - checkout
      - run:
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
```            

## NPM

```
    steps:
      - checkout
      - run: 
          name: Publish to NPM
          command: | 
            npm set //registry.npmjs.org/:_authToken=$NPM_TOKEN
            npm publish
```

## SSH

```
    steps:
      - run:
          name: Deploy Over SSH
          command: |
            ssh $SSH_USER@$SSH_HOST "<remote deploy command>"
```            

## Snapcraft

```
    steps:
      - run:
          name: "Publish to Store"
          command: |
            mkdir .snapcraft
            echo $SNAPCRAFT_LOGIN_FILE | base64 --decode --ignore-garbage > .snapcraft/snapcraft.cfg
            snapcraft push *.snap --release stable
```            

## Artifactory

```
    steps:
      - run:
          name: Push to Artifactory
          command: |
            ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY --interactive=false
            ./jfrog rt u <path/to/artifact> <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM
            ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM  # collects all environment variables on the agent
            ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM  # attaches ^^ to the build in artifactory
```            

## NuGet (via .NET Core CLI)

```
    steps:
      - run:
          name: Push to NuGet
          command: |
            dotnet pack --output <output-directory> --configuration Release
            dotnet nuget push --source "${NUGET_FEED_URL}" --api-key="${NUGET_KEY}" <output-directory>/*.nupkg
```

Use the above examples to get started with automating deployment of green builds to your desired targets.

