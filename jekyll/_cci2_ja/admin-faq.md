---
layout: classic-docs
title: FAQ (サーバー管理者編)
category: [administration]
order: 3
description: "CircleCI サーバー管理者向けの FAQ"
published: true
---

* 目次
{:toc}

#### ビルドコンテナの現在の状況を監視することはできますか？

可能です。詳しくは [Nomad クラスタの運用方法]({{site.baseurl}}/ja/2.0/nomad/)を参照してください。 また、AWS で稼働している場合のコンテナの監視方法については、[サーバー設定、モニタリング、ログ監視]({{site.baseurl}}/ja/2.0/monitoring/) のページをお読みください。

#### 管理者ユーザーの追加方法を教えてください。

CircleCI に登録した最初のユーザーが自動的に管理者として設定されます。 管理者ユーザーの追加は、管理者向け設定画面の Users ページ (`https://[domain-to-your-installation]/admin/users`) で行えます。

#### パスフレーズやプライベート IP アドレスを紛失してしまったときは？

SSH で Service マシンにアクセスし、下記の通りコマンドを実行してください。

```
$ # パスフレーズの取得
$ circleci get-secret-token
CIRCLE_SECRET_PASSPHRASE=xxxxxxxxxxxxxxxxxxxx
$
$ # プライベートIPアドレスの取得
$ ifconfig eth0 | grep "inet addr"
          inet addr:10.0.0.235  Bcast:10.0.0.255  Mask:255.255.255.0
```

#### パスフレーズの変更方法を教えてください。

1. 管理コンソール (8800 番ポート) の設定ページ上でパスフレーズを変更します。

2. CircleCI を再起動します。

3. Nomad クライアントにビルダーボックスを登録するための `init` スクリプトで、その中にある `CIRCLE_SECRET_PASSPHRASE` を書き換えます。

これで、クラスターに参加したした新しい Nomad クライアントが変更後のパスフレーズを使うようになります。 古いパスフレーズを使っている既存の Nomad クライアントもこれまで通り動作します。 ただし、すべてのクライアントで同じパスフレーズを使うよう、そうした Nomad クライアント もできるだけ早めに再起動した方が良いでしょう。

#### Nomad クライアント を安全にシャットダウンさせるには？

[Nomad クラスタの運用方法]({{site.baseurl}}/ja/2.0/nomad/)をお読みください。

#### CircleCI では iOS/macOS アプリケーションのビルドは可能ですか？

iOS アプリのビルドは対応済みですが、macOS アプリケーションのビルドは今後対応予定です。新機能のアーリーアクセスにご興味をお持ちでしたら担当営業までお問い合わせください。

#### GitHub の認証テストに失敗してしまいます。

GitHub Enterprise サーバーが SSL の中間証明書を返さないことが原因の可能性にあります。 <https://www.ssllabs.com/ssltest/analyze.html> で、GitHub Enterprise のインスタンスを確認してみてください。取得不可能な中間証明書の情報などが調べられます。 もしくはサーバーの完全な証明書チェーンを取得できる <https://whatsmychaincert.com/> などのツールを使ってみてください。

#### CircleCI を HTTPS で運用できますか？

CircleCI は起動時に自己署名証明書を生成しますが、これは管理コンソールに対してのみ使われ、CircleCI アプリケーション自体に使われるものではありません。 CircleCI を HTTPS で運用したい場合は、管理コンソールの `SETTINGS` にある `Privacy` セクションで証明書を指定してください。

#### リソースごとに terraform destroy しないのはなぜですか？

CircleCI のサービスボックスでは、AWS のインスタンス削除保護機能 (termination protection) を有効にしたうえで、 AWS S3 Bucket を使ってデータを書き込んでいます。 リソースごとに terraform destroy したい場合は、手動でそのインスタンスを削除するか、circleci.tf ファイル内でインスタンス削除保護 (termination protection) をオフに設定してください。 さらに、terraform install によって生成された AWS S3 Bucket を空にする必要もあります。

#### ビルド時に何らかのデータが保持されるようなことはありますか？

どんなデータも残らないよう破棄されますのでご安心ください。

#### TLS の設定に失敗しているみたいなのですが、どこを確認すればよいですか。

鍵が暗号化されていない PEM 形式であることと、その証明書のチェーン全体が間違いなく下記のようになっていることを確認してください。

```
-----BEGIN CERTIFICATE-----
サーバーのドメイン名.crt
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
中間証明書 1
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
中間証明書 2
-----END CERTIFICATE-----
...
```

#### 管理コンソール上 (Replicated) でのデバッグ方法が知りたい。

Replicated 使用時にトラブルが発生したとき、問題を検証するにはいくつかの方法があります。

- 最新の Replicated がインストールされていることを確認する

まずは最新の Replicated が間違いなくインストールされていることを以下のコマンドで確かめてください。

```
replicated -version
```

- Replicated と CircleCI を再起動する

次に Replicated サービスを再起動します。サービスボックスで下記の通りコマンドを実行してください。

```
sudo restart replicated-ui
sudo restart replicated
sudo restart replicated-agent
```

その後、管理コンソール (https://CircleCI サーバーアドレス:8800) にアクセスし、「Stop Now」の後に「Start Now」を実行して CircleCI を再起動してください。

- Replicated へのログインを試す

Replicated にログインできるか確認してみてください。 サービスボックスで下記のコマンドを実行するとログインできます。 コマンド実行後に要求されるパスワードは、管理コンソール (https://CircleCI サーバーアドレス:8800) と同じものになります。

```
replicated login
```

ログイン後、下記コマンドを実行して出力される内容を確認してください。

```
sudo replicated apps
```

`Error: request returned Unauthorized for API route`.. というエラーが表示される場合は Replicated に正しくログインできていません。ログイン成功後にエラーにならないことを確認してください。

- Replicated のログをチェックする

Replicated のログデータは `/var/log/replicated` 配下にあります。

- docker ps コマンドの実行結果をチェックする

Replicated 実行時には、CircleCI Enterprise を動作させるため多数の Docker コンテナを起動します。docker ps コマンドの結果は、どんなコンテナが実行されているのかを確かめるのに役立ちます。

コマンドの出力内容は例えば下記のようになります。

```
$ sudo docker ps
CONTAINER ID        IMAGE                                                    COMMAND                  CREATED             STATUS              PORTS                                                              NAMES
03fb873adf26        <service-box-ip>:9874/circleci-frontend:0.1.149242-d650d3c   "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:4434->4434/tcp   e53e4f74259a6ec0a268d8c984ac6277
113b9ea03b46        <service-box-ip>:9874/circleci-slanger:0.4                   "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:4567->4567/tcp, 0.0.0.0:8081->8080/tcp                     d262cc492bd5d692d467f74d8cc39748
0a66adfbc2f0        <service-box-ip>:9874/postgres:9.4.6                         "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:5432->5432/tcp                                             423e0e6c4099fa99cd89c58a74355ffe
1c72cbef1090        <service-box-ip>:9874/circleci-exim:0.2                      "/docker-entrypoint.s"   3 days ago          Up 3 days           0.0.0.0:2525->25/tcp                                               94de52d61d464b7543f36817c627fe56
df944bb558ed        <service-box-ip>:9874/mongo:2.6.11                           "/entrypoint.sh mongo"   3 days ago          Up 3 days           0.0.0.0:27017->27017/tcp                                           04a57db9f97a250c99dfdbeec07c3715
66be98cd54fe        <service-box-ip>:9874/redis:2.8.23                           "/entrypoint.sh redis"   3 days ago          Up 3 days           0.0.0.0:6379->6379/tcp                                             e2ce5e702c4114648718d2d5840edc56
ac2faa662bbe        <service-box-ip>:9874/tutum-logrotate:latest                 "crond -f"               3 days ago          Up 3 days                                                                              34e4d4165947f14d185d225191ba4ce8
796013f64732        <service-box-ip>:9874/redis:2.8.23                           "/entrypoint.sh redis"   3 days ago          Up 3 days           0.0.0.0:32773->6379/tcp                                            dce3519e7aff9a365bd3b42ed3a6f77f
```

解決できないときは、サービスボックスで実行した `sudo docker ps` コマンドの内容を当社までお送りください。問題解決につながるかもしれません。

