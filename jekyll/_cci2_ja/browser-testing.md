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
{: #prerequisites }
{:.no_toc}

「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」を参照し、Java 8、geckodriver、Firefox、Chrome などのバリアントのイメージ名に `-browsers:` を付加してください。 PhantomJS などの バリアントのイメージ名には `-browsers-legacy` を付加してください。

## 概要
{: #overview }
{:.no_toc}

コードをコミットしてプッシュするたびに、選択したブラウザーに対するすべてのテストが、CircleCI によって自動的に実行されます。 ブラウザー ベースのテストは、変更が行われるたび、各デプロイの前、または特定のブランチで実行されるように構成できます。

## Selenium
{: #selenium }

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
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Selenium のダウンロード
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Selenium の起動
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

サンプル アプリケーションについては、「[2.0 プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)」の「Selenium のインストール・実行によるブラウザー テストの自動化」セクションを参照してください。 Ruby on Rails 用の Capybara/Selenium/Chrome ヘッドレス CircleCI 2.0 設定ファイルの例については、[Knapsack Pro のドキュメント](http://docs.knapsackpro.com/2017/circleci-2-0-capybara-feature-specs-selenium-webdriver-with-chrome-headless)を参照してください。

ヘッドレス Chrome の使用方法については、CircleCI のブログ記事「[Headless Chrome for More Reliable, Efficient Browser Testing (ヘッドレス Chrome を使用した高効率かつ高信頼性のブラウザー テスト)](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)」や、関連する[ディスカッション スレッド](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112)を参照してください。

Selenium 用の環境を設定する代わりに、LambdaTest、Sauce Labs、BrowserStack などのクラウドベースのプラットフォームに移行することも可能です。 クロスブラウザー テストを実行するこれらのクラウドは、クラウド上に既製のインフラストラクチャを提供しているため、開発者が Selenium 環境の構成に時間をかける必要はありません。

## LambdaTest
{: #lambdatest }

すばやい市場投入をご支援するべく、LambdaTest を CircleCI に統合しました。 自動化されたクロスブラウザー テストを LambdaTest で実行して、複数のマシンから実行される 2,000 以上の実ブラウザーを提供するオンライン Selenium Grid を通して、開発コードがクラウド上でシームレスに実行されていることを確認できます。 自動化テストを LambdaTest の Selenium Grid と並列に実行して、テスト サイクルを大幅に短縮できます。

LambdaTest は、ローカルに保存された Web ページのクロスブラウザー テストを実行できるように、Lambda Tunnel という名前の SSH (Secure Shell) トンネル接続を提供しています。 Lambda Tunnel を使用して、CircleCI ビルド コンテナ内でテスト サーバーを実行し、LambdaTest の Selenium Grid から提供されるブラウザー上で、自動化されたクロスブラウザー テストを実行することができます。 このように、Web サイトを公開する前に、訪問者に対してどのように表示されるのか確認することができます。

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
{: #sauce-labs }

Sauce Labs has an extensive network of operating system and browser combinations you can test your web application against. Sauce Labs supports automated web app testing using Selenium WebDriver scripts as well as through `saucectl`, their test orchestrator CLI, which can be used to execute tests directly from a variety of JavaScript frameworks.

### saucectl
{: #saucectl }

If you are using JavaScript to test your web application, you can still take advantage of the Sauce Labs platform by using [`saucectl`](https://docs.saucelabs.com/testrunner-toolkit) with the JS framework of your choice, and then integrating the [saucectl-run orb](https://circleci.com/developer/orbs/orb/saucelabs/saucectl-run) in your CircleCI workflow.

1. Add your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` as [environment variables]({{site.baseurl}}/2.0/env-vars/) in your Circle CI project.
2. Modify your CircleCI project `config.yml` to include the saucectl-run orb and then call the orb as a job in your workflow.

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

JavaScript エンドツーエンド テストに使用できるブラウザー テスト ソリューションとして、他にも [Cypress](https://www.cypress.io/) があります。 Selenium アーキテクチャを利用するブラウザー テスト ソリューションとは異なり、Cypress を使用する場合は、アプリケーションと同じ実行ループでテストを実行できます。 このプロセスを簡素化するために、CircleCI 承認済み Orb を使用して、結果を Cypress ダッシュボードにポストせずにすべての Cypress テストを実行するなどのさまざまなテストを実行することができます。 以下に例示する CircleCI 承認済み Orb では、結果がダッシュボードにパブリッシュされずに、すべての Cypress テストが実行されます。

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

設定ファイルのワークフローに使用できる Cypress Orb の例は他にもあります。 これらの Orb の詳細については、[CircleCI Orbs レジストリ](https://circleci.com/developer/ja/orbs)にある[Cypress Orbs のページ](https://circleci.com/developer/ja/orbs/orb/cypress-io/cypress)を参照してください。

## ブラウザー テストのデバッグ
{: #debugging-browser-tests }

インテグレーション テストのデバッグは一筋縄では行きません。特に、リモート マシンで実行されている場合はなおさらです。 このセクションでは、CircleCI 上でブラウザー テストをデバッグする方法の例をいくつか示します。

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

If you are running a test that runs an HTTP server on CircleCI, it is sometimes helpful to use a browser running on your local machine to debug a failing test. Setting this up is easy with an SSH-enabled run.

1. Run an SSH build using the Rerun Job with SSH button on the **Job page** of the CircleCI app. The command to log into the container over SSH is as follows:
```
ssh -p 64625 ubuntu@54.221.135.43
```
2. To add port-forwarding to the command, use the `-L` flag. The following example forwards requests to `http://localhost:3000` on your local browser to port `8080` on the CircleCI container. This would be useful, for example, if your job runs a debug Ruby on Rails app, which listens on port 8080. After you run this, if you go to your local browser and request http://localhost:3000, you should see whatever is being served on port 8080 of the container.

**Note:** Update `8080` to be the port you are running on the CircleCI container.
```
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```
3. Then, open your browser on your local machine and navigate to `http://localhost:3000` to send requests directly to the server running on port `8080` on the CircleCI container. You can also manually start the test server on the CircleCI container (if it is not already running), and you should be able to access the running test server from the browser on your development machine.

This is a very easy way to debug things when setting up Selenium tests, for example.

### VNC からのブラウザー操作
{: #interacting-with-the-browser-over-vnc }
{:.no_toc}

VNC allows you to view and interact with the browser that is running your tests. This only works if you are using a driver that runs a real browser. You can interact with a browser that Selenium controls, but PhantomJS is headless, so there is nothing to interact with.

1. Install a VNC viewer. If you're using macOS, consider [Chicken of the VNC](http://sourceforge.net/projects/chicken/). [RealVNC](http://www.realvnc.com/download/viewer/) is also available on most platforms.

2. Open a Terminal window, [start an SSH run]({{ site.baseurl }}/2.0/ssh-access-jobs/) to a CircleCI container and forward the remote port 5901 to the local port 5902.

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```
3. Install the `vnc4server` and `metacity` packages. You can use `metacity` to move the browser around and return to your Terminal window.

```bash
sudo apt install vnc4server metacity
```
4. After connecting to the CircleCI container, start the VNC server.

```bash
ubuntu@box159:~$ vncserver -geometry 1280x1024 -depth 24
```
5. Since your connection is secured with SSH, there is no need for a strong password. However, you still need _a_ password, so enter `password` at the prompt.

6. Start your VNC viewer and connect to `localhost:5902`. Enter your `password` at the prompt.

7. You should see a display containing a terminal window. Since your connection is secured through the SSH tunnel, ignore any warnings about an insecure or unencrypted connection.

8. To allow windows to open in the VNC server, set the `DISPLAY` variable. Without this command, windows would open in the default (headless) X server.

```bash
ubuntu@box159:~$ export DISPLAY=:1.0
```
9. Start `metacity` in the background.

```bash
ubuntu@box159:~$ metacity &
```
10. Start `firefox` in the background.

```bash
ubuntu@box159:~$ firefox &
```

Now, you can run integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

### CircleCI の X サーバーの共有
{: #sharing-circlecis-x-server }
{:.no_toc}

If you find yourself setting up a VNC server often, then you might want to automate the process. You can use `x11vnc` to attach a VNC server to X.

1. Download [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) and start it before your tests:

```
steps:
  - run:
      name: Download and start X
      command: |
        sudo apt-get install -y x11vnc
        x11vnc -forever -nopw
      background: true
```
2. Now when you [start an SSH build]({{ site.baseurl }}/2.0/ssh-access-jobs/), you'll be able to connect to the VNC server while your default test steps run. You can either use a VNC viewer that is capable of SSH tunneling, or set up a tunnel on your own:
```
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## over SSH によるX11 転送
{: #x11-forwarding-over-ssh }

CircleCI also supports X11 forwarding over SSH. X11 forwarding is similar to VNC &mdash; you can interact with the browser running on CircleCI from your local machine.

1. Install an X Window System on your computer. If you're using macOS, consider \[XQuartz\] (http://xquartz.macosforge.org/landing/).

2. With X set up on your system, [start an SSH build]({{ site.baseurl }}/2.0/ssh-access-jobs/) to a CircleCI VM, using the `-X` flag to set up forwarding:

```
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```
This will start an SSH session with X11 forwarding enabled.

3. To connect your VM's display to your machine, set the display environment variable to `localhost:10.0`

```
ubuntu@box10$ export DISPLAY=localhost:10.0
```
4. Check that everything is working by starting xclock.

```
ubuntu@box10$ xclock
```
You can kill xclock with `Ctrl+c` after it appears on your desktop.

Now you can run your integration tests from the command line and watch the browser for unexpected behavior. You can even interact with the browser as if the tests were running on your local machine.

## 関連項目
{: #see-also }

[Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/)
