# Artifacts

## Artifacts Of A Job

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts -H "Circle-Token: <circle-token>"
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


Returns an array of artifacts produced by a given job.
Request Type: `GET`

### Notes

* The value of `path` is relative to the project root (the working directory).
* `pretty_path` returns the same value as `path`. It is included in the response for backwards compatibility.


## Download an artifact file

You can download an individual artifact file via the API with an API-token authenticated HTTP request.

```sh
curl -L https://132-55688803-gh.circle-artifacts.com/0//tmp/circle-artifacts.7wgAaIU/file.txt -H "Circle-Token: <circle-token>"
```

### Notes
* Make sure your HTTP client is configured to follow redirects as the artifact URLs can respond with
an HTTP `3xx` status code (the `-L` switch in `curl` will achieve this).
* `:token` is an API token with 'view-builds' scope.

## Artifacts of the latest Job

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?branch=:branch&filter=:filter -H "Circle-Token: <circle-token>"
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

Returns an array of artifacts produced by the latest job on a given branch.

Request Type: `GET`

**Parameter** | **Description**
------- | -------------
branch | The branch you would like to look in for the latest job. Returns artifacts for latest job in entire project if omitted.
filter | Restricts which jobs are returned. Set to "completed", "successful", "failed", "running", or defaults to no filter.


### Notes

* The value of `path` is relative to the project root (the working directory).
* `pretty_path` returns the same value as `path`. It is included in the response for backwards compatibility.
