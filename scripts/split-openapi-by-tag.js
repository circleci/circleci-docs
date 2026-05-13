#!/usr/bin/env node

/**
 * Split OpenAPI Spec by Tag
 *
 * Takes a large OpenAPI specification and splits it into separate files per tag.
 * Each output file is a valid OpenAPI spec containing only the paths for that tag
 * along with all referenced components/schemas.
 *
 * Usage:
 *   node split-openapi-by-tag.js <input-spec.json> <output-dir>
 *
 * Example:
 *   node split-openapi-by-tag.js openapi.json build/api/v2/specs/json/
 */

const fs = require('fs');
const path = require('path');

class OpenAPITagSplitter {
  constructor(spec) {
    this.spec = spec;
    this.referencedComponents = new Map(); // Track which components are used by each tag
  }

  /**
   * Split the spec by tags and write output files
   */
  split(outputDir) {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Group paths by tag
    const pathsByTag = this.groupPathsByTag();

    console.log(`📊 Found ${Object.keys(pathsByTag).length} tags`);

    // Generate a spec for each tag
    const results = [];
    Object.entries(pathsByTag).forEach(([tag, paths]) => {
      const tagSlug = this.slugify(tag);
      const outputFile = path.join(outputDir, `${tagSlug}.json`);

      // Build minimal valid spec for this tag
      const tagSpec = this.buildTagSpec(tag, paths);

      // Write to file
      fs.writeFileSync(outputFile, JSON.stringify(tagSpec, null, 2));

      const stats = {
        tag,
        slug: tagSlug,
        endpoints: Object.keys(paths).length,
        file: outputFile,
        size: fs.statSync(outputFile).size
      };

      results.push(stats);
      console.log(`  ✅ ${tag}: ${stats.endpoints} endpoints → ${tagSlug}.json (${Math.round(stats.size / 1024)}KB)`);
    });

    // Also write the full spec
    const fullOutputFile = path.join(outputDir, 'full.json');
    fs.writeFileSync(fullOutputFile, JSON.stringify(this.spec, null, 2));
    console.log(`  ✅ Full spec → full.json (${Math.round(fs.statSync(fullOutputFile).size / 1024)}KB)`);

    return results;
  }

  /**
   * Group paths by their tags
   */
  groupPathsByTag() {
    const pathsByTag = {};

    Object.entries(this.spec.paths || {}).forEach(([pathName, pathItem]) => {
      // Check each HTTP method in this path
      ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].forEach(method => {
        const operation = pathItem[method];
        if (!operation) return;

        // Get tags for this operation
        const tags = operation.tags || ['untagged'];

        tags.forEach(tag => {
          if (!pathsByTag[tag]) {
            pathsByTag[tag] = {};
          }

          // If we haven't added this path yet, add the whole pathItem
          if (!pathsByTag[tag][pathName]) {
            pathsByTag[tag][pathName] = pathItem;
          }
        });
      });
    });

    return pathsByTag;
  }

  /**
   * Build a minimal valid OpenAPI spec for a specific tag
   */
  buildTagSpec(tag, paths) {
    // Reset referenced components for this tag
    this.referencedComponents.clear();

    // Find all referenced components in these paths
    this.findReferencedComponents(paths);

    // Build the filtered components object
    const filteredComponents = this.buildFilteredComponents();

    // Construct the tag-specific spec
    const tagSpec = {
      openapi: this.spec.openapi,
      info: {
        ...this.spec.info,
        title: `${this.spec.info.title} - ${tag}`,
        description: `${tag} endpoints from CircleCI API v2`
      },
      servers: this.spec.servers,
      security: this.spec.security,
      paths: paths,
      components: filteredComponents
    };

    // Add tags definition if present
    if (this.spec.tags) {
      const relevantTag = this.spec.tags.find(t => t.name === tag);
      if (relevantTag) {
        tagSpec.tags = [relevantTag];
      }
    }

    return tagSpec;
  }

  /**
   * Find all component references in the given paths object
   */
  findReferencedComponents(obj, visited = new Set()) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Prevent infinite recursion
    const objKey = JSON.stringify(obj);
    if (visited.has(objKey)) {
      return;
    }
    visited.add(objKey);

    // Check if this object has a $ref
    if (obj.$ref && typeof obj.$ref === 'string') {
      this.recordReference(obj.$ref);

      // Recursively find references in the referenced component
      const referencedObj = this.resolveReference(obj.$ref);
      if (referencedObj) {
        this.findReferencedComponents(referencedObj, visited);
      }
    }

    // Recursively check all properties
    if (Array.isArray(obj)) {
      obj.forEach(item => this.findReferencedComponents(item, visited));
    } else {
      Object.values(obj).forEach(value => {
        this.findReferencedComponents(value, visited);
      });
    }
  }

  /**
   * Record a reference to a component
   */
  recordReference(ref) {
    // Parse the reference (e.g., "#/components/schemas/Pipeline")
    const match = ref.match(/^#\/components\/([^/]+)\/(.+)$/);
    if (!match) return;

    const [, componentType, componentName] = match;

    if (!this.referencedComponents.has(componentType)) {
      this.referencedComponents.set(componentType, new Set());
    }

    this.referencedComponents.get(componentType).add(componentName);
  }

  /**
   * Resolve a $ref to its actual object in the spec
   */
  resolveReference(ref) {
    // Parse reference like "#/components/schemas/Pipeline"
    const match = ref.match(/^#\/components\/([^/]+)\/(.+)$/);
    if (!match) return null;

    const [, componentType, componentName] = match;
    return this.spec.components?.[componentType]?.[componentName];
  }

  /**
   * Build a components object containing only referenced components
   */
  buildFilteredComponents() {
    if (!this.spec.components) {
      return {};
    }

    const filtered = {};

    // For each component type (schemas, parameters, responses, etc.)
    this.referencedComponents.forEach((names, componentType) => {
      if (!this.spec.components[componentType]) return;

      filtered[componentType] = {};

      names.forEach(name => {
        if (this.spec.components[componentType][name]) {
          filtered[componentType][name] = this.spec.components[componentType][name];
        }
      });
    });

    // Always include securitySchemes if they exist (needed for auth)
    if (this.spec.components.securitySchemes) {
      filtered.securitySchemes = this.spec.components.securitySchemes;
    }

    return filtered;
  }

  /**
   * Convert tag name to a filename-safe slug
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start
      .replace(/-+$/, '');         // Trim - from end
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node split-openapi-by-tag.js <input-spec.json> <output-dir>');
    console.error('');
    console.error('Example:');
    console.error('  node split-openapi-by-tag.js openapi.json build/api/v2/specs/json/');
    process.exit(1);
  }

  const [inputFile, outputDir] = args;

  // Read the OpenAPI spec
  console.log(`📖 Reading OpenAPI spec from ${inputFile}...`);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading spec file: ${error.message}`);
    process.exit(1);
  }

  // Validate it's an OpenAPI spec
  if (!spec.openapi || !spec.paths) {
    console.error('❌ Invalid OpenAPI spec: missing required fields (openapi, paths)');
    process.exit(1);
  }

  // Split the spec
  console.log('🔨 Splitting spec by tags...');
  const splitter = new OpenAPITagSplitter(spec);

  try {
    const results = splitter.split(outputDir);
    console.log(`\n✨ Successfully split into ${results.length} tag-specific specs`);
  } catch (error) {
    console.error(`❌ Error splitting spec: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { OpenAPITagSplitter };
