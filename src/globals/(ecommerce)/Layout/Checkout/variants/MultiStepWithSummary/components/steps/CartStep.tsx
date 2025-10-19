"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type ProductWithFilledVariants } from "@/globals/(ecommerce)/Layout/Cart/variants/SlideOver";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";
import { useCart } from "@/stores/CartStore";
import { type Currency } from "@/stores/Currency/types";

import { type FilledCourier, type StepProps } from "./types";

import { OrderSummary } from "../OrderSummary";

export const CartStep = ({
  onNext,
  products,
  totalPrice,
  deliveryMethods,
  selectedDelivery,
}: StepProps & {
  products?: ProductWithFilledVariants[];
  totalPrice?: { currency: Currency; value: number }[];
  deliveryMethods?: FilledCourier[];
  selectedDelivery?: string;
}) => {
  const { cart } = useCart();
  const t = useTranslations("CheckoutSteps.cart");
  const form = useFormContext<CheckoutFormData>();

  const handleContinue = async () => {
    if (cart && cart.length > 0) {
      if (!products || !totalPrice) {
        toast.error(t("fetch-cart-error"));
        return;
      }
      const isValid = await form.trigger("cartProducts");
      if (isValid) {
        onNext();
      } else {
        toast.error(t("validation-error"));
      }
    } else {
      toast.error(t("empty-cart"));
    }
  };

  if (!cart?.length) {
    return (
      <div className="mt-10 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t("empty-cart")}</h2>
        <p className="text-gray-600 mb-6">{t("empty-cart-description")}</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-gray-900 mb-6">{t("review-items")}</h2>

      <div className="space-y-4 mb-8">
        <p className="text-sm text-gray-600">{t("items-count", { count: cart.length })}</p>
        <OrderSummary
          products={products ?? []}
          totalPrice={totalPrice ?? []}
          shippingCost={deliveryMethods?.find((method) => method.slug === selectedDelivery)?.pricing}
          errorMessage={undefined}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleContinue} className="px-8 py-3">
          {t("delivery-payment")}
        </Button>
      </div>
    </div>
  );
};
