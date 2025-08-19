# S3 Redirects Test

Simple test setup to validate AWS S3 website redirect functionality for the CircleCI documentation site.

## Overview

This tests S3's built-in website redirect feature by creating an empty object with redirect metadata. When a user visits the old URL, S3 automatically redirects them to the new URL with a 301 (permanent redirect) status.

## Files

- `scripts/test-single-redirect.sh` - Simple test script with hardcoded redirect
- `scripts/redirects_v2.yml` - Full redirect mappings (for future use)

## How It Works

1. **Test Redirect**: Hardcoded in the script:
   ```
   /about-circleci/ -> /guides/about-circleci/about-circleci/index.html
   ```

2. **Deployment Process**:
   - Create S3 object at `about-circleci/index.html`
   - Set `x-amz-website-redirect-location` metadata to new path
   - S3 automatically handles the redirect

## Usage

### Test Single Redirect

```bash
bash scripts/test-single-redirect.sh "bucket-name"
```

### Manual Testing

Test the deployed redirect:
```bash
curl -I "https://circleci.com/docs/about-circleci/"
```

Should return:
```
HTTP/1.1 301 Moved Permanently
Location: /guides/about-circleci/about-circleci/index.html
```

## CircleCI Integration

The redirect test is integrated into the `deploy-production` job:

1. **Deploy Main Site**: Syncs the Antora build to S3
2. **Deploy Test Redirect**: Creates single redirect object

## AWS Command

The core redirect is created with:
```bash
aws s3api put-object \
    --bucket bucket-name \
    --key about-circleci/index.html \
    --website-redirect-location /guides/about-circleci/about-circleci/index.html \
    --content-type text/html \
    --content-length 0
```

## Next Steps

1. Test this single redirect works
2. If successful, implement batch processing for all 502 redirects in `redirects_v2.yml`
3. The full redirect system can be found in previous git commits

## AWS S3 Website Configuration

Ensure your S3 bucket is configured for static website hosting:
```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document 404.html
```

The redirect functionality requires website hosting to be enabled on the bucket.