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
CircleCI の従業員がユーザーの許諾を得ずにコードを見ることはありません。 お客様が問題解決のサポートを希望されるときには、事前に許可を得たうえで、サポート エンジニアがコードを確認させていただく場合があります。

詳しくは CircleCI の[セキュリティポリシー]({{ site.baseurl }}/ja/2.0/security/)をご覧ください。

## 開発環境の移行

### CircleCI 1.0 から 2.0 へ移行するメリットは？
{:.no_toc}
- CircleCI 2.0 ではコンテナの利用に関する仕様が大幅に変更され、多数のジョブの高速化と、使用可能なコンテナのアイドル状態の防止を図っています。
- CircleCI 2.0 ではジョブが複数のステップで構成されます。 ジョブ内のそれぞれのステップは自由に編集でき、ビルドの方法を好きなように、柔軟にカスタマイズすることが可能になりました。  
    
- CircleCI 2.0 のジョブでは、公開されているほぼすべての Docker イメージに加え、独自に依存関係を設定しているカスタム イメージも利用できます。

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
- **クラウド:** CircleCI のチームがサーバーの初期設定、インフラフラストラクチャおよびセキュリティ対策の管理、サービスのメンテナンスを担当します。 新機能や自動アップグレードが即座に反映され、システムの内部的な管理負担が軽減されます。

- **オンプレミス型** - AWS などと同じようにユーザーが CircleCI のインストールと管理を行います。ファイアウォール環境におけるサーバーの初期設定とメンテナンスも、ユーザー自身がデータセンターのポリシーにしたがって実施します。 自在なカスタマイズや新バーションへのアップグレードの制御など、あらゆる管理権限があります。

### どうして CircleCI Enterprise という名称をやめたのですか？
{:.no_toc}
Enterprise はファイアウォールのあるオンプレミス環境で利用可能なオプションを指すものでした。 ただ、ユーザーの皆様や CircleCI のスタッフにとってまぎらわしい用語でもありました。

そのため、クラウドサービス経由で使えるもの、ファイアウォール環境に導入するもの、あるいはそのハイブリッドで活用するもの、というように、ニーズに応じて利用可能な CircleCI という 1 つの製品としました。

## トラブルシューティング

### コミットをプッシュしてもジョブが実行されない理由は？

{:.no_toc} CircleCI アプリケーションの Workflows タブで、エラー メッセージが出力されていないかどうかを確認してください。 多くの場合、`config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

詳細については「[YAML の記述]({{ site.baseurl }}/2.0/writing-yaml/)」をご覧ください。

`config.yml` のフォーマットのミスを確認したうえで、[CircleCI サポート センター](https://support.circleci.com/hc/ja)で問題の解決方法を検索してください。

### 「usage キュー」と「run キュー」の違いはなんですか？
{:.no_toc}
**usage キュー**は 1 つの組織内でビルドを実行するためのコンテナが不足しているときに発生します。 使用可能なコンテナの数は、CircleCI のプロジェクト設定時に選択したプランによって決まります。 ビルドのキューイングが頻繁に発生しているようであれば、プランを変更して、使用可能なコンテナ数を増やすことをお勧めします。

**run キュー**は CircleCI に高い負荷がかかっているときに発生します。 この場合、ユーザーのビルドはいったん run キューに入り、マシンが利用できる状態になったら処理されます。

つまり、**usage キュー**が発生したときは[コンテナを追加購入する](#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing)ことで処理時間を短縮できますが、**run キュー**による待ち時間は避けようがありません (とは言え、CircleCI では少しでも待ち時間を解消できるように努めています)。

### Performance プランを利用しているのに、ビルド キューイングが発生するのはなぜですか？

{:.no_toc} CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソース クラス](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)ごとに同時処理数のソフト制限が設けられています。 ビルド キューイングが発生する場合は、この制限を超過している可能性が考えられます。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### プロジェクトの追加ページにプロジェクトが見当たりません。

{:.no_toc} ビルド対象のプロジェクトが表示されない場合は、CircleCI 上でビルドが実行されていないときに CircleCI アプリケーションの左上隅で組織を確認してください。 たとえば、左上に `my-user` と表示されているなら、`my-user` に所属する GitHub プロジェクトのみが `Add Projects` の下に表示されます。 `your-org/project` の GitHub プロジェクトをビルドするには、CircleCI アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

### 「You have met the maximum number of active users allowed for your plan per billing period.」というエラー メッセージが表示されます。

{:.no_toc} 今後の請求期間でシート数の上限を超えないよう、プランの設定で十分なユーザー シートを追加してください。 ご不明な点がある場合やサポートが必要な場合は、billing@circleci.com までお問い合わせください。

### 現在のプランではコンテナ数が不足していないのに「build didn’t run because it needs more containers than your plan allows」というエラー メッセージが表示されるのは なぜですか？

{:.no_toc} CircleCI の既定では 1 プロジェクトあたりの並列処理数が 16 までに制限されています。 この数を超えてリクエストすると、ビルドが失敗します。 並列処理数の上限を引き上げたい場合は、[サポート センターまたはカスタマー サクセス マネージャー](https://support.circleci.com/hc/ja)にお問い合わせください。

### Docker イメージの命名 規則について教えてください。

{:.no_toc} CircleCI 2.0 では、現在のところ <a href=」https://hub.docker.com">Docker Hub</a> 上の Docker イメージのプル (と Docker Engine のプッシュ) をサポートしています。 <a href=」https://hub.docker.com/explore/">公式の Docker イメージ</a>に対して行えるのは、以下のように名称やタグを指定したプルのみです。

    golang:1.7.1-jessie
    redis:3.0.7-jessie
    

Docker Hub のパブリック イメージについては、以下のようにアカウント名やユーザー名を付け加えてプルすることも可能です。

    my-user/couchdb:1.6.1
    

### イメージのバージョン指定に関するベスト プラクティスを教えてください。
{:.no_toc}
`latest` タグを**付けず**に Docker イメージを指定することをお勧めします。 特定のバージョンやタグを使用するのもよいでしょう。たとえば、`circleci/ruby:2.4-jessie-node` のように限定的にイメージを指定すると、ベースとなるイメージのディストリビューションが変更されたときも、アップストリームでの影響がコンテナに及ぶのを防ぐことができます。 一方、`circleci/ruby:2.4` とだけ指定していると、`jessie` から `stretch` への予期しない変更による影響を受けるおそれがあります。 その他の応用例は「Executor タイプの選び方」の「[Docker イメージ活用のヒント]({{ site.baseurl }}/2.0/executor-types/#docker-イメージ活用のヒント)」や「CircleCI のビルド済み Docker イメージ」の「[ベストプラクティス]({{ site.baseurl }}/2.0/circleci-images/#ベストプラクティス)」でご覧いただけます。

### Docker イメージでタイムゾーンを設定する方法を教えてください。

{:.no_toc} Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 たとえば、以下のように `.circleci/config.yml` を編集します。

`.circleci/config.yml` で環境変数 `TZ` を定義する場合の設定例

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

この例では、プライマリ イメージと mySQL イメージの両方にタイムゾーンを設定しています。

設定できるタイムゾーンの一覧は、[Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) でご確認ください。

## ワークフロー

### ワークフローに API は使用できますか？

{:.no_toc} はい、ご利用いただけます。 API エンドポイントの利用方法や関連ドキュメントについては「[パイプライン]({{ site.baseurl }}/2.0/build-processing/)」をご覧ください。

### ワークフローでビルドの自動キャンセルは使用できますか？

{:.no_toc} はい、ご利用いただけます。「[ビルドのスキップとキャンセル]({{ site.baseurl }}/2.0/skip-build/)」で設定手順をご確認ください。

### ワークフローに `store_test_results` は使用できますか？

{:.no_toc} はい、ご利用いただけます。`store_test_results` を使用すると、テスト結果のデータを [Test Summary (テスト サマリー)] セクションに記録できます。また、[データを時系列順に分割する]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#タイミングデータに基づいた分割)ことも可能です。 時系列のテスト データは、CircleCI 2.0 のワークフローから利用できるようになったもので、同一名称のジョブのデータは 50 ビルド分さかのぼることができます。

### CircleCI 1.0 でもワークフローを使用できますか？

{:.no_toc} ワークフローは CircleCI 2.0 で実装された機能です。ワークフローを使用するには、CircleCI 2.0 でビルドを実行する必要があります。

### オンプレミス環境の CircleCI でもワークフローを使用できますか？

{:.no_toc} はい、ご利用いただけます。ワークフローは CircleCI 2.0 の 1 つの機能として、法人向けのオンプレミス版でもご利用いただけます。 CircleCI のインストール手順などについては「[管理者向けの概要]({{ site.baseurl }}/2.0/overview)」を参照してください。

### 同時にいくつのジョブを実行できますか？

{:.no_toc} 同時に実行できるジョブの数は、ご契約中のプランで利用可能なコンテナ数によって決まります。 たとえば、5 つのコンテナが利用できる場合、ワークフロー内の 10 個のジョブを実行しようとしても、一度に実行されるジョブの数は 5 つまでとなります。 ワークフローの設定により、複数のジョブを同時に実行、または連続して実行することができます。 ファンアウト (複数のジョブを同時実行する) またはファンイン (依存関係にあるジョブが完了するまで、他の全ジョブを待機させる) が可能です。

### 単一のワークフロー内で Linux 環境と Mac 環境の両方のジョブを実行できるような機能をサポートする予定はありますか？

{:.no_toc} 既にサポートしています。 「2.0 `config.yml` の設定例」の「[複数の Executor タイプ (macOS ＋ Docker) を利用する設定例]({{ site.baseurl }}/2.0/sample-config/#複数の-executor-タイプ-macos--docker-を利用する設定例)」を参照してください。

### `config.yml` を複数のファイルに分割することは可能ですか？

{:.no_toc} 現時点では、`config.yml` を複数のファイルに分割する機能は提供しておりません。

### 変更したジョブのみをビルドすることは可能ですか？

{:.no_toc} いいえ、できません。

### ワークフローでフォークするプル リクエストをビルドすることは可能ですか？

{:.no_toc} はい、可能です。

### ワークフローの実行スケジュールを指定することは可能ですか？

{:.no_toc} はい、クラウド版の CircleCI アプリケーションであれば可能です。 たとえば、午後 4 時にワークフローを実行したいときには、`cron:` キーの値として `"0 16 * * *"` を指定します。 時刻は UTC 協定世界時のタイムゾーンに基づきます。

### スケジュールの指定にはどのタイムゾーンが使用できますか？

{:.no_toc} UTC 協定世界時のタイムゾーンに基づいてスケジュールを指定できます。

### スケジュールを指定したビルドが失敗してしまいました。

{:.no_toc} スケジュールを設定するワークフローのブランチを正確に指定したうえで、ビルドしたいブランチに対して config.yml ファイルをプッシュしてください。 `master` ブランチへのプッシュでは、`master` ブランチのワークフローしかスケジュールが設定されません。

### 複数のワークフローの実行スケジュールを指定することは可能ですか？

{:.no_toc} はい、可能です。`trigger:` キー内で `schedule` を設定したワークフローは、すべて指定したスケジュールに基づいて実行されます。

### スケジュールを設定したワークフローは、指定した時間どおりに正確に実行されますか？

{:.no_toc} スケジュールの正確性については保証できません。 スケジュールを設定したワークフローは、指定した時間にコミットがプッシュされたかのように実行されます。

## Windows

### Windows でのビルドを開始するには何が必要ですか？
{:.no_toc}
[Performance プラン](https://circleci.com/JA/pricing/usage/)を購入し、プロジェクトの[パイプラインを有効]({{site.baseurl}}/2.0/build-processing/)にする必要があります。 Windows ジョブでは、1 分あたり 40 クレジットが消費されます。

### 使用している Windows のバージョンを教えてください。
{:.no_toc}
Windows Server 2019 Datacenter Edition の Server Core オプションを使用しています。

### マシンには何がインストールされていますか？
{:.no_toc}
[使用可能な依存関係の一覧]({{site.baseurl}}/2.0/hello-world-windows/#software-pre-installed-in-the-windows-image)は「[Hello World On Windows]({{site.baseurl}}/2.0/hello-world-windows/)」に掲載されています。

### マシンのサイズを教えてください。
{:.no_toc}
4 基の vCPU と 15 GB の RAM を備えた Windows マシンです。

### インストール版の CircleCI で Windows は利用できますか。
{:.no_toc}
現時点では、残念ながらサーバー インストール版の CircleCI で Windows をご利用いただくことはできません。

## 料金・支払い

### 従量課金制 (クレジットベース) プラン

#### 新しい料金プランによって私たちユーザーにはどのような影響がありますか？

{:.no_toc} 大多数のお客様は、ご契約中のプランを引き続きご利用いただけます。今回のプラン追加は、お客様にさらなる選択肢をご提供することを目的としています。

#### 「クレジット」とは何ですか？

{:.no_toc} クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

たとえば、毎分 10 クレジットの既定レートで 1 台のマシンを使用する場合、25,000 クレジットのパッケージでは 2,500 分のビルドが可能です。 同じパッケージで 2 倍の並列処理を実行する場合は 1,250 分、10 倍の並列処理を実行する場合は 250 分のビルドが可能です。

#### 組織内でプランを共有し、請求をまとめることは可能ですか？

{:.no_toc} はい。コンテナベースのプランと同じく、CircleCI アプリケーションで [Settings (設定)] > [Share & Transfer (共有 & 転送)] > [Share Plan (プランの共有)] を開き、プランに追加したい組織を選択してください。 子組織のすべてのクレジットとその他の利用料金は親組織に請求されます。

#### コンテナの使用時間が 1 分未満でも、1 分間分の料金が計上されますか？

{:.no_toc} はい、その場合でも 1 分間分の料金をお支払いいただく必要があります。 1 分未満の秒単位は切り上げでクレジットが計算されます。

#### クレジットの購入方法を教えてください。 必要な分だけ購入することは可能ですか？

{:.no_toc} 選択したクレジット パッケージの料金が、毎月初めに請求されます。

#### 支払う料金の内訳はどのようになっていますか？

{:.no_toc} プレミアム機能を利用するアクティブ ユーザーの人数分の料金、コンピューティングに対する料金のほか、プレミアム サポートを利用している場合はその料金も含まれます。

- 新しいマシン サイズなどを利用するには、アクティブ ユーザー 1 人あたり月額 15 ドルが必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。

#### *アクティブ ユーザー*の定義を教えてください。
{:.no_toc}
`アクティブ ユーザー`とは、非 OSS プロジェクトでコンピューティング リソースの使用をトリガーするユーザーのことです。 次のようなアクティビティが含まれます。

- ビルドをトリガーしたユーザーからのコミット (PR マージ コミットを含む)
- CircleCI の Web アプリケーションでのジョブの再実行 ([SSH デバッグ]({{ site.baseurl }}/2.0/ssh-access-jobs)を含む)
- [手動ジョブ]({{ site.baseurl }}/2.0/workflows/#承認後に処理を続行する-workflow-の例)の承認 (承認者はすべてのダウンストリーム ジョブのアクターと見なされる)
- スケジュールされたワークフローの使用
- マシン ユーザーMachine users

**メモ:** [オープンソース]({{ site.baseurl }}/2.0/oss) プロジェクトの場合、あなたがアクティブ ユーザーと見なされることは**ありません**。

#### クレジットを使い切るとどうなりますか？
{:.no_toc}
Performance プランでは、クレジットが残り 10% を下回ると、25% 相当のクレジットが自動的に補充されます。 たとえば、毎月のパッケージ サイズが 25,000 クレジットの場合には、クレジットが残り 2,500 になると、6,250 が自動的にチャージされる仕組みです。

#### クレジットに有効期限はありますか？
{:.no_toc}
**Performance プラン:** クレジットは購入後 1 年で失効します。 アカウントのサブスクリプションを停止した場合も、未使用のクレジットは失効します。

#### 支払い方法について教えてください。

{:.no_toc} 毎月の料金は、CircleCI アプリケーション内からお支払いいただけます。

#### 支払いのスケジュールについて教えてください。
{:.no_toc}
従量課金制のプランでは、請求サイクルの初日に、ユーザー シートの料金、プレミアム サポートの料金、毎月のクレジット パッケージの料金が請求されます。 *当月中*に追加したクレジット (クレジットが残り 10% になった時点で実行される 25% の自動チャージ分など) の料金は、*追加したタイミング*で請求されます。

#### 有料プランの更新日はいつですか？
{:.no_toc}
CircleCI からの請求が発生する以下の日付に加え、有料プランにアップグレード、または別の有料プランへ変更して初めてクレジット カードで決済した日付が、更新日として設定されます。

- 月間プランでは、毎月の月額料金の請求日が更新日になります。
- 年間プランでは、年に一度の年額料金の請求日が更新日になります。
- 年間プランをご利用中でも、ユーザーの追加やクレジットの補充によって未払い残高が発生した場合は、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残りが設定された最小値を下回った場合、自動的にクレジットが購入されます。

#### オープンソース プロジェクト向けのクレジットベース プランはありますか？
 {:.no_toc}
Open source organizations **on our free plan** receive 400,000 free credits per month that can be spent on Linux open source projects, using a maximum of 4 concurrent jobs.

If you build on macOS, we also offer organizations on our free plan 25,000 free credits per month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com. Free credits for macOS open source builds can be used on a maximum of 2 concurrent jobs per organization.

#### I currently get free credits for open source projects on my container plan. How do I get discounts for open source on the Performance plan?
{:.no_toc}
We still offer discounts for open source on our paid usage plans! Please [open a support ticket](https://support.circleci.com/hc/en-us) to talk to our team about customizing your plan for open source projects.

* * *

### コンテナベース プラン

#### What if I go over the minutes allotted for a Container-based macOS plan?

Minutes and overages ensure we can stabilize capacity while offering as much power as possible which should hopefully lead to the greatest possible utility all around.

Overages are as follows:

- Seed & Startup: .08/minute
- Growth: .05/minute

Users will be alerted in-app as they approach the limit and upon passing their respective limit.

Reach out to billing@circleci.com with any additional questions.

#### How do I upgrade my plan with more containers to prevent queuing?
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

## 稼働環境

### テストで IPv6 を利用できますか？

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

### CircleCI 2.0 ではどの OS をサポートしていますか？
{:.no_toc}
- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These do not have to be web applications!

- **Android:** Refer to [Android Language Guide]({{ site.baseurl }}/2.0/language-android/) for instructions.

- **iOS:** Refer to the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial) to get started.

- **Windows:** We are currently offering Early Access to Windows. Please take a look at [this Discuss post](https://discuss.circleci.com/t/windows-early-access-now-available-on-circleci/30977) for details on how to get access.

### CircleCI ではどの CPU アーキテクチャをサポートしていますか？
{:.no_toc}
`amd64` is the only supported CPU architecture.