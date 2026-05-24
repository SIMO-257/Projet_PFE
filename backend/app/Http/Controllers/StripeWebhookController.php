<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessStripeWebhookJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhooks.
     *
     * Verifies the signature, deduplicates, then dispatches a queued job
     * so we can return 200 immediately and process asynchronously.
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe Webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        // Idempotency — skip if this event was already recorded
        $alreadyProcessed = DB::table('processed_stripe_events')
            ->where('event_id', $event->id)
            ->exists();

        if ($alreadyProcessed) {
            return response()->json(['message' => 'Event already processed'], 200);
        }

        // Pre-insert the event ID to guarantee idempotency even if the job is delayed
        DB::table('processed_stripe_events')->insert([
            'event_id'    => $event->id,
            'created_at'  => now(),
        ]);

        // Dispatch the job — processing happens asynchronously
        ProcessStripeWebhookJob::dispatch(
            eventId: $event->id,
            eventType: $event->type,
            eventData: json_decode(json_encode($event->data->object), true),
        );

        Log::info('Stripe Webhook: dispatched job', [
            'event_id' => $event->id,
            'type'     => $event->type,
        ]);

        return response()->json(['message' => 'Accepted'], 200);
    }
}
