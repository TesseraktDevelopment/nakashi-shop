import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { Accordion } from "@/blocks/Accordion/config";
import { Banner } from "@/blocks/Banner/config";
import { Carousel } from "@/blocks/Carousel/config";
import { Code } from "@/blocks/Code/config";
import { FormBlock } from "@/blocks/Form/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { revalidateGlobal } from "@/hooks/revalidateGlobal";

import type { GlobalConfig } from "payload";

export const ShopLayout: GlobalConfig = {
  slug: "shopLayout",
  label: {
    en: "Shop Layout",
    cs: "Rozložení obchodu",
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
      type: "tabs",
      tabs: [
        {
          label: {
            en: "Product Details",
            cs: "Podrobnosti produktu",
          },
          name: "productDetails",
          fields: [
            {
              name: "type",
              type: "select",
              options: [
                {
                  label: {
                    en: "With image gallery and expandable details",
                    cs: "S galerií obrázků a rozbalitelnými podrobnostmi",
                  },
                  value: "WithImageGalleryExpandableDetails",
                },
              ],
              label: {
                en: "Type of product card",
                cs: "Typ karty produktu",
              },
              required: true,
              defaultValue: "WithImageGalleryExpandableDetails",
            },
            {
              name: "reviewsEnabled",
              type: "checkbox",
              label: {
                en: "Enable product reviews",
                cs: "Povolit recenze produktu",
              },
              defaultValue: true,
              required: true,
            },
          ],
        },
        {
          label: {
            en: "Product List",
            cs: "Seznam produktů",
          },
          name: "productList",
          fields: [
            {
              name: "filters",
              type: "select",
              label: {
                en: "Filters",
                cs: "Filtry",
              },
              required: true,
              options: [
                {
                  label: {
                    en: "None",
                    cs: "Žádné",
                  },
                  value: "none",
                },
                {
                  label: {
                    en: "With sidebar",
                    cs: "S bočním panelem",
                  },
                  value: "withSidebar",
                },
                {
                  label: {
                    en: "Sort only",
                    cs: "Pouze řazení",
                  },
                  value: "sortOnly",
                },
              ],
            },
          ],
        },
        {
          label: {
            en: "Cart and Wishlist",
            cs: "Košík a seznam přání",
          },
          name: "cartAndWishlist",
          fields: [
            {
              name: "type",
              type: "select",
              options: [
                {
                  label: {
                    en: "Slide-over",
                    cs: "Vysouvací",
                  },
                  value: "slideOver",
                },
              ],
              label: {
                en: "Type of cart and wishlist",
                cs: "Typ košíku a seznamu přání",
              },
              defaultValue: "slideOver",
              required: true,
            },
          ],
        },
        {
          label: {
            en: "Checkout page",
            cs: "Stránka pokladny",
          },
          name: "checkout",
          fields: [
            {
              name: "type",
              type: "select",
              options: [
                {
                  label: {
                    en: "One Step With Summary",
                    cs: "Jeden krok s přehledem",
                  },
                  value: "OneStepWithSummary",
                },
              ],
              label: {
                en: "Type of checkout page",
                cs: "Typ stránky pokladny",
              },
              required: true,
              defaultValue: "OneStepWithSummary",
            },
          ],
        },
        {
          label: {
            en: "Client panel",
            cs: "Klientský panel",
          },
          name: "clientPanel",
          fields: [
            {
              name: "type",
              type: "select",
              options: [
                {
                  label: {
                    en: "With sidebar",
                    cs: "S bočním panelem",
                  },
                  value: "withSidebar",
                },
              ],
              label: {
                en: "Type of client panel",
                cs: "Typ klientského panelu",
              },
              required: true,
              defaultValue: "withSidebar",
            },
            {
              name: "help",
              type: "group",
              label: {
                en: "Help page",
                cs: "Stránka nápovědy",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: {
                    en: "Title",
                    cs: "Název",
                  },
                  localized: true,
                  required: true,
                },
                {
                  name: "content",
                  type: "richText",
                  editor: lexicalEditor({
                    features: ({ rootFeatures }) => {
                      return [
                        ...rootFeatures,
                        HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
                        BlocksFeature({ blocks: [Banner, Code, MediaBlock, Accordion, Carousel, FormBlock] }),
                        FixedToolbarFeature(),
                        InlineToolbarFeature(),
                        HorizontalRuleFeature(),
                      ];
                    },
                  }),
                  label: {
                    en: "Content",
                    cs: "Obsah",
                  },
                  localized: true,
                  required: true,
                },
              ],
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
