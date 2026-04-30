# Agent Accessibility Evaluation Framework

## Purpose

Measure whether the configuration reference restructuring improves AI agent access to content by comparing performance before (monolithic page) and after (category-based pages).

---

## Success Criteria

The restructuring is successful if:
1. Agents can answer configuration questions with **>90% accuracy** (vs baseline)
2. Average response time **decreases by >30%**
3. Context window usage per query **decreases by >50%**
4. Hallucination rate **decreases by >40%**
5. Agents can complete realistic configuration tasks **without hitting context limits**

---

## Evaluation Methodology

### Phase 1: Baseline Measurement (Before Split)

Test against current monolithic `configuration-reference.adoc` (106 KB, 3,879 lines)

### Phase 2: Post-Implementation Measurement (After Split)

Test against new category-based structure (8 pages, 5-40 KB each)

### Phase 3: Comparison and Analysis

Compare metrics, identify improvements and regressions

---

## Metric Categories

### 1. Quantitative Metrics

#### A. Page/Content Size Metrics

**Before:**
- Monolithic page size: 106 KB
- Line count: 3,879 lines
- Sections: 48 major sections
- Average section size: ~2.2 KB

**After (measure for each category page):**
- Page size (KB)
- Line count
- Sections per page
- Largest page size
- Smallest page size

**Tools:**
```bash
# Measure current monolithic page
wc -c docs/reference/modules/ROOT/pages/configuration-reference.adoc
wc -l docs/reference/modules/ROOT/pages/configuration-reference.adoc

# Measure new pages
for file in docs/reference/modules/ROOT/pages/config/*.adoc; do
  echo "$file: $(wc -c < "$file") bytes, $(wc -l < "$file") lines"
done
```

**Target:**
- ✅ No page exceeds 45 KB
- ✅ Average page size: 15-20 KB
- ✅ Largest page <40 KB

---

#### B. Token Count and Context Window Usage

**Measurement:**

Use tiktoken (OpenAI) or similar tokenizer to count tokens:

```python
import tiktoken

def count_tokens(text, model="gpt-4"):
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# For Claude
def count_tokens_claude(text):
    # Rough estimate: 1 token ≈ 4 characters
    return len(text) // 4

# Measure monolithic page
with open('configuration-reference.adoc', 'r') as f:
    content = f.read()
    tokens = count_tokens_claude(content)
    print(f"Tokens: {tokens}")
    print(f"% of Claude 200K context: {(tokens/200000)*100:.2f}%")
    print(f"% of GPT-4 128K context: {(tokens/128000)*100:.2f}%")

# Measure category pages
for page in category_pages:
    with open(page, 'r') as f:
        content = f.read()
        tokens = count_tokens_claude(content)
        print(f"{page}: {tokens} tokens ({(tokens/200000)*100:.2f}% of Claude context)")
```

**Metrics to Track:**

| Metric | Before (Monolithic) | After (Category Pages) | Target |
|--------|---------------------|------------------------|--------|
| Total tokens (all content) | ~26,500 | ~26,500 (same content) | Same |
| Tokens per query context | ~26,500 (whole page) | Varies by page | <10,000 avg |
| % of Claude 200K context | ~13% | <5% per page | <5% |
| % of GPT-4 128K context | ~21% | <8% per page | <8% |
| Can fit in Haiku 200K | Yes (barely) | Yes (comfortably) | ✅ |

**Target:**
- ✅ Individual page tokens: <10,000 (5% of Claude context)
- ✅ Query context reduction: >50%

---

#### C. Response Time

**Test Setup:**
1. Create benchmark question set (see Question Bank below)
2. Ask each question to agent with before/after content
3. Measure time to first token and complete response

**Measurement:**

```python
import time
from anthropic import Anthropic

client = Anthropic()

def measure_response_time(question, context):
    start = time.time()

    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {question}"
        }]
    )

    end = time.time()
    return {
        'time': end - start,
        'response': message.content[0].text
    }

# Test each question
results_before = []
results_after = []

for question in benchmark_questions:
    # Before: use monolithic page
    results_before.append(measure_response_time(question, monolithic_content))

    # After: use relevant category page
    relevant_page = get_relevant_page(question)  # Helper to select right page
    results_after.append(measure_response_time(question, relevant_page))
```

**Metrics:**

| Metric | Target |
|--------|--------|
| Average response time reduction | >30% |
| Median response time | <3 seconds |
| 95th percentile response time | <8 seconds |

---

### 2. Qualitative Metrics

#### A. Answer Accuracy

**Measurement:**

Create 30 benchmark questions with known correct answers. Score responses as:
- **Correct (1.0)**: Accurate, complete answer
- **Partially Correct (0.5)**: Right direction but missing details or minor errors
- **Incorrect (0.0)**: Wrong or hallucinated information

**Scoring:**

```python
def score_answer(question, agent_answer, correct_answer, rubric):
    """
    Score on 0-1 scale
    rubric: dict with required_elements and optional_elements
    """
    score = 0.0

    # Check required elements
    required_found = sum(1 for elem in rubric['required_elements']
                         if elem.lower() in agent_answer.lower())
    required_total = len(rubric['required_elements'])
    score += 0.7 * (required_found / required_total)

    # Check optional elements (extra credit)
    optional_found = sum(1 for elem in rubric['optional_elements']
                        if elem.lower() in agent_answer.lower())
    optional_total = len(rubric['optional_elements'])
    score += 0.3 * (optional_found / optional_total)

    # Penalty for hallucinations
    if contains_hallucination(agent_answer, rubric['hallucination_checks']):
        score *= 0.5

    return min(score, 1.0)
```

**Metrics:**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Average accuracy score | Baseline | Measure | >90% of baseline |
| Questions with >0.8 score | Baseline | Measure | >80% of questions |
| Perfect scores (1.0) | Baseline | Measure | >50% of questions |

**Target:**
- ✅ Accuracy maintained or improved (>90% of baseline)
- ✅ No significant accuracy regression on any question type

---

#### B. Hallucination Rate

**Definition:** Agent invents information not present in the documentation.

**Detection Methods:**

1. **Fact-checking**: Compare response to source content
2. **Specific checks**: Look for known false patterns

```python
def detect_hallucinations(response, source_content):
    hallucinations = []

    # Check for specific false claims
    false_patterns = [
        r"version\s+3\.",  # CircleCI doesn't have version 3
        r"ansible\s+executor",  # No ansible executor exists
        r"run_once\s+step",  # No such step type
    ]

    for pattern in false_patterns:
        if re.search(pattern, response, re.IGNORECASE):
            hallucinations.append(f"False pattern detected: {pattern}")

    # Check if specific values mentioned exist in source
    # e.g., if response mentions "save_cache has timeout property" verify it

    return hallucinations

def calculate_hallucination_rate(results):
    total_questions = len(results)
    questions_with_hallucinations = sum(1 for r in results
                                       if len(r['hallucinations']) > 0)
    return questions_with_hallucinations / total_questions
```

**Metrics:**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Hallucination rate | Baseline | Measure | <5% |
| Reduction vs baseline | N/A | Measure | >40% reduction |

**Target:**
- ✅ Hallucination rate <5%
- ✅ Reduction of >40% from baseline

---

#### C. Completeness

**Definition:** Does the answer include all necessary information?

**Measurement:**

For each question, define what a complete answer should include:

```python
completeness_rubrics = {
    "How do I cache npm dependencies?": {
        "required_elements": [
            "save_cache",
            "restore_cache",
            "node_modules",
            "package-lock.json",
            "key pattern"
        ],
        "optional_elements": [
            "checksum",
            "example",
            "cache restoration order"
        ]
    },
    # ... more questions
}

def score_completeness(answer, rubric):
    required_coverage = sum(1 for elem in rubric['required_elements']
                           if elem.lower() in answer.lower())
    required_total = len(rubric['required_elements'])

    return required_coverage / required_total
```

**Metrics:**

| Metric | Target |
|--------|--------|
| Average completeness score | >0.85 |
| Answers with >90% completeness | >70% |

---

### 3. Task-Based Evaluation

#### Real-World Task Completion

**Test:** Can the agent complete realistic configuration tasks?

**Tasks:**

1. **Task 1: Set up caching for a Node.js project**
   - Agent should identify: save_cache, restore_cache, keys, paths
   - Should provide complete YAML example
   - Should mention best practices

2. **Task 2: Configure matrix job for multi-environment testing**
   - Agent should explain: matrix, parameters, jobs in workflows
   - Should show complete example
   - Should explain parameter substitution

3. **Task 3: Set up Docker executor with authentication**
   - Agent should cover: docker executor, auth, AWS/GCP options
   - Should explain when to use each auth method
   - Should provide working examples

4. **Task 4: Debug why cache isn't restoring**
   - Agent should identify: key patterns, path issues, cache hit/miss
   - Should provide troubleshooting steps
   - Should reference relevant logs/outputs

**Scoring:**

```python
def score_task_completion(task_id, agent_output):
    """
    Score: 0 = failed, 1 = minimal, 2 = good, 3 = excellent
    """
    criteria = task_criteria[task_id]

    score = 0

    # Can complete basic task?
    if meets_basic_requirements(agent_output, criteria['basic']):
        score = 1

    # Includes best practices?
    if includes_best_practices(agent_output, criteria['best_practices']):
        score = 2

    # Comprehensive and accurate?
    if is_comprehensive(agent_output, criteria['comprehensive']):
        score = 3

    return score
```

**Metrics:**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Tasks completed (score >0) | Baseline | Measure | 100% |
| Tasks with good score (>2) | Baseline | Measure | >75% |
| Average task score | Baseline | Measure | >2.0 |

---

## Benchmark Question Bank

### Category: Top-Level Keys (5 questions)

1. **Q:** What version should I use in my CircleCI config?
   **Expected:** Explains 2.0 vs 2.1, recommends 2.1, mentions reusable config features

2. **Q:** What is the setup key used for?
   **Expected:** Dynamic configuration, conditional triggering, update pipeline parameters

3. **Q:** How do I define job groups?
   **Expected:** job-groups key, group name structure, jobs list, serial-group option

4. **Q:** What's the difference between version 2.0 and 2.1?
   **Expected:** Reusable config (orbs, commands, executors, parameters), 2.1 recommended

5. **Q:** Can I use version 3?
   **Expected:** No, only 2.0 and 2.1 exist (tests hallucination detection)

---

### Category: Jobs (8 questions)

6. **Q:** How do I configure a Docker executor?
   **Expected:** docker key, image, auth options, example

7. **Q:** What resource classes are available for Docker jobs?
   **Expected:** small, medium, large, xlarge, 2xlarge, etc. with specs

8. **Q:** How do I set environment variables in a job?
   **Expected:** environment key, name-value pairs, example

9. **Q:** What's the difference between docker, machine, and macos executors?
   **Expected:** Use cases, trade-offs, when to use each

10. **Q:** How do I enable IP ranges for a job?
    **Expected:** circleci_ip_ranges: true, job-level property, requires paid plan

11. **Q:** What is parallelism and how do I use it?
    **Expected:** Parallel test splitting, parallelism key, CIRCLE_NODE_INDEX

12. **Q:** How do I configure artifact retention?
    **Expected:** retention key, days value, default behavior

13. **Q:** How do I authenticate with AWS in Docker executor?
    **Expected:** aws_auth, aws-ecr/aws-ecr-cred, OIDC, env vars

---

### Category: Steps - Caching (6 questions)

14. **Q:** How do I cache npm dependencies?
    **Expected:** save_cache, restore_cache, node_modules, package-lock.json checksum, key pattern

15. **Q:** What's the difference between save_cache and restore_cache?
    **Expected:** save_cache stores, restore_cache retrieves, key patterns, paths

16. **Q:** How do I create a cache key that updates when dependencies change?
    **Expected:** Checksum syntax, {{ checksum "package-lock.json" }}, best practices

17. **Q:** What happens if no cache is found?
    **Expected:** Restore step continues, cache miss, falls back to prefix matches

18. **Q:** How do I store build artifacts?
    **Expected:** store_artifacts step, path, destination, retention

19. **Q:** How do I store test results?
    **Expected:** store_test_results, path to JUnit XML, test summary display

---

### Category: Steps - Basic (4 questions)

20. **Q:** How do I run a shell command in a step?
    **Expected:** run step, shorthand vs full syntax, command, name, background options

21. **Q:** What is the checkout step?
    **Expected:** Checks out source code, SSH key handling, common first step

22. **Q:** How do I run a step conditionally?
    **Expected:** when attribute (always, on_success, on_fail), when step with condition

23. **Q:** How do I use pipeline values in my config?
    **Expected:** << pipeline.* >> syntax, available values, examples

---

### Category: Workflows (7 questions)

24. **Q:** How do I schedule a workflow to run at specific times?
    **Expected:** triggers, schedule, cron syntax, filters, example

25. **Q:** How do I make one job wait for another in a workflow?
    **Expected:** requires key, job dependencies, sequential execution

26. **Q:** What is a matrix job and when should I use it?
    **Expected:** matrix key, parameters, multiple job variants, testing across environments

27. **Q:** How do I filter workflow jobs by branch?
    **Expected:** filters key, branches (only/ignore), regex patterns

28. **Q:** How do I use contexts in workflows?
    **Expected:** context key, environment variables, secrets management, org-level

29. **Q:** What are pre-steps and post-steps?
    **Expected:** Job invocation modifiers, run before/after job steps, use cases

30. **Q:** How do I use conditional logic in workflows?
    **Expected:** Logic statements, equal/not/and/or, pipeline parameters, dynamic workflows

---

## Test Execution Plan

### Before Implementation

1. **Baseline measurement:**
   - Run all 30 questions against current monolithic page
   - Measure: response time, accuracy, hallucinations, completeness
   - Run 4 task completion tests
   - Measure: page size, token counts
   - Document: baseline scores, edge cases, failure modes

2. **Tool setup:**
   - Create automated test harness
   - Set up scoring scripts
   - Prepare test data files
   - Document test environment (model versions, parameters)

### After Implementation

1. **Wait for deployment:**
   - Ensure all pages live and accessible
   - Verify redirects working
   - Confirm build successful

2. **Run tests:**
   - Same 30 questions against new category pages
   - Same 4 task completion tests
   - Measure same metrics
   - Use identical test parameters

3. **Comparison:**
   - Calculate deltas for all metrics
   - Identify improvements and regressions
   - Analyze by question category
   - Document findings

### Reporting

**Create comparison report with:**

1. **Executive Summary**
   - Overall success: Met/didn't meet success criteria
   - Key improvements (response time, accuracy, etc.)
   - Key regressions (if any)
   - Recommendations

2. **Detailed Metrics**
   - Before/after comparison tables
   - Charts showing improvements
   - Per-question analysis
   - Task completion scores

3. **Qualitative Analysis**
   - Where did agents struggle before?
   - Where do they excel now?
   - Unexpected findings
   - User experience improvements

4. **Recommendations**
   - Further improvements needed
   - Content gaps identified
   - Structure refinements
   - Future work

---

## Testing Tools and Infrastructure

### Automated Test Harness

```python
# test_agent_accessibility.py

import json
from anthropic import Anthropic
from pathlib import Path

class AgentAccessibilityTest:
    def __init__(self, content_dir, questions_file, rubrics_file):
        self.client = Anthropic()
        self.content_dir = Path(content_dir)
        self.questions = self.load_json(questions_file)
        self.rubrics = self.load_json(rubrics_file)
        self.results = []

    def load_json(self, filepath):
        with open(filepath) as f:
            return json.load(f)

    def get_relevant_content(self, question_category):
        """Load appropriate page based on question category"""
        category_map = {
            'top-level': 'top-level-keys.adoc',
            'jobs': 'jobs.adoc',
            'steps-caching': 'steps-caching-artifacts.adoc',
            'steps-basic': 'steps-basic.adoc',
            'workflows': 'workflows.adoc'
        }

        page = category_map.get(question_category, 'configuration-reference-complete.adoc')
        with open(self.content_dir / page) as f:
            return f.read()

    def test_question(self, question_obj):
        """Test a single question"""
        content = self.get_relevant_content(question_obj['category'])

        # Measure response time
        import time
        start = time.time()

        response = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": f"Context:\n{content}\n\nQuestion: {question_obj['question']}"
            }]
        )

        elapsed = time.time() - start
        answer = response.content[0].text

        # Score answer
        rubric = self.rubrics[question_obj['id']]
        accuracy = self.score_accuracy(answer, rubric)
        completeness = self.score_completeness(answer, rubric)
        hallucinations = self.detect_hallucinations(answer, rubric)

        return {
            'question_id': question_obj['id'],
            'question': question_obj['question'],
            'category': question_obj['category'],
            'response_time': elapsed,
            'answer': answer,
            'accuracy': accuracy,
            'completeness': completeness,
            'hallucinations': hallucinations,
            'tokens_used': response.usage.input_tokens
        }

    def run_all_tests(self):
        """Run complete test suite"""
        for question in self.questions:
            result = self.test_question(question)
            self.results.append(result)
            print(f"✓ Question {result['question_id']}: {result['accuracy']:.2f} accuracy")

        return self.generate_report()

    def generate_report(self):
        """Generate comparison report"""
        avg_accuracy = sum(r['accuracy'] for r in self.results) / len(self.results)
        avg_time = sum(r['response_time'] for r in self.results) / len(self.results)
        hallucination_rate = sum(1 for r in self.results if r['hallucinations']) / len(self.results)

        return {
            'summary': {
                'total_questions': len(self.results),
                'avg_accuracy': avg_accuracy,
                'avg_response_time': avg_time,
                'hallucination_rate': hallucination_rate
            },
            'details': self.results
        }

# Run tests
if __name__ == "__main__":
    # Before
    test_before = AgentAccessibilityTest(
        'docs/reference/modules/ROOT/pages',
        'test-questions.json',
        'rubrics.json'
    )
    results_before = test_before.run_all_tests()

    # After
    test_after = AgentAccessibilityTest(
        'docs/reference/modules/ROOT/pages/config',
        'test-questions.json',
        'rubrics.json'
    )
    results_after = test_after.run_all_tests()

    # Compare
    print("\n=== COMPARISON ===")
    print(f"Accuracy: {results_before['summary']['avg_accuracy']:.2%} → {results_after['summary']['avg_accuracy']:.2%}")
    print(f"Response time: {results_before['summary']['avg_response_time']:.2f}s → {results_after['summary']['avg_response_time']:.2f}s")
    print(f"Hallucination rate: {results_before['summary']['hallucination_rate']:.2%} → {results_after['summary']['hallucination_rate']:.2%}")
```

---

## Sample Test Data Files

### questions.json
```json
[
  {
    "id": 1,
    "category": "top-level",
    "question": "What version should I use in my CircleCI config?",
    "expected_answer": "Use version 2.1 for modern features including orbs, commands, executors, and parameters"
  },
  {
    "id": 14,
    "category": "steps-caching",
    "question": "How do I cache npm dependencies?",
    "expected_answer": "Use save_cache and restore_cache with node_modules path and checksum of package-lock.json"
  }
]
```

### rubrics.json
```json
{
  "1": {
    "required_elements": ["2.1", "version"],
    "optional_elements": ["orbs", "reusable", "commands", "executors"],
    "hallucination_checks": ["version 3", "version 2.2"],
    "completeness_weight": 0.7
  },
  "14": {
    "required_elements": ["save_cache", "restore_cache", "node_modules", "checksum"],
    "optional_elements": ["package-lock.json", "example", "key pattern"],
    "hallucination_checks": ["cache_modules", "npm_cache step"],
    "completeness_weight": 0.8
  }
}
```

---

## Timeline

**Week 1 (Before Implementation):**
- Create test infrastructure
- Write 30 benchmark questions
- Create rubrics and scoring criteria
- Run baseline tests
- Document baseline results

**Week 6-7 (After Implementation):**
- Re-run same tests on new structure
- Collect metrics
- Compare results
- Generate report

**Week 8:**
- Present findings
- Identify any issues
- Plan iterations if needed

---

## Expected Outcomes

Based on the restructuring, we expect:

### ✅ Major Improvements
- **Context window usage:** 50-70% reduction per query
- **Response time:** 30-40% faster
- **Specific answer precision:** 20-30% improvement (agent gets exact page vs scrolling)

### ✅ Maintained Performance
- **Accuracy:** 95-100% of baseline (should not regress)
- **Completeness:** Same or better
- **Cross-reference understanding:** Maintained via "Related" sections

### ⚠️ Potential Challenges
- **Multi-concept questions:** May require reading multiple pages (mitigated by Related sections)
- **Overview questions:** "Tell me everything about jobs" - complete page still available
- **Comparison questions:** Might need to load multiple pages

---

## Success Declaration

The restructuring will be declared successful if:

1. ✅ **At least 4 of 5 success criteria met** (see top of document)
2. ✅ **No critical regressions** in accuracy or completeness
3. ✅ **Demonstrable improvement** in agent response quality
4. ✅ **User feedback** (from docs team) is positive
5. ✅ **Quantitative metrics** show improvement

---

**Document Version:** 1.0
**Last Updated:** 2026-04-30
**Author:** Documentation Team
