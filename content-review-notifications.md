# Content Review: Notifications Overview

**Page:** `docs/guides/modules/integration/pages/notifications.adoc`
**Audience:** Junior Engineer
**Review Date:** 2026-05-12

## Executive Summary

This page provides a comprehensive overview of CircleCI notifications across multiple channels (email, Slack) and levels (user, project, organization). The content is well-structured and includes helpful screenshots. However, there are critical issues with the opening paragraph that buries important context, inconsistent heading patterns, and sections that lack sufficient "why" information. The page would benefit from clarifying what users can accomplish and setting clearer expectations upfront.

## Priority Recommendations

### Critical: Opening paragraph buries the value proposition

**Category:** Value Proposition

**Issue:** The first paragraph jumps straight into a list of notification types without explaining why someone would read this page or what problem notifications solve. The second paragraph introduces organization-level contacts, which is confusing context-switching for readers trying to understand the page scope.

**Impact:** Readers (human or agent) can't quickly determine if this page is relevant to them. A junior engineer looking for "how do I get notified when my build fails" has to read through abstract descriptions before understanding what's available.

**Recommendation:** Rewrite the opening to clearly state:
1. What problem notifications solve (staying informed about build status without constantly checking the web app)
2. What options are available (email and Slack)
3. What this page will teach them (how to configure notifications at different levels)

**Example:**
```
CircleCI can notify you when builds complete, workflows fail, or deployments finish, so you don't have to constantly check the web app. You can configure email notifications at the user level for your own work, set up Slack notifications at the project level for your team, and manage organization-wide contacts for security and technical communications.

This page explains how to configure all three notification levels.
```

---

### High: Inconsistent heading structure and missing section introductions

**Category:** Headings & Section Introductions

**Issue:** Heading levels are inconsistent (notifications.adoc:103 uses `== Slack notifications - Preview` which breaks from the pattern), and several major sections lack introductory context. For example, "User-level notifications" (line 10) has a brief intro, but "Organization-level contacts" (line 107) jumps straight into setup without explaining why these exist or how they differ from user-level notifications.

**Impact:**
- Agents retrieving just one section may miss critical context
- Readers lose track of where they are in the document structure
- The preview label in the heading is unusual and could be handled with a page attribute or admonition instead

**Recommendation:**
1. Move the "Preview" badge to a `:page-badge: Preview` attribute or CAUTION admonition at the start of the Slack section
2. Add standalone introductions to each major section explaining what it covers and why someone would use it
3. Ensure heading structure follows a logical hierarchy without mixing badges into heading text

**Example for "Organization-level contacts":**
```
== Organization-level contacts

Organization-level contacts are different from user-level notifications. These are used by CircleCI to reach designated administrators during security events, deprecation notices, and platform-level changes. They ensure your organization has a reliable point of contact for critical communications that affect your entire team, not just individual developers.
```

---

### High: Code-like elements lack context for standalone retrieval

**Category:** Code Examples & Information Architecture

**Issue:** The notification category sections (notifications.adoc:49-102) describe email preferences with text like "You can further filter the notifications you receive based on the status of the build as follows:" followed by a bulleted list. However, these sections don't explain what "My work" or "Followed projects" actually mean before diving into filtering options.

**Impact:** If an agent retrieves just the "My work" section, they won't understand the difference between "My work" and "Followed projects." The context is implicit rather than explicit. Additionally, the NOTE blocks at lines 63 and 94 contain critical information about override behavior that should be more prominently placed in the main text.

**Recommendation:**
1. Add explicit definitions at the start of each category section
2. Move the override behavior from NOTE blocks into the main text, as it's essential to understanding how the filters work
3. Consider a summary table showing all categories side-by-side before diving into details

**Example:**
```
==== My work

The *My work* category sends notifications for builds that **you personally triggered**. Use this to track your own commits and workflow runs.

You can filter which notifications you receive based on build status. Note that "On default branch (any status)" overrides individual status filters. For example, if you enable "On default branch (any status)" but disable "Cancelled" notifications, you will still receive notifications for cancelled workflows on your default branch.

Available filters:
* On default branch (any status)
* On default branch (failed, error, unauthorized)
[...]
```

---

### Medium: Repetition in TIP blocks

**Category:** Repetition

**Issue:** The same TIP about email addresses appears twice (notifications.adoc:32 and notifications.adoc:40), word-for-word. Both instances explain the difference between email/password login and GitHub/Bitbucket login.

**Impact:** This repetition adds unnecessary length and suggests the content could be restructured. If a user sees the same tip twice in quick succession, it reduces trust in the documentation's editing quality.

**Recommendation:** Consolidate these tips into a single TIP or NOTE at the beginning of the "User-level notifications" section, or create a reusable partial in `docs/guides/modules/ROOT/partials/notes/` that can be included where needed.

**Example:**
Move the TIP to line 14 (right after the "User-level notifications" heading):
```
== User-level notifications

TIP: Your available email addresses depend on how you log in. If you use email and password, you will have a single email address. If you log in via GitHub or Bitbucket, you will see all email addresses associated with your connected account.

Configure your notification preferences, including the email address to use and the notifications categories you would like to receive.
```

---

### Medium: Missing "why" for deployment and Chunk notifications

**Category:** Why & How

**Issue:** The sections for "Deployment notifications" (line 76) and "Chunk notifications" (line 99) are very brief and immediately redirect readers to other pages without explaining what problem these notifications solve or when someone would want them.

**Impact:** Readers can't make an informed decision about whether to click through. These sections feel like placeholders rather than useful content. A reader scanning the page won't understand what Chunk is or why they'd want notifications about it.

**Recommendation:** Add 1-2 sentences explaining the use case and value before redirecting to the detailed guide.

**Example for Chunk notifications:**
```
==== Chunk notifications

Chunk is CircleCI's AI-powered debugging assistant. You can receive notifications when a teammate attempts to use Chunk to fix an error or workflow, allowing you as an org administrator to evaluate and enable Chunk for your organization. This helps your team discover how AI debugging could save time before you commit to enabling the feature.

For a full guide to setting up and using Chunk, see the xref:guides:toolkit:chunk-setup-and-overview.adoc[Chunk Overview and Setup] guide.
```

---

## Detailed Findings

✅ **Tone & Audience**: The tone is generally appropriate for a junior engineer. The language is clear and accessible, with friendly guidance ("You can configure...", "Follow these steps..."). No major issues.

⚠️ **Why & How**: The "why" is weak in the opening paragraph and missing from several subsections (deployment notifications, Chunk notifications, organization-level contacts). The "how" is well-covered with clear step-by-step instructions and screenshots.

⚠️ **Headings**: The heading structure is mostly logical but breaks down with "Slack notifications - Preview" (line 103), which mixes a status label into the heading. The sequence tells a story (user → project → organization → orbs), which is good, but could be more explicit.

✅ **Code Examples**: Not heavily applicable to this page since it's configuration-focused rather than code-focused. The step-by-step instructions with screenshots serve the same purpose and are well-executed.

⚠️ **Information Architecture**: The NOTE blocks at lines 63 and 94 contain critical information about override behavior that should be in the main text. The structure of user → project → organization is logical, but the opening paragraph doesn't prepare readers for this structure.

⚠️ **Section Introductions**: "User-level notifications" has a decent intro (line 12), but "Organization-level contacts" (line 107) lacks context. The notification category subsections (My work, Followed projects) jump into filtering options without defining what the categories mean.

⚠️ **Consistency**: Compared to related pages:
- The slack-integration.adoc page has a much stronger opening that clearly states use case and value
- The outbound-webhooks.adoc page uses an "Introduction" section effectively to set context
- The slack-orb-tutorial.adoc page has a clear list of "you will learn" and "you need" at the start
- This notifications.adoc page should adopt similar patterns for clarity

⚠️ **Repetition**: The TIP about email addresses appears twice (lines 32 and 40). This is unnecessary repetition.

✅ **Flow & Structure**: The overall flow (user-level → project-level → organization-level) is logical and makes sense. The transitions are adequate, though some sections could use better connective text.

⚠️ **Value Proposition**: The opening paragraph is weak and doesn't clearly state the value proposition or use case. Compare to slack-integration.adoc line 9: "Use the CircleCI Slack app to receive workflow notifications in Slack." That's clear and direct.

---

## Consistency Check

**Related pages reviewed:**
- `docs/guides/modules/integration/pages/slack-integration.adoc`
- `docs/guides/modules/integration/pages/outbound-webhooks.adoc`
- `docs/guides/modules/getting-started/pages/slack-orb-tutorial.adoc`

**Findings:**

**Terminology:**
- All pages consistently use "workflow" and "build" in appropriate contexts
- "Organization administrator" vs "org administrator" - slack-integration.adoc uses "organization administrator" (line 21), while notifications.adoc uses both "organization admins" (line 8) and "organization administrator" (line 114). Should standardize to "organization administrator" for consistency.
- The term "default email address" is used consistently in notifications.adoc

**Structural patterns:**
- slack-integration.adoc and slack-orb-tutorial.adoc both open with strong value propositions and clear "you will learn" sections
- notifications.adoc lacks this pattern and would benefit from adopting it
- All three use numbered step headings (== 1. Install..., == 2. Link...), which is good for consistency

**Explanations:**
- slack-integration.adoc clearly explains prerequisites and permissions before diving into setup
- notifications.adoc could benefit from a similar prerequisites section, especially for organization-level contacts
- The explanations don't conflict, but notifications.adoc references "Slack notifications at the project level" (line 6) without explaining that this is a preview feature (that information only appears at line 103)

**Overall consistency:** Mostly aligned on terminology, but notifications.adoc is weaker on structural patterns (missing strong opening, missing prerequisites section) compared to related integration pages.

---

## Positive Highlights

1. **Excellent use of screenshots**: Every major configuration step includes a relevant, well-captioned screenshot (default-email.png, email-notifications.png, categories-my-work.png, etc.). This visual guidance is especially helpful for junior engineers navigating the UI.

2. **Comprehensive coverage**: The page covers all notification levels (user, project, organization) in one place, making it a valuable reference for understanding the full notification ecosystem.

3. **Clear step-by-step instructions**: The numbered steps for setting up organization-level contacts (lines 114-120) and the bulleted instructions for notification categories are easy to follow. The inclusion of partials like `steps-to-user-settings.adoc` (line 24) ensures consistency with other documentation.

---

## Overall Assessment

**Quality Rating:** Good foundation with room for improvement (7/10)

This page has solid bones: comprehensive coverage, helpful screenshots, and logical structure. The main issues are a weak opening that doesn't set clear expectations, some missing context in subsections, and minor inconsistencies with related pages. With targeted improvements to the value proposition, section introductions, and elimination of repetition, this page could become an excellent reference for CircleCI notifications.

**Recommended next steps:** Start with the critical priority (rewrite the opening paragraph), then address the high-priority issues (consistent headings, better section introductions, move critical info out of NOTE blocks). The medium-priority issues can be tackled in a follow-up pass.
