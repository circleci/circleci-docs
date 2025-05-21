import os
import re
import yaml
import json

OLD_DOCS_DIR = "old-docs"
OUTPUT_FILE = "scripts/xref-mapping.json"

def extract_frontmatter(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    # Match YAML frontmatter between --- lines at the top
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1))
        return frontmatter
    return {}

def build_mapping():
    mapping = {}
    for root, _, files in os.walk(OLD_DOCS_DIR):
        for file in files:
            if file.endswith(".adoc"):
                path = os.path.join(root, file)
                frontmatter = extract_frontmatter(path)
                old_name = os.path.splitext(file)[0]
                component = frontmatter.get("component")
                module = frontmatter.get("module")
                if component and module:
                    mapping[old_name] = {
                        "component": component,
                        "module": module,
                        "filename": file
                    }
    return mapping

if __name__ == "__main__":
    mapping = build_mapping()
    # Save mapping as JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"Mapping saved to {OUTPUT_FILE}")