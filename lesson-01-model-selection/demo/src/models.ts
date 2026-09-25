/**
 * Claude Model Definitions
 *
 * Pricing: https://platform.claude.com/docs/en/about-claude/pricing
 * Model IDs: https://platform.claude.com/docs/en/about-claude/models/overview
 */

export const MODELS = {
  haiku: {
    id: "claude-haiku-4-5-20251001", //replace with the model you want to use, must be haiku 
    name: "Haiku 4.5",
    inputCostPer1k: 0.001,   // $1 per million tokens
    outputCostPer1k: 0.005,  // $5 per million tokens
  },
  sonnet: {
    id: "claude-sonnet-4-5-20250929", //replace with the model you want to use, must be sonnet model
    name: "Sonnet 4.5",
    inputCostPer1k: 0.003,   // $3 per million tokens
    outputCostPer1k: 0.015,  // $15 per million tokens
  },
  opus: {
    id: "claude-opus-4-5-20251101", //replace with the model you want to use, must be opus model
    name: "Opus 4.5",
    inputCostPer1k: 0.005,   // $5 per million tokens
    outputCostPer1k: 0.025,  // $25 per million tokens
    effort: "high", // currently only haiku and sonnet have effort Beta feature only available to Opus model
  },
};

export type ModelKey = keyof typeof MODELS;
