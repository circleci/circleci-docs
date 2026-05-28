package generator

import (
	"fmt"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// renderOperation produces the Markdown for a single endpoint: header,
// parameters, request body, and responses.
func renderOperation(op *openapi3.Operation, method, path string) string {
	var b strings.Builder

	summary := op.Summary
	if summary == "" {
		summary = op.OperationID
	}

	// Header with operation summary
	fmt.Fprintf(&b, "# %s\n\n", summary)
	fmt.Fprintf(&b, "`%s %s`\n\n", method, path)

	// Description
	if op.Description != "" {
		b.WriteString(strings.TrimSpace(op.Description) + "\n\n")
	}

	// Parameters section
	b.WriteString(renderParameters(op.Parameters))

	// Request body section
	b.WriteString(renderRequestBody(op.RequestBody))

	// Responses section
	b.WriteString(renderResponses(op.Responses))

	return b.String()
}

func renderParameters(params openapi3.Parameters) string {
	if len(params) == 0 {
		return ""
	}

	var b strings.Builder
	b.WriteString("## Parameters\n\n")

	for _, ref := range params {
		p := ref.Value
		if p == nil {
			continue
		}

		req := ""
		if p.Required {
			req = " (required)"
		}

		fmt.Fprintf(&b, "- **`%s`** (in: %s)%s", p.Name, p.In, req)

		if p.Description != "" {
			fmt.Fprintf(&b, " — %s", strings.TrimSpace(p.Description))
		}

		if p.Schema != nil && p.Schema.Value != nil {
			if ts := schemaTypeStr(p.Schema.Value); ts != "" {
				fmt.Fprintf(&b, " — %s", ts)
			}
		}

		b.WriteString("\n")
	}

	b.WriteString("\n")
	return b.String()
}

func renderRequestBody(rb *openapi3.RequestBodyRef) string {
	if rb == nil || rb.Value == nil {
		return ""
	}

	var b strings.Builder
	b.WriteString("## Request Body\n\n")

	if rb.Value.Description != "" {
		b.WriteString(strings.TrimSpace(rb.Value.Description) + "\n\n")
	}

	b.WriteString(renderContent(rb.Value.Content))
	return b.String()
}

func renderResponses(resp *openapi3.Responses) string {
	if resp == nil {
		return ""
	}

	var b strings.Builder
	b.WriteString("## Responses\n\n")

	respMap := resp.Map()
	for _, code := range sortedKeys(respMap) {
		r := respMap[code]
		desc := ""
		if r.Value != nil && r.Value.Description != nil {
			desc = strings.TrimSpace(*r.Value.Description)
		}

		fmt.Fprintf(&b, "### %s", code)
		if desc != "" {
			fmt.Fprintf(&b, " — %s", desc)
		}
		b.WriteString("\n\n")

		if r.Value != nil && r.Value.Content != nil {
			b.WriteString(renderContent(r.Value.Content))
		}
	}

	return b.String()
}

// renderContent emits the schema bullet list and example for each content type.
func renderContent(content openapi3.Content) string {
	var b strings.Builder

	for _, ct := range sortedKeys(content) {
		mt := content[ct]
		fmt.Fprintf(&b, "**`%s`**\n\n", ct)

		if mt.Schema != nil && mt.Schema.Value != nil {
			b.WriteString(renderSchema(mt.Schema.Value, 0, map[*openapi3.Schema]bool{}))
			b.WriteString("\n")
			b.WriteString(renderExample(mt.Schema.Value))
		}
	}

	return b.String()
}
