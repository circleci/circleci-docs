#!/usr/bin/env node

/**
 * OpenAPI to Markdown Converter
 *
 * Converts OpenAPI specification to LLM-optimized markdown documentation.
 * Produces concise, natural language documentation that's easier for AI agents
 * to parse and understand compared to verbose JSON schemas.
 *
 * Usage:
 *   node openapi-to-markdown.js <input-spec.json> <output.md>
 *
 * Example:
 *   node openapi-to-markdown.js pipeline.json pipeline.md
 */

const fs = require('fs');

class OpenAPIMarkdownConverter {
  constructor(spec) {
    this.spec = spec;
    this.baseUrl = this.spec.servers?.[0]?.url || 'https://circleci.com/api/v2';
  }

  /**
   * Convert the OpenAPI spec to markdown
   */
  convert() {
    let markdown = '';

    // Title and description
    markdown += `# ${this.spec.info.title}\n\n`;

    if (this.spec.info.description) {
      markdown += `${this.spec.info.description}\n\n`;
    }

    // Add quick reference
    markdown += `**Base URL:** \`${this.baseUrl}\`\n\n`;
    markdown += `**Authentication:** API token required (see Authentication section below)\n\n`;

    // Count endpoints
    const endpointCount = this.countEndpoints();
    markdown += `**Total Endpoints:** ${endpointCount}\n\n`;

    markdown += `---\n\n`;

    // Convert each path
    const paths = Object.entries(this.spec.paths || {}).sort();

    paths.forEach(([pathName, pathItem]) => {
      markdown += this.convertPath(pathName, pathItem);
    });

    // Add common sections at the end
    markdown += this.generateAuthenticationSection();
    markdown += this.generateErrorCodesSection();

    return markdown;
  }

  /**
   * Count total endpoints in the spec
   */
  countEndpoints() {
    let count = 0;
    Object.values(this.spec.paths || {}).forEach(pathItem => {
      ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
        if (pathItem[method]) count++;
      });
    });
    return count;
  }

  /**
   * Convert a single path to markdown
   */
  convertPath(pathName, pathItem) {
    let markdown = '';

    // Process each HTTP method
    ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
      const operation = pathItem[method];
      if (!operation) return;

      markdown += this.convertOperation(method, pathName, pathItem, operation);
    });

    return markdown;
  }

  /**
   * Convert a single operation to markdown
   */
  convertOperation(method, pathName, pathItem, operation) {
    let markdown = '';

    // Method and path header
    markdown += `## ${method.toUpperCase()} ${pathName}\n\n`;

    // Summary and description
    if (operation.summary) {
      markdown += `${operation.summary}\n\n`;
    }
    if (operation.description && operation.description !== operation.summary) {
      markdown += `${operation.description}\n\n`;
    }

    // Operation ID (useful for reference)
    if (operation.operationId) {
      markdown += `**Operation ID:** \`${operation.operationId}\`\n\n`;
    }

    // Parameters
    const allParams = [...(pathItem.parameters || []), ...(operation.parameters || [])];
    if (allParams.length > 0) {
      markdown += this.convertParameters(allParams);
    }

    // Request body
    if (operation.requestBody) {
      markdown += this.convertRequestBody(operation.requestBody);
    }

    // Responses
    if (operation.responses) {
      markdown += this.convertResponses(operation.responses);
    }

    // Example
    markdown += this.generateExample(method, pathName, operation, allParams);

    markdown += `---\n\n`;

    return markdown;
  }

  /**
   * Convert parameters to markdown
   */
  convertParameters(parameters) {
    let markdown = '**Parameters:**\n\n';

    // Group by location
    const byLocation = {
      path: [],
      query: [],
      header: [],
      cookie: []
    };

    parameters.forEach(param => {
      const location = param.in || 'query';
      if (byLocation[location]) {
        byLocation[location].push(param);
      }
    });

    // Output each group
    ['path', 'query', 'header', 'cookie'].forEach(location => {
      const params = byLocation[location];
      if (params.length === 0) return;

      params.forEach(param => {
        const name = param.name;
        const type = this.getSchemaType(param.schema);
        const required = param.required ? 'required' : 'optional';
        const description = param.description || '';

        markdown += `- \`${name}\` (${location}, ${type}, ${required})`;
        if (description) {
          markdown += `: ${description}`;
        }
        markdown += '\n';

        // Add enum values if present
        if (param.schema?.enum) {
          markdown += `  - Allowed values: ${param.schema.enum.map(v => `\`${v}\``).join(', ')}\n`;
        }

        // Add example if present
        if (param.example !== undefined) {
          markdown += `  - Example: \`${param.example}\`\n`;
        }
      });
    });

    markdown += '\n';
    return markdown;
  }

  /**
   * Convert request body to markdown
   */
  convertRequestBody(requestBody) {
    let markdown = '**Request Body:**';

    const required = requestBody.required ? ' (required)' : ' (optional)';
    markdown += required + '\n\n';

    if (requestBody.description) {
      markdown += `${requestBody.description}\n\n`;
    }

    // Get the first content type (usually application/json)
    const contentTypes = Object.keys(requestBody.content || {});
    if (contentTypes.length === 0) return markdown;

    const contentType = contentTypes[0];
    const mediaType = requestBody.content[contentType];

    if (mediaType.schema) {
      markdown += this.convertSchema(mediaType.schema, 0);
    }

    markdown += '\n';
    return markdown;
  }

  /**
   * Convert responses to markdown
   */
  convertResponses(responses) {
    let markdown = '**Responses:**\n\n';

    // Sort by status code
    const statusCodes = Object.keys(responses).sort();

    statusCodes.forEach(statusCode => {
      const response = responses[statusCode];
      const description = response.description || '';

      markdown += `- **${statusCode}**: ${description}\n`;

      // Add response schema for success responses
      if (statusCode.startsWith('2') && response.content) {
        const contentType = Object.keys(response.content)[0];
        const mediaType = response.content[contentType];

        if (mediaType?.schema) {
          markdown += this.convertSchema(mediaType.schema, 1);
        }
      }
    });

    markdown += '\n';
    return markdown;
  }

  /**
   * Convert a JSON schema to readable markdown
   */
  convertSchema(schema, indent = 0) {
    let markdown = '';
    const prefix = '  '.repeat(indent);

    // Handle $ref
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      markdown += `${prefix}- Type: \`${refName}\` (see schema definition)\n`;

      // Try to resolve and expand the reference
      const resolved = this.resolveReference(schema.$ref);
      if (resolved) {
        return this.convertSchema(resolved, indent);
      }
      return markdown;
    }

    // Handle arrays
    if (schema.type === 'array') {
      markdown += `${prefix}- Type: array\n`;
      if (schema.items) {
        markdown += `${prefix}  - Items:\n`;
        markdown += this.convertSchema(schema.items, indent + 2);
      }
      return markdown;
    }

    // Handle objects
    if (schema.type === 'object' || schema.properties) {
      const properties = schema.properties || {};
      const required = schema.required || [];

      Object.entries(properties).forEach(([propName, propSchema]) => {
        const type = this.getSchemaType(propSchema);
        const isRequired = required.includes(propName);
        const reqText = isRequired ? ', required' : '';
        const description = propSchema.description || '';

        markdown += `${prefix}- \`${propName}\` (${type}${reqText})`;
        if (description) {
          markdown += `: ${description}`;
        }
        markdown += '\n';

        // Add enum values
        if (propSchema.enum) {
          markdown += `${prefix}  - Values: ${propSchema.enum.map(v => `\`${v}\``).join(', ')}\n`;
        }

        // Add example
        if (propSchema.example !== undefined) {
          markdown += `${prefix}  - Example: \`${propSchema.example}\`\n`;
        }
      });

      return markdown;
    }

    // Primitive type
    const type = this.getSchemaType(schema);
    markdown += `${prefix}- Type: ${type}`;
    if (schema.description) {
      markdown += ` - ${schema.description}`;
    }
    markdown += '\n';

    return markdown;
  }

  /**
   * Get a human-readable type from a schema
   */
  getSchemaType(schema) {
    if (!schema) return 'any';

    if (schema.$ref) {
      return schema.$ref.split('/').pop();
    }

    if (schema.type) {
      let type = schema.type;

      // Add format if present
      if (schema.format) {
        type += ` (${schema.format})`;
      }

      // Add enum hint
      if (schema.enum) {
        type += ' enum';
      }

      return type;
    }

    if (schema.allOf) return 'object (allOf)';
    if (schema.anyOf) return 'object (anyOf)';
    if (schema.oneOf) return 'object (oneOf)';

    return 'any';
  }

  /**
   * Resolve a $ref to its schema
   */
  resolveReference(ref) {
    if (!ref || !ref.startsWith('#/')) return null;

    const parts = ref.slice(2).split('/');
    let current = this.spec;

    for (const part of parts) {
      current = current?.[part];
      if (!current) return null;
    }

    return current;
  }

  /**
   * Generate a curl example
   */
  generateExample(method, pathName, operation, parameters) {
    let markdown = '**Example:**\n\n';

    // Build URL with path parameters
    let url = `${this.baseUrl}${pathName}`;
    const pathParams = parameters.filter(p => p.in === 'path');
    pathParams.forEach(param => {
      const example = param.example || this.getExampleValue(param.schema);
      url = url.replace(`{${param.name}}`, example);
    });

    // Add query parameters
    const queryParams = parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryString = queryParams
        .map(param => {
          const example = param.example || this.getExampleValue(param.schema);
          return `${param.name}=${encodeURIComponent(example)}`;
        })
        .join('&');
      url += `?${queryString}`;
    }

    // Build curl command
    markdown += '```bash\n';
    markdown += `curl -X ${method.toUpperCase()} \\\n`;
    markdown += `  -H "Circle-Token: $CIRCLE_TOKEN" \\\n`;

    // Add request body if present
    if (operation.requestBody) {
      markdown += `  -H "Content-Type: application/json" \\\n`;
      const example = this.generateRequestBodyExample(operation.requestBody);
      markdown += `  -d '${JSON.stringify(example, null, 2)}' \\\n`;
    }

    markdown += `  ${url}\n`;
    markdown += '```\n\n';

    return markdown;
  }

  /**
   * Generate an example value from a schema
   */
  getExampleValue(schema) {
    if (!schema) return 'example';

    if (schema.example !== undefined) {
      return schema.example;
    }

    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }

    if (schema.type === 'string') {
      if (schema.format === 'uuid') {
        return '5034460f-c7c4-4c43-9457-de07e2029e7b';
      }
      if (schema.format === 'date-time') {
        return '2026-05-13T10:00:00Z';
      }
      return 'example';
    }

    if (schema.type === 'integer' || schema.type === 'number') {
      return 123;
    }

    if (schema.type === 'boolean') {
      return true;
    }

    return 'example';
  }

  /**
   * Generate an example request body
   */
  generateRequestBodyExample(requestBody) {
    const contentType = Object.keys(requestBody.content || {})[0];
    if (!contentType) return {};

    const mediaType = requestBody.content[contentType];
    if (!mediaType.schema) return {};

    // Use example if provided
    if (mediaType.example) {
      return mediaType.example;
    }

    if (mediaType.schema.example) {
      return mediaType.schema.example;
    }

    // Generate from schema
    return this.generateExampleFromSchema(mediaType.schema);
  }

  /**
   * Generate an example object from a schema
   */
  generateExampleFromSchema(schema, depth = 0) {
    if (depth > 3) return {}; // Prevent deep recursion

    if (schema.example !== undefined) {
      return schema.example;
    }

    if (schema.$ref) {
      const resolved = this.resolveReference(schema.$ref);
      if (resolved) {
        return this.generateExampleFromSchema(resolved, depth + 1);
      }
      return {};
    }

    if (schema.type === 'object' || schema.properties) {
      const obj = {};
      const required = schema.required || [];

      Object.entries(schema.properties || {}).forEach(([key, propSchema]) => {
        // Include required fields and first few optional fields
        if (required.includes(key) || Object.keys(obj).length < 3) {
          obj[key] = this.generateExampleFromSchema(propSchema, depth + 1);
        }
      });

      return obj;
    }

    if (schema.type === 'array') {
      const itemExample = this.generateExampleFromSchema(schema.items || {}, depth + 1);
      return [itemExample];
    }

    // Primitive types
    return this.getExampleValue(schema);
  }

  /**
   * Generate authentication section
   */
  generateAuthenticationSection() {
    let markdown = '## Authentication\n\n';

    markdown += 'All API requests require authentication. CircleCI API uses token-based authentication.\n\n';
    markdown += '**Methods:**\n\n';
    markdown += '1. **API Token Header** (Recommended):\n';
    markdown += '   ```\n';
    markdown += '   Circle-Token: YOUR_API_TOKEN\n';
    markdown += '   ```\n\n';
    markdown += '2. **HTTP Basic Authentication**:\n';
    markdown += '   - Username: Your API token\n';
    markdown += '   - Password: (leave empty)\n\n';

    markdown += '**Getting your API token:**\n\n';
    markdown += '1. Go to https://app.circleci.com/settings/user/tokens\n';
    markdown += '2. Create a new personal API token\n';
    markdown += '3. Store it securely (e.g., environment variable `CIRCLE_TOKEN`)\n\n';

    return markdown;
  }

  /**
   * Generate common error codes section
   */
  generateErrorCodesSection() {
    let markdown = '## Common Error Codes\n\n';

    markdown += '| Code | Description |\n';
    markdown += '|------|-------------|\n';
    markdown += '| 200 | Success |\n';
    markdown += '| 201 | Created successfully |\n';
    markdown += '| 400 | Bad request - Invalid parameters or request body |\n';
    markdown += '| 401 | Unauthorized - Invalid or missing API token |\n';
    markdown += '| 403 | Forbidden - Valid token but insufficient permissions |\n';
    markdown += '| 404 | Not found - Resource does not exist |\n';
    markdown += '| 429 | Too many requests - Rate limit exceeded |\n';
    markdown += '| 500 | Internal server error |\n\n';

    markdown += '**Rate Limits:**\n\n';
    markdown += '- Default: 1000 requests per hour per token\n';
    markdown += '- Check response headers for current limits:\n';
    markdown += '  - `X-RateLimit-Limit`: Total requests allowed\n';
    markdown += '  - `X-RateLimit-Remaining`: Requests remaining\n';
    markdown += '  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)\n\n';

    return markdown;
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node openapi-to-markdown.js <input-spec.json> <output.md>');
    console.error('');
    console.error('Example:');
    console.error('  node openapi-to-markdown.js pipeline.json pipeline.md');
    process.exit(1);
  }

  const [inputFile, outputFile] = args;

  // Read the OpenAPI spec
  console.log(`📖 Reading OpenAPI spec from ${inputFile}...`);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading spec file: ${error.message}`);
    process.exit(1);
  }

  // Convert to markdown
  console.log('🔨 Converting to markdown...');
  const converter = new OpenAPIMarkdownConverter(spec);

  try {
    const markdown = converter.convert();

    // Write output
    fs.writeFileSync(outputFile, markdown);

    const inputSize = fs.statSync(inputFile).size;
    const outputSize = fs.statSync(outputFile).size;
    const reduction = Math.round((1 - outputSize / inputSize) * 100);

    console.log(`✅ Conversion complete`);
    console.log(`   Input:  ${Math.round(inputSize / 1024)}KB (JSON)`);
    console.log(`   Output: ${Math.round(outputSize / 1024)}KB (Markdown)`);
    console.log(`   Size reduction: ${reduction}%`);
  } catch (error) {
    console.error(`❌ Error during conversion: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { OpenAPIMarkdownConverter };
