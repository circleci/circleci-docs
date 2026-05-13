#!/usr/bin/env node

/**
 * Update llms.txt with API Section
 *
 * Post-processes the Antora-generated llms.txt file to add/update the API
 * Reference Documentation section. This script reads the discovery manifest
 * and generates a comprehensive API section with links to all markdown specs.
 *
 * Usage:
 *   node update-llms-txt-api-section.js <manifest-file> <llms-txt-file>
 *
 * Example:
 *   node update-llms-txt-api-section.js build/api/v2/specs/index.json build/llms.txt
 */

const fs = require('fs');

class LlmsTxtApiUpdater {
  constructor(manifest) {
    this.manifest = manifest;
  }

  /**
   * Update the llms.txt file with API section
   */
  update(llmsTxtPath) {
    // Read existing llms.txt
    let existingContent = '';
    if (fs.existsSync(llmsTxtPath)) {
      existingContent = fs.readFileSync(llmsTxtPath, 'utf8');
    }

    // Remove old API section if present
    const cleanedContent = this.removeOldApiSection(existingContent);

    // Generate new API section
    const apiSection = this.generateApiSection();

    // Insert API section before the final content (before Technical Stack or at the end)
    const updatedContent = this.insertApiSection(cleanedContent, apiSection);

    return updatedContent;
  }

  /**
   * Remove old API Reference Documentation section if it exists
   */
  removeOldApiSection(content) {
    // Find the API section header
    const apiHeaderRegex = /^## API Reference Documentation\n/m;
    const match = content.match(apiHeaderRegex);

    if (!match) {
      // No existing API section
      return content;
    }

    const startIndex = match.index;

    // Find the next ## header (next section)
    const nextSectionRegex = /\n## /;
    const remainingContent = content.slice(startIndex + match[0].length);
    const nextSectionMatch = remainingContent.match(nextSectionRegex);

    if (nextSectionMatch) {
      // Remove from API header to next section
      const endIndex = startIndex + match[0].length + nextSectionMatch.index;
      return content.slice(0, startIndex) + content.slice(endIndex);
    } else {
      // API section is at the end - remove everything from API header onwards
      return content.slice(0, startIndex);
    }
  }

  /**
   * Insert API section in the appropriate location
   */
  insertApiSection(content, apiSection) {
    // Try to insert before "## Technical Stack" or "## Content Statistics"
    const insertBeforeHeaders = [
      '## Technical Stack',
      '## Content Statistics',
      '## Platform Badges'
    ];

    for (const header of insertBeforeHeaders) {
      const index = content.indexOf(header);
      if (index !== -1) {
        return content.slice(0, index) + apiSection + '\n' + content.slice(index);
      }
    }

    // If none found, append at the end
    return content + '\n' + apiSection;
  }

  /**
   * Generate the API Reference Documentation section
   */
  generateApiSection() {
    let section = '';

    section += '## API Reference Documentation\n\n';
    section += 'Complete CircleCI API v2 documentation available in LLM-optimized markdown format.\n\n';

    section += '### Discovery and Overview\n\n';
    section += `- **Discovery manifest**: ${this.manifest.llms_txt.replace('/llms.txt', '/api/v2/specs/index.json')}\n`;
    section += `  - Machine-readable index with metadata for all ${this.manifest.total_features} API features\n`;
    section += `  - Includes endpoint counts, use cases, file sizes, and URLs\n\n`;

    section += `- **Getting started guide**: ${this.manifest.llms_txt.replace('/llms.txt', '/api/v2/specs/README.md')}\n`;
    section += '  - Quick start for AI agents\n';
    section += '  - Authentication and rate limit details\n';
    section += '  - Format comparison and usage examples\n\n';

    section += '### Why Markdown Format?\n\n';
    const markdown = this.manifest.formats.markdown;
    section += `Markdown documentation is **${markdown.size_reduction_vs_json}** smaller than JSON and uses natural language, `;
    section += 'making it significantly more efficient for LLM consumption.\n\n';

    section += '### API Documentation by Feature\n\n';
    section += 'Each feature area has dedicated documentation in both markdown (recommended for LLMs) and JSON (for tooling).\n\n';

    // Sort features by most commonly used first
    const priorityOrder = [
      'pipeline', 'project', 'workflow', 'job', 'context',
      'insights', 'webhook', 'schedule', 'trigger'
    ];

    const sortedFeatures = this.manifest.features.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.tag);
      const bIndex = priorityOrder.indexOf(b.tag);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    sortedFeatures.forEach(feature => {
      section += `#### ${feature.name} APIs\n\n`;
      section += `**Markdown**: ${feature.markdown} (${feature.markdown_size_kb}KB)\n\n`;

      section += `- ${feature.endpoints} endpoints\n`;
      section += `- ${feature.description}\n`;

      if (feature.use_cases && feature.use_cases.length > 0) {
        section += '- Use cases:\n';
        feature.use_cases.forEach(useCase => {
          section += `  - ${useCase}\n`;
        });
      }

      section += `- JSON spec: ${feature.json} (${feature.json_size_kb}KB)\n\n`;
    });

    section += '### Complete API Specification\n\n';
    section += `- **Full OpenAPI spec**: ${this.manifest.llms_txt.replace('/llms.txt', '/api/v2/specs/json/full.json')}\n`;
    section += `  - All ${this.manifest.total_endpoints} endpoints in single file\n`;
    section += '  - OpenAPI 3.0.3 format for code generation and validation\n\n';

    section += '### Interactive API Reference (For Humans)\n\n';
    section += `- **Redocly documentation**: ${this.manifest.llms_txt.replace('/llms.txt', '/api/v2/')}\n`;
    section += '  - Human-readable with try-it features\n';
    section += '  - Interactive examples and schema exploration\n';
    section += '  - Code samples in multiple languages\n\n';

    return section;
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node update-llms-txt-api-section.js <manifest-file> <llms-txt-file>');
    console.error('');
    console.error('Example:');
    console.error('  node update-llms-txt-api-section.js build/api/v2/specs/index.json build/llms.txt');
    process.exit(1);
  }

  const [manifestFile, llmsTxtFile] = args;

  // Read the manifest
  console.log(`📖 Reading manifest from ${manifestFile}...`);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading manifest file: ${error.message}`);
    process.exit(1);
  }

  // Check if llms.txt exists
  if (!fs.existsSync(llmsTxtFile)) {
    console.warn(`⚠️  Warning: ${llmsTxtFile} does not exist. Creating new file.`);
  }

  // Update llms.txt
  console.log('🔨 Updating llms.txt with API section...');
  const updater = new LlmsTxtApiUpdater(manifest);

  try {
    const updatedContent = updater.update(llmsTxtFile);

    // Write updated content
    fs.writeFileSync(llmsTxtFile, updatedContent);

    const size = Math.round(fs.statSync(llmsTxtFile).size / 1024);
    console.log(`✅ llms.txt updated successfully`);
    console.log(`   API features documented: ${manifest.total_features}`);
    console.log(`   Total endpoints: ${manifest.total_endpoints}`);
    console.log(`   Output: ${llmsTxtFile} (${size}KB)`);
  } catch (error) {
    console.error(`❌ Error updating llms.txt: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { LlmsTxtApiUpdater };
