# Keys

## List Checkout Keys

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key?circle-token=:token
```

```json
[{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "github-user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }]
```

**`GET` Request**: Returns an array of checkout keys for `:project.`

## New Checkout Key

```sh
curl -X POST --header "Content-Type: application/json" -d '{"type":"github-user-key"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key?circle-token=:token
```

```json
{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }
```

**`POST` Request**: Creates a new checkout key. This API request is only usable with a user API token.

Parameter | Description
------- | -------------
type | The type of key to create. Can be 'deploy-key' or 'github-user-key'.


## Get Checkout Key

```sh
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key/:fingerprint?circle-token=:token
```

```json
{"public_key": "ssh-rsa...",
  "type": "deploy-key", // can be "deploy-key" or "user-key"
  "fingerprint": "c9:0b:1c:4f:d5:65:56:b9:ad:88:f9:81:2b:37:74:2f",
  "preferred": true,
  "time" : "2015-09-21T17:29:21.042Z" // when the key was issued
  }
```

**`GET` Request**: Returns an individual checkout key.

## Delete Checkout Key

**`DELETE` Request:** Deletes the checkout key.

```sh
curl -X DELETE https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/checkout-key/:fingerprint?circle-token=:token
```

```json
{"message":"ok"}
```

## Create SSH Keys

**`POST` Request:** Creates an SSH key that will be used to access the external system identified by the hostname parameter for SSH key-based authentication.

```sh
curl -X POST --header "Content-Type: application/json" -d '{"hostname":"hostname","private_key":"RSA private key"}' https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/ssh-key?circle-token=:token
```

```
# no response expected
```

## Delete SSH Key

```sh
curl -X DELETE --header "Content-Type: application/json" -d {"fingerprint":"Fingerprint", "hostname":"Hostname"} https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/ssh-key?circle-token=:token
```

```
# no response expected
```

**`DELETE` Request:** Deletes an SSH key from the system.


## Heroku Keys

**`POST` Request:** Adds your Heroku API key to CircleCI and then takes `apikey` as form param name.

```sh
curl -X POST --header "Content-Type: application/json" -d '{"apikey":"Heroku key"}' https://circleci.com/user/heroku-key?circle-token=:token
```

```
# no response expected
```
