import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReviewReport } from '../src/types/report-types';

/**
 * Tests for CodeReviewOrchestrator
 *
 * The Claude Agent SDK's query() is mocked so these tests run without
 * real API calls, real MCP servers, or real network access.
 */

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: queryMock,
}));

import { CodeReviewOrchestrator } from '../src/orchestrator';
import { RateLimiter } from '../src/utils/rate-limiter';

function asyncIterableFrom(messages: unknown[]) {
  return {
    [Symbol.asyncIterator]() {
      let i = 0;

      return {
        next: async () => {
          if (i < messages.length) {
            return {
              value: messages[i++],
              done: false,
            };
          }

          return {
            value: undefined,
            done: true,
          };
        },
      };
    },
  };
}

const validReport: ReviewReport = {
  pullRequest: {
    owner: 'octocat',
    repo: 'Hello-World',
    number: 1,
  },

  fileReviews: [
    {
      file: 'src/index.ts',

      codeQuality: {
        file: 'src/index.ts',
        issues: [
          {
            line: 12,
            severity: 'medium',
            category: 'maintainability',
            description: 'Function is doing too much.',
            suggestion: 'Extract the validation logic into its own function.',
          },
        ],
        overallScore: 82,
        summary: 'Mostly clean, one maintainability nit.',
      },

      testCoverage: {
        file: 'src/index.ts',
        hasTests: true,
        testFiles: ['src/index.test.ts'],
        untestedPaths: [],
        coverageEstimate: 90,
        summary: 'Well covered.',
      },

      refactorings: {
        file: 'src/index.ts',
        suggestions: [],
        summary: 'Nothing notable.',
      },
    },
  ],

  summary: {
    totalFiles: 1,
    overallScore: 85,
    criticalIssues: 0,
    highPriorityTests: 0,
    refactoringOpportunities: 0,
  },

  recommendations: [
    {
      priority: 'medium',
      category: 'maintainability',
      description:
        'Extract the validation logic in index.ts into its own function.',
      files: ['src/index.ts'],
    },
  ],

  metadata: {
    analyzedAt: new Date().toISOString(),
    duration: 1234,
    agentVersions: {
      'code-quality-analyzer': '1.0.0',
      'test-coverage-analyzer': '1.0.0',
      'refactoring-suggester': '1.0.0',
    },
  },
};

describe('CodeReviewOrchestrator', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929';
    queryMock.mockReset();
  });

  describe('Configuration', () => {
    it('should initialize with default options', () => {
      const orchestrator = new CodeReviewOrchestrator();

      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });

    it('should accept custom rate limit configuration', () => {
      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {
          maxConcurrent: 1,
          maxRequestsPerMinute: 5,
          maxTokensPerMinute: 2000,
        },
      });

      const rateLimiter = (orchestrator as any).rateLimiter as RateLimiter;

      expect(rateLimiter).toBeInstanceOf(RateLimiter);

      const status = rateLimiter.getStatus();

      expect(status.availableRequests).toBe(5);
      expect(status.availableTokens).toBe(2000);
    });
  });

  describe('reviewPullRequest', () => {
    it('should fetch PR files from GitHub MCP', async () => {
      queryMock.mockReturnValue(
        asyncIterableFrom([
          {
            type: 'result',
            subtype: 'success',
            structured_output: validReport,
          },
        ])
      );

      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {},
      });

      await orchestrator.reviewPullRequest(
        'octocat',
        'Hello-World',
        1
      );

      expect(queryMock).toHaveBeenCalledTimes(1);

      const callArgs = queryMock.mock.calls[0][0];

      expect(callArgs.options.mcpServers).toHaveProperty('github');
      expect(callArgs.options.mcpServers).toHaveProperty('eslint');

      expect(callArgs.options.allowedTools).toContain(
        'mcp__github__get_pull_request'
      );
    });

    it('should spawn all 3 subagents in parallel', async () => {
      queryMock.mockReturnValue(
        asyncIterableFrom([
          {
            type: 'result',
            subtype: 'success',
            structured_output: validReport,
          },
        ])
      );

      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {},
      });

      await orchestrator.reviewPullRequest(
        'octocat',
        'Hello-World',
        1
      );

      const callArgs = queryMock.mock.calls[0][0];

      expect(Object.keys(callArgs.options.agents)).toEqual(
        expect.arrayContaining([
          'code-quality-analyzer',
          'test-coverage-analyzer',
          'refactoring-suggester',
        ])
      );

      expect(callArgs.options.allowedTools).toContain('Task');

      expect(callArgs.prompt).toContain('parallel');
    });

    it('should aggregate results into ReviewReport', async () => {
      queryMock.mockReturnValue(
        asyncIterableFrom([
          {
            type: 'result',
            subtype: 'success',
            structured_output: validReport,
          },
        ])
      );

      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {},
      });

      const report = await orchestrator.reviewPullRequest(
        'octocat',
        'Hello-World',
        1
      );

      expect(report.pullRequest).toEqual(
        validReport.pullRequest
      );

      expect(report.fileReviews).toHaveLength(1);

      expect(report.summary.overallScore).toBe(85);

      expect(report.recommendations).toHaveLength(1);
    });

    it('should validate output with Zod schema', async () => {
      const invalidReport = {
        ...validReport,
        summary: {
          ...validReport.summary,
          overallScore: 'not-a-number',
        },
      };

      queryMock.mockReturnValue(
        asyncIterableFrom([
          {
            type: 'result',
            subtype: 'success',
            structured_output: invalidReport,
          },
        ])
      );

      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {},
      });

      await expect(
        orchestrator.reviewPullRequest(
          'octocat',
          'Hello-World',
          1
        )
      ).rejects.toMatchObject({
        code: 'STRUCTURED_OUTPUT_FAILED',
      });
    });

    it('throws a clear error when the SDK never produces a structured_output', async () => {
      queryMock.mockReturnValue(
        asyncIterableFrom([
          {
            type: 'assistant',
            message: {
              content: [],
            },
          },
        ])
      );

      const orchestrator = new CodeReviewOrchestrator({
        rateLimitConfig: {
          maxConcurrent: 1,
        },
      });

      await expect(
        orchestrator.reviewPullRequest(
          'octocat',
          'Hello-World',
          1
        )
      ).rejects.toThrow();
    });
  });

  describe('Integration', () => {
    it.skip('should review a real small PR', async () => {
      // Requires real API keys.
    });
  });
});