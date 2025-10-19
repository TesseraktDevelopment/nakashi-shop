//MultiStepWithSummary/components/ShippingStep
"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { ShippingAddressForm } from "@/components/(ecommerce)/ShippingAddressForm";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";

export const ShippingStep = () => {
	const t = useTranslations("CheckoutForm.form");
	const form = useFormContext<CheckoutFormData>();

	return (
		<div>
			<h2 className="text-lg font-medium text-gray-900 uppercase">
				{t("shipping-address")}
			</h2>
			<ShippingAddressForm />
			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="buyerType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("buyer-type")}</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger>
										<SelectValue placeholder={t("select-buyer-type")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="individual">
											{t("individual")}
										</SelectItem>
										<SelectItem value="company">{t("company")}</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="individualInvoice"
					render={({ field }) => (
						<FormItem className="flex items-center space-x-2 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel>{t("individual-invoice")}</FormLabel>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
};
