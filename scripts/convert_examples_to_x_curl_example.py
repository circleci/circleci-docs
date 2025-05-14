import os
import json
from glob import glob

API_SPEC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src-api/api-spec-v1"))
json_files = [f for f in glob(os.path.join(API_SPEC_DIR, "*.json"))]

CURL_PREFIX = "curl "

changed_files = []

def process_examples(obj):
    if isinstance(obj, dict):
        # Look for 'examples' at this level
        if "examples" in obj and isinstance(obj["examples"], dict):
            to_remove = []
            for k, v in obj["examples"].items():
                if (
                    isinstance(v, dict)
                    and "value" in v
                    and isinstance(v["value"], str)
                    and v["value"].strip().startswith(CURL_PREFIX)
                ):
                    # Move to x-curl-example
                    obj["x-curl-example"] = v["value"]
                    to_remove.append(k)
            for k in to_remove:
                del obj["examples"][k]
            # Remove 'examples' if now empty
            if not obj["examples"]:
                del obj["examples"]
        # Recurse
        for v in obj.values():
            process_examples(v)
    elif isinstance(obj, list):
        for item in obj:
            process_examples(item)

for file in json_files:
    with open(file, "r") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Could not parse {file}: {e}")
            continue
    before = json.dumps(data, sort_keys=True)
    process_examples(data)
    after = json.dumps(data, sort_keys=True)
    if before != after:
        with open(file, "w") as f:
            json.dump(data, f, indent=2)
        changed_files.append(file)

if changed_files:
    print("Updated files:")
    for f in changed_files:
        print(f"  {f}")
else:
    print("No files needed updating.")