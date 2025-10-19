import { type Product } from "@/payload-types";

export type WishListProduct = {
	id: Product["id"];
	choosenVariantSlug?: string;
};

export type WishList = WishListProduct[];
