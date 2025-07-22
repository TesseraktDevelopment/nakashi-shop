import { type CollectionConfig } from "payload";

export const ProductReviews: CollectionConfig = {
  slug: "productReviews",
  access: {},
  admin: {
    group: {
      en: "Products",
      cs: "Produkty",
    },
  },
  labels: {
    singular: {
      en: "Product Review",
      cs: "Recenze produktu",
    },
    plural: {
      en: "Product Reviews",
      cs: "Recenze produktů",
    },
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
    },
    {
      name: "author",
      label: {
        cs: "Autor recenze",
        en: "Review author",
      },
      type: "relationship",
      relationTo: "customers",
      required: true,
    },
    {
      name: "rating",
      label: {
        cs: "Hodnocení",
        en: "Rating",
      },
      type: "number",
      required: true,
      max: 5,
      min: 1,
    },
    {
      name: "review",
      label: {
        cs: "Obsah recenze",
        en: "Review content",
      },
      type: "richText",
    },
  ],
};
