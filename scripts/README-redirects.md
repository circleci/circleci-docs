# S3 Redirects Deployment System

This documentation explains how to deploy URL redirects for the CircleCI documentation site using AWS S3's website redirect functionality.

## Overview

The redirect system uses AWS S3's built-in website redirect feature by creating empty objects with redirect metadata. When a user visits an old URL, S3 automatically redirects them to the new URL with a 301 (permanent redirect) status.

## Files

- `scripts/redirects_v2.yml` - YAML file containing all redirect mappings
- `scripts/deploy-redirects-batch.sh` - Optimized batch deployment script

## How It Works

1. **Redirect File Format**: The `redirects_v2.yml` file contains redirect mappings:
   ```yaml
   - old: /about-circleci/
     new: /guides/about-circleci/about-circleci/index.html
   ```

2. **Deployment Process**:
   - Parse the YAML file
   - For each redirect, create an S3 object at the old path
   - Set the `x-amz-website-redirect-location` metadata to the new path
   - S3 automatically handles the redirect

3. **URL Mapping**:
   - Old paths like `/about-circleci/` become S3 objects at `about-circleci/index.html`
   - When accessed, S3 returns a 301 redirect to the new location

## Usage

### Deploy Redirects

The redirect deployment is integrated into the CircleCI pipeline and runs automatically after the main site deployment.

Manual deployment:
```bash
bash scripts/deploy-redirects-batch.sh "bucket-name" "scripts/redirects_v2.yml"
```



## Performance Considerations

### Batch Processing
The `deploy-redirects-batch.sh` script is optimized for handling redirects efficiently:
- Processes redirects in batches of 50
- Uses concurrent uploads (10 parallel requests)
- Includes error handling and retry logic
- Handles hundreds of redirects quickly

### Rate Limiting
- The deployment script includes appropriate rate limiting
- Batch script uses thread pools to manage concurrency

## CircleCI Integration

The redirect deployment is integrated into the `deploy-production` job:

1. **Install Dependencies**: Installs PyYAML for YAML parsing
2. **Deploy Main Site**: Syncs the Antora build to S3
3. **Deploy Redirects**: Creates redirect objects using the batch script

## Adding New Redirects

1. Edit `scripts/redirects_v2.yml`
2. Add new redirect mapping:
   ```yaml
   - old: /old-path/
     new: /new-path/index.html
   ```
3. Commit and push - redirects will be deployed automatically

## Redirect Format Guidelines

- **Old paths**: Should start with `/` and can end with or without `/`
- **New paths**: Should be the full path to the new location
- **Index files**: Old paths without file extensions automatically get `index.html` appended
- **Trailing slashes**: Old paths are normalized (trailing slashes removed)

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure AWS credentials have S3 write permissions
2. **YAML Parse Errors**: Validate YAML syntax in redirects file
3. **S3 Bucket Errors**: Verify bucket name and region settings

### Checking Redirect Status

Use curl to test individual redirects:
```bash
curl -I "https://circleci.com/docs/about-circleci/"
```

Should return:
```
HTTP/1.1 301 Moved Permanently
Location: /guides/about-circleci/about-circleci/index.html
```

### Debugging

1. Check CircleCI logs for deployment errors
2. Test redirects manually with curl or browser
3. Manually inspect S3 objects and their metadata

## Best Practices

1. **Test Manually**: Use curl or browser to spot-check redirects when needed
2. **Batch Operations**: Use the batch script for large numbers of redirects
3. **Monitor Performance**: Keep an eye on deployment times and error rates
4. **Clean URLs**: Ensure redirect paths are clean and consistent
5. **Backup**: Keep backup of working redirect files before major changes

## AWS S3 Website Configuration

Ensure your S3 bucket is configured for static website hosting:
```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document 404.html
```

The redirect functionality requires website hosting to be enabled on the bucket.