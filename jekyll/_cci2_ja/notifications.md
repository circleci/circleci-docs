---
layout: classic-docs
title: "通知の使用"
short-title: "通知の使用"
order: 100
published: true
version:
  - Cloud
---

* 目次
{:toc}


CircleCI にチャット通知、自動メール通知、および Web 通知機能が統合されました。 Slack 通知とメール通知は、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)の成功時および失敗時に送信されます。 IRC 通知は、ジョブごとに送信されます。 以下に、最小限の CircleCI 設定ファイルの例を示します。


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test: # < ワークフローに関して Slack 通知とメール通知が送信されます
    jobs:
    # IRC インテグレーションによってジョブごとの通知が送信されます
      - build
      - test
      - build
      - test
      - build
      - test
      - build
      - test
```

続いて、各通知タイプ (チャット、メール、Web) の設定方法について説明していきます。

## チャット通知の有効化
{: #set-or-change-email-notifications }

Use the [Notifications](https://app.circleci.com/settings/user/notifications){:rel="nofollow"} page of the CircleCI application to set or change your default email address for notifications, to turn off email notifications, or get a notification email for every build.

Slack 通知の例を以下に示します。

![]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## メール通知の設定と変更
CircleCI アプリケーションの [[Notifications (通知)](https://circleci.com/account/notifications){:rel="nofollow"}] ページで、デフォルトの通知先メールアドレスの設定と変更、メール通知の停止、ビルドごとのメール通知の有効化などを行えます。

メール通知の例を以下に示します。

1. [CircleCI のユーザー設定](https://circleci.com/account/notifications){:rel="nofollow"}に移動します。 下図のとおり、[Web Notifications (Web 通知)] セクションの下部に権限をオンにするためのリンクがあります。

2. Your browser will ask you to confirm that you want to allow notifications. Click `Allow`. See the screenshot below for additional details:

![]({{ site.baseurl }}/assets/img/docs/notifications-enable-web.png)

過去に CircleCI からの Web 通知送信を拒否している場合、CircleCI は通知送信の権限を要求できないため、ブラウザー上で権限をオンにする必要があります。 通知を制御するには、ブラウザーの設定を使用してください。 Google Chrome を使用している場合は、下図のとおり、URL バーのロック アイコンをクリックし、[Permissions Settings (権限の設定)] から [Notifications (通知)] を選択すると、通知を制御できます。

While the process is similar for other browsers, please refer to their individual documentation for handling web notifications.

## Web 通知の有効化
他のブラウザーでも手順は同様ですが、Web 通知の処理については各ブラウザーのドキュメントを参照してください。

Orb を使用すれば、さまざまな種類の通知を構成に統合できます。 現在、CircleCI からは Slack Orb と IRC Orb が提供されており、サードパーティ製の Orb もいくつか存在します。 [Orb レジストリ](https://circleci.com/developer/ja/orbs?query=notification&filterBy=all)で *notifications* を検索して、現在使用できる Orb をご確認ください。

### 前提条件
{: #prerequisites }

Orb を構成に統合する前に、以下の 2 つの手順を実行する必要があります。

1. Increment the `version` key in your config to `2.1` and;
2. {% include snippets/enable-pipelines.md %}

### Slack Orb の使用
{: #using-the-slack-orb }

[CircleCI Slack Orb](https://circleci.com/developer/ja/orbs/orb/circleci/slack) を使用すると、Slack 通知を設定ファイルから直接統合し、カスタマイズできます。 以下に、Slack チャンネルにカスタム メッセージの通知を送信する設定ファイルの例を示します。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook
orbs:
  slack: circleci/slack@x.y.z
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

Slack Orb を使用すれば、Slack チャンネルに承認待ちを通知したり、ジョブ終了時に成功または失敗のステータス アラートを送信したり、他の種類の通知も設定できます。 こうした使用例については、[CircleCI の Slack Orb のページ](https://circleci.com/developer/ja/orbs/orb/circleci/slack)を参照してください。

### IRC Orb の使用
{: #using-the-irc-orb }

[IRC Orb](https://circleci.com/developer/ja/orbs/orb/circleci/irc) は Slack Orb に似ていますが、CircleCI からカスタムの IRC 通知を送信することだけが主な機能です。 以下の設定ファイルの例を参照してください。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - irc/notify:
          server: 'IRC-server-to-connect-to' # デフォルト: IRC_SERVER 環境変数
          port: '6667' # デフォルト: 6667 (空白の場合)
          channel: 'ポスト先の IRC サーバー' # 必須パラメーター
          nick: 'IRC のニックネーム' # デフォルト: `circleci-bot`
          message: webhook # デフォルト: 「CircleCI ジョブが完了しました。
          port: '6667' # デフォルト: 6667 (空白の場合)
          channel: 'the irc server to post in' # required parameter
          nick: 'Your IRC nick name' # default: `circleci-bot`
          message: webhook # default: "Your CircleCI Job has completed."
          port: '6667' # default: 6667 if left blank.
          」
orbs:
  slack: circleci/irc@x.y.z
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

## Orb を使用した通知
{: #third-party-tools }

### Chroma feedback
{: #chroma-feedback }

[Chroma Feedback](https://github.com/redaxmedia/chroma-feedback) is a command line tool in Python to turn your RGB powered hardware into an build indicator. The idea of such extreme visibility is to encourage developers to instantly repair their builds.
