"use client";

import axios from "axios";
import debounce from "lodash.debounce";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { type ProductWithFilledVariants } from "@/globals/(ecommerce)/Layout/Cart/variants/SlideOver";
import { type Locale } from "@/i18n/config";
import { type Customer } from "@/payload-types";
import {
	type CheckoutFormData,
	useMultiCheckoutFormSchema,
} from "@/schemas/multiCheckoutForm.schema";
import { useCart } from "@/stores/CartStore";
import { type Cart } from "@/stores/CartStore/types";
import { useCurrency } from "@/stores/Currency";
import { type Currency } from "@/stores/Currency/types";

import { OrderSummary } from "./OrderSummary";
import { StepIndicator } from "./StepIndicator";
import { CartStep } from "./steps/CartStep";
import { DeliveryStep } from "./steps/DeliveryStep";
import { ShippingStep } from "./steps/ShippingStep";
import { SummaryStep } from "./steps/SummaryStep";

import { AddNewAddressDialog } from "../../OneStepWithSummary/components/AddNewAddressDialog";
import { ChangeAddressDialog } from "../../OneStepWithSummary/components/ChangeAddressDialog";
import {
	type PaymentMethod,
	type FilledCourier,
} from "../../OneStepWithSummary/components/CheckoutForm";

export type CheckoutStep = "cart" | "delivery" | "shipping" | "summary";

const steps: { key: CheckoutStep; titleKey: string; number: number }[] = [
	{ key: "cart", titleKey: "cart.titleKey", number: 1 },
	{ key: "delivery", titleKey: "delivery.titleKey", number: 2 },
	{ key: "shipping", titleKey: "shipping.titleKey", number: 3 },
	{ key: "summary", titleKey: "summary.titleKey", number: 4 },
];

export const MultiStepCheckoutForm = ({
	user,
	geowidgetToken,
}: {
	user?: Customer;
	geowidgetToken?: string;
}) => {
	const {
		CheckoutFormSchemaResolver,
		CartSchema,
		DeliverySchema,
		ShippingSchema,
		CheckoutFormSchema,
		SummarySchema,
	} = useMultiCheckoutFormSchema();
	const t = useTranslations("CheckoutForm.form");
	const e = useTranslations("CheckoutForm.errors");
	const { cart, setCart } = useCart();
	const locale = useLocale() as Locale;
	const currency = useCurrency();
	const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
	const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);

	const shippingAddresses = user?.shippings?.length ? user.shippings : null;
	const defaultShippingAddress = useMemo(
		() =>
			shippingAddresses?.find((address) => address.default) ??
			shippingAddresses?.[0] ??
			null,
		[shippingAddresses],
	);

	const [checkoutProducts, setCheckoutProducts] = useState<
		ProductWithFilledVariants[] | null
	>(null);
	const [totalPrice, setTotalPrice] = useState<
		{ currency: Currency; value: number }[] | null
	>(null);
	const [deliveryMethods, setDeliveryMethods] = useState<FilledCourier[]>([]);
	const paymentMethods = useMemo<PaymentMethod[]>(
		() => [
			{
				id: "stripe",
				title: "Stripe",
				description: "Bezpečná a rychlá platební brána",
				icon: "https://cdn.nakashi.cz/nakashi/stripe.svg",
				recommended: true,
			},
			{
				id: "bank_transfer",
				title: "Bankovní převod",
				description: "Platba předem na účet",
				icon: "",
				disabled: true,
			},
			{
				id: "cash_on_delivery",
				title: "Dobírka",
				description: "Platba při doručení",
				icon: "",
				disabled: true,
			},
		],
		[],
	);

	const form = useForm<CheckoutFormData>({
		resolver: CheckoutFormSchemaResolver,
		mode: "onChange",
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
				pickupPointBranchCode: "",
			},
			deliveryMethod: "",
			paymentMethod: "stripe",
			checkoutProducts: [],
			totalPrice: [],
			deliveryMethods: [],
			paymentMethods,
			termsCheck: false,
			newsletterCheck: true,
		},
	});

	const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
	const [addShippingDialogOpen, setAddShippingDialogOpen] = useState(false);

	const wantsInvoice = useWatch({
		control: form.control,
		name: "individualInvoice",
	});
	const isCompany =
		useWatch({ control: form.control, name: "buyerType" }) === "company";
	const selectedDelivery = useWatch({
		control: form.control,
		name: "deliveryMethod",
	});
	const shipping = useWatch({ control: form.control, name: "shipping" });
	const invoiceCountry = useWatch({
		control: form.control,
		name: "invoice.country",
	});

	const fetchCartProducts = useCallback(
		async (cartToCalculate: Cart | null, countryToCalculate: string) => {
			try {
				const { data } = await axios.post<{
					status: number;
					productsWithTotalAndCouriers?: {
						filledProducts: ProductWithFilledVariants[];
						total: { currency: Currency; value: number }[];
						totalQuantity: number;
						couriers: FilledCourier[];
					};
					error?: string;
				}>("/next/checkout", {
					cart: cartToCalculate,
					selectedCountry: countryToCalculate,
					locale,
				});

				if (data.status !== 200 || !data.productsWithTotalAndCouriers) {
					console.log("API response error:", data);
					console.error(t("fetch-cart-error"));
					return;
				}

				const { filledProducts, total, couriers } =
					data.productsWithTotalAndCouriers;
				setCheckoutProducts(filledProducts);
				setDeliveryMethods(couriers);
				setTotalPrice(total);
				form.setValue("checkoutProducts", filledProducts);
				form.setValue("totalPrice", total);
				form.setValue("deliveryMethods", couriers);
				form.setValue("paymentMethods", paymentMethods);
			} catch (error) {
				console.error("Failed to fetch cart products:", error);
				console.error(t("fetch-cart-error"));
			}
		},
		[locale, t, form, paymentMethods],
	);

	const debouncedFetchCartProducts = useMemo(
		() => debounce(fetchCartProducts, 300, { leading: false, trailing: true }),
		[fetchCartProducts],
	);

	useEffect(() => {
		void debouncedFetchCartProducts(cart, shipping.country);
		return () => debouncedFetchCartProducts.cancel();
	}, [cart, debouncedFetchCartProducts, shipping.country]);

	const goToStep = (step: CheckoutStep) => {
		setCurrentStep(step);
	};

	const goToNextStep = async () => {
		// const isValid = await validateCurrentStep();
    const isValid = true
		if (isValid) {
			const currentIndex = steps.findIndex((s) => s.key === currentStep);
			if (currentIndex < steps.length - 1) {
				const nextStep = steps[currentIndex + 1].key;
				setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
				setCurrentStep(nextStep);
			}
		} else {
			console.error(t("validation-error"));
		}
	};
//  "pattern": "/^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/", com email?
	const goToPreviousStep = () => {
		const currentIndex = steps.findIndex((s) => s.key === currentStep);
		if (currentIndex > 0) {
			const previousStep = steps[currentIndex - 1].key;
			setCurrentStep(previousStep);
		}
	};

	const validateCurrentStep = async (): Promise<boolean> => {
		try {
			switch (currentStep) {
				case "cart": {
					const cartData = {
						checkoutProducts: form.getValues("checkoutProducts"),
						totalPrice: form.getValues("totalPrice"),
					};
					await CartSchema.parseAsync(cartData);
					return (
						!!cart &&
						cart.length > 0 &&
						!!cartData.checkoutProducts &&
						cartData.checkoutProducts.length > 0
					);
				}
				case "delivery": {
					const deliveryData = {
						deliveryMethod: form.getValues("deliveryMethod"),
						paymentMethod: form.getValues("paymentMethod"),
					};
					await DeliverySchema.parseAsync(deliveryData);
					return !!deliveryData.deliveryMethod && !!deliveryData.paymentMethod;
				}
				case "shipping": {
					const shippingData = {
						buyerType: form.getValues("buyerType"),
						individualInvoice: form.getValues("individualInvoice"),
						shipping: form.getValues("shipping"),
						invoice: form.getValues("invoice"),
					};
					await ShippingSchema.parseAsync(shippingData);
					return true;
				}
				case "summary": {
					const summaryData = {
						termsCheck: form.getValues("termsCheck"),
						newsletterCheck: form.getValues("newsletterCheck"),
					};
					await SummarySchema.parseAsync(summaryData);
					await CheckoutFormSchema.parseAsync(form.getValues());
					return true;
				}
				default:
					return false;
			}
		} catch (error) {
			console.error("Validation error:", error);
			return false;
		}
	};

	const renderStepContent = () => {
		const commonProps = {
			form,
			user,
			geowidgetToken,
			onNext: goToNextStep,
			onPrevious: goToPreviousStep,
			validateStep: validateCurrentStep,
			deliveryMethods,
			paymentMethods,
			products: checkoutProducts,
			totalPrice,
			selectedDelivery,
			completedSteps,
		};

		switch (currentStep) {
			case "cart":
				return <CartStep {...commonProps} />;
			case "delivery":
				return <DeliveryStep {...commonProps} />;
			case "shipping":
				return <ShippingStep {...commonProps} />;
			case "summary":
				return <SummaryStep {...commonProps} />;
			default:
				return null;
		}
	};

	return (
		<>
			{shippingAddresses && shippingAddresses.length > 1 && (
				<ChangeAddressDialog
					open={shippingDialogOpen}
					setOpen={setShippingDialogOpen}
					setAddShippingDialogOpen={setAddShippingDialogOpen}
					shippingAddresses={shippingAddresses}
					selectedID={shipping?.id}
					setShipping={(shipping) => form.setValue("shipping", shipping)}
				/>
			)}
			{user && (
				<AddNewAddressDialog
					open={addShippingDialogOpen}
					setOpen={setAddShippingDialogOpen}
					user={user}
					setShipping={(shipping) => form.setValue("shipping", shipping)}
				/>
			)}
			<div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
				<div>
					<StepIndicator
						steps={steps}
						currentStep={currentStep}
						completedSteps={completedSteps}
						onStepClick={goToStep}
					/>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(() => {})}>
							{renderStepContent()}
						</form>
					</Form>
				</div>

				<div className="mt-10 lg:sticky lg:top-28 lg:mt-0 lg:h-fit">
					{currentStep !== "cart" && (
						<OrderSummary
							products={checkoutProducts ?? []}
							totalPrice={totalPrice ?? []}
							shippingCost={
								deliveryMethods.find(
									(method) => method.slug === selectedDelivery,
								)?.pricing
							}
							errorMessage={undefined}
							readOnly
						/>
					)}
					<div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-xs p-6">
						<p className="text-base font-medium text-gray-900">
							Nevíš si s něčím rady?
						</p>
						<p className="mt-1 text-sm text-gray-600">
							Rádi ti poradíme. Po–Pá 8:00–18:00.
						</p>
						<p className="mt-5 text-sm text-gray-600">Online chat</p>
						<p className="mt-1 text-sm text-gray-600">
							podpora@nakashi-army.cz
						</p>
					</div>
				</div>
			</div>
		</>
	);
};
