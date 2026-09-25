import { query } from '@anthropic-ai/claude-agent-sdk';
import { mcpServersConfig } from './config/mcp.config';
import { agents } from './agents';
import { buildOrchestratorPrompt } from './prompts';
import {
  ReviewReport,
  ReviewReportSchema,
  ReviewReportJSONSchema,
} from './types/report-types';
import { logger } from './utils/logger';
import {
  withRetry,
  withTimeout,
  ReviewError,
  ErrorCodes,
  formatError,
} from './utils/error-handler';
import {
  RateLimiter,
  globalRateLimiter,
  RateLimiterConfig,
} from './utils/rate-limiter';

const ORCHESTRATOR_TIMEOUT_MS = 8 * 60 * 1000;
const DEFAULT_MAX_TURNS = 60;
const ESTIMATED_TOKENS_PER_REVIEW = 30000;

export interface OrchestratorOptions {
  rateLimiter?: RateLimiter;
  rateLimitConfig?: Partial<RateLimiterConfig>;
  model?: string;
  maxTurns?: number;
}

export class CodeReviewOrchestrator {
  private readonly rateLimiter: RateLimiter;
  private readonly model?: string;
  private readonly maxTurns: number;

  constructor(options: OrchestratorOptions = {}) {
    this.rateLimiter =
      options.rateLimiter ??
      (options.rateLimitConfig
        ? new RateLimiter(options.rateLimitConfig)
        : globalRateLimiter);

    this.model = options.model;
    this.maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const model = this.model ?? process.env.ANTHROPIC_MODEL;

    if (!model) {
      throw new ReviewError(
        'ANTHROPIC_MODEL environment variable is required',
        ErrorCodes.INVALID_CONFIG
      );
    }

    const startedAt = Date.now();

    logger.info('Starting code review', {
      owner,
      repo,
      prNumber,
    });

    await this.rateLimiter.acquire(ESTIMATED_TOKENS_PER_REVIEW);

    try {
      const output = await withRetry(
        () =>
          withTimeout(
            () => this.runQuery(owner, repo, prNumber, model),
            ORCHESTRATOR_TIMEOUT_MS,
            `Review of ${owner}/${repo}#${prNumber} timed out`
          ),
        3,
        1000
      );

      const parsed = ReviewReportSchema.safeParse(output);

      if (!parsed.success) {
        throw new ReviewError(
          `Orchestrator output failed schema validation: ${parsed.error.message}`,
          ErrorCodes.STRUCTURED_OUTPUT_FAILED,
          {
            issues: parsed.error.issues,
          }
        );
      }

      const duration = Date.now() - startedAt;

      logger.info('Code review completed', {
        owner,
        repo,
        prNumber,
        score: parsed.data.summary.overallScore,
        duration,
        status: 'success',
      });

      return parsed.data;
    } catch (error) {
      logger.error('Code review failed', {
        owner,
        repo,
        prNumber,
        error: formatError(error),
        status: 'failed',
      });

      throw error;
    } finally {
      this.rateLimiter.release();
    }
  }

  private async runQuery(
    owner: string,
    repo: string,
    prNumber: number,
    model: string
  ): Promise<unknown> {
    const prompt = buildOrchestratorPrompt(owner, repo, prNumber);

    const result = query({
      prompt,
      options: {
        model,
        maxTurns: this.maxTurns,
        permissionMode: 'default',

        mcpServers: mcpServersConfig,

        agents,

        allowedTools: [
          'Task',
          'Read',
          'Grep',
          'Glob',
          'Skill',
          'mcp__github__get_pull_request',
          'mcp__github__get_pull_request_files',
          'mcp__github__get_file_contents',
          'mcp__eslint__lint-files',
        ],

        outputFormat: {
          type: 'json_schema',
          schema: ReviewReportJSONSchema,
        },
      },
    });

    let structuredOutput: unknown = null;
    let failureSubtype: string | null = null;

    for await (const message of result) {
      if (message.type === 'result') {
        if (
          message.subtype === 'success' &&
          message.structured_output
        ) {
          structuredOutput = message.structured_output;
        } else if (message.subtype !== 'success') {
          failureSubtype = message.subtype;
        }
      }

      if (message.type === 'assistant') {
        logger.debug('Orchestrator turn', {
          content: message.message?.content,
        });
      }
    }

    if (!structuredOutput) {
      throw new ReviewError(
        failureSubtype
          ? `Orchestrator run ended with SDK failure subtype "${failureSubtype}"`
          : 'Orchestrator did not produce a structured_output payload',
        ErrorCodes.AGENT_FAILED,
        {
          owner,
          repo,
          prNumber,
          failureSubtype,
        }
      );
    }

    return structuredOutput;
  }
}