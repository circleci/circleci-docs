#!/usr/bin/env node

/**
 * Generate API Discovery Manifest
 *
 * Generates a discovery manifest (index.json) for the split API documentation.
 * This manifest helps AI agents and other consumers discover and navigate the
 * available API documentation in both markdown and JSON formats.
 *
 * Usage:
 *   node generate-discovery-manifest.js <specs-dir> <output-file>
 *
 * Example:
 *   node generate-discovery-manifest.js build/api/v2/specs build/api/v2/specs/index.json
 */

const fs = require('fs');
const path = require('path');

class DiscoveryManifestGenerator {
  constructor(specsDir, baseUrl = 'https://circleci.com/docs') {
    this.specsDir = specsDir;
    this.baseUrl = baseUrl;
    this.jsonDir = path.join(specsDir, 'json');
    this.markdownDir = path.join(specsDir, 'markdown');

    // Feature use cases mapping
    this.useCasesMap = {
      'pipeline': [
        'trigger a new pipeline',
        'check pipeline status',
        'list pipelines for a project',
        'continue a pipeline from setup phase'
      ],
      'project': [
        'create a new project',
        'list user projects',
        'get project details',
        'manage project settings',
        'configure checkout keys',
        'manage environment variables'
      ],
      'insights': [
        'get workflow metrics',
        'analyze test results',
        'track credit usage',
        'monitor job performance',
        'view time series data'
      ],
      'context': [
        'create contexts for secrets',
        'manage environment variables',
        'list organization contexts',
        'delete contexts'
      ],
      'workflow': [
        'get workflow details',
        'rerun a workflow',
        'list workflow jobs',
        'cancel a workflow',
        'approve manual jobs'
      ],
      'job': [
        'get job details',
        'cancel a job',
        'get job artifacts',
        'get test metadata',
        'view job logs'
      ],
      'schedule': [
        'create scheduled pipelines',
        'manage cron schedules',
        'list project schedules',
        'update schedule settings'
      ],
      'webhook': [
        'create outbound webhooks',
        'configure webhook events',
        'list webhooks',
        'test webhook delivery'
      ],
      'organization': [
        'get organization details',
        'manage org settings',
        'configure URL orb allow-list'
      ],
      'user': [
        'get current user info',
        'view collaborations',
        'manage user preferences'
      ],
      'policy-management': [
        'create policy bundles',
        'make policy decisions',
        'configure decision settings',
        'manage compliance policies'
      ],
      'oidc-token-management': [
        'configure OIDC claims',
        'customize token claims',
        'manage org-level claims',
        'manage project-level claims'
      ],
      'trigger': [
        'configure pipeline triggers',
        'manage scheduled triggers',
        'update trigger settings'
      ],
      'deploy': [
        'track deployments',
        'manage environments',
        'view deployment history',
        'configure deployment components'
      ],
      'usage': [
        'export usage data',
        'track credit consumption',
        'generate usage reports'
      ],
      'groups': [
        'manage user groups',
        'configure group permissions',
        'delete groups'
      ],
      'pipeline-definition': [
        'create pipeline definitions',
        'manage pipeline configs',
        'update pipeline settings'
      ],
      'rollback': [
        'rollback project deployments',
        'revert to previous versions'
      ],
      'otel': [
        'configure OpenTelemetry exporters',
        'manage OTLP integrations',
        'export observability data'
      ]
    };
  }

  /**
   * Generate the discovery manifest
   */
  generate() {
    console.log('📊 Scanning API documentation files...');

    // Get all JSON and markdown files
    const jsonFiles = this.getFiles(this.jsonDir, '.json');
    const markdownFiles = this.getFiles(this.markdownDir, '.md');

    console.log(`   Found ${jsonFiles.length} JSON specs`);
    console.log(`   Found ${markdownFiles.length} Markdown docs`);

    // Build features array
    const features = this.buildFeaturesArray(jsonFiles, markdownFiles);

    // Calculate totals
    const totalEndpoints = features.reduce((sum, f) => sum + f.endpoints, 0);
    const totalMarkdownSize = features.reduce((sum, f) => sum + f.markdown_size_kb, 0);
    const totalJsonSize = features.reduce((sum, f) => sum + f.json_size_kb, 0);
    const sizeReduction = Math.round((1 - totalMarkdownSize / totalJsonSize) * 100);

    // Build the manifest
    const manifest = {
      openapi_version: '3.0.3',
      description: 'CircleCI API v2 - Optimized for AI agent consumption',
      updated: new Date().toISOString().split('T')[0],
      llms_txt: `${this.baseUrl}/llms.txt`,
      total_endpoints: totalEndpoints,
      total_features: features.length,
      formats: {
        markdown: {
          description: 'LLM-optimized natural language documentation',
          total_size_kb: totalMarkdownSize,
          size_reduction_vs_json: `${sizeReduction}%`,
          recommended_for: 'AI agents, LLMs, quick reference'
        },
        json: {
          description: 'OpenAPI 3.0.3 specifications',
          total_size_kb: totalJsonSize,
          recommended_for: 'Code generation, validation, tooling, SDK generation'
        }
      },
      features: features.sort((a, b) => a.name.localeCompare(b.name))
    };

    return manifest;
  }

  /**
   * Build the features array from JSON and markdown files
   */
  buildFeaturesArray(jsonFiles, markdownFiles) {
    const features = [];

    // Process each JSON file
    jsonFiles.forEach(jsonFile => {
      if (jsonFile === 'full.json') return; // Skip full spec

      const tag = path.basename(jsonFile, '.json');
      const jsonPath = path.join(this.jsonDir, jsonFile);
      const markdownFile = `${tag}.md`;
      const markdownPath = path.join(this.markdownDir, markdownFile);

      // Read the JSON spec to get endpoint count and title
      let spec;
      try {
        spec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (error) {
        console.error(`   ⚠️  Failed to read ${jsonFile}: ${error.message}`);
        return;
      }

      // Count endpoints
      const endpoints = this.countEndpoints(spec);

      // Get file sizes
      const jsonSize = this.getFileSize(jsonPath);
      const markdownSize = fs.existsSync(markdownPath) ? this.getFileSize(markdownPath) : 0;

      // Get feature name from spec
      const featureName = this.extractFeatureName(spec, tag);

      // Get use cases
      const useCases = this.useCasesMap[tag] || [
        'manage resources',
        'view information',
        'configure settings'
      ];

      // Build feature object
      const feature = {
        tag: tag,
        name: featureName,
        endpoints: endpoints,
        description: spec.info.description || `${featureName} endpoints`,
        use_cases: useCases,
        markdown: `${this.baseUrl}/api/v2/specs/markdown/${markdownFile}`,
        markdown_size_kb: markdownSize,
        json: `${this.baseUrl}/api/v2/specs/json/${jsonFile}`,
        json_size_kb: jsonSize
      };

      features.push(feature);
    });

    return features;
  }

  /**
   * Get all files in a directory with a specific extension
   */
  getFiles(dir, extension) {
    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs.readdirSync(dir)
      .filter(file => file.endsWith(extension))
      .sort();
  }

  /**
   * Get file size in KB
   */
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  }

  /**
   * Count endpoints in an OpenAPI spec
   */
  countEndpoints(spec) {
    let count = 0;

    Object.values(spec.paths || {}).forEach(pathItem => {
      ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].forEach(method => {
        if (pathItem[method]) {
          count++;
        }
      });
    });

    return count;
  }

  /**
   * Extract feature name from spec
   */
  extractFeatureName(spec, fallbackTag) {
    // Try to get from spec.info.title
    if (spec.info.title) {
      // Remove "CircleCI API - " prefix if present
      const title = spec.info.title.replace(/^CircleCI API v?\d* - /i, '');
      if (title && title !== spec.info.title) {
        return title;
      }
    }

    // Try to get from spec.tags
    if (spec.tags && spec.tags.length > 0) {
      return spec.tags[0].name;
    }

    // Fallback: capitalize tag
    return fallbackTag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-discovery-manifest.js <specs-dir> <output-file>');
    console.error('');
    console.error('Example:');
    console.error('  node generate-discovery-manifest.js build/api/v2/specs build/api/v2/specs/index.json');
    process.exit(1);
  }

  const [specsDir, outputFile] = args;

  // Validate specs directory exists
  if (!fs.existsSync(specsDir)) {
    console.error(`❌ Specs directory does not exist: ${specsDir}`);
    process.exit(1);
  }

  // Generate the manifest
  console.log('🔨 Generating discovery manifest...');
  const generator = new DiscoveryManifestGenerator(specsDir);

  try {
    const manifest = generator.generate();

    // Write to file
    fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Discovery manifest generated successfully`);
    console.log(`   Total features: ${manifest.total_features}`);
    console.log(`   Total endpoints: ${manifest.total_endpoints}`);
    console.log(`   Size reduction: ${manifest.formats.markdown.size_reduction_vs_json}`);
    console.log(`   Output: ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error generating manifest: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { DiscoveryManifestGenerator };
