# Artifacts

## Artifacts Of A Build

```sh
curl -H'Circle-Token: :token' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts
```

```json
[ {
  "path" : "raw-test-output/go-test-report.xml",
  "pretty_path" : "raw-test-output/go-test-report.xml",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test-report.xml"
}, {
  "path" : "raw-test-output/go-test.out",
  "pretty_path" : "raw-test-output/go-test.out",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test.out"
} ]
```


Returns an array of artifacts produced by a given build.
Request Type: `GET`

### Notes

* the value of path is relative to the project root (the working_directory)
* pretty_path returns the same value as path. It is included in the response for backwards compatibility


## Download an artifact file

You can download an individual artifact file via the API with an API-token authenticated HTTP request.

```sh
curl -L -H'Circle-Token: :token' https://132-55688803-gh.circle-artifacts.com/0//tmp/circle-artifacts.7wgAaIU/file.txt
```

### Notes
* Make sure your HTTP client is configured to follow redirects as the artifact URLs can respond with
an HTTP `3xx` status code (the `-L` switch in `curl` will achieve this).
* `:token` is an API token with 'view-builds' scope.

## Artifacts of the latest Build

```sh
curl -H'Circle-Token: :token' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?branch=:branch&filter=:filter
```

```json
[ {
  "path" : "raw-test-output/go-test-report.xml",
  "pretty_path" : "raw-test-output/go-test-report.xml",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test-report.xml"
}, {
  "path" : "raw-test-output/go-test.out",
  "pretty_path" : "raw-test-output/go-test.out",
  "node_index" : 0,
  "url" : "https://24-88881093-gh.circle-artifacts.com/0/raw-test-output/go-test.out"
} ]
```

Returns an array of artifacts produced by the latest build on a given branch.

Request Type: `GET`

**Parameter** | **Description**
------- | -------------
branch | The branch you would like to look in for the latest build. Returns artifacts for latest build in entire project if omitted.
filter | Restricts which builds are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.


### Notes

* the value of path is relative to the project root (the working_directory)
* pretty_path returns the same value as path. It is included in the response for backwards compatibility
