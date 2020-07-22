# Environment Variables

## List Environment Variables

```sh 
curl -u <circle-token>: https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar
```

```json 
[{"name":"foo","value":"xxxx1234"}]
```

**`GET` Request**: Returns four 'x' characters plus the last four ASCII characters of the value, consistent with the display of environment variable values in the CircleCI website.

## Add Environment Variables

```sh 
curl -u <circle-token>: -X POST --header "Content-Type: application/json" -d '{"name":"foo", "value":"bar"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar
```

```json
{"name":"foo","value":"xxxx"}
```

**`POST` Request** Creates a new environment variable.

## Get Single Environment Variable

```sh 
curl -u <circle-token>: https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar/:name
```

```json
{"name":"foo","value":"xxxx"}
```

**`GET` Request:** Returns the hidden value of environment variable `:name`.

## Delete Environment Variables

```sh
curl -u <circle-token>: -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/envvar/:name
```

```json
{"message":"ok"}
```

**`DELETE` Request** Deletes the environment variable named :name.
