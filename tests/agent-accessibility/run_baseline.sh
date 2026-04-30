#!/bin/bash
# Quick script to run baseline tests

set -e

echo "========================================="
echo "Agent Accessibility Baseline Tests"
echo "========================================="
echo ""

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ Error: ANTHROPIC_API_KEY not set"
    echo ""
    echo "Please set your API key:"
    echo "  export ANTHROPIC_API_KEY='your-key-here'"
    echo ""
    exit 1
fi

# Check for anthropic package
if ! python3 -c "import anthropic" 2>/dev/null; then
    echo "⚠️  Warning: anthropic package not installed"
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Run baseline test
echo "Running baseline tests (before restructure)..."
echo ""

python3 test_agent_accessibility.py --mode before

echo ""
echo "✅ Baseline tests complete!"
echo ""
echo "To run post-implementation tests later:"
echo "  python3 test_agent_accessibility.py --mode after"
echo ""
echo "To compare results:"
echo "  python3 test_agent_accessibility.py --compare results_before.json results_after.json"
echo ""
