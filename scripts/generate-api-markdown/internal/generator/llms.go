package generator

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// writeLlmsTxt emits the top-level llms.txt index: title, description, special
// instructions, and a tag-grouped list linking to each per-operation file.
func writeLlmsTxt(outDir string, doc *openapi3.T, ops []opInfo) error {
	var b strings.Builder

	// Header
	fmt.Fprintf(&b, "# %s\n\n", doc.Info.Title)

	if doc.Info.Description != "" {
		fmt.Fprintf(&b, "> %s\n\n", strings.TrimSpace(doc.Info.Description))
	}

	// Special instructions
	b.WriteString(specialInstructions + "\n")

	// Group operations by tag
	byTag := map[string][]opInfo{}
	for _, o := range ops {
		byTag[o.Tag] = append(byTag[o.Tag], o)
	}

	// Get ordered tags (spec order + alphabetical for undefined)
	tags := orderedTags(doc.Tags, byTag)

	// Emit tag sections
	for _, tag := range tags {
		fmt.Fprintf(&b, "## %s\n\n", tag)

		for _, o := range byTag[tag] {
			fmt.Fprintf(&b, "- [%s](/api/v2/operations/%s.md): `%s %s`\n",
				o.Summary, o.OperationID, o.Method, o.Path)
		}

		b.WriteString("\n")
	}

	// Write to file
	filename := filepath.Join(outDir, "llms.txt")
	return os.WriteFile(filename, []byte(b.String()), 0o644)
}

// orderedTags returns tag names in spec-declared order followed by any tags
// that were used by operations but not declared in the spec, sorted alphabetically.
func orderedTags(declared openapi3.Tags, byTag map[string][]opInfo) []string {
	var ordered []string
	seen := map[string]bool{}

	// First add declared tags that have operations
	for _, t := range declared {
		if _, ok := byTag[t.Name]; ok {
			ordered = append(ordered, t.Name)
			seen[t.Name] = true
		}
	}

	// Then add any undeclared tags alphabetically
	var leftovers []string
	for t := range byTag {
		if !seen[t] {
			leftovers = append(leftovers, t)
		}
	}
	sort.Strings(leftovers)

	return append(ordered, leftovers...)
}
