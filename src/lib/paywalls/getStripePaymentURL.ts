import { getPayload } from "payload";
import Stripe from "stripe";

import { type Locale } from "@/i18n/config";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Currency } from "@/stores/Currency/types";
import { getCustomer } from "@/utilities/getCustomer";
import config from "@payload-config";

import { type FilledProduct } from "../getFilledProducts";

export const getStripePaymentURL = async ({
  filledProducts,
  shippingCost,
  pickupPointID,
  shippingLabel,
  currency,
  locale,
  apiKey,
  orderID,
  checkoutData,
}: {
  filledProducts: FilledProduct[];
  shippingCost: number;
  pickupPointID?: string;
  shippingLabel: string;
  currency: Currency;
  locale: Locale;
  apiKey: string;
  orderID: string;
  checkoutData: CheckoutFormData;
}) => {
  const stripe = new Stripe(apiKey, { apiVersion: "2025-06-30.basil" });

  const stripeMappedProducts = filledProducts.map((product) => {
    const productPrice = product.enableVariantPrices
      ? product.variant?.pricing?.find((price) => price.currency === currency)?.value
      : product.pricing?.find((price) => price.currency === currency)?.value;

    if (!productPrice) {
      console.error(`Product price not found for product: ${product.id}, title: ${product.title}`);
      throw new Error(`Product price not found for product: ${product.id}`);
    }

    // TODO: Images
    // const productImage =
    //   product.enableVariants && product.variant.image?.url
    //     ? product.variant.image.url
    //     : (product.image?.url ?? "");

    // console.log(`${process.env.NEXT_PUBLIC_SERVER_URL}${productImage}`);

    if (!product.title) {
      console.error(`Product title missing for product: ${product.id}`);
      throw new Error(`Product title missing for product: ${product.id}`);
    }

    const descriptionArray = [
      product.enableVariants && product.variant?.color?.label,
      product.enableVariants && product.variant?.size?.label,
    ].filter(Boolean);

    const description = descriptionArray.length > 0 ? descriptionArray.join(", ") : product.title;

    return {
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: product.title,
          description: description,
          //   images: [`${process.env.NEXT_PUBLIC_SERVER_URL}${productImage}`],
        },
        //unit_amount: productPrice * 100,
        unit_amount: Math.round(productPrice * 100), // Ensure integer cents
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
    const user = await getCustomer();

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
          email: user.email || checkoutData.shipping.email,
          name: checkoutData.shipping.name ?? user.fullName ?? "neznámé jméno",
          address: {
            line1: checkoutData.shipping.address ?? "neznámá adresa",
            city: checkoutData.shipping.city ?? "neznámé město",
            postal_code: checkoutData.shipping.postalCode ?? "neznámé PSČ",
            country: checkoutData.shipping.country ?? "neznámá země",
            state: checkoutData.shipping.region || undefined,
          },
          phone: checkoutData.shipping.phone ?? undefined,
          metadata: {
            payloadCustomerId: user.id,
            firstPickupPoint: checkoutData.shipping.pickupPointID,
            buyerType: checkoutData.buyerType,
            individualInvoice: checkoutData.individualInvoice,
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
              //amount: shippingCost * 100,
              amount: Math.round(shippingCost * 100), // Ensure integer cents
              currency: currency.toLowerCase(),
            },
            display_name: `${shippingLabel}${pickupPointID ? ` (${pickupPointID})` : ""}` || "Doprava (Shipping)",
            delivery_estimate: {
              minimum: { unit: "day", value: 2 },
              maximum: { unit: "day", value: 7 },
            },
            metadata: {
              orderID,
              locale: locale,
              currency: currency.toLowerCase(),
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          orderID,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/order/${orderID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/order/${orderID}?cancelled=true`,
    };

    // Add customer information if available
    if (customerId) {
      sessionConfig.customer = customerId;
      sessionConfig.customer_update = {
        address: "auto",
        name: "auto",
      };
    } else {
      sessionConfig.customer_email = checkoutData.shipping.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Stripe session created:", session.id, session.url);
    return session.url;
  } catch (error) {
    console.error("Stripe session creation error:", JSON.stringify(error, null, 2));
    throw error; // Rethrow the original error for better debugging
  }
};
