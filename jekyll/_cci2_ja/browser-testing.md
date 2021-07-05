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
ブラウザー テストに使用される多くの自動化ツールには、広く採用されているブラウザー ドライバー標準である Selenium WebDriver が使用されています。
{:.no_toc}

コードをコミットしてプッシュするたびに、選択したブラウザーに対するすべてのテストが、CircleCI によって自動的に実行されます。 ブラウザー ベースのテストは、変更が行われるたび、各デプロイの前、または特定のブランチで実行されるように構成できます。

## Selenium
{: #selenium }

ヘッドレス Chrome の使用方法については、CircleCI のブログ記事「[Headless Chrome for More Reliable, Efficient Browser Testing (ヘッドレス Chrome を使用した高効率かつ高信頼性のブラウザー テスト)](https://circleci.com/blog/headless-chrome-more-reliable-efficient-browser-testing/)」や、関連する[ディスカッション スレッド](https://discuss.circleci.com/t/headless-chrome-on-circleci/20112)を参照してください。

Selenium WebDriver には、Java、Python、Ruby などの一般的な言語で実装されたブラウザーをプログラムによって操作するための共通 API が用意されています。 Selenium WebDriver からこれらのブラウザー用の統合インターフェイスが提供されるため、開発者が何度もブラウザー テストを作成する必要はありません。 これらのテストは、すべてのブラウザーとプラットフォームで機能します。 セットアップの詳細については、[Selenium のドキュメント](https://www.seleniumhq.org/docs/03_webdriver.jsp#setting-up-a-selenium-webdriver-project)を参照してください。 仮想フレームバッファ X サーバーのドキュメントについては、[Xvfb のマニュアル ページ](http://www.xfree86.org/4.0.1/Xvfb.1.html)を参照してください。

WebDriver には、ローカルとリモートの 2 種類の動作モードがあります。 テストをローカルで実行する場合は、Selenium WebDriver ライブラリを使用して、同じマシン上のブラウザーを直接操作します。 テストをリモートで実行する場合は、Selenium Server と通信し、サーバーからブラウザーを操作します。

ネットワーク ログ、コマンド ログ、Selenium ログ、各コマンドのステップバイステップ スクリーンショット、テスト実行全体のビデオ、メタデータなど、自動化スクリプトの詳細なテスト レポートを分析できます。

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

以下に、CircleCI と LambdaTest を統合するための設定ファイルの例を示します。

Selenium 用の環境を設定する代わりに、LambdaTest、Sauce Labs、BrowserStack などのクラウドベースのプラットフォームに移行することも可能です。 クロスブラウザー テストを実行するこれらのクラウドは、クラウド上に既製のインフラストラクチャを提供しているため、開発者が Selenium 環境の構成に時間をかける必要はありません。

## LambdaTest
{: #lambdatest }

すばやい市場投入をご支援するべく、LambdaTest を CircleCI に統合しました。 自動化されたクロスブラウザー テストを LambdaTest で実行して、複数のマシンから実行される 2,000 以上の実ブラウザーを提供するオンライン Selenium Grid を通して、開発コードがクラウド上でシームレスに実行されていることを確認できます。 自動化テストを LambdaTest の Selenium Grid と並列に実行して、テスト サイクルを大幅に短縮できます。

LambdaTest は、ローカルに保存された Web ページのクロスブラウザー テストを実行できるように、Lambda Tunnel という名前の SSH (Secure Shell) トンネル接続を提供しています。 Lambda Tunnel を使用して、CircleCI ビルド コンテナ内でテスト サーバーを実行し、LambdaTest の Selenium Grid から提供されるブラウザー上で、自動化されたクロスブラウザー テストを実行することができます。 このように、Web サイトを公開する前に、訪問者に対してどのように表示されるのか確認することができます。

LambdaTest は、ブラウザー互換性テストのために CircleCI Orb を開発しました。 これを使用して、ブラウザー テストを実行する前に Lambda Tunnel を開くことができます。 Use the orb to quickly set up a Lambda tunnel and the define your test steps

{% raw %}
```yaml
# 詳細は https://circleci.com/ja/docs/2.0/language-javascript/ を参照
version: 2
jobs:
  build:
    docker:
      # ここで必要なバージョンを指定します

      - image: circleci/node:7.10
      # 必要に応じて、ここでサービスの依存関係を指定します
      # CircleCI は https://circleci.com/ja/docs/2.0/circleci-images/ に
      # 記載されたビルド済みイメージのライブラリを提供しています
      # オーナーになるためにフォークする必要がある github リポジトリが作業ディレクトリとなります
    working_directory: ~/nightwatch-sample-for-circleci
    steps:

      - checkout

      - run:
          name: "カスタム環境変数のセットアップ // ワークフロー ステップ"
          command: |
            echo 'export LT_USERNAME="{your_lambdatest_username}"' >> $BASH_ENV

      - run:
          name: "カスタム環境変数のセットアップ"
          command: |
            echo 'export LT_ACCESS_KEY="{your_lambda_access_key}"' >> $BASH_ENV

      - run: # 上記の環境変数のバリデーションを行います
          name: "LT_Username: "
          command: echo ${LT_USERNAME}      
      # 依存関係をダウンロードしてキャッシュします

      - restore_cache:
          keys:

            - v1-dependencies-{{ checksum "package-lock.json" }}
        #正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします

      - run: npm をインストール
      # テストを実行します！

      - run: node_modules/.bin/nightwatch -e chrome // bash でテストを実行
```
{% endraw %}

## Sauce Labs
{: #sauce-labs }

Sauce Labs は、CircleCI ビルド コンテナから独立したネットワーク上にあるブラウザーを操作します。 ブラウザーからテスト対象の Web アプリケーションにアクセスするには、Sauce Labs のセキュア トンネル [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy) を使用して、CircleCI 上の Sauce Labs で Selenium WebDriver テストを実行します。

Sauce Connect を使用すると、CircleCI ビルド コンテナ内でテスト サーバーを実行でき、(`localhost:8080` などの URL を使用して) それを Sauce Labs のブラウザーに公開することができます。 パブリックにアクセス可能なステージング環境にデプロイした後にブラウザー テストを実行する場合は、Sauce Connect には関係なく通常の方法で Sauce Labs を使用できます。

この例の `config.yml` ファイルは、CircleCI ビルド コンテナ内で実行されているテスト サーバーに対して、Sauce Labs を通してブラウザー テストを実行する方法を示しています。

{% raw %}
```yaml
# JavaScript Node CircleCI 2.0 設定ファイル

詳細は https://circleci.com/ja/docs/2.0/language-javascript/ を参照

version: 2
jobs:
  build: docker: # ここで必要なバージョンを指定します
    - image: circleci/node:7.10
    # 必要に応じて、ここでサービスの依存関係を指定します
    working_directory: ~/Nightwatch-circleci-selenium

    steps:

      - checkout
      - run:
        name: "トンネル バイナリのダウンロード"
          command: |
          wget http://downloads.lambdatest.com/tunnel/linux/64bit/LT_Linux.zip
      - run:
        name: "トンネル バイナリの抽出"
          command: |
          sudo apt-get install unzip
          unzip LT_Linux.zip
      - run:
        name: "トンネル バイナリの実行"
          background: true
          command: |
            ./LT -user ${LAMBDATEST_EMAIL} -key ${LAMBDATEST_KEY}
            sleep 40
      - run:
        name: "カスタム環境変数のセットアップ"
          command: |
            echo 'export LT_USERNAME="${LAMBDATEST_USERNAME}"' >> $BASH_ENV
      - run:
          name: "カスタム環境変数のセットアップ"
          command: |
            echo 'export LT_ACCESS_KEY="${LAMBDATEST_ACCESS_KEY}"' >> $BASH_ENV
      - run: # 現在のブランチをテストします
          name: "LT_Username: "
          command: echo ${LT_USERNAME}      

      # 依存関係をダウンロードしてキャッシュします
      - restore_cache:
        keys:
          - v1-dependencies-{{ checksum "package-lock.json" }}
      # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします

      - run: npm をインストール

      - save_cache:
          paths:
            - node_modules
                key: v1-dependencies-{{ checksum "package-lock.json" }}

        # テストを実行します！

      - run: node_modules/.bin/nightwatch -e chrome
```
{% endraw %}

### ローカルまたはプライベートにホスティングされたプロジェクトのテスト
{: #sauce-labs-browser-testing-orb-example }

CircleCI は、ブラウザー テストを実行する前に Sauce Labs トンネルを開くことができる Sauce Labs ブラウザー テスト Orb を開発しました。 An example of running parallel tests using this orb is shown below:

{% raw %}
```yaml
version: 2.1
orbs:
  sauce-connect: saucelabs/sauce-connect@1.0.1
workflows:
  browser_tests:
    jobs:
      - sauce-connect/with_proxy:
          name: Chrome テスト
          steps:
            - run: mvn verify -B -Dsauce.browser=chrome  -Dsauce.tunnel="chrome"
          tunnel_identifier: chrome
      - sauce-connect/with_proxy:
          name: Safari テスト
          steps:
            - run: mvn verify -B -Dsauce.browser=safari  -Dsauce.tunnel="safari"
          tunnel_identifier: safari
```
{% endraw %}

Sauce Labs Orb の詳細と、この Orb をワークフローに使用する方法については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)にある [Sauce Labs Orb のページ](https://circleci.com/developer/ja/orbs/orb/saucelabs/sauce-connect)を参照してください。

## BrowserStack と Appium
{: #browserstack-and-appium }

上の Sauce Labs の例の Sauce Labs のインストールを、BrowserStack などの別のクロスブラウザー テスト プラットフォームのインストールに置き換えることができます。 次に、USERNAME および ACCESS_KEY [環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)を自分の BrowserStack アカウントに関連付けられた値に設定します。

モバイル アプリケーションの場合は、Appium、または WebDriver プロトコルを使用する同等のプラットフォームを使用できます。 それには、ジョブに Appium をインストールし、USERNAME と ACCESS_KEY に CircleCI の[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)を使用します。

## Cypress
{: #cypress }

JavaScript エンドツーエンド テストに使用できるブラウザー テスト ソリューションとして、他にも [Cypress](https://www.cypress.io/) があります。 Selenium アーキテクチャを利用するブラウザー テスト ソリューションとは異なり、Cypress を使用する場合は、アプリケーションと同じ実行ループでテストを実行できます。 このプロセスを簡素化するために、CircleCI 承認済み Orb を使用して、結果を Cypress ダッシュボードにポストせずにすべての Cypress テストを実行するなどのさまざまなテストを実行することができます。 以下に例示する CircleCI 承認済み Orb では、結果がダッシュボードにパブリッシュされずに、すべての Cypress テストが実行されます。

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:jessie-node-browsers
    steps:
      - checkout
      - run:
          name: Sauce Labs のインストールとトンネルのセットアップ
          background: true
          command: |
            curl https://saucelabs.com/downloads/sc-4.4.12-linux.tar.gz -o saucelabs.tar.gz
            tar -xzf saucelabs.tar.gz
            cd sc-*
            bin/sc -u ${SAUCELABS_USER} -k ${SAUCELABS_KEY}
        wget --retry-connrefused --no-check-certificate -T 60 localhost:4445  # アプリが準備できるまで待機します
      - run: # 基本イメージは python のため、`unittest` の拡張版である `nosetests` を実行します
          command: nosetests
      - run:
          name: Sauce Connect のトンネルのシャットダウン
          command: |
            kill -9 `cat /tmp/sc_client.pid`
```
{% endraw %}

設定ファイルのワークフローに使用できる Cypress Orb の例は他にもあります。 これらの Orb の詳細については、[CircleCI Orbs レジストリ](https://circleci.com/developer/ja/orbs)にある[Cypress Orbs のページ](https://circleci.com/developer/ja/orbs/orb/cypress-io/cypress)を参照してください。

## ブラウザー テストのデバッグ
{: #debugging-browser-tests }

インテグレーション テストのデバッグは一筋縄では行きません。 特に、リモート マシンで実行されている場合はなおさらです。 このセクションでは、CircleCI 上でブラウザー テストをデバッグする方法の例をいくつか示します。

### LambdaTest ブラウザー テスト Orb の例
この方法では、たとえば Selenium テストをセットアップするとき、非常に簡単にデバッグを行えます。
{:.no_toc}

[ビルド アーティファクト]({{ site.baseurl }}/ja/2.0/artifacts/)を収集してビルドから使用できるように CircleCI を構成できます。 たとえば、アーティファクトを使用し、ジョブの一部としてスクリーンショットを保存して、ジョブの終了時に表示することができます。 `store_artifacts` ステップでそれらのファイルを明示的に収集し、`path` と `destination` を指定する必要があります。 例については、「CircleCI を設定する」の [store_artifacts]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) セクションを参照してください。

スクリーンショットの保存は簡単です。 WebKit と Selenium では組み込み機能として提供されており、大半のテスト スイートでサポートされています。

*   [直接 Selenium を使用して手動で保存する](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#remotewebdriver)
*   [Cucumber を使用して障害時に自動的に保存する](https://github.com/mattheworiordan/capybara-screenshot)
*   [Behat と Mink を使用して障害時に自動的に保存する](https://gist.github.com/michalochman/3175175)

### Sauce Labs ブラウザー テスト Orb の例
{: #using-a-local-browser-to-access-http-server-on-circleci }
{:.no_toc}

CircleCI 上で HTTP サーバーを実行するテストを行う場合、ローカル マシンで動作するブラウザーを使用して障害テストのデバッグを行うと便利な場合があります。 これは、SSH を有効にした実行によって簡単にセットアップできます。

1. CircleCI アプリの**[Job (ジョブ)] ページ**の [Rerun Job with SSH (SSH でジョブを再実行)] ボタンを使用して SSH ビルドを実行します。 次のように、SSH からコンテナにログインするコマンドが表示されます。
```
ssh -p 64625 ubuntu@54.221.135.43
```
2. コマンドにポート転送を追加するには、`-L` フラグを使用します。 次の例では、ブラウザーでの `http://localhost:3000` へのリクエストを CircleCI コンテナ上のポート `8080` に転送します。 これは、ジョブで Ruby on Rails デバッグ アプリを実行し、それがポート 8080 をリスンする場合などに使用できます。 これを実行した後、ブラウザーに移動して http://localhost:3000 をリクエストすると、コンテナのポート 8080 の処理の内容が表示されます。

**Note:** Update `8080` to be the port you are running on the CircleCI container.
```
ssh -p 64625 ubuntu@54.221.135.43 -L 3000:localhost:8080
```
3. 次に、ローカル マシンでブラウザーを開き、`http://localhost:8080` に移動すると、CircleCI コンテナ上のポート `3000` で実行されているサーバーに直接リクエストが送信されます。 CircleCI コンテナでテスト サーバーを手動で起動し (まだ実行されていない場合)、開発マシン上のブラウザーから実行中のテスト サーバーにアクセスすることもできます。

This is a very easy way to debug things when setting up Selenium tests, for example.

### スクリーンショットとアーティファクトの使用
VNC からのブラウザー操作
{:.no_toc}

VNC を使用して、テストを実行しているブラウザーを表示し、操作することができます。 これは、実ブラウザーを実行するドライバーを使用している場合にのみ機能します。 Selenium が制御するブラウザーを操作できますが、PhantomJS はヘッドレスなので、操作する対象がありません。

1. VNC ビューアをインストールします。 macOS を使用している場合は、[Chicken of the VNC](http://sourceforge.net/projects/chicken/) の使用を検討してください。 [RealVNC](http://www.realvnc.com/download/viewer/) もほとんどのプラットフォームで使用できます。

2. ターミナル ウィンドウを開き、CircleCI コンテナへの [SSH 実行を開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)し、リモート ポート 5901 をローカル ポート 5902 に転送します。

```bash
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901
```
3. `vnc4server` パッケージと `metacity` パッケージをインストールします。 `metacity` を使用して、ブラウザーを操作し、ターミナル ウィンドウに戻ります。

```bash
sudo apt install vnc4server metacity
```
4. `metacity` をバックグラウンドで起動します。

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
9. `firefox` をバックグラウンドで起動します。

```bash
ubuntu@box159:~$ metacity &
```
10. `firefox` をバックグラウンドで起動します。

```bash
ubuntu@box159:~$ firefox &
```

これで、コマンド ラインからインテグレーション テストを実行し、ブラウザーで予期しない動作がないかどうかを監視できます。 ローカル マシンでテストを実行しているかのように、ブラウザーを操作することができます。

### ローカル ブラウザーを使用して CircleCI 上の HTTP サーバーにアクセス
CircleCI の X サーバーの共有
{:.no_toc}

VNC サーバーを頻繁にセットアップしているなら、そのプロセスを自動化した方が効率的でしょう。 `x11vnc` を使用して、VNC サーバーを X にアタッチできます。

1. [`x11vnc`](http://www.karlrunge.com/x11vnc/index.html) をダウンロードして、テストの前に起動します。

```
run:
  name: X のダウンロードと起動
  command: |
    sudo apt-get install -y x11vnc
    x11vnc -forever -nopw
  background: true
```
2. これで、[SSH ビルドを開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)すると、デフォルトのテスト ステップの実行中に VNC サーバーに接続できます。 SSH トンネルの機能を持つ VNC ビューアを使用するか、独自のトンネルをセットアップできます。
```
$ ssh -p PORT ubuntu@IP_ADDRESS -L 5900:localhost:5900
```

## SSH からの X11 転送
これで SSH セッションが開始し、X11 転送が有効化されます。

CircleCI は、SSH からの X11 転送もサポートしています。 X11 転送は VNC と同様、CircleCI 上で動作するブラウザーとローカル マシンからやり取りすることができます。

1. コンピューターに X Window System をインストールします。 macOS を使用している場合は、\[XQuartz\] (http://xquartz.macosforge.org/landing/) の使用を検討してください。

2. システムで X をセットアップしたら、CircleCI VM に対して [SSH ビルドを開始]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)します。 `-X` フラグを使用して転送をセットアップします。

```
daniel@mymac$ ssh -X -p PORT ubuntu@IP_ADDRESS
```
This will start an SSH session with X11 forwarding enabled.

3. お使いのマシンに VM のディスプレイを接続するには、ディスプレイ環境変数を `localhost:10.0` に設定します。

```
ubuntu@box10$ export DISPLAY=localhost:10.0
```
4. xclock を起動して、すべて正しく動作していることを確認します。

```
ubuntu@box10$ xclock
```
xclock がデスクトップに表示された後は、`Ctrl+c` で強制終了することができます。

これで、コマンド ラインからインテグレーション テストを実行し、ブラウザーで予期しない動作がないかどうかを監視できます。 ローカル マシンでテストを実行しているかのように、ブラウザーを操作することができます。

## 関連項目
{: #see-also }

[2.0 プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)
