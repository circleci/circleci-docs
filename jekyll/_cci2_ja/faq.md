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

### CircleCI の従業員にプログラム コードを見られるおそれはありませんか?
{: #does-circleci-look-at-my-code }
{:.no_toc}
CircleCI の従業員がお客様の許諾を得ずにコードを見ることはありません。 お客様が問題解決のサポートを希望されるときには、事前に許可を得たうえで、サポート エンジニアがコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティ ポリシー]({{ site.baseurl }}/ja/2.0/security/)をご覧ください。

## 移行
{: #migration }

Visit the [Migration Introduction]({{ site.baseurl }}/2.0/migration-intro/) doc which links out to migration guides for various platforms.

### How do I migrate from Jenkins to CircleCI?
{: #how-do-i-migrate-from-jenkins-to-circleci }
{:.no_toc}

Jenkins と CircleCI のコンセプトの違いについては「[Jenkins からの移行]({{ site.baseurl }}/2.0/migrating-from-jenkins/)」をご覧ください。

### Can I use CircleCI without creating base images?
{: #can-i-use-circleci-without-creating-base-images }
{:.no_toc}

Yes, CircleCI provides a selection of "convenience images" for use with the Docker executor. For a full list, along with usage instructions, visit the [CircleCI Developer Hub](https://circleci.com/developer/images) and the [CircleCI Images guide]({{site.baseurl}}/2.0/circleci-images/).

For the `machine` executor, see the [available machine images](https://circleci.com/docs/2.0/configuration-reference/#available-machine-images) list.

For an introduction to execution environments and images, see the [Executors and Images guide]({{site.baseurl}}/2.0/executor-intro/).

## ホスティング
{: #hosting }

### Is CircleCI available to enterprise customers?
{: #is-circleci-20-available-to-enterprise-customers }
{:.no_toc}
Yes, CircleCI server is available for installation on AWS or GCP. See the [CircleCI Server v3.x Overview]({{ site.baseurl }}/2.0/server-3-overview) for details and links to installation instructions. [Contact us](https://circleci.com/pricing/server/) to discuss your requirements.

### CircleCI のホスティング オプションについて教えてください。
{: #what-are-the-differences-between-circlecis-hosting-options }
{:.no_toc}
- **クラウド:** CircleCI のチームがサーバーの初期設定、インフラストラクチャ、セキュリティ対策を管理し、サービスのメンテナンスを担当します。 新機能や自動アップグレードが即座に反映され、システムの内部的な管理負担が軽減されます。

- **Server** - You install and manage CircleCI, through a service like AWS or GCP. Server installations are behind a firewall that your team sets up and maintains according to your datacenter policy. You have full administrative control for complete customization and management of upgrades as new versions are released.

## トラブルシューティング
{: #troubleshooting }

### コミットをプッシュしてもジョブが実行されません。
{: #why-arent-my-jobs-running-when-i-push-commits }
{:.no_toc}
In the CircleCI application, check the individual job and workflow views for error messages. 多くの場合、`config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

詳しくは「[YAML の書き方]({{ site.baseurl }}/ja/2.0/writing-yaml/)」をご確認ください。

`config.yml` のフォーマットのミスを確認したうえで、それでも解決しない場合は [CircleCI サポート センター](https://support.circleci.com/hc/ja)で検索してみてください。

### Why is my job queued?
{: #why-is-my-job-queued }
{:.no_toc}
A job might end up being **queued** because of a concurrency limit being imposed due to the plan you or your organisation are on. If your jobs are queuing often, you can consider [upgrading your plan](https://circleci.com/pricing/).


### Why are my builds queuing even though I'm on the Performance plan?
{: #why-are-my-builds-queuing-even-though-im-on-performance-plan }
{:.no_toc}
CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソース クラス](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)ごとに同時処理数のソフト制限が設けられています。 If you are experiencing queuing on your jobs, it is possible you are hitting these limits. [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### Why can't I find my project on the Projects dashboard?
{: #why-cant-i-find-my-project-on-the-projects-dashboard }
{:.no_toc}
If you are not seeing a project you would like to build, and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For instance, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Projects`.  GitHub のプロジェクト名 `your-org/project` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される [Switch Organization] メニューから目的の Org である `your-org` に切り替えます。

### 「build didn’t run because it needs more containers than your plan allows」というエラーが表示されます。しかし、現在のプランはその条件を満たしています。 なぜエラーになるのでしょうか？
{: #i-got-an-error-saying-my-build-didnt-run-because-it-needs-more-containers-than-your-plan-allows-but-my-plan-has-more-than-enough-why-is-this-failing }
{:.no_toc}
CircleCI のデフォルト設定では、1 プロジェクトあたりの並列処理数が 16 までに制限されています。 この数を超えてリクエストした場合、ビルドは失敗してしまいます。 上限を大きくしたいときは [CircleCI Japanese Support Center](https://support.circleci.com/hc/ja) よりお問い合わせください。

### Docker イメージの名前の付け方は？ 見つけ方を教えてほしい。
{: #how-do-docker-image-names-work-where-do-they-come-from }
{:.no_toc}
CircleCI currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. [公式の Docker イメージ](https://hub.docker.com/explore/)に対して行えるのは、以下のように名称やタグを指定したプルのみです。

```
golang:1.7.1-jessie
redis:3.0.7-jessie
```

Docker Hub のパブリックイメージについては、下記のようにアカウント名やユーザー名を付加した形でプルすることも可能です。

```
my-user/couchdb:1.6.1
```

### Docker イメージのバージョンを指定するときのベストな方法は？
{: #what-is-the-best-practice-for-specifying-image-versions }
{:.no_toc}
`latest` タグを**付けず**に Docker イメージを指定することをお勧めします。 もしくは、特定のバージョンやタグを付けるのも良い方法です。ベースとなるイメージのディストリビューションに変更があったとき、イメージが変更されないようにしてアップストリームにコンテナへの影響を防ぐには、例えば `circleci/ruby:2.4-jessie-node` のように指定します。 `circleci/ruby:2.4` とだけ指定した場合は、`jessie` から `stretch` への予期しない変更による影響を受ける可能性があります。 他の応用例を知りたいときは、「Executor タイプの選び方」の[Docker イメージ活用のヒント]({{ site.baseurl }}/ja/2.0/executor-types/#docker-image-best-practices)や、「CircleCI のビルド済み Docker イメージ」の[ビルド済みイメージの活用方法]({{ site.baseurl }}/2.0/circleci-images/#best-practices)を参照してください。

### Docker イメージでタイムゾーンを設定する方法は？
{: #how-can-i-set-the-timezone-in-docker-images }
{:.no_toc}
Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 下記のように `.circleci/config.yml` を編集してみてください。

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
ワークフローの図

### Workflows のなかで API は使えますか？
{: #can-i-use-the-api-with-workflows }
{:.no_toc}
はい、ご利用いただけます。 API エンドポイントの利用方法や関連ドキュメントについては「[パイプライン]({{ site.baseurl }}/2.0/build-processing/)」をご覧ください。

### Workflows でビルドの「自動キャンセル」はできますか？
{: #can-i-use-the-auto-cancel-feature-with-workflows }
{:.no_toc}
<br/>可能です。「[ビルドのスキップ・キャンセル]({{ site.baseurl }}/ja/2.0/skip-build/)」で設定手順をご確認ください。

### テスト結果を保存する `store_test_results` を Workflows 内で使えますか？
{: #can-i-use-storetestresults-with-workflows }
{:.no_toc}
`store_test_results` を使用すると、テスト結果のデータを [Test Summary (テスト サマリー)] セクションに記録できます。 また、[タイミング データに基づいた分割]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/#splitting-by-timing-data)を行う際にも利用できます。 時系列のテストデータは CircleCI 2.0 の Workflows より利用できるようになったもので、同一名称のジョブで使っているデータは 50 ビルド分さかのぼることができます。

### オンプレミス環境にインストールした CircleCI でも Workflows は使えますか？
{: #can-i-use-workflows-with-the-installable-circleci }
{:.no_toc}
はい、お客様のオンプレミス環境でもご利用いただけます。 CircleCI のインストール手順などについては「[管理者向け概要]({{ site.baseurl }}/ja/2.0/overview)」を参照してください。

### 同時に実行できるジョブの数はいくつですか？
{: #how-many-jobs-can-i-run-at-one-time }
{:.no_toc}
同時に実行できるジョブの数は、ご契約中のプランの利用可能なコンテナ数によって決まります。 仮に 10 個の Workflows ジョブが実行されようとしていて、プラン上は 5 つのコンテナしか使えない場合は、実行されるのは一度に 5 つのジョブまでです。 Workflow の設定を行うことで、複数のジョブを同時もしくは連続的に実行できます。 ファンアウト（複数のジョブを同時実行する）、あるいはファンイン（その前の独立したジョブが完了するまで以降の全ジョブを待機させる）が可能です。

### 同一の Workflow 内で Linux 環境と Mac 環境両方のジョブを実行できるようにする機能が追加される予定はありますか？
{: #do-you-plan-to-add-the-ability-to-launch-jobs-on-both-linux-and-mac-environments-in-the-same-workflow }
{:.no_toc}
既にサポートしています。 「2.0 `config.yml` のサンプル ファイル」の「[複数の Executor タイプを含む構成例 (macOS と Docker)]({{ site.baseurl }}/ja/2.0/sample-config/#複数の-executor-タイプを含む構成例-macos-と-docker)」を参照してください。

### `config.yml` ファイルの内容を複数ファイルに分割することはできますか？
{: #is-it-possible-to-split-the-configyml-into-different-files }
{:.no_toc}
`config.yml` の内容を複数のファイルに分割する機能は今のところ提供していません。

### 変更のあった単一のジョブのみをビルドできますか？
{: #can-i-build-only-the-jobs-that-changed }
{:.no_toc}
いいえ、できません。

### Workflows でフォークするプルリクエストをビルドすることは可能ですか？
{: #can-i-build-fork-prs-using-workflows }
{:.no_toc}
はい。

### Workflows を指定した日時にスケジュール実行することは可能ですか？
{: #can-workflows-be-scheduled-to-run-at-a-specific-time-of-day }
{:.no_toc}
はい、クラウド版の CircleCI アプリケーションであれば可能です。 例えば、午後 4 時に Workflow を実行するなら、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンとなります。

### スケジュール実行の際に使われるタイムゾーンは？
{: #what-time-zone-is-used-for-schedules }
{:.no_toc}
UTC 協定世界時のタイムゾーンに基づいてスケジュールを指定できます。

### ビルドのスケジュール実行が失敗する理由は？
{: #why-didnt-my-scheduled-build-run }
{:.no_toc}
スケジュールを設定したワークフローを実行するブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュしてください。 `master` ブランチにおけるプッシュは、`master` ブランチに対する Workflow しかスケジュールされません。

### 複数の Workflows をスケジュール実行できますか？
{: #can-i-schedule-multiple-workflows }
{:.no_toc}
はい、可能です。`trigger:` キー内で `schedule` を設定したワークフローは、すべて指定したスケジュールに基づいて実行されます。

### スケジュールされた Workflows は、指定された時間通り正確に実行されますか？
{: #are-scheduled-workflows-guaranteed-to-run-at-precisely-the-time-scheduled }
{:.no_toc}
スケジュールの正確性については保証できません。 設定した時間にコミットがプッシュされたとして Workflow をスケジュール実行します。

## Windows
{: #windows }

### Windows でのビルドを開始するには何が必要ですか?
{: #what-do-i-need-to-get-started-building-on-windows }
{:.no_toc}
[Performance plan](https://circleci.com/pricing/usage/) と、 [Pipelines enabled]({{site.baseurl}}/2.0/build-processing/) が必要となります。 Windows ジョブでは、1 分あたり 40 クレジットが消費されます。

### 使用している Windows のバージョンを教えてください。
{: #what-exact-version-of-windows-are-you-using }
{:.no_toc}

Windows Server 2019 Datacenter エディションの Server Core オプションを使用しています。

### マシンには何がインストールされていますか?
{: #what-is-installed-on-the-machine }
{:.no_toc}

[使用可能な依存関係の一覧]({{site.baseurl}}/2.0/hello-world-windows/#windows-イメージにプリインストールされているソフトウェア)が「[Windows での Hello World]({{site.baseurl}}/2.0/hello-world-windows/)」に掲載されています。

### マシンのサイズを教えてください。
{: #what-is-the-machine-size }
{:.no_toc}

4 基の vCPU と 15 GB の RAM を備えた Windows マシンです。

### Is Windows available on CircleCI server?
{: #is-windows-available-on-installed-versions-of-circleci }
{:.no_toc}

The Windows executor is available on CircleCI server v3.x and v2.x

## 料金・支払い
{: #billing }

### 従量課金制（クレジット）プラン
{: #credit-usage-plans }
{:.no_toc}
Visit our [Pricing page](https://circleci.com/pricing/) to learn more about the details of our plans.

#### クレジットとは何ですか？
{: #what-are-credits }
{:.no_toc}
クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

For example, the 25,000 credit package would provide 2,500 build minutes when using a Docker or Linux "medium" compute at 10 credits per minute. CircleCI provides multiple compute sizes so you can optimize builds between performance (improved developer productivity) and value.

When applicable, build time can be further reduced by using parallelism, which splits the job into multiple tests that are executed at the same time. With 2x parallelism, a build that usually runs for 2,500 minutes could be executed in 1,250 minutes, further improving developer productivity. Note that when two executors are running in parallel for 1,250 minutes each, total build time remains 2,500 minutes.

#### 異なる Org 間で契約プランを共有できますか？ その場合、請求を 1 箇所にまとめることは？
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

On non-free plans, you can share your plan with free organizations for which you have admin access using the `Add Shared Organization` option. 子組織のすべてのクレジットとその他の利用料金は親組織に請求されます。

On non-free plans, you can transfer your plan to another free organization for which you have admin access using the `Transfer Plan` option. When you transfer a paid plan to another org, your org will be downgraded to the free plan.

#### コンテナの使用時間が 1 分未満の場合でも 1 分間の料金を支払う必要がありますか？
{: #if-a-container-is-used-for-under-one-minute-do-i-have-to-pay-for-a-full-minute }
{:.no_toc}
You pay to the next nearest credit. 1 分未満の秒単位は切り上げでクレジットを計算します。

#### クレジットの購入方法は？ 必要な時に必要な分だけ購入できますか？
{: #how-do-i-buy-credits-can-i-buy-in-any-increments }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

#### 支払う料金の内訳は？
{: #what-do-i-pay-for }
{:.no_toc}
プレミアム機能を利用するアクティブ ユーザーの人数分の料金、コンピューティングに対する料金のほか、プレミアム サポートを利用している場合はその料金も含まれます。


- 新しいマシン サイズなどを利用するには、アクティブ ユーザー 1 人あたり月額 15 ドル (税抜) が必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。
  - 25,000 クレジットで 1 パッケージとなっており、1 パッケージは 15 ドル (税抜) です。
  - クレジットは毎月ロールオーバーされ、1 年後に失効します。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。

#### How do I calculate my monthly costs?
{: #how-do-I-calculate-my-monthly-costs }
{:.no_toc}

Calculate your monthly costs by finding your Storage and Network usage on the [CircleCI app](https://app.circleci.com/) by navigating to Plan > Plan Usage.

##### ストレージ
{: #storage }
{:.no_toc}

日々の使用量から1 か月のストレージコストを計算するには、 **Storage(ストレージ)** タブをクリックし、組織の月間の割り当て GB を超過していないかを確認します。 超過分（GB-Months/TB-Months）に420クレジットを乗じることで、月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット ($.50)。

##### ネットワーク
{: #network }
{:.no_toc}

使用量から 1 か月のネットワーク コストを計算するには、 **Network (ネットワーク)** タブをクリックし、組織で超過が発生していないかを確認します。 上記のストレージの場合と同様に、超過分の GB/TB に 420 クレジットを乗じることで月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット ($.50)。

GB の割り当ては、CircleCI 外部へのトラフィックにのみ適用されます。 CircleCI 内部のトラフィックには制限はありません。

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

Performance プランでは、クレジットが残り 10% を下回ると、25% 相当のクレジット サブスクリプションが自動的に補充されます (料金はプラン料金の 25%)。 たとえば、毎月のパッケージ サイズが 100,000 クレジットの場合には、残りが 2,000 クレジットになると、25,000 クレジットが自動的にチャージされるしくみです (1 クレジットあたり税抜 0.0006 ドル)。

If you notice that your account is receiving repeated refills, review your credit usage by logging in to the CircleCI web app > click `Plan` > click `Plan Usage`. In most cases, increasing your credit package should minimize repeat refills. You can manage your plan by clicking `Plan Overview`.

On the **Free plan**, jobs will fail to run once you have run out of credits.

#### クレジットに有効期限はありますか?
{: #do-credits-expire }
{:.no_toc}
**Performance plan**: Credits expire one year after purchase. ただし、プランを解約すると、未使用のクレジットは無効となり、利用できなくなります。

#### 支払い方法について教えてください。
{: #how-do-i-pay }
{:.no_toc}
CircleCI からの請求が発生する以下の日付に加え、有料プランにアップグレード、または別の有料プランへ変更して初めてクレジット カードで決済した日付が、更新日として設定されます。

#### 支払いのスケジュールについて教えてください。
{: #when-do-i-pay }
{:.no_toc}

On the **Performance plan**, at the beginning of your billing cycle, you will be charged for premium support tiers and your monthly credit allocation. 自動チャージは、保有クレジット数の残りが、月額購入数に対して 2% になった時、 25% 相当分（最小25,000クレジット）を自動追加するというものです。

#### ビルドが「Queued」または「Preparing」の場合、課金されますか？
{: #am-i-charged-if-my-build-is-queued-or-preparing }

はい。 If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

#### 有料プランの更新日はいつですか?
{: #what-are-the-other-renewal-dates }
{:.no_toc}

更新日は、以下にあげる CircleCI からの請求が発生する日に加え、有料プランへアップグレードまたは別の有料プランへ変更し、初めてクレジットカードで決済した日付に設定されます。

- 月間プランの場合、毎月の月額料金の請求日が更新日になります。
- 年間プランの場合、年に一度の年間料金の請求日が更新日になります。
- 年間プランを利用中でも、ユーザーの追加やクレジットの消費により未払い残高が発生した場合、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残高が設定された最低残高を下回った場合、自動的にクレジット購入が実行されます。

#### オープンソース プロジェクト向けのクレジットベース プランはありますか?
{: #are-there-credit-plans-for-open-source-projects }
{:.no_toc}

Open source organizations **on our Free plan** receive 400,000 free credits per month that can be spent on Linux open source projects.  Open-source credit availability and limits will not be visible in the UI.

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。 macOS オープンソースのビルド向けの無料クレジットは、組織あたり最大 2 件のジョブの同時実行に使用できます。

#### 現在、コンテナベース プランのオープンソース プロジェクトで無料クレジットを受け取っています。 Performance プランのオープンソース プロジェクトで割引を受けるにはどうすればよいですか?
{: #i-currently-get-free-credits-for-open-source-projects-on-my-container-plan-how-do-i-get-discounts-for-open-source-on-the-performance-plan }
{:.no_toc}

CircleCI no longer offers discounts for open source customers on the Performance plan.

#### Docker レイヤー キャッシュの利用に料金が発生するのはなぜですか?
{: #why-does-circleci-charge-for-docker-layer-caching }
{:.no_toc}

Docker レイヤー キャッシュ (DLC) は、変更のあった Docker レイヤーのみを再ビルドすることで、Docker イメージをビルドするパイプラインでのビルド時間を削減する機能です (DLC の詳細は[こちら]({{site.baseurl}}/ja/2.0/docker-layer-caching))。 DLC は 1 回のジョブ実行につき 200 クレジットを消費します。

ユーザーに DLC をご利用いただくために、CircleCI ではいくつかの処理を行っています。 ソリッドステート ドライブを使用し、キャッシュをゾーン間で複製し、DLC を利用可能な状態にします。 また、必要に応じてキャッシュを増やすことで、同時処理の要求に対応しながら、DLC をユーザーのジョブで利用できるようにしています。 これらのさまざまな最適化によって、コンピューティング プロバイダーである CircleCI に追加のコストが発生し、ユーザーが DLC を使用する際にそのコストが引き継がれます。

DLC のご利用金額を見積もるには、設定ファイル内の Docker レイヤー キャッシュが有効になっているジョブと、それらのジョブでビルドしている Docker イメージの数を確認してください。 設定ファイルに書き込んでいるジョブは 1 行でも、たとえば並列処理を有効にした場合、そのジョブがパイプラインで複数回実行される場合もあります。

Docker レイヤー キャッシュの効果は、Docker イメージをビルドしているパイプラインでのみはっきりと現れ、ジョブ中にビルドされるアプリケーション イメージに変更がない場合にそのレイヤーが再利用されることで、イメージのビルド時間が短縮されます。 パイプラインに Docker イメージをビルドするジョブがない場合は、Docker レイヤー キャッシュを使用してもメリットはありません。

---

### コンテナ課金プラン
{: #container-based-plans }

#### コンテナ数を増やし、ビルドの待機時間を解消するには、どのようにコンテナ プランをアップグレードしたらよいですか?
{: #how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing }
{:.no_toc}
* Linux プランの変更: CircleCI アプリケーションで [Settings (設定)] > [Plan Overview (プラン概要)] を開いて、[Add Containers (コンテナの追加)] ボタンをクリックします。 表示される入力欄に増やしたい数をタイプしたら、[Pay Now] ボタンをクリックして支払方法の設定画面へと進みます。

#### 組織内でプランを共有し、請求をまとめることは可能ですか?
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
はい。 CircleCI アプリケーションで [Settings (設定)] > [Share & Transfer (共有 & 転送)] > [Share Plan (プランの共有)] を開き、プランに追加したい組織を選択してください。

#### 請求先を個人アカウントから組織アカウントに変更できますか?
{: #can-i-set-up-billing-for-an-organization-without-binding-it-to-my-personal-account }
{:.no_toc}
はい、請求は組織全体に関連付けられています。 Org の設定ページにて、ユーザー自身がその Org として支払うことができます。 ただし、そのユーザーが全てのプロジェクトから外れる場合、それらを引き継ぐ別の GitHub Org 管理者をたてる必要があります。 将来のアップデートではよりわかりやすい解決策を提供できる予定です。

#### 課金に関連してコンテナはどのように定義されますか?
{: #what-is-the-definition-of-a-container-in-the-context-of-billing }
{:.no_toc}
ここでのコンテナとは、CPU 2 基と 4 GB の RAM を搭載したマシンを指し、このマシンのご利用に対して料金が発生します。 コンテナはタスクの同時実行（5 つの異なるジョブを実行するなど）や並列実行（1 つのジョブを 5 つの異なるタスクに分解してそれぞれを一斉に実行するなど）を行うのに使われます。 この場合はどちらの例でも 5 つのコンテナが必要になります。

#### リモート Docker の起動処理時間に料金が発生するのはなぜですか?
{: #why-am-i-being-charged-for-remote-docker-spin-up-time }
{:.no_toc}
CircleCI がリモート Docker インスタンスを起動するとき、プライマリコンテナを実行する必要があり、コンピューティングリソースを消費します。 リモート Docker インスタンスそのものは無料ですが、プライマリ コンテナの起動処理時間に対して料金が発生することになります。

---

## アーキテクチャ
{: #architecture }

### テスト時に IPv6 は利用できますか？
{: #can-i-use-ipv6-in-my-tests }
{:.no_toc}
IPv6 によるローカル通信のテストでは、[Machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) を利用できます。  残念ながら、WAN における IPv6 通信はサポートしていません。CircleCI 自体が使用しているクラウドサービスの全てが IPv6 をサポートしているわけではないためです。

machine Executor で実行しているホストは、`eth0` や `lo` といったネットワークインターフェースに対して IPv6 アドレスを割り当てられます。

IPv6 環境のサービスをテストするために、コンテナに IPv6 アドレスを割り当てるよう Docker を設定することも可能です。  下記のように Docker デーモンを設定することでグローバル設定を有効にできます。

```yaml
jobs:
  ipv6_tests:
  machine:
    image: ubuntu-1604:202007-01
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

Docker に IPv6 アドレスを割り当てる手法はいくつかあります。1 つは上記のように [Docker デーモンを設定する方法](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/)、2 つ目は [`docker network create` コマンドを用いる方法](https://docs.docker.com/engine/reference/commandline/network_create/)、そして [`docker-compose` を利用する方法](https://docs.docker.com/compose/compose-file/#enable_ipv6)です。


### What operating systems does CircleCI support?
{: #what-operating-systems-does-circleci-20-support }
{:.no_toc}
- **Linux:** CircleCI は柔軟性に優れており、ほぼすべての Linux アプリケーションをビルドできます。 Web アプリケーションはもちろん、それ以外のビルドにも利用できます。

- **Android:** 詳細は「[言語ガイド: Android]({{ site.baseurl }}/ja/2.0/language-android/)」をご覧ください。

- **iOS:** 「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial)」でビルド方法を確認できます。

- **Windows:** 現在、Windows は早期アクセス版のみご利用いただけます。 早期アクセス版のお申し込みについては、CircleCI Discuss の[こちらの投稿](https://discuss.circleci.com/t/windows-early-access-now-available-on-circleci/30977)をご参照ください。

### CircleCI がサポートしている CPU アーキテクチャは？
{: #which-cpu-architectures-does-circleci-support }
{:.no_toc}
CircleCI supports `amd64` for Docker jobs, and both `amd64` and [ARM resources]({{ site.baseurl }}/2.0/arm-resources/) for machine jobs.


[docker-hub]: https://hub.docker.com
