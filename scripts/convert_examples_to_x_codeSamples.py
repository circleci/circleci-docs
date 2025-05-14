import os
import json
from glob import glob

API_SPEC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src-api/api-spec-v1"))
json_files = [f for f in glob(os.path.join(API_SPEC_DIR, "*.json"))]

CURL_PREFIX = "curl "

changed_files = []

def add_code_sample(op_obj, curl_str):
    code_sample = {
        "lang": "Shell",
        "label": "cURL",
        "source": curl_str
    }
    if "x-codeSamples" not in op_obj:
        op_obj["x-codeSamples"] = []
    # Avoid duplicates
    if not any(cs.get("source") == curl_str for cs in op_obj["x-codeSamples"]):
        op_obj["x-codeSamples"].append(code_sample)

def process_operation(op_obj):
    # Check for x-curl-example in responses/requestBody/content
    # 1. Responses
    for resp in op_obj.get("responses", {}).values():
        for content in resp.get("content", {}).values():
            curl_str = content.pop("x-curl-example", None)
            if isinstance(curl_str, str) and curl_str.strip().startswith(CURL_PREFIX):
                add_code_sample(op_obj, curl_str)
    # 2. RequestBody
    if "requestBody" in op_obj:
        for content in op_obj["requestBody"].get("content", {}).values():
            curl_str = content.pop("x-curl-example", None)
            if isinstance(curl_str, str) and curl_str.strip().startswith(CURL_PREFIX):
                add_code_sample(op_obj, curl_str)
    # 3. Legacy: scan for examples with curl string (shouldn't be present, but just in case)
    for resp in op_obj.get("responses", {}).values():
        for content in resp.get("content", {}).values():
            examples = content.get("examples", {})
            to_remove = []
            for k, v in examples.items():
                if (
                    isinstance(v, dict)
                    and "value" in v
                    and isinstance(v["value"], str)
                    and v["value"].strip().startswith(CURL_PREFIX)
                ):
                    add_code_sample(op_obj, v["value"])
                    to_remove.append(k)
            for k in to_remove:
                del examples[k]
            if not examples:
                content.pop("examples", None)
    if "requestBody" in op_obj:
        for content in op_obj["requestBody"].get("content", {}).values():
            examples = content.get("examples", {})
            to_remove = []
            for k, v in examples.items():
                if (
                    isinstance(v, dict)
                    and "value" in v
                    and isinstance(v["value"], str)
                    and v["value"].strip().startswith(CURL_PREFIX)
                ):
                    add_code_sample(op_obj, v["value"])
                    to_remove.append(k)
            for k in to_remove:
                del examples[k]
            if not examples:
                content.pop("examples", None)

def process_paths(paths):
    for path_item in paths.values():
        for method in ["get", "post", "put", "delete", "patch", "options", "head", "trace"]:
            if method in path_item:
                process_operation(path_item[method])

for file in json_files:
    with open(file, "r") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Could not parse {file}: {e}")
            continue
    before = json.dumps(data, sort_keys=True)
    if "paths" in data:
        process_paths(data["paths"])
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