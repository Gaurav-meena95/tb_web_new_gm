/**
 * Manual test script for razorpay-helper.js dynamic pricing changes.
 * Run with: node app/test_pricing.js
 *
 * Tests all logic WITHOUT hitting the real exchange rate API by
 * monkey-patching global.fetch with a mock that returns fixed rates.
 */

"use strict";

// ── Mock exchange rate fetch (INR base → target) ────────────────────────────
const MOCK_RATES = {
    usd: 0.01176,
    eur: 0.01087,
    jpy: 1.77,
    kwd: 0.003609,
    gbp: 0.00935,
    brl: 0.0588,  // unsupported by Razorpay — should fall back to USD
    inr: 1,
};

global.fetch = async () => ({
    json: async () => ({ inr: MOCK_RATES }),
});

const helper = require('./razorpay-helper');

// ── Test helpers ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label, extra = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}${extra ? ' — ' + extra : ''}`);
        failed++;
    }
}

// ── Test suite ───────────────────────────────────────────────────────────────

async function runTests() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  razorpay-helper.js pricing tests');
    console.log('═══════════════════════════════════════════════════\n');

    // ── 1. INR prices ────────────────────────────────────────────────────────
    console.log('1. INR plan prices (hardcoded, no network call)');
    const inrResult = await helper.getPlanPrices('INR');
    const { prices: inr, resolvedCurrency: inrCode, resolvedSymbol: inrSym } = inrResult;

    assert(inrCode === 'INR',       'resolvedCurrency = "INR"');
    assert(inrSym  === '₹',         'resolvedSymbol = "₹"');
    assert(inr.month.amount   === 49900,  'month INR = ₹499 (49900 paise)');
    assert(inr.month.display  === '499',  'month INR display = "499"');
    assert(inr.yearBase.amount === 99900, 'year base INR = ₹999');
    assert(inr.yearBuddy100.amount === 89900, 'year BUDDY100 INR = ₹899');
    assert(inr.yearBuddy200.amount === 79900, 'year BUDDY200 INR = ₹799');
    assert(inr.eliteBase.amount  === 299900, 'elite base INR = ₹2999');
    assert(inr.eliteBuddy100.amount === 289900, 'elite BUDDY100 INR = ₹2899');
    assert(inr.eliteBuddy200.amount === 279900, 'elite BUDDY200 INR = ₹2799');
    assert(inr.eliteSpecial500.amount === 249900, 'elite SPECIAL500 INR = ₹2499');

    // ── 2. USD prices ────────────────────────────────────────────────────────
    console.log('\n2. USD plan prices (50% markup, 2-decimal)');
    const usdResult = await helper.getPlanPrices('USD');
    const { prices: usd, resolvedCurrency: usdCode, resolvedSymbol: usdSym } = usdResult;

    assert(usdCode === 'USD', 'resolvedCurrency = "USD"');
    assert(usdSym  === '$',   'resolvedSymbol = "$"');

    const MARKUP  = 1.5;
    const usdRate = MOCK_RATES.usd;
    const expectedMonthUsd  = Math.round(499  * usdRate * MARKUP * 100);
    const expectedYearUsd   = Math.round(999  * usdRate * MARKUP * 100);
    const expectedEliteUsd  = Math.round(2999 * usdRate * MARKUP * 100);

    assert(usd.month.amount    === expectedMonthUsd,  `month USD = ${expectedMonthUsd}¢`, `got ${usd.month.amount}`);
    assert(usd.yearBase.amount === expectedYearUsd,   `year base USD = ${expectedYearUsd}¢`, `got ${usd.yearBase.amount}`);
    assert(usd.eliteBase.amount === expectedEliteUsd, `elite base USD = ${expectedEliteUsd}¢`, `got ${usd.eliteBase.amount}`);

    const monthDisplayNum = parseFloat(usd.month.display);
    assert(!isNaN(monthDisplayNum) && monthDisplayNum > 0, `month USD display is a positive number: "${usd.month.display}"`);
    assert(Math.abs(Math.round(monthDisplayNum * 100) - usd.month.amount) <= 1,
        'month USD display × 100 matches amount');

    assert(usd.yearBuddy100.amount < usd.yearBase.amount,      'year BUDDY100 < base');
    assert(usd.yearBuddy200.amount < usd.yearBuddy100.amount,  'year BUDDY200 < BUDDY100');
    assert(usd.eliteBuddy100.amount < usd.eliteBase.amount,    'elite BUDDY100 < base');
    assert(usd.eliteSpecial500.amount < usd.eliteBuddy100.amount, 'elite SPECIAL500 < BUDDY100');

    // ── 3. EUR ───────────────────────────────────────────────────────────────
    console.log('\n3. EUR — supported currency, own rate');
    const eurResult = await helper.getPlanPrices('EUR');
    const { prices: eur, resolvedCurrency: eurCode, resolvedSymbol: eurSym } = eurResult;

    assert(eurCode === 'EUR', 'resolvedCurrency = "EUR"');
    assert(eurSym  === '€',   'resolvedSymbol = "€"');
    assert(eur.month.amount !== usd.month.amount, `EUR amount (${eur.month.amount}) ≠ USD amount — uses own rate`);

    // ── 4. JPY — zero-decimal ────────────────────────────────────────────────
    console.log('\n4. JPY — zero-decimal currency (no ×100)');
    const jpyResult = await helper.getPlanPrices('JPY');
    const { prices: jpy, resolvedCurrency: jpyCode, resolvedSymbol: jpySym } = jpyResult;

    assert(jpyCode === 'JPY', 'resolvedCurrency = "JPY"');
    assert(jpySym  === '¥',   'resolvedSymbol = "¥"');
    const expectedMonthJpy = Math.round(499 * MOCK_RATES.jpy * MARKUP);
    assert(jpy.month.amount === expectedMonthJpy,
        `month JPY = ${expectedMonthJpy} (no ×100)`, `got ${jpy.month.amount}`);
    assert(!jpy.month.display.includes('.'), `JPY display has no decimal: "${jpy.month.display}"`);

    // ── 5. KWD — not in Razorpay supported list → fallback to USD ───────────
    console.log('\n5. KWD — unsupported by Razorpay → fallback to USD');
    const kwdResult = await helper.getPlanPrices('KWD');
    const { prices: kwd, resolvedCurrency: kwdCode } = kwdResult;
    assert(kwdCode === 'USD',
        `KWD resolves to USD (not in supported list)`, `got "${kwdCode}"`);
    assert(kwd.month.amount === usd.month.amount,
        `KWD month amount equals USD fallback amount`, `got ${kwd.month.amount}`);

    // ── 6. BRL — unsupported → falls back to USD ─────────────────────────────
    console.log('\n6. BRL — unsupported → fallback to USD');
    const brlResult = await helper.getPlanPrices('BRL');
    const { prices: brl, resolvedCurrency: brlCode, resolvedSymbol: brlSym } = brlResult;

    assert(brlCode === 'USD', `BRL resolvedCurrency = "USD" (fallback), got "${brlCode}"`);
    assert(brlSym  === '$',   'BRL resolvedSymbol = "$"');
    assert(brl.month.amount === usd.month.amount,
        `BRL month amount equals USD amount (same fallback rate)`);

    // ── 7. Lowercase / mixed case ────────────────────────────────────────────
    console.log('\n7. Case-insensitive currencyCode');
    const usdLower = await helper.getPlanPrices('usd');
    const usdMixed = await helper.getPlanPrices('Usd');
    assert(usdLower.prices.month.amount === usd.month.amount, '"usd" same as "USD"');
    assert(usdMixed.prices.month.amount === usd.month.amount, '"Usd" same as "USD"');
    assert(usdLower.resolvedCurrency === 'USD', '"usd" resolvedCurrency = "USD"');

    // ── 8. Unknown currency (e.g. blank) → fallback to USD ──────────────────
    console.log('\n8. Empty/unknown currency → fallback to USD');
    const unknownResult = await helper.getPlanPrices('ZWD');
    assert(unknownResult.resolvedCurrency === 'USD', 'ZWD resolves to USD');

    // ── 9. INR coupon parity ─────────────────────────────────────────────────
    console.log('\n9. INR coupon parity unchanged');
    assert(inr.yearBase.amount - inr.yearBuddy100.amount === 10000,  'BUDDY100 saves ₹100 on year');
    assert(inr.yearBase.amount - inr.yearBuddy200.amount === 20000,  'BUDDY200 saves ₹200 on year');
    assert(inr.eliteBase.amount - inr.eliteBuddy100.amount === 10000,'BUDDY100 saves ₹100 on elite');
    assert(inr.eliteBase.amount - inr.eliteSpecial500.amount === 50000,'SPECIAL500 saves ₹500 on elite');

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

runTests().catch(e => {
    console.error('\n💥 Unexpected error:', e);
    process.exit(1);
});
