import { type Field } from "payload";

import { countryList } from "@/globals/(ecommerce)/Couriers/utils/countryList";

export const countryPickerField: Field = {
	name: "countries",
	type: "select",
	label: {
		en: "Countries",
		cs: "Země",
	},
	hasMany: true,
	options: [...countryList],
	required: true,
};
