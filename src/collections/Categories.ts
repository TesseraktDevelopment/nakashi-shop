import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";

import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    plural: {
      en: "Posts Categories",
      cs: "Kategorie příspěvků",
    },
    singular: {
      en: "Post Category",
      cs: "Kategorie příspěvků",
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: "title",
    group: {
      en: "Page Settings",
      cs: "Nastavení stránky",
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
  ],
};
