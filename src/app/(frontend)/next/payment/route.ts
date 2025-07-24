import { getPayload } from "payload";
import { type Country } from "@/globals/(ecommerce)/Couriers/utils/countryList";
import { type Locale } from "@/i18n/config";
import { getFilledProducts } from "@/lib/getFilledProducts";
import { getTotal } from "@/lib/getTotal";
import { getTotalWeight } from "@/lib/getTotalWeight";
import { getAutopayPaymentURL } from "@/lib/paywalls/getAutopayPaymentURL";
import { getP24PaymentURL } from "@/lib/paywalls/getP24PaymentURL";
import { getStripePaymentURL } from "@/lib/paywalls/getStripePaymentURL";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Cart } from "@/stores/CartStore/types";
import { type Currency } from "@/stores/Currency/types";
import { getCustomer } from "@/utilities/getCustomer";
import { getCachedGlobal } from "@/utilities/getGlobals";
import config from "@payload-config";

const createCouriers = async (locale: Locale) => {
  const couriersModule = await import("@/globals/(ecommerce)/Couriers/utils/couriersConfig");
  return couriersModule.createCouriers(locale);
};

export async function POST(req: Request) {
  try {
    console.log("POST request received");
    const payload = await getPayload({ config });
    console.log("Payload initialized");

    const {
      cart,
      selectedCountry,
      checkoutData,
      locale,
      currency,
    }: {
      cart: Cart | undefined;
      selectedCountry: Country;
      locale: Locale;
      checkoutData: CheckoutFormData;
      currency: Currency;
    } = (await req.json()) as {
      cart: Cart | undefined;
      selectedCountry: Country;
      locale: Locale;
      checkoutData: CheckoutFormData;
      currency: Currency;
    };
    console.log("Request body:", { cart, selectedCountry, checkoutData, locale, currency });

    if (!cart) {
      console.log("Cart is undefined, returning empty response");
      return Response.json({ status: 200 });
    }

    console.log("Fetching products for cart IDs:", cart.map((product) => product.id));
    const { docs: products } = await payload.find({
      collection: "products",
      where: {
        id: {
          in: cart.map((product) => product.id),
        },
      },
      locale,
      select: {
        title: true,
        price: true,
        images: true,
        variants: true,
        enableVariants: true,
        enableVariantPrices: true,
        colors: true,
        slug: true,
        stock: true,
        sizes: true,
        weight: true,
        pricing: true,
      },
    });
    console.log("Fetched products:", products);

    const filledProducts = getFilledProducts(products, cart);
    console.log("Filled products:", filledProducts);

    const total = getTotal(filledProducts);
    console.log("Total calculated:", total);

    const totalWeight = getTotalWeight(filledProducts, cart);
    console.log("Total weight calculated:", totalWeight);

    const couriers = await createCouriers(locale);
    console.log("Couriers fetched:", couriers);

    const courier = couriers.find((courier) => courier?.key === checkoutData.deliveryMethod);
    console.log("Selected courier:", courier);
    if (!courier) {
      console.log("Courier not found for deliveryMethod:", checkoutData.deliveryMethod);
      return Response.json({ status: 400, message: "Courier not found" });
    }

    const courierData = await courier.getSettings();
    console.log("Courier settings:", courierData);

    const shippingCost = courierData.deliveryZones
      ?.find((zone) => zone.countries.includes(selectedCountry))
      ?.range?.find((range) => range.weightFrom <= totalWeight && range.weightTo >= totalWeight)
      ?.pricing.find((pricing) => pricing.currency === currency)?.value;
    console.log("Shipping cost calculated:", shippingCost, "for country:", selectedCountry);

    if (!shippingCost) {
      console.log("Shipping cost not found for weight:", totalWeight, "currency:", currency);
      return Response.json({ status: 400, message: "Shipping cost not found" });
    }

    const paywalls = await getCachedGlobal("paywalls", locale, 1)();
    console.log("Paywalls fetched:", paywalls);

    let redirectURL: string | null = null;

    const user = await getCustomer();
    console.log("Customer fetched:", user);

    console.log("Creating order with data...");
    const order = await payload.create({
      collection: "orders",
      data: {
        customer: user?.id,
        extractedFromStock: true,
        products: filledProducts.map((product) => ({
          id: product.id,
          product: product.id,
          productName: product.title,
          quantity: product.quantity ?? 0,
          isFromAPI: true,
          hasVariant: product.enableVariants && product.variant ? true : false,
          variantSlug: product.variant?.variantSlug ?? undefined,
          color: product.variant?.color?.slug ?? undefined,
          size: product.variant?.size?.slug ?? undefined,
          price:
            product.variant?.pricing && product.enableVariantPrices
              ? (product.variant.pricing.find((price) => price.currency === currency)?.value ?? 0)
              : (product.pricing?.find((price) => price.currency === currency)?.value ?? 0),
          priceTotal:
            (product.variant?.pricing && product.enableVariantPrices
              ? (product.variant.pricing.find((price) => price.currency === currency)?.value ?? 0)
              : (product.pricing?.find((price) => price.currency === currency)?.value ?? 0)) *
            (product?.quantity ?? 0),
        })),
        date: new Date().toISOString(),
        invoice: {
          address:
            checkoutData.individualInvoice && checkoutData.invoice
              ? checkoutData.invoice.address
              : checkoutData.shipping.address,
          city:
            checkoutData.individualInvoice && checkoutData.invoice
              ? checkoutData.invoice.city
              : checkoutData.shipping.city,
          country:
            checkoutData.individualInvoice && checkoutData.invoice
              ? (checkoutData.invoice.country as Country)
              : (checkoutData.shipping.country as Country),
          isCompany: checkoutData.buyerType === "company",
          name:
            checkoutData.individualInvoice && checkoutData.invoice
              ? checkoutData.invoice.name
              : checkoutData.shipping.name,
          postalCode:
            checkoutData.individualInvoice && checkoutData.invoice
              ? checkoutData.invoice.postalCode
              : checkoutData.shipping.postalCode,
          region:
            checkoutData.individualInvoice && checkoutData.invoice
              ? checkoutData.invoice.region
              : checkoutData.shipping.region,
          tin: checkoutData.buyerType === "company" ? checkoutData.invoice?.tin : undefined,
        },
        orderDetails: {
          shipping: courier.key,
          shippingCost,
          status: "pending",
          total: total.find((price) => price.currency === currency)?.value ?? 0,
          totalWithShipping: (total.find((price) => price.currency === currency)?.value ?? 0) + shippingCost,
          currency: currency,
        },
        shippingAddress: {
          name: checkoutData.shipping.name,
          address: checkoutData.shipping.address,
          city: checkoutData.shipping.city,
          country: checkoutData.shipping.country as Country,
          region: checkoutData.shipping.region,
          postalCode: checkoutData.shipping.postalCode,
          email: checkoutData.shipping.email,
          phone: checkoutData.shipping.phone,
          pickupPointAddress: checkoutData.shipping.pickupPointAddress,
          pickupPointID: checkoutData.shipping.pickupPointID,
        },
        printLabel: {
          weight: totalWeight / 1000,
        },
      },
    });
    console.log("Order created:", order);

    console.log("Updating product stock and bought counts...");
    filledProducts.forEach((product) => {
      const newBoughtCount = (product.bought ?? 0) + (product?.quantity ?? 0);
      console.log(`Processing product ${product.id}, newBoughtCount: ${newBoughtCount}`);
      if (product.enableVariants && product.variant && product.variants) {
        const variant = product.variant;
        if (variant.stock) {
          const newStock = variant.stock - (product?.quantity ?? 0);
          console.log(`Updating variant stock for ${product.id}, variant: ${variant.variantSlug}, newStock: ${newStock}`);
          void payload.update({
            collection: "products",
            id: product.id,
            data: {
              variants: product.variants?.map((v) => {
                if (v.variantSlug === variant.variantSlug) {
                  return {
                    ...v,
                    stock: newStock,
                  };
                }
                return v;
              }),
              bought: newBoughtCount,
            },
          });
        }
      } else {
        if (product.stock) {
          const newStock = product.stock - (product?.quantity ?? 0);
          console.log(`Updating stock for ${product.id}, newStock: ${newStock}`);
          void payload.update({
            collection: "products",
            id: product.id,
            data: {
              stock: newStock,
              bought: newBoughtCount,
            },
          });
        }
      }
    });

    if (user) {
      console.log(`Updating customer ${user.id} with lastBuyerType: ${checkoutData.buyerType}`);
      void payload.update({
        collection: "customers",
        id: user.id,
        data: {
          lastBuyerType: checkoutData.buyerType as "individual" | "company",
        },
      });
    }

    if (courier.prepaid === false) {
      console.log("Courier is not prepaid, returning order URL");
      return Response.json({
        status: 200,
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/order/${order.id}`,
      });
    }

    const totalWithShipping = (total.find((price) => price.currency === currency)?.value ?? 0) + shippingCost;
    console.log("Total with shipping:", totalWithShipping);

    console.log("Paywall type:", paywalls.paywall);

    try {
      switch (paywalls.paywall) {
        case "stripe":
          console.log("Processing Stripe payment...");
          redirectURL = await getStripePaymentURL({
            filledProducts,
            shippingCost,
            shippingLabel: courierData.settings.label,
            currency,
            locale,
            apiKey: paywalls?.stripe?.secret ?? "",
            orderID: order.id,
          });
          console.log("Stripe redirect URL:", redirectURL);
          break;

        case "autopay":
          console.log("Processing Autopay payment...");
          redirectURL = await getAutopayPaymentURL({
            total: totalWithShipping,
            autopay: paywalls?.autopay,
            orderID: order.id,
            currency,
            customerEmail: checkoutData.shipping.email,
          });
          console.log("Autopay redirect URL:", redirectURL);
          break;

        case "p24":
          console.log("Processing P24 payment...");
          redirectURL = await getP24PaymentURL({
            secretId: paywalls.p24?.secretId ?? "",
            posId: Number(paywalls.p24?.posId ?? 0),
            crc: paywalls.p24?.crc ?? "",
            endpoint: paywalls.p24?.endpoint ?? "",
            sessionId: order.id,
            amount: totalWithShipping,
            currency,
            description: `${locale} - ${order.id}`,
            email: order.shippingAddress.email,
            locale,
            client: user,
          });
          console.log("P24 redirect URL:", redirectURL);
          break;

        default:
          console.log("No valid paywall type found");
          break;
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return Response.json({ status: 500, message: "Error while creating payment" });
    }

    console.log("Final response, redirectURL:", redirectURL);
    return Response.json({ status: 200, url: redirectURL });
  } catch (error) {
    console.error("General error in POST handler:", error);
    return Response.json({ status: 500, message: "Internal server error" });
  }
}
