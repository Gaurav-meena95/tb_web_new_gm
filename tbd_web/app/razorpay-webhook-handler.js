'use strict';

const razorPayHelper = require('./razorpay-helper');
const flightBookingPaymentIntent = require('./services/flight_booking_payment_intent');
const flightBookingFulfillmentWorker = require(
  './services/flight_booking_fulfillment_worker',
);
const pointsRedemption = require('./referral/commands/points_redemption');

/**
 * Razorpay webhook entrypoint. Uses raw body for HMAC verification.
 * Configure URL in Razorpay Dashboard → Webhooks (payment.captured).
 */
async function handle(req, res) {
  try {
    const signature = req.get('X-Razorpay-Signature');
	  const raw = req.body;
	  console.log('raw', raw);
	  console.log('signature', signature);
    if (!razorPayHelper.verifyWebhookSignature(raw, signature)) {
      console.warn('Razorpay webhook: invalid signature');
      return res.status(400).send('invalid signature');
    }

    let event;
    try {
      event = JSON.parse(raw.toString('utf8'));
    } catch (e) {
      console.warn('Razorpay webhook: invalid JSON', e.message);
      return res.status(400).send('invalid json');
    }

    const eventName = event.event;
    const eventId = event.id || null;

    if (eventName === 'payment.captured') {
      const paymentEntity =
        event.payload &&
        event.payload.payment &&
        event.payload.payment.entity;
      if (!paymentEntity) {
        console.warn('Razorpay webhook: payment.captured missing entity');
        return res.status(200).json({ ok: true, ignored: true });
      }

      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const status = paymentEntity.status;

      if (status !== 'captured' || !orderId || !paymentId) {
        console.log(
          'Razorpay webhook: skip payment.captured — status or ids missing',
          { status, orderId, paymentId },
        );
        return res.status(200).json({ ok: true, ignored: true });
      }

      let excerpt;
      try {
        excerpt = JSON.stringify({
          event: eventName,
          paymentId,
          orderId,
        });
      } catch (_) {
        excerpt = null;
      }

      const result = await flightBookingPaymentIntent.markPaymentCaptured({
        orderId,
        paymentId,
        webhookEventId: eventId,
        payloadExcerpt: excerpt,
      });
      flightBookingFulfillmentWorker.enqueueFlightBookingFulfillment({
        orderId,
        paymentId,
      });

      // Settle any wallet-points hold attached to this order (Premium / Flights /
      // Hotels alike). Idempotent and a no-op for orders that used no points.
      try {
        const settled = await pointsRedemption.settleHold(orderId);
        if (settled) {
          console.log('Razorpay webhook: points hold settled', settled);
        }
      } catch (e) {
        console.error('Razorpay webhook: points settle failed', e);
      }
      console.log(
        'Razorpay webhook: payment.captured processed',
        { orderId, paymentId, meta: result },
      );
      return res.status(200).json({ ok: true, orderId, paymentId });
    }

    // Acknowledge other events so Razorpay does not disable the endpoint.
    return res.status(200).json({ ok: true, ignoredEvent: eventName });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    return res.status(500).send('internal error');
  }
}

module.exports = { handle };
