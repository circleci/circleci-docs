---
layout: classic-docs
title: ブラウザーのテスト
description: CircleCI でのブラウザーのテスト
category:
  - テスト
---
このドキュメントでは、CircleCI の構成をブラウザーでテストおよびデバッグする一般的な方法について説明します。このドキュメントには以下のセクションがあります。

* TOC {:toc}

## 前準備

{:.no_toc}

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, Geckodriver, Firefox, and Chrome. Add `-browsers-legacy` to the image name for a variant which includes PhantomJS.

## 概要

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
      - image: circleci/node-jessie-browsers
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

## BrowserStack と Appium

上述の Sauce Labs と同様に、Sauce Labs の代わりに、BrowserStack など他の、複数のブラウザーに対応したテスト用プラットフォームをインストールすることもできます。 その後で、USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/2.0/env-vars/)を、自分の BrowserStack アカウントのものに設定します。

モバイルアプリケーションの場合、Appium をジョブにインストールし、CircleCI の USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/2.0/env-vars/)を使用して、Appium、または WebDriver プロトコルを使用する同等のプラットフォームを使用することもできます。

## ブラウザーテストのデバッグ

統合テストは、特にリモートマシンで実行している場合、デバッグが困難なことがあります。このセクションでは、CircleCI でブラウザーテストをデバッグする方法について、いくつかの例を紹介します。

### スクリーンショットとアーティファクトの使用

{:.no_toc}

CircleCI の構成により、[ビルドアーティファクト]({{ site.baseurl }}/2.0/artifacts/)を収集し、自分のビルドから使用可能にできます。 For example, artifacts enable you to save screenshots as part of your job, and view them when the job finishes. これらのファイルは `store_artifacts` ステップで明示的に収集し、`path` および `destination` を指定する必要があります。 See the [store_artifacts]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) section of the Configuring CircleCI document for an example.

スクリーンショットの保存は簡単です。これは WebKit および Selenium に組み込まれた機能で、ほとんどのテストスィートでサポートされています。

* [Selenium を直接使用して手動で](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
* [Cucumber を使用して障害時に自動的に](https://github.com/mattheworiordan/capybara-screenshot)
* [Behat と Mink を使用して障害時に自動的に](https://gist.github.com/michalochman/3175175)

### ローカルブラウザーを使用して CircleCI の HTTP サーバーにアクセスする

{:.no_toc}

CircleCI 上で HTTP サーバーを実行するテストを行う場合、ローカルマシン上で実行されているブラウザーを使用して、失敗したテストのデバッグを行えると便利です。 この操作、SSH 対応の実行により簡単にセットアップできます。

1. Run an SSH build using the Rerun Job with SSH button on the **Job page** of the CircleCI app. The command to log into the container over SSH apears, as follows:

    ssh -p 64625 ubuntu@54.221.135.43
    

1. コマンドへのポート転送を追加するには、`-L` フラグを使用します。 次の例では、`http://localhost:3000` への要求を、CircleCI コンテナのポート `8080` に転送します。 This would be useful, for example, if your job runs a debug Ruby on Rails app, which listens on port 8080.

    ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
    

1. 次に、ローカルマシンでブラウザーを開き、`http://localhost:8080` を開いて、CircleCI コンテナのポート `3000` で実行されているサーバーに要求を直接転送します。 または、CircleCI コンテナ上でテストサーバーを手作業で開始 (既に実行中でなければ) すると、開発用マシンのブラウザーから、実行中のテストサーバーにアクセスできるようになります。

この方法で、たとえば Selenium テストをセットアップするときのデバッグが非常に簡単になります。

### VNC 上でのブラウザーとの連携

{:.no_toc}

VNC を使用すると、テストを実行しているブラウザーを表示し、連携が可能になります。 この方法は、実際のブラウザーを実行しているドライバを使用しているときのみ機能します。 Selenium がコントロールしているブラウザーとは連携できますが、PhantomJS はヘッドレスなので、連携できません。

1. VNC ビューアをインストールします。 macOS を使用している場合、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討します。 [RealVNC](http://www.realvnc.com/download/viewer/) も、ほとんどのプラットフォームで使用できます。

2. ターミナルウィンドウを開き、CircleCI コンテナに対して [SSH の実行を開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)し、リモートポート 5901 からローカルポート 5902 へ転送します。

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```

1. `vnc4server` および `metacity` パッケージをインストールします。`metacity` を使用してブラウザーを移動し、ターミナルウィンドウに戻すことができます。

```bash
sudo apt install vnc4server metacity
```

1. CircleCI コンテナに接続してから、VNC サーバーを開始します。

```bash
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```

1. SSH により接続のセキュリティが保護されているので、強力なパスワードの必要はありません。ただし、パスワード*は*依然として必要なので、プロンプトで `password` と入力します。

2. VNC ビューアを開始し、`localhost:5902` に接続します。プロンプトで `password` と入力します。

3. ディスプレイにターミナルウィンドウが表示されます。SSH トンネルによって接続のセキュリティが保護されているので、セキュアでない、または暗号化されていない接続についての警告は無視します。

4. VNC サーバーでウィンドウを開けるようにするため、`DISPLAY` 変数を設定します。このコマンドを使用しない場合、ウィンドウはデフォルトの (ヘッドレス) X サーバーに開きます。

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

これで、コマンドラインから統合テストを実行し、予期しない動作がないかブラウザーで確認できます。テストがローカルマシンで実行されているときと同様に、ブラウザーを操作することもできます。

### CircleCI の X サーバーの共有

{:.no_toc}

VNC サーバーのセットアップを頻繁に行う場合、プロセスを自動化できます。`x11vnc` を使用して、VNC サーバーを X に接続できます。

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

CircleCI は、SSH 上の X11 転送もサポートしています。X11 転送は VNC とほぼ同じで、CircleCI 上で実行されているブラウザーを、ローカルマシンから操作できます。

1. コンピュータに X Window システムをインストールします。macOS を使用している場合、[XQuartz](http://xquartz.macosforge.org/landing/) を検討します。

2. システムに X がセットアップされた状態で、CircleCI VM への [SSH ビルドを開始]({{ site.baseurl }}/2.0/ssh-access-jobs/)し、`-X` フラグを使用して転送をセットアップします。

    daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
    

これによって、X11 転送が有効な状態で SSH セッションが開始されます。

1. VM の表示を自分のマシンと接続するには、display 環境変数を `localhost:10.0` に設定します。

    ubuntu@box10$ export DISPLAY=localhost:10.0
    

1. xclock を開始し、すべてが動作していることをチェックします。

    ubuntu@box10$ xclock
    

xclock がデスクトップに表示された後で、`Ctrl+c` を使用して終了できます。

これで、コマンドラインから統合テストを実行し、予測しない動作がないかブラウザーで確認できます。テストがローカルマシンで実行されているときと同様に、ブラウザーを操作することもできます。

## See Also

[Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/)