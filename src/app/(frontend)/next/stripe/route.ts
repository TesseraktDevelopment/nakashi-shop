import { getPayload } from "payload";
import Stripe from "stripe";

import { getCachedGlobal } from "@/utilities/getGlobals";
import config from "@payload-config";

export async function POST(req: Request) {
  try {
    console.log("Received Stripe webhook");

    const sig = req.headers.get("stripe-signature") ?? "";
    const { stripe: stripeOptions } = await getCachedGlobal("paywalls", "en", 1)();
    const secret = stripeOptions?.secret;
    const endpointSecret = stripeOptions?.webhookSecret ?? "";

    if (!secret || !endpointSecret) {
      console.error("Missing Stripe secret or webhook secret");
      return Response.json({ status: 400, message: "Missing Stripe configuration" });
    }

    const payload = await getPayload({ config });

    const rawBody = await req.text();

    const stripe = new Stripe(secret, {apiVersion: "2025-06-30.basil"});

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      console.log(`Webhook event received: ${event.type}`);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      if (error instanceof Error) {
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
      }
      return new Response("Webhook Error: Unknown error", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderID = session.metadata?.orderID;

        if (!orderID) {
          console.error("No orderID found in checkout.session.completed metadata");
          return Response.json({ status: 400, message: "Missing orderID in metadata" });
        }

        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

        if (!paymentIntentId) {
          console.error("No payment_intent ID found in checkout.session.completed");
          return Response.json({ status: 400, message: "Missing payment_intent ID" });
        }

        console.log(`Processing checkout.session.completed for orderID: ${orderID}`);

        try {
          await payload.update({
            collection: "orders",
            id: orderID,
            data: {
              orderDetails: {
                status: "paid",
                transactionID: session.payment_intent as string,
                amountPaid: (session.amount_total ?? 0) / 100,
              },
            },
          });
          console.log(`Order ${orderID} updated to paid with transactionID: ${paymentIntentId}`);
        } catch (updateError) {
          console.error(`Failed to update order ${orderID}:`, updateError);
          return Response.json({ status: 500, message: `Failed to update order ${orderID}` });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderID = paymentIntent.metadata?.orderID;

        if (!orderID) {
          console.error("No orderID found in payment_intent.succeeded metadata");
          return Response.json({ status: 400, message: "Missing orderID in metadata" });
        }

        console.log(`Processing payment_intent.succeeded for orderID: ${orderID}`);

        if (paymentIntent.status === "succeeded") {
          try {
            await payload.update({
              collection: "orders",
              id: orderID,
              data: {
                orderDetails: {
                  status: "paid",
                  transactionID: paymentIntent.id,
                  amountPaid: (paymentIntent.amount_received ?? 0) / 100,
                },
              },
            });
            console.log(`Order ${orderID} updated to paid with transactionID: ${paymentIntent.id}`);
          } catch (updateError) {
            console.error(`Failed to update order ${orderID}:`, updateError);
            return Response.json({ status: 500, message: `Failed to update order ${orderID}` });
          }
        }
        break;
      }

      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        const orderID = paymentIntent.metadata?.orderID;

        if (!orderID) {
          console.error(`No orderID found in ${event.type} metadata`);
          return Response.json({ status: 400, message: "Missing orderID in metadata" });
        }

        console.log(`Processing ${event.type} for orderID: ${orderID}`);

        try {
          await payload.update({
            collection: "orders",
            id: orderID,
            data: {
              orderDetails: {
                status: "unpaid",
                transactionID: paymentIntent.id,
              },
            },
          });
          console.log(`Order ${orderID} updated to unpaid with transactionID: ${paymentIntent.id}`);
        } catch (updateError) {
          console.error(`Failed to update order ${orderID}:`, updateError);
          return Response.json({ status: 500, message: `Failed to update order ${orderID}` });
        }
        break;
      }

      case "customer.deleted": {
        const customer = event.data.object;
        const customerId = customer.id;

        console.log(`Processing customer.deleted for customerId: ${customerId}`);

        try {
          await payload.update({
            collection: "customers",
            id: customerId,
            data: {
              stripeCustomerId: null,
            },
          });
          console.log(`Customer ${customerId} updated to remove Stripe ID`);
        } catch (updateError) {
          console.error(`Failed to update customer ${customerId}:`, updateError);
          return Response.json({ status: 500, message: `Failed to update customer ${customerId}` });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return Response.json({ status: 200, message: `Unhandled event type: ${event.type}` });
    }

    return Response.json({ status: 200, received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    if (error instanceof Error) {
      return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }
    return new Response("Webhook Error: Unknown error", { status: 400 });
  }
}
