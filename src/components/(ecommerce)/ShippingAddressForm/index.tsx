"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type CheckoutFormData } from "@/schemas/checkoutForm.schema";

export const ShippingAddressForm = () => {
  const form = useFormContext<CheckoutFormData>();
  const t = useTranslations("CheckoutForm.form");
  const c = useTranslations("CheckoutForm.countries");

  const formatPostalCode = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length > 5) {
      return digits.slice(0, 5);
    }
    if (digits.length >= 4) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return digits;
  };

  useEffect(() => {
    const phoneInput = document.getElementById("phone") as HTMLInputElement;
    if (!phoneInput) return;

    const handleInput = () => {
      let value = phoneInput.value.trim().replace(/\s/g, "");
      if (!value) {
        form.setValue("shipping.phone", "", { shouldValidate: true });
        return;
      }
      if (/^\d+$/.test(value)) {
        value = `+${value}`;
      }

      //TODO: Wrong Slovak phone number validation
      const country = form.watch("shipping.country") || "cz";
      if (country === "cz" || country === "sk") {
        const prefix = country === "cz" ? "+420" : "+421";
        if (value.startsWith(prefix) && /^\+\d{12}$/.test(value)) {
          // Formátovat na +420 123 456 789 nebo +421 123 456 789
          const formatted = value.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
          phoneInput.value = formatted;
          form.setValue("shipping.phone", formatted, { shouldValidate: true });
          form.clearErrors("shipping.phone");
        } else {
          form.setValue("shipping.phone", value, { shouldValidate: true });
          if (value) {
            form.setError("shipping.phone", {
              type: "manual",
              message: t("shipping.phone"),
            });
          }
        }
      } else {
        form.setValue("shipping.phone", value, { shouldValidate: true });
        if (!/^\+\d+$/.test(value)) {
          form.setError("shipping.phone", {
            type: "manual",
            message: t("shipping.phone"),
          });
        } else {
          form.clearErrors("shipping.phone");
        }
      }
    };

    phoneInput.addEventListener("input", handleInput);
    return () => phoneInput.removeEventListener("input", handleInput);
  }, [form, t]);

  return (
    <>
      <FormField
        control={form.control}
        name="shipping.name"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel htmlFor="name">{t("full-name")}</FormLabel>
            <FormControl>
              <Input placeholder={t("full-name-placeholder")} id="name" autoComplete="name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="shipping.address"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel htmlFor="street-address">{t("address")}</FormLabel>
            <FormControl>
              <Input placeholder={t("address-placeholder")} id="street-address" autoComplete="street-address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="shipping.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="address-level2">{t("city")}</FormLabel>
            <FormControl>
              <Input placeholder={t("city-placeholder")} id="address-level2" autoComplete="address-level2" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="shipping.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="country-select">{t("country")}</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} autoComplete="country" defaultValue={field.value ?? "cz"}>
                <FormControl>
                  <SelectTrigger id="country-select" className="w-full appearance-none rounded-md bg-white py-2 pr-3 text-base text-gray-900 outline-solid outline-1 -outline-offset-1 outline-gray-300 focus:outline-solid focus:outline-2 focus:-outline-offset-2 focus:outline-main-600 focus:ring-0 focus:ring-offset-0 sm:text-sm/6">
                    <SelectValue placeholder={t("country-placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cz">{c("cz")}</SelectItem>
                  <SelectItem value="sk">{c("sk")}</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shipping.region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("region")}</FormLabel>
            <FormControl>
              <Input placeholder={t("region-placeholder")} data-1p-ignore autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="shipping.postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="postal-code">{t("postal-code")}</FormLabel>
            <FormControl>
              <Input placeholder={t("postal-code-placeholder")} id="postal-code" autoComplete="postal-code" {...field} onChange={(e) => { const formattedValue = formatPostalCode(e.target.value); field.onChange(formattedValue); }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shipping.phone"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel htmlFor="phone">{t("phone")}</FormLabel>
            <FormControl>
              <Input placeholder={t("phone-placeholder")} id="phone" type="tel" autoComplete="tel tel-international tel-country-code" {...field} onChange={(e) => { field.onChange(e); }}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="shipping.email"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel htmlFor="email">{t("email")}</FormLabel>
            <FormControl>
              <Input placeholder={t("email-placeholder")} id="email" type="email" autoComplete="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
