import { getPayload } from "payload";
import Stripe from "stripe";

import { type Locale } from "@/i18n/config";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Currency } from "@/stores/Currency/types";
import { getCustomer } from "@/utilities/getCustomer";
import config from "@payload-config";

import { type FilledProduct } from "../getFilledProducts";

type Customer = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  stripeCustomerId?: string | null;
};

export const getStripePaymentURL = async ({
  filledProducts,
  shippingCost,
  pickupPointID,
  pickupPointName,
  pickupPointBranchCode,
  pickupPointAddress,
  shippingLabel,
  currency,
  locale,
  apiKey,
  orderID,
  orderSecret,
  checkoutData,
}: {
  filledProducts: FilledProduct[];
  shippingCost: number;
  pickupPointAddress?: string;
  pickupPointID?: string;
  pickupPointName?: string;
  pickupPointBranchCode?: string;
  shippingLabel: string;
  currency: Currency;
  locale: Locale;
  apiKey: string;
  orderID: string;
  orderSecret: string;
  checkoutData: CheckoutFormData;
}) => {
  const stripe = new Stripe(apiKey, { apiVersion: "2025-07-30.basil" });

  // Log product details for debugging
  console.log("Filled products:", JSON.stringify(filledProducts, null, 2));

  const stripeMappedProducts: Stripe.Checkout.SessionCreateParams.LineItem[] = filledProducts.map((product) => {
    let productPrice: number | undefined;

    // Try to get price from variant or product pricing
    if (product.enableVariantPrices && product.variant?.pricing) {
      productPrice = product.variant.pricing.find((price) => price.currency === currency)?.value;
    } else if (product.pricing) {
      productPrice = product.pricing.find((price) => price.currency === currency)?.value;
    }

    // Fallback: Use a default price or throw an error
    if (!productPrice) {
      console.error(
        `Product price not found for product: ${product.id}, title: ${product.title}, currency: ${currency}, variant: ${product.enableVariantPrices ? product.variant?.variantSlug ?? "none" : "none"}`,
      );
      throw new Error(`Product price not found for product: ${product.id}, title: ${product.title}`);
    }

    if (!product.title) {
      console.error(`Product title missing for product: ${product.id}`);
      throw new Error(`Product title missing for product: ${product.id}`);
    }

    const descriptionArray = [
      product.enableVariants && product.variant?.color?.label,
      product.enableVariants && product.variant?.size?.label,
    ].filter(Boolean);

    const description = descriptionArray.length > 0 ? descriptionArray.join(", ") : product.title;

    const productImage =
      product.enableVariants && product.variant?.image?.filename
        ? `https://cdn.nakashi.cz/nakashi/${product.variant.image.filename}`
        : product.image?.filename
        ? `https://cdn.nakashi.cz/nakashi/${product.image.filename}`
        : "";

    return {
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: product.title,
          description: description,
          images: productImage ? [productImage] : [],
        },
        unit_amount: Math.round(productPrice * 100), // Ensure integer cents
        tax_behavior: "inclusive" as const,
      },
      quantity: product.quantity ?? 1,
    };
  });

  try {
    console.log("Stripe line_items:", JSON.stringify(stripeMappedProducts, null, 2));

    if (!process.env.NEXT_PUBLIC_SERVER_URL) {
      console.error("NEXT_PUBLIC_SERVER_URL is not defined");
      throw new Error("Server URL configuration missing");
    }

    const payload = await getPayload({ config });
    const user = await getCustomer() as Customer | null;

    let customerId: string | undefined;

    if (user) {
      console.log(`Logged-in user found: ${user.id}`);

      // Check if the customer has a Stripe customerId
      if (user.stripeCustomerId) {
        console.log(`Using existing Stripe customer ID: ${user.stripeCustomerId}`);
        customerId = user.stripeCustomerId;
      } else {
        // Create a new Stripe Customer
        const customer = await stripe.customers.create({
          email: user.email ?? checkoutData.shipping.email ?? null,
          name: checkoutData.shipping.name ?? user.fullName ?? null,
          address: {
            line1: checkoutData.shipping.address ?? "neznámá adresa",
            city: checkoutData.shipping.city ?? "neznámé město",
            postal_code: checkoutData.shipping.postalCode ?? "neznámé PSČ",
            country: checkoutData.shipping.country ?? "CZ",
            state: checkoutData.shipping.region || undefined,
          },
          invoice_settings: {
            footer: "Děkujeme za Váš nákup!",
          },
          shipping: {
            name: checkoutData.shipping.name ?? user.fullName ?? null,
            address: {
              line1: checkoutData.shipping.address ?? "neznámá adresa",
              city: checkoutData.shipping.city ?? "neznámé město",
              postal_code: checkoutData.shipping.postalCode ?? "neznámé PSČ",
              country: checkoutData.shipping.country ?? "CZ",
              state: checkoutData.shipping.region || undefined,
            },
            phone: checkoutData.shipping.phone ?? null,
          },
          phone: checkoutData.shipping.phone ?? null,
          metadata: {
            payloadCustomerId: user.id,
            firstPickupPoint: checkoutData.shipping.pickupPointID ?? "",
            buyerType: checkoutData.buyerType ?? "",
            individualInvoice: checkoutData.individualInvoice ? "true" : "false",
          },
        });

        console.log(`Created new Stripe customer: ${customer.id}`);

        await payload.update({
          collection: "customers",
          id: user.id,
          data: {
            stripeCustomerId: customer.id,
          },
        });

        customerId = customer.id;
      }
    } else {
      console.log("No logged-in user, proceeding with guest checkout");
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: stripeMappedProducts,
      mode: "payment",
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: currency.toLowerCase(),
            },
            display_name: `${shippingLabel}${pickupPointID ? ` (${pickupPointID})` : ""}` || "Doprava (Shipping)",
            delivery_estimate: {
              minimum: { unit: "day", value: 2 },
              maximum: { unit: "day", value: 7 },
            },
            metadata: {
              orderID,
              pickupPointID: pickupPointID ?? "",
              pickupPointName: pickupPointName ?? "",
              pickupPointBranchCode: pickupPointBranchCode ?? "",
              pickupPointAddress: pickupPointAddress ?? "",
              locale: locale,
              currency: currency.toLowerCase(),
            },
            tax_behavior: "inclusive" as const,
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          orderID,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/order/${orderID}?x=${orderSecret}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/order/${orderID}?x=${orderSecret}&cancelled=true`,
      automatic_tax: {
        enabled: true,
      },
      customer: customerId,
      customer_update: customerId
        ? {
            address: "auto",
            name: "auto",
          }
        : undefined,
      customer_email: customerId ? undefined : checkoutData.shipping.email ?? "unknown@example.com",
      tax_id_collection: {
        enabled: true,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("Stripe session details:", {
      id: session.id,
      url: session.url,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    console.log("Stripe session created:", session.id, session.url);
    return { url: session.url, sessionID: session.id };
  } catch (error) {
    console.error("Stripe session creation error:", JSON.stringify(error, null, 2));
    throw error;
  }
};
