import { type Field } from "payload";

export const courierSettingsFields: Field[] = [
  { name: "label", type: "text", label: { en: "Label", cs: "Štítek" }, localized: true, required: true },
  {
    name: "description",
    type: "text",
    label: { en: "Short description", cs: "Krátký popis" },
    localized: true,
    admin: {
      description: {
        en: "You can provide typical delivery time or any other information",
        cs: "Můžete poskytnout typický čas doručení nebo jiné informace",
      },
    },
  },
];
