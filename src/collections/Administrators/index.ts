import { authenticated } from "@/access/authenticated";

import type { CollectionConfig } from "payload";

export const Administrators: CollectionConfig = {
  slug: "administrators",
  labels: {
    singular: {
      en: "Administrator",
      cs: "Administrátor",
    },
    plural: {
      en: "Administrators",
      cs: "Administrátoři",
    },
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
    group: {
      en: "Page Settings",
      cs: "Nastavení stránky",
    },
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
  timestamps: true,
};
