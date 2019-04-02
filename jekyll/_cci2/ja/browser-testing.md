---
layout: classic-docs
title: Browser Testing
description: CircleCI でのブラウザーのテスト
category:
  - test
---
このドキュメントでは、CircleCI の構成をブラウザーでテストおよびデバッグする一般的な方法について説明します。このドキュメントには以下のセクションがあります。

* TOC
{:toc}

## 前準備
{:.no_toc}

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, Geckodriver, Firefox, and Chrome. Add `-browsers-legacy` to the image name for a variant which includes PhantomJS.

## Overview
{:.no_toc}

コードをプッシュしてコミットするごとに、CircleCI は選択したブラウザーに対してすべてのテストを自動的に実行します。 ブラウザーベースのテストは、変更が行われたとき、すべてのデプロイの前、またはとテイクのブランチのたびに実行されるよう構成できます。

## Selenium

ブラウザーテスト用の多くの自動化ツールは、広く採用されているブラウザー駆動標準である Selenium WebDriver を使用しています。

Selenium WebDriver には、Java、Python、Ruby などいくつかの一般的な言語で実装されているブラウザーをプログラムで動かすための、一般的な API が含まれています。 Selenium WebDriver は、これらのブラウザー用に統一されたインターフェースを用意しているため、ブラウザーテストは 1 回だけ作成すれば十分です。 これらのテストは、すべてのブラウザーとプラットフォームで動作します。 セットアップの詳細については、[Selenium のドキュメント](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project)を参照してください。 仮想フレームバッファ X サーバーのドキュメントについては、[Xvfb のマニュアルページ](http://www.xfree86.org/4.0.1/Xvfb.1.html)を参照してください。

WebDriver は、ローカルとリモートの 2 つのモードで動作できます。 ローカルで実行すると、テストは Selenium WebDriver ライブラリを使用し、同じマシンのブラウザーと直接通信を行います。 リモートで実行すると、テストは Selenium サーバーと連携し、サーバーがブラウザーを動かします。

プライマリ Docker イメージに Selenium が含まれていない場合、次に示すように Selenium をインストールし、実行できます。

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:jessie-browsers
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

Refer to the [Install and Run Selenium to Automate Browser Testing]({{ site.baseurl }}/2.0/project-walkthrough/) section of the 2.0 Project Tutorial for a sample application. Ruby on Rails 用の Capybara/Selenium/Chrome headless CircleCI 2.0 構成のレイについては、[Knapsack Pro のドキュメント](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless)を参照してください。

Headless Chrome の使用方法の詳細については、CircleCI ブログの投稿「[Headless Chrome による、より信頼性が高く効率的なブラウザーテスト](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)」および、それに関連する[ディスカッションスレッド](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112)を参照してください。

環境を Selenium 用に構成する代わりに、Sauce Labs から提供されている Selenium Server をサービスとして使用することもできます。これにより、多くのブラウザーとシステムの組み合わせをテストに使用できます。 Sauce Labs は、すべてのテスト実行のビデオなど、役に立つ他の資料も用意しています。

## Sauce Labs

Sauce Labs operates browsers on a network that is separate from CircleCI build containers. To allow the browsers access the web application you want to test, run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs' secure tunnel [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).

Sauce Connect allows you to run a test server within the CircleCI build container and expose it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you run your browser tests after deploying to a publicly accessible staging environment, you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `config.yml` file shows how to run browser tests through Sauce Labs against a test server running within a CircleCI build container.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:jessie-node-browsers
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

### Sauce Labs Browser Testing Orb Example

CircleCI has developed a Sauce labs browser testing orb that enables you to open a Sauce Labs tunnel before performing any browser testing. This orb (a package of configurations that you can use in your workflow) has been developed and certified for use and can simplify your configuration workflows. An example of the orb is shown below.

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
    

For more detailed information about the Sauce Labs orb and how you can use the orb in your workflows, refer to the [Sauce Labs Orb](https://circleci.com/orbs/registry/orb/saucelabs/sauce-connect) page in the \[CircleCI Orbs Registry\] (https://circleci.com/orbs/registry/).

## BrowserStack と Appium

上述の Sauce Labs と同様に、Sauce Labs の代わりに、BrowserStack など他の、複数のブラウザーに対応したテスト用プラットフォームをインストールすることもできます。 その後で、USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/2.0/env-vars/)を、自分の BrowserStack アカウントのものに設定します。

モバイルアプリケーションの場合、Appium をジョブにインストールし、CircleCI の USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/2.0/env-vars/)を使用して、Appium、または WebDriver プロトコルを使用する同等のプラットフォームを使用することもできます。

## Cypress

Another browser testing solution you can use in your Javascript end-to-end testing is \[Cypress\] (https://www.cypress.io/). Unlike a Selenium-architected browser testing solution, when using Cypress, you can run tests in the same run-loop as your application. To simplify this process, you may use a CircleCI-certified orb to perform many different tests, including running all Cypress tests without posting the results to your Cypress dashboard. The example below shows a CircleCI-certified orb that enables you to run all Cypress tests without publishing results to a dashboard.

    version: 2.1
    orbs:
      cypress: cypress-io/cypress@1.1.0
    workflows:
      build:
        jobs:
          - cypress/run
    

There are other Cypress orb examples that you can use in your configuration workflows. For more information about these other orbs, refer to the [Cypress Orbs](https://circleci.com/orbs/registry/orb/cypress-io/cypress) page in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/).

## ブラウザーテストのデバッグ

Integration tests can be hard to debug, especially when they're running on a remote machine. This section provides some examples of how to debug browser tests on CircleCI.

### スクリーンショットとアーティファクトの使用
{:.no_toc}

CircleCI may be configured to collect [build artifacts]({{ site.baseurl }}/2.0/artifacts/) and make them available from your build. For example, artifacts enable you to save screenshots as part of your job, and view them when the job finishes. これらのファイルは `store_artifacts` ステップで明示的に収集し、`path` および `destination` を指定する必要があります。 See the [store_artifacts]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) section of the Configuring CircleCI document for an example.

スクリーンショットの保存は簡単です。これは WebKit および Selenium に組み込まれた機能で、ほとんどのテストスィートでサポートされています。

* [Selenium を直接使用して手動で](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
* [Cucumber を使用して障害時に自動的に](https://github.com/mattheworiordan/capybara-screenshot)
* [Behat と Mink を使用して障害時に自動的に](https://gist.github.com/michalochman/3175175)

### ローカルブラウザーを使用して CircleCI の HTTP サーバーにアクセスする
{:.no_toc}

If you are running a test that runs an HTTP server on CircleCI, it is sometimes helpful to use a browser running on your local machine to debug a failing test. Setting this up is easy with an SSH-enabled run.

1. Run an SSH build using the Rerun Job with SSH button on the **Job page** of the CircleCI app. The command to log into the container over SSH apears, as follows:

    ssh -p 64625 ubuntu@54.221.135.43
    

1. コマンドへのポート転送を追加するには、`-L` フラグを使用します。 The following example forwards requests to `http://localhost:8080` to port `3000` on the CircleCI container. This would be useful, for example, if your job runs a debug Ruby on Rails app, which listens on port 8080.

    ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
    

1. 次に、ローカルマシンでブラウザーを開き、`http://localhost:8080` を開いて、CircleCI コンテナのポート `3000` で実行されているサーバーに要求を直接転送します。 または、CircleCI コンテナ上でテストサーバーを手作業で開始 (既に実行中でなければ) すると、開発用マシンのブラウザーから、実行中のテストサーバーにアクセスできるようになります。

This is a very easy way to debug things when setting up Selenium tests, for example.

### VNC 上でのブラウザーとの連携
{:.no_toc}

VNC allows you to view and interact with the browser that is running your tests. This only works if you are using a driver that runs a real browser. You can interact with a browser that Selenium controls, but PhantomJS is headless, so there is nothing to interact with.

1. VNC ビューアをインストールします。 macOS を使用している場合、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討します。 [RealVNC](http://www.realvnc.com/download/viewer/) も、ほとんどのプラットフォームで使用できます。

2. Open a Terminal window, [start an SSH run]({{ site.baseurl }}/2.0/ssh-access-jobs/) to a CircleCI container and forward the remote port 5901 to the local port 5902.

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```

1. Install the `vnc4server` and `metacity` packages. You can use `metacity` to move the browser around and return to your Terminal window.

```bash
sudo apt install vnc4server metacity
```

1. CircleCI コンテナに接続してから、VNC サーバーを開始します。

```bash
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```

1. Since your connection is secured with SSH, there is no need for a strong password. However, you still need *a* password, so enter `password` at the prompt.

2. Start your VNC viewer and connect to `localhost:5902`. Enter your `password` at the prompt.

3. You should see a display containing a terminal window. Since your connection is secured through the SSH tunnel, ignore any warnings about an insecure or unencrypted connection.

4. To allow windows to open in the VNC server, set the `DISPLAY` variable. Without this command, windows would open in the default (headless) X server.

```bash
ubuntu@box159:~$ export DISPLAY=:1.0
```

1. `metacity` をバックグラウンドで開始します。

```bash
ubuntu@box159:~$ metacity &
```

1. `firefox` をバックグラウンドで開始します。

```bash
ubuntu@box159:~$ firefox &
```

Now, you can run integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### CircleCI の X サーバーの共有
{:.no_toc}

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use `x11vnc` to attach a VNC server to X.

1. [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) をダウンロードし、テストの前に開始します。

    steps:
      - run:
          name: Download and start X
          command: |
            sudo apt-get install -y x11vnc
            x11vnc -forever -nopw
          background: true
    

1. これで、[SSH ビルドを開始する]({{ site.baseurl }}/2.0/ssh-access-jobs/)とき、デフォルトのテストステップが実行されている間に VNC サーバーへ接続できます。 SSH トンネリングが可能な VNC ビューアを使用するか、自分でトンネルをセットアップできます。

    $ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
    

## SSH 上の X11 転送

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

1. Install an X Window System on your computer. If you're using macOS, consider \[XQuartz\] (http://xquartz.macosforge.org/landing/).

2. システムに X がセットアップされた状態で、CircleCI VM への [SSH ビルドを開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)し、`-X` フラグを使用して転送をセットアップします。

    daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
    

これによって、X11 転送が有効な状態で SSH セッションが開始されます。

1. VM の表示を自分のマシンと接続するには、display 環境変数を `localhost:10.0` に設定します。

    ubuntu@box10$ export DISPLAY=localhost:10.0
    

1. xclock を開始し、すべてが動作していることをチェックします。

    ubuntu@box10$ xclock
    

xclock がデスクトップに表示された後で、`Ctrl+c` を使用して終了できます。

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

## See Also

[Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/)