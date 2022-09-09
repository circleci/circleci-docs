---
layout: classic-docs
title: "Troubleshooting and Common Issues"
short-title: "Troubleshooting and Common Issues"
description: "Troubleshooting and Common Issues"
readtime: false
version:
  - クラウド
---

# API
{: #api }

<details markdown=block>
<summary>How to trigger a workflow via CircleCI API v2</summary>

 CircleCI API (v2) doesn't currently provide a dedicated endpoint to specifically trigger a new workflow.

However, it is still possible to trigger a specific workflow using the "[Trigger a new pipeline"](https://circleci.com/docs/api/v2/#operation/triggerPipeline) endpoint. It requires some modification to your `config.yml`, and the use of [pipeline parameters]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration), as well as, [conditional workflows]({{site.baseurl}}/configuration-reference/#using-when-in-workflows).

For example, if you have the following `workflows` declared in your `config.yml`:

```yml
workflows:
  version: 2
  build:
    jobs:
      - job_a
  test:
    jobs:
      - job_b
  deploy:
    jobs:
      - job_c
```

You will need to declare the following [pipeline parameters]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration):

```yml
version: 2.1  
parameters:
  run_workflow_build:
    default: true
    type: boolean

  run_workflow_test:
    default: true
    type: boolean

  run_workflow_deploy:
    default: true
    type: boolean
```

_**Note**: setting the parameters' default value to "true" will allow the workflows to run when the pipeline is triggered by pushing commits._

And modify the `workflows` section as follows:

```yml
workflows:
  version: 2
  build:
    when: << pipeline.parameters.run_workflow_build >>
    jobs:
      - job_a
  test:
    when: << pipeline.parameters.run_workflow_test >>
    jobs:
      - job_b
  deploy:
    when: << pipeline.parameters.run_workflow_deploy >>
    jobs:
      - job_c
```


Using the above example, the cURL request to only run the `test` workflow would be (i_n the following requests your_ `vcs-slug` _will be_ `bitbucket` _or_ `github` _depending on which VCS you use_):

```sh
curl --request POST \
  --url https://circleci.com/api/v2/project/vcs-slug/org-name/repo-name/pipeline \
  --header 'Circle-Token: ***********************************' \
  --header 'content-type: application/json' \
  --data '{"parameters":{"run_workflow_build":false, "run_workflow_deploy":false}}'
```

_**Note**: keep in mind that you have to use a [personal API token]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token); project tokens are currently not supported on CircleCI API (v2)._

For clarity, you could also pass the parameter corresponding to the workflow you wish to run. Doing so would have the exact same outcome as the above request because the pipeline parameters were declared with a default value set to "true":

```sh
curl --request POST \
  --url https://circleci.com/api/v2/project/vcs-slug/org-name/repo-name/pipeline \
  --header 'Circle-Token: ***********************************' \
  --header 'content-type: application/json' \
  --data '{"parameters":{"run_workflow_build":false, "run_workflow_test":true, "run_workflow_deploy":false}}'
```

### 参考情報:
{: #references }
{:.no_toc}

* [Trigger a new pipeline: _CircleCI API (v2)_ _documentation_](https://circleci.com/docs/api/v2/#operation/triggerPipeline)
* [Pipelines parameters in configuration: _CircleCI documentation (Configuration > Advanced Config)_]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration)
* [Conditional Workflows: _API preview documentation_](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/conditional-workflows.md)
* [Managing API Tokens: _CircleCI documentation (Project > Settings)_]({{site.baseurl}}/managing-api-tokens/)

</details>

# Common Issues
{: #common-issues }

<details markdown=block>
<summary>ローカルで通るテストが CircleCI では失敗する理由</summary>

この動作には、いくつかの理由が考えられます。

* **言語バージョンが異なる**： お使いのマシンと CircleCI で使用されている言語バージョンが同じであることを確認します。
* **パッケージのバージョンが異なる**： 構成ファイルでパッケージのバージョンを明示的に指定します。
* **タイムゾーンの問題**： 一部のテスト用フレームワークでは、モジュールがタイムゾーンに対応していない可能性があります。 パソコンで正しいタイムゾーンが設定されていないと、一部のテストが失敗する可能性があります。 See [this question]({{site.baseurl}}/faq/#how-can-i-set-the-timezone-in-docker-images) in the FAQ for more details.
* **ファイルの順序**： 一部のファイルシステムでは、ディレクトリごとに順序付けされたファイル構造が維持されます。 このため、すべてのファイルは実行のたびに同じ順序で読み取られます。 しかし、CircleCI のビルドコンテナのファイルシステムには順序がありません。 実施するテストが、一定の順序で実行した場合にのみ通るようなものであれば、CircleCI では失敗する可能性があります。
* **「Out of Memory」エラー**： ビルドコンテナのプロセスによるメモリ使用量が多すぎる場合、 Linux の OOM killer により終了されることがあります。 If you are interested in recording your memory usage, visit [How to record a job's memory usage](https://support.circleci.com//hc/en-us/articles/360043994872).
* **起動時間の違い**： Elasticsearch や PostgreSQL などのアプリケーションは、CircleCI で起動するときに多少の時間を要することがあります。 テストを実行する前に、サービスが利用可能になるまで明示的に待機することで、この問題を修正できます。
* **信頼性の低いサービス**： テストでサードパーティー製のサービスを使用する場合、そのサービスが実際に実行されていることを確認してください。

もし問題が解決できない場合、[サポートチケット](https://support.circleci.com/hc/ja)を登録してください。

</details>


<details markdown=block>
<summary>Build "Not Running" due to concurrency limit but no other job is running</summary>

### Why is this happening?
{: #why-is-this-happening }
{:.no_toc}

If a job is not starting and showing a status "**Not Running**" after you triggered a pipeline, it means that you have reached the **concurrency limit** of your plan.

This is most likely to happen to customers on our [Free Plan](https://circleci.com/pricing/), as they have access to use a single container at any one time (1x concurrency), therefore jobs will queue if that container is already in use.

However, customers on plans with a higher concurrency limit can also encounter this situation.

The delayed start of your job, and the fact it remains in a "Not Running" state before eventually starting, is due to the fact that other jobs are still running when the new job is triggered.

### Check for running SSH jobs
{: #check-for-running-ssh-jobs }
{:.no_toc}

We found that this situation frequently arises due to running SSH jobs; once you navigate away from a running SSH job it won't appear in the pipelines view, so one can assume that no jobs are running at the time.

SSH jobs, along with all jobs in a given project are listed in the "**legacy jobs view**":

`https://app.circleci.com/pipelines/{vcs}/{org}/{project}/jobs`

An SSH job will remain available for an SSH connection for **10 minutes after the job finishes** \- if SSH has not been accessed, then the job will **automatically end after 10 minutes**.

After you SSH into the job, the SSH connection will remain open for **up to two hours**. That's why we advise to always manually cancel SSH jobs after you have finished with them to make sure your build queue is as free as possible.

To do so, please follow instructions outlined in the Support article "[How to see running SSH jobs](https://support.circleci.com/hc/en-us/articles/360047125652-How-to-see-running-SSH-jobs)".

</details>

# Docker
{: #docker }

<details markdown=block>
<summary>Docker Layer Caching FAQ</summary>

[Docker Layer Caching (DLC)]({{site.baseurl}}/docker-layer-caching/#overview) can reduce Docker image build times on CircleCI by caching individual layers of any Docker images built as part of your jobs. Here are some frequently asked questions around DLC:

### **Is DLC available between different workflows under the same project?**
{: #is-dlc-available-between-different-workflows-under-the-same-project }
{:.no_toc}

Yes, DLC is not locked to workflows or jobs. You can create a maximum of 50 DLC volumes per project (including any parallelism).

### **Why are subsequent builds not able to access the cache consistently?**
{: #why-are-subsequent-builds-not-able-to-access-the-cache-consistently }
{:.no_toc}

If a job fails while calling a specific DLC volume, it would require rebuilding when calling it again, causing inconsistencies. It is worth noting that different jobs may also use different volumes. An example being if two `machine` jobs are run in parallel, they [will get different DLC volumes]({{site.baseurl}}/docker-layer-caching/#how-dlc-works).

### How can I delete my DLC cache instance?
{: #how-can-i-delete-my-dlc-cache-instance }
{:.no_toc}

DLC caches are immutable, so they cannot be selectively deleted. However, a cache will be deleted after 3 days of not being used in a project.

### Is DLC guaranteed?
{: #is-dlc-guaranteed }
{:.no_toc}

DLC is not guaranteed. If you are experiencing issues with cache-misses or need high-parallelism, consider try caching using [docker build](https://docs.docker.com/engine/reference/commandline/build/#specifying-external-cache-sources), which you can optionally implement using the [CircleCI Docker orb](https://circleci.com/developer/orbs/orb/circleci/docker#commands-build).

### As an admin, can I see the content of a DLC volume?
{: #as-an-admin-can-i-see-the-content-of-a-dlc-volume }
{:.no_toc}

While you can see what volume is used for each job, at this time, the content is unavailable.

</details>


<details markdown=block>
<summary>キャッシュされた Docker レイヤーを削除するには？</summary>

{% raw %}
Running `docker images --no-trunc --format '{{.ID}}' | xargs docker rmi** or **docker volume prune -f` will delete all of the images and their layers from the volume connected to your job.
{% endraw %}


Because of [how DLC works]({{site.baseurl}}/docker-layer-caching/#how-dlc-works) you might need to leave this command in your config and run several jobs to remove the DLC layers from all volumes associated with your project.

Alternatively, you can use the config below to run a very short job that consumes all 50 DLC volumes and purges docker caches. You can push it to a feature branch without disrupting your main branches:

```yml
version: 2  
 jobs:    
  docker-purge:  
    docker:    
      - image: cimg/base:2020.01    
    parallelism: 50  
    steps:  
      - setup_remote_docker  
      - run: docker volume prune -f
```

If you're running into issues where stale volume caches are causing problems often, then consider using our new [docker registry image cache orb](https://circleci.com/orbs/registry/orb/cci-x/docker-registry-image-cache) as a substitute. It's more suitable for projects that have high concurrency throughput, or jobs that use parallelism due to the limited number of volumes available.

If you notice errors always happen on the same volume, which you can see by checking the "spin up environment" step or "remote docker" please [contact support ](https://support.circleci.com/hc/en-us/requests/new?ticket%5Fform%5Fid=855268)

</details>


<details markdown=block>
<summary>「Error response from daemon: OCI runtime create failed」 エラーを解決する方法</summary>

ジョブでセカンダリ サービス コンテナを追加した際、以下のようなエラーが発生する場合があります。

```
Unexpected environment preparation error: Error response from daemon:   
OCI runtime create failed: container_linux.go:345:   
starting container process caused "process_linux.go:303:   
getting the final child's pid from pipe caused \"EOF\"": unknown
```

This usually occurs due to a bad [command]({{site.baseurl}}/configuration-reference/#docker) being passed to one of the secondary service containers in your job.

このエラー メッセージの原因は、セカンダリ サービス コンテナがクラッシュしたか、予期せず終了したことです。 これは、CircleCI が Docker デーモンから PID を取得できず、エラーが発生して終了したことを意味します。

コンテナを正常にスピンアップするには、コマンドとエントリポイントが正しいことを確認してください。 This can be be tested locally by using the [CircleCI CLI]({{site.baseurl}}/local-cli/#run-a-job-in-a-container-on-your-machine) to run the job locally and ensure Docker spins up all containers successfully. エラーを解決するには、お使いの設定ファイルで定義している Docker イメージのドキュメントを参照して、スピンアップ時に使用できるコマンドを確認してください。

</details>

<details markdown=block>
<summary>ジョブのメモリ使用量を記録する方法</summary>

Docker executor users can output the max memory consumed by a job by adding the following step to their config:

```yml
- run:  
    command: cat /sys/fs/cgroup/memory/memory.max_usage_in_bytes  
    when: always
```

**This step should be added as the last step in your job, to identify the max usage after all of the previous steps have completed.**


**Note:** This will be accurate if the job has one Docker image. [Multiple Docker image builds]({{site.baseurl}}/using-docker/#using-multiple-docker-images) will only report the memory usage of the primary image.

Memory usage will be reported in bytes. 割り当てられた[リソースクラス]({{site.baseurl}}/configuration-reference/#resource%5Fclass)に応じて、ジョブで利用可能なメモリ量を照らし合わせて確認するために、お気に入りの検索エンジンを使って GiB に変換できます。

This can help troubleshoot out-of-memory (OOM) errors.

To log memory usage over time for both Docker and machine executors, you can also add this step as the first step in your job:

```yml
- run:  
    command: |  
      while true; do  
        sleep 5  
        # NOTE: on MacOS, the f argument is not supported.  
        # In this case, you can drop the f argument instead.  
        ps auxwwf  
        echo "======"  
      done  
    background: true
```


Alternatively, we can also take advantage of [the top command](https://man7.org/linux/man-pages/man1/top.1.html) (available on Docker, Machine (Linux) or MacOS executors). This can help show both memory and CPU utilization by individual processes.

```yml
- run:  
    name: Profile CPU and memory every 5s (background)  
    command: |  
      while true; do  
        sleep 5  
        printf "\n\n$(date)\n"  
        top -b -c -n 1  
        echo "======"  
      done  
    background: true
```

**Note** that you have may have to install these tools, or use an alternative command if these tools are not available in the specific Executor.

To get the memory usage of the [Remote Docker environment]({{site.baseurl}}/building-docker-images/#accessing-the-remote-docker-environment), you can pass the ps command **through SSH** with

`ssh remote-docker ps auxwwf`

</details>

# 概要
{: #general }

<details markdown=block>
<summary>CircleCI コンフィグのバリデーション</summary>

## 概要
{: #overview }
{:.no_toc}

If you want to confirm your configuration file is free of syntax, YAML linting issues, etc. config ファイルは、CircleCI のローカル CLI で検証できます。

* Visit <{{site.baseurl}}/local-cli> and install the CLI
* Run **`circleci config validate`**in your project's root directory

## トラブルシューティング
{: #troubleshooting }
{:.no_toc}

* コンフィグファイルが、正しいディレクトリ **`.circleci/config.yml`** にあることを確認します
* Run **`circleci version`** and share your issue with [support@circleci.com](mailto:support@circleci.com)

If you're still experiencing issues, please submit a support ticket to [support@circleci.com](mailto:support@circleci.com)

</details>


<details markdown=block>
<summary>Ignoring A Failure In A Step</summary>

In some instances, you may need a job to continue running even if a step returns a non zero exit code. This could be due to a subsequent dependant job in a workflow, or that the success of a step is not a contributing factor to the success of your pipeline.

_Note: Use the following with caution. Ensure you absolutely need this functionality for the particular step, otherwise failures in your jobs may go unnoticed which may have knock-on effects._

The easiest way to implement this is to set up the step as follows:

```yml
- run: my_cool_command || true
```

This ensures that the step always returns a zero exit code, regardless of if the command fails or not.

If you have a mutli-line command, or a script file, then you may consider overriding the default shell options to ensure an exit code zero is passed:

```yml
- run:  
    shell: /bin/bash  
    command: |  
      echo Running my cool command  
      mkdir ~/some_dir  
      my_cool_command
```

For more details on how the default shell options work, and why they have been chosen as the default, please see [our documentation]({{site.baseurl}}/configuration-reference/#default-shell-options).

</details>


<details markdown=block>
<summary>マニフェスト一覧のエントリに、linux/amd64 用のマニフェストが存在しない</summary>

"環境のスピンアップ" 手順、またはリポジトリから Docker イメージをプルする別の場所で、次のようなエラーが発生することがあります。

```
Step 1/26 : FROM <IMAGE>
latest: Pulling from library/<IMAGE>
no matching manifest for linux/amd64 in the manifest list entries
Exited with code 1
```

このエラーには、3 つの原因が考えられます。

1. **Error When Using "Latest" Tag**  
   While images are rebuilding on Dockerub, the "latest" tag will become momentarily unavailable while updating. この問題は自然に解決するか、バージョン付きタグを選択することで低減できます。
2. **The Tag Is Not Available**  
   A tag that used to be available may no longer be listed or have had it's naming convention modified. 例えば、これまで "Version8.0" だったタグが、"Version8.0.0" に変更された可能性があります。
3. **Image Is Not Designed For x86, Such As ARM**  
   The image you are trying to build may be designed to run on a different architecture, such as an ARM-based CPU. If you need to use an Arm image, consider using an [Arm resource class](https://github.com/CircleCI-Public/arm-preview-docs).

</details>

# General / JavaScript & Node.js
{: #general-javascript-and-nodejs }{: #quickstart-demo-javascript-nodejs-reference-project }

<details markdown=block>
<summary>Node の最大メモリを増やす方法</summary>

一部の 64 ビットシステムでは、Node が使用できる最大メモリ容量は、デフォルトで 2GB 未満です。 このため、CircleCI を実行するときに、予期しないメモリの問題が発生することがあります。 次のように、コマンドラインフラグを Node に渡して、最大メモリ容量を調整できます。

`--max-old-space-size=<memory in MB>`

このフラグは使用されているか確認することが難しい場合があります。 特に Node プロセスがフォークされている場合、確認が困難になります。 すべての Node プロセスでこの設定がピックアップされるようにする最善の方法は、環境変数にこの設定を適用することです。これは、Node 8 以降のバージョンで適用できます。

`NODE_OPTIONS=--max-old-space-size=4096`

_**Note**: If you have specified `export NODEOPTIONS=<value>` in your `package.json`, it'll override what you set in the `NODEOPTIONS` environment variable in the `config.yml` (either at the container, job, or step respective level)_

**関連情報**

<https://futurestud.io/tutorials/node-js-increase-the-memory-limit-for-your-process>

<https://stackoverflow.com/questions/48387040/nodejs-recommended-max-old-space-size/48392705>

</details>

# Github
{: #github }

<details markdown=block>
<summary>GitHub リポジトリから CircleCI webhook とデプロイキーを手動で削除してビルドを停止する方法</summary>

プロジェクトの設定ページに移動し、[Stop Building] ボタンをクリックすると、CircleCI でプロジェクトのビルドをいつでも停止できます。


![Fig_A.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/stop_building_0.png)

In the event you are for some reason unable to stop building, you can always manually stop building by removing access to the repository from GitHub.

Some reasons you may potentially need to do this:

* 組織、ユーザー名、またはリポジトリの名前を変更した。
* User credentials have become stale

1\. 最初に GitHub のリポジトリ設定にアクセスします。 You can visit this directly by navigating to _https://github.com/Org/Repository_ and clicking the "settings" button on the repository page.

![Fig_B.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/stop_building_1.png)

2\. 設定ページの縦のナビゲーションの左側にある [Webhooks] と [Deploy keys] の 2 つのページを使用します。

![Fig_C.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/stop_building_2.png)

3\. [Webhooks] ページで、CircleCI にポストするすべての Webhook を見つけて削除します。

![Fig_D.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/stop_building_3.png)

4\. 最後に、[Deploy keys] ページに移動し、CircleCI によって追加されたキーを削除します。

![Fig_E.jpg]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/stop_building_4.png)

これにより、アクセス権を手動で削除する必要がある場合、プロジェクトは CircleCI でビルドされなくなります。

</details>

<details markdown=block>
<summary>GitHub SSH Deprecation Information & Resolutions</summary>

[On March 15th, 2022 GitHub will be deprecating the types of SSH keys that can be utilized to access their service. ](https://github.blog/2021-09-01-improving-git-protocol-security-github/ "https://github.blog/2021-09-01-improving-git-protocol-security-github/")With this deprecation, there are circumstances that could cause your builds to fail on the repository checkout step after the 15th.

**If you meet one of the following criteria, you will need to take action before March 15th, 2022:**

1. Project created between Nov 2nd, 2021 - January 13th, 2022 that has a job using an Ubuntu 14.04-based machine image, including the default `machine: true` image \- If you don’t [specify a machine image]({{site.baseurl}}/configuration-reference/#available-linux-machine-images), you are using the default image and you’ll need to take action
2. Project created between Nov 2nd, 2021 - January 13th, 2022 using [deprecated Docker image]({{site.baseurl}}/next-gen-migration-guide/#overview "{{site.baseurl}}/next-gen-migration-guide/#overview")
3. Project using an uploaded DSA SSH key for checkout purposes

If you meet one of the above, there are sections below that will cover the steps needed to ensure builds continue to run after March 15th, 2022.

**You are not affected by the deprecation, if your project meets one of these criteria:**

1. Your project was set up **before** November 2nd, 2021.
2. Your project was set up **after** January 13th, 2022.
3. Generated a new user/deploy key **after** January 13th, 2022 and it is your "PREFERRED" key

If your project falls under one of the three items listed directly above, you shouldn't need to take any action before March 15th, 2022\. However, if you wish to verify you can check if your key is `ed25519` with the following API call:

<https://circleci.com/docs/api/v2/#operation/listCheckoutKeys>

```sh
curl --request GET \
  --url https://circleci.com/api/v2/project/gh/ORG/PROJECT/checkout-key \
  --header 'Circle-Token: '
```

If the above returns any `items` that have a `"public_key" : "ssh-rsa`, and your project was created between November 2nd, 2021 - January 13th, 2022, you will want to ensure you are using a newer image (convenience image or machine image) or you’ll want to regenerate your user/deploy key. If all the keys returned, or your "PREFERRED" key is `"public_key" : "ssh-ed25519` then no action should be needed.

Depending on your situation, different actions may be required. If you want to find out the OpenSSH version for the image you are utilizing in a job you can run the following:

```
run: ssh -V
```

## Jobs using `machine: true` or specifying a `14.04 ubuntu` Machine image
{: #jobs-using-machine-true-or-specifying-a-1404-ubuntu-machine-image }
{:.no_toc}

You can tell if you fall into this category if any of your jobs look like this:

```yml
jobs:
  build:
    machine: true # This is using the default old machine image
    steps:
      - checkout
```

Or it may look like this which is an example of a 14.04 based image:

```yml
jobs:
  build:
    machine:
      image: circleci/classic:201709-01 # This is a 14.04 based image
    steps:
      - checkout
```

Additionally, you can search via GitHub for these image uses too:

org:CircleCI-Public circleci/classic path:.circleci filename:config.yml

The following options are available, [given the deprecation of older images](https://discuss.circleci.com/t/old-linux-machine-image-remote-docker-deprecation/37572 "https://discuss.circleci.com/t/old-linux-machine-image-remote-docker-deprecation/37572"), **our recommendation is to update your image**. However, all options listed will solve the issue at hand.

1. Update to a [newer machine image]({{site.baseurl}}/configuration-reference/#available-linux-machine-images "{{site.baseurl}}/configuration-reference/#available-linux-machine-images") any listed on that page have the proper items installed
2. Regenerate your deploy/user key in your project settings
   1. This can be done via the UI (Project Settings → SSH Keys → Click `X` on the current key)
         1. Once that is done, you’ll click “Add Deploy key” or “Add User key” depending on which type of key you removed
   2. This can also be done [via the API](https://circleci.com/docs/api/v2/#operation/createCheckoutKey "https://circleci.com/docs/api/v2/#operation/createCheckoutKey")
3. Add a `run` step before your `- checkout` step that installs OpenSSH 7.2 or greater, as an example, this would install OpenSSH 8.1p1:

```yml
jobs:
  jobname:
    machine: true
    steps:
      - run:
          name: Install OpenSSH 8.1p1
          command: |
            sudo apt-get update
            mkdir ~/tempdownload; 
            cd ~/tempdownload; 
            wget https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-8.1p1.tar.gz; 
            tar zxvf openssh-8.1p1.tar.gz; 
            cd openssh-8.1p1 && ./configure && make && sudo make install
      - checkout
```

## Jobs using `circleci` convenience images (i.e. `circleci/ruby:2.2.6`)
{: #jobs-using-circleci-convenience-images-ie-circleciruby226 }
{:.no_toc}

The following options are available, given the support for the legacy `circleci` images is going away, the preferred option is to update your image. However, all options listed will solve the issue at hand.

1. Update to a [next-gen convenience image]({{site.baseurl}}/next-gen-migration-guide/#overview "{{site.baseurl}}/next-gen-migration-guide/#overview"), all next-gen images have the proper items installed
2. Regenerate your deploy/user key in your project settings
   1. This can be done via the UI (Project Settings → SSH Keys → Click `X` on the current key)
         1. Once that is done, you’ll click “Add Deploy key” or “Add User key” depending on which type of key you removed
   2. This can also be done [via the API](https://circleci.com/docs/api/v2/#operation/createCheckoutKey "https://circleci.com/docs/api/v2/#operation/createCheckoutKey")
3. Add a `run` step before your `- checkout` step that installs OpenSSH 7.2 or greater, as an example, this would install OpenSSH 8.1p1:

```yml
jobs:
  jobname:
    docker:
      - image: circleci/ruby:2.2.6
    steps:
      - run:
          name: Install OpenSSH 8.1p1
          command: |
            sudo apt-get update
            mkdir ~/tempdownload; 
            cd ~/tempdownload; 
            wget https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-8.1p1.tar.gz; 
            tar zxvf openssh-8.1p1.tar.gz; 
            cd openssh-8.1p1 && ./configure && make && sudo make install
      - checkout
```

## Jobs using [custom]({{site.baseurl}}/custom-images/ "{{site.baseurl}}/custom-images/") or non-circleci Docker images
{: #jobs-using-customhttpscirclecicomdocs20custom-images-httpscirclecicomdocs20custom-images-or-non-circleci-docker-images }
{:.no_toc}

If the docker image you are utilizing has OpenSSH 7.2 or greater, and `git` installed, you do not need to make any changes. With both those requirements met, you’ll have no issues with the deprecation. In addition, if your image has _neither_ installed, you'll also not be affected as we'll take care of the checkout process on our side.

With the above in mind, you'll really only be affected on your custom docker images if you specifically installed an old OpenSSH version.

1\. Regenerate your deploy/user key in your project settings

* This can be done via the UI (Project Settings → SSH Keys → Click `X` on the current key)
   * Once that is done, you’ll click “Add Deploy key” or “Add User key” depending on which type of key you removed
* This can also be done [via the API](https://circleci.com/docs/api/v2/#operation/createCheckoutKey "https://circleci.com/docs/api/v2/#operation/createCheckoutKey")

2\. Add a `run` step before your `- checkout` step that installs OpenSSH 7.2 or greater, as an example, this would install OpenSSH 8.1p1:

```yml
jobs:
  jobname:
    docker:
      - image: koalaman/shellcheck-alpine:v0.7.1
    steps:
      - run:
          name: Install OpenSSH 8.1p1
          command: |
            sudo apt-get update
            mkdir ~/tempdownload; 
            cd ~/tempdownload; 
            wget https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-8.1p1.tar.gz; 
            tar zxvf openssh-8.1p1.tar.gz; 
            cd openssh-8.1p1 && ./configure && make && sudo make install
      - checkout
```

3\. If `git` is not installed on the image, you’ll need to install that before the `- checkout` step, an example of doing that here:

```yml
- run:
      name: Install git for checkout
      command: |
          apt-get update && apt-get --no-install-recommends -y install git
```

4\. Swap to a different image, or build a custom image, that has both the proper OpenSSH version and `git` installed -- or one that doesn't have either installed.

## Projects with manually uploaded DSA or RSA SHA1 SSH keys
{: #projects-with-manually-uploaded-dsa-or-rsa-sha1-ssh-keys }
{:.no_toc}

If you [manually uploaded an SSH key]({{site.baseurl}}/add-ssh-key/#overview) to use for checkout purposes, and that key is DSA, you’ll need to update the key to have it continue to work.

You’ll want to generate a new SSH key, [meeting the requirements set forth by GitHub](https://github.blog/2021-09-01-improving-git-protocol-security-github/), and add and use that key within CircleCI.

If the key you manually uploaded was RSA SHA1:

1. As long as the docker or machine image you are using is new enough, you’ll be able to continue to use the key. The image needs to have OpenSSH 7.2 or greater installed, you can check using the following command in the job using that image: `- run: ssh -V`
2. Alternatively, if the image you are using is older or you can’t update it, you’ll want to generate a new SSH key, [meeting the requirements set forth by GitHub](https://github.blog/2021-09-01-improving-git-protocol-security-github/), and add and use that key within CircleCI.

Mass regeneration of checkout keys

For organizations that have a lot of projects, and the option you are proceeding with is regenerating your keys, we have created a script to help with that process:

<https://github.com/CircleCI-Public/github-ssh-regeneration>

You will want to ensure that the person who runs this script, AKA the personal API key used, has the proper access to generate keys for the repositories. [That likely means an Organization Owner/Admin](https://support.circleci.com/hc/en-us/articles/360034990033-Am-I-an-Org-Admin-).

</details>


<details markdown=block>
<summary>Github Webhook デリバリーの確認方法</summary>

リポジトリへプッシュしても CircleCI でパイプラインが実行されない場合、GitHub で Webhook を確認することをおすすめしています。

## Webhook とは？
{: #what-is-a-webhook }
{:.no_toc}

コミットをプッシュするたびWebhook が CircleCI に送信され、CircleCIがそのWebhookのもとにアクションを実行しています。 GitHub will send us a packet of information about your project when a number of events occur, a _"_ _push"_ being the most popular.

[GitHub 開発者向けドキュメント | Webhook](https://docs.github.com/en/developers/webhooks-and-events/about-webhooks)

## Webhook の確認方法
{: #how-to-find-your-webhooks }
{:.no_toc}

1. リポジトリの設定ページに移動します。
2. Select "**Webhooks**"in the left menu. (Alternatively, you can reach this page directly -> _https://github.com/<ORG>/<REPO>/settings/hooks)_
3. You should now see a page similar to the following:

![GH repo settings]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/view_webhook_1.png)

4. From here, click on the CircleCI webhook URL, and scroll down to "**Recent Deliveries**".

![CircleCI webhook url recent deliveries]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/view_webhook_2.png)

5. Click on any entry to view the delivery details. This will show the Headers and Payload of the webhook.

![GH repo settings]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/view_webhook_3.png)

The **X-GitHub-Delivery** value (which is the same as the id you clicked on to open this delivery) is useful for tracking your webhook. Support can use this to do further investigation if needed.

In the **Payload** section under the **SHA** value, you can find the commit hash to ensure the webhook is referring to the correct commit.

You can also check the response back from CircleCI when GitHub sent the response. Switch from the "**Request**" tab to the "**Response**" tab. If you see a "200" response, your WebHook was delivered successfully.

![GH repo settings]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/view_webhook_4.png)

</details>

<details markdown=block>
<summary>My GitHub organization is not listed</summary>

## 1\. Check oAuth app access restrictions
{: #1-check-oauth-app-access-restrictions }
{:.no_toc}

Check to make sure CircleCI is enabled in your GitHub organization third-party app restrictions in your **Organization Settings**. You can read more about these restrictions on the GitHub docs page.

<https://help.github.com/articles/about-oauth-app-access-restrictions/>

![org not listed]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/org_not_listed.png)


## 2\. Check the application page on GitHub
{: #2-check-the-application-page-on-github }
{:.no_toc}

You may also need to enable CircleCI on the individual application page. You can do so with the following steps:

* Go to <https://circleci.com/account> and click the blue **check permissions** link in the GitHub section.
* This will take you to the app page on GitHub where you can **grant permissions** to CircleCI in the **Organization Access** section at the bottom.

</details>


<details markdown=block>
<summary>How to push a commit back to the same repository as part of the CircleCI job</summary>

You may have a use case for creating a new commit and pushing it to the same repository as part of your CircleCI job.

## Configuration Steps
{: #configuration-steps }
{:.no_toc}

Here is how you can configure your CircleCI project to enable the above-mentioned use case.

1) Decide if you wish to configure the project with a user key generated by CircleCI or a manually-created read-write deployment key

1a) If you wish to use a user key, simply visit <https://app.circleci.com/settings/project/:vcs-type/:org-name/:project-name/ssh>[ ](https://circleci.com/:vcs-type/:org-name/:project-name/edit#checkout)and click on the "Authorize with GitHub" button.

1b) If you wish to use a read-write deployment key, follow the steps here to create it and configure the project so that the key has write permissions for it: <{{site.baseurl}}/gh-bb-integration/#creating-a-github-user-key> or <{{site.baseurl}}/gh-bb-integration/#creating-a-bitbucket-user-key> for Bitbucket users

## Common Issues:
{: #common-issues }
{:.no_toc}

1) "\*\*\* Please tell me who you are." error message upon running "git commit"

In your CircleCI configuration file (config.yml), you might have to add commands to configure an email and user name with \`git config\` prior to running \`git commit\`, e.g.

git config user.email "username@mydomain.com"  
git config user.name "My Name"


2) Running git push results in "ERROR: The key you are authenticating with has been marked as read only."

The deploy key that the project is configured with, by default when you add a project on CircleCI, only has read access, so a key with write permissions needs to be configured to be used, to avoid the above error message. Please ensure that a user key or a read-write deployment key has been configured for the project (See "Configuration Steps" above).

If you are using a read-write deployment key, please add an [add\_ssh\_keys]({{site.baseurl}}/configuration-reference/#add%5Fssh%5Fkeys) step to your configuration. The fingerprints value should match what is shown on [https://circleci.com/:vcs-type/:org-name/:project-name/edit#ssh](https://circleci.com/:vcs-type/:org-name/:project-name/edit#checkout)

3) How to stop your generated commits from triggering new builds

To prevent a commit from triggering a new build, add "\[skip ci\]" to the commit message. For more details, see: <{{site.baseurl}}/skip-build/#skipping-a-build>

</details>

<details markdown=block>
<summary>Troubleshooting CircleCI access after enabling Github SSO</summary>

A GitHub organization owner can[ enable SAML protection](https://docs.github.com/en/organizations/managing-saml-single-sign-on-for-your-organization/about-identity-and-access-management-with-saml-single-sign-on) for their org, which requires members to authenticate via SSO (e.g. Okta) before they are able to access any resources associated with that organization. When SSO/SAML protection is enabled, previously issued OAuth tokens for applications such as CircleCI become invalid for that organization, and future user GitHub authentication to CircleCI without an active SAML session will result in a loss of access to protected orgs.

When CircleCI attempts to fetch the `config.yml of a project or read other org resources on behalf of a user, and that user has not authorized access to the SAML-protected org as part of the GitHub OAuth flow (see below), the operation will fail. This can impact UI/API interactions, as well as pipeline creation. In the case of VCS-initiated pipelines, GitHub will show a successful webhook delivery in the repository settings, but CircleCI will not be able to fetch the config and a pipeline will not be created.

The solution to this problem is for the user to revoke their CircleCI credentials in GitHub and then re-authenticate via the login flow (or, for email+password users, by re-connecting their GitHub account in [User Settings](https://app.circleci.com/settings/user) \-> Account Integrations). Follow these steps:

1. Go to your personal OAuth application settings for CircleCI: [CircleCI OAuth App ](https://github.com/settings/connections/applications/78a2ba87f071c28e65bb)
2. Click “Revoke access” and confirm.
3. Go to <https://app.circleci.com> and log out if necessary.
4. Log back in to CircleCI via GitHub (), or after logging in via another means (e.g. email+password), re-connect your VCS identity (<https://app.circleci.com/settings/user>)
   1. When prompted, be sure to click “Authorize” for any SAML-protected orgs you need access to
   2. Click “Continue” to be redirected to CircleCI

It’s important to note that CircleCI only stores a _single_ OAuth token for each GitHub user, _regardless_ of how many orgs they interact within CircleCI. This means that, if a user regularly interacts with multiple orgs, and does not want to re-authenticate when switching between them, it is recommended that they authorize SAML-protected orgs on _every_ re-authentication to CircleCI via GitHub, including when switching devices. This will prevent access-related problems arising from that user’s actions on either platform, e.g. failure to create CircleCI pipelines based when pushing commits.

If you are an org admin and are interested in some preventative steps or how you can avoid common pitfalls when you set up GitHub SSO, check out [this article here](https://support.circleci.com/hc/en-us/articles/4410418394523).

</details>


<details markdown=block>
<summary>How do I deactivate or remove my account?</summary>

## Overview
{: #overview }
{:.no_toc}

CircleCI connects your GitHub or Bitbucket account to our system when granting access to the VCS of your choice.

If you no longer want to build on CircleCI, visit your projects page and unfollow all projects. Your account will no longer be active.

## Delete account
{: #delete-account }
{:.no_toc}

If you would like full deletion of your account, please submit a [support ticket](https://support.circleci.com/hc/en-us) or contact [privacy@circleci.com](mailto:support@circleci.com).

You will want to confirm the following:

* Unfollow all projects and stopped building on CircleCI
* Delete all webhooks from your VCS provider pointing to CircleCI
* Cancel all plans including [GitHub Marketplace plans](https://help.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/canceling-a-github-marketplace-app)

Once we receive your ticket, we will be sending you an email confirming that we have received your request and asking you to confirm the deletion of your account or organization or both.

Please reply to the email as soon as possible so that we can begin the deletion process.

**Below is an example email template**.


> Hi,
> 
> We have received your Data Deletion Request. Please respond to the following questions, accordingly.`
> 
> As a part of our data deletion process, we ask that you respond to this message confirming you are requesting the full deletion of one or all of the following:
> 
> * Organization or Account or Both: ______
> 
> Can you:
> 
> * Confirm if you would like to delete an Organization. `If so, please provide the Organization Name (case-sensitive) here and indicate if GitHub, Bitbucket, or both: _______`
> 
> * Confirm if you would like to delete an account, if so please provide your associated email address and VCS username, indicating if it is Github or Bitbucket: _______
> 
> If you are only requesting to be unsubscribed from marketing e-mails, please do confirm that you would not like any data deleted but are unsubscribing.
> 
> Best regards,

**Note**: In case, we don't receive a reply, the ticket will be closed automatically and we won't be able to delete the account.

</details>


<details markdown=block>
<summary>How to Refresh User Permissions?</summary>

If you are experiencing permissions issues or recently updated permissions via your VCS provider, you might need to refresh your user permissions. The following guide will share several troubleshooting methods to refresh your permissions.

Revoke and re-create your Oauth Token - Please be sure to complete **all** of the following steps:

1. Sign out of your CircleCI account
2. Revoke CircleCI's access in [Bitbucket](https://bitbucket.org/account/settings/app-authorizations/) or [GitHub](https://github.com/settings/applications)
3. Clear your browser's cache and cookies
4. Sign back into your CircleCI account
5. Refresh permissions at <https://app.circleci.com/settings/user>

![refresh permission]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/refresh_permission.png)

If you still have any issues, please submit a ticket to [Support](https://support.circleci.com/hc/en-us) or write to [support@circleci.com](mailto:support@circleci.com).

</details>


<details markdown=block>
<summary>How to perform a full re-authentication</summary>

As a solution to various issues (including [unauthorized](https://support.circleci.com/hc/en-us/articles/360050273651-Builds-Unauthorized-due-to-contexts) or blocked builds, [organization is not listed](https://support.circleci.com/hc/en-us/articles/115014599088-My-GitHub-organization-is-not-listed), ...etc), and in case [refreshing permissions](https://support.circleci.com/hc/en-us/articles/360048210711-How-to-Refresh-User-Permissions-) didn't solve the issue, CircleCI Support might suggest a full re-authentication.

Depending on the VCS you're using ([GitHub](#h%5F01ENQJ8A7ZTV38JV7NHCHKE51D) or [Bitbucket](#h%5F01ENQJ8A7ZTV38JV7NHCHKE51D)), you can perform this operation as outlined below.

**NOTE: Taking the steps below will clear any [user keys]({{site.baseurl}}/gh-bb-integration/#deployment-keys-and-user-keys) that have been generated for any of your projects.**

### GitHub users
{: #github-users }
{:.no_toc}

1. Sign out of your CircleCI account
2. Revoke CircleCI's access in GitHub > <https://github.com/settings/applications>
3. Clear your browser's cache and cookies
4. Sign back into your CircleCI account

### Bitbucket users
{: #bitbucket-users }
{:.no_toc}

1. Sign out of your CircleCI account
2. Revoke CircleCI's access in Bitbucket > <https://bitbucket.org/account/settings/app-authorizations/>
3. Clear your browser's cache and cookies
4. Sign back into your CircleCI account

</details>

# Login/Permissions
{: #loginpermissions }

<details markdown=block>
<summary>Permission Denied When Creating Directory or Writing a File</summary>

If you receive an error telling you that you do not have permissions to create a directory or to write a file to a directory then this is likely an indication that your script is attempting to write to a directory that the user running the build does not own.

This is a somewhat common pitfall that many users run into when the move into a CI environment.

The key thing to remember is that the builds run as the `distiller` user on MacOS builds and typically `ubunutu` on Linux builds. These users only have write permissions in their `$HOME` folders and places like `/tmp`. This is not unique to CI, this is true by default in almost all Linux/Unix environments.

To confirm which user your build runs as you can run the `whoami` command as a part of your build process.

Solution

1. Store things inside of a folder that the user running the build has permissions to.
2. Change the ownership of the directory with the `chown` command before trying to write to it.

We recommend the first solution. If you decide to go with the second solution then a command like this should work in both MacOS and Linux builds.

`chown -R $USER:$USER /path/to/directory`

`$USER` is a global environment variable that refers to the current logged in user.

`/path/to/directory` should be replaced with the path to where you want to write to.

</details>


<details markdown=block>
<summary>How to: Add a user to your account</summary>

When you have a user in your organization who hasn't built on CircleCI before, the first thing they need to do is register on CircleCI. This only involves authenticating their VCS username (GitHub or Bitbucket) on our platform, but this gives CircleCI the permissions to identify the user and associate their builds with them.

CircleCI recognizes users as whomever triggers a build by committing on GitHub. 特定のユーザーにシートを割り当てる必要はありません。 GitHub からビルドをトリガーするだけで、新しいユーザーは、追加されたユーザーシートを要求できます。 They should then be included on the active user list on your Plan Usage page under the Users tab: app.circleci.com/settings/plan/\[githubORbitbucket\]/\[orgname\]/usage

</details>

# MacOS
{: #macos }

<details markdown=block>
<summary>Xcode 12.5 - Unable to build chain to self-signed root for signer</summary>

If you are utilizing our macOS executors and building on Xcode 12.5+ and not using Fastlane match for your signing, you may encounter an error that looks like:

Warning: unable to build chain to self-signed root for signer "Apple Development: XXXXXXX"

By default, we have the proper certificates on the image, however, if you aren't using the `setup_circle_ci` task in your Fastfile and [Fastlane match]({{site.baseurl}}/testing-ios/#code-signing-with-fastlane-match) then they won't be properly applied to your build.

You have two options for resolving this issue, the first would be to follow the above documentation and implement Fastlane match.

If the above isn't an option, then you can update your Fastfile to include the following:

```
import_certificate(
certificate_path: "AppleWWDRCAG3.cer",
keychain_path: "/Users/distiller/Library/Keychains/fastlane_tmp_keychain-db",
keychain_password: ""
)
```

Then download the certificate from the following:

<https://developer.apple.com/support/expiration/>

Then include it in the project's root. Afterward, it can be imported into the temp Fastlane keychain.

</details>


<details markdown=block>
<summary>fastlane gym failed with "** ARCHIVE FAILED **" error message (exit status 65)</summary>

It is difficult to find out the issue from the above error message alone, as the [exit code 65](https://circleci.com/blog/xcodebuild-exit-code-65-what-it-is-and-how-to-solve-for-ios-and-macos-builds/) is used as a general xcodebuild error code. Hence there could be many reasons why the build failed at the archive step.

You can try the following steps to troubleshoot this problem.

1. Check your [Code Signing setting](https://support.circleci.com/hc/en-us/articles/115015983028)
2. Check your environment variables. (For example: Build Number) If the build succeeds on your local machine but fails in the CI environment, there could be environment variables defined on the local machine, but not made available to builds on CircleCI, causing the build to fail.
3. Check fastlane's log for more information about why the fastlane command failed. Provisioning profileが存在しないなど、エラーの根本原因に関する情報がログに含まれている場合があります。 The log path is printed in the output of the fastlane command, for example: /Users/distiller/driver-application/buildlogs/gym/DriverApplication-DriverApplication.log You could either SSH into a rebuild to access the log or upload the file as an [artifact]({{site.baseurl}}/artifacts/#uploading-artifacts).
4. Check if Xcode SDK version should be defined in the gym configuration in the Fastfile

```
    gym(
      sdk: "iphoneos11.4"
    )
```

(Setting the sdk option results in the -sdk argument being specified in the xcodebuild command that fastlane uses)

</details>

# Pipelines, Workflows, and Jobs
{: #pipelines-workflows-and-jobs }

<details markdown=block>
<summary>Conditional steps in jobs and conditional workflows</summary>

With the [recent addition of advanced logic in a config file](https://discuss.circleci.com/t/advanced-logic-in-config/36011), the option to conditionally trigger steps in a job or to conditionally trigger a workflow is now available.

[Specific logic statements can be used]({{site.baseurl}}/configuration-reference/#logic-statements) to create multiple nested conditions, that will always at the top level result in `true` or `false` \-- which in turn determines if the workflow or steps are triggered.

### Job Step Example
{: #job-step-example }
{:.no_toc}

```yml
- when:
    condition:
      or:
        - and:
          - equal: [ main, << pipeline.git.branch >> ]
          - or: [ << pipeline.parameters.param1 >>, << pipeline.parameters.param2 >> ]
        - or:
          - equal: [ false, << pipeline.parameters.param1 >> ]
    steps:
      - run: echo "I am on main AND param1 is true OR param2 is true -- OR param1 is false"
```

### Workflow Example
{: #workflow-example }
{:.no_toc}

```yml
workflows:
  conditional-workflow:
    when:
      and: # All must be true to trigger
        - equal: [ main, << pipeline.git.branch >> ]
        - not: << pipeline.parameters.param1 >>
        - or: [ << pipeline.parameters.param1 >>, << pipeline.parameters.param2 >> ]

    jobs:
      - job-on-condition
```

Conditions can be nested in an arbitrary fashion, according to their argument specifications, and to a maximum depth of 100 levels. This allows for some complex logic, as an example of multiple nested conditions:

```yml
- when:
    condition:
      or:
        - and:
          - or:
              - and:
                  - equal: [ main, << pipeline.git.branch >> ]
                  - equal: [ false, << pipeline.parameters.param1 >> ]
              - or:
                  - not: << pipeline.parameters.param3 >>
          - or:
              - equal: [ false, << pipeline.parameters.param3 >> ]
              - or: [ << pipeline.parameters.param1 >>, << pipeline.parameters.param2 >> ]  
        - or:
            - equal: [ true, << pipeline.parameters.param4 >> ]

    steps:
      - run: echo "param 4 is true OR the other nested conditions are true"
```

</details>


<details markdown=block>
<summary>Filter workflows by branch</summary>

You can filter your workflows to run on specific branches by adding the **filters** key to the job name in your **workflows** section.

```yml
workflows:  
    build:  
      jobs:  
        - test:  
            filters:  
              branches:  
                only:  
                  - main
```

It can also be used to prevent later jobs unless they are running on a specific branch

```yml
workflows:  
  build:  
    jobs:  
      - test  
      - deploy:  
          requires:  
            - test  
          filters:  
            branches:  
              only:  
                - main
```

[Click here for full documentation on job branch filtering]({{site.baseurl}}/configuration-reference/#filters-1)

</details>

# Settings
{: #settings }

<details markdown=block>
<summary>How to insert files as environment variables with Base64</summary>

If you need to insert sensitive text-based documents or even small binary files into your project in secret it is possible to insert them as an environment variable by leveraging base64 encoding.

[Base64](https://en.wikipedia.org/wiki/Base64) is an encoding scheme to translate binary data into text strings. These values can be added to [a context]({{site.baseurl}}/contexts/) or inserted as [an environment variable]({{site.baseurl}}/env-vars/) and decoded at runtime.

Environment variables can be configured in the UI under "Project Settings":

![project settings env var ]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/base_encode_1.png)

While contexts can be configured under "Organization Settings":

![org-settings-contexts-v2.png]( {{ site.baseurl }}/assets/img/docs/troubleshooting_images/base_encode_2.png)

You can encode a file via your command line terminal by feeding it directly to base64.

`base64 [option] [file]`

[Here is the MAN documentation for base64](https://linux.die.net/man/1/base64).

_Note_ If you are encoding a file (whether it be a large file or a "binary") for use as a CircleCI environment variable, you should pass the `-w 0` option to the command so newlines aren't present in the resulting base64, which will be converted to spaces when added to CircleCI.

To then decode the base64 file from within your container you can run the decode option.

`base64 --decode [file]`

If your file is stored as an environment variable, you can pipe it directly to the base64 command to be decoded, storing the result in a file

echo "$ENV_VARIABLE_NAME" | base64 --decode > filename.txt

For more information, you can read about [base64 encoding and decoding variables within a config in our docs]({{site.baseurl}}/env-vars/#encoding-multi-line-environment-variables).

</details>


<details markdown=block>
<summary>How to set up a VPN connection during builds</summary>

**In case you need to connect to a private network during your builds, or if you want to restrict access to your environment to a specific IP address, we suggest configuring a VPN connection as follows.**

_**Note that you must use one of the following executors:**_

* [machine](#h%5F01F3THFAZEDDNM5FGE00471E2N)
* [macOS](#h%5F01F3THFMEAY31K30ZKP3M0RVZ7)
* [windows](#h%5F01F7XH9G40MXW14H2GFHRD8XXJ)

## `machine` \[Linux\] executor ([Available machine images]({{site.baseurl}}/configuration-reference/#available-linux-machine-images))
{: #machine-linux-executor-available-machine-imageshttpscirclecicomdocs20configuration-referenceavailable-machine-images }
{:.no_toc}

* [OpenVPN (2.x)](#openvpn)
* [OpenVPN Connect (OpenVPN 3)](#h%5F01F3TBTKPEDA8RBAQCVVZNG0T6)
* [L2TP](#l2tp)

#### **OpenVPN (2.x)**
{: #openvpn-2x }
{:.no_toc}

* Base64-encode the OpenVPN client configuration file, and store it as an [environment variable]({{site.baseurl}}/env-vars/).
* If the VPN client authentication is credentials-based (user-locked profile), you'll also need to add the username and password as environment variables (`VPN_USER` and `VPN_PASSWORD`).

```yml
version: 2.1
workflows:
  btd:
    jobs:
      - build
jobs:
  build:
    machine:
      image: ubuntu-2004:202201-02
    steps:
      - run:
          name: Install OpenVPN
          command: |
            sudo apt-get update
            sudo apt-get install openvpn openvpn-systemd-resolved  

      - run:
          name: Check IP before VPN connection
          command: |
            ip a
            echo "Public IP before VPN connection is $(curl checkip.amazonaws.com)"  

      - run:
          name: VPN Setup
          background: true
          command: |
            echo $VPN_CLIENT_CONFIG | base64 --decode > /tmp/config.ovpn  

            if grep -q auth-user-pass /tmp/config.ovpn; then  
              if [ -z "${VPN_USER:-}" ] || [ -z "${VPN_PASSWORD:-}" ]; then  
                echo "Your VPN client is configured with a user-locked profile. Make sure to set the VPN_USER and VPN_PASSWORD environment variables"  
                exit 1  
              else  
                printf "$VPN_USER\\n$VPN_PASSWORD" > /tmp/vpn.login  
              fi  
            fi  

            SYS_RES_DNS=$(systemd-resolve --status | grep 'DNS Servers'|awk '{print $3}')  
            echo $SYS_RES_DNS  

            phone_home=$(ss -Hnto state established '( sport = :ssh )' | head -n1 | awk '{ split($4, a, ":"); print a[1] }') || $(sudo netstat -an | grep ':22 .*ESTABLISHED' | head -n1 | awk '{ split($5, a, ":"); print a[1] }')  
            echo $phone_home  

            vpn_command=(sudo openvpn  
              --config /tmp/config.ovpn  
              --route $SYS_RES_DNS 255.255.255.255 net_gateway  
              --route 169.254.0.0 255.255.0.0 net_gateway  
              --script-security 2  
              --up /etc/openvpn/update-systemd-resolved --up-restart  
              --down /etc/openvpn/update-systemd-resolved --down-pre  
              --dhcp-option DOMAIN-ROUTE .)  

            if grep -q auth-user-pass /tmp/config.ovpn; then
              vpn_command+=(--auth-user-pass /tmp/vpn.login)
            fi  

            if [ -n "$phone_home" ]; then  
              vpn_command+=(--route $phone_home 255.255.255.255 net_gateway)  
            fi  

            for IP in $(host runner.circleci.com | awk '{ print $4; }')  
              do  
                vpn_command+=(--route $IP 255.255.255.255 net_gateway)  
                echo $IP  
            done  

            "${vpn_command[@]}" > /tmp/openvpn.log  

      - run:
          name: Wait for the connection to be established and check IP  
          command: |  
            until [ -f /tmp/openvpn.log ] && [ "$(grep -c "Initialization Sequence Completed" /tmp/openvpn.log)" != 0 ]; do  
              echo Attempting to connect to VPN server..."  
              sleep 1;  
            done  

            printf "\nVPN connected\n"  
            printf "\nPublic IP is now $(curl checkip.amazonaws.com)\n"

      - run:
          name: Run commands in our infrastructure
          command: |
            # A command
            # Another command  

      - run:  
          name: Disconnect from OpenVPN  
          command: |  
            sudo killall openvpn || true  
          when: always
```

#### OpenVPN Connect (OpenVPN 3)
{: #openvpn-connect-openvpn-3 }
{:.no_toc}

* Base64-encode the OpenVPN client configuration file, and store it as an [environment variable]({{site.baseurl}}/env-vars/).
* Make sure to [install the proper repository for the Ubuntu release](https://openvpn.net/cloud-docs/openvpn-3-client-for-linux/#installation-for-debian-and-ubuntu) you're using
* With OpenVPN 3 Linux, storing user credentials in a text-based file to use when starting a VPN connection is **unsupported**. Please refer to [this documentation (OpenVPN 3 Linux and --auth-user-pass)](https://openvpn.net/openvpn-3-linux-and-auth-user-pass/) to set up a workaround.

```yml
version: 2.1
workflows:
  btd:
    jobs:
      - build
jobs:
  build:
    machine:
      image: ubuntu-2004:202201-02
    steps:
      - run:
          name: Install OpenVPN
          command: |
            sudo apt update && sudo apt install apt-transport-https  
            sudo wget https://swupdate.openvpn.net/repos/openvpn-repo-pkg-key.pub  
            sudo apt-key add openvpn-repo-pkg-key.pub  

            ### The repository URL will depend on your Ubuntu release name (here we chose "focal" since Ubuntu 20.04 is used  
            sudo wget -O /etc/apt/sources.list.d/openvpn3.list https://swupdate.openvpn.net/community/openvpn3/repos/openvpn3-focal.list  
            sudo apt update && sudo apt install openvpn3  

      - run:
          name: Check IP before VPN connection
          command: |  
            ip a  
            echo "Public IP before VPN connection is $(curl checkip.amazonaws.com)"  

      - run:
          name: VPN Setup
          background: true
          command: |
            echo $VPN_CLIENT_CONFIG | base64 --decode > /tmp/config.ovpn

            ### IMPORTANT: Include the following line to exclude the connection from CircleCI and the link-local range  
            phone_home=$(ss -Hnto state established '( sport = :ssh )' | head -n1 | awk '{ split($4, a, ":"); print a[1] }')  
            ### In case you're using an image with Ubuntu < 20.04, replace the above line with:  
            # phone_home=$(ss -an | grep 'ESTAB .*:22' | head -n1 | awk '{ split($6, a, ":"); print a[1] }')  
            echo $phone_home  

            if [ -n "$phone_home" ]; then
              echo -e "\nroute $phone_home 255.255.255.255 net_gateway" >> /tmp/config.ovpn  
            fi  

            echo "\nroute 169.254.0.0 255.255.0.0 net_gateway" >> /tmp/config.ovpn  

            # This will start the connection  
            sudo openvpn3 session-start --config /tmp/config.ovpn > /tmp/openvpn.log  

      - run:
          name: Wait for the connection to be established and check  
          command: |  
            until sudo openvpn3 sessions-list|grep "Client connected"; do  
              echo "Attempting to connect to VPN server..."  
              sleep 1;  
            done  

            printf "\nPublic IP is now $(curl checkip.amazonaws.com)\n"  

      - run:
          name: Run commands in our infrastructure
          command: |
            # A command
            # Another command  

      - run:  
          name: Disconnect from OpenVPN  
          command: |  
            SESSION_PATH=$(sudo openvpn3 sessions-list | grep Path | awk -F': ' '{print $2}')  
            echo $SESSION_PATH  
            sudo openvpn3 session-manage --session-path $SESSION_PATH --disconnect  
          when: always
```

#### L2TP
{: #l2tp }
{:.no_toc}

To set up an L2TP VPN connection, we recommend referring to [this guide.](https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients.md#configure-linux-vpn-clients-using-the-command-line)

We suggest storing `VPN_SERVER_IP`, `VPN_IPSEC_PSK`, `VPN_USER` and `VPN_PASSWORD` as [environment variables]({{site.baseurl}}/env-vars/). Ideally, you might want to base64-encode `VPN_IPSEC_PSK` before storing it; you'll need to decode it during the build.

Also, we suggest storing the default gateway IP address in an environment variable:

* `DEFAULT_GW_IP=$(ip route show default|awk '{print $3}')`

## `macos` executor ([Supported Xcode versions]({{site.baseurl}}/testing-ios/#supported-xcode-versions))
{: #macos-executor-supported-xcode-versionshttpscirclecicomdocs20testing-iossupported-xcode-versions }
{:.no_toc}

* Base64-encode the OpenVPN client configuration file, and store it as an [environment variable]({{site.baseurl}}/env-vars/).
* If the VPN client authentication is credentials-based (user-locked profile), you'll also need to add the username and password as environment variables (`VPN_USER` and `VPN_PASSWORD`).

```yml
version: 2.1
workflows:
  btd:
    jobs:
      - build
jobs:
  build:
    macos:  
      xcode: "12.2.0"
    steps:
      - run:
          name: Install OpenVPN
          command: |
            brew install openvpn  

      - run:
          name: Check IP before VPN connection
          command: |
            ifconfig
            echo "Public IP before VPN connection is $(curl checkip.amazonaws.com)"  

      - run:
          name: VPN Setup
          command: |
            echo $VPN_CLIENT_CONFIG | base64 --decode | tee /tmp/config.ovpn 1>/dev/null  

            if grep auth-user-pass /tmp/config.ovpn; then  
              if [ -z "${VPN_USER:-}" ] || [ -z "${VPN_PASSWORD:-}" ]; then  
                echo "Your VPN client is configured with a user-locked profile. Make sure to set the VPN_USER and VPN_PASSWORD environment variables"  
                exit 1  
              else  
                printf "$VPN_USER\\n$VPN_PASSWORD" > /tmp/vpn.login  
                sed -i config.bak 's|^auth-user-pass.*|auth-user-pass /tmp/vpn\.login|' /tmp/config.ovpn  
              fi  
            fi  

            touch /tmp/openvpn.log

            ### IMPORTANT: Include the following 3 lines to exclude the link-local range  
            phone_home="$(netstat -an | grep '\.2222\s.*ESTABLISHED' | head -n1 | awk '{ split($5, a, "."); print a[1] "." a[2] "." a[3] "." a[4] }')"  
            echo -e "\nroute $phone_home 255.255.255.255 net_gateway" | tee -a /tmp/config.ovpn  
            echo "route 169.254.0.0 255.255.0.0 net_gateway" | tee -a /tmp/config.ovpn  

            echo $phone_home  

            cat \<< EOF | sudo tee /Library/LaunchDaemons/org.openvpn.plist 1>/dev/null  
            <?xml version="1.0" encoding="UTF-8"?>  
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  
            <plist version="1.0">  
            <dict>   
                <key>Label</key>  
                <string>org.openvpn</string>  
                <key>Program</key>  
                  <string>/usr/local/sbin/openvpn</string>  
                <key>ProgramArguments</key>  
                  <array>  
                    <string>--config</string>  
                    <string>/tmp/config.ovpn</string>  
                  </array>  
                <key>RunAtLoad</key>  
                  <false/>  
                <key>TimeOut</key>  
                  <integer>90</integer>  
                <key>StandardErrorPath</key>  
                  <string>/tmp/openvpn.log</string>  
                <key>StandardOutPath</key>  
                  <string>/tmp/openvpn.log</string>  
                <key>KeepAlive</key>  
                 <true/>  
              </dict>  
              </plist>  
              EOF  
              ifconfig  
              echo "Public IP before VPN connection is > $(curl <http://checkip.amazonaws.com%29">  

              # This will start the connection  
              sudo launchctl load /Library/LaunchDaemons/org.openvpn.plist  
              sudo launchctl start org.openvpn  

      - run:
          name: Wait for the connection to be established and check  
          command: |  
            while [ $(cat /tmp/openvpn.log|grep -c "Initialization Sequence Completed") == 0 ]; do  
              echo "Attempting to connect..."  
              sleep 1;  
            done  
            echo "VPN Connected"  

            sudo launchctl list | grep openvpn  
            echo "Public IP is now $(curl checkip.amazonaws.com)"  

      - run:
          name: Run commands in our infrastructure
          command: |
            # A command
            # Another command  

      - run:  
          name: Disconnect from OpenVPN  
          command: sudo launchctl stop org.openvpn  
          when: always
```

## `windows` executor ([Windows executor images]({{site.baseurl}}/hello-world-windows/#windows-executor-images))
{: #windows-executor-windows-executor-imageshttpscirclecicomdocs20hello-world-windowswindows-executor-images }
{:.no_toc}

* Base64-encode the OpenVPN client configuration file, and store it as an [environment variable]({{site.baseurl}}/env-vars/).
* If the VPN client authentication is credentials-based (user-locked profile), you'll also need to add the username and password as environment variables (`VPN_USER` and `VPN_PASSWORD`).

```yml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

workflows:
  btd:
    jobs:
      - build
jobs:
  build:
    executor:
      name: win/default
      shell: bash.exe

    steps:
      - run:
          name: Install OpenVPN
          command: |
            choco install openvpn

      - run:
          name: Check IP before VPN connection
          command: echo "Public IP before VPN connection is $(curl checkip.amazonaws.com)"

      - run:
          name: VPN Setup
          command: |  
            echo $VPN_CLIENT_CONFIG | base64 --decode > /C/PROGRA~1/OpenVPN/config/config.ovpn

            if grep auth-user-pass "/C/PROGRA~1/OpenVPN/config/config.ovpn"; then  
              if [ -z "${VPN_USER:-}" ] || [ -z "${VPN_PASSWORD:-}" ]; then  
                echo "Your VPN client is configured with a user-locked profile. Make sure to set the VPN_USER and VPN_PASSWORD environment variables"  
                exit 1  
              else  
                printf "$VPN_USER\\n$VPN_PASSWORD" > /C/PROGRA~1/OpenVPN/config/vpn.login  
                sed -i 's|^auth-user-pass.*|auth-user-pass vpn\.login|' /C/PROGRA~1/OpenVPN/config/config.ovpn  
              fi  
            fi

            ### IMPORTANT: Include the following 3 lines to exclude the connection from CircleCI and the link-local range
            phone_home=$(netstat -an | grep ':22 .*ESTABLISHED' | head -n1 | awk '{ split($3, a, ":"); print a[1] }')
            echo -e "\nroute $phone_home 255.255.255.255 net_gateway" | tee -a "/C/PROGRA~1/OpenVPN/config/config.ovpn"  
            echo "route 169.254.0.0 255.255.0.0 net_gateway" | tee -a "/C/PROGRA~1/OpenVPN/config/config.ovpn"  

            # Create and start the OpenVPN service  
            sc.exe create "OpenVPN" binPath= "C:\PROGRA~1\OpenVPN\bin\openvpnserv.exe"  
            net start "OpenVPN"


      - run:
          name: Wait for the connection to be established and check
          command: |
            while [ $(cat /C/PROGRA~1/OpenVPN/log/config.log|grep -c "Initialization Sequence Completed") == 0 ]; do
              echo "Attempting to connect..."
              sleep 1;
            done
            echo "VPN Connected"
            echo "Public IP is now $(curl checkip.amazonaws.com)"

      - run:
          name: Run commands in our infrastructure
          command: |
            # A command
            # Another command

      - run:
          name: Disconnect from OpenVPN
          command: net stop "OpenVPN"
          when: always
```

</details>


<details markdown=block>
<summary>How to generate and store read/write SSH keys</summary>

If you want to enable write-permissions to your checkout repo within a job, interact with other private repositories entirely, you'll need to add an SSH key to CircleCI which provides write access.

Check out our docs with [with full instructions to generate and add the keys]({{site.baseurl}}/add-ssh-key/)

See GitHub and Bitbucket documentation for guidelines on storing SSH public keys:

* <https://developer.github.com/v3/guides/managing-deploy-keys>
* <https://confluence.atlassian.com/bitbucket/use-deployment-keys-294486051.html>

</details>


<details markdown=block>
<summary>Why aren't pull requests triggering jobs on my organization?</summary>

**If you revoked OAuth access to CircleCI on your VCS provider (GitHub, Bitbucket)**

If you revoke OAuth access to the CircleCI app on your VCS provider it will disable the keys that we used to authorize your account. We do not receive notifications when the auth is revoked, and may still attempt to use the now revoked auth. For instance, you may encounter this when trying to submit a PR to an open source project that uses CircleCI and it does not trigger. If you encounter this issue [submit a support ticket](https://support.circleci.com/hc/en-us/requests/new) and we can resolve it for you.


**If you're following the fork instead of the upstream repo**

Sometimes you'll have a user who submits a pull request to your repository from a fork, but no pipeline will be triggered with the pull request. This can happen when the user is following the project fork on their personal account rather than the project itself on CircleCI.

This will cause the jobs to trigger under the user's personal account. If the user is following a fork of the repository on CircleCI, we will only build on that fork and not the parent, so the parent’s PR will not get status updates.

In these cases have the user unfollow their fork of the project on CircleCI and follow the source project instead. This will trigger their jobs to run under the organization when they submit pull requests.

**Note: This feature is not currently supported for Bitbucket users.**

**If the branch and the pull request happen to be created simultaneously**

You might experience builds that are pull requests not running with the error message "This project is configured to only run builds that have open pull requests associated with them. Update the ['Only build pull requests'](https://circleci.com/gh/UrbanCompass/uc-frontend/edit#advanced-settings) setting to run this build."

This happens due to a race condition when a branch is created and a pull request is opened simultaneously. CircleCI will receive notification the branch was created, and will not run the build because it is not a pull request.

We will then receive a second notification of a pull request being opened, with the same commit hash. Since we will never run the same commit hash twice, the build is updated in the UI, but never ran.

To ensure this doesn't happen to builds with "Only build pull requests" turned on, you can disable the "Branch or tag creation" setting in Github. This will ensure that the only webhooks we receive are when the pull request is open.

How to find your webhook settings: <https://support.circleci.com/hc/en-us/articles/360021511153-How-to-view-your-GitHub-WebHook-deliveries>

Find this option, and uncheck the box.

</details>

# Troubleshooting and Common Issues
{: #troubleshooting-and-common-issues }

<details markdown=block>
<summary>Build Fails with "Too long with no output (exceeded 10m0s): context deadline exceeded"</summary>

In CircleCI, a command will be killed if a certain period of time has passed with no output. デフォルトではこれは 10 分に設定されています。 This is designed to prevent errors in builds from hanging using a large number of credits unintentionally.

Some test runners and tools make use of what is known as output buffering. これは、プログラムがテキストを 1 行ごとに出力するのではなく、１回でまとめて出力するものです。 そのため、プロセスが終了するまですべての出力がバッファリングされる場合があります。 If a test or task requires more than 10 minutes and is buffering its output, this can cause CircleCI to kill the step as there has been no output during that time

In Python, this can be sometimes be disabled via the [PYTHONUNBUFFERED](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONUNBUFFERED) environment variable. This can be set in a job step via export:

```yml
steps:  
  - run:  
      name: Run Tests  
      command: |  
        export PYTHONUNBUFFERED=1  
        python -m unittest
```

If the task does not have a way to generate any output, the default context deadline can be increased

```yml
steps:  
 - run:  
     name: Run Tests  
     no_output_timeout: 30m  
     command: python -m unittest
```

The job step can also timeout because there is an issue with the tests or task is actually hanging. Some examples of causes of this would be where a process is waiting for user input or a loop is polling a network resource that never comes available.

</details>

# Windows
{: #windows }

<details markdown=block>
<summary>How to `sudo` on Powershell - Windows executor</summary>

Windows Powershell doesn't have `sudo` \- some commands needs to be run as an administrator Powershell has no concept of it.

One solution we can use is `Start-Process` command: <https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/start-process> The following line is the example of this command.

Start-Process wpr -verb runAs -Args "-start GeneralProfile"

This is calling `wpr` (Windows Performance Recorder) as an administrator and passing necessary arguments with `-Args` flag. However in this case, the challenge is that we don't see the output because theoretically, since it starts a new shell somewhere.

The other way you can think is scoop (<https://scoop.sh/>) which enables the commands equivalent to the one in Linux. You can install by following way:

iex (new-object net.webclient).downloadstring('https://get.scoop.sh')  
set-executionpolicy unrestricted -s cu -f  
scoop install sudo

By installing this, you can use `sudo` just like you're in Linux. しかし、この方法でも基本的には解決策１と同じことをしているため、出力を表示することはできません。 (You can see the script inside here: <https://github.com/lukesampson/psutils/blob/master/sudo.ps1>)

</details>
