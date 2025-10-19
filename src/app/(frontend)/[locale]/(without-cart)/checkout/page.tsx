// import { ErrorBoundary } from "@/components/ui/error";
import { Checkout } from "@/globals/(ecommerce)/Layout/Checkout/Component";
import { type Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const CheckoutPage = async ({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) => {
	const { locale } = await params;
	return (
		// <ErrorBoundary>
		<Checkout locale={locale} />
		// </ErrorBoundary>
	);
};
export default CheckoutPage;
