# User 


```sh
curl -u <circle-token>: https://circleci.com/api/v1.1/me
```

```json
{
  "basic_email_prefs" : "smart", // can be "smart", "none" or "all"
  "login" : "pbiggar" // your github username
}
```

**`GET` Request**: Provides information about the user that is currently signed in.


