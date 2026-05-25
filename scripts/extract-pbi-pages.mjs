/**
 * Extract Power BI page hex identifiers from Publish-to-Web report.
 * Uses CDP to intercept network responses reliably.
 */
import puppeteer from 'puppeteer';

const REPORT_URL =
  'https://app.powerbi.com/view?r=eyJrIjoiNzMyOTgxZmYtYmUzOC00MzBlLThlNWYtMzVlNTRjMDhkODFkIiwidCI6IjY2ODRlOGQ2LWFlMDItNDk2OS1hZjZiLTcyZDU4MzNjZmQ3OSJ9';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Use CDP session for reliable response body capture
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');

  const responseBodies = new Map();
  const targetUrls = [];

  cdp.on('Network.responseReceived', (params) => {
    const url = params.response.url;
    if (url.includes('modelsAndExploration') || url.includes('public/reports/')) {
      targetUrls.push({ requestId: params.requestId, url });
    }
  });

  cdp.on('Network.loadingFinished', async (params) => {
    const target = targetUrls.find(t => t.requestId === params.requestId);
    if (target) {
      try {
        const { body, base64Encoded } = await cdp.send('Network.getResponseBody', {
          requestId: params.requestId,
        });
        const text = base64Encoded ? Buffer.from(body, 'base64').toString() : body;
        responseBodies.set(target.url, text);
      } catch (e) {
        console.log(`Could not get body for ${target.url.substring(0, 80)}: ${e.message}`);
      }
    }
  });

  console.log('Navigating to Power BI report...');
  await page.goto(REPORT_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 5000));

  console.log(`\nCaptured ${responseBodies.size} response bodies.\n`);

  let sectionsFound = null;

  for (const [url, body] of responseBodies.entries()) {
    console.log(`Checking: ${url.substring(0, 100)}... (${body.length} chars)`);
    try {
      const json = JSON.parse(body);
      const sections = json?.exploration?.sections || json?.exploration?.report?.sections;
      if (sections && Array.isArray(sections) && sections.length > 10) {
        sectionsFound = sections;
        console.log(`  → Found ${sections.length} sections!`);
        break;
      }
    } catch {}
  }

  if (!sectionsFound) {
    console.error('\nERROR: Could not find sections. Dumping response keys...');
    for (const [url, body] of responseBodies.entries()) {
      try {
        const json = JSON.parse(body);
        console.log(`  ${url.substring(0, 80)}: top keys = ${Object.keys(json).join(', ')}`);
        if (json.exploration) {
          console.log(`    exploration keys = ${Object.keys(json.exploration).join(', ')}`);
          if (json.exploration.report) {
            console.log(`    report keys = ${Object.keys(json.exploration.report).join(', ')}`);
          }
        }
      } catch {
        console.log(`  ${url.substring(0, 80)}: not JSON (${body.length} chars)`);
      }
    }
    await browser.close();
    process.exit(1);
  }

  // Filter P pages
  const pPages = sectionsFound
    .filter(s => s.displayName && /^P\d/.test(s.displayName))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { numeric: true }));

  console.log('\nobjectName (pageName)    | displayName');
  console.log('-------------------------|------------------');
  for (const p of pPages) {
    console.log(`${(p.objectName || 'N/A').padEnd(25)}| ${p.displayName}`);
  }

  console.log('\n\n=== UPDATE pairs.ts WITH THESE VALUES ===\n');
  for (let i = 1; i <= 8; i++) {
    const nativ = pPages.find(p => p.displayName === `P${i} Nativ`);
    const ibcs = pPages.find(p => p.displayName === `P${i} IBCS`);
    if (nativ && ibcs) {
      console.log(`  // P${i}`);
      console.log(`  nativePageName: '${nativ.objectName}',  // ${nativ.displayName}`);
      console.log(`  ibcsPageName:   '${ibcs.objectName}',  // ${ibcs.displayName}`);
      console.log();
    } else {
      console.log(`  // P${i} — MISSING: nativ=${nativ?.objectName || 'N/A'}, ibcs=${ibcs?.objectName || 'N/A'}`);
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
