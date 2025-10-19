import { link } from "@/fields/link";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const Footer: GlobalConfig = {
	slug: "footer",
	access: {
		read: () => true,
	},
	label: {
		en: "Footer",
		cs: "Footer",
	},
	admin: {
		group: {
			en: "Page Settings",
			cs: "Nastavení stránky",
		},
	},
	fields: [
		{
			name: "attribution",
			type: "richText",
			label: "Attribution",
			localized: true,
		},
		{
			name: "navItems",
			type: "array",
			fields: [
				link({
					appearances: false,
				}),
			],
			maxRows: 6,
			admin: {
				initCollapsed: true,
				components: {
					RowLabel: "@/globals/Footer/RowLabel#RowLabel",
				},
			},
		},
	],
	hooks: {
		afterChange: [revalidateGlobal],
	},
};
