---
layout: classic-docs
title: "よくあるご質問"
short-title: "よくあるご質問"
description: "CircleCI 2.0 についてのよくある質問"
categories:
  - migration
order: 1
---
- 目次
{:toc}

## 一般

### CircleCI の従業員にプログラムコードを見られる恐れはありませんか？
{:.no_toc}
CircleCI の従業員がユーザーの許諾を得ずにコードを見ることはありません。 サポートをご希望の際、サポートエンジニアが問題解決を図るために許可を得たうえでコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティポリシー]({{ site.baseurl }}/ja/2.0/security/)をご覧ください。

## 開発環境の移行

### CircleCI 1.0 から 2.0 へ移行するメリットは？
{:.no_toc}
- CircleCI 2.0 ではコンテナの使い方に関する大幅な仕様変更があり、多数のジョブの高速化と、使用可能なコンテナのアイドル化状態の防止を図っています。  
- CircleCI 2.0 では 1 つのジョブはステップ内に記述されます。 ジョブ内のそれぞれのステップは自由に編集でき、ビルドの方法を好きなように、柔軟にカスタマイズすることが可能になりました。  
- CircleCI 2.0 のジョブでは、公開されているあらゆる Docker イメージはもちろん、独自に依存関係を設定しているカスタムイメージも利用できます。

### Jenkins から CircleCI 2.0 へ移行するには？
{:.no_toc}
[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/) を例を挙げると、下記のように Jenkins の `steps` に記述している内容をそのまま `steps:` にコピー＆ペーストすることになります。

```yaml
    steps:
      - run: echo "bash コマンドをここに記述します"
      - run:
          command: |
            echo "2 行以上の bash コマンドはこのようにします"
            echo "たいていは Jenkins の Execute Shell の内容をコピー＆ペーストするだけです"
```

Jenkins と CircleCI の仕組みの違いについては「[Jenkins からの移行]({{ site.baseurl }}/ja/2.0/migrating-from-jenkins/)」をご覧ください。

### CircleCI 2.0 では 1.0 にあった inference コマンドを実行してくれますか？
{:.no_toc}
CircleCI 2.0 はプロジェクトの内容から推測して変換するようなことはしません。あらかじめ用意された定型の `config.yml` ファイルから選択できるスマートデフォルト型のインターフェースを利用する方向で進めています。

### CircleCI 2.0 は元となる OS イメージを新たに作成しなくても使えますか？
{:.no_toc}
もちろん使えます。CircleCI が提供している OS イメージをご利用ください。 ただし、将来的にそれらの OS イメージが使えなくなる可能性がある点についてはご了承ください。

例えば `circleci/build-image:ubuntu-14.04-XL-922-9410082` というイメージは、Trusty 版の Ubuntu 14.04 と同等の内容になっています。 容量はかなり大きく（非圧縮時 17.5GB 程度）、ローカル環境でテストするのにはあまり向いていないかもしれません。

このイメージではデフォルトで `ubuntu` ユーザーとして実行され、Docker Compose によって提供されるネットワークサービスを稼働させる用途に適しています。

詳しくは、イメージに含まれている[言語やツールの一覧]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/)をご覧ください。

## ホスティング

### CircleCI 2.0 はオンプレミスでの利用も可能ですか？
{:.no_toc}
可能です。CircleCI 2.0 はオンプレミス環境を必要とされるエンタープライズにもご利用いただけます。詳しいインストール手順については「[管理者向け概要]({{ site.baseurl }}/ja/2.0/overview)」をご覧ください。

### CircleCI のホスティングの種類は？
{:.no_toc}
- **クラウド型：**CircleCI がサーバーの初期設定、インフラ、セキュリティを管理し、サービスのメンテナンスを行います。 新機能や自動アップグレードが即座に反映され、システムの内部的な管理負担が軽減されます。

- **オンプレミス型：**AWS などと同じようにユーザーが CircleCI のインストールと管理を行います。ファイアウォール環境におけるサーバーの初期設定とメンテナンスも、ユーザー自身がデータセンターのポリシーにしたがって実施します。 自在なカスタマイズや新バーションへのアップグレードの制御など、あらゆる管理権限があります。

### どうして CircleCI Enterprise という名称をやめたのですか？ 
{:.no_toc}
Enterprise はファイアウォールのあるオンプレミス環境で利用可能なオプションを指すものでした。 ただ、ユーザーの皆様や CircleCI のスタッフにとってまぎらわしい用語でもありました。

そのため、クラウドサービス経由で使えるもの、ファイアウォール環境に導入するもの、あるいはそのハイブリッドで活用するもの、というように、ニーズに応じて利用可能な CircleCI という 1 つの製品としました。

## トラブルシューティング

### コミットをプッシュしてもジョブが実行されない理由は？
{:.no_toc}
CircleCI の Workflows タブでエラーメッセージを確認してみてください。 たいていの場合は `config.yml` ファイル内での文法エラーが原因です。 詳しくは「[YAML の書き方]({{ site.baseurl }}/ja/2.0/writing-yaml/)」をご確認ください。

`config.yml` の文法エラーをチェックして、それでもなお解決しないときは「[ナレッジベース](https://support.circleci.com/hc/ja)」で検索してみてください。

### 「usage キュー」と「run キュー」の違いはなんですか？
{:.no_toc}
**usage キュー**は、1 つの組織においてビルドを実行するためのコンテナが不足しているときに使われるものです。 使用可能なコンテナの数は、CircleCI でプロジェクトを設定したときに選んだプランによって決まります。 ビルドがキューに入りがちな場合は、プランを変更して使用可能なコンテナ数を増やすことをおすすめします。

**run キュー**は CircleCI 自体が高負荷な状況に陥っているときに発生します。 この場合、ユーザーのビルドはいったん run キューに置かれ、マシンが利用できる状態になったら処理されます。

つまり、**usage キュー** が発生するときは[コンテナの数を増やす](#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing)ことで処理時間を短縮できますが、**run キュー**による待ち時間は避けようがないということになります（もちろん CircleCI では可能な限りそうならないよう務めます）。

### 「Add Project」ページにプロジェクトが見つからないのはなぜですか？
 {:.no_toc}
ビルドしようとしているプロジェクトが見当たらず、目的のビルドでないものが表示されている場合は、画面左上にある Org を確認してください。 もし左上に見えるのがあなたのユーザー名 `my-user` だったとすると、`my-user` に属する GitHub プロジェクトだけが `Add Projects` の下に表示されることになります。 GitHub のプロジェクト名 `your-org/project` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される [Switch Organization] メニューから目的の Org である `your-org` に切り替えます。

### 「build didn’t run because it needs more containers than your plan allows」というエラーが表示されます。しかし、現在のプランはその条件を満たしています。 なぜエラーになるのでしょうか？
{:.no_toc}
CircleCI では、基本的には 1 プロジェクトあたりの並列処理数が 16 までに制限されています。 この数を超えてリクエストした場合、ビルドは失敗してしまいます。 上限を大きくしたいときは [CircleCI Japanese Support Center](https://support.circleci.com/hc/ja) よりお問い合わせください。

### Docker イメージの名前の付け方は？ 見つけ方を教えてほしい。
{:.no_toc}
CircleCI 2.0 では現在のところ [Docker Hub](https://hub.docker.com) 上の Docker イメージのプル（と Docker Engine のプッシュ）にのみ対応しています。 これら[公式の Docker イメージ](https://hub.docker.com/explore/)に対してできるのは、単純に下記のような名前やタグを指定してプルすることです。

    golang:1.7.1-jessie
    redis:3.0.7-jessie
    

Docker Hub のパブリックイメージについては、下記のようにアカウント名やユーザー名を付加した形でプルすることも可能です。

    my-user/couchdb:1.6.1
    

### Docker イメージのバージョンを指定するときのベストな方法は？
{:.no_toc}
Docker イメージを指定する際に、`latest` タグを付け**ない**のが正しい方法です。 もしくは、特定のバージョンやタグを付けるのも良い方法です。ベースとなるイメージのディストリビューションに変更があったとき、イメージが変更されないようにしてアップストリームにコンテナへの影響を防ぐには、例えば `circleci/ruby:2.4-jessie-node` のように指定します。 `circleci/ruby:2.4` とだけ指定した場合は、`jessie` から `stretch` への予期しない変更による影響を受ける可能性があります。 他の応用例を知りたいときは、「Executor タイプの選び方」の[Docker イメージ活用のヒント]({{ site.baseurl }}/ja/2.0/executor-types/#docker-image-best-practices)や、「CircleCI のビルド済み Docker イメージ」の[ビルド済みイメージの活用方法]({{ site.baseurl }}/2.0/circleci-images/#best-practices)を参照してください。

### Docker イメージでタイムゾーンを設定する方法は？
{:.no_toc}
環境変数 `TZ` を用いて Docker イメージのタイムゾーンを設定できます。 下記のように `.circleci/config.yml` を編集してみてください。

環境変数 `TZ` を定義する `.circleci/config.yml` の設定例

```yaml
version: 2
jobs:
  build:
    docker:
      - image: your/primary-image:version-tag
      - image: mysql:5.7
        environment:
           TZ: "America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "America/Los_Angeles"
```

この例では、プライマリイメージと mySQL イメージの両方にタイムゾーンを設定しています。

利用可能なタイムゾーンの一覧は [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) で確認できます。

## Workflows

### Workflows のなかで API は使えますか？
{:.no_toc}
使えます。利用方法や API エンドポイントの URL については「[ビルド処理の有効化]({{ site.baseurl }}/ja/2.0/build-processing/)」をご覧ください。

### Workflows でビルドの「自動キャンセル」はできますか？
{:.no_toc}
可能です。「[ビルドのスキップ・キャンセル]({{ site.baseurl }}/ja/2.0/skip-build/)」で設定手順をご確認ください。

### テスト結果を保存する `store_test_results` を Workflows 内で使えますか？
{:.no_toc}
テスト結果のデータを [Test Summary] というセクションに記録するのに、`store_test_results` が使えます。また、データを[時系列順に分割]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/#splitting-by-timings-data)する際にも使えます。 時系列のテストデータは CircleCI 2.0 の Workflows より利用できるようになったもので、同一名称のジョブで使っているデータは 50 ビルド分さかのぼることができます。

### CircleCI 1.0 で Workflows を使うことはできますか？
 {:.no_toc}
Workflows は CircleCI 2.0 固有の機能です。Workflows を利用するには CircleCI 2.0 でビルドを実行する必要があります。

### オンプレミス環境にインストールした CircleCI でも Workflows は使えますか？
{:.no_toc}
もちろん使えます。Workflows は CircleCI 2.0 の 1 機能としてエンタープライズ向けのオンプレミス環境でもご利用いただけます。 CircleCI のインストール手順などについては「[管理者向け概要]({{ site.baseurl }}/ja/2.0/overview)」を参照してください。

### 同時に実行できるジョブの数はいくつですか？
{:.no_toc}
契約しているプランにおける利用可能なコンテナ数が、同時に実行可能なジョブの数を決めることになります。 仮に 10 個の Workflows ジョブが実行されようとしていて、プラン上は 5 つのコンテナしか使えない場合は、実行されるのは一度に 5 つのジョブまでです。 Workflow の設定を行うことで、複数のジョブを同時もしくは連続的に実行できます。 ファンアウト（複数のジョブを同時実行する）、あるいはファンイン（その前の独立したジョブが完了するまで以降の全ジョブを待機させる）が可能です。

### 同一の Workflow 内で Linux 環境と Mac 環境両方のジョブを実行できるようにする機能が追加される予定はありますか？
{:.no_toc}
すでにサポートしています。 「config.yml の設定例」内の[複数の実行環境 (macOS ＋ Docker) を利用する設定例]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-multiple-executor-types-macos--docker)を参照してください。

### `config.yml` ファイルの内容を複数ファイルに分割することはできますか？
{:.no_toc}
`config.yml` の内容を複数のファイルに分割する機能は今のところ提供していません。

### 変更のあった単一のジョブのみをビルドできますか？
{:.no_toc}
できません。

### Workflows でフォークするプルリクエストをビルドすることは可能ですか？
{:.no_toc}
可能です！

### Workflows を指定した日時にスケジュール実行することは可能ですか？
{:.no_toc}
CircleCI がホスティングしているクラウド環境なら可能です。 例えば、午後 4 時に Workflow を実行するなら、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンとなります。 今後はオンプレミス環境の CircleCI でも Workflows のスケジュール実行が可能になるよう計画しています。

### スケジュール実行の際に使われるタイムゾーンは？
{:.no_toc}
スケジュール実行におけるタイムゾーンは UTC 協定世界時に合わせられます。

### ビルドのスケジュール実行が失敗する理由は？ 
{:.no_toc}
スケジュール実行する Workflow のブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュしてください。 `master` ブランチにおけるプッシュは、`master` ブランチに対する Workflow しかスケジュールされません。

### 複数の Workflows をスケジュール実行できますか？
{:.no_toc}
可能です。`trigger:` キーのなかで `schedule` が設定された Workflow は、どれも指定されたスケジュールで実行されます。

### スケジュールされた Workflows は、指定された時間通り正確に実行されますか？
{:.no_toc}
CircleCI はスケジュールの正確性については保証していません。 設定した時間にコミットがプッシュされたとして Workflow をスケジュール実行します。

## 料金・支払

### コンテナベースの計画

#### ビルドがキューに入らないようコンテナ数を増やしたい。現在の契約プランからアップグレードするには？
{:.no_toc}
* Linux プランの変更：CircleCI で [Settings] → [Plan Overview] 画面を表示し、[Add Containers] ボタンをクリックします。 表示される入力欄に増やしたい数をタイプしたら、[Pay Now] ボタンをクリックして支払方法の設定画面へと進みます。

- macOS プランの変更：CircleCI で [Settings] → [Plan Overview] 画面を表示し、[Change Plan] ボタンをクリックします。 [Startup] もしくは [Growth] を選び、[Pay Now] ボタンをクリックして支払い方法の設定画面へと進みます。

#### 異なる Org 間で契約プランを共有できますか？ その場合、請求を 1 箇所にまとめることは？
{:.no_toc}
可能です。CircleCI で [Settings] → [Share & Transfer] → [Share Plan] ページと進み、プランを共有したい Org を選択してください。

#### 個人アカウントではなく Org 宛に請求されるよう設定できますか？
{:.no_toc}
可能です。請求は Org にひもづけられます。 Org の設定ページにて、ユーザー自身がその Org として支払うことができます。 ただし、そのユーザーが全てのプロジェクトから外れる場合、それらを引き継ぐ別の GitHub Org 管理者をたてる必要があります。 将来のアップデートではよりわかりやすい解決策を提供できる予定です。

#### 課金におけるコンテナの定義は？
{:.no_toc}
料金を支払って利用できるコンテナ 1 個は、2 つの CPU と 4GB のメモリを搭載するマシンです。 コンテナはタスクの同時実行（5 つの異なるジョブを実行するなど）や並列実行（1 つのジョブを 5 つの異なるタスクに分解してそれぞれを一斉に実行するなど）を行うのに使われます。 この場合はどちらの例でも 5 つのコンテナが必要になります。

* * *

### クレジットの利用プラン

#### 新しい料金プランで、顧客としての私はどんな影響を受けますか？
{:.no_toc}
圧倒的多数のお客様のために、現在のプランを当面そのままにしておくことができます。そうすることで、考慮したい新しいオプションが表示されます。

#### クレジットとは何ですか？
{:.no_toc}
クレジットは、マシンのタイプとサイズに基づくお客様の使用に対して支払いをするために使用されます。 クレジットは、Docker レイヤーキャッシュなどへの使用料の支払いに使用することもできます。

例えば、毎分 10 クレジットのデフォルトレートで 1 台のマシンを使用しているとき、25,000 クレジットのパッケージは毎分 2,500 ビルドを提供します。 10 倍の平行処理で 2 倍の平行処理または 250 分を使用しているとき、同じパッケージは 1,250 分間持続します。

#### コンテナを 1 分未満しか使用していない場合、まるまる 1 分間分支払わなければならないのですか？ 
{:.no_toc}
お客様には、次にもっとも近いクレジットをお支払いいただきます。 当社はまず、もっとも近い秒に切り上げ、次にもっとも近いクレジットに切り上げます。

#### クレジットはどうやって購入するのですか？ 段階的に追加購入することは可能ですか？
{:.no_toc}
お客様は毎月、月初めに選択されたクレジットパッケージを請求されます。

#### 私が支払う金額でどんなサービスが受けられますか？
{:.no_toc}
アクティブユーザーごとのプレミアム機能、計算、およびオプションで、プレミアムサポートでのお私払いを選択できます。

- Access to features, such as new machine sizes, are paid with a monthly fee of $15 per active user. 
- Compute is paid for monthly in credits for the machine size and duration you use.
- Docker Layer Caching (DLC) is paid for with credits per usage, similar to compute credits.

#### What happens when I run out of credits?
{:.no_toc}

On the Performance plan, when you reach 5% of your remaining credits, you will be refilled 10% of your credits. For example, If your monthly package size is 25,000 credits, you will automatically be refilled 2,500 credits when you reach 1,250 remaining credits.

#### Do credits expire?
{:.no_toc}
**Performance Plan**: Credits expire one year after purchase. Unused credits will be forfeited when the account subscription is canceled.

#### How do I pay?
{:.no_toc}
You can pay from inside the CircleCI app for monthly pricing.

#### When do I pay?
{:.no_toc}

On the Usage plans, at the beginning of your billing cycle, you will be charged for user seats, premium support tiers and your monthly credit allocation. Any subsequent credit refills *during* the month (such as the auto-refilling on reaching 5% of credits available) will be paid *at the time of the refill*.

#### What are the other renewal dates?
{:.no_toc}

The first credit card charge on the day you upgrade to a paid plan or change paid plans, in addition to the following charges from CircleCI:

- On the monthly renewal date if your team is on the monthly plan.
- On the annual renewal date if your team is on the annual plan.
- On the last day of the month if your team is on the annual plan and there is an outstanding balance from adding new users or utilizing more credits.
- If you are on the Performance plan, anytime your team’s credit balance drops below your preset limit, another credit purchase will be processed.

## 稼働環境

### Can I use IPv6 in my tests?
{:.no_toc}
You can use the [machine executor]({{ site.baseurl }}/2.0/executor-types) for testing local IPv6 traffic. Unfortunately, we do not support IPv6 internet traffic, as not all of our cloud providers offer IPv6 support.

Hosts running with machine executor are configured with IPv6 addresses for `eth0` and `lo` network interfaces.

You can also configure Docker to assign IPv6 address to containers, to test services with IPv6 setup. You can enable it globally by configuring docker daemon like the following:

```yaml
   ipv6_tests:
     machine: true
     steps:
     - checkout
     - run:
         name: enable ipv6
         command: |
           cat <<'EOF' | sudo tee /etc/docker/daemon.json
           {
             "ipv6": true,
             "fixed-cidr-v6": "2001:db8:1::/64"
           }
           EOF
           sudo service docker restart
```

Docker allows enabling IPv6 at different levels: [globally via daemon config like above](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/), with [`docker network create` command](https://docs.docker.com/engine/reference/commandline/network_create/), and with [`docker-compose`](https://docs.docker.com/compose/compose-file/#enable_ipv6).

### What operating systems does CircleCI 2.0 support?
{:.no_toc}
- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These do not have to be web applications!

- **Android:** Refer to [Android Language Guide]({{ site.baseurl }}/2.0/language-android/) for instructions.

- **iOS:** Refer to the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial) to get started.

- **Windows:** We do not yet support building and testing Windows applications.

### Which CPU architectures does CircleCI support?
{:.no_toc}
`amd64` is the only supported CPU architecture.