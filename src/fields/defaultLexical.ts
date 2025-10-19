import {
	BlocksFeature,
	LinkFeature,
	lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { type Config } from "payload";

import { MediaBlock } from "@/blocks/MediaBlock/config";

export const defaultLexical: Config["editor"] = lexicalEditor({
	features: ({ defaultFeatures }) => {
		return [
			...defaultFeatures,
			BlocksFeature({
				blocks: [MediaBlock],
			}),
			LinkFeature({
				enabledCollections: ["pages", "posts", "products"],
				fields: ({ defaultFields }) => {
					const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
						if ("name" in field && field.name === "url") return false;
						return true;
					});

					return [
						...defaultFieldsWithoutUrl,
						{
							name: "url",
							type: "text",
							admin: {
								condition: ({ linkType }) => linkType !== "internal",
							},
							label: ({ t }) => t("fields:enterURL"),
							required: true,
						},
					];
				},
			}),
		];
	},
});
