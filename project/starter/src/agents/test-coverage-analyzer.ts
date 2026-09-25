import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts';

export const testCoverageAnalyzer: AgentDefinition = {
  description: 'Analyzes source code for test coverage gaps and recommends useful tests.',
  prompt: TEST_COVERAGE_ANALYZER_PROMPT,
};