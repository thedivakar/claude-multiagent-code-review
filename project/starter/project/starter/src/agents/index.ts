import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

import { codeQualityAnalyzer } from './code-quality-analyzer';
import { testCoverageAnalyzer } from './test-coverage-analyzer';
import { refactoringSuggester } from './refactoring-suggester';

export { codeQualityAnalyzer } from './code-quality-analyzer';
export { testCoverageAnalyzer } from './test-coverage-analyzer';
export { refactoringSuggester } from './refactoring-suggester';

export const agents: Record<string, AgentDefinition> = {
  'code-quality-analyzer': codeQualityAnalyzer,
  'test-coverage-analyzer': testCoverageAnalyzer,
  'refactoring-suggester': refactoringSuggester,
};