"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { type ProductWithFilledVariants } from "@/globals/(ecommerce)/Layout/Cart/variants/SlideOver";
import { useCart } from "@/stores/CartStore";
import { type Currency } from "@/stores/Currency/types";

import { type FilledCourier, type StepProps } from "./types";

import { OrderSummary } from "../OrderSummary";

export const CartStep = ({
	products,
	totalPrice,
	deliveryMethods,
	selectedDelivery,
}: StepProps & {
	products?: ProductWithFilledVariants[];
	totalPrice?: { currency: Currency; value: number }[];
	deliveryMethods?: FilledCourier[];
	selectedDelivery?: string;
	completedSteps: unknown[][];
}) => {
	const { cart } = useCart();
	const t = useTranslations("CheckoutSteps.cart");

	const handleContinue = async () => {
		if (!cart || cart.length === 0) {
			console.error(t("empty-cart"));
			return;
		}
		if (!products || products.length === 0) {
			console.error(t("fetch-cart-error"));
			return;
		}
	};

	if (!cart?.length) {
		return (
			<div className="mt-10 text-center">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					{t("empty-cart")}
				</h2>
				<p className="text-gray-600 mb-6">{t("empty-cart-description")}</p>
			</div>
		);
	}

	return (
		<div className="mt-10">
			<div className="space-y-4 mb-8">
				<OrderSummary
					products={products ?? []}
					totalPrice={totalPrice ?? []}
					shippingCost={
						deliveryMethods?.find((method) => method.slug === selectedDelivery)
							?.pricing
					}
				/>
			</div>

			<div className="flex justify-end">
				<Button onClick={handleContinue} className="px-8 py-3">
					{t("delivery-payment")}
				</Button>
			</div>
		</div>
	);
};
