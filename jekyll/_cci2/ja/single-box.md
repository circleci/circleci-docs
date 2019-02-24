---
layout: classic-docs
title: "CircleCI トライアルのインストール"
category:
  - administration
order: 3
description: "単一のVM に CircleCI をインストールする方法"
---
CircleCI は拡張性のある CI/CD プラットフォームで、数十数百ものビルドマシンのクラスタをサポートします。 このページでは、任意の環境でマシンのちょっとした動作を試してみるために、単一の仮想マシン環境にプラットフォームをインストールして実行する手順について説明します。

- 目次
{:toc}

## 前準備

トライアルを首尾よくインストールするためには、下記の要件を満たす必要があります。

- トライアルライセンスのファイルを受信するために[登録](https://circleci.com/enterprise-trial-install/)する。
- バージョン管理のために **GitHub.com または GitHub Enterprise** を使用する。
- CircleCI および GitHub を実行するマシンは、ネットワーク上で互いにアクセスできる必要がある。
- CircleCI マシンは、インターネットへ外向きアクセスできる必要がある。 プロキシサーバーを使用している場合の手順については、[CircleCIにお問い合わせくださいcontact us](https://support.circleci.com/hc/en-us/requests/new)。

## AWS EC2 へのインストー手順

この手順を使用して単一 EC2 VM に CircleCI をインストールするには、仮想アプライアンスの特殊なタイプであり、 Amazon Elastic Compute Cloud ("EC2") 内で想マシンの作成に使用されるプリメイドの Amazon Machine Image (AMI) を使用します。

**注:** インストールされたマシンで実行されるすべてのビルドは、そのインスタンスプロファイルに関連付けされている AWS Identity and Access Management (IAM) 権限にアクセスします。 お使いのインスタンスに不適切な権限を付与 **しない**でください。 プロダクション設定をすると、`iptables` ルールでこのアクセスをブロックすることができます。固有の手順については[サポートにお問い合わせください](https://support.circleci.com/hc/en-us)。

### Amazon Machine Image の設定:

<script>
  var amiIds = {
  "ap-northeast-1": "ami-32e6d455",
  "ap-northeast-2": "ami-2cef3242",
  "ap-southeast-1": "ami-7f22a71c",
  "ap-southeast-2": "ami-21111b42",
  "eu-central-1": "ami-7a2ef015",
  "eu-west-1": "ami-ac1a14ca",
  "sa-east-1": "ami-70026d1c",
  "us-east-1": "ami-cb6f1add",
  "us-east-2": "ami-57c7e032",
  "us-west-1": "ami-059b818564104e5c6",
  "us-west-2": "ami-c24a2fa2"
  };

  var amiUpdateSelect = function() {
    var s = document.getElementById("ami-select");
    var region = s.options[s.selectedIndex].value;
    document.getElementById("ami-go").href = "https://console.aws.amazon.com/ec2/v2/home?region=" + region + "#LaunchInstanceWizard:ami=" + amiIds[region];
  };
  </script>

<select id="ami-select" onchange="amiUpdateSelect()"> <option value="ap-northeast-1">ap-northeast-1</option> <option value="ap-northeast-2">ap-northeast-2</option> <option value="ap-southeast-1">ap-southeast-1</option> <option value="ap-southeast-2">ap-southeast-2</option> <option value="eu-central-1">eu-central-1</option> <option value="eu-west-1">eu-west-1</option> <option value="sa-east-1">sa-east-1</option> <option value="us-east-1" selected="selected">us-east-1</option> <option value="us-east-2">us-east-2</option> <option value="us-west-1">us-west-1</option> <option value="us-west-2">us-west-2</option> </select> <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">Go!</a>
<script>amiUpdateSelect();</script>

1. 上記のリストから、お住いの地域の Amazon Machine Image を見つけてください。 
2. `m4.2xlarge` など、最低でも 32G の RAM を持つインスタンスタイプを選んでいることを確認します。 [Next] を選択してインスタンスを設定します。
3. インスタンス詳細の設定ページで、以下を実行します。 

- お使いのネットワークを選択する - 自動割り当て公開 IP を有効にする - IAM ロールを「なし」に設定する ![AWS Step 3]({{site.baseurl}}/assets/img/docs/single-box-step3.png) 4. デフォルトのインスタンスには、100GB のストレージがあります。トライアルのインストールにはこの容量で十分です。 5. セキュリティグループの設定手順の間、下記のポートを開きます。 - SSH ポート 22 - HTTP ポート 80 - HTTPS ポート 443 - Custom TCP 8800 - (Optional) 開発者がデバッグ目的で SSH でのビルドへの接続を有効にするには、Custom TCP のポート 64535-65535 を開きます。 ![AWS Step 5]({{site.baseurl}}/assets/img/docs/single-box-step5.png) 6. VM を開始後、公開または非公開 IP アドレスまたは VM のホスト名にアクセスし、[Get Started] をクリックして CircleCI のガイド付きインストールプロセスの残り部分を完了します。

### CircleCI の設定

1. SSL 証明書オプションを選択します。 デフォルトで、CircleCI インストールにおけるすべてのマシンは GitHub Enterprise インスタンス用の SSL 証明書を確認します。 

- 注: あなたが自己署名証明書を使用している場合、またはカスタム CA ルートを使用している場合、スクリプトの[証明書]({{site.baseurl}}/2.0/certificates/)ドキュメントを参照して CircleCI truststore を追加します。 2. CircleCI ライセンスファイルをアップロードし、管理者パスワードを設定します。 3. 1.0 ビルド機能を必要としない場合、ボックスのチェックは外したままにしてください。 ほとんどのユーザーはボックスにチェクを入れて 2.0 機能を有効にする必要があります。 4. 「ビルダ設定」セクションで「単一ボックス」を選択します。 5. ホームページ URL の手順 6 から AWS インスタンスの IP アドレスを使用して、および承認コールバックの URL として `http(s)://AWS instance IP address/auth/github` を使用して、GitHub.com （<https://github.com/settings/applications/new/>~）のまたは GitHub Enterprise 設定の新しい OAuth アプリケーションとして CircleCI を登録します。 [Register Application] ボタンをクリックします。 - **Note:** If you get an "Unknown error authenticating via GitHub. Try again, or contact us." message, try using `http:` instead of `https:` for the Homepage URL and callback URL. 6. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID. 7. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication. 8. 「なし」が「ストレージ」セクションで選択されていることを確認します。 プロダクションインストールで、他のオブジェクトストアを使用することはできますが、対応する権限が必要となります。 9. 「VM プロバイダ」が「なし」に設定されていることを確認します。 CircleCI でVM をダイナミックにプロビジョニングしたい場合 (例：Docker ビルドの実行をサポートするために) この設定を変更できますが、追加の IAM 権限が必要となります。 ご不明な点やご質問がありましたら[お問い合わせください](https://support.circleci.com/hc/en-us)。 10. ライセンス契約に同意し、保存します。 アプリケーションの起動プロセスは 160 MB 未満の Docker イメージのダウンロードによって始まるため、完了には少し時間がかかります。 11. CircleCI アプリを開いて [Get Started] をクリックし GitHub アカウントを承認します。 The Add Projects page appears where you can select a project for your first build.

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->