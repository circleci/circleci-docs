curl -X POST https://api.twist.com/api/v3/users/login \
  -d email=user@example.com \
  -d password=secret
