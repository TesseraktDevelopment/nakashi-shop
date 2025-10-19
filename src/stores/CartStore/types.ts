import { type FilledVariant } from "@/globals/(ecommerce)/Layout/ProductDetails/types";
import { type Media, type Product } from "@/payload-types";

import { type Currency } from "../Currency/types";

export type CartProduct = {
	id: Product["id"];
	quantity: number;
	choosenVariantSlug?: string;
};

export type CheckoutState = {
	currentStep: number;
	deliveryMethod: string;
	paymentMethod: string;
	shipping: {
		id?: string | undefined;
		name: string;
		address: string;
		city: string;
		country: string;
		region: string;
		postalCode: string;
		phone: string;
		email: string;
		pickupPointID?: string | undefined;
		pickupPointName?: string | undefined;
		pickupPointBranchCode?: string | undefined;
		pickupPointAddress?: string | undefined;
	};
	products: {
		id?: string | null | undefined;
		variant: FilledVariant | undefined;
		image: Media | null;
		quantity: number;
		pricing: {
			value: number;
			currency: Currency;
			id?: string | null;
		}[];
	};
};

export type Cart = CartProduct[];
