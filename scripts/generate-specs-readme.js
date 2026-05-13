#!/usr/bin/env node

/**
 * Generate Specs README
 *
 * Generates a human-readable README.md file for the API specs directory.
 * The README provides an overview and quick start guide for both AI agents
 * and human developers.
 *
 * Usage:
 *   node generate-specs-readme.js <manifest-file> <output-file>
 *
 * Example:
 *   node generate-specs-readme.js build/api/v2/specs/index.json build/api/v2/specs/README.md
 */

const fs = require('fs');
const path = require('path');

class SpecsReadmeGenerator {
  constructor(manifest) {
    this.manifest = manifest;
  }

  /**
   * Generate the README content
   */
  generate() {
    let readme = '';

    // Title and introduction
    readme += this.generateTitle();
    readme += this.generateIntroduction();
    readme += this.generateQuickStart();
    readme += this.generateAvailableAPIs();
    readme += this.generateFormatComparison();
    readme += this.generateAuthentication();
    readme += this.generateRateLimits();
    readme += this.generateSupport();

    return readme;
  }

  /**
   * Generate title section
   */
  generateTitle() {
    return '# CircleCI API v2 Specifications\n\n';
  }

  /**
   * Generate introduction
   */
  generateIntroduction() {
    let md = 'API documentation optimized for AI agents and LLM consumption.\n\n';

    md += `**Last Updated:** ${this.manifest.updated}\n\n`;
    md += `**Total Endpoints:** ${this.manifest.total_endpoints} across ${this.manifest.total_features} feature areas\n\n`;

    md += '---\n\n';

    return md;
  }

  /**
   * Generate quick start section
   */
  generateQuickStart() {
    let md = '## Quick Start for AI Agents\n\n';

    md += '**Recommended:** Use markdown format (smaller, natural language, easier to parse)\n\n';

    md += '### Discovery Process\n\n';
    md += '1. **View available APIs:** Check this [discovery manifest](index.json) for a complete list of features\n';
    md += '2. **Choose relevant API:** Select based on your use case (e.g., "pipeline" for CI/CD operations)\n';
    md += '3. **Fetch documentation:** Load the markdown file for that feature\n';
    md += '4. **Parse and use:** Extract endpoint details, parameters, and examples\n\n';

    md += '### Example: Using Pipeline APIs\n\n';
    md += '```bash\n';
    md += '# Fetch the pipeline API documentation\n';
    md += 'curl https://circleci.com/docs/api/v2/specs/markdown/pipeline.md\n\n';
    md += '# Or use the discovery manifest to list all available features\n';
    md += 'curl https://circleci.com/docs/api/v2/specs/index.json | jq .features[].name\n';
    md += '```\n\n';

    md += '---\n\n';

    return md;
  }

  /**
   * Generate available APIs table
   */
  generateAvailableAPIs() {
    let md = '## Available APIs\n\n';

    // Create table
    md += '| Feature | Endpoints | Use Cases | Markdown | JSON |\n';
    md += '|---------|-----------|-----------|----------|------|\n';

    this.manifest.features.forEach(feature => {
      const name = feature.name;
      const endpoints = feature.endpoints;
      const useCases = feature.use_cases.slice(0, 2).join(', ');
      const markdownLink = `[${feature.tag}.md](markdown/${feature.tag}.md)`;
      const jsonLink = `[${feature.tag}.json](json/${feature.tag}.json)`;

      md += `| **${name}** | ${endpoints} | ${useCases} | ${markdownLink} | ${jsonLink} |\n`;
    });

    md += '\n';

    // Add feature details
    md += '### Feature Details\n\n';

    this.manifest.features.forEach(feature => {
      md += `**${feature.name}** (${feature.endpoints} endpoints)\n`;
      md += `- ${feature.description}\n`;
      md += `- Use cases:\n`;
      feature.use_cases.forEach(useCase => {
        md += `  - ${useCase}\n`;
      });
      md += `- Markdown: ${feature.markdown_size_kb}KB | JSON: ${feature.json_size_kb}KB\n`;
      md += '\n';
    });

    md += '---\n\n';

    return md;
  }

  /**
   * Generate format comparison section
   */
  generateFormatComparison() {
    let md = '## Format Comparison\n\n';

    const markdown = this.manifest.formats.markdown;
    const json = this.manifest.formats.json;

    md += '### Markdown Format (Recommended for LLMs)\n\n';
    md += `${markdown.description}\n\n`;
    md += '**Benefits:**\n';
    md += `- **${markdown.size_reduction_vs_json} smaller** than JSON format\n`;
    md += '- Natural language descriptions\n';
    md += '- Inline code examples\n';
    md += '- Easy to parse and understand\n';
    md += `- Total size: ~${markdown.total_size_kb}KB for all ${this.manifest.total_features} features\n\n`;
    md += `**Best for:** ${markdown.recommended_for}\n\n`;

    md += '### JSON Format (For Tooling)\n\n';
    md += `${json.description}\n\n`;
    md += '**Benefits:**\n';
    md += '- Precise OpenAPI 3.0.3 format\n';
    md += '- Machine-parseable schemas\n';
    md += '- Type definitions and validation rules\n';
    md += '- Compatible with OpenAPI tooling\n';
    md += `- Total size: ~${json.total_size_kb}KB for all ${this.manifest.total_features} features\n\n`;
    md += `**Best for:** ${json.recommended_for}\n\n`;

    md += '### Size Comparison\n\n';
    md += '```\n';
    md += `Markdown: ${markdown.total_size_kb}KB  ███░░░░░░░ (${markdown.size_reduction_vs_json} smaller)\n`;
    md += `JSON:     ${json.total_size_kb}KB  ██████████\n`;
    md += '```\n\n';

    md += '---\n\n';

    return md;
  }

  /**
   * Generate authentication section
   */
  generateAuthentication() {
    let md = '## Authentication\n\n';

    md += 'All CircleCI API requests require authentication.\n\n';

    md += '### API Token (Recommended)\n\n';
    md += 'Include your API token in the request header:\n\n';
    md += '```bash\n';
    md += 'curl -H "Circle-Token: YOUR_API_TOKEN" \\\n';
    md += '  https://circleci.com/api/v2/me\n';
    md += '```\n\n';

    md += '### Getting Your API Token\n\n';
    md += '1. Log in to CircleCI\n';
    md += '2. Go to [User Settings > Personal API Tokens](https://app.circleci.com/settings/user/tokens)\n';
    md += '3. Create a new token\n';
    md += '4. Store it securely (e.g., as environment variable `CIRCLE_TOKEN`)\n\n';

    md += '### Token Security\n\n';
    md += '- **Never commit tokens** to version control\n';
    md += '- Use environment variables or secure secret storage\n';
    md += '- Rotate tokens regularly\n';
    md += '- Use project-specific tokens when possible\n\n';

    md += '---\n\n';

    return md;
  }

  /**
   * Generate rate limits section
   */
  generateRateLimits() {
    let md = '## Rate Limits\n\n';

    md += '**Default Limits:**\n';
    md += '- 1000 requests per hour per API token\n';
    md += '- Limits apply per token, not per user\n\n';

    md += '**Response Headers:**\n\n';
    md += 'CircleCI includes rate limit information in response headers:\n\n';
    md += '```\n';
    md += 'X-RateLimit-Limit: 1000\n';
    md += 'X-RateLimit-Remaining: 995\n';
    md += 'X-RateLimit-Reset: 1715614800\n';
    md += '```\n\n';

    md += '**Handling Rate Limits:**\n\n';
    md += '- Monitor `X-RateLimit-Remaining` header\n';
    md += '- Implement exponential backoff on 429 responses\n';
    md += '- Cache responses when appropriate\n';
    md += '- Use webhooks instead of polling\n\n';

    md += '---\n\n';

    return md;
  }

  /**
   * Generate support section
   */
  generateSupport() {
    let md = '## Support & Resources\n\n';

    md += '**Documentation:**\n';
    md += '- [Full API Reference](https://circleci.com/docs/api/v2/) - Interactive Redocly documentation\n';
    md += '- [API Introduction](https://circleci.com/docs/api-intro/) - Getting started guide\n';
    md += '- [API Changelog](https://circleci.com/docs/api-changelog/) - Track API changes\n\n';

    md += '**Developer Resources:**\n';
    md += '- [CircleCI Discuss](https://discuss.circleci.com/) - Community forum\n';
    md += '- [Support Portal](https://support.circleci.com/) - Official support\n';
    md += '- [Status Page](https://status.circleci.com/) - Service status\n\n';

    md += '**Code Examples:**\n';
    md += '- Each endpoint includes curl examples\n';
    md += '- Check the markdown files for language-specific samples\n';
    md += '- See [CircleCI API Examples](https://github.com/CircleCI-Public/api-preview-docs) for more\n\n';

    md += '---\n\n';

    md += '*Generated from CircleCI OpenAPI specification v' + this.manifest.openapi_version + '*\n';

    return md;
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-specs-readme.js <manifest-file> <output-file>');
    console.error('');
    console.error('Example:');
    console.error('  node generate-specs-readme.js build/api/v2/specs/index.json build/api/v2/specs/README.md');
    process.exit(1);
  }

  const [manifestFile, outputFile] = args;

  // Read the manifest
  console.log(`📖 Reading manifest from ${manifestFile}...`);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading manifest file: ${error.message}`);
    process.exit(1);
  }

  // Generate the README
  console.log('🔨 Generating README...');
  const generator = new SpecsReadmeGenerator(manifest);

  try {
    const readme = generator.generate();

    // Write to file
    fs.writeFileSync(outputFile, readme);

    const size = Math.round(fs.statSync(outputFile).size / 1024);
    console.log(`✅ README generated successfully`);
    console.log(`   Features documented: ${manifest.total_features}`);
    console.log(`   Endpoints covered: ${manifest.total_endpoints}`);
    console.log(`   Output: ${outputFile} (${size}KB)`);
  } catch (error) {
    console.error(`❌ Error generating README: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { SpecsReadmeGenerator };
