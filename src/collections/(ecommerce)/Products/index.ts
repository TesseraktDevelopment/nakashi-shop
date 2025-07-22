import { type CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
// import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { currencyField } from "@/fields/currencyField";
import { defaultLexical } from "@/fields/defaultLexical";
import { slugField } from "@/fields/slug";
import { generatePreviewPath } from "@/utilities/generatePreviewPath";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: {
      en: "Product",
      cs: "Produkt",
    },
    plural: {
      en: "Products list",
      cs: "Seznam produktů",
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // read: authenticatedOrPublished,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["title"],
    useAsTitle: "title",
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          path: `/product/${typeof data?.slug === "string" ? data.slug : ""}`,
          locale: req.locale,
        });
        return `${process.env.NEXT_PUBLIC_SERVER_URL}${path}`;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        path: `/product/${typeof data?.slug === "string" ? data.slug : ""}`,
        locale: req.locale,
      }),
    group: {
      en: "Products",
      cs: "Produkty",
    },
  },
  fields: [
    {
      name: "title",
      label: {
        en: "Product name",
        cs: "Název produktu",
      },
      type: "text",
      localized: true,
      required: true,
    },
    ...slugField(),
    {
      type: "tabs",
      tabs: [
        {
          label: {
            en: "Content",
            cs: "Obsah",
          },
          fields: [
            {
              name: "description",
              label: {
                en: "Product description",
                cs: "Popis produktu",
              },
              localized: true,
              type: "richText",
              editor: defaultLexical,
            },
            {
              name: "images",
              label: {
                en: "Product images",
                cs: "Obrázky produktu",
              },
              type: "upload",
              relationTo: "media",
              hasMany: true,
              maxRows: 10,
              minRows: 1,
              required: true,
              admin: {
                description: {
                  en: "If you have variants, first image will be variant image.",
                  cs: "Pokud máte varianty, první obrázek bude obrázkem varianty.",
                },
              },
            },
            {
              name: "details",
              type: "array",
              label: {
                en: "Details",
                cs: "Podrobnosti",
              },
              labels: {
                singular: {
                  en: "Detail",
                  cs: "Podrobnost",
                },
                plural: {
                  en: "Details",
                  cs: "Podrobnosti",
                },
              },
              admin: {
                components: {
                  RowLabel: "@/collections/(ecommerce)/Products/components/RowLabels/DetailLabel#DetailLabel",
                },
              },
              fields: [
                {
                  name: "title",
                  label: {
                    en: "Title",
                    cs: "Název",
                  },
                  localized: true,
                  type: "text",
                  required: true,
                },
                {
                  name: "content",
                  label: {
                    en: "Content",
                    cs: "Obsah",
                  },
                  localized: true,
                  required: true,
                  type: "richText",
                  editor: defaultLexical,
                },
              ],
            },
          ],
        },
        {
          label: {
            en: "Variants options",
            cs: "Možnosti variant",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "enableVariants",
                  label: {
                    en: "Enable variants",
                    cs: "Povolit varianty",
                  },
                  type: "checkbox",
                  admin: {
                    width: "fit-content",
                  },
                },
                {
                  name: "enableVariantPrices",
                  label: {
                    en: "Variants have different prices",
                    cs: "Varianty mají různé ceny",
                  },
                  type: "checkbox",
                  admin: {
                    description: {
                      en: "If false, price is in Product Details",
                      cs: "Pokud je nepravda, cena je v Podrobnostech produktu",
                    },
                    width: "fit-content",
                    style: {
                      marginLeft: "2rem",
                    },
                  },
                },
                {
                  name: "enableVariantWeights",
                  label: {
                    en: "Variants have different weights",
                    cs: "Varianty mají různé váhy",
                  },
                  type: "checkbox",
                  admin: {
                    description: {
                      en: "If false, weight is in Product Details",
                      cs: "Pokud je nepravda, váha je v Podrobnostech produktu",
                    },
                    width: "fit-content",
                    style: {
                      marginLeft: "2rem",
                    },
                  },
                },
              ],
            },
            {
              type: "radio",
              name: "variantsType",
              label: {
                en: "Variants type",
                cs: "Typ variant",
              },
              admin: {
                condition: (data) => Boolean(data.enableVariants),
              },
              defaultValue: "sizes",
              options: [
                {
                  value: "sizes",
                  label: {
                    en: "Only sizes",
                    cs: "Pouze velikosti",
                  },
                },
                {
                  value: "colors",
                  label: {
                    en: "Only colors",
                    cs: "Pouze barvy",
                  },
                },
                {
                  value: "colorsAndSizes",
                  label: {
                    en: "Colors and sizes",
                    cs: "Barvy a velikosti",
                  },
                },
              ],
            },
            {
              name: "colors",
              labels: {
                singular: {
                  en: "Color",
                  cs: "Barva",
                },
                plural: {
                  en: "Colors",
                  cs: "Barvy",
                },
              },
              type: "array",
              admin: {
                components: {
                  RowLabel: "@/collections/(ecommerce)/Products/components/RowLabels/OptionLabel#OptionLabel",
                },
                condition: (_, siblingData) =>
                  Boolean(siblingData.enableVariants && siblingData.variantsType !== "sizes"),
                initCollapsed: true,
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      label: {
                        en: "Color name",
                        cs: "Název barvy",
                      },
                      type: "text",
                      localized: true,
                      required: true,
                    },
                    {
                      name: "slug",
                      type: "text",
                      required: true,
                      label: {
                        en: "Color slug",
                        cs: "Slug barvy",
                      },
                    },
                  ],
                },
                {
                  name: "colorValue",
                  label: {
                    en: "Color",
                    cs: "Barva",
                  },
                  type: "text",
                  admin: {
                    components: {
                      Field: "@/components/AdminColorPicker#AdminColorPicker",
                    },
                  },
                },
              ],
              label: {
                en: "Color options",
                cs: "Možnosti barev",
              },
              minRows: 1,
            },
            {
              name: "sizes",
              labels: {
                singular: {
                  en: "Size",
                  cs: "Velikost",
                },
                plural: {
                  en: "Sizes",
                  cs: "Velikosti",
                },
              },
              type: "array",
              admin: {
                components: {
                  RowLabel: "@/collections/(ecommerce)/Products/components/RowLabels/OptionLabel#OptionLabel",
                },
                condition: (_, siblingData) =>
                  Boolean(siblingData.enableVariants && siblingData.variantsType !== "colors"),
                initCollapsed: true,
              },
              fields: [
                {
                  name: "label",
                  label: {
                    en: "Size label",
                    cs: "Název velikosti",
                  },
                  type: "text",
                  localized: true,
                  required: true,
                },
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  label: {
                    en: "Size slug",
                    cs: "Slug velikosti",
                  },
                },
              ],
              label: {
                en: "Size options",
                cs: "Možnosti velikostí",
              },
              minRows: 1,
            },
            {
              name: "variants",
              type: "array",
              admin: {
                components: {
                  RowLabel:
                    "@/collections/(ecommerce)/Products/components/RowLabels/VariantLabel#VariantLabel",
                },
                condition: (_, siblingData) => {
                  return Boolean(siblingData.enableVariants);
                },
              },
              validate: (value) => {
                if (!value) return true;
                // eslint-disable-next-line
                const groupedByVariantSlug = value.reduce((acc: Record<string, any[]>, item: any) => {
                  // eslint-disable-next-line
                  if (!acc[item.variantSlug]) {
                    // eslint-disable-next-line
                    acc[item.variantSlug] = [];
                  }
                  // eslint-disable-next-line
                  acc[item.variantSlug].push(item);
                  return acc;
                  // eslint-disable-next-line
                }, {}) as any[];

                const duplicateSlugs = Object.keys(groupedByVariantSlug).filter(
                  // eslint-disable-next-line
                  (slug) => groupedByVariantSlug[slug].length > 1,
                );
                if (duplicateSlugs.length > 0) {
                  return `Duplicated variant slugs: ${duplicateSlugs.join(", ")}`;
                }
                return true;
              },
              fields: [
                {
                  type: "row",
                  admin: {
                    className: "variant-gap-row",
                  },
                  fields: [
                    {
                      name: "size",
                      type: "text",
                      index: true,
                      label: {
                        en: "Size",
                        cs: "Velikost",
                      },
                      admin: {
                        components: {
                          Field: "@/collections/(ecommerce)/Products/components/SizeSelect#SizeSelect",
                        },
                        condition: (_, siblingData) => siblingData.variantsType !== "colors",
                      },
                    },
                    {
                      name: "color",
                      index: true,
                      type: "text",
                      label: {
                        en: "Color",
                        cs: "Barva",
                      },
                      admin: {
                        components: {
                          Field: "@/collections/(ecommerce)/Products/components/ColorSelect#ColorSelect",
                        },
                        condition: (_, siblingData) => siblingData.variantsType !== "sizes",
                      },
                    },
                  ],
                },
                {
                  name: "variantSlug",
                  type: "text",
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                },
                {
                  name: "stock",
                  type: "number",
                  admin: {
                    description: {
                      en: "Define stock for this variant. A stock of 0 disables checkout for this variant.",
                      cs: "Definujte sklad pro tuto variantu. Sklad 0 znemožňuje nákup této varianty.",
                    },
                  },
                  defaultValue: 0,
                  required: true,
                },
                {
                  name: "weight",
                  label: {
                    en: "Weight (g)",
                    cs: "Váha (g)",
                  },
                  type: "number",
                  admin: {
                    condition: (data) => Boolean(data.enableVariantWeights),
                    description: {
                      en: "Define weight for this variant.",
                      cs: "Definujte váhu pro tuto variantu.",
                    },
                  },
                  defaultValue: 0,
                  required: true,
                },
                {
                  name: "pricing",
                  type: "array",
                  label: {
                    en: "Pricing",
                    cs: "Ceníky",
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
                    condition: (data) => Boolean(data.enableVariantPrices),
                    components: {
                      RowLabel: "@/components/(ecommerce)/RowLabels/PriceRowLabel#PriceRowLabel",
                    },
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "value",
                          index: true,
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
              minRows: 1,
            },
          ],
        },
        {
          label: {
            en: "Product details",
            cs: "Podrobnosti produktu",
          },
          admin: {
            // todo: not working condition, waiting for payload team to fix conditional tabs.
            // condition: (data) => {
            //   return !data.enableVariants && !data.enableVariantPrices;
            // },
          },
          fields: [
            {
              name: "categoriesArr",
              label: {
                en: "Product categories",
                cs: "Kategorie produktu",
              },
              labels: {
                singular: {
                  en: "Category",
                  cs: "Kategorie",
                },
                plural: {
                  en: "Categories",
                  cs: "Kategorie",
                },
              },
              type: "array",
              fields: [
                {
                  name: "category",
                  label: {
                    en: "Category",
                    cs: "Kategorie",
                  },
                  type: "relationship",
                  index: true,
                  relationTo: "productCategories",
                  required: true,
                },
                {
                  name: "subcategories",
                  index: true,
                  type: "relationship",
                  label: {
                    en: "Subcategories",
                    cs: "Podkategorie",
                  },
                  relationTo: "productSubCategories",
                  filterOptions: ({ siblingData }) => {
                    // eslint-disable-next-line
                    const siblingDataTyped: {
                      category: string;
                      // eslint-disable-next-line
                    } = siblingData as any;
                    return {
                      category: {
                        equals: siblingDataTyped.category,
                      },
                    };
                  },
                  hasMany: true,
                },
              ],
            },
            {
              name: "stock",
              label: {
                en: "Stock",
                cs: "Sklad",
              },
              type: "number",
              admin: {
                condition: (data) => !data.enableVariants,
                description: {
                  en: "Define stock for whole product. A stock of 0 disables checkout for this product.",
                  cs: "Definujte sklad pro celý produkt. Sklad 0 znemožňuje nákup tohoto produktu.",
                },
              },
              defaultValue: 0,
              required: true,
            },
            {
              name: "weight",
              label: {
                en: "Weight (g)",
                cs: "Váha (g)",
              },
              type: "number",
              admin: {
                condition: (data) => !data.enableVariantWeights,
                description: {
                  en: "Define weight for whole product.",
                  cs: "Definujte váhu pro celý produkt.",
                },
              },
              defaultValue: 0,
              required: true,
            },
            {
              name: "pricing",
              type: "array",
              label: {
                en: "Pricing",
                cs: "Ceníky",
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
                condition: (data) => !data.enableVariantPrices,
                components: {
                  RowLabel: "@/components/(ecommerce)/RowLabels/PriceRowLabel#PriceRowLabel",
                },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "value",
                      type: "number",
                      index: true,
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
            {
              name: "bought",
              index: true,
              label: {
                en: "Bought",
                cs: "Koupeno",
              },
              type: "number",
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
