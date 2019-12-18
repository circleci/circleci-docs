---
layout: classic-docs
title: "証明書"
short-title: "証明書"
description: "CircleCI Server に証明書を準備する方法"
categories:
  - administration
order: 55
---

ここでは、以下のセクションに沿って、カスタムルート認証局を使用するためのスクリプトと、Elastic Load Balancing 証明書を使用するプロセスについて説明します。

* 目次
{:toc}


## カスタムルート CA の使用

このセクションでは、カスタムルート認証局 (CA) の使用方法を説明します。

インストール環境によっては、サーバー間の暗号化と信頼の確立のために内部ルート CA を使用します。 ルート証明書を使用する場合は、CircleCI GitHub Enterprise インスタンスでその証明書をインポートし、信頼できる証明書としてマークする必要があります。 CircleCI は、GitHub や Webhook の API 呼び出しで通信するとき、その信頼に従います。

CA 証明書は、Java キーストアとして解釈される形式で記述され、チェーン全体を含む必要があります。

以下のスクリプトは、必要な手順を示しています。

    GHE_DOMAIN=github.example.com

    # GitHub Enterprise デプロイから CA チェーンを取得します。
    openssl s_client -connect ${GHE_DOMAIN}:443 -showcerts < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /usr/local/share/ca-certificates/ghe.crt


次に、ポート 8800 のシステムコンソールに移動し、アップグレードされたプロトコルに変更します。 プロトコルを「HTTPS (TLS/SSLEnabled)」設定に変更し、サービスを再起動することができます。 「GitHub 認証のテスト」を試行すると、今回は x509 関連のエラーではなく、成功が返されます。

## ELB 証明書の準備

CircleCI では、プライマリ証明書として機能する Elastic Load Balancing (ELB) 証明書を取得するために、 以下の手順を実行する必要があります。 以降のセクションで説明するように、ELB と CircleCI Server の証明書が必要です。

**メモ：**HTTP リクエストのポートを開くと、CircleCI は HTTPS リダイレクトを返すことができます。

1. ELB で以下のポートを開きます。

|ロードバランサープロトコル | ロードバランサーポート | インスタンスプロトコル | インスタンスポート | 暗号化 | SSL 証明書|
|----------|----------|----------|----------|----------|----------|
| HTTP | 80 | HTTP | 80 | N/A | N/A |
| SSL| 443 | SSL | 443 | Change | ユーザー証明書 SSL | 3000 |
| SSL | 3000 | Change | ユーザー証明書 HTTPS | 8800 |
| HTTPS | 8800| Change | ユーザー証明書 SSL | 8081 |
| SSL | 8081 | Change | ユーザー証明書
| SSL|8082| SSL| 8082 | Change | ユーザー証明書 |
{: class="table table-striped"}

1. ELB に以下のセキュリティグループを追加します。

**メモ：**以下のソースは、だれもがこのポート範囲でインスタンスにアクセスできるオープン状態となります。 不都合が生じる場合は、自由に制約を加えてください。 ソース範囲外の IP アドレスを使用しているユーザーは、機能が限定されることになります。

| タイプ | プロトコル | ポート範囲 | ソース |
|----------|----------|----------|----------|
|SSH | TCP | 22 | 0.0.0.0 |
|HTTPS | TCP | 443 | 0.0.0.0 |
|カスタム TCP ルール | TCP | 8800 | 0.0.0.0 |
|カスタム TCP ルール | TCP | 64535-65535 | 0.0.0.0 |
{: class="table table-striped"}

1. 次に、CircleCI の管理コンソールで、`Privacy` セクションに有効な証明書とキーファイルをアップロードします。 実際の証明書管理は ELB で実行されるため、これには外部的な署名も、現在の証明書も不要です。 ただし、CircleCI で HTTPS リクエストを使用するには、管理者コンソールで設定されたホスト名と「Common Name (FQDN)」が一致する証明書およびキーが必要です。

2. これで、[GitHub Authorization Callback (GitHub 承認コールバック)] に `http` ではなく `https` を設定できます。

## CircleCI Server での TLS/HTTPS の設定

有効な SSL 証明書とキーファイルの生成には、各種のソリューションを使用できます。 そのうちの 2つについて説明します。

### Certbot の使用

このセクションでは、Certbot を使用して、Services マシンに DNS レコードセットを手動で追加することで、Server に TLS/HTTPS を設定する方法を説明します。 Certbot は通常、ポート 80 または 443 を通した DNS レコードの検証に依存していますが、ポートの衝突のため、これは 2.2.0 時点の CircleCI Server ではサポートされていません。

1. Replicated コンソール (hostname:8800) 内から Service を停止します。

2. Services マシンに SSH を行います。

3. 以下のコマンドを使用して、Certbot をインストールし、証明書を生成します。

```
    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    sudo apt-get install certbot
    certbot certonly --manual --preferred-challenges dns
```


1. DNS TXT レコードを追加するように指示されます。

2. レコードが正常に生成されたら、`fullchain.pem` と `privkey.pem` をローカルに保存します。

DNS レコードのために Route 53 を使用している場合は、TXT レコードを簡単に追加できます。 新しいレコードセットを作成する場合は、TXT タイプを選択し、適切な値を引用符で囲んで指定してください。

### 自己署名証明書の使用

ELB は*現在の*証明書を必要としないため、任意の有効期間を持つ自己署名証明書を生成することも可能です。

1. openssl コマンド `openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 1 -out certificate.pem` を使用して証明書とキーを生成します。

2. 求められた情報を入力します。 **メモ：**指定する Common Name は、CircleCI で設定されたホストと一致している必要があります。

3. certificate.pem ファイルと key.pem ファイルをローカルに保存します。

### CircleCI Server への証明書の追加

pem 形式の有効な証明書とキーファイルを入手したら、それを CircleCI Server にアップロードする必要があります。

1. `hostname:8800/console/settings` に移動します。

2. [Privacy (プライバシー)] セクションで、[SSL only (Recommened) (SSL のみ (推奨))] にチェックマークを付けます。

3. 新しく生成した証明書とキーをアップロードします。

4. [Verify TLS Settings (TLS 設定を検証)] をクリックして、正しく機能していることを確認します。

5. 設定ページの下にある [Save (保存)] をクリックし、指示に従って再起動します。

## 参考情報

参考：https://letsencrypt.readthedocs.io/en/latest/using.html#manual

## トラブルシューティング

Replicated/管理コンソール ~ (hostname:8800/settings) でホスト名が正しく設定されていること、**および**使用されているホスト名が TLS 証明書に関連付けられた DNS レコードと一致していることを確認します。

GitHub/GitHub Enterprise の [Auth Callback URL] 設定が、Services box を指すドメイン名と、使用するプロトコル (たとえば、**https**://info-tech.io/) を含めて一致していることを確認します。
