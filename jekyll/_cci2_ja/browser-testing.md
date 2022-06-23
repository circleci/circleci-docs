---
layout: classic-docs
title: ブラウザーテスト
description: CircleCI 上のブラウザーテスト
category:
  - テスト
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

以下のセクションでは、CircleCI 設定ファイルでブラウザーテストの実行とデバッグを行う一般的な方法について説明します。

* 目次
{:toc}

## 前提条件
{: #prerequisites }
{:.no_toc}

「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」を参照し、Java 8、geckodriver、Firefox、Chrome などのバリアントのイメージ名に `-browsers:` を付加してください。 PhantomJS などの バリアントのイメージ名には `-browsers-legacy` を付加してください。

## 概要
{: #overview }
{:.no_toc}

コードをコミットしてプッシュするたびに、選択したブラウザーに対するすべてのテストが、CircleCI によって自動的に実行されます。 ブラウザーベースのテストは、変更が加えられるたびに、各デプロイの前、または特定のブランチで実行されるように設定できます。

## Selenium
{: #selenium }

ブラウザーテストに使用される多くの自動化ツールには、広く採用されているブラウザードライバー標準である Selenium WebDriver が使用されています。

Selenium WebDriver には、Java、Python、Ruby などの一般的な言語で実装されたブラウザーをプログラムによって操作するための共通 API が用意されています。 Selenium WebDriver からこれらのブラウザー用の統合インターフェイスが提供されるため、開発者が何度もブラウザーテストを作成する必要はありません。 これらのテストは、すべてのブラウザーとプラットフォームで機能します。 セットアップの詳細については、[Selenium のドキュメント](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project)を参照してください。 仮想フレームバッファ X サーバーのドキュメントについては、[Xvfb のマニュアル ページ](http://www.xfree86.org/4.0.1/Xvfb.1.html)を参照してください。

WebDriver には、ローカルとリモートの 2 種類の動作モードがあります。 テストをローカルで実行する場合は、Selenium WebDriver ライブラリを使用して、同じマシン上のブラウザーを直接操作します。 リモートで実行すると、テストは Selenium サーバーと連携し、サーバーがブラウザーを動かします。

プライマリ Docker イメージに Selenium が含まれていない場合は、以下のように Selenium をインストールして実行します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/node:16.13.1-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

サンプル アプリケーションについては、「[2.0 プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)」の「Selenium のインストール・実行によるブラウザー テストの自動化」セクションを参照してください。 Ruby on Rails 用の Capybara/Selenium/Chrome のヘッドレスな CircleCI の設定については、[Knapsack Pro のドキュメント](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless)を参照してください。

ヘッドレス Chrome の使用方法については、CircleCI のブログ記事「[Headless Chrome for More Reliable, Efficient Browser Testing (ヘッドレス Chrome を使用した高効率かつ高信頼性のブラウザーテスト)](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)」や、関連する [Discuss のスレッド](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112)を参照してください。

Selenium 用の環境を設定する代わりに、LambdaTest、Sauce Labs、BrowserStack などのクラウドベースのプラットフォームに移行することも可能です。 クロスブラウザー テストを実行するこれらのクラウドは、クラウド上に既製のインフラストラクチャを提供しているため、開発者が Selenium 環境の設定に時間をかける必要はありません。

## LambdaTest
{: #lambdatest }

すばやい市場投入をご支援するべく、[LambdaTest](https://www.lambdatest.com/) を CircleCI に統合しました。 自動化されたクロスブラウザーテストを LambdaTest で実行して、複数のマシンから実行される 2,000 以上の実ブラウザーを提供するオンライン Selenium Grid を通して、開発コードがクラウド上でシームレスに実行されていることを確認できます。 自動化テストを LambdaTest の Selenium Grid と並列に実行して、テスト サイクルを大幅に短縮できます。

LambdaTest は、ローカルに保存された Web ページのクロスブラウザー テストを実行できるように、Lambda Tunnel という名前の SSH (Secure Shell) トンネル接続を提供しています。 Lambda Tunnel を使用して、CircleCI ビルド コンテナ内でテスト サーバーを実行し、LambdaTest の Selenium Grid から提供されるブラウザー上で、自動化されたクロスブラウザー テストを実行することができます。 このように、Web サイトを公開する前に、訪問者に対してどのように表示されるのか確認することができます。

CircleCI は、ブラウザー テストを実行する前に Sauce Labs トンネルを開くことができる Sauce Labs ブラウザー テスト Orb を開発しました。 この Orb を使用することで Lambda tunnel をすばやくセットアップし、テストのステップを定義できます。

{% raw %}
```yaml
version: 2.1

orbs:
  lambda-tunnel: lambdatest/lambda-tunnel@0.0.1

jobs:
  lambdatest/with_tunnel:
    tunnel_name: <your-tunnel-name>
    steps:
      - <your-test-steps>
```
{% endraw %}

## Sauce Labs
{: #sauce-labs }

Sauce Labs には、Web アプリケーションをテストできるオペレーティングシステムとブラウザの組み合わせが幅広いネットワークで用意されています。 Sauce Labs は、Selenium WebDriver スクリプトを使用した自動 Web アプリテストや、さまざまな JavaScript フレームワークから直接テストを実行するためのテストオーケストレーターである CLI をサポートしています。

### saucectl
{: #saucectl }

JavaScript を使用して Web アプリケーションをテストしている場合でも、選択した JS フレームワークで [`saucectl`](https://docs.saucelabs.com/testrunner-toolkit) を使用し、CircleCI のワークフローに [saucectl-run Orb](https://circleci.com/developer/orbs/orb/saucelabs/saucectl-run) を組み込むことにより、Sauce Labs のプラットフォームを利用できます。

1. CircleCI プロジェクトに `SAUCE_USERNAME` と `SAUCE_ACCESS_KEY` を [環境変数]({{site.baseurl}}/ja/2.0/env-vars/)として追加します。
2. CircleCI プロジェクトの `config.yml` を saucectl-run Orb を含むよう変更し、この Orb をワークフロー内でジョブとして定義します。

{% raw %}
```yaml
version: 2.1
orbs:
  saucectl: saucelabs/saucectl-run@2.0.0

jobs:
  test-cypress:
    docker:
      - image: cimg/node:lts
    steps:
      - checkout
      - setup_remote_docker:
          version: 20.10.2
      - saucectl/saucectl-run

workflows:
  version: 2
  default_workflow:
    jobs:
      - test-cypress
```
{% endraw %}

## BrowserStack と Appium
{: #browserstack-and-appium }

上述の Sauce Labs と同様に、Sauce Labs の代わりに、BrowserStack など他の、複数のブラウザーに対応したテスト用プラットフォームをインストールすることもできます。 次に、USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)を自分の BrowserStack アカウントに関連付けられた値に設定します。

モバイル アプリケーションの場合は、Appium、または WebDriver プロトコルを使用する同等のプラットフォームを使用できます。 それには、ジョブに Appium をインストールし、USERNAME と ACCESS_KEY に CircleCI の[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)を使用します。

## Cypress
{: #cypress }

JavaScript エンドツーエンド テストに使用できるブラウザー テスト ソリューションとして、他にも [Cypress](https://www.cypress.io/) があります。 Selenium アーキテクチャを利用するブラウザー テスト ソリューションとは異なり、Cypress を使用する場合は、アプリケーションと同じ実行ループでテストを実行できます。

このプロセスを簡素化するために、CircleCI 承認済み Orb を使用して、結果を Cypress ダッシュボードにポストせずにすべての Cypress テストを実行するなどのさまざまなテストを実行することができます。 以下に例示する CircleCI 承認済み Orb では、結果がダッシュボードにパブリッシュされずに、すべての Cypress テストが実行されます。

{% raw %}
```yaml
version: 2.1

orbs:
  cypress: cypress-io/cypress@1

workflows:
  build:
    jobs:
      - cypress/run:
          no-workspace: true
```
{% endraw %}

設定ファイルのワークフローに使用できる Cypress Orb の例は他にもあります。 これらの Orb の詳細については、[CircleCI Orbs レジストリ](https://circleci.com/developer/ja/orbs)にある[Cypress Orbs のページ](https://circleci.com/developer/ja/orbs/orb/cypress-io/cypress)を参照してください。

## ブラウザーテストのデバッグ
{: #debugging-browser-tests }

インテグレーションテストのデバッグは一筋縄では行きません。特に、リモートマシンで実行されている場合はなおさらです。 このセクションでは、CircleCI 上でブラウザーテストをデバッグする方法の例をいくつか示します。

### スクリーンショットとアーティファクトの使用
{: #using-screenshots-and-artifacts }
{:.no_toc}

[ビルド アーティファクト]({{ site.baseurl }}/ja/2.0/artifacts/)を収集してビルドから使用できるように CircleCI を構成できます。 たとえば、アーティファクトを使用し、ジョブの一部としてスクリーンショットを保存して、ジョブの終了時に表示することができます。 これらのファイルは `store_artifacts` ステップで明示的に収集し、`path` および `destination` を指定する必要があります。 例については、「CircleCI を設定する」の [store_artifacts]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) セクションを参照してください。

スクリーンショットの保存は簡単です。これは WebKit および Selenium に組み込まれた機能で、ほとんどのテストスィートでサポートされています。

*   [直接 Selenium を使用して手動で保存する](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Cucumber を使用して障害時に自動的に保存する](https://github.com/mattheworiordan/capybara-screenshot)
*   [Behat と Mink を使用して障害時に自動的に保存する](https://gist.github.com/michalochman/3175175)

### ローカル ブラウザーを使用して CircleCI 上の HTTP サーバーにアクセス
{: #using-a-local-browser-to-access-http-server-on-circleci }
{:.no_toc}

CircleCI 上で HTTP サーバーを実行するテストを行う場合、ローカル マシンで動作するブラウザーを使用して障害テストのデバッグを行うと便利な場合があります。 これは、SSH を有効にした実行によって簡単にセットアップできます。

1. CircleCI アプリの**[Job (ジョブ)] ページ**の [Rerun Job with SSH (SSH でジョブを再実行)] ボタンを使用して SSH ビルドを実行します。 次のように、SSH からコンテナにログインするコマンドが表示されます。
```shell
ssh -p 64625 ubuntu@54.221.135.43
```

1. コマンドにポート転送を追加するには、`-L` フラグを使用します。 次の例では、ブラウザーでの `http://localhost:3000` へのリクエストを CircleCI コンテナ上のポート `8080` に転送します。 これは、ジョブで Ruby on Rails デバッグ アプリを実行し、それがポート 8080 をリスンする場合などに使用できます。 これを実行した後、ブラウザーに移動して http://localhost:3000 をリクエストすると、コンテナのポート 8080 の処理の内容が表示されます。 <br><br> **注:** `8080` をCircleCI で実行しているポートに更新してください。
```shell
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```

1. 次に、ローカル マシンでブラウザーを開き、`http://localhost:8080` に移動すると、CircleCI コンテナ上のポート `3000` で実行されているサーバーに直接リクエストが送信されます。 CircleCI コンテナでテスト サーバーを手動で起動し (まだ実行されていない場合)、開発マシン上のブラウザーから実行中のテスト サーバーにアクセスすることもできます。

この方法では、たとえば Selenium テストをセットアップするとき、非常に簡単にデバッグを行えます。

### VNC からのブラウザー操作
{: #interacting-with-the-browser-over-vnc }
{:.no_toc}

VNC を使用して、テストを実行しているブラウザーを表示し、操作することができます。 これは、実ブラウザーを実行するドライバーを使用している場合にのみ機能します。 Selenium が制御するブラウザーを操作できますが、PhantomJS はヘッドレスなので、操作する対象がありません。

1. VNC ビューアをインストールします。 macOS を使用している場合は、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討してください。 [RealVNC](http://www.realvnc.com/download/viewer/) もほとんどのプラットフォームで使用できます。

1. ターミナル ウィンドウを開き、CircleCI コンテナへの [SSH 実行を開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)し、リモート ポート 5901 をローカル ポート 5902 に転送します。
```shell
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```
1. `vnc4server` パッケージと `metacity` パッケージをインストールします。 `metacity` を使用して、ブラウザーを操作し、ターミナル ウィンドウに戻ります。
```shell
sudo apt install vnc4server metacity
```
1. CircleCIコンテナに接続後、VNCサーバーを起動します。
```shell
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```
1. SSH の接続はセキュリティ保護されているため、強力なパスワードは必要ありません。 しかし、パスワードが *1* つ必要なので、プロンプトに `password` を入力します。

1. VNC ビューアを起動し、`localhost:5902` に接続します。 プロンプトに `password` を入力します。

1. ターミナル ウィンドウが含まれるディスプレイが表示されます。 SSH トンネルを通して接続はセキュリティ保護されているため、安全ではない接続または暗号化されていない接続に関する警告は無視してください。

1. VNC サーバーでウィンドウを開くために、`DISPLAY` 変数を設定します。 このコマンドを実行しないと、ウィンドウはデフォルトの (ヘッドレス) X サーバーで開きます。
```shell
ubuntu@box159:~$ export DISPLAY=:1.0
```
1. ` metacity ` をバックグラウンドで起動します。
```shell
ubuntu@box159:~$ metacity &
```
1. `firefox` をバックグラウンドで起動します。
```shell
ubuntu@box159:~$ firefox &
```

これで、コマンド ラインからインテグレーション テストを実行し、ブラウザーで予期しない動作がないかどうかを監視できます。 ローカル マシンでテストを実行しているかのように、ブラウザーを操作することができます。

### CircleCI の X サーバーの共有
{: #sharing-circlecis-x-server }
{:.no_toc}

VNC サーバーを頻繁にセットアップしているなら、そのプロセスを自動化した方が効率的でしょう。 `x11vnc` を使用して、VNC サーバーを X にアタッチできます。

1. [`x11vnc`](https://github.com/LibVNC/x11vnc) をダウンロードして、テストの前に起動します。
```yaml
steps:
  - run:
      name: Download and start X
      command: |
        sudo apt-get install -y x11vnc
        x11vnc -forever -nopw
      background: true
```
1. これで、[SSH ビルドを開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)すると、デフォルトのテスト ステップの実行中に VNC サーバーに接続できます。 SSH トンネルの機能を持つ VNC ビューアを使用するか、独自のトンネルをセットアップできます。
```shell
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## over SSH によるX11 転送
{: #x11-forwarding-over-ssh }

CircleCI は、SSH からの X11 転送もサポートしています。 X11 転送は VNC と同様、CircleCI 上で動作するブラウザーとローカル マシンからやり取りすることができます。

1. コンピューターに X Window System をインストールします。 macOS を使用している場合は、[XQuartz](http://xquartz.macosforge.org/landing/) の使用を検討してください。

1. システムで X をセットアップしたら、CircleCI VM に対して [SSH ビルドを開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)します。 `-X` フラグを使用して転送をセットアップします。
```shell
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```
これによって、X11 転送が有効な状態で SSH セッションが開始されます。

1. お使いのマシンに VM のディスプレイを接続するには、ディスプレイ環境変数を `localhost:10.0` に設定します。
```shell
ubuntu@box10$ export DISPLAY=localhost:10.0
```
1. xclock を起動して、すべて正しく動作していることを確認します。
```shell
ubuntu@box10$ xclock
```
xclock がデスクトップに表示された後で、`Ctrl+c` を使用して終了できます。

これで、コマンド ラインからインテグレーション テストを実行し、ブラウザーで予期しない動作がないかどうかを監視できます。 ローカル マシンでテストを実行しているかのように、ブラウザーを操作することができます。

## 関連項目
{: #see-also }

[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)
