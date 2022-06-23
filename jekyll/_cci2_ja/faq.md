---
layout: classic-docs
title: "よくあるご質問"
short-title: "よくあるご質問"
description: "CircleCI に関してよく寄せられるご質問"
categories:
  - 移行
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

* 目次
{:toc}

## 全般
{: #general }

### CircleCI のスタッフにプログラムコードを見られる心配はありませんか?
{: #does-circleci-look-at-my-code }
{:.no_toc}
CircleCI のスタッフがお客様の許可を得ずにコードを見ることはありません。 お客様が問題解決のサポートを希望される際は、事前に許可を得たうえで、サポートエンジニアがコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティポリシー]({{ site.baseurl }}/ja/2.0/security/)をご覧ください。

## 移行
{: #migration }

[移行の概要]({{ site.baseurl }}/ja/2.0/migration-intro/)ドキュメントをご覧ください。さまざまなプラットフォーム用の移行ガイドへのリンクにアクセスできます。

### Jenkins から CircleCI  へ移行する方法を教えてください。
{: #how-do-i-migrate-from-jenkins-to-circleci }
{:.no_toc}

Jenkins と CircleCI のコンセプトの違いについては「[Jenkins からの移行]({{ site.baseurl }}/ja/2.0/migrating-from-jenkins/)」をご覧ください。

### 基本イメージを作成していなくても、CircleCI  を使用できますか?
{: #can-i-use-circleci-without-creating-base-images }
{:.no_toc}

はい、CircleCI では Docker Executor と共に使用する多数の「CircleCI イメージ」を提供しています。 使用方法および全リストは、[CircleCI Developer Hub](https://circleci.com/developer/images) および [CircleCI イメージガイド]({{site.baseurl}}/2.0/circleci-images/)をご覧ください。

`machine` Executor に関しては、[利用可能なマシンイメージ]({{site.baseurl}}/ja/2.0/configuration-reference/#available-linux-machine-images)をご覧ください。

実行環境やイメージに関する概要は、[Executor とイメージに関するガイド]({{site.baseurl}}/2.0/executor-intro/)をご覧ください。

## ホスティング
{: #hosting }

### CircleCI  はオンプレミスでも利用できますか?
{: #is-circleci-20-available-to-enterprise-customers }
{:.no_toc}
はい、CircleCI Server は AWS または GCP 上で利用できます。 インストールの詳細やガイドへのリンクは、[CircleCI Server v3.x の概要]({{ site.baseurl }}/ja/2.0/server-3-overview)をご覧ください。 ご要望がございましたら[お問い合わせ](https://circleci.com/pricing/server/)ください。

### CircleCI のホスティング オプションについて教えてください。
{: #what-are-the-differences-between-circlecis-hosting-options }
{:.no_toc}
- **クラウド:** CircleCI のチームがサーバーの初期設定、インフラストラクチャ、セキュリティ対策を管理し、サービスのメンテナンスを担当します。 新機能や自動アップグレードが即座に反映され、システムの内部的な管理負担が軽減されます。

- **サーバー**: AWS や GCP などのサービスを介してご自身で CircleCI のインストールや管理を行います。 サーバーのインストールはお客様のチームがデータセンターのポリシーに従って設定し、保守を行うファイアウォールの内側にあます。 自在なカスタマイズや新バーションへのアップグレードの制御など、あらゆる管理権限がお客様にあります。

## トラブルシューティング
{: #troubleshooting }

### コミットをプッシュしてもジョブが実行されません。
{: #why-arent-my-jobs-running-when-i-push-commits }
{:.no_toc}
CircleCI アプリケーションで、各ジョブやワークフローの画面にエラーメッセージがないか確認してください。 多くの場合、`config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

詳しくは「[YAML の書き方]({{ site.baseurl }}/ja/2.0/writing-yaml/)」をご確認ください。

`config.yml` のフォーマットのミスを確認したうえで、それでも解決しない場合は [CircleCI サポート センター](https://support.circleci.com/hc/ja)で問題を検索してみてください。

### ジョブがキューイングするのはなぜですか？
{: #why-is-my-job-queued }
{:.no_toc}
お客様のプランまたは組織のプランによっては同時実行の制限が課せられるため、ジョブが**キューイングする**場合があります。 ジョブが頻繁にキューイングする場合は、[プランのアップグレード](https://circleci.com/pricing/)をご検討ください。


### Performance プランを利用しているのに、ビルドがキューイングするのはなぜですか?
{: #why-are-my-builds-queuing-even-though-im-on-performance-plan }
{:.no_toc}
CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソースクラス]({{site.baseurl}}/ja/2.0/configuration-reference/#resource_class)ごとに同時実行数のソフト制限が設けられています。 ジョブのキューイングが発生する場合は、この制限に達している可能性が考えられます。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### プロジェクトダッシュボード上にプロジェクトがないのはなぜですか？
{: #why-cant-i-find-my-project-on-the-projects-dashboard }
{:.no_toc}
ビルドしようとしているプロジェクトが表示されておらず、CircleCI 上で現在ビルド中のものではない場合は、CircleCI アプリケーションの左上隅で組織を確認してください。  左上にユーザー `my-user` が表示されている場合、`my-user` に属する GitHub プロジェクトだけが  `Projects` の下に表示されます。  GitHub プロジェクト `your-org/project` をビルドする場合、アプリケーションの [Switch Organization] メニューでお客様の組織を `your-org` に変更します。

### 現在のプランでコンテナ数は十分にあるのに、「build didn’t run because it needs more containers than your plan allows (お客様のプランで使用可能なコンテナ数の不足によりビルドを実行できませんでした）」というエラーが表示されます。 なぜですか?
{: #i-got-an-error-saying-my-build-didnt-run-because-it-needs-more-containers-than-your-plan-allows-but-my-plan-has-more-than-enough-why-is-this-failing }
{:.no_toc}
CircleCI のデフォルト設定では、1 プロジェクトあたりの並列実行数が 16 までに制限されています。 この数を超えてリクエストした場合、ビルドは失敗してしまいます。 上限を大きくしたいときは [CircleCI 日本語サポートセンター](https://support.circleci.com/hc/ja) よりお問い合わせください。

### Docker イメージの名前の付け方は？ 見つけ方を教えてほしい。
{: #how-do-docker-image-names-work-where-do-they-come-from }
{:.no_toc}
CircleCI  では、現在 [Docker Hub][docker-hub] からの Docker イメージのプル (と Docker Engine のプッシュ) をサポートしています。 [公式の Docker イメージ][docker-library]に対して行えるのは、以下のようにイメージ名やタグを指定したプルのみです。

```
golang:1.7.1-jessie
redis:3.0.7-jessie
```

Docker Hub のパブリックイメージについては、下記のようにアカウント名やユーザー名を付加した形でプルすることも可能です。

```
my-user/couchdb:1.6.1
```

### Docker イメージのバージョンを指定するときのベストプラクティスは？
{: #what-is-the-best-practice-for-specifying-image-versions }
{:.no_toc}
`latest` タグを **付けず** に Docker イメージを指定することをお勧めします。 もしくは、特定のバージョンやタグを付けるのも良い方法です。ベースとなるイメージのディストリビューションに変更があった際に、アップストリームの変更によるコンテナへの影響を防ぐには、例えば `circleci/ruby:2.4-jessie-node` のように指定します。 `circleci/ruby:2.4` とだけ指定した場合は、たとえば、`jessie` から `stretch` への予期しない変更による影響を受ける可能性があります。 他の応用例を知りたいときは、「Executor タイプの選び方」の[Docker イメージ活用のヒント]({{ site.baseurl }}/ja/2.0/using-docker/#docker-image-best-practices)や、「CircleCI のビルド済み Docker イメージ」の[ビルド済みイメージの活用方法]({{ site.baseurl }}/ja/2.0/circleci-images/#best-practices)を参照してください。

### Docker イメージでタイムゾーンを設定する方法は？
{: #how-can-i-set-the-timezone-in-docker-images }
{:.no_toc}
Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 下記のように `.circleci/config.yml` を編集してください。

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

## ワークフロー
{: #workflows }

### ワークフローで API は使用できますか?
{: #can-i-use-the-api-with-workflows }
{:.no_toc}
はい、ご利用いただけます。 API エンドポイントの利用方法や関連ドキュメントについては「[パイプライン]({{ site.baseurl }}/ja/2.0/build-processing/)」をご覧ください。

### ワークフローでビルドの「自動キャンセル」はできますか？
{: #can-i-use-the-auto-cancel-feature-with-workflows }
{:.no_toc}
<br/>可能です。[ビルドのスキップおよびキャンセル]({{ site.baseurl }}/ja/2.0/skip-build/)で設定手順をご確認ください。

### ワークフローで `store_test_results`（試験結果を保存する)  を使えますか？
{: #can-i-use-storetestresults-with-workflows }
{:.no_toc}
`store_test_results` を使って、テスト結果のデータを [Test Summary] セクションに記録することができます。また、[タイミング データに基づいたテストの分割]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/#splitting-by-timing-data)にも使用できます。 時系列のテストデータは CircleCI 2.0 の ワークフローより使用できるようになったもので、同一名称のジョブのデータを使って 50 ビルド分さかのぼることができます。

### オンプレミス環境にインストールした CircleCI でもワークフローは使えますか？
{: #can-i-use-workflows-with-the-installable-circleci }
{:.no_toc}
はい、お客様のオンプレミス環境でもご利用いただけます。 CircleCI のインストール手順などについては「[管理者向け概要]({{ site.baseurl }}/ja/2.0/overview)」を参照してください。

### 同時に実行できるジョブの数は？
{: #how-many-jobs-can-i-run-at-one-time }
{:.no_toc}
同時に実行できるジョブの数は、ご契約中のプランの利用可能なコンテナ数によって決まります。 仮に 10 個の ワークフロージョブが実行されようとしていて、プラン上は 5 つのコンテナしか使えない場合は、実行されるのは一度に 5 つのジョブまでです。 ワークフローの設定を行うことで、複数のジョブを同時もしくは連続的に実行できます。 ファンアウト（複数のジョブを同時実行する）、あるいはファンイン（その前の独立したジョブが完了するまで以降の全ジョブを待機させる）が可能です。

### 同一のワークフロー内で Linux 環境と Mac 環境両方のジョブを実行できるようにする機能が追加される予定はありますか？
{: #do-you-plan-to-add-the-ability-to-launch-jobs-on-both-linux-and-mac-environments-in-the-same-workflow }
{:.no_toc}
既にサポートしています。 [2.0 `config.yml` サンプルファイル]({{ site.baseurl }}/ja/2.0/sample-config/#sample-configuration-with-multiple-executor-types)の複数の Executor タイプのセクションを参照してください。

### `config.yml` ファイルを複数ファイルに分割することはできますか？
{: #is-it-possible-to-split-the-configyml-into-different-files }
{:.no_toc}
`config.yml` を複数のファイルに分割する機能は今のところ提供していません。

### 変更のあった単一のジョブのみをビルドできますか？
{: #can-i-build-only-the-jobs-that-changed }
{:.no_toc}
いいえ、できません。

### ワークフローを使ってフォークするプルリクエストをビルドすることは可能ですか？
{: #can-i-build-fork-prs-using-workflows }
{:.no_toc}
はい、可能です！

### ワークフローを指定した日時にスケジュール実行することは可能ですか？
{: #can-workflows-be-scheduled-to-run-at-a-specific-time-of-day }
{:.no_toc}
はい、クラウド版の CircleCI アプリケーションであれば可能です。 例えば、ワークフローを午後 4 時に実行するなら、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンとなります。

### スケジュール実行の際に使われるタイムゾーンは？
{: #what-time-zone-is-used-for-schedules }
{:.no_toc}
スケジュールの指定は、UTC 協定世界時のタイムゾーンに基づきます

### ビルドのスケジュール実行が失敗する理由は？
{: #why-didnt-my-scheduled-build-run }
{:.no_toc}
スケジュールを設定したワークフローを実行するブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュする必要があります。 `master` ブランチにおけるプッシュは、`master` ブランチに対するワークフローしかスケジュールされません。

### 複数のワークフローをスケジュール実行できますか？
{: #can-i-schedule-multiple-workflows }
{:.no_toc}
はい。`trigger:` キー内で `schedule` を設定したワークフローは、すべて指定したスケジュールに基づいて実行されます。

### スケジュールされたワークフローは、指定された時間通り正確に実行されますか？
{: #are-scheduled-workflows-guaranteed-to-run-at-precisely-the-time-scheduled }
{:.no_toc}
スケジュールの正確性については保証できません。 設定した時間にコミットがプッシュされたとしてワークフローをスケジュール実行します。

## Windows
{: #windows }

### Windows でのビルドを開始するには何が必要ですか?
{: #what-do-i-need-to-get-started-building-on-windows }
{:.no_toc}
[比較表](https://circleci.com/pricing/#comparison-table)を参照して、Windows のリソースにアクセスできるプランを確認してください。

### 使用している Windows のバージョンを教えてください。
{: #what-exact-version-of-windows-are-you-using }
{:.no_toc}

[Windows での Hello World]({{site.baseurl}}/2.0/hello-world-windows/)のページに使用している Windows のバージョンが掲載されています。

### マシンには何がインストールされていますか?
{: #what-is-installed-on-the-machine }
{:.no_toc}

[Windows での Hello World]({{site.baseurl}}/2.0/hello-world-windows/) のページに[使用可能な依存関係の一覧]({{site.baseurl}}/2.0/hello-world-windows/#software-pre-installed-in-the-windows-image)が掲載されています。

### CircleCI Server 上で Windows は利用できますか？
{: #is-windows-available-on-installed-versions-of-circleci }
{:.no_toc}

CircleCI Server v３.x および v2.x で Windows Exexutor をご利用いただけます。

## 料金・支払い
{: #billing }

### 従量課金制（クレジット）プラン
{: #credit-usage-plans }
{:.no_toc}
[料金プランページ](https://circleci.com/pricing/)でプランの詳細をご確認ください。

#### クレジットとは何ですか？
{: #what-are-credits }
{:.no_toc}
クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

たとえば、毎分 10 クレジットのレートで Docker または Linux の Medium コンピューティング オプションを利用する場合、25,000 クレジットのパッケージでは 2,500 分のビルドが可能です。 CircleCI ではパフォーマンス (開発者の生産性の向上) と価値を備えた最適なビルドを行なっていただけるよう複数のコンピューティングサイズを提供しています。

必要に応じて、並列実行を使用してビルド時間をさらに短縮できます。並列実行を使用すると、ジョブを複数のテストに分割して同時に実行できます。 2倍の並列実行により、通常 2,500 分で実行されるビルドが 1,250 分で実行できるため、開発者の生産性がさらに向上します。 2つの Executor がそれぞれ 1,250 分間並行して実行している場合、合計ビルド時間は 2,500 分になります。

#### 異なる組織間で契約プランを共有できますか？ その場合、請求を 1 箇所にまとめることは？
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
可能です。CircleCI アプリのサイドバーから `Plan` を選択し、`Share & Transfer` をクリックします。

Free プラン以外のプランでは、`共有組織の追加`オプションによりお客様が管理者としてのアクセス権を持つ Free プランの組織とプランを共有することができます。 プランを共有するすべての組織が「Share & Transfer」のページに記載され、子組織のすべてのクレジットとその他の利用料金が親組織に請求されます。

Free プラン以外のプランでは、`譲渡プラン`</code>オプションによりお客様が管理者としてのアクセス権を持つ他の Free プランの組織にお客様のプランを譲渡することができます。 有料プランを別の組織に譲渡した場合、お客様の組織は Free プランにダウングレードされます。

#### コンテナの使用時間が 1 分未満の場合でも 1 分間の料金を支払う必要がありますか？
{: #if-a-container-is-used-for-under-one-minute-do-i-have-to-pay-for-a-full-minute }
{:.no_toc}
はい、その場合でも 1 分間分の料金をお支払いいただく必要があります。 1 分未満の秒単位は切り上げてクレジットを計算します。

#### クレジットの購入方法は？ 必要な時に必要な分だけ購入できますか？
{: #how-do-i-buy-credits-can-i-buy-in-any-increments }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

#### 支払う料金の内訳は？
{: #what-do-i-pay-for }
{:.no_toc}
プレミアム機能を利用するアクティブユーザーの人数分の料金、コンピューティングに対する料金のほか、Premium サポートを利用している場合はその料金も含まれます。


- マシンサイズを選べる機能などを利用するには、１アクティブ ユーザー あたり月額 25,000 クレジット (税抜) が必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。
  - 25,000 クレジットで 1 パッケージとなっており、1 パッケージは 15 ドル (税抜) です。
  - クレジットは毎月持ち越され、1 年後に失効します。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。

#### 1ヶ月のストレージ使用料金とネットワーク料金の計算方法は？
{: #how-do-I-calculate-my-monthly-storage-and-network-costs }
{:.no_toc}

**注:** Performance プランのお客様の場合、外向きの通信とストレージに対する課金は、2022 年 5 月 1 日より有効になり、お客様の請求日に基づいて請求されます (変更される場合があります)。 CircleCI では現在、ネットワークとストレージの使用状況を管理するための変数と制御機能を追加しており、**2022 年 4 月 1 日**よりご利用いただける予定です。 ここで記載されている内容は、2022 年 5 月 1 日にこれらの追加変更が有効になって以降適用されます。 現在の使用状況を確認するには、[CircleCI Web アプリ](https://app.circleci.com/)から、**Plan > Plan Usage** に移動してください。
{: class="alert alert-info" }

[CircleCI Web アプリ](https://app.circleci.com/)から **Plan > Plan Usage** に移動してお客様のストレージとネットワークの使用状況を確認し、1ヶ月のストレージ料金とネットワーク料金を計算してください。

##### ストレージ
{: #storage }
{:.no_toc}

日々の使用量から 1ヶ月のストレージ料金を計算するには、 **Storage** タブをクリックし、組織の月間の割り当て GB を超過していないかを確認します。 超過分（GB-Months/TB-Months）に 420 クレジットを乗じることで、1ヶ月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット (0.5 ドル)。

##### ネットワーク
{: #network }
{:.no_toc}

ネットワークの使用に対する課金は、CircleCI からセルフホストランナーへのトラフィックに対してのみ適用されます。 詳細は[こちら]({{site.baseurl}}/2.0/persist-data/#overview-of-storage-and-network-transfer)を参照してください。

超過分（GB/TB）に 420 クレジットを乗じることで、その月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット (0.5 ドル)。

#### 1ヶ月の IP アドレスの範囲機能料金の計算方法は？
{: #how-do-I-calculate-my-monthly-IP-ranges-costs }
{:.no_toc}

1ヶ月の IP アドレスの範囲機能の料金は、[CircleCI アプリ](https://app.circleci.com/)で Plan > Plan Usage に移動し、IP アドレスの範囲機能の利用状況を確認して計算します。

**IP 範囲機能の使用状況** のサマリーに加えて、 **IP Ranges** タブに移動して、データ使用状況の詳細を確認できます。 このタブでは、IP アドレスの範囲機能の使用量の値は、 IP アドレスの範囲が有効なジョブの実行中の Docker コンテナ内外の未加工のバイト数を表します。

このバイト数には、ジョブの全体のネットワーク通信_および_ Docker コンテナの送受信に使われるバイトも含まれます。  IP 範囲機能が有効なジョブにおいて、ジョブの実行の開始前に Docker イメージをコンテナにプルするために使用されるデータには_料金は発生しません _。

この機能は、IP 範囲が有効なジョブで使用されるデータの GB ごとに、お客様のアカウントから 450 クレジットを消費します。 **Job Details** UI ページの **Resources** タブで各ジョブの IP アドレスの範囲機能の使用状況の詳細をご覧いただけます。 詳細は、[IP アドレスの範囲機能の料金]({{site.baseurl}}/2.0/ip-ranges/#pricing)をご覧ください。

#### 有効化する前に 1ヶ月の IP アドレスの範囲機能の料金を把握するにはどうすれば良いですか？

Job Details の UI ページの Resources タブから、すべての Docker ジョブ (リモート Docker を除く) の概算ネットワーク通信量を確認できます。  GB になっていない場合は、450 クレジットを乗じて GB に変換し、Docker ジョブで IP アドレスの範囲機能を有効にする場合の概算コストを把握してください。

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
- マシンユーザー

**注:** プロジェクトが[オープンソース]({{ site.baseurl }}/ja/2.0/oss)の場合は、アクティブユーザーとは**見なされません**。

アクティブユーザーの一覧は、CircleCI の Web アプリにログインし、`Plan` > `Plan Usage` > `Users` タブをクリックして確認できます。

#### クレジットを使い切るとどうなりますか？
{: #what-happens-when-i-run-out-of-credits }
{:.no_toc}

Performance プランでは、クレジットが残り 2% になると、25% のクレジット サブスクリプション (最低でも 25,000 クレジット) が補充されます)。 たとえば、毎月のパッケージ サイズが 100,000 クレジットの場合には、残りが 2,000 クレジットになると、25,000 クレジットが自動的にチャージされます (1 クレジットあたり税抜 0.0006 ドル)。

アカウントで補充が繰り返し行われていることに気付いた場合は、 CircleCI ウェブアプリにログインし、`Plan` > `Plan Usage` をクリックします。 多くの場合、クレジットパッケージを増やすことにより補充の繰り返しを最小限に抑えることができます。 プランを管理するには、 `Plan Overview` をクリックしてください。

**Free プラン**では、クレジットがなくなるとジョブの実行に失敗します。

#### クレジットに有効期限はありますか？
{: #do-credits-expire }
{:.no_toc}
**Performance プラン**のクレジットは、購入後 1 年で失効します。 アカウントのサブスクリプションを停止した場合も、未使用のクレジットは失効します。

#### 支払い方法は？
{: #how-do-i-pay }
{:.no_toc}
毎月の料金は CircleCI アプリ内で支払えます。

#### 支払いのスケジュールは？
{: #when-do-i-pay }
{:.no_toc}

**Performance プラン**では、請求サイクルの初日に、Premium サポートの料金と毎月のクレジットパッケージの料金が請求されます。 その月の_間_にクレジットが補充された場合 ( 利用可能なクレジットが 2% に達し 25% が自動補充された場合など ) は、_補充時_に支払いが行われます。

#### ビルドが「Queued」または「Preparing」の場合、課金されますか？
{: #am-i-charged-if-my-build-is-queued-or-preparing }

いいえ。 ジョブが "queued (キューイング中)"と通知された場合、ジョブが**プラン**や**同時実行**の制限のために待機状態になっていることを意味しています。 ジョブが "preparing (準備中)" の場合は、CircleCI がお客様のジョブのセットアップまたはディスパッチをしています。

#### 有料プランの更新日はいつですか?
{: #what-are-the-other-renewal-dates }
{:.no_toc}

CircleCI からの請求が発生する以下の日付に加え、有料プランにアップグレード、または別の有料プランへ変更して初めてクレジット カードで決済した日付が、更新日として設定されます。

- 月間プランの場合、毎月の月額料金の請求日が更新日になります。
- 年間プランの場合、年に一度の年間料金の請求日が更新日になります。
- 年間プランを利用中でも、ユーザーの追加やクレジットの消費により未払い残高が発生した場合、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残高が設定された最低残高を下回った場合、自動的にクレジット購入が実行されます。

#### オープンソース プロジェクト向けのクレジットベース プランはありますか?
{: #are-there-credit-plans-for-open-source-projects }
{:.no_toc}

**Free プラン**を利用するオープンソースの組織には、Linux オープンソース プロジェクトに使用できる 400,000 クレジットが毎月無料で付与されます。  オープンソースのクレジットの利用可能量や制限は、UI 画面上では確認できません。

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。 macOS オープンソースのビルド向けの無料クレジットは、組織あたり最大 2 件のジョブの同時実行に使用できます。

#### 現在、コンテナベース プランのオープンソース プロジェクトで無料クレジットを受け取っています。 Performance プランのオープンソース プロジェクトで割引を受けるにはどうすればよいですか?
{: #i-currently-get-free-credits-for-open-source-projects-on-my-container-plan-how-do-i-get-discounts-for-open-source-on-the-performance-plan }
{:.no_toc}

現在、Performance プランでオープンソースをご利用のお客様への割引は行っていません。

#### Docker レイヤー キャッシュの利用に料金が発生するのはなぜですか?
{: #why-does-circleci-charge-for-docker-layer-caching }
{:.no_toc}

Docker レイヤー キャッシュ (DLC) は、変更のあった Docker レイヤーのみを再ビルドすることで、Docker イメージをビルドするパイプラインでのビルド時間を削減する機能です (DLC の詳細は[こちら]({{site.baseurl}}/ja/2.0/docker-layer-caching))。 DLC は 1 回のジョブ実行につき 200 クレジットを消費します。

お客様に DLC を安心してご利用いただくために、CircleCI ではいくつかの処理を行っています。 ソリッドステートドライブを使用し、キャッシュをゾーン間で複製し、DLC を利用可能な状態にします。 また、必要に応じてキャッシュを増やすことで、同時実行の要求に対応しながら、DLC をユーザーのジョブで利用できるようにしています。 これらのさまざまな最適化によって、コンピューティング プロバイダーである CircleCI に追加のコストが発生し、ユーザーが DLC を使用する際にそのコストが引き継がれます。

DLC のご利用金額を見積もるには、設定ファイル内の Docker レイヤー キャッシュが有効になっているジョブと、それらのジョブでビルドしている Docker イメージの数を確認してください。 設定ファイルに書き込んでいるジョブは 1 行でも、たとえば並列実行を有効にした場合、そのジョブがパイプラインで複数回実行される場合もあります。

Docker レイヤー キャッシュの効果は、Docker イメージをビルドしているパイプラインでのみはっきりと現れ、ジョブ中にビルドされるアプリケーション イメージに変更がない場合にそのレイヤーが再利用されることで、イメージのビルド時間が短縮されます。 パイプラインに Docker イメージをビルドするジョブがない場合は、Docker レイヤー キャッシュを使用してもメリットはありません。

---

### コンテナベースプラン
{: #container-based-plans }

#### コンテナ数を増やし、ビルドの待機時間を解消するには、どのようにコンテナ プランをアップグレードしたらよいですか?
{: #how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing }
{:.no_toc}
* Linux プランの変更: CircleCI アプリケーションで [Settings]  > [Plan Overview ]を開き、[Add Containers]ボタンをクリックします。 表示される入力欄に増やしたい数をタイプしたら、[Pay Now] ボタンをクリックして支払方法の設定画面へと進みます。

#### 異なる組織間で契約プランを共有できますか？ その場合、請求を 1 箇所にまとめることは？
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
はい。 CircleCI アプリケーションで [Settings (設定)] > [Share & Transfer (共有 & 転送)] > [Share Plan (プランの共有)] を開き、プランに追加したい組織を選択してください。

#### 個人アカウントではなく組織宛に請求されるよう設定できますか？
{: #can-i-set-up-billing-for-an-organization-without-binding-it-to-my-personal-account }
{:.no_toc}
はい、請求は組織全体に関連付けられています。 組織の管理者は、組織の設定ページから組織アカウントで料金の支払いを行えます。 ただし、お客様が全てのプロジェクトから外れる場合、それらを引き継ぐ別の GitHub 組織管理者をたてる必要があります。 この件については、よりスムーズに対応いただけるよう、今後の更新で方針を見直す予定です。

#### 課金に関連してコンテナはどのように定義されますか?
{: #what-is-the-definition-of-a-container-in-the-context-of-billing }
{:.no_toc}
ここでのコンテナとは、CPU 2 基と 4 GB の RAM を搭載したマシンを指し、このマシンのご利用に対して料金が発生します。 コンテナは、タスクの同時実行 (例: 5 つの異なるジョブを実行する) や並列実行 (例: 1 つのジョブを 5 つの異なるタスクに分解して一度に実行する) を行うために使用されます。 どちらの例でも 5 つのコンテナが必要になります。

#### リモート Docker の起動処理時間に料金が発生するのはなぜですか？
{: #why-am-i-being-charged-for-remote-docker-spin-up-time }
{:.no_toc}
CircleCI がリモート Docker インスタンスを起動するとき、プライマリ コンテナを実行する必要があり、コンピューティング リソースを消費します。 リモート Docker インスタンスそのものは無料ですが、プライマリ コンテナの起動処理時間に対して料金が発生することになります。

---

## アーキテクチャ
{: #architecture }

### テスト時に IPv6 は利用できますか？
{: #can-i-use-ipv6-in-my-tests }
{:.no_toc}
IPv6 によるローカル通信のテストでは、[Machine Executor]({{ site.baseurl }}/ja/2.0/configuration-reference/#machine) を利用できます。  CircleCI が使用しているクラウド プロバイダーのサービスすべてが IPv6 をサポートしているわけではないため、申し訳ありませんが、WAN における IPv6 通信はサポートしておりません。

machine Executor で実行しているホストは、`eth0` や `lo` といったネットワークインターフェースに対して IPv6 アドレスを割り当てられます。

IPv6 環境のサービスをテストするために、コンテナに IPv6 アドレスを割り当てるように Docker を設定することも可能です。  以下のように Docker デーモンを設定することで、グローバルに有効化することができます。

```yaml
jobs:
  ipv6_tests:
  machine:
    # The image uses the current tag, which always points to the most recent
    # supported release. If stability and determinism are crucial for your CI
    # pipeline, use a release date tag with your image, e.g. ubuntu-2004:202201-02
    image: ubuntu-2004:current
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

Docker に IPv6 アドレスを割り当てる方法は複数あり、上記のように [Docker デーモンを設定する方法](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/)、[`docker network create` コマンドを使用する方法](https://docs.docker.com/engine/reference/commandline/network_create/)、そして [`docker-compose` を使用する方法](https://docs.docker.com/compose/compose-file/#enable_ipv6)が挙げられます。


### CircleCI  がサポートする OS は？
{: #what-operating-systems-does-circleci-20-support }
{:.no_toc}
- **Linux:** CircleCI は柔軟性に優れており、ほぼすべての Linux アプリケーションをビルドできます。 Web アプリケーションはもちろん、それ以外のビルドにも利用できます。

- **Android:** 詳細は「[言語ガイド: Android]({{ site.baseurl }}/ja/2.0/language-android/)」をご覧ください。

- **iOS:** 「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial)」でビルド方法を確認できます。

- **Windows:** 現在、Windows は早期アクセス版のみご利用いただけます。 早期アクセス版のお申し込みについては、CircleCI Discuss の[こちらの投稿](https://discuss.circleci.com/t/windows-early-access-now-available-on-circleci/30977)をご参照ください。

### CircleCI がサポートしている CPU アーキテクチャは？
{: #which-cpu-architectures-does-circleci-support }
{:.no_toc}
Docker ジョブは `amd64`を、マシンジョブは `amd64` と [ARM リソース]({{ site.baseurl }}/ja/2.0/arm-resources/) をサポートしています。


[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/
