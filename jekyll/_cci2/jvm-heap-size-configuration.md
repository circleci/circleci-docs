---
layout: classic-docs
title: "Configuring Java Virtual Machine Heap Size"
description: "How to configure Java virtual Machine Heap Size in CircleCI Server."
---

JVM_HEAP_SIZE is configurable for frontend, test-result, picard-output-processor containers, and for v2.15 and later contexts-service is configurable.

## Setting up
To customize JVM_HEAP_SIZE value, you will need to create customizations file in your services box
1. Create customizations files:
```sh
/etc/circleconfig/frontend/customizations
/etc/circleconfig/test-results/customizations
/etc/circleconfig/output-processor/customizations
/etc/circleconfig/contexts-service/customizations
```

2. In the file, add the line below to export desire JVM_HEAP_SIZE in the file
```sh
export JVM_HEAP_SIZE=2g
```

3. Stop and restart CircleCI application


## Verify customization is applied
To confirm the configured value is applied, you will need to run REPL in Docker containers

When Circle application restarted, run the command below to run REPL into the container
##### For frontend container
```sh
sudo docker exec -it frontend lein repl :connect 6005
```
##### For test-result container
```sh
sudo docker exec -it test-result lein repl :connect 2719
```
#### For picard-output-processor container
```sh
sudo docker exec -it picard-output-processor lein repl :connect 6007
```

verify JVM_HEAP_SIZE has reset.
```clojure
(System/getenv "JVM_HEAP_SIZE") ;; should return what you have set above
```
```clojure
(-> (java.lang.Runtime/getRuntime) (.totalMemory)) ;; return value should match with JVM_HEAP_SIZE
```

