package generator

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/getkin/kin-openapi/openapi3"
)

const specialInstructions = "## Special Instructions\n\n" +
	"- Base URL: `https://circleci.com/api/v2`\n" +
	"- Authentication: send a personal API token in the `Circle-Token` header. Generate one at <https://app.circleci.com/settings/user/tokens>.\n" +
	"- `project_id` parameters are UUIDs (not the `gh/org/repo` slug used by older endpoints).\n" +
	"- Rate limiting: 5000 requests per hour per token.\n" +
	"- The full OpenAPI spec is at <https://circleci.com/docs/api/v2/openapi.json>.\n" +
	"- Each operation below links to a per-endpoint Markdown file at `/api/v2/operations/{operationId}.md`. The same `operationId` corresponds to the `#operation/{operationId}` fragment on the rendered docs page.\n" +
	"- HTML documentation for humans: <https://circleci.com/docs/api/v2/>.\n"

var httpMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}

type opInfo struct {
	OperationID string
	Summary     string
	Tag         string
	Method      string
	Path        string
}

// Generate loads the OpenAPI spec, writes one Markdown file per operation,
// and emits llms.txt as the tag-grouped index.
func Generate(inputFile, outputDir string) error {
	// Load OpenAPI spec
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromFile(inputFile)
	if err != nil {
		return fmt.Errorf("failed to load OpenAPI spec: %w", err)
	}

	// Create operations directory
	opsDir := filepath.Join(outputDir, "operations")
	if err := os.MkdirAll(opsDir, 0o755); err != nil {
		return fmt.Errorf("failed to create operations directory: %w", err)
	}

	// Generate per-operation markdown files
	pathMap := doc.Paths.Map()
	var ops []opInfo

	for _, p := range sortedKeys(pathMap) {
		item := pathMap[p]
		for _, method := range httpMethods {
			op := item.GetOperation(method)
			if op == nil {
				continue
			}

			info, err := writeOperation(opsDir, p, method, op)
			if err != nil {
				return fmt.Errorf("failed to write operation %s %s: %w", method, p, err)
			}
			if info != nil {
				ops = append(ops, *info)
			}
		}
	}

	// Generate llms.txt index
	if err := writeLlmsTxt(outputDir, doc, ops); err != nil {
		return fmt.Errorf("failed to write llms.txt: %w", err)
	}

	// Generate JSON index
	if err := writeJSONIndex(opsDir, ops); err != nil {
		return fmt.Errorf("failed to write JSON index: %w", err)
	}

	fmt.Printf("Generated %d operation files in %s\n", len(ops), opsDir)
	return nil
}

// writeOperation renders one operation to disk and returns the index entry.
// Returns nil to signal that the operation was skipped (no operationId).
func writeOperation(opsDir, path, method string, op *openapi3.Operation) (*opInfo, error) {
	if op.OperationID == "" {
		fmt.Fprintf(os.Stderr, "⚠️  Skipping %s %s — no operationId\n", method, path)
		return nil, nil
	}

	md := renderOperation(op, method, path)
	filename := filepath.Join(opsDir, op.OperationID+".md")

	if err := os.WriteFile(filename, []byte(md), 0o644); err != nil {
		return nil, err
	}

	tag := "Other"
	if len(op.Tags) > 0 {
		tag = op.Tags[0]
	}

	summary := op.Summary
	if summary == "" {
		summary = op.OperationID
	}

	return &opInfo{
		OperationID: op.OperationID,
		Summary:     summary,
		Tag:         tag,
		Method:      method,
		Path:        path,
	}, nil
}

// writeJSONIndex generates a machine-readable operations/index.json file.
func writeJSONIndex(opsDir string, ops []opInfo) error {
	// Extract unique tags
	tagSet := make(map[string]bool)
	for _, op := range ops {
		tagSet[op.Tag] = true
	}
	tags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		tags = append(tags, tag)
	}
	sort.Strings(tags)

	// Build index structure
	type Operation struct {
		OperationID string `json:"operationId"`
		Summary     string `json:"summary"`
		Method      string `json:"method"`
		Path        string `json:"path"`
		Tag         string `json:"tag"`
		MarkdownURL string `json:"markdownUrl"`
	}

	type Index struct {
		Version    string      `json:"version"`
		BaseURL    string      `json:"baseUrl"`
		Operations []Operation `json:"operations"`
		Tags       []string    `json:"tags"`
	}

	operations := make([]Operation, len(ops))
	for i, op := range ops {
		operations[i] = Operation{
			OperationID: op.OperationID,
			Summary:     op.Summary,
			Method:      op.Method,
			Path:        op.Path,
			Tag:         op.Tag,
			MarkdownURL: "/api/v2/operations/" + op.OperationID + ".md",
		}
	}

	index := Index{
		Version:    "2.0",
		BaseURL:    "https://circleci.com/api/v2",
		Operations: operations,
		Tags:       tags,
	}

	data, err := json.MarshalIndent(index, "", "  ")
	if err != nil {
		return err
	}

	filename := filepath.Join(opsDir, "index.json")
	return os.WriteFile(filename, data, 0o644)
}

func sortedKeys[V any](m map[string]V) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
