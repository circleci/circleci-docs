---
layout: classic-docs
title: Server版 CircleCI ランナー
short-title: Server版 CircleCI ランナー
categories:
  - platforms
description: Server版 CircleCI ランナーをセットアップする方法
order: 31
version:
  - Server v3.x
---

注: 執筆時点のバージョンの CircleCI Server 3.x では、CircleCI ランナーは使用できません。CircleCI Server に対応した CircleCI ランナーは、次回リリース前にプレビュー版として提供される予定です。 詳細については、[こちらからお問い合わせください](https://circleci.com/ja/contact/)。

## 認証
{: #authentication }

When creating namespaces, resource classes and tokens, the CLI needs to be configured to connect to the Server deployment either via `--host HOSTNAME` and `--token TOKEN` flags, or the CircleCI CLI's configuration file.

#### リソース クラスの作成例
{: #resource-class-example }
```plaintext
circleci runner resource-class create <resource-class> <description> --host HOSTNAME --token TOKEN
```

## 設定ファイル
{: #configuration-file }

When setting up a Runner, the configuration file should include `url` property.

```yaml
api:
    auth_token: AUTH_TOKEN
    url: https://HOSTNAME
runner:
  name: RUNNER_NAME
  command_prefix: ["sudo", "-niHu", "circleci", "--"]
  working_directory: /opt/circleci/workdir/%s
  cleanup_working_directory: true
```

## バージョン
{: #version }

A specific server version works with a specific runner version. The table below presents the mapping.

| Server Version | Runner |
| -------------- | ------ |
| 3.0            | TBD    |
{: class="table table-striped"}


Replace `VERSION` and run the following steps to download, verify and install the binary of a specific version of runner.

```sh
agent_version=VERSION
prefix=/opt/circleci
sudo mkdir -p "$prefix/workdir"
base_url="https://circleci-binary-releases.s3.amazonaws.com/circleci-launch-agent"
echo "Determining latest version of CircleCI Launch Agent"
echo "Using CircleCI Launch Agent version $agent_version"
echo "Downloading and verifying CircleCI Launch Agent Binary"
curl -sSL "$base_url/$agent_version/checksums.txt" -o checksums.txt
file="$(grep -F "$platform" checksums.txt | cut -d ' ' -f 2 | sed 's/^.//')"
mkdir -p "$platform"
echo "Downloading CircleCI Launch Agent: $file"
curl --compressed -L "$base_url/$agent_version/$file" -o "$file"
echo "Verifying CircleCI Launch Agent download"
grep "$file" checksums.txt | sha256sum --check && chmod +x "$file"; sudo cp "$file" "$prefix/circleci-launch-agent" || echo "Invalid checksum for CircleCI Launch Agent, please try download again"
```
