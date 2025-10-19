import { type Field } from "payload";

import { currencyField } from "./currencyField";

export const freeShippingField: Field = {
	name: "freeShipping",
	type: "array",
	label: {
		en: "Free shipping from",
		cs: "Doprava zdarma od",
	},
	labels: {
		singular: {
			en: "Price",
			cs: "Cena",
		},
		plural: {
			en: "Prices",
			cs: "Ceny",
		},
	},
	admin: {
		components: {
			RowLabel:
				"@/components/(ecommerce)/RowLabels/PriceRowLabel#PriceRowLabel",
		},
	},
	fields: [
		{
			type: "row",
			fields: [
				{
					name: "value",
					type: "number",
					label: {
						en: "Price",
						cs: "Cena",
					},
					required: true,
				},
				currencyField,
			],
		},
	],
};
