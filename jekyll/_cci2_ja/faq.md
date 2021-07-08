---
layout: classic-docs
title: "よくあるご質問"
short-title: "よくあるご質問"
description: "CircleCI 2.0 に関してよく寄せられるご質問"
categories:
  - migration
order: 1
version:
  - Cloud
  - Server v2.x
---

* 目次
{:toc}

## 全般
{: #general }

### CircleCI の従業員にプログラム コードを見られるおそれはありませんか?
{: #does-circleci-look-at-my-code }
{:.no_toc}
CircleCI の従業員がお客様の許諾を得ずにコードを見ることはありません。 お客様が問題解決のサポートを希望されるときには、事前に許可を得たうえで、サポート エンジニアがコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティ ポリシー]({{ site.baseurl }}/ja/2.0/security/)をご覧ください。

## 移行
Jenkins と CircleCI のコンセプトの違いについては「[Jenkins からの移行]({{ site.baseurl }}/ja/2.0/migrating-from-jenkins/)」をご覧ください。

### CircleCI 1.0 から 2.0 へ移行するメリットを教えてください。
{: #why-migrate-from-circleci-10-to-20 }
{:.no_toc}
- CircleCI 2.0 ではコンテナの利用に関する仕様が大幅に変更され、多数のジョブの高速化と、使用可能なコンテナのアイドル状態の防止を図っています。
- CircleCI 2.0 ではジョブが複数のステップで構成されます。 ジョブ内の各ステップは自由に編集でき、ビルドの方法をニーズに合わせて柔軟にカスタマイズできるようになりました。
- CircleCI 2.0 のジョブでは、公開されているほぼすべての Docker イメージに加え、独自に依存関係を設定しているカスタム イメージも利用できます。

### Jenkins から CircleCI 2.0 へ移行する方法を教えてください。
{: #how-do-i-migrate-from-jenkins-to-circleci-20 }
{:.no_toc}
このイメージに含まれている言語やツールの一覧は、[こちら]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/)でご確認いただけます。

```yaml
    steps:
      - run: echo "bash コマンドをここに記述します"
      - run:
          command: |
            echo "2 行以上の bash コマンドはこのように記述します"
            echo "通常は Jenkins の Execute Shell の内容をコピー ＆ ペーストすればよいだけです"
```

Refer to [Migrating From Jenkins]({{ site.baseurl }}/2.0/migrating-from-jenkins/) for conceptual differences between Jenkins and CircleCI.

### inference コマンドは CircleCI 2.0 でも実行できますか?
{: #does-circleci-20-run-inference-commands }
{:.no_toc}
「Enterprise」は、もともとファイアウォールの内側で利用できる CircleCI のオプションを指していましたが、 この名称によってお客様や CircleCI の従業員に混乱が生じていました。

### 基本イメージを作成していなくても、CircleCI 2.0 を使用できますか?
そこで「CircleCI」という総称を使用することで、クラウド サービス経由で使用したり、ファイアウォールの内側にインストールしたり、あるいはその両方を組み合わせたハイブリッド環境で活用したりと、1 つの製品で多様なニーズに対応できることを明確にしました。
{:.no_toc}
Yes, you can use one of ours! For now, but this image may be deprecated in a future release.

たとえば `circleci/build-image:ubuntu-14.04-XL-922-9410082` というイメージは、CircleCI の Web アプリケーションで使用している Ubuntu 14.04 (Trusty Tahr) のイメージと同等の内容になっています。 容量はかなり大きく (非圧縮時で 17.5 GB 程度)、ローカル環境でのテストにはあまり適していません。

このイメージは、デフォルトで `ubuntu` ユーザーとしてアクションを実行し、Docker Compose で提供されるネットワーク サービスと連携するよう設計されています。

Here’s a [list of languages and tools]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/) included in the image.

## ホスティング
{: #hosting }

### CircleCI 2.0 はオンプレミスでも利用できますか?
つまり、**usage キュー**が発生したときは[コンテナを追加購入する](#コンテナ数を増やしビルドの待機時間を解消するにはどのようにコンテナ-プランをアップグレードしたらよいですか)ことで処理時間を短縮できますが、**run キュー**による待機時間は避けようがありません (とはいえ、CircleCI では少しでも待機時間を解消できるように努めています)。
{:.no_toc}
CircleCI のインストール手順などについては「[管理者向けの概要]({{ site.baseurl }}/ja/2.0/overview)」を参照してください。

### CircleCI のホスティング オプションについて教えてください。
{: #what-are-the-differences-between-circlecis-hosting-options }
{:.no_toc}
- **クラウド:** CircleCI のチームがサーバーの初期設定、インフラストラクチャ、セキュリティ対策を管理し、サービスのメンテナンスを担当します。 最新機能や自動アップグレードをすぐに利用できるため、お客様の内部システムの管理にかかる負担が軽減されます。

- **サーバー:** AWS などと同様に、お客様が CircleCI のインストールと管理を行います。 お客様のデータセンター ポリシーに沿ってファイアウォールの内側でサーバーの初期設定やメンテナンスを実施できます。 あらゆる管理権限がお客様に付与されるため、自由にカスタマイズしたり、最新バージョンのリリース直後にアップグレードしたりといったことが可能です。

### CircleCI Enterprise という名称を使わなくなったのはなぜですか?
{: #why-did-you-change-the-name-from-circleci-enterprise }
{:.no_toc}
The term Enterprise was used to refer to the behind-the-firewall option. However, this nomenclature was confusing for customers and for CircleCI employees.

Docker Hub のパブリック イメージについては、以下のようにアカウント名やユーザー名を付け加えてプルすることも可能です。

## トラブルシューティング
{: #troubleshooting }

### コミットをプッシュしてもジョブが実行されません。
{: #why-arent-my-jobs-running-when-i-push-commits }
{:.no_toc}
CircleCI アプリケーションの Workflows タブで、エラー メッセージが出力されていないかどうかを確認してください。 多くの場合、`config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

この例では、プライマリ イメージと mySQL イメージの両方にタイムゾーンを設定しています。

設定できるタイムゾーンの一覧は、[Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) でご確認ください。

### 「usage キュー」と「run キュー」の違いは何ですか?
{: #what-is-the-difference-between-a-usage-queue-and-a-run-queue }
{:.no_toc}
**usage キュー**は 1 つの組織内でビルドを実行するためのコンテナが不足しているときに発生します。 使用可能なコンテナの数は、CircleCI のプロジェクト セットアップ時に選択したプランによって決まります。 ビルドの待機時間が頻繁に発生しているようであれば、プランを変更して、使用するコンテナ数を増やすことをお勧めします。

**run キュー**は CircleCI に高い負荷がかかっているときに発生します。 この場合、ユーザーのビルドはいったん run キューに入り、マシンが利用できる状態になったら処理されます。

In other words, you can reduce time spent in a **usage queue** by [purchasing more containers](#how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing), but time spent in a **run queue** is unavoidable (though CircleCI aims to keep this as low as possible).

### Performance プランを利用しているのに、ビルドの待機時間が発生するのはなぜですか?
現在のプランではコンテナ数が不足していないのに「build didn’t run because it needs more containers than your plan allows」というエラー メッセージが表示されるのは なぜですか?
{:.no_toc}
CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソース クラス](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)ごとに同時処理数のソフト制限が設けられています。 ビルドの待機時間が発生する場合は、この制限に達している可能性が考えられます。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### [Add Projects (プロジェクトの追加)] ページにプロジェクトが見当たりません。
{: #why-cant-i-find-my-project-on-the-add-project-page }
{:.no_toc}
ビルドしようとしているプロジェクトが表示されておらず、現在 CircleCI 上でビルドしているものではない場合は、CircleCI アプリケーションの左上隅で組織を確認してください。  たとえば、左上に `my-user` と表示されているなら、`my-user` に属する GitHub プロジェクトのみが `Add Projects` の下に表示されます。  `your-org/project` の GitHub プロジェクトをビルドするには、CircleCI アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

### I got an error saying my “build didn’t run because it needs more containers than your plan allows” but my plan has more than enough. Why is this failing?
{: #i-got-an-error-saying-my-build-didnt-run-because-it-needs-more-containers-than-your-plan-allows-but-my-plan-has-more-than-enough-why-is-this-failing }
{:.no_toc}
CircleCI のデフォルト設定では、1 プロジェクトあたりの並列処理数が 16 までに制限されています。 この数を超えてリクエストすると、ビルドが失敗します。 並列処理数の上限を引き上げたい場合は、[サポート センターまたはカスタマー サクセス マネージャー](https://support.circleci.com/hc/ja)にお問い合わせください。

### How do Docker image names work? Where do they come from?
{: #how-do-docker-image-names-work-where-do-they-come-from }
{:.no_toc}
CircleCI 2.0 では、現在のところ [Docker Hub](https://hub.docker.com) からの Docker イメージのプル (と Docker Engine のプッシュ) をサポートしています。 [公式の Docker イメージ](https://hub.docker.com/explore/)に対して行えるのは、以下のように名称やタグを指定したプルのみです。

```
golang:1.7.1-jessie
redis:3.0.7-jessie
```

For public images on Docker Hub, you can pull the image by prefixing the account or team username:

```
my-user/couchdb:1.6.1
```

### Docker イメージの命名 規則について教えてください。
UTC 協定世界時のタイムゾーンに基づいてスケジュールを指定できます。
{:.no_toc}
`latest` タグを**付けず**に Docker イメージを指定することをお勧めします。 特定のバージョンとタグを使用するのもよいでしょう。 たとえば、`circleci/ruby:2.4-jessie-node` のように限定的にイメージを指定すると、ベースとなるイメージのディストリビューションが変更されたときも、アップストリームの影響がコンテナに及ぶのを防ぐことができます。 一方、`circleci/ruby:2.4` とだけ指定していると、`jessie` から `stretch` への予期しない変更による影響を受けるおそれがあります。 その他の応用例は、「Executor タイプを選択する」の「[Docker イメージのベスト プラクティス]({{ site.baseurl }}/ja/2.0/executor-types/#docker-イメージのベスト-プラクティス)」や、「CircleCI のビルド済み Docker イメージ」の「[ベスト プラクティス]({{ site.baseurl }}/ja/2.0/circleci-images/#ベスト-プラクティス)」でご覧いただけます。

### イメージのバージョン指定に関するベスト プラクティスを教えてください。
{: #how-can-i-set-the-timezone-in-docker-images }
{:.no_toc}
Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 たとえば、以下のように `.circleci/config.yml` を編集します。

`.circleci/config.yml` で環境変数 `TZ` を定義する例

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

In this example, the timezone is set for both the primary image and an additional mySQL image.

Windows Server 2019 Datacenter エディションの Server Core オプションを使用しています。

## ワークフロー
{: #workflows }

### Docker イメージのタイムゾーンを設定する方法を教えてください。
[使用可能な依存関係の一覧]({{site.baseurl}}/ja/2.0/hello-world-windows/#windows-イメージにプリインストールされているソフトウェア)が「[Windows での Hello World]({{site.baseurl}}/ja/2.0/hello-world-windows/)」に掲載されています。
{:.no_toc}
はい、ご利用いただけます。 API エンドポイントの利用方法や関連ドキュメントについては「[パイプライン]({{ site.baseurl }}/ja/2.0/build-processing/)」をご覧ください。

### ワークフローに API は使用できますか?
残念ながら、現時点ではサーバー インストール版の CircleCI で Windows をご利用いただくことはできません。
{:.no_toc}
詳細については「[YAML の記述]({{ site.baseurl }}/ja/2.0/writing-yaml/)」をご覧ください。

### ワークフローでビルドの自動キャンセルは使用できますか?
{: #can-i-use-storetestresults-with-workflows }
{:.no_toc}
`store_test_results` を使用すると、テスト結果のデータを [Test Summary (テスト サマリー)] セクションに記録できます。 また、[タイミング データに基づいた分割]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/#タイミング-データに基づいた分割)を行う際にも利用できます。 テストのタイミング データは、CircleCI 2.0 のワークフローから利用できるようになったもので、同一名称のジョブのデータは 50 ビルド分さかのぼることができます。

### ワークフローに `store_test_results` は使用できますか?
{: #can-i-use-workflows-with-circleci-10 }
 {:.no_toc}
ワークフローは CircleCI 2.0 で実装された機能です。 ワークフローを使用するには、CircleCI 2.0 でビルドを実行する必要があります。

### CircleCI 1.0 でもワークフローを使用できますか?
{: #can-i-use-workflows-with-the-installable-circleci }
{:.no_toc}
はい、お客様のオンプレミス環境でもご利用いただけます。 詳しいインストール手順については「[管理者向けの概要]({{ site.baseurl }}/ja/2.0/overview)」をご覧ください。

### オンプレミス環境の CircleCI でもワークフローを使用できますか?
{: #how-many-jobs-can-i-run-at-one-time }
{:.no_toc}
同時に実行できるジョブの数は、ご契約中のプランの利用可能なコンテナ数によって決まります。 たとえば、5 つのコンテナが利用できる場合、ワークフロー内の 10 個のジョブを実行しようとしても、一度に実行されるジョブの数は 5 つまでとなります。 ワークフローの構成により、複数のジョブを同時に実行、または連続して実行することができます。 ファンアウト (複数のジョブを同時実行する) またはファンイン (依存関係にあるジョブが完了するまで、他の全ジョブを待機させる) が可能です。

### 同時にいくつのジョブを実行できますか?
{: #do-you-plan-to-add-the-ability-to-launch-jobs-on-both-linux-and-mac-environments-in-the-same-workflow }
{:.no_toc}
既にサポートしています。 「2.0 `config.yml` のサンプル ファイル」の「[複数の Executor タイプを含む構成例 (macOS と Docker)]({{ site.baseurl }}/ja/2.0/sample-config/#複数の-executor-タイプを含む構成例-macos-と-docker)」を参照してください。

### 単一のワークフロー内で Linux 環境と Mac 環境の両方のジョブを実行できるような機能をサポートする予定はありますか?
現時点では、`config.yml` を複数のファイルに分割する機能は提供しておりません。
{:.no_toc}
Splitting `config.yml` into multiple files is not yet supported.

### `config.yml` を複数のファイルに分割することは可能ですか?
{: #can-i-build-only-the-jobs-that-changed }
{:.no_toc}
いいえ、できません。

### 変更したジョブのみをビルドすることは可能ですか?
**Free プラン**を利用するオープンソースの組織には、Linux オープンソース プロジェクトに使用できる 400,000 の無料クレジットが毎月付与され、最大 4 件のジョブを同時実行できます。
{:.no_toc}
Yes!

### フォークするプル リクエストをワークフローでビルドすることは可能ですか?
{: #can-workflows-be-scheduled-to-run-at-a-specific-time-of-day }
{:.no_toc}
はい、クラウド版の CircleCI アプリケーションであれば可能です。 たとえば、午後 4 時にワークフローを実行したいときには、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンに基づきます。

### ワークフローの実行スケジュールを指定することは可能ですか?
{: #what-time-zone-is-used-for-schedules }
{:.no_toc}
上限に近づいたときと上限を超えたときには、アプリ内に通知が表示されます。

### スケジュールの指定にはどのタイムゾーンが使用できますか?
他にもご不明な点がございましたら、billing@circleci.com までお気軽にお問い合わせください。
{:.no_toc}
スケジュールを設定したワークフローを実行するブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュしてください。 `master` ブランチへのプッシュでは、`master` ブランチのワークフローしかスケジュールが設定されません。

### スケジュールを指定したビルドが失敗してしまいました。
{: #can-i-schedule-multiple-workflows }
{:.no_toc}
`trigger:` キー内で `schedule` を設定したワークフローは、すべて指定したスケジュールに基づいて実行されます。

### 複数のワークフローの実行スケジュールを指定することは可能ですか?
{: #are-scheduled-workflows-guaranteed-to-run-at-precisely-the-time-scheduled }
{:.no_toc}
スケジュールの正確性については保証できません。 スケジュールを設定したワークフローは、指定した時間にコミットがプッシュされたように実行されます。

## Windows
Machine Executor で実行しているホストは、`eth0` や `lo` といったネットワーク インターフェイスに対して IPv6 アドレスを割り当てられます。

### スケジュールを設定したワークフローは、指定した時間どおりに正確に実行されますか?
{: #what-do-i-need-to-get-started-building-on-windows }
{:.no_toc}
[Performance プラン](https://circleci.com/ja/pricing/usage/)を購入し、プロジェクトの[パイプラインを有効化]({{site.baseurl}}/ja/2.0/build-processing/)する必要があります。 Windows ジョブでは、1 分あたり 40 クレジットが消費されます。

### Windows でのビルドを開始するには何が必要ですか?
サポートしている CPU アーキテクチャは、`amd64` のみとなります。
{:.no_toc}

We use Windows Server 2019 Datacenter Edition, the Server Core option.

### 使用している Windows のバージョンを教えてください。
{: #what-is-installed-on-the-machine }
{:.no_toc}

The [full list of available dependencies]({{site.baseurl}}/2.0/hello-world-windows/#software-pre-installed-in-the-windows-image) can be found in our "[Hello World On Windows]({{site.baseurl}}/2.0/hello-world-windows/)" document.

### マシンには何がインストールされていますか?
{: #what-is-the-machine-size }
{:.no_toc}

4 基の vCPU と 15 GB の RAM を備えた Windows マシンです。

### マシンのサイズを教えてください。
{: #is-windows-available-on-installed-versions-of-circleci }
{:.no_toc}

Unfortunately, Windows is not available on server installed versions of CircleCI at this time.

## 料金・支払い
{: #billing }

### インストール版の CircleCI で Windows は利用できますか?
{: #credit-usage-plans }

#### 新しい料金プランによって私たちユーザーにはどのような影響がありますか?
{: #how-do-the-new-pricing-plans-affect-me-as-a-customer }
{:.no_toc}
For the vast majority of customers, you can keep your current plan for now and this simply represents a new option you may want to consider.

#### 「クレジット」とは何ですか?
{: #what-are-credits }
{:.no_toc}
クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

たとえば、毎分 10 クレジットのデフォルト レートで 1 台のマシンを使用する場合、25,000 クレジットのパッケージでは 2,500 分のビルドが可能です。 同じパッケージで 2 倍の並列処理を実行する場合は 1,250 分、10 倍の並列処理を実行する場合は 250 分のビルドが可能です。

#### 組織内でプランを共有し、請求をまとめることは可能ですか?
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
アクティブ ユーザーの一覧は、CircleCI の Web アプリケーションにログインし、[`Settings` (設定)] > [`Plan Usage` (プランの使用状況)] の順に移動して、[`Users` (ユーザー)] タブで確認できます。

On non-free plans, you can share your plan with free organizations for which you have admin access using the `Add Shared Organization` option. 子組織のすべてのクレジットとその他の利用料金は親組織に請求されます。

On non-free plans, you can transfer your plan to another free organization for which you have admin access using the `Transfer Plan` option. When you transfer a paid plan to another org, your org will be downgraded to the free plan.

#### コンテナの使用時間が 1 分未満でも、1 分間分の料金が計上されますか?
{: #if-a-container-is-used-for-under-one-minute-do-i-have-to-pay-for-a-full-minute }
{:.no_toc}
You pay to the next nearest credit. First we round up to the nearest second, and then up to the nearest credit.

#### クレジットの購入方法を教えてください。 必要な分だけ購入することは可能ですか?
{: #how-do-i-buy-credits-can-i-buy-in-any-increments }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

#### 支払う料金の内訳はどのようになっていますか?
{: #what-do-i-pay-for }
{:.no_toc}
プレミアム機能を利用するアクティブ ユーザーの人数分の料金、コンピューティングに対する料金のほか、プレミアム サポートを利用している場合はその料金も含まれます。


- 新しいマシン サイズなどを利用するには、アクティブ ユーザー 1 人あたり月額 15 ドル (税抜) が必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。
  - 25,000 クレジットで 1 パッケージとなっており、1 パッケージは 15 ドル (税抜) です。
  - クレジットは毎月ロールオーバーされ、1 年後に失効します。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。


#### アクティブ ユーザー単位の料金が設定されているのはなぜですか?
{: #why-does-circleci-have-per-active-user-pricing }
{:.no_toc}

クレジットは、コンピューティングの利用に対して消費されます。 CircleCI は、できるだけ使用コストを抑えながら、CI の基本的な推奨事項である「頻繁なジョブ実行」を行っていただくことを目指しています。 アクティブ ユーザー単位で設定しているのは、プラットフォーム機能とジョブ オーケストレーションの利用に対する料金です。 たとえば、依存関係のキャッシュ、アーティファクトのキャッシュ、ワークスペースなどがあり、いずれの機能も追加のコンピューティング コストをかけずにビルド時間を短縮するのに役立ちます。

#### *アクティブ ユーザー*の定義を教えてください。
{: #what-constitutes-an-active-user }
{:.no_toc}

`アクティブ ユーザー`とは、非 OSS プロジェクトでコンピューティング リソースの使用をトリガーするユーザーのことです。 次のようなアクティビティが含まれます。

- ビルドをトリガーするユーザーからのコミット (PR マージ コミットを含む)
- CircleCI の Web アプリケーションでのジョブの再実行 ([SSH デバッグ]({{ site.baseurl }}/ja/2.0/ssh-access-jobs)を含む)
- [ジョブの手動承認]({{ site.baseurl }}/ja/2.0/workflows/#手動承認後に処理を続行するワークフロー) (承認者はすべてのダウンストリーム ジョブのアクターと見なされる)
- スケジュールされたワークフローの使用
- マシン ユーザー

**メモ:** プロジェクトが[オープンソース]({{ site.baseurl }}/ja/2.0/oss)の場合は、アクティブ ユーザーとは**見なされません**。

To find a list of your Active Users, log in to the CircleCI web app > click `Plan` > click `Plan Usage` > click on the `Users` tab.

#### クレジットを使い切るとどうなりますか?
{: #what-happens-when-i-run-out-of-credits }
{:.no_toc}

Performance プランでは、クレジットが残り 10% を下回ると、25% 相当のクレジット サブスクリプションが自動的に補充されます (料金はプラン料金の 25%)。 たとえば、毎月のパッケージ サイズが 25,000 クレジットの場合には、残りが 2,500 クレジットになると、6,250 クレジットが自動的にチャージされるしくみです (1 クレジットあたり税抜 0.0006 ドル)。

If you notice that your account is receiving repeated refills, review your credit usage by logging in to the CircleCI web app > click `Plan` > click `Plan Usage`. In most cases, increasing your credit package should minimize repeat refills. You can manage your plan by clicking `Plan Overview`.

On the **free plan**, jobs will fail to run once you have run out of credits.

#### クレジットに有効期限はありますか?
{: #do-credits-expire }
{:.no_toc}
**Performance プラン**のクレジットは購入後 1 年で失効します。 アカウントのサブスクリプションを停止した場合も、未使用のクレジットは失効します。

#### 支払い方法について教えてください。
{: #how-do-i-pay }
{:.no_toc}
毎月の料金は、CircleCI アプリケーション内からお支払いいただけます。

#### 支払いのスケジュールについて教えてください。
{: #when-do-i-pay }
{:.no_toc}

従量課金制のプランでは、請求サイクルの初日に、ユーザー シートの料金、プレミアム サポートの料金、毎月のクレジット パッケージの料金が請求されます。 *当月中*に追加したクレジット (クレジットが残り 10% になった時点で自動チャージされる 25% 相当分など) の料金は、*追加のタイミング*で請求されます。

#### 有料プランの更新日はいつですか?
{: #am-i-charged-if-my-build-is-queued-or-preparing }

はい。 If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

#### オープンソース プロジェクト向けのクレジットベース プランはありますか?
{: #what-are-the-other-renewal-dates }
{:.no_toc}

CircleCI からの請求が発生する以下の日付に加え、有料プランにアップグレード、または別の有料プランへ変更して初めてクレジット カードで決済した日付が、更新日として設定されます。

- 月間プランでは、毎月の月額料金の請求日が更新日になります。
- 年間プランでは、年に一度の年額料金の請求日が更新日になります。
- 年間プランをご利用中でも、ユーザーの追加やクレジットの補充によって未払い残高が発生した場合は、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残りが設定された最小値を下回った場合、自動的にクレジットが購入されます。

#### Are there credit plans for open source projects?
{: #are-there-credit-plans-for-open-source-projects }
{:.no_toc}

Open source organizations **on our free plan** receive 400,000 free credits per month that can be spent on Linux open source projects, using a maximum of 4 concurrent jobs.

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。 macOS オープンソースのビルド向けの無料クレジットは、組織あたり最大 2 件のジョブの同時実行に使用できます。

#### 現在、コンテナベース プランのオープンソース プロジェクトで無料クレジットを受け取っています。 Performance プランのオープンソース プロジェクトで割引を受けるにはどうすればよいですか?
有料の従量課金制プランのオープンソース プロジェクトに対しても割引を提供します。
{:.no_toc}

CircleCI no longer offers discounts for open source customers on the Performance plan.

#### コンテナベースの macOS プランに割り当てられたビルド時間を超えるとどうなりますか?
Docker レイヤー キャッシュの利用に料金が発生するのはなぜですか?
{:.no_toc}

Docker レイヤー キャッシュ (DLC) は、変更のあった Docker レイヤーのみを再ビルドすることで、Docker イメージをビルドするパイプラインでのビルド時間を削減する機能です (DLC の詳細は[こちら]({{site.baseurl}}/ja/2.0/docker-layer-caching))。 DLC は 1 回のジョブ実行につき 200 クレジットを消費します。

ユーザーに DLC をご利用いただくために、CircleCI ではいくつかの処理を行っています。 ソリッドステート ドライブを使用し、キャッシュをゾーン間で複製し、DLC を利用可能な状態にします。 また、必要に応じてキャッシュを増やすことで、同時処理の要求に対応しながら、DLC をユーザーのジョブで利用できるようにしています。 これらのさまざまな最適化によって、コンピューティング プロバイダーである CircleCI に追加のコストが発生し、ユーザーが DLC を使用する際にそのコストが引き継がれます。

DLC のご利用金額を見積もるには、設定ファイル内の Docker レイヤー キャッシュが有効になっているジョブと、それらのジョブでビルドしている Docker イメージの数を確認してください。 設定ファイルに書き込んでいるジョブは 1 行でも、たとえば並列処理を有効にした場合、そのジョブがパイプラインで複数回実行される場合もあります。

Docker レイヤー キャッシュの効果は、Docker イメージをビルドしているパイプラインでのみはっきりと現れ、ジョブ中にビルドされるアプリケーション イメージに変更がない場合にそのレイヤーが再利用されることで、イメージのビルド時間が短縮されます。 パイプラインに Docker イメージをビルドするジョブがない場合は、Docker レイヤー キャッシュを使用してもメリットはありません。

---

### 従量課金制 (クレジットベース) プラン
{: #container-based-plans }

#### コンテナ数を増やし、ビルドの待機時間を解消するには、どのようにコンテナ プランをアップグレードしたらよいですか?
{: #how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing }
{:.no_toc}
* Linux プランの変更: CircleCI アプリケーションで [Settings (設定)] > [Plan Overview (プラン概要)] を開いて、[Add Containers (コンテナの追加)] ボタンをクリックします。 Linux プランの入力フィールドに必要なコンテナの数を入力したら、[Pay Now (今すぐ支払う)] ボタンをクリックして、支払い方法の設定画面へと進みます。

#### 組織内でプランを共有し、請求をまとめることは可能ですか?
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
はい。 CircleCI アプリケーションで [Settings (設定)] > [Share & Transfer (共有 & 転送)] > [Share Plan (プランの共有)] を開き、プランに追加したい組織を選択してください。

#### 請求先を個人アカウントから組織アカウントに変更できますか?
{: #can-i-set-up-billing-for-an-organization-without-binding-it-to-my-personal-account }
{:.no_toc}
はい、請求は組織全体に関連付けられています。 組織の管理者は、組織の設定ページから組織アカウントで料金の支払いを行えます。 しかし、そのユーザーがすべてのプロジェクトから外れる場合、それらを引き継ぐ別の GitHub 組織の管理者を立てる必要があります。 この件については、よりスムーズに対応いただけるよう、今後の更新で方針を見直す予定です。

#### 課金に関連してコンテナはどのように定義されますか?
{: #what-is-the-definition-of-a-container-in-the-context-of-billing }
{:.no_toc}
ここでのコンテナとは、CPU 2 基と 4 GB の RAM を搭載したマシンを指し、このマシンのご利用に対して料金が発生します。 コンテナは、タスクの同時実行 (例: 5 つの異なるジョブを実行する) や並列実行 (例: 1 つのジョブを 5 つの異なるタスクに分解して一度に実行する) を行うために使用されます。 どちらの例でも 5 つのコンテナが必要になります。

#### リモート Docker の起動処理時間に料金が発生するのはなぜですか?
{: #why-am-i-being-charged-for-remote-docker-spin-up-time }
{:.no_toc}
CircleCI がリモート Docker インスタンスを起動するとき、プライマリ コンテナを実行する必要があり、コンピューティング リソースを消費します。 リモート Docker インスタンスそのものは無料ですが、プライマリ コンテナの起動処理時間に対して料金が発生することになります。

---

## アーキテクチャ
{: #architecture }

### コンテナベース プラン
{: #can-i-use-ipv6-in-my-tests }
{:.no_toc}
IPv6 によるローカル通信のテストでは、[Machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) を利用できます。  CircleCI が使用しているクラウド プロバイダーのサービスすべてが IPv6 をサポートしているわけではないため、申し訳ありませんが、WAN における IPv6 通信はサポートしておりません。

Hosts running with machine executor are configured with IPv6 addresses for `eth0` and `lo` network interfaces.

IPv6 環境のサービスをテストするために、コンテナに IPv6 アドレスを割り当てるように Docker を構成することも可能です。  以下のように Docker デーモンを構成することで、グローバルに有効化することができます。

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

Docker に IPv6 アドレスを割り当てる方法は複数あり、上記のように [Docker デーモンを構成する方法](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/)、[`docker network create` コマンドを使用する方法](https://docs.docker.com/engine/reference/commandline/network_create/)、そして [`docker-compose` を使用する方法](https://docs.docker.com/compose/compose-file/#enable_ipv6)が挙げられます。


### テストで IPv6 を利用できますか?
{: #what-operating-systems-does-circleci-20-support }
{:.no_toc}
- **Linux:** CircleCI は柔軟性に優れており、ほぼすべての Linux アプリケーションをビルドできます。 Web アプリケーションはもちろん、それ以外のビルドにも対応します。

- **Android:** 詳細は「[言語ガイド: Android]({{ site.baseurl }}/ja/2.0/language-android/)」をご覧ください。

- **iOS:** 「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial)」でビルド方法を確認できます。

- **Windows:** 現在、Windows は早期アクセス版のみご利用いただけます。 早期アクセス版のお申し込みについては、CircleCI Discuss の[こちらの投稿](https://discuss.circleci.com/t/windows-early-access-now-available-on-circleci/30977)をご参照ください。

### CircleCI 2.0 ではどの OS をサポートしていますか?
CircleCI ではどの CPU アーキテクチャをサポートしていますか?
{:.no_toc}
`amd64` is the only supported CPU architecture.
