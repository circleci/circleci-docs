---
layout: classic-docs
title: "Java メモリ エラーの回避とデバッグ"
description: "CircleCI で Java メモリ エラーを回避およびデバッグする方法"
version:
  - Cloud
  - Server v2.x
---

CircleCI で Java メモリ エラーを回避およびデバッグする方法について説明します。

## 概要
{: #overview }

[Java 仮想マシン](https://ja.wikipedia.org/wiki/Java仮想マシン) (JVM) は、Java ベースのアプリケーションに移植可能な実行環境を提供します。 メモリ制限が設定されていない場合、JVM はシステムで使用可能な合計メモリの一部を事前に割り当てます。 CircleCI は大量のメモリを搭載した大規模なマシンでコンテナ ベースのビルドを実行しており、 各コンテナには、マシンで使用可能な総量よりも少ない量のメモリ制限が設定されています。 こうしたことから、JVM がマシン上の大量のメモリを使用可能であると認識して、コンテナに割り当てられているよりも多くのメモリを使用しようとすることがあります。

コンテナで使用可能なメモリ量を確認するには、`/sys/fs/cgroup/memory/memory.max_usage_in_bytes` ファイルを参照します。
- More than `1/64th` of your total memory (for Docker Medium with 4GiB of RAM this will be 64 MiB)
- Less than `1/4th` of your total memory (for Docker Medium with 4GiB of RAM this will be 1GiB).

As of [June 3rd 2020](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor) these limits are visible when using the Docker executor. This means that the recent versions of Java will correctly detect the number of CPUs and amount of RAM available to the job.

For older versions of Java, This can lead to the JVM seeing a large amount of memory and CPUs being available to it, and trying to use more than is allocated to the container. これが原因でメモリ不足 (OOM) エラーが発生することがありますが、エラー メッセージには詳細が示されないため、このエラーをデバッグすることは困難です。 Usually you will see a `137` exit code, which means the process has been `SIGKILL`ed by the OOM killer (`137 = 128 + "kill -9"`).

You can see how much memory your container is allocated, and how much it has used, by looking at the following files:
```
/sys/fs/cgroup/memory/memory.limit_in_bytes
/sys/fs/cgroup/memory/memory.max_usage_in_bytes
```


## UseContainerSupport
{: #usecontainersupport }

最新バージョンの Java (JDK 8u191、JDK 10 以降) には、デフォルトで有効になっている `UseContainerSupport` フラグが含まれています。 このフラグを利用すると、JVM はマシン上の大量のメモリではなく、コンテナに対して有効な CGroup のメモリ制限を適用できます。 これにより、Docker およびその他のコンテナ ランタイムで、JVM がメモリ制限をより正確に検出し、それらの制約内でデフォルトのメモリ使用量を設定できます。 `MaxRAMPercentage` フラグを使用すると、使用可能な RAM のうち使用する割合をカスタマイズできます (例: `-XX:MaxRAMPercentage=90.0`)。

## 手動でのメモリ制限
{: #manual-memory-limits }

Even with cgroup support, the JVM can still use too much memory, e.g. if it executes a worker process pool. JVM によるメモリ使用量を制御するには、[Java 環境変数を使用](#java-環境変数を使用したメモリ制限の設定)してメモリ制限を宣言します。 OOM エラーをデバッグするには、[該当する終了コード](#java-oom-エラーのデバッグ)を確認します。

## Java 環境変数を使用したメモリ制限の設定
上記の各環境変数が優先される条件について説明します。

複数の Java 環境変数を使用して、JVM のメモリ使用量を管理できます。 これらの変数は名前が似ており、互いに複雑に影響し合っています。

さまざまなビルド ツールでの各環境変数の優先レベルを以下の表に示します。 数値が小さいほど優先レベルが高く、0 が最も高い優先レベルとなります。

| Java 環境変数                                 | Java | Gradle | Maven | Kotlin | Lein |
| ----------------------------------------- | ---- | ------ | ----- | ------ | ---- |
| [`_JAVA_OPTIONS`](#_java_options)         | 0    | 0      | 0     | 0      | 0    |
| [`JAVA_TOOL_OPTIONS`](#java_tool_options) | 2    | 3      | 2     | 2      | 2    |
| [`JAVA_OPTS`](#java_opts)                 | no   | 2      | no    | 1      | no   |
| [`JVM_OPTS`](#jvm_opts)                   | *    | no     | no    | no     | *    |
| [`LEIN_JVM_OPTS`](#lein_jvm_opts)         | no   | no     | no    | no     | 1    |
| [`GRADLE_OPTS`](#gradle_opts)             | no   | 1      | no    | no     | no   |
| [`MAVEN_OPTS`](#maven_opts)               | no   | no     | 1     | no     | no   |
| CLI 引数                                    | 1    | no     | no    | no     | no   |
{:class="table table-striped"}

The above environment variables are listed below, along with details on why to choose one over another.

### `_JAVA_OPTIONS`
{: #javaoptions }

この環境変数は、他のどの環境変数よりも優先されます。 JVM で直接読み取られ、コマンドライン引数を含む他のすべての Java 環境変数を上書きします。 強力な変数であるため、より限定的な Java 環境変数を使用することを検討してください。

**メモ:** `_JAVA_OPTIONS` は Oracle 専用の変数です。 別のランタイムを使用している場合は、対応する変数名を確認してください。 たとえば、IBM Java ランタイムを使用している場合は、`IBM_JAVA_OPTIONS` を使用します。

### `JAVA_TOOL_OPTIONS`
{: #javatooloptions }

Java メモリ制限の設定には、この環境変数を使用するのが[無難な選択](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html#tooloptions)と言えます。 `JAVA_TOOL_OPTIONS` はあらゆる Java 仮想マシンで読み取ることができ、より限定的な環境変数やコマンドライン引数で簡単に上書きすることもできます。

### `JAVA_OPTS`
最大サイズ `-Xmxn` がアプリケーションのビルドを完了できる程度に大きく、かつ他のプロセスが CircleCI ビルド コンテナの残りのメモリを使用できる程度に小さくなるように設定してください。

JVM はこの環境変数を読み取りません。 代わりに Java ベースのツールや言語がこの変数を使用して JVM にメモリ制限を渡します。

### `JVM_OPTS`
[Java 言語ガイド]({{ site.baseurl }}/ja/2.0/language-java/) [Android チュートリアル]({{ site.baseurl }}/ja/2.0/language-android/)

この環境変数は Clojure 専用です。 `lein` は `JVM_OPTS` を使用して JVM にメモリ制限を渡します。

**メモ:** `JVM_OPTS` は `lein` 自体のメモリには影響しません。 また、メモリ制限を Java に直接渡すこともできません。 `lein` の使用可能なメモリに影響を与えるには、`LEIN_JVM_OPTS` を使用します。 メモリ制限を Java に直接渡すには、[`_JAVA_OPTIONS`](#_java_options) または [`JAVA_TOOL_OPTIONS`](#java_tool_options) を使用します。

### `LEIN_JVM_OPTS`
{: #leinjvmopts }

この環境変数は `lein` 専用です。

### `GRADLE_OPTS`
{: #gradleopts }

See the Gradle documentation for [memory settings](https://docs.gradle.org/current/userguide/build_environment.html#sec:configuring_jvm_memory).

この環境変数は Gradle プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

### `MAVEN_OPTS`
{: #mavenopts }

See the Maven documentation for [memory settings](http://maven.apache.org/configure.html).

この環境変数は Apache Maven プロジェクト専用です。 この変数を使用して、`JAVA_TOOL_OPTIONS` で設定されているメモリ制限を上書きできます。

## Java OOM エラーのデバッグ
Java OOM エラーのデバッグを行っても、たいていの場合 `exit code 137` のエラーしか見つかりません。

Unfortunately, debugging Java OOM errors often comes down to finding an `exit
code 137` in your error output.

Ensure that your `-XX:MaxRAMPercentage=NN` or `-Xmx=NN` size is large enough for your applications to completely build, while small enough that other processes can share the remaining memory of your CircleCI build container.

Even if the JVM's maximum heap size is larger than the job's limit, the garbage collector may be able to keep up with the allocation rate and avoid your process using too much memory and being killed. The default number of threads allocated to the garbage collector is based on the number of CPUs available, so the [cgroup visibility change](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor) made on June 3rd 2020 may cause your application to consume more memory than before and be OOM killed. The best fix for this is to configure the maximum heap size within the job's available RAM, which will cause a full GC to be triggered soon enough to avoid breaching any limits.

それでも引き続きメモリ制限に達する場合は、[プロジェクトの RAM を増やす](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)ことを検討してください。

## 関連項目
{: #see-also }

[Java Language Guide]({{ site.baseurl }}/2.0/language-java/) [Android Tutorial]({{ site.baseurl }}/2.0/language-android/)
