#!/usr/bin/env python3

import yaml
import json
import sys

def extract_links_from_nav(nav_data):
    """Recursively extract all link values from the navigation structure"""
    links = []

    if isinstance(nav_data, dict):
        if 'link' in nav_data:
            link = nav_data['link']
            # Skip external URLs
            if not link.startswith('http'):
                links.append(link)

        if 'children' in nav_data:
            for child in nav_data['children']:
                links.extend(extract_links_from_nav(child))

    elif isinstance(nav_data, list):
        for item in nav_data:
            links.extend(extract_links_from_nav(item))

    return links

def load_sidenav():
    """Load and parse the sidenav.yml file"""
    with open('sidenav.yml', 'r') as f:
        return yaml.safe_load(f)

def load_xref_mapping():
    """Load and parse the xref-mapping.json file"""
    with open('xref-mapping.json', 'r') as f:
        return json.load(f)

def fix_link_mappings(link):
    """Handle special cases where navigation link names don't match xref mapping keys"""
    mapping_fixes = {
        'webhooks-reference': 'outbound-webhooks-reference',
    }
    return mapping_fixes.get(link, link)

def generate_new_url(page_slug, xref_mapping):
    """Generate new URL from xref mapping (without domain prefix)"""
    # Try to fix the link mapping first
    fixed_slug = fix_link_mappings(page_slug)

    if fixed_slug in xref_mapping:
        mapping = xref_mapping[fixed_slug]
        component = mapping['component']
        module = mapping['module']

        # Handle ROOT module - it doesn't appear in the URL
        if module == 'ROOT':
            return f"/{component}/{fixed_slug}.html"
        else:
            return f"/{component}/{module}/{fixed_slug}.html"

    return None

def process_server_links(link):
    """Handle server administration links which have special paths"""
    if link.startswith('server/'):
        # Extract version and path components
        parts = link.split('/')
        if len(parts) >= 4:
            version = parts[1]  # e.g., 'latest', 'v4.6', etc.
            module = parts[2]   # e.g., 'installation', 'operator', etc.
            page = parts[3]     # e.g., 'phase-1-prerequisites'

            # Map version to component name
            if version == 'latest':
                component = 'server-admin-latest'
            else:
                component = f'server-admin-{version}'

            return f"/{component}/{module}/{page}.html"

    return None

def handle_authentication_links(link):
    """Handle authentication links which have special paths"""
    if link.startswith('authentication/'):
        # Remove 'authentication/' prefix and map to permissions-authentication module
        page_slug = link.replace('authentication/', '')
        return f"/guides/permissions-authentication/{page_slug}.html"

    return None

def handle_deploy_links(link):
    """Handle deploy links which have special paths"""
    if link.startswith('deploy/'):
        # Remove 'deploy/' prefix and map to deploy module
        page_slug = link.replace('deploy/', '')
        return f"/guides/deploy/{page_slug}.html"

    return None

def handle_style_links(link):
    """Handle style links which have special paths"""
    if link.startswith('style/'):
        # Remove 'style/' prefix and map to docs-style module
        page_slug = link.replace('style/', '')
        return f"/contributors/docs-style/{page_slug}.html"

    return None

def handle_templates_links(link):
    """Handle templates links which have special paths"""
    if link.startswith('templates/'):
        # Remove 'templates/' prefix and map to templates module
        page_slug = link.replace('templates/', '')
        return f"/contributors/templates/{page_slug}.html"

    return None

def main():
    # Load data files
    sidenav_data = load_sidenav()
    xref_mapping = load_xref_mapping()

    # Extract English navigation links
    en_nav = sidenav_data.get('en', [])
    links = extract_links_from_nav(en_nav)

    # Remove duplicates and sort
    unique_links = sorted(set(links))

    # Generate redirects
    redirects = []
    unmapped_links = []

    for link in unique_links:
        old_url = f"/{link}/"
        new_url = None

        # Handle special cases first
        if link.startswith('server/'):
            new_url = process_server_links(link)
        elif link.startswith('authentication/'):
            new_url = handle_authentication_links(link)
        elif link.startswith('deploy/'):
            new_url = handle_deploy_links(link)
        elif link.startswith('style/'):
            new_url = handle_style_links(link)
        elif link.startswith('templates/'):
            new_url = handle_templates_links(link)
        else:
            # Try to find in xref mapping
            new_url = generate_new_url(link, xref_mapping)

        if new_url:
            redirects.append({
                'old': old_url,
                'new': new_url
            })
        else:
            unmapped_links.append(link)

    # Print warnings to stderr
    if unmapped_links:
        print(f"Warning: Could not map {len(unmapped_links)} links:", file=sys.stderr)
        for link in unmapped_links:
            print(f"  - {link}", file=sys.stderr)
        print(file=sys.stderr)

    # Generate YAML output
    print("# Generated redirects from Jekyll to Antora")
    print("# Format: old (Jekyll) -> new (Antora)")
    print(f"# Total redirects: {len(redirects)}")
    print()

    for redirect in redirects:
        print(f"- old: {redirect['old']}")
        print(f"  new: {redirect['new']}")
        print()

if __name__ == "__main__":
    main()