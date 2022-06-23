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

詳しくは CircleCI の[セキュリティ ポリシー]({{site.baseurl}}/2.0/security/)をご覧ください。

### 基本イメージを作成していなくても、CircleCI  を使用できますか?
{: #can-i-use-circleci-without-creating-base-images }
{:.no_toc}
はい、CircleCI では Docker Executor と共に使用する多数の「CircleCI イメージ」を提供しています。 使用方法および全リストは、[CircleCI Developer Hub](https://circleci.com/developer/images) および [CircleCI イメージガイド]({{site.baseurl}}/2.0/circleci-images/)をご覧ください。

`machine` Executor に関しては、[利用可能なマシンイメージ]({{site.baseurl}}/ja/2.0/configuration-reference/#available-linux-machine-images)をご覧ください。

実行環境やイメージに関する概要は、[実行環境]({{site.baseurl}}/ja/2.0/executor-intro/)をご覧ください。

### 新機能のリクエストは可能ですか？
{: #can-i-request-new-features }
{:.no_toc}
はい、[Ideas](https://circleci.canny.io/) のページから新機能のリクエストや、これまでにリクエストされた機能を閲覧することができます。 新機能をリクエストするには、まず **Give Feedback** セクションからカテゴリーを選択します。

これまでにリクエストされた機能を閲覧する際は、**Trending**、**Top**、**New** により並び替える、または下記によりフィルタリングすることができます。

- **Under Review**: CircleCI で検討中の機能リクエストです。
- **Planned**: 今後取り組む予定の機能リクエストです。
- **In Progress**: 現在取り組んでいる機能です。
- **Complete**: 現在のサービスに追加した機能リクエストです。

---

## 移行
{: #migration}

### 既存の CI/CD ソリューションを CircleCI に移行できますか？
{: #can-i-migrate-my-existing-ci/cd-solution-to-circleci}
{:.no_toc}
はい、CircleCI では下記からの移行ガイドを提供しています。
- [AWS]({{site.baseurl}}/2.0/migrating-from-aws/)
- [Azure]({{site.baseurl}}/2.0/migrating-from-azuredevops/)
- [Buildkite]({{site.baseurl}}/2.0/migrating-from-buildkite/)
- [GitHub]({{site.baseurl}}/2.0/migrating-from-github/)
- [GitLab]({{site.baseurl}}/2.0/migrating-from-gitlab/)
- [Jenkins]({{site.baseurl}}/2.0/migrating-from-jenkins/)
- [TeamCity]({{site.baseurl}}/2.0/migrating-from-teamcity/)
- [Travis CI]({{site.baseurl}}/2.0/migrating-from-travis/)

詳細は、[移行の概要]({{site.baseurl}}/ja/2.0/migration-intro/) のページでもご確認いただけます。

---

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

---

## パイプライン
{: #pipelines}

### `.circleci/config.yml` を複数のファイルに分割することはできますか？
{: #is-it-possible-to-split-the-configyml-into-different-files }
{:.no_toc}
`.circleci/config.yml` を複数のファイルに分割する機能は今のところ提供していません。 詳細については、[サポートの記事](https://support.circleci.com/hc/en-us/articles/360056463852-Can-I-split-a-config-into-multiple-files)を参照してください。

設定ファイルの分割機能は提供していませんが、CircleCI ではダイナミックコンフィグ機能を提供しています。この機能により、特定のパイプラインやパスに基づき設定ファイルを作成することができます。 詳細は、[ダイナミックコンフィグ]({{site.baseurl}}/ja/2.0/dynamic-config/)を参照して下さい。

### パイプラインを使ってフォークされた PR をトリガーできますか？
{: #can-i-build-forked-prs-using-pipelines }
{:.no_toc}
CircleCI [API v2](https://circleci.com/docs/api/v2/) を使って、フォークされたリポジトリからパイプラインをトリガーし PR をビルドできます。 しかしデフォルトでは、フォークされたリポジトリからの PR をビルドしません。 この機能を有効にするには、Web アプリで **Project Settings > Advanced** に移動します。  詳細については、[サポートの記事](https://support.circleci.com/hc/en-us/articles/360049841151-Trigger-pipelines-on-forked-pull-requests-with-CircleCI-API-v2)を参照してください。

### パイプラインを指定した日時にスケジュール実行することは可能ですか？
{: #can-pipelines-be-scheduled-to-run-at-a-specific-time-of-day }
{:.no_toc}
はい、[パイプラインのスケジュール実行]({{site.baseurl}}/ja/2.0/scheduled-pipelines/)が可能です。 [CircleCI Web アプリ]({{site.baseurl}}/scheduled-pipelines/#project-settings)で、または[CircleCI API v2]({{site.baseurl}}/ja/2.0/scheduled-pipelines/#api) を使ってパイプラインのスケジュール実行を設定することができます。

現在[ワークフローのスケジュール実行]({{site.baseurl}}/ja/2.0/workflows/#scheduling-a-workflow)機能を使用されている場合は、[移行ガイド]({{base.url}}/ja/2.0/scheduled-pipelines/#migrate-scheduled-workflows)を参照し、ワークフローのスケジュール実行をパイプラインのスケジュール実行に更新してください。

### パイプラインのスケジュール実行が実行されないのはなぜですか？
{: #why-is-my-scheduled-pipeline-not-running }
{:.no_toc}
パイプラインのスケジュール実行が実行されない場合、以下を確認してください。

- スケジュール実行化されたパイプラインに設定されている実行ユーザーは現在も組織のメンバーですか？
- スケジュールに設定されたブランチが削除されていませんか？
- お客様の VCS 組織が SAML 保護を使用してませんか？ SAML トークンは頻繁に失効します。失効している場合、リクエストが失敗します。

### パイプラインのスケジュール実行の際に使われるタイムゾーンは？
{: #what-time-zone-is-used-for-scheduled-pipelines }
{:.no_toc}
スケジュールの指定は、UTC 協定世界時のタイムゾーンに基づきます。

### スケジュールを設定したパイプラインは、指定した時間どおりに正確に実行されますか?
{: #are-scheduled-pipelines-guaranteed-to-run-at-precisely-the-time-scheduled }
{:.no_toc}
スケジュールの正確性については保証できません。 スケジュールは、設定した時間にコミットがプッシュされたとして実行されます。

---

## ワークフロー
{: #workflows }

### 同時に実行できるジョブの数はいくつですか？
{: #how-many-jobs-can-i-run-concurrently }
{:.no_toc}
同時に実行できるジョブの数は[プラン](https://circleci.com/ja/pricing/)によって異なります。 ワークフローを使ってジョブをスケジュール化する場合、[ファンアウトとファンイン方法]({{site.baseurl}}/ja/2.0/workflows/#fan-outfan-in-workflow-example)によりジョブの同時実行が可能です。

### 1 つのワークフローで複数の Executor タイプを使用できますか？
{: #can-i- use-multiple-executor-types-in-the-same-workflow }
{:.no_toc}
はい、使用できます。 [サンプル設定ファイル]({{site.baseurl}}/ja/2.0/sample-config/#sample-configuration-with-multiple-executor-types)のページで設定例をご確認ください。

### 変更のあったジョブのみをビルドできますか？
{: #can-i-build-only-the-jobs-that-changed }
{:.no_toc}
ワークフローを設定してリポジトリの特定の更新に基づいてジョブを条件付きで実行できます。 [条件付きワークフロー]({{site.baseurl}}/ja/2.0/pipeline-variables/#conditional-workflows) と [ダイナミックコンフィグ]({{site.baseurl}}/ja/2.0/dynamic-config/)により実行できます。 ダイナミックコンフィグにより、CircleCI 設定ファイルやパイプラインパラメーターが動的に生成され、結果の作業が同じパイプライン内で実行されます。

---

## トラブルシューティング
{: #troubleshooting }

### コミットをプッシュしてもジョブが実行されません。
{: #why-are-my-jobs-not-running-when-i-push-commits }
{:.no_toc}
CircleCI アプリケーションで、各ジョブやワークフローの画面にエラーメッセージがないか確認してください。 多くの場合、`.circleci/config.yml` ファイルのフォーマットの誤りが原因となってエラーが発生しています。

詳細については、[YAML に関する]({{site.baseurl}}/2.0/introduction-to-yaml-configurations/)ページを参照してください。

`.circleci/config.yml` のフォーマットミスを確認し、それでも解決しない場合は、[CircleCI サポートセンター](https://support.circleci.com/hc/ja)で検索してみてください。

### ジョブがキューイングするのはなぜですか？
{: #why-is-my-job-queued }
{:.no_toc}
お客様の組織のプランによっては同時実行の制限が課せられるため、ジョブがキューイングする場合があります。 ジョブが頻繁にキューイングする場合は、[プランのアップグレード](https://circleci.com/pricing/)をご検討ください。


### Performance プランを利用しているのに、ビルドがキューイングするのはなぜですか?
{: #why-are-my-builds-queuing-even-though-i-am-on-performance-plan }
{:.no_toc}
CircleCI のすべてのお客様がシステムを安定した状態で利用できるよう、[リソースクラス]({{site.baseurl}}/ja/2.0/configuration-reference/#resource_class)ごとに同時実行数のソフト制限が設けられています。 ジョブのキューイングが発生する場合は、この制限に達している可能性が考えられます。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)に制限値の引き上げを依頼してください。

### プロジェクトダッシュボード上にプロジェクトがないのはなぜですか？
{: #why-can-i-not-find-my-project-on-the-projects-dashboard }
{:.no_toc}
ビルドしようとしているプロジェクトが表示されておらず、CircleCI 上で現在ビルド中のものではない場合は、CircleCI アプリケーションの左上隅で組織を確認してください。 For instance, if the top left shows your user `my-user`, only projects belonging to `my-user` will be available under **Projects**.  If you want to build the project `your-org/project`, you must switch your organization on the application's organization switcher menu to `your-org`.

### Docker イメージの名前の付け方は？ 見つけ方を教えてほしい。
{: #how-do-docker-image-names-work-where-do-they-come-from }
{:.no_toc}
CircleCI  では、現在 [Docker Hub](https://hub.docker.com/) からの Docker イメージのプル (と Docker Engine のプッシュ) をサポートしています。 これら[公式の Docker イメージ](https://hub.docker.com/explore/)に対してできるのは、単純に下記のような名前やタグを指定してプルすることです。

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
`latest` タグを**付けず**に Docker イメージを指定することをお勧めします。 It is also best practice to use a specific version and tag, for example `cimg/ruby:3.0.4-browsers`, to pin down the image and prevent upstream changes to your containers when the underlying base distribution changes. For example, specifying only `cimg/ruby:3.0.4` could result in unexpected changes from `browsers` to `node`. For more context, refer to [Docker image best practices]({{site.baseurl}}/2.0/using-docker/#docker-image-best-practices), and [CircleCI image best practices]({{site.baseurl}}/2.0/circleci-images/#best-practices).

### Docker イメージでタイムゾーンを設定する方法は？
{: #how-can-i-set-the-timezone-in-docker-images }
{:.no_toc}
Docker イメージのタイムゾーンを設定するには、環境変数 `TZ` を使用します。 A sample `.circleci/config.yml` with a defined `TZ` variable would look like the following:

```yaml
version: 2.1
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

この例では、プライマリイメージと mySQL イメージの両方にタイムゾーンを設定しています。

利用可能なタイムゾーンの一覧は [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) で確認できます。

---

## 稼働環境
{: #architecture }

### CircleCI  がサポートする OS は？
{: #what-operating-systems-does-circleci-20-support }
{:.no_toc}
- [Linux]({{site.baseurl}}/2.0/using-linuxvm/)
- [Android]({{site.baseurl}}/2.0/language-android/)
- [macOS]({{site.baseurl}}/2.0/using-macos/)
- [iOS]({{site.baseurl}}/2.0/ios-tutorial/)
- [Windows]({{site.baseurl}}/2.0/using-windows/)

### CircleCI がサポートしている CPU アーキテクチャは？
{: #which-cpu-architectures-does-circleci-support }
{:.no_toc}
CircleCI supports `amd64` for Docker jobs, and both `amd64` and [Arm resources]({{site.baseurl}}/2.0/using-arm/) for machine jobs.

### テスト時に IPv6 は利用できますか？
{: #can-i-use-ipv6-in-my-tests }
{:.no_toc}
You can use the [machine executor]({{site.baseurl}}/2.0/configuration-reference/#machine) for testing local IPv6 traffic. 残念ながら、WAN における IPv6 通信はサポートしていません。CircleCI 自体が使用しているクラウドサービスの全てが IPv6 をサポートしているわけではないためです。

machine Executor で実行しているホストは、`eth0` や `lo` といったネットワークインターフェースに対して IPv6 アドレスを割り当てられます。

IPv6 環境のサービスをテストするために、コンテナに IPv6 アドレスを割り当てるよう Docker を設定することも可能です。  下記のように Docker デーモンを設定することでグローバル設定を有効にできます。

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

Docker に IPv6 アドレスを割り当てる手法はいくつかあります。1 つは上記のように [Docker デーモンを設定する方法](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/)、2 つ目は [`docker network create` コマンドを用いる方法](https://docs.docker.com/engine/reference/commandline/network_create/)、そして [`docker-compose` を利用する方法](https://docs.docker.com/compose/compose-file/#enable_ipv6)です。

---

## 料金・支払
{: #billing }

Visit our [Pricing page](https://circleci.com/pricing/) to find details about CircleCI's plans.

### クレジットとは何ですか？
{: #what-are-credits }
{:.no_toc}
クレジットは、マシンのタイプとサイズに基づく使用料の支払いに充てられます。 また、Docker レイヤー キャッシュなどの有料機能を使用したときにも消費されます。

たとえば、毎分 10 クレジットのレートで Docker または Linux の Medium コンピューティング オプションを利用する場合、25,000 クレジットのパッケージでは 2,500 分のビルドが可能です。 CircleCI ではパフォーマンス (開発者の生産性の向上) と価値を備えた最適なビルドを行なっていただけるよう複数のコンピューティングサイズを提供しています。

必要に応じて、並列実行を使用してビルド時間をさらに短縮できます。並列実行を使用すると、ジョブを複数のテストに分割して同時に実行できます。 2倍の並列実行により、通常 2,500 分で実行されるビルドが 1,250 分で実行できるため、開発者の生産性がさらに向上します。 2つの Executor がそれぞれ 1,250 分間並行して実行している場合、合計ビルド時間は 2,500 分になります。

### 異なる組織間で契約プランを共有できますか？ その場合、請求を 1 箇所にまとめることは？
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

Free プラン以外のプランでは、`共有組織の追加`オプションによりお客様が管理者としてのアクセス権を持つ Free プランの組織とプランを共有することができます。 子組織のすべてのクレジットとその他の利用料金は親組織に請求されます。

Free プラン以外のプランでは、`譲渡プラン`</code>オプションによりお客様が管理者としてのアクセス権を持つ他の Free プランの組織にお客様のプランを譲渡することができます。 有料プランを別の組織に譲渡した場合、お客様の組織は Free プランにダウングレードされます。

### コンテナの使用時間が 1 分未満の場合でも 1 分間の料金を支払う必要がありますか？
{: #if-a-container-is-used-for-under-one-minute-do-i-have-to-pay-for-a-full-minute }
{:.no_toc}
はい、その場合でも 1 分間分の料金をお支払いいただく必要があります。 1 分未満の秒単位は切り上げでクレジットを計算します。

### クレジットの購入方法は？ 必要な時に必要な分だけ購入できますか？
{: #how-do-i-buy-credits-can-i-buy-in-any-increments }
{:.no_toc}
選択したクレジット パッケージの料金が、毎月初めに請求されます。

### 支払う料金の内訳は？
{: #what-do-i-pay-for }
{:.no_toc}
プレミアム機能を利用するアクティブ ユーザーの人数分の料金、コンピューティングに対する料金のほか、プレミアム サポートを利用している場合はその料金も含まれます。


- 新しいマシン サイズなどを利用するには、アクティブ ユーザー 1 人あたり月額 15 ドル (税抜) が必要です。
- コンピューティングの月額料金は、マシンのサイズと使用時間に基づいて、クレジットで支払われます。
  - 25,000 クレジットで 1 パッケージとなっており、1 パッケージは 15 ドル (税抜) です。
  - クレジットは毎月ロールオーバーされ、1 年後に失効します。
- Docker レイヤー キャッシュ (DLC) の料金は、コンピューティングと同じく、使用量に基づいてクレジットで支払われます。

### 1ヶ月のストレージ使用料金とネットワーク料金の計算方法は？
{: #how-do-I-calculate-my-monthly-storage-and-network-costs }
{:.no_toc}

[CircleCI Web アプリ](https://app.circleci.com/)から **Plan > Plan Usage** に移動してお客様のストレージとネットワークの使用状況を確認し、1ヶ月のストレージ料金とネットワーク料金を計算してください。

#### ストレージ
{: #storage }
{:.no_toc}

日々の使用量から1 か月のストレージ料金を計算するには、 **[Storage]** タブをクリックし、組織の月間の割り当て GB を超過していないかを確認します。 超過分（GB-Months/TB-Months）に 420 クレジットを乗じることで、その月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット (0.5 ドル)。

#### ネットワーク
{: #network }
{:.no_toc}

ネットワークの使用に対する課金は、CircleCI からセルフホストランナーへのトラフィックに対してのみ適用されます。 詳細は[こちら]({{site.baseurl}}/2.0/persist-data/#overview-of-storage-and-network-transfer)を参照してください。

超過分（GB/TB）に 420 クレジットを乗じることで、その月の料金を見積もることができます。 計算例：2 GB-Months の超過 x 420 クレジット = 840 クレジット (50 ドル)。

### 1ヶ月の IP アドレスの範囲機能料金の計算方法は？
{: #how-do-I-calculate-my-monthly-IP-ranges-costs }
{:.no_toc}

毎月の IP アドレスの範囲機能の料金は、[CircleCI アプリ](https://app.circleci.com/)で Plan > Plan Usage に移動し、IP アドレスの範囲機能の利用状況を確認して計算します。

**IP 範囲機能の使用状況 **のサマリーに加えて、**[IP Ranges]** タブに移動して、データ使用状況の詳細を確認できます。 このタブでは、IP アドレスの範囲機能の使用量の値は、 IP アドレスの範囲が有効なジョブの実行中の Docker コンテナ内外の未加工のバイト数を表します。

このバイト数には、ジョブの全体のネットワーク転送_および_ Docker コンテナの送受信に使われるバイトも含まれます。  ジョブの実行を開始する前に Docker イメージをコンテナにプルするために使用されるデータは、IP 範囲が有効なジョブでは_ 使用コストが発生しません _。

この機能は、IP 範囲が有効なジョブで使用されるデータの GB ごとに、お客様のアカウントから 450 クレジットを消費します。 **Job Details** UI ページの **Resources** タブで各ジョブの IP アドレスの範囲機能の使用状況の詳細をご覧いただけます。 詳細は、[IP アドレスの範囲機能の料金]({{site.baseurl}}/2.0/ip-ranges/#pricing)をご覧ください。

### 有効化する前に 1ヶ月の IP アドレスの範囲機能の料金を把握するにはどうすれば良いですか？
{: #how-do-i-predict-my-monthly-IP-ranges-cost-without-enabling-the-feature-first }
{:.no_toc}
Job Details の UI ページの Resources タブから、すべての Docker ジョブ (リモート Docker を除く) の概算ネットワーク通信量を確認できます。  GB になっていない場合は、450 クレジットを乗じて GB に変換し、Docker ジョブで IP アドレスの範囲機能を有効にする場合の概算コストを把握してください。

### アクティブ ユーザー単位の料金が設定されているのはなぜですか?
{: #why-does-circleci-have-per-active-user-pricing }
{:.no_toc}

クレジットは、コンピューティングの利用に対して消費されます。 CircleCI は、できるだけ使用コストを抑えながら、CI の基本的な推奨事項である「頻繁なジョブ実行」を行っていただくことを目指しています。 アクティブ ユーザー単位で設定しているのは、プラットフォーム機能とジョブ オーケストレーションの利用に対する料金です。 たとえば、依存関係のキャッシュ、アーティファクトのキャッシュ、ワークスペースなどがあり、いずれの機能も追加のコンピューティング コストをかけずにビルド時間を短縮するのに役立ちます。

### *アクティブ ユーザー*の定義を教えてください。
{: #what-constitutes-an-active-user }
{:.no_toc}

`アクティブ ユーザー`とは、非 OSS プロジェクトでコンピューティング リソースの使用をトリガーするユーザーのことです。 次のようなアクティビティが含まれます。

- ビルドをトリガーするユーザーからのコミット (PR マージ コミットを含む)
- CircleCI の Web アプリケーションでのジョブの再実行 ([SSH デバッグ]({{ site.baseurl }}/ja/2.0/ssh-access-jobs)を含む)
- [ジョブの手動承認]({{ site.baseurl }}/ja/2.0/workflows/#手動承認後に処理を続行するワークフロー) (承認者はすべてのダウンストリーム ジョブのアクターと見なされる)
- スケジュールされたワークフローの使用
- マシン ユーザー

**注:** プロジェクトが[オープンソース]({{ site.baseurl }}/ja/2.0/oss)の場合は、アクティブユーザーとは**見なされません**。

アクティブ ユーザーの一覧は、CircleCI の Web アプリにログインし、`Plan` > `Plan Usage` > `Users` タブをクリックして確認できます。

### クレジットを使い切るとどうなりますか？
{: #what-happens-when-i-run-out-of-credits }
{:.no_toc}

Performance プランでは、クレジットが残り 2% になると、25% のクレジット サブスクリプション (最低でも 25,000 クレジット) が補充されます)。 たとえば、毎月のパッケージ サイズが 100,000 クレジットの場合には、残りが 2,000 クレジットになると、25,000 クレジットが自動的にチャージされます (1 クレジットあたり税抜 0.0006 ドル)。

アカウントで補充が繰り返し行われていることに気付いた場合は、 CircleCI ウェブアプリにログインし、`Plan` > `Plan Usage` をクリックします。 多くの場合、クレジットパッケージを増やすことにより補充の繰り返しを最小限に抑えることができます。 プランを管理するには、 `Plan Overview` をクリックしてください。

**Free プラン**では、クレジットがなくなるとジョブの実行に失敗します。

### クレジットに有効期限はありますか？
{: #do-credits-expire }
{:.no_toc}
**Performance プラン**のクレジットは、購入後 1 年で失効します。 ただし、プランを解約すると、未使用のクレジットは無効となり、利用できなくなります。

### 支払い方法は？
{: #how-do-i-pay }
{:.no_toc}
毎月の料金は CircleCI アプリ内で支払えます。

### 支払いのスケジュールは？
{: #when-do-i-pay }
{:.no_toc}

**Performance プラン**では、請求サイクルの初日に、プレミアム サポートの料金と毎月のクレジット パッケージの料金が請求されます。 その月の_間_にクレジットが補充された場合 ( 利用可能なクレジットが 2% に達し 25% が自動補充された場合など ) は、_補充時_に支払いが行われます。

### ビルドが「Queued」または「Preparing」の場合、課金されますか？
{: #am-i-charged-if-my-build-is-queued-or-preparing }
{:.no_toc}

いいえ、できません。 ジョブが "queued (キューイング中)"と通知された場合、ジョブが**プラン**や**同時処理**の制限のために待機状態になっていることを意味しています。 ジョブが "preparing (準備中)" の場合は、CircleCI がお客様のジョブのセットアップまたはディスパッチをしています。

### 有料プランの更新日はいつですか?
{: #what-are-the-other-renewal-dates }
{:.no_toc}

更新日は、以下にあげる CircleCI からの請求が発生する日に加え、有料プランへアップグレードまたは別の有料プランへ変更し、初めてクレジットカードで決済した日付に設定されます。

- 月間プランの場合、毎月の月額料金の請求日が更新日になります。
- 年間プランの場合、年に一度の年間料金の請求日が更新日になります。
- 年間プランを利用中でも、ユーザーの追加やクレジットの消費により未払い残高が発生した場合、その月の最終日が更新日になります。
- Performance プランでは、クレジットの残高が設定された最低残高を下回った場合、自動的にクレジット購入が実行されます。

### オープンソース プロジェクト向けのクレジットベース プランはありますか?
{: #are-there-credit-plans-for-open-source-projects }
{:.no_toc}

Open source organizations on our **Free plan** receive 400,000 free credits per month that can be spent on Linux open source projects.  オープンソース のクレジットの利用可能量や制限は、UI 画面上では確認できません。

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。 macOS オープンソースのビルド向けの無料クレジットは、組織あたり最大 2 件のジョブの同時実行に使用できます。

### 現在、コンテナベース プランのオープンソース プロジェクトで無料クレジットを受け取っています。 Performance プランのオープンソース プロジェクトで割引を受けるにはどうすればよいですか?
{: #i-currently-get-free-credits-for-open-source-projects-on-my-container-plan-how-do-i-get-discounts-for-open-source-on-the-performance-plan }
{:.no_toc}

現在、Performance プランでオープンソースをご利用のお客様への割引は行っていません。

### Docker レイヤー キャッシュの利用に料金が発生するのはなぜですか?
{: #why-does-circleci-charge-for-docker-layer-caching }
{:.no_toc}

Docker layer caching (DLC) reduces build times on pipelines where Docker images are built by only rebuilding Docker layers that have changed (read more on the [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching) page. DLC costs 200 credits per job run.

There are a few things that CircleCI does to ensure DLC is available to customers. We use solid-state drives and replicate the cache across zones to make sure DLC is available. We will also increase the cache as needed in order to manage concurrent requests and make DLC available for your jobs. All of these optimizations incur additional cost for CircleCI with our compute providers, which pass along to customers when they use DLC.

To estimate your DLC cost, look at the jobs in your config file with Docker layer caching enabled, and the number of Docker images you are building in those jobs. There are cases where a job can be written once in a config file but the job runs multiple times in a pipeline, for example, with parallelism enabled.

Note that the benefits of Docker layer caching are only apparent on pipelines that are building Docker images, and reduces image build times by reusing the unchanged layers of the application image built during your job. If your pipeline does not include a job where Docker images are built, Docker layer caching will provide no benefit.

### How do I migrate from a container-based plan to a usage-based plan?
{: #how-do-I-migrate-from-a-container-based-plan-to-a-usage-based-plan }
{:.no_toc}

CircleCI no longer offers the container-based plan. If you are currently using a container-based plan and need to migrate to a usage-based plan, please visit this [CircleCI Discuss post](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938) for more information.
