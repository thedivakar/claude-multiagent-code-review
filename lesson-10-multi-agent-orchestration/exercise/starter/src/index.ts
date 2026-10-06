/**
 * Exercise: Multi-Agent Orchestration - Sales Opportunity Qualifier
 *
 * CLI entry point with argument validation and error handling.
 * Usage: npm start [prospect-id]
 *   prospect-id: 0=TechCorp, 1=GrowthStartup, 2=LocalBiz, or "all"
 */

import "dotenv/config";
import { qualifyOpportunity, SalesBriefing } from "./sales-qualifier.js";
import { sampleProspects } from "./sample-prospects.js";
import { SalesReportGenerator } from "./report-generator.js";
import { mkdirSync, writeFileSync } from "fs";

// -----------------------------------------------------------------------------
// Environment Validation
// -----------------------------------------------------------------------------

function validateEnvironment(): void {
  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    console.error("Error: ANTHROPIC_MODEL environment variable is required.");
    console.error("Please copy .env.example to .env and configure the model.");
    process.exit(1);
  }

  // In Vocareum, API key and base URL are pre-configured
  // For local development, check if they exist
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasBaseUrl = Boolean(process.env.ANTHROPIC_BASE_URL);

  if (!hasAnthropicKey && !hasBaseUrl) {
    console.warn("⚠️  Warning: ANTHROPIC_API_KEY not found in environment.");
    console.warn("   If running locally, set it in .env file.");
  }
}

// -----------------------------------------------------------------------------
// CLI Argument Parsing
// -----------------------------------------------------------------------------

function parseArguments(): number | "all" | null {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return 0; // Default: first prospect
  }

  const arg = args[0].toLowerCase();

  if (arg === "all") {
    return "all";
  }

  if (arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(0);
  }

  const prospectId = parseInt(arg, 10);

  if (isNaN(prospectId) || prospectId < 0 || prospectId >= sampleProspects.length) {
    console.error(`Error: Invalid prospect ID "${arg}".`);
    console.error(`Valid IDs are 0-${sampleProspects.length - 1} or "all".\n`);
    printUsage();
    process.exit(1);
  }

  return prospectId;
}

function printUsage(): void {
  console.log("Usage: npm start [prospect-id]\n");
  console.log("Arguments:");
  console.log("  prospect-id    Prospect to qualify (default: 0)");
  console.log("                 0 = TechCorp Industries (Enterprise)");
  console.log("                 1 = GrowthStartup Inc (Startup)");
  console.log("                 2 = LocalBiz Solutions (SMB)");
  console.log("                 all = Qualify all prospects");
  console.log("\nOptions:");
  console.log("  --help, -h     Show this help message");
  console.log("\nExamples:");
  console.log("  npm start              # Qualify TechCorp (default)");
  console.log("  npm start 1            # Qualify GrowthStartup");
  console.log("  npm start all          # Qualify all prospects");
}

// -----------------------------------------------------------------------------
// Report Saving
// -----------------------------------------------------------------------------

function saveReports(briefing: SalesBriefing, companyName: string): string[] {
  const reportGenerator = new SalesReportGenerator();

  // Create reports directory if it doesn't exist
  mkdirSync('reports', { recursive: true });

  // Generate safe filename from company name
  const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  const baseName = `${safeCompanyName}_${timestamp}`;

  const savedFiles: string[] = [];

  try {
    // Generate and save Markdown report
    const markdownReport = reportGenerator.generateMarkdownReport(briefing, companyName);
    const mdPath = `reports/${baseName}.md`;
    writeFileSync(mdPath, markdownReport, 'utf-8');
    savedFiles.push(mdPath);

    // Generate and save HTML report
    const htmlReport = reportGenerator.generateHTMLReport(briefing, companyName);
    const htmlPath = `reports/${baseName}.html`;
    writeFileSync(htmlPath, htmlReport, 'utf-8');
    savedFiles.push(htmlPath);

    // Generate and save JSON report
    const jsonReport = reportGenerator.generateJSONReport(briefing, companyName, {
      prospectId: companyName,
      generatedAt: new Date().toISOString()
    });
    const jsonPath = `reports/${baseName}.json`;
    writeFileSync(jsonPath, jsonReport, 'utf-8');
    savedFiles.push(jsonPath);

    // Generate and save CSV report
    const csvReport = reportGenerator.generateCSVReport(briefing, companyName);
    const csvPath = `reports/${baseName}.csv`;
    writeFileSync(csvPath, csvReport, 'utf-8');
    savedFiles.push(csvPath);

    console.log("\n📄 Reports saved:");
    savedFiles.forEach(file => console.log(`   - ${file}`));

  } catch (error) {
    console.error("\n⚠️  Warning: Failed to save some reports:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
  }

  return savedFiles;
}

// -----------------------------------------------------------------------------
// Prospect Qualification
// -----------------------------------------------------------------------------

async function qualifyProspect(prospectId: number, saveReport = true): Promise<void> {
  const prospect = sampleProspects[prospectId];

  if (!prospect) {
    throw new Error(`Prospect with ID ${prospectId} not found`);
  }

  console.log(`\nQualifying: ${prospect.companyName}`);
  console.log(`Contact: ${prospect.name}, ${prospect.title}`);
  console.log(`Type: ${prospect.companyType.toUpperCase()}`);
  console.log(`Source: ${prospect.source}\n`);
  console.log("Orchestrator coordinating subagents...\n");

  try {
    const briefing = await qualifyOpportunity(prospect.companyName, {
      name: prospect.name,
      title: prospect.title,
      email: prospect.email,
    });

    printBriefing(briefing);

    // Save reports if requested
    if (saveReport) {
      saveReports(briefing, prospect.companyName);
    }
  } catch (error) {
    console.error(`\n❌ Error qualifying ${prospect.companyName}:`);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    throw error;
  }
}

async function qualifyAllProspects(): Promise<void> {
  console.log(`\n📊 Qualifying all ${sampleProspects.length} prospects...\n`);

  const results: Array<{ prospect: string; success: boolean; error?: string }> = [];

  for (let i = 0; i < sampleProspects.length; i++) {
    try {
      console.log(`${"=".repeat(60)}`);
      console.log(`  PROSPECT ${i + 1}/${sampleProspects.length}`);
      console.log(`${"=".repeat(60)}`);

      await qualifyProspect(i);
      results.push({ prospect: sampleProspects[i].companyName, success: true });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.push({
        prospect: sampleProspects[i].companyName,
        success: false,
        error: errorMsg
      });
      console.error(`\n⚠️  Continuing to next prospect...\n`);
    }
  }

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("  SUMMARY");
  console.log(`${"=".repeat(60)}\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${sampleProspects.length}`);
  console.log(`❌ Failed: ${failed}/${sampleProspects.length}\n`);

  if (failed > 0) {
    console.log("Failed prospects:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.prospect}: ${r.error}`);
    });
  }
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function printBriefing(briefing: SalesBriefing) {
  console.log("=".repeat(50));
  console.log("SALES BRIEFING");
  console.log("=".repeat(50));

  console.log("\nCOMPANY PROFILE:");
  console.log(`  Name: ${briefing.companyProfile.name}`);
  console.log(`  Industry: ${briefing.companyProfile.industry}`);
  console.log(`  Employees: ${briefing.companyProfile.employeeCount}`);
  console.log(`  Revenue: ${briefing.companyProfile.estimatedRevenue}`);

  console.log("\nCOMPETITIVE ANALYSIS:");
  console.log(`  Current Solution: ${briefing.competitiveAnalysis.currentSolution}`);
  console.log(`  Our Advantages: ${briefing.competitiveAnalysis.ourAdvantages.join(", ")}`);

  console.log("\nBANT QUALIFICATION:");
  console.log(`  Budget: ${briefing.qualification.budget.hasBudget ? "Yes" : "No"} ($${briefing.qualification.budget.estimatedBudget.toLocaleString()})`);
  console.log(`  Authority: ${briefing.qualification.authority.contactIsDecisionMaker ? "Contact is DM" : "Need other DMs"}`);
  console.log(`  Need Urgency: ${briefing.qualification.need.urgency}`);
  console.log(`  Timeline: ${briefing.qualification.timeline}`);

  console.log("\nDEAL METRICS:");
  console.log(`  Deal Size: $${briefing.qualification.dealSize.toLocaleString()}`);
  console.log(`  Win Probability: ${briefing.qualification.winProbability}%`);
  console.log(`  RECOMMENDATION: ${briefing.recommendation}`);

  console.log("\nTALKING POINTS:");
  briefing.talkingPoints.forEach((point, i) => console.log(`  ${i + 1}. ${point}`));
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("  EXERCISE: Multi-Agent - Sales Opportunity Qualifier");
  console.log("  Orchestrator coordinates researcher, analyzer, scorer");
  console.log("=".repeat(60));

  // Validate environment variables
  validateEnvironment();

  // Parse CLI arguments
  const prospectArg = parseArguments();

  try {
    if (prospectArg === "all") {
      await qualifyAllProspects();
    } else if (typeof prospectArg === "number") {
      await qualifyProspect(prospectArg);
    } else {
      console.error("Error: Invalid prospect argument");
      process.exit(1);
    }

    console.log("\n✅ Qualification complete!");
  } catch (error) {
    console.error("\n❌ Fatal error during qualification:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);

      // Check for common errors and provide helpful messages
      if (error.message.includes("ANTHROPIC_API_KEY")) {
        console.error("\n💡 Tip: Make sure ANTHROPIC_API_KEY is set in your environment.");
        console.error("   In Vocareum, this is pre-configured.");
        console.error("   For local development, add it to your .env file.");
      } else if (error.message.includes("ANTHROPIC_MODEL")) {
        console.error("\n💡 Tip: Copy .env.example to .env and configure ANTHROPIC_MODEL.");
      } else if (error.message.includes("fetch") || error.message.includes("network")) {
        console.error("\n💡 Tip: Check your internet connection and API endpoint.");
      } else if (error.message.includes("rate limit")) {
        console.error("\n💡 Tip: You've hit the API rate limit. Wait a moment and try again.");
      }
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

// Run main with proper error handling
main().catch((error) => {
  console.error("\n💥 Unhandled error:");
  console.error(error);
  process.exit(1);
});
