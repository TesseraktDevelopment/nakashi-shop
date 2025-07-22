import { currencyField } from "@/fields/currencyField";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const ShopSettings: GlobalConfig = {
  slug: "shopSettings",
  label: {
    en: "General",
    cs: "Obecné",
  },
  access: {
    read: () => true,
  },
  admin: {
    group: {
      en: "Shop settings",
      cs: "Nastavení obchodu",
    },
  },
  fields: [
    {
      name: "availableCurrencies",
      type: "select",
      label: {
        en: "Available currencies",
        cs: "Dostupné měny",
      },
      options: [
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
        { value: "GBP", label: "GBP" },
        { value: "CZK", label: "CZK" },
      ],
      admin: {
        description: {
          en: "First currency is the default one",
          cs: "První měna je výchozí",
        },
      },
      hasMany: true,
      required: true,
    },
    {
      name: "currencyValues",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            currencyField,
            {
              name: "value",
              type: "number",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "enableOAuth",
      type: "checkbox",
      label: { en: "Enable OAuth", cs: "Povolit OAuth" },
      defaultValue: false,
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal],
  },
};
