import { linkGroup } from "@/fields/linkGroup";
import { marginFields, paddingFields } from "@/fields/spacingFields";

import type { Block } from "payload";

export const MediaBlock: Block = {
	slug: "mediaBlock",
	interfaceName: "MediaBlock",
	fields: [
		{
			name: "media",
			type: "upload",
			relationTo: "media",
			required: true,
		},
		{
			name: "isLink",
			type: "checkbox",
			label: "Obalit obrázek odkazem?",
			defaultValue: false,
		},
		linkGroup({
			appearances: ["default", "outline"],
			overrides: {
				maxRows: 1,
				admin: {
					condition: (_, siblingData) => Boolean(siblingData?.isLink),
				},
			},
		}),
		marginFields,
		paddingFields,
	],
};
