package generator

import (
	"fmt"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// renderSchema walks a schema and emits a nested bullet list of fields, types,
// required-ness, and descriptions. Handles oneOf/anyOf/allOf composition and
// guards against recursive or pathologically deep schemas.
func renderSchema(s *openapi3.Schema, depth int, seen map[*openapi3.Schema]bool) string {
	if s == nil {
		return ""
	}

	indent := strings.Repeat("  ", depth)

	switch {
	case depth > 10:
		return indent + "- *(max depth reached)*\n"
	case seen[s]:
		return indent + "- *(recursive reference)*\n"
	}

	seen[s] = true
	defer delete(seen, s)

	switch {
	case len(s.OneOf) > 0:
		return renderOptions(indent, "*one of:*", s.OneOf, depth, seen)
	case len(s.AnyOf) > 0:
		return renderOptions(indent, "*any of:*", s.AnyOf, depth, seen)
	case len(s.AllOf) > 0:
		return renderAllOf(s.AllOf, depth, seen)
	case isObjectLike(s):
		return renderObjectProperties(s, indent, depth, seen)
	case isType(s, "array"):
		return renderArray(s, indent, depth, seen)
	}

	return ""
}

// renderOptions formats a oneOf/anyOf composition as a header line followed by
// numbered alternatives.
func renderOptions(indent, label string, refs openapi3.SchemaRefs, depth int, seen map[*openapi3.Schema]bool) string {
	var b strings.Builder
	fmt.Fprintf(&b, "%s- %s\n", indent, label)

	for i, v := range refs {
		fmt.Fprintf(&b, "%s  - **option %d**\n", indent, i+1)
		b.WriteString(renderSchema(v.Value, depth+2, seen))
	}

	return b.String()
}

// renderAllOf inlines each member at the parent's depth with no header.
// allOf has intersection semantics, so members' fields belong to the
// enclosing schema.
func renderAllOf(refs openapi3.SchemaRefs, depth int, seen map[*openapi3.Schema]bool) string {
	var b strings.Builder

	for _, v := range refs {
		b.WriteString(renderSchema(v.Value, depth, seen))
	}

	return b.String()
}

func renderObjectProperties(s *openapi3.Schema, indent string, depth int, seen map[*openapi3.Schema]bool) string {
	required := map[string]bool{}
	for _, r := range s.Required {
		required[r] = true
	}

	var b strings.Builder

	for _, k := range sortedKeys(s.Properties) {
		v := s.Properties[k]
		if v == nil || v.Value == nil {
			continue
		}

		b.WriteString(renderProperty(indent, k, v.Value, required[k]))

		if hasNested(v.Value) {
			b.WriteString(renderSchema(v.Value, depth+1, seen))
		}
	}

	return b.String()
}

func renderProperty(indent, name string, v *openapi3.Schema, required bool) string {
	line := fmt.Sprintf("%s- **`%s`**", indent, name)

	if ts := schemaTypeStr(v); ts != "" {
		line += " " + ts
	}

	if required {
		line += " (required)"
	}

	if v.Description != "" {
		line += " — " + strings.TrimSpace(v.Description)
	}

	return line + "\n"
}

func renderArray(s *openapi3.Schema, indent string, depth int, seen map[*openapi3.Schema]bool) string {
	var b strings.Builder
	fmt.Fprintf(&b, "%s- array of:\n", indent)

	if s.Items != nil && s.Items.Value != nil {
		b.WriteString(renderSchema(s.Items.Value, depth+1, seen))
	}

	return b.String()
}

// isObjectLike returns true for an explicit `type: object` or for the OpenAPI
// shorthand where `properties` is set without a `type` declaration.
func isObjectLike(s *openapi3.Schema) bool {
	if s == nil {
		return false
	}
	if isType(s, "object") {
		return true
	}
	return s.Type == nil && len(s.Properties) > 0
}

func isType(s *openapi3.Schema, t string) bool {
	if s == nil || s.Type == nil {
		return false
	}
	for _, x := range *s.Type {
		if x == t {
			return true
		}
	}
	return false
}

func hasNested(s *openapi3.Schema) bool {
	if s == nil {
		return false
	}
	return len(s.Properties) > 0 || s.Items != nil || len(s.OneOf) > 0 || len(s.AnyOf) > 0 || len(s.AllOf) > 0
}

// schemaTypeStr formats a comma-separated, inline-code descriptor of a schema's
// type, format, and enum values for use inside bullet items.
func schemaTypeStr(s *openapi3.Schema) string {
	if s == nil {
		return ""
	}

	var parts []string

	if s.Type != nil && len(*s.Type) > 0 {
		parts = append(parts, "`"+strings.Join(*s.Type, "|")+"`")
	}

	if s.Format != "" {
		parts = append(parts, "format: `"+s.Format+"`")
	}

	if len(s.Enum) > 0 {
		var items []string
		for _, e := range s.Enum {
			items = append(items, fmt.Sprintf("`%v`", e))
		}
		parts = append(parts, "enum: ["+strings.Join(items, ", ")+"]")
	}

	return strings.Join(parts, ", ")
}
