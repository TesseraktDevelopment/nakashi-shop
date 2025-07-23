"use client";

import { Button, Radio, RadioGroup } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import debounce from "lodash.debounce";
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

export type FilledCourier = {
  slug: string;
  title: string;
  turnaround: string;
  icon?: Media;
  pricing:
    | {
        value: number;
        currency: Currency;
        id?: string | null;
      }[]
    | undefined;
};

export const CheckoutForm = ({ user, geowidgetToken }: { user?: Customer; geowidgetToken?: string }) => {
  const { CheckoutFormSchemaResolver } = useCheckoutFormSchema();
  const t = useTranslations("CheckoutForm.form");
  const c = useTranslations("CheckoutForm.countries");
  const e = useTranslations("CheckoutForm.errors");

  const shippingAddresses = user?.shippings && user?.shippings?.length > 0 ? user?.shippings : null;

  const defaultShippingAddress = shippingAddresses
    ? (shippingAddresses.find((address) => address.default) ?? shippingAddresses[0])
    : null;

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
        pickupPointAddress: "",
      },
      deliveryMethod: "",
    },
  });
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [addShippingDialogOpen, setAddShippingDialogOpen] = useState(false);
  const [isLoadingAresOrsr, setIsLoadingAresOrsr] = useState(false);
  const [aresOrsrError, setAresOrsrError] = useState<string | null>(null);

  const wantsInvoice = useWatch({ control: form.control, name: "individualInvoice" });
  const isCompany = useWatch({ control: form.control, name: "buyerType" }) === "company";
  const selectedDelivery = useWatch({ control: form.control, name: "deliveryMethod" });
  const shipping = useWatch({ control: form.control, name: "shipping" });
  const invoiceCountry = useWatch({ control: form.control, name: "invoice.country" });

  const [checkoutProducts, setCheckoutProducts] = useState<ProductWithFilledVariants[]>();
  const [totalPrice, setTotalPrice] = useState<
    {
      currency: Currency;
      value: number;
    }[]
  >();
  const [deliveryMethods, setDeliveryMethods] = useState<FilledCourier[]>([]);

  const { cart, setCart } = useCart();
  const locale = useLocale() as Locale;
  const currency = useCurrency();
  /**
   * Fetches products from the cart, calculates the total price and available couriers with their prices. Basically, it's getting all checkout needed data.
   * @param cartToCalculate - Actual cart to calculate the total price and available couriers.
   * @param countryToCalculate - Country to get available couriers.
   */
  const fetchCartProducts = useCallback(
    async (cartToCalculate: Cart | null, countryToCalculate: string) => {
      try {
        const { data } = await axios.post<{
          status: number;
          productsWithTotalAndCouriers: {
            filledProducts: ProductWithFilledVariants[];
            total: {
              currency: Currency;
              value: number;
            }[];
            totalQuantity: number;
            couriers: FilledCourier[];
          };
        }>("/next/checkout", { cart: cartToCalculate, selectedCountry: countryToCalculate, locale });
        const { filledProducts, total, couriers } = data.productsWithTotalAndCouriers;
        setCheckoutProducts(filledProducts);
        setDeliveryMethods(couriers);
        setTotalPrice(total);
      } catch (error) {
        console.error(error);
      }
    },
    [locale, setCheckoutProducts, setDeliveryMethods, setTotalPrice],
  );

  const debouncedFetchCartProducts = useMemo(() => debounce(fetchCartProducts, 300), [fetchCartProducts]);

  useEffect(() => {
    void debouncedFetchCartProducts(cart, shipping.country);
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
          const response = await axios.get(`/next/services/ares?ico=${ico}`, {
            headers: { accept: "application/json" },
          });
          console.log("ARES response:", response.data);
          const data = response.data;
          if (data && data.obchodniJmeno) {
            form.setValue("invoice.name", data.obchodniJmeno || "");
            form.setValue(
              "invoice.address",
              `${data.sidlo.nazevUlice || ""} ${data.sidlo.cisloDomovni || ""}`.trim() || data.sidlo.textovaAdresa || "",
            );
            form.setValue("invoice.city", data.sidlo.nazevObce || "");
            form.setValue("invoice.country", "cz");
            form.setValue("invoice.postalCode", data.sidlo.psc ? String(data.sidlo.psc) : "");
            form.setValue("invoice.region", data.sidlo.nazevKraje || "");
            form.setValue("invoice.tin", data.ico || ico);
            form.clearErrors("invoice");
          } else {
            setAresOrsrError(e("invoice.tinNotFound"));
          }
        } else if (country === "sk") {
            setAresOrsrError(e("invoice.tinNotFound"));
        }
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          setAresOrsrError(e("invoice.tooManyRequests"));
        } else if (axios.isAxiosError(error) && error.response?.status === 400) {
          setAresOrsrError(e("invoice.tinInvalid"));
        } else {
          setAresOrsrError(e("invoice.tinNotFound"));
        }
        console.error(error);
      } finally {
        setIsLoadingAresOrsr(false);
      }
    },
    [form, e],
  );

  const router = useRouter();

  const onSubmit = async (values: CheckoutFormData) => {
    try {
      const { data } = await axios.post<{ status: number; url?: string }>("/next/payment", {
        cart,
        selectedCountry: shipping.country,
        checkoutData: values,
        locale,
        currency: currency.currency,
      });
      if (data.status === 200 && data.url) {
        setCart(null);
        router.push(data.url);
      } else {
        form.setError("root", { message: t("internal-server-error") });
      }
    } catch (error) {
      form.setError("root", { message: t("internal-server-error") });
      console.error(error);
    }
  };

  return (
    <>
      {user && (
        <AddNewAddressDialog
          open={addShippingDialogOpen}
          setOpen={setAddShippingDialogOpen}
          user={user}
          setShipping={(shipping) => {
            form.setValue("shipping", shipping);
          }}
        />
      )}
      {user && shippingAddresses && (
        <ChangeAddressDialog
          open={shippingDialogOpen}
          setOpen={setShippingDialogOpen}
          setAddShippingDialogOpen={setAddShippingDialogOpen}
          shippingAddresses={shippingAddresses}
          selectedID={shipping.id}
          setShipping={(shipping) => {
            form.setValue("shipping", shipping);
          }}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
        >
          <div>
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-lg font-medium text-gray-900">{t("buy-as")}</h2>
              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Tabs defaultValue="individual" onValueChange={field.onChange} className="my-4">
                        <TabsList className="w-full">
                          <TabsTrigger className="w-1/2" value="individual">
                            {t("individual")}
                          </TabsTrigger>
                          <TabsTrigger className="w-1/2" value="company">
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
                  <div className="group relative flex cursor-pointer rounded-lg border border-gray-300 border-transparent bg-white p-4 shadow-xs ring-2 ring-main-500 focus:outline-hidden">
                    <span className="flex flex-1">
                      <span className="flex w-full flex-col">
                        <span className="block text-sm font-medium text-gray-900">{shipping.name}</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">
                          {shipping.address}
                        </span>
                        <span className="mt-1 text-sm font-medium text-gray-500">
                          {shipping.postalCode}, {shipping.city}, {c(shipping.country as Country)}
                        </span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">{shipping.phone}</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">{shipping.email}</span>
                        <Button
                          type="button"
                          onClick={() => setShippingDialogOpen(true)}
                          className="ml-auto mt-1 text-sm text-main-600"
                        >
                          {t("change")}
                        </Button>
                      </span>
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
                      <FormItem className="rounded-md p-4 flex flex-row items-start space-x-3 space-y-0 sm:col-span-2">
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
                                  <Input placeholder={t("tin-placeholder")} autoComplete="off" maxLength={11} {...field} pattern="[0-10]*" type="text" inputMode="numeric" onChange={(e) => { const value = e.target.value.replace(/[^0-9]/g, ""); if (value.length <= 10) { field.onChange(value); }}} />
                                </FormControl>
                                <Button
                                  type="button"
                                  disabled={isLoadingAresOrsr || !field.value || field.value.trim().length < 8 || field.value.trim().length > 10}
                                  onClick={() => fetchAresOrsrData((field.value ?? "").trim(), invoiceCountry as "cz" | "sk")}
                                  className="h-10 w-[45%] text-sm font-medium text-main-600 disabled:bg-slate-300 disabled:text-slate-800 disabled:cursor-not-allowed rounded-md border border-transparent bg-white outline outline-gray-300"
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
                          <FormControl>
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
                          </FormControl>
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
                            <Input placeholder={t("postal-code-placeholder")} id="postal-code" autoComplete="postal-code" {...field} onChange={(e) => { const formattedValue = formatPostalCode(e.target.value); field.onChange(formattedValue); }} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(isCompany) && (
                      <p className="text-sm text-gray-500 sm:col-span-2">{t("verify-data")}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <fieldset>
                <legend className="text-lg font-medium text-gray-900">{t("delivery-method")}</legend>
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-4 grid grid-cols-1 gap-y-3 sm:gap-x-4"
                    >
                      {deliveryMethods.map((deliveryMethod) => (
                        <Radio
                          key={deliveryMethod.slug}
                          value={deliveryMethod.slug}
                          aria-label={deliveryMethod.title}
                          aria-description={`${deliveryMethod.turnaround} for price`}
                          className="group relative flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-4 shadow-xs focus:outline-hidden data-checked:border-transparent data-focus:ring-2 data-focus:ring-main-500"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-focus:border group-data-checked:border-main-500"
                          />
                          <DeliveryMethod geowidgetToken={geowidgetToken} deliveryMethod={deliveryMethod} />
                        </Radio>
                      ))}
                      {deliveryMethods.length === 0 && <p>{t("no-shipping")}</p>}
                      <FormMessage />
                    </RadioGroup>
                  )}
                />
              </fieldset>
            </div>
          </div>
          <OrderSummary
            products={checkoutProducts}
            totalPrice={totalPrice}
            shippingCost={deliveryMethods.find((method) => method.slug === selectedDelivery)?.pricing}
            errorMessage={form.formState.errors.root?.message}
          />
        </form>
      </Form>
    </>
  );
};
