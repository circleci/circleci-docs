/**
 * Agent-Friendly Documentation Tests
 *
 * This test suite checks the CircleCI documentation for agent-friendliness
 * using the AF Docs tool (https://afdocs.dev/)
 *
 * Configuration is in agent-docs.config.yml
 *
 * To run locally:
 *   npm install -D afdocs vitest
 *   npx vitest run agent-docs.test.ts
 */

import { describeAgentDocsPerCheck } from 'afdocs/helpers';

// Run all agent-friendliness checks
// The configuration in agent-docs.config.yml will be loaded automatically
// Timeout is set to 5 minutes (300,000ms) to allow for comprehensive checking
describeAgentDocsPerCheck(__dirname, 300_000);
