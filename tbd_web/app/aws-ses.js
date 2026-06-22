'use strict';

require('dotenv').config();

const fs = require('fs');
const { readFileSync } = require('fs');
const { join } = require('path');
const nodemailer = require('nodemailer');
const csv = require('csv-parser');

const PROMO_HTML_PATH = join(__dirname, './sub-prom.html');
const DEFAULT_FROM = 'Neha <noreply@neha.beatravelbuddy.com>';
const DEFAULT_SUBJECT = 'We Saved Something Special For You ✈️';
const BATCH_SIZE = 10;
const DELAY_MS_BETWEEN_BATCHES = 1000;
const DEFAULT_EMAIL_COLUMN = 'user_email';

const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com',
  port: Number(process.env.AWS_SES_SMTP_PORT || 587),
  auth: {
    user: process.env.AWS_SES_SMTP_USER,
    pass: process.env.AWS_SES_SMTP_PASS,
  },
});

let promoHtmlCache = null;

function getPromoHtml() {
  if (!promoHtmlCache) {
    promoHtmlCache = readFileSync(PROMO_HTML_PATH, 'utf8');
  }
  return promoHtmlCache;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function normalizeEmail(rawEmail) {
  if (!rawEmail) return null;
  const email = String(rawEmail).trim().toLowerCase();
  if (!email.includes('@')) return null;
  return email;
}

/** Read emails from one CSV (same `user_email` column as send-email.js). */
function getEmailsFromCSV(filePath, emailColumn = DEFAULT_EMAIL_COLUMN) {
  return new Promise((resolve, reject) => {
    const emails = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const raw = row[emailColumn] ?? row.user_email ?? row.email;
        const normalized = normalizeEmail(raw);
        if (normalized) emails.push(normalized);
      })
      .on('end', () => {
        console.log(`CSV processed: ${filePath} (${emails.length} rows with email)`);
        resolve(emails);
      })
      .on('error', (error) => {
        console.error(`Error reading CSV: ${filePath}`, error);
        reject(error);
      });
  });
}

/** Merge multiple CSVs and dedupe (same pattern as send-email.js). */
async function getEmailsFromCsvFiles(csvFilePaths, emailColumn = DEFAULT_EMAIL_COLUMN) {
  const allEmails = [];
  const uniqueEmails = new Set();

  for (const csvFilePath of csvFilePaths) {
    const fileEmails = await getEmailsFromCSV(csvFilePath, emailColumn);
    for (const email of fileEmails) {
      if (uniqueEmails.has(email)) continue;
      uniqueEmails.add(email);
      allEmails.push(email);
    }
  }

  return allEmails;
}

async function sendPromoEmail(to) {
  await transporter.sendMail({
    from: process.env.AWS_SES_FROM || DEFAULT_FROM,
    to,
    subject: process.env.AWS_SES_SUBJECT || DEFAULT_SUBJECT,
    html: getPromoHtml(),
  });
}

/**
 * Send promo emails from CSV in batches of 10, waiting 1s between batches.
 * @param {object} options
 * @param {string[]} options.csvFilePaths - One or more CSV paths
 * @param {string} [options.emailColumn='user_email'] - CSV column for recipient
 * @param {boolean} [options.dryRun=false] - Log only, do not send
 * @param {number} [options.limit] - Max recipients (for testing)
 */
async function sendPromoBatchFromCsv(options = {}) {
  const {
    csvFilePaths,
    emailColumn = DEFAULT_EMAIL_COLUMN,
    dryRun = false,
    limit,
  } = options;

  if (!process.env.AWS_SES_SMTP_USER || !process.env.AWS_SES_SMTP_PASS) {
    throw new Error(
      'Set AWS_SES_SMTP_USER and AWS_SES_SMTP_PASS in .env before sending.',
    );
  }

  if (!Array.isArray(csvFilePaths) || csvFilePaths.length === 0) {
    throw new Error('csvFilePaths is required and must be a non-empty array');
  }

  let emails = await getEmailsFromCsvFiles(csvFilePaths, emailColumn);
  if (typeof limit === 'number' && limit > 0) {
    emails = emails.slice(0, limit);
  }

  if (emails.length === 0) {
    throw new Error('No valid recipients found in CSV file(s)');
  }

  const batches = chunkArray(emails, BATCH_SIZE);
  const result = {
    totalRecipients: emails.length,
    totalBatches: batches.length,
    batchSize: BATCH_SIZE,
    delayMsBetweenBatches: DELAY_MS_BETWEEN_BATCHES,
    sentCount: 0,
    failed: [],
  };

  console.log(
    `Starting promo send: ${emails.length} recipients, ` +
      `${batches.length} batch(es), ${BATCH_SIZE} per batch, ${DELAY_MS_BETWEEN_BATCHES}ms pause` +
      (dryRun ? ' [DRY RUN]' : ''),
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchNum = batchIndex + 1;

    for (const email of batch) {
      if (dryRun) {
        console.log(`[DRY RUN] Would send to: ${email}`);
        result.sentCount += 1;
        continue;
      }

      try {
        await sendPromoEmail(email);
        result.sentCount += 1;
        console.log(`Sent (${result.sentCount}/${emails.length}): ${email}`);
      } catch (error) {
        result.failed.push({ email, error: error.message || String(error) });
        console.error(`Failed: ${email}`, error.message || error);
      }
    }

    console.log(
      `Batch ${batchNum}/${batches.length} done (${batch.length} in this batch)`,
    );

    if (batchIndex < batches.length - 1) {
      console.log(
        `Rate limit: waiting ${DELAY_MS_BETWEEN_BATCHES / 1000}s before next batch…`,
      );
      await wait(DELAY_MS_BETWEEN_BATCHES);
    }
  }

  console.log('Finished.', result);
  return result;
}

module.exports = {
  sendPromoEmail,
  sendPromoBatchFromCsv,
  getEmailsFromCSV,
  getEmailsFromCsvFiles,
  BATCH_SIZE,
  DELAY_MS_BETWEEN_BATCHES,
};

// Run directly: node app/aws-ses.js /path/to/file.csv [--dry-run] [--limit=5]
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const csvPaths = args.filter((a) => !a.startsWith('--'));

  if (csvPaths.length === 0) {
    console.error(
      'Usage: node app/aws-ses.js <csv-path> [more-csv-paths...] [--dry-run] [--limit=N]',
    );
    console.error(
      'Example: node app/aws-ses.js /Users/you/recipients.csv --dry-run',
    );
    process.exit(1);
  }

  sendPromoBatchFromCsv({ csvFilePaths: csvPaths, dryRun, limit })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

/*
 * Programmatic usage (same CSV column as send-email.js):
 *
 * const { sendPromoBatchFromCsv } = require('./aws-ses');
 *
 * await sendPromoBatchFromCsv({
 *   csvFilePaths: ['/Users/guunszz/Downloads/mon-email-match.csv'],
 *   dryRun: true,
 *   limit: 5,
 * });
 */
