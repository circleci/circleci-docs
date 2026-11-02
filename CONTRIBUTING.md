# Contributing to CircleCI docs

Thank you for helping improve the CircleCI docs. To fix a typo or improve a page, open a pull request against this repository.

## Quick fixes

Every page on the docs site has a **Make a contribution** link at the bottom. It opens the source file in GitHub, where you can edit it and open a pull request.

## Larger changes

1. Fork the repository at https://github.com/circleci/circleci-docs. CircleCI employees can clone it instead.
2. Create a branch for your change.
3. Edit the `.adoc` files under `docs/`. Read the [style guide](https://circleci.com/docs/contributors/docs-style/) first, and start new pages from a template in `docs/contributors/modules/templates/pages/`.
4. Preview your change locally. See [DEVELOPMENT.md](DEVELOPMENT.md) for setup. You can also preview the build artifacts from the `ci/circleci: build` job on your pull request.
5. Open a pull request and complete the template.

## Style checks

The docs team uses [Vale](https://vale.sh/) to enforce the style guide. Vale runs on every pull request, and you can see the results in the `ci/circleci: lint` job. The rules are in the `styles` directory. You can also run Vale locally, for example `vale docs/guides/modules/ROOT/pages/your-page.adoc`.

A review bot also checks pull requests against the style guide.

## Review

The docs team is automatically asked to review every pull request. Changes to technical content also need review from the engineering team that owns the feature. The docs team can arrange this for you. We aim to respond within two days.

During review, the docs team might push small style and formatting fixes to your branch. Larger changes are discussed in the pull request first.

Once approved, a maintainer merges your pull request and the site publishes in about 4 minutes.

## For AI agents

AI agents working in this repository follow [AGENTS.md](AGENTS.md). It covers the same style rules as the style guide in a format suited to agents. If you change a style rule, update both.

## Other contributions

To report a problem or suggest an improvement without writing it yourself, open a [GitHub issue](https://github.com/circleci/circleci-docs/issues) or use the feedback form on the docs site.
