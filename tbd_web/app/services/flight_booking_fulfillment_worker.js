'use strict';

const flightBookingPaymentIntent = require('./flight_booking_payment_intent');
const tboFlights = require('../third_party_api/tbo/tbo_flights');

const PAYMENT_ID_PLACEHOLDER = '__RZP_PAYMENT_ID__';
const ORDER_ID_PLACEHOLDER = '__RZP_ORDER_ID__';
const STEP_PNR_PREFIX = '__STEP_';
const STEP_BOOKING_ID_PREFIX = '__STEP_';

/** @type {Set<string>} */
const inFlightOrders = new Set();

/**
 * @param {unknown} v
 * @returns {Record<string, unknown>|Array<unknown>|string|number|null}
 */
function deepCloneJson(v) {
  return JSON.parse(JSON.stringify(v));
}

/**
 * Replace placeholder strings anywhere in JSON-like structures.
 * @param {unknown} node
 * @param {Record<string, string>} replacements
 */
function replacePlaceholders(node, replacements) {
  if (node == null) {
    return node;
  }
  if (typeof node === 'string') {
    let s = node;
    for (const [k, val] of Object.entries(replacements)) {
      if (s.includes(k)) {
        s = s.split(k).join(val);
      }
    }
    return s;
  }
  if (Array.isArray(node)) {
    return node.map((x) => replacePlaceholders(x, replacements));
  }
  if (typeof node === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = replacePlaceholders(v, replacements);
    }
    return out;
  }
  return node;
}

/**
 * @param {unknown} result tbo_flights return shape { status, object }
 * @returns {{ pnr: string|null, bookingId: string|null }}
 */
function extractPnrAndBookingIdFromBook(result) {
  try {
    const obj = result && result.object;
    const resp = obj && obj.Response;
    const inner = resp && resp.Response;
    if (!inner || typeof inner !== 'object') {
      return { pnr: null, bookingId: null };
    }
    const pnr =
      inner.PNR != null
        ? String(inner.PNR)
        : inner.pnr != null
          ? String(inner.pnr)
          : null;
    const bookingId =
      inner.BookingId != null
        ? String(inner.BookingId)
        : inner.bookingId != null
          ? String(inner.bookingId)
          : null;
    return { pnr, bookingId };
  } catch (_) {
    return { pnr: null, bookingId: null };
  }
}

/**
 * @param {unknown} result
 * @returns {{ pnr: string|null, bookingId: string|null }}
 */
function extractPnrAndBookingIdFromTicketing(result) {
  try {
    const obj = result && result.object;
    const resp = obj && obj.Response;
    const inner = resp && resp.Response;
    if (!inner || typeof inner !== 'object') {
      return { pnr: null, bookingId: null };
    }
    const fi = inner.FlightItinerary || inner.flightItinerary;
    const pnr =
      inner.PNR != null
        ? String(inner.PNR)
        : fi && fi.PNR != null
          ? String(fi.PNR)
          : null;
    const bookingId =
      inner.BookingId != null
        ? String(inner.BookingId)
        : fi && fi.BookingId != null
          ? String(fi.BookingId)
          : null;
    return { pnr, bookingId };
  } catch (_) {
    return { pnr: null, bookingId: null };
  }
}

/**
 * @param {unknown} result
 * @returns {boolean}
 */
function isTboSuccessEnvelope(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }
  // eslint-disable-next-line dot-notation
  if (result['status'] !== 'success') {
    return false;
  }
  const obj = result.object;
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const resp = obj.Response;
  if (!resp || typeof resp !== 'object') {
    return false;
  }
  const err = resp.Error;
  if (err && typeof err === 'object') {
    const code = err.ErrorCode;
    if (code != null && Number(code) !== 0) {
      return false;
    }
  }
  const rs = resp.ResponseStatus;
  if (rs != null && Number(rs) !== 1) {
    return false;
  }
  return true;
}

/**
 * Run queued TBO steps from snapshot_json (version 2).
 * @param {{ orderId: string, paymentId: string }} params
 */
async function runFlightBookingFulfillment({ orderId, paymentId }) {
  if (inFlightOrders.has(orderId)) {
    return;
  }
  inFlightOrders.add(orderId);
  try {
    const row = await flightBookingPaymentIntent.getIntentRowByOrderId({
      orderId,
    });
    if (!row) {
      return;
    }

    let snapshot;
    try {
      snapshot = JSON.parse(row.snapshot_json || '{}');
    } catch (e) {
      await flightBookingPaymentIntent.markServerFulfillmentFinished({
        orderId,
        status: 'failed',
        error: `invalid snapshot_json: ${e.message}`,
        resultJson: null,
      });
      return;
    }

    if (snapshot.version !== 2 || snapshot.fulfillmentMode !== 'server') {
      await flightBookingPaymentIntent.markServerFulfillmentFinished({
        orderId,
        status: 'skipped',
        error: null,
        resultJson: null,
      });
      return;
    }

    const already = row.server_fulfillment_status;
    if (
      already === 'succeeded' ||
      already === 'processing' ||
      already === 'skipped'
    ) {
      return;
    }

    await flightBookingPaymentIntent.markServerFulfillmentStarted({
      orderId,
    });

    const plainUserId = String(row.plain_user_id || '0');
    const operations = Array.isArray(snapshot.operations)
      ? snapshot.operations
      : [];

    if (operations.length === 0) {
      await flightBookingPaymentIntent.markServerFulfillmentFinished({
        orderId,
        status: 'failed',
        error: 'snapshot.operations is empty',
        resultJson: null,
      });
      return;
    }

    /** @type {{ pnr: string|null, bookingId: string|null }[]} */
    const stepMeta = [];

    for (let i = 0; i < operations.length; i += 1) {
      const op = operations[i];
      const type = op && op.type;
      /** @type {Record<string, unknown>} */
      const rawPayload =
        op && op.payload && typeof op.payload === 'object'
          ? /** @type {Record<string, unknown>} */ (op.payload)
          : {};

      const stepRepl = {};
      for (let s = 0; s < stepMeta.length; s += 1) {
        const meta = stepMeta[s];
        if (meta.pnr) {
          stepRepl[`${STEP_PNR_PREFIX}${s}_PNR__`] = meta.pnr;
        }
        if (meta.bookingId) {
          stepRepl[`${STEP_BOOKING_ID_PREFIX}${s}_BOOKING_ID__`] =
            meta.bookingId;
        }
      }
      const payRepl = {
        [PAYMENT_ID_PLACEHOLDER]: paymentId,
        [ORDER_ID_PLACEHOLDER]: orderId,
        ...stepRepl,
      };

      const payload = /** @type {Record<string, unknown>} */ (
        replacePlaceholders(deepCloneJson(rawPayload), payRepl)
      );

      payload.plainUserId = plainUserId;
      payload.paymentId = paymentId;
      payload.orderId = orderId;

      let result;
      if (type === 'bookFlight') {
        result = await tboFlights.bookFlight(payload);
      } else if (type === 'flightTicketing') {
        result = await tboFlights.flightTicketing(payload);
      } else {
        await flightBookingPaymentIntent.markServerFulfillmentFinished({
          orderId,
          status: 'failed',
          error: `unknown operation type: ${type}`,
          resultJson: null,
        });
        return;
      }

      if (!isTboSuccessEnvelope(result)) {
        const msg =
          (result && result.message) ||
          (result && result.errorMessage) ||
          'TBO call failed';
        await flightBookingPaymentIntent.markServerFulfillmentFinished({
          orderId,
          status: 'failed',
          error: String(msg),
          resultJson: JSON.stringify({ failedStep: i, type }),
        });
        return;
      }

      if (type === 'bookFlight') {
        stepMeta.push(extractPnrAndBookingIdFromBook(result));
      } else {
        stepMeta.push(extractPnrAndBookingIdFromTicketing(result));
      }
    }

    const lastTicketingIdx = [...operations.keys()]
      .reverse()
      .find((idx) => operations[idx].type === 'flightTicketing');
    const lastBookIdx = [...operations.keys()]
      .reverse()
      .find((idx) => operations[idx].type === 'bookFlight');

    const tickIdx =
      lastTicketingIdx != null ? lastTicketingIdx : lastBookIdx ?? 0;
    const meta = stepMeta[tickIdx] || stepMeta[stepMeta.length - 1] || {};
    const clientBookingResponse = {
      success: true,
      message: 'Flight booked and ticketed successfully',
      pnr: meta.pnr,
      booking_id: meta.bookingId,
    };

    await flightBookingPaymentIntent.markServerFulfillmentFinished({
      orderId,
      status: 'succeeded',
      error: null,
      resultJson: JSON.stringify({ client_booking_response: clientBookingResponse }),
    });
  } catch (err) {
    await flightBookingPaymentIntent.markServerFulfillmentFinished({
      orderId,
      status: 'failed',
      error: err.message || String(err),
      resultJson: null,
    });
  } finally {
    inFlightOrders.delete(orderId);
  }
}

/**
 * Non-blocking enqueue (same process).
 * @param {{ orderId: string, paymentId: string }} params
 */
function enqueueFlightBookingFulfillment(params) {
  setImmediate(() => {
    runFlightBookingFulfillment(params).catch((e) => {
      console.error('flight fulfillment worker error', e);
    });
  });
}

module.exports = {
  enqueueFlightBookingFulfillment,
  runFlightBookingFulfillment,
};
