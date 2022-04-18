---
layout: classic-docs
title: "Orb のパブリッシュ"
short-title: "Orb のパブリッシュ"
description: "Orb レジストリへの Orb のパブリッシュ"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

ここでは、Orb のパブリッシュ手順について説明します。

* 目次
{:toc}

## はじめに
{: #introduction }

オーサリングした Orb は、[セマンティックバージョン]({{site.baseurl}}/ja/2.0/orb-concepts/#semantic-versioning) タグを付けてパブリッシュすることで、[Orb レジストリ](https://circleci.com/ja/developer/orbs)に公開できます。

**注:**プライベート Orb の場合、Orb レジストリでは検索できません。 しかし、その Orb の認証ユーザーは URL にアクセスすることができます。
{: class="alert alert-warning"}

![Orb Publishing Process]({{ site.baseurl }}/assets/img/docs/orb-publishing-process.png)

[手動]({{site.baseurl}}/2.0/ja/orb-author-validate-publish)ではなく、[Orb 開発キット]({{site.baseurl}}/2.0/ja/orb-author/#orb-development-kit)を使用して Orb をパブリッシュすると、このセクションで説明する手順に従ってセマンティック リリースを簡単に行えます。 パブリッシュプロセスの簡単な概要については、オーサリングプロセスの開始時に `circleci orb init` コマンドで生成される [README.md](https://github.com/CircleCI-Public/Orb-Template/blob/main/README.md) ファイルを参照してください。

## Orb 開発キットを使った新リリースの公開
{: #issue-a-new-release-with-the-orb-development-kit }

以下では、Orb の新しいセマンティックリリースを公開する方法について説明します。

`circleci orb init` コマンドでサンプルの Orb プロジェクトを生成すると、自動的に `alpha` ブランチに移行されます。 The name of the branch does not matter but it is best practice to make your changes on a non-default branch.

Once you have made your changes, commit them and push them up to your branch. We strongly encourage using [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.

Next, follow these steps to create a new release from your changes.

1. **Open a new Pull Request to the default branch.** <br/> The included `config.yml` and `test-deploy.yml` files in the `./circleci` directory are configured to automatically [lint]({{site.baseurl}}/2.0/testing-orbs/#yaml-lint), [shellcheck]({{site.baseurl}}/2.0/testing-orbs/#shellcheck), [review]({{site.baseurl}}/2.0/testing-orbs/#review), and [test]({{site.baseurl}}/2.0/testing-orbs/#integration-testing) your orb changes in the CircleCI web app.

1. **Ensure all tests pass.** <br/> You can view the results of your tests directly on GitHub within the Pull Request, or, for a more detailed view, watch the entire pipeline in the CircleCI web app. Notice there are two workflows, `lint-pack` will run first and contains our linting, shellchecking, review, and will publish a development version to be tested in the second workflow. The `test-deploy` workflow contains our integration tests, and can publish the production version of our orb when ready. ![プルリクエストに対して GitHub Checks API から返された Orb のテスト結果レポート]({{site.baseurl}}/assets/img/docs/orbtools-11-checks.png)

1. **"Squash" Merge.** <br/> When your changes are complete, we recommend (not required) "[Squash Merging](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-pull-request-commits)" your changes into a single commit, with a [Conventional Commit Message](https://www.conventionalcommits.org/).

    例：

      - `fix: x-command parameter from string to integer`
      - `feat: added new x parameter to y command`

1. **Tag and Release!** <br/> Your changes have now been merged to the default branch, but if you check the [Orb Registry](https://circleci.com/developer/orbs), you will see no new versions have been published.

To publish a new version of our orb, you need to tag your release. A tag can be created and pushed manually, however we recommend using [GitHub.com's Releases feature](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).

Using GitHub's Releases feature will allows you to publish "Release Notes", which will function as a changelog for your orb.

Follow the GitHub docs to create a new release.

   1. When asked to select a tag, specify the new tag that will be published with this release. Double check the current orb version in the [Orb Registry](https://circleci.com/developer/orbs). If you are unsure of what type of change you are making, we will have an opportunity to correct this in a moment. Ensure your tag fits the format `vX.Y.Z`
   2. Click the "+ Auto-generate release notes" button. A summary of changes will be generated for you, containing any pull requests which have been merged since the last release. If you have used [Conventional Commit messages](https://www.conventionalcommits.org/), it should be easy to determine the type of semantic increment change based on the commit message. For instance, if we had two commits that were prefixed with "fix:", we would expect the semantic version to increment by a "patch" level.
   3. Add your title, and publish the release.
   4. Complete!

After the release is published, a tag will be created and a CircleCI pipline will trigger for a final time. This final pipeline will perform all of the same steps as before with one additional final job, which will create the new orb version and publish it to the Orb Registry.

If you view the final `orb-tools/publish` job, in the "Publishing Orb Release" step, you will see a message like the following:

```shell
Your orb has been published to the CircleCI Orb Registry.
You can view your published orb on the CircleCI Orb Registry at the following link:
https://circleci.com/developer/orbs/orb/circleci/orb-tools?version=11.1.2
```
You can see this example from the orb-tools orb [here](https://app.circleci.com/pipelines/github/CircleCI-Public/orb-tools-orb/947/workflows/342ea92a-4c3d-485b-b89f-8511ebabd12f/jobs/5798)

