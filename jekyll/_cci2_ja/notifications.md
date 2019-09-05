---
layout: classic-docs
title: "通知の使用"
short-title: "通知の使用"
categories:
  - configuring-jobs
order: 100
published: true
---

CircleCI にチャット通知、自動メール通知、および Web 通知機能が統合されました。 Slack 通知とメール通知は、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)の成功時および失敗時に配信されます。 IRC 通知は、ジョブごとに配信されます。 CircleCI コンフィグの最小構成については、以下に示す例を参考にしてください。

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
  build_and_test: # < ワークフローに関して Slack 通知とメール通知が配信されます
    jobs:
    # IRC インテグレーションによってジョブごとの通知を受け取ります
      - build
      - test
```

各通知タイプ (チャット、メール、Web) の設定方法について、以下で説明します。

## チャット通知の有効化

CircleCI では、Slack 通知と IRC 通知がサポートされています。 チャット通知は、CircleCI アプリケーションの [Project Settings (プロジェクトの設定)] > [Chat Notifications (チャット通知)] ページで、各チャットアプリへのリンクを使用して、アプリ内の手順に従って設定します。プロジェクトの [Chatroom Integrations (チャットルームの統合)] ページにアクセスするには、まずメインサイドバーで [Settings (設定)] を選択し、次に [Organization (組織)] メニューで [Projects (プロジェクト)] を選択してから、プロジェクトに関連付けられている設定アイコンをクリックします。

![]({{ site.baseurl }}/assets/img/docs/notification-chat-v2.png)

Slack 通知の例を以下に示します。

![]({{ site.baseurl }}/assets/img/docs/notification-chat-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-chat-fail.png)

## メール通知の設定と変更

CircleCI アプリケーションの [[通知](https://circleci.com/account/notifications){:rel="nofollow"}] ページで、デフォルトの通知先メールアドレスの設定または変更、メール通知の停止、ビルドごとのメール通知などを設定できます。

メール通知の例を以下に示します。

![]({{ site.baseurl }}/assets/img/docs/notification-email-success.png)

![]({{ site.baseurl }}/assets/img/docs/notification-email-failure.png)

## Web 通知の有効化

1. [CircleCI のユーザー設定](https://circleci.com/account/notifications){:rel="nofollow"}に移動します。 以下のスクリーンショットのとおり、[Web Notifications (Web 通知)] セクションの下部に権限をオンにするためのリンクがあります。 ![]({{ site.baseurl }}/assets/img/docs/notification-default-message.png)

2. リンクをクリックして権限をオンにします。 CircleCI からの通知の許可を促すメッセージがブラウザーに表示されます。

3. 以下のスクリーンショットのとおり、[Allow (許可する)] をクリックします。![]({{ site.baseurl }}/assets/img/docs/notification-allowing.png)

4. 完了したビルドに関する通知を表示するラジオボタンを選択します。 **メモ：**ラジオボタンを選択する際、場合によってはページの再読み込みを行う必要があります。

過去に CircleCI からの Web 通知送信を拒否したことがある場合、CircleCI は通知送信の権限を要求できないため、ブラウザー上で権限をオンにする必要があります。 通知を制御するには、ブラウザーの設定を使用してください。 Google Chrome を使用している場合は、以下のアニメーションのとおり、URL バーのロックアイコンをクリックし、[Permissions Settings (権限の設定)] から [Notifications (通知)] を選択すると、通知を制御できます。 ![]({{ site.baseurl }}/assets/img/docs/notification-granting.gif)

他のブラウザーでも手順は同様ですが、Web 通知の処理については各ブラウザーのドキュメントを参照してください。