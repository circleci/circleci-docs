---
layout: classic-docs
title: 通知の使用
description: Slack、IRC、メール、Web 通知によりCircleCI のジョブステータスを取得する方法を説明します。
order: 100
published: true
version:
  - クラウド
---

* 目次
{:toc}

CircleCI ではメール通知と Web 通知との連携が可能です。 IRC 通知と Slack 通知も Orb を使って設定することができます。 Slack 通知と Web 通知は、[ワークフロー]({{ site.baseurl }}/ja/workflows/)の成功時および失敗時に送信されます。 IRC 通知は、ジョブごとに送信されます。 以下に、最小限の CircleCI 設定ファイルの例を示します。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/base:2021.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: cimg/base:2021.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2.1
  build_and_test: # < Slack and email notifications are sent for workflows
    jobs:
    # IRC notifications are sent for each job.
      - build
      - test
```

## メール通知の設定と変更
{: #set-or-change-email-notifications }

デフォルトのメールアドレスを設定または変更するには、CircleCI アプリケーションの [Notifications ](https://app.circleci.com/settings/user/notifications){:rel="nofollow"} のページを開きます。 ここでは環境設定もできます。

- **All builds in my projects**: プロジェクト内のすべてのビルドについて、成功したか失敗したかについてのメールを受け取ります。
- **My branches**: 変更をプッシュしたブランチでビルドが失敗した場合にメールを受け取ります。
- **None**: アカウントに関する運営上のメッセージ以外のメールは受け取りません。

![デフォルトのメールアドレスを変更し通知を選択する方法のスクリーショット]({{ site.baseurl }}/assets/img/docs/email-notifications.png)

複数の組織のメンバーである場合、組織ごとに異なるメールアドレスを指定することができます。

![メールアドレスを組織ごとに変更する方法のスクリーショット]({{ site.baseurl }}/assets/img/docs/project-notifications.png)

メール通知は以下のように表示されます。

![成功を通知するメールのサンプル]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![失敗を通知するメールのサンプル]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Web 通知の有効化
{: #enable-web-notifications }

以下の手順で、Web通知を有効にします。

1. [CircleCI のユーザー設定](https://circleci.com/account/notifications){:rel="nofollow"}に移動します。 ページ下部の [Web Notifications] トグルを有効にします。

2. 通知の許可を促すメッセージがブラウザーに表示されます。 **Allow** をクリックします。 詳細については下記のスクリーンショットをご覧ください。

![スクリーンショット: ブラウザで Web 通知を有効にする方法を示している]({{ site.baseurl }}/assets/img/docs/notifications-enable-web.png)

過去に CircleCI からの Web 通知送信を拒否している場合、ブラウザで手動で権限を有効にする必要があります。 Google Chrome を使用している場合は、URL バーのロックアイコンをクリックし、Notifications トグルを再び有効にします。

![Google Chrome で Web 通知を有効にする方法のスクリーンショット]({{ site.baseurl }}/assets/img/docs/enable-web-notifications.png)

他のブラウザーでも手順は同様ですが、Web 通知の処理については各ブラウザーのドキュメントを参照してください。

## Orb を使って通知を送信する
{: #notifications-with-orbs }

Orb を使って設定ファイルに通知を統合することができます。 CircleCI では、Slack Orb と IRC Orb を提供しています。 サードパーティーの Orb も複数ご利用いただけます。 [Orb レジストリ](https://circleci.com/developer/ja/orbs?query=notification&filterBy=all)でどのような Orb があるかご確認ください。

### Slack Orb の使用
{: #using-the-slack-orb }

[CircleCI Slack Orb](https://circleci.com/developer/ja/orbs/orb/circleci/slack) を使用すると、Slack 通知を `config.yml` ファイルから直接統合し、カスタマイズできます。 以下に、Slack チャンネルにカスタム メッセージの通知を送信する設定ファイルの例を示します。

```yaml
version: 2.1
orbs:
  slack: circleci/slack@4.9.3
jobs:
  notify:
    docker:
      - image: cimg/base:2021.04
        auth:
            username: mydockerhub-user
            password: $DOCKERHUB_PASSWORD
    steps:
      - slack/notify:
          custom: |
            {
              "blocks": [
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "plain_text",
                      "text": "*This is a text notification*",
                      "emoji": true
                    }
                  ]
                }
              ]
            }
          event: always
workflows:
  send-notification:
    jobs:
      - notify:
          context: slack-secrets
```

[Slack Orb の使用]({{ site.baseurl }}/ja/slack-orb-tutorial/)で、サンプルを使ったフルチュートリアルを参照してください。

CircleCI の Slack Orb は、承認待ちについての Slackチャネルへの通知など、様々な種類の通知にも使用できます。 こうした使用例については、[CircleCI の Slack Orb のページ](https://circleci.com/developer/ja/orbs/orb/circleci/slack)を参照してください。

### IRC Orb の使用
{: #using-the-irc-orb }

[IRC Orb](https://circleci.com/developer/ja/orbs/orb/circleci/irc) は Slack Orb に似ていますが、CircleCI からカスタムの IRC 通知を送信することだけが主な機能です。 以下の設定ファイルの例を参照してください。

```yaml
version: 2.1
orbs:
  irc: circleci/irc@0.2.0
jobs:
  build:
    docker:
      - image: <Docker image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - checkout
      - irc/notify:
          server: <IRC-server-to-connect-to> # default: IRC_SERVER environment varible.
          port: <6667> # default: 6667 if left blank.
          channel: <the IRC server to post in> # required parameter
          nick: <Your IRC nickname> # default: `circleci-bot`
          message: <Build complete!> # default: "Your CircleCI Job has completed."
workflows:
  your-workflow:
    jobs:
      - build

```
括弧内の値 (<>) をご自身の詳細情報に置き換えてください。

## 関連項目

- [Orb の概要]({{ site.baseurl }}/ja/orb-intro/)
- [Slack Orb の使用]({{ site.baseurl }}/ja/slack-orb-tutorial/)
