import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts';

export const refactoringSuggester: AgentDefinition = {
  description: 'Identifies refactoring opportunities and suggests concrete improvements to the code.',
  prompt: REFACTORING_SUGGESTER_PROMPT,
};