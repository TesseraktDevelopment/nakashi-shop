import { revalidateTag } from "next/cache";
import { type CollectionConfig } from "payload";

import { countryList } from "@/globals/(ecommerce)/Couriers/utils/countryList";

import { createTokenAndSendEmail } from "./hooks/createTokenAndSendEmail";

export const Customers: CollectionConfig = {
  slug: "customers",
  access: {
    create: () => true,
  },
  labels: {
    singular: {
      en: "Customer",
      cs: "Zákazník",
    },
    plural: {
      en: "Customers list",
      cs: "Seznam zákazníků",
    },
  },
  admin: {
    group: {
      en: "Clients",
      cs: "Zákazníci",
    },
    defaultColumns: ["fullName", "email", "createdAt", "updatedAt"],
    useAsTitle: "fullName",
  },
  auth: {
    maxLoginAttempts: 30,
    lockTime: 30 * 1000,
    verify: true,
  },
  hooks: {
    afterOperation: [createTokenAndSendEmail],
    afterLogin: [
      async () => {
        revalidateTag("user-auth");
      },
    ],
    beforeChange: [
      async ({ data }) => {
        return { ...data, fullName: `${data.firstName} ${data.lastName}` };
      },
    ],
  },
  fields: [
    {
      name: "fullName",
      type: "text",
      admin: {
        hidden: true,
      },
      // virtual: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "firstName",
          label: {
            en: "First Name",
            cs: "Jméno",
          },
          type: "text",
        },
        {
          name: "lastName",
          label: {
            en: "Last Name",
            cs: "Příjmení",
          },
          type: "text",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "birthDate",
          label: {
            en: "Birth Date",
            cs: "Datum narození",
          },
          type: "date",
          admin: {
            width: "50%",
          },
        },
        {
          name: "lastBuyerType",
          label: {
            en: "Last Buyer Type",
            cs: "Poslední typ zákazníka",
          },
          type: "select",
          admin: {
            width: "50%",
          },
          options: [
            { value: "individual", label: { en: "Individual", cs: "Fyzická osoba" } },
            { value: "company", label: { en: "Company", cs: "Firma" } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "stripeCustomerId",
          label: {
            en: "Stripe Customer ID",
            cs: "Stripe ID zákazníka",
          },
          type: "text",
          admin: {
            width: "50%",
          },
        },
      ],
    },
    {
      name: "shippings",
      type: "array",
      label: {
        en: "Shipping addresses",
        cs: "Adresy doručení",
      },
      labels: {
        singular: {
          en: "Shipping address",
          cs: "Dodací adresa",
        },
        plural: {
          en: "Shipping addresses",
          cs: "Dodací adresy",
        },
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel:
            "@/collections/(ecommerce)/Customers/ui/RowLabels/ShippingAddressRowLabel#ShippingAddressRowLabel",
        },
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
              admin: {
                width: "50%",
              },
              options: [...countryList],
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
              required: true,
            },
            {
              name: "postalCode",
              type: "text",
              label: {
                en: "Postal Code",
                cs: "PSČ",
              },
              required: true,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "phone",
              type: "text",
              label: {
                en: "Phone",
                cs: "Telefon",
              },
              required: true,
            },
            {
              name: "email",
              type: "text",
              label: {
                en: "Email",
                cs: "Email",
              },
              required: true,
            },
          ],
        },
        {
          name: "default",
          type: "checkbox",
          label: {
            en: "Default",
            cs: "Výchozí",
          },
          defaultValue: false,
        },
      ],
    },
    {
      name: "orders",
      label: {
        en: "Customer Orders",
        cs: "Objednávky zákazníka",
      },
      type: "join",
      collection: "orders",
      on: "customer",
    },
    {
      name: "cart",
      type: "json",
      label: {
        en: "Cart",
        cs: "Košík",
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: "wishlist",
      type: "json",
      label: {
        en: "Wishlist",
        cs: "Seznam přání",
      },
      admin: {
        hidden: true,
      },
    },
  ],
};
