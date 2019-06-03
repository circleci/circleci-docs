---
layout: classic-docs
title: "Java 仮想マシンのヒープサイズの設定"
description: "CircleCI Server で Java 仮想マシンのヒープサイズを設定する方法"
---

frontend、test-results、picard-output-processor の各コンテナ、および v2.15 以降の contexts-service に対して JVM_HEAP_SIZE を設定できます。

## 設定

JVM_HEAP_SIZE の値を変更するには、Services box に customizations ファイルを作成する必要があります。

1. 以下のように customizations ファイルを作成します。

```sh
/etc/circleconfig/frontend/customizations
/etc/circleconfig/test-results/customizations
/etc/circleconfig/output-processor/customizations
/etc/circleconfig/contexts-service/customizations
```

2. 作成したファイルに以下の行を追加して、目的の JVM_HEAP_SIZE をエクスポートします。

```sh
export JVM_HEAP_SIZE=2g
```

3. CircleCI アプリケーションを停止し、再起動します。

## 変更後の検証

設定した値が適用されているかどうかを確認するには、Docker コンテナで REPL を実行する必要があります。

Circle アプリケーションが再起動したら、以下に示すコマンドを実行して、コンテナで REPL を実行します。

##### frontend コンテナの場合

```sh
sudo docker exec -it frontend lein repl :connect 6005
```

##### test-results コンテナの場合

```sh
sudo docker exec -it test-results lein repl :connect 2719
```

#### picard-output-processor コンテナの場合

```sh
sudo docker exec -it picard-output-processor lein repl :connect 6007
```

JVM_HEAP_SIZE の値が変更されていることを確認します。

```clojure
(System/getenv "JVM_HEAP_SIZE") ;; 上記で設定した値が返されます
```

```clojure
(-> (java.lang.Runtime/getRuntime) (.totalMemory)) ;; 戻り値は JVM_HEAP_SIZE の値と一致します
```