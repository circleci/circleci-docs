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

- 目次
{:toc}

## 全般

### CircleCI の従業員にプログラム コードを見られるおそれはありませんか?

{:.no_toc} CircleCI の従業員がお客様の許諾を得ずにコードを見ることはありません。 お客様が問題解決のサポートを希望されるときには、事前に許可を得たうえで、サポート エンジニアがコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティ ポリシー]({{ site.baseurl }}/2.0/security/)をご覧ください。

## 移行

### CircleCI 1.0 から 2.0 へ移行するメリットを教えてください。
{:.no_toc}
- CircleCI 2.0 ではコンテナの利用に関する仕様が大幅に変更され、多数のジョブの高速化と、使用可能なコンテナのアイドル状態の防止を図っています。
- CircleCI 2.0 ではジョブが複数のステップで構成されます。 ジョブ内の各ステップは自由に編集でき、ビルドの方法をニーズに合わせて柔軟にカスタマイズできるようになりました。
- CircleCI 2.0 のジョブでは、公開されているほぼすべての Docker イメージに加え、独自に依存関係を設定しているカスタム イメージも利用できます。

### Jenkins から CircleCI 2.0 へ移行する方法を教えてください。

{:.no_toc} Jenkins に記述されている内容をそのまま `steps:` にコピーして貼り付けます。[Hello World]({{ site.baseurl }}/2.0/hello-world/) の基本的な例では、以下のようになります。

```yaml
    steps:
      - run: echo "bash コマンドをここに記述します"
      - run:
          command: |
            echo "2 行以上の bash コマンドはこのように記述します"
            echo "通常は Jenkins の Execute Shell の内容をコピー ＆ ペーストすればよいだけです"
```

Jenkins と CircleCI のコンセプトの違いについては「[Jenkins からの移行]({{ site.baseurl }}/2.0/migrating-from-jenkins/)」をご覧ください。

### inference コマンドは CircleCI 2.0 でも実行できますか?

{:.no_toc} CircleCI 2.0 は、プロジェクトの内容から推測して変換するようなことはしません。構成ビルダー インターフェイスによって `config.yml` のすべてのジョブを構成できる、スマート デフォルト型モデルの採用を進めています。

### 基本イメージを作成していなくても、CircleCI 2.0 を使用できますか?

{:.no_toc} もちろんです。CircleCI が提供している基本イメージをご利用いただけます。 ただし、お使いになる基本イメージのサポートが将来のリリースによって終了する場合もありますのでご注意ください。

たとえば `circleci/build-image:ubuntu-14.04-XL-922-9410082` というイメージは、CircleCI の Web アプリケーションで使用している Ubuntu 14.04 (Trusty Tahr) のイメージと同等の内容になっています。 容量はかなり大きく (非圧縮時で 17.5 GB 程度)、ローカル環境でのテストにはあまり適していません。

このイメージは、デフォルトで `ubuntu` ユーザーとしてアクションを実行し、Docker Compose で提供されるネットワーク サービスと連携するよう設計されています。

このイメージに含まれている言語やツールの一覧は、[こちら]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/)でご確認いただけます。

## ホスティング

### CircleCI 2.0 はオンプレミスでも利用できますか?

{:.no_toc} はい、お客様のオンプレミス環境でもご利用いただけます。詳しいインストール手順については「[管理者向けの概要]({{ site.baseurl }}/2.0/overview)」をご覧ください。

### CircleCI のホスティング オプションについて教えてください。
{:.no_toc}
- **クラウド:** CircleCI のチームがサーバーの初期設定、インフラストラクチャ、セキュリティ対策を管理し、サービスのメンテナンスを担当します。 最新機能や自動アップグレードをすぐに利用できるため、お客様の内部システムの管理にかかる負担が軽減されます。

- **サーバー:** AWS などと同様に、お客様が CircleCI のインストールと管理を行います。お客様のデータセンター ポリシーに沿ってファイアウォールの内側でサーバーの初期設定やメンテナンスを実施できます。 あらゆる管理権限がお客様に付与されるため、自由にカスタマイズしたり、最新バージョンのリリース直後にアップグレードしたりといったことが可能です。

### CircleCI Enterprise という名称を使わなくなったのはなぜですか?

{:.no_toc} 「Enterprise」は、もともとファイアウォールの内側で利用できる CircleCI のオプションを指していましたが、 この名称によってお客様や CircleCI の従業員に混乱が生じていました。

そこで「CircleCI」という総称を使用することで、クラウド サービス経由で使用したり、ファイアウォールの内側にインストールしたり、あるいはその両方を組み合わせたハイブリッド環境で活用したりと、1 つの製品で多様なニーズに対応できることを明確にしました。

## トラブルシューティング

### コミットをプッシュしてもジョブが実行されません。

{:.no_toc} CircleCI アプリケーションの Workflows タブで、エラー メッセージが出力されていないかどうかを確認してください。 多くの場合、`config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

詳細については「[YAML の記述]({{ site.baseurl }}/2.0/writing-yaml/)」をご覧ください。

`config.yml` のフォーマットのミスを確認したうえで、それでも解決しない場合は [CircleCI サポート センター](https://support.circleci.com/hc/ja)で検索してみてください。

### 「usage キュー」と「run キュー」の違いは何ですか?
{:.no_toc}
**usage キュー**は 1 つの組織内でビルドを実行するためのコンテナが不足しているときに発生します。 使用可能なコンテナの数は、CircleCI のプロジェクト セットアップ時に選択したプランによって決まります。 ビルドの待機時間が頻繁に発生しているようであれば、プランを変更して、使用するコンテナ数を増やすことをお勧めします。

**run キュー**は CircleCI に高い負荷がかかっているときに発生します。 この場合、ユーザーのビルドはいったん run キューに入り、マシンが利用できる状態になったら処理されます。

つまり、**usage キュー**が発生したときは[コンテナを追加購入する](#コンテナ数を増やしビルドの待機時間を解消するにはどのようにコンテナ-プランをアップグレードしたらよいですか)ことで処理時間を短縮できますが、**run キュー**による待機時間は避けようがありません (とはいえ、CircleCI では少しでも待機時間を解消できるように努めています)。

### Performance プランを利用しているのに、ビルドの待機時間が発生するのはなぜですか?

{:.no_toc} CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソース クラス](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)ごとに同時処理数のソフト制限が設けられています。 ビルドの待機時間が発生する場合は、この制限に達している可能性が考えられます。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### [Add Projects (プロジェクトの追加)] ページにプロジェクトが見当たりません。

{:.no_toc} ビルドしようとしているプロジェクトが表示されておらず、現在 CircleCI 上でビルドしているものではない場合は、CircleCI アプリケーションの左上隅で組織を確認してください。 たとえば、左上に `my-user` と表示されているなら、`my-user` に属する GitHub プロジェクトのみが `Add Projects` の下に表示されます。 `your-org/project` の GitHub プロジェクトをビルドするには、CircleCI アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

### 「You have met the maximum number of active users allowed for your plan per billing period.」というエラー メッセージが表示されます。

{:.no_toc} 今後の請求期間でシート数の上限を超えないように、プランの設定でユーザー シートを追加してください。 ご不明な点がある場合やサポートが必要な場合は、billing@circleci.com までお問い合わせください。

### 現在のプランではコンテナ数が不足していないのに「build didn’t run because it needs more containers than your plan allows」というエラー メッセージが表示されるのは なぜですか?

{:.no_toc} CircleCI のデフォルト設定では、1 プロジェクトあたりの並列処理数が 16 までに制限されています。 この数を超えてリクエストすると、ビルドが失敗します。 並列処理数の上限を引き上げたい場合は、[サポート センターまたはカスタマー サクセス マネージャー](https://support.circleci.com/hc/ja)にお問い合わせください。

### Docker イメージの命名 規則について教えてください。

{:.no_toc} CircleCI 2.0 では、現在のところ [Docker Hub](https://hub.docker.com) からの Docker イメージのプル (と Docker Engine のプッシュ) をサポートしています。 [公式の Docker イメージ](https://hub.docker.com/explore/)に対して行えるのは、以下のように名称やタグを指定したプルのみです。

    golang:1.7.1-jessie
    redis:3.0.7-jessie
    

Docker Hub のパブリック イメージについては、以下のようにアカウント名やユーザー名を付け加えてプルすることも可能です。

    my-user/couchdb:1.6.1
    

### イメージのバージョン指定に関するベスト プラクティスを教えてください。
{:.no_toc}
`latest` タグを**付けず**に Docker イメージを指定することをお勧めします。 特定のバージョンとタグを使用するのもよいでしょう。たとえば、`circleci/ruby:2.4-jessie-node` のように限定的にイメージを指定すると、ベースとなるイメージのディストリビューションが変更されたときも、アップストリームの影響がコンテナに及ぶのを防ぐことができます。 一方、`circleci/ruby:2.4` とだけ指定していると、`jessie` から `stretch` への予期しない変更による影響を受けるおそれがあります。 その他の応用例は、「Executor タイプを選択する」の「[Docker イメージのベスト プラクティス]({{ site.baseurl }}/2.0/executor-types/#docker-イメージのベスト-プラクティス)」や、「CircleCI のビルド済み Docker イメージ」の「[ベスト プラクティス]({{ site.baseurl }}/2.0/circleci-images/#ベスト-プラクティス)」でご覧いただけます。

### Docker イメージのタイムゾーンを設定する方法を教えてください。

{:.no_toc} Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 たとえば、以下のように `.circleci/config.yml` を編集します。

`.circleci/config.yml` で環境変数 `TZ` を定義する例

```yaml
version: 2
jobs:
  build:
    docker:
      - image: your/primary-image:version-tag
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: mysql:5.7
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
           TZ: "America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "America/Los_Angeles"
```

この例では、プライマリ イメージと mySQL イメージの両方にタイムゾーンを設定しています。

設定できるタイムゾーンの一覧は、[Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) でご確認ください。

## ワークフロー

### ワークフローに API は使用できますか?

{:.no_toc} はい、ご利用いただけます。 API エンドポイントの利用方法や関連ドキュメントについては「[パイプライン]({{ site.baseurl }}/2.0/build-processing/)」をご覧ください。

### ワークフローでビルドの自動キャンセルは使用できますか?

{:.no_toc} はい、ご利用いただけます。「[ビルドのスキップとキャンセル]({{ site.baseurl }}/2.0/skip-build/)」で手順をご確認ください。

### ワークフローに `store_test_results` は使用できますか?

{:.no_toc} はい、ご利用いただけます。`store_test_results` を使用すると、テスト結果のデータを [Test Summary (テスト サマリー)] セクションに記録できます。また、[タイミング データに基づいた分割]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#タイミング-データに基づいた分割)を行う際にも利用できます。 テストのタイミング データは、CircleCI 2.0 のワークフローから利用できるようになったもので、同一名称のジョブのデータは 50 ビルド分さかのぼることができます。

### CircleCI 1.0 でもワークフローを使用できますか?

{:.no_toc} ワークフローは CircleCI 2.0 で実装された機能です。ワークフローを使用するには、CircleCI 2.0 でビルドを実行する必要があります。

### オンプレミス環境の CircleCI でもワークフローを使用できますか?

{:.no_toc} はい、ご利用いただけます。ワークフローは CircleCI 2.0 の 1 つの機能として、法人向けのオンプレミス版でもご利用いただけます。 CircleCI のインストール手順などについては「[管理者向けの概要]({{ site.baseurl }}/2.0/overview)」を参照してください。

### 同時にいくつのジョブを実行できますか?

{:.no_toc} 同時に実行できるジョブの数は、ご契約中のプランの利用可能なコンテナ数によって決まります。 たとえば、5 つのコンテナが利用できる場合、ワークフロー内の 10 個のジョブを実行しようとしても、一度に実行されるジョブの数は 5 つまでとなります。 ワークフローの構成により、複数のジョブを同時に実行、または連続して実行することができます。 ファンアウト (複数のジョブを同時実行する) またはファンイン (依存関係にあるジョブが完了するまで、他の全ジョブを待機させる) が可能です。

### 単一のワークフロー内で Linux 環境と Mac 環境の両方のジョブを実行できるような機能をサポートする予定はありますか?

{:.no_toc} 既にサポートしています。 See the section for multiple executor types in the [Sample 2.0 `config.yml` Files]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-multiple-executor-types) document.

### `config.yml` を複数のファイルに分割することは可能ですか?

{:.no_toc} 現時点では、`config.yml` を複数のファイルに分割する機能は提供しておりません。

### 変更したジョブのみをビルドすることは可能ですか?

{:.no_toc} いいえ、できません。

### フォークするプル リクエストをワークフローでビルドすることは可能ですか?

{:.no_toc} はい、可能です。

### ワークフローの実行スケジュールを指定することは可能ですか?

{:.no_toc} はい、クラウド版の CircleCI アプリケーションであれば可能です。 たとえば、午後 4 時にワークフローを実行したいときには、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンに基づきます。

### スケジュールの指定にはどのタイムゾーンが使用できますか?

{:.no_toc} UTC 協定世界時のタイムゾーンに基づいてスケジュールを指定できます。

### スケジュールを指定したビルドが失敗してしまいました。

{:.no_toc} スケジュールを設定したワークフローを実行するブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュしてください。 `master` ブランチへのプッシュでは、`master` ブランチのワークフローしかスケジュールが設定されません。

### 複数のワークフローの実行スケジュールを指定することは可能ですか?

{:.no_toc} はい、可能です。`trigger:` キー内で `schedule` を設定したワークフローは、すべて指定したスケジュールに基づいて実行されます。

### スケジュールを設定したワークフローは、指定した時間どおりに正確に実行されますか?

{:.no_toc} スケジュールの正確性については保証できません。 スケジュールを設定したワークフローは、指定した時間にコミットがプッシュされたように実行されます。

## Windows

### Windows でのビルドを開始するには何が必要ですか?
{:.no_toc}
[Performance プラン](https://circleci.com/ja/pricing/usage/)を購入し、プロジェクトの[パイプラインを有効化]({{site.baseurl}}/2.0/build-processing/)する必要があります。 Windows ジョブでは、1 分あたり 40 クレジットが消費されます。

### 使用している Windows のバージョンを教えてください。
{:.no_toc}
Windows Server 2019 Datacenter エディションの Server Core オプションを使用しています。

### マシンには何がインストールされていますか?
{:.no_toc}
[使用可能な依存関係の一覧]({{site.baseurl}}/2.0/hello-world-windows/#windows-イメージにプリインストールされているソフトウェア)が「[Windows での Hello World]({{site.baseurl}}/2.0/hello-world-windows/)」に掲載されています。

### マシンのサイズを教えてください。
{:.no_toc}
4 基の vCPU と 15 GB の RAM を備えた Windows マシンです。

### インストール版の CircleCI で Windows は利用できますか?
{:.no_toc}
残念ながら、現時点ではサーバー インストール版の CircleCI で Windows をご利用いただくことはできません。

## 料金・支払い

### 従量課金制 (クレジットベース) プラン

#### 新しい料金プランによって私たちユーザーにはどのような影響がありますか?

{:.no_toc} 大多数のお客様は、ご契約中のプランを引き続きご利用いただけます。今回のプラン追加は、お客様にさらなる選択肢をご提供することを目的としています。

#### 「クレジット」とは何ですか?

{:.no_toc} クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

たとえば、毎分 10 クレジットのデフォルト レートで 1 台のマシンを使用する場合、25,000 クレジットのパッケージでは 2,500 分のビルドが可能です。 同じパッケージで 2 倍の並列処理を実行する場合は 1,250 分、10 倍の並列処理を実行する場合は 250 分のビルドが可能です。

#### 組織内でプランを共有し、請求をまとめることは可能ですか?

{:.no_toc} Yes, log in to the CircleCI web app > select `Plan` in the sidebar > click `Share & Transfer`.

On non-free plans, you can share your plan with free organizations for which you have admin access using the `Add Shared Organization` option. All orgs you have shared your plan with will then be listed on the Share & Transfer page and child organizations will bill all credits and other usage to the parent org.

On non-free plans, you can transfer your plan to another free organization for which you have admin access using the `Transfer Plan` option. When you transfer a paid plan to another org, your org will be downgraded to the free plan.

#### コンテナの使用時間が 1 分未満でも、1 分間分の料金が計上されますか?

{:.no_toc} You pay to the next nearest credit. First we round up to the nearest second, and then up to the nearest credit.

#### クレジットの購入方法を教えてください。 必要な分だけ購入することは可能ですか?

{:.no_toc} Every month, you are charged for your selected credit package at the beginning of the month.

#### 支払う料金の内訳はどのようになっていますか?

{:.no_toc} You can choose to pay for premium features per active user, compute, and optionally, premium support.

- 新しいマシン サイズなどを利用するには、アクティブ ユーザー 1 人あたり月額 15 ドル (税抜) が必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。 
  - 25,000 クレジットで 1 パッケージとなっており、1 パッケージは 15 ドル (税抜) です。
  - クレジットは毎月ロールオーバーされ、1 年後に失効します。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。

#### アクティブ ユーザー単位の料金が設定されているのはなぜですか?
{:.no_toc}
Credit usage covers access to compute. We prefer to keep usage costs as low as possible to encourage frequent job runs, which is the foundation of a good CI practice. Per-active-user fees cover access to platform features and job orchestration. This includes features like dependency caching, artifact caching, and workspaces, all of which speed up build times without incurring additional compute cost.

#### *アクティブ ユーザー*の定義を教えてください。
{:.no_toc}
An `active user` is any user who triggers the use of compute resources on non-OSS projects. This includes activities such as:

- ビルドをトリガーするユーザーからのコミット (PR マージ コミットを含む)
- CircleCI の Web アプリケーションでのジョブの再実行 ([SSH デバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs)を含む)
- [ジョブの手動承認]({{ site.baseurl }}/2.0/workflows/#手動承認後に処理を続行するワークフロー) (承認者はすべてのダウンストリーム ジョブのアクターと見なされる)
- スケジュールされたワークフローの使用
- マシン ユーザー

**Note:** If your project is [open-source]({{ site.baseurl }}/2.0/oss) you will **not** be considered an active user.

To find a list of your Active Users, log in to the CircleCI web app > click `Plan` > click `Plan Usage` > click on the `Users` tab.

#### クレジットを使い切るとどうなりますか?
{:.no_toc}
On the **Performance plan**, when you reach 2% of your remaining credits, you will be refilled 25% of your credit subscription, with a minimum refill of 25,000 credits. For example, If your monthly package size is 100,000 credits, you will automatically be refilled 25,000 credits (at $.0006 each, not including applicable taxes) when you reach 2000 remaining credits.

If you notice that your account is receiving repeated refills, review your credit usage by logging in to the CircleCI web app > click `Plan` > click `Plan Usage`. In most cases, increasing your credit package should minimize repeat refills. You can manage your plan by clicking `Plan Overview`.

On the **free plan**, jobs will fail to run once you have run out of credits.

#### クレジットに有効期限はありますか?
{:.no_toc}
**Performance Plan**: Credits expire one year after purchase. Unused credits will be forfeited when the account subscription is canceled.

#### 支払い方法について教えてください。

{:.no_toc} You can pay from inside the CircleCI app for monthly pricing.

#### 支払いのスケジュールについて教えてください。
{:.no_toc}
On the **Performance Plan**, at the beginning of your billing cycle, you will be charged for user seats, premium support tiers and your monthly credit allocation. Any subsequent credit refills *during* the month (such as the auto-refilling at 25% on reaching 2% of credits available) will be paid *at the time of the refill*.

#### Am I charged if my build is "Queued" or "Preparing"?

No. If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or *dispatching* your job so that it may run.

#### What are the other renewal dates?
{:.no_toc}
The first credit card charge on the day you upgrade to a paid plan or change paid plans, in addition to the following charges from CircleCI:

- 月間プランでは、毎月の月額料金の請求日が更新日になります。
- 年間プランでは、年に一度の年額料金の請求日が更新日になります。
- 年間プランをご利用中でも、ユーザーの追加やクレジットの補充によって未払い残高が発生した場合は、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残りが設定された最小値を下回った場合、自動的にクレジットが購入されます。

#### Are there credit plans for open source projects?
{:.no_toc}
Open source organizations **on our free plan** receive 400,000 free credits per month that can be spent on Linux open source projects, using a maximum of 4 concurrent jobs.

If you build on macOS, we also offer organizations on our free plan 25,000 free credits per month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com. Free credits for macOS open source builds can be used on a maximum of 2 concurrent jobs per organization.

#### I currently get free credits for open source projects on my container plan. How do I get discounts for open source on the Performance plan?
{:.no_toc}
CircleCI no longer offers discounts for open source customers on the Performance plan.

#### Why does CircleCI charge for Docker layer caching?
{:.no_toc}
Docker layer caching (DLC) reduces build times on pipelines where Docker images are built by only rebuilding Docker layers that have changed (read more about DLC [here]({{site.baseurl}})/2.0/docker-layer-caching). DLC costs 200 credits per job run.

There are a few things that CircleCI does to ensure DLC is available to customers. We use solid-state drives and replicate the cache across zones to make sure DLC is available. We will also increase the cache as needed in order to manage concurrent requests and make DLC available for your jobs. All of these optimizations incur additional cost for CircleCI with our compute providers, which pass along to customers when they use DLC.

To estimate your DLC cost, look at the jobs in your config file with Docker layer caching enabled, and the number of Docker images you are building in those jobs. There are cases where a job can be written once in a config file but the job runs multiple times in a pipeline, for example, with parallelism enabled.

Note that the benefits of Docker layer caching are only apparent on pipelines that are building Docker images, and reduces image build times by reusing the unchanged layers of the application image built during your job. If your pipeline does not include a job where Docker images are built, Docker layer caching will provide no benefit.

* * *

### コンテナベース プラン

#### How do I upgrade my container plan with more containers to prevent queuing?
{:.no_toc}
- Linux: Go to the Settings > Plan Settings page of the CircleCI app to increase the number of containers on your Linux plan. Type the increased number of containers in the entry field under the Choose Linux Plan heading and click the Pay Now button to enter your payment details.

- macOS: Go to the Settings > Plan Settings page of the CircleCI app and click the macOS tab in the upper-right. Then, click the Pay Now button on the Startup, Growth, or Mobile Focused plan to enter your payment details.

#### Is there a way to share plans across organizations and have them billed centrally?

{:.no_toc} Yes, go to the Settings > Share & Transfer > Share Plan page of the CircleCI app to select the Orgs you want to add to your plan.

#### Can I set up billing for an organization, without binding it to my personal account?

{:.no_toc} Yes, the billing is associated with the organization. You can buy while within that org's context from that org's settings page. But, you must have another GitHub Org Admin who will take over if you unfollow all projects. We are working on a better solution for this in a future update.

#### What is the definition of a container in the context of billing?

{:.no_toc} A container is a 2 CPU 4GB RAM machine that you pay for access to. Containers may be used for concurrent tasks (for example, running five different jobs) or for parallelism (for example, splitting one job across five different tasks, all running at the same time). Both examples would use five containers.

#### Why am I being charged for remote Docker spin up time?

{:.no_toc} When CircleCI spins up a remote docker instance, it requires the primary container to be running and spending compute. Thus while you are not charged for the remote docker instance itself, you are charged for the time that the primary container is up.

* * *

## アーキテクチャ

### テストで IPv6 を利用できますか?

{:.no_toc} You can use the [machine executor]({{ site.baseurl }}/2.0/executor-types) for testing local IPv6 traffic. Unfortunately, we do not support IPv6 internet traffic, as not all of our cloud providers offer IPv6 support.

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

### CircleCI 2.0 ではどの OS をサポートしていますか?
{:.no_toc}
- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These do not have to be web applications!

- **Android:** Refer to [Android Language Guide]({{ site.baseurl }}/2.0/language-android/) for instructions.

- **iOS:** Refer to the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial) to get started.

- **Windows:** We are currently offering Early Access to Windows. Please take a look at [this Discuss post](https://discuss.circleci.com/t/windows-early-access-now-available-on-circleci/30977) for details on how to get access.

### CircleCI ではどの CPU アーキテクチャをサポートしていますか?
 {:.no_toc}
`amd64` is the only supported CPU architecture.