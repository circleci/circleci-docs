import os
import json
from glob import glob

# Directory containing the OpenAPI JSON files
DIR = os.path.join(os.path.dirname(__file__), "../src-api/api-spec-v1")
OUTPUT_FILE = os.path.join(DIR, "openapi.json")

# List all .json files except the output file itself
json_files = [
    f for f in glob(os.path.join(DIR, "*.json"))
    if not f.endswith("openapi.json")
]

merged = {
    "openapi": "3.0.3",
    "info": {
        "title": "CircleCI API v1 - Combined",
        "version": "1.0.0",
        "description": "Combined OpenAPI spec for CircleCI API v1. Contains all endpoints from artifacts, jobs, envvars, keys, projects, and user."
    },
    "servers": [
        { "url": "https://circleci.com/api/v1.1" }
    ],
    "tags": [],
    "paths": {},
    "components": {
        "securitySchemes": {
            "circleToken": {
                "type": "apiKey",
                "in": "header",
                "name": "Circle-Token"
            }
        },
        "schemas": {}
    }
}

tags_seen = set()

for file in json_files:
    with open(file, "r") as f:
        data = json.load(f)
        # Merge tags
        for tag in data.get("tags", []):
            tag_tuple = (tag["name"], tag.get("description", ""))
            if tag_tuple not in tags_seen:
                merged["tags"].append(tag)
                tags_seen.add(tag_tuple)
        # Merge paths
        for path, path_item in data.get("paths", {}).items():
            if path in merged["paths"]:
                raise ValueError(f"Duplicate path found: {path}")
            merged["paths"][path] = path_item
        # Merge schemas
        schemas = data.get("components", {}).get("schemas", {})
        for schema_name, schema_def in schemas.items():
            if schema_name in merged["components"]["schemas"]:
                # Check if the schema is identical
                if merged["components"]["schemas"][schema_name] != schema_def:
                    print(f"Conflict for schema '{schema_name}':")
                    print("Existing definition:", merged["components"]["schemas"][schema_name])
                    print("New definition:", schema_def)
                    raise ValueError(f"Conflicting schema found: {schema_name}")
              # If identical, skip
            continue
            merged["components"]["schemas"][schema_name] = schema_def

# Write the merged OpenAPI spec
with open(OUTPUT_FILE, "w") as f:
    json.dump(merged, f, indent=2)
print(f"Merged OpenAPI spec written to {OUTPUT_FILE}")