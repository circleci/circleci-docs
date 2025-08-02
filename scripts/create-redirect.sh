#!/bin/bash
set -e

# Validate parameters
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <bucket_name> <old_path> <new_path>"
  echo "Example: $0 circleci-docs-platform-assets /about-circleci/ /docs-preview/guides/about-circleci/index.html"
  exit 1
fi

DESTINATION_FOLDER="docs-preview"

BUCKET_NAME="$1"
OLD_PATH="$2"   # must include leading and trailing slash e.g. /about-circleci/
NEW_PATH="/${DESTINATION_FOLDER}$3"   # full target path e.g. /docs-preview/guide/about-circleci/index.html

echo "[INFO] Deploying redirect to bucket: s3://$BUCKET_NAME"
echo "[INFO] Redirect: $OLD_PATH -> $NEW_PATH"

# Convert old path to S3 key (no leading slash before key!)
S3_KEY="${DESTINATION_FOLDER}${OLD_PATH}index.html"

echo "[INFO] Creating S3 object: $S3_KEY"

# Create the redirect object in S3
aws s3api put-object \
  --bucket "$BUCKET_NAME" \
  --key "$S3_KEY" \
  --website-redirect-location "$NEW_PATH" \
  --content-type "text/html" \
  --content-length "0"

echo "[INFO] ✅ Redirect created successfully!"