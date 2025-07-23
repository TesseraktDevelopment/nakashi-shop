import { authenticated } from "@/access/authenticated";
import { courierFields } from "@/fields/courierFields";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const InPostPickup: GlobalConfig = {
  slug: "inpost-pickup",
  label: {
    en: "InPost Pickup",
    cs: "InPost Pickup",
  },
  access: {
    read: () => true,
  },
  admin: {
    group: {
      en: "Courier integrations",
      cs: "Kurýři",
    },
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: {
            en: "Parcel lockers 24/7",
            cs: "Box 24/7",
          },
          fields: courierFields,
        },

        {
          label: {
            en: "API Keys",
            cs: "Klíče API",
          },
          fields: [
            {
              name: "clientId",
              type: "text",
              label: {
                en: "Client ID",
                cs: "ID Klienta",
              },
              access: {
                read: authenticated,
                create: authenticated,
                update: authenticated,
              },
              required: true,
              admin: {
                condition: (data) => Boolean(data.enabled),
              },
            },
            {
              name: "APIUrl",
              type: "select",
              label: {
                en: "Environment",
                cs: "Prostředí",
              },
              access: {
                read: authenticated,
                create: authenticated,
                update: authenticated,
              },
              required: true,
              defaultValue: "https://api-shipx-pl.easypack24.net",
              options: [
                {
                  label: {
                    en: "Production",
                    cs: "Produkce",
                  },
                  value: "https://api-shipx-pl.easypack24.net",
                },
                {
                  label: {
                    en: "Sandbox",
                    cs: "Sandbox",
                  },
                  value: "https://sandbox-api-shipx-pl.easypack24.net",
                },
              ],
              admin: {
                condition: (data) => Boolean(data.enabled),
                description: {
                  en: "Remember to pass matching keys for choosen environment",
                  cs: "Nezapomeňte zadat odpovídající klíče pro vybrané prostředí",
                },
              },
            },
            {
              name: "shipXAPIKey",
              type: "text",
              label: {
                en: "API ShipX key",
                cs: "Klíč API ShipX",
              },
              access: {
                read: authenticated,
                create: authenticated,
                update: authenticated,
              },
              required: true,
              admin: {
                condition: (data) => Boolean(data.enabled),
              },
            },
            {
              name: "geowidgetToken",
              type: "text",
              label: {
                en: "Geowidget Token",
                pl: "Token Geowidget",
              },
              access: {
                read: () => true,
                create: authenticated,
                update: authenticated,
              },
              required: true,
              admin: {
                condition: (data) => Boolean(data.enabled),
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal],
  },
};
