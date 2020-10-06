---
layout: classic-docs
title: "Orb の概要"
short-title: "Orb の概要"
description: "CircleCI Orb の入門ガイド"
categories:
  - getting-started
order: 1
---

*`version 2.1` のクラウド版 CircleCI で利用可能です。オンプレミス版では現在サポートされていません。*

CircleCI Orbs は、ジョブ、コマンド、Executor などの構成要素をまとめた共有可能なパッケージです。 CircleCI では承認済み Orbs に加え、CircleCI パートナーによってオーサリングされたサードパーティ製の Orbs も提供しています。 まずは、こうした既存の Orbs がご自身の構成ワークフローに活用できるかどうかを評価することをお勧めします。 承認済み Orb の一覧は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/)にて確認してください。

## CircleCI Orbs の使用

ワークフローやジョブに CircleCI Orbs を使用するには、いくつかの方法があります。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/)から既存の Orb (CircleCI およびパートナー承認済み Orbs) をインポートする方法か、特定のワークフロー用に独自の Orb をオーサリングする方法を選ぶ場合が多いでしょう。 それぞれのアプローチについて以下に説明します。

### 既存の Orb をインポートする

既存の Orb をインポートするには、以下の手順を行います。

1) 各 Orb のバージョン 2.1 [.circleci/config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルに以下の 1 行を追加します。

```yaml
version: 2.1
```

**メモ:** 2.1 よりも前のバージョンで CircleCI に追加されていたプロジェクトでは、パイプラインを有効化して `orbs` キーを使用できるようにする必要があります。

2) バージョンの下に `orbs` スタンザを追加し、Orbs を呼び出します。 以下に例を示します。

    orbs:
      slack: circleci/slack@0.1.0
      heroku: circleci/heroku@0.0.1
    

上記の例では、2 つの Orb が設定ファイルにインポートされます。

- [Slack Orb](https://circleci.com/developer/ja/orbs/orb/circleci/slack) 
- [Heroku Orb](https://circleci.com/developer/ja/orbs/orb/circleci/heroku)

### パートナーの Orb をインポートする

パートナーの Orb をインポートするには、以下の手順を行います。

1) 構成内の `.circleci.yml/config.yml` ファイルで `orbs` キーをインポートします。

2) 下の例の `<Orb 参照文字列>` の値を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/)からインポートする Orb に置き換えます。 レジストリには数多くの CircleCI 承認済み Orb およびパートナー承認済み Orbs が公開されており、必要なものを利用できます。

```yaml
version: 2.1

orbs:
  <Orb 参照文字列>
```

#### CircleCI Orb レジストリで提供されているパートナー Orb の例

CircleCI Orb レジストリから入手できる数多くの Orb の中から、一部をご紹介します。

| Partner Orb レジストリ リンク                                                                                         | Orbs 参照文字列                                              |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Alcide-io](https://circleci.com/developer/ja/orbs/orb/alcideio/alcide-advisor)                                   | `alcide: alcideio/alcide-advisor@1.0.3`                 |
| [Anchore](https://circleci.com/developer/ja/orbs/orb/anchore/anchore-engine)                                      | `anchore: anchore/anchore-engine@1.0.0`                 |
| [Aqua Security](https://circleci.com/developer/ja/orbs/orb/aquasecurity/microscanner)                             | `aqua: aquasecurity/microscanner@0.0.1`                 |
| [AWS CLI](https://circleci.com/developer/ja/orbs/orb/circleci/aws-cli)                                            | `cli: circleci/aws-cli@0.1.13`                          |
| [AWS CodeDeploy](https://circleci.com/developer/ja/orbs/orb/circleci/aws-code-deploy)                             | `codedeploy: circleci/aws-code-deploy@0.0.9`            |
| [Amazon ECR](https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecr)                                         | `ecr: circleci/aws-ecr@4.0.1`                           |
| [Amazon ECS](https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs)                                         | `ecs: circleci/aws-ecs@0.0.11`                          |
| [Amazon EKS](https://circleci.com/developer/ja/orbs/orb/circleci/aws-eks)                                         | `eks: circleci/aws-eks@0.1.0`                           |
| [AWS パラメータ ストア](https://circleci.com/developer/ja/orbs/orb/circleci/aws-parameter-store)                          | `awsparameter: circleci/aws-parameter-store@1.0.0`      |
| [AWS S3](https://circleci.com/developer/ja/orbs/orb/circleci/aws-s3)                                              | `s3: circleci/aws-s3@1.0.11`                            |
| [Azure ACR](https://circleci.com/developer/ja/orbs/orb/circleci/azure-acr)                                        | `acr: circleci/azure-acr@0.1.1`                         |
| [Azure AKS](https://circleci.com/developer/ja/orbs/orb/circleci/azure-aks)                                        | `aks: circleci/azure-aks@0.1.0`                         |
| [Azure CLI](https://circleci.com/developer/ja/orbs/orb/circleci/azure-cli)                                        | `cli: circleci/azure-cli@1.1.0`                         |
| [Cloudsmith](https://circleci.com/developer/ja/orbs/orb/cloudsmith/cloudsmith)                                    | `cloudsmith: cloudsmith/cloudsmith@1.0.3`               |
| [Codecov](https://circleci.com/developer/ja/orbs/orb/codecov/codecov)                                             | `codecov: codecov/codecov@1.0.1`                        |
| [CodeScene](https://circleci.com/developer/ja/orbs/orb/empear/codescene-ci-cd)                                    | `codescene: empear/codescene-ci-cd@1.0.0`               |
| [ConfigCat](https://circleci.com/developer/ja/orbs/orb/configcat/flag_reference_validator)                        | `configcat: configcat/flag_reference_validator@1.0.3`   |
| [Contrast Security](https://circleci.com/developer/ja/orbs/orb/contrastsecurity/verify)                           | `contrastsecurity: contrastsecurity/verify@0.1.2`       |
| [Convox](https://circleci.com/developer/ja/orbs/orb/convox/orb)                                                   | `convox: convox/orb@1.4.1`                              |
| [Cypress-io](https://circleci.com/developer/ja/orbs/orb/cypress-io/cypress)                                       | `cypress-io: cypress-io/cypress@1.0.0`                  |
| [Datree](https://circleci.com/developer/ja/orbs/orb/datree/policy)                                                | `datree: datree/policy@1.0.6`                           |
| [DeployHub](https://circleci.com/developer/ja/orbs/orb/deployhub/deployhub-orb)                                   | `deployhub: deployhub/deployhub-orb@1.2.0`              |
| [Docker Hub](https://circleci.com/developer/ja/orbs/orb/circleci/docker)                                          | `dockerhub: circleci/docker@0.1.0`                      |
| [FØCAL](https://circleci.com/developer/ja/orbs/orb/f0cal/farm)                                                    | `f0cal: f0cal/farm@1.0.0`                               |
| [Fairwinds](https://circleci.com/developer/ja/orbs/orb/fairwinds/rok8s-scripts)                                   | `fairwinds: fairwinds/rok8s-scripts@9.4.0`              |
| [Fortanix](https://circleci.com/developer/ja/orbs/orb/fortanix/sdkms-cli)                                         | `fortanix: fortanix/sdkms-cli@1.0.0`                    |
| [FOSSA](https://circleci.com/developer/ja/orbs/orb/fossa/cli)                                                     | `fossa: fossa/cli@0.0.3`                                |
| [Ghost Inspector](https://circleci.com/developer/ja/orbs/orb/ghostinspector/test-runner)                          | `ghostinspector: ghostinspector/test-runner@1.0.0`      |
| [GCP Bin Auth](https://circleci.com/developer/ja/orbs/orb/circleci/gcp-binary-authorization)                      | `gcp: circleci/gcp-binary-authorization@0.5.2`          |
| [Google Cloud CLI](https://circleci.com/developer/ja/orbs/orb/circleci/gcp-cli)                                   | `gcpcli: circleci/gcp-cli@1.8.2`                        |
| [Google Container Registry](https://circleci.com/developer/ja/orbs/orb/circleci/gcp-gcr)                          | `gcr: circleci/gcp-gcr@0.0.7`                           |
| [Google Kubernetes Engine](https://circleci.com/developer/ja/orbs/orb/circleci/gcp-gke)                           | `gke: circleci/gcp-gke@0.1.0`                           |
| [Happo](https://circleci.com/developer/ja/orbs/orb/happo/happo)                                                   | `happo: happo/happo@1.0.1`                              |
| [Helm](https://circleci.com/developer/ja/orbs/orb/circleci/helm)                                                  | `helm: circleci/helm@0.1.1`                             |
| [Honeybadger-io](https://circleci.com/developer/ja/orbs/orb/honeybadger-io/deploy)                                | `honeybadger-io: honeybadger-io/deploy@1.1.1`           |
| [Honeycomb](https://circleci.com/developer/ja/orbs/orb/honeycombio/buildevents)                                   | `buildevents: honeycombio/buildevents@0.1.1`            |
| [JFrog](https://circleci.com/developer/ja/orbs/orb/circleci/artifactory)                                          | `jfrog: circleci/artifactory@1.0.0`                     |
| [Kublr](https://circleci.com/developer/ja/orbs/orb/kublr/kublr-api)                                               | `kublr: kublr/kublr-api@0.0.1`                          |
| [LambdaTest](https://circleci.com/developer/ja/orbs/orb/lambdatest/lambda-tunnel)                                 | `lambdatest: lambdatest/lambda-tunnel@0.0.1`            |
| [LaunchDarkly](https://circleci.com/developer/ja/orbs/orb/launchdarkly/ld-find-code-refs)                         | `launchdarkly: launchdarkly/ld-find-code-refs@1.2.0`    |
| [LogDNA](https://circleci.com/developer/ja/orbs/orb/logdna/logdna)                                                | `logdna: logdna/logdna@0.0.1`                           |
| [Neocortix](https://circleci.com/developer/ja/orbs/orb/neocortix/loadtest)                                        | `neocortix: neocortix/loadtest@0.4.0`                   |
| [NeuVector](https://circleci.com/developer/ja/orbs/orb/neuvector/neuvector-orb)                                   | `neuvector: neuvector/neuvector-orb@1.0.0`              |
| [Nirmata](https://circleci.com/developer/ja/orbs/orb/nirmata/nirmata)                                             | `nirmata: nirmata/nirmata@1.1.0`                        |
| [NowSecure](https://circleci.com/developer/ja/orbs/orb/nowsecure/ci-auto-orb)                                     | `nowsecure: nowsecure/ci-auto-orb@1.0.5`                |
| [Oxygen](https://circleci.com/developer/ja/orbs/orb/cloudbeat/oxygen)                                             | `oxygen: cloudbeat/oxygen@1.0.0`                        |
| [PackageCloud](https://circleci.com/developer/ja/orbs/orb/packagecloud/packagecloud)                              | `packagecloud: packagecloud/packagecloud@0.1.0`         |
| [packtracker.io](https://circleci.com/developer/ja/orbs/orb/packtracker/report)                                   | `packtracker: packtracker/report@2.2.2`                 |
| [Pantheon](https://circleci.com/developer/ja/orbs/orb/pantheon-systems/pantheon)                                  | `pantheon: pantheon-systems/pantheon@0.1.0`             |
| [Percy](https://circleci.com/developer/ja/orbs/orb/percy/agent)                                                   | `percy: percy/agent@0.1.2`                              |
| [Postman](https://circleci.com/developer/ja/orbs/orb/postman/newman)                                              | `postman: postman/newman@0.0.1`                         |
| [Probely](https://circleci.com/developer/ja/orbs/orb/probely/security-scan)                                       | `probely: probely/security-scan@1.0.0`                  |
| [Provar](https://circleci.com/developer/ja/orbs/orb/provartesting/provar)                                         | `provar: provartesting/provar@1.9.10`                   |
| [Pulumi](https://circleci.com/developer/ja/orbs/orb/pulumi/pulumi)                                                | `pulumi: pulumi/pulumi@1.0.0`                           |
| [Quali](https://circleci.com/developer/ja/orbs/orb/quali/cloudshell-colony)                                       | `quali: quali/cloudshell-colony@1.0.4`                  |
| [realMethods](https://circleci.com/developer/ja/orbs/orb/realmethods/appgen)                                      | `realmethods: realmethods/appgen@1.0.1`                 |
| [Red Hat OpenShift](https://circleci.com/developer/ja/orbs/orb/circleci/redhat-openshift)                         | `redhat: circleci/redhat-openshift@0.1.0`               |
| [Rocro](https://circleci.com/developer/ja/orbs/orb/rocro/inspecode)                                               | `rocro: rocro/inspecode@1.0.0`                          |
| [Rollbar](https://circleci.com/developer/ja/orbs/orb/rollbar/deploy)                                              | `rollbar: rollbar/deploy@1.0.1`                         |
| [Rookout](https://circleci.com/developer/ja/orbs/orb/rookout/rookout-node)                                        | `rookout: rookout/rookout-node@0.0.2`                   |
| [Sauce Labs](https://circleci.com/developer/ja/orbs/orb/saucelabs/sauce-connect)                                  | `saucelabs: saucelabs/sauce-connect@1.0.1`              |
| [Snyk](https://circleci.com/developer/ja/orbs/orb/snyk/snyk)                                                      | `snyk: snyk/snyk@0.0.8`                                 |
| [Sonatype](https://circleci.com/developer/ja/orbs/orb/sonatype/nexus-platform-orb)                                | `sonatype: sonatype/nexus-platform-orb@1.0.2`           |
| [Styra](https://circleci.com/developer/ja/orbs/orb/styra/cli)                                                     | `styra: styra/cli@0.0.7`                                |
| [Sumo Logic](https://circleci.com/developer/ja/orbs/orb/circleci/sumologic)                                       | `sumologic: circleci/sumologic@1.0.0`                   |
| [Testim](https://circleci.com/developer/ja/orbs/orb/testimio/runner)                                              | `testim: testimio/runner@1.1.1`                         |
| [Twistlock](https://circleci.com/developer/ja/orbs/orb/twistlock/twistcli-scan)                                   | `twistlock: twistlock/twistcli-scan@1.0.4`              |
| [Unmock](https://circleci.com/developer/ja/orbs/orb/unmock/unmock)                                                | `unmock: unmock/unmock@0.0.10`                          |
| [VMware Code Stream](https://circleci.com/developer/ja/orbs/orb/vmware/codestream)                                | `vmware: vmware/codestream@1.0.0`                       |
| [WhiteSource](https://circleci.com/developer/ja/orbs/orb/whitesource/whitesource-scan)                            | `whitesource: whitesource/whitesource-scan@18.10.2`     |
| [WhiteSource Vulnerability Checker](https://circleci.com/developer/ja/orbs/orb/whitesource/vulnerability-checker) | `whitesource: whitesource/vulnerability-checker@19.7.2` |
| [xMatters](https://circleci.com/developer/ja/orbs/orb/xmatters/xmatters-orb)                                      | `xmatters: xmatters/xmatters-orb@0.0.1`                 |
{: class="table table-striped"}

**メモ:** 前提条件として、組織の [Settings (設定)] > [Security (セキュリティ)] ページでサードパーティ製 Orbs の使用を有効化する必要があります。

## 独自の Orb をオーサリングする

既存の Orb ではニーズを満たせない場合、以下の `circleci orb help` の出力に示されている [CircleCI CLI]({{ site.baseurl }}/ja/2.0/local-cli/#概要) を使用して、特定の環境や構成要件に合った独自の Orb をオーサリングできます。 インポート機能を使用する場合に比べて時間はかかりますが、独自 Orb をオーサリングすると、グローバルに読み取り可能な Orb を作成して自身の構成を共有することが可能です。 詳細については、[Orbs の作成に関するドキュメント]({{ site.baseurl }}/ja/2.0/creating-orbs/)を参照してください。

**メモ:** パブリッシュ済みの Orb をレジストリのリストから除外するには、`circleci orb unlist` CLI コマンドを使用します。 詳細については、[ヘルプ ページ](https://circleci-public.github.io/circleci-cli/circleci_orb_unlist.html)を参照してください。 リストから除外した Orb は、名前で参照すれば引き続きグローバルに読み取り可能ですが、Orb レジストリの検索結果には表示されません。 リストから除外した後も、`circleci orb unlist <namespace/orb> false` コマンドを使用して再度リストに戻すことができます。

    $ circleci orb help
    Operate on orbs
    
    Usage:
      circleci orb [command]
    
    Available Commands:
      create      指定された名前空間に Orb を作成します
      info        Orb のメタデータを表示します
      list        Orb をリストに含めます
      process     事前登録処理後に Orb のバリデーションを行い、Orb の形式を出力します
      publish     Orb をレジストリにパブリッシュします
      source      Orb のソースを表示します
      validate    orb.yml のバリデーションを行います  
    

**メモ:** Orb をオーサリングするには、組織がサードパーティ製 Orb の使用とオーサリングをオプトインし、CircleCI の[コード共有利用規約](https://circleci.com/ja/legal/code-sharing-terms/)に同意する必要があります。 CircleCI はそれを受けて、MIT ライセンス契約に基づき、すべての Orb のライセンスをユーザーに付与します。

## 関連項目

- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/using-orbs/): CircleCI Orbs の基本的な概念
- [Orbs に関するよくあるご質問]({{site.baseurl}}/ja/2.0/orbs-faq/): CircleCI Orbs の使用に際して発生している既知の問題や不明点
- [Orbs リファレンス ガイド]({{site.baseurl}}/ja/2.0/reusing-config/): 再利用可能な Orbs、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orbs のテスト方法
- [Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/): ワークフローやジョブに使用する Orb のパブリッシュ プロセス
- [構成クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orbs を使用するためのレシピ
