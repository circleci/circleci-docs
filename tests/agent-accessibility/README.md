# Agent Accessibility Testing

This directory contains test infrastructure to measure whether AI agents can effectively access and use CircleCI configuration reference documentation.

## Purpose

Evaluate the impact of restructuring the monolithic configuration reference (106 KB, 3,879 lines) into category-based pages (8 pages, 5-40 KB each) on AI agent performance.

## Testing Philosophy: Strict Mode

**By default, tests run in STRICT MODE** - the model must answer questions using ONLY the provided documentation, not pre-trained knowledge.

**Why strict mode?**
- Isolates what we're testing: documentation quality, not model knowledge
- Ensures improvements come from better docs, not just better prompting
- Tests real documentation accessibility and completeness
- Identifies gaps in documentation (model will say "not found")

**To allow pre-trained knowledge:**
```bash
python test_agent_accessibility.py --mode before --allow-pretrained
```

This is useful for:
- Comparing with realistic agent behavior
- Testing when model uses both sources
- Understanding baseline model knowledge

**Recommendation:** Use strict mode for official benchmarks, allow pretrained for comparison.

## Files

- `test_agent_accessibility.py` - Main test harness
- `config-reference-test.json` - Configuration for testing config reference (before/after modes)
- `example-single-page-test.json` - Example config for testing any single page
- `questions.json` - 30 benchmark questions across all config categories
- `rubrics.json` - Scoring criteria for each question
- `requirements.txt` - Python dependencies
- `README.md` - This file

## Setup

### Install Dependencies

```bash
# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### Set API Key

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

## Usage

### Using Config Files (Recommended)

The tool supports configuration files for testing any documentation page, making it reusable beyond just the configuration reference.

**Config-driven test (Configuration Reference):**

```bash
python test_agent_accessibility.py --config config-reference-test.json --mode before
python test_agent_accessibility.py --config config-reference-test.json --mode after
```

**Config-driven test (Single Page Example):**

```bash
python test_agent_accessibility.py --config example-single-page-test.json --mode current
```

**What config files provide:**
- Test any documentation page, not just config reference
- Define multiple modes (before/after/current/etc.)
- Custom questions and rubrics per test
- Reusable for weekly benchmarking

**Config file structure:**

```json
{
  "name": "Test Name",
  "description": "Test description",
  "base_path": "docs/guides/modules/ROOT/pages",
  "modes": {
    "current": {
      "description": "Current version",
      "content_mapping": {
        "category-name": "page-file.adoc"
      }
    }
  },
  "questions_file": "questions.json",
  "rubrics_file": "rubrics.json"
}
```

See `config-reference-test.json` and `example-single-page-test.json` for complete examples.

### Run Baseline Tests (Before Restructure) - Legacy Method

Test against the current monolithic `configuration-reference.adoc`:

```bash
python test_agent_accessibility.py --mode before
```

This will:
- Load the monolithic configuration reference page
- Ask all 30 benchmark questions
- Measure response time, accuracy, completeness, hallucinations
- Save results to `results_before_YYYYMMDD_HHMMSS.json`

### Run Post-Implementation Tests (After Restructure) - Legacy Method

Test against the new category-based structure:

```bash
python test_agent_accessibility.py --mode after
```

This will:
- Load appropriate category pages for each question
- Ask the same 30 questions
- Measure the same metrics
- Save results to `results_after_YYYYMMDD_HHMMSS.json`

### Compare Results

```bash
python test_agent_accessibility.py --compare results_before.json results_after.json
```

This generates a comparison report showing:
- Before/after metrics for all measurements
- Percentage changes
- Success criteria evaluation (✅/❌)
- Overall pass/fail determination

## Custom Options

**Note:** All options work with both config-driven and legacy methods. Config files provide the defaults, but CLI arguments can override them.

### Specify Content Directory

```bash
python test_agent_accessibility.py \
  --mode before \
  --content-dir /path/to/docs/reference/modules/ROOT/pages
```

### Specify Output File

```bash
python test_agent_accessibility.py \
  --mode before \
  --output my_baseline_results.json
```

### Allow Pre-Trained Knowledge

By default, tests run in **strict mode** (documentation only). To allow the model to use pre-trained knowledge:

```bash
python test_agent_accessibility.py \
  --mode before \
  --allow-pretrained
```

**Use cases:**
- Compare strict vs non-strict results
- Test realistic agent behavior (uses both sources)
- Understand baseline model knowledge

## Understanding Results

### Metrics Measured

**Quantitative:**
- **strict_mode** - Whether strict mode was enabled (docs only)
- **avg_accuracy** - How correct the answers are (0.0-1.0)
- **avg_completeness** - How complete the answers are (0.0-1.0)
- **avg_response_time** - Time to generate response (seconds)
- **avg_content_size_kb** - Size of content loaded per question (KB)
- **avg_content_tokens** - Estimated tokens in content (chars / 4)
- **hallucination_rate** - Percentage of answers with false information
- **info_not_found_rate** - Percentage where model said info wasn't in docs (strict mode only)

**Qualitative:**
- **high_accuracy_count** - Questions with ≥0.8 accuracy
- **perfect_score_count** - Questions with 1.0 accuracy
- **questions_info_not_found** - Count of "not found" responses (indicates doc gaps)
- **category_breakdown** - Performance by question category

### Success Criteria

The restructuring is successful if:

1. ✅ Accuracy ≥ 90% of baseline (maintained)
2. ✅ Response time < 70% of baseline (30%+ improvement)
3. ✅ Context tokens < 50% of baseline (50%+ reduction)
4. ✅ Hallucination rate < 60% of baseline (40%+ reduction)

**At least 3 of 4 criteria must be met.**

### Scoring Details

**Accuracy** is calculated as:
- 70% weight on required elements (must be mentioned)
- 30% weight on optional elements (nice to have)
- 50% penalty if hallucinations detected

**Completeness** is calculated as:
- Percentage of required elements mentioned
- Optional elements not counted

**Hallucinations** are detected by:
- Pattern matching for known false claims
- Example: "version 3" (doesn't exist)

## Example Output

```
======================================================================
Running Agent Accessibility Tests (before mode)
Content directory: /Users/you/circleci-docs/docs/reference/modules/ROOT/pages
Total questions: 30
======================================================================

  Testing Q1: What version should I use in my CircleCI config?...
    ✓ Accuracy: 0.85, Completeness: 1.00, Time: 2.34s

  Testing Q2: What is the setup key used for?...
    ✓ Accuracy: 0.92, Completeness: 0.75, Time: 1.87s

...

✓ Results saved to: results_before_20260430_143022.json

======================================================================
SUMMARY - BEFORE MODE
======================================================================
Total questions:          30
Completed:                30
Average accuracy:         87.33%
Average completeness:     81.67%
Average response time:    2.45s
Average content size:     106.0 KB
Average content tokens:   26,500
Hallucination rate:       6.67%
High accuracy (≥0.8):     24/30
Perfect scores (1.0):     12/30

Category Breakdown:
  top-level            | Accuracy: 88.00% | Time: 2.12s
  jobs                 | Accuracy: 85.50% | Time: 2.67s
  steps-caching        | Accuracy: 90.00% | Time: 2.33s
  steps-basic          | Accuracy: 86.25% | Time: 2.15s
  workflows            | Accuracy: 87.14% | Time: 2.58s
======================================================================
```

## Comparison Output

```
======================================================================
COMPARISON: BEFORE vs AFTER
======================================================================
Accuracy             | Before:    87.33%    | After:    89.17%    | Change:     +1.8pp ✅
Completeness         | Before:    81.67%    | After:    84.33%    | Change:     +2.7pp ✅
Response Time        | Before:       2.45s  | After:       1.58s  | Change:     -35.5% ✅
Content Size         | Before:      106 KB  | After:       18 KB  | Change:     -83.0% ✅
Content Tokens       | Before:   26,500     | After:    4,500     | Change:     -83.0% ✅
Hallucination Rate   | Before:     6.67%    | After:     3.33%    | Change:     -3.3pp ✅
======================================================================

SUCCESS CRITERIA:
  ✅ Accuracy maintained
  ✅ Response time improved
  ✅ Context usage reduced
  ✅ Hallucinations reduced

  OVERALL: 4/4 criteria met
======================================================================
```

## Interpreting Results

### Good Signs
- ✅ Accuracy stays above 85%
- ✅ Response time decreases
- ✅ Content size significantly smaller (after mode)
- ✅ Hallucination rate below 5%
- ✅ High accuracy count increases

### Warning Signs
- ⚠️ Accuracy drops below 80%
- ⚠️ Hallucination rate above 10%
- ⚠️ Many perfect scores become lower
- ⚠️ Specific categories show regression

### What to Do If Results Are Poor

1. **Check question quality** - Are questions fair and clear?
2. **Review rubrics** - Are scoring criteria appropriate?
3. **Examine failures** - Which questions failed and why?
4. **Check content** - Is information actually in the docs?
5. **Consider improvements** - Add examples, clarify wording, improve structure

## Customization

### Create Config for Testing Different Pages

To test a different documentation page (e.g., weekly benchmarks on guides):

1. **Create a new config file** (e.g., `docker-guide-test.json`):

```json
{
  "name": "Docker Guide Accessibility Test",
  "description": "Weekly benchmark of Docker execution environment guide",
  "base_path": "docs/guides/modules/ROOT/pages/execution-environments",
  "modes": {
    "current": {
      "description": "Current version of Docker guide",
      "content_mapping": {
        "docker-basics": "docker.adoc",
        "docker-advanced": "docker.adoc"
      }
    }
  },
  "questions_file": "docker-questions.json",
  "rubrics_file": "docker-rubrics.json"
}
```

2. **Create questions file** (`docker-questions.json`) with relevant questions for that page

3. **Create rubrics file** (`docker-rubrics.json`) with scoring criteria

4. **Run the test:**

```bash
python test_agent_accessibility.py --config docker-guide-test.json --mode current
```

This makes the tool reusable for testing any documentation page, enabling weekly benchmarking across your entire docs site.

### Add New Questions

Edit `questions.json`:

```json
{
  "id": 31,
  "category": "jobs",
  "question": "How do I configure resource class for macOS jobs?",
  "expected_answer": "Use resource_class with macos values like macos.m1.medium.gen1"
}
```

### Add Scoring Rubric

Edit `rubrics.json`:

```json
"31": {
  "required_elements": ["resource_class", "macos"],
  "optional_elements": ["m1", "gen1", "medium"],
  "hallucination_checks": ["macos.large", "macos.xlarge"]
}
```

### Test Specific Categories

Modify the script or filter questions:

```python
# Test only workflow questions
questions_filtered = [q for q in questions if q['category'] == 'workflows']
```

## Troubleshooting

### "anthropic package not installed"

```bash
pip install anthropic
```

### "API key not found"

```bash
export ANTHROPIC_API_KEY='your-key'
```

### "Content file not found"

Check that `--content-dir` points to the correct location:
- Before: `docs/reference/modules/ROOT/pages/`
- After: `docs/reference/modules/ROOT/pages/config/`

### Rate limiting

If you hit rate limits, add delays:

```python
import time
time.sleep(1)  # Add to test_question method
```

## Future Enhancements

- [ ] Support for multiple LLM providers (OpenAI, etc.)
- [ ] Parallel test execution
- [ ] HTML report generation
- [ ] Automated regression testing in CI/CD
- [ ] Task completion tests (not just Q&A)
- [ ] RAG system evaluation

## Contact

For questions or issues, contact the documentation team.
