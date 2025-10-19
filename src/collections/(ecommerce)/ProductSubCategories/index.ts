import { type CollectionConfig } from "payload";

import { slugField } from "@/fields/slug";

export const ProductSubCategories: CollectionConfig = {
	slug: "productSubCategories",
	admin: {
		useAsTitle: "title",
		group: {
			en: "Products",
			cs: "Produkty",
		},
	},
	labels: {
		singular: {
			en: "Product Subcategory",
			cs: "Podkategorie produktu",
		},
		plural: {
			en: "Product Subcategories",
			cs: "Podkategorie produktů",
		},
	},
	fields: [
		{
			name: "category",
			type: "relationship",
			relationTo: "productCategories",
			label: {
				en: "Parent category",
				cs: "Nadřazená kategorie",
			},
			required: true,
		},
		{
			name: "title",
			label: {
				en: "Subcategory name",
				cs: "Název podkategorie",
			},
			type: "text",
			required: true,
			localized: true,
		},
		...slugField(),
		{
			name: "products",
			label: {
				en: "Products in this category",
				cs: "Produkty v této kategorii",
			},
			type: "join",
			collection: "products",
			on: "categoriesArr.subcategories",
		},
	],
};
