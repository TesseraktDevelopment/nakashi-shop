import { type Field } from "payload";

import { countryPickerField } from "./countryPickerField";
import { courierSettingsFields } from "./courierSettingsFields";
import { freeShippingField } from "./freeShippingField";
import { weightRangesField } from "./weightRangesField";

export const courierFields: Field[] = [
	{
		name: "enabled",
		type: "checkbox",
		label: {
			en: "Enable this courier",
			cs: "Povolit tohoto kurýra",
		},
	},
	{
		name: "settings",
		label: {
			en: "Settings",
			cs: "Nastavení",
		},
		type: "group",

		fields: courierSettingsFields,
	},
	{
		name: "deliveryZones",
		type: "array",
		label: {
			en: "Delivery zones",
			cs: "Doručovací zóny",
		},
		labels: {
			plural: {
				en: "Delivery zones",
				cs: "Doručovací zóny",
			},
			singular: {
				en: "Delivery zone",
				cs: "Doručovací zóna",
			},
		},

		fields: [countryPickerField, freeShippingField, weightRangesField],
		admin: {
			components: {
				RowLabel:
					"@/components/(ecommerce)/RowLabels/DeliveryZonesRowLabel#DeliveryZonesRowLabel",
			},
		},
	},
	{
		name: "icon",
		type: "upload",
		label: {
			en: "Icon",
			cs: "Ikona",
		},
		relationTo: "media",
		admin: {
			condition: (data) => Boolean(data.enabled),
		},
	},
];
