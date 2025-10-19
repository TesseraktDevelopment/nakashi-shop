"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import { type ProductWithFilledVariants } from "@/globals/(ecommerce)/Layout/Cart/variants/SlideOver";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Currency } from "@/stores/Currency/types";

import { type FilledCourier } from "./types";

import { OrderSummary } from "../OrderSummary";

export const SummaryStep = () => {
	const t = useTranslations("CheckoutForm.form");
	const form = useFormContext<CheckoutFormData>();

	const checkoutProducts = useWatch({
		control: form.control,
		name: "checkoutProducts",
	}) as ProductWithFilledVariants[] | null;
	const totalPrice = useWatch({
		control: form.control,
		name: "totalPrice",
	}) as { currency: Currency; value: number }[];
	const deliveryMethods = useWatch({
		control: form.control,
		name: "deliveryMethods",
	}) as FilledCourier[];
	const selectedDelivery = useWatch({
		control: form.control,
		name: "deliveryMethod",
	});

	return (
		<div>
			<h2 className="text-lg font-medium text-gray-900 uppercase">
				{t("order-summary")}
			</h2>
			<OrderSummary
				products={checkoutProducts ?? []}
				totalPrice={totalPrice ?? []}
				shippingCost={
					deliveryMethods.find((method) => method.slug === selectedDelivery)
						?.pricing
				}
				errorMessage={undefined}
				readOnly
				isSummaryStep
			/>
		</div>
	);
};
