#!/bin/bash

set -e

# Check required parameters
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <bucket_name> <redirects_file>"
    echo "Example: $0 circleci-docs-platform-assets/docs-preview scripts/redirects_v2.yml"
    exit 1
fi

BUCKET_NAME="$1"
REDIRECTS_FILE="$2"
TEMP_DIR=$(mktemp -d)
BATCH_SIZE=50

echo "[INFO] Processing redirects from $REDIRECTS_FILE to bucket s3://$BUCKET_NAME"
echo "[INFO] Using temporary directory: $TEMP_DIR"

# Cleanup function
cleanup() {
    echo "[INFO] Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Check if redirects file exists
if [ ! -f "$REDIRECTS_FILE" ]; then
    echo "[ERROR] Redirects file not found: $REDIRECTS_FILE"
    exit 1
fi

# Parse YAML and create redirect objects in batches
python3 << 'EOF'
import yaml
import subprocess
import sys
import os
import tempfile
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

bucket_name = sys.argv[1]
redirects_file = sys.argv[2]
temp_dir = sys.argv[3]
batch_size = int(sys.argv[4])

print(f"[INFO] Loading redirects from {redirects_file}")

def create_redirect_object(bucket, key, redirect_location):
    """Create a single redirect object using aws s3api put-object"""
    try:
        cmd = [
            'aws', 's3api', 'put-object',
            '--bucket', bucket,
            '--key', key,
            '--website-redirect-location', redirect_location,
            '--content-type', 'text/html',
            '--content-length', '0'
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
        return True, key, None
    except subprocess.CalledProcessError as e:
        return False, key, f"S3 API error: {e.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return False, key, "Request timeout"
    except Exception as e:
        return False, key, f"Unexpected error: {str(e)}"

def process_batch(batch_redirects):
    """Process a batch of redirects with thread pool"""
    success_count = 0
    error_count = 0
    errors = []

    # Use ThreadPoolExecutor for concurrent uploads
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_redirect = {}

        for redirect in batch_redirects:
            old_path = redirect['old'].rstrip('/')
            new_path = redirect['new']

            # Ensure paths start with /
            if not old_path.startswith('/'):
                old_path = '/' + old_path
            if not new_path.startswith('/'):
                new_path = '/' + new_path

            # S3 object key (remove leading slash for S3)
            s3_key = old_path.lstrip('/')

            # If the old path doesn't end with a file extension, add index.html
            if not s3_key.endswith('.html') and not s3_key.endswith('/'):
                s3_key += '/index.html'
            elif s3_key.endswith('/'):
                s3_key += 'index.html'

            future = executor.submit(create_redirect_object, bucket_name, s3_key, new_path)
            future_to_redirect[future] = (old_path, new_path, s3_key)

        # Collect results
        for future in as_completed(future_to_redirect):
            old_path, new_path, s3_key = future_to_redirect[future]
            success, key, error = future.result()

            if success:
                success_count += 1
                print(f"[SUCCESS] {old_path} -> {new_path}")
            else:
                error_count += 1
                error_msg = f"{old_path} -> {new_path}: {error}"
                errors.append(error_msg)
                print(f"[ERROR] {error_msg}")

    return success_count, error_count, errors

try:
    with open(redirects_file, 'r') as f:
        redirects = yaml.safe_load(f)

    if not redirects:
        print("[WARN] No redirects found in file")
        sys.exit(0)

    total_redirects = len(redirects)
    print(f"[INFO] Found {total_redirects} redirects to process")
    print(f"[INFO] Processing in batches of {batch_size} with concurrent uploads")

    total_success = 0
    total_errors = 0
    all_errors = []

    # Process redirects in batches
    for i in range(0, total_redirects, batch_size):
        batch = redirects[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total_redirects + batch_size - 1) // batch_size

        print(f"[INFO] Processing batch {batch_num}/{total_batches} ({len(batch)} redirects)")

        success_count, error_count, errors = process_batch(batch)
        total_success += success_count
        total_errors += error_count
        all_errors.extend(errors)

        print(f"[INFO] Batch {batch_num} complete: {success_count} success, {error_count} errors")

    print(f"[INFO] Redirect processing complete:")
    print(f"[INFO] - Total redirects processed: {total_redirects}")
    print(f"[INFO] - Successfully created: {total_success}")
    print(f"[INFO] - Errors: {total_errors}")

    if all_errors:
        print(f"[ERROR] Failed redirects:")
        for error in all_errors[:10]:  # Show first 10 errors
            print(f"[ERROR] - {error}")
        if len(all_errors) > 10:
            print(f"[ERROR] ... and {len(all_errors) - 10} more errors")

    # Exit with error if too many failed
    if total_errors > total_redirects * 0.1:  # More than 10% failed
        print(f"[ERROR] Too many redirects failed ({total_errors}/{total_redirects})")
        sys.exit(1)

    if total_errors > 0:
        print(f"[WARN] {total_errors} redirects failed, but continuing since error rate is acceptable")

except Exception as e:
    print(f"[ERROR] Failed to process redirects: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

EOF "$BUCKET_NAME" "$REDIRECTS_FILE" "$TEMP_DIR" "$BATCH_SIZE"

echo "[INFO] Redirects deployment completed successfully"