# Content Review: Workflow Orchestration

**Page:** `docs/guides/modules/orchestrate/pages/workflows.adoc`
**Audience:** Junior Engineer
**Review Date:** 2026-05-08

## Executive Summary

The workflows page is a comprehensive, well-structured reference document that successfully covers both "why" and "how" for CircleCI workflows. The opening paragraph effectively establishes value, and the extensive configuration examples provide practical guidance. However, there are opportunities to improve navigation and self-containment of code examples, strengthen section introductions for better standalone comprehension, and address some minor consistency issues with related orchestration pages.

## Priority Recommendations

### High: Improve Code Example Self-Containment

**Category:** Code Examples

**Issue:** Code examples lack sufficient inline comments explaining what they demonstrate. When an AI agent or reader extracts just a code block, critical context is lost because explanatory information exists only in surrounding prose.

**Impact:** AI agents retrieving individual code blocks won't understand what the example demonstrates without also retrieving the surrounding text. Junior engineers copying examples may miss important details about what each configuration accomplishes.

**Recommendation:** Add inline comments within YAML code blocks to explain what each section does. This is especially important for:

- Lines 78-93 (Sequential job execution example) - add comments explaining the dependency chain
- Lines 118-142 (Fan-out/fan-in example) - add comments showing where fan-out begins and fan-in completes
- Lines 156-172 (Flexible job dependency example) - add comments explaining the terminal states like `failed` and `canceled`
- Lines 273-298 (Manual approval example) - add comments explaining the `type: approval` and why downstream jobs require the hold job

**Example:**

Before (lines 78-93):
```yaml
workflows:
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - deploy:
          requires:
            - test2
```

After:
```yaml
workflows:
  build-test-and-deploy:
    jobs:
      - build  # First job runs immediately
      - test1:
          requires:
            - build  # test1 waits for build to complete successfully
      - test2:
          requires:
            - test1  # test2 waits for test1 to complete successfully
      - deploy:
          requires:
            - test2  # deploy runs last, after all tests pass
```

---

### High: Replace Vague "Overview" Heading

**Category:** Headings

**Issue:** The "Overview" heading at line 9 is generic and doesn't signal what the section contains. This is a navigational anti-pattern that makes it harder for both humans and AI agents to locate specific information.

**Impact:** When scanning the table of contents or searching for specific workflow concepts, "Overview" provides no signal about content. An agent asked "What can I do with workflows?" might not identify this section as containing the answer.

**Recommendation:** Replace "Overview" with a descriptive heading that tells readers what they'll learn, such as "What Are Workflows?" or "Workflow Capabilities and Benefits".

**Example:**

Current (line 8-20):
```
[#overview]
== Overview

A *workflow* is a set of rules...
```

Suggested:
```
[#workflow-capabilities]
== Workflow Capabilities and Benefits

A *workflow* is a set of rules...
```

---

### Medium: Add Context to Major Section Introductions

**Category:** Section Introductions

**Issue:** Several major sections lack standalone introductory context. For example:
- "Workflows configuration examples" (line 22) jumps directly to a TIP without explaining what readers will learn
- "Using filters in your workflows" (line 622) lacks an intro explaining why filters matter
- "Scheduling a workflow" (line 438) starts with notes about limitations rather than explaining the value proposition

**Impact:** When AI agents retrieve individual sections, they lack context about what the section covers and why it's relevant. Junior engineers jumping to these sections via search or table of contents may not understand how the content fits into the broader workflow picture.

**Recommendation:** Add 1-2 sentence introductions before each major section that:
- Explain what the section covers
- State why the reader should care
- Provide context about when to use these features

**Example:**

Current (lines 621-624):
```
[#using-filters-in-your-workflows]
== Using filters in your workflows

The following sections provide examples for using filters in your workflows to manage job execution.
```

Suggested:
```
[#using-filters-in-your-workflows]
== Using filters in your workflows

Filters control which branches or tags trigger specific jobs in your workflows. Use filters to run different sets of jobs for development branches versus production tags, or to limit expensive jobs to specific branches. The following sections provide examples for using filters in your workflows to manage job execution.
```

---

### Medium: Strengthen Opening Paragraph Value Proposition

**Category:** Value Proposition

**Issue:** While the first paragraph (line 6) does establish value, it's somewhat technical and focuses more on capabilities than on solving user problems. It mentions "orchestrate jobs" and "options" but doesn't immediately convey concrete benefits like "faster feedback" or "efficient testing."

**Impact:** A junior engineer scanning multiple documentation pages might not immediately understand why workflows matter for their daily work. The current opening requires reading the entire paragraph and the bullet list below "Overview" to grasp the full value.

**Recommendation:** Strengthen the opening by leading with the problems workflows solve before explaining what they are. Consider restructuring to emphasize outcomes first.

**Example:**

Current (line 6):
```
Workflows in CircleCI are used to orchestrate jobs. Workflows have options to control run order, scheduling, and access to resources. This page explains how to configure workflows to suit your project. Optimizing your workflows can increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.
```

Suggested:
```
Workflows orchestrate your CircleCI jobs to give you faster feedback, shorter reruns, and more efficient use of resources. With workflows, you can run tests in parallel, deploy only after all tests pass, schedule nightly builds, and control exactly when and how your jobs run. This page shows you how to configure workflows to optimize your CI/CD pipeline.
```

---

### Medium: Improve Consistency with Related Pages

**Category:** Consistency

**Issue:** The workflows page uses some terminology and patterns differently from related orchestration pages:

1. **First paragraph pattern**: Other orchestration pages like `pipelines.adoc` and `automatic-reruns.adoc` start with clearer problem-solution framing
2. **"Overview" section duplication**: The page has both an opening paragraph and an "Overview" section that partially overlap in explaining what workflows are
3. **Code example titles**: Some examples use titles (`.Sequential Job Execution Workflow`) while others don't, creating inconsistent patterns

**Impact:** Users navigating between related orchestration pages may experience cognitive friction from differing structures. The duplicate overview content in two places (opening + Overview section) creates unnecessary repetition.

**Recommendation:**
- Align the opening paragraph pattern with `automatic-reruns.adoc` which effectively states the problem, solution, and use cases
- Consider merging the capabilities bullet list (currently in Overview section) into the opening paragraph area
- Standardize on using titles for all major code examples

---

## Detailed Findings

### ✅ Tone & Audience

The page successfully maintains a friendly, authoritative tone appropriate for junior engineers. Active voice is used consistently (e.g., "Create workflows to orchestrate your jobs" rather than "Workflows can be created"). Technical depth is appropriate - concepts like fan-out/fan-in and dependency graphs are explained with both text and diagrams.

Minor observation: The manual approval section is particularly well-written with clear step-by-step guidance and multiple access paths (web app + API).

### ⚠️ Why & How

**Why:** Adequately covered in the opening and Overview section, though as noted in Priority Recommendations, the value proposition could be stronger.

**How:** Excellently covered with extensive configuration examples, multiple workflow patterns (concurrent, sequential, fan-out/fan-in), and practical scenarios like manual approvals and scheduling.

The page successfully balances both dimensions, though the "why" could be more compelling upfront.

### ⚠️ Headings

**Issues identified:**
- "Overview" is too vague (covered in Priority Recommendations)
- Some subsections could be more descriptive:
  - "Specifying a valid schedule" (line 487) → "Schedule Requirements and Syntax"
  - "Nightly example" (line 454) → "Build Every Night"

**Strengths:**
- Most headings follow a logical sequence telling a workflow configuration story
- Headings generally use action verbs ("Hold a workflow", "Scheduling a workflow")
- No skipped heading levels

### ⚠️ Code Examples

Covered extensively in Priority Recommendations. The code examples are complete and appear to be valid YAML, but lack inline comments that would make them self-contained for agent retrieval.

Additional observation: The page does an excellent job linking to full working examples in GitHub (e.g., line 59, 101, 146), which provides users with tested, complete configurations to reference.

### ⚠️ Information Architecture

**Potential issue:** The "flexible job dependency" section (lines 148-240) contains important information about terminal states and the `requires` key syntax, but this is buried mid-page. This is advanced functionality that affects how workflows behave.

**Evaluation:** While this information is somewhat buried, it's appropriately placed after users understand basic sequential and fan-out patterns. The section has good examples and clear explanations.

**Note usage:** The page makes appropriate use of NOTE, TIP, and CAUTION admonitions for supplementary information without burying critical content in them.

### ⚠️ Section Introductions

Covered in Priority Recommendations. Several sections lack standalone introductions that would help both human readers and AI agents understand context when landing mid-page.

### ⚠️ Consistency

Covered in Priority Recommendations. Minor terminology and structural differences from related pages noted.

### ✅ Repetition

No unnecessary repetition detected. The page covers each concept once with appropriate cross-references to related pages (e.g., workspaces, contexts, configuration reference).

### ⚠️ Flow & Structure

**Overall flow:** The page follows a logical progression from simple to complex:
1. What workflows are
2. Basic concurrent execution
3. Sequential execution
4. Fan-out/fan-in patterns
5. Advanced features (flexible dependencies, manual approval, scheduling, filters)
6. Operational concerns (states, troubleshooting)

**Minor issue:** The "Rerunning a workflow's failed jobs" section (line 848) appears before "Workflow states" (line 885), but understanding states would help contextualize what "failed" means. Consider swapping these sections.

**Transition quality:** Most transitions are clear, though the jump from "Using contexts" (line 538) to "Use conditional logic in workflows" (line 573) is abrupt and could benefit from a connecting sentence.

### ✅ Value Proposition

As noted in Priority Recommendations, the first paragraph establishes value but could be stronger. The Overview section's bullet list does effectively communicate the "with workflows, you can..." value proposition.

---

## Consistency Check

**Related pages reviewed:**
- `docs/guides/modules/orchestrate/pages/jobs-steps.adoc`
- `docs/guides/modules/orchestrate/pages/workspaces.adoc`
- `docs/guides/modules/orchestrate/pages/pipelines.adoc`
- `docs/guides/modules/orchestrate/pages/automatic-reruns.adoc`

**Findings:**

**Terminology alignment:**
- ✅ All pages consistently use "CircleCI web app" (not "UI" or "interface")
- ✅ Consistent use of "orchestrate" across workflows/pipelines pages
- ✅ Terminology for "executors", "jobs", "steps" aligns with `jobs-steps.adoc`

**Structural patterns:**
- ⚠️ `automatic-reruns.adoc` has a stronger opening pattern: problem statement → solution → use cases → benefits. The workflows page could adopt this pattern.
- ⚠️ `workspaces.adoc` provides excellent standalone section introductions (see line 14-28 of workspaces.adoc), which the workflows page could emulate
- ✅ Code example formatting is consistent across all pages (uses `include::ROOT:partial$notes/docker-auth.adoc[]` where relevant)

**Cross-references:**
- ✅ Pages correctly cross-reference each other (workflows ↔ jobs ↔ pipelines ↔ workspaces)
- ✅ Links use proper xref syntax with title case

**Page attributes:**
- ✅ All pages use consistent `:page-platform: Cloud, Server v4+` format
- ✅ All pages include `:experimental:` attribute
- ⚠️ Some pages have more descriptive `:page-description:` attributes than others. The workflows description is adequate but generic.

---

## Positive Highlights

1. **Excellent visual aids**: The page includes workflow diagrams (sequential, fan-out/fan-in, state diagrams) that significantly enhance comprehension. The state diagrams at lines 890-957 are particularly valuable for understanding workflow lifecycles.

2. **Comprehensive manual approval documentation**: The "Hold a workflow for a manual approval" section (lines 242-434) is exemplary. It covers both web app and API approaches, explains how to identify approvers, and provides complete curl examples. This is some of the best API documentation in the reviewed pages.

3. **Strong practical examples**: The page provides working GitHub repository links for full configurations (lines 59, 101, 146, 535, 676), allowing users to see real-world implementations. This bridges the gap between documentation snippets and production use.

4. **Well-organized troubleshooting section**: The troubleshooting section (lines 1010-1035) addresses common issues with clear solutions and actionable next steps.

---

## Overall Assessment

**Overall quality rating: High (B+)**

This is a comprehensive, well-structured reference document that successfully serves as the authoritative guide for CircleCI workflows. The extensive code examples, clear progression from simple to complex patterns, and excellent visual aids make it valuable for both junior engineers learning workflows and experienced users looking up specific syntax.

The main opportunities for improvement lie in:
1. Making code examples more self-contained with inline comments
2. Improving section introductions for better standalone comprehension
3. Strengthening the opening value proposition
4. Aligning structural patterns with the strongest examples from related pages

These are quality enhancements rather than critical fixes. The page already serves its purpose well - implementing these recommendations would elevate it from "comprehensive reference" to "exceptional learning resource" that works equally well for human readers and AI agents.

**Recommended next steps:**
1. Add inline comments to the top 5 code examples (concurrent, sequential, fan-out/fan-in, flexible requires, manual approval)
2. Replace the "Overview" heading with something descriptive
3. Add 1-2 sentence introductions to major sections lacking context
4. Consider restructuring the opening paragraph to lead with problems/solutions
