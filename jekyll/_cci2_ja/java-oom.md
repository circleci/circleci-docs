---
layout: classic-docs
title: "Java メモリ エラーの回避とデバッグ"
description: "CircleCI で Java メモリ エラーを回避およびデバッグする方法"
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI で Java メモリ エラーを回避およびデバッグする方法について説明します。

## 概要
{: #overview }

[Java 仮想マシン](https://ja.wikipedia.org/wiki/Java仮想マシン) (JVM) は、Java ベースのアプリケーションに移植可能な実行環境を提供します。 メモリ制限が設定されていない場合、JVM はシステムで使用可能な合計メモリの一部を事前に割り当てます。 CircleCI は大量のメモリを搭載した大規模なマシンでコンテナ ベースのビルドを実行しており、 各コンテナには、マシンで使用可能な総量よりも少ない量のメモリ制限が設定されています。 こうしたことから、JVM がマシン上の大量のメモリを使用可能であると認識して、コンテナに割り当てられているよりも多くのメモリを使用しようとすることがあります。

デフォルトでは、Java の使用量は以下のように設定されています。
- 合計メモリの `1/64` 以上（4 GiB の RAM の Docker Medium クラスの場合、64 MiB）
- 合計メモリの `1/4` 以下（4 GiB の RAM の Docker Medium クラスの場合、１ GiB）

[2020 年 6 月 3 日](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor)の時点では、Docker Executor を使用する際、これらの制限が表示されます。 つまり、Java の最新バージョンでは、ジョブで使用可能な CPU の数や RAM の量を正しく検出します。

以前のバージョンの Java では、JVM がマシン上の大量のメモリと CPU が使用可能であると認識して、コンテナに割り当てられているよりも多くのメモリを使用しようとすることがあります。 これが原因でメモリ不足 (OOM) エラーが発生することがありますが、エラーメッセージには詳細が示されないため、このエラーをデバッグすることは困難です。 通常、`137` 終了コードが表示されます。これは、OOM killer によりプロセスが `SIGKILL` されたことを意味します (`137 = 128 + "kill -9"`)。

下記のファイルより、コンテナに割り当てられているメモリの量と使用量が確認できます。
```
/sys/fs/cgroup/memory/memory.limit_in_bytes
/sys/fs/cgroup/memory/memory.max_usage_in_bytes
```


## UseContainerSupport
{: #usecontainersupport }

最新バージョンの Java (JDK 8u191、JDK 10 以降) には、デフォルトで有効になっている `UseContainerSupport` フラグが含まれています。 このフラグを利用すると、JVM はマシン上の大量のメモリではなく、コンテナに対して有効な CGroup のメモリ制限を適用できます。 これにより、Docker およびその他のコンテナ ランタイムで、JVM がメモリ制限をより正確に検出し、それらの制約内でデフォルトのメモリ使用量を設定できます。 `MaxRAMPercentage` フラグを使用すると、使用可能な RAM のうち使用する割合をカスタマイズできます (例: `-XX:MaxRAMPercentage=90.0`)。

## 手動でのメモリ制限
{: #manual-memory-limits }

cgroup をサポートしていても、JVM はワーカープロセスプールを実行する場合など、メモリを過剰に使用する場合があります。 JVM によるメモリ使用量を制御するには、[Java 環境変数を使用](#using-java-environment-variables-to-set-memory-limits)してメモリ制限を宣言します。 OOM エラーをデバッグするには、[該当する終了コード](#debugging-java-oom-errors)を確認します。

## Java 環境変数を使用したメモリ制限の設定
{: #using-java-environment-variables-to-set-memory-limits }

複数の Java 環境変数を使用して、JVM のメモリ使用量を管理できます。 これらの変数は名前が似ており、互いに複雑に影響し合っています。

さまざまなビルド ツールでの各環境変数の優先レベルを以下の表に示します。 数値が小さいほど優先レベルが高く、0 が最も高い優先レベルとなります。

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
{: #javaoptions }

この環境変数は、他のどの環境変数よりも優先されます。 JVM で直接読み取られ、コマンドライン引数を含む他のすべての Java 環境変数を上書きします。 強力な変数であるため、より限定的な Java 環境変数を使用することを検討してください。

**メモ:** `_JAVA_OPTIONS` は Oracle 専用の変数です。 別のランタイムを使用している場合は、対応する変数名を確認してください。 たとえば、IBM Java ランタイムを使用している場合は、`IBM_JAVA_OPTIONS` を使用します。

### `JAVA_TOOL_OPTIONS`
{: #javatooloptions }

Java メモリ制限の設定には、この環境変数を使用するのが[無難な選択](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html#tooloptions)と言えます。 `JAVA_TOOL_OPTIONS` はあらゆる Java 仮想マシンで読み取ることができ、より限定的な環境変数やコマンドライン引数で簡単に上書きすることもできます。

### `JAVA_OPTS`
{: #javaopts }

JVM はこの環境変数を読み取りません。 代わりに Java ベースのツールや言語がこの変数を使用して JVM にメモリ制限を渡します。

### `JVM_OPTS`
{: #jvmopts }

この環境変数は Clojure 専用です。 `lein` は `JVM_OPTS` を使用して JVM にメモリ制限を渡します。

**注:** `JVM_OPTS` は `lein` 自体のメモリには影響しません。 また、メモリ制限を Java に直接渡すこともできません。 `lein` の使用可能なメモリに影響を与えるには、`LEIN_JVM_OPTS` を使用します。 メモリ制限を Java に直接渡すには、[`_JAVA_OPTIONS`](#_java_options) または [`JAVA_TOOL_OPTIONS`](#java_tool_options) を使用します。

### `LEIN_JVM_OPTS`
{: #leinjvmopts }

この環境変数は `lein` 専用です。

### `GRADLE_OPTS`
{: #gradleopts }

[メモリの設定](https://docs.gradle.org/current/userguide/build_environment.html#sec:configuring_jvm_memory)については、Gradle のドキュメントを参照してください。

この環境変数は Gradle プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

### `MAVEN_OPTS`
{: #mavenopts }

[メモリの設定](http://maven.apache.org/configure.html)については、Maven のドキュメントを参照してください。

この環境変数は Apache Maven プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

## Java OOM エラーのデバッグ
{: #debugging-java-oom-errors }

Java OOM エラーのデバッグを行っても、たいていの場合 `exit code 137` のエラーしか見つかりません。

`-XX:MaxRAMPercentage=NN` や `-Xmx=NN` のサイズが、ご自身のアプリを完全にビルドするのに十分な大きさであることを確認します。また、他のプロセスが CircleCI ビルドコンテナの残りのメモリを共有できる大きさであることを確認します。

JVM の最大ヒープサイズがジョブの制限値を上回る場合でも、ガベージコレクター機能により割り当て速度を維持し、プロセスが大量のメモリを使用し強制終了されるのを回避できます。 ガベージコレクターに割り当てられるデフォルトのスレッド数は、利用可能な CPU の数に基づいており、2020年 6月3日に行われた[cgroup の変更](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor)により、アプリが以前よりも多くのメモリを消費し、OOM が強制終了される可能性があります。 このための最善の解決策は、ジョブの使用可能な RAM 内の最大ヒープサイズを設定することです。これにより、限界値を超えないようすぐに完全なガーベジコレクターがトリガされます。

それでも引き続きメモリ制限に達する場合は、[ジョブの RAM を増やす]({{site.baseurl}}/ja/configuration-reference/#resource_class)ことを検討してください。

## 関連項目
{: #see-also }

[Java 言語ガイド]({{ site.baseurl }}/ja/language-java/)<br> [Android チュートリアル]({{ site.baseurl }}/ja/language-android/)
