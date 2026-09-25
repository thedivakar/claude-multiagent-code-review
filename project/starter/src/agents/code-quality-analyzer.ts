import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts';

export const codeQualityAnalyzer: AgentDefinition = {
  description: 'Analyzes source code for quality, security, bugs, maintainability, and best-practice issues.',
  prompt: CODE_QUALITY_ANALYZER_PROMPT,
};