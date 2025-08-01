#!/bin/bash

set -e

# Check required parameter
if [ -z "$1" ]; then
    echo "Usage: $0 <bucket_name>"
    echo "Example: $0 circleci-docs-platform-assets/docs-preview"
    exit 1
fi

BUCKET_NAME="$1"

# Hardcoded single redirect for testing
OLD_PATH="/about-circleci/"
NEW_PATH="/guides/about-circleci/about-circleci/index.html"

echo "[INFO] Testing single redirect deployment to bucket: s3://$BUCKET_NAME"
echo "[INFO] Redirect: $OLD_PATH -> $NEW_PATH"

# Convert old path to S3 key
S3_KEY="about-circleci/index.html"

echo "[INFO] Creating S3 object: $S3_KEY"
echo "[INFO] With redirect to: $NEW_PATH"

# Create the redirect object
aws s3api put-object \
    --bucket "$BUCKET_NAME" \
    --key "$S3_KEY" \
    --website-redirect-location "$NEW_PATH" \
    --content-type "text/html" \
    --content-length "0"

echo "[INFO] ✅ Redirect created successfully!"
echo "[INFO] Test with: curl -I https://your-domain/about-circleci/"