---
layout: classic-docs
title: "プロジェクトの概要"
description: "CircleCI プロジェクトについての説明"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---


CircleCI のプロジェクトは、お客様の[バージョンコントロールシステム]({{ site.baseurl }}/ja/gh-bb-integration/) (VCS) 内の、関連するコードリポジトリと同じ名前を持ちます。 CircleCI アプリのサイドバーから **Projects** を選択し、プロジェクトダッシュボードに入力します。 ここからアクセス可能なプロジェクトのセットアップやフォローが可能です。

プロジェクトダッシュボードでは、以下のいずれかを実行します。
* VCS で所有者になっているプロジェクトを_セットアップ_する.
* 組織内のプロジェクトを _フォロー_ して、パイプラインにアクセスし、プロジェクトのステータスに関する[メール通知]({{site.baseurl }}/ja/notifications/)を受け取る

詳細については、[CircleCI でのプロジェクトの作成]({{site.baseurl}}/ja/create-project/)を参照してください。

## プロジェクトダッシュボード
{: #projects-dashboard }

![プロジェクトダッシュボード]({{site.baseurl}}/assets/img/docs/CircleCI-2.0-setup-project-circle101_cloud.png)

ユーザーは、プロジェクトをフォローすることで、プロジェクトの[ビルド ステータス]({{site.baseurl}}/ja/status/)に関する[メール通知]({{site.baseurl}}/ja/notifications/)を受け取り、プロジェクトを CircleCI ダッシュボードに追加できます。

プロジェクト管理者とは、GitHub または Bitbucket リポジトリをプロジェクトとして CircleCI に追加するユーザーを指します。 *ユーザー*とは、組織内の個々のユーザーです。 CircleCI ユーザーとは、ユーザー名とパスワードを使用して CircleCI プラットフォームにログインできる人を指します。 関係する CircleCI プロジェクトを表示したりフォローするには、ユーザーが [GitHub または Bitbucket 組織]({{site.baseurl}}/ja/gh-bb-integration/)に追加されている必要があります。 ユーザーは、環境変数に保存されているプロジェクト データを表示することはできません。

### 組織の切り替え
{: #org-switching }
プロジェクトが表示されず、CircleCI 上でビルド中でない場合は、 CircleCI Web アプリの左上隅の**組織**を確認してください。 たとえば、左上にユーザー `my-user` が表示されているなら、`my-user` に所属する GitHub プロジェクトのみが **Projects** の下で使用できます。 GitHub プロジェクト `your-org/project` をビルドする場合は、アプリケーションメニューで `your-org` を選択して組織を変更する必要があります。

![組織の切り替えメニュー]({{site.baseurl}}/assets/img/docs/org-centric-ui_newui.png)

## パイプラインの表示と移動
{: #viewing-and-navigating-pipelines }

リポジトリに新しいコミットがプッシュされると、お客様のパイプラインが CircleCI Web アプリの**ダッシュボード**に表示されます。 パイプラインを拡大し、任意のワークフローやジョブをクリックすると、ワークフローや単一のジョブを表示することができます。

パイプラインの単一のジョブを表示する際は、ページ上部にある階層リンクを使ってジョブの各ワークフローやパイプラインに戻ることができます。

![パイプラインの階層リンク]({{site.baseurl}}/assets/img/docs/pipeline-breadcrumbs.png)

## 組織名とリポジトリ名の変更
{: #renaming-orgs-and-repositories }

CircleCI と連携済みの組織名やリポジトリ名を変更する必要が生じた場合、下記のステップに従って下さい:

1. VCS で組織名またはリポジトリ名を変更します。
2. CircleCI Web アプリケーションに移動し、例えば `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`のような新しい組織名およびリポジトリ名を使用します。
3. CircleCI のプラン、プロジェクト、各種設定が正しく引き継がれていることを確認します。
4. これで、必要に応じて VCS の古い名前で新しい組織やリポジトリを作成できます。

上記の手順で変更を行わない場合、組織やリポジトリの[**環境変数**]({{site.baseurl}}/ja/env-vars)や[**コンテキスト**]({{site.baseurl}}/ja/contexts)などの設定にアクセスができなくなる場合があります。
{: class="alert alert-info" }

## 次のステップ
{: #next-steps }

* 詳細については、[CircleCI でのプロジェクトの作成]({{ site.baseurl }}/ja/create-project/)を参照してください。
* CircleCI のパイプラインの詳細については、[パイプラインの概要]({{ site.baseurl }}/ja/create-project/)を参照してください。
