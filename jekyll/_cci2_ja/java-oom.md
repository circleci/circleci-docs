---
layout: classic-docs
title: "Java メモリエラーの回避とデバッグ"
description: "CircleCI で Java メモリエラーを回避およびデバッグする方法"
---

CircleCI で Java メモリエラーを回避およびデバッグする方法について説明します。

## 概要

[Java 仮想マシン](https://ja.wikipedia.org/wiki/Java仮想マシン) (JVM) は、Java ベースのアプリケーションに移植可能な実行環境を提供します。 メモリ制限が設定されていないと、JVM は大量のメモリを事前に割り当てます。 これが原因でメモリ不足 (OOM) エラーが発生することがありますが、エラーメッセージには詳細が示されないため、このエラーをデバッグすることは困難です。

JVM によるメモリ使用量を制御するには、[Java 環境変数を使用](#java-環境変数を使用したメモリ制限の設定)してメモリ制限を宣言します。 OOM エラーをデバッグするには、[該当する終了コード](#java-oom-エラーのデバッグ)を確認します。

## Java 環境変数を使用したメモリ制限の設定

複数の Java 環境変数を使用して、JVM のメモリ使用量を管理できます。 これらの変数は名前が似ており、互いに複雑に影響し合っています。

さまざまなビルドツールでの各環境変数の優先レベルを以下の表に示します。 数値が小さいほど優先レベルが高く、0 が最も高い優先レベルとなります。

| Java 環境変数                                 | Java | Gradle | Maven | Kotlin | Lein |
| ----------------------------------------- | ---- | ------ | ----- | ------ | ---- |
| [`_JAVA_OPTIONS`](#_java_options)         | 0    | 0      | 0     | 0      | 0    |
| [`JAVA_TOOL_OPTIONS`](#java_tool_options) | 2    | 3      | 2     | 2      | 2    |
| [`JAVA_OPTS`](#java_opts)                 | ×    | 2      | ×     | 1      | ×    |
| [`JVM_OPTS`](#jvm_opts)                   | *    | ×      | ×     | ×      | *    |
| [`LEIN_JVM_OPTS`](#lein_jvm_opts)         | ×    | ×      | ×     | ×      | 1    |
| [`GRADLE_OPTS`](#gradle_opts)             | ×    | 1      | ×     | ×      | ×    |
| [`MAVEN_OPTS`](#maven_opts)               | ×    | ×      | 1     | ×      | ×    |
| CLI 引数                                    | 1    | ×      | ×     | ×      | ×    |
{:class="table table-striped"}

上記の各環境変数が優先される条件について説明します。

### `_JAVA_OPTIONS`

この環境変数は、他のどの環境変数よりも優先されます。 JVM で直接読み取られ、コマンドライン引数を含む他のすべての Java 環境変数を上書きします。 強力な変数であるため、より限定的な Java 環境変数を使用することを検討してください。

**メモ：**`_JAVA_OPTIONS` は Oracle 専用の変数です。 別のランタイムを使用している場合は、対応する変数名を確認してください。 たとえば、IBM Java ランタイムを使用している場合は、`IBM_JAVA_OPTIONS` を使用します。

### `JAVA_TOOL_OPTIONS`

Java メモリ制限の設定には、この環境変数を使用するのが[無難な選択](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html#tooloptions)と言えます。 `JAVA_TOOL_OPTIONS` はあらゆる Java 仮想マシンで読み取ることができ、より限定的な環境変数やコマンドライン引数で簡単に上書きすることもできます。

### `JAVA_OPTS`

JVM はこの環境変数を読み取りません。 代わりに Java ベースのツールや言語がこの変数を使用して JVM にメモリ制限を渡します。

### `JVM_OPTS`

この環境変数は Clojure 専用です。 `lein` は `JVM_OPTS` を使用して JVM にメモリ制限を渡します。

**メモ：**`JVM_OPTS` は `lein` 自体のメモリには影響しません。また、メモリ制限を Java に直接渡すこともできません。 `lein` の使用可能なメモリに影響を与えるには、`LEIN_JVM_OPTIONS` を使用します。 メモリ制限を Java に直接渡すには、[`_JAVA_OPTIONS`](#_java_options) または [`JAVA_TOOL_OPTIONS`](#java_tool_options) を使用します。

### `LEIN_JVM_OPTS`

この環境変数は `lein` 専用です。

### `GRADLE_OPTS`

この環境変数は Gradle プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

### `MAVEN_OPTS`

この環境変数は Apache Maven プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

## Java OOM エラーのデバッグ

Java OOM エラーのデバッグを行っても、たいていの場合 `exit code 137` のエラーしか見つかりません。

最大サイズ `-Xmxn` がアプリケーションのビルドを完了できる程度に大きく、かつ他のプロセスが CircleCI ビルドコンテナの残りのメモリを使用できる程度に小さくなるように設定してください。

それでも引き続きメモリ制限に達する場合は、[プロジェクトの RAM を増やす](https://circleci.com/docs/ja/2.0/configuration-reference/#resource_class)ことを検討してください。

## 関連項目

[Java 言語ガイド]({{ site.baseurl }}/ja/2.0/language-java/)
[Android チュートリアル]({{ site.baseurl }}/ja/2.0/language-android/)
