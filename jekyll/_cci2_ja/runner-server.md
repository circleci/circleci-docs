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

名前空間、リソース クラス、トークンを作成するには、CLI が CircleCI Server 環境に接続できるよう構成する必要があります。この構成は、`--host HOSTNAME` フラグと `--token TOKEN` フラグを付けるか、または CircleCI CLI の設定ファイルを使用して行います。

#### リソース クラスの作成例
```plaintext
circleci runner resource-class create <resource-class> <description> --host HOSTNAME --token TOKEN
```

## 設定ファイル

ランナーのセットアップ時には、設定ファイルで `host` プロパティを指定する必要があります。

```yaml
api:
    auth_token: AUTH_TOKEN
    host: HOSTNAME
runner:
  name: RUNNER_NAME
  command_prefix: ["sudo", "-niHu", "circleci", "--"]
  working_directory: /opt/circleci/workdir/%s
  cleanup_working_directory: true
```

## バージョン

CircleCI Server のバージョンによって、対応しているランナーのバージョンは異なります。 下表に、それぞれのバージョンの対応関係を示します。

| CircleCI Server のバージョン | ランナーのバージョン |
| ---------------------- | ---------- |
| 3.0                    | 未定         |
{: class="table table-striped"}


次のスクリプトの `VERSION` を適切なバージョンに置き換えて実行し、指定したバージョンのランナーのバイナリをダウンロードおよび検証して、インストールします。

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
