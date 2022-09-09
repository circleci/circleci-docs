---
layout: classic-docs
title: "トリガー"
short-title: "トリガー"
description: "トリガーの説明"
categories:
  - builds
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---


ビルドのトリガーとスケジュールについて、役立つヒントをご紹介します。以下のスニペットを参照してください。

## ビルドのスキップ
{: #skip-builds }

CircleCI のデフォルトでは、ユーザーが変更をバージョン管理システム (VCS) にプッシュするたびに、自動的にプロジェクトがビルドされます。 この動作は、[ci skip] または [skip ci] タグをコミットのタイトルまたは説明の任意の場所に追加することで、オーバーライドできます。


## curl および API トークンを使用したジョブのトリガー
{: #trigger-a-job-using-curl-and-your-api-token }

```shell
curl -u ${CIRCLE_API_USER_TOKEN}: \
     -d 'build_parameters[CIRCLE_JOB]=deploy_docker' \
     https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

## ビルドのスケジュール実行
{: #scheduled-builds }

```yml
workflows:
  version: 2
  commit:
    jobs:
      - test
      - deploy
  nightly:
    triggers: # triggers キーを使用して、スケジュールされたビルドであることを示します
      - schedule:
          cron: "0 0 * * *" # cron 構文を使用してスケジュールを設定します
          filters:
            branches:
              only:
                - master
                - beta
    jobs:
      - coverage
```

## 手動による承認
{: #manual-approval }

```yml
workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - hold:
          type: approval # 続行するには、適切なプロジェクト メンバーがアプリ内のボタンをクリックする必要があります
          requires:
           - test2
      - deploy:
          requires:
            - hold
```

## DockerHub にある Docker ビルドのトリガー
{: #trigger-docker-builds-in-dockerhub }

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/node:16.13.1-browsers # < an arbitrarily chosen docker image.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          # example curl request from dockerhub documentation
          name: Trigger docker remotely
          command: curl --data build=true -X POST https://registry.hub.docker.com/u/svendowideit/testhook/trigger/be579c82-7c0e-11e4-81c4-0242ac110020/
```

## 関連項目
{: #see-also }

[ワークフロー]({{ site.baseurl }}/ja/workflows/)
