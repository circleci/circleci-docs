#!/bin/bash

set -ex

base_dir="jekyll"
data_dir="$base_dir/_data/build-image-versions"
env_dir="$base_dir/environments"

function get_latest_version_file() {
    local image=$1

    # Sort by build num in the image name
    latest_version_file=$(ls -1 $data_dir/*$image*.json | sort -r -t "-" -k4,4 | head -1)

    echo $latest_version_file
}

image=$1

cp $(get_latest_version_file "$image") $env_dir/$image.json
