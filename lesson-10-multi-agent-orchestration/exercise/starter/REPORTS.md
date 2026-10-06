# Report Generation Documentation

## Overview

The Sales Qualification system generates comprehensive review reports in multiple formats for easy consumption and integration with various tools.

## Supported Formats

### 1. **Markdown (.md)**
- Human-readable format
- Perfect for GitHub, documentation sites
- Contains formatted tables, lists, and headers
- Ideal for: Version control, wikis, README files

**Features:**
- Executive summary with key metrics
- Company profile with tech stack
- BANT qualification breakdown
- Competitive analysis
- Talking points for sales reps

### 2. **HTML (.html)**
- Professional web-based reports
- Interactive, styled interface
- Self-contained (includes CSS)
- Ideal for: Email attachments, web viewing, presentations

**Features:**
- Responsive design
- Color-coded metrics and statuses
- Visual hierarchy with cards and badges
- Professional styling with gradients
- Mobile-friendly layout

### 3. **JSON (.json)**
- Machine-readable format
- Structured data export
- Easy integration with APIs
- Ideal for: Data processing, CRM integration, analytics

**Features:**
- Complete data structure
- Timestamp and metadata
- Type-safe schema
- Easy to parse and query

### 4. **CSV (.csv)**
- Spreadsheet-compatible format
- Import into Excel, Google Sheets
- Simple tabular data
- Ideal for: Data analysis, reporting dashboards, bulk processing

**Features:**
- Key metrics in columns
- Proper CSV escaping
- Header row included
- Compatible with all spreadsheet tools

## Report Storage

Reports are automatically saved to the `reports/` directory with the following naming convention:

```
reports/{company_name}_{timestamp}.{format}
```

Example:
```
reports/techcorp_industries_2026-10-06T12-30-00.md
reports/techcorp_industries_2026-10-06T12-30-00.html
reports/techcorp_industries_2026-10-06T12-30-00.json
reports/techcorp_industries_2026-10-06T12-30-00.csv
```

## Usage

### Automatic Report Generation

Reports are automatically generated when you run the qualification:

```bash
npm start              # Qualifies first prospect and saves reports
npm start 1            # Qualifies second prospect and saves reports
npm start all          # Qualifies all prospects and saves reports for each
```

### Report Contents

Each report includes:

1. **Company Profile**
   - Name, industry, employee count
   - Estimated revenue
   - Technology stack
   - Recent news and developments

2. **BANT Qualification**
   - Budget assessment and estimation
   - Authority identification
   - Need analysis with pain points
   - Timeline prediction

3. **Competitive Analysis**
   - Current solution analysis
   - Our competitive advantages
   - Potential concerns
   - Switching barriers

4. **Deal Metrics**
   - Deal size calculation
   - Win probability (0-100%)
   - Overall recommendation (Pursue/Nurture/Disqualify)

5. **Talking Points**
   - Actionable conversation starters
   - Key value propositions
   - Objection handlers

## Report Formats Comparison

| Feature | Markdown | HTML | JSON | CSV |
|---------|----------|------|------|-----|
| Human Readable | ✅ | ✅ | ⚠️ | ⚠️ |
| Machine Readable | ⚠️ | ❌ | ✅ | ✅ |
| Styled/Formatted | ⚠️ | ✅ | ❌ | ❌ |
| Version Control Friendly | ✅ | ⚠️ | ✅ | ✅ |
| Spreadsheet Import | ❌ | ❌ | ⚠️ | ✅ |
| Email Attachment | ⚠️ | ✅ | ❌ | ⚠️ |
| API Integration | ❌ | ❌ | ✅ | ⚠️ |
| File Size | Small | Medium | Small | Smallest |

## Integration Examples

### CRM Integration (JSON)
```javascript
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('reports/company.json'));

// Push to CRM
await crm.opportunities.create({
  company: report.briefing.companyProfile.name,
  dealSize: report.briefing.qualification.dealSize,
  winProbability: report.briefing.qualification.winProbability,
  recommendation: report.briefing.recommendation
});
```

### Spreadsheet Analysis (CSV)
```bash
# Import multiple CSV reports into spreadsheet
cat reports/*.csv > consolidated_prospects.csv
```

### Web Dashboard (HTML)
```bash
# Copy HTML report to web server
cp reports/company.html /var/www/html/dashboards/
```

### Documentation (Markdown)
```bash
# Add to project documentation
cp reports/company.md docs/sales-briefings/
git add docs/sales-briefings/company.md
```

## Customization

The report generator can be customized by modifying `src/report-generator.ts`:

- Change styling in HTML reports (CSS section)
- Modify Markdown formatting
- Add custom metrics to JSON output
- Adjust CSV column structure

## Error Handling

The system handles report generation errors gracefully:

- Failed report generation shows warnings but doesn't stop execution
- Individual format failures don't affect other formats
- File system errors are caught and logged
- Reports directory is created automatically if missing

## Security Notes

- Reports may contain sensitive business information
- The `reports/` directory is gitignored by default
- Do not commit reports to version control
- Review reports before sharing externally
- Consider encrypting reports for sensitive prospects

## Report Validation

All reports include:
- Timestamp of generation
- Complete data structure validation (via Zod schemas)
- Proper character escaping (CSV)
- Valid HTML/Markdown syntax
- JSON schema compliance

---

Generated by Sales Intelligence System v1.0
