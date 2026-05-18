// Generate per-operation Markdown + llms.txt from a bundled OpenAPI JSON spec.
//
// This tool processes the CircleCI API v2 OpenAPI specification and generates
// LLM-friendly markdown documentation with per-endpoint files and a structured
// index (llms.txt) for agent navigation.
//
// Usage:
//
//	go run ./cmd/generate-api-markdown <openapi.json> <output-dir>
//
// Example:
//
//	go run ./cmd/generate-api-markdown openapi-bundled.json build/api/v2
package main

import (
	"fmt"
	"os"

	"github.com/circleci/circleci-docs/scripts/generate-api-markdown/internal/generator"
)

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintln(os.Stderr, "Usage: generate-api-markdown <openapi.json> <output-dir>")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Generates LLM-friendly markdown documentation from OpenAPI spec:")
		fmt.Fprintln(os.Stderr, "  - Per-operation markdown files in <output-dir>/operations/")
		fmt.Fprintln(os.Stderr, "  - Structured index at <output-dir>/llms.txt")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Example:")
		fmt.Fprintln(os.Stderr, "  generate-api-markdown openapi-bundled.json build/api/v2")
		os.Exit(1)
	}

	inputFile := os.Args[1]
	outputDir := os.Args[2]

	if err := generator.Generate(inputFile, outputDir); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("✅ Successfully generated API markdown documentation")
}
