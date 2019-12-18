# User 


```sh
curl https://circleci.com/api/v1.1/me?circle-token=:token
```

```json
{
  "basic_email_prefs" : "smart", // can be "smart", "none" or "all"
  "login" : "pbiggar" // your github username
}
```

**`GET` Request**: Provides information about the user that is currently signed in.


