import { type CollectionConfig } from "payload";

import { getChartData } from "@/endpoints/adminDashboard/getChartData";
import { getOrderCount } from "@/endpoints/adminDashboard/getOrderCount";
import { getRevenue } from "@/endpoints/adminDashboard/getRevenue";
import { currencyField } from "@/fields/currencyField";
import { countryList } from "@/globals/(ecommerce)/Couriers/utils/countryList";
import { courierSelectOptions } from "@/globals/(ecommerce)/Couriers/utils/couriersConfig";

import { generateID } from "./hooks/generateID";
import { restoreStocks } from "./hooks/restoreStocks";
import { sendStatusEmail } from "./hooks/sendStatusEmail";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    defaultColumns: ["status", "id", "date", "customer", "orderDetails.totalWithShipping", "extractedFromStock"],
    useAsTitle: "id",
    group: {
      en: "Orders",
      cs: "Objednávky",
    },
    pagination: {
      defaultLimit: 15,
      limits: [10, 15, 20, 30, 50],
    },
  },
  labels: {
    singular: {
      en: "Order",
      cs: "Objednávka",
    },
    plural: {
      en: "Orders",
      cs: "Objednávky",
    },
  },
  hooks: {
    beforeValidate: [generateID],
  },
  endpoints: [
    {
      path: "/revenue",
      method: "post",
      handler: getRevenue,
    },
    {
      path: "/count",
      method: "post",
      handler: getOrderCount,
    },
    {
      path: "/chart",
      method: "get",
      handler: getChartData,
    },
  ],
  fields: [
    {
      name: "id",
      type: "text",
      admin: {
        hidden: true,
      },
      required: true,
      unique: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          label: {
            en: "General",
            cs: "Obecné",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "customer",
                  type: "relationship",
                  relationTo: "customers",
                  label: {
                    en: "Customer",
                    cs: "Klient",
                  },
                },
                {
                  name: "date",
                  label: {
                    en: "Order Date",
                    cs: "Datum objednávky",
                  },
                  type: "date",
                  admin: {
                    date: {
                      pickerAppearance: "dayAndTime",
                    },
                    readOnly: true,
                  },
                },
              ],
            },
            {
              name: "extractedFromStock",
              type: "checkbox",
              admin: {
                hidden: true,
                readOnly: true,
              },
            },
            {
              name: "products",
              type: "array",
              label: { en: "Products", cs: "Produkty" },
              admin: {
                components: {
                  RowLabel: "@/components/(ecommerce)/RowLabels/OrderProductsRowLabel#OrderProductsRowLabel",
                },
              },
              fields: [
                {
                  name: "product",
                  type: "relationship",
                  relationTo: "products",
                },
                {
                  name: "productName",
                  type: "text",
                  admin: {
                    hidden: true,
                    components: {
                      Field: "@/collections/(ecommerce)/Orders/components/ProductNameField#ProductNameField",
                    },
                  },
                },
                {
                  name: "isFromAPI",
                  type: "checkbox",
                  admin: { hidden: true },
                  required: true,
                  defaultValue: false,
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "color",
                      type: "text",
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: "size",
                      type: "text",
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: "variantSlug",
                      type: "text",
                      label: {
                        en: "Variant Slug",
                        cs: "Varianta",
                      },
                      admin: {
                        components: {
                          Field: "@/collections/(ecommerce)/Orders/components/VariantSelect#VariantSelect",
                        },
                        width: "50%",
                      },
                    },
                    {
                      name: "quantity",
                      type: "number",
                      label: {
                        en: "Quantity",
                        cs: "Množství",
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
                      name: "price",
                      type: "number",
                      label: {
                        en: "Price per unit",
                        cs: "Cena za kus",
                      },
                      admin: {
                        components: {
                          Field:
                            "@/collections/(ecommerce)/Orders/components/ProductUnitPriceField#ProductUnitPriceField",
                        },
                        width: "50%",
                      },
                    },
                    {
                      name: "autoprice",
                      type: "checkbox",
                      label: {
                        en: "Auto Price",
                        cs: "Automatická cena",
                      },
                      defaultValue: false,
                      admin: {
                        readOnly: true,
                        hidden: true,
                      },
                    },
                    {
                      name: "priceTotal",
                      type: "number",
                      label: {
                        en: "Price Total",
                        cs: "Cena celkem",
                      },
                      admin: {
                        width: "50%",
                        components: {
                          Field:
                            "@/collections/(ecommerce)/Orders/components/ProductTotalPriceField#ProductTotalPriceField",
                        },
                      },
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: {
            en: "Invoice",
            cs: "Dokument prodeje",
          },
          fields: [
            {
              name: "invoice",
              label: { en: "Invoice data", cs: "Údaje k faktuře" },
              type: "group",
              fields: [
                {
                  name: "isCompany",
                  type: "checkbox",
                  label: {
                    en: "Company",
                    cs: "Firma",
                  },
                },
                {
                  name: "name",
                  type: "text",
                  label: {
                    en: "Name",
                    cs: "Název",
                  },
                },
                {
                  name: "tin",
                  type: "text",
                  label: {
                    en: "TIN",
                    cs: "IČO",
                  },
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData.isCompany),
                  },
                },
                {
                  name: "address",
                  type: "text",
                  label: {
                    en: "Address",
                    cs: "Adresa",
                  },
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
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: {
            en: "Shipping",
            cs: "Doprava",
          },
          fields: [
            {
              name: "printLabel",
              label: { en: "Printing Labels", cs: "Tisk štítků" },
              type: "group",
              fields: [
                {
                  name: "packageNumber",
                  type: "text",
                  admin: {
                    readOnly: true,
                    hidden: true,
                  },
                },
                {
                  name: "pickupShipmentMenu",
                  type: "ui",
                  admin: {
                    condition: (data) =>
                      Boolean(
                        // eslint-disable-next-line
                        ["inpost-pickup", "zasilkovna-box"].includes(data.orderDetails?.shipping)
                      ),
                    components: {
                      Field:
                        "@/collections/(ecommerce)/Orders/components/inpost-pickup/PickupShipmentMenu#PickupShipmentMenu",
                    },
                  },
                },
                {
                  name: "width",
                  type: "number",
                  admin: {
                    hidden: true,
                  },
                  defaultValue: 0,
                },
                {
                  name: "height",
                  type: "number",
                  admin: {
                    hidden: true,
                  },
                  defaultValue: 0,
                },
                {
                  name: "length",
                  type: "number",
                  admin: {
                    hidden: true,
                  },
                  defaultValue: 0,
                },
                {
                  name: "weight",
                  type: "number",
                  admin: {
                    hidden: true,
                  },
                  defaultValue: 0,
                },
                {
                  name: "dimension",
                  type: "text",
                  admin: {
                    hidden: true,
                  },
                  defaultValue: "small",
                },
                {
                  name: "courierShipmentMenu",
                  type: "ui",
                  admin: {
                    // eslint-disable-next-line
                    condition: (data) => data.orderDetails.shipping !== "inpost-pickup",
                    components: {
                      Field:
                        "@/collections/(ecommerce)/Orders/components/couriers/CourierShipmentMenu#CourierShipmentMenu",
                    },
                  },
                },
              ],
            },
            {
              name: "shippingAddress",
              type: "group",
              label: {
                en: "Shipping Address",
                cs: "Dodací adresa",
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
                      name: "pickupPointID",
                      type: "text",
                      label: {
                        en: "Pickup point ID",
                        cs: "ID výdejního místa",
                      },
                      admin: {
                        width: "50%",
                        readOnly: true,
                        // eslint-disable-next-line
                        condition: (data) => data.orderDetails.shipping === "inpost-pickup" || data.orderDetails.shipping === "zasilkovna-box",
                      },
                    },
                    {
                      name: "pickupPointAddress",
                      type: "text",
                      label: {
                        en: "Pickup point address",
                        cs: "Adresa výdejního místa",
                      },
                      admin: {
                        width: "50%",
                        readOnly: true,
                        // eslint-disable-next-line
                        condition: (data) => data.orderDetails.shipping === "inpost-pickup" || data.orderDetails.shipping === "zasilkovna-box",
                      },
                    },
                  ],
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
                        CS: "Email",
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
                        cs: "Telefon",
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
        },
      ],
    },
    {
      name: "orderDetails",
      label: {
        en: "Order Details",
        cs: "Podrobnosti objednávky",
      },
      type: "group",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "total",
              type: "number",
              label: {
                en: "Total (without shipping)",
                cs: "Celkem (bez dopravy)",
              },
              admin: {
                components: {
                  Field:
                    "@/collections/(ecommerce)/Orders/components/OrderTotalPriceField#OrderTotalPriceField",
                },
              },
              required: true,
            },
            {
              name: "shippingCost",
              type: "number",
              label: {
                en: "Shipping Cost",
                cs: "Náklady na dopravu",
              },

              required: true,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "totalWithShipping",
              type: "number",
              label: {
                en: "Total (with shipping)",
                cs: "Celkem (s dopravou)",
              },
              admin: {
                components: {
                  Field:
                    "@/collections/(ecommerce)/Orders/components/OrderTotalWithShippingField#OrderTotalWithShippingField",
                },
                width: "50%",
              },
              required: true,
            },
            currencyField,
          ],
        },
        {
          name: "amountPaid",
          type: "number",
          defaultValue: 0,
          label: { en: "Amount Paid", cs: "Zaplacená částka" },
        },
        {
          name: "shipping",
          type: "select",
          label: {
            en: "Choosen Shipping Method",
            cs: "Vybraná metoda dopravy",
          },
          options: courierSelectOptions,
        },
        {
          name: "transactionID",
          type: "text",
          label: {
            en: "Transaction ID",
            cs: "ID transakce",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "status",
          type: "select",
          label: {
            en: "Status",
            cs: "Status",
          },
          hooks: {
            afterChange: [sendStatusEmail, restoreStocks],
          },
          options: [
            {
              label: {
                en: "Pending",
                cs: "Čekající",
              },
              value: "pending",
            },
            {
              label: {
                en: "Paid",
                cs: "Zaplaceno",
              },
              value: "paid",
            },
            {
              label: {
                en: "Unpaid",
                cs: "Nezaplaceno",
              },
              value: "unpaid",
            },
            {
              label: {
                en: "Processing",
                cs: "Zpracovává se",
              },
              value: "processing",
            },
            {
              label: {
                en: "Shipped",
                cs: "Odesláno",
              },
              value: "shipped",
            },
            {
              label: {
                en: "Completed",
                cs: "Dokončeno",
              },
              value: "completed",
            },
            {
              label: {
                en: "Cancelled",
                cs: "Zrušeno",
              },
              value: "cancelled",
            },
            {
              label: {
                en: "Returned",
                cs: "Vráceno",
              },
              value: "returned",
            },
          ],
          required: true,
          defaultValue: "pending",
        },
        {
          name: "shippingDate",
          label: {
            en: "Shipping Date",
            cs: "Datum odeslání",
          },
          type: "date",
        },
        {
          name: "trackingNumber",
          label: {
            en: "Tracking Number",
            cs: "Číslo zásilky",
          },
          admin: {
            readOnly: true,
          },
          type: "text",
        },
        {
          name: "orderNote",
          label: {
            en: "Order Note",
            cs: "Poznámka k objednávce",
          },
          type: "textarea",
        },
      ],
    },
  ],
};
