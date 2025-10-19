import { type UseFormReturn } from "react-hook-form";

import { type Media, type Customer } from "@/payload-types";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { type Currency } from "@/stores/Currency/types";

export type StepProps = {
	form: UseFormReturn<CheckoutFormData>;
	user?: Customer;
	geowidgetToken?: string;
	onNext: () => void;
	onPrevious: () => void;
	validateStep: () => Promise<boolean>;
};

export type FilledCourier = {
	slug: string;
	title: string;
	turnaround: string;
	icon?: Media;
	pricing:
		| { value: number; currency: Currency; id?: string | null }[]
		| undefined;
};
