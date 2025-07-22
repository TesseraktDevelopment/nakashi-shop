import { type GlobalConfig } from "payload";

import { countryList } from "../Couriers/utils/countryList";

export const Fulfilment: GlobalConfig = {
  slug: "fulfilment",
  admin: {
    group: {
      en: "Orders",
      cs: "Objednávky",
    },
  },
  label: {
    en: "Fulfilment data",
    cs: "Údaje o plnění",
  },
  fields: [
    {
      name: "shopAddress",
      type: "group",
      label: {
        en: "Shop Address",
        cs: "Adresa obchodu",
      },
      fields: [
        {
          name: "name",
          type: "text",
          label: {
            en: "Name",
            cs: "Název",
          },
          required: true,
        },
        {
          name: "address",
          type: "text",
          label: {
            en: "Address",
            cs: "Adresa",
          },
          required: true,
        },
        {
          type: "row",
          fields: [
            {
              name: "city",
              type: "text",
              label: {
                en: "City",
                cs: "Město",
              },
              admin: {
                width: "50%",
              },
              required: true,
            },
            {
              name: "country",
              type: "select",
              label: {
                en: "Country",
                cs: "Země",
              },
              options: [...countryList],
              admin: {
                width: "50%",
              },
              required: true,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "region",
              type: "text",
              label: {
                en: "Region",
                cs: "Kraj",
              },
              admin: {
                width: "50%",
              },
              required: true,
            },
            {
              name: "postalCode",
              type: "text",
              label: {
                en: "Postal Code",
                cs: "PSČ",
              },
              admin: {
                width: "50%",
              },
              required: true,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "email",
              type: "text",
              label: {
                en: "Email",
                cs: "Email",
              },
              admin: {
                width: "50%",
              },
              required: true,
            },
            {
              name: "phone",
              type: "text",
              label: {
                en: "Phone number",
                cs: "Telefonní číslo",
              },
              admin: {
                width: "50%",
              },
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
