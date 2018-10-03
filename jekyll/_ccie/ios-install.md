---
layout: enterprise
section: enterprise
title: "iOS Install"
category: [resources]
order: 0
description: "Adding macOS and iOS support to your CircleCI Enterprise installation."
hide: true
sitemap: false
---

## What we need

CircleCI will require:

* New public SSH Key that we add to the machine to allow access. The private key must NOT be password protected.

CircleCI will provide:

* Mac Public IP: The ip should be able to access your GitHub Enterprise instance. You can special-case and whitelist that IP Address.
* Mac VM - we will provide the same VMs as our production fleet. We will lock the VM id and/or upgrade it by request.

Requirements to proceed with Installation:

* Authorization to launch new AWS resources
* Access to the public / private keypair from above.


### Hooking up Mac's to your CircleCI Enterprise Installation

Getting iOS builds to run is a three step process:

#### 1. Start a builder machine to run iOS builds

Start a new builder box that is dedicated for running iOS builds.  Our infrastructure requires separate builders for linux vs iOS builds.

The iOS builder machines can be relatively small - we run with `c3.2xlarge` in our production environment and expect them to manage 16 OSX VMs.

The initialization of the OSX build requires some additional environment variables (**Make sure to replace `$SERVICES_PRIVATE_IP` with the private IP address of the services box**):

```
curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
    SERVICES_PRIVATE_IP=<private ip address of services box> \
    CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
    CIRCLE_NUM_CONTAINERS=16 \
    NO_LXC=true \
    CIRCLE_CONTAINER_TYPE=esxi-osx \
    CIRCLE_FLEET=osx \
    bash
```

#### 2. Add Mac instance to the cluster

First, you need to configure the fleet to recognize and connect to the Mac instances:

1. scp the private and public parts of the both SSH keys into a builder box
2. ssh into the builder box as `ubuntu` user, and connect to CircleCI process by running:

```
$ lein repl :connect 6005
Connecting to nREPL at 127.0.0.1:6005
REPL-y 0.3.7, nREPL 0.2.10
Clojure 1.7.0
Java HotSpot(TM) 64-Bit Server VM 1.8.0_60-b27
CompilerException java.lang.RuntimeException: No such var: user/help, compiling:(/private/var/folders/0r/4ssq4ndd0yd4sbxf_6564r040000gr/T/form-init4725423676106183966.clj:1:11088)
#object[clojure.lang.Namespace 0x1f2dc26d "user"]
Error loading namespace; falling back to user
nil
user=>
```

3. Edit the following code block and copy and paste into the REPL prompt:

```
(let [;; User configuration
      host-ip-address  "XX.XX.XX.XX" ;; The host  ip address CircleCI provides
      guest-ip-address "XX.XX.XX.XX" ;; The guest ip address CircleCI provides
      supported-versions "X.X,X.X" ;; list of Xcode versions on your macOS fleet

      path-to-public-key "/home/ubuntu/XXXXXX"
      path-to-private-key "/home/ubuntu/XXXXXX"

      ;; please don't edit the following
      num-vms 2 ;; 2 VMS on a Mac Mini
      encrypted-keypair
      (clj-keyczar.crypt/with-crypter (:keyset-crypt (circle.secrets/secrets))
        (circle-util.ssh-keys/encrypt-keypair
         {:public-key (slurp path-to-public-key)
          :private-key (slurp path-to-private-key)}))
          fleet "osx"]

  (circle.backend.model.esxi-vm/create-esxi-box
   num-vms
   encrypted-keypair
   encrypted-keypair
   host-ip-address
   guest-ip-address
   fleet)
  (circle.model.settings/set! {
                               :xcode-supported-versions supported-versions
                               :run-inference-daemon true
                               :ios-beta-enabled true
                               :enable-osx-caching false
                               :global-sudo-enabled.managed-osx false})

  (circle.backend.model.esxi-vm/set-online-by-host! host-ip-address true)
  (println "The OSX Machine is ready: " host-ip-address))
```

#### 3. Enable iOS for your project, and make sure it works


To enable a project to use iOS builds, you need to whitelist the org, and enable the iOS build flag for individual project.  For illustration, the following steps, assume you want to enable iOS build for https://ghe.example.com/example-org/an-app-for-that

To whitelist the organization, ssh into a builder machine, and run the following:

```
$ lein repl :connect 6005
user=> (circle.http.api.admin-commands/enable-osx-beta "example-org")
{:name "example-org" :osx-builds-enabled? true}
```

First, enable building on OSX in the project settings under the Experimental Settings tab for your iOS project. Next, ensure that you have have a shared build scheme in Xcode. We have documented how to do this here: [https://circleci.com/docs/ios-builds-on-os-x/](https://circleci.com/docs/ios-builds-on-os-x/). Finally, you just need to push a new commit, and the build will run a on a Mac running OSX.
