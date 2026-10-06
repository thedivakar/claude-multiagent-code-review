/**
 * Report Generator for Sales Qualification Briefings
 * Converts SalesBriefing to various output formats (Markdown, HTML, JSON)
 */

import { SalesBriefing } from "./sales-qualifier.js";

export class SalesReportGenerator {
  /**
   * Generate a Markdown report for sales briefings
   */
  generateMarkdownReport(briefing: SalesBriefing, companyName: string): string {
    const { companyProfile, competitiveAnalysis, qualification, recommendation, talkingPoints } = briefing;

    const painPointsList = qualification.need.painPoints
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');

    const advantagesList = competitiveAnalysis.ourAdvantages
      .map((a, i) => `${i + 1}. ${a}`)
      .join('\n');

    const concernsList = competitiveAnalysis.theirConcerns
      .map((c, i) => `${i + 1}. ${c}`)
      .join('\n');

    const talkingPointsList = talkingPoints
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');

    const techStackList = companyProfile.techStack.join(', ');
    const newsList = companyProfile.recentNews
      .map((n, i) => `- ${n}`)
      .join('\n');

    const decisionMakersList = qualification.authority.decisionMakers
      .map((dm, i) => `- ${dm}`)
      .join('\n');

    const recommendationEmoji = {
      'Pursue': '🎯',
      'Nurture': '🌱',
      'Disqualify': '❌'
    }[recommendation] || '📋';

    return `# ${recommendationEmoji} Sales Qualification Briefing: ${companyName}

## Executive Summary

**Recommendation:** ${recommendation} | **Deal Size:** $${qualification.dealSize.toLocaleString()} | **Win Probability:** ${qualification.winProbability}%

---

## 🏢 Company Profile

| Field | Value |
|-------|-------|
| **Name** | ${companyProfile.name} |
| **Industry** | ${companyProfile.industry} |
| **Employees** | ${companyProfile.employeeCount.toLocaleString()} |
| **Revenue** | ${companyProfile.estimatedRevenue} |
| **Tech Stack** | ${techStackList} |

### Recent News
${newsList || '- No recent news available'}

---

## 🔍 BANT Qualification

### Budget
- **Has Budget:** ${qualification.budget.hasBudget ? 'Yes ✅' : 'No ❌'}
- **Estimated Budget:** $${qualification.budget.estimatedBudget.toLocaleString()}

### Authority
- **Contact is Decision Maker:** ${qualification.authority.contactIsDecisionMaker ? 'Yes ✅' : 'No ❌'}
- **Decision Makers:**
${decisionMakersList}

### Need
- **Urgency:** ${qualification.need.urgency.toUpperCase()}
- **Pain Points:**
${painPointsList}

### Timeline
- **Expected Decision:** ${qualification.timeline}

---

## 🎯 Competitive Analysis

**Current Solution:** ${competitiveAnalysis.currentSolution}

### Our Advantages
${advantagesList}

### Their Potential Concerns
${concernsList}

---

## 💼 Deal Metrics

- **Deal Size:** $${qualification.dealSize.toLocaleString()}
- **Win Probability:** ${qualification.winProbability}%
- **Recommendation:** **${recommendation}**

---

## 💬 Talking Points for Sales Rep

${talkingPointsList}

---

*Generated: ${new Date().toISOString()}*
`;
  }

  /**
   * Generate an HTML report for web display
   */
  generateHTMLReport(briefing: SalesBriefing, companyName: string): string {
    const { companyProfile, competitiveAnalysis, qualification, recommendation, talkingPoints } = briefing;

    const recommendationClass = recommendation.toLowerCase();
    const recommendationColor = {
      'pursue': '#27ae60',
      'nurture': '#f39c12',
      'disqualify': '#e74c3c'
    }[recommendationClass] || '#3498db';

    const urgencyColor = {
      'high': '#e74c3c',
      'medium': '#f39c12',
      'low': '#27ae60'
    }[qualification.need.urgency] || '#3498db';

    const painPointsHTML = qualification.need.painPoints
      .map(p => `<li>${p}</li>`)
      .join('');

    const advantagesHTML = competitiveAnalysis.ourAdvantages
      .map(a => `<li class="advantage">${a}</li>`)
      .join('');

    const concernsHTML = competitiveAnalysis.theirConcerns
      .map(c => `<li class="concern">${c}</li>`)
      .join('');

    const talkingPointsHTML = talkingPoints
      .map((p, i) => `<li><strong>Point ${i + 1}:</strong> ${p}</li>`)
      .join('');

    const techStackHTML = companyProfile.techStack
      .map(tech => `<span class="tech-badge">${tech}</span>`)
      .join(' ');

    const newsHTML = companyProfile.recentNews
      .map(n => `<li>${n}</li>`)
      .join('');

    const decisionMakersHTML = qualification.authority.decisionMakers
      .map(dm => `<li>${dm}</li>`)
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Briefing - ${companyName}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #212529;
      line-height: 1.6;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid ${recommendationColor};
      padding-bottom: 16px;
      margin-top: 0;
    }
    .exec-summary {
      background: linear-gradient(135deg, ${recommendationColor}15 0%, ${recommendationColor}05 100%);
      padding: 24px;
      border-radius: 8px;
      border-left: 5px solid ${recommendationColor};
      margin: 24px 0;
    }
    .recommendation-badge {
      display: inline-block;
      background: ${recommendationColor};
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 1.1em;
      margin-right: 12px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      border-top: 3px solid #3498db;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #3498db;
      margin: 8px 0;
    }
    .metric-label {
      color: #6c757d;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      margin: 32px 0;
    }
    h2 {
      color: #34495e;
      border-left: 4px solid #3498db;
      padding-left: 16px;
      margin-top: 32px;
    }
    h3 {
      color: #34495e;
      margin-top: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }
    .tech-badge {
      display: inline-block;
      background: #e9ecef;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      margin: 4px 4px 4px 0;
      color: #495057;
    }
    ul { padding-left: 24px; }
    li { margin: 8px 0; }
    .advantage { color: #27ae60; }
    .concern { color: #e74c3c; }
    .urgency {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      color: white;
      background: ${urgencyColor};
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.9em;
      font-weight: 600;
    }
    .status-yes {
      background: #d4edda;
      color: #155724;
    }
    .status-no {
      background: #f8d7da;
      color: #721c24;
    }
    .talking-points {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 4px;
      margin: 16px 0;
    }
    .talking-points li {
      margin: 12px 0;
    }
    footer {
      text-align: center;
      color: #6c757d;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #dee2e6;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Sales Qualification Briefing: ${companyName}</h1>

    <div class="exec-summary">
      <span class="recommendation-badge">${recommendation}</span>
      <strong>Deal Size:</strong> $${qualification.dealSize.toLocaleString()} |
      <strong>Win Probability:</strong> ${qualification.winProbability}%
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${companyProfile.employeeCount.toLocaleString()}</div>
        <div class="metric-label">Employees</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">$${qualification.dealSize.toLocaleString()}</div>
        <div class="metric-label">Deal Size</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${qualification.winProbability}%</div>
        <div class="metric-label">Win Probability</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${qualification.need.painPoints.length}</div>
        <div class="metric-label">Pain Points</div>
      </div>
    </div>

    <h2>🏢 Company Profile</h2>
    <table>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
      <tr>
        <td><strong>Industry</strong></td>
        <td>${companyProfile.industry}</td>
      </tr>
      <tr>
        <td><strong>Revenue</strong></td>
        <td>${companyProfile.estimatedRevenue}</td>
      </tr>
      <tr>
        <td><strong>Tech Stack</strong></td>
        <td>${techStackHTML}</td>
      </tr>
    </table>

    <h3>Recent News</h3>
    <ul>${newsHTML || '<li>No recent news available</li>'}</ul>

    <h2>🔍 BANT Qualification</h2>

    <div class="section">
      <h3>Budget</h3>
      <p>
        <span class="status-badge ${qualification.budget.hasBudget ? 'status-yes' : 'status-no'}">
          ${qualification.budget.hasBudget ? '✅ Has Budget' : '❌ No Budget'}
        </span>
        <strong>Estimated:</strong> $${qualification.budget.estimatedBudget.toLocaleString()}
      </p>
    </div>

    <div class="section">
      <h3>Authority</h3>
      <p>
        <span class="status-badge ${qualification.authority.contactIsDecisionMaker ? 'status-yes' : 'status-no'}">
          ${qualification.authority.contactIsDecisionMaker ? '✅ Contact is Decision Maker' : '❌ Need Other Decision Makers'}
        </span>
      </p>
      <strong>Decision Makers:</strong>
      <ul>${decisionMakersHTML}</ul>
    </div>

    <div class="section">
      <h3>Need</h3>
      <p><strong>Urgency:</strong> <span class="urgency">${qualification.need.urgency.toUpperCase()}</span></p>
      <strong>Pain Points:</strong>
      <ul>${painPointsHTML}</ul>
    </div>

    <div class="section">
      <h3>Timeline</h3>
      <p>${qualification.timeline}</p>
    </div>

    <h2>🎯 Competitive Analysis</h2>
    <p><strong>Current Solution:</strong> ${competitiveAnalysis.currentSolution}</p>

    <h3>Our Advantages</h3>
    <ul>${advantagesHTML}</ul>

    <h3>Their Potential Concerns</h3>
    <ul>${concernsHTML}</ul>

    <h2>💬 Talking Points for Sales Rep</h2>
    <div class="talking-points">
      <ul>${talkingPointsHTML}</ul>
    </div>

    <footer>
      Generated: ${new Date().toLocaleString()} | Sales Intelligence System v1.0
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Generate formatted JSON report
   */
  generateJSONReport(briefing: SalesBriefing, companyName: string, metadata?: Record<string, unknown>): string {
    const report = {
      company: companyName,
      timestamp: new Date().toISOString(),
      briefing,
      metadata: metadata || {}
    };
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate CSV report for spreadsheet import
   */
  generateCSVReport(briefing: SalesBriefing, companyName: string): string {
    const { companyProfile, qualification, recommendation } = briefing;

    const escapeCsv = (value: string | number | boolean): string => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Company Name',
      'Industry',
      'Employees',
      'Revenue',
      'Has Budget',
      'Estimated Budget',
      'Contact is DM',
      'Need Urgency',
      'Timeline',
      'Deal Size',
      'Win Probability',
      'Recommendation',
      'Pain Points Count',
      'Decision Makers Count'
    ];

    const values = [
      escapeCsv(companyName),
      escapeCsv(companyProfile.industry),
      escapeCsv(companyProfile.employeeCount),
      escapeCsv(companyProfile.estimatedRevenue),
      escapeCsv(qualification.budget.hasBudget),
      escapeCsv(qualification.budget.estimatedBudget),
      escapeCsv(qualification.authority.contactIsDecisionMaker),
      escapeCsv(qualification.need.urgency),
      escapeCsv(qualification.timeline),
      escapeCsv(qualification.dealSize),
      escapeCsv(qualification.winProbability),
      escapeCsv(recommendation),
      escapeCsv(qualification.need.painPoints.length),
      escapeCsv(qualification.authority.decisionMakers.length)
    ];

    return `${headers.join(',')}\n${values.join(',')}`;
  }
}
