import { authenticated } from "@/access/authenticated";
import { courierFields } from "@/fields/courierFields";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const ZasilkovnaBox: GlobalConfig = {
  slug: "zasilkovna-box",
  label: {
    cs: "Zásilkovna Box",
    en: "Packeta Box",
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
            en: "Packeta",
            cs: "Zásilkovna",
          },
          fields: courierFields,
        },
        {
          label: {
            en: "API Keys",
            cs: "API Klíče",
          },
          fields: [
            {
              name: "apiKey",
              type: "text",
              label: {
                en: "API Key",
                cs: "API Klíč",
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
              defaultValue: "https://www.zasilkovna.cz/api/rest",
              options: [
                {
                  label: {
                    en: "Production",
                    cs: "Produkce",
                  },
                  value: "https://www.zasilkovna.cz/api/rest",
                },
              ],
              admin: {
                condition: (data) => Boolean(data.enabled),
                description: {
                  en: "Remember to pass matching keys for choosen environment",
                  cs: "Nezapomeňte předat odpovídající klíče pro vybrané prostředí",
                },
              },
            },
                        {
              name: "widgetVersion",
              type: "select",
              label: {
                en: "Widget version",
                cs: "Verze widgetu",
              },
              access: {
                read: authenticated,
                create: authenticated,
                update: authenticated,
              },
              required: false,
              defaultValue: "https://widget.packeta.com/v6/",
              options: [
                {
                  label: {
                    en: "V6 (latest)",
                    cs: "V6 (nejnovější)",
                  },
                  value: "https://widget.packeta.com/v6/",
                },
              ],
              admin: {
                condition: (data) => Boolean(data.enabled),
              },
            },
            {
              name: "apiPassword",
              type: "text",
              label: {
                en: "API Password",
                cs: "API Heslo",
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
              name: "sender",
              type: "text",
              label: {
                en: "Sender",
                cs: "Označení odesílatele",
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
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal],
  },
};
