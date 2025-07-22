import { type CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { slugField } from "@/fields/slug";

export const ProductCategories: CollectionConfig = {
  slug: "productCategories",
  admin: {
    useAsTitle: "title",
    group: {
      en: "Products",
      cs: "Produkty",
    },
  },
  labels: {
    singular: {
      en: "Product Category",
      cs: "Kategorie produktu",
    },
    plural: {
      en: "Product Categories",
      cs: "Kategorie produktů",
    },
  },
  access: {
    read: anyone,
  },
  fields: [
    {
      name: "title",
      label: {
        en: "Category name",
        cs: "Název kategorie",
      },
      type: "text",
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: "subcategories",
      label: {
        en: "Related subcategories",
        cs: "Související podkategorie",
      },
      type: "join",
      collection: "productSubCategories",
      on: "category",
    },
    {
      name: "products",
      label: {
        en: "Products in this category",
        cs: "Produkty v této kategorii",
      },
      type: "join",
      collection: "products",
      on: "categoriesArr.category",
    },
  ],
};
