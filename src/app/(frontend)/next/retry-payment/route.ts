import { getPayload } from "payload";
import Stripe from "stripe";

import { type Locale } from "@/i18n/config";
import { type FilledProduct } from "@/lib/getFilledProducts";
import { getStripePaymentURL } from "@/lib/paywalls/getStripePaymentURL";
import { type Order, type Customer } from "@/payload-types";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Currency } from "@/stores/Currency/types";
import { getCustomer } from "@/utilities/getCustomer";
import { getCachedGlobal } from "@/utilities/getGlobals";
import { getOrderProducts } from "@/utilities/getOrderProducts";
import config from "@payload-config";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const orderId = url.searchParams.get("orderId");
		const locale = url.searchParams.get("locale") as Locale;

		if (!orderId || !locale) {
			console.error("Missing orderId or locale in request");
			return Response.json({
				status: 400,
				message: "Missing orderId or locale",
			});
		}

		const payload = await getPayload({ config });

		let order: Order;
		try {
			order = await payload.findByID({
				collection: "orders",
				id: orderId,
				locale,
				depth: 2,
			});
		} catch (error) {
			console.error(`Error fetching order with ID ${orderId}:`, error);
			return Response.json({ status: 404, message: "Order not found" });
		}

		if (
			order.orderDetails.status !== "unpaid" &&
			order.orderDetails.status !== "cancelled"
		) {
			console.log(
				`Order ${orderId} is not in unpaid or cancelled state, status: ${order.orderDetails.status}`,
			);
			return Response.json({
				status: 400,
				message: "Order is not eligible for retry payment",
			});
		}

		const user = await getCustomer();
		const isAuthorized = user && (order.customer as Customer)?.id === user.id;
		const providedSecret = url.searchParams.get("x");
		const isValidSecret =
			!user &&
			providedSecret &&
			providedSecret === order.orderDetails.orderSecret;

		if (!isAuthorized && !isValidSecret) {
			console.warn(`Unauthorized access attempt for order ${orderId}`);
			return Response.json({ status: 403, message: "Unauthorized" });
		}

		const { stripe: stripeOptions } = await getCachedGlobal(
			"paywalls",
			locale,
			1,
		)();
		const stripe = new Stripe(stripeOptions?.secret ?? "", {
			apiVersion: "2025-07-30.basil",
		});

		let stripePaymentURL: string | null = null;
		let newSessionID: string | null = null;

		// Check if existing session is valid
		if (order.orderDetails.stripeSessionId) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				const session = await stripe.checkout.sessions.retrieve(
					order.orderDetails.stripeSessionId,
				);
				if (session.status === "open" && session.url) {
					stripePaymentURL = session.url;
					console.log(
						`Using existing Stripe session ${order.orderDetails.stripeSessionId} for order ${orderId}`,
					);
				} else {
					console.log(
						`Stripe session ${order.orderDetails.stripeSessionId} is expired or invalid`,
					);
				}
			} catch (error) {
				console.error(
					`Error retrieving Stripe session ${order.orderDetails.stripeSessionId}:`,
					error,
				);
			}
		}

		// Create new session if necessary
		if (!stripePaymentURL) {
			const filledProducts = (await getOrderProducts(
				order.products,
				locale,
			)) as unknown as FilledProduct[];
			const courier =
				order.orderDetails.shipping &&
				(await getCachedGlobal(order.orderDetails.shipping, locale, 1)());

			// Log products for debugging
			console.log("Order products:", JSON.stringify(filledProducts, null, 2));

			// Ensure all required fields are strings, provide defaults if null/undefined
			const checkoutData: CheckoutFormData = {
				buyerType: order.invoice?.isCompany ? "company" : "individual",
				shipping: {
					name: order.shippingAddress.name ?? "Unknown",
					address: order.shippingAddress.address ?? "Unknown",
					city: order.shippingAddress.city ?? "Unknown",
					country: order.shippingAddress.country ?? "CZ",
					region: order.shippingAddress.region ?? "Unknown",
					postalCode: order.shippingAddress.postalCode ?? "00000",
					email: order.shippingAddress.email ?? "unknown@example.com",
					phone: order.shippingAddress.phone ?? "Unknown",
					pickupPointAddress:
						order.shippingAddress.pickupPointAddress ?? undefined,
					pickupPointID: order.shippingAddress.pickupPointID ?? undefined,
					pickupPointName: order.shippingAddress.pickupPointName ?? undefined,
					pickupPointBranchCode:
						order.shippingAddress.pickupPointBranchCode ?? undefined,
				},
				individualInvoice: order.invoice?.isCompany ? false : !!order.invoice,
				invoice: order.invoice?.isCompany
					? {
							name: order.invoice.name ?? "Unknown",
							address: order.invoice.address ?? "Unknown",
							city: order.invoice.city ?? "Unknown",
							country: order.invoice.country ?? "CZ",
							region: order.invoice.region ?? "Unknown",
							postalCode: order.invoice.postalCode ?? "00000",
							tin: order.invoice.tin ?? undefined,
						}
					: undefined,
				deliveryMethod: order.orderDetails.shipping ?? "unknown",
				paymentMethod: "stripe",
			};

			try {
				const stripeResult = await getStripePaymentURL({
					filledProducts,
					shippingCost: order.orderDetails.shippingCost ?? 0,
					pickupPointID: order.shippingAddress.pickupPointID ?? "",
					pickupPointName: order.shippingAddress.pickupPointName ?? "",
					pickupPointBranchCode:
						order.shippingAddress.pickupPointBranchCode ?? "",
					pickupPointAddress: order.shippingAddress.pickupPointAddress ?? "",
					shippingLabel: courier?.settings.label ?? "Doprava (Shipping)",
					currency: order.orderDetails.currency as Currency,
					locale,
					checkoutData,
					apiKey: stripeOptions?.secret ?? "",
					orderID: order.id,
					orderSecret: order.orderDetails.orderSecret ?? "",
				});

				stripePaymentURL = stripeResult.url;
				newSessionID = stripeResult.sessionID;

				// Update order with new session ID
				await payload.update({
					collection: "orders",
					id: order.id,
					data: {
						orderDetails: {
							...order.orderDetails,
							stripeSessionId: newSessionID,
						},
					},
				});
				console.log(
					`Order ${order.id} updated with new Stripe session ID: ${newSessionID}`,
				);
			} catch (error) {
				console.error("Error creating new Stripe session:", error);
				return Response.json({
					status: 500,
					message:
						error instanceof Error
							? error.message
							: "Failed to create payment session",
				});
			}
		}

		if (!stripePaymentURL) {
			return Response.json({
				status: 500,
				message: "Failed to generate payment URL",
			});
		}

		return Response.json({ status: 200, url: stripePaymentURL });
	} catch (error) {
		console.error("Error in retry-payment route:", error);
		return Response.json({
			status: 500,
			message: error instanceof Error ? error.message : "Internal server error",
		});
	}
}
