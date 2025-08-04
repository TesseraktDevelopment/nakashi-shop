import axios from "axios";
import { getTranslations } from "next-intl/server";
import { getPayload } from "payload";
import { z } from "zod";

import { Media as MediaComponent } from "@/components/Media";
import RichText from "@/components/RichText";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/i18n/config";
import { Link } from "@/i18n/routing";
import { type Order, type Media, type Customer } from "@/payload-types";
import config from "@/payload.config";
import { formatPrice } from "@/utilities/formatPrices";
import { getCustomer } from "@/utilities/getCustomer";
import { getCachedGlobal } from "@/utilities/getGlobals";
import { getOrderProducts } from "@/utilities/getOrderProducts";

const RetryPaymentResponseSchema = z.object({
  status: z.number(),
  url: z.string().optional(),
  message: z.string().optional(),
});

type RetryPaymentResponse = z.infer<typeof RetryPaymentResponseSchema>;

const OrdersPage = async ({ params, searchParams }: { params: Promise<{ locale: Locale; id: string }>; searchParams: Promise<{ x?: string; cancelled?: string }> }) => {
  const { locale, id: rawId } = await params;
  const payload = await getPayload({ config });
  const user = await getCustomer();
  const { x: providedSecret, cancelled } = await searchParams;

  const id = rawId.replace(/[^0-9a-fA-F]/g, "");
  if (!id || id.length !== rawId.length) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-base font-medium text-indigo-600">Error</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Invalid Order ID
            </p>
            <p className="mt-2 text-base text-gray-500">
              The order number provided is invalid. Please check and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  let order: Order;
  try {
    order = await payload.findByID({
      collection: "orders",
      id,
      locale,
      depth: 2,
    });
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-base font-medium text-indigo-600">Error</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Order Not Found
            </p>
            <p className="mt-2 text-base text-gray-500">
              The order with ID #{id} could not be found. Please check the order number or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white">
        <div className="mx-auto lg:flex lg:gap-x-16 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-base font-medium text-indigo-600">Error</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Order Not Found
            </p>
            <p className="mt-2 text-base text-gray-500">
              The order with ID #{id} could not be found. Please check the order number or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const t = await getTranslations("Order");

  const isAuthorized = user && (order.customer as Customer)?.id === user.id;
  const isValidSecret = !user && providedSecret && providedSecret === order.orderDetails.orderSecret;

  if (!isAuthorized && !isValidSecret) {
    return (
      <div className="container pt-16">
        <div className="mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-base font-medium text-indigo-600">{t("thank-you")}</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {t(`${order.orderDetails.status}.title`)}
            </p>
            <p className="mt-2 text-base text-gray-500">
              {t(`${order.orderDetails.status}.subtitle`, { orderID: order.id })}
            </p>
            <p className="mt-12 text-base text-orange-500">
              {user
                ? t("unauthorized-message", {
                    email: order.customer
                      ? `${(order.customer as Customer).email.slice(0, 2)}${"*".repeat(
                          (order.customer as Customer).email.indexOf("@") - 2,
                        )}${(order.customer as Customer).email.slice(
                          (order.customer as Customer).email.indexOf("@"),
                        )}`
                      : order.shippingAddress.email
                        ? `${order.shippingAddress.email.slice(0, 2)}${"*".repeat(
                            order.shippingAddress.email.indexOf("@") - 2,
                          )}${order.shippingAddress.email.slice(order.shippingAddress.email.indexOf("@"))}`
                        : `no${"*".repeat(5)}@email.com`,
                  })
                : t("warning-message", {
                    email: order.customer
                      ? `${(order.customer as Customer).email.slice(0, 2)}${"*".repeat(
                          (order.customer as Customer).email.indexOf("@") - 2,
                        )}${(order.customer as Customer).email.slice(
                          (order.customer as Customer).email.indexOf("@"),
                        )}`
                      : order.shippingAddress.email
                        ? `${order.shippingAddress.email.slice(0, 2)}${"*".repeat(
                            order.shippingAddress.email.indexOf("@") - 2,
                          )}${order.shippingAddress.email.slice(order.shippingAddress.email.indexOf("@"))}`
                        : `no${"*".repeat(5)}@email.com`,
                  })}
            </p>
            <div className="flex flex-1/2 gap-3.5 mt-6">
              {!user && (
                <Link href="/login">
                  <Button variant="tailwind" className="w-full h-full">
                    Přihlásit se
                  </Button>
                </Link>
              )}
              <Link href={user ? "/account/orders" : "/login"}>
                <Button variant="tailwind" className="w-full h-full">
                  {user ? "Zobrazit moje objednávky" : "Změnit objednávku"}
                </Button>
              </Link>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {t("created-at")} {new Date(order.createdAt).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="mt-10 border-t border-gray-200">
              <h2 className="sr-only">{t("your-order")}</h2>
              <h3 className="sr-only">{t("items")}</h3>
              <div className="space-y-6">
                {Array.from({ length: order.products?.length ?? 3 }).map((_, index) => (
                  <div key={index} className="flex space-x-6 border-b border-gray-200 py-6">
                    <div className="size-20 flex-none rounded-lg bg-gray-200"></div>
                    <div className="flex flex-auto flex-col">
                      <div>
                        <h4 className="font-medium text-gray-500">••••••••••••••••••••</h4>
                        <p className="mt-2 text-sm text-gray-500">••••••••••••••••••••</p>
                      </div>
                      <div className="mt-6 flex flex-1 items-end">
                        <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                          <div className="flex">
                            <dt className="font-medium text-gray-500">{t("quantity")}</dt>
                            <dd className="ml-2 text-gray-500">••</dd>
                          </div>
                          <div className="flex pl-4 sm:pl-6">
                            <dt className="font-medium text-gray-500">{t("price")}</dt>
                            <dd className="ml-2 text-gray-500">•••</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sm:ml-40 sm:pl-6">
                <h3 className="sr-only">{t("your-information")}</h3>
                <h4 className="sr-only">{t("shipping")}</h4>
                <dl className="grid grid-cols-2 gap-x-6 border-gray-200 py-10 text-sm">
                  <div>
                    <dt className="font-medium text-gray-900">{t("shipping-address")}</dt>
                    <dd className="mt-2 text-gray-500">
                      <address className="not-italic">
                        <span className="block">••••••••••••••••••••</span>
                        <span className="block">••••••••••••••••••••</span>
                        <span className="block">••••••••••••••••••••</span>
                      </address>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">{t("shipping-method")}</dt>
                    <dd className="mt-2 text-gray-500">
                      <span className="block">••••••••••••••••••••</span>
                      <span className="block">••••••••••••••••••••</span>
                    </dd>
                  </div>
                </dl>
                <h3 className="sr-only">{t("summary")}</h3>
                <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm mb-15">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">{t("subtotal")}</dt>
                    <dd className="text-gray-500">•••</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex font-medium text-gray-500">{t("shipping")}</dt>
                    <dd className="text-gray-500">•••</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">{t("total")}</dt>
                    <dd className="text-gray-500">•••</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const c = await getTranslations("CheckoutForm.countries");
  const filledProducts = await getOrderProducts(order.products, locale);
  const courier = order.orderDetails.shipping && (await getCachedGlobal(order.orderDetails.shipping, locale, 1)());

  let stripePaymentURL: string | null = null;
  if (order.orderDetails.status === "unpaid" || order.orderDetails.status === "cancelled") {
    try {
      const response = await axios.get<RetryPaymentResponse>(
        `/next/retry-payment?orderId=${order.id}&locale=${locale}${providedSecret ? `&x=${providedSecret}` : ""}`,
      );
      const result = RetryPaymentResponseSchema.safeParse(response.data);
      if (result.success) {
        const data: RetryPaymentResponse = result.data;
        if (data.status === 200 && data.url) {
          stripePaymentURL = data.url;
        } else {
          console.error("Failed to fetch retry payment URL:", data.message ?? "Unknown error");
        }
      } else {
        console.error("Invalid retry payment response:", result.error.flatten());
      }
    } catch (error) {
      console.error("Error fetching retry payment URL:", error);
    }
  }

  return (
    <div className="container pt-16">
      <div className="mx-auto">
        <div className="max-w-xl">
          <h1 className="text-base font-medium text-indigo-600">{t("thank-you")}</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {t(`${order.orderDetails.status}.title`)}
          </p>
          <p className="mt-2 text-base text-gray-500">
            {t(`${order.orderDetails.status}.subtitle`, { orderID: order.id })}
          </p>
          {(order.orderDetails.status === "unpaid" || order.orderDetails.status === "cancelled") && cancelled && (
            <p className="mt-2 text-base text-red-500">
              {t("payment-cancelled", { defaultValue: "Your payment was cancelled or failed. Please try again." })}
            </p>
          )}
          {order.orderDetails.trackingNumber && (
            <dl className="mt-12 text-sm font-medium">
              <dt className="text-gray-900">{t("tracking-number")}</dt>
              <dd className="mt-2 text-indigo-600">{order.orderDetails.trackingNumber}</dd>
            </dl>
          )}
          {(order.orderDetails.status === "unpaid" || order.orderDetails.status === "cancelled") && stripePaymentURL && (
            <div className="mt-6">
              <a href={stripePaymentURL}>
                <Button variant="tailwind" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                  {t("retry-payment", { defaultValue: "Retry Payment" })}
                </Button>
              </a>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-400">
          {t("created-at")} {new Date(order.createdAt).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <div className="mt-10 border-t border-gray-200">
          <h2 className="sr-only">{t("your-order")}</h2>
          <h3 className="sr-only">{t("items")}</h3>
          {filledProducts?.map((product) => {
            const selectedVariant = product.variants?.find(
              (variant) => variant.variantSlug === product.variantSlug,
            );

            const productImage =
              product.variants && product.variantSlug
                ? ((product.variants.find((variant) => product.variantSlug === variant.variantSlug)?.image ??
                    product.images[0]) as Media | undefined)
                : (product.images[0] as Media);

            return (
              <div
                key={`${product.id}-${product.variantSlug}`}
                className="flex space-x-6 border-b border-gray-200 py-6"
              >
                <MediaComponent
                  resource={productImage}
                  className="size-20 flex-none rounded-lg bg-gray-100 object-cover sm:size-28"
                />
                <div className="flex flex-auto flex-col">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      <Link
                        href={`/product/${product.slug}${product.variants && selectedVariant && `?variant=${selectedVariant.variantSlug}`}`}
                      >
                        {product.title}
                      </Link>
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.colors?.find((color) => color.slug === selectedVariant?.color)?.label}
                      {selectedVariant?.color && selectedVariant?.size && ", "}
                      {product.sizes?.find((size) => size.slug === selectedVariant?.size)?.label}
                    </p>
                    {product.description && (
                      <RichText data={product.description} className="mt-2 text-sm text-gray-600" />
                    )}
                  </div>
                  <div className="mt-6 flex flex-1 items-end">
                    <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                      <div className="flex">
                        <dt className="font-medium text-gray-900">{t("quantity")}</dt>
                        <dd className="ml-2 text-gray-700">{product.quantity}</dd>
                      </div>
                      <div className="flex pl-4 sm:pl-6">
                        <dt className="font-medium text-gray-900">{t("price")}</dt>
                        <dd className="ml-2 text-gray-700">
                          {formatPrice(product.priceTotal, order.orderDetails.currency, locale)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="sm:ml-40 sm:pl-6">
            <h3 className="sr-only">{t("your-information")}</h3>
            <h4 className="sr-only">{t("shipping")}</h4>
            <dl className="grid grid-cols-2 gap-x-6 border-gray-200 py-10 text-sm">
              <div>
                <dt className="font-medium text-gray-900">{t("shipping-address")}</dt>
                <dd className="mt-2 text-gray-700">
                  <address className="not-italic">
                    <span className="block">{order.shippingAddress.name}</span>
                    <span className="block">
                      {order.shippingAddress.postalCode}, {order.shippingAddress.city}
                    </span>
                    <span className="block">
                      {order.shippingAddress.region}, {c(order.shippingAddress.country)}
                    </span>
                  </address>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">{t("billing-address")}</dt>
                <dd className="mt-2 text-gray-700">
                  <span className="block">{courier?.settings.label}</span>
                  {order.shippingAddress.pickupPointID && (
                    <>
                      <span className="block mt-0.5">
                        <Link
                          target="_blank"
                          className="text-main-500"
                          href={
                            order.orderDetails.shipping === "zasilkovna-box"
                              ? `https://www.zasilkovna.cz/pobocky/${order.shippingAddress.pickupPointBranchCode ?? order.shippingAddress.pickupPointID ?? ""}`
                              : "#"
                          }
                        >
                          {order.shippingAddress.pickupPointName}
                        </Link>
                      </span>
                      {order.shippingAddress.pickupPointAddress && (
                        <span>{order.shippingAddress.pickupPointAddress}</span>
                      )}
                    </>
                  )}
                </dd>
              </div>
            </dl>
            <dl className="grid grid-cols-2 gap-x-6 border-gray-200 py-10 text-sm">
              <div>
                <dt className="font-medium text-gray-900">{t("payment-method")}</dt>
                <dd className="mt-2 text-gray-700">
                  <address className="not-italic">
                    <span className="block">
                      {order.orderDetails.status === "paid" ? "Stripe" : "Čeká na platbu"}
                    </span>
                    {order.orderDetails.transactionID && (
                      <span className="block text-gray-500">
                        ID transakce: {order.orderDetails.transactionID}
                      </span>
                    )}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">{t("shipping-method")}</dt>
                <dd className="mt-2 text-gray-700">
                  <span className="block">{courier?.settings.label}</span>
                  <span className="block">{courier?.settings.description}</span>
                </dd>
              </div>
            </dl>
            <h3 className="sr-only">{t("summary")}</h3>
            <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm mb-15">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">{t("subtotal")}</dt>
                <dd className="text-gray-700">
                  {formatPrice(order.orderDetails.total, order.orderDetails.currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">{t("shipping")}</dt>
                <dd className="text-gray-700">
                  {formatPrice(order.orderDetails.shippingCost, order.orderDetails.currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">{t("total")}</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.orderDetails.totalWithShipping, order.orderDetails.currency, locale)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
