"use client";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { InPostGeowidget } from "@/components/(ecommerce)/InPostGeowidget";
import { ZasilkovnaWidget } from "@/components/(ecommerce)/ZasilkovnaWidget";
import { PriceClient } from "@/components/(ecommerce)/PriceClient";
import { Media } from "@/components/Media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";

import { type FilledCourier } from "./CheckoutForm";

interface InPostPoint {
  name?: string;
  address_details: {
    street?: string;
    building_number?: string;
    post_code?: string;
    city?: string;
  };
}

interface ZasilkovnaPoint {
  id: string;
  name: string;
  place: string;
  street: string;
  city: string;
  zip: string;
  formatedValue?: string;
}

type PointSelectEvent = CustomEvent<InPostPoint | ZasilkovnaPoint>;

export const DeliveryMethod = ({
  deliveryMethod,
  geowidgetToken,
  zasilkovnaSettings,
}: {
  deliveryMethod: FilledCourier;
  geowidgetToken?: string;
  zasilkovnaSettings?: {
    apiKey: string;
    countries: string[];
    language: string;
    filterTypes?: string[];
    weight?: string;
    defaultPrice?: string;
    defaultCurrency?: string;
  };
}) => {
  let Additional: ReactNode;
  const t = useTranslations("DeliveryMethods");
  const form = useFormContext<CheckoutFormData>();

  const { title, turnaround, pricing, slug, icon } = deliveryMethod;

  const pickupPointID = useWatch({ control: form.control, name: "shipping.pickupPointID" });
  const pickupPointAddress = useWatch({ control: form.control, name: "shipping.pickupPointAddress" });
  const selectedDeliveryMethod = useWatch({ control: form.control, name: "deliveryMethod" });

  const onPointSelect = (event: PointSelectEvent) => {
    if ("id" in event.detail) {
      // Handle Zásilkovna
      const point = event.detail as ZasilkovnaPoint;
      form.setValue("shipping.pickupPointID", point.id);
      form.setValue(
        "shipping.pickupPointAddress",
        `${point.street}${point.street ? ", " : ""}${point.zip} ${point.city}`,
      );
    } else {
      // Handle InPost
      const point = event.detail as InPostPoint;
      form.setValue("shipping.pickupPointID", point.name ?? "");
      form.setValue(
        "shipping.pickupPointAddress",
        `${point.address_details.street ?? ""} ${point.address_details.building_number ?? ""}${point.address_details.building_number || point.address_details.street ? ", " : ""}${point.address_details.post_code} ${point.address_details.city}`,
      );
    }
  };

  switch (slug) {
    case "inpost-pickup":
      Additional = selectedDeliveryMethod === slug && (
        <div className="mt-2 flex flex-row-reverse">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="tailwind" className="ml-auto w-fit">
                {t("choose-pickup")}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[75dvh] w-[95vw] max-w-(--breakpoint-xl) flex-col sm:w-[80vw]">
              <DialogHeader>
                <DialogTitle>
                  <h2 className="text-lg font-semibold leading-none tracking-tight">{t("choose-pickup")}</h2>
                </DialogTitle>
              </DialogHeader>
              <InPostGeowidget token={geowidgetToken ?? ""} onPointSelect={onPointSelect} />
            </DialogContent>
          </Dialog>

          {pickupPointID && (
            <p className="mr-auto flex items-center text-sm">
              {pickupPointID}, {pickupPointAddress}
            </p>
          )}
        </div>
      );
      break;
    case "zasilkovna-box":
      Additional = selectedDeliveryMethod === slug && (
        <div className="mt-2 flex flex-row-reverse">
          <ZasilkovnaWidget
            apiKey={zasilkovnaSettings?.apiKey ?? ""}
            options={{
              country: zasilkovnaSettings?.countries[0] ?? "cz,sk",
              language: zasilkovnaSettings?.language ?? "cs",
              weight: zasilkovnaSettings?.weight ?? "5",
              valueFormat: '"Packeta",id,carrierId,carrierPickupPointId,name,city,street',
              view: "modal",
              vendors: [
                { country: zasilkovnaSettings?.countries[0] ?? "cz", group: "zbox" },
                { country: zasilkovnaSettings?.countries[1] ?? "sk", group: "zbox" },
              ],
              defaultCurrency: zasilkovnaSettings?.defaultCurrency ?? "CZK",
              defaultPrice: zasilkovnaSettings?.defaultPrice ?? "99",
            }}
            onPointSelect={onPointSelect}
          />

          {pickupPointID && (
            <p className="mr-auto flex items-center text-sm">
              ID: {pickupPointID} // {pickupPointAddress}
            </p>
          )}
        </div>
      );
      break;
    default:
      Additional = null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <span className="flex flex-1 items-center gap-3">
        {icon?.url && <Media resource={icon} className="block aspect-31/24 max-h-12 w-fit max-w-[62px]" />}
        <div className="flex-1">
          <span className="block text-sm font-medium text-gray-900">{title}</span>
          <span className="block items-center text-sm text-gray-500">{turnaround}</span>
        </div>
        <span className="ml-auto text-right text-sm font-medium text-gray-900">
          <PriceClient pricing={pricing ?? []} />
        </span>
      </span>
      {Additional}
    </div>
  );
};
