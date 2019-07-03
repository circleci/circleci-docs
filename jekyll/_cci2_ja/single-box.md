---
layout: classic-docs
title: "CircleCI トライアルのインストール"
category:
  - administration
order: 3
description: "単一の VM に CircleCI をインストールする方法"
---

CircleCI は、数十～数百のビルドマシンから成るクラスタをサポートするスケーラブルな CI/CD プラットフォームです。 ここでは、1つの仮想マシン上に CircleCI プラットフォームをインストールし、実行する手順を紹介します。 あらゆる環境で簡易なトライアルを行っていただけるよう、その方法についてわかりやすく解説することが目的です。

- 目次
{:toc}

## 前提条件

トライアルを正常にインストールするには、以下の要件を満たす必要があります。

- [サインアップ](https://circleci.jp/enterprise-trial-install/)して、CircleCI の評価版ライセンスファイルを取得する。
- [AWS アカウント](https://portal.aws.amazon.com/billing/signup?nc2=h_ct&src=header_signup&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start)を作成する。
- バージョン管理に **GitHub.com または GitHub Enterprise** を使用する。
- CircleCI と GitHub を実行するマシン同士がネットワーク上で相互にアクセスできる。
- CircleCI マシンにアウトバウンドインターネットアクセスを許可する。 プロキシサーバーを使用する場合の手順については、[お問い合わせください](https://support.circleci.com/hc/ja/requests/new)。

## AWS EC2 でのインストール手順

ここでは、作成済みの Amazon マシンイメージ (AMI) を使用して、単一の EC2 VM 上に CircleCI をインストールする手順を説明します。 AMI は、特別なタイプの仮想アプライアンスで、Amazon Elastic Compute Cloud (EC2) 内で仮想マシンを作成するために使用します。

**メモ：**インストールしたマシン上で実行されるすべてのビルドは、インスタンスプロファイルに関連付けられている IAM (AWS Identity and Access Management) 権限にアクセスします。 インスタンスに不適切な権限を**付与しない**でください。 このアクセスは、本稼働の設定時に `iptables` ルールを使用してブロックできます。手順の詳細については、[サポートセンターにお問い合わせください](https://support.circleci.com/hc/ja)。

### Amazon マシンイメージの設定

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

1. 上のドロップダウンリストから、該当するリージョンの Amazon マシンイメージを選択し、[Go!] をクリックします。
2. 少なくとも 32 GB の RAM を備えたインスタンスタイプ (`m4.2xlarge` など) をリストから選択します。 次に、[Next: Configure Instance Details (次へ：インスタンスの詳細設定を行う)] を選択します。
3. [Configure Instance Details (インスタンスの詳細設定を行う)] ページで以下を行います。
 - ネットワークを選択します。
 - [Auto-assign Public IP (パブリック IP を自動で割り当てる)] を有効にします。
 - IAM ロールが [None (なし)] に設定されていることを確認します。 ![AWS ステップ 3]({{site.baseurl}}/assets/img/docs/single-box-step3.png)
 - 上記がすべて完了したら、[Next: Add Storage (次へ：ストレージを追加する)] を選択します。
4. インスタンスにはデフォルトで 100 GiB のストレージが用意されており、トライアルをインストールするには十分な容量です。 [Next: Add Tags (次へ：タグを追加する)] を選択します。
5. このトライアルではタグを追加する必要はありませんが、必要に応じて [Add Tag (タグを追加する)] ボタンを使用して追加できます。 [Configure Security Group (次へ：セキュリティグループを設定する)] を選択します。
5. [Configure Security Group (セキュリティグループを設定する)] ページで、以下のポートを開きます。
 - SSH ポート 22
 - HTTP ポート 80
 - HTTPS ポート 443
 - カスタム TCP 8800
 - (オプション) 開発者がデバッグ目的でビルドに SSH 接続できるようにしたい場合は、カスタム TCP のポート 64535-65535 を開きます。 ![AWS ステップ 5]({{site.baseurl}}/assets/img/docs/single-box-step5.png)
 - 次に、[Review and Launch (レビューおよび起動する)] を選択し、トライアルインスタンスのサマリーを確認したら、[Launch (起動する)] を選択します。
6. [Launch Status (起動ステータス)] ページが表示されます。 このページから [View Instances (インスタンスを表示させる)] を選択して AWS ダッシュボードに移動し、トライアルインスタンスのすべての詳細を確認できます。 インスタンスが起動したら、パブリックまたはプライベートの IP アドレスまたはホスト名に移動し、[Get Started (今すぐ開始する)] をクリックして、CircleCI の指示に沿って残りのインストールプロセスを完了します。 **メモ：** ブラウザーに [Get Started (今すぐ開始する)] のリンク先が安全でないという警告が表示される場合があります。 ![利用開始のページ]({{site.baseurl}}/assets/img/docs/GettingStartedPage.png)

### CircleCI の設定

1. SSL 証明書オプションを選択し、必要に応じてホスト名を入力します。 ここで、CircleCI アカウントに登録したときに提供されたライセンスファイルをアップロードできます。 アップロードしない場合、CircleCI 環境のすべてのマシンは GitHub Enterprise インスタンスの SSL 証明書をデフォルトで検証します。
 - メモ：自己署名証明書を使用している場合、またはカスタム CA ルートを使用している場合は、情報を CircleCI 信頼ストアに追加するためのスクリプトについて、「[証明書]({{site.baseurl}}/ja/2.0/certificates/)」を参照してください。
2. CircleCI ライセンスファイルをアップロードしたら、管理者コンソールの保護方法を選択できます。 以下の 3つの方法が用意されています。
 - コンソールへの匿名管理者アクセスを許可します。この方法を使用すると、ポート 8800 からだれでもアクセスできるようになります (非推奨)。
 - 管理者コンソールに安全にアクセスできるようにパスワードを設定します (推奨)。
 - 既存のディレクトリベースの認証システム (LDPA) を使用します。
4. これで、CircleCI インスタンスに対して一連の事前チェックが行われます。完了したら、[Continue (続行する)] をクリックします。
3. [Settings (設定)] ページで、以下を設定します。
 - ホスト名、またはホスト名を設定していない場合は IP アドレスを入力し、[Test Hostname Resolution (ホスト名解決をテストする)] をクリックします。
 - 1.0 ビルド機能を使用しない場合は、[Execution Engines (実行エンジン)] で、そのチェックボックスをオフのままにします。 またユーザーのほとんどが 2.0 機能のチェックボックスをオンにする必要があります。
 - [2.0 Builders Configuration (2.0 Builder 設定)] では、[Single Box (単一ボックス)] を選択します。
 - GitHub のインテグレーション手順に従います。 **メモ：***「Unknown error authenticating via GitHub. Try again, or contact us. (GitHub 経由の認証で原因不明のエラーが発生しました。もう一度実行するか、弊社までお問い合わせください)」*というメッセージが表示された場合は、ホームページ URL とコールバック URL で `https:` の代わりに `http:` を使用してみてください。
 - [Storage (ストレージ)] セクションで [None (なし)] が選択されていることを確認します。 本稼働環境では他のオブジェクトストアが使用される場合がありますが、その場合には対応する IAM 権限が必要です。
 - [VM Provider (VM プロバイダー)] が [None (なし)] に設定されていることを確認します。 Docker ビルドの実行をサポートするなどの目的で、CircleCI で動的な VM プロビジョニングを許可したい場合、この設定を変更することもできます。ただし、その場合は追加の IAM 権限が必要です。 ご不明な点がございましたら、[お問い合わせください](https://support.circleci.com/hc/ja)。
 - ライセンス契約に同意し、保存したら、ダッシュボードに移動します。 およそ 160 MB の Docker イメージをダウンロードすると、アプリケーションの起動プロセスが始まります。完了までしばらく待機します。
11. [Open (開く)] をクリックして CircleCI アプリケーションを起動し、[Sign Up (登録する)] をクリックして GitHub アカウントを承認します。 [Add Projects (プロジェクトを追加する)] ページが表示され、最初のビルドを行うプロジェクトを選択できます。

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04.

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete.

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build.
-->
