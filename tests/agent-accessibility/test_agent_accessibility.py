#!/usr/bin/env python3
"""
Agent Accessibility Test Harness

Tests whether AI agents can effectively access and use documentation.
Originally created for CircleCI configuration reference restructuring,
now generalized to test any documentation page.

Usage:
    # Config-driven (recommended):
    python test_agent_accessibility.py --config config-reference-test.json --mode before
    python test_agent_accessibility.py --config config-reference-test.json --mode after

    # Legacy method (backward compatible):
    python test_agent_accessibility.py --mode before
    python test_agent_accessibility.py --mode after

    # Compare results:
    python test_agent_accessibility.py --compare before_results.json after_results.json
"""

import json
import time
import re
import argparse
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("Warning: anthropic package not installed. Install with: pip install anthropic")


class AgentAccessibilityTest:
    """Test harness for measuring agent accessibility"""

    def __init__(self, questions_file: Path, rubrics_file: Path, mode: str,
                 content_dir: Path = None, config: Dict = None, strict_mode: bool = True):
        """
        Initialize test harness

        Args:
            questions_file: Path to questions.json
            rubrics_file: Path to rubrics.json
            mode: Test mode (e.g., 'before', 'after', 'current')
            content_dir: Directory containing documentation files (optional if config provided)
            config: Test configuration dict (optional, for backward compatibility)
            strict_mode: If True, force model to only use provided documentation (default: True)
        """
        self.questions = self.load_json(questions_file)
        self.rubrics = self.load_json(rubrics_file)
        self.mode = mode
        self.strict_mode = strict_mode
        self.results = []
        self.config = config

        if ANTHROPIC_AVAILABLE:
            self.client = Anthropic()
        else:
            self.client = None

        # Set up content directory and category mapping
        if config:
            # Use config-driven approach
            self.test_name = config.get('name', 'Documentation Accessibility Test')

            # Resolve base path
            if content_dir:
                self.content_dir = Path(content_dir)
            else:
                base_path = config.get('base_path', '')
                # Make relative to repo root (assume script is in tests/agent-accessibility/)
                script_dir = Path(__file__).parent
                repo_root = script_dir.parent.parent
                self.content_dir = repo_root / base_path if base_path else repo_root

            # Get category mapping for this mode
            if mode not in config.get('modes', {}):
                available_modes = list(config.get('modes', {}).keys())
                raise ValueError(f"Mode '{mode}' not found in config. Available modes: {available_modes}")

            mode_config = config['modes'][mode]
            self.category_map = mode_config.get('content_mapping', {})
            self.mode_description = mode_config.get('description', '')
        else:
            # Backward compatibility: use hardcoded defaults
            self.test_name = "Configuration Reference Accessibility Test"
            self.content_dir = Path(content_dir) if content_dir else Path.cwd()
            self.mode_description = ""

            # Default category maps (for backward compatibility)
            CATEGORY_MAP_BEFORE = {
                'top-level': 'configuration-reference.adoc',
                'jobs': 'configuration-reference.adoc',
                'steps-caching': 'configuration-reference.adoc',
                'steps-basic': 'configuration-reference.adoc',
                'workflows': 'configuration-reference.adoc'
            }

            CATEGORY_MAP_AFTER = {
                'top-level': 'config/top-level-keys.adoc',
                'jobs': 'config/jobs.adoc',
                'steps-caching': 'config/steps-caching-artifacts.adoc',
                'steps-basic': 'config/steps-basic.adoc',
                'workflows': 'config/workflows.adoc'
            }

            self.category_map = CATEGORY_MAP_BEFORE if mode == 'before' else CATEGORY_MAP_AFTER

    def load_json(self, filepath: Path) -> Any:
        """Load JSON file"""
        with open(filepath) as f:
            return json.load(f)

    def get_content_path(self, question_category: str) -> Path:
        """Get path to content file for question category"""
        relative_path = self.category_map.get(question_category, self.category_map['top-level'])
        return self.content_dir / relative_path

    def load_content(self, question_category: str) -> str:
        """Load content for question category"""
        path = self.get_content_path(question_category)

        if not path.exists():
            raise FileNotFoundError(f"Content file not found: {path}")

        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def count_tokens_estimate(self, text: str) -> int:
        """Estimate token count (rough approximation: 4 chars = 1 token)"""
        return len(text) // 4

    def score_accuracy(self, answer: str, rubric: Dict) -> float:
        """
        Score answer accuracy based on rubric

        Returns: Score from 0.0 to 1.0
        """
        answer_lower = answer.lower()

        # Check required elements (70% of score)
        required = rubric.get('required_elements', [])
        if required:
            required_found = sum(1 for elem in required if elem.lower() in answer_lower)
            required_score = required_found / len(required)
        else:
            required_score = 1.0

        # Check optional elements (30% of score)
        optional = rubric.get('optional_elements', [])
        if optional:
            optional_found = sum(1 for elem in optional if elem.lower() in answer_lower)
            optional_score = optional_found / len(optional)
        else:
            optional_score = 0.0

        # Combined score
        score = (0.7 * required_score) + (0.3 * optional_score)

        # Penalty for hallucinations
        hallucinations = self.detect_hallucinations(answer, rubric)
        if hallucinations:
            score *= 0.5  # 50% penalty for any hallucinations

        return min(score, 1.0)

    def score_completeness(self, answer: str, rubric: Dict) -> float:
        """
        Score answer completeness

        Returns: Score from 0.0 to 1.0
        """
        answer_lower = answer.lower()

        # Completeness based on required elements only
        required = rubric.get('required_elements', [])
        if not required:
            return 1.0

        required_found = sum(1 for elem in required if elem.lower() in answer_lower)
        return required_found / len(required)

    def detect_hallucinations(self, answer: str, rubric: Dict) -> List[str]:
        """
        Detect hallucinations in answer

        Returns: List of detected hallucination patterns
        """
        hallucinations = []
        answer_lower = answer.lower()

        hallucination_checks = rubric.get('hallucination_checks', [])
        for check in hallucination_checks:
            if check.lower() in answer_lower:
                hallucinations.append(check)

        return hallucinations

    def test_question(self, question_obj: Dict) -> Dict:
        """
        Test a single question

        Returns: Result dictionary with metrics
        """
        question_id = question_obj['id']
        category = question_obj['category']
        question = question_obj['question']

        print(f"\n  Testing Q{question_id}: {question[:60]}...")

        # Load relevant content
        try:
            content = self.load_content(category)
        except FileNotFoundError as e:
            return {
                'question_id': question_id,
                'question': question,
                'category': category,
                'error': str(e),
                'status': 'skipped'
            }

        content_tokens = self.count_tokens_estimate(content)

        # If no Anthropic client, simulate results
        if not self.client:
            print(f"    [SIMULATION MODE - no anthropic package]")
            return {
                'question_id': question_id,
                'question': question,
                'category': category,
                'content_file': str(self.get_content_path(category)),
                'content_size_kb': len(content) / 1024,
                'content_tokens': content_tokens,
                'response_time': 0.0,
                'answer': "[SIMULATED - Install anthropic package to run real tests]",
                'accuracy': 0.0,
                'completeness': 0.0,
                'hallucinations': [],
                'status': 'simulated'
            }

        # Prepare prompts based on strict mode
        if self.strict_mode:
            system_prompt = (
                "You are a documentation testing assistant. You must answer questions "
                "using ONLY the information provided in the documentation below. "
                "Do not use any pre-trained knowledge about CircleCI or any other source. "
                "If the answer is not found in the provided documentation, explicitly state: "
                "\"This information is not found in the provided documentation.\""
            )
            user_message = f"Documentation:\n\n{content}\n\nQuestion: {question}\n\nAnswer using ONLY the documentation above."
        else:
            system_prompt = None
            user_message = f"Based on the following CircleCI documentation:\n\n{content}\n\nQuestion: {question}\n\nProvide a concise, accurate answer."

        # Measure response time
        start = time.time()

        try:
            # Build API call parameters
            api_params = {
                "model": "claude-sonnet-4-5-20250929",
                "max_tokens": 2048,
                "messages": [{
                    "role": "user",
                    "content": user_message
                }]
            }

            # Add system prompt if in strict mode
            if system_prompt:
                api_params["system"] = system_prompt

            response = self.client.messages.create(**api_params)

            elapsed = time.time() - start
            answer = response.content[0].text
            input_tokens = response.usage.input_tokens

        except Exception as e:
            return {
                'question_id': question_id,
                'question': question,
                'category': category,
                'error': str(e),
                'status': 'error'
            }

        # Check if model said information wasn't found
        not_found_phrases = [
            "not found in the provided documentation",
            "not in the provided documentation",
            "information is not found",
            "not present in the documentation",
            "documentation does not contain"
        ]
        info_not_found = any(phrase in answer.lower() for phrase in not_found_phrases)

        # Score answer
        rubric = self.rubrics[str(question_id)]
        accuracy = self.score_accuracy(answer, rubric)
        completeness = self.score_completeness(answer, rubric)
        hallucinations = self.detect_hallucinations(answer, rubric)

        result = {
            'question_id': question_id,
            'question': question,
            'category': category,
            'content_file': str(self.get_content_path(category)),
            'content_size_kb': len(content) / 1024,
            'content_tokens': content_tokens,
            'response_time': elapsed,
            'answer': answer,
            'accuracy': accuracy,
            'completeness': completeness,
            'hallucinations': hallucinations,
            'info_not_found': info_not_found,
            'strict_mode': self.strict_mode,
            'input_tokens': input_tokens,
            'status': 'completed'
        }

        print(f"    ✓ Accuracy: {accuracy:.2f}, Completeness: {completeness:.2f}, Time: {elapsed:.2f}s")
        if hallucinations:
            print(f"    ⚠️  Hallucinations detected: {hallucinations}")
        if info_not_found:
            print(f"    ⚠️  Model indicated: Information not found in docs")

        return result

    def run_all_tests(self) -> Dict:
        """
        Run complete test suite

        Returns: Complete results with summary
        """
        print(f"\n{'='*70}")
        print(f"{self.test_name}")
        print(f"{'='*70}")
        print(f"Mode: {self.mode}")
        if self.mode_description:
            print(f"  → {self.mode_description}")
        print(f"Strict mode: {'ENABLED' if self.strict_mode else 'DISABLED'}")
        if self.strict_mode:
            print(f"  → Model must use ONLY provided documentation")
        else:
            print(f"  → Model may use pre-trained knowledge + documentation")
        print(f"Content directory: {self.content_dir}")
        print(f"Total questions: {len(self.questions)}")
        print(f"{'='*70}")

        for question in self.questions:
            result = self.test_question(question)
            self.results.append(result)

        return self.generate_report()

    def generate_report(self) -> Dict:
        """Generate summary report"""
        completed = [r for r in self.results if r.get('status') == 'completed']

        if not completed:
            return {
                'mode': self.mode,
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'total_questions': len(self.results),
                    'completed': 0,
                    'error': 'No completed tests'
                },
                'results': self.results
            }

        avg_accuracy = sum(r['accuracy'] for r in completed) / len(completed)
        avg_completeness = sum(r['completeness'] for r in completed) / len(completed)
        avg_response_time = sum(r['response_time'] for r in completed) / len(completed)
        avg_content_size = sum(r['content_size_kb'] for r in completed) / len(completed)
        avg_content_tokens = sum(r['content_tokens'] for r in completed) / len(completed)

        questions_with_hallucinations = sum(1 for r in completed if r['hallucinations'])
        hallucination_rate = questions_with_hallucinations / len(completed)

        questions_info_not_found = sum(1 for r in completed if r.get('info_not_found', False))
        info_not_found_rate = questions_info_not_found / len(completed)

        high_accuracy = sum(1 for r in completed if r['accuracy'] >= 0.8)
        perfect_scores = sum(1 for r in completed if r['accuracy'] == 1.0)

        summary = {
            'total_questions': len(self.results),
            'completed': len(completed),
            'strict_mode': self.strict_mode,
            'avg_accuracy': avg_accuracy,
            'avg_completeness': avg_completeness,
            'avg_response_time': avg_response_time,
            'avg_content_size_kb': avg_content_size,
            'avg_content_tokens': avg_content_tokens,
            'hallucination_rate': hallucination_rate,
            'questions_with_hallucinations': questions_with_hallucinations,
            'info_not_found_rate': info_not_found_rate,
            'questions_info_not_found': questions_info_not_found,
            'high_accuracy_count': high_accuracy,
            'perfect_score_count': perfect_scores
        }

        # Category breakdown
        category_stats = {}
        for category in set(r['category'] for r in completed):
            cat_results = [r for r in completed if r['category'] == category]
            category_stats[category] = {
                'count': len(cat_results),
                'avg_accuracy': sum(r['accuracy'] for r in cat_results) / len(cat_results),
                'avg_response_time': sum(r['response_time'] for r in cat_results) / len(cat_results)
            }

        return {
            'test_name': self.test_name,
            'mode': self.mode,
            'mode_description': self.mode_description,
            'timestamp': datetime.now().isoformat(),
            'summary': summary,
            'category_breakdown': category_stats,
            'results': self.results
        }

    def save_results(self, output_file: Path):
        """Save results to JSON file"""
        report = self.generate_report()
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\n✓ Results saved to: {output_file}")


def print_summary(report: Dict):
    """Print summary report"""
    summary = report['summary']

    print(f"\n{'='*70}")
    print(f"SUMMARY - {report['mode'].upper()} MODE")
    print(f"{'='*70}")
    print(f"Strict mode:              {'ENABLED' if summary.get('strict_mode', True) else 'DISABLED'}")
    print(f"Total questions:          {summary['total_questions']}")
    print(f"Completed:                {summary['completed']}")
    print(f"Average accuracy:         {summary['avg_accuracy']:.2%}")
    print(f"Average completeness:     {summary['avg_completeness']:.2%}")
    print(f"Average response time:    {summary['avg_response_time']:.2f}s")
    print(f"Average content size:     {summary['avg_content_size_kb']:.1f} KB")
    print(f"Average content tokens:   {summary['avg_content_tokens']:,}")
    print(f"Hallucination rate:       {summary['hallucination_rate']:.2%}")
    if summary.get('info_not_found_rate', 0) > 0:
        print(f"Info not found rate:      {summary['info_not_found_rate']:.2%} ({summary.get('questions_info_not_found', 0)} questions)")
    print(f"High accuracy (≥0.8):     {summary['high_accuracy_count']}/{summary['completed']}")
    print(f"Perfect scores (1.0):     {summary['perfect_score_count']}/{summary['completed']}")

    if 'category_breakdown' in report:
        print(f"\nCategory Breakdown:")
        for category, stats in report['category_breakdown'].items():
            print(f"  {category:20} | Accuracy: {stats['avg_accuracy']:.2%} | Time: {stats['avg_response_time']:.2f}s")

    print(f"{'='*70}\n")


def compare_results(before_file: Path, after_file: Path):
    """Compare before and after results"""
    with open(before_file) as f:
        before = json.load(f)
    with open(after_file) as f:
        after = json.load(f)

    before_sum = before['summary']
    after_sum = after['summary']

    print(f"\n{'='*70}")
    print("COMPARISON: BEFORE vs AFTER")
    print(f"{'='*70}")

    metrics = [
        ('Accuracy', 'avg_accuracy', '%', True),
        ('Completeness', 'avg_completeness', '%', True),
        ('Response Time', 'avg_response_time', 's', False),
        ('Content Size', 'avg_content_size_kb', ' KB', False),
        ('Content Tokens', 'avg_content_tokens', '', False),
        ('Hallucination Rate', 'hallucination_rate', '%', False),
    ]

    for label, key, unit, higher_better in metrics:
        before_val = before_sum[key]
        after_val = after_sum[key]

        if unit == '%':
            before_str = f"{before_val:.2%}"
            after_str = f"{after_val:.2%}"
            change = (after_val - before_val) * 100
            change_str = f"{change:+.1f}pp"
        elif unit == 's':
            before_str = f"{before_val:.2f}{unit}"
            after_str = f"{after_val:.2f}{unit}"
            change = ((after_val - before_val) / before_val) * 100 if before_val > 0 else 0
            change_str = f"{change:+.1f}%"
        else:
            before_str = f"{before_val:,.0f}{unit}" if isinstance(before_val, (int, float)) else f"{before_val}{unit}"
            after_str = f"{after_val:,.0f}{unit}" if isinstance(after_val, (int, float)) else f"{after_val}{unit}"
            change = ((after_val - before_val) / before_val) * 100 if before_val > 0 else 0
            change_str = f"{change:+.1f}%"

        # Determine if change is good or bad
        if higher_better:
            emoji = "✅" if after_val > before_val else "⚠️" if after_val < before_val else "➡️"
        else:
            emoji = "✅" if after_val < before_val else "⚠️" if after_val > before_val else "➡️"

        print(f"{label:20} | Before: {before_str:12} | After: {after_str:12} | Change: {change_str:10} {emoji}")

    print(f"{'='*70}\n")

    # Success criteria check
    print("SUCCESS CRITERIA:")
    checks = [
        ("Accuracy maintained", after_sum['avg_accuracy'] >= before_sum['avg_accuracy'] * 0.9, True),
        ("Response time improved", after_sum['avg_response_time'] < before_sum['avg_response_time'] * 0.7, True),
        ("Context usage reduced", after_sum['avg_content_tokens'] < before_sum['avg_content_tokens'] * 0.5, True),
        ("Hallucinations reduced", after_sum['hallucination_rate'] < before_sum['hallucination_rate'] * 0.6, True),
    ]

    passed = sum(1 for _, result, _ in checks if result)
    for label, result, _ in checks:
        print(f"  {'✅' if result else '❌'} {label}")

    print(f"\n  OVERALL: {passed}/{len(checks)} criteria met")
    print(f"{'='*70}\n")


def main():
    parser = argparse.ArgumentParser(description='Test agent accessibility of CircleCI docs')
    parser.add_argument('--config', type=Path, help='Path to test configuration file (e.g., config-reference-test.json)')
    parser.add_argument('--mode', help='Test mode (e.g., before, after, current). When using --config, mode must match a key in config.modes')
    parser.add_argument('--content-dir', type=Path, help='Directory containing documentation (overrides config)')
    parser.add_argument('--output', type=Path, help='Output file for results')
    parser.add_argument('--compare', nargs=2, metavar=('BEFORE', 'AFTER'), help='Compare two result files')
    parser.add_argument('--allow-pretrained', action='store_true',
                        help='Allow model to use pre-trained knowledge (default: strict mode, docs only)')

    args = parser.parse_args()

    # Get script directory
    script_dir = Path(__file__).parent

    if args.compare:
        compare_results(Path(args.compare[0]), Path(args.compare[1]))
        return

    if not args.mode:
        parser.error("--mode required (unless using --compare)")

    # Load config file if provided
    config = None
    if args.config:
        config_path = args.config if args.config.is_absolute() else script_dir / args.config
        if not config_path.exists():
            parser.error(f"Config file not found: {config_path}")

        with open(config_path, 'r') as f:
            config = json.load(f)

        # Validate mode exists in config
        if args.mode not in config['modes']:
            available_modes = ', '.join(config['modes'].keys())
            parser.error(f"Mode '{args.mode}' not found in config. Available modes: {available_modes}")

    # Determine paths based on config or defaults
    if config:
        # Config-driven approach
        questions_file = script_dir / config.get('questions_file', 'questions.json')
        rubrics_file = script_dir / config.get('rubrics_file', 'rubrics.json')

        # Resolve base_path from config (relative to repo root)
        repo_root = script_dir.parent.parent
        base_path = repo_root / config.get('base_path', 'docs/reference/modules/ROOT/pages')

        # content_dir can still be overridden by CLI arg
        content_dir = args.content_dir if args.content_dir else base_path
    else:
        # Backward compatibility: hardcoded paths
        questions_file = script_dir / 'questions.json'
        rubrics_file = script_dir / 'rubrics.json'

        if not args.content_dir:
            # Default to reference pages directory for both before/after
            content_dir = script_dir.parent.parent / 'docs' / 'reference' / 'modules' / 'ROOT' / 'pages'
        else:
            content_dir = args.content_dir

    # Output file
    if not args.output:
        args.output = script_dir / f'results_{args.mode}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

    # Determine strict mode (default True, unless --allow-pretrained is set)
    strict_mode = not args.allow_pretrained

    # Run tests
    tester = AgentAccessibilityTest(
        questions_file=questions_file,
        rubrics_file=rubrics_file,
        mode=args.mode,
        content_dir=content_dir,
        config=config,
        strict_mode=strict_mode
    )

    report = tester.run_all_tests()
    tester.save_results(args.output)
    print_summary(report)


if __name__ == '__main__':
    main()
