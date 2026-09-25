import * as dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { CodeReviewOrchestrator } from './orchestrator';
import { ReportGenerator } from './utils/report-generator';

// Load environment variables
dotenv.config();

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 * Usage: npm run dev <owner> <repo> <pr-number>
 */
async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('Error: PR number must be a valid positive integer.');
    process.exit(1);
  }

  // Validate authentication
  const hasAnthropicAuth = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasAwsAuth =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (hasAwsAuth) {
    if (!process.env.AWS_REGION) {
      console.error(
        'Error: AWS_REGION is required when using AWS Bedrock authentication.'
      );
      process.exit(1);
    }

    console.log('🔐 Using AWS Bedrock authentication');
  } else if (hasAnthropicAuth) {
    console.log('🔐 Using Anthropic API authentication');
  } else {
    console.error(
      'Error: No authentication configured.\n' +
      'Set ANTHROPIC_API_KEY or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY.'
    );
    process.exit(1);
  }

  // Validate Anthropic model
  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    console.error(
      'Error: ANTHROPIC_MODEL environment variable is required.'
    );
    process.exit(1);
  }

  try {
    console.log(
      `Starting review of ${owner}/${repo} PR #${prNumber}...`
    );

    // Create orchestrator
    const orchestrator = new CodeReviewOrchestrator();

    // Review the pull request
    const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber
    );

    // Generate reports
    const reportGenerator = new ReportGenerator();

    const markdownReport =
      reportGenerator.generateMarkdownReport(report);

    const htmlReport =
      reportGenerator.generateHTMLReport(report);

    const jsonReport =
      reportGenerator.generateJSONReport(report);

    // Create reports directory
    mkdirSync('reports', { recursive: true });

    const baseName = `${owner}_${repo}_${prNumber}`;

    // Save reports
    writeFileSync(
      `reports/${baseName}.md`,
      markdownReport,
      'utf-8'
    );

    writeFileSync(
      `reports/${baseName}.html`,
      htmlReport,
      'utf-8'
    );

    writeFileSync(
      `reports/${baseName}.json`,
      jsonReport,
      'utf-8'
    );

    console.log('Code review completed');
    console.log({
      service: 'code-review-system',
      owner,
      repo,
      prNumber,
      score: report.summary.overallScore,
      duration: report.metadata.duration,
      status: 'success'
    });

    console.log('Reports saved:');
    console.log(`- reports/${baseName}.json`);
    console.log(`- reports/${baseName}.md`);
    console.log(`- reports/${baseName}.html`);
    console.log(
      `Overall score: ${report.summary.overallScore}/100`
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();