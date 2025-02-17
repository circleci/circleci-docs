import json
import urllib.request
import logging
from typing import Dict, List
from pathlib import Path
import os
from abc import ABC, abstractmethod

# Set up logging configuration for debugging and tracking generation progress
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Base class for all example generators
# This ensures consistent interface across different language generators
class BaseExampleGenerator(ABC):
    @abstractmethod
    def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
        pass

    # Helper method to extract URL parameters from endpoint paths
    # e.g., /project/{project-slug}/pipeline -> ['project-slug']
    def _extract_params(self, endpoint: str) -> List[str]:
        return [p[1:-1] for p in endpoint.split('/') if p.startswith('{') and p.endswith('}')]

# Go language example generator
class GoExampleGenerator(BaseExampleGenerator):
    def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
        # Template for Go code with error handling and environment variables
        template = '''package main
# ... [rest of the Go template]
'''

        # Extract path parameters and create variable declarations
        path_params = self._extract_params(endpoint)
        params_decl = []
        url_params = []

        # Convert URL parameters to Go variable declarations
        for param in path_params:
            var_name = param.replace('-', '_')
            params_decl.append(f'{var_name} := "example-{var_name}"')
            url_params.append(var_name)

        # Handle request body if the endpoint requires one
        payload_decl = ""
        body_arg = "nil"
        content_type = ""

        if 'requestBody' in details:
            # Add JSON payload for endpoints that need it
            payload_decl = '''payload := map[string]interface{}{
        "example": "data",
    }
    jsonData, err := json.Marshal(payload)
    if err != nil {
        log.Fatal(err)
    }'''
            body_arg = "bytes.NewBuffer(jsonData)"
            content_type = 'req.Header.Set("Content-Type", "application/json")'

        # Fill in the template with the generated code parts
        return template.format(
            endpoint_fmt=endpoint,
            method=method.upper(),
            params_declaration='\n    '.join(params_decl),
            payload_declaration=payload_decl,
            url_params=', '.join(url_params) if url_params else '',
            body=body_arg,
            content_type=content_type
        )

# Node.js example generator with modern async/await syntax
class NodeExampleGenerator(BaseExampleGenerator):
    def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
        # Template for Node.js code with error handling and environment variables
        template = '''// ... [Node.js template code]'''

        # Extract and process URL parameters
        path_params = self._extract_params(endpoint)
        params_decl = []

        # Convert parameters to JavaScript variable declarations
        for param in path_params:
            var_name = param.replace('-', '_')
            params_decl.append(f"const {var_name} = 'example-{var_name}';")

        # Format the endpoint URL with template literals
        endpoint_formatted = endpoint
        for param in path_params:
            endpoint_formatted = endpoint_formatted.replace(
                f'{{{param}}}',
                '${' + param.replace('-', '_') + '}'
            )

        # Add method and body declarations based on endpoint requirements
        method_decl = f"method: '{method.upper()}'," if method.upper() != 'GET' else ''
        body_decl = ""
        content_type = ""

        if 'requestBody' in details:
            body_decl = ''',
        body: JSON.stringify({
            example: 'data'
        })'''
            content_type = ",\n            'Content-Type': 'application/json'"

        return template.format(
            params_declaration='\n'.join(params_decl),
            endpoint_fmt=endpoint_formatted,
            method_declaration=method_decl,
            content_type=content_type,
            body_declaration=body_decl
        )

# class RubyExampleGenerator(BaseExampleGenerator):
#     def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
#         # Debug logging
#         print(f"\nEndpoint: {method} {endpoint}")
#         print("Details structure:")
#         print(json.dumps(details, indent=2))
#         print("Keys in details:", list(details.keys()))

#         # Check if we're getting the expected structure
#         if isinstance(details, dict) and 'responses' in details:
#             print("Found responses key with:", list(details['responses'].keys()))

#     def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
#         # First check if we have a valid response object
#         if 'responses' not in details:
#             details['responses'] = {'200': {'description': 'Successful response'}}

#         template = '''require 'uri'
# require 'net/http'
# require 'json'

# def make_request
#     circle_token = ENV['CIRCLE_TOKEN']
#     raise 'CIRCLE_TOKEN environment variable is required' unless circle_token
#     {params_declaration}

#     uri = URI("https://circleci.com/api/v2{endpoint_fmt}")
#     http = Net::HTTP.new(uri.host, uri.port)
#     http.use_ssl = true

#     request = case '{method}'.upcase
#     when 'GET'
#         Net::HTTP::Get.new(uri)
#     when 'POST'
#         Net::HTTP::Post.new(uri)
#     when 'PUT'
#         Net::HTTP::Put.new(uri)
#     when 'DELETE'
#         Net::HTTP::Delete.new(uri)
#     when 'PATCH'
#         Net::HTTP::Patch.new(uri)
#     end

#     request["Circle-Token"] = circle_token{content_type}{body_declaration}

#     response = http.request(request)

#     case response
#     when Net::HTTPSuccess
#         JSON.parse(response.body) rescue response.body
#     else
#         raise "HTTP Request failed: #{response.code} #{response.message}"
#     end
# end

# begin
#     result = make_request
#     puts result.is_a?(String) ? result : JSON.pretty_generate(result)
# rescue StandardError => e
#     puts "Error: #{e.message}"
#     exit 1
# end'''

#         path_params = self._extract_params(endpoint)
#         params_decl = []

#         for param in path_params:
#             var_name = param.replace('-', '_').replace('.', '_')
#             params_decl.append(f"{var_name} = 'example-{var_name}'")

#         endpoint_formatted = endpoint
#         for param in path_params:
#             var_name = param.replace('-', '_').replace('.', '_')
#             endpoint_formatted = endpoint_formatted.replace(f'{{{param}}}', '#{' + var_name + '}')

#         body_decl = ""
#         content_type = ""

#         if method.upper() in ['POST', 'PUT', 'PATCH'] or 'requestBody' in details:
#             body_decl = '''
#     request.body = {
#         "example": "data"
#     }.to_json'''
#             content_type = '\n    request["Content-Type"] = "application/json"'

#         return template.format(
#             params_declaration='\n    '.join(params_decl),
#             endpoint_fmt=endpoint_formatted,
#             method=method,
#             content_type=content_type,
#             body_declaration=body_decl
#         )


class PythonExampleGenerator(BaseExampleGenerator):
    def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
        # Template for Python code with error handling and environment variables
        template = '''import os
import requests
from typing import Dict

# Get token from environment
circle_token = os.getenv('CIRCLE_TOKEN')
if not circle_token:
    raise ValueError('CIRCLE_TOKEN environment variable is required')

{params_declaration}

headers = {{
    'Circle-Token': circle_token{content_type}
}}

url = f'https://circleci.com/api/v2{endpoint_fmt}'
{payload_declaration}
try:
    response = requests.{method_lower}(
        url,
        headers=headers{payload_arg}
    )
    response.raise_for_status()
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f"Error making request: {{e}}")
    raise'''

        path_params = self._extract_params(endpoint)
        params_decl = []

        for param in path_params:
            var_name = param.replace('-', '_')
            params_decl.append(f"{var_name} = 'example-{var_name}'")

        endpoint_formatted = endpoint
        for param in path_params:
            endpoint_formatted = endpoint_formatted.replace(f'{{{param}}}', '{' + param.replace('-', '_') + '}')

        payload_decl = ""
        payload_arg = ""
        content_type = ""

        if 'requestBody' in details:
            payload_decl = '''payload = {
    'example': 'data'
}'''
            payload_arg = ',\n        json=payload'
            content_type = ",\n    'Content-Type': 'application/json'"

        return template.format(
            params_declaration='\n'.join(params_decl),
            endpoint_fmt=endpoint_formatted,
            method_lower=method.lower(),
            payload_declaration=payload_decl,
            payload_arg=payload_arg,
            content_type=content_type
        )

class CurlExampleGenerator(BaseExampleGenerator):
    def generate_example(self, endpoint: str, method: str, details: Dict) -> str:
        # Template for curl commands with environment variable and proper escaping
        template = '''# Export your CircleCI token as an environment variable
export CIRCLE_TOKEN="your-token"

curl -X {method} \\
     -H "Circle-Token: $CIRCLE_TOKEN" \\{content_type} \\
     {data_param}\\
     "https://circleci.com/api/v2{endpoint_fmt}"'''

        path_params = self._extract_params(endpoint)
        endpoint_formatted = endpoint

        # Replace path parameters with shell variable references
        for param in path_params:
            var_name = param.replace('-', '_')
            endpoint_formatted = endpoint_formatted.replace(
                f'{{{param}}}',
                f'${var_name}'
            )

        content_type = ''
        data_param = ''

        if 'requestBody' in details:
            content_type = '\n     -H "Content-Type: application/json" '
            data_param = '''-d '{
       "example": "data"
     }' '''

        return template.format(
            method=method.upper(),
            endpoint_fmt=endpoint_formatted,
            content_type=content_type,
            data_param=data_param
        )


# Main function to generate the patch file
def generate_patch(spec):
    generators = {
        "Go": GoExampleGenerator(),
        "NodeJS": NodeExampleGenerator(),
        # "Ruby": RubyExampleGenerator(),
        "Python": PythonExampleGenerator(),
        "Shell": CurlExampleGenerator(),
    }

    patch_lines = []
    patch_lines.append("diff --git a/openapi.json b/openapi.json")
    patch_lines.append("--- a/openapi.json")
    patch_lines.append("+++ b/openapi.json")

    for endpoint, methods in spec['paths'].items():
        for method, details in methods.items():
            # Skip if method is 'parameters' or other non-HTTP method
            if method not in ['get', 'post', 'put', 'delete', 'patch']:
                continue

            # Handle both list and dict responses
            description = ""
            if isinstance(details, dict):
                description = details.get('description', '')

            examples = []
            for lang, generator in generators.items():
                try:
                    example = generator.generate_example(endpoint, method, details if isinstance(details, dict) else {})
                    examples.append((lang, example))
                except Exception as e:
                    logger.error(f"Failed to generate {lang} example for {method} {endpoint}: {e}")
                    continue

            if examples:
                patch_lines.extend([
                    f"@@ -1,1 +1,{sum(len(ex[1].splitlines()) for ex in examples) + 10} @@",
                    f'         "{endpoint}": {{',
                    f'             "{method}": {{',
                    f'                 "description": "{description}",',
                    '+                "x-codeSamples": ['
                ])

                for lang, example in examples:
                    patch_lines.extend([
                        '+                    {',
                        f'+                        "lang": "{lang}",',
                        f'+                        "source": "{example}"',
                        '+                    },'
                    ])

                patch_lines[-1] = patch_lines[-1][:-1]  # Remove trailing comma
                patch_lines.extend([
                    '+                ]',
                    '             }'
                ])

    return "\n".join(patch_lines)



# Script entry point
def main():
    spec_file = "openapi.json"

    try:
        # Read the local OpenAPI spec file
        with open(spec_file) as f:
            spec = json.load(f)

        # Generate and save the patch file
        patch_content = generate_patch(spec)

        output_file = "circleci-examples.patch"

        with open(output_file, "w") as f:
            f.write(patch_content)

        logger.info(f"Successfully generated patch file: {output_file}")
    except Exception as e:
        logger.error(f"Failed to generate patch file: {e}")
        raise

if __name__ == "__main__":
    main()

