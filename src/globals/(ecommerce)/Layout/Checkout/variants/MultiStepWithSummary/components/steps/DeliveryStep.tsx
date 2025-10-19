"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { type StepProps } from "./types";

export const DeliveryStep = ({
	form,
	user,
	geowidgetToken,
	onNext,
	onPrevious,
	validateStep,
}: StepProps) => {
	const t = useTranslations("CheckoutSteps.delivery");

	const handleContinue = async () => {
		const isValid = await validateStep();
		if (isValid) {
			onNext();
		}
	};

	return (
		<div className="mt-10">
			<h2 className="text-lg font-medium text-gray-900 mb-6">
				{t("titleKey")}
			</h2>

			<div className="mb-8">
				{/* Reuse delivery method selection from OneStep */}
			</div>

			{/* Payment Methods Section */}
			<div className="mb-8">
				{/* Reuse payment method selection from OneStep */}
			</div>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onPrevious}>
					{t("cart")}
				</Button>
				<Button onClick={handleContinue}>{t("shipping")}</Button>
			</div>
		</div>
	);
};
