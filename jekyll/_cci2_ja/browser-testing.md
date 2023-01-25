---
layout: classic-docs
title: ブラウザーでのテスト
description: CircleCI 上のブラウザーテスト
category:
  - テスト
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

このドキュメントでは、CircleCI の設定でブラウザーテストの実行とデバッグを行う一般的な方法について説明します。

## 概要
{: #overview }

コードをプッシュしてコミットするごとに、CircleCI は選択したブラウザーに対してすべてのテストを自動的に実行します。 ブラウザーベースのテストは、変更が行われたとき、すべてのデプロイの前、またはとテイクのブランチのたびに実行されるよう構成できます。

## 前提条件
{: #prerequisites }

Refer to the [Pre-built CircleCI convenience images](/docs/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, Geckodriver, Firefox, and Chrome. PhantomJS などの バリアントのイメージ名には `-browsers-legacy` を付加してください。

## Selenium
{: #selenium }

ブラウザーテストに使用される多くの自動化ツールには、広く採用されているブラウザードライバー標準である Selenium WebDriver が使用されています。

Selenium WebDriver provides a common API for programmatically driving browsers implemented in several popular languages, including Java, Python, and Ruby. Selenium WebDriver からこれらのブラウザー用の統合インターフェイスが提供されるため、開発者が何度もブラウザーテストを作成する必要はありません。 これらのテストは、すべてのブラウザーとプラットフォームで機能します。 セットアップの詳細については、[Selenium のドキュメント](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project)を参照してください。 仮想フレームバッファ X サーバーのドキュメントについては、[Xvfb のマニュアルページ](http://www.xfree86.org/4.0.1/Xvfb.1.html)を参照してください。

WebDriver には、ローカルとリモートの 2 種類の動作モードがあります。 テストをローカルで実行する場合は、Selenium WebDriver ライブラリを使用して、同じマシン上のブラウザーを直接操作します。 リモートで実行すると、テストは Selenium サーバーと連携し、サーバーがブラウザーを動かします。

If Selenium is not included in your primary Docker image, install and run Selenium as shown below:

```yaml
version: 2.1
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

Selenium 用の環境を設定する代わりに、LambdaTest、Sauce Labs、BrowserStack などのクラウドベースのプラットフォームに移行することも可能です。 クロスブラウザー テストを実行するこれらのクラウドは、クラウド上に既製のインフラストラクチャを提供しているため、開発者が Selenium 環境の設定に時間をかける必要はありません。

## LambdaTest
{: #lambdatest }

すばやい市場投入をご支援するべく、[LambdaTest](https://www.lambdatest.com/) を CircleCI に統合しました。 自動化されたクロスブラウザー テストを LambdaTest で実行して、複数のマシンから実行される 2,000 以上の実ブラウザーを提供するオンライン Selenium Grid を通して、開発コードがクラウド上でシームレスに実行されていることを確認できます。 自動化テストを LambdaTest の Selenium Grid と並列に実行して、テスト サイクルを大幅に短縮できます。

LambdaTest は、ローカルに保存された Web ページのクロスブラウザー テストを実行できるように、Lambda Tunnel という名前の SSH (Secure Shell) トンネル接続を提供しています。 Lambda Tunnel を使用して、CircleCI ビルド コンテナ内でテスト サーバーを実行し、LambdaTest の Selenium Grid から提供されるブラウザー上で、自動化されたクロスブラウザー テストを実行することができます。 このように、Web サイトを公開する前に、訪問者に対してどのように表示されるのか確認することができます。

CircleCI は、ブラウザー テストを実行する前に Sauce Labs トンネルを開くことができる Sauce Labs ブラウザー テスト Orb を開発しました。 Use the orb to quickly set up a Lambda tunnel and the define your test steps.

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

## Sauce Labs
{: #sauce-labs }

Sauce Labs には、Web アプリケーションをテストできるオペレーティングシステムとブラウザの組み合わせが幅広いネットワークで用意されています。 Sauce Labs は、Selenium WebDriver スクリプトを使用した自動 Web アプリテストや、さまざまな JavaScript フレームワークから直接テストを実行するためのテストオーケストレーターである CLI をサポートしています。

### saucectl
{: #saucectl }

JavaScript を使用して Web アプリケーションをテストしている場合でも、選択した JS フレームワークで [`saucectl`](https://docs.saucelabs.com/testrunner-toolkit) を使用し、CircleCI のワークフローに [saucectl-run Orb](https://circleci.com/developer/orbs/orb/saucelabs/saucectl-run) を組み込むことにより、Sauce Labs のプラットフォームを利用できます。

1. Add your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` as [environment variables](/docs/env-vars/) in your Circle CI project.
2. CircleCI プロジェクトの `config.yml` を saucectl-run Orb を含むよう変更し、この Orb をワークフロー内でジョブとして定義します。

```yaml
version: 2.1

orbs:
  saucectl: saucelabs/saucectl-run@2.0.0

jobs:
  test-cypress:
    docker:
      - image: cimg/node:lts
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          version: 20.10.2
      - saucectl/saucectl-run

workflows:
  default_workflow:
    jobs:
      - test-cypress
```

## BrowserStack と Appium
{: #browserstack-and-appium }

上述の Sauce Labs と同様に、Sauce Labs の代わりに、BrowserStack など他の、複数のブラウザーに対応したテスト用プラットフォームをインストールすることもできます。 Then, set the USERNAME and ACCESS_KEY [environment variables](/docs/env-vars/) to those associated with your BrowserStack account.

For mobile applications, it is possible to use Appium or an equivalent platform that also uses the WebDriver protocol by installing Appium in your job and using CircleCI [environment variables](/docs/env-vars/) for the USERNAME and ACCESS_KEY.

## Cypress
{: #cypress }

JavaScript エンドツーエンド テストに使用できるブラウザー テスト ソリューションとして、他にも [Cypress](https://www.cypress.io/) があります。 Selenium アーキテクチャを利用するブラウザー テスト ソリューションとは異なり、Cypress を使用する場合は、アプリケーションと同じ実行ループでテストを実行できます。

このプロセスを簡素化するために、CircleCI 承認済み Orb を使用して、結果を Cypress ダッシュボードにポストせずにすべての Cypress テストを実行するなどのさまざまなテストを実行することができます。 以下に例示する CircleCI 承認済み Orb では、結果がダッシュボードにパブリッシュされずに、すべての Cypress テストが実行されます。

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

設定ファイルのワークフローに使用できる Cypress Orb の例は他にもあります。 これらの Orb の詳細については、[CircleCI Orbs レジストリ](https://circleci.com/developer/ja/orbs)にある[Cypress Orbs のページ](https://circleci.com/developer/ja/orbs/orb/cypress-io/cypress)を参照してください。

## ブラウザーテストのデバッグ
{: #debugging-browser-tests }

インテグレーションテストのデバッグは一筋縄では行きません。特に、リモートマシンで実行されている場合はなおさらです。 このセクションでは、CircleCI 上でブラウザーテストをデバッグする方法の例をいくつか示します。

### スクリーンショットとアーティファクトの使用
{: #using-screenshots-and-artifacts }

CircleCI may be configured to collect [build artifacts](/docs/artifacts/) and make them available from your build. たとえば、アーティファクトを使用し、ジョブの一部としてスクリーンショットを保存して、ジョブの終了時に表示することができます。 これらのファイルは `store_artifacts` ステップで明示的に収集し、`path` および `destination` を指定する必要があります。 See the [store_artifacts](/docs/configuration-reference/#storeartifacts) section of the Configuring CircleCI document for an example.

スクリーンショットの保存は簡単です。これは WebKit および Selenium に組み込まれた機能で、ほとんどのテストスィートでサポートされています。

*   [直接 Selenium を使用して手動で保存する](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Cucumber を使用して障害時に自動的に保存する](https://github.com/mattheworiordan/capybara-screenshot)
*   [Behat と Mink を使用して障害時に自動的に保存する](https://gist.github.com/michalochman/3175175)

### ローカル ブラウザーを使用して CircleCI 上の HTTP サーバーにアクセス
{: #using-a-local-browser-to-access-http-server-on-circleci }

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

VNC を使用して、テストを実行しているブラウザーを表示し、操作することができます。 これは、実ブラウザーを実行するドライバーを使用している場合にのみ機能します。 Selenium が制御するブラウザーを操作できますが、PhantomJS はヘッドレスなので、操作する対象がありません。

1. VNC ビューアをインストールします。 macOS を使用している場合は、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討してください。 [RealVNC](http://www.realvnc.com/download/viewer/) もほとんどのプラットフォームで使用できます。

1. Open a Terminal window, [start an SSH run](/docs/ssh-access-jobs/) to a CircleCI container and forward the remote port 5901 to the local port 5902.
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
1. Now when you [start an SSH build](/docs/ssh-access-jobs/), you'll be able to connect to the VNC server while your default test steps run. SSH トンネルの機能を持つ VNC ビューアを使用するか、独自のトンネルをセットアップできます。
```shell
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## SSH からの X11 転送
{: #x11-forwarding-over-ssh }

CircleCI は、over SSH による X11 転送もサポートしています。 X11 転送は VNC と同様、CircleCI 上で動作するブラウザーとローカル マシンからやり取りすることができます。

1. コンピューターに X Window System をインストールします。 macOS を使用している場合は、[XQuartz](http://xquartz.macosforge.org/landing/) の使用を検討してください。

1. With X set up on your system, [start an SSH build](/docs/ssh-access-jobs/) to a CircleCI VM, using the `-X` flag to set up forwarding:
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

- [環境変数](/docs/env-vars/)
