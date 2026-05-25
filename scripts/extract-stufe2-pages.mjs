/**
 * Extract Power BI page hex identifiers from both Stufe 2 reports.
 * Uses CDP to intercept the modelsAndExploration API response and
 * extract all section objectNames (= pageName URL param values).
 *
 * Usage: node scripts/extract-stufe2-pages.mjs
 */
import puppeteer from 'puppeteer';

const REPORTS = [
  {
    label: 'NATIVE',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiOWExYzdiZDYtN2Y0ZC00MWJhLWI5ZTQtOTMxODc5Zjk2ZDg3IiwidCI6IjY2ODRlOGQ2LWFlMDItNDk2OS1hZjZiLTcyZDU4MzNjZmQ3OSJ9',
  },
  {
    label: 'IBCS',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiNGI4ZGU0OGEtMTA4NS00OWIxLWFmMWYtOTlhZTdlMzg1MTVmIiwidCI6IjY2ODRlOGQ2LWFlMDItNDk2OS1hZjZiLTcyZDU4MzNjZmQ3OSJ9',
  },
];

async function extractPages(browser, reportUrl, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');

  const targetRequests = [];
  const responseBodies = new Map();

  cdp.on('Network.responseReceived', (params) => {
    const url = params.response.url;
    if (url.includes('modelsAndExploration') || url.includes('public/reports/')) {
      targetRequests.push({ requestId: params.requestId, url });
    }
  });

  cdp.on('Network.loadingFinished', async (params) => {
    const target = targetRequests.find((t) => t.requestId === params.requestId);
    if (target) {
      try {
        const { body, base64Encoded } = await cdp.send('Network.getResponseBody', {
          requestId: params.requestId,
        });
        const text = base64Encoded ? Buffer.from(body, 'base64').toString() : body;
        responseBodies.set(target.url, text);
      } catch (e) {
        // Silently skip if body not available
      }
    }
  });

  console.log(`\n[${ label }] Navigating to report...`);
  await page.goto(reportUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 5000));

  console.log(`[${label}] Captured ${responseBodies.size} response bodies.`);

  let sections = null;
  for (const [, body] of responseBodies.entries()) {
    try {
      const json = JSON.parse(body);
      const s = json?.exploration?.sections || json?.exploration?.report?.sections;
      if (s && Array.isArray(s) && s.length > 0) {
        sections = s;
        break;
      }
    } catch {}
  }

  if (!sections) {
    console.error(`[${label}] ERROR: Could not find sections.`);
    // Dump keys for debugging
    for (const [url, body] of responseBodies.entries()) {
      try {
        const json = JSON.parse(body);
        console.log(`  ${url.substring(0, 80)}: top keys = ${Object.keys(json).join(', ')}`);
        if (json.exploration) {
          console.log(`    exploration keys = ${Object.keys(json.exploration).join(', ')}`);
        }
      } catch {}
    }
    await page.close();
    return [];
  }

  const pages = sections.map((s) => ({
    objectName: s.objectName || 'N/A',
    displayName: s.displayName || '(unnamed)',
  }));

  console.log(`[${label}] Found ${pages.length} pages:\n`);
  console.log('  objectName (pageName)        | displayName');
  console.log('  -----------------------------|------------------');
  for (const p of pages) {
    console.log(`  ${p.objectName.padEnd(30)}| ${p.displayName}`);
  }

  await page.close();
  return pages;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const results = {};
  for (const report of REPORTS) {
    results[report.label] = await extractPages(browser, report.url, report.label);
  }

  // Summary for copy-paste
  console.log('\n\n========================================');
  console.log('  SUMMARY: env vars for .env.local');
  console.log('========================================\n');

  for (const [label, pages] of Object.entries(results)) {
    console.log(`# ${label} report pages:`);
    for (const p of pages) {
      console.log(`#   ${p.objectName} = ${p.displayName}`);
    }
    console.log();
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
