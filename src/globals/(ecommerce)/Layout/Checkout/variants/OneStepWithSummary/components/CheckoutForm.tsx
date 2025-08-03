"use client";

import { Button, Radio, RadioGroup } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios";
import debounce from "lodash.debounce";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ShippingAddressForm } from "@/components/(ecommerce)/ShippingAddressForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Country } from "@/globals/(ecommerce)/Couriers/utils/countryList";
import { type ProductWithFilledVariants } from "@/globals/(ecommerce)/Layout/Cart/variants/SlideOver";
import { type Locale } from "@/i18n/config";
import { useRouter } from "@/i18n/routing";
import { type Customer, type Media } from "@/payload-types";
import { type CheckoutFormData, useCheckoutFormSchema } from "@/schemas/checkoutForm.schema";
import { useCart } from "@/stores/CartStore";
import { type Cart } from "@/stores/CartStore/types";
import { useCurrency } from "@/stores/Currency";
import { type Currency } from "@/stores/Currency/types";

import { AddNewAddressDialog } from "./AddNewAddressDialog";
import { ChangeAddressDialog } from "./ChangeAddressDialog";
import { DeliveryMethod } from "./DeliveryMethod";
import { OrderSummary } from "./OrderSummary";

type AresResponse = {
  obchodniJmeno?: string;
  sidlo?: {
    nazevUlice?: string;
    cisloDomovni?: string;
    textovaAdresa?: string;
    nazevObce?: string;
    psc?: number;
    nazevKraje?: string;
  };
  ico?: string;
};

export type FilledCourier = {
  slug: string;
  title: string;
  turnaround: string;
  icon?: Media;
  pricing: { value: number; currency: Currency; id?: string | null }[] | undefined;
};

export type PaymentMethod = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  disabled?: boolean;
  recommended?: boolean;
};

export const CheckoutForm = ({ user, geowidgetToken }: { user?: Customer; geowidgetToken?: string; }) => {
  const { CheckoutFormSchemaResolver } = useCheckoutFormSchema();
  const t = useTranslations("CheckoutForm.form");
  const c = useTranslations("CheckoutForm.countries");
  const e = useTranslations("CheckoutForm.errors");

  const shippingAddresses = user?.shippings?.length ? user.shippings : null;
  const defaultShippingAddress = useMemo(
    () => shippingAddresses?.find((address) => address.default) ?? shippingAddresses?.[0] ?? null,
    [shippingAddresses],
  );

  const formatPostalCode = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length > 5) return digits.slice(0, 5);
    if (digits.length >= 4) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return digits;
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchemaResolver),
    defaultValues: {
      buyerType: user?.lastBuyerType ?? "individual",
      individualInvoice: false,
      invoice: {
        name: "",
        address: "",
        city: "",
        country: "cz",
        region: "",
        postalCode: "",
        tin: "",
      },
      shipping: {
        id: defaultShippingAddress?.id ?? "",
        name: defaultShippingAddress?.name ?? "",
        address: defaultShippingAddress?.address ?? "",
        city: defaultShippingAddress?.city ?? "",
        country: defaultShippingAddress?.country ?? "cz",
        region: defaultShippingAddress?.region ?? "",
        postalCode: defaultShippingAddress?.postalCode ?? "",
        phone: defaultShippingAddress?.phone ?? "",
        email: defaultShippingAddress?.email ?? "",
        pickupPointID: "",
        pickupPointName: "",
        pickupPointAddress: "",
      },
      deliveryMethod: "",
      paymentMethod: "stripe",
    },
  });

  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [addShippingDialogOpen, setAddShippingDialogOpen] = useState(false);
  const [isLoadingAresOrsr, setIsLoadingAresOrsr] = useState(false);
  const [aresOrsrError, setAresOrsrError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const wantsInvoice = useWatch({ control: form.control, name: "individualInvoice" });
  const isCompany = useWatch({ control: form.control, name: "buyerType" }) === "company";
  const selectedDelivery = useWatch({ control: form.control, name: "deliveryMethod" });
  const shipping = useWatch({ control: form.control, name: "shipping" });
  const invoiceCountry = useWatch({ control: form.control, name: "invoice.country" });

  const [checkoutProducts, setCheckoutProducts] = useState<ProductWithFilledVariants[] | null>(null);
  const [totalPrice, setTotalPrice] = useState<{ currency: Currency; value: number }[] | null>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<FilledCourier[]>([]);
  const paymentMethods = useMemo<PaymentMethod[]>( () => [
    { id: "stripe", title: "Stripe", description: "Bezpečná a rychlá platební brána", icon: "https://cdn.nakashi.cz/nakashi/stripe.svg", recommended: true },
    { id: "bank_transfer", title: "Bankovní převod", description: "Platba předem na účet", icon: "", disabled: true },
    { id: "cash_on_delivery", title: "Dobírka", description: "Platba při doručení", icon: "", disabled: true },
  ],[] );

  const { cart, setCart } = useCart();
  const locale = useLocale() as Locale;
  const currency = useCurrency();
  const router = useRouter();

  const fetchCartProducts = useCallback(
    async (cartToCalculate: Cart | null, countryToCalculate: string) => {
      try {
        const { data } = await axios.post<{
          status: number;
          productsWithTotalAndCouriers: {
            filledProducts: ProductWithFilledVariants[];
            total: { currency: Currency; value: number }[];
            totalQuantity: number;
            couriers: FilledCourier[];
          };
        }>("/next/checkout", { cart: cartToCalculate, selectedCountry: countryToCalculate, locale });
        const { filledProducts, total, couriers } = data.productsWithTotalAndCouriers;
        setCheckoutProducts(filledProducts);
        setDeliveryMethods(couriers);
        setTotalPrice(total);
      } catch (error) {
        console.error("Failed to fetch cart products:", error);
        setErrorMessage(t("fetch-cart-error"));
      }
    },
    [locale, t],
  );

  const debouncedFetchCartProducts = useMemo(
    () => debounce(fetchCartProducts, 300, { leading: false, trailing: true }),
    [fetchCartProducts],
  );

  useEffect(() => {
    void debouncedFetchCartProducts(cart, shipping.country);
    return () => debouncedFetchCartProducts.cancel();
  }, [cart, debouncedFetchCartProducts, shipping.country]);

  const fetchAresOrsrData = useCallback(
    async (ico: string, country: "cz" | "sk") => {
      setIsLoadingAresOrsr(true);
      setAresOrsrError(null);

      if (country === "cz" && !/^\d{8}$/.test(ico)) {
        setAresOrsrError(e("invoice.tinInvalid"));
        setIsLoadingAresOrsr(false);
        return;
      }
      if (country === "sk" && !/^\d{10}$/.test(ico)) {
        setAresOrsrError(e("invoice.tinInvalid"));
        setIsLoadingAresOrsr(false);
        return;
      }
      try {
        if (country === "cz") {
          const response = await axios.get<AresResponse>(`/next/services/ares?ico=${ico}`, {
            headers: { accept: "application/json" },
          });
          const data = response.data;
          if (data?.obchodniJmeno) {
            form.setValue("invoice.name", data.obchodniJmeno ?? "");
            form.setValue(
              "invoice.address",
              `${data.sidlo?.nazevUlice ?? ""} ${data.sidlo?.cisloDomovni ?? ""}`.trim() ?? data.sidlo?.textovaAdresa ?? "",
            );
            form.setValue("invoice.city", data.sidlo?.nazevObce ?? "");
            form.setValue("invoice.country", "cz");
            form.setValue("invoice.postalCode", data.sidlo?.psc ? String(data.sidlo.psc) : "");
            form.setValue("invoice.region", data.sidlo?.nazevKraje ?? "");
            form.setValue("invoice.tin", data.ico ?? ico);
            form.clearErrors("invoice");
          } else {
            setAresOrsrError(e("invoice.tinNotFound"));
          }
        } else if (country === "sk") {
          setAresOrsrError(e("invoice.tinNotFound"));
        }
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 429) {
            setAresOrsrError(e("invoice.tooManyRequests"));
          } else if (error.response?.status === 400) {
            setAresOrsrError(e("invoice.tinInvalid"));
          } else {
            setAresOrsrError(e("invoice.tinNotFound"));
          }
        }
        console.error("ARES/ORSR error:", error);
      } finally {
        setIsLoadingAresOrsr(false);
      }
    },
    [form, e],
  );

  const onSubmit = async (values: CheckoutFormData) => {
    try {
      const { data } = await axios.post<{ status: number; url?: string; message?: string; error?: string }>(
        "/next/payment",
        {
          cart,
          selectedCountry: shipping.country,
          checkoutData: values,
          locale,
          currency: currency.currency,
        },
      );
      if (data.status === 200 && data.url) {
        setCart(null);
        router.push(data.url);
      } else {
        setErrorMessage(data.error ?? t("internal-server-error"));
      }
    } catch (error) {
      setErrorMessage(t("internal-server-error"));
      console.error("Payment error:", error);
    }
  };

  return (
    <>
      {user && (
        <AddNewAddressDialog
          open={addShippingDialogOpen}
          setOpen={setAddShippingDialogOpen}
          user={user}
          setShipping={(shipping) => form.setValue("shipping", shipping)}
        />
      )}
      {user && shippingAddresses && (
        <ChangeAddressDialog
          open={shippingDialogOpen}
          setOpen={setShippingDialogOpen}
          setAddShippingDialogOpen={setAddShippingDialogOpen}
          shippingAddresses={shippingAddresses}
          selectedID={shipping.id}
          setShipping={(shipping) => form.setValue("shipping", shipping)}
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {form.formState.errors.root && (
            <div className="col-span-2 mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}
          <div>
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-lg font-medium text-gray-900">{t("buy-as")}</h2>
              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Tabs defaultValue="individual" value={field.value} onValueChange={field.onChange} className="my-4">
                        <TabsList className="w-full">
                          <TabsTrigger className="w-1/2 cursor-pointer" value="individual">
                            {t("individual")}
                          </TabsTrigger>
                          <TabsTrigger className="w-1/2 cursor-pointer" value="company">
                            {t("company")}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <h2 className="text-lg font-medium text-gray-900">{t("shipping-address")}</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                {shippingAddresses ? (
                  <div
                    className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-xs ring-2 ring-main-500"
                    role="button"
                    tabIndex={0}
                    onClick={() => setShippingDialogOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setShippingDialogOpen(true)}
                  >
                    <span className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-gray-900">{shipping.name}</span>
                      <span className="mt-1 text-sm text-gray-500">{shipping.address}</span>
                      <span className="mt-1 text-sm font-medium text-gray-500">
                        {shipping.postalCode}, {shipping.city}, {c(shipping.country as Country)}
                      </span>
                      <span className="mt-1 text-sm text-gray-500">{shipping.phone}</span>
                      <span className="mt-1 text-sm text-gray-500">{shipping.email}</span>
                      <Button type="button" className="ml-auto mt-1 text-sm text-main-600">
                        {t("change")}
                      </Button>
                    </span>
                  </div>
                ) : (
                  <ShippingAddressForm />
                )}
                {!isCompany && (
                  <FormField
                    control={form.control}
                    name="individualInvoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 sm:col-span-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t("individual-invoice")}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                {(wantsInvoice || isCompany) && (
                  <>
                    <h2 className="text-lg font-medium text-gray-900 sm:col-span-2">{t("invoice-data")}</h2>
                    <FormField
                      control={form.control}
                      name="invoice.name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t("full-name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("full-name-placeholder")} autoComplete="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isCompany && (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t("tin")}</FormLabel>
                        <div className="flex items-center gap-x-2">
                          <FormField
                            control={form.control}
                            name="invoice.tin"
                            render={({ field }) => (
                              <>
                                <FormControl>
                                  <Input
                                    placeholder={t("tin-placeholder")}
                                    autoComplete="off"
                                    required
                                    maxLength={11}
                                    pattern="[0-9]*"
                                    {...field}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, "");
                                      if (value.length <= 10) field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  disabled={
                                    isLoadingAresOrsr ||
                                    !field.value ||
                                    field.value.trim().length < 8 ||
                                    field.value.trim().length > 10
                                  }
                                  onClick={() => fetchAresOrsrData((field.value ?? "").trim(), invoiceCountry as "cz" | "sk")}
                                  className="h-10 w-[45%] rounded-md border border-transparent bg-white text-sm font-medium text-main-600 outline outline-gray-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-800"
                                >
                                  {isLoadingAresOrsr ? t("loading") : t("fill-from-ares-orsr")}
                                </Button>
                              </>
                            )}
                          />
                        </div>
                        <FormMessage />
                        {aresOrsrError && <p className="text-sm text-red-600">{aresOrsrError}</p>}
                      </FormItem>
                    )}
                    <FormField
                      control={form.control}
                      name="invoice.address"
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
                      name="invoice.city"
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
                      name="invoice.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="country-select">{t("country")}</FormLabel>
                          <Select onValueChange={field.onChange} autoComplete="country" defaultValue={field.value ?? "cz"}>
                            <FormControl>
                              <SelectTrigger className="w-full appearance-none rounded-md bg-white py-2 pr-3 text-base text-gray-900 outline-solid outline-1 -outline-offset-1 outline-gray-300 focus:outline-solid focus:outline-2 focus:-outline-offset-2 focus:outline-main-600 focus:ring-0 focus:ring-offset-0 sm:text-sm/6">
                                <SelectValue placeholder={t("country-placeholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cz">{c("cz")}</SelectItem>
                              <SelectItem value="sk">{c("sk")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="invoice.region"
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
                      name="invoice.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="postal-code">{t("postal-code")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("postal-code-placeholder")}
                              id="postal-code"
                              autoComplete="postal-code"
                              {...field}
                              onChange={(e) => field.onChange(formatPostalCode(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isCompany && <p className="text-sm text-gray-500 sm:col-span-2">{t("verify-data")}</p>}
                  </>
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <fieldset>
                <legend className="text-lg font-medium text-gray-900">{t("delivery-method")}</legend>
                <p className="mt-2 text-sm text-gray-600">{t("delivery-method-summary")}</p>
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <RadioGroup
                        value={field.value}
                        onChange={field.onChange}
                        className="mt-4 grid grid-cols-1 gap-y-3 sm:gap-x-4"
                        aria-labelledby="delivery-method-label"
                      >
                        {deliveryMethods.map((deliveryMethod) => (
                          <Radio
                            key={deliveryMethod.slug}
                            value={deliveryMethod.slug}
                            aria-label={deliveryMethod.title}
                            aria-description={`${deliveryMethod.turnaround} for price ${deliveryMethod.pricing?.[0]?.value} ${deliveryMethod.pricing?.[0]?.currency}`}
                            className="group relative flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-4 shadow-xs data-checked:border-transparent data-focus:ring-2 data-focus:ring-main-500"
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-checked:border-main-500"
                            />
                            <DeliveryMethod geowidgetToken={geowidgetToken} deliveryMethod={deliveryMethod} />
                          </Radio>
                        ))}
                        {deliveryMethods.length === 0 && (
                          <p className="mb-4 text-sm text-red-600">{t("no-shipping")}</p>
                        )}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <fieldset>
                <legend className="text-lg font-medium text-gray-900">{t("payment-method")}</legend>
                <p className="mt-2 text-sm text-gray-600">{t("payment-method-summary")}</p>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <RadioGroup
                        value={field.value}
                        onChange={(value) => {
                          const recommendedMethod = paymentMethods.find((m) => m.recommended && !m.disabled)?.id;
                          field.onChange(recommendedMethod ?? value);
                        }}
                        className="mt-4 grid grid-cols-1 gap-y-3 sm:gap-x-4"
                        aria-labelledby="payment-method-label"
                      >
                        {paymentMethods.map((method) => (
                          <Radio
                            key={method.id}
                            value={method.id}
                            aria-label={method.title}
                            disabled={method.disabled}
                            className={`group relative flex items-center rounded-lg border border-gray-300 bg-white p-4 shadow-xs data-checked:border-transparent data-focus:ring-2 data-focus:ring-main-500${method.disabled ? (" cursor-not-allowed select-none opacity-50") : " cursor-pointer" }`}
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-checked:border-main-500"
                            />
                            <div className="flex flex-1 flex-col">
                              <span className="flex flex-1 items-center gap-3">
                                {method.icon && (
                                  <Image
                                    src={method.icon}
                                    width={300}
                                    height={125}
                                    alt={`${method.title} logo`}
                                    className={`max-h-12 w-fit max-w-[62px] ${method.icon === "" ? "hidden" : ""}`}
                                  />
                                )}
                                <div className="flex-1">
                                  <span className="block text-sm font-medium text-gray-900">
                                    {method.title}
                                    {method.recommended && (
                                      <span className="ml-2 rounded-full bg-green-600 px-2 py-0.5 text-xs text-gray-200">
                                        {t("recommended")}
                                      </span>
                                    )}
                                  </span>
                                  <span className="block text-sm text-gray-500">{method.description}</span>
                                  {method.disabled && (
                                    <span className="block text-xs text-red-600">{t("payment-method-disabled")}</span>
                                  )}
                                </div>
                              </span>
                            </div>
                          </Radio>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </div>
          </div>
          <OrderSummary
            products={checkoutProducts ?? []}
            totalPrice={totalPrice ?? []}
            shippingCost={deliveryMethods.find((method) => method.slug === selectedDelivery)?.pricing}
            errorMessage={errorMessage}
          />
          {errorMessage && (
            <div className="col-span-2 mt-4 p-4 bg-red-100 text-red-800 rounded-md">
              {errorMessage}
              <Button type="button" onClick={() => setErrorMessage(undefined)} className="ml-4 text-main-600">
                {t("try-again")}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
