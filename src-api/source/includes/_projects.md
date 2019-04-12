# Projects

## Get All Followed Projects

```sh
curl https://circleci.com/api/v1.1/projects?circle-token=:token
```


```json
[ {
  "vcs_url": "https://github.com/circleci/mongofinil",
  "followed": true, // true if you follow this project in CircleCI
  "username": "circleci",
  "reponame": "mongofinil",
  "branches" : {
    "master" : {
      "pusher_logins" : [ "pbiggar", "arohner" ], // users who have pushed
      "last_non_success" : { // last failed build on this branch
        "pushed_at" : "2013-02-12T21:33:14Z",
        "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
        "build_num" : 22,
        "outcome" : "failed",
        },
      "last_success" : { // last successful build on this branch
        "pushed_at" : "2012-08-09T03:59:53Z",
        "vcs_revision" : "384211bbe72b2a22997116a78788117b3922d570",
        "build_num" : 15,
        "outcome" : "success",
        },
      "recent_builds" : [ { // last 5 builds, ordered by pushed_at (decreasing)
        "pushed_at" : "2013-02-12T21:33:14Z",
        "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
        "build_num" : 22,
        "outcome" : "failed",
        }, {
        "pushed_at" : "2013-02-11T03:09:54Z",
        "vcs_revision" : "0553ba86b35a97e22ead78b0d568f6a7c79b838d",
        "build_num" : 21,
        "outcome" : "failed",
        }, ... ],
      "running_builds" : [ ] // currently running builds
    }
  }
}, ... ]
```


`GET` request.

Returns an array of all projects you are currently following on CircleCI, with build information organized by branch.


## Follow a New Project on CircleCI

```sh
curl -X POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/follow?circle-token=:token
```

```json
{
  "followed" : true,
  "first_build" : {
    "compare" : null,
    "previous_successful_build" : null,
    "build_parameters" : null,
    "oss" : true,
    "committer_date" : null,
    "body" : null,
    "usage_queued_at" : "2016-09-07T13:48:10.825Z",
    "fail_reason" : null,
    "retry_of" : null,
    "reponame" : "testing-circleci",
    "ssh_users" : [ ],
    "build_url" : "https://circleci.com/gh/circleci/mongofinil/1",
    "parallel" : 1,
    "failed" : null,
    "branch" : "master",
    "username" : "circleci",
    "author_date" : null,
    "why" : "first-build",
    "user" : {
      "is_user" : true,
      "login" : "circleci",
      "avatar_url" : "https://avatars.githubusercontent.com/u/6017470?v=3",
      "name" : "CircleCI",
      "vcs_type" : "github",
      "id" : 10101010
    },
    "vcs_revision" : "b2b5def65bf54091dde02ebb39ef3c54de3ff049",
    "vcs_tag" : null,
    "build_num" : 1,
    "infrastructure_fail" : false,
    "committer_email" : null,
    "previous" : null,
    "status" : "not_running",
    "committer_name" : null,
    "retries" : null,
    "subject" : null,
    "vcs_type" : "github",
    "timedout" : false,
    "dont_build" : null,
    "lifecycle" : "not_running",
    "no_dependency_cache" : false,
    "stop_time" : null,
    "ssh_disabled" : false,
    "build_time_millis" : null,
    "circle_yml" : null,
    "messages" : [ ],
    "is_first_green_build" : false,
    "job_name" : null,
    "start_time" : null,
    "canceler" : null,
    "outcome" : null,
    "vcs_url" : "https://github.com/circleci/mongofinil",
    "author_name" : null,
    "node" : null,
    "canceled" : false,
    "author_email" : null
  }
}
```


Request Type: `POST`

Follows a new project. CircleCI will then monitor the project for automatic building of commits.

## Recent Builds Across All Projects


```sh
curl https://circleci.com/api/v1.1/recent-builds?circle-token=:token&limit=20&offset=5
```

```json
[ {
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
  "build_num" : 22,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "github", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z" // time build was queued
  "start_time" : "2013-02-12T21:33:38Z", // time build started
  "stop_time" : "2013-02-12T21:34:01Z", // time build finished
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "outcome" : "failed", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "failed", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :scheduled, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "failed",
    "build_num" : 21
  }, ... ]
```

Request Type: `GET`

Returns a build summary for each of the last 30 recent builds, ordered by `build_num`.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.
shallow | An optional boolean parameter that may be sent to improve performance if set to 'true'.


## Recent Builds For A Single Project

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?circle-token=:token&limit=20&offset=5&filter=completed
```

> **Note:** You can narrow the builds to a single branch by appending /tree/:branch to the url. Note that the branch name should be url-encoded.
> Example: 

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/tree/:branch
```


```json
[ {
  "vcs_url" : "https://github.com/circleci/mongofinil",
  "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
  "build_num" : 22,
  "branch" : "master",
  "vcs_revision" : "1d231626ba1d2838e599c5c598d28e2306ad4e48",
  "committer_name" : "Allen Rohner",
  "committer_email" : "arohner@gmail.com",
  "subject" : "Don't explode when the system clock shifts backwards",
  "body" : "", // commit message body
  "why" : "github", // short string explaining the reason we built
  "dont_build" : null, // reason why we didn't build, if we didn't build
  "queued_at" : "2013-02-12T21:33:30Z" // time build was queued
  "start_time" : "2013-02-12T21:33:38Z", // time build started running
  "stop_time" : "2013-02-12T21:34:01Z", // time build finished running
  "build_time_millis" : 23505,
  "username" : "circleci",
  "reponame" : "mongofinil",
  "lifecycle" : "finished", // :queued, :scheduled, :not_run, :not_running, :running or :finished
  "outcome" : "failed", // :canceled, :infrastructure_fail, :timedout, :failed, :no_tests or :success
  "status" : "failed", // :retried, :canceled, :infrastructure_fail, :timedout, :not_run, :running, :failed, :queued, :scheduled, :not_running, :no_tests, :fixed, :success
  "retry_of" : null, // build_num of the build this is a retry of
  "previous" : { // previous build
    "status" : "failed",
    "build_num" : 21
  }, ... ]
```


**`GET` Request:** Returns a build summary for each of the last 30 builds for a single git repo, ordered by build_num.

**Parameter** | **Description**
------- | -------------
limit | The number of builds to return. Maximum 100, defaults to 30.
offset | The API returns builds starting from this offset, defaults to 0.
filter | Restricts which builds are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.
shallow | An optional boolean value that may be sent to improve overall performance if set to 'true.'

### Improving Performance In Recent Build Requests Using the `Shallow` Parameter

When making API requests for information about recent builds, you may experience performance lag and a decrease in overall performance while the request is being processed by the server. To improve performance, CircleCI recommends you pass the `shallow` parameter in your request.

The two examples below show user requests for recent build information. Notice that when the user does not use the `shallow` parameter, significantly more information is returned in the response, which can decrease overall response time and performance. 

#### Sample Request NOT Using the `Shallow` Parameter

```json
[{
	"compare": "https://github.com/circleci/circleci.com/compare/6dae7271de1c...8139060f4d1f",
	"previous_successful_build": null,
	"build_parameters": {
		"CIRCLE_JOB": "build-preview"
	},
	"oss": false,
	"all_commit_details_truncated": false,
	"committer_date": "2019-04-12T10:44:51-07:00",
	"body": "",
	"usage_queued_at": "2019-04-12T17:46:11.229Z",
	"context_ids": [],
	"fail_reason": null,
	"retry_of": null,
	"reponame": "circleci.com",
	"ssh_users": [],
	"build_url": "https://circleci.com/gh/circleci/circleci.com/16315",
	"parallel": 1,
	"failed": false,
	"branch": "ja-homepage",
	"username": "circleci",
	"author_date": "2019-04-12T10:44:51-07:00",
	"why": "github",
	"user": {
		"is_user": true,
		"login": "trevor-circleci",
		"avatar_url": "https://avatars1.githubusercontent.com/u/22457684?v=4",
		"name": null,
		"vcs_type": "github",
		"id": 22457684
	},
	"vcs_revision": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
	"workflows": {
		"job_name": "build-preview",
		"job_id": "981f2bfa-3c50-4505-865d-5266670217eb",
		"workflow_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"workspace_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"upstream_job_ids": ["7e92fbf5-8111-430b-8e2a-54b169ba745d"],
		"upstream_concurrency_map": {},
		"workflow_name": "build-website"
	},
	"vcs_tag": null,
	"build_num": 16315,
	"infrastructure_fail": false,
	"committer_email": "trevor@circleci.com",
	"has_artifacts": true,
	"previous": {
		"build_num": 16314,
		"status": "success",
		"build_time_millis": 63857
	},
	"status": "success",
	"committer_name": "Trevor Sorel",
	"retries": null,
	"subject": "adding japanese translations for main nav",
	"vcs_type": "github",
	"timedout": false,
	"dont_build": null,
	"lifecycle": "finished",
	"no_dependency_cache": false,
	"stop_time": "2019-04-12T17:47:42.298Z",
	"ssh_disabled": false,
	"build_time_millis": 89366,
	"picard": null,
	"circle_yml": {
		"string": "version: 2.0\n\nworkflows:\n  version: 2\n  build-website:\n    jobs:\n      - populate-caches\n      - validate-html\n      - build-preview:\n          requires:\n            - populate-caches\n      - build-staging:\n          requires:\n            - populate-caches\n          filters:\n            branches:\n              only: staging\n      - build-production:\n          requires:\n            - populate-caches\n          filters:\n            branches:\n              only: master\n\nreferences:\n  default-container: &default-container\n    docker:\n      - image: circleci/ruby:2.6.1-node-browsers\n    environment:\n      RAILS_ENV: test\n      RACK_ENV: test\n      CIRCLE_ARTIFACTS: /tmp/artifacts\n  restore-source-cache: &restore-source-cache\n    restore_cache:\n      keys:\n        - v1-source-{{ .Branch }}-{{ .Revision }}\n        - v1-source-{{ .Branch }}-\n        - v1-source-\n  save-source-cache: &save-source-cache\n    save_cache:\n      key: v1-source-{{ .Branch }}-{{ .Revision }}\n      paths:\n        - \".git\"\n  restore-node-cache: &restore-node-cache\n    restore_cache:\n      keys:\n        - v1-dep-js-{{ checksum \"package.json\" }}\n  install-node-deps: &install-node-deps\n    run:\n      name: Install Node.js dependencies\n      command: |\n        npm install\n        node_modules/bower/bin/bower install || (sleep 2; node_modules/bower/bin/bower install)\n        npm run webpack-prod\n  save-node-cache: &save-node-cache\n    save_cache:\n      key: v1-dep-js-{{ checksum \"package.json\" }}\n      paths:\n        - node_modules\n        - \"~/.cache/bower\"\n  restore-ruby-cache: &restore-ruby-cache\n    restore_cache:\n      keys:\n        - v1-dep-bundler-{{ checksum \"Gemfile\" }}\n  install-ruby-deps: &install-ruby-deps\n    run:\n      name: Install Ruby dependencies\n      command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3\n  save-ruby-cache: &save-ruby-cache\n    save_cache:\n      key: v1-dep-bundler-{{ checksum \"Gemfile\" }}\n      paths:\n        - vendor\n  install-aws-cli: &install-aws-cli\n    run:\n      name: Install AWS CLI\n      command: |\n        sudo ln -s /home/circleci /home/ubuntu\n        sudo ln -s /home/circleci/project /home/ubuntu/circleci.com\n        sudo apt-get update\n        sudo apt-get install awscli\n\njobs:\n  populate-caches:\n    <<: *default-container\n    steps:\n      - *restore-source-cache\n      - checkout\n      - *save-source-cache\n      - *restore-node-cache\n      - *install-node-deps\n      - *save-node-cache\n      - *restore-ruby-cache\n      - *install-ruby-deps\n      - *save-ruby-cache\n  build-staging:\n    <<: *default-container\n    steps:\n      - *install-aws-cli\n      - *restore-source-cache\n      - checkout\n      - *restore-node-cache\n      - *install-node-deps\n      - *restore-ruby-cache\n      - *install-ruby-deps\n      - run: JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,_config_staging.yml --destination _staging_site --future --drafts --unpublished\n      - run:\n          name: Upload staging site\n          command: |\n            aws s3 sync --delete --exclude \"docs/*\" --exclude \"design-system/*\" ./_staging_site s3://static-staging.circleci.com\n            aws s3 cp s3://static-staging.circleci.com/assets s3://static-staging.circleci.com/assets --recursive --metadata-directive REPLACE --cache-control public,max-age=31536000 || true\n            aws s3 cp s3://static-staging.circleci.com/ja/assets s3://static-staging.circleci.com/assets/ja --recursive --metadata-directive REPLACE --cache-control public,max-age=31536000 || true\n      - store_artifacts:\n          path: /home/ubuntu/circleci.com/_staging_site\n  build-preview:\n    <<: *default-container\n    resource_class: xlarge\n    steps:\n      - *install-aws-cli\n      - *restore-source-cache\n      - checkout\n      - *restore-node-cache\n      - *install-node-deps\n      - *restore-ruby-cache\n      - *install-ruby-deps\n      - run:\n          name: Build site\n          command: |\n            JEKYLL_BASE_URL=\"/${CIRCLE_BRANCH:-$CIRCLE_SHA1}\" \\\n            bundle exec jekyll build --config _config.yml,_config_preview.yml \\\n              --limit_posts 15 --future --drafts --unpublished\n      - run:\n          name: Upload branch preview site build\n          command: |\n            PATH_PREFIX=\"${CIRCLE_BRANCH:-$CIRCLE_SHA1}\"\n            aws s3 sync --delete --exclude \"docs/*\" --exclude \"design-system/*\" ./_site s3://static-preview.circleci.com/${PATH_PREFIX}/\n  validate-html:\n    <<: *default-container\n    steps:\n      - *install-aws-cli\n      - *restore-source-cache\n      - checkout\n      - *restore-node-cache\n      - *install-node-deps\n      - *restore-ruby-cache\n      - *install-ruby-deps\n      - run: JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,_config_production.yml | tee /tmp/jekyll-build-output.txt\n      - run:\n          name: Check Jekyll build for errors\n          command: \"! grep error /tmp/jekyll-build-output.txt\"\n      - run: npm run validate --silent\n  build-production:\n    <<: *default-container\n    steps:\n      - *install-aws-cli\n      - *restore-source-cache\n      - checkout\n      - *restore-node-cache\n      - *install-node-deps\n      - *restore-ruby-cache\n      - *install-ruby-deps\n      - run: JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,_config_production.yml\n      - run:\n          name: Upload production site\n          command: |\n            aws s3 sync --delete --exclude \"docs/*\" --exclude \"design-system/*\" --exclude \"orb-registry-web-assets/*\" ./_site s3://circle-production-static-site\n            aws s3 cp s3://circle-production-static-site/assets s3://circle-production-static-site/assets --recursive --metadata-directive REPLACE --cache-control public,max-age=31536000 || true\n            aws s3 cp s3://circle-production-static-site/ja/assets s3://circle-production-static-site/assets/ja --recursive --metadata-directive REPLACE --cache-control public,max-age=31536000 || true\n            aws s3 cp s3://circle-production-static-site/blog/moving-from-complex-to-simple-easy-ci-cd/index.html s3://circle-production-static-site/blog/switching-from-jenkins-to-circleci/index.html --metadata-directive REPLACE --website-redirect /blog/moving-from-complex-to-simple-easy-ci-cd/ || true\n            aws s3 cp s3://circle-production-static-site/customers/index.html s3://circle-production-static-site/stories/index.html --metadata-directive REPLACE --website-redirect /customers/ || true\n            aws s3 cp s3://circle-production-static-site/customers/learnzillion/index.html s3://circle-production-static-site/stories/learnzillion/index.html --metadata-directive REPLACE --website-redirect /customers/learnzillion/ || true\n            aws s3 cp s3://circle-production-static-site/customers/shopify/index.html s3://circle-production-static-site/stories/shopify/index.html --metadata-directive REPLACE --website-redirect /customers/shopify/ || true\n            aws s3 cp s3://circle-production-static-site/customers/sony/index.html s3://circle-production-static-site/stories/sony/index.html --metadata-directive REPLACE --website-redirect /customers/sony/ || true\n            aws s3 cp s3://circle-production-static-site/customers/wit/index.html s3://circle-production-static-site/stories/wit/index.html --metadata-directive REPLACE --website-redirect /customers/wit/ || true\n            aws s3 cp s3://circle-production-static-site/integrations/aws/index.html s3://circle-production-static-site/enterprise/aws/index.html --metadata-directive REPLACE --website-redirect /integrations/aws/ || true\n            aws s3 cp s3://circle-production-static-site/integrations/azure/index.html s3://circle-production-static-site/enterprise/azure/index.html --metadata-directive REPLACE --website-redirect /integrations/azure/ || true\n      - store_artifacts:\n          path: /home/ubuntu/circleci.com/_site\n"
	},
	"messages": [],
	"is_first_green_build": false,
	"job_name": null,
	"start_time": "2019-04-12T17:46:12.932Z",
	"canceler": null,
	"all_commit_details": [{
		"committer_date": "2019-04-12T10:44:51-07:00",
		"body": "",
		"branch": "ja-homepage",
		"author_date": "2019-04-12T10:44:51-07:00",
		"committer_email": "trevor@circleci.com",
		"commit": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
		"committer_login": "trevor-circleci",
		"committer_name": "Trevor Sorel",
		"subject": "adding japanese translations for main nav",
		"commit_url": "https://github.com/circleci/circleci.com/commit/8139060f4d1f6ff617ac49f8afb2273c4fee2343",
		"author_login": "trevor-circleci",
		"author_name": "Trevor Sorel",
		"author_email": "trevor@circleci.com"
	}],
	"platform": "1.0",
	"outcome": "success",
	"vcs_url": "https://github.com/circleci/circleci.com",
	"author_name": "Trevor Sorel",
	"node": null,
	"queued_at": "2019-04-12T17:46:11.289Z",
	"canceled": false,
	"author_email": "trevor@circleci.com"
}]

``` 

#### Sample Request Using the `Shallow` Parameter

```json
[{
	"committer_date": "2019-04-12T10:44:51-07:00",
	"body": "",
	"usage_queued_at": "2019-04-12T17:46:11.229Z",
	"reponame": "circleci.com",
	"build_url": "https://circleci.com/gh/circleci/circleci.com/16315",
	"parallel": 1,
	"branch": "ja-homepage",
	"username": "circleci",
	"author_date": "2019-04-12T10:44:51-07:00",
	"why": "github",
	"user": {
		"is_user": true,
		"login": "trevor-circleci",
		"avatar_url": "https://avatars1.githubusercontent.com/u/22457684?v=4",
		"name": null,
		"vcs_type": "github",
		"id": 22457684
	},
	"vcs_revision": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
	"workflows": {
		"job_name": "build-preview",
		"job_id": "981f2bfa-3c50-4505-865d-5266670217eb",
		"workflow_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"workspace_id": "a063aeae-5b89-458b-8aa1-cca4c565b07d",
		"upstream_job_ids": ["7e92fbf5-8111-430b-8e2a-54b169ba745d"],
		"upstream_concurrency_map": {},
		"workflow_name": "build-website"
	},
	"vcs_tag": null,
	"pull_requests": [{
		"head_sha": "8139060f4d1f6ff617ac49f8afb2273c4fee2343",
		"url": "https://github.com/circleci/circleci.com/pull/2347"
	}],
	"build_num": 16315,
	"committer_email": "trevor@circleci.com",
	"status": "success",
	"committer_name": "Trevor Sorel",
	"subject": "adding japanese translations for main nav",
	"dont_build": null,
	"lifecycle": "finished",
	"fleet": "picard",
	"stop_time": "2019-04-12T17:47:42.298Z",
	"build_time_millis": 89366,
	"start_time": "2019-04-12T17:46:12.932Z",
	"platform": "2.0",
	"outcome": "success",
	"vcs_url": "https://github.com/circleci/circleci.com",
	"author_name": "Trevor Sorel",
	"queued_at": "2019-04-12T17:46:11.289Z",
	"author_email": "trevor@circleci.com"
}]
```


## Clear Project Cache

**`DELETE` Request:** Clears the cache for a project.

```sh
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build-cache?circle-token=:token
```

```json
{
  "status" : "build caches deleted"
}
```

