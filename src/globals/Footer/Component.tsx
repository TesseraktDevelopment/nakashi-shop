import Link from "next/link";
import { getLocale } from "next-intl/server";

import { CMSLink } from "@/components/Link";
import { Logo } from "@/components/Logo/Logo";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { type Locale } from "@/i18n/config";
import { getCachedGlobal } from "@/utilities/getGlobals";

import type { Footer, ShopSetting } from "@/payload-types";

export async function Footer() {
	const locale = (await getLocale()) as Locale;
	const data: Footer = await getCachedGlobal("footer", locale, 1)();
	// const shopSettings: ShopSetting = await getCachedGlobal(
	// 	"shopSettings",
	// 	locale,
	// 	1,
	// )();
	const navItems = data?.navItems ?? [];

	return (
		<footer
			className="mt-auto border-t border-white/10 text-white"
			style={{
				background: data.background || "#212625",
			}}
		>
			<div className="container py-12 md:py-16">
				<div className="flex flex-col items-center gap-12 md:flex-row md:justify-between">
					<Link className="shrink-0 transition-opacity hover:opacity-80" href="/">
						{data.logo &&
						typeof data.logo !== "string" &&
						data.logo.url &&
						data.logo.alt ? (
							<Media
								resource={data.logo}
								className="h-12 w-auto lg:h-16"
								imgClassName="h-full w-auto object-contain"
							/>
						) : (
							<div className="text-2xl font-bold text-white lg:text-3xl">
								<Logo />
							</div>
						)}
					</Link>

					<nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
						{navItems.map(({ link }, i) => {
							return (
								<CMSLink
									key={i}
									{...link}
									appearance="link"
									className="text-sm font-medium uppercase tracking-wider text-white/70 transition-colors hover:text-white"
								/>
							);
						})}
					</nav>
				</div>

				{data.attribution && (
					<div className="mt-12 border-t border-white/10 pt-8">
						<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
							<div className="text-xs tracking-wide text-white/50 [&_a]:transition-colors [&_a]:hover:text-white">
								<RichText data={data.attribution} />
							</div>
							
							<div className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-white/30">
								<span>© {new Date().getFullYear()} Nakashi Army</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</footer>
	);
}
