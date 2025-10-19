import { type Field } from "payload";

import { currencyField } from "./currencyField";

export const weightRangesField: Field = {
	name: "range",
	type: "array",
	label: {
		en: "Weight ranges",
		cs: "Hmotnostní rozsahy",
	},
	labels: {
		plural: {
			en: "Weight ranges",
			cs: "Hmotnostní rozsahy",
		},
		singular: {
			en: "Weight range",
			cs: "Hmotnostní rozsah",
		},
	},
	admin: {
		components: {
			RowLabel:
				"@/components/(ecommerce)/RowLabels/WeightRangeRowLabel#WeightRangeRowLabel",
		},
	},
	fields: [
		{
			type: "row",
			fields: [
				{
					name: "weightFrom",
					label: {
						en: "Weight from (g)",
						cs: "Hmotnost od (g)",
					},
					type: "number",
					required: true,
				},
				{
					name: "weightTo",
					label: {
						en: "Weight to (g)",
						cs: "Hmotnost do (g)",
					},
					type: "number",
					required: true,
				},
			],
		},
		{
			name: "pricing",
			type: "array",
			label: {
				en: "Pricing",
				cs: "Ceník",
			},
			minRows: 1,
			required: true,
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
		},
	],
};
