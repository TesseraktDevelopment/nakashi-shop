import { noBlocksLexical } from "@/fields/noBlocksLexical";
import { marginFields, paddingFields } from "@/fields/spacingFields";

import type { Block } from "payload";

export const Hotspot: Block = {
  slug: "hotspotZone",
  interfaceName: "hotspotBlock",
  labels: {
    singular: {
      cs: "Hotspot",
      en: "Hotspot",
    },
    plural: {
      cs: "Hotspoty",
      en: "Hotspots",
    },
  },
  //   imageURL: "/blocksThumbnails/accordion.png",
  //   imageAltText: "Hotspot",
  fields: [
    {
      name: "title",
      type: "richText",
      localized: true,
      editor: noBlocksLexical,
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          label: {
            cs: "Typ",
            en: "Type",
          },
          required: true,
          options: [
            { label: { cs: "Z dané kategorie", en: "From category" }, value: "category" },
            { label: { cs: "Z dané podkategorie", en: "From subcategory" }, value: "subcategory" },
            { label: { cs: "Ručně vybrané produkty", en: "Manual picked products" }, value: "manual" },
          ],
          defaultValue: "category",
          admin: {
            width: "50%",
          },
        },
        {
          name: "appearance",
          type: "select",
          label: {
            cs: "Vzhled",
            en: "Appearance",
          },
          required: true,
          options: [
            { label: { cs: "Výchozí", en: "Default" }, value: "default" },
            { label: { cs: "Se sliderem", en: "With slider" }, value: "slider" },
            { label: { cs: "Se smyčkovým sliderem", en: "With infinite slider" }, value: "sliderLoop" },
          ],
          defaultValue: "default",
          admin: {
            width: "50%",
          },
        },
      ],
    },
    {
      type: "row",
      admin: {
        condition: (_, siblingData) => siblingData.type !== "manual",
      },
      fields: [
        {
          name: "category",
          type: "relationship",
          relationTo: "productCategories",
          admin: {
            condition: (_, siblingData) => siblingData.type === "category",
            width: "50%",
          },
        },
        {
          name: "subcategory",
          type: "relationship",
          relationTo: "productSubCategories",
          admin: {
            condition: (_, siblingData) => siblingData.type === "subcategory",
            width: "50%",
          },
        },
        {
          name: "sort",
          type: "select",
          label: {
            cs: "Seřaď podle",
            en: "Sort by",
          },
          options: [
            { label: { cs: "Počet prodaných", en: "Quantity sold" }, value: "-bought" },
            { label: { cs: "Nejnovější", en: "Newest" }, value: "-createdAt" },
            { label: { cs: "Nejstarší", en: "Oldest" }, value: "createdAt" },
            { label: { cs: "Nejlevnější", en: "Cheapest" }, value: "variants.pricing[0].value,pricing.value" },
            {
              label: { cs: "Nejdražší", en: "Most expensive" },
              value: "-variants.pricing[0].value,-pricing.value",
            },
          ],
          admin: {
            condition: (_, siblingData) => siblingData.type !== "manual",
            width: "50%",
            description: {
              en: "Sort is applied only when type is set to 'category' or 'subcategory', in manual mode you can manually sort products in the list",
              cs: "Seřazení se použije pouze v případě, že je typ nastaven na 'category' nebo 'subcategory', v manuálním režimu můžete produkty v seznamu ručně seřadit",
            },
          },
        },
      ],
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      access: {
        read: () => true,
      },
      admin: {
        condition: (_, siblingData) => siblingData.type === "manual",
        description: {
          cs: "Kolejnost produktů bude taková, jak byla vybrána",
          en: "Products order will be the same as the order of selection",
        },
      },
    },
    {
      name: "limit",
      type: "number",
      label: {
        cs: "Limit produktů",
        en: "Products limit",
      },
      admin: {
        condition: (_, siblingData) => siblingData.type !== "manual",
      },
      required: true,
      defaultValue: 4,
    },
    marginFields,
    paddingFields,
  ],
};
