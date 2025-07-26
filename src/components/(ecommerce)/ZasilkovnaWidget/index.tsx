"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type PacketaWidget = {
  pick: (
    apiKey: string,
    callback: (point: ZasilkovnaPoint | null) => void,
    options: ZasilkovnaWidgetOptions
  ) => void;
}

type Packeta = {
  Widget: PacketaWidget;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    Packeta?: Packeta;
  }
}

type ZasilkovnaPoint = {
  id: string;
  name: string;
  place: string;
  street: string;
  city: string;
  zip: string;
  formatedValue?: string;
}

type ZasilkovnaWidgetOptions = {
  country: string;
  language: string;
  weight?: string;
  valueFormat?: string;
  view?: string;
  vendors?: { country: string; group?: string }[];
  defaultCurrency?: string;
  defaultPrice?: string;
}

type ZasilkovnaWidgetProps = {
  apiKey: string;
  options: ZasilkovnaWidgetOptions;
  onPointSelect: (e: CustomEvent<ZasilkovnaPoint>) => void;
}

const ZasilkovnaWrapper = ({ apiKey, options, onPointSelect }: ZasilkovnaWidgetProps) => {
  const t = useTranslations("DeliveryMethods");
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://widget.packeta.com/v6/www/js/library.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        scriptLoaded.current = true;
      };

      script.onerror = () => {
        console.error("Failed to load Packeta widget script");
      };

      return () => {
        document.head.removeChild(script);
        scriptLoaded.current = false;
      };
    }
  }, []);

  const openWidget = () => {
    if (window.Packeta?.Widget) {
      try {
        window.Packeta.Widget.pick(
          apiKey,
          (point: ZasilkovnaPoint | null) => {
            if (point) {
              const event = new CustomEvent("onZasilkovnaPointSelect", { detail: point });
              document.dispatchEvent(event);
            }
          },
          options
        );
      } catch (error) {
        console.error("Failed to open Packeta widget:", error);
      }
    } else {
      console.error("Packeta widget not available");
    }
  };

  useEffect(() => {
    document.addEventListener("onZasilkovnaPointSelect", onPointSelect as EventListener);

    return () => {
      document.removeEventListener("onZasilkovnaPointSelect", onPointSelect as EventListener);
    };
  }, [onPointSelect]);

  return (
    <Button type="button" variant="tailwind" className="ml-auto w-fit" onClick={openWidget}>
      {t("choose-pickup")}
     </Button>
  );
};

export const ZasilkovnaWidget = dynamic(() => Promise.resolve(ZasilkovnaWrapper), {
  ssr: false,
});
