import axios, { isAxiosError } from "axios";
import { getLocale } from "next-intl/server";
import { getPayload } from "payload";
import { Builder, Parser } from "xml2js";

import { type Dimensions } from "@/app/(frontend)/next/package/route";
import { type Locale } from "@/i18n/config";
import { type Order } from "@/payload-types";
import { getCachedGlobal } from "@/utilities/getGlobals";
import config from "@payload-config";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PacketaXMLResponse = {
  response: {
    status: "ok" | "fault";
    string?: string;
    fault?: string;
    result?: {
      id: string;
      barcode: string;
      barcodeText?: string;
      status?: {
        code: string;
        name: string;
      };
    };
  };
};

export const createPacketaZBoxShipment = async (
  order: Order,
  dimensions: Dimensions
): Promise<string> => {
  const locale = (await getLocale()) as Locale;
  const packetaSettings = await getCachedGlobal("zasilkovna-box", locale, 1)();
  const { apiPassword, APIUrl } = packetaSettings;
  const { shippingAddress } = order;

  const payload = await getPayload({ config });

  if (!shippingAddress) {
    throw new Error("No shipping address found");
  }

  const requestBody = {
    createPacket: {
      apiPassword,
      packetAttributes: {
        number: order.id,
        ...(order.invoice?.isCompany
          ? { company: shippingAddress.name }
          : {
              name: shippingAddress.name.split(" ")[0],
              surname: shippingAddress.name.split(" ").slice(1).join(" "),
            }),
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        addressId: shippingAddress.pickupPointID,
        cod: 0,
        value: order.orderDetails?.totalWithShipping ?? 0,
        currency: order.orderDetails?.currency ?? "CZK",
        weight: dimensions.weight,
        eshop: "Nakashi Army",
      },
    },
  };

  let rawResponse = "";

  try {
    const builder = new Builder();
    const xmlBody = builder.buildObject(requestBody);

    const response = await axios.post<string>(`${APIUrl}`, xmlBody, {
      headers: {
        "Content-Type": "application/xml",
      },
    });

    rawResponse = response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error("Packeta API error:", error.response?.data ?? error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw new Error("Packeta API call failed");
  }

  const parser = new Parser({ explicitArray: false });

  let parsed: PacketaXMLResponse;
  try {
    parsed = (await parser.parseStringPromise(rawResponse)) as PacketaXMLResponse;
  } catch (err) {
    console.error("Failed to parse XML:", err);
    throw new Error("Invalid XML response from Packeta API");
  }

  if (parsed.response.status === "fault") {
    const errorMsg = parsed.response.string ?? "Unknown Packeta API error";
    throw new Error(`Packeta API Error: ${errorMsg}`);
  }

  const packageID = parsed.response.result?.id;
  const barcode = parsed.response.result?.barcode;

  if (!packageID || !barcode) {
    throw new Error("Missing package ID or barcode in Packeta response");
  }

  // Update order with package ID and barcode
  try {
    await payload.update({
      id: order.id,
      collection: "orders",
      data: {
        orderDetails: {
          trackingNumber: barcode,
        },
        printLabel: {
          packageNumber: packageID,
        },
      },
    });
  } catch (error) {
    console.error("Failed to update order with tracking details:", error);
    throw new Error("Failed to update order with tracking details");
  }

  // Optional: Check shipment status if required
  const checkShipmentStatus = async (maxAttempts = 10): Promise<string> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const shipmentRes = await axios.get<string>(
          `${APIUrl}/packet/${packageID}`,
          {
            headers: {
              Authorization: `Bearer ${apiPassword}`,
            },
            responseType: "text",
          }
        );

        const parsedShipment = (await parser.parseStringPromise(
          shipmentRes.data
        )) as PacketaXMLResponse;

        const result = parsedShipment.response.result;

        if (result?.status?.code === "accepted") {
          console.log("Shipment status confirmed as accepted");
          return packageID;
        }
      } catch {
        console.warn(`Attempt ${attempt + 1} failed while checking shipment status.`);
      }

      await wait(2000);
    }

    console.warn("Shipment status not confirmed as accepted, but barcode already received");
    return packageID; // Return packageID even if status isn't "accepted"
  };

  // Only run checkShipmentStatus if necessary (e.g., if "accepted" status is critical)
  await checkShipmentStatus();

  return packageID;
};
