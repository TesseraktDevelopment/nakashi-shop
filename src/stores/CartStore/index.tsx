import axios from "axios";
import debounce from "lodash.debounce";
import { create } from "zustand";

import canUseDOM from "@/utilities/canUseDOM";

import { type Cart, type CheckoutState } from "./types";

type CartState = {
	cart: Cart | null;
	checkoutState: CheckoutState | null;
	setCart: (cartToSet: Cart | null) => void;
	updateCart: (cartToSet: Cart) => void;
	removeFromCart: (productId: string, variantSlug?: string) => void;
	setCheckoutState: (state: CheckoutState) => void;
	synchronizeCart: () => Promise<void>;
};

const saveCartToUserAccount = async (
	cart: Cart | null,
	checkoutState: CheckoutState | null,
) => {
	try {
		await axios.post(
			"/next/cart",
			{ cart, checkoutState },
			{ withCredentials: true },
		);
	} catch (error) {
		console.error("Failed to save cart to UserAccount:", error);
	}
};

const fetchCartFromUserAccount = async (): Promise<{
	cart: Cart | null;
	checkoutState: CheckoutState | null;
} | null> => {
	try {
		const { data } = await axios.get<{
			data: { cart: Cart; checkoutState: CheckoutState };
			status: number;
		}>("/next/cart", { withCredentials: true });
		if (data.status === 400) return null;
		return data.data;
	} catch (error) {
		console.error("Failed to fetch cart from UserAccount:", error);
		return null;
	}
};

const debouncedFetchCartFromUserAccount = debounce(
	fetchCartFromUserAccount,
	1000,
);
const debouncedSaveCartToUserAccount = debounce(saveCartToUserAccount, 1000);

const useCartStore = create<CartState>((set) => ({
	cart: canUseDOM
		? (() => {
				const cartData = window.localStorage.getItem("cart");
				if (cartData && cartData.length > 1) {
					try {
						return JSON.parse(cartData) as Cart;
					} catch (error) {
						console.error("Error parsing cart data from localStorage", error);
						return [];
					}
				}
				return [];
			})()
		: null,
	checkoutState: canUseDOM
		? (() => {
				const checkoutData = window.localStorage.getItem("checkoutState");
				if (checkoutData && checkoutData.length > 1) {
					try {
						return JSON.parse(checkoutData) as CheckoutState;
					} catch (error) {
						console.error(
							"Error parsing checkoutState data from localStorage",
							error,
						);
						return null;
					}
				}
				return null;
			})()
		: null,

	setCart: (cartToSet: Cart | null) => {
		if (canUseDOM) {
			window.localStorage.setItem("cart", JSON.stringify(cartToSet));
		}
		set((state) => {
			void debouncedSaveCartToUserAccount(cartToSet, state.checkoutState);
			return { cart: cartToSet };
		});
	},

	updateCart: (cartToSet: Cart) => {
		set((state) => {
			const prevCart = state.cart ?? [];

			const updatedCart = [...prevCart];
			cartToSet.forEach((newProduct) => {
				const existingProductIndex = updatedCart.findIndex(
					(product) =>
						product.id === newProduct.id &&
						(product.choosenVariantSlug === newProduct.choosenVariantSlug ||
							(!product.choosenVariantSlug && !newProduct.choosenVariantSlug)),
				);

				if (existingProductIndex >= 0) {
					updatedCart[existingProductIndex].quantity += newProduct.quantity;
				} else {
					updatedCart.push(newProduct);
				}
			});

			if (canUseDOM) {
				window.localStorage.setItem("cart", JSON.stringify(updatedCart));
			}
			void debouncedSaveCartToUserAccount(updatedCart, state.checkoutState);
			return { cart: updatedCart };
		});
	},

	removeFromCart: (productId: string, variantSlug?: string) => {
		set((state) => {
			const updatedCart = (state.cart ?? []).filter((product) => {
				if (variantSlug) {
					return (
						product.id !== productId ||
						product.choosenVariantSlug !== variantSlug
					);
				}
				return product.id !== productId;
			});

			if (canUseDOM) {
				window.localStorage.setItem("cart", JSON.stringify(updatedCart));
			}
			void debouncedSaveCartToUserAccount(updatedCart, state.checkoutState);
			return { cart: updatedCart };
		});
	},

	setCheckoutState: (state: CheckoutState) => {
		if (canUseDOM) {
			window.localStorage.setItem("checkoutState", JSON.stringify(state));
		}
		set((prevState) => {
			void debouncedSaveCartToUserAccount(prevState.cart, state);
			return { checkoutState: state };
		});
	},

	synchronizeCart: async () => {
		if (!canUseDOM) return;

		const cartFromLocalStorage = JSON.parse(
			window.localStorage.getItem("cart") ?? "[]",
		) as Cart;
		const checkoutStateFromLocalStorage = JSON.parse(
			window.localStorage.getItem("checkoutState") ?? "null",
		) as CheckoutState | null;
		const cartFromUserAccount = await debouncedFetchCartFromUserAccount();

		if (!cartFromUserAccount) {
			if (cartFromLocalStorage.length > 0 || checkoutStateFromLocalStorage) {
				void debouncedSaveCartToUserAccount(
					cartFromLocalStorage,
					checkoutStateFromLocalStorage,
				);
			}
			set({
				cart: cartFromLocalStorage,
				checkoutState: checkoutStateFromLocalStorage,
			});
			return;
		}

		window.localStorage.setItem(
			"cart",
			JSON.stringify(cartFromUserAccount.cart),
		);
		window.localStorage.setItem(
			"checkoutState",
			JSON.stringify(cartFromUserAccount.checkoutState),
		);
		set({
			cart: cartFromUserAccount.cart,
			checkoutState: cartFromUserAccount.checkoutState,
		});
	},
}));

export { useCartStore };
export const useCart = () => useCartStore((state) => state);
