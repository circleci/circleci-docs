---
layout: classic-docs
title: "Orbs とは"
short-title: "Orbs とは"
description: "CircleCI Orbs 入門"
categories: [getting-started]
order: 1
---

CircleCI Orbs は、ジョブ、コマンド、Executor のような設定要素をまとめた共有可能なパッケージです。 CircleCI 独自の認証済み Orbs のほか、パートナー企業によるサードパーティ製 Orbs を用意しています。 Workflow の設定をする際には、まずはそれら既存の Orbs のなかに活用できるものがないかチェックしてみることをおすすめします。 認証済みの Orbs は [CircleCI Orbs レジストリ](https://circleci.com/orbs/registry/)で一覧を確認できます。

## Orb をインポートする

既存の Orb をインポートするには、version 2.1 の [.circleci/config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで、下記のように 1 つの Orb につき設定を 1 行書き加えます。

```yaml
version: 2.1

orbs:
  slack: circleci/slack@0.1.0
  heroku: circleci/heroku@0.0.1
```

この例では、設定に [Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) と [Heroku orb](https://circleci.com/orbs/registry/orb/circleci/heroku) という 2 つの Orbs がインポートされます。

**注 :** CircleCI 2.1 以前のバージョンで作成されたプロジェクトでは、[Enable build processing]({{ site.baseurl }}/2.0/build-processing/) を ON にすることで `Orbs` キーを使えるようになります。

## 独自に Orb を作成する

既存の Orbs のなかに目的に合うものが見つからないときは、下記の `circleci orb help` コマンドの結果で示されている通り、[CircleCI CLI]({{ site.baseurl }}/ja/2.0/local-cli/) 上で自身の環境や設定要件を満たす独自の Orb を作成できます。 既存の Orb をインポートするのに比べて時間はかかってしまいますが、新たに作成したものは世界中のユーザーに使ってもらえる Orb として公開できます。

```
nohighlight
$ circleci orb help
Operate on orbs

Usage:
  circleci orb [command]

Available Commands:
  create      Create an orb in the specified namespace
  list        List orbs
  process     Validate an orb and print its form after all pre-registration processing
  publish     Publish an orb to the registry
  source      Show the source of an orb
  validate    Validate an orb.yml
```

**注 :** Orb の作成時においては、CircleCI の設定画面でサードパーティ製 Orb の利用と作成に関するオプトインをあなたの所属組織が承諾した段階で、あなたが CircleCI のコード共有利用規約に同意したとみなされます。 これにより、すべての Orbs は MIT ライセンスの元、CircleCI がユーザーに利用を許諾する形となります。

## パートナー製 Orbs をインポートする

パートナー製の Orbs をインポートするには、`.circleci.yml/config.yml` ファイル内で `orbs` キーを指定し、`<orb 参照文字列>` を下記の一覧から選んだ文字列と置き換えます。

```yaml
version: 2.1

orbs:
  <orb 参照文字列>
```

パートナー製 Orb の名称 | Orb 参照文字列 
------------|-----------
[Anchore](https://circleci.com/orbs/registry/orb/anchore/anchore-engine) | `anchore: anchore/anchore-engine@1.0.0`
[Aqua Security](https://circleci.com/orbs/registry/orb/aquasecurity/microscanner) | `aqua: aquasecurity/microscanner@0.0.1`
[Codecov](https://circleci.com/orbs/registry/orb/codecov/codecov) | `codecov: codecov/codecov@1.0.1`
[Cypress-io](https://circleci.com/orbs/registry/orb/cypress-io/cypress) | `cypress-io: cypress-io/cypress@1.0.0`
[Datree](https://circleci.com/orbs/registry/orb/datree/version-alignment-rule) | `datree: datree/version-alignment-rule@1.0.0`
[DeployHub](https://circleci.com/orbs/registry/orb/deployhub/deployhub-orb) | `deployhub: deployhub/deployhub-orb@1.2.0`
[Ghost Inspector](https://circleci.com/orbs/registry/orb/ghostinspector/test-runner) | `ghostinspector: ghostinspector/test-runner@1.0.0`
[Happo](https://circleci.com/orbs/registry/orb/happo/happo) | `happo: happo/happo@1.0.1`
[Honeybadger-io](https://circleci.com/orbs/registry/orb/honeybadger-io/deploy) | `honeybadger-io: honeybadger-io/deploy@1.1.1`
[Nowsecure](https://circleci.com/orbs/registry/orb/nowsecure/ci-auto-orb) | `nowsecure: nowsecure/ci-auto-orb@1.0.5`
[Packagecloud](https://circleci.com/orbs/registry/orb/packagecloud/packagecloud) | `packagecloud: packagecloud/packagecloud@0.1.0`
[Percy](https://circleci.com/orbs/registry/orb/percy/agent) | `percy: percy/agent@0.1.2`
[Postman](https://circleci.com/orbs/registry/orb/postman/newman) | `postman: postman/newman@0.0.1`
[Pulumi](https://circleci.com/orbs/registry/orb/pulumi/pulumi) | `pulumi: pulumi/pulumi@1.0.0`
[Rocro](https://circleci.com/orbs/registry/orb/rocro/inspecode) | `rocro: rocro/inspecode@1.0.0`
[Rollbar](https://circleci.com/orbs/registry/orb/rollbar/deploy) | `rollbar: rollbar/deploy@1.0.0`
[Rookout](https://circleci.com/orbs/registry/orb/rookout/rookout-node) | `rookout: rookout/rookout-node@0.0.2`
[Sauce Labs](https://circleci.com/orbs/registry/orb/saucelabs/sauce-connect) | `saucelabs: saucelabs/sauce-connect@1.0.1`
[Sonatype](https://circleci.com/orbs/registry/orb/sonatype/nexus-platform-orb) | `sonatype: sonatype/nexus-platform-orb@1.0.2`
[Twistlock](https://circleci.com/orbs/registry/orb/twistlock/twistcli-scan) | `twistlock: twistlock/twistcli-scan@1.0.4`
[WhiteSource](https://circleci.com/orbs/registry/orb/whitesource/whitesource-scan) | `whitesource: whitesource/whitesource-scan@18.10.2`
{: class="table table-striped"}

**注 :** あなたの組織でサードパーティ製 Orbs を利用するにあたっては、あらかじめ CircleCI の Settings ＞ Security ページにアクセスし、[Orb Security Settings] で [Yes] を選んでおく必要があります。

## 関連情報
- 既存の Orbs の使い方については「[Orbs を使用する]({{site.baseurl}}/ja/2.0/using-orbs/)」をご覧ください。
- 新たに Orb を作成する詳しい手順は「[Orbs を作成する]({{site.baseurl}}/ja/2.0/creating-orbs/)」をご覧ください。
- 一般的な質問に対する答えをお探しの場合は「[Orbs に関する FAQ]({{site.baseurl}}/ja/2.0/orbs-faq/) 」をご覧ください。
- 再利用が可能な Orbs、コマンド、パラメータ、Executors の詳しい例については「[コンフィグを再利用する]({{site.baseurl}}/ja/2.0/reusing-config/)」をご覧ください。
- 作成した Orb のテスト方法については、[Orbs をテストする]({{site.baseurl}}/2.0/testing-orbs/) で詳しく解説しています。
- Orbs 利用時の法的条件に関する詳細については「[Orbs レジストリ](https://circleci.com/orbs/registry/licensing)」をご覧ください。
