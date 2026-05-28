package generator

import (
	"encoding/json"

	"github.com/getkin/kin-openapi/openapi3"
)

// renderExample synthesizes a JSON example payload from a schema and emits it
// as a fenced code block. Returns "" if no example can be produced or the
// schema is trivial enough that an example would just echo the field list.
func renderExample(s *openapi3.Schema) string {
	if isTrivialSchema(s) {
		return ""
	}

	v := synthExample(s, 0, map[*openapi3.Schema]bool{})
	if v == nil {
		return ""
	}

	out, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return ""
	}

	return "**Example:**\n\n```json\n" + string(out) + "\n```\n\n"
}

// isTrivialSchema returns true for objects with exactly one primitive-typed
// property. For these, a synthesized example just echoes the schema bullet.
func isTrivialSchema(s *openapi3.Schema) bool {
	if s == nil || !isObjectLike(s) || len(s.Properties) != 1 {
		return false
	}

	for _, ref := range s.Properties {
		if ref == nil || ref.Value == nil || ref.Value.Type == nil || len(*ref.Value.Type) == 0 {
			return false
		}
		switch (*ref.Value.Type)[0] {
		case "string", "integer", "number", "boolean":
			return true
		}
	}

	return false
}

// synthExample produces a representative JSON value for a schema so agents see
// a concrete payload shape. Priority: explicit Example, then recurse into
// composite/structural shapes, then Default, then first enum value, then
// type-aware placeholder or zero value.
func synthExample(s *openapi3.Schema, depth int, seen map[*openapi3.Schema]bool) any {
	if s == nil || depth > 10 || seen[s] {
		return nil
	}

	if s.Example != nil {
		return s.Example
	}

	if v := synthComposition(s, depth, seen); v != nil {
		return v
	}

	switch {
	case isObjectLike(s):
		return synthObject(s, depth, seen)
	case isType(s, "array"):
		return synthArray(s, depth, seen)
	}

	if s.Default != nil {
		return s.Default
	}

	if len(s.Enum) > 0 {
		return s.Enum[0]
	}

	return synthPrimitive(s)
}

// synthComposition handles oneOf/anyOf/allOf when synthesizing an example.
// oneOf and anyOf use the first option; allOf merges every member's object fields.
func synthComposition(s *openapi3.Schema, depth int, seen map[*openapi3.Schema]bool) any {
	if len(s.OneOf) > 0 && s.OneOf[0].Value != nil {
		return synthExample(s.OneOf[0].Value, depth+1, seen)
	}

	if len(s.AnyOf) > 0 && s.AnyOf[0].Value != nil {
		return synthExample(s.AnyOf[0].Value, depth+1, seen)
	}

	if len(s.AllOf) == 0 {
		return nil
	}

	merged := map[string]any{}
	for _, ref := range s.AllOf {
		sub, ok := synthExample(ref.Value, depth+1, seen).(map[string]any)
		if !ok {
			continue
		}
		for k, v := range sub {
			merged[k] = v
		}
	}

	if len(merged) == 0 {
		return nil
	}

	return merged
}

func synthObject(s *openapi3.Schema, depth int, seen map[*openapi3.Schema]bool) map[string]any {
	seen[s] = true
	defer delete(seen, s)

	out := map[string]any{}

	for _, k := range sortedKeys(s.Properties) {
		v := s.Properties[k]
		if v == nil || v.Value == nil {
			continue
		}
		out[k] = synthExample(v.Value, depth+1, seen)
	}

	return out
}

func synthArray(s *openapi3.Schema, depth int, seen map[*openapi3.Schema]bool) []any {
	if s.Items == nil || s.Items.Value == nil {
		return []any{}
	}

	return []any{synthExample(s.Items.Value, depth+1, seen)}
}

func synthPrimitive(s *openapi3.Schema) any {
	if s.Type == nil || len(*s.Type) == 0 {
		return nil
	}

	switch (*s.Type)[0] {
	case "string":
		return synthStringFormat(s.Format)
	case "integer", "number":
		return 0
	case "boolean":
		return false
	}

	return nil
}

// synthStringFormat returns recognizable placeholders for common string
// formats. The specific values are chosen to read as obvious examples.
func synthStringFormat(format string) string {
	switch format {
	case "date-time":
		return "2024-01-01T00:00:00Z"
	case "date":
		return "2024-01-01"
	case "uuid":
		return "00000000-0000-0000-0000-000000000000"
	case "email":
		return "user@example.com"
	case "uri", "url":
		return "https://example.com"
	}

	return ""
}
