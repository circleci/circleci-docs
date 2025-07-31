import os
import re
import json
import sys

# Directory containing the new Antora docs
DOCS_DIR = "docs"
# Path to the mapping file generated from old-docs frontmatter
MAPPING_FILE = "scripts/xref-mapping.json"

# Load the mapping from the JSON file
with open(MAPPING_FILE, "r", encoding="utf-8") as f:
    mapping = json.load(f)

# Regular expression to match xref macros in AsciiDoc files
# Matches: xref:target[#fragment][link text]
xref_re = re.compile(
    r'(xref:)([a-zA-Z0-9_\-./]+)(\.adoc)?(#[^\\[]*)?\[(.*?)\]'
)

def normalize_target(target):
    # Remove any leading ../ or ./ segments
    while target.startswith("../") or target.startswith("./"):
        target = target[3:]
    # If there's still a path, get only the last part (the filename)
    if "/" in target:
        target = target.split("/")[-1]
    return target

def get_shortest_xref(current, target):
    """
    Given the current file's (component, module) and the target's (component, module, filename),
    return the shortest possible Antora xref resource ID.
    - Same module: filename.adoc
    - Same component, different module: module:filename.adoc
    - Different component: component:module:filename.adoc
    """
    cur_component, cur_module = current
    tgt_component = target["component"]
    tgt_module = target["module"]
    tgt_filename = target["filename"]

    if cur_component == tgt_component and cur_module == tgt_module:
        # Same module: just filename
        return tgt_filename
    elif cur_component == tgt_component:
        # Same component, different module
        return f"{tgt_module}:{tgt_filename}"
    else:
        # Different component
        return f"{tgt_component}:{tgt_module}:{tgt_filename}"

def process_file(filepath):
    """
    Read a file, update all xrefs, and overwrite the file if changes were made.
    """
    basename = os.path.splitext(os.path.basename(filepath))[0]
    current = None
    # Find the current file's component/module in the mapping
    if basename in mapping:
        cur_entry = mapping[basename]
        current = (cur_entry["component"], cur_entry["module"])
    else:
        print(f"WARNING: No mapping for current file {basename}, using full xref format.")
        current = (None, None)

    def fix_xref(match):
        prefix, target, ext, fragment, link_text = match.groups()
        norm_target = normalize_target(target)
        tgt_entry = mapping.get(norm_target)
        if tgt_entry and current[0] and current[1]:
            resource_id = get_shortest_xref(current, tgt_entry)
        elif tgt_entry:
            resource_id = f"{tgt_entry['component']}:{tgt_entry['module']}:{tgt_entry['filename']}"
        else:
            print(f"WARNING: No mapping found for xref target '{norm_target}' (original: '{target}')")
            resource_id = norm_target + ".adoc"
        fragment_str = fragment or ""
        return f"{prefix}{resource_id}{fragment_str}[{link_text}]"

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = xref_re.sub(fix_xref, content)
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def main():
    """
    Walk through all .adoc files in DOCS_DIR and update their xrefs.
    Or process a single file if provided as a command-line argument.
    """
    if len(sys.argv) > 1:
        # Process single file provided as argument
        filepath = sys.argv[1]
        if not os.path.exists(filepath):
            print(f"ERROR: File '{filepath}' does not exist.")
            sys.exit(1)
        if not filepath.endswith('.adoc'):
            print(f"ERROR: File '{filepath}' is not an .adoc file.")
            sys.exit(1)
        print(f"Processing single file: {filepath}")
        process_file(filepath)
    else:
        # Process all files in DOCS_DIR
        for root, _, files in os.walk(DOCS_DIR):
            for file in files:
                if file.endswith(".adoc"):
                    full_path = os.path.join(root, file)
                    print(f"Processing: {full_path}")
                    process_file(full_path)

if __name__ == "__main__":
    main()