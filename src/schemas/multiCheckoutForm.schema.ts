import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";

const ProductWithFilledVariantsSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string().nullable().optional(),
	quantity: z.number().min(1),
	pricing: z
		.array(z.object({ currency: z.string(), value: z.number() }))
		.nullable()
		.optional(),
	variant: z
		.object({
			slug: z.string().nullable().optional(),
			pricing: z
				.array(z.object({ currency: z.string(), value: z.number() }))
				.nullable()
				.optional(),
			stock: z.number().optional(),
			image: z.object({ url: z.string().nullable().optional() }).nullable().optional(),
			color: z.object({ label: z.string().nullable().optional() }).nullable().optional(),
			size: z.object({ label: z.string().nullable().optional() }).nullable().optional(),
		})
		.optional(),
	enableVariants: z.boolean().nullable().optional(),
	enableVariantPrices: z.boolean().nullable().optional(),
	stock: z.number().nullable().optional(),
	image: z.object({ url: z.string().nullable().optional() }).nullable().optional(),
});

// Definice schématu pro FilledCourier
const FilledCourierSchema = z.object({
	slug: z.string(),
	title: z.string(),
	turnaround: z.string(),
	icon: z
		.object({
			url: z.string().nullable().optional(),
		})
		.optional(),
	pricing: z
		.array(
			z.object({
				currency: z.string(),
				value: z.number(),
				id: z.string().nullable().optional(),
			}),
		)
		.optional(),
});

// Definice schématu pro PaymentMethod
const PaymentMethodSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	icon: z.string().optional(),
	disabled: z.boolean().optional(),
	recommended: z.boolean().optional(),
});

export const CheckoutFormSchemaServer = z
	.object({
		buyerType: z.enum(["individual", "company"]).default("individual"),
		individualInvoice: z.boolean().default(false),
		invoice: z
			.object({
				name: z.string(),
				address: z.string(),
				city: z.string(),
				country: z.string(),
				region: z.string(),
				postalCode: z.string(),
				tin: z.string().optional(),
			})
			.optional(),
		shipping: z.object({
			id: z.string().optional(),
			name: z.string(),
			address: z.string(),
			city: z.string(),
			country: z.string(),
			region: z.string(),
			postalCode: z.string(),
			phone: z.string(),
			email: z.string().email(),
			pickupPointID: z.string().optional(),
			pickupPointName: z.string().optional(),
			pickupPointBranchCode: z.string().optional(),
			pickupPointAddress: z.string().optional(),
		}),
		deliveryMethod: z.string().optional(),
		paymentMethod: z.string().optional(),
		checkoutProducts: z.array(ProductWithFilledVariantsSchema).optional(),
		totalPrice: z
			.array(z.object({ currency: z.string(), value: z.number() }))
			.optional(),
		deliveryMethods: z.array(FilledCourierSchema).optional(),
		paymentMethods: z.array(PaymentMethodSchema).optional(),
	})
	.passthrough();

export type CheckoutFormData = z.infer<typeof CheckoutFormSchemaServer>;

export const useMultiCheckoutFormSchema = () => {
	const t = useTranslations("CheckoutForm.errors");

	// Základní schéma pro klientskou validaci
	const CheckoutFormSchema = z.object({
		buyerType: z.enum(["individual", "company"]).default("individual"),
		individualInvoice: z.boolean().default(false),
		invoice: z
			.object({
				name: z.string().min(1, t("invoice.name")),
				address: z.string().min(1, t("invoice.address")),
				city: z.string().min(1, t("invoice.city")),
				country: z.string().min(1, t("invoice.country")),
				region: z.string().min(1, t("invoice.region")),
				postalCode: z.string().min(1, t("invoice.postalCode")),
				tin: z.string().optional(),
			})
			.optional(),
		shipping: z.object({
			id: z.string().optional(),
			name: z.string().min(1, t("shipping.name")),
			address: z.string().min(1, t("shipping.address")),
			city: z.string().min(1, t("shipping.city")),
			country: z.string().min(1, t("shipping.country")),
			region: z.string().min(1, t("shipping.region")),
			postalCode: z.string().min(1, t("shipping.postalCode")),
			phone: z.string().min(1, t("shipping.phone")),
			email: z.string().email(t("shipping.email")).min(1, t("shipping.email")),
			pickupPointID: z.string().optional(),
			pickupPointName: z.string().optional(),
			pickupPointBranchCode: z.string().optional(),
			pickupPointAddress: z.string().optional(),
		}),
		deliveryMethod: z.string().min(1, t("deliveryMethod")),
		paymentMethod: z.string().min(1, t("paymentMethod")),
		checkoutProducts: z
			.array(ProductWithFilledVariantsSchema)
			.min(1, t("checkoutProducts")),
		totalPrice: z.array(z.object({ currency: z.string(), value: z.number() })),
		deliveryMethods: z.array(FilledCourierSchema),
		paymentMethods: z.array(PaymentMethodSchema),
	});

	const CartSchema = z.object({
		checkoutProducts: z
			.array(ProductWithFilledVariantsSchema)
			.min(1, t("checkoutProducts")),
		totalPrice: z.array(z.object({ currency: z.string(), value: z.number() })),
	});

	const DeliverySchema = z.object({
		deliveryMethod: z.string().min(1, t("deliveryMethod")),
		paymentMethod: z.string().min(1, t("paymentMethod")),
	});

	const ShippingSchema = z.object({
		buyerType: z.enum(["individual", "company"]),
		individualInvoice: z.boolean(),
		shipping: z.object({
			id: z.string().optional(),
			name: z.string().min(1, t("shipping.name")),
			address: z.string().min(1, t("shipping.address")),
			city: z.string().min(1, t("shipping.city")),
			country: z.string().min(1, t("shipping.country")),
			region: z.string().min(1, t("shipping.region")),
			postalCode: z.string().min(1, t("shipping.postalCode")),
			phone: z.string().min(1, t("shipping.phone")),
			email: z.string().email(t("shipping.email")).min(1, t("shipping.email")),
			pickupPointID: z.string().optional(),
			pickupPointName: z.string().optional(),
			pickupPointBranchCode: z.string().optional(),
			pickupPointAddress: z.string().optional(),
		}),
		invoice: z
			.object({
				name: z.string().min(1, t("invoice.name")),
				address: z.string().min(1, t("invoice.address")),
				city: z.string().min(1, t("invoice.city")),
				country: z.string().min(1, t("invoice.country")),
				region: z.string().min(1, t("invoice.region")),
				postalCode: z.string().min(1, t("invoice.postalCode")),
				tin: z.string().optional(),
			})
			.optional(),
	});

	const SummarySchema = z.object({
		termsCheck: z.boolean().refine((val) => val === true),
		newsletterCheck: z.boolean().optional(),
	});

	const RefinedCheckoutFormSchema = CheckoutFormSchema.superRefine(
		(data, ctx) => {
			if (data.buyerType === "company" || data.individualInvoice) {
				if (
					!data.invoice ||
					Object.entries(data.invoice).some(
						([key, value]) => key !== "tin" && (!value || value.trim() === ""),
					)
				) {
					Object.entries(data.invoice ?? {}).forEach(([key, value]) => {
						if (key !== "tin" && (!value || value.trim() === "")) {
							ctx.addIssue({
								code: "custom",
								message: t(`invoice.${key}`),
								path: ["invoice", key],
							});
						}
					});
				}
				if (
					data.buyerType === "company" &&
					(!data.invoice?.tin || data.invoice.tin.trim() === "")
				) {
					ctx.addIssue({
						code: "custom",
						message: t("invoice.tin"),
						path: ["invoice", "tin"],
					});
				}
			}
		},
	);

	return {
		CheckoutFormSchema: RefinedCheckoutFormSchema,
		CheckoutFormSchemaResolver: zodResolver(RefinedCheckoutFormSchema),
		CartSchema,
		CartSchemaResolver: zodResolver(CartSchema),
		DeliverySchema,
		DeliverySchemaResolver: zodResolver(DeliverySchema),
		ShippingSchema,
		ShippingSchemaResolver: zodResolver(ShippingSchema),
		SummarySchema,
		SummarySchemaResolver: zodResolver(SummarySchema),
	};
};
