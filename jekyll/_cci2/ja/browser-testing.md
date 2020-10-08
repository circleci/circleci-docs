---
layout: classic-docs
title: ブラウザー テスト
description: CircleCI 上のブラウザー テスト
category:
  - test
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、CircleCI 設定ファイルでブラウザー テストの実行とデバッグを構成する一般的な方法について説明します。

* 目次
{:toc}

## 前提条件
{:.no_toc}

「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照し、Java 8、geckodriver、Firefox、Chrome などのバリアントのイメージ名に `-browsers:` を付加してください。 PhantomJS などの バリアントのイメージ名には `-browsers-legacy` を付加してください。

## 概要
{:.no_toc}

コードをコミットしてプッシュするたびに、選択したブラウザーに対するすべてのテストが、CircleCI によって自動的に実行されます。 ブラウザー ベースのテストは、変更が行われるたび、各デプロイの前、または特定のブランチで実行されるように構成できます。

## Selenium

ブラウザー テストに使用される多くの自動化ツールには、広く採用されているブラウザー ドライバー標準である Selenium WebDriver が使用されています。

Selenium WebDriver には、Java、Python、Ruby などの一般的な言語で実装されたブラウザーをプログラムによって操作するための共通 API が用意されています。 Selenium WebDriver からこれらのブラウザー用の統合インターフェイスが提供されるため、開発者が何度もブラウザー テストを作成する必要はありません。 これらのテストは、すべてのブラウザーとプラットフォームで機能します。 セットアップの詳細については、[Selenium のドキュメント](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project)を参照してください。 仮想フレームバッファ X サーバーのドキュメントについては、[Xvfb のマニュアル ページ](http://www.xfree86.org/4.0.1/Xvfb.1.html)を参照してください。

WebDriver には、ローカルとリモートの 2 種類の動作モードがあります。 テストをローカルで実行する場合は、Selenium WebDriver ライブラリを使用して、同じマシン上のブラウザーを直接操作します。 テストをリモートで実行する場合は、Selenium Server と通信し、サーバーからブラウザーを操作します。

プライマリ Docker イメージに Selenium が含まれていない場合は、以下のように Selenium をインストールして実行します。

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:jessie-browsers
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

サンプル アプリケーションについては、「[2.0 プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)」の「Selenium のインストール・実行によるブラウザー テストの自動化」セクションを参照してください。 Ruby on Rails 用の Capybara/Selenium/Chrome ヘッドレス CircleCI 2.0 設定ファイルの例については、[Knapsack Pro のドキュメント](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless)を参照してください。

ヘッドレス Chrome の使用方法については、CircleCI のブログ記事「[Headless Chrome for More Reliable, Efficient Browser Testing (ヘッドレス Chrome を使用した高効率かつ高信頼性のブラウザー テスト)](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)」や、関連する[ディスカッション スレッド](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112)を参照してください。

Selenium 用の環境を設定する代わりに、LambdaTest、Sauce Labs、BrowserStack などのクラウドベースのプラットフォームに移行することも可能です。 These cross browser testing clouds provide you with a ready-made infrastructure so you don’t have to spend time configuring a Selenium environment.

## LambdaTest

すばやい市場投入をご支援するべく、LambdaTest を CircleCI に統合しました。 自動化されたクロスブラウザー テストを LambdaTest で実行して、複数のマシンから実行される 2,000 以上の実ブラウザーを提供するオンライン Selenium Grid を通して、開発コードがクラウド上でシームレスに実行されていることを確認できます。 自動化テストを LambdaTest の Selenium Grid と並列に実行して、テスト サイクルを大幅に短縮できます。

LambdaTest provides an SSH (Secure Shell) tunnel connection, Lambda Tunnel, to help you perform cross browser testing of your locally stored web pages. With Lambda Tunnel, you can see how your website will look to your audience before making it live, by executing a test server inside your CircleCI build container to perform automated cross-browser testing on the range of browsers offered by Selenium Grid on LambdaTest.

LambdaTest has developed a [CircleCI orb](https://circleci.com/developer/orbs/orb/lambdatest/lambda-tunnel) for browser compatibility testing that enables you to open a Lambda Tunnel before performing any browser testing, easing the process of integrating LambdaTest with CircleCI. Use the orb to quickly set up a Lambda tunnel and the define your test steps

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

Sauce Labs operates browsers on a network that is separate from CircleCI build containers. To allow the browsers access the web application you want to test, run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs' secure tunnel [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).

Sauce Connect allows you to run a test server within the CircleCI build container and expose it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you run your browser tests after deploying to a publicly accessible staging environment, you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `config.yml` file shows how to run browser tests through Sauce Labs against a test server running within a CircleCI build container.

{% raw %}
```yaml
version: 2

jobs:
  build:
    docker:

      - image: circleci/python:jessie-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Install Sauce Labs and Set Up Tunnel
          background: true
          command: |
            curl https://saucelabs.com/downloads/sc-4.4.12-linux.tar.gz -o saucelabs.tar.gz
            tar -xzf saucelabs.tar.gz
            cd sc-*
            bin/sc -u ${SAUCELABS_USER} -k ${SAUCELABS_KEY}
            wget --retry-connrefused --no-check-certificate -T 60 localhost:4445  # wait for app to be ready
      - run: # base image is python, so we run `nosetests`, an extension of `unittest`
          command: nosetests
      - run:
          name: Shut Down Sauce Connect Tunnel
          command: |
            kill -9 `cat /tmp/sc_client.pid`          
```
{% endraw %}

### Sauce Labs ブラウザー テスト Orb の例

Sauce Labs provide a browser testing orb for use with CircleCI that enables you to open a Sauce Labs tunnel before performing any browser testing. An example of running parallel tests using this orb is shown below:

{% raw %}
```yaml
version: 2.1

orbs:
  sauce-connect: saucelabs/sauce-connect@1.0.1

workflows:
  browser_tests:
    jobs:

      - sauce-connect/with_proxy:
          name: Chrome Tests
          steps:
            - run: mvn verify -B -Dsauce.browser=chrome  -Dsauce.tunnel="chrome"
          tunnel_identifier: chrome
      - sauce-connect/with_proxy:
          name: Safari Tests
          steps:
            - run: mvn verify -B -Dsauce.browser=safari  -Dsauce.tunnel="safari"
          tunnel_identifier: safari
```
{% endraw %}

For more detailed information about the Sauce Labs orb and how you can use the orb in your workflows, refer to the [Sauce Labs Orb](https://circleci.com/developer/orbs/orb/saucelabs/sauce-connect) page in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

## BrowserStack and Appium

As in the Sauce Labs example above, you could replace the installation of Sauce Labs with an installation of another cross-browser testing platform such as BrowserStack. Then, set the USERNAME and ACCESS_KEY [environment variables]({{ site.baseurl }}/2.0/env-vars/) to those associated with your BrowserStack account.

For mobile applications, it is possible to use Appium or an equivalent platform that also uses the WebDriver protocol by installing Appium in your job and using CircleCI [environment variables]({{ site.baseurl }}/2.0/env-vars/) for the USERNAME and ACCESS_KEY.

## Cypress

Another browser testing solution you can use in your Javascript end-to-end testing is [Cypress](https://www.cypress.io/). Unlike a Selenium-architected browser testing solution, when using Cypress, you can run tests in the same run-loop as your application. To simplify this process, you may use a CircleCI-certified orb to perform many different tests, including running all Cypress tests without posting the results to your Cypress dashboard. The example below shows a CircleCI-certified orb that enables you to run all Cypress tests without publishing results to a dashboard.

{% raw %}
```yaml
version: 2.1

orbs:
  cypress: cypress-io/cypress@1.1.0

workflows:
  build:
    jobs:

      - cypress/run
```
{% endraw %}

There are other Cypress orb examples that you can use in your configuration workflows. For more information about these other orbs, refer to the [Cypress Orbs](https://circleci.com/developer/orbs/orb/cypress-io/cypress) page in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

## Debugging Browser Tests

Integration tests can be hard to debug, especially when they're running on a remote machine. This section provides some examples of how to debug browser tests on CircleCI.

### スクリーンショットとアーティファクトの使用
{:.no_toc}

CircleCI may be configured to collect [build artifacts]({{ site.baseurl }}/2.0/artifacts/) and make them available from your build. For example, artifacts enable you to save screenshots as part of your job, and view them when the job finishes. You must explicitly collect those files with the `store_artifacts` step and specify the `path` and `destination`. See the [store_artifacts]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) section of the Configuring CircleCI document for an example.

Saving screenshots is straightforward: it's a built-in feature in WebKit and Selenium, and is supported by most test suites:

* [直接 Selenium を使用して手動で保存する](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
* [Cucumber を使用して障害時に自動的に保存する](https://github.com/mattheworiordan/capybara-screenshot)
* [Behat と Mink を使用して障害時に自動的に保存する](https://gist.github.com/michalochman/3175175)

### ローカル ブラウザーを使用して CircleCI 上の HTTP サーバーにアクセス
{:.no_toc}

If you are running a test that runs an HTTP server on CircleCI, it is sometimes helpful to use a browser running on your local machine to debug a failing test. Setting this up is easy with an SSH-enabled run.

1. CircleCI アプリの**[Job (ジョブ)] ページ**の [Rerun Job with SSH (SSH でジョブを再実行)] ボタンを使用して SSH ビルドを実行します。次のように、SSH からコンテナにログインするコマンドが表示されます。

    ssh -p 64625 ubuntu@54.221.135.43
    

2. コマンドにポート転送を追加するには、`-L` フラグを使用します。 The following example forwards requests to `http://localhost:3000` on your local browser to port `8080` on the CircleCI container. これは、ジョブで Ruby on Rails デバッグ アプリを実行し、それがポート 8080 をリスンする場合などに使用できます。 After you run this, if you go to your local browser and request http://localhost:3000, you should see whatever is being served on port 8080 of the container.

**Note:** Update `8080` to be the port you are running on the CircleCI container.

    ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
    

3. Then, open your browser on your local machine and navigate to `http://localhost:3000` to send requests directly to the server running on port `8080` on the CircleCI container. CircleCI コンテナでテスト サーバーを手動で起動し (まだ実行されていない場合)、開発マシン上のブラウザーから実行中のテスト サーバーにアクセスすることもできます。

This is a very easy way to debug things when setting up Selenium tests, for example.

### VNC からのブラウザー操作
{:.no_toc}

VNC allows you to view and interact with the browser that is running your tests. This only works if you are using a driver that runs a real browser. You can interact with a browser that Selenium controls, but PhantomJS is headless, so there is nothing to interact with.

1. VNC ビューアをインストールします。 macOS を使用している場合は、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討してください。 [RealVNC](http://www.realvnc.com/download/viewer/) もほとんどのプラットフォームで使用できます。

2. ターミナル ウィンドウを開き、CircleCI コンテナへの [SSH 実行を開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)し、リモート ポート 5901 をローカル ポート 5902 に転送します。

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```

3. `vnc4server` パッケージと `metacity` パッケージをインストールします。 `metacity` を使用して、ブラウザーを操作し、ターミナル ウィンドウに戻ります。

```bash
sudo apt install vnc4server metacity
```

4. CircleCI コンテナに接続したら、VNC サーバーを起動します。

```bash
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```

5. SSH の接続はセキュリティ保護されているため、強力なパスワードは必要ありません。 しかし、パスワードが *1* つ必要なので、プロンプトに `password` を入力します。

6. VNC ビューアを起動し、`localhost:5902` に接続します。 プロンプトに `password` を入力します。

7. ターミナル ウィンドウが含まれるディスプレイが表示されます。 SSH トンネルを通して接続はセキュリティ保護されているため、安全ではない接続または暗号化されていない接続に関する警告は無視してください。

8. VNC サーバーでウィンドウを開くために、`DISPLAY` 変数を設定します。 このコマンドを実行しないと、ウィンドウはデフォルトの (ヘッドレス) X サーバーで開きます。

```bash
ubuntu@box159:~$ export DISPLAY=:1.0
```

9. `metacity` をバックグラウンドで起動します。

```bash
ubuntu@box159:~$ metacity &
```

10. `firefox` をバックグラウンドで起動します。

```bash
ubuntu@box159:~$ firefox &
```

Now, you can run integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### CircleCI の X サーバーの共有
{:.no_toc}

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use `x11vnc` to attach a VNC server to X.

1. [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) をダウンロードして、テストの前に起動します。

    steps:
      - run:
          name: Download and start X
          command: |
            sudo apt-get install -y x11vnc
            x11vnc -forever -nopw
          background: true
    

2. これで、[SSH ビルドを開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)すると、デフォルトのテスト ステップの実行中に VNC サーバーに接続できます。 SSH トンネルの機能を持つ VNC ビューアを使用するか、独自のトンネルをセットアップできます。

    $ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
    

## X11 forwarding over SSH

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

1. コンピューターに X Window System をインストールします。 macOS を使用している場合は、\[XQuartz\] (http://xquartz.macosforge.org/landing/) の使用を検討してください。

2. システムで X をセットアップしたら、CircleCI VM に対して [SSH ビルドを開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)します。`-X` フラグを使用して転送をセットアップします。

    daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
    

This will start an SSH session with X11 forwarding enabled.

3. お使いのマシンに VM のディスプレイを接続するには、ディスプレイ環境変数を `localhost:10.0` に設定します。

    ubuntu@box10$ export DISPLAY=localhost:10.0
    

4. xclock を起動して、すべて正しく動作していることを確認します。

    ubuntu@box10$ xclock
    

You can kill xclock with `Ctrl+c` after it appears on your desktop.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

## See Also

[Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/)