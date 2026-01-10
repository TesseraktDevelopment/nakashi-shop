"use client";
import {
	HeartIcon,
	MagnifyingGlassIcon,
	ShoppingBagIcon,
	UserIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { CMSLink } from "@/components/Link";
import { Logo } from "@/components/Logo/Logo";
import { Media } from "@/components/Media";
import { Link } from "@/i18n/routing";
import { type Header } from "@/payload-types";
import { useCartState } from "@/stores/CartStateStore";
import { useCart } from "@/stores/CartStore";
import { useWishListState } from "@/stores/WishListStateStore";
import { useWishList } from "@/stores/WishlistStore";
import { cn } from "@/utilities/cn";
import { LocaleSwitch } from "@/components/LocaleSwitch/LocaleSwitch";

import { Search } from "../components/Search";

export const DefaultHeader = ({
	data,
	disableCart,
}: {
	data: Header;
	disableCart?: boolean;
}) => {
	const [isMenuOpened, setisMenuOpened] = useState(false);
	const [isSearchOpened, setIsSearchOpened] = useState(false);
	const [scrollValue, setScrollValue] = useState(0);
	const [scrollDown, setScrollDown] = useState(false);

	const toggleMenu = () => {
		setisMenuOpened((menuState) => !menuState);
		document.documentElement.classList.toggle("overflow-clip");
		document.documentElement.classList.toggle("overflow-y-clip");
	};

	const { toggleCart } = useCartState();
	const { cart } = useCart();
	const [totalQuantity, setTotalQuantity] = useState<number>(0);

	const { toggleWishList } = useWishListState();
	const { wishlist } = useWishList();

	useEffect(() => {
		let lastScrollValue = 0;

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			if (data.hideOnScroll) {
				if (scrollTop > lastScrollValue && scrollTop > 300) {
					setScrollDown(true);
				} else if (scrollTop < lastScrollValue) {
					setScrollDown(false);
				}
				lastScrollValue = scrollTop;
			}

			setScrollValue(scrollTop);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [data.hideOnScroll]);

	useEffect(() => {
		if (cart) {
			const totalQuantity = cart.reduce(
				(acc, product) => acc + product.quantity,
				0,
			);
			setTotalQuantity(totalQuantity);
		}
	}, [cart]);

	const classes = cn(
		`sticky flex flex-col w-full top-0 justify-center transition-all z-50`,
		data.hideOnScroll && scrollDown ? "-translate-y-full" : "translate-y-0",
		scrollValue > 0 ? "shadow-sm bg-opacity-90 backdrop-blur-md" : "",
	);

	return (
		<header
			className={classes}
			style={{
				background: data.background || "linear-gradient(180deg, #93C5FD 0%, #DBEAFE 100%)",
			}}
		>
			{/* Horní lišta s výhodami by přišla sem - zatím ponecháno na CMS obsah */}
			
			<div className="container relative flex w-full items-center py-4 lg:py-6 min-h-[80px]">
				{isSearchOpened ? (
					<div className="flex w-full items-center justify-center animate-in fade-in zoom-in duration-300">
						<div className="flex w-full max-w-3xl items-center gap-4 px-4 lg:px-0">
							<div className="flex-1">
								<Search />
							</div>
							<button
								onClick={() => setIsSearchOpened(false)}
								className="text-white hover:rotate-90 transition-transform duration-200"
								aria-label="Zavřít hledání"
							>
								<XMarkIcon width={28} height={28} />
							</button>
						</div>
					</div>
				) : (
					<>
						{/* Levá část: Ikona hledání (1/3) */}
						<div className="hidden lg:flex w-1/3 justify-start">
							<button
								onClick={() => setIsSearchOpened(true)}
								className="text-white hover:opacity-70 transition-opacity"
								aria-label="Otevřít hledání"
							>
								<MagnifyingGlassIcon width={24} height={24} />
							</button>
						</div>

						{/* Střed: Logo (1/3) */}
						<div className="flex w-1/3 shrink-0 items-center justify-center z-10">
							<Link href="/">
								{data.logo &&
								typeof data.logo !== "string" &&
								data.logo.url &&
								data.logo.alt ? (
									<Media
										resource={data.logo}
										className={cn(
											isMenuOpened && "invert lg:invert-0",
											"h-12 w-auto lg:h-16",
										)}
										imgClassName="h-full w-auto object-contain"
									/>
								) : (
									<div className="text-2xl font-bold text-white lg:text-3xl">
										<Logo />
									</div>
								)}
							</Link>
						</div>

						{/* Pravá část: Ikony a Mobile Toggle (1/3) */}
						<div className="flex w-1/3 items-center justify-end gap-3 lg:gap-5">

					<Link
						href="/account/orders"
						aria-label="Účet"
						className="-m-2 cursor-pointer p-2 text-white"
					>
						<UserIcon width={24} height={24} />
					</Link>
					
					{!disableCart && (
						<>
							<button
								onClick={toggleWishList}
								aria-label="Seznam přání"
								className="relative -m-2 cursor-pointer p-2 text-white"
							>
								{wishlist && wishlist.length > 0 && (
									<span className="absolute right-0 top-0 flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-main-600 text-[10px] text-white">
										{wishlist.length}
									</span>
								)}
								<HeartIcon width={24} height={24} />
							</button>
							<button
								onClick={toggleCart}
								aria-label="Košík"
								className="relative -m-2 cursor-pointer p-2 text-white"
							>
								{totalQuantity > 0 && (
									<span className="absolute right-0 top-0 flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-main-600 text-[10px] text-white">
										{totalQuantity}
									</span>
								)}
								<ShoppingBagIcon width={24} height={24} />
							</button>
						</>
					)}

					<button
						aria-label="Toggle Menu"
						className="z-20 flex flex-col items-end justify-center gap-[6px] lg:hidden"
						onClick={toggleMenu}
					>
						<div className={`h-[2px] w-6 bg-white transition-all ${isMenuOpened && "translate-y-2 rotate-45"}`} />
						<div className={`h-[2px] w-4 bg-white transition-all ${isMenuOpened && "opacity-0"}`} />
						<div className={`h-[2px] w-6 bg-white transition-all ${isMenuOpened && "-translate-y-2 -rotate-45"}`} />
					</button>
				</div>
					</>
				)}
			</div>

			{/* Spodní řada: Desktop Navigace */}
			{!isSearchOpened && (
				<div className="container hidden lg:block">
					<nav className="flex items-center justify-center border-t border-white/10 py-4">
						<div className="flex items-center gap-8">
							{data.navItems?.map(({ link }, i) => (
								<CMSLink
									key={i}
									{...link}
									appearance="link"
									className="text-xs font-medium uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
								/>
							))}
						</div>
					</nav>
				</div>
			)}

			{/* Mobile Navigace */}
			<nav
				className={cn(
					"fixed inset-0 z-[100] flex flex-col bg-white p-8 pt-24 transition-transform duration-300 lg:hidden",
					isMenuOpened ? "translate-x-0" : "translate-x-full",
				)}
			>
				<button
					onClick={toggleMenu}
					className="absolute right-8 top-8 text-black"
					aria-label="Zavřít menu"
				>
					<XMarkIcon width={32} height={32} />
				</button>

				<div className="mb-8 block lg:hidden">
					<Search />
				</div>
				<div className="flex flex-col gap-6">
					{data.navItems?.map(({ link }, i) => (
						<CMSLink
							key={i}
							{...link}
							appearance="link"
							className="text-xl font-semibold text-black"
						/>
					))}
				</div>
			</nav>
		</header>
	);
};