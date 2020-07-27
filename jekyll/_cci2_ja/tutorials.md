---
layout: classic-docs
title: "チュートリアル"
description: "チュートリアルおよびガイド付き 2.0 サンプルアプリケーション"
---

お使いのプラットフォームに関連するチュートリアルを使用して、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) でどのようなカスタマイズが可能かを学習してください。

## チュートリアル

| プラットフォームガイド               | 説明                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/project-walkthrough/">Linux プロジェクトのチュートリアル</a> | Flask を使用した Python プロジェクトを CircleCI 2.0 でビルドするための設定について、詳しく説明しています。 |
| <a href="{{ site.baseurl }}/2.0/ios-tutorial/">iOS プロジェクトのチュートリアル</a> | CircleCI 2.0 で iOS プロジェクトを設定する例をご紹介しています。                           |
| <a href="{{ site.baseurl }}/2.0/language-android/">Android プロジェクトのチュートリアル</a> | CircleCI 2.0 で Android プロジェクトを設定する例をご紹介しています。                       |
{: class="table table-striped"}

## ガイド付きサンプルアプリケーション

サンプルアプリケーションを参照すると、アプリケーションの記述に使用する言語やフレームワークの構築に役立ちます。

| アプリケーションの記述に使用する言語                                                                                  | フレームワーク      | GitHub のリポジトリ名                                                                                          |
| --------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| [Android]                                                                                           | Gradle       | [android-image](https://github.com/circleci/circleci-images/tree/master/android)                        |
| [Android](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md)      | React Native | [circleci-demo-react-native](https://github.com/CircleCI-Public/circleci-demo-react-native)             |
| [Clojure]                                                                                           | Luminus      | [circleci-demo-clojure-luminus](https://github.com/CircleCI-Public/circleci-demo-clojure-luminus)       |
| [Crystal]({{ site.baseurl }}/2.0/language-crystal/)                                                 | Kemal        | [circleci-demo-crystal](https://github.com/CircleCI-Public/circleci-demo-crystal)                       |
| [Elixir]                                                                                            | Phoenix      | [circleci-demo-elixir-phoenix](https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix)         |
| [Go]                                                                                                | Go           | [circleci-demo-go](https://github.com/CircleCI-Public/circleci-demo-go)                                 |
| [Haskell]({{ site.baseurl }}/2.0/language-haskell/)                                                 | Scotty       | [circleci-demo-haskell](https://github.com/CircleCI-Public/circleci-demo-haskell)                       |
| [iOS]                                                                                               | Xcode        | [circleci-demo-ios](https://github.com/CircleCI-Public/circleci-demo-ios)                               |
| [iOS](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md)          | React Native | [circleci-demo-react-native](https://github.com/CircleCI-Public/circleci-demo-react-native)             |
| [macOS](https://github.com/CircleCI-Public/circleci-demo-macos)                                     | macOS        | [circleci-demo-macos](https://github.com/CircleCI-Public/circleci-demo-macos)                           |
| [Java]                                                                                              | Spring       | [circleci-demo-java-spring](https://github.com/CircleCI-Public/circleci-demo-java-spring)               |
| [JavaScript](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md)   | React Native | [circleci-demo-react-native](https://github.com/CircleCI-Public/circleci-demo-react-native)             |
| [Node.js - JavaScript]                                                                              | React        | [circleci-demo-javascript-express](https://github.com/CircleCI-Public/circleci-demo-javascript-express) |
| [PHP]                                                                                               | Laravel      | [circleci-demo-php-laravel](https://github.com/CircleCI-Public/circleci-demo-php-laravel)               |
| [Python]                                                                                            | Django       | [circleci-demo-python-django](https://github.com/CircleCI-Public/circleci-demo-python-django)           |
| [Python]({{ site.baseurl }}/2.0/project-walkthrough/)                                               | Flask        | [circleci-demo-python-flask](https://github.com/CircleCI-Public/circleci-demo-python-flask)             |
| [React Native](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md) | React Native | [circleci-demo-react-native](https://github.com/CircleCI-Public/circleci-demo-react-native)             |
| [Ruby および Rails]                                                                                    | Rails        | [circleci-demo-ruby-rails](https://github.com/CircleCI-Public/circleci-demo-ruby-rails)                 |
| [Scala]                                                                                             | sbt          | [sample-scala](https://github.com/ariv3ra/samplescala)                                                  |
{: class="table table-striped"}

## サンプルワークフロー

| サンプルワークフロー     | GitHub リポジトリ                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 並列             | [parallel-jobs](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml)                       |
| 順次             | [sequential-branch-filter](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) |
| ファンイン / ファンアウト | [fan-in-fan-out](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)                     |
| ワークスペース転送      | [workspace-forwarding](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml)         |
{: class="table table-striped"}

## CircleCI パブリックリポジトリ

| GitHub リポジトリ           | 説明                                              | config.yml のリンク                                                                                      |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| circleci-docs          | Jekyll によって生成された CircleCI ドキュメントの静的な Web サイトです。 | [.circleci/config.yml](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml)   |
| circleci frontend      | CircleCI のフロントエンドを実行しているコードのミラーです。              | [.circleci/config.yml](https://github.com/circleci/frontend/blob/master/.circleci/config.yml)        |
| circleci-images        | CircleCI が提供している公式のイメージセットです。                   | [.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml) |
| circleci image-builder | コンテナイメージのビルドに Docker を使用します。                    | [.circleci/config.yml](https://github.com/circleci/image-builder/blob/master/.circleci/config.yml)   |
{: class="table table-striped"}

[Android]: {{ site.baseurl }}/ja/2.0/language-android/
[Clojure]: {{ site.baseurl }}/ja/2.0/language-clojure/
[Elixir]: {{ site.baseurl }}/ja/2.0/language-elixir/
[Go]: {{ site.baseurl }}/ja/2.0/language-go/
[iOS]: {{ site.baseurl }}/ja/2.0/ios-tutorial/
[Java]: {{ site.baseurl }}/ja/2.0/language-java/
[Node.js - JavaScript]: {{ site.baseurl }}/ja/2.0/language-javascript/
[PHP]: {{ site.baseurl }}/ja/2.0/language-php/
[Python]: {{ site.baseurl }}/ja/2.0/language-python/
[Ruby および Rails]: {{ site.baseurl }}/ja/2.0/language-ruby/
[Scala]: {{ site.baseurl }}/ja/2.0/language-scala/

## 関連項目

Hello World ドキュメントと`config.yml` ファイルの例を参照して、最初のビルドを設定できます。

| ドキュメント                    | 説明                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/hello-world/">Hello World</a> | Hello World を表示するアプリケーションの `config.yml` ファイルテンプレートを使用して、簡単な手順で作業を開始できます。                                                         |
| <a href="{{ site.baseurl }}/2.0/sample-config/"><code>config.yml</code> ファイルの例</a> | 4種類の `config.yml` ファイルが紹介されています。これらの例では、並列実行ワークフロー、順次実行ワークフロー、ファンインワークフロー、ファンアウトワークフローを使用し、1つの設定ファイルに基づいて Linux と iOS をビルドしています。 |
{: class="table table-striped"}
