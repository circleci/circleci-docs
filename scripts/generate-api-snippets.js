#!/usr/bin/env node

/**
 * CircleCI API Code Snippet Generator
 *
 * Generates code samples from OpenAPI spec and injects them as x-code-samples.
 * Uses Kong's httpsnippet library under the hood with CircleCI-specific conventions.
 *
 * Usage:
 *   node generate-api-snippets.js <input-spec.json> <output-spec.json>
 *
 * Example:
 *   node generate-api-snippets.js openapi.json openapi-with-examples.json
 */

const fs = require('fs');
const { HTTPSnippet } = require('httpsnippet');

class CircleCISnippetGenerator {
  constructor(openApiSpec, options = {}) {
    this.spec = openApiSpec;
    this.baseUrl = this.spec.servers?.[0]?.url || 'https://circleci.com/api/v2';

    // Default options
    this.options = {
      languages: options.languages || [
        { target: 'shell', client: 'curl', label: 'cURL' },
        { target: 'node', client: 'fetch', label: 'Node.js' },
        { target: 'python', client: 'python3', label: 'Python' },
        { target: 'go', client: 'native', label: 'Go' },
        { target: 'ruby', client: 'native', label: 'Ruby' }
      ],
      preferredAuth: options.preferredAuth || 'api_key_header',
      ...options
    };
  }

  /**
   * Build an HTTPSnippet-compatible request object from an OpenAPI operation
   * Creates a HAR-format request that Kong's httpsnippet library can convert
   * @param {string} path - The API path
   * @param {string} method - The HTTP method
   * @param {object} operation - The OpenAPI operation object
   * @param {array} pathLevelParams - Optional path-level parameters to merge
   */
  buildRequest(path, method, operation, pathLevelParams = []) {
    // Merge path-level and operation-level parameters for this request only
    // This avoids mutating the original spec object
    const mergedOperation = {
      ...operation,
      parameters: [...pathLevelParams, ...(operation.parameters || [])]
    };

    const request = {
      method: method.toUpperCase(),
      url: this.buildUrl(path, mergedOperation),
      headers: this.buildHeaders(mergedOperation),
      queryString: this.buildQueryString(mergedOperation),
    };

    // Add request body if applicable
    const bodyContent = this.buildRequestBody(mergedOperation);
    if (bodyContent) {
      request.postData = bodyContent;
    }

    return request;
  }

  /**
   * Build the full URL with path parameters replaced
   */
  buildUrl(path, operation) {
    let url = `${this.baseUrl}${path}`;

    // Replace path parameters with example values
    const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
    pathParams.forEach(param => {
      const example = this.getParameterExample(param);
      url = url.replace(`{${param.name}}`, example);
    });

    return url;
  }

  /**
   * Build headers including authentication
   */
  buildHeaders(operation) {
    const headers = [];

    // Add authentication header (CircleCI preferred method)
    const securityScheme = this.getSecurityScheme(operation);
    if (securityScheme?.type === 'apiKey' && securityScheme.in === 'header') {
      headers.push({
        name: securityScheme.name,
        value: this.getAuthTokenPlaceholder(securityScheme.name)
      });
    }

    // Add Content-Type for requests with bodies
    if (operation.requestBody) {
      const contentType = Object.keys(operation.requestBody.content || {})[0];
      if (contentType) {
        headers.push({
          name: 'Content-Type',
          value: contentType
        });
      }
    }

    return headers;
  }

  /**
   * Build query string parameters
   */
  buildQueryString(operation) {
    const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
    return queryParams.map(param => ({
      name: param.name,
      value: this.getParameterExample(param)
    }));
  }

  /**
   * Build request body
   */
  buildRequestBody(operation) {
    if (!operation.requestBody?.content) {
      return null;
    }

    const contentType = Object.keys(operation.requestBody.content)[0];
    const schema = operation.requestBody.content[contentType]?.schema;

    if (!schema) {
      return null;
    }

    const mimeType = contentType || 'application/json';
    const exampleBody = this.generateExampleFromSchema(schema);

    return {
      mimeType,
      text: JSON.stringify(exampleBody, null, 2)
    };
  }

  /**
   * Get the appropriate security scheme for an operation
   */
  getSecurityScheme(operation) {
    // Check operation-level security first, fall back to global
    const security = operation.security || this.spec.security || [];

    // Find the preferred auth method
    const preferredSecurity = security.find(s =>
      Object.keys(s).includes(this.options.preferredAuth)
    );

    const schemeName = preferredSecurity
      ? Object.keys(preferredSecurity)[0]
      : Object.keys(security[0] || {})[0];

    return this.spec.components?.securitySchemes?.[schemeName];
  }

  /**
   * Get a sensible placeholder for auth tokens
   */
  getAuthTokenPlaceholder(headerName) {
    const placeholders = {
      'Circle-Token': '$CIRCLE_TOKEN',
      'circle-token': '$CIRCLE_TOKEN',
      'Authorization': '$YOUR_API_TOKEN'
    };
    return placeholders[headerName] || '$YOUR_TOKEN';
  }

  /**
   * Get an example value for a parameter
   */
  getParameterExample(param) {
    // Use example if provided
    if (param.example !== undefined) {
      return String(param.example);
    }

    // Use first enum value if available
    if (param.schema?.enum?.[0] !== undefined) {
      return String(param.schema.enum[0]);
    }

    // Generate based on type
    const type = param.schema?.type || 'string';
    const examples = {
      string: param.name.includes('id') ? '497f6eca-6276-4993-bfeb-53cbbbba6f08' : 'example-value',
      integer: '123',
      number: '123',
      boolean: 'true'
    };

    return examples[type] || 'example-value';
  }

  /**
   * Generate an example object from a JSON schema
   */
  generateExampleFromSchema(schema, depth = 0) {
    // Prevent infinite recursion
    if (depth > 5) {
      return {};
    }

    // Use example if provided
    if (schema.example !== undefined) {
      return schema.example;
    }

    // Handle different schema types
    if (schema.type === 'object' || schema.properties) {
      const obj = {};
      const properties = schema.properties || {};
      const required = schema.required || [];

      // Generate examples for required properties and first few optional ones
      Object.entries(properties).forEach(([key, propSchema], index) => {
        if (required.includes(key) || index < 3) {
          obj[key] = this.generateExampleFromSchema(propSchema, depth + 1);
        }
      });

      return obj;
    }

    if (schema.type === 'array') {
      const itemSchema = schema.items || { type: 'string' };
      return [this.generateExampleFromSchema(itemSchema, depth + 1)];
    }

    // Primitive types
    const primitives = {
      string: schema.enum?.[0] || 'example-string',
      integer: 123,
      number: 123.45,
      boolean: true
    };

    return primitives[schema.type] || null;
  }

  /**
   * Generate a code snippet for a specific language using Kong's httpsnippet
   * @param {string} path - The API path
   * @param {string} method - The HTTP method
   * @param {object} operation - The OpenAPI operation object
   * @param {object} language - Language configuration object
   * @param {array} pathLevelParams - Optional path-level parameters
   */
  generateSnippet(path, method, operation, language, pathLevelParams = []) {
    try {
      const request = this.buildRequest(path, method, operation, pathLevelParams);
      const snippet = new HTTPSnippet(request);

      // Convert to target language using Kong's httpsnippet converters
      let code = snippet.convert(language.target, language.client);

      // Post-process cURL to use double quotes for variable expansion
      if (language.target === 'shell' && language.client === 'curl') {
        code = this.fixCurlQuotes(code);
      }

      // Post-process node/fetch to wrap in async function for CommonJS compatibility
      if (language.target === 'node' && language.client === 'fetch') {
        code = this.wrapNodeFetchInAsyncFunction(code);
      }

      return code;
    } catch (error) {
      console.error(`Error generating snippet for ${method.toUpperCase()} ${path} (${language.label}):`, error.message);
      return null;
    }
  }

  /**
   * Wrap node-fetch code in an async function to support CommonJS
   * Matches the pattern used by Harness API docs
   */
  wrapNodeFetchInAsyncFunction(code) {
    // If already wrapped, return as-is
    if (code.includes('async function run()') || code.includes('(async () => {')) {
      return code;
    }

    // Extract the import/require statement
    const lines = code.split('\n');
    const imports = [];
    const body = [];

    lines.forEach(line => {
      if (line.trim().startsWith('import ') ||
          (line.trim().startsWith('const ') && line.includes('require('))) {
        imports.push(line);
      } else if (line.trim()) {
        body.push(line);
      }
    });

    // Wrap in async function
    const wrappedCode = [
      ...imports,
      '',
      'async function run() {',
      ...body.map(line => '  ' + line),
      '}',
      '',
      'run();'
    ].join('\n');

    return wrappedCode;
  }

  /**
   * Fix cURL commands to use double quotes instead of single quotes
   * This allows shell variable expansion (e.g., $CIRCLE_TOKEN)
   *
   * Kong's httpsnippet uses single quotes by default which prevents variable expansion.
   * We convert single quotes to double quotes and escape special characters.
   */
  fixCurlQuotes(code) {
    // Replace single-quoted strings with double-quoted strings
    // We need to handle the escaping properly for special characters in double quotes
    return code.replace(/'([^']*)'/g, (match, content) => {
      // In double quotes, we need to escape: $ ` " \ and newlines
      // But we WANT to keep $ unescaped for variable expansion
      let escaped = content
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/"/g, '\\"')     // Escape double quotes
        .replace(/`/g, '\\`');    // Escape backticks

      return `"${escaped}"`;
    });
  }

  /**
   * Generate snippets for all operations and inject into spec
   */
  enrichSpec() {
    let operationsProcessed = 0;
    let snippetsGenerated = 0;
    let snippetsFailed = 0;

    // Track failures by reason and language
    const failureReasons = {
      null: 0,           // httpsnippet returned null/undefined
      notString: 0,      // httpsnippet returned non-string
      empty: 0,          // httpsnippet returned empty string
    };
    const failuresByLanguage = {};
    const failedOperations = []; // Store sample of failed operations for debugging

    Object.entries(this.spec.paths || {}).forEach(([path, pathItem]) => {
      // Handle path-level parameters (read-only, not mutating)
      const pathLevelParams = pathItem.parameters || [];

      ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
        const operation = pathItem[method];
        if (!operation) return;

        operationsProcessed++;

        // Generate snippets for each language
        // Pass pathLevelParams to generateSnippet instead of mutating operation
        const codeSamples = this.options.languages
          .map(language => {
            const snippet = this.generateSnippet(path, method, operation, language, pathLevelParams);

            return {
              lang: language.label,
              source: snippet,
              _meta: { path, method } // For debugging
            };
          })
          .filter(sample => {
            // Robust validation: filter out invalid snippets
            if (!sample.source) {
              snippetsFailed++;
              failureReasons.null++;
              failuresByLanguage[sample.lang] = (failuresByLanguage[sample.lang] || 0) + 1;

              // Store first 5 failures for debugging
              if (failedOperations.length < 5) {
                failedOperations.push({
                  path: sample._meta.path,
                  method: sample._meta.method,
                  language: sample.lang,
                  reason: 'null/undefined'
                });
              }
              return false;
            }
            if (typeof sample.source !== 'string') {
              snippetsFailed++;
              failureReasons.notString++;
              failuresByLanguage[sample.lang] = (failuresByLanguage[sample.lang] || 0) + 1;

              if (failedOperations.length < 5) {
                failedOperations.push({
                  path: sample._meta.path,
                  method: sample._meta.method,
                  language: sample.lang,
                  reason: `not a string (type: ${typeof sample.source})`
                });
              }
              return false;
            }
            if (sample.source.trim() === '') {
              snippetsFailed++;
              failureReasons.empty++;
              failuresByLanguage[sample.lang] = (failuresByLanguage[sample.lang] || 0) + 1;

              if (failedOperations.length < 5) {
                failedOperations.push({
                  path: sample._meta.path,
                  method: sample._meta.method,
                  language: sample.lang,
                  reason: 'empty string'
                });
              }
              return false;
            }
            // Count successful snippets
            snippetsGenerated++;
            delete sample._meta; // Clean up metadata before adding to spec
            return true;
          });

        // Only add x-code-samples if we generated any valid snippets
        if (codeSamples.length > 0) {
          operation['x-code-samples'] = codeSamples;
        }
      });
    });

    console.log(`✅ Processed ${operationsProcessed} operations`);
    console.log(`✅ Generated ${snippetsGenerated} code snippets`);

    if (snippetsFailed > 0) {
      console.log(`\n⚠️  Failed to generate ${snippetsFailed} snippets`);
      console.log(`\n📊 Failure breakdown:`);
      console.log(`   - Null/undefined responses: ${failureReasons.null}`);
      console.log(`   - Non-string responses: ${failureReasons.notString}`);
      console.log(`   - Empty string responses: ${failureReasons.empty}`);

      console.log(`\n📊 Failures by language:`);
      Object.entries(failuresByLanguage)
        .sort((a, b) => b[1] - a[1])
        .forEach(([lang, count]) => {
          console.log(`   - ${lang}: ${count} failures`);
        });

      if (failedOperations.length > 0) {
        console.log(`\n📝 Sample failed operations (first ${failedOperations.length}):`);
        failedOperations.forEach(fail => {
          console.log(`   - ${fail.method.toUpperCase()} ${fail.path} (${fail.language}): ${fail.reason}`);
        });
      }
    }

    return this.spec;
  }

  /**
   * Generate snippets for specific endpoints only (useful for selective enrichment)
   */
  enrichSpecSelectively(endpointFilter) {
    let snippetsGenerated = 0;
    let snippetsFailed = 0;

    Object.entries(this.spec.paths || {}).forEach(([path, pathItem]) => {
      const pathLevelParams = pathItem.parameters || [];

      ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
        const operation = pathItem[method];
        if (!operation) return;

        // Apply filter
        if (endpointFilter && !endpointFilter(path, method, operation)) {
          return;
        }

        const codeSamples = this.options.languages
          .map(language => ({
            lang: language.label,
            source: this.generateSnippet(path, method, operation, language, pathLevelParams)
          }))
          .filter(sample => {
            // Same robust validation as enrichSpec
            if (!sample.source || typeof sample.source !== 'string' || sample.source.trim() === '') {
              snippetsFailed++;
              return false;
            }
            snippetsGenerated++;
            return true;
          });

        if (codeSamples.length > 0) {
          operation['x-code-samples'] = codeSamples;
        }
      });
    });

    console.log(`✅ Generated ${snippetsGenerated} code snippets (selective)`);
    if (snippetsFailed > 0) {
      console.log(`⚠️  Failed to generate ${snippetsFailed} snippets`);
    }

    return this.spec;
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-api-snippets.js <input-spec.json> <output-spec.json>');
    console.error('');
    console.error('Example:');
    console.error('  node generate-api-snippets.js openapi.json openapi-with-examples.json');
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

  // Generate snippets
  console.log('🔨 Generating code snippets...');
  const generator = new CircleCISnippetGenerator(spec, {
    preferredAuth: 'api_key_header',
    languages: [
      { target: 'shell', client: 'curl', label: 'cURL' },
      { target: 'node', client: 'fetch', label: 'Node.js' },
      { target: 'python', client: 'python3', label: 'Python' },
      { target: 'go', client: 'native', label: 'Go' },
      { target: 'ruby', client: 'native', label: 'Ruby' }
    ]
  });

  const enrichedSpec = generator.enrichSpec();

  // Write the enriched spec
  console.log(`💾 Writing enriched spec to ${outputFile}...`);
  try {
    fs.writeFileSync(outputFile, JSON.stringify(enrichedSpec, null, 2));
    console.log('✨ Done!');
  } catch (error) {
    console.error(`❌ Error writing output file: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = { CircleCISnippetGenerator };